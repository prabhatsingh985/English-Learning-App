import React from 'react';

const Footer = () => {
    return (
        <footer style={{ 
            marginTop: 'auto', 
            padding: '2rem 0', 
            borderTop: '1px solid var(--glass-border)',
            textAlign: 'center',
            color: '#8b949e',
            fontSize: '0.9rem'
        }}>
            <div className="container">
                <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center', gap: '2rem' }}>
                    <a href="#" style={{ color: '#8b949e', textDecoration: 'none' }}>About</a>
                    <a href="#" style={{ color: '#8b949e', textDecoration: 'none' }}>Privacy</a>
                    <a href="#" style={{ color: '#8b949e', textDecoration: 'none' }}>Terms</a>
                    <a href="#" style={{ color: '#8b949e', textDecoration: 'none' }}>Contact</a>
                </div>
                <p>&copy; {new Date().getFullYear()} SpeakUp. All rights reserved.</p>
                <div style={{ marginTop: '0.5rem', opacity: 0.6 }}>
                    Made with ❤️ for English Learners
                </div>
            </div>
        </footer>
    );
};

export default Footer;
