// src/components/Upload.jsx

import React, { useState } from 'react';
import axios from 'axios';

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
      // Step 1: Upload the file as an Assistant resource
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await axios.post('/api/uploadAssistantResource', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { resource } = uploadResponse.data;
      const fileId = resource.id;

      setProgress(30); // Simulate progress after uploading file

      // Step 2: Create a thread with the uploaded file
      const threadResponse = await axios.post('/api/createThread', {
        message: 'Create 3 data visualizations based on the trends in this file.',
        file_id: fileId,
      });

      const { thread, run_id } = threadResponse.data;

      setProgress(60); // Simulate progress after creating thread

      // Step 3: Poll for run completion (implement polling logic as needed)
      // For simplicity, we'll wait for a fixed time. In production, implement proper polling.
      setTimeout(async () => {
        try {
          const runResponse = await axios.get(`/api/getRunResult?run_id=${run_id}`);
          const { insights } = runResponse.data;

          setInsights(insights);
          setProgress(100);
        } catch (runError) {
          console.error('Run Result Error:', runError.response ? runError.response.data : runError.message);
          setError('Failed to retrieve insights.');
          setProgress(0);
        }
      }, 10000); // Wait for 10 seconds before fetching results
    } catch (err) {
      console.error('Upload Error:', err.response ? err.response.data : err.message);
      setError('File upload failed.');
      setProgress(0);
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
