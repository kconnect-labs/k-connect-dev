// EnhancedWebSocketClient.js
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

// Основная реализация клиента
export default class EnhancedWebSocketClient {
  constructor(config = {}) {
    // Configuration
    this.config = {
      wsUrl:
        config.wsUrl ||
        `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/messenger`,
      sessionKey: config.sessionKey,
      deviceId: config.deviceId || this.generateDeviceId(),
      autoReconnect: config.autoReconnect !== false,
      maxReconnectAttempts: config.maxReconnectAttempts || 10,
      reconnectDelay: config.reconnectDelay || 1000,
      pingInterval: config.pingInterval || WEBSOCKET_CONFIG.PING_INTERVAL,
      pongTimeout: config.pongTimeout || WEBSOCKET_CONFIG.PONG_TIMEOUT,
      debug: true,
      ...config,
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
  generateDeviceId() {
    const existing = localStorage.getItem('k-connect-device-id');
    if (existing) return existing;

    const deviceId = 'device_' + Math.random().toString(36).substr(2, 16) + '_' + Date.now();
    localStorage.setItem('k-connect-device-id', deviceId);
    return deviceId;
  }

  log(...args) {
    if (this.config.debug) {
      // eslint-disable-next-line no-console
      console.log('[Enhanced WebSocket]', ...args);
    }
  }

  emit(event, data) {
    if (!this.eventHandlers[event]) return;
    this.eventHandlers[event].forEach((handler) => {
      try {
        handler(data);
      } catch (error) {
        this.handleError(`Error in event handler for ${event}`, error);
      }
    });
  }

  on(event, handler) {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }
    this.eventHandlers[event].push(handler);
  }

  off(event, handler) {
    if (!this.eventHandlers[event]) return;
    const i = this.eventHandlers[event].indexOf(handler);
    if (i > -1) this.eventHandlers[event].splice(i, 1);
  }

  handleError(message, error, data = null) {
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
  async connect() {
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

  disconnect() {
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
  sendAuth() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    const auth = { type: 'auth', session_key: this.config.sessionKey, device_id: this.config.deviceId };
    this.ws.send(JSON.stringify(auth));
  }

  // ---------- ping / pong ----------
  startPingLoop() {
    if (this.pingTimer) clearInterval(this.pingTimer);
    this.pingTimer = setInterval(() => {
      if (this.isConnected) this.sendPing();
    }, this.config.pingInterval);
  }

  stopPingLoop() {
    if (this.pingTimer) clearInterval(this.pingTimer);
    if (this.pongTimer) clearTimeout(this.pongTimer);
  }

  sendPing() {
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

  handlePong(data) {
    this.stats.pongsReceived++;
    if (this.lastPingId === data.ping_id && this.pongTimer) {
      clearTimeout(this.pongTimer);
      this.pongTimer = null;
    }
  }

  // ---------- reconnection ----------
  scheduleReconnect() {
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
  sendMessage(message) {
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
      this.ws.send(JSON.stringify(message));
      this.stats.messagesSent++;
      this.stats.lastActivity = new Date();
      return true;
    } catch (error) {
      this.handleError('Failed to send message', error);
      return false;
    }
  }

  processMessageQueue() {
    if (!this.messageQueue.length) return;
    const queued = [...this.messageQueue];
    this.messageQueue = [];
    queued.forEach((m) => this.sendMessage(m));
  }

  // ---------- utilities ----------
  generateId() {
    return Math.random().toString(36).substr(2, 16) + Date.now().toString(36);
  }

  // ---------- high-level helpers ----------
  sendChatMessage(chatId, text, replyToId = null, tempId = null) {
    return this.sendMessage({ type: 'send_message', chatId, text, replyToId, tempId });
  }
  sendTypingStart(chatId) {
    return this.sendMessage({ type: 'typing_start', chatId });
  }
  sendTypingEnd(chatId) {
    return this.sendMessage({ type: 'typing_end', chatId });
  }
  sendReadReceipt(messageId, chatId) {
    return this.sendMessage({ type: 'read_receipt', messageId, chatId, message_id: messageId, chat_id: chatId });
  }
  sendMessageDeleted(messageId, chatId) {
    return this.sendMessage({ type: 'message_deleted', messageId, chatId });
  }
  getChats() {
    return this.sendMessage({ type: 'get_chats' });
  }
  getMessages(chatId, limit = 30, beforeId = null, forceRefresh = false) {
    return this.sendMessage({ type: 'get_messages', chat_id: chatId, limit, before_id: beforeId, force_refresh: forceRefresh });
  }

  // ---------- server message handler ----------
  handleMessage(event) {
    this.stats.messagesReceived++;
    this.stats.lastActivity = new Date();
    let data;
    try {
      data = JSON.parse(event.data);
    } catch (e) {
      this.handleError('Failed to parse message', e, event.data);
      return;
    }

    switch (data.type) {
      case 'ping':
        this.sendMessage({ type: 'pong', timestamp: data.timestamp, ping_id: data.ping_id, device_id: this.config.deviceId });
        break;
      case 'pong':
        this.handlePong(data);
        break;
      case 'connected':
        this.handleConnected(data);
        break;
      case 'error':
        this.handleError('Server error', new Error(data.message || 'Unknown'), data);
        break;
      default:
        this.emit(data.type, data);
    }
  }

  handleConnected(data) {
    this.isConnected = true;
    this.reconnectAttempts = 0;
    this.stats.connectTime = new Date();
    this.startPingLoop();
    this.processMessageQueue();
    this.emit('connected', data);
  }

  getStats() {
    return {
      ...this.stats,
      isConnected: this.isConnected,
      isConnecting: this.isConnecting,
      reconnectAttempts: this.reconnectAttempts,
      deviceId: this.config.deviceId,
      queuedMessages: this.messageQueue.length,
      uptime: this.stats.connectTime ? Date.now() - this.stats.connectTime.getTime() : 0
    };
  }

  handleClose(event) {
    this.log('WebSocket closed', event.code, event.reason);
    this.isConnected = false;
    this.isConnecting = false;
    this.stopPingLoop();
    const shouldReconnect =
      this.config.autoReconnect &&
      ![1000, 1001].includes(event.code) &&
      this.reconnectAttempts < this.config.maxReconnectAttempts;
    this.emit('disconnected', { code: event.code, reason: event.reason, willReconnect: shouldReconnect });
    if (shouldReconnect) this.scheduleReconnect();
  }
}
