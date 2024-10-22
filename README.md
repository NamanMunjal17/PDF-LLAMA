# PDF LLAMA
The project intends to summarise, forms questions, answer questions from a text file. The text file could be a PDF, Word File, Text File. It uses the Meta's LLLAMA model.

## Tech Stack
1) ReactJS
2) Python
3) Meta's LLAMA
4) Stanford's SQUAD Dataset
5) Flask API
6) Supabase bucket and database

## LLAMA Model
The LLAMA model is finetuned over the Stanford's SQUAD Dataset with the help of unsloth library. The data was also fetched using the wikipedia api. The model was trained over the {wikipedia_article,question based on it,answer of the question}. Its based over 300 articles with around 10 questions and answers pairs each (around 3k data points). The 3 instructions which it is given is: (Summarising the text, Forming questions, Answering the questions asked).

## System Design
The file is uploaded over the ReactJS frontend, this file is then uploaded to supabase with a UUID key. The UUID is stored in the localStorage to save "old files". This file is now retrieved by the python backend where the file is ingested and text is extracted. This text is now fed to the finetuned LLAMA model which gives back the summary, questions from the file and can answer the questions you ask from the file. This also cites the answers from the original pdf. The file is uploaded on the supabase bucket hence you can see it on the output screen too.

## Citation Algorithm
The citation algorithm uses the word2vectorization and cosine similarity algorithm to find the output answer in the original file.

## Why is this method better?
1) The API is totally free of cost the LLAMA model is running locally on the laptop.
2) Supports: PDFs, TXTs, DOCXs
3) Supabsse bucket for long term storage of files
4) No sign in required we rather use localStorage to store UUIDs to old files

## What could have been better?
1) Getting the LLAMA model and website hosted.
2) Running the LLAMA model on a faster machine for faster outputs.

## Video and PPT Link
https://drive.google.com/drive/folders/16OKUjyvTOUzx0RqDTYQUdM0MSINyzXHA?usp=sharing
