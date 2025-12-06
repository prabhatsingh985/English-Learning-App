import React, { useState } from 'react';

const Auth = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const url = isLogin 
      ? 'http://localhost:3000/api/auth/login'
      : 'http://localhost:3000/api/auth/signup';

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      if (isLogin) {
        onLogin(data);
      } else {
        setIsLogin(true); // Switch to login after signup
        setError('Signup successful! Please log in.');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ padding: '2rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', background: 'linear-gradient(to right, #fff, #bdc8f0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>SpeakUp 🎙️</h2>
      </nav>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4rem', paddingBottom: '2rem' }} className="auth-container">
        
        {/* Left Side: Home Page Content */}
        <div style={{ flex: 1 }} className="auth-hero">
            <h1 style={{ fontSize: '3.5rem', lineHeight: '1.2', marginBottom: '1.5rem' }}>
                Master English via <br/>
                <span style={{ 
                    background: 'linear-gradient(to right, #a855f7, #ec4899)', 
                    WebkitBackgroundClip: 'text', 
                    WebkitTextFillColor: 'transparent' 
                }}>
                    Real Conversations
                </span>
            </h1>
            <p style={{ fontSize: '1.2rem', color: '#9ca3af', marginBottom: '2rem', lineHeight: '1.6' }}>
                Connect instantly with learners worldwide or practice privately with our advanced AI partner. 
                <br/>Speak, listen, and grow your confidence today.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '0.8rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⚡</div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>Instant Match</h3>
                    <p style={{ fontSize: '0.9rem', color: '#8b949e', margin: 0 }}>Talk to real people instantly.</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '0.8rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🤖</div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>AI Tutor</h3>
                    <p style={{ fontSize: '0.9rem', color: '#8b949e', margin: 0 }}>Practice 24/7 with AI.</p>
                </div>
            </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="glass-card" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>{isLogin ? 'Welcome Back' : 'Join the Community'}</h2>
          
          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '0.8rem', borderRadius: '0.5rem', marginBottom: '1rem', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <input 
                type="text" 
                name="username" 
                placeholder="Username" 
                value={formData.username} 
                onChange={handleChange} 
                required 
              />
            )}
            <input 
              type="email" 
              name="email" 
              placeholder="Email Address" 
              value={formData.email} 
              onChange={handleChange} 
              required 
            />
            <input 
              type="password" 
              name="password" 
              placeholder="Password" 
              value={formData.password} 
              onChange={handleChange} 
              required 
            />
            
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '1rem' }}>
              {isLogin ? 'Log In' : 'Sign Up'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#8b949e' }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(''); }} 
              style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontSize: '1rem', fontWeight: '600', textDecoration: 'none' }}
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Auth;
