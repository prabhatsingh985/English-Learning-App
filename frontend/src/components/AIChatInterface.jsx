import React, { useState, useRef, useEffect } from 'react';

const AIChatInterface = ({ onEndSession }) => {
    const [messages, setMessages] = useState([
        { id: 1, text: "Hi! I'm your AI practice partner. What would you like to talk about today?", sender: 'ai' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [autoSpeak, setAutoSpeak] = useState(false);
    const messagesEndRef = useRef(null);
    const recognitionRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Initialize Speech Recognition
    useEffect(() => {
        if ('webkitSpeechRecognition' in window) {
            const recognition = new window.webkitSpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onstart = () => setIsListening(true);
            recognition.onend = () => setIsListening(false);
            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInput(prev => prev + (prev ? ' ' : '') + transcript);
            };

            recognitionRef.current = recognition;
        }
    }, []);

    // Text to Speech Function
    const speak = (text) => {
        if (!autoSpeak) return;
        window.speechSynthesis.cancel(); // Stop current speech
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
    };

    const toggleListening = () => {
        if (!recognitionRef.current) return alert("Speech recognition not supported in this browser.");
        if (isListening) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { id: Date.now(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const history = messages.map(m => ({ text: m.text, sender: m.sender }));
            
            const response = await fetch('http://localhost:3000/api/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ message: userMessage.text, history })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                const aiMessage = { id: Date.now() + 1, text: data.text, sender: 'ai' };
                setMessages(prev => [...prev, aiMessage]);
                speak(data.text); // Speak the response
            } else {
                const errorText = data.message || "Sorry, I'm having trouble connecting right now.";
                setMessages(prev => [...prev, { id: Date.now() + 1, text: `Error: ${errorText}`, sender: 'ai' }]);
            }

        } catch (error) {
            console.error("AI Chat Error:", error);
            setMessages(prev => [...prev, { id: Date.now() + 1, text: "Error: Could not reach the server.", sender: 'ai' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column', paddingTop: '1rem', paddingBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '0 1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>🤖</span>
                    <h2 style={{ margin: 0 }}>AI Partner</h2>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                 <button 
                        onClick={() => {
                            const newState = !autoSpeak;
                            setAutoSpeak(newState);
                            if (!newState) window.speechSynthesis.cancel();
                        }} 
                        className="btn" 
                        style={{ background: autoSpeak ? 'var(--primary-color)' : '#666', color: 'white', padding: '0.5rem', fontSize: '1.2rem', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}
                        title={autoSpeak ? "Mute AI" : "Unmute AI"}
                    >
                        {autoSpeak ? "🔊" : "🔇"}
                    </button>
                    <button onClick={onEndSession} className="btn" style={{ background: '#ef4444', color: 'white', padding: '0.5rem 1rem', fontSize: '0.9rem' }}>End Session</button>
                </div>
            </div>

            <div className="glass-card" style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {messages.map((msg) => (
                    <div key={msg.id} style={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                        <div style={{ 
                            background: msg.sender === 'user' ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)', 
                            color: 'white', 
                            padding: '0.8rem 1.2rem', 
                            borderRadius: msg.sender === 'user' ? '1rem 1rem 0 1rem' : '1rem 1rem 1rem 0',
                            border: msg.sender === 'ai' ? '1px solid rgba(255,255,255,0.1)' : 'none'
                        }}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.1)', padding: '0.8rem 1.2rem', borderRadius: '1rem 1rem 1rem 0' }}>
                        <span className="pulse-anim" style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'white', marginRight: '4px' }}></span>
                        <span className="pulse-anim" style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'white', marginRight: '4px', animationDelay: '0.2s' }}></span>
                        <span className="pulse-anim" style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'white', animationDelay: '0.4s' }}></span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.5rem', padding: '0 1rem' }}>
                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    style={{ flex: 1, padding: '1rem', borderRadius: '2rem', border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', outline: 'none' }}
                />
                <button 
                    type="submit" 
                    disabled={loading || !input.trim()}
                    className="btn btn-primary"
                    style={{ borderRadius: '50%', width: '50px', height: '50px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    ➤
                </button>
            </form>
        </div>
    );
};

export default AIChatInterface;
