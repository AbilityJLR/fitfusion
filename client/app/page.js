'use client';

import Link from 'next/link';
import { useAuth } from './context/AuthContext';
import { useEffect, useState, useRef } from 'react';

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [typedText, setTypedText] = useState('Your Ultimate Fitness Companion');
  const [userPrompt, setUserPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isStreaming, setIsStreaming] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const fullText = 'Your Ultimate Fitness Companion';
  const responses = [
    "To reduce muscle soreness, make sure you're properly warming up, staying hydrated, and getting adequate protein and rest between workouts.",
    "Based on your fitness goals, I recommend focusing on compound exercises like squats, deadlifts, and bench press to maximize muscle growth.",
    "To improve your endurance, try incorporating HIIT (High-Intensity Interval Training) into your routine 2-3 times per week.",
    "For weight loss, combining strength training with cardio and maintaining a caloric deficit of 300-500 calories per day is generally effective.",
    "For better recovery, consider adding stretching or yoga to your routine and ensure you're getting 7-9 hours of quality sleep each night.",
    "Try to vary your workout routine every 4-6 weeks to prevent plateaus and keep your body challenged.",
    "Proper form is more important than heavy weights. Start with lighter weights to master technique before increasing load.",
    "Don't forget to include mobility work in your routine. Dynamic stretching before workouts and static stretching after can improve flexibility.",
    "Nutrition is just as important as exercise. Aim for a balanced diet with adequate protein, complex carbs, and healthy fats."
  ];
  const starsContainerRef = useRef(null);
  const responseIndexRef = useRef(0);
  
  // Add continuously cycling streaming responses
  useEffect(() => {
    const streamNextResponse = () => {
      setIsStreaming(true);
      setAiResponse('');
      
      // Get next response in the cycle
      const currentResponse = responses[responseIndexRef.current];
      responseIndexRef.current = (responseIndexRef.current + 1) % responses.length;
      
      // Stream the response
      let currentIndex = 0;
      const typingInterval = setInterval(() => {
        if (currentIndex <= currentResponse.length) {
          setAiResponse(currentResponse.substring(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(typingInterval);
          setIsStreaming(false);
          
          // Wait some time after completing the text before starting the next response
          setTimeout(() => {
            streamNextResponse();
          }, 5000); // Wait 5 seconds before starting next response
        }
      }, 30); // Speed of typing
    };
    
    // Start the cycle
    streamNextResponse();
    
    // Cleanup
    return () => {
      setIsStreaming(false);
    };
  }, []);
  
  // Generate stars
  useEffect(() => {
    if (!starsContainerRef.current) return;
    
    const container = starsContainerRef.current;
    const containerRect = container.getBoundingClientRect();
    
    // Clear existing stars
    container.innerHTML = '';
    
    // Create star clusters
    const clusterCount = 3;
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
    const starCount = 120;
    const animations = ['twinkle', 'diagonal', 'circular', 'pulse', 'wander'];
    
    for (let i = 0; i < starCount; i++) {
      const star = document.createElement('div');
      star.classList.add('star');
      
      // Random position
      const x = Math.floor(Math.random() * containerRect.width);
      const y = Math.floor(Math.random() * containerRect.height);
      
      // Random size (0.5px to 3px)
      const size = 0.5 + Math.random() * 2.5;
      
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
      if (size > 2 && Math.random() > 0.6) {
        const sparkle = document.createElement('div');
        sparkle.classList.add('sparkle');
        
        const sparkleSize = size * (4 + Math.random() * 4); // 4-8x the star size
        
        sparkle.style.left = `${x - sparkleSize/2 + size/2}px`;
        sparkle.style.top = `${y - sparkleSize/2 + size/2}px`;
        sparkle.style.width = `${sparkleSize}px`;
        sparkle.style.height = `${sparkleSize}px`;
        sparkle.style.setProperty('--duration', `${duration * 1.5}s`);
        sparkle.style.setProperty('--delay', `${delay + 0.5}s`);
        
        container.appendChild(sparkle);
      }
    }
    
    // Add floating particles
    const particleCount = 30;
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.classList.add('particle');
      
      // Random position
      const x = Math.floor(Math.random() * containerRect.width);
      const y = Math.floor(Math.random() * containerRect.height);
      
      // Random size (1px to 4px)
      const size = 1 + Math.random() * 3;
      
      // Random duration and delay
      const duration = 15 + Math.random() * 20; // 15-35s
      const delay = Math.random() * 10; // 0-10s
      
      // Random movement paths
      const moveX = -40 + Math.random() * 80; // -40px to 40px
      const moveY = -40 + Math.random() * 80; // -40px to 40px
      const moveX2 = -40 + Math.random() * 80; // -40px to 40px
      const moveY2 = -40 + Math.random() * 80; // -40px to 40px
      const moveX3 = -40 + Math.random() * 80; // -40px to 40px
      const moveY3 = -40 + Math.random() * 80; // -40px to 40px
      
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
      const opacity = 0.2 + Math.random() * 0.3; // 0.2-0.5
      particle.style.opacity = opacity;
      
      container.appendChild(particle);
    }
    
    // Create shooting stars
    const shootingStarCount = 8;
    for (let i = 0; i < shootingStarCount; i++) {
      const shootingStar = document.createElement('div');
      shootingStar.classList.add('shooting-star');
      
      // Random position
      const x = Math.floor(Math.random() * containerRect.width);
      const y = Math.floor(Math.random() * containerRect.height / 2); // Only in top half
      
      // Random angle
      const angle = 15 + Math.random() * 30; // 15-45 degrees
      
      // Random duration, delay and distance
      const duration = 6 + Math.random() * 10; // 6-16s
      const delay = Math.random() * 15; // 0-15s delay
      const distance = 200 + Math.random() * 300; // 200-500px
      
      shootingStar.style.left = `${x}px`;
      shootingStar.style.top = `${y}px`;
      shootingStar.style.setProperty('--angle', `${angle}deg`);
      shootingStar.style.setProperty('--duration', `${duration}s`);
      shootingStar.style.setProperty('--delay', `${delay}s`);
      shootingStar.style.setProperty('--distance', distance);
      
      container.appendChild(shootingStar);
    }
  }, []);
  
  // Handle prompt submission - now overrides automatic cycling
  const handlePromptSubmit = (e) => {
    e.preventDefault();
    if (!userPrompt.trim()) return;
    
    // Clear any ongoing animations/timers by remounting effect
    responseIndexRef.current = -1; // Special flag to indicate manual mode
    
    setIsLoading(true);
    setAiResponse('');
    setIsStreaming(true);
    
    // Simulate AI thinking
    setTimeout(() => {
      // Choose a response based on the prompt (in a real app, this would call an AI API)
      const selectedResponse = responses[Math.floor(Math.random() * responses.length)];
      
      // Stream the response
      let currentIndex = 0;
      setIsLoading(false);
      
      const streamInterval = setInterval(() => {
        if (currentIndex <= selectedResponse.length) {
          setAiResponse(selectedResponse.substring(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(streamInterval);
          setIsStreaming(false);
          
          // If not a manual response, restart the cycling
          if (responseIndexRef.current !== -1) {
            setTimeout(() => {
              // Continue with automatic responses
              responseIndexRef.current = (responseIndexRef.current + 1) % responses.length;
              // The cycle will continue with the useEffect
            }, 5000);
          }
        }
      }, 30);
    }, 1000);
  };

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
      
      <header className="header glass">
        <div className="container">
          <nav className="nav">
            <div>
              <Link href="/" className="logo ai-glow-text">FitFusion</Link>
            </div>
            <div className="nav-links">
              <Link href="/db-test-page">
                DB Test
              </Link>
              {isAuthenticated ? (
                <Link href="/dashboard" className="btn btn-primary ai-glow-element">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    Log in
                  </Link>
                  <Link href="/register" className="btn btn-primary ai-glow-element">
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>

      <div className="hero">
        <div className="ai-badge">AI-Powered</div>
        <h1 className="hero-title">
          <span>
            {typedText}
          </span>
        </h1>
        <p className="hero-text">
          Track your workouts, monitor your progress, and achieve your fitness goals with FitFusion, the AI-powered fitness solution.
        </p>
        
        <form onSubmit={handlePromptSubmit} className="prompt-form">
          <input
            type="text"
            className="prompt-input glass"
            placeholder="Ask me anything about fitness, nutrition, or workout plans..."
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
          />
          <button type="submit" className="prompt-button ai-glow-element" disabled={isLoading}>
            {isLoading ? (
              <div className="ai-chat-dots prompt-dots">
                <div className="ai-chat-dot"></div>
                <div className="ai-chat-dot"></div>
                <div className="ai-chat-dot"></div>
              </div>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            )}
          </button>
        </form>
        
        <div className="ai-chat-container">
          <div className="ai-chat">
            {aiResponse || "Hi! I'm your AI fitness assistant. How can I help you today?"}
          </div>
          <div className="ai-chat-dots" style={{ opacity: isStreaming ? 1 : 0.5 }}>
            <div className="ai-chat-dot"></div>
            <div className="ai-chat-dot"></div>
            <div className="ai-chat-dot"></div>
          </div>
        </div>
      </div>
      
      <div className="features">
        <div className="container">
          <div className="features-header">
            <h2 className="features-subtitle">Powered by AI</h2>
            <p className="features-title">
              Everything you need to track your fitness journey
            </p>
            <p className="features-description">
              FitFusion provides all the tools you need to monitor your workouts, track your progress, and achieve your fitness goals with AI-powered insights.
            </p>
            
            <div className="ai-orbit-loader">
              <div className="ai-orbit-circle"></div>
              <div className="ai-orbit-path"></div>
              <div className="ai-orbit-path"></div>
              <div className="ai-orbit-path"></div>
              <div className="ai-orbit-dot"></div>
              <div className="ai-orbit-dot"></div>
              <div className="ai-orbit-dot"></div>
            </div>
          </div>

          <div className="feature-grid">
            <div className="ai-card ai-float">
              <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="feature-title">Real-time Tracking</h3>
              <p className="feature-description">
                Track your workouts in real-time and get instant feedback on your performance to optimize your training.
              </p>
              <div className="ai-waveform">
                <div className="ai-waveform-bar"></div>
                <div className="ai-waveform-bar"></div>
                <div className="ai-waveform-bar"></div>
                <div className="ai-waveform-bar"></div>
                <div className="ai-waveform-bar"></div>
                <div className="ai-waveform-bar"></div>
                <div className="ai-waveform-bar"></div>
              </div>
            </div>
            
            <div className="ai-card ai-float" style={{animationDelay: '0.2s'}}>
              <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              </div>
              <h3 className="feature-title">AI-Powered Insights</h3>
              <p className="feature-description">
                Get personalized recommendations and insights based on your workout history and performance data.
              </p>
              <div className="ai-waveform">
                <div className="ai-waveform-bar"></div>
                <div className="ai-waveform-bar"></div>
                <div className="ai-waveform-bar"></div>
                <div className="ai-waveform-bar"></div>
                <div className="ai-waveform-bar"></div>
                <div className="ai-waveform-bar"></div>
                <div className="ai-waveform-bar"></div>
              </div>
            </div>
            
            <div className="ai-card ai-float" style={{animationDelay: '0.4s'}}>
              <div className="feature-icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <h3 className="feature-title">Personalized Plans</h3>
              <p className="feature-description">
                Get customized workout plans that adapt to your goals, fitness level, and available equipment.
              </p>
              <div className="ai-waveform">
                <div className="ai-waveform-bar"></div>
                <div className="ai-waveform-bar"></div>
                <div className="ai-waveform-bar"></div>
                <div className="ai-waveform-bar"></div>
                <div className="ai-waveform-bar"></div>
                <div className="ai-waveform-bar"></div>
                <div className="ai-waveform-bar"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
