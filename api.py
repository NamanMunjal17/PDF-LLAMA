from unsloth import FastLanguageModel
from flask import Flask, request, jsonify
from supabase import create_client, Client
import os
import PyPDF2
from flask_cors import CORS


url = "https://mdthnpuxanpxzwzrjuvv.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kdGhucHV4YW5weHp3enJqdXZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQ2MDg0NTEsImV4cCI6MjA0MDE4NDQ1MX0.H4EVEhfZjQycc2xxT-bzCCbXPQ3e6gE9VOM4BfUOr7E"
supabase: Client = create_client(url, key)


app = Flask(__name__)
CORS(app)
global model,tokenizer,alpaca_prompt
model=None
max_seq_length = 2048
dtype = None 
load_in_4bit = True
if not model:
    model, tokenizer = FastLanguageModel.from_pretrained(
        model_name = "squad",
        max_seq_length = max_seq_length,
        dtype = dtype,
        load_in_4bit = load_in_4bit,
    )
FastLanguageModel.for_inference(model) # Enable native 2x faster inference

alpaca_prompt = """Below is an instruction that describes a task, paired with an input that provides further context. Write a response that appropriately completes the request.

### Instruction:
{}

### Input:
{}

### Response:
{}"""


alpaca_prompt=alpaca_prompt
model=model
tokenizer=tokenizer

def figure(qu,meth):
    methods=["BELOW IS A PARAGRAPH GO THROUGH IT CAREFULLY AND MAKE QUESTIONS OUT OF IT","BELOW IS A PARAGRAPH GO THROUGH IT CAREFULLY AND ANSWER THE QUESTION ASKED AT THE END","SUMMARISE THE TEXT"]
    global model,tokenizer,alpaca_prompt
    inputs = tokenizer(
[
    alpaca_prompt.format(
        methods[int(meth)],
        f'{qu}',
        "", 
    )
], return_tensors = "pt").to("cuda")
    data = request.get_json()
    text_streamer = TextStreamer(tokenizer)
    _ = model.generate(**inputs, max_new_tokens = 128)
    out=tokenizer.batch_decode(_)
    out=out[0]
    out=out.split("### Response:")
    return out[1]


def read_pdf(file_path):
    # Open the PDF file
    with open(f'{os.getcwd()}/files/{file_path}', 'rb') as file:
        # Create a PDF reader object
        pdf_reader = PyPDF2.PdfReader(file)

        # Initialize a string to hold all text
        pdf_text = ''

        # Loop through all the pages and extract text
        for page in pdf_reader.pages:
            pdf_text += page.extract_text() + '\n'  # Add text of each page

    return pdf_text

from transformers import TextStreamer

# Route to return the same message sent in the request
@app.route('/echo', methods=['POST'])
def echo_message():
    data=request.json
    print(data["file"],data["question"])
    if data["file"].split(".")[1]=="pdf":
        text=read_pdf(data["file"])
    out=figure(text+f'\nQUESTION:{data["question"]}',1)
    out=out.replace('\n',' ')
    out=out.replace("<|end_of_text|>","")
    return jsonify({"output":out})

@app.route('/download',methods=['POST','GET'])
def download():
    data=request.json
    print(data)
    response = supabase.storage.from_("stuff").download(f'{data["file"].split(".")[1]}s/{data["file"]}')
    with open(data["file"], "wb") as f:
        f.write(response)
    os.system(f'mv "{data["file"]}" {os.getcwd()}/files/')
    if data["file"].split(".")[1]=="pdf":
        text=read_pdf(data["file"])
        summary=figure(text,2)
        summary=summary.replace('\n',' ')
        questions=figure(text,0)
        questions=questions.replace('\n',' ')
    return jsonify({"status":"ok","summary":summary,"questions":questions})

if __name__ == '__main__':
    app.run(debug=False)