import React, { useState, useEffect, useRef, useCallback } from 'react';
import AudioCall from '../../components/AudioCall/AudioCall';
import VoiceRecorder from '../../components/VoiceRecorder/VoiceRecorder';
import { io } from 'socket.io-client';
import './MessengerPage.css';

/**
 * Safely get avatar URL with proper fallbacks
 * This prevents 404 errors and ensures avatars always display
 */
const getAvatarUrl = (user) => {
  if (!user) {
    return 'https://ui-avatars.com/api/?name=User&background=1877f2&color=fff&size=100';
  }

  // Extract avatar URL from different possible formats
  let avatarUrl = null;
  
  if (user.avatar) {
    if (typeof user.avatar === 'string') {
      avatarUrl = user.avatar;
    } else if (user.avatar.url) {
      avatarUrl = user.avatar.url;
    }
  }

  // Validate Cloudinary URL (reject demo URLs)
  if (avatarUrl) {
    // Check if it's a valid URL
    if (avatarUrl.startsWith('http')) {
      // Reject Cloudinary demo URLs
      if (avatarUrl.includes('cloudinary.com/demo/')) {
        console.warn('⚠️ Detected invalid Cloudinary demo URL, using fallback');
        avatarUrl = null;
      }
      // Check if URL is accessible (you can expand this)
      else {
        return avatarUrl;
      }
    }
  }

  // Fallback to ui-avatars.com
  const firstName = user.firstName || 'User';
  const lastName = user.lastName || '';
  const name = `${firstName} ${lastName}`.trim() || user.username || 'User';
  
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1877f2&color=fff&size=100`;
};

/**
 * Image error handler for avatar images
 * Use this in onError prop: onError={handleAvatarError}
 */
const handleAvatarError = (e, user) => {
  e.target.onerror = null; // Prevent infinite loop
  e.target.src = getAvatarUrl(user);
};

/**
 * ✅ FIXED: Convert Cloudinary audio URL to proper MP3 format
 * This ensures voice messages play correctly for all users
 */
const getAudioUrl = (mediaUrl) => {
  if (!mediaUrl) return '';
  
  console.log('🎵 Processing audio URL:', mediaUrl);
  
  // For Cloudinary URLs, ensure proper MP3 format
  if (mediaUrl.includes('cloudinary.com')) {
    try {
      // ✅ CRITICAL FIX: Cloudinary auto-converts audio to MP3
      // Format: https://res.cloudinary.com/[cloud]/video/upload/[path]
      // We need to ensure it requests MP3 format
      
      let processedUrl = mediaUrl;
      
      // If URL doesn't already specify MP3, add format transformation
      if (!mediaUrl.includes('.mp3') && !mediaUrl.includes('f_mp3')) {
        // Split URL at '/upload/' to insert transformation
        const parts = mediaUrl.split('/upload/');
        if (parts.length === 2) {
          // Add fl_attachment,f_mp3 transformation for better compatibility
          processedUrl = `${parts[0]}/upload/fl_attachment/${parts[1]}`;
          
          // Ensure .mp3 extension
          if (!processedUrl.endsWith('.mp3')) {
            // Remove existing extension and add .mp3
            processedUrl = processedUrl.replace(/\.[^/.]+$/, '') + '.mp3';
          }
        }
      }
      
      console.log('✅ Audio URL processed:', {
        original: mediaUrl,
        processed: processedUrl
      });
      
      return processedUrl;
      
    } catch (error) {
      console.error('❌ Error processing audio URL:', error);
      return mediaUrl;
    }
  }
  
  // Non-Cloudinary URLs: return as-is
  return mediaUrl;
};

const MessengerPage = () => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [showMediaOptions, setShowMediaOptions] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [showNewChat, setShowNewChat] = useState(false);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [showAudioCall, setShowAudioCall] = useState(false);
  const [audioCallType, setAudioCallType] = useState('outgoing');
  const [audioCallUser, setAudioCallUser] = useState(null);
  const [activeCallId, setActiveCallId] = useState(null);
  
  //Delete with undo functionality
  const [deleteUndo, setDeleteUndo] = useState(null);
  const [showDeleteMenu, setShowDeleteMenu] = useState(null);
  const [showConversationMenu, setShowConversationMenu] = useState(null);
  const [conversationToDelete, setConversationToDelete] = useState(null);
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
  //Multi-select state
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messagePollingRef = useRef(null);
  const conversationPollingRef = useRef(null);
  const searchDebounceRef = useRef(null);
  const deleteTimeoutRef = useRef(null);
  
  // CACHE TIMESTAMPS
  const lastConversationFetch = useRef(0);
  const lastMessageFetch = useRef(0);
  const lastUsersListFetch = useRef(0);
  const socketRef = useRef(null);

  const API_URL = 'http://localhost:5000/api';
  const token = localStorage.getItem('token');

  const popularEmojis = ['😊', '❤️', '😂', '👍', '🎉', '😍', '🔥', '👏', '😘', '🥰', '😢', '😎', '🎾', '⛳', '🏆', '💪', '🙏', '👑', '✨', '💯'];

  const stickerPacks = {
  tennis: [
    { id: 1, url: 'https://em-content.zobj.net/source/apple/354/tennis_1f3be.png', name: 'Tennis' },
    { id: 2, url: 'https://em-content.zobj.net/source/apple/354/trophy_1f3c6.png', name: 'Trophy' },
    { id: 3, url: 'https://em-content.zobj.net/source/apple/354/fire_1f525.png', name: 'Fire' },
    { id: 4, url: 'https://em-content.zobj.net/source/apple/354/clapping-hands_1f44f.png', name: 'Clap' },
    { id: 5, url: 'https://em-content.zobj.net/source/apple/354/star-struck_1f929.png', name: 'Star' },
    { id: 6, url: 'https://em-content.zobj.net/source/apple/354/party-popper_1f389.png', name: 'Party' }
  ],
  emotions: [
    { id: 7, url: 'https://em-content.zobj.net/source/apple/354/smiling-face-with-hearts_1f970.png', name: 'Love' },
    { id: 8, url: 'https://em-content.zobj.net/source/apple/354/face-blowing-a-kiss_1f618.png', name: 'Kiss' },
    { id: 9, url: 'https://em-content.zobj.net/source/apple/354/grinning-face-with-smiling-eyes_1f604.png', name: 'Happy' },
    { id: 10, url: 'https://em-content.zobj.net/source/apple/354/crying-face_1f622.png', name: 'Cry' },
    { id: 11, url: 'https://em-content.zobj.net/source/apple/354/face-with-tears-of-joy_1f602.png', name: 'LOL' },
    { id: 12, url: 'https://em-content.zobj.net/source/apple/354/thinking-face_1f914.png', name: 'Think' }
  ]
};

  // ✅ DELETE ENTIRE CONVERSATION
  const handleDeleteConversation = async (userId) => {
    if (!window.confirm('Delete this entire conversation? This cannot be undone.')) {
      setShowConversationMenu(null);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/messages/conversation/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (data.success) {
        // Remove conversation from list
        setConversations(prev => prev.filter(conv => conv.user._id !== userId));
        
        // If this was the active conversation, close it
        if (activeConversation?.user._id === userId) {
          setActiveConversation(null);
          setMessages([]);
        }

        console.log('✅ Conversation deleted');
      } else {
        alert(data.message || 'Failed to delete conversation');
      }
    } catch (error) {
      console.error('❌ Error deleting conversation:', error);
      alert('Failed to delete conversation');
    } finally {
      setShowConversationMenu(null);
    }
  };

  // ✅ DEDUPLICATION
  const deduplicateConversations = useCallback((convs) => {
    const conversationMap = new Map();
    
    convs.forEach(conv => {
      const userId = conv.user._id.toString();
      const existing = conversationMap.get(userId);
      
      if (!existing || 
          (conv.lastMessage && existing.lastMessage && 
           new Date(conv.lastMessage.createdAt) > new Date(existing.lastMessage.createdAt))) {
        conversationMap.set(userId, conv);
      }
    });
    
    const deduplicated = Array.from(conversationMap.values());
    
    if (deduplicated.length < convs.length) {
      console.warn(`⚠️ Removed ${convs.length - deduplicated.length} duplicate conversation(s)`);
    }
    
    return deduplicated;
  }, []);

  const getSmartReplies = (lastMessage) => {
    const suggestions = {
      greeting: ['Hey! 👋', 'Hello! 😊', 'Hi there! 🎾'],
      thanks: ['Thank you so much! ❤️', 'Thanks! 🙏', 'Appreciate it! 😊'],
      congrats: ['Congratulations! 🎉', 'Amazing! 🏆', 'Well done! 👏'],
      question: ['Yes! 👍', 'No, thanks 😊', 'Maybe later 🤔'],
      default: ['That\'s great! 😊', 'Awesome! 🔥', 'Love it! ❤️']
    };

    if (!lastMessage) return suggestions.greeting;

    const content = lastMessage.content?.toLowerCase() || '';
    if (content.includes('thank') || content.includes('thanks')) return suggestions.thanks;
    if (content.includes('congrat') || content.includes('won')) return suggestions.congrats;
    if (content.includes('?')) return suggestions.question;
    
    return suggestions.default;
  };

  // Fetch current user
  useEffect(() => {
    let isMounted = true; // ← Add this
    
    const fetchCurrentUser = async () => {
      if (!token) {
        console.error('❌ No token found');
        return;
      }

      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        
        if (response.ok && data.success && data.user && isMounted) { // ← Add isMounted check
          console.log('✅ Current user loaded:', data.user.firstName, data.user.lastName);
          setCurrentUser(data.user);
        }
      } catch (error) {
        if (isMounted) { // ← Add this
          console.error('❌ Error fetching user:', error);
        }
      }
    };
    
    fetchCurrentUser();
    
    return () => { isMounted = false; };
  }, []);

  // ✅ Fetch conversations
  const fetchConversations = useCallback(async (force = false) => {
    if (!token || !currentUser) return;
    
    const now = Date.now();
    const timeSinceLastFetch = now - lastConversationFetch.current;
    
    if (!force && timeSinceLastFetch < 10000) {
      console.log('⏭️ Skipping conversation fetch (cached)');
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/messages/conversations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.status === 429) {
        console.warn('⚠️ Rate limited - backing off');
        return;
      }
      
      const data = await response.json();
      
      if (data.success && data.conversations) {
        const deduplicated = deduplicateConversations(data.conversations);
        
        setConversations(prev => {
          const prevIds = prev.map(c => c.user._id).sort().join(',');
          const newIds = deduplicated.map(c => c.user._id).sort().join(',');
          
          if (prevIds === newIds) {
            const hasUpdates = deduplicated.some((newConv, i) => {
              const prevConv = prev.find(p => p.user._id === newConv.user._id);
              if (!prevConv) return true;
              return newConv.lastMessage?.createdAt !== prevConv.lastMessage?.createdAt;
            });
            
            return hasUpdates ? deduplicated : prev;
          }
          
          return deduplicated;
        });
        
        lastConversationFetch.current = now;
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  }, [token, currentUser, deduplicateConversations]);

  // Socket.IO connection for audio calls
useEffect(() => {
  if (!currentUser) return;

  console.log('🔌 Initializing Socket.IO for user:', currentUser._id);

  // Connect to Socket.IO
  const socket = io('http://localhost:5000', {
    query: { userId: currentUser._id },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5
  });

  socketRef.current = socket;

  // ============================================
  // CONNECTION HANDLERS
  // ============================================
  
  socket.on('connect', () => {
    console.log('✅ Socket.IO connected:', socket.id);
    socket.emit('user:online', currentUser._id);
  });

  socket.on('disconnect', () => {
    console.log('❌ Socket.IO disconnected');
  });

  socket.on('connect_error', (error) => {
    console.error('❌ Socket.IO connection error:', error);
  });

  // ============================================
  // USER STATUS HANDLERS
  // ============================================
  
  socket.on('user:status', (data) => {
    console.log('👤 User status update:', data.userId, 'isOnline:', data.isOnline);
    
    // Update conversations list with online status
    setConversations(prev => prev.map(conv => {
      if (conv.user._id === data.userId) {
        return {
          ...conv,
          user: {
            ...conv.user,
            isOnline: data.isOnline
          }
        };
      }
      return conv;
    }));
    
    // Update active conversation if it's the same user
    if (activeConversation?.user._id === data.userId) {
      setActiveConversation(prev => ({
        ...prev,
        user: {
          ...prev.user,
          isOnline: data.isOnline
        }
      }));
    }
  });

  // ============================================
  // AUDIO CALL HANDLERS
  // ============================================

  socket.on('audio:call:incoming', (data) => {
  console.log('📞 Incoming call from:', data.caller.firstName, data.caller.lastName);
  console.log('🆔 Call ID:', data.callId);
  
  setActiveCallId(data.callId);
  setAudioCallUser({
    _id: data.caller._id,
    firstName: data.caller.firstName,
    lastName: data.caller.lastName,
    avatar: data.caller.avatar,
    username: data.caller.username,
    isAdmin: data.caller.isAdmin,
  });
  setAudioCallType('incoming');
  setShowAudioCall(true);
});

// ✅ NEW: Listen for call initiated confirmation (caller receives correct callId)
socket.on('audio:call:initiated', (data) => {
  console.log('✅ Call initiated confirmation received');
  console.log('🆔 Server assigned callId:', data.callId);
  
  // ✅ Update to use server's callId (the correct one)
  setActiveCallId(data.callId);
});

  socket.on('audio:call:accepted', (data) => {
    console.log('✅ Call accepted event received!', data);
    // AudioCall component will handle this internally
  });

  socket.on('audio:call:declined', async (data) => {
    console.log('❌ Call declined:', data.reason);
    setShowAudioCall(false);
    
    if (audioCallUser) {
      try {
        await fetch(`${API_URL}/messages/call-record`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            receiverId: audioCallUser._id,
            duration: 0,
            callType: 'audio',
            status: 'declined'
          })
        });
        console.log('✅ Declined call record saved');
        fetchConversations(true);
      } catch (error) {
        console.error('❌ Error saving declined call:', error);
      }
    }
    
    setAudioCallUser(null);
    setActiveCallId(null);
    alert(`Call declined: ${data.reason || 'User declined'}`);
  });

  socket.on('audio:call:missed', async (data) => {
    console.log('📵 Call missed event received:', data);
    setShowAudioCall(false);
    
    const userMessage = data.callType === 'outgoing' ? 'No answer' : 'You missed a call';
    
    // ✅ NO NEED TO CREATE RECORD - Server already did it
    // Just refresh conversations to show the new call record
    fetchConversations(true);
    
    // ✅ If this is the active conversation, refresh messages too
    if (audioCallUser && activeConversation?.user._id === audioCallUser._id) {
      fetchMessages(true);
    }
    
    setAudioCallUser(null);
    setActiveCallId(null);
    alert(userMessage);
  });

  socket.on('audio:call:ended', async (data) => {
  console.log('📞 Call ended. Duration:', data.duration, 'seconds');
  console.log('📞 Ended by:', data.endedBy);
  
  // ✅ FORCE CLOSE THE CALL MODAL IMMEDIATELY
  setShowAudioCall(false);
  setAudioCallUser(null);
  setActiveCallId(null);
  
  // ✅ Refresh conversations and messages to show call record
  fetchConversations(true);
  
  // ✅ If viewing the conversation with the person we called, refresh messages
  if (audioCallUser && activeConversation?.user._id === audioCallUser._id) {
    fetchMessages(true);
  }
});

  // ============================================
  // CLEANUP
  // ============================================
  
  return () => {
    console.log('🧹 Cleaning up Socket.IO connection');
    socket.off('connect');
    socket.off('disconnect');
    socket.off('connect_error');
    socket.off('user:status');
    socket.off('audio:call:incoming');
    socket.off('audio:call:initiated'); // ✅ NEW
    socket.off('audio:call:accepted');
    socket.off('audio:call:declined');
    socket.off('audio:call:missed');
    socket.off('audio:call:ended');
    socket.disconnect();
  };
}, [currentUser]);

// ✅ FIXED: Start audio call function
const startAudioCall = (user) => {
  console.log('📞 Starting audio call with:', user.firstName, user.lastName);
  
  // ✅ Generate callId ONCE and store it
  const newCallId = `call_${currentUser._id}_${user._id}_${Date.now()}`;
  
  setAudioCallUser(user);
  setActiveCallId(newCallId); // ✅ Store the callId
  setAudioCallType('outgoing');
  setShowAudioCall(true);
  
  // ✅ Send Socket.IO event WITH FULL USER DETAILS
  if (socketRef.current && currentUser) {
    console.log('📡 Emitting audio:call:initiate with callId:', newCallId);
    
    socketRef.current.emit('audio:call:initiate', {
      receiverId: user._id,
      callerId: currentUser._id,
      callerInfo: {
        _id: currentUser._id,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        avatar: currentUser.avatar,
        username: currentUser.username,
        isAdmin: currentUser.isAdmin
      }
    });
    
    console.log('✅ Call initiation sent to server with callId:', newCallId);
  } else {
    console.error('❌ Socket not connected or currentUser missing');
  }
};

// ✅ FIXED: Close call handler
const handleCloseCall = () => {
  console.log('🚪 Closing call modal');
  setShowAudioCall(false);
  setAudioCallUser(null);
  setActiveCallId(null); // ✅ Clear the callId
};

  // Poll conversations
  useEffect(() => {
    if (token && currentUser) {
      fetchConversations(true);
      
      conversationPollingRef.current = setInterval(() => {
        fetchConversations(false);
      }, 15000);
      
      return () => clearInterval(conversationPollingRef.current);
    }
  }, [token, currentUser, fetchConversations]);

  // ✅ Debounced user search
  const debouncedUserSearch = useCallback((searchTerm) => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    if (searchTerm.length > 0 && searchTerm.length < 2) {
      setUsersList([]);
      return;
    }

    searchDebounceRef.current = setTimeout(async () => {
      if (!currentUser?.isAdmin) return;
      
      const now = Date.now();
      const timeSinceLastFetch = now - lastUsersListFetch.current;
      
      if (timeSinceLastFetch < 2000) {
        console.log('⏭️ Skipping user search (too soon)');
        return;
      }
      
      try {
        const response = await fetch(`${API_URL}/messages/users?search=${searchTerm}&limit=50`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) return;
        
        const data = await response.json();
        
        if (data.success && data.users) {
          setUsersList(data.users);
          lastUsersListFetch.current = now;
        }
      } catch (error) {
        console.error('❌ Error fetching users:', error);
      }
    }, 500);
  }, [currentUser, token]);

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    debouncedUserSearch(value);
  };

  useEffect(() => {
    if (showNewChat && currentUser?.isAdmin) {
      setSearchQuery('');
      setUsersList([]);
      debouncedUserSearch('');
    }
  }, [showNewChat, currentUser, debouncedUserSearch]);


  const sendVoiceMessage = async (audioBlob, duration) => {
    if (!activeConversation) {
      alert('No active conversation');
      return;
    }

    if (!audioBlob || audioBlob.size === 0) {
      alert('Invalid audio recording');
      return;
    }

    setLoading(true);

    try {
      console.log('📤 Sending voice message:', {
        size: audioBlob.size,
        type: audioBlob.type,
        duration: duration
      });

      const formData = new FormData();
      formData.append('receiverId', activeConversation.user._id);
      formData.append('type', 'audio');
      formData.append('content', `Voice message ${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`);
      
      // ✅ CRITICAL FIX: Create proper audio file with correct extension
      let fileName = `voice_${Date.now()}`;
      let fileExtension = '.webm';
      
      // Determine file extension from MIME type
      if (audioBlob.type.includes('webm')) {
        fileExtension = '.webm';
      } else if (audioBlob.type.includes('ogg')) {
        fileExtension = '.ogg';
      } else if (audioBlob.type.includes('mp4')) {
        fileExtension = '.mp4';
      } else if (audioBlob.type.includes('wav')) {
        fileExtension = '.wav';
      }
      
      fileName += fileExtension;
      
      // ✅ Create File object with proper MIME type
      const audioFile = new File([audioBlob], fileName, { 
        type: audioBlob.type || 'audio/webm'
      });
      
      console.log('📎 Audio file created:', {
        name: audioFile.name,
        size: audioFile.size,
        type: audioFile.type
      });
      
      formData.append('media', audioFile);

      const response = await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Voice message sent successfully');
        setMessages(prev => [...prev, data.data]);
        fetchConversations(true);
        
        // ✅ Scroll to bottom to show new message
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        console.error('❌ Failed to send:', data.message);
        alert(data.message || 'Failed to send voice message');
      }
    } catch (error) {
      console.error('❌ Error sending voice message:', error);
      alert('Failed to send voice message: ' + error.message);
    } finally {
      setLoading(false);
      setShowVoiceRecorder(false);
    }
  };

  // ✅ NEW: Mark messages as read immediately when conversation opens
  const markConversationAsRead = useCallback(async (userId) => {
    if (!token) return;
    
    try {
      await fetch(`${API_URL}/messages/mark-read/${userId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Immediately update local conversations state to clear unread count
      setConversations(prev => prev.map(conv => {
        if (conv.user._id === userId) {
          return { ...conv, unreadCount: 0 };
        }
        return conv;
      }));
      
      console.log('✅ Marked messages as read for user:', userId);
    } catch (error) {
      console.error('❌ Error marking messages as read:', error);
    }
  }, [token]);

  // ✅ Fetch messages
  const fetchMessages = useCallback(async (force = false) => {
    if (!activeConversation || !token) return;
    
    const now = Date.now();
    const timeSinceLastFetch = now - lastMessageFetch.current;
    
    if (!force && timeSinceLastFetch < 5000) {
      console.log('⏭️ Skipping message fetch (cached)');
      return;
    }
    
    try {
      const response = await fetch(
        `${API_URL}/messages/conversation/${activeConversation.user._id}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      if (response.status === 429) {
        console.warn('⚠️ Rate limited - backing off');
        return;
      }
      
      const data = await response.json();
      
      if (data.success) {
        setMessages(data.messages);
        setSuggestions(getSmartReplies(data.messages[data.messages.length - 1]));
        lastMessageFetch.current = now;
        
        // ✅ NEW: Mark as read immediately after fetching
        await markConversationAsRead(activeConversation.user._id);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [activeConversation, token, markConversationAsRead]);

  // Poll messages
  useEffect(() => {
    if (activeConversation && currentUser) {
      fetchMessages(true);
      
      messagePollingRef.current = setInterval(() => {
        fetchMessages(false);
      }, 10000);
      
      return () => clearInterval(messagePollingRef.current);
    }
  }, [activeConversation, currentUser, fetchMessages]);

  useEffect(() => {
    const messagesArea = document.querySelector('.messages-area');
    if (!messagesArea) return;
    
    const isAtBottom = messagesArea.scrollHeight - messagesArea.scrollTop - messagesArea.clientHeight < 100;
    
    if (isAtBottom && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest'
      });
    }
  }, [messages]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
    setShowMediaOptions(false);
  };

  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newUrls = previewUrls.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setPreviewUrls(newUrls);
  };

  const sendMessage = async () => {
    if (!messageInput.trim() && selectedFiles.length === 0) return;
    if (!activeConversation) return;

    setLoading(true);

    const optimisticMessage = {
      _id: 'temp-' + Date.now(),
      content: messageInput,
      sender: {
        _id: currentUser._id,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        avatar: currentUser.avatar,
        username: currentUser.username,
        isAdmin: currentUser.isAdmin
      },
      receiver: {
        _id: activeConversation.user._id,
        firstName: activeConversation.user.firstName,
        lastName: activeConversation.user.lastName,
        avatar: activeConversation.user.avatar
      },
      type: selectedFiles.length > 0 ? 'image' : 'text',
      createdAt: new Date(),
      isRead: false,
      status: 'sending'
    };

    setMessages(prev => [...prev, optimisticMessage]);
    const messageToSend = messageInput;
    setMessageInput('');
    setSelectedFiles([]);
    setPreviewUrls([]);
    setReplyingTo(null);

    try {
      const formData = new FormData();
      formData.append('receiverId', activeConversation.user._id);
      formData.append('content', messageToSend);
      
      if (selectedFiles.length > 0) {
        formData.append('media', selectedFiles[0]);
      }
      
      if (replyingTo) {
        formData.append('replyTo', replyingTo._id);
      }

      const response = await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        setMessages(prev => prev.map(msg => 
          msg._id === optimisticMessage._id ? data.data : msg
        ));
        
        fetchConversations(true);
      } else {
        setMessages(prev => prev.filter(msg => msg._id !== optimisticMessage._id));
        alert(data.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.filter(msg => msg._id !== optimisticMessage._id));
      alert('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const sendEmoji = (emoji) => {
    setMessageInput(messageInput + emoji);
    setShowEmojiPicker(false);
  };

  const sendSticker = async (sticker) => {
    if (!activeConversation) return;

    try {
      const response = await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          receiverId: activeConversation.user._id,
          type: 'sticker',
          sticker: sticker
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setMessages([...messages, data.data]);
        setShowStickerPicker(false);
        fetchConversations(true);
      }
    } catch (error) {
      console.error('Error sending sticker:', error);
    }
  };

  const addReaction = async (messageId, emoji) => {
    try {
      const response = await fetch(`${API_URL}/messages/${messageId}/reaction`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ emoji })
      });

      const data = await response.json();
      
      if (data.success) {
        setMessages(messages.map(msg => 
          msg._id === messageId ? { ...msg, reactions: data.reactions } : msg
        ));
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  // ============================================
// DELETE SINGLE MESSAGE - IMMEDIATE WITH 3-SEC UNDO
// ============================================
const handleDeleteMessage = async (messageId, deleteForEveryone = false) => {
  try {
    setShowDeleteMenu(null);
    
    const messageToDelete = messages.find(m => m._id === messageId);
    
    // ✅ IMMEDIATE UI REMOVAL
    setMessages(prev => prev.filter(m => m._id !== messageId));
    
    // Clear any existing undo timeout
    if (deleteTimeoutRef.current) {
      clearTimeout(deleteTimeoutRef.current);
    }
    
    // ✅ 3-SECOND UNDO WINDOW (changed from 10 seconds)
    const timeoutId = setTimeout(async () => {
      try {
        const endpoint = deleteForEveryone 
          ? `${API_URL}/messages/${messageId}/delete-for-everyone`
          : `${API_URL}/messages/${messageId}`;
          
        const response = await fetch(endpoint, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          console.log('✅ Message permanently deleted from server');
          setDeleteUndo(null);
          fetchConversations(true);
        } else {
          // Restore message if server deletion failed
          setMessages(prev => {
            const restored = [...prev, messageToDelete].sort((a, b) => 
              new Date(a.createdAt) - new Date(b.createdAt)
            );
            return restored;
          });
          alert('Failed to delete message');
        }
      } catch (error) {
        console.error('❌ Error deleting message:', error);
        // Restore message on error
        setMessages(prev => {
          const restored = [...prev, messageToDelete].sort((a, b) => 
            new Date(a.createdAt) - new Date(b.createdAt)
          );
          return restored;
        });
      }
    }, 3000); // ✅ 3 seconds instead of 10
    
    deleteTimeoutRef.current = timeoutId;
    
    // Show undo notification
    setDeleteUndo({
      messageIds: [messageId],
      messages: [messageToDelete],
      deleteForEveryone,
      timeoutId,
      count: 1
    });
    
  } catch (error) {
    console.error('Error initiating delete:', error);
  }
};

// ============================================
// DELETE MULTIPLE MESSAGES - 3-SEC UNDO
// ============================================
  const handleDeleteMultipleMessages = async (deleteForEveryone = false) => {
    if (selectedMessages.length === 0) return;
    
    try {
      // Store messages for undo
      const messagesToDelete = messages.filter(m => selectedMessages.includes(m._id));
      
      // ✅ IMMEDIATE UI REMOVAL
      setMessages(prev => prev.filter(m => !selectedMessages.includes(m._id)));
      
      // Clear any existing undo timeout
      if (deleteTimeoutRef.current) {
        clearTimeout(deleteTimeoutRef.current);
      }
      
      // Exit select mode
      setIsSelectMode(false);
      const messageIdsToDelete = [...selectedMessages];
      setSelectedMessages([]);
      
      // ✅ 3-SECOND UNDO WINDOW
      const timeoutId = setTimeout(async () => {
        try {
          // Delete all messages from server
          const deletePromises = messageIdsToDelete.map(messageId => {
            const endpoint = deleteForEveryone 
              ? `${API_URL}/messages/${messageId}/delete-for-everyone`
              : `${API_URL}/messages/${messageId}`;
              
            return fetch(endpoint, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` }
            });
          });
          
          await Promise.all(deletePromises);
          
          console.log(`✅ ${messageIdsToDelete.length} messages permanently deleted`);
          setDeleteUndo(null);
          fetchConversations(true);
        } catch (error) {
          console.error('❌ Error deleting messages:', error);
          // Restore messages on error
          setMessages(prev => {
            const restored = [...prev, ...messagesToDelete].sort((a, b) => 
              new Date(a.createdAt) - new Date(b.createdAt)
            );
            return restored;
          });
        }
      }, 3000); // ✅ 3 seconds
      
      deleteTimeoutRef.current = timeoutId;
      
      // Show undo notification
      setDeleteUndo({
        messageIds: messageIdsToDelete,
        messages: messagesToDelete,
        deleteForEveryone,
        timeoutId,
        count: messageIdsToDelete.length
      });
      
    } catch (error) {
      console.error('Error initiating multiple delete:', error);
    }
  };

  // ============================================
  // UNDO DELETE
  // ============================================
  const handleUndoDelete = () => {
    if (!deleteUndo) return;
    
    // Clear timeout
    if (deleteUndo.timeoutId) {
      clearTimeout(deleteUndo.timeoutId);
    }
    
    // Restore messages to UI
    setMessages(prev => {
      const restored = [...prev, ...deleteUndo.messages].sort((a, b) => 
        new Date(a.createdAt) - new Date(b.createdAt)
      );
      return restored;
    });
    
    // Clear undo state
    setDeleteUndo(null);
    deleteTimeoutRef.current = null;
    
    console.log('✅ Delete undone - messages restored');
  };

  // ============================================
  // TOGGLE SELECT MODE
  // ============================================
  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    setSelectedMessages([]);
    setShowDeleteMenu(null);
  };

  // ============================================
  // TOGGLE MESSAGE SELECTION
  // ============================================
  const toggleMessageSelection = (messageId) => {
    setSelectedMessages(prev => {
      if (prev.includes(messageId)) {
        return prev.filter(id => id !== messageId);
      } else {
        return [...prev, messageId];
      }
    });
  };

  // ============================================
  // SELECT ALL MESSAGES
  // ============================================
  const selectAllMessages = () => {
    const allMessageIds = messages.map(m => m._id);
    setSelectedMessages(allMessageIds);
  };

  // ============================================
  // CANCEL MULTI-SELECT
  // ============================================
  const cancelMultiSelect = () => {
    setIsSelectMode(false);
    setSelectedMessages([]);
  };

  // ✅ Clear undo on unmount
  useEffect(() => {
    return () => {
      if (deleteTimeoutRef.current) {
        clearTimeout(deleteTimeoutRef.current);
      }
    };
  }, []);

  const startNewConversation = (user) => {
    console.log('💬 Starting conversation with:', user.firstName, user.lastName);
    
    if (!currentUser.isAdmin && !user.isAdmin) {
      alert('You can only message admins. Normal users cannot message each other.');
      return;
    }
    
    setActiveConversation({
      id: `new-${user._id}`,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        name: `${user.firstName} ${user.lastName}`,
        avatar: user.avatar?.url || user.avatar,
        username: user.username,
        isAdmin: user.isAdmin,
        isOnline: false
      },
      lastMessage: null,
      unreadCount: 0
    });
    
    setMessages([]);
    setShowNewChat(false);
    setSearchQuery('');
  };

  const formatTime = (date) => {
    if (!date) return '';
    const messageDate = new Date(date);
    const now = new Date();
    const diff = now - messageDate;
    const hours = Math.floor(diff / 3600000);
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return messageDate.toLocaleDateString();
  };

  

  // Accept call
  const handleAcceptCall = () => {
    console.log('✅ Accepting call');
    if (socketRef.current && audioCallUser) {
      socketRef.current.emit('audio:call:accept', {
        callId: `call_${audioCallUser._id}_${currentUser._id}`
      });
    }
  };

  // Decline call
  const handleDeclineCall = () => {
    console.log('❌ Declining call');
    if (socketRef.current && audioCallUser) {
      socketRef.current.emit('audio:call:decline', {
        callId: `call_${audioCallUser._id}_${currentUser._id}`,
        reason: 'User declined'
      });
    }
    setShowAudioCall(false);
    setAudioCallUser(null);
  };

  return (
    <div className="messenger-container">

      {/* ============================================ */}
      {/* AUDIO CALL COMPONENT - FIXED */}
      {/* ============================================ */}
      <AudioCall
        isOpen={showAudioCall}
        onClose={handleCloseCall}
        user={audioCallUser}
        currentUser={currentUser}
        callType={audioCallType}
        onAccept={() => console.log('Call accepted')}
        onDecline={() => console.log('Call declined')}
        socket={socketRef.current}
        callId={activeCallId} // ✅ USE THE STORED CALL ID
      />

      {/*UNDO DELETE SNACKBAR */}
      {deleteUndo && (
        <div className="delete-undo-snackbar">
          <span>
            {deleteUndo.count > 1 
              ? `${deleteUndo.count} messages deleted${deleteUndo.deleteForEveryone ? ' for everyone' : ''}` 
              : deleteUndo.deleteForEveryone 
                ? 'Message deleted for everyone' 
                : 'Message deleted'
            }
          </span>
          <button onClick={handleUndoDelete} className="undo-btn">
            UNDO
          </button>
        </div>
      )}

      {/* ============================================ */}
      {/* SIDEBAR */}
      {/* ============================================ */}
      <div className={`messenger-sidebar ${showChatOnMobile ? 'hide-on-mobile' : ''}`}>
        <div className="sidebar-header">
          <h2>Messages</h2>
          <div className="header-actions">
            {currentUser?.isAdmin && (
              <button 
                className="icon-btn" 
                title="New message"
                onClick={() => {
                  setShowNewChat(!showNewChat);
                  setSearchQuery('');
                }}
              >
                <span>✏️</span>
              </button>
            )}
            <button className="icon-btn" title="Settings">
              <span>⚙️</span>
            </button>
          </div>
        </div>

        {showNewChat && currentUser?.isAdmin && (
          <div className="new-chat-modal">
            <div className="modal-header">
              <h3>New Message</h3>
              <button className="close-modal-btn" onClick={() => setShowNewChat(false)}>
                ✕
              </button>
            </div>
            
            <div className="search-container">
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="search-input"
                autoFocus
              />
              {searchQuery && (
                <button 
                  className="clear-search-btn" 
                  onClick={() => handleSearchChange('')}
                >
                  ✕
                </button>
              )}
            </div>
            
            <div className="users-list">
              {!usersList || usersList.length === 0 ? (
                <div className="no-users-found">
                  <p>
                    {searchQuery 
                      ? `No users found for "${searchQuery}"` 
                      : 'Type to search for users...'}
                  </p>
                </div>
              ) : (
                <>
                  <div className="users-count">
                    {usersList.length} user{usersList.length !== 1 ? 's' : ''} found
                  </div>
                  {usersList.map((user) => (
                    <div
                      key={user._id}
                      className="user-item"
                      onClick={() => startNewConversation(user)}
                    >
                      <img 
                        src={getAvatarUrl(user)} 
                        alt={user.username} 
                        className="user-avatar" 
                        onError={(e) => handleAvatarError(e, user)}
                      />
                      <div className="user-info">
                        <h4>{user.firstName} {user.lastName}</h4>
                        <p className="user-username">@{user.username}</p>
                      </div>
                      <button 
                        className="message-user-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          startNewConversation(user);
                        }}
                      >
                        <span>💬</span>
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        )}

        {!showNewChat && (
          <>
            <div className="search-container">
              <input
                type="text"
                placeholder="Search conversations..."
                className="search-input"
              />
            </div>

            <div className="conversations-list">
              {conversations.length === 0 ? (
                <div className="no-conversations">
                  <p>No conversations yet</p>
                  {currentUser?.isAdmin && (
                    <button onClick={() => setShowNewChat(true)}>Start chatting</button>
                  )}
                </div>
              ) : (
                conversations.map((conv, index) => (
                  <div
                    key={`conv-${conv.user._id}-${index}`}
                    className={`conversation-item ${activeConversation?.user._id === conv.user._id ? 'active' : ''}`}
                    onClick={() => {
                      setActiveConversation(conv);
                      setShowChatOnMobile(true);
                    }}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      setShowConversationMenu(conv.user._id);
                    }}
                  >
                    <div className="conv-avatar-container">
                      <img 
                        src={getAvatarUrl(conv.user)} 
                        alt={conv.user.name} 
                        className="conv-avatar" 
                        onError={(e) => handleAvatarError(e, conv.user)}
                      />
                      {conv.user.isOnline && <span className="online-indicator"></span>}
                    </div>
                    <div className="conv-info">
                      <div className="conv-header">
                        <h4>{conv.user.firstName} {conv.user.lastName}</h4>
                        {conv.lastMessage && (
                          <span className="conv-time">{formatTime(conv.lastMessage.createdAt)}</span>
                        )}
                      </div>
                      {conv.lastMessage && (
                        <div className="conv-preview">
                          <p className={!conv.lastMessage.isRead && conv.lastMessage.sender !== currentUser?._id ? 'unread' : ''}>
                            {conv.lastMessage.type === 'sticker' ? '🎨 Sticker' : conv.lastMessage.content}
                          </p>
                          {conv.unreadCount > 0 && (
                            <span className="unread-badge">{conv.unreadCount}</span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <button 
                      className="delete-conv-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowConversationMenu(conv.user._id);
                      }}
                      title="Delete conversation"
                    >
                      ⋮
                    </button>

                    {showConversationMenu === conv.user._id && (
                      <div className="conversation-delete-menu">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteConversation(conv.user._id);
                          }}
                          className="delete-conv-option"
                        >
                          🗑️ Delete Conversation
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowConversationMenu(null);
                          }}
                          className="cancel-conv-option"
                        >
                          ✕ Cancel
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* ============================================ */}
      {/* CHAT AREA */}
      {/* ============================================ */}
      <div className={`messenger-chat ${showChatOnMobile ? 'show-on-mobile' : ''}`}>
        {activeConversation ? (
          <>
            {/* CHAT HEADER */}
            <div className="chat-header">
              <button 
                className="mobile-back-btn"
                onClick={() => {
                  setShowChatOnMobile(false);
                  setActiveConversation(null);
                  setShowInfoPanel(false);
                  setShowSettingsPanel(false);
                  setIsSelectMode(false);
                  setSelectedMessages([]);
                }}
                title="Back"
              >
                ←
              </button>

              {/* ✅ MULTI-SELECT MODE HEADER */}
              {isSelectMode ? (
                <div className="select-mode-header">
                  <button 
                    className="cancel-select-btn"
                    onClick={cancelMultiSelect}
                    title="Cancel"
                  >
                    ✕
                  </button>
                  <span className="selected-count">
                    {selectedMessages.length} selected
                  </span>
                  <div className="select-actions">
                    {selectedMessages.length < messages.length && (
                      <button 
                        className="icon-btn"
                        onClick={selectAllMessages}
                        title="Select all"
                      >
                        ☑️
                      </button>
                    )}
                    <button 
                      className="icon-btn delete-btn"
                      onClick={() => {
                        if (selectedMessages.length === 0) {
                          alert('No messages selected');
                          return;
                        }
                        const hasOwnMessages = messages
                          .filter(m => selectedMessages.includes(m._id))
                          .some(m => m.sender._id === currentUser._id);
                        
                        if (hasOwnMessages) {
                          const choice = window.confirm(
                            'Delete for everyone or just for you?\n\n' +
                            'OK = Delete for everyone (permanent)\n' +
                            'Cancel = Delete for me only'
                          );
                          handleDeleteMultipleMessages(choice);
                        } else {
                          handleDeleteMultipleMessages(false);
                        }
                      }}
                      disabled={selectedMessages.length === 0}
                      title="Delete selected"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* NORMAL HEADER */}
                  <div className="chat-user-info">
                    <img 
                      src={getAvatarUrl(activeConversation.user)} 
                      alt={activeConversation.user.name} 
                      className="header-avatar" 
                      onError={(e) => handleAvatarError(e, activeConversation.user)}
                    />
                    <div>
                      <h3>{activeConversation.user.firstName} {activeConversation.user.lastName}</h3>
                      <span className="user-status">
                        {activeConversation.user.isOnline ? 'Active now' : 'Offline'}
                      </span>
                    </div>
                  </div>
                  <div className="chat-actions">
                    <button 
                      className="icon-btn"
                      title="Audio Call"
                      onClick={() => startAudioCall(activeConversation.user)}
                    >
                      📞
                    </button>
                    <button 
                      className="icon-btn"
                      title="Select messages"
                      onClick={toggleSelectMode}
                    >
                      ☑️
                    </button>
                    <button 
                      className={`icon-btn ${showInfoPanel ? 'active' : ''}`}
                      title="Conversation Information"
                      onClick={() => {
                        setShowInfoPanel(!showInfoPanel);
                        setShowSettingsPanel(false);
                      }}
                    >
                      ℹ️
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* ============================================ */}
            {/* MESSAGES AREA - FIXED CALL HISTORY */}
            {/* ============================================ */}
            <div className="messages-area">
              {messages.length === 0 ? (
                <div className="no-messages">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isOwn = msg.sender._id === currentUser._id;
                  const showAvatar = idx === 0 || messages[idx - 1].sender._id !== msg.sender._id;
                  const isSelected = selectedMessages.includes(msg._id);

                  return (
                    <div 
                      key={msg._id} 
                      className={`message-wrapper ${isOwn ? 'own' : 'other'} ${isSelectMode ? 'select-mode' : ''} ${isSelected ? 'selected' : ''}`}
                      onClick={() => {
                        if (isSelectMode) {
                          toggleMessageSelection(msg._id);
                        }
                      }}
                    >
                      {/* ✅ SELECTION CHECKBOX */}
                      {isSelectMode && (
                        <div className="message-checkbox">
                          <input 
                            type="checkbox" 
                            checked={isSelected}
                            onChange={() => toggleMessageSelection(msg._id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      )}

                      {!isOwn && showAvatar && !isSelectMode && (
                        <img 
                          src={getAvatarUrl(msg.sender)} 
                          alt={msg.sender.firstName} 
                          className="message-avatar" 
                          onError={(e) => handleAvatarError(e, msg.sender)}
                        />
                      )}

                      {!isOwn && !showAvatar && !isSelectMode && <div className="message-avatar-spacer"></div>}

                      <div className="message-content-wrapper">

                        {msg.replyTo && (
                          <div className="reply-preview">
                            <div className="reply-line"></div>
                            <div className="reply-content">
                              <small>{msg.replyTo.sender?.firstName || 'User'}</small>
                              <p>{msg.replyTo.content}</p>
                            </div>
                          </div>
                        )}

                        {/* CALL HISTORY */}
                        {msg.type === 'call' ? (
                          <div className={`call-record ${isOwn ? 'own' : 'other'}`}>
                            <div className="call-record-content">
                              <span className="call-icon">
                                {msg.callData?.status === 'missed' ? '📞❌' : 
                                msg.callData?.status === 'declined' ? '📞🚫' :
                                msg.callData?.status === 'completed' ? '📞✅' : '📞'}
                              </span>
                              <div className="call-details">
                                <p className="call-type">
                                  {msg.callData?.callType === 'video' ? 'Video call' : 'Audio call'}
                                  {msg.callData?.status === 'missed' && (
                                    <span className="call-status-badge missed">
                                      {isOwn ? ' (No answer)' : ' (Missed)'}
                                    </span>
                                  )}
                                  {msg.callData?.status === 'declined' && (
                                    <span className="call-status-badge declined"> (Declined)</span>
                                  )}
                                  {msg.callData?.status === 'completed' && (
                                    <span className="call-status-badge completed"> (Completed)</span>
                                  )}
                                </p>
                                {msg.callData?.duration > 0 ? (
                                  <p className="call-duration-text">
                                    {Math.floor(msg.callData.duration / 60)}:{(msg.callData.duration % 60).toString().padStart(2, '0')}
                                  </p>
                                ) : (
                                  <p className="call-time-text">
                                    {new Date(msg.createdAt).toLocaleTimeString([], { 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    })}
                                  </p>
                                )}
                              </div>

                              {/* Hide action buttons in select mode */}
                              {!isSelectMode && (
                                <>
                                  <button 
                                    className="call-back-btn"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const userToCall = isOwn ? activeConversation.user : msg.sender;
                                      startAudioCall(userToCall);
                                    }}
                                    title="Call back"
                                  >
                                    📞
                                  </button>
                                  
                                  <button 
                                    className="call-delete-btn"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setShowDeleteMenu(msg._id);
                                    }}
                                    title="Delete call log"
                                  >
                                    🗑️
                                  </button>
                                </>
                              )}
                            </div>

                            {/* Delete menu */}
                            {showDeleteMenu === msg._id && !isSelectMode && (
                              <div className="delete-menu">
                                <button 
                                  onClick={() => handleDeleteMessage(msg._id, false)}
                                  className="delete-option"
                                >
                                  Delete for me
                                </button>
                                {isOwn && (
                                  <button 
                                    onClick={() => handleDeleteMessage(msg._id, true)}
                                    className="delete-option delete-everyone"
                                  >
                                    Delete for everyone
                                  </button>
                                )}
                                <button 
                                  onClick={() => setShowDeleteMenu(null)}
                                  className="delete-option cancel"
                                >
                                  Cancel
                                </button>
                              </div>
                            )}
                          </div>
                        ) : msg.type === 'sticker' ? (
                          <div className="message-sticker">
                            <img src={msg.sticker?.url} alt={msg.sticker?.name} />
                          </div>
                        ) : msg.type === 'image' && msg.media ? (
                          <div className="message-media">
                            <img src={msg.media.url} alt="attachment" className="media-preview" />
                            {msg.content && <p className="media-caption">{msg.content}</p>}
                          </div>
                        ) : msg.type === 'audio' && msg.media ? (
                          <div className="voice-message">
                            <div className="voice-message-container">
                              <span className="voice-icon">🎤</span>
                              
                              {/* ✅ FIXED: Audio player with better compatibility */}
                              <audio 
                                key={`audio-${msg._id}`}
                                controls 
                                controlsList="nodownload"
                                preload="auto"
                                crossOrigin="anonymous"
                                onLoadedMetadata={(e) => {
                                  console.log('✅ Audio loaded:', {
                                    messageId: msg._id,
                                    duration: e.target.duration,
                                    src: e.target.currentSrc
                                  });
                                  
                                  // ✅ CRITICAL: Set volume to maximum
                                  e.target.volume = 1.0;
                                  
                                  // ✅ Ensure not muted
                                  e.target.muted = false;
                                }}
                                onError={(e) => {
                                  console.error('❌ Audio playback error:', {
                                    messageId: msg._id,
                                    error: e.target.error,
                                    code: e.target.error?.code,
                                    message: e.target.error?.message,
                                    originalUrl: msg.media.url,
                                    currentSrc: e.target.currentSrc
                                  });
                                }}
                                onPlay={(e) => {
                                  console.log('▶️ Playing audio:', msg._id);
                                  console.log('🔊 Volume:', e.target.volume);
                                  console.log('🔇 Muted:', e.target.muted);
                                  
                                  // ✅ Double-check volume on play
                                  if (e.target.volume < 1.0) {
                                    e.target.volume = 1.0;
                                  }
                                  if (e.target.muted) {
                                    e.target.muted = false;
                                  }
                                }}
                                onVolumeChange={(e) => {
                                  console.log('🔊 Volume changed:', e.target.volume);
                                }}
                                style={{ 
                                  width: '100%', 
                                  maxWidth: '300px',
                                  borderRadius: '20px',
                                  backgroundColor: '#f0f2f5',
                                  padding: '4px'
                                }}
                              >
                                {/* ✅ Primary source: Processed MP3 URL */}
                                <source 
                                  src={getAudioUrl(msg.media.url)} 
                                  type="audio/mpeg" 
                                />
                                
                                {/* ✅ Fallback: Original URL with multiple formats */}
                                <source 
                                  src={msg.media.url} 
                                  type="audio/webm" 
                                />
                                <source 
                                  src={msg.media.url} 
                                  type="audio/ogg" 
                                />
                                
                                Your browser does not support the audio element.
                              </audio>
                              
                              <span className="voice-duration">
                                {msg.content || 'Voice message'}
                              </span>
                              
                              {/* ✅ DEBUG: Download link to test file */}
                              <a 
                                href={getAudioUrl(msg.media.url)} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                download={`voice-${msg._id}.mp3`}
                                style={{
                                  fontSize: '10px',
                                  color: '#65676b',
                                  marginLeft: '8px',
                                  textDecoration: 'none',
                                  cursor: 'pointer'
                                }}
                                title="Download to test"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log('📥 Downloading audio:', getAudioUrl(msg.media.url));
                                }}
                              >
                                📥
                              </a>
                            </div>
                          </div>
                        ) : (
                          <div className={`message-bubble ${isOwn ? 'own' : 'other'}`}>
                            <p>{msg.content}</p>
                            {msg.status === 'sending' && <small className="sending-indicator">Sending...</small>}
                          </div>
                        )}

                        {msg.reactions && msg.reactions.length > 0 && !isSelectMode && (
                          <div className="message-reactions">
                            {msg.reactions.map((reaction, i) => (
                              <span key={i} className="reaction-bubble" title={reaction.user?.firstName}>
                                {reaction.emoji}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Hide message actions in select mode */}
                        {msg.type !== 'call' && !isSelectMode && (
                          <div className="message-actions">
                            <button onClick={() => addReaction(msg._id, '❤️')} title="React">❤️</button>
                            <button onClick={() => addReaction(msg._id, '😂')} title="React">😂</button>
                            <button onClick={() => addReaction(msg._id, '👍')} title="React">👍</button>
                            <button onClick={() => setReplyingTo(msg)} title="Reply">↩️</button>
                            <button onClick={() => setShowDeleteMenu(msg._id)} title="Delete">🗑️</button>
                          </div>
                        )}

                        {showDeleteMenu === msg._id && !isSelectMode && (
                          <div className="delete-menu">
                            <button 
                              onClick={() => handleDeleteMessage(msg._id, false)}
                              className="delete-option"
                            >
                              Delete for me
                            </button>
                            {isOwn && (
                              <button 
                                onClick={() => handleDeleteMessage(msg._id, true)}
                                className="delete-option delete-everyone"
                              >
                                Delete for everyone
                              </button>
                            )}
                            <button 
                              onClick={() => setShowDeleteMenu(null)}
                              className="delete-option cancel"
                            >
                              Cancel
                            </button>
                          </div>
                        )}

                        {!isSelectMode && <span className="message-time">{formatTime(msg.createdAt)}</span>}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* SMART SUGGESTIONS */}
            {suggestions.length > 0 && !messageInput && messages.length > 0 && (
              <div className="smart-suggestions">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    className="suggestion-chip"
                    onClick={() => setMessageInput(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {/* REPLYING BANNER */}
            {replyingTo && (
              <div className="replying-to">
                <div className="reply-info">
                  <small>Replying to {replyingTo.sender.firstName}</small>
                  <p>{replyingTo.content}</p>
                </div>
                <button onClick={() => setReplyingTo(null)}>✕</button>
              </div>
            )}

            {/* FILE PREVIEWS */}
            {previewUrls.length > 0 && (
              <div className="file-previews">
                {previewUrls.map((url, idx) => (
                  <div key={idx} className="file-preview-item">
                    <img src={url} alt="preview" />
                    <button className="remove-file" onClick={() => removeFile(idx)}>✕</button>
                  </div>
                ))}
              </div>
            )}

            {/* CHAT INPUT AREA */}
            <div className="chat-input-area">
              <div className="input-actions-left">
                <button
                  className="icon-btn"
                  onClick={() => setShowMediaOptions(!showMediaOptions)}
                  title="Attach"
                >
                  ➕
                </button>

                {showMediaOptions && (
                  <div className="media-options">
                    <button onClick={() => fileInputRef.current?.click()}>
                      🖼️ Photo
                    </button>
                    <button onClick={() => videoInputRef.current?.click()}>
                      🎥 Video
                    </button>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />

                <button
                  className="icon-btn"
                  onClick={() => {
                    setShowStickerPicker(!showStickerPicker);
                    setShowEmojiPicker(false);
                  }}
                  title="Stickers"
                >
                  😊
                </button>
                {/* ✅ NEW: Voice message button */}
                <button
                  className="icon-btn voice-btn"
                  onClick={() => setShowVoiceRecorder(true)}
                  title="Voice message"
                >
                  🎤
                </button>
              </div>

              <input
                type="text"
                placeholder="Aa"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !loading && sendMessage()}
                className="message-input"
              />

              <div className="input-actions-right">
                <button
                  className="icon-btn"
                  onClick={() => {
                    setShowEmojiPicker(!showEmojiPicker);
                    setShowStickerPicker(false);
                  }}
                  title="Emoji"
                >
                  😀
                </button>

                <button
                  className="send-btn"
                  onClick={sendMessage}
                  disabled={(!messageInput.trim() && selectedFiles.length === 0) || loading}
                >
                  {loading ? '...' : '➤'}
                </button>
              </div>

              {showEmojiPicker && (
                <div className="emoji-picker">
                  <div className="emoji-grid">
                    {popularEmojis.map((emoji, idx) => (
                      <button key={idx} onClick={() => sendEmoji(emoji)} className="emoji-btn">
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {showStickerPicker && (
                <div className="sticker-picker">
                  <div className="sticker-tabs">
                    <button className="active">Tennis 🎾</button>
                    <button>Emotions 😊</button>
                  </div>
                  <div className="sticker-grid">
                    {Object.values(stickerPacks).flat().map(sticker => (
                      <button key={sticker.id} onClick={() => sendSticker(sticker)} className="sticker-btn">
                        <img src={sticker.url} alt={sticker.name} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="no-conversation-selected">
            <div className="empty-state">
              <div className="empty-icon">💬</div>
              <h3>Select a conversation</h3>
              <p>Choose a conversation from the sidebar to start messaging</p>

              {currentUser?.isAdmin && (
                <button 
                  className="start-chat-btn"
                  onClick={() => setShowNewChat(true)}
                >
                  Start New Chat
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ============================================ */}
      {/* INFO PANEL */}
      {/* ============================================ */}
      {showInfoPanel && activeConversation && (
        <div className="info-panel">
          <div className="info-panel-header">
            <h3>Conversation Information</h3>
            <button 
              className="close-panel-btn" 
              onClick={() => setShowInfoPanel(false)}
            >
              ✕
            </button>
          </div>
          
          <div className="info-panel-content">
            <div className="info-section">
              <div className="info-user-profile">
                <img 
                  src={getAvatarUrl(activeConversation.user)} 
                  alt={activeConversation.user.name}
                  className="info-avatar"
                  onError={(e) => handleAvatarError(e, activeConversation.user)}
                />
                <h2>{activeConversation.user.firstName} {activeConversation.user.lastName}</h2>
                <p className="info-username">@{activeConversation.user.username}</p>
                <p className="info-status">
                  {activeConversation.user.isAdmin ? '👑 Admin' : '👤 Member'}
                </p>
              </div>
            </div>

            <div className="info-section">
              <h4 className="info-section-title">Customize chat</h4>
              <button 
                className="info-option-btn"
                onClick={() => {
                  setShowSettingsPanel(true);
                  setShowInfoPanel(false);
                }}
              >
                <span className="option-icon">🎨</span>
                <div className="option-text">
                  <span className="option-title">Change theme</span>
                  <span className="option-subtitle">Set colors for this conversation</span>
                </div>
                <span className="option-arrow">›</span>
              </button>
              <button className="info-option-btn">
                <span className="option-icon">👍</span>
                <div className="option-text">
                  <span className="option-title">Change emoji</span>
                  <span className="option-subtitle">Pick a quick reaction</span>
                </div>
                <span className="option-arrow">›</span>
              </button>
            </div>

            <div className="info-section">
              <h4 className="info-section-title">Privacy & support</h4>
              <button className="info-option-btn">
                <span className="option-icon">🔕</span>
                <div className="option-text">
                  <span className="option-title">Mute notifications</span>
                  <span className="option-subtitle">Off</span>
                </div>
                <span className="option-arrow">›</span>
              </button>
              <button className="info-option-btn">
                <span className="option-icon">🔍</span>
                <div className="option-text">
                  <span className="option-title">Search in conversation</span>
                </div>
                <span className="option-arrow">›</span>
              </button>
              <button 
                className="info-option-btn danger"
                onClick={() => handleDeleteConversation(activeConversation.user._id)}
              >
                <span className="option-icon">🗑️</span>
                <div className="option-text">
                  <span className="option-title">Delete conversation</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* SETTINGS PANEL */}
      {/* ============================================ */}
      {showSettingsPanel && activeConversation && (
        <div className="settings-panel">
          <div className="settings-panel-header">
            <button 
              className="back-btn"
              onClick={() => {
                setShowSettingsPanel(false);
                setShowInfoPanel(true);
              }}
            >
              ←
            </button>
            <h3>Chat Settings</h3>
            <button 
              className="close-panel-btn" 
              onClick={() => setShowSettingsPanel(false)}
            >
              ✕
            </button>
          </div>
          
          <div className="settings-panel-content">
            <div className="settings-section">
              <h4>Theme</h4>
              <div className="theme-options">
                <button className="theme-option active">
                  <div className="theme-color" style={{background: '#0084ff'}}></div>
                  <span>Default</span>
                </button>
                <button className="theme-option">
                  <div className="theme-color" style={{background: '#e91e63'}}></div>
                  <span>Pink</span>
                </button>
                <button className="theme-option">
                  <div className="theme-color" style={{background: '#9c27b0'}}></div>
                  <span>Purple</span>
                </button>
                <button className="theme-option">
                  <div className="theme-color" style={{background: '#4caf50'}}></div>
                  <span>Green</span>
                </button>
                <button className="theme-option">
                  <div className="theme-color" style={{background: '#ff9800'}}></div>
                  <span>Orange</span>
                </button>
              </div>
            </div>

            <div className="settings-section">
              <h4>Quick Reactions</h4>
              <div className="emoji-selector">
                {['❤️', '😂', '😮', '😢', '😡', '👍'].map((emoji, idx) => (
                  <button key={idx} className="emoji-select-btn">
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="settings-section">
              <h4>Notifications</h4>
              <div className="setting-toggle">
                <div>
                  <p className="setting-title">Mute notifications</p>
                  <p className="setting-subtitle">Stop receiving notifications from this chat</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ✅ Voice Recorder */}
      {showVoiceRecorder && (
        <VoiceRecorder
          onSend={sendVoiceMessage}
          onCancel={() => setShowVoiceRecorder(false)}
          isRecording={isRecordingVoice}
          setIsRecording={setIsRecordingVoice}
        />
      )}
    </div>
  );
};

export default MessengerPage;