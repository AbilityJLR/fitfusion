'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [aiAnalyzing, setAiAnalyzing] = useState(true);
  const starsContainerRef = useRef(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  // Simulate AI analyzing data
  useEffect(() => {
    if (!loading && isAuthenticated) {
      const timer = setTimeout(() => {
        setAiAnalyzing(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [loading, isAuthenticated]);
  
  // Generate stars
  useEffect(() => {
    if (!starsContainerRef.current || loading || !isAuthenticated) return;
    
    const container = starsContainerRef.current;
    const containerRect = container.getBoundingClientRect();
    
    // Clear existing stars
    container.innerHTML = '';
    
    // Create star clusters (fewer for dashboard)
    const clusterCount = 2;
    for (let i = 0; i < clusterCount; i++) {
      const cluster = document.createElement('div');
      cluster.classList.add('star-cluster');
      
      // Random position
      const x = Math.floor(Math.random() * containerRect.width);
      const y = Math.floor(Math.random() * containerRect.height);
      
      cluster.style.left = `${x}px`;
      cluster.style.top = `${y}px`;
      
      container.appendChild(cluster);
    }
    
    // Create normal stars with varied animations
    const starCount = 90;
    const animations = ['twinkle', 'diagonal', 'circular', 'pulse', 'wander'];
    
    for (let i = 0; i < starCount; i++) {
      const star = document.createElement('div');
      star.classList.add('star');
      
      // Random position
      const x = Math.floor(Math.random() * containerRect.width);
      const y = Math.floor(Math.random() * containerRect.height);
      
      // Random size (0.5px to 2.5px)
      const size = 0.5 + Math.random() * 2;
      
      // Random duration and delay
      const duration = 3 + Math.random() * 7; // 3-10s
      const delay = Math.random() * 5; // 0-5s
      
      // Choose a random animation
      const animationIndex = Math.floor(Math.random() * animations.length);
      const animation = animations[animationIndex];
      
      // Set animation-specific properties
      if (animation === 'diagonal') {
        const moveX = -10 + Math.random() * 20; // -10px to 10px
        const moveY = -10 + Math.random() * 20; // -10px to 10px
        star.style.setProperty('--move-x', `${moveX}px`);
        star.style.setProperty('--move-y', `${moveY}px`);
      } else if (animation === 'circular') {
        const orbitRadius = 2 + Math.random() * 8; // 2-10px orbit
        star.style.setProperty('--orbit-radius', `${orbitRadius}px`);
      } else if (animation === 'wander') {
        const moveX = -15 + Math.random() * 30; // -15px to 15px
        const moveY = -15 + Math.random() * 30; // -15px to 15px
        star.style.setProperty('--move-x', `${moveX}px`);
        star.style.setProperty('--move-y', `${moveY}px`);
      }
      
      star.style.left = `${x}px`;
      star.style.top = `${y}px`;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.setProperty('--duration', `${duration}s`);
      star.style.setProperty('--delay', `${delay}s`);
      star.style.setProperty('--star-animation', animation);
      
      container.appendChild(star);
      
      // Add sparkle effect to some larger stars
      if (size > 1.8 && Math.random() > 0.7) {
        const sparkle = document.createElement('div');
        sparkle.classList.add('sparkle');
        
        const sparkleSize = size * (3 + Math.random() * 3); // 3-6x the star size
        
        sparkle.style.left = `${x - sparkleSize/2 + size/2}px`;
        sparkle.style.top = `${y - sparkleSize/2 + size/2}px`;
        sparkle.style.width = `${sparkleSize}px`;
        sparkle.style.height = `${sparkleSize}px`;
        sparkle.style.setProperty('--duration', `${duration * 1.5}s`);
        sparkle.style.setProperty('--delay', `${delay + 0.5}s`);
        
        container.appendChild(sparkle);
      }
    }
    
    // Add floating particles (fewer for dashboard)
    const particleCount = 20;
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.classList.add('particle');
      
      // Random position
      const x = Math.floor(Math.random() * containerRect.width);
      const y = Math.floor(Math.random() * containerRect.height);
      
      // Random size (1px to 3px)
      const size = 1 + Math.random() * 2;
      
      // Random duration and delay
      const duration = 15 + Math.random() * 15; // 15-30s
      const delay = Math.random() * 10; // 0-10s
      
      // Random movement paths
      const moveX = -30 + Math.random() * 60; // -30px to 30px
      const moveY = -30 + Math.random() * 60; // -30px to 30px
      const moveX2 = -30 + Math.random() * 60; // -30px to 30px
      const moveY2 = -30 + Math.random() * 60; // -30px to 30px
      const moveX3 = -30 + Math.random() * 60; // -30px to 30px
      const moveY3 = -30 + Math.random() * 60; // -30px to 30px
      
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.setProperty('--duration', `${duration}s`);
      particle.style.setProperty('--delay', `${delay}s`);
      particle.style.setProperty('--move-x', `${moveX}px`);
      particle.style.setProperty('--move-y', `${moveY}px`);
      particle.style.setProperty('--move-x2', `${moveX2}px`);
      particle.style.setProperty('--move-y2', `${moveY2}px`);
      particle.style.setProperty('--move-x3', `${moveX3}px`);
      particle.style.setProperty('--move-y3', `${moveY3}px`);
      
      // Randomize opacity a bit
      const opacity = 0.15 + Math.random() * 0.25; // 0.15-0.4
      particle.style.opacity = opacity;
      
      container.appendChild(particle);
    }
    
    // Create shooting stars (fewer on dashboard)
    const shootingStarCount = 5;
    for (let i = 0; i < shootingStarCount; i++) {
      const shootingStar = document.createElement('div');
      shootingStar.classList.add('shooting-star');
      
      // Random position
      const x = Math.floor(Math.random() * containerRect.width);
      const y = Math.floor(Math.random() * containerRect.height / 2); // Only in top half
      
      // Random angle
      const angle = 15 + Math.random() * 30; // 15-45 degrees
      
      // Random duration, delay and distance
      const duration = 8 + Math.random() * 12; // 8-20s
      const delay = Math.random() * 20; // 0-20s delay
      const distance = 200 + Math.random() * 300; // 200-500px
      
      shootingStar.style.left = `${x}px`;
      shootingStar.style.top = `${y}px`;
      shootingStar.style.setProperty('--angle', `${angle}deg`);
      shootingStar.style.setProperty('--duration', `${duration}s`);
      shootingStar.style.setProperty('--delay', `${delay}s`);
      shootingStar.style.setProperty('--distance', distance);
      
      container.appendChild(shootingStar);
    }
  }, [loading, isAuthenticated]);

  // Handle logout
  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center" style={{ height: '100vh' }}>
        <div className="text-center">
          <div className="ai-orbit-loader">
            <div className="ai-orbit-circle"></div>
            <div className="ai-orbit-path"></div>
            <div className="ai-orbit-path"></div>
            <div className="ai-orbit-path"></div>
            <div className="ai-orbit-dot"></div>
            <div className="ai-orbit-dot"></div>
            <div className="ai-orbit-dot"></div>
          </div>
          <p className="mt-4 ai-glow-text">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in the useEffect
  }

  return (
    <div className="fade-in neural-bg">
      <div className="stars-container" ref={starsContainerRef}></div>
      
      <div className="neural-lines">
        <div className="neural-line"></div>
        <div className="neural-line"></div>
        <div className="neural-line"></div>
        <div className="neural-line"></div>
        <div className="neural-line"></div>
      </div>
      
      {/* Header/Navigation */}
      <header className="dashboard-header glass">
        <div className="container">
          <div className="flex justify-between items-center">
            <h1 className="dashboard-title ai-glow-text">Dashboard</h1>
            <button
              onClick={handleLogout}
              className="btn btn-danger"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container">
        <div className="dashboard-content">
          <div className="ai-card">
            <div className="profile-card-header">
              <h3 className="profile-card-title">User Profile</h3>
              <p className="profile-card-subtitle">Personal details and fitness information</p>
            </div>
            <div className="profile-card-body">
              <div className="profile-info-row">
                <dt className="profile-info-label">Full name</dt>
                <dd className="profile-info-value">
                  {user?.first_name} {user?.last_name}
                </dd>
              </div>
              <div className="profile-info-row">
                <dt className="profile-info-label">Username</dt>
                <dd className="profile-info-value">
                  {user?.username}
                </dd>
              </div>
              <div className="profile-info-row">
                <dt className="profile-info-label">Email address</dt>
                <dd className="profile-info-value">
                  {user?.email}
                </dd>
              </div>
              <div className="profile-info-row">
                <dt className="profile-info-label">Status</dt>
                <dd className="profile-info-value">
                  {user?.is_active ? 
                    <span className="ai-badge">
                      Active
                    </span> : 
                    <span className="badge badge-danger">
                      Inactive
                    </span>
                  }
                </dd>
              </div>
            </div>
          </div>

          <div className="grid grid-2 my-4">
            <div className="ai-card ai-float">
              <h3 className="profile-card-title">Workout Stats</h3>
              <p className="profile-card-subtitle mb-4">Your fitness activity overview</p>
              
              {aiAnalyzing ? (
                <div className="flex justify-center items-center" style={{ height: '150px' }}>
                  <div className="ai-waveform">
                    <div className="ai-waveform-bar"></div>
                    <div className="ai-waveform-bar"></div>
                    <div className="ai-waveform-bar"></div>
                    <div className="ai-waveform-bar"></div>
                    <div className="ai-waveform-bar"></div>
                    <div className="ai-waveform-bar"></div>
                    <div className="ai-waveform-bar"></div>
                  </div>
                  <p className="ml-3">AI analyzing your data...</p>
                </div>
              ) : (
                <div className="stat-grid">
                  <div className="stat-item ai-glow-element">
                    <p className="stat-value">12</p>
                    <p className="stat-label">Workouts</p>
                  </div>
                  <div className="stat-item ai-glow-element">
                    <p className="stat-value">5.2</p>
                    <p className="stat-label">Hours</p>
                  </div>
                  <div className="stat-item ai-glow-element">
                    <p className="stat-value">840</p>
                    <p className="stat-label">Calories</p>
                  </div>
                  <div className="stat-item ai-glow-element">
                    <p className="stat-value">4</p>
                    <p className="stat-label">Days active</p>
                  </div>
                </div>
              )}
            </div>

            <div className="ai-card ai-float" style={{animationDelay: '0.2s'}}>
              <h3 className="profile-card-title">AI Recommendations</h3>
              <p className="profile-card-subtitle mb-4">Personalized insights for you</p>
              
              {aiAnalyzing ? (
                <div className="flex justify-center items-center" style={{ height: '150px' }}>
                  <div className="ai-chat-dots">
                    <div className="ai-chat-dot"></div>
                    <div className="ai-chat-dot"></div>
                    <div className="ai-chat-dot"></div>
                  </div>
                  <p className="ml-3">AI generating recommendations...</p>
                </div>
              ) : (
                <ul className="recommendation-list">
                  <li className="recommendation-item">
                    <div className="recommendation-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                      </svg>
                    </div>
                    <p>Try increasing your cardio workouts to improve endurance</p>
                  </li>
                  <li className="recommendation-item">
                    <div className="recommendation-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                      </svg>
                    </div>
                    <p>Your strength progress is excellent, consider adding more compound exercises</p>
                  </li>
                </ul>
              )}
            </div>
          </div>
          
          <div className="ai-card">
            <h3 className="profile-card-title">AI Training Assistant</h3>
            <p className="profile-card-subtitle mb-4">Ask me anything about your fitness journey</p>
            
            <div className="ai-chat">
              Based on your recent activity, I've created a personalized workout plan for this week. Would you like to see it?
            </div>
            
            <div className="ai-chat-dots">
              <div className="ai-chat-dot"></div>
              <div className="ai-chat-dot"></div>
              <div className="ai-chat-dot"></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 