import React from 'react';
import Footer from './Footer';

const LandingPage = ({ onStart, onStartAI, onStartAICall, onCallUser }) => {
  return (
    <div className="container" style={{ textAlign: 'center', paddingTop: '4rem', paddingBottom: '4rem' }}>
      
      <main style={{ marginTop: '2rem' }}>
        <div style={{ marginBottom: '4rem' }}>
            <span style={{ 
                background: 'var(--badge-bg)', 
                color: 'var(--badge-text)', 
                padding: '0.5rem 1rem', 
                borderRadius: '999px', 
                fontSize: '0.9rem',
                fontWeight: '600',
                border: '1px solid var(--badge-border)'
            }}>
                🚀 Level up your English
            </span>
            <h1 style={{ fontSize: '4rem', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
                Master English via <br/> 
                <span style={{ 
                    background: 'linear-gradient(to right, #a855f7, #ec4899)', 
                    WebkitBackgroundClip: 'text', 
                    WebkitTextFillColor: 'transparent' 
                }}>
                    Real Conversations
                </span>
            </h1>
            <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '700px', margin: '0 auto 3rem auto', lineHeight: '1.8' }}>
            Connect instantly with learners worldwide or practice privately with our advanced AI partner. 
            Speak, listen, and grow your confidence today.
            </p>

            <div className="landing-buttons" style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={onStart} className="btn btn-primary pulse-anim" style={{ fontSize: '1.1rem', padding: '1rem 2.5rem' }}>
                Start Random Call 🌐
                </button>
                <button onClick={onStartAICall} className="btn" style={{ 
                    fontSize: '1.1rem', 
                    padding: '1rem 2.5rem', 
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: 'white',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
                }}>
                Call AI Tutor 📞
                </button>
                <button onClick={onStartAI} className="btn btn-secondary" style={{ fontSize: '1.1rem', padding: '1rem 2.5rem' }}>
                Chat with AI 🤖
                </button>
            </div>

            <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center' }}>
                <input 
                    type="text" 
                    id="targetUser"
                    placeholder="Enter username to call..."
                    style={{ 
                        padding: '0.8rem 1.5rem', 
                        borderRadius: '2rem', 
                        border: '1px solid var(--glass-border)', 
                        background: 'rgba(255,255,255,0.05)', 
                        color: 'white',
                        width: '250px',
                        outline: 'none'
                    }}
                />
                <button 
                    onClick={() => {
                        const username = document.getElementById('targetUser').value;
                        if(username) onCallUser(username);
                    }}
                    className="btn"
                    style={{ background: 'var(--primary-color)', color: 'white', padding: '0.8rem 1.5rem', borderRadius: '2rem' }}
                >
                    Call 📞
                </button>
            </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '6rem' }}>
          <div className="glass-card" style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚡</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Instant Match</h3>
            <p style={{ color: 'var(--text-secondary)' }}>No scheduling. Just tap and talk to someone at your level immediately.</p>
          </div>
          <div className="glass-card" style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🤖</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>AI Phone Call</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Have a realistic voice conversation with our AI. It listens and speaks like a human.</p>
          </div>
          <div className="glass-card" style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📈</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Smart Tracking</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Save vocabulary during your calls and review them anytime to improve fluency.</p>
          </div>
        </div>

        {/* Testimonials Section */}
        <div style={{ marginTop: '8rem', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '3rem', fontWeight: 'bold' }}>What Learners Say 💬</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                
                <div className="glass-card" style={{ textAlign: 'left', padding: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#ddd6fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>👩‍🎓</div>
                        <div>
                            <div style={{ fontWeight: 'bold' }}>Sarah Chen</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>China 🇨🇳</div>
                        </div>
                    </div>
                    <p style={{ fontStyle: 'italic', color: 'var(--text-color)', lineHeight: '1.6' }}>
                        "I was terrified of speaking English. After use SpeakUp for 2 weeks, I can now have full conversations without freezing. The AI tutor is amazing!"
                    </p>
                </div>

                <div className="glass-card" style={{ textAlign: 'left', padding: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>👨‍💻</div>
                        <div>
                            <div style={{ fontWeight: 'bold' }}>Miguel Rodriguez</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Spain 🇪🇸</div>
                        </div>
                    </div>
                    <p style={{ fontStyle: 'italic', color: 'var(--text-color)', lineHeight: '1.6' }}>
                        "The random call feature is so fun. I met people from Japan and Brazil today. It's the best way to practice real listening."
                    </p>
                </div>

                <div className="glass-card" style={{ textAlign: 'left', padding: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🎨</div>
                        <div>
                            <div style={{ fontWeight: 'bold' }}>Yuki Tanaka</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Japan 🇯🇵</div>
                        </div>
                    </div>
                    <p style={{ fontStyle: 'italic', color: 'var(--text-color)', lineHeight: '1.6' }}>
                        "Finally an app that focuses on SPEAKING. I love saving words during the call to review later. 10/10 would recommend."
                    </p>
                </div>

            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
