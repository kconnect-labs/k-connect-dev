import React, {
  createContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  useContext,
} from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import {
  getMessengerSocket,
  resetMessengerSocket,
} from '../utils/MessengerSocket';

const logger = {
  debug: (...args) => {
    if (process.env.NODE_ENV !== 'production' || window.MESSENGER_DEV_MODE) {
      console.debug('[Messenger]', new Date().toISOString(), ...args);
    }
  },
  log: (...args) => {
    if (process.env.NODE_ENV !== 'production' || window.MESSENGER_DEV_MODE) {
      console.log('[Messenger]', new Date().toISOString(), ...args);
    }
  },
  info: (...args) => {
    console.info('[Messenger]', new Date().toISOString(), ...args);
  },
  warn: (...args) => {
    console.warn('[Messenger]', new Date().toISOString(), ...args);
  },
  error: (...args) => {
    console.error('[Messenger]', new Date().toISOString(), ...args);
  },
};

const WEBSOCKET_CONFIG = {
  PING_INTERVAL: 25000,
  PONG_TIMEOUT: 10000,
  RECONNECT_BASE_DELAY: 1000,
  MAX_RECONNECT_ATTEMPTS: 10,
  QUEUE_MESSAGE_LIMIT: 100,
  CONNECTION_TIMEOUT: 30000,
  HEALTH_CHECK_INTERVAL: 60000,
};

const DEV_MODE = process.env.NODE_ENV !== 'production';
const ORIGIN =
  (typeof window !== 'undefined' && window.location?.origin) ||
  'https://k-connect.ru';
const API_URL = `${ORIGIN}/apiMes`;

export const MessengerContext = createContext();

const buildAvatarUrl = (userId, avatarFilename) => {
  if (!avatarFilename || !userId) {
    return null;
  }

  if (avatarFilename.startsWith('http')) {
    return avatarFilename;
  }

  if (avatarFilename.startsWith('/static/uploads/avatar/')) {
    return `https://s3.k-connect.ru${avatarFilename}`;
  }

  if (avatarFilename.startsWith('/static/')) {
    return avatarFilename;
  }

  let filename = avatarFilename;
  if (
    avatarFilename.includes('uploads/avatar/') ||
    avatarFilename.includes('avatar/')
  ) {
    const parts = avatarFilename.split('/');
    filename = parts[parts.length - 1];
  }

  const finalUrl = `https://s3.k-connect.ru/static/uploads/avatar/${userId}/${filename}`;
  return finalUrl;
};

const xorCipher = (text, key) => {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    result += String.fromCharCode(charCode);
  }
  return result;
};

const formatToLocalTime = isoDateString => {
  if (!isoDateString) {
    return '';
  }

  try {
    if (
      typeof isoDateString === 'string' &&
      /^\d{1,2}:\d{2}$/.test(isoDateString)
    ) {
      return isoDateString;
    }

    if (
      typeof isoDateString === 'string' &&
      /^\d{1,2}\s+\w+$/.test(isoDateString)
    ) {
      return isoDateString;
    }

    const date = new Date(isoDateString);

    if (isNaN(date.getTime())) {
      return typeof isoDateString === 'string' ? isoDateString : '';
    }

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const result = `${hours}:${minutes}`;

    return result;
  } catch (e) {
    return typeof isoDateString === 'string' ? isoDateString : '';
  }
};

export const MessengerProvider = ({ children }) => {
  const authContext = useContext(AuthContext);

  const isChannel = authContext?.user?.type === 'channel';

  const getCookie = name => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  const sessionKeyCookie =
    getCookie('session_key') || getCookie('jwt') || getCookie('token');
  const jwtToken = localStorage.getItem('token') || sessionKeyCookie;

  const [forcedSessionKey, setForcedSessionKey] = useState(null);
  const [fetchingSessionKey, setFetchingSessionKey] = useState(false);
  const [sessionKeyAttempts, setSessionKeyAttempts] = useState(0);

  useEffect(() => {
    setSessionKeyAttempts(0);

    if (authContext?.user?.id) {
      console.log('[MessengerContext] User changed, resetting WebSocket');
      resetMessengerSocket();
      setIsSocketConnected(false);
      websocketClient.current = null;
    }
  }, [authContext?.user?.id]);

  const sessionKeyCookieValue = getCookie('session_key');

  const sessionKey =
    authContext?.sessionKey ||
    authContext?.session_key ||
    localStorage.getItem('session_key') ||
    getCookie('session_key') ||
    sessionKeyCookie ||
    forcedSessionKey ||
    jwtToken;

  React.useEffect(() => {
    if (sessionKey) {
      let source = 'unknown';
      if (authContext?.sessionKey) source = 'authContext.sessionKey';
      else if (authContext?.session_key) source = 'authContext.session_key';
      else if (localStorage.getItem('session_key')) source = 'localStorage';
      else if (getCookie('session_key')) source = 'cookie session_key';
      else if (sessionKeyCookie) source = 'cookie jwt/token';
      else if (forcedSessionKey) source = 'forced session key';
      else if (jwtToken) source = 'jwt token';

      console.log(`MessengerContext: session_key получен из: ${source}`);
    }
  }, [
    sessionKey,
    authContext?.sessionKey,
    authContext?.session_key,
    sessionKeyCookie,
    forcedSessionKey,
    jwtToken,
  ]);

  const [deviceId] = useState(() => {
    const existingDeviceId = localStorage.getItem('messenger_device_id');
    if (existingDeviceId) return existingDeviceId;

    const newDeviceId =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
    localStorage.setItem('messenger_device_id', newDeviceId);
    return newDeviceId;
  });

  useEffect(() => {
    if (jwtToken && !localStorage.getItem('session_key')) {
      localStorage.setItem('session_key', jwtToken);
      console.log(
        'Контекст мессенджера: Использование JWT токена в качестве session_key'
      );
    }

    if (sessionKeyCookieValue && !localStorage.getItem('session_key')) {
      localStorage.setItem('session_key', sessionKeyCookieValue);
      console.log(
        'Контекст мессенджера: Сохранение session_key из cookie в localStorage'
      );
    }

    if (sessionKeyCookie && !localStorage.getItem('session_key')) {
      localStorage.setItem('session_key', sessionKeyCookie);
      console.log(
        'Контекст мессенджера: Сохранение других session токенов из cookie в localStorage'
      );
    }
  }, [jwtToken, sessionKeyCookie, sessionKeyCookieValue]);

  useEffect(() => {
    const setupAuthHeaders = () => {
      if (sessionKey) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${sessionKey}`;
      } else if (jwtToken) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${jwtToken}`;
      }
    };

    setupAuthHeaders();

    return () => {
      delete axios.defaults.headers.common['Authorization'];
    };
  }, [sessionKey, jwtToken]);

  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState({});
  const [onlineUsers, setOnlineUsers] = useState({});
  const [typingUsers, setTypingUsers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState({});
  const [lastFetchedMessageId, setLastFetchedMessageId] = useState({});

  const [globalLoading, setGlobalLoading] = useState(false);
  const [lastRequestTime, setLastRequestTime] = useState({});
  const activeRequestsRef = useRef({});
  const requestQueueRef = useRef({});

  const safeRequest = useCallback(
    async (key, fn) => {
      if (activeRequestsRef.current[key]) {
        logger.debug(`Request ${key} already in progress, skipping duplicate`);
        return null;
      }

      const now = Date.now();
      const lastRequest = lastRequestTime[key] || 0;
      if (now - lastRequest < 1000) {
        logger.debug(`Too frequent requests for ${key}, skipping`);
        return null;
      }

      try {
        activeRequestsRef.current[key] = true;
        setLastRequestTime(prev => ({ ...prev, [key]: now }));

        return await fn();
      } finally {
        setTimeout(() => {
          activeRequestsRef.current[key] = false;
        }, 300);
      }
    },
    [lastRequestTime]
  );

  const websocketClient = useRef(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [socketStats, setSocketStats] = useState({
    messagesReceived: 0,
    messagesSent: 0,
    pingsSent: 0,
    pongsReceived: 0,
    reconnectCount: 0,
    connectTime: null,
    lastActivity: null,
    uptime: 0,
  });

  const initializeWebSocket = useCallback(() => {
    if (!sessionKey || isChannel) return null;

    logger.info('Initializing Enhanced WebSocket client');

    const client = getMessengerSocket({
      sessionKey: sessionKey,
      deviceId: deviceId,
      autoReconnect: true,
      maxReconnectAttempts: WEBSOCKET_CONFIG.MAX_RECONNECT_ATTEMPTS,
      reconnectDelay: WEBSOCKET_CONFIG.RECONNECT_BASE_DELAY,
      pingInterval: WEBSOCKET_CONFIG.PING_INTERVAL,
      pongTimeout: WEBSOCKET_CONFIG.PONG_TIMEOUT,
      debug: DEV_MODE || window.MESSENGER_DEV_MODE,
    });

    if (client.eventHandlers) {
      Object.keys(client.eventHandlers).forEach(event => {
        client.eventHandlers[event] = [];
      });
    }

    client.on('connected', data => {
      logger.info('улучшенный сокет подключен:', data);
      setIsSocketConnected(true);
      setSocketStats(client.getStats());
    });

    client.on('disconnected', data => {
      logger.warn('улучшенный сокет отключен:', data);
      setIsSocketConnected(false);
      setSocketStats(client.getStats());
    });

    client.on('error', error => {
      logger.error('Enhance d WebSocket error:', error);
      setError(error.message || 'WebSocket connection error');
    });

    client.on('new_message', data => {
      handleWebSocketMessage(data);
    });

    client.on('message_read', data => {
      handleWebSocketMessage(data);
    });

    client.on('typing_indicator', data => {
      handleWebSocketMessage(data);
    });

    client.on('typing_indicator_end', data => {
      handleWebSocketMessage(data);
    });

    client.on('user_status', data => {
      handleWebSocketMessage(data);
    });

    client.on('chat_update', data => {
      handleWebSocketMessage(data);
    });

    client.on('chats', data => {
      handleWebSocketMessage(data);
    });

    client.on('messages', data => {
      handleWebSocketMessage(data);
    });

    client.on('message_sent', data => {
      handleWebSocketMessage(data);
    });

    client.on('message_deleted', data => {
      handleWebSocketMessage(data);
    });

    client.on('unread_counts', data => {
      handleWebSocketMessage(data);
    });

    return client;
  }, [sessionKey, isChannel, deviceId]);

  const forceReconnectWebSocket = useCallback(() => {
    logger.info('принудительное переподключение сокета');

    if (websocketClient.current) {
      try {
        websocketClient.current.disconnect();
      } catch (error) {
        logger.error('ошибка при принудительном отключении сокета:', error);
      }
    }

    const newClient = initializeWebSocket();
    if (newClient) {
      websocketClient.current = newClient;
      newClient.connect().catch(error => {
        logger.error(
          'ошибка при принудительном переподключении сокета:',
          error
        );
      });
    }
  }, [initializeWebSocket]);

  const connectEnhancedWebSocket = useCallback(async () => {
    if (isChannel || !sessionKey) return;

    const client = getMessengerSocket({
      sessionKey: sessionKey,
      deviceId: deviceId,
      autoReconnect: true,
      maxReconnectAttempts: WEBSOCKET_CONFIG.MAX_RECONNECT_ATTEMPTS,
      reconnectDelay: WEBSOCKET_CONFIG.RECONNECT_BASE_DELAY,
      pingInterval: WEBSOCKET_CONFIG.PING_INTERVAL,
      pongTimeout: WEBSOCKET_CONFIG.PONG_TIMEOUT,
      debug: DEV_MODE || window.MESSENGER_DEV_MODE,
    });

    if (client && (client.isConnected || client.isConnecting)) {
      logger.info('сокет уже подключен');
      websocketClient.current = client;
      if (client.isConnected) {
        setIsSocketConnected(true);
        setSocketStats(client.getStats());
      }
      return;
    }

    logger.info('Connecting Enhanced WebSocket...');

    const setupClient = initializeWebSocket();
    if (setupClient) {
      websocketClient.current = setupClient;

      try {
        await setupClient.connect();
        logger.info('улучшенный сокет подключен');

        try {
          setupClient.sendMessage({ type: 'get_chats' });
        } catch (e) {
          logger.debug('failed initial get_chats', e);
        }
      } catch (error) {
        logger.error('Ошибка подключения улучшенного сокета:', error);
        setError('Failed to connect to messaging server');
      }
    }
  }, [isChannel, sessionKey, deviceId, initializeWebSocket]);

  useEffect(() => {
    if (!isSocketConnected || !websocketClient.current) return;

    const updateStats = () => {
      if (websocketClient.current) {
        setSocketStats(websocketClient.current.getStats());
      }
    };

    const interval = setInterval(updateStats, 5000);

    return () => clearInterval(interval);
  }, [isSocketConnected]);

  useEffect(() => {
    return () => {
      if (websocketClient.current) {
        try {
          websocketClient.current.disconnect();
        } catch (error) {
          logger.debug('Error during cleanup:', error);
        }
      }
    };
  }, []);

  const handleWebSocketMessage = data => {
    const { type } = data;

    lastMessageTimeRef.current = Date.now();

    switch (type) {
      case 'connected':
        console.log('Connected as', data.user);
        break;

      case 'pong':
        break;

      case 'error':
        console.error('WebSocket error:', data.message);
        setError(data.message);

        if (
          data.message &&
          (data.message.includes('authentication') ||
            data.message.includes('session expired') ||
            data.message.includes('unauthorized'))
        ) {
          console.log(
            'Серьезная ошибка авторизации, переподключение через 2 секунды'
          );
          setTimeout(() => forceReconnectWebSocket(), 2000);
        }
        break;

      case 'new_message':
        const newMessageChatId = data.chatId || data.chat_id;
        const newMessage = data.message;

        if (data.temp_id) {
          newMessage.temp_id = data.temp_id;
        }

        if (newMessage?.sender) {
          const senderId = newMessage.sender.id || newMessage.sender_id;

          if (senderId) {
            if (
              newMessage.sender.avatar &&
              newMessage.sender.avatar.includes('/api/messenger/files/')
            ) {
              console.log(
                `Исправляем неправильный путь аватара отправителя ${senderId}:`,
                newMessage.sender.avatar
              );
              newMessage.sender.avatar = null;
            }

            if (!newMessage.sender.avatar && avatarCache[senderId]) {
              newMessage.sender.avatar = avatarCache[senderId];
              console.log(
                `Применение кэшированной аватарки для отправителя ${senderId}`
              );
            } else if (!newMessage.sender.avatar && newMessage.sender.photo) {
              newMessage.sender.avatar = getAvatarUrl(
                senderId,
                newMessage.sender.photo
              );
              console.log(`Обработка новой аватарки отправителя ${senderId}`);
            }
          }
        }

        const isOwnMessageFromOtherDevice = newMessage?.sender_id === user?.id;

        if (isOwnMessageFromOtherDevice) {
          console.log(
            'Получено собственное сообщение от другого устройства:',
            newMessage.id
          );
        }

        const chatExists = chats.some(c => c.id === parseInt(newMessageChatId));

        if (!chatExists) {
          console.log(
            `Получено сообщение для чата ${newMessageChatId}, который не в списке, обновляем список чатов...`
          );
          refreshChats();
        }

        handleNewMessage(newMessage, newMessageChatId);
        break;

      case 'message_read':
      case 'read_receipt':
        console.log('Received message_read event:', data);
        const messageId = data.messageId || data.message_id;
        const chatId = data.chatId || data.chat_id;
        const userId = data.userId || data.user_id;
        updateReadStatus(messageId, chatId, userId);
        break;

      case 'typing_indicator':
        updateTypingStatus(
          data.chatId || data.chat_id,
          data.userId || data.user_id,
          true
        );
        break;

      case 'typing_indicator_end':
        updateTypingStatus(
          data.chatId || data.chat_id,
          data.userId || data.user_id,
          false
        );
        break;

      case 'user_status':
        updateUserStatus(data.user_id, data.status === 'online');
        break;

      case 'chat_update':
        if (data.chat) {
          console.log('Получено обновление данных чата:', data.chat.id);

          if (data.chat.members && Array.isArray(data.chat.members)) {
            data.chat.members.forEach(member => {
              const userId = member.user_id || member.id;

              if (userId) {
                if (
                  member.avatar &&
                  member.avatar.includes('/api/messenger/files/')
                ) {
                  console.log(
                    `Исправляем неправильный путь аватара участника ${userId}:`,
                    member.avatar
                  );
                  member.avatar = null;
                }

                if (!member.avatar && avatarCache[userId]) {
                  member.avatar = avatarCache[userId];
                  console.log(
                    `WebSocket chat_update: Использована кэшированная аватарка для участника ${userId}`
                  );
                } else if (!member.avatar) {
                  const photo = member.photo || member.avatar;
                  if (photo) {
                    member.avatar = getAvatarUrl(userId, photo);
                    console.log(
                      `WebSocket chat_update: Обработка аватара для участника ${userId}`
                    );
                  }
                }
              }
            });
          }

          if (!data.chat.is_group && data.chat.members) {
            const otherMember = data.chat.members.find(m => {
              const memberId = m.user_id || m.id;
              const memberIdStr = memberId ? String(memberId) : null;
              const currentUserIdStr = user?.id ? String(user.id) : null;
              return (
                memberIdStr &&
                currentUserIdStr &&
                memberIdStr !== currentUserIdStr
              );
            });

            if (otherMember) {
              const otherUserId = otherMember.user_id || otherMember.id;

              if (otherUserId && avatarCache[otherUserId]) {
                data.chat.avatar = avatarCache[otherUserId];
                console.log(
                  `WebSocket chat_update: Использована кэшированная аватарка для чата ${data.chat.id}`
                );
              } else if (otherUserId) {
                const photo = otherMember.photo || otherMember.avatar;
                if (photo) {
                  data.chat.avatar = getAvatarUrl(otherUserId, photo);
                  console.log(
                    `WebSocket chat_update: Обработка аватара для чата ${data.chat.id}`
                  );
                }
              }
            }
          }

          setChats(prev => {
            const chatIndex = prev.findIndex(c => c.id === data.chat.id);
            if (chatIndex === -1) return prev;

            const currentChat = prev[chatIndex];

            const newChat = { ...data.chat };
            if (
              currentChat.avatar &&
              typeof currentChat.avatar === 'string' &&
              currentChat.avatar.startsWith('/static/')
            ) {
              newChat.avatar = currentChat.avatar;
            }

            const newChats = [...prev];
            newChats[chatIndex] = newChat;
            return newChats;
          });
        }
        break;

      case 'chats':
        console.log(
          'Получен список чатов через WebSocket:',
          data.chats?.length || 0
        );
        if (data.chats && Array.isArray(data.chats)) {
          const filteredChats = data.chats.filter(chat => {
            if (chat.members) {
              const hasChannels = chat.members.some(
                member => member.type === 'channel'
              );
              return !hasChannels;
            }
            return true;
          });

          const newUnreadCounts = {};

          filteredChats.forEach(chat => {
            newUnreadCounts[chat.id] = chat.unread_count || 0;

            if (chat.last_message && chat.last_message.created_at) {
              chat.last_message.created_at = formatToLocalTime(
                chat.last_message.created_at
              );
            }

            if (chat.members && Array.isArray(chat.members)) {
              chat.members.forEach(member => {
                if (member.last_active) {
                  member.last_active = formatToLocalTime(member.last_active);
                }

                const userId = member.user_id || member.id;

                if (userId && avatarCache[userId]) {
                  member.avatar = avatarCache[userId];
                } else if (userId) {
                  const photo = member.photo || member.avatar;
                  if (photo) {
                    member.avatar = getAvatarUrl(userId, photo);
                  }
                }
              });
            }

            if (!chat.is_group && chat.members) {
              const otherMember = chat.members.find(m => {
                const memberId = m.user_id || m.id;

                const memberIdStr = memberId ? String(memberId) : null;
                const currentUserIdStr = user?.id ? String(user.id) : null;

                return (
                  memberIdStr &&
                  currentUserIdStr &&
                  memberIdStr !== currentUserIdStr
                );
              });

              if (otherMember) {
                const otherUserId = otherMember.user_id || otherMember.id;

                if (otherUserId && avatarCache[otherUserId]) {
                  chat.avatar = avatarCache[otherUserId];
                } else if (otherUserId) {
                  const photo = otherMember.photo || otherMember.avatar;
                  if (photo) {
                    chat.avatar = getAvatarUrl(otherUserId, photo);
                  }
                }

                if (!chat.title) {
                  chat.title =
                    otherMember.name ||
                    otherMember.username ||
                    `Пользователь #${otherUserId}`;
                }
              }
            }
          });

          setChats(filteredChats);

          setUnreadCounts(prevCounts => {
            const prevKeys = Object.keys(prevCounts);
            const newKeys = Object.keys(newUnreadCounts);

            if (
              prevKeys.length === newKeys.length &&
              prevKeys.every(k => prevCounts[k] === newUnreadCounts[k])
            ) {
              return prevCounts;
            }

            return newUnreadCounts;
          });
          console.log(
            'Загружены счетчики непрочитанных через WebSocket:',
            newUnreadCounts
          );

          const newHasMoreMessages = {};
          const newLastFetchedMessageId = {};

          filteredChats.forEach(chat => {
            newHasMoreMessages[chat.id] = true;
            newLastFetchedMessageId[chat.id] = null;
          });

          setHasMoreMessages(newHasMoreMessages);
          setLastFetchedMessageId(newLastFetchedMessageId);
        }
        break;

      case 'messages':
        console.log(
          `Получены сообщения через WebSocket для чата ${data.chat_id}:`,
          data.messages?.length || 0
        );
        if (data.messages && Array.isArray(data.messages)) {
          const chatId = data.chat_id;
          const newMessages = data.messages;

          newMessages.forEach(msg => {
            if (msg.created_at) {
              msg.created_at = formatToLocalTime(msg.created_at);
            }
          });

          const hasModeratorMessages = data.has_moderator_messages === true;

          setMessages(prev => {
            const existingMessages = prev[chatId] || [];

            const isLoadingOlderMessages = existingMessages.length > 0;

            let mergedMessages;

            if (isLoadingOlderMessages) {
              console.log(
                '📜 WebSocket: Loading older messages - adding to beginning'
              );
              const uniqueNewMessages = newMessages.filter(
                newMsg => !existingMessages.some(msg => msg.id === newMsg.id)
              );
              mergedMessages = [...uniqueNewMessages, ...existingMessages];
            } else {
              console.log('🆕 WebSocket: Initial message loading');
              mergedMessages = [...existingMessages];
              newMessages.forEach(newMsg => {
                if (!mergedMessages.some(msg => msg.id === newMsg.id)) {
                  mergedMessages.push(newMsg);
                }
              });
            }

            mergedMessages.sort((a, b) => a.id - b.id);

            mergedMessages.hasModeratorMessages = hasModeratorMessages;

            console.log(
              `Chat ${chatId}: final merged messages:`,
              mergedMessages.length
            );
            console.log(
              `Chat ${chatId}: first message date:`,
              mergedMessages[0]?.created_at
            );
            console.log(
              `Chat ${chatId}: last message date:`,
              mergedMessages[mergedMessages.length - 1]?.created_at
            );
            console.log(`=== END WEBSOCKET LOAD MESSAGES STATE UPDATE ===`);

            return {
              ...prev,
              [chatId]: mergedMessages,
            };
          });

          if (newMessages.length < 30) {
            setHasMoreMessages(prev => ({
              ...prev,
              [chatId]: false,
            }));
          } else {
            const oldestMsgId = Math.min(...newMessages.map(m => m.id));
            setLastFetchedMessageId({
              ...lastFetchedMessageId,
              [chatId]: oldestMsgId,
            });
          }

          if (user) {
            newMessages.forEach(msg => {
              if (msg.sender_id !== user.id) {
                debouncedMarkMessageAsRead(msg.id);
              }
            });
          }
        }
        break;

      case 'message_sent':
        console.log(
          'Подтверждение отправки сообщения:',
          data.messageId,
          data.tempId,
          data.clientMessageId
        );

        if (data.tempId && data.messageId) {
          setMessages(prev => {
            const updatedMessages = { ...prev };

            Object.keys(updatedMessages).forEach(chatId => {
              const chatMessages = updatedMessages[chatId];
              // Ищем по tempId или clientMessageId для большей надежности
              const tempIndex = chatMessages.findIndex(
                msg =>
                  msg.id === data.tempId ||
                  msg.client_message_id === data.clientMessageId ||
                  (msg.is_temp &&
                    msg.content === data.content &&
                    msg.sender_id === user?.id)
              );

              if (tempIndex !== -1) {
                const tempMessage = chatMessages[tempIndex];
                const realMessage = {
                  ...tempMessage,
                  id: data.messageId,
                  is_temp: false,
                  reply_to_id: tempMessage.reply_to_id,
                  client_message_id: data.clientMessageId,
                };

                const newChatMessages = [...chatMessages];
                newChatMessages[tempIndex] = realMessage;
                updatedMessages[chatId] = newChatMessages;

                console.log(
                  `Заменено временное сообщение ${data.tempId} на реальное ${data.messageId} (client_id: ${data.clientMessageId})`
                );
              }
            });

            return updatedMessages;
          });
        }
        break;

      case 'message_deleted':
        console.log(
          'Получено событие удаления сообщения:',
          data.messageId,
          data.chatId
        );

        if (data.messageId && data.chatId) {
          const chatId = data.chatId;
          const messageId = data.messageId;

          setMessages(prev => {
            const chatMessages = prev[chatId] || [];

            const updatedChatMessages = chatMessages.filter(
              msg => msg.id !== messageId
            );

            return {
              ...prev,
              [chatId]: updatedChatMessages,
            };
          });

          setChats(prev => {
            const chatIndex = prev.findIndex(c => c.id === chatId);
            if (chatIndex === -1) return prev;

            const chat = prev[chatIndex];
            if (chat.last_message && chat.last_message.id === messageId) {
              const chatMessages = messages[chatId] || [];
              const newLastMessage = chatMessages
                .filter(msg => msg.id !== messageId)
                .sort(
                  (a, b) => new Date(b.created_at) - new Date(a.created_at)
                )[0];

              const updatedChat = { ...chat };
              if (newLastMessage) {
                updatedChat.last_message = newLastMessage;
              } else {
                delete updatedChat.last_message;
              }

              const newChats = [...prev];
              newChats[chatIndex] = updatedChat;
              return newChats;
            }

            return prev;
          });
        }
        break;

      case 'unread_counts':
        console.log('Received unread_counts via WebSocket:', data);
        const incomingCounts = data.counts || {};
        const totalChats = data.totalChats || 0;

        setUnreadCounts(prevCounts => {
          const prevKeys = Object.keys(prevCounts);
          const newKeys = Object.keys(incomingCounts);

          if (
            prevKeys.length === newKeys.length &&
            prevKeys.every(key => prevCounts[key] === incomingCounts[key])
          ) {
            return prevCounts;
          }

          return incomingCounts;
        });
        break;

      default:
        console.log('Unknown message type:', type, data);
    }
  };

  const updateUserStatus = (userId, isOnline) => {
    if (!userId) return;

    setOnlineUsers(prev => ({
      ...prev,
      [userId]: isOnline ? new Date().toISOString() : null,
    }));
  };

  const updateTypingStatus = (chatId, userId, isTyping) => {
    if (!chatId || !userId) return;

    const now = new Date().toISOString();

    setTypingUsers(prev => {
      const chatTyping = prev[chatId] || {};

      if (isTyping) {
        return {
          ...prev,
          [chatId]: {
            ...chatTyping,
            [userId]: now,
          },
        };
      } else {
        return {
          ...prev,
          [chatId]: {
            ...chatTyping,
            [userId]: 'end-' + now,
          },
        };
      }
    });

    if (!isTyping) {
      setTimeout(() => {
        setTypingUsers(current => {
          const chatTyping = current[chatId] || {};
          const userTypingStatus = chatTyping[userId];

          if (
            userTypingStatus &&
            typeof userTypingStatus === 'string' &&
            userTypingStatus.startsWith('end-')
          ) {
            const newChatTyping = { ...chatTyping };
            delete newChatTyping[userId];

            if (Object.keys(newChatTyping).length === 0) {
              const newTypingUsers = { ...current };
              delete newTypingUsers[chatId];
              return newTypingUsers;
            }

            return {
              ...current,
              [chatId]: newChatTyping,
            };
          }

          return current;
        });
      }, 5000);
    }
  };

  const fetchCurrentUser = useCallback(async () => {
    if (!sessionKey || isChannel) return;

    try {
      console.log('Загрузка информации о текущем пользователе...');
      const response = await fetch(`${API_URL}/messenger/user`, {
        headers: {
          Authorization: `Bearer ${sessionKey}`,
          Accept: 'application/json',
        },
      });

      const data = await response.json();

      if (data.success && data.user) {
        console.log('Получена информация о пользователе:', data.user);
        setUser(data.user);

        setTimeout(() => {
          loadChats();
        }, 100);
      } else {
        console.error(
          'Ошибка получения информации о пользователе:',
          data.error
        );
        setError('Ошибка получения информации о пользователе');
      }
    } catch (err) {
      console.error('Ошибка получения информации о пользователе:', err);
      setError('Ошибка получения информации о пользователе');
    }
  }, [sessionKey, API_URL]);

  useEffect(() => {
    if (sessionKey) {
      console.log('MessengerContext: Initializing with session key');
      fetchCurrentUser();
    } else {
      console.warn('MessengerContext: No session key available');
    }

    return () => {
      if (websocketClient.current) {
        websocketClient.current.disconnect();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
    };
  }, [sessionKey, fetchCurrentUser, isChannel]);

  const reconnectTimeoutRef = useRef(null);
  const pingIntervalRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const lastMessageTimeRef = useRef(Date.now());
  const errorReportRef = useRef({});
  const connectionCheckTimerRef = useRef(null);

  const setErrorReportRef = {
    current: (key, message) => {
      errorReportRef.current[key] = {
        message,
        timestamp: new Date().toISOString(),
        device: navigator.userAgent,
      };
    },
  };

  const startConnectionChecker = useCallback(() => {
    if (connectionCheckTimerRef.current) {
      clearInterval(connectionCheckTimerRef.current);
    }

    lastMessageTimeRef.current = Date.now();

    connectionCheckTimerRef.current = setInterval(() => {
      if (isSocketConnected && websocketClient.current) {
        const stats = websocketClient.current.getStats();
        if (
          stats.lastActivity &&
          Date.now() - stats.lastActivity.getTime() > 45000
        ) {
          logger.warn(
            'Detected inactive connection (45 sec without messages), forcing reconnect'
          );
          forceReconnectWebSocket();
        }
      }
    }, 15000);
  }, [isSocketConnected, forceReconnectWebSocket]);

  const reconnectWebSocket = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(
      navigator.userAgent
    );
    const maxDelay = isMobile ? 15000 : 30000;
    const baseDelay = isMobile ? 800 : 1000;

    const randomFactor = 0.5 + Math.random();
    const delay = Math.min(
      baseDelay * Math.pow(1.5, reconnectAttempts.current) * randomFactor,
      maxDelay
    );

    reconnectAttempts.current += 1;

    logger.info(
      `Scheduling Enhanced WebSocket reconnection in ${Math.round(delay)}ms (attempt #${reconnectAttempts.current})`
    );

    reconnectTimeoutRef.current = setTimeout(() => {
      logger.info(
        `Enhanced WebSocket reconnection attempt #${reconnectAttempts.current}`
      );

      if (reconnectAttempts.current > 5) {
        forceReconnectWebSocket();
      } else {
        connectEnhancedWebSocket();
      }
    }, delay);
  }, [connectEnhancedWebSocket, forceReconnectWebSocket]);

  const handleNewMessage = (message, chatId) => {
    if (!message || !chatId) return;

    if (message.sender) {
      const senderId = message.sender.id || message.sender_id;

      if (senderId) {
        if (
          message.sender.avatar &&
          message.sender.avatar.includes('/api/messenger/files/')
        ) {
          console.log(
            `Исправляем неправильный путь аватара отправителя ${senderId}:`,
            message.sender.avatar
          );
          message.sender.avatar = null;
        }

        if (!message.sender.avatar && avatarCache[senderId]) {
          message.sender.avatar = avatarCache[senderId];
          console.log(
            `Применение кэшированной аватарки для отправителя ${senderId}`
          );
        } else if (!message.sender.avatar && message.sender.photo) {
          message.sender.avatar = getAvatarUrl(senderId, message.sender.photo);
          console.log(`Обработка новой аватарки отправителя ${senderId}`);
        }
      }
    }

    if (message.message_type && message.message_type !== 'text') {
      const messageType = message.message_type;
      const content = message.content;

      if (content) {
        if (messageType === 'photo' && !message.photo_url) {
          message.photo_url = getFileUrl(chatId, content);
          console.debug(`Сгенерирован URL для фото: ${message.photo_url}`);
        } else if (messageType === 'video' && !message.video_url) {
          message.video_url = getFileUrl(chatId, content);
          console.debug(`Сгенерирован URL для видео: ${message.video_url}`);
        } else if (messageType === 'audio' && !message.audio_url) {
          message.audio_url = getFileUrl(chatId, content);
          console.debug(`Сгенерирован URL для аудио: ${message.audio_url}`);
        } else if (messageType === 'file' && !message.file_url) {
          message.file_url = getFileUrl(chatId, content);
          console.debug(`Сгенерирован URL для файла: ${message.file_url}`);
        }
      } else {
        console.warn(
          `У сообщения ${message.id} типа ${messageType} отсутствует содержимое`
        );
      }
    }

    const isFromCurrentUser = message.sender_id === user?.id;
    const numChatId = typeof chatId === 'string' ? parseInt(chatId) : chatId;

    setMessages(prev => {
      const chatMessages = prev[numChatId] || [];

      if (chatMessages.some(m => m.id === message.id)) {
        console.log(`Сообщение с ID ${message.id} уже существует, пропускаем`);
        return prev;
      }

      // Дополнительная проверка: если это сообщение от текущего пользователя,
      // проверяем, нет ли уже сообщения с таким же содержимым и временем
      if (isFromCurrentUser) {
        // Проверяем по client_message_id или temp_id
        if (message.client_message_id || message.temp_id) {
          const existingMessage = chatMessages.find(
            m =>
              m.client_message_id === message.client_message_id ||
              m.temp_id === message.temp_id ||
              (m.content === message.content &&
                m.sender_id === message.sender_id &&
                Math.abs(
                  new Date(m.created_at) - new Date(message.created_at)
                ) < 5000)
          );

          if (existingMessage) {
            console.log(
              `Найден дубликат сообщения по ID или содержимому, пропускаем ${message.id}`
            );
            return prev;
          }
        }
      }

      if (isFromCurrentUser && message.temp_id) {
        const tempMessageIndex = chatMessages.findIndex(
          m => m.is_temp && m.id === message.temp_id
        );

        if (tempMessageIndex !== -1) {
          console.log(
            `Заменяем временное сообщение ${message.temp_id} на реальное ${message.id}`
          );

          const newChatMessages = [...chatMessages];
          newChatMessages[tempMessageIndex] = message;

          return {
            ...prev,
            [numChatId]: newChatMessages.sort((a, b) => a.id - b.id),
          };
        }
      }

      if (isFromCurrentUser && !message.temp_id) {
        const now = new Date();
        const messageTime = new Date(message.created_at);
        const timeDiff = Math.abs(now - messageTime);

        if (timeDiff < 30000) {
          const duplicateIndex = chatMessages.findIndex(
            m =>
              m.content === message.content &&
              m.sender_id === message.sender_id &&
              m.is_temp &&
              Math.abs(new Date(m.created_at) - messageTime) < 10000
          );

          if (duplicateIndex !== -1) {
            console.log(
              `Заменяем временное сообщение на реальное (дедупликация по содержимому)`
            );
            const newChatMessages = [...chatMessages];
            newChatMessages[duplicateIndex] = message;

            return {
              ...prev,
              [numChatId]: newChatMessages.sort((a, b) => a.id - b.id),
            };
          }
        }

        // Дополнительная проверка: если есть временное сообщение с таким же содержимым и отправителем
        // в течение последних 60 секунд, считаем это дубликатом
        const recentDuplicateIndex = chatMessages.findIndex(
          m =>
            m.content === message.content &&
            m.sender_id === message.sender_id &&
            m.is_temp &&
            Math.abs(new Date(m.created_at) - messageTime) < 60000
        );

        if (recentDuplicateIndex !== -1) {
          console.log(
            `Найден недавний дубликат временного сообщения, заменяем на реальное ${message.id}`
          );

          const newChatMessages = [...chatMessages];
          newChatMessages[recentDuplicateIndex] = message;

          return {
            ...prev,
            [numChatId]: newChatMessages.sort((a, b) => a.id - b.id),
          };
        }
      }

      return {
        ...prev,
        [numChatId]: [...chatMessages, message].sort((a, b) => a.id - b.id),
      };
    });
  };

  const markMessageAsRead = async messageId => {
    if (!user || !messageId || isChannel) return;

    try {
      const message = Object.values(messages)
        .flat()
        .find(msg => msg.id === messageId);

      if (message && message.sender_id === user?.id) {
        logger.debug(`Skipping read receipt for own message ${messageId}`);
        return;
      }

      if (message && message.read_by && message.read_by.includes(user.id)) {
        logger.debug(
          `Message ${messageId} already marked as read by user ${user.id}`
        );
        return;
      }

      if (websocketClient.current && websocketClient.current.isConnected) {
        const chatId = Object.keys(messages).find(chatId =>
          messages[chatId].some(message => message.id === messageId)
        );

        if (chatId) {
          const targetMessage = messages[chatId].find(
            msg => msg.id === messageId
          );
          if (targetMessage && targetMessage.sender_id !== user?.id) {
            logger.debug(
              `Sending read receipt for message ${messageId} in chat ${chatId} from user ${targetMessage.sender_id} (current user: ${user?.id})`
            );

            websocketClient.current.sendReadReceipt(
              messageId,
              parseInt(chatId)
            );

            updateReadStatus(messageId, parseInt(chatId), user?.id);
          } else {
            logger.debug(
              `Skipping read receipt for message ${messageId} - own message or invalid (sender: ${targetMessage?.sender_id}, current user: ${user?.id})`
            );
          }
        }
      }
    } catch (err) {
      logger.error('Error marking message as read:', err);
    }
  };

  const readReceiptDebounceRef = useRef({});
  const debouncedMarkMessageAsRead = useCallback(
    messageId => {
      if (readReceiptDebounceRef.current[messageId]) {
        clearTimeout(readReceiptDebounceRef.current[messageId]);
      }

      readReceiptDebounceRef.current[messageId] = setTimeout(() => {
        markMessageAsRead(messageId);
        delete readReceiptDebounceRef.current[messageId];
      }, 300);
    },
    [markMessageAsRead]
  );

  const [userInfoCache, setUserInfoCache] = useState({});

  const getUsersBatchInfo = useCallback(
    async userIds => {
      if (
        !sessionKey ||
        !userIds ||
        !Array.isArray(userIds) ||
        userIds.length === 0 ||
        isChannel
      ) {
        return [];
      }

      const cachedUsers = [];
      const userIdsToFetch = [];

      userIds.forEach(userId => {
        if (userInfoCache[userId]) {
          cachedUsers.push(userInfoCache[userId]);
        } else {
          userIdsToFetch.push(userId);
        }
      });

      if (userIdsToFetch.length === 0) {
        return cachedUsers;
      }

      try {
        const response = await fetch(`${API_URL}/messenger/users/batch`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${sessionKey}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            user_ids: userIdsToFetch,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.users) {
          const processedUsers = data.users.map(user => {
            if (user.photo || user.avatar) {
              user.avatar = buildAvatarUrl(user.id, user.photo || user.avatar);
            }
            return user;
          });

          const newCache = { ...userInfoCache };
          processedUsers.forEach(user => {
            newCache[user.id] = user;
          });
          setUserInfoCache(newCache);

          return [...cachedUsers, ...processedUsers];
        } else {
          console.error('Error getting users batch info:', data.error);
          return cachedUsers;
        }
      } catch (err) {
        console.error('Error getting users batch info:', err);
        return cachedUsers;
      }
    },
    [sessionKey, isChannel, API_URL, userInfoCache]
  );

  useEffect(() => {
    setUserInfoCache({});
  }, [user?.id]);

  const markAllMessagesAsReadDebounceRef = useRef({});

  const markAllMessagesAsRead = async chatId => {
    if (!user || !chatId || isChannel) return;

    console.log(`markAllMessagesAsRead called for chat ${chatId}, user:`, user);

    // Проверяем, есть ли непрочитанные сообщения
    const currentChatMessages = messages[chatId] || [];
    const currentUnreadMessages = currentChatMessages.filter(
      msg =>
        msg.sender_id !== user.id &&
        (!msg.read_by || !msg.read_by.includes(user.id))
    );

    if (currentUnreadMessages.length === 0) {
      console.log(`No unread messages in chat ${chatId}, skipping API call`);
      return;
    }

    console.log(
      `Found ${currentUnreadMessages.length} unread messages in chat ${chatId}, marking as read`
    );

    try {
      const response = await fetch(
        `${API_URL}/messenger/chats/${chatId}/read-all`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${sessionKey}`,
            Accept: 'application/json',
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          if (result.marked_count === 0) {
            logger.info(
              `No unread messages found in chat ${chatId}, skipping read_receipt`
            );
            return;
          }

          if (websocketClient.current && websocketClient.current.isConnected) {
            const chatMessages = messages[chatId] || [];
            const unreadMessages = chatMessages.filter(
              msg =>
                msg.sender_id !== user?.id &&
                (!msg.read_by || !msg.read_by.includes(user.id))
            );

            if (unreadMessages.length) {
              const lastUnread = unreadMessages.reduce((a, b) =>
                a.id > b.id ? a : b
              );

              if (lastUnread && lastUnread.sender_id !== user?.id) {
                console.log(
                  `markAllChatMessagesAsRead: Sending read_receipt for message ${lastUnread.id} from user ${lastUnread.sender_id} (current user: ${user?.id})`
                );
                websocketClient.current.sendReadReceipt(lastUnread.id, chatId);

                updateReadStatus(lastUnread.id, chatId, user.id);
              } else {
                console.log(
                  `markAllChatMessagesAsRead: Skipping read_receipt for message ${lastUnread?.id} - own message or invalid`
                );
              }
            }
          }
          return;
        }
      }
    } catch (error) {
      logger.error(
        'Error using new API for marking messages as read, falling back to old method:',
        error
      );
    }

    const chatMessages = messages[chatId] || [];

    const unreadMessages = chatMessages.filter(
      msg =>
        msg.sender_id !== user.id &&
        (!msg.read_by || !msg.read_by.includes(user.id))
    );

    unreadMessages.forEach(msg => {
      debouncedMarkMessageAsRead(msg.id);
    });

    if (unreadMessages.length > 0) {
      console.log(
        `Marked ${unreadMessages.length} messages as read in chat ${chatId}, waiting for server update`
      );
    }
  };

  const debouncedMarkAllMessagesAsRead = useCallback(
    chatId => {
      if (!chatId) return;

      if (markAllMessagesAsReadDebounceRef.current[chatId]) {
        clearTimeout(markAllMessagesAsReadDebounceRef.current[chatId]);
      }

      markAllMessagesAsReadDebounceRef.current[chatId] = setTimeout(() => {
        markAllMessagesAsRead(chatId);
        delete markAllMessagesAsReadDebounceRef.current[chatId];
      }, 300);
    },
    [markAllMessagesAsRead]
  );

  const updateReadStatus = (messageId, chatId, userId) => {
    if (!messageId || !chatId || !userId) return;

    console.log(
      `Обновление статуса прочтения для сообщения ${messageId} в чате ${chatId} пользователем ${userId}`
    );

    setMessages(prev => {
      const chatMessages = prev[chatId] || [];
      const updatedMessages = chatMessages.map(msg => {
        if (msg.sender_id === user?.id) {
          const currentReadBy = msg.read_by || [];
          if (!currentReadBy.includes(userId)) {
            return {
              ...msg,
              read_by: [...currentReadBy, userId],
              read_count: (msg.read_count || 0) + 1,
            };
          }
        }
        return msg;
      });

      const lastMsg = updatedMessages.length
        ? updatedMessages[updatedMessages.length - 1]
        : null;
      if (lastMsg) {
        updateLastMessage(chatId, lastMsg);
      }

      return {
        ...prev,
        [chatId]: updatedMessages,
      };
    });
  };

  const [avatarCache, setAvatarCache] = useState({});

  const getAvatarUrl = useCallback(
    (userId, photoPath) => {
      if (!userId || !photoPath) return null;

      if (avatarCache[userId]) {
        return avatarCache[userId];
      }

      const avatarUrl = buildAvatarUrl(userId, photoPath);

      setAvatarCache(prev => ({
        ...prev,
        [userId]: avatarUrl,
      }));

      return avatarUrl;
    },
    [avatarCache]
  );

  const loadChats = useCallback(async () => {
    if (!sessionKey) return;
    if (globalLoading) return;

    return safeRequest('load_chats', async () => {
      setLoading(true);
      setError(null);
      setGlobalLoading(true);

      try {
        if (websocketClient.current && websocketClient.current.isConnected) {
          console.log('Загрузка чатов через WebSocket...');
          websocketClient.current.getChats();
          return;
        }

        console.log('Загрузка чатов с:', `${API_URL}/messenger/chats`);
        const response = await fetch(`${API_URL}/messenger/chats`, {
          headers: {
            Authorization: `Bearer ${sessionKey}`,
            Accept: 'application/json',
            'Cache-Control': 'no-cache',
          },
        });

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const textResponse = await response.text();
          console.error(
            'Получен ответ не в формате JSON:',
            textResponse.substring(0, 100) + '...'
          );
          throw new Error('API вернул ответ не в формате JSON');
        }

        const data = await response.json();

        if (data.success) {
          const filteredChats = data.chats.filter(chat => {
            if (chat.members) {
              const hasChannels = chat.members.some(
                member => member.type === 'channel'
              );
              return !hasChannels;
            }
            return true;
          });

          const newUnreadCounts = {};

          filteredChats.forEach(chat => {
            newUnreadCounts[chat.id] = chat.unread_count || 0;

            if (chat.last_message && chat.last_message.created_at) {
              chat.last_message.created_at = formatToLocalTime(
                chat.last_message.created_at
              );
            }

            if (chat.members && Array.isArray(chat.members)) {
              chat.members.forEach(member => {
                if (member.last_active) {
                  member.last_active = formatToLocalTime(member.last_active);
                }

                const userId = member.user_id || member.id;

                if (userId && avatarCache[userId]) {
                  member.avatar = avatarCache[userId];
                } else {
                  const photo = member.photo || member.avatar;
                  if (userId && photo) {
                    member.avatar = getAvatarUrl(userId, photo);
                  }
                }
              });
            }

            if (!chat.is_group && chat.members) {
              const otherMember = chat.members.find(m => {
                const memberId = m.user_id || m.id;

                const memberIdStr = memberId ? String(memberId) : null;
                const currentUserIdStr = user?.id ? String(user.id) : null;

                return (
                  memberIdStr &&
                  currentUserIdStr &&
                  memberIdStr !== currentUserIdStr
                );
              });

              if (otherMember) {
                const otherUserId = otherMember.user_id || otherMember.id;

                if (otherUserId && avatarCache[otherUserId]) {
                  chat.avatar = avatarCache[otherUserId];
                } else if (otherUserId) {
                  const photo = otherMember.photo || otherMember.avatar;
                  if (photo) {
                    chat.avatar = getAvatarUrl(otherUserId, photo);
                  }
                }

                if (!chat.title) {
                  chat.title =
                    otherMember.name ||
                    otherMember.username ||
                    `Пользователь #${otherUserId}`;
                }
              }
            }
          });

          setChats(filteredChats);

          setUnreadCounts(prevCounts => {
            const prevKeys = Object.keys(prevCounts);
            const newKeys = Object.keys(newUnreadCounts);

            if (
              prevKeys.length === newKeys.length &&
              prevKeys.every(k => prevCounts[k] === newUnreadCounts[k])
            ) {
              return prevCounts;
            }

            console.log('Загружены счетчики непрочитанных:', newUnreadCounts);
            return newUnreadCounts;
          });

          const newHasMoreMessages = {};
          const newLastFetchedMessageId = {};

          filteredChats.forEach(chat => {
            newHasMoreMessages[chat.id] = true;
            newLastFetchedMessageId[chat.id] = null;
          });

          setHasMoreMessages(newHasMoreMessages);
          setLastFetchedMessageId(newLastFetchedMessageId);
        } else {
          setError(data.error || 'Ошибка загрузки чатов');
        }
      } catch (err) {
        console.error('Ошибка загрузки чатов:', err);
        setError('Ошибка загрузки чатов');
      } finally {
        setLoading(false);
        setGlobalLoading(false);
      }
    });
  }, [
    sessionKey,
    isChannel,
    API_URL,
    safeRequest,
    globalLoading,
    user,
    avatarCache,
    getAvatarUrl,
    websocketClient,
  ]);

  const getChatDetails = async chatId => {
    if (!sessionKey || !chatId) return null;

    try {
      const response = await fetch(`${API_URL}/messenger/chats/${chatId}`, {
        headers: {
          Authorization: `Bearer ${sessionKey}`,
          Accept: 'application/json',
        },
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error(
          'Получен ответ не в формате JSON:',
          textResponse.substring(0, 100) + '...'
        );
        throw new Error('API вернул ответ не в формате JSON');
      }

      const data = await response.json();

      if (data.success) {
        if (data.chat.members) {
          const hasChannels = data.chat.members.some(
            member => member.type === 'channel'
          );
          if (hasChannels) {
            console.warn('Чат имеет участников-каналов, не возвращаем детали');
            return null;
          }

          if (data.chat.last_message && data.chat.last_message.created_at) {
            data.chat.last_message.created_at = formatToLocalTime(
              data.chat.last_message.created_at
            );
          }

          data.chat.members.forEach(member => {
            if (member.last_active) {
              member.last_active = formatToLocalTime(member.last_active);
            }

            const userId = member.user_id || member.id;

            if (userId) {
              const photo = member.photo || member.avatar;
              if (photo) {
                console.log(
                  `Детали чата ${chatId}: обработка аватара для участника ${userId}, фото: ${photo}`
                );
                member.avatar = buildAvatarUrl(userId, photo);
              }
            }
          });

          if (!data.chat.is_group) {
            console.log(
              `Детали чата ${chatId}, мой ID: ${user?.id}, участники:`,
              data.chat.members.map(m => ({
                id: m.user_id || m.id,
                name: m.name,
              }))
            );

            const otherMember = data.chat.members.find(m => {
              const memberId = m.user_id || m.id;

              const memberIdStr = memberId ? String(memberId) : null;
              const currentUserIdStr = user?.id ? String(user.id) : null;

              return (
                memberIdStr &&
                currentUserIdStr &&
                memberIdStr !== currentUserIdStr
              );
            });

            console.log(
              `Детали чата ${chatId} - собеседник:`,
              otherMember
                ? {
                    id: otherMember.user_id || otherMember.id,
                    name: otherMember.name,
                  }
                : 'не найден'
            );

            if (otherMember) {
              const otherUserId = otherMember.user_id || otherMember.id;

              const photo = otherMember.photo || otherMember.avatar;

              if (otherUserId && photo) {
                console.log(
                  `Детали чата ${chatId}: установка аватара из данных пользователя ${otherUserId}, фото: ${photo}`
                );
                data.chat.avatar = buildAvatarUrl(otherUserId, photo);

                if (!data.chat.title) {
                  data.chat.title =
                    otherMember.name ||
                    otherMember.username ||
                    `Пользователь #${otherUserId}`;
                }
              } else {
                console.warn(
                  `Детали чата ${chatId}: нет данных для аватара, пользователь ${otherUserId}`
                );
              }
            } else {
              console.warn(`Детали чата ${chatId}: не найден собеседник`);
            }
          }
        }

        return data.chat;
      } else {
        console.error('Ошибка получения деталей чата:', data.error);
        return null;
      }
    } catch (err) {
      console.error('Ошибка получения деталей чата:', err);
      return null;
    }
  };

  const loadMessages = useCallback(
    async (chatId, limit = 30, isRetry = false) => {
      if (!sessionKey || !chatId || isChannel) return;

      const chat = chats.find(c => c.id === chatId);
      const isGroupChat = chat?.is_group;

      console.log(
        `MessengerContext.loadMessages: Загрузка сообщений для чата ${chatId}, isGroup=${isGroupChat}, isRetry=${isRetry}`
      );

      if (
        loadingMessages ||
        (hasMoreMessages[chatId] === false && messages[chatId]?.length > 0)
      ) {
        console.log(
          `MessengerContext.loadMessages: Пропуск запроса - уже загружается или все сообщения загружены`
        );
        return;
      }

      const requestKey = isRetry
        ? `load_messages_retry_${chatId}`
        : `load_messages_${chatId}`;

      return safeRequest(requestKey, async () => {
        setLoadingMessages(true);

        try {
          if (websocketClient.current && websocketClient.current.isConnected) {
            console.log(
              `Загрузка сообщений через WebSocket для чата ${chatId}...`
            );
            const beforeId = lastFetchedMessageId[chatId];
            const success = websocketClient.current.getMessages(
              chatId,
              limit,
              beforeId,
              false
            );
            console.log(`WebSocket getMessages result: ${success}`);
            return;
          } else {
            console.log(
              `WebSocket не доступен: client=${!!websocketClient.current}, connected=${websocketClient.current?.isConnected}`
            );
          }

          const beforeId = lastFetchedMessageId[chatId];
          const url = `${API_URL}/messenger/chats/${chatId}/messages${beforeId ? `?before_id=${beforeId}&limit=${limit}` : `?limit=${limit}`}`;

          console.log(
            `MessengerContext.loadMessages: Fetching messages from ${url}`
          );

          const response = await fetch(url, {
            headers: {
              Authorization: `Bearer ${sessionKey}`,
              Accept: 'application/json',
              'Cache-Control': 'no-cache, no-store',
            },
          });

          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
            const textResponse = await response.text();
            console.error(
              'Получен ответ не в формате JSON:',
              textResponse.substring(0, 100) + '...'
            );
            throw new Error('API вернул ответ не в формате JSON');
          }

          const data = await response.json();

          if (data.success) {
            const newMessages = data.messages || [];
            console.log(
              `MessengerContext.loadMessages: Получено ${newMessages.length} сообщений для чата ${chatId}`
            );
            console.log('=== MESSAGES DEBUG ===');
            console.log('First message:', newMessages[0]);
            console.log('Last message:', newMessages[newMessages.length - 1]);

            newMessages.forEach((msg, index) => {
              console.log(`Message ${index}:`, {
                id: msg.id,
                created_at: msg.created_at,
                content: msg.content?.substring(0, 30) + '...',
              });
            });

            newMessages.forEach(msg => {
              if (msg.created_at) {
                const originalDate = msg.created_at;
                msg.created_at = formatToLocalTime(msg.created_at);
                console.log(
                  `Date formatted: ${originalDate} -> ${msg.created_at}`
                );
              }
            });

            const hasModeratorMessages = data.has_moderator_messages === true;

            setMessages(prev => {
              const existingMessages = prev[chatId] || [];

              console.log(`=== API LOAD MESSAGES STATE UPDATE ===`);
              console.log(
                `Chat ${chatId}: existing messages:`,
                existingMessages.length
              );
              console.log(`Chat ${chatId}: new messages:`, newMessages.length);

              const isLoadingOlderMessages = existingMessages.length > 0;

              let mergedMessages;

              if (isLoadingOlderMessages) {
                console.log(
                  '📜 API: Loading older messages - adding to beginning'
                );
                const uniqueNewMessages = newMessages.filter(
                  newMsg => !existingMessages.some(msg => msg.id === newMsg.id)
                );
                mergedMessages = [...uniqueNewMessages, ...existingMessages];
              } else {
                console.log('🆕 API: Initial message loading');
                mergedMessages = [...existingMessages];
                newMessages.forEach(newMsg => {
                  if (!mergedMessages.some(msg => msg.id === newMsg.id)) {
                    mergedMessages.push(newMsg);
                  }
                });
              }

              mergedMessages.sort((a, b) => a.id - b.id);

              mergedMessages.hasModeratorMessages = hasModeratorMessages;

              console.log(
                `Chat ${chatId}: final merged messages:`,
                mergedMessages.length
              );
              console.log(
                `Chat ${chatId}: first message date:`,
                mergedMessages[0]?.created_at
              );
              console.log(
                `Chat ${chatId}: last message date:`,
                mergedMessages[mergedMessages.length - 1]?.created_at
              );
              console.log(`=== END API LOAD MESSAGES STATE UPDATE ===`);

              return {
                ...prev,
                [chatId]: mergedMessages,
              };
            });

            if (newMessages.length < limit) {
              setHasMoreMessages({
                ...hasMoreMessages,
                [chatId]: false,
              });
            } else {
              const oldestMsgId = Math.min(...newMessages.map(m => m.id));
              setLastFetchedMessageId({
                ...lastFetchedMessageId,
                [chatId]: oldestMsgId,
              });
            }

            if (user) {
              newMessages.forEach(msg => {
                if (msg.sender_id !== user.id) {
                  debouncedMarkMessageAsRead(msg.id);
                }
              });
            }

            if (
              isGroupChat &&
              newMessages.length === 0 &&
              chat?.last_message &&
              !isRetry
            ) {
              console.log(
                `MessengerContext.loadMessages: Scheduling retry for group chat ${chatId} with empty messages`
              );
              setTimeout(() => {
                loadMessages(chatId, limit, true);
              }, 1000);
            }
          } else {
            console.error('Ошибка загрузки сообщений:', data.error);
          }
        } catch (err) {
          console.error('Ошибка загрузки сообщений:', err);

          if (isGroupChat && !isRetry) {
            console.log(
              `MessengerContext.loadMessages: Scheduling retry after error for group chat ${chatId}`
            );
            setTimeout(() => {
              loadMessages(chatId, limit, true);
            }, 1500);
          }
        } finally {
          setLoadingMessages(false);
        }
      });
    },
    [
      sessionKey,
      isChannel,
      API_URL,
      lastFetchedMessageId,
      loadingMessages,
      hasMoreMessages,
      messages,
      safeRequest,
      chats,
      user,
      websocketClient,
    ]
  );

  const createPersonalChat = async (userId, encrypted = false) => {
    if (!sessionKey || !userId || isChannel) return null;

    try {
      // Проверяем кеш сначала, если нет - используем batch API
      let userInfo = userInfoCache[userId];
      if (!userInfo) {
        const userInfoArray = await getUsersBatchInfo([userId]);
        userInfo = userInfoArray.length > 0 ? userInfoArray[0] : null;
      }

      if (userInfo?.type === 'channel') {
        setError('Нельзя создать чат с каналом');
        return null;
      }

      const response = await fetch(`${API_URL}/messenger/chats/personal`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${sessionKey}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ user_id: userId, encrypted }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error(
          'Received non-JSON response:',
          textResponse.substring(0, 100) + '...'
        );
        throw new Error('API returned non-JSON response');
      }

      const data = await response.json();

      if (data.success) {
        await loadChats();
        return data.chat_id;
      } else {
        setError(data.error || 'Ошибка создания чата');
        return null;
      }
    } catch (err) {
      console.error('Ошибка создания личного чата:', err);
      setError('Ошибка создания чата');
      return null;
    }
  };

  const createGroupChat = async (title, memberIds, encrypted = false) => {
    if (!sessionKey || !memberIds || !memberIds.length || isChannel)
      return null;

    try {
      const memberInfos = await getUsersBatchInfo(memberIds);

      if (memberInfos.some(m => m?.type === 'channel')) {
        setError('Нельзя добавлять каналы в групповой чат');
        return null;
      }

      const response = await fetch(`${API_URL}/messenger/chats/group`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${sessionKey}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          title,
          member_ids: memberIds,
          encrypted,
        }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error(
          'Received non-JSON response:',
          textResponse.substring(0, 100) + '...'
        );
        throw new Error('API returned non-JSON response');
      }

      const data = await response.json();

      if (data.success) {
        await loadChats();
        return data.chat_id;
      } else {
        setError(data.error || 'Ошибка создания группы');
        return null;
      }
    } catch (err) {
      console.error('Error creating group chat:', err);
      setError('Ошибка создания группы');
      return null;
    }
  };

  const sendTextMessage = async (chatId, text, replyToId = null) => {
    if (!sessionKey || !chatId || !text.trim() || !user || isChannel)
      return null;

    try {
      const chat = chats.find(c => c.id === chatId);
      let messageText = text;

      if (chat?.encrypted) {
        const encryptionKey = chat.encryption_key || String(chatId);
        messageText = xorCipher(text, encryptionKey);
      }

      if (websocketClient.current && websocketClient.current.isConnected) {
        console.log(`Отправка сообщения через WebSocket в чат ${chatId}...`);

        // Генерируем уникальные ID для предотвращения дублирования
        const clientMessageId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const tempMessage = {
          id: tempId,
          content: text,
          sender_id: user.id,
          sender: {
            id: user.id,
            name: user.name,
            username: user.username,
            avatar: user.avatar,
          },
          chat_id: chatId,
          message_type: 'text',
          created_at: formatToLocalTime(new Date().toISOString()),
          reply_to_id: replyToId,
          is_temp: true,
          client_message_id: clientMessageId,
        };

        setMessages(prev => {
          const chatMessages = prev[chatId] || [];
          return {
            ...prev,
            [chatId]: [...chatMessages, tempMessage].sort(
              (a, b) => a.id - b.id
            ),
          };
        });

        setChats(prev => {
          const chatIndex = prev.findIndex(c => c.id === chatId);
          if (chatIndex === -1) return prev;

          const updatedChat = { ...prev[chatIndex], last_message: tempMessage };
          const newChats = [...prev];
          newChats.splice(chatIndex, 1);

          return [updatedChat, ...newChats];
        });

        // Отправляем через WebSocket с уникальными ID
        websocketClient.current.sendMessage({
          type: 'send_message',
          chatId: chatId,
          text: messageText,
          replyToId: replyToId,
          clientMessageId: clientMessageId,
          tempId: tempId,
        });

        return tempMessage;
      }

      const headers = {
        Authorization: `Bearer ${sessionKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Device-ID': deviceId,
      };

      const response = await fetch(
        `${API_URL}/messenger/chats/${chatId}/messages`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            text: messageText,
            reply_to_id: replyToId,
            device_id: deviceId,
          }),
        }
      );

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error(
          'Received non-JSON response:',
          textResponse.substring(0, 100) + '...'
        );
        throw new Error('API returned non-JSON response');
      }

      const data = await response.json();

      if (data.success) {
        const newMessage = data.message;

        if (newMessage.created_at) {
          newMessage.created_at = formatToLocalTime(newMessage.created_at);
        }

        setMessages(prev => {
          const chatMessages = prev[chatId] || [];
          return {
            ...prev,
            [chatId]: [...chatMessages, newMessage].sort((a, b) => a.id - b.id),
          };
        });

        setChats(prev => {
          const chatIndex = prev.findIndex(c => c.id === chatId);
          if (chatIndex === -1) return prev;

          const updatedChat = { ...prev[chatIndex], last_message: newMessage };
          const newChats = [...prev];
          newChats.splice(chatIndex, 1);

          return [updatedChat, ...newChats];
        });

        return newMessage;
      } else {
        setError(data.error || 'Ошибка отправки сообщения');
        return null;
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Ошибка отправки сообщения');
      return null;
    }
  };

  const uploadFile = async (chatId, file, type, replyToId = null) => {
    if (!sessionKey || !chatId || !file || !user || isChannel) return null;

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('message_type', type);

      if (replyToId) {
        formData.append('reply_to_id', replyToId);
      }

      const response = await fetch(
        `${API_URL}/messenger/chats/${chatId}/upload`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${sessionKey}`,
            Accept: 'application/json',
          },
          body: formData,
        }
      );

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error(
          'Received non-JSON response:',
          textResponse.substring(0, 100) + '...'
        );
        throw new Error('API returned non-JSON response');
      }

      const data = await response.json();

      if (data.success) {
        const newMessage = data.message;

        if (newMessage.created_at) {
          newMessage.created_at = formatToLocalTime(newMessage.created_at);
        }

        setMessages(prev => {
          const chatMessages = prev[chatId] || [];
          return {
            ...prev,
            [chatId]: [...chatMessages, newMessage].sort((a, b) => a.id - b.id),
          };
        });

        setChats(prev => {
          return prev.map(chat => {
            if (chat.id === chatId) {
              return { ...chat, last_message: newMessage };
            }
            return chat;
          });
        });

        return newMessage;
      } else {
        setError(data.error || 'Ошибка загрузки файла');
        return null;
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      setError('Ошибка загрузки файла');
      return null;
    }
  };

  const sendTypingIndicator = (chatId, isTyping) => {
    if (!websocketClient.current || !chatId || !isSocketConnected || isChannel)
      return;

    try {
      if (isTyping) {
        websocketClient.current.sendTypingStart(chatId);
      } else {
        websocketClient.current.sendTypingEnd(chatId);
      }
    } catch (err) {
      logger.error('Error sending typing indicator:', err);
    }
  };

  const searchUsers = async (query, limit = 20) => {
    if (!sessionKey || !query || isChannel) return [];

    try {
      const response = await fetch(
        `${API_URL}/messenger/users/search?query=${encodeURIComponent(query)}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${sessionKey}`,
            Accept: 'application/json',
          },
        }
      );

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error(
          'Received non-JSON response:',
          textResponse.substring(0, 100) + '...'
        );
        throw new Error('API returned non-JSON response');
      }

      const data = await response.json();

      if (data.success) {
        const filteredUsers = (data.users || []).filter(
          user => user.type !== 'channel'
        );
        return filteredUsers;
      } else {
        console.error('Error searching users:', data.error);
        return [];
      }
    } catch (err) {
      console.error('Error searching users:', err);
      return [];
    }
  };

  const getUserInfo = async userId => {
    if (!sessionKey || !userId || isChannel) return null;

    if (userInfoCache[userId]) {
      console.log(`Using cached user info for ${userId}`);
      return userInfoCache[userId];
    }

    console.log(`User ${userId} not in cache, using batch API`);
    const userInfoArray = await getUsersBatchInfo([userId]);
    return userInfoArray.length > 0 ? userInfoArray[0] : null;
  };

  const decryptMessage = (message, chatId) => {
    if (!message) return message;

    const chat = chats.find(c => c.id === chatId);

    if (chat?.encrypted && message.content) {
      const encryptionKey = chat.encryption_key || String(chatId);
      try {
        return xorCipher(message.content, encryptionKey);
      } catch (err) {
        console.error('Error decrypting message:', err);
        return '🔒 [Ошибка расшифровки]';
      }
    }

    return message.content;
  };

  const getFileUrl = (chatId, filePath) => {
    if (!sessionKey || !filePath) return '';

    if (filePath.includes('/static/')) {
      if (filePath.includes('/api/messenger/files/')) {
        const staticIndex = filePath.indexOf('/static/');
        if (staticIndex !== -1) {
          filePath = filePath.substring(staticIndex);
          console.log(`Исправлен двойной путь: ${filePath}`);
        }
      }

      const authParam = `token=${encodeURIComponent(sessionKey)}`;
      const url = `${filePath}?${authParam}`;
      console.log(`Generated static file URL: ${url}`);
      return url;
    }

    const authParam = `token=${encodeURIComponent(sessionKey)}`;
    let url = `${API_URL}/messenger/files/${chatId}/`;

    if (filePath.includes(`attachments/chat_${chatId}/`)) {
      const pathParts = filePath.split(`attachments/chat_${chatId}/`);
      url += pathParts[1];
    } else {
      url += filePath;
    }

    url += `?${authParam}`;
    console.log(`Generated message file URL: ${url}`);
    return url;
  };

  const setActiveAndLoadChat = useCallback(
    chatId => {
      const chat = chats.find(c => c.id === chatId);

      if (chat) {
        if (activeChat?.id === chatId) return;

        console.log(
          `MessengerContext.setActiveAndLoadChat: Activating chat ${chatId}, isGroup=${chat.is_group}`
        );
        setActiveChat(chat);

        if (!messages[chatId] || messages[chatId].length === 0) {
          console.log(
            `MessengerContext.setActiveAndLoadChat: No messages loaded for chat ${chatId}, loading...`
          );
          setTimeout(() => {
            loadMessages(chatId);

            if (chat.is_group) {
              setTimeout(() => {
                if (!messages[chatId] || messages[chatId].length === 0) {
                  console.log(
                    `MessengerContext.setActiveAndLoadChat: Retry loading messages for group chat ${chatId}`
                  );
                  loadMessages(chatId, 30, true);
                }
              }, 1500);
            }
          }, 100);
        } else {
          console.log(
            `MessengerContext.setActiveAndLoadChat: Already have ${messages[chatId].length} messages for chat ${chatId}`
          );
        }

        if (user) {
          // Используем дебаунсированную версию
          debouncedMarkAllMessagesAsRead(chatId);
        }
      }
    },
    [
      isChannel,
      chats,
      messages,
      user,
      loadMessages,
      activeChat,
      debouncedMarkAllMessagesAsRead,
    ]
  );

  const updateLastMessage = (chatId, message) => {
    setChats(prev => {
      return prev
        .map(chat => {
          if (chat.id === chatId) {
            return { ...chat, last_message: message };
          }
          return chat;
        })
        .sort((a, b) => {
          const aTime = a.last_message?.created_at
            ? new Date(a.last_message.created_at).getTime()
            : 0;
          const bTime = b.last_message?.created_at
            ? new Date(b.last_message.created_at).getTime()
            : 0;
          return bTime - aTime;
        });
    });
  };

  const refreshChats = () => {
    if (!user) {
      console.log(
        'refreshChats: данные пользователя не загружены, сначала загружаем user'
      );
      fetchCurrentUser();
      return;
    }

    console.log('refreshChats: обновление списка чатов...');
    loadChats();
  };

  const getTotalUnreadCount = () => {
    return Object.values(unreadCounts).reduce(
      (total, count) => total + count,
      0
    );
  };

  const [useFallbackMode, setUseFallbackMode] = useState(false);
  const fallbackPollingRef = useRef(null);

  useEffect(() => {
    if (useFallbackMode) return;

    if (reconnectAttempts.current > 5) {
      console.log(
        'Too many WebSocket connection failures, switching to fallback mode (REST polling)'
      );
      setUseFallbackMode(true);
    }

    const checkWebSocketAvailability = async () => {
      try {
        const pingResponse = await fetch(`${API_URL}/ping?t=${Date.now()}`, {
          method: 'GET',
          headers: { 'Cache-Control': 'no-cache, no-store' },
        }).catch(() => null);

        if (pingResponse && pingResponse.ok) {
          console.log(
            'Network seems stable, attempting to switch back to WebSocket mode'
          );
          setUseFallbackMode(false);
          reconnectAttempts.current = 0;
        }
      } catch (err) {}
    };

    if (useFallbackMode) {
      console.log('Setting up fallback polling mechanism');

      if (fallbackPollingRef.current) {
        clearInterval(fallbackPollingRef.current);
      }

      fallbackPollingRef.current = setInterval(async () => {
        if (document.visibilityState !== 'visible') return;

        if (activeChat) {
          try {
            console.log(
              `Fallback mode: polling for new messages in chat ${activeChat.id}`
            );
            await loadMessages(activeChat.id, 10);
          } catch (err) {
            console.error('Error polling messages in fallback mode:', err);
          }
        }

        try {
          console.log('Fallback mode: refreshing chat list');
          await loadChats();
        } catch (err) {
          console.error('Error refreshing chats in fallback mode:', err);
        }

        if (Math.random() < 0.3) {
          checkWebSocketAvailability();
        }
      }, 5000);

      return () => {
        if (fallbackPollingRef.current) {
          clearInterval(fallbackPollingRef.current);
        }
      };
    }
  }, [useFallbackMode, activeChat, API_URL, loadChats, loadMessages]);

  useEffect(() => {
    const handleNetworkChange = () => {
      if (navigator.onLine) {
        logger.info(
          'Network is back online, checking Enhanced WebSocket state'
        );
        if (
          !isSocketConnected ||
          !websocketClient.current ||
          !websocketClient.current.isConnected
        ) {
          logger.info(
            'Enhanced WebSocket not connected, attempting reconnection'
          );
          setTimeout(() => {
            forceReconnectWebSocket();
          }, 1000);
        }
      } else {
        logger.warn('Network is offline, waiting for recovery');
        setIsSocketConnected(false);
      }
    };

    window.addEventListener('online', handleNetworkChange);
    window.addEventListener('offline', handleNetworkChange);

    return () => {
      window.removeEventListener('online', handleNetworkChange);
      window.removeEventListener('offline', handleNetworkChange);
    };
  }, [isSocketConnected, forceReconnectWebSocket]);

  useEffect(() => {
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);

        const url = typeof args[0] === 'string' ? args[0] : args[0].url;

        if (url.includes('/apiMes/') && response.status === 401) {
          console.warn(
            'Обнаружена ошибка авторизации API (401), проверка состояния вебсокета'
          );

          setTimeout(() => {
            if (sessionKey) {
              forceReconnectWebSocket();
            }
          }, 2000);
        }

        return response;
      } catch (error) {
        if (args[0].includes && args[0].includes('/apiMes/')) {
          if (
            isSocketConnected &&
            websocketClient.current &&
            websocketClient.current.isConnected
          ) {
            try {
              websocketClient.current.sendMessage({
                type: 'ping',
                device_id: deviceId,
              });
            } catch (err) {
              forceReconnectWebSocket();
            }
          }
        }

        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [sessionKey, isSocketConnected, deviceId, forceReconnectWebSocket]);

  const value = {
    user,
    chats,
    activeChat,
    messages,
    onlineUsers,
    typingUsers,
    loading,
    loadingMessages,
    error,
    unreadCounts,
    hasMoreMessages,
    isSocketConnected,
    isChannel,
    deviceId,
    useFallbackMode,
    avatarCache,
    getAvatarUrl,
    setActiveChat: chatId => {
      if (isChannel) {
        console.warn(
          'MessengerContext: Канал не может использовать мессенджер. Операция заблокирована.'
        );
        return;
      }
      return setActiveAndLoadChat(chatId);
    },
    loadMessages: (chatId, limit) => {
      if (isChannel) {
        console.warn(
          'MessengerContext: Канал не может использовать мессенджер. Операция заблокирована.'
        );
        return Promise.resolve(null);
      }
      return loadMessages(chatId, limit);
    },
    loadMoreMessages: chatId => {
      if (isChannel) {
        console.warn(
          'MessengerContext: Канал не может использовать мессенджер. Операция заблокирована.'
        );
        return Promise.resolve(null);
      }
      return loadMessages(chatId);
    },
    sendTextMessage: (chatId, text, replyToId) => {
      if (isChannel) {
        console.warn(
          'MessengerContext: Канал не может использовать мессенджер. Операция заблокирована.'
        );
        return Promise.resolve(null);
      }
      return sendTextMessage(chatId, text, replyToId);
    },
    uploadFile: (chatId, file, type, replyToId) => {
      if (isChannel) {
        console.warn(
          'MessengerContext: Канал не может использовать мессенджер. Операция заблокирована.'
        );
        return Promise.resolve(null);
      }
      return uploadFile(chatId, file, type, replyToId);
    },
    markMessageAsRead: messageId => {
      if (isChannel) {
        console.warn(
          'MessengerContext: Канал не может использовать мессенджер. Операция заблокирована.'
        );
        return;
      }
      return debouncedMarkMessageAsRead(messageId);
    },
    markAllMessagesAsRead: chatId => {
      if (isChannel) {
        console.warn(
          'MessengerContext: Канал не может использовать мессенджер. Операция заблокирована.'
        );
        return;
      }
      return debouncedMarkAllMessagesAsRead(chatId);
    },
    sendTypingIndicator: (chatId, isTyping) => {
      if (isChannel) {
        console.warn(
          'MessengerContext: Канал не может использовать мессенджер. Операция заблокирована.'
        );
        return;
      }
      return sendTypingIndicator(chatId, isTyping);
    },
    searchUsers: (query, limit) => {
      if (isChannel) {
        console.warn(
          'MessengerContext: Канал не может использовать мессенджер. Операция заблокирована.'
        );
        return Promise.resolve([]);
      }
      return searchUsers(query, limit);
    },
    getUserInfo: userId => {
      if (isChannel) {
        console.warn(
          'MessengerContext: Канал не может использовать мессенджер. Операция заблокирована.'
        );
        return Promise.resolve(null);
      }
      return getUserInfo(userId);
    },
    getUsersBatchInfo: userIds => {
      if (isChannel) {
        console.warn(
          'MessengerContext: Канал не может использовать мессенджер. Операция заблокирована.'
        );
        return Promise.resolve([]);
      }
      return getUsersBatchInfo(userIds);
    },
    createPersonalChat: (userId, encrypted) => {
      if (isChannel) {
        console.warn(
          'MessengerContext: Канал не может использовать мессенджер. Операция заблокирована.'
        );
        return Promise.resolve(null);
      }
      return createPersonalChat(userId, encrypted);
    },
    createGroupChat: (title, memberIds, encrypted) => {
      if (isChannel) {
        console.warn(
          'MessengerContext: Канал не может использовать мессенджер. Операция заблокирована.'
        );
        return Promise.resolve(null);
      }
      return createGroupChat(title, memberIds, encrypted);
    },
    getChatDetails: chatId => {
      if (isChannel) {
        console.warn(
          'MessengerContext: Канал не может использовать мессенджер. Операция заблокирована.'
        );
        return Promise.resolve(null);
      }
      return getChatDetails(chatId);
    },
    decryptMessage,
    getFileUrl,
    refreshChats: () => {
      if (isChannel) {
        console.warn(
          'MessengerContext: Канал не может использовать мессенджер. Операция заблокирована.'
        );
        return;
      }
      return refreshChats();
    },
    getTotalUnreadCount: () => {
      if (isChannel) return 0;
      return getTotalUnreadCount();
    },
    updateLastMessage: (chatId, message) => {
      if (isChannel) {
        console.warn(
          'MessengerContext: Канал не может использовать мессенджер. Операция заблокирована.'
        );
        return;
      }
      return updateLastMessage(chatId, message);
    },
    sessionKey,
    forceReconnectSocket: () => {
      if (isChannel) {
        console.warn(
          'MessengerContext: Канал не может использовать мессенджер. Операция заблокирована.'
        );
        return;
      }
      return forceReconnectWebSocket();
    },

    deleteMessage: async messageId => {
      if (isChannel) {
        console.warn(
          'MessengerContext: Канал не может использовать мессенджер. Операция заблокирована.'
        );
        return { success: false, error: 'Операция недоступна для каналов' };
      }

      try {
        const response = await axios.delete(
          `${API_URL}/messenger/messages/${messageId}`,
          {
            headers: {
              Authorization: `Bearer ${sessionKey}`,
              Accept: 'application/json',
            },
          }
        );

        if (response.data && response.data.success) {
          let messageChatId = null;
          let deletedMessage = null;

          Object.entries(messages).forEach(([chatId, chatMessages]) => {
            const foundMessage = chatMessages.find(msg => msg.id === messageId);
            if (foundMessage) {
              messageChatId = parseInt(chatId);
              deletedMessage = foundMessage;
            }
          });

          if (messageChatId) {
            setMessages(prevMessages => {
              const updatedChatMessages = (
                prevMessages[messageChatId] || []
              ).filter(msg => msg.id !== messageId);

              return {
                ...prevMessages,
                [messageChatId]: updatedChatMessages,
              };
            });

            const chat = chats.find(c => c.id === messageChatId);
            if (
              chat &&
              chat.last_message &&
              chat.last_message.id === messageId
            ) {
              const chatMessages = messages[messageChatId] || [];
              const newLastMessage = chatMessages
                .filter(msg => msg.id !== messageId)
                .sort(
                  (a, b) => new Date(b.created_at) - new Date(a.created_at)
                )[0];

              if (newLastMessage) {
                updateLastMessage(messageChatId, newLastMessage);
              }
            }
          }

          if (
            websocketClient.current &&
            websocketClient.current.isConnected &&
            messageChatId
          ) {
            websocketClient.current.sendMessageDeleted(
              messageId,
              messageChatId
            );
          }

          return { success: true };
        } else {
          console.error(
            'Ошибка удаления сообщения:',
            response.data?.error || 'Неизвестная ошибка'
          );
          return {
            success: false,
            error: response.data?.error || 'Не удалось удалить сообщение',
          };
        }
      } catch (error) {
        console.error('Ошибка удаления сообщения:', error);
        return {
          success: false,
          error:
            error.response?.data?.error ||
            'Произошла ошибка при удалении сообщения',
        };
      }
    },

    deleteChat: async chatId => {
      try {
        const response = await axios.delete(
          `${API_URL}/messenger/chats/${chatId}`,
          {
            headers: {
              Authorization: `Bearer ${sessionKey}`,
              Accept: 'application/json',
            },
          }
        );

        if (response.data && response.data.success) {
          setChats(prevChats => prevChats.filter(chat => chat.id !== chatId));

          if (activeChat && activeChat.id === chatId) {
            setActiveChat(null);
            setMessages([]);
          }

          return { success: true };
        } else {
          console.error(
            'Ошибка удаления чата:',
            response.data?.error || 'Неизвестная ошибка'
          );
          return {
            success: false,
            error: response.data?.error || 'Не удалось удалить чат',
          };
        }
      } catch (error) {
        console.error('Ошибка удаления чата:', error);
        return {
          success: false,
          error:
            error.response?.data?.error || 'Произошла ошибка при удалении чата',
        };
      }
    },

    enableLogging: (enable = true) => {
      if (typeof window !== 'undefined') {
        window.MESSENGER_DEV_MODE = enable;
        console.log(`Messenger logging ${enable ? 'enabled' : 'disabled'}`);
      }
    },

    markAllChatMessagesAsRead: async chatId => {
      if (!sessionKey || !chatId) return;

      try {
        const response = await fetch(
          `${API_URL}/messenger/chats/${chatId}/read-all`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${sessionKey}`,
              Accept: 'application/json',
            },
          }
        );

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.marked_count > 0) {
            logger.info(
              `Marked ${result.marked_count} messages as read in chat ${chatId}`
            );

            console.log(
              `API marked ${result.marked_count} messages as read in chat ${chatId}, waiting for server unread_counts update`
            );

            if (
              websocketClient.current &&
              websocketClient.current.isConnected
            ) {
              const chatMessages = messages[chatId] || [];
              console.log(
                `markAllMessagesAsRead: Chat ${chatId} has ${chatMessages.length} messages`
              );

              if (chatMessages.length > 0) {
                const lastMessage = chatMessages[chatMessages.length - 1];
                console.log(
                  `Sending read_receipt for last message ${lastMessage.id} in chat ${chatId}`
                );
                websocketClient.current.sendReadReceipt(lastMessage.id, chatId);
              }
            }
          }
        }
      } catch (error) {
        logger.error('Error marking all chat messages as read:', error);
      }
    },
  };

  useEffect(() => {
    const isDevelopment =
      process.env.NODE_ENV === 'development' ||
      window.location.hostname === 'localhost';

    if (isDevelopment && sessionKeyAttempts >= 3) {
      console.warn(
        'MessengerContext: Превышено максимальное количество попыток получения session_key (3) в development режиме'
      );
      return;
    }

    if (!sessionKey && authContext?.isAuthenticated && !fetchingSessionKey) {
      const ORIGIN =
        (typeof window !== 'undefined' && window.location?.origin) ||
        'https://k-connect.ru';
      const API_URL = `${ORIGIN}/apiMes`;
      setFetchingSessionKey(true);
      setSessionKeyAttempts(prev => prev + 1);

      console.log(
        `MessengerContext: Попытка ${sessionKeyAttempts + 1} получения session_key`
      );

      axios
        .get(`${API_URL}/auth/get-session-key`, {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            'Cache-Control': 'no-cache',
          },
        })
        .then(res => {
          if (res.data?.session_key) {
            localStorage.setItem('session_key', res.data.session_key);
            setForcedSessionKey(res.data.session_key);
            console.log('MessengerContext: session_key fetched and saved');

            setSessionKeyAttempts(0);
          }
        })
        .catch(err => {
          console.error(
            `MessengerContext: error fetching session_key (попытка ${sessionKeyAttempts + 1})`,
            err
          );

          if (isDevelopment && err.code === 'ERR_NETWORK') {
            console.warn(
              'MessengerContext: Возможная ошибка CORS в development режиме. Проверьте настройки бэкенда.'
            );
          }
        })
        .finally(() => setFetchingSessionKey(false));
    }
  }, [
    sessionKey,
    authContext?.isAuthenticated,
    jwtToken,
    fetchingSessionKey,
    sessionKeyAttempts,
  ]);

  const notificationAudioRef = useRef(null);
  const prevTotalUnreadRef = useRef(0);

  useEffect(() => {
    const currentTotal = Object.values(unreadCounts).reduce((t, c) => t + c, 0);
    const prevTotal = prevTotalUnreadRef.current;
    const isOnMessengerPage = window.location.pathname.startsWith('/messenger');

    if (currentTotal > prevTotal && !isOnMessengerPage) {
      try {
        if (!notificationAudioRef.current) {
          notificationAudioRef.current = new Audio(
            '/static/sounds/message.mp3'
          );
        }
        notificationAudioRef.current.play().catch(() => {});
      } catch {}
    }
    prevTotalUnreadRef.current = currentTotal;
  }, [unreadCounts]);

  useEffect(() => {
    if (sessionKey && !isChannel) {
      const client = getMessengerSocket({
        sessionKey: sessionKey,
        deviceId: deviceId,
        autoReconnect: true,
        maxReconnectAttempts: WEBSOCKET_CONFIG.MAX_RECONNECT_ATTEMPTS,
        reconnectDelay: WEBSOCKET_CONFIG.RECONNECT_BASE_DELAY,
        pingInterval: WEBSOCKET_CONFIG.PING_INTERVAL,
        pongTimeout: WEBSOCKET_CONFIG.PONG_TIMEOUT,
        debug: DEV_MODE || window.MESSENGER_DEV_MODE,
      });

      if (client && !client.isConnected && !client.isConnecting) {
        console.log(
          '[MessengerContext] Session key available, connecting to WebSocket'
        );
        connectEnhancedWebSocket();
      } else if (client && client.isConnected) {
        console.log('[MessengerContext] WebSocket already connected');
        websocketClient.current = client;
        setIsSocketConnected(true);
        setSocketStats(client.getStats());
      } else {
        console.log('[MessengerContext] WebSocket connection in progress');
        websocketClient.current = client;
      }
    }
  }, [sessionKey, isChannel]);

  return (
    <MessengerContext.Provider value={value}>
      {children}
    </MessengerContext.Provider>
  );
};

export const useMessenger = () => {
  const context = React.useContext(MessengerContext);
  if (!context) {
    throw new Error('useMessenger must be used within a MessengerProvider');
  }
  return context;
};
