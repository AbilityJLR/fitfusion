'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [formError, setFormError] = useState(null);
  const { login, loading, error } = useAuth();
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    try {
      await login(formData.username, formData.password);
      router.push('/dashboard'); // Redirect to dashboard after login
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="auth-container">
      <div className="card">
        <div className="auth-header">
          <h1 className="auth-title">FitFusion</h1>
          <h2 className="auth-subtitle">Sign in to your account</h2>
        </div>

        {(error || formError) && (
          <div className="form-error my-4">
            {error || formError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username or Email
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              value={formData.username}
              onChange={handleChange}
              className="form-input"
              placeholder="Username or Email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="form-input"
              placeholder="Password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-full my-4"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <div className="text-center my-4">
            <p>
              Don't have an account?{' '}
              <Link href="/register">
                Register
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
} 