// src/components/Upload.jsx

import React, { useState } from 'react';
import axios from 'axios';
import Papa from 'papaparse';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [insights, setInsights] = useState('');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  // Handle file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Handle file upload and analysis
  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    setError('');
    setProgress(0);
    setInsights('');

    try {
      // Read the file content
      const reader = new FileReader();
      reader.readAsText(file);

      reader.onload = async () => {
        const fileContent = reader.result;
        setProgress(30); // Simulate progress after reading file

        // Parse the file content to determine if it's JSON or CSV
        let parsedData;
        try {
          parsedData = JSON.parse(fileContent);
        } catch (jsonError) {
          // If JSON parsing fails, parse as CSV
          const parsed = Papa.parse(fileContent, { header: true });
          parsedData = parsed.data;
        }

        setProgress(50); // Update progress after parsing

        // Send parsed data to the serverless function
        const response = await axios.post('/api/analyze', { fileContent: JSON.stringify(parsedData) });

        setInsights(response.data.insights);
        setProgress(100); // Upload and analysis complete
      };

      reader.onerror = () => {
        setError('Failed to read file.');
      };
    } catch (err) {
      console.error(err);
      setError('File upload failed.');
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Upload Video Engagement Data</h2>
      <input
        type="file"
        accept=".csv, .json"
        onChange={handleFileChange}
        className="mb-4 block w-full text-sm text-gray-500
        file:mr-4 file:py-2 file:px-4
        file:rounded file:border-0
        file:text-sm file:font-semibold
        file:bg-blue-50 file:text-blue-700
        hover:file:bg-blue-100"
      />
      <button
        onClick={handleUpload}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Upload
      </button>
      {progress > 0 && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {progress < 100 ? `Processing: ${progress}%` : 'Completed'}
          </p>
        </div>
      )}
      {error && <div className="mt-4 text-red-500">{error}</div>}
      {insights && (
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <h3 className="text-xl font-semibold mb-2">Insights:</h3>
          <pre className="whitespace-pre-wrap">{insights}</pre>
        </div>
      )}
    </div>
  );
};

export default Upload;
