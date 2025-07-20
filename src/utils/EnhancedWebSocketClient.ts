// EnhancedWebSocketClient.ts
// Синглтон-совместимый WebSocket-клиент, перенесённый из MessengerContext для повторного использования

// Константы по умолчанию для работы клиента
const WEBSOCKET_CONFIG = {
  PING_INTERVAL: 25000,
  PONG_TIMEOUT: 10000,
  RECONNECT_BASE_DELAY: 1000,
  MAX_RECONNECT_ATTEMPTS: 10,
  QUEUE_MESSAGE_LIMIT: 100,
  CONNECTION_TIMEOUT: 30000,
  HEALTH_CHECK_INTERVAL: 60000,
};

interface WebSocketConfig {
  wsUrl?: string;
  sessionKey?: string;
  deviceId?: string;
  autoReconnect?: boolean;
  maxReconnectAttempts?: number;
  reconnectDelay?: number;
  pingInterval?: number;
  pongTimeout?: number;
  debug?: boolean;
}

interface WebSocketStats {
  messagesReceived: number;
  messagesSent: number;
  pingsSent: number;
  pongsReceived: number;
  reconnectCount: number;
  connectTime: Date | null;
  lastActivity: Date | null;
}

interface ClientInfo {
  userAgent: string;
  timestamp: string;
  version: string;
}

interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

// Основная реализация клиента
export default class EnhancedWebSocketClient {
  private config: Required<WebSocketConfig>;
  private ws: WebSocket | null;
  private isConnected: boolean;
  private isConnecting: boolean;
  private reconnectAttempts: number;
  private reconnectTimer: NodeJS.Timeout | null;
  private pingTimer: NodeJS.Timeout | null;
  private pongTimer: NodeJS.Timeout | null;
  private lastPingId: string | null;
  private messageQueue: WebSocketMessage[];
  private eventHandlers: { [key: string]: Function[] };
  private stats: WebSocketStats;
  private clientInfo: ClientInfo;
  private lastPong: number;

  constructor(config: WebSocketConfig = {}) {
    // Configuration
    this.config = {
      wsUrl:
        config.wsUrl ||
        `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/messenger`,
      sessionKey: config.sessionKey || '',
      deviceId: config.deviceId || this.generateDeviceId(),
      autoReconnect: config.autoReconnect !== false,
      maxReconnectAttempts: config.maxReconnectAttempts || 10,
      reconnectDelay: config.reconnectDelay || 1000,
      pingInterval: config.pingInterval || WEBSOCKET_CONFIG.PING_INTERVAL,
      pongTimeout: config.pongTimeout || WEBSOCKET_CONFIG.PONG_TIMEOUT,
      debug: config.debug !== false,
    };

    // State
    this.ws = null;
    this.isConnected = false;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.reconnectTimer = null;
    this.pingTimer = null;
    this.pongTimer = null;
    this.lastPingId = null;
    this.messageQueue = [];
    this.eventHandlers = {};
    this.stats = {
      messagesReceived: 0,
      messagesSent: 0,
      pingsSent: 0,
      pongsReceived: 0,
      reconnectCount: 0,
      connectTime: null,
      lastActivity: null,
    };

    // Client info for debugging
    this.clientInfo = {
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      version: '2.0.0',
    };

    this.log('Enhanced WebSocket client initialized', this.config);
  }

  // ---------- internal helpers ----------
  private generateDeviceId(): string {
    const existing = localStorage.getItem('k-connect-device-id');
    if (existing) return existing;

    const deviceId = 'device_' + Math.random().toString(36).substr(2, 16) + '_' + Date.now();
    localStorage.setItem('k-connect-device-id', deviceId);
    return deviceId;
  }

  private log(...args: any[]): void {
    if (this.config.debug) {
      // eslint-disable-next-line no-console
      console.log('[Enhanced WebSocket]', ...args);
    }
  }

  private emit(event: string, data: any): void {
    if (!this.eventHandlers[event]) return;
    this.eventHandlers[event].forEach((handler) => {
      try {
        handler(data);
      } catch (error) {
        this.handleError(`Error in event handler for ${event}`, error);
      }
    });
  }

  on(event: string, handler: Function): void {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }
    this.eventHandlers[event].push(handler);
  }

  off(event: string, handler: Function): void {
    if (!this.eventHandlers[event]) return;
    const i = this.eventHandlers[event].indexOf(handler);
    if (i > -1) this.eventHandlers[event].splice(i, 1);
  }

  private handleError(message: string, error: any, data: any = null): void {
    const info = {
      message,
      error: error ? error.message || error : 'Unknown error',
      timestamp: new Date().toISOString(),
      data,
    };
    this.log('Error:', info);
    this.emit('error', info);
  }

  // ---------- connection management ----------
  async connect(): Promise<void> {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.log('WebSocket already connected');
      return;
    }

    if (this.isConnecting) {
      this.log('WebSocket connection already in progress');
      return;
    }

    this.log('Connecting to WebSocket...', this.config.wsUrl);
    this.isConnecting = true;

    try {
      this.ws = new WebSocket(this.config.wsUrl);

      this.ws.onopen = () => {
        this.log('WebSocket connected');
        this.isConnected = true;
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.lastPong = Date.now();
        this.sendAuth();
        this.startPingLoop();
        this.emit('connected', {});
      };

      this.ws.onmessage = (event) => this.handleMessage(event);
      this.ws.onclose = (event) => this.handleClose(event);
      this.ws.onerror = (error) => {
        this.isConnecting = false;
        this.handleError('WebSocket error', error);
      };
    } catch (error) {
      this.isConnecting = false;
      this.handleError('Connection failed', error);
      if (this.config.autoReconnect) this.scheduleReconnect();
    }
  }

  disconnect(): void {
    this.log('Disconnect');
    this.config.autoReconnect = false;
    this.stopPingLoop();
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.ws) this.ws.close(1000, 'Client disconnect');
    this.ws = null;
    this.isConnected = false;
    this.isConnecting = false;
  }

  // ---------- authentication ----------
  private sendAuth(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    const auth = { type: 'auth', session_key: this.config.sessionKey, device_id: this.config.deviceId };
    this.ws.send(JSON.stringify(auth));
  }

  // ---------- ping / pong ----------
  private startPingLoop(): void {
    if (this.pingTimer) clearInterval(this.pingTimer);
    this.pingTimer = setInterval(() => {
      if (this.isConnected) this.sendPing();
    }, this.config.pingInterval);
  }

  private stopPingLoop(): void {
    if (this.pingTimer) clearInterval(this.pingTimer);
    if (this.pongTimer) clearTimeout(this.pongTimer);
  }

  private sendPing(): void {
    this.lastPingId = this.generateId();
    this.stats.pingsSent++;
    this.sendMessage({ type: 'ping', timestamp: Date.now(), ping_id: this.lastPingId, device_id: this.config.deviceId });
    this.pongTimer = setTimeout(() => {
      this.handleError('Pong timeout', new Error('No pong response received'));
      if (this.config.autoReconnect) {
        this.disconnect();
        this.scheduleReconnect();
      }
    }, this.config.pongTimeout);
  }

  private handlePong(data: any): void {
    this.stats.pongsReceived++;
    if (this.lastPingId === data.ping_id && this.pongTimer) {
      clearTimeout(this.pongTimer);
      this.pongTimer = null;
    }
  }

  // ---------- reconnection ----------
  private scheduleReconnect(): void {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectAttempts++;
    this.stats.reconnectCount++;
    const delay = Math.min(
      this.config.reconnectDelay * 2 ** (this.reconnectAttempts - 1),
      30000,
    ) + Math.random() * 1000;
    this.log(`Scheduling reconnect in ${Math.round(delay)}ms`);
    this.reconnectTimer = setTimeout(() => this.connect(), delay);
  }

  // ---------- messaging ----------
  sendMessage(message: WebSocketMessage): boolean {
    if (!message.device_id) message.device_id = this.config.deviceId;
    if (!this.isConnected) {
      if (this.config.autoReconnect) {
        // queue message
        if (this.messageQueue.length < WEBSOCKET_CONFIG.QUEUE_MESSAGE_LIMIT) this.messageQueue.push(message);
        if (!this.isConnecting) this.connect();
      }
      return false;
    }
    try {
      this.ws!.send(JSON.stringify(message));
      this.stats.messagesSent++;
      this.stats.lastActivity = new Date();
      return true;
    } catch (error) {
      this.handleError('Failed to send message', error);
      return false;
    }
  }

  private processMessageQueue(): void {
    if (!this.messageQueue.length) return;
    const queued = [...this.messageQueue];
    this.messageQueue = [];
    queued.forEach((m) => this.sendMessage(m));
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  sendChatMessage(chatId: string, text: string, replyToId: string | null = null, tempId: string | null = null): boolean {
    return this.sendMessage({ type: 'chat_message', chat_id: chatId, text, reply_to_id: replyToId, temp_id: tempId });
  }

  sendTypingStart(chatId: string): boolean {
    return this.sendMessage({ type: 'typing_start', chat_id: chatId });
  }

  sendTypingEnd(chatId: string): boolean {
    return this.sendMessage({ type: 'typing_end', chat_id: chatId });
  }

  sendReadReceipt(messageId: string, chatId: string): boolean {
    return this.sendMessage({ type: 'read_receipt', message_id: messageId, chat_id: chatId });
  }

  sendMessageDeleted(messageId: string, chatId: string): boolean {
    return this.sendMessage({ type: 'message_deleted', message_id: messageId, chat_id: chatId });
  }

  getChats(): boolean {
    return this.sendMessage({ type: 'get_chats' });
  }

  getMessages(chatId: string, limit: number = 30, beforeId: string | null = null, forceRefresh: boolean = false): boolean {
    return this.sendMessage({ type: 'get_messages', chat_id: chatId, limit, before_id: beforeId, force_refresh: forceRefresh });
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);
      this.stats.messagesReceived++;
      this.stats.lastActivity = new Date();

      switch (data.type) {
        case 'pong':
          this.handlePong(data);
          break;
        case 'connected':
          this.handleConnected(data);
          break;
        case 'chat_message':
        case 'typing_start':
        case 'typing_end':
        case 'read_receipt':
        case 'message_deleted':
        case 'chat_list':
        case 'message_list':
        case 'error':
          this.emit(data.type, data);
          break;
        default:
          this.log('Unknown message type:', data.type);
      }
    } catch (error) {
      this.handleError('Failed to parse message', error, event.data);
    }
  }

  private handleConnected(data: any): void {
    this.stats.connectTime = new Date();
    this.processMessageQueue();
    this.emit('connected', data);
  }

  getStats(): WebSocketStats {
    return { ...this.stats };
  }

  private handleClose(event: CloseEvent): void {
    this.isConnected = false;
    this.isConnecting = false;
    this.stopPingLoop();
    
    if (this.config.autoReconnect && event.code !== 1000) {
      this.scheduleReconnect();
    }
    
    this.emit('disconnected', { code: event.code, reason: event.reason });
  }
} 