// src/components/Upload.jsx

import React, { useState } from 'react';
import axios from 'axios';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [insights, setInsights] = useState('');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    setLoading(true);

    try {
      // Step 1: Upload the file
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await axios.post('/api/uploadFile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { file_id } = uploadResponse.data;
      setProgress(20);

      // Step 2: Create a Thread
      const threadResponse = await axios.post('/api/createThread');
      const { thread_id } = threadResponse.data;
      setProgress(40);

      // Step 3: Add a Message to the Thread
      const messageResponse = await axios.post('/api/addMessage', {
        thread_id: thread_id,
        message: 'Create 3 data visualizations based on the trends in this file.',
        file_id: file_id,
      });
      const { message_id } = messageResponse.data;
      setProgress(60);

      // Step 4: Create a Run
      // Assuming you have stored the Assistant ID in an environment variable or elsewhere
      const assistant_id = process.env.REACT_APP_ASSISTANT_ID;

      if (!assistant_id) {
        throw new Error('Assistant ID is not configured.');
      }

      const runResponse = await axios.post('/api/createRun', {
        thread_id: thread_id,
        assistant_id: assistant_id,
        instructions: 'Please address the user as Jane Doe. The user has a premium account.',
      });

      const { run_id } = runResponse.data;
      setProgress(80);

      // Step 5: Poll for Run Result
      const pollInterval = 5000; // 5 seconds
      const maxAttempts = 12; // Poll for up to 1 minute
      let attempts = 0;

      const pollRunResult = async () => {
        try {
          const runResultResponse = await axios.get(`/api/getRunResult?run_id=${run_id}`);
          const data = runResultResponse.data;

          if (data.insights) {
            setInsights(data.insights);
            setProgress(100);
            setLoading(false);
          } else if (data.status === 'in_progress') {
            if (attempts < maxAttempts) {
              attempts += 1;
              setTimeout(pollRunResult, pollInterval);
            } else {
              setError('Run is taking too long. Please try again later.');
              setProgress(0);
              setLoading(false);
            }
          } else if (data.status === 'failed') {
            setError('Assistant failed to generate insights.');
            setProgress(0);
            setLoading(false);
          }
        } catch (pollError) {
          console.error('Polling Error:', pollError.response ? pollError.response.data : pollError.message);
          setError('Failed to retrieve insights.');
          setProgress(0);
          setLoading(false);
        }
      };

      pollRunResult();
    } catch (err) {
      console.error('Upload Error:', err.response ? err.response.data : err.message);
      setError(err.response?.data?.message || 'File upload failed.');
      setProgress(0);
      setLoading(false);
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
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Upload'}
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
