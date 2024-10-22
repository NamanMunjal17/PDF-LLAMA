from unsloth import FastLanguageModel
from flask import Flask, request, jsonify
from supabase import create_client, Client
import os
import PyPDF2
from flask_cors import CORS
from docx import Document

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
    _ = model.generate(**inputs,do_sample=True  ,temperature=0.6,max_new_tokens=200)
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
            x=page.extract_text()
            x=" ".join(x.split("\n"))
            pdf_text += x + "\n" # Add text of each page
        print(pdf_text)
    return pdf_text

from transformers import TextStreamer

def read_word_file(file_path):
    # Load the Word document
    doc = Document(file_path)
    
    # Initialize a list to hold the paragraphs
    text = []
    
    # Iterate through each paragraph in the document
    for paragraph in doc.paragraphs:
        text.append(paragraph.text)
    
    # Join the paragraphs into a single string
    return '\n'.join(text)

def cosine_similarity(text1, text2):
    # Preprocess the texts: convert to lowercase and split into words
    words1 = text1.lower().split()
    words2 = text2.lower().split()

    # Calculate term frequencies
    tf1 = {}
    for word in words1:
        tf1[word] = tf1.get(word, 0) + 1

    tf2 = {}
    for word in words2:
        tf2[word] = tf2.get(word, 0) + 1

    # Create a set of all unique words in both texts
    all_words = set(tf1.keys()).union(set(tf2.keys()))

    # Create vectors for both texts
    vector1 = [tf1.get(word, 0) for word in all_words]
    vector2 = [tf2.get(word, 0) for word in all_words]

    # Calculate dot product and magnitudes
    dot_product = sum(a * b for a, b in zip(vector1, vector2))
    magnitude1 = sum(a ** 2 for a in vector1) ** 0.5
    magnitude2 = sum(b ** 2 for b in vector2) ** 0.5

    # Calculate cosine similarity
    if magnitude1 == 0 or magnitude2 == 0:
        return 0.0  # To handle zero division
    return dot_product / (magnitude1 * magnitude2)

def find_most_similar_substring(paragraph, text2):
    # Preprocess the paragraph and text2
    words_paragraph = paragraph.lower().split()
    words_text2 = text2.lower().split()

    length_text2 = len(words_text2)  # Length of text2 in terms of words
    max_similarity = 0
    best_substring = ""  # To store the best matching substring

    # Iterate over each substring of the paragraph with equal word length as text2
    for i in range(len(words_paragraph) - length_text2 + 1):
        # Create the substring with the same word length as text2
        substring = " ".join(words_paragraph[i:i + length_text2])

        # Calculate cosine similarity between the substring and text2
        similarity = cosine_similarity(substring, text2)

        # Keep track of the substring with the highest similarity
        if similarity > max_similarity:
            max_similarity = similarity
            best_substring = substring

    return best_substring, max_similarity

# Route to return the same message sent in the request
@app.route('/echo', methods=['POST'])
def echo_message():
    data=request.json
    print(data["file"],data["question"])
    if data["file"].split(".")[1]=="pdf":
        text=read_pdf(data["file"])
    elif data["file"].split(".")[1]=="txt":
        with open(f'files/{data["file"]}','r') as f:
            text=f.read()
    elif data["file"].split(".")[1]=="docx":
        text=read_word_file(f'files/{data["file"]}')
    out=figure(text+f'\nQUESTION:{data["question"]}',1)
    out=out.replace('\n',' ')
    out=out.replace("<|end_of_text|>","")
    x,y=find_most_similar_substring(text,out)
    out=out+f' (Citation (exact line from pdf): {x})'
    return jsonify({"output":out})

@app.route('/download',methods=['POST','GET'])
def download():
    data=request.json
    print(data)
    response = supabase.storage.from_("stuff").download(f'pdfs/{data["file"]}')
    with open(data["file"], "wb") as f:
        f.write(response)
    os.system(f'mv "{data["file"]}" {os.getcwd()}/files/')
    if data["file"].split(".")[1]=="pdf":
        text=read_pdf(data["file"])
    elif data["file"].split(".")[1]=="txt":
        with open(f'files/{data["file"]}','r') as f:
            text=f.read()
    elif data["file"].split(".")[1]=="docx":
        text=read_word_file(f'files/{data["file"]}')
    summary=figure(text,2)
    summary=summary.replace('\n',' ')
    questions=figure(text,0)
    questions=questions.replace('\n',' ')
    summary=summary.replace("<|end_of_text|>","").strip()
    questions=questions.replace("<|end_of_text|>","").strip()
    questions="?<br>".join(questions.split("?"))
    return jsonify({"status":"ok","summary":summary,"questions":questions})

if __name__ == '__main__':
    app.run(debug=False)