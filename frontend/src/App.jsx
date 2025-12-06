import React, { useState, useEffect, useRef } from 'react';
import LandingPage from './components/LandingPage';
import CallInterface from './components/CallInterface';
import Auth from './components/Auth';
import VocabularyList from './components/VocabularyList';
import AIChatInterface from './components/AIChatInterface';
import AICallInterface from './components/AICallInterface';
import { socket } from './services/socket';
import './index.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [username, setUsername] = useState(localStorage.getItem('username'));
  
  const [appState, setAppState] = useState('landing'); 
  const [partnerId, setPartnerId] = useState(null);
  const [partnerUsername, setPartnerUsername] = useState(null);
  
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const audioRef = useRef(new Audio()); 

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    socket.on('match_found', async ({ partnerId, partnerUsername, initiator }) => {
      console.log('Match found!', partnerId, partnerUsername);
      setPartnerId(partnerId);
      setPartnerUsername(partnerUsername);
      setAppState('connected');
      
      await setupWebRTC(initiator, partnerId);
    });

    socket.on('signal', async ({ sender, signal }) => {
      if (!peerConnectionRef.current) return;

      if (signal.type === 'offer') {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(signal));
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);
        socket.emit('signal', { target: sender, signal: answer });
      } else if (signal.type === 'answer') {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(signal));
      } else if (signal.candidate) {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(signal.candidate));
      }
    });

    socket.on('call_ended', () => {
        alert("Partner ended the call.");
        resetCall();
    });

    return () => {
      socket.off('connect');
      socket.off('match_found');
      socket.off('signal');
      socket.off('call_ended');
    };
  }, []);

  const handleLogin = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('username', data.username);
    setToken(data.token);
    setUsername(data.username);
  };

  const handleLogout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      setToken(null);
      setUsername(null);
      setAppState('landing');
  };

  const startSearch = async () => {
    setAppState('searching');
    socket.connect();
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      socket.emit('join_queue', { interests: ['general'], username });
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone.");
      setAppState('landing');
    }
  };

  const setupWebRTC = async (initiator, partnerId) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
      ]
    });
    
    peerConnectionRef.current = pc;

    localStreamRef.current.getTracks().forEach(track => {
      pc.addTrack(track, localStreamRef.current);
    });

    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      remoteStreamRef.current = remoteStream;
      audioRef.current.srcObject = remoteStream;
      audioRef.current.play().catch(e => console.error("Audio play error", e));
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('signal', {
            target: partnerId,
            signal: { candidate: event.candidate }
        });
      }
    };

    if (initiator) {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit('signal', { target: partnerId, signal: offer });
    }
  };

  const resetCall = () => {
    setAppState('landing');
    setPartnerId(null);
    setPartnerUsername(null);
    
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    
    if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
    }
  };

  const endCall = () => {
    socket.emit('end_call'); // Notify server
    resetCall();
  };

  if (!token) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div>
        <div style={{ position: 'absolute', top: '2rem', right: '2rem', zIndex: 100, display: 'flex', gap: '1rem', alignItems: 'center' }}>
             <span style={{ fontWeight: 'bold' }}>Hello, {username}</span>
             <button onClick={() => setAppState('vocabulary')} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>My Vocabulary</button>
             <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Logout</button>
        </div>

      {appState === 'vocabulary' && <VocabularyList token={token} onClose={() => setAppState('landing')} />}
      {appState === 'ai-chat' && <AIChatInterface onEndSession={() => setAppState('landing')} />}
      {appState === 'ai-call' && <AICallInterface onEndCall={() => setAppState('landing')} />}
      {appState === 'landing' && <LandingPage onStart={startSearch} onStartAI={() => setAppState('ai-chat')} onStartAICall={() => setAppState('ai-call')} />}
      {(appState === 'searching' || appState === 'connected') && (
        <CallInterface 
            status={appState} 
            onEndCall={endCall} 
            socketId={socket.id} 
            partnerId={partnerId}
            partnerUsername={partnerUsername}
        />
      )}
    </div>
  );
}

export default App;
