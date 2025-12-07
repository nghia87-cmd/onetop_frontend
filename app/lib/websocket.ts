// Native WebSocket service for Django Channels
import { wsTicketAPI } from './api';
import { getEnv } from '~/hooks/useEnv';

const WS_URL = typeof window !== 'undefined'
  ? (getEnv().API_URL.replace('http', 'ws'))
  : 'ws://localhost:8000';

type MessageHandler = (data: any) => void;

class WebSocketService {
  private socket: WebSocket | null = null;
  private messageHandlers: Set<MessageHandler> = new Set();
  private notificationHandlers: Set<MessageHandler> = new Set();
  private typingHandlers: Set<MessageHandler> = new Set();
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private currentToken: string | null = null;
  private currentConversationId: string | null = null;

  /**
   * Connect to Django Channels WebSocket
   * @param token - JWT access token (used to get ticket)
   * @param conversationId - Chat conversation ID (optional for notifications only)
   * 
   * Security: Uses one-time ticket system
   * Flow: GET ticket → Connect with ticket → Ticket expires after 10s
   */
  async connect(token: string, conversationId?: string) {
    // Save credentials for reconnection
    this.currentToken = token;
    this.currentConversationId = conversationId || null;

    try {
      // Step 1: Get one-time ticket (expires in 10 seconds)
      const ticketResponse = await wsTicketAPI.getTicket();
      const ticket = ticketResponse.data.ticket;

      // Step 2: Connect immediately with ticket
      const endpoint = conversationId 
        ? `/ws/chat/${conversationId}/?ticket=${ticket}`
        : `/ws/notifications/?ticket=${ticket}`;
      
      const url = `${WS_URL}${endpoint}`;
      
      this.socket = new WebSocket(url);

      this.socket.onopen = () => {
        console.log('✅ WebSocket connected:', endpoint);
        this.reconnectAttempts = 0;
        // No need to send auth message - ticket already validated in handshake
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Django Channels sends messages with 'type' field
          if (data.type === 'chat_message' || data.message) {
            this.messageHandlers.forEach(handler => handler(data));
          } else if (data.type === 'notification') {
            this.notificationHandlers.forEach(handler => handler(data));
          } else if (data.type === 'typing_indicator') {
            this.typingHandlers.forEach(handler => handler(data));
          }
        } catch (error) {
          console.error('❌ Failed to parse WebSocket message:', error);
        }
      };

      this.socket.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
      };

      this.socket.onclose = (event) => {
        console.log('🔌 WebSocket disconnected:', event.code, event.reason);
        this.handleReconnect();
      };
    } catch (error) {
      console.error('❌ Failed to get WebSocket ticket or connect:', error);
      this.handleReconnect();
    }
  }

  /**
   * Auto-reconnect logic with exponential backoff
   */
  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts && this.currentToken) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      
      console.log(`🔄 Reconnecting in ${delay/1000}s... (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      this.reconnectTimeout = setTimeout(() => {
        if (this.currentToken) {
          this.connect(this.currentToken, this.currentConversationId || undefined);
        }
      }, delay);
    } else {
      console.log('❌ Max reconnection attempts reached');
    }
  }

  /**
   * Send chat message to Django Channels
   */
  sendMessage(message: string, conversationId?: string) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'chat_message',
        message,
        conversation_id: conversationId || this.currentConversationId,
      }));
    } else {
      console.warn('⚠️ WebSocket is not connected. Current state:', this.socket?.readyState);
    }
  }

  /**
   * Send typing indicator
   */
  startTyping(conversationId?: string) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'typing_start',
        conversation_id: conversationId || this.currentConversationId,
      }));
    }
  }

  stopTyping(conversationId?: string) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'typing_stop',
        conversation_id: conversationId || this.currentConversationId,
      }));
    }
  }

  /**
   * Subscribe to chat messages
   */
  onMessage(callback: MessageHandler) {
    this.messageHandlers.add(callback);
    
    // Return cleanup function
    return () => {
      this.messageHandlers.delete(callback);
    };
  }

  /**
   * Subscribe to notifications
   */
  onNotification(callback: MessageHandler) {
    this.notificationHandlers.add(callback);
    
    // Return cleanup function
    return () => {
      this.notificationHandlers.delete(callback);
    };
  }

  /**
   * Subscribe to typing indicators
   */
  onTyping(callback: MessageHandler) {
    this.typingHandlers.add(callback);
    
    // Return cleanup function
    return () => {
      this.typingHandlers.delete(callback);
    };
  }

  /**
   * Disconnect and cleanup
   */
  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    this.messageHandlers.clear();
    this.notificationHandlers.clear();
    this.typingHandlers.clear();
    this.reconnectAttempts = 0;
    this.currentToken = null;
    this.currentConversationId = null;
  }

  /**
   * Check connection status
   */
  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  /**
   * Get connection state
   */
  getState(): number {
    return this.socket?.readyState ?? WebSocket.CLOSED;
  }
}

export const wsService = new WebSocketService();
