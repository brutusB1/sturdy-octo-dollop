// src/App.jsx

import React from 'react';
import Upload from './components/Upload';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white p-4 text-center">
        <h1 className="text-3xl font-bold">Video Engagement Dashboard</h1>
      </header>
      <main className="p-4">
        <Upload />
      </main>
    </div>
  );
}

export default App;
