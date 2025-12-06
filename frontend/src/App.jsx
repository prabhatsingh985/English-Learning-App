import React, { useState, useEffect, useRef } from 'react';
import LandingPage from './components/LandingPage';
import CallInterface from './components/CallInterface';
import Auth from './components/Auth';
import VocabularyList from './components/VocabularyList';
import AIChatInterface from './components/AIChatInterface';
import AICallInterface from './components/AICallInterface';
import { socket } from './services/socket';
import './index.css';

import Navbar from './components/Navbar';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [username, setUsername] = useState(localStorage.getItem('username'));
  
  const [appState, setAppState] = useState('landing'); 
  const [partnerId, setPartnerId] = useState(null);
  const [partnerUsername, setPartnerUsername] = useState(null);
  const [callEnded, setCallEnded] = useState(false);
  
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const audioRef = useRef(new Audio()); 

  // Direct Calling State
  const [incomingCall, setIncomingCall] = useState(null); // { callerUsername, callerSocketId }
  const [outgoingCallStatus, setOutgoingCallStatus] = useState(null); // 'calling', 'rejected'
  const [targetUser, setTargetUser] = useState(null);

  useEffect(() => {
    // If we have a token/username, connect to socket immediately for receiving calls
    if (token && username) {
        if (!socket.connected) {
            socket.connect();
        } else {
            // If already connected, register immediately
            socket.emit('register_user', username);
        }
    }

    socket.on('connect', () => {
      console.log('Connected to socket server');
      if (username) socket.emit('register_user', username);
    });

    socket.on('match_found', async ({ partnerId, partnerUsername, initiator }) => {
      console.log('Match found!', partnerId, partnerUsername);
      setIncomingCall(null);
      setOutgoingCallStatus(null);
      setPartnerId(partnerId);
      setPartnerUsername(partnerUsername);
      setAppState('connected');
      
      await setupWebRTC(initiator, partnerId);
    });

    socket.on('incoming_call', ({ callerUsername, callerSocketId }) => {
        setIncomingCall({ callerUsername, callerSocketId });
    });

    socket.on('call_rejected', () => {
        setOutgoingCallStatus('rejected');
        setTimeout(() => setOutgoingCallStatus(null), 3000); // Clear after 3s
    });

    socket.on('call_error', ({ message }) => {
       alert(message);
       setOutgoingCallStatus(null);
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
        setCallEnded(true);
        resetCall();
    });

    return () => {
      socket.off('connect');
      socket.off('match_found');
      socket.off('signal');
      socket.off('call_ended');
      socket.off('incoming_call');
      socket.off('call_rejected');
      socket.off('call_error');
    };
  }, [token, username]); // Re-run if auth changes

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
      socket.disconnect();
  };

  const startSearch = async () => {
    setAppState('searching');
    // Socket is already connected, but ensure we emit join
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

  const startDirectCall = async (targetUsername) => {
      if (!targetUsername) return;
      setTargetUser(targetUsername);
      setOutgoingCallStatus('calling');
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStreamRef.current = stream;
        
        socket.emit('call_user', { targetUsername, callerUsername: username });
      } catch (err) {
          console.error("Error accessing mic for direct call:", err);
          alert("Microphone access failed");
          setOutgoingCallStatus(null);
      }
  };

  const answerCall = async (accept) => {
      if (accept) {
          try {
              const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
              localStreamRef.current = stream;
              socket.emit('answer_call', { callerSocketId: incomingCall.callerSocketId, accepted: true });
          } catch (err) {
              console.error("Error accessing mic to answer:", err);
              alert("Microphone access failed");
              socket.emit('answer_call', { callerSocketId: incomingCall.callerSocketId, accepted: false });
              setIncomingCall(null);
          }
      } else {
          socket.emit('answer_call', { callerSocketId: incomingCall.callerSocketId, accepted: false });
          setIncomingCall(null);
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
    setIncomingCall(null);
    setOutgoingCallStatus(null);
    
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

  // Show Navbar everywhere except immersive Call mode (Full screen).
  // User requested Dashboard access from everywhere.
  // We'll show Navbar even in AI Call, just need to adjust the layout slightly.
  // connected (Video Call) might still benefit from full screen, but let's stick to user request.
  const showNavbar = appState !== 'connected';

  return (
    <div>
      {showNavbar && (
        <Navbar 
            username={username} 
            onNavigate={setAppState} 
            onLogout={handleLogout} 
        />
      )}

      {/* For full-screen modes that hide navbar, ensure they have their own exit button (they do: End Call) */}
      
      {appState === 'vocabulary' && <VocabularyList token={token} onClose={() => setAppState('landing')} />}
      {appState === 'ai-chat' && <AIChatInterface onEndSession={() => setAppState('landing')} />}
      {appState === 'ai-call' && <AICallInterface onEndCall={() => setAppState('landing')} />}
      {appState === 'landing' && (
        <LandingPage 
            onStart={startSearch} 
            onStartAI={() => setAppState('ai-chat')} 
            onStartAICall={() => setAppState('ai-call')} 
            onCallUser={startDirectCall}
        />
      )}

      {/* Incoming Call Modal */}
      {incomingCall && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(5px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 3000
        }}>
            <div className="glass-card" style={{ maxWidth: '400px', textAlign: 'center', padding: '2rem', animation: 'pulse 2s infinite' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📞</div>
                <h3 style={{ marginBottom: '0.5rem' }}>Incoming Call</h3>
                <p style={{ color: '#9ca3af', marginBottom: '2rem' }}>from {incomingCall.callerUsername}</p>
                
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button 
                        onClick={() => answerCall(true)} 
                        className="btn"
                        style={{ flex: 1, background: '#10b981', color: 'white' }}
                    >
                        Accept
                    </button>
                    <button 
                        onClick={() => answerCall(false)} 
                        className="btn"
                        style={{ flex: 1, background: '#ef4444', color: 'white' }}
                    >
                        Decline
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Outgoing Call Status Modal */}
      {outgoingCallStatus === 'calling' && (
           <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(5px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 3000
        }}>
            <div className="glass-card" style={{ maxWidth: '400px', textAlign: 'center', padding: '2rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📡</div>
                <h3 style={{ marginBottom: '0.5rem' }}>Calling {targetUser}...</h3>
                <p style={{ color: '#9ca3af', marginBottom: '2rem' }}>Waiting for them to answer.</p>
                <button 
                    onClick={() => { setOutgoingCallStatus(null); /* Ideally cancel on backend too */ }} 
                    className="btn"
                    style={{ background: '#6b7280', color: 'white' }}
                >
                    Cancel
                </button>
            </div>
        </div>
      )}

       {outgoingCallStatus === 'rejected' && (
           <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(5px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 3000
        }}>
            <div className="glass-card" style={{ maxWidth: '400px', textAlign: 'center', padding: '2rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
                <h3 style={{ marginBottom: '0.5rem' }}>Call Rejected</h3>
                <p style={{ color: '#9ca3af', marginBottom: '2rem' }}>{targetUser} is busy or declined.</p>
                <button 
                    onClick={() => setOutgoingCallStatus(null)} 
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                >
                    Close
                </button>
            </div>
        </div>
      )}


      {/* Custom Call Ended Modal */}
      {callEnded && (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(5px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 2000
        }}>
            <div className="glass-card" style={{ maxWidth: '400px', textAlign: 'center', padding: '2rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👋</div>
                <h3 style={{ marginBottom: '0.5rem' }}>Call Ended</h3>
                <p style={{ color: '#9ca3af', marginBottom: '2rem' }}>Your partner has disconnected.</p>
                <button 
                    onClick={() => setCallEnded(false)} 
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                >
                    Okay
                </button>
            </div>
        </div>
      )}
      
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
