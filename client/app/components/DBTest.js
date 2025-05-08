'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

export default function DBTest() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [regResult, setRegResult] = useState(null);
  const [regLoading, setRegLoading] = useState(false);
  const [directResult, setDirectResult] = useState(null);
  const [directLoading, setDirectLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Use the correct URL with api prefix
        const response = await axios.get('api/v1/test/users', {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        setUsers(response.data);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(err.message || 'Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const testRegistration = async () => {
    try {
      setRegLoading(true);
      setRegResult(null);
      
      const randomId = Math.floor(Math.random() * 10000);
      
      const userData = {
        email: `test${randomId}@example.com`,
        username: `testuser${randomId}`,
        password: "Test@123456",
        first_name: "Test",
        last_name: "User"
      };
      
      console.log("Testing registration with data:", userData);
      
      const response = await axios.post('api/v1/users/', userData, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      setRegResult({
        success: true,
        data: response.data,
        status: response.status
      });
      
    } catch (err) {
      console.error('Registration test error:', err);
      setRegResult({
        success: false,
        error: err.response?.data?.detail || err.message,
        status: err.response?.status
      });
    } finally {
      setRegLoading(false);
    }
  };

  const testDirectRegistration = async () => {
    try {
      setDirectLoading(true);
      setDirectResult(null);
      
      const randomId = Math.floor(Math.random() * 10000);
      
      const userData = {
        email: `direct${randomId}@example.com`,
        username: `directuser${randomId}`,
        password: "Test@123456",
        first_name: "Direct",
        last_name: "Test"
      };
      
      console.log("Testing direct registration with data:", userData);
      
      // Use our Next.js API route
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      setDirectResult({
        success: true,
        data: data,
        status: response.status,
        redirected: response.redirected,
        redirectUrl: response.url
      });
      
    } catch (err) {
      console.error('Direct registration test error:', err);
      setDirectResult({
        success: false,
        error: err.message,
        status: 'Error'
      });
    } finally {
      setDirectLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="auth-subtitle mb-4">Database Connection Test</h2>
      
      {loading && <p>Loading users from database...</p>}
      
      {error && (
        <div className="form-error my-4">
          <p>Error connecting to database: {error}</p>
          <p>Make sure your FastAPI server is running and the test endpoint is available.</p>
        </div>
      )}
      
      {!loading && !error && users.length === 0 && (
        <p>No users found in the database.</p>
      )}
      
      {!loading && !error && users.length > 0 && (
        <div>
          <p className="mb-4">Successfully connected to database! Found {users.length} users:</p>
          <ul>
            {users.map((user) => (
              <li key={user.id} className="my-2">
                <strong>{user.username}</strong> ({user.email})
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="my-4">
        <h3 className="auth-subtitle">Test Registration</h3>
        <button 
          onClick={testRegistration} 
          disabled={regLoading}
          className="btn btn-primary my-2"
        >
          {regLoading ? 'Testing...' : 'Test Axios Registration'}
        </button>
        
        {regResult && (
          <div className={`my-2 ${regResult.success ? 'form-success' : 'form-error'}`}>
            <p><strong>Status:</strong> {regResult.success ? 'Success' : 'Failed'}</p>
            <p><strong>HTTP Status:</strong> {regResult.status}</p>
            {regResult.success ? (
              <p><strong>Created user:</strong> {regResult.data.username} ({regResult.data.email})</p>
            ) : (
              <p><strong>Error:</strong> {regResult.error}</p>
            )}
          </div>
        )}
        
        <button 
          onClick={testDirectRegistration} 
          disabled={directLoading}
          className="btn btn-primary my-2 ml-2"
        >
          {directLoading ? 'Testing...' : 'Test Next.js API Route'}
        </button>
        
        {directResult && (
          <div className={`my-2 ${directResult.success ? 'form-success' : 'form-error'}`}>
            <p><strong>Status:</strong> {directResult.success ? 'Success' : 'Failed'}</p>
            <p><strong>HTTP Status:</strong> {directResult.status}</p>
            {directResult.success && (
              <>
                <p><strong>Created user:</strong> {directResult.data.username} ({directResult.data.email})</p>
                {directResult.redirected && (
                  <p><strong>Redirected:</strong> Yes, to {directResult.redirectUrl}</p>
                )}
              </>
            )}
            {!directResult.success && (
              <p><strong>Error:</strong> {directResult.error}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 