# PDF LLAMA
This project utilizes Unsloth with Llama3 to read PDF documents, generate questions, answer questions based on the content, and summarize text completely locally. The front end is built with ReactJS, and the back end uses a Flask API for communication between the two components.

# Features
PDF Parsing: Reads and extracts text from PDF documents.
Question Generation: Automatically generates relevant questions based on the content of the PDF.
Answering Questions: Allows users to ask questions related to the content, and Llama3 provides accurate answers based on the PDF data.
Summarization: Provides a concise summary of the entire PDF document.
Local Execution: All processing is done locally, ensuring privacy and no reliance on external servers.
# Technology Stack
Used the Stanford Squad dataset to fine tune the llama3 model with the help of unsloth. The llama3 model is hosted over a flask api which is accessed by the reactjs frontend
# Back End
Unsloth: For handling AI tasks with Llama3.
Supabase: Container to store pdf files
Llama3: Used for generating questions, answering, and summarizing PDF content.
Flask: Provides the API for the front end to communicate with the back end.
# Front End
ReactJS: User interface built with a modern and interactive design.
Custom Dark Theme: Includes glowing green characters and animated elements to enhance the user experience.
# Future Enhancements
Multi-language support: Extend the capabilities of the system to support multiple languages for PDF content.
Customizable Summarization: Allow users to adjust the length and detail of the summaries.
Offline Support: Package the entire application for offline use.
# Video & Presentation
https://drive.google.com/drive/folders/19x7TuBUkhLayjSZqtcANzQxWuqzA8zYW?usp=sharing
