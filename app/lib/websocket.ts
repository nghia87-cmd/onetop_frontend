import { io, Socket } from 'socket.io-client';

const WS_URL = process.env.NODE_ENV === 'production'
  ? 'wss://api.onetop.com'
  : 'ws://localhost:8000';

class WebSocketService {
  private socket: Socket | null = null;

  connect(token: string) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(WS_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Chat events
  joinChat(conversationId: string) {
    this.socket?.emit('join_chat', { conversation_id: conversationId });
  }

  leaveChat(conversationId: string) {
    this.socket?.emit('leave_chat', { conversation_id: conversationId });
  }

  sendMessage(conversationId: string, message: string) {
    this.socket?.emit('send_message', {
      conversation_id: conversationId,
      message,
    });
  }

  onMessage(callback: (data: any) => void) {
    this.socket?.on('new_message', callback);
  }

  // Notification events
  onNotification(callback: (data: any) => void) {
    this.socket?.on('notification', callback);
  }

  // Typing indicator
  startTyping(conversationId: string) {
    this.socket?.emit('typing_start', { conversation_id: conversationId });
  }

  stopTyping(conversationId: string) {
    this.socket?.emit('typing_stop', { conversation_id: conversationId });
  }

  onTyping(callback: (data: any) => void) {
    this.socket?.on('user_typing', callback);
  }

  getSocket() {
    return this.socket;
  }
}

export const wsService = new WebSocketService();
