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
    <div className="container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <nav style={{ position: 'absolute', top: 0, left: 0, width: '100%', padding: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>SpeakUp 🎙️</h2>
      </nav>

      <div className="glass-card" style={{ width: '100%', maxWidth: '400px' }}>
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
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            {isLogin ? 'Log In' : 'Sign Up'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#8b949e' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(''); }} 
            style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontSize: '1rem', textDecoration: 'underline' }}
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
