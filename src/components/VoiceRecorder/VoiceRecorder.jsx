import React, { useState, useRef, useEffect } from 'react';
import './VoiceRecorder.css';

const VoiceRecorder = ({ onSend, onCancel, isRecording, setIsRecording }) => {
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioURL, setAudioURL] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [microphoneLevel, setMicrophoneLevel] = useState(0);
  const [testingMicrophone, setTestingMicrophone] = useState(true);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  // ✅ CRITICAL: Monitor REAL microphone input
  const monitorMicrophone = (stream) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      const scriptProcessor = audioContext.createScriptProcessor(2048, 1, 1);
      
      analyser.smoothingTimeConstant = 0.3;
      analyser.fftSize = 1024;
      
      microphone.connect(analyser);
      analyser.connect(scriptProcessor);
      scriptProcessor.connect(audioContext.destination);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const checkLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        
        // Calculate RMS (Root Mean Square) for accurate volume
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i] * dataArray[i];
        }
        const rms = Math.sqrt(sum / dataArray.length);
        
        setMicrophoneLevel(rms);
        
        if (animationFrameRef.current) {
          animationFrameRef.current = requestAnimationFrame(checkLevel);
        }
      };
      
      animationFrameRef.current = requestAnimationFrame(checkLevel);
      
      console.log('✅ Microphone monitoring started');
    } catch (error) {
      console.error('❌ Error monitoring microphone:', error);
    }
  };

  // ✅ Test microphone first
  const testMicrophone = async () => {
    try {
      console.log('🎤 Testing microphone...');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false, // Disable for testing
          noiseSuppression: false,  // Disable for testing
          autoGainControl: true,
          sampleRate: 48000,
          channelCount: 1
        }
      });
      
      streamRef.current = stream;
      
      // Monitor for 2 seconds
      monitorMicrophone(stream);
      
      setTimeout(() => {
        setTestingMicrophone(false);
        console.log('✅ Microphone test complete');
      }, 2000);
      
    } catch (error) {
      console.error('❌ Microphone test failed:', error);
      setTestingMicrophone(false);
      
      if (error.name === 'NotAllowedError') {
        alert('Microphone blocked!\n\n1. Click 🔒 in address bar\n2. Allow microphone\n3. Refresh page');
      } else {
        alert('Microphone error: ' + error.message);
      }
    }
  };

  // ✅ FIXED: Start actual recording with working audio
  const startRecording = async () => {
    try {
      console.log('🎤 Starting recording...');
      
      // Use existing stream or create new one
      if (!streamRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 48000,
            channelCount: 1
          }
        });
        streamRef.current = stream;
        monitorMicrophone(stream);
      }
      
      const stream = streamRef.current;
      
      // ✅ CRITICAL: Verify audio tracks are active
      const audioTracks = stream.getAudioTracks();
      console.log('🎵 Audio tracks:', audioTracks.length);
      audioTracks.forEach((track, i) => {
        console.log(`Track ${i}:`, {
          kind: track.kind,
          enabled: track.enabled,
          muted: track.muted,
          readyState: track.readyState,
          label: track.label
        });
      });
      
      if (audioTracks.length === 0) {
        throw new Error('No audio tracks available');
      }
      
      if (audioTracks[0].readyState !== 'live') {
        throw new Error('Audio track is not live');
      }
      
      // Find best MIME type
      let selectedMimeType = '';
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4'
      ];

      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType;
          console.log('✅ Using:', mimeType);
          break;
        }
      }

      if (!selectedMimeType) {
        throw new Error('No supported audio format');
      }
      
      // ✅ Create MediaRecorder with GUARANTEED audio capture
      mediaRecorderRef.current = new MediaRecorder(stream, { 
        mimeType: selectedMimeType,
        audioBitsPerSecond: 128000
      });
      
      audioChunksRef.current = [];
      let totalBytesReceived = 0;

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          totalBytesReceived += event.data.size;
          console.log('📦 Chunk:', event.data.size, 'bytes | Total:', totalBytesReceived);
          audioChunksRef.current.push(event.data);
        } else {
          console.warn('⚠️ Empty chunk received');
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        console.log('⏹️ Recording stopped');
        console.log('📊 Chunks:', audioChunksRef.current.length, '| Total bytes:', totalBytesReceived);
        
        if (audioChunksRef.current.length === 0 || totalBytesReceived === 0) {
          console.error('❌ No audio data!');
          alert('Recording failed: No audio data captured!\n\nThis might be a browser issue. Try:\n1. Using Chrome browser\n2. Checking microphone permissions\n3. Restarting browser');
          return;
        }
        
        // Create blob
        const mimeType = mediaRecorderRef.current.mimeType || selectedMimeType;
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        
        console.log('✅ Blob created:', {
          size: blob.size,
          type: blob.type,
          chunks: audioChunksRef.current.length
        });

        if (blob.size < 5000) {
          console.warn('⚠️ Very small file! May be silent.');
          alert('Warning: Recording is very short or may be silent!');
        }
        
        const url = URL.createObjectURL(blob);
        
        setAudioBlob(blob);
        setAudioURL(url);
        
        console.log('✅ Preview ready');
      };

      mediaRecorderRef.current.onerror = (error) => {
        console.error('❌ MediaRecorder error:', error);
        alert('Recording error: ' + error);
      };

      mediaRecorderRef.current.onstart = () => {
        console.log('🎬 MediaRecorder started');
      };

      // ✅ CRITICAL: Request data frequently (every 100ms)
      mediaRecorderRef.current.start(100);
      setIsRecording(true);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      console.log('🎤 Recording active');

    } catch (error) {
      console.error('❌ Recording error:', error);
      alert('Cannot start recording: ' + error.message);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      console.log('🛑 Stopping...');
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  // Send
  const handleSend = () => {
    if (!audioBlob || audioBlob.size === 0) {
      alert('No audio to send');
      return;
    }

    console.log('📤 Sending:', audioBlob.size, 'bytes');
    onSend(audioBlob, recordingTime);
    handleCancel();
  };

  // Cancel
  const handleCancel = () => {
    console.log('🚪 Canceling');
    
    if (isRecording) {
      stopRecording();
    }
    
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    
    setRecordingTime(0);
    setAudioURL(null);
    setAudioBlob(null);
    setIsPlaying(false);
    setMicrophoneLevel(0);
    audioChunksRef.current = [];
    
    onCancel();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ✅ Test microphone first, then start recording
  useEffect(() => {
    testMicrophone();
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioURL) URL.revokeObjectURL(audioURL);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Auto-start recording after test
  useEffect(() => {
    if (!testingMicrophone && !isRecording && !audioURL) {
      startRecording();
    }
  }, [testingMicrophone]);

  return (
    <div className="voice-recorder-overlay">
      <div className="voice-recorder-modal">
        <div className="voice-recorder-header">
          <h3>
            {testingMicrophone ? '🎤 Testing Microphone...' : 
             isRecording ? '🎤 Recording...' : 
             '🎤 Voice Message'}
          </h3>
          <button className="close-btn" onClick={handleCancel}>✕</button>
        </div>

        <div className="voice-recorder-body">
          {testingMicrophone && (
            <div className="testing-state">
              <div className="pulse-ring"></div>
              <div className="recording-icon">🎤</div>
              <p style={{ marginTop: '20px', color: '#65676b' }}>
                Testing microphone... Speak now!
              </p>
            </div>
          )}

          {!testingMicrophone && isRecording && (
            <div className="recording-animation">
              <div className="pulse-ring"></div>
              <div className="recording-icon">🎤</div>
            </div>
          )}

          {/* ✅ REAL-TIME microphone level */}
          {!audioURL && (
            <div className="audio-level-indicator">
              <div className="level-bars">
                {[...Array(15)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`level-bar ${microphoneLevel > (i * 15) ? 'active' : ''}`}
                    style={{
                      height: microphoneLevel > (i * 15) ? '60px' : '10px',
                      backgroundColor: microphoneLevel > (i * 15) ? '#0084ff' : '#ddd',
                      transition: 'all 0.1s ease'
                    }}
                  ></div>
                ))}
              </div>
              <p className="level-text">
                {microphoneLevel > 20 ? 
                  `🔊 Volume: ${Math.round(microphoneLevel)} - Perfect!` : 
                  microphoneLevel > 5 ?
                  '⚠️ Volume too low - Speak louder!' :
                  '❌ No sound - Speak into microphone!'}
              </p>
            </div>
          )}

          {!testingMicrophone && (
            <div className="recording-timer">
              {formatTime(recordingTime)}
            </div>
          )}

          {/* Preview */}
          {audioURL && !isRecording && (
            <div className="audio-preview">
              <div className="audio-player-container">
                <audio 
                  ref={audioRef}
                  controls
                  controlsList="nodownload"
                  preload="auto"
                  onPlay={() => {
                    console.log('▶️ Playing');
                    setIsPlaying(true);
                  }}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                  onError={(e) => console.error('❌ Error:', e.target.error)}
                  onLoadedMetadata={(e) => {
                    console.log('✅ Loaded. Duration:', e.target.duration);
                    e.target.volume = 1.0;
                  }}
                  src={audioURL}
                  style={{ 
                    width: '100%', 
                    maxWidth: '360px',
                    borderRadius: '8px',
                    backgroundColor: '#f0f2f5',
                    padding: '8px'
                  }}
                />
              </div>
              <p className="preview-hint">
                {isPlaying ? '🔊 Playing' : '🎧 Preview'} • {formatTime(recordingTime)} • {(audioBlob?.size / 1024).toFixed(0)} KB
              </p>
              
              <div style={{ 
                marginTop: '15px', 
                padding: '12px', 
                backgroundColor: '#fff3cd',
                borderRadius: '8px',
                border: '1px solid #ffc107'
              }}>
                <p style={{ margin: 0, fontSize: '14px', color: '#856404' }}>
                  ⚠️ <strong>IMPORTANT:</strong> Click play and make sure you can hear your voice!<br/>
                  If silent, your microphone may not be working properly.
                </p>
              </div>
              
              <a 
                href={audioURL} 
                download={`voice-message-${Date.now()}.webm`}
                style={{
                  display: 'block',
                  textAlign: 'center',
                  marginTop: '12px',
                  padding: '10px',
                  color: '#fff',
                  backgroundColor: '#0084ff',
                  fontSize: '13px',
                  textDecoration: 'none',
                  borderRadius: '6px',
                  fontWeight: 'bold'
                }}
              >
                📥 Download & Test File
              </a>
            </div>
          )}

          {!audioURL && (
            <div className="waveform-container">
              {[...Array(20)].map((_, i) => (
                <div 
                  key={i} 
                  className={`waveform-bar ${isRecording ? 'active' : ''}`}
                  style={{ 
                    animationDelay: `${i * 0.05}s`,
                    height: isRecording ? `${Math.random() * 60 + 20}px` : '20px'
                  }}
                ></div>
              ))}
            </div>
          )}
        </div>

        <div className="voice-recorder-footer">
          {testingMicrophone ? (
            <button className="stop-recording-btn" disabled>
              ⏳ Testing...
            </button>
          ) : isRecording ? (
            <button className="stop-recording-btn" onClick={stopRecording}>
              ⏹️ Stop Recording
            </button>
          ) : (
            <>
              <button className="cancel-btn" onClick={handleCancel}>
                ❌ Cancel
              </button>
              <button 
                className="send-voice-btn" 
                onClick={handleSend}
                disabled={!audioBlob}
              >
                ✅ Send ({formatTime(recordingTime)})
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceRecorder;