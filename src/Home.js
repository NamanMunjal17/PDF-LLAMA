import logo from './logo.svg';
import './App.css';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@supabase/supabase-js';
import { all } from 'axios';

const supabaseUrl = 'https://mdthnpuxanpxzwzrjuvv.supabase.co'; // Replace with your Supabase URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kdGhucHV4YW5weHp3enJqdXZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQ2MDg0NTEsImV4cCI6MjA0MDE4NDQ1MX0.H4EVEhfZjQycc2xxT-bzCCbXPQ3e6gE9VOM4BfUOr7E'; // Replace with your Supabase anon key
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function App() {
    useEffect(() => {
      document.title = "PDF LLAMA";
    }, []);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');
    const [old,setOld]=useState(false);
    
    const [fileName, setFileName] = useState('No file chosen');
    function generateRandomString(length = 7) {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      const charactersLength = characters.length;
    
      for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }
    
      return result;
    }
    const v=generateRandomString();
    const [uuids, setUuids] = useState([]); // State to hold UUIDs from localStorage

  // Use effect to load UUIDs from localStorage on component mount
    useEffect(() => {
    const allKeys = Object.keys(localStorage);
    if(allKeys.length>0){setOld(true);}
    setUuids(allKeys);
  }, []);
    const handleButtonClick = (key) => {
      let v=key;
      navigate('/summary', { state: { v } });
    };
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
            upsert: true, // Change to true if you want to overwrite files with the same name
        });
    const { d,e } = await supabase
        .from('fileuuid') // Specify the table where data will be inserted
        .insert([
          { uuid:  v, filename: file.name} // Specify the column and the string value to insert
        ]);
    localStorage.setItem(v,file.name);
    for(let i=0;i<localStorage.length;i++){console.log(localStorage.key(i))}
    setUploading(false);

    if (error) {
        console.error('Error uploading file:', error);
        setMessage('File upload failed. Please try again.');
    } else {
        console.log('File uploaded successfully:', data);
        setMessage('File uploaded successfully!');
        console.log("UUU",v)
        navigate('/summary', { state: { v } });
    }
  };
  return (

    <div className="app-container">
    <header className="app-header">
      <h1 className="glowing-heading">PDF LLM</h1>
      <p className="glowing-paragraph">
        Let AI help you with reading and extracting insights from PDFs/TXTs/DOCXs in a smarter way.
      </p>
      <input type="file" id="file-upload" className="file-input" onChange={handleFileChange} />
      <br></br>
        <label for="file-upload" className="file-label">Choose File</label>
        <br></br><br></br>
        <span className="file-name" for="file-upload">{fileName}</span>
      <br></br>
      <button className="button" onClick={handleUpload} disabled={uploading}>
          {uploading ? 'Uploading...' : 'Upload File'}
      </button>
      {message && <p>{message}</p>}
    </header>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {old&&<h2>Old Files</h2>}
        {uuids.map((key) => (
          <button className="button" key={key} onClick={() => handleButtonClick(key)}>
            {localStorage.getItem(key)}
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;
