import logo from './logo.svg';
import './App.css';
import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mdthnpuxanpxzwzrjuvv.supabase.co'; // Replace with your Supabase URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kdGhucHV4YW5weHp3enJqdXZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQ2MDg0NTEsImV4cCI6MjA0MDE4NDQ1MX0.H4EVEhfZjQycc2xxT-bzCCbXPQ3e6gE9VOM4BfUOr7E'; // Replace with your Supabase anon key
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function App() {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');
    const [fileName, setFileName] = useState('No file chosen');
    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        const file = e.target.files[0];
        setFileName(file ? file.name : 'No file chosen');
    };
    const navigate = useNavigate();
    const handleUpload = async () => {
    if (!file) {
        alert('Please select a PDF file to upload.');
        return;
    }

    setUploading(true);
    setMessage('');

    const { data, error } = await supabase.storage
        .from('stuff') // Replace with your bucket name
        .upload(`pdfs/${file.name}`, file, {
            cacheControl: '3600',
            upsert: false, // Change to true if you want to overwrite files with the same name
        });

    setUploading(false);

    if (error) {
        console.error('Error uploading file:', error);
        setMessage('File upload failed. Please try again.');
    } else {
        console.log('File uploaded successfully:', data);
        setMessage('File uploaded successfully!');
        const v=file.name;
        navigate('/summary', { state: { v } });
    }
  };
  return (

    <div className="app-container">
    <header className="app-header">
      <h1 className="glowing-heading">PDF LLM</h1>
      <p className="glowing-paragraph">
        Let AI help you with reading and extracting insights from PDFs in a smarter way.
      </p>
      <input type="file" id="file-upload" className="file-input" onChange={handleFileChange} />
      <br></br>
        <label for="file-upload" className="file-label">Choose File</label>
        <br></br><br></br>
        <span className="file-name" for="file-upload">{fileName}</span>
      <br></br>
      <button className="button" onClick={handleUpload} disabled={uploading}>
          {uploading ? 'Uploading...' : 'Upload PDF'}
      </button>
      {message && <p>{message}</p>}
    </header>
    </div>
  );
}

export default App;
