import React, { useState } from 'react';

const Navbar = ({ username, onNavigate, onLogout }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav style={{
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--glass-border)',
            padding: '1rem 2rem',
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div 
                    onClick={() => { onNavigate('landing'); setIsOpen(false); }} 
                    style={{ 
                        cursor: 'pointer', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem',
                        fontSize: '1.5rem', 
                        fontWeight: 'bold',
                        background: 'linear-gradient(to right, #fff, #bdc8f0)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}
                >
                    SpeakUp 🎙️
                </div>

                {/* Desktop Menu */}
                <div className="desktop-menu" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span style={{ marginRight: '1rem', color: '#8b949e', fontSize: '0.9rem' }}>
                        Welcome, <span style={{ color: 'white', fontWeight: 'bold' }}>{username}</span>
                    </span>
                    
                    <button onClick={() => onNavigate('landing')} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>Dashboard</button>
                    <button onClick={() => onNavigate('vocabulary')} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>My Vocabulary</button>
                    <button onClick={onLogout} className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.3)' }}>Logout</button>
                </div>

                {/* Hamburger Icon */}
                <button 
                    className="mobile-toggle"
                    onClick={() => setIsOpen(!isOpen)}
                    style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer', display: 'none' }}
                >
                    ☰
                </button>
            </div>

            {/* Mobile Menu Dropdown */}
            {isOpen && (
                <div className="mobile-menu" style={{ 
                    marginTop: '1rem', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '1rem', 
                    padding: '1rem 0',
                    borderTop: '1px solid var(--glass-border)'
                }}>
                     <div style={{ color: '#8b949e', fontSize: '0.9rem', textAlign: 'center' }}>
                        Welcome, {username}
                    </div>
                    <button onClick={() => { onNavigate('landing'); setIsOpen(false); }} className="btn btn-secondary" style={{ width: '100%' }}>Dashboard</button>
                    <button onClick={() => { onNavigate('vocabulary'); setIsOpen(false); }} className="btn btn-secondary" style={{ width: '100%' }}>My Vocabulary</button>
                    <button onClick={() => { onLogout(); setIsOpen(false); }} className="btn" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.3)', width: '100%' }}>Logout</button>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
