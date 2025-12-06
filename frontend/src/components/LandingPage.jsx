import React from 'react';

const LandingPage = ({ onStart, onStartAI, onStartAICall }) => {
  return (
    <div className="container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>SpeakUp 🎙️</h2>
        <div>
          <a href="#" className="btn btn-secondary" style={{ fontSize: '0.9rem' }}>Login</a>
        </div>
      </nav>

      <main>
        <h1>Master English via <br/> <span style={{ color: 'var(--primary-color)' }}>Real Conversations</span></h1>
        <p style={{ fontSize: '1.2rem', color: '#8b949e', maxWidth: '600px', margin: '0 auto 2rem auto' }}>
          Connect instantly with learners worldwide. Practice speaking, gain confidence, and level up your fluency with AI-powered feedback.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button onClick={onStart} className="btn btn-primary pulse-anim" style={{ fontSize: '1.1rem', padding: '1rem 2.5rem' }}>
            Start Random Chat
            </button>
            <button onClick={onStartAI} className="btn btn-secondary" style={{ fontSize: '1.1rem', padding: '1rem 2.5rem', background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
            Practice w/ AI 🤖
            </button>
            <button onClick={onStartAICall} className="btn btn-secondary" style={{ fontSize: '1.1rem', padding: '1rem 2.5rem', background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
            Call AI 📞
            </button>
        </div>

        <div style={{ marginTop: '5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
          <div className="glass-card">
            <h3>⚡ Instant Match</h3>
            <p>No scheduling. Just tap and talk to someone at your level immediately.</p>
          </div>
          <div className="glass-card">
            <h3>🎯 Smart Topics</h3>
            <p>Never run out of things to say with our AI-curated conversation starters.</p>
          </div>
          <div className="glass-card">
            <h3>📈 Fluency Tracking</h3>
            <p>Get instant feedback on your pronunciation and grammar after every call.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
