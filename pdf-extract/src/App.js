import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import logo from './logo.jpg';  // Ensure this points to your .jpg file

function App() {
  const [file, setFile] = useState(null);
  const [extractedInfo, setExtractedInfo] = useState({});
  const [originalText, setOriginalText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setExtractedInfo({});
    setOriginalText("");
    setSubmitted(false);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('file', file);
    setLoading(true);

    try {
      const response = await axios.post('https://cesirextraction.azurewebsites.net/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setExtractedInfo(response.data.extracted_info);
      setOriginalText(response.data.text);
      setSubmitted(false);
      setLoading(false);
    } catch (error) {
      console.error('Error uploading file:', error);
      setLoading(false)
    }
  };

  const handleSubmit = async () => {
    try {
      await axios.post('https://cesirextraction.azurewebsites.net/submit', {
        text: originalText, // Adjust as per backend requirements
        extracted_info: extractedInfo,
      });
      setSubmitted(true);
      setFile(null);
      setExtractedInfo({});
      setOriginalText("");
    } catch (error) {
      console.error('Error submitting data:', error);
    }
  };

  const handleStartOver = () => {
    setFile(null);
    setExtractedInfo({});
    setOriginalText("");
    setSubmitted(false);
  };

  return (
    <div className="App">
      <div className="Header">
        <img src={logo} alt="Company Logo" className="Logo" />
      </div>
      <h1>CESIR Model Trainer</h1>
      {!submitted && (
        <div className="FileUpload">
          <label className="custom-file-upload">
            <input type="file" onChange={handleFileChange} accept=".pdf" />
          </label>
          <button className="btn primary-btn Spacing" onClick={handleUpload}>Extract Info</button>
        </div>
      )}

      {loading && (
        <div className="Loading">
          <div className="spinner"></div>
          <p>Pulling Data...</p>
        </div>
      )}

      {file && !loading  && (
        <div className="MainContent">
          <div className="PDFPreview">
            <h2>PDF Preview</h2>
            <embed src={URL.createObjectURL(file)} type="application/pdf" width="100%" height="100%" />
          </div>

          {Object.keys(extractedInfo).length > 0 && (
            <div className="ExtractedInfo">
              <h2>Extracted Information</h2>
              {Object.keys(extractedInfo).map((key) => (
                <div key={key} className="InfoField">
                  <label htmlFor={key}>{key}</label>
                  <input
                    type="text"
                    id={key}
                    value={extractedInfo[key]}
                    onChange={(e) =>
                      setExtractedInfo((prevInfo) => ({
                        ...prevInfo,
                        [key]: e.target.value,
                      }))
                    }
                  />
                </div>
              ))}
              <button className="btn submit-btn" onClick={handleSubmit}>Submit</button>
            </div>
          )}
        </div>
      )}

      {submitted && (
        <div>
          <p>Data saved successfully!</p>
          <button className="btn secondary-btn" onClick={handleStartOver}>Start Over</button>
        </div>
      )}
    </div>
  );
}

export default App;
