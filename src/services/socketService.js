import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  // Initialize socket connection
  connect(token) {
    if (this.socket?.connected) {
      return this.socket;
    }

    const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

    this.socket = io(SOCKET_URL, {
      auth: {
        token: token,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    // Connection event handlers
    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
      this.connected = true;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      this.connected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
    });

    return this.socket;
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      console.log('Socket disconnected manually');
    }
  }

  // Join a chat room
  joinRoom(roomId) {
    if (this.socket) {
      this.socket.emit('join-room', roomId);
    }
  }

  // Leave a chat room
  leaveRoom(roomId) {
    if (this.socket) {
      this.socket.emit('leave-room', roomId);
    }
  }

  // Send a message
  sendMessage(messageData) {
    if (this.socket) {
      this.socket.emit('send-message', messageData);
    }
  }

  // Listen for new messages
  onNewMessage(callback) {
    if (this.socket) {
      this.socket.on('new-message', callback);
    }
  }

  // Listen for typing indicator
  onUserTyping(callback) {
    if (this.socket) {
      this.socket.on('user-typing', callback);
    }
  }

  // Emit typing event
  emitTyping(roomId) {
    if (this.socket) {
      this.socket.emit('typing', roomId);
    }
  }

  // Stop typing event
  emitStopTyping(roomId) {
    if (this.socket) {
      this.socket.emit('stop-typing', roomId);
    }
  }

  // Listen for online users
  onOnlineUsers(callback) {
    if (this.socket) {
      this.socket.on('online-users', callback);
    }
  }

  // Listen for user status changes
  onUserStatusChange(callback) {
    if (this.socket) {
      this.socket.on('user-status-change', callback);
    }
  }

  // Listen for notifications
  onNotification(callback) {
    if (this.socket) {
      this.socket.on('notification', callback);
    }
  }

  // Remove event listener
  off(eventName) {
    if (this.socket) {
      this.socket.off(eventName);
    }
  }

  // Check if socket is connected
  isConnected() {
    return this.connected && this.socket?.connected;
  }

  // Get socket instance
  getSocket() {
    return this.socket;
  }
}

// Export a single instance (Singleton pattern)
const socketService = new SocketService();
export default socketService;