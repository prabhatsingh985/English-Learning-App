import React, { useState } from 'react';

const Navbar = ({ username, onNavigate, onLogout, currentTheme, onToggleTheme }) => {
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
                    className="brand-logo"
                    style={{ 
                        cursor: 'pointer', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem',
                    }}
                >
                    SpeakUp 🎙️
                </div>

                {/* Desktop Menu */}
                <div className="desktop-menu" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span style={{ marginRight: '1rem', color: 'var(--text-color)', fontSize: '0.9rem' }}>
                        Welcome, <span style={{ fontWeight: 'bold' }}>{username}</span>
                    </span>
                    
                    <button onClick={() => onNavigate('landing')} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>Dashboard</button>
                    <button onClick={() => onNavigate('vocabulary')} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>My Vocabulary</button>
                    
                    {/* Theme Toggle */}
                    <button 
                        onClick={onToggleTheme} 
                        className="btn btn-secondary" 
                        style={{ padding: '0.5rem', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        title="Toggle Theme"
                    >
                        {currentTheme === 'dark' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="5"></circle>
                                <line x1="12" y1="1" x2="12" y2="3"></line>
                                <line x1="12" y1="21" x2="12" y2="23"></line>
                                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                                <line x1="1" y1="12" x2="3" y2="12"></line>
                                <line x1="21" y1="12" x2="23" y2="12"></line>
                                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                            </svg>
                        )}
                    </button>

                    <button onClick={onLogout} className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', background: 'var(--danger-bg)', color: 'var(--danger-text)', border: '1px solid var(--danger-border)' }}>Logout</button>
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
                    <button onClick={() => { onLogout(); setIsOpen(false); }} className="btn" style={{ background: 'var(--danger-bg)', color: 'var(--danger-text)', border: '1px solid var(--danger-border)', width: '100%' }}>Logout</button>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
