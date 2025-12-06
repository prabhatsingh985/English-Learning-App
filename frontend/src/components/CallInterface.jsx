import React, { useEffect, useState } from 'react';

const CallInterface = ({ status, onEndCall, socketId, partnerUsername }) => {
  const [topic, setTopic] = useState({ text: "Loading topic...", category: "General" });
  const [timer, setTimer] = useState(0);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [newWord, setNewWord] = useState('');
  const [saveStatus, setSaveStatus] = useState('');

  const fetchTopic = async () => {
    try {
        const response = await fetch('http://localhost:3000/api/topics/random');
        const data = await response.json();
        setTopic(data);
    } catch (error) {
        console.error("Error fetching topic:", error);
        setTopic({ text: "Could not load topic", category: "Error" });
    }
  };

  useEffect(() => {
    if (status === 'connected') {
      fetchTopic();
      setTimer(0);
      
      const interval = setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [status]);

  const handleQuickSave = async (e) => {
    e.preventDefault();
    if (!newWord.trim()) return;

    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/vocabulary', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify({ word: newWord, meaning: 'Saved from call' })
        });
        if (response.ok) {
            setSaveStatus('Saved!');
            setNewWord('');
            setTimeout(() => {
                setShowSaveModal(false);
                setSaveStatus('');
            }, 1000);
        }
    } catch (error) {
        console.error("Error saving word:", error);
        setSaveStatus('Error');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container" style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      
      <div className="glass-card" style={{ width: '100%', maxWidth: '600px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        
        {/* Background glow effect */}
        <div style={{ position: 'absolute', top: '-50%', left: '50%', transform: 'translate(-50%, 0)', width: '200px', height: '200px', background: 'var(--primary-color)', filter: 'blur(100px)', opacity: 0.2, zIndex: -1 }}></div>

        {status === 'searching' && (
          <div style={{ padding: '3rem 2rem' }}>
            <div className="pulse-anim" style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))', margin: '0 auto 2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
              🎙️
            </div>
            <h2 style={{ marginBottom: '0.5rem' }}>Finding a speaking partner...</h2>
            <p style={{ color: '#8b949e', marginBottom: '2rem' }}>Matching you with someone at your level.</p>
            <button onClick={onEndCall} className="btn btn-secondary">Cancel Search</button>
          </div>
        )}

        {status === 'connected' && (
          <div style={{ padding: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem', alignItems: 'center' }}>
               <div style={{ textAlign: 'center' }}>
                 <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>👤</div>
                 <h3 style={{ fontSize: '1.2rem', marginBottom: '0' }}>You</h3>
               </div>
               
               <div style={{ textAlign: 'center' }}>
                 <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'gradient(to right, #10b981, #3b82f6)', border: '2px solid var(--accent-color)', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>👋</div>
                 <h3 style={{ fontSize: '1.2rem', marginBottom: '0' }}>{partnerUsername || 'Partner'}</h3>
               </div>
            </div>

            <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '1rem', marginBottom: '2rem', border: '1px solid #334155', position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.2rem' }}>🎯</span>
                <span style={{ fontSize: '1rem', fontWeight: 'bold', color: '#fff' }}>Smart Topics</span>
              </div>
              
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1rem' }}>
                Never run out of things to say with our AI-curated conversation starters.
              </p>

              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '0.8rem', minHeight: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                 <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--accent-color)', marginBottom: '0.5rem' }}>{topic.category}</p>
                 <p style={{ fontSize: '1.1rem', fontWeight: '500', lineHeight: '1.4', color: '#e2e8f0' }}>"{topic.text}"</p>
              </div>

              <button 
                onClick={fetchTopic} 
                className="btn-icon"
                style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem', opacity: 0.7 }} 
                title="Next Topic"
              >
                🔄
              </button>
            </div>

            <div style={{ fontSize: '2.5rem', fontFamily: 'monospace', fontWeight: 'bold', marginBottom: '2rem', color: '#e6edf3' }}>
              {formatTime(timer)}
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn btn-secondary" style={{ width: '50px', height: '50px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎤</button>
              <button 
                onClick={() => setShowSaveModal(true)} 
                className="btn btn-secondary" 
                style={{ width: '50px', height: '50px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}
                title="Save Word"
              >
                💾
              </button>
              <button onClick={onEndCall} className="btn" style={{ background: '#ef4444', color: 'white', padding: '0.8rem 2.5rem' }}>End Call</button>
            </div>
            
            {showSaveModal && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}>
                    <div className="glass-card" style={{ padding: '2rem', width: '90%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <h3>Quick Save Word</h3>
                        <input 
                            type="text" 
                            value={newWord} 
                            onChange={(e) => setNewWord(e.target.value)} 
                            placeholder="Type word..."
                            autoFocus
                            style={{ padding: '0.8rem', borderRadius: '0.5rem', border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white' }}
                        />
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <button onClick={() => setShowSaveModal(false)} className="btn btn-secondary">Cancel</button>
                            <button onClick={handleQuickSave} className="btn btn-primary">{saveStatus || 'Save'}</button>
                        </div>
                    </div>
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CallInterface;
