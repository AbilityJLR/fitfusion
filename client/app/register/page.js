'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    first_name: '',
    last_name: '',
  });
  const [formError, setFormError] = useState(null);
  const { register, login, loading, error, debug } = useAuth();
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    // Validate password according to server requirements
    if (formData.password.length < 8) {
      setFormError('Password must be at least 8 characters long');
      return;
    }
    if (!/[A-Z]/.test(formData.password)) {
      setFormError('Password must contain at least one uppercase letter');
      return;
    }
    if (!/[a-z]/.test(formData.password)) {
      setFormError('Password must contain at least one lowercase letter');
      return;
    }
    if (!/[0-9]/.test(formData.password)) {
      setFormError('Password must contain at least one number');
      return;
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password)) {
      setFormError('Password must contain at least one special character');
      return;
    }

    try {
      // Register the user
      await register(formData);
      
      // Automatically log in after successful registration
      await login(formData.username, formData.password);
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      // The error is already cleaned up in AuthContext
      console.error('Registration form error:', err.message);
      // Use existing error from auth context or set a generic one
      setFormError(error || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      <div className="card">
        <div className="auth-header">
          <h1 className="auth-title">FitFusion</h1>
          <h2 className="auth-subtitle">Create an account</h2>
        </div>

        {(error || formError) && (
          <div className="form-error my-4">
            {error || formError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-2">
            <div className="form-group">
              <label htmlFor="first_name" className="form-label">
                First Name
              </label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                value={formData.first_name}
                onChange={handleChange}
                className="form-input"
                placeholder="First Name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="last_name" className="form-label">
                Last Name
              </label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                value={formData.last_name}
                onChange={handleChange}
                className="form-input"
                placeholder="Last Name"
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              placeholder="Email Address"
            />
          </div>
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              value={formData.username}
              onChange={handleChange}
              className="form-input"
              placeholder="Username"
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
              placeholder="Password (at least 8 chars, including A-Z, a-z, 0-9, special)"
            />
            <small className="form-hint">
              Password must contain at least 8 characters, one uppercase letter, 
              one lowercase letter, one number, and one special character.
            </small>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-full my-4"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>

          <div className="text-center my-4">
            <p>
              Already have an account?{' '}
              <Link href="/login">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
} 