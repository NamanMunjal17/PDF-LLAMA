import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './Summary.css'
import axios from 'axios';

axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*';

const NextPage = () => {
  const location = useLocation();
  const { v } = location.state || {}; // Retrieve the variable
  console.log(v)
  const [out,setOut]=useState({"questions":"","summary":""});
  const [q,setQ]=useState("");
  const[ques,setQues]=useState("");
  const changeQues = (e) => {
    setQues(e.target.value);
};
  const getAnswer= async()=>{
    const data = {
      file: v,
      question: ques
  };
  
  // Set up headers
  const config = {
      headers: {
          'Content-Type': 'application/json','Access-Control-Allow-Origin':'*',},timeout:20000,
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
  });
  }
useEffect(() => {
    const fetchData = async () => {
        const data = {
            file: v
        };
        
        // Set up headers
        const config = {
            headers: {
                'Content-Type': 'application/json','Access-Control-Allow-Origin':'*',},timeout:20000,
        };
        
        // Make the POST request with headers
        axios.post('http://localhost:5000/download', data, config)
            .then(response => {
                console.log('Success:', response.data);
                setOut(response.data);
                
            })
            .catch(error => {
                console.error('Error:', error.response ? error.response.data : error.message);
        });
    };

    fetchData();
}, []);

  return (
    <div className="next-page">
      <div className="row">
        <p></p>
        <div className="box big">
          <p>Summary: {out.summary}</p>
        </div>
      </div>
      <div className="row">
        <div className="box big">
          <p>Questions: {out.questions}</p>
        </div>
      </div>
      <div className="row">
        <div className="box big">
          <p>{q}</p>
          <input value={ques} onChange={changeQues} type="text" placeholder="Ask a question"  onKeyDown={(e)=>{if(e.key==="Enter"){getAnswer(e.value)}}}/>
        </div>
      </div>
    </div>
  );
};

export default NextPage;
