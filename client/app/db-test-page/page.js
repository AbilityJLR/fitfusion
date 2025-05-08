'use client';

import DBTest from '../components/DBTest';

export default function DBTestPage() {
  return (
    <div className="container">
      <div className="main">
        <h1 className="dashboard-title mb-4">API Connection Testing Page</h1>
        <p className="mb-4">This page helps diagnose potential issues with API connections and registration.</p>
        
        <DBTest />
      </div>
    </div>
  );
} 