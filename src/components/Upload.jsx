// src/components/Upload.jsx

import React, { useState } from 'react';
import axios from 'axios';
import usePolling from '../hooks/usePolling';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [insights, setInsights] = useState('');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Custom hook for polling
  const { startPolling, stopPolling } = usePolling();

  // Handle file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setInsights('');
    setError('');
    setProgress(0);
  };

  // Handle file upload and analysis
  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    setError('');
    setInsights('');
    setProgress(0);
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
      setProgress(30);

      // Step 3: Add a Message to the Thread
      const messageResponse = await axios.post('/api/addMessage', {
        thread_id: thread_id,
        message: 'Create 3 data visualizations based on the trends in this file.',
        file_id: file_id,
      });
      const { message_id } = messageResponse.data;
      setProgress(40);

      // Step 4: Create a Run
      const assistant_id = process.env.REACT_APP_ASSISTANT_ID;

      if (!assistant_id) {
        throw new Error('Assistant ID is not configured.');
      }

      const runResponse = await axios.post('/api/createRun', {
        thread_id: thread_id,
        assistant_id: assistant_id,
        instructions: 'Please address the user as Jane Doe. The user has a premium account.',
        tools: [{ type: 'code_interpreter' }],
      });

      const { run_id } = runResponse.data;
      setProgress(50);

      // Step 5: Start Polling for Run Result
      startPolling(async () => {
        try {
          const runResultResponse = await axios.get(`/api/getRunResult?run_id=${run_id}`);
          const data = runResultResponse.data;

          if (data.insights) {
            setInsights(data.insights);
            setProgress(100);
            setLoading(false);
            stopPolling();
          } else if (data.status === 'failed') {
            setError('Assistant failed to generate insights.');
            setProgress(0);
            setLoading(false);
            stopPolling();
          } else {
            setProgress((prev) => (prev < 90 ? prev + 10 : prev));
          }
        } catch (pollError) {
          console.error('Polling Error:', pollError.response ? pollError.response.data : pollError.message);
          setError('Failed to retrieve insights.');
          setProgress(0);
          setLoading(false);
          stopPolling();
        }
      }, 5000); // Poll every 5 seconds
    } catch (err) {
      console.error('Upload Error:', err.response ? err.response.data : err.message);
      setError(err.response?.data?.message || 'File upload failed.');
      setProgress(0);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-semibold mb-4 text-center">Video Engagement Analysis</h2>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="file">
          Select CSV or JSON File
        </label>
        <input
          type="file"
          id="file"
          accept=".csv, .json, .png, .jpg, .jpeg, .gif, .webp"
          onChange={handleFileChange}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
        />
      </div>
      <button
        onClick={handleUpload}
        className={`w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors ${
          loading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Upload & Analyze'}
      </button>

      {progress > 0 && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-1 text-center">
            {progress < 100 ? `Processing: ${progress}%` : 'Analysis Complete'}
          </p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {insights && (
        <div className="mt-6 p-4 bg-green-100 text-green-800 rounded-md">
          <h3 className="text-xl font-semibold mb-2">Insights:</h3>
          <pre className="whitespace-pre-wrap">{insights}</pre>
        </div>
      )}
    </div>
  );
};

export default Upload;
