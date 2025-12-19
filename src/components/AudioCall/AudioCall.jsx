import React, { useState, useEffect, useRef } from 'react';
import './AudioCall.css';

const AudioCall = ({ 
  isOpen, 
  onClose, 
  user, 
  currentUser,
  callType,
  onAccept,
  onDecline,
  callId,
  socket
}) => {
  const [callStatus, setCallStatus] = useState('connecting');
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [connectionQuality, setConnectionQuality] = useState('good');
  const [finalDuration, setFinalDuration] = useState(0);
  
  const localAudioRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const callTimerRef = useRef(null);
  const ringtoneRef = useRef(null);
  const callStartTimeRef = useRef(null);
  const missedCallTimeoutRef = useRef(null);
  const iceCandidatesQueueRef = useRef([]);
  const isInitiatorRef = useRef(false);
  
  // Store user info in ref to avoid null issues
  const userRef = useRef(user);
  const currentUserRef = useRef(currentUser);
  
  // Update refs when props change
  useEffect(() => {
    userRef.current = user;
    currentUserRef.current = currentUser;
  }, [user, currentUser]);

  // ✅ FIXED: WebRTC Configuration with multiple STUN servers
  const rtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' },
    ],
    iceCandidatePoolSize: 10
  };

  // Format call duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // ============================================
  // WEBRTC SETUP FUNCTIONS - FIXED
  // ============================================

  // ✅ FIXED: Initialize audio stream with better constraints
  const initializeAudioStream = async () => {
    try {
      console.log('🎤 Requesting microphone access...');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
          channelCount: 1
        },
        video: false
      });
      
      localStreamRef.current = stream;
      
      // ✅ CRITICAL: Attach to audio element immediately
      if (localAudioRef.current) {
        localAudioRef.current.srcObject = stream;
        localAudioRef.current.volume = 0;
      }
      
      console.log('✅ Microphone access granted');
      console.log('🎵 Audio tracks:', stream.getAudioTracks().map(t => ({
        id: t.id,
        label: t.label,
        enabled: t.enabled,
        muted: t.muted
      })));
      
      return stream;
    } catch (error) {
      console.error('❌ Error accessing microphone:', error);
      alert(`Microphone error: ${error.message}\n\nPlease check:\n1. Microphone permissions\n2. No other app is using it\n3. Browser has access`);
      return null;
    }
  };

  // ✅ FIXED: Create peer connection with proper event handlers
  const createPeerConnection = () => {
    try {
      console.log('🔧 Creating peer connection...');
      const pc = new RTCPeerConnection(rtcConfig);
      
      // ✅ CRITICAL: Add local stream tracks FIRST
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          pc.addTrack(track, localStreamRef.current);
          console.log('➕ Added local track:', track.kind, track.id);
        });
      }

      // ✅ FIXED: Handle incoming remote stream
      pc.ontrack = (event) => {
        console.log('📥 Received remote track:', event.track.kind, event.track.id);
        console.log('📥 Remote streams count:', event.streams.length);
        
        if (event.streams && event.streams[0]) {
          const remoteStream = event.streams[0];
          
          if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = remoteStream;
            remoteAudioRef.current.volume = 1.0;
            
            // ✅ Force play
            remoteAudioRef.current.play().then(() => {
              console.log('✅ Remote audio playing');
            }).catch(e => {
              console.error('❌ Remote audio play error:', e);
            });
          }
          
          console.log('🎵 Remote audio tracks:', remoteStream.getAudioTracks().map(t => ({
            id: t.id,
            label: t.label,
            enabled: t.enabled,
            muted: t.muted
          })));
        }
      };

      // ✅ FIXED: Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('🧊 Generated ICE candidate:', event.candidate.type);
          
          if (socket && userRef.current?._id) {
            socket.emit('audio:webrtc:ice-candidate', {
              callId,
              targetUserId: userRef.current._id,
              candidate: event.candidate.toJSON()
            });
            console.log('📡 Sent ICE candidate to peer');
          }
        } else {
          console.log('✅ ICE gathering complete');
        }
      };

      // ✅ Monitor connection state
      pc.onconnectionstatechange = () => {
        console.log('🔗 Connection state:', pc.connectionState);
        
        if (pc.connectionState === 'connected') {
          console.log('✅ WebRTC peer connection established!');
          setConnectionQuality('good');
        } else if (pc.connectionState === 'failed') {
          console.error('❌ WebRTC connection failed');
          setConnectionQuality('poor');
          alert('Connection failed. Please check your internet and try again.');
        } else if (pc.connectionState === 'disconnected') {
          console.warn('⚠️ WebRTC disconnected');
          setConnectionQuality('poor');
        }
      };

      // ✅ Monitor ICE connection state
      pc.oniceconnectionstatechange = () => {
        console.log('🧊 ICE connection state:', pc.iceConnectionState);
        
        if (pc.iceConnectionState === 'failed') {
          console.error('❌ ICE connection failed - restarting ICE');
          pc.restartIce();
        }
      };

      // ✅ Monitor signaling state
      pc.onsignalingstatechange = () => {
        console.log('📡 Signaling state:', pc.signalingState);
      };

      peerConnectionRef.current = pc;
      console.log('✅ Peer connection created successfully');
      return pc;
    } catch (error) {
      console.error('❌ Error creating peer connection:', error);
      return null;
    }
  };

  // ✅ FIXED: Create and send WebRTC offer (for CALLER ONLY)
  const createOffer = async () => {
    try {
      const pc = peerConnectionRef.current;
      const targetUser = userRef.current;
      
      if (!pc) {
        console.error('❌ Cannot create offer: no peer connection');
        return;
      }
      
      if (!targetUser?._id) {
        console.error('❌ Cannot create offer: user not available');
        return;
      }

      console.log('📤 Creating WebRTC offer...');
      
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        voiceActivityDetection: true
      });
      
      await pc.setLocalDescription(offer);
      console.log('✅ Local description set (offer)');
      console.log('📋 Offer SDP:', offer.sdp.substring(0, 100) + '...');

      // Send offer to receiver
      socket.emit('audio:webrtc:offer', {
        callId,
        receiverId: targetUser._id,
        offer: offer
      });
      console.log('📡 Offer sent to receiver:', targetUser._id);
    } catch (error) {
      console.error('❌ Error creating offer:', error);
      alert('Failed to create call offer. Please try again.');
    }
  };

  // ✅ FIXED: Handle incoming WebRTC offer (for RECEIVER)
  const handleOffer = async (offer) => {
    try {
      const pc = peerConnectionRef.current;
      if (!pc) {
        console.error('❌ No peer connection to handle offer');
        return;
      }

      console.log('📥 Received WebRTC offer');
      console.log('📋 Offer SDP:', offer.sdp.substring(0, 100) + '...');
      
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      console.log('✅ Remote description set (offer)');

      // ✅ Process queued ICE candidates AFTER setting remote description
      console.log(`🧊 Processing ${iceCandidatesQueueRef.current.length} queued ICE candidates...`);
      while (iceCandidatesQueueRef.current.length > 0) {
        const candidate = iceCandidatesQueueRef.current.shift();
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
          console.log('✅ Added queued ICE candidate');
        } catch (e) {
          console.error('❌ Error adding queued ICE candidate:', e);
        }
      }

      // ✅ Create and send answer
      console.log('📤 Creating WebRTC answer...');
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      console.log('✅ Local description set (answer)');
      console.log('📋 Answer SDP:', answer.sdp.substring(0, 100) + '...');

      const targetUser = userRef.current;
      if (!targetUser?._id) {
        console.error('❌ Cannot send answer: user not available');
        return;
      }

      socket.emit('audio:webrtc:answer', {
        callId,
        callerId: targetUser._id,
        answer: answer
      });
      console.log('📡 Answer sent to caller:', targetUser._id);
    } catch (error) {
      console.error('❌ Error handling offer:', error);
      alert('Failed to handle call offer. Please try again.');
    }
  };

  // ✅ FIXED: Handle incoming WebRTC answer (for CALLER)
  const handleAnswer = async (answer) => {
    try {
      const pc = peerConnectionRef.current;
      if (!pc) {
        console.error('❌ No peer connection to handle answer');
        return;
      }

      console.log('📥 Received WebRTC answer');
      console.log('📋 Answer SDP:', answer.sdp.substring(0, 100) + '...');
      
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
      console.log('✅ Remote description set (answer)');

      // ✅ Process queued ICE candidates AFTER setting remote description
      console.log(`🧊 Processing ${iceCandidatesQueueRef.current.length} queued ICE candidates...`);
      while (iceCandidatesQueueRef.current.length > 0) {
        const candidate = iceCandidatesQueueRef.current.shift();
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
          console.log('✅ Added queued ICE candidate');
        } catch (e) {
          console.error('❌ Error adding queued ICE candidate:', e);
        }
      }
    } catch (error) {
      console.error('❌ Error handling answer:', error);
      alert('Failed to complete call connection. Please try again.');
    }
  };

  // ✅ FIXED: Handle incoming ICE candidate
  const handleIceCandidate = async (candidate) => {
    try {
      const pc = peerConnectionRef.current;
      if (!pc) {
        console.error('❌ No peer connection for ICE candidate');
        return;
      }

      if (pc.remoteDescription && pc.remoteDescription.type) {
        // Remote description is set, add candidate immediately
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
        console.log('✅ ICE candidate added immediately');
      } else {
        // Queue ICE candidates until remote description is set
        iceCandidatesQueueRef.current.push(candidate);
        console.log('📦 ICE candidate queued (waiting for remote description)');
      }
    } catch (error) {
      console.error('❌ Error adding ICE candidate:', error);
    }
  };

  // ============================================
  // SOCKET.IO WEBRTC SIGNALING LISTENERS
  // ============================================

  useEffect(() => {
    if (!socket) return;

    const handleWebRTCOffer = (data) => {
      console.log('📨 WebRTC offer received from:', data.senderId);
      handleOffer(data.offer);
    };

    const handleWebRTCAnswer = (data) => {
      console.log('📨 WebRTC answer received from:', data.senderId);
      handleAnswer(data.answer);
    };

    const handleWebRTCIceCandidate = (data) => {
      console.log('📨 ICE candidate received from:', data.senderId);
      handleIceCandidate(data.candidate);
    };

    socket.on('audio:webrtc:offer', handleWebRTCOffer);
    socket.on('audio:webrtc:answer', handleWebRTCAnswer);
    socket.on('audio:webrtc:ice-candidate', handleWebRTCIceCandidate);

    return () => {
      socket.off('audio:webrtc:offer', handleWebRTCOffer);
      socket.off('audio:webrtc:answer', handleWebRTCAnswer);
      socket.off('audio:webrtc:ice-candidate', handleWebRTCIceCandidate);
    };
  }, [socket, callId]);

  // ============================================
  // OTHER FUNCTIONS
  // ============================================

  const playRingtone = () => {
    if (ringtoneRef.current) {
      ringtoneRef.current.loop = true;
      ringtoneRef.current.play().catch(e => console.log('Ringtone play error:', e));
      console.log('🔔 Ringtone playing');
    }
  };

  const stopRingtone = () => {
    if (ringtoneRef.current) {
      ringtoneRef.current.pause();
      ringtoneRef.current.currentTime = 0;
      console.log('🔕 Ringtone stopped');
    }
  };

  const startCallTimer = () => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
    }
    
    callStartTimeRef.current = Date.now();
    setCallDuration(0);
    
    callTimerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    
    console.log('⏱️ Call timer started');
  };

  const stopCallTimer = () => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
      console.log('⏱️ Call timer stopped');
    }
  };

  const clearMissedCallTimeout = () => {
    if (missedCallTimeoutRef.current) {
      clearTimeout(missedCallTimeoutRef.current);
      missedCallTimeoutRef.current = null;
      console.log('⏰ Missed call timeout cleared');
    }
  };

  // ============================================
  // SOCKET.IO CALL STATUS LISTENERS
  // ============================================

  useEffect(() => {
    if (!socket) return;

    const handleCallAccepted = async (data) => {
      console.log('✅ Call accepted event received!', data);
      
      clearMissedCallTimeout();
      stopRingtone();
      setCallStatus('active');
      startCallTimer();

      // ✅ CALLER initializes WebRTC
      if (callType === 'outgoing') {
        console.log('🎤 CALLER: Setting up WebRTC after acceptance...');
        isInitiatorRef.current = true;
        
        const stream = await initializeAudioStream();
        if (stream) {
          createPeerConnection();
          
          // ✅ Wait for peer connection to be ready, then create offer
          setTimeout(() => {
            createOffer();
          }, 500);
        }
      }
    };

    const handleCallEnded = (data) => {
      console.log('📞 Call ended event received!', data);
      
      clearMissedCallTimeout();
      stopRingtone();
      stopCallTimer();
      
      const duration = data.duration || 0;
      setFinalDuration(duration);
      setCallStatus('ended');
      
      // Cleanup
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      
      setTimeout(() => {
        onClose();
      }, 2000);
    };

    const handleCallDeclined = (data) => {
      console.log('❌ Call declined event received!', data);
      
      clearMissedCallTimeout();
      stopRingtone();
      setCallStatus('declined');
      setFinalDuration(0);
      
      setTimeout(() => {
        onClose();
      }, 1500);
    };

    const handleCallMissed = (data) => {
      console.log('📵 Call missed event received!', data);
      
      clearMissedCallTimeout();
      stopRingtone();
      
      if (data.callType === 'outgoing') {
        setCallStatus('no-answer');
      } else {
        setCallStatus('missed');
      }
      
      setFinalDuration(0);
      
      setTimeout(() => {
        onClose();
      }, 2000);
    };

    socket.on('audio:call:accepted', handleCallAccepted);
    socket.on('audio:call:ended', handleCallEnded);
    socket.on('audio:call:declined', handleCallDeclined);
    socket.on('audio:call:missed', handleCallMissed);

    return () => {
      socket.off('audio:call:accepted', handleCallAccepted);
      socket.off('audio:call:ended', handleCallEnded);
      socket.off('audio:call:declined', handleCallDeclined);
      socket.off('audio:call:missed', handleCallMissed);
    };
  }, [socket, callType, onClose]);

  // ============================================
  // INCOMING CALL SETUP
  // ============================================

  useEffect(() => {
    if (isOpen && callType === 'incoming') {
      console.log('📞 Incoming call - setting status to ringing');
      setCallStatus('ringing');
      playRingtone();
      
      missedCallTimeoutRef.current = setTimeout(() => {
        console.log('⏰ Call timeout - auto declining');
        handleDecline();
      }, 30000);
    }
  }, [isOpen, callType]);

  // ============================================
  // OUTGOING CALL SETUP
  // ============================================

  useEffect(() => {
    if (isOpen && callType === 'outgoing') {
      console.log('📞 Outgoing call - setting status to connecting');
      setCallStatus('connecting');
      playRingtone();
      isInitiatorRef.current = true; // Mark as initiator
      
      missedCallTimeoutRef.current = setTimeout(() => {
        console.log('⏰ No answer - ending call');
        endCall();
      }, 30000);
    }
  }, [isOpen, callType]);

  // ============================================
  // ACCEPT CALL (FOR RECEIVER)
  // ============================================

  const handleAccept = async () => {
    console.log('✅ User accepted call - setting up WebRTC...');
    
    clearMissedCallTimeout();
    stopRingtone();
    
    // ✅ Initialize audio stream FIRST
    const stream = await initializeAudioStream();
    
    if (stream) {
      // Update status immediately
      setCallStatus('active');
      startCallTimer();
      
      // ✅ RECEIVER sets up WebRTC
      console.log('🎤 RECEIVER: Setting up WebRTC...');
      isInitiatorRef.current = false; // Not the initiator
      createPeerConnection();
      
      // Notify server
      if (socket && callId) {
        console.log('📡 Emitting audio:call:accept to server');
        socket.emit('audio:call:accept', { callId });
      }
      
      if (onAccept) {
        onAccept();
      }
    }
  };

  // ============================================
  // DECLINE CALL
  // ============================================

  const handleDecline = () => {
    console.log('❌ User declined call');
    
    clearMissedCallTimeout();
    stopRingtone();
    
    if (socket && callId) {
      console.log('📡 Emitting audio:call:decline to server');
      socket.emit('audio:call:decline', { 
        callId, 
        reason: 'Call declined' 
      });
    }
    
    setCallStatus('ended');
    setFinalDuration(0);
    
    setTimeout(() => {
      if (onDecline) {
        onDecline();
      }
      onClose();
    }, 1000);
  };

  // ============================================
  // END CALL
  // ============================================

  const endCall = () => {
    console.log('📞 Ending call with callId:', callId);
    
    clearMissedCallTimeout();
    stopRingtone();
    stopCallTimer();
    
    const duration = callStartTimeRef.current 
      ? Math.floor((Date.now() - callStartTimeRef.current) / 1000)
      : 0;
    
    setFinalDuration(duration);
    
    // Stop all audio tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('🛑 Stopped audio track');
      });
      localStreamRef.current = null;
    }
    
    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    
    setCallStatus('ended');
    
    if (socket && callId) {
      console.log('📡 Emitting audio:call:end to server');
      socket.emit('audio:call:end', { 
        callId: callId,
        duration: duration
      });
    }
    
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  // ============================================
  // TOGGLE MUTE
  // ============================================

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
        console.log(audioTrack.enabled ? '🔊 Unmuted' : '🔇 Muted');
      }
    }
  };

  // ============================================
  // TOGGLE SPEAKER
  // ============================================

  const toggleSpeaker = () => {
    setIsSpeaker(!isSpeaker);
    console.log(isSpeaker ? '🔈 Speaker off' : '🔊 Speaker on');
    
    // ✅ Adjust remote audio volume
    if (remoteAudioRef.current) {
      remoteAudioRef.current.volume = isSpeaker ? 0.5 : 1.0;
    }
  };

  // ============================================
  // CLEANUP ON UNMOUNT
  // ============================================

  useEffect(() => {
    return () => {
      console.log('🧹 Cleaning up AudioCall component');
      clearMissedCallTimeout();
      stopRingtone();
      stopCallTimer();
      
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, []);

  if (!isOpen) return null;

  const displayUser = userRef.current || user;
  const displayCurrentUser = currentUserRef.current || currentUser;

  return (
    <>
      {/* ✅ CRITICAL: Local audio (muted for user, but sent to peer) */}
      <audio ref={localAudioRef} autoPlay muted playsInline />
      
      {/* ✅ CRITICAL: Remote audio (what you hear from the other person) */}
      <audio ref={remoteAudioRef} autoPlay playsInline />
      
      {/* Ringtone */}
      <audio ref={ringtoneRef} src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" />

      <div className="audio-call-overlay">
        <div className="audio-call-modal">
          
          <div className="call-header">
            <div className="call-header-info">
              {callStatus === 'ringing' && callType === 'incoming' && (
                <span className="call-status-text">Incoming audio call...</span>
              )}
              {callStatus === 'connecting' && (
                <span className="call-status-text">Ringing...</span>
              )}
              {callStatus === 'active' && (
                <span className="call-duration">{formatDuration(callDuration)}</span>
              )}
              {callStatus === 'ended' && finalDuration > 0 && (
                <span className="call-status-text">Call ended • {formatDuration(finalDuration)}</span>
              )}
              {callStatus === 'ended' && finalDuration === 0 && (
                <span className="call-status-text">Call ended</span>
              )}
              {callStatus === 'declined' && (
                <span className="call-status-text">Call declined</span>
              )}
              {callStatus === 'missed' && (
                <span className="call-status-text">Missed call</span>
              )}
            </div>
            
            {connectionQuality === 'poor' && callStatus === 'active' && (
              <div className="connection-warning">
                <span className="warning-icon">⚠️</span>
                <span className="warning-text">Poor connection</span>
              </div>
            )}
          </div>

          <div className="call-user-section">
            <div className="call-avatar-container">
              <img 
                src={displayUser?.avatar?.url || `https://ui-avatars.com/api/?name=${displayUser?.firstName}+${displayUser?.lastName}&background=1877f2&color=fff&size=200`}
                alt={`${displayUser?.firstName} ${displayUser?.lastName}`}
                className="call-avatar"
              />
              
              {(callStatus === 'ringing' || callStatus === 'connecting') && (
                <div className="call-pulse-ring"></div>
              )}
              
              {callStatus === 'active' && !isMuted && (
                <div className="audio-wave-animation">
                  <div className="wave-bar"></div>
                  <div className="wave-bar"></div>
                  <div className="wave-bar"></div>
                  <div className="wave-bar"></div>
                </div>
              )}
            </div>
            
            <h2 className="call-user-name">
              {displayUser?.firstName} {displayUser?.lastName}
            </h2>
            
            <p className="call-status-subtitle">
              {callStatus === 'ringing' && callType === 'incoming' && 'Calling you...'}
              {callStatus === 'ringing' && callType === 'outgoing' && 'Ringing...'}
              {callStatus === 'connecting' && 'Ringing...'}
              {callStatus === 'active' && (isMuted ? 'Muted' : 'Connected')}
              {callStatus === 'ended' && finalDuration === 0 && 'Call ended'}
              {callStatus === 'ended' && finalDuration > 0 && 'Call ended'}
              {callStatus === 'declined' && 'Call was declined'}
              {callStatus === 'missed' && 'No answer'}
            </p>
          </div>

          <div className="call-controls">
            
            {callStatus === 'ringing' && callType === 'incoming' && (
              <div className="incoming-call-buttons">
                <button 
                  className="call-btn decline-btn"
                  onClick={handleDecline}
                  title="Decline"
                >
                  <span className="btn-icon">📞</span>
                  <span className="btn-label">Decline</span>
                </button>
                
                <button 
                  className="call-btn accept-btn"
                  onClick={handleAccept}
                  title="Accept"
                >
                  <span className="btn-icon">📞</span>
                  <span className="btn-label">Accept</span>
                </button>
              </div>
            )}

            {callStatus === 'active' && (
              <div className="active-call-controls">
                <button 
                  className={`control-btn ${isMuted ? 'active' : ''}`}
                  onClick={toggleMute}
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  <span className="control-icon">
                    {isMuted ? '🔇' : '🎤'}
                  </span>
                  <span className="control-label">
                    {isMuted ? 'Unmute' : 'Mute'}
                  </span>
                </button>

                <button 
                  className={`control-btn ${isSpeaker ? 'active' : ''}`}
                  onClick={toggleSpeaker}
                  title={isSpeaker ? 'Speaker Off' : 'Speaker On'}
                >
                  <span className="control-icon">
                    {isSpeaker ? '🔊' : '🔈'}
                  </span>
                  <span className="control-label">
                    Speaker
                  </span>
                </button>

                <button 
                  className="control-btn end-call-btn"
                  onClick={endCall}
                  title="End Call"
                >
                  <span className="control-icon">📞</span>
                  <span className="control-label">End</span>
                </button>
              </div>
            )}

            {(callStatus === 'connecting' || (callStatus === 'ringing' && callType === 'outgoing')) && (
              <div className="connecting-call-controls">
                <button 
                  className="call-btn decline-btn"
                  onClick={endCall}
                  title="Cancel"
                >
                  <span className="btn-icon">📞</span>
                  <span className="btn-label">Cancel</span>
                </button>
              </div>
            )}

            {(callStatus === 'ended' || callStatus === 'declined' || callStatus === 'missed') && (
              <div className="ended-call-controls">
                <button 
                  className="call-btn primary-btn"
                  onClick={onClose}
                  title="Close"
                >
                  <span className="btn-label">Close</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
};

export default AudioCall;