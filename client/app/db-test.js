'use client';

import { useState, useEffect } from 'react';

export default function DbTest() {
  const [dbStatus, setDbStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function checkDatabaseConnection() {
      try {
        setLoading(true);
        const response = await fetch('/api/test-db');
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        setDbStatus(data);
        setLoading(false);
      } catch (error) {
        console.error('Error checking database connection:', error);
        setError(error.message);
        setLoading(false);
      }
    }

    checkDatabaseConnection();
  }, []);

  if (loading) {
    return (
      <div className="p-4 bg-blue-50 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Checking Database Connection...</h2>
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-blue-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-blue-200 rounded"></div>
              <div className="h-4 bg-blue-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4 text-red-800">Database Connection Error</h2>
        <p className="text-red-700">{error}</p>
        <p className="mt-2">Could not connect to the API. Please check if the server is running.</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Database Connection Status</h2>
      
      <div className={`p-3 rounded mb-4 ${dbStatus?.database_connected ? 'bg-green-100' : 'bg-red-100'}`}>
        <p className={`font-semibold ${dbStatus?.database_connected ? 'text-green-800' : 'text-red-800'}`}>
          Status: {dbStatus?.database_connected ? 'Connected' : 'Not Connected'}
        </p>
      </div>
      
      <div className="space-y-2">
        <div className="flex">
          <span className="font-semibold w-32">Host:</span> 
          <span>{dbStatus?.database_host}</span>
        </div>
        <div className="flex">
          <span className="font-semibold w-32">Database:</span> 
          <span>{dbStatus?.database_name}</span>
        </div>
        <div className="flex">
          <span className="font-semibold w-32">Engine:</span> 
          <span>{dbStatus?.engine}</span>
        </div>
        <div className="flex">
          <span className="font-semibold w-32">Environment:</span> 
          <span>{dbStatus?.environment}</span>
        </div>
      </div>
      
      {dbStatus && !dbStatus.database_connected && dbStatus.error && (
        <div className="mt-4 p-3 bg-red-100 rounded">
          <p className="font-semibold text-red-800">Error Details:</p>
          <p className="text-red-700">{dbStatus.error}</p>
        </div>
      )}
    </div>
  );
} 