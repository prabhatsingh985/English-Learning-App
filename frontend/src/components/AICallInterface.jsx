import React, { useState, useEffect, useRef } from 'react';

const AICallInterface = ({ onEndCall }) => {
    const [status, setStatus] = useState('initializing'); // initializing, listening, processing, speaking
    const [messages, setMessages] = useState([]);
    const recognitionRef = useRef(null);
    const [avatarScale, setAvatarScale] = useState(1);
    
    // Voice Settings
    const [voices, setVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState(null);
    const [showVoiceSettings, setShowVoiceSettings] = useState(false);

    // Initialize Voices
    useEffect(() => {
        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            setVoices(availableVoices);
            // Default to first English voice if available, or just the first voice
            const defaultVoice = availableVoices.find(v => v.lang.includes('en-US')) || availableVoices[0];
            setSelectedVoice(defaultVoice);
        };

        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }, []);

    // Initialize Call
    useEffect(() => {
        // Wait for voices to load briefly, but don't block
        setTimeout(() => {
            const initialGreeting = "Hello! I'm listening. What's on your mind?";
            setMessages([{ role: 'model', text: initialGreeting }]);
            speak(initialGreeting);
        }, 500);
    }, []);

    // Speech Recognition Setup
    useEffect(() => {
        if ('webkitSpeechRecognition' in window) {
            const recognition = new window.webkitSpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onstart = () => setStatus('listening');
            recognition.onend = () => {}; // Loop handled in logic
            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                if (transcript.trim()) handleUserMessage(transcript);
            };

            recognitionRef.current = recognition;
        } else {
            alert("Your browser does not support voice calls.");
            onEndCall();
        }
    }, []);

    // Animation logic
    useEffect(() => {
        let interval;
        if (status === 'speaking' || status === 'listening') {
            interval = setInterval(() => setAvatarScale(prev => prev === 1 ? 1.1 : 1), 500);
        } else {
            setAvatarScale(1);
        }
        return () => clearInterval(interval);
    }, [status]);

    const startListening = () => {
        try {
            if (recognitionRef.current && status !== 'listening') {
                recognitionRef.current.start();
            }
        } catch (e) {
            console.log("Mic error", e);
        }
    };

    const speak = (text) => {
        setStatus('speaking');
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        if (selectedVoice) utterance.voice = selectedVoice;
        
        utterance.onend = () => {
            setStatus('listening');
            setTimeout(() => startListening(), 500);
        };

        window.speechSynthesis.speak(utterance);
    };

    const handleUserMessage = async (text) => {
        setStatus('processing');
        const newMessages = [...messages, { role: 'user', text }];
        setMessages(newMessages);

        try {
            const token = localStorage.getItem('token');
            const historyPayload = newMessages.map(m => ({ 
                text: m.text, 
                sender: m.role === 'user' ? 'user' : 'ai' 
            }));

            const response = await fetch('http://localhost:3000/api/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ message: text, history: historyPayload })
            });

            const data = await response.json();

            if (response.ok) {
                const aiText = data.text;
                setMessages(prev => [...prev, { role: 'model', text: aiText }]);
                speak(aiText);
            } else {
                speak("Sorry, connection trouble.");
                setStatus('listening');
            }
        } catch (error) {
            speak("I lost connection.");
            setTimeout(onEndCall, 3000);
        }
    };

    return (
        <div style={{ 
            height: '100vh', 
            background: 'linear-gradient(135deg, #1e1e24, #2a2a35)', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'white',
            position: 'relative'
        }}>
            {/* Voice Settings Button */}
            <div style={{ position: 'absolute', top: '2rem', right: '2rem', zIndex: 10 }}>
                <button 
                    onClick={() => setShowVoiceSettings(!showVoiceSettings)}
                    className="btn"
                    style={{ background: 'rgba(255,255,255,0.1)', padding: '0.5rem', borderRadius: '50%', width: '40px', height: '40px' }}
                >
                    ⚙️
                </button>
                {showVoiceSettings && (
                    <div className="glass-card" style={{ 
                        position: 'absolute', 
                        top: '50px', 
                        right: '0', 
                        width: '250px',
                        padding: '1rem',
                        zIndex: 20,
                        background: 'rgba(30, 30, 36, 0.95)'
                    }}>
                        <h4 style={{ margin: '0 0 1rem 0' }}>Select Voice</h4>
                        <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {voices.filter(v => v.lang.includes('en')).map(voice => (
                                <button
                                    key={voice.name}
                                    onClick={() => {
                                        setSelectedVoice(voice);
                                        setShowVoiceSettings(false);
                                        speak(`Hello, I am speaking with the ${voice.name} accent.`);
                                    }}
                                    style={{
                                        background: selectedVoice?.name === voice.name ? 'var(--primary-color)' : 'transparent',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        color: 'white',
                                        padding: '0.5rem',
                                        textAlign: 'left',
                                        fontSize: '0.8rem',
                                        cursor: 'pointer',
                                        borderRadius: '0.5rem'
                                    }}
                                >
                                    {voice.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div style={{ position: 'absolute', top: '2rem', fontSize: '1.2rem', opacity: 0.7 }}>
                {status === 'listening' && "I'm listening..."}
                {status === 'processing' && "Thinking..."}
                {status === 'speaking' && "Speaking..."}
            </div>

            <div style={{
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                background: status === 'listening' ? '#ef4444' : 'var(--primary-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '5rem',
                boxShadow: `0 0 ${status === 'speaking' ? '50px' : '20px'} var(--primary-color)`,
                transition: 'all 0.5s ease',
                transform: `scale(${avatarScale})`
            }}>
                {status === 'processing' ? '💭' : '🤖'}
            </div>

            <div style={{ position: 'absolute', bottom: '3rem', display: 'flex', gap: '2rem' }}>
                <button 
                    onClick={() => {
                        window.speechSynthesis.cancel();
                        onEndCall();
                    }}
                    className="btn"
                    style={{ 
                        background: '#ef4444', 
                        width: '60px', 
                        height: '60px', 
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)'
                    }}
                >
                    📞
                </button>
            </div>
        </div>
    );
};

export default AICallInterface;
