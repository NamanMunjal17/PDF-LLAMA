import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './Summary.css'
import axios from 'axios';
import { ClipLoader } from 'react-spinners';
import { createClient } from '@supabase/supabase-js';

// Replace with your actual Supabase URL and public API key
const supabaseUrl = 'https://mdthnpuxanpxzwzrjuvv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kdGhucHV4YW5weHp3enJqdXZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjQ2MDg0NTEsImV4cCI6MjA0MDE4NDQ1MX0.H4EVEhfZjQycc2xxT-bzCCbXPQ3e6gE9VOM4BfUOr7E';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*';

const NextPage = () => {
  const location = useLocation();
  const [fil,setFil]=useState('');
  const { v } = location.state || {}; // Retrieve the variable
  console.log("XYXYXYXY",v)
  useEffect(()=>{
    const ftch = async()=>{
      const {data,error}=await supabase
        .from('fileuuid') // Specify the table name
        .select('*')             // Select all columns or specify specific columns
        .eq('uuid', v);
    console.log("FILE",data)
    setFil(data[0].filename)
    document.title = data[0].filename;
    const dat = {
      file: data[0].filename
  };
  console.log("AAAAAAAAAAAAAAAAAA",data[0].filename)
  // Set up headers
  const config = {
      headers: {
          'Content-Type': 'application/json','Access-Control-Allow-Origin':'*',},timeout:600000,
  };
  
  // Make the POST request with headers
  axios.post('http://localhost:5000/download', dat, config)
      .then(response => {
          console.log('Success:', response.data);
          setOut(response.data);
          handleLoad();
      })
      .catch(error => {
          console.error('Error:', error.response ? error.response.data : error.message);
  });
  }
  ftch();},[v])
  console.log("FILE:",fil)
  const filePath=`pdfs/${fil}`;
  const filetype=fil.split(".")[1];
  const bucketName="stuff";
  var done=false;
  if(!done){console.log(fil);done=true;}
  const [out,setOut]=useState({"questions":"","summary":""});
  const [q,setQ]=useState("");
  const [loading,setLoading]=useState(true);
  const[ques,setQues]=useState("");
  const [url,setURL]=useState("");
  const changeQues = (e) => {
    setQues(e.target.value);
  };
  useEffect(() => {
    const fetchFile = async () => {
      try {
        const { data, error } = await supabase
          .storage
          .from(bucketName)
          .getPublicUrl(filePath);

        if (error) {
          throw error;
        }

        setURL(data.publicUrl);
        console.log(data)
      } catch (err) {
      } finally {
      }
    };

    fetchFile();
  }, [bucketName, filePath]);
  function handleLoad(){
    setLoading(!loading);
    console.log(loading)
  }
  const getAnswer= async()=>{
    const data = {
      file: fil,
      question: ques
  };
  
  // Set up headers
  const config = {
      headers: {
          'Content-Type': 'application/json','Access-Control-Allow-Origin':'*',},timeout:60000,
  };
  
  // Make the POST request with headers
  axios.post('http://localhost:5000/echo', data, config)
      .then(response => {
          console.log('Success:', response.data);
          setQ("Answer: "+response.data.output);
          setQues("");
      })
      .catch(error => {
          console.error('Error:', error.response ? error.response.data : error.message);
  }).finally(()=>{handleLoad()});
  }

  return (
    <div className="next-page">
      {loading&&(<ClipLoader color='#28a745' size={20} className="spinner"></ClipLoader>)}
      <div className='row1'><h2>Summary</h2></div>
      <div className="row">
        <div className="box big">
          <p>{out.summary}</p>
        </div>
      </div>
      <div className='row1'><h2>Questions</h2></div>
      <div className="row">
        <div className="box big">
          <p onChange={handleLoad} dangerouslySetInnerHTML={{__html: out.questions}}></p>
        </div>
      </div>
      <div className='row1'><h2>Q&A</h2></div>
      <div className="row">
        <div className="box big">
          <p>{q}</p>
          <input value={ques} onChange={changeQues} type="text" placeholder="Ask a question"  onKeyDown={(e)=>{if(e.key==="Enter"){getAnswer(e.value);handleLoad()}}}/>
        </div>
      </div>
      <div className='file'>
      {url ? (
        <iframe className='ifile'
          src={url}
        ></iframe>
      ) : (
        <p>Loading...</p>
      )}
      </div>
    </div>
  );
};

export default NextPage;
