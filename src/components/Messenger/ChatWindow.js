import React, { useState, useEffect, useRef, useCallback, memo, useMemo } from 'react';
import { useMessenger } from '../../contexts/MessengerContext';
import MessageInput from './MessageInput';
import MessageItem from './MessageItem';
import useIntersectionObserver from '../../hooks/useIntersectionObserver';
import { Menu, MenuItem, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, Box, Typography, TextField, IconButton, Avatar, List, ListItem, ListItemIcon, ListItemText, ListItemAvatar } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowBack, Info, Link, Close } from '@mui/icons-material';
import EditIcon from '@mui/icons-material/Edit';

const MemoizedMessageItem = memo(MessageItem);



const ChatWindow = ({ backAction, isMobile, currentChat, setCurrentChat }) => {
  const { 
    activeChat, 
    messages, 
    loadMessages, 
    hasMoreMessages,
    loadingMessages,
    typingUsers,
    sendTextMessage,
    sendTypingIndicator,
    decryptMessage,
    uploadFile,
    user,
    onlineUsers,
    deleteChat
  } = useMessenger();
  
  const navigate = useNavigate();
  const [replyTo, setReplyTo] = useState(null);
  const messagesEndRef = useRef(null); // Якорь для прокрутки вниз
  const messagesAnchorRef = useRef(null); // Дополнительный якорь в самом низу списка
  const loadMoreTriggerRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const chatIdRef = useRef(null);
  const typingTimestampRef = useRef(null);
  const previousScrollHeightRef = useRef(0); // Для сохранения позиции при загрузке старых сообщений
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const [hasModeratorMessages, setHasModeratorMessages] = useState(false);
  
  const [groupInfoOpen, setGroupInfoOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  const API_URL = 'https://k-connect.ru/apiMes';
  const BASE_URL = 'https://k-connect.ru';
  
  const BOTTOM_SCROLL_THRESHOLD = 200;
  
  const HEADER_HEIGHT = 56; // px, adjust if header size changes
  const INPUT_HEIGHT = 80;  // px, approximate fixed input height
  
  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };
  
  const handleOpenProfile = () => {
    if (!activeChat || activeChat.is_group) return;
    
    const otherUser = activeChat.members?.find(member => {
      const memberId = member.user_id || member.id;
      return memberId !== user?.id;
    });
    
    if (otherUser) {
      navigate(`/profile/${otherUser.username}`);
    }
    
    handleCloseMenu();
  };
  
  const handleOpenDeleteDialog = () => {
    handleCloseMenu();
    setDeleteDialogOpen(true);
  };
  
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };
  
  const handleDeleteChat = async () => {
    if (activeChat) {
      const result = await deleteChat(activeChat.id);
      
      if (result.success) {
        console.log(`Чат ${activeChat.id} успешно удален`);
        
        if (isMobile && backAction) {
          backAction();
        }
      } else {
        console.error(`Ошибка при удалении чата: ${result.error}`);
      }
    }
    
    setDeleteDialogOpen(false);
  };
  
  useEffect(() => {
    if (activeChat?.id) {
      chatIdRef.current = activeChat.id;
    }
  }, [activeChat]);
  
  // Скрываем header и bottom navigation при открытии чата
  useEffect(() => {
    // Проверяем, является ли устройство мобильным
    const isMobileDevice = window.innerWidth <= 768;
    
    if (activeChat && isMobileDevice) {
      // Скрываем header и bottom navigation только на мобильных
      console.log('ChatWindow: Hiding header and navigation - entering chat', activeChat.id);
      document.dispatchEvent(new CustomEvent('messenger-layout-change', { 
        detail: { isInChat: true } 
      }));
      
      // Добавляем класс для полного экрана
      document.body.classList.add('messenger-chat-fullscreen');
    } else {
      // Показываем header и bottom navigation
      console.log('ChatWindow: Showing header and navigation - exiting chat or desktop');
      document.dispatchEvent(new CustomEvent('messenger-layout-change', { 
        detail: { isInChat: false } 
      }));
      
      // Убираем класс для полного экрана
      document.body.classList.remove('messenger-chat-fullscreen');
    }
    
    // Cleanup при размонтировании
    return () => {
      console.log('ChatWindow: Cleanup - ensuring header and navigation are visible');
      document.dispatchEvent(new CustomEvent('messenger-layout-change', { 
        detail: { isInChat: false } 
      }));
      document.body.classList.remove('messenger-chat-fullscreen');
    };
  }, [activeChat]);
  
  useEffect(() => {
    let mounted = true;
    
    if (activeChat?.id && (!messages[activeChat.id] || messages[activeChat.id].length === 0)) {
      console.log(`ChatWindow: Loading messages for chat ${activeChat.id}, is_group=${activeChat.is_group}`, 
        { chat: activeChat, messagesState: messages });
      
      const timer = setTimeout(() => {
        if (mounted && chatIdRef.current === activeChat.id) {
          console.log(`ChatWindow: Executing loadMessages for chat ${activeChat.id}`);
          loadMessages(activeChat.id);
          
          if (activeChat.is_group) {
            setTimeout(() => {
              if (mounted && chatIdRef.current === activeChat.id && 
                  (!messages[activeChat.id] || messages[activeChat.id].length === 0)) {
                console.log(`ChatWindow: Retry loading messages for group chat ${activeChat.id}`);
                loadMessages(activeChat.id);
              }
            }, 1500);
          }
        }
      }, 100);
      
      return () => {
        mounted = false;
        clearTimeout(timer);
      };
    }
    
    return () => {
      mounted = false;
    };
  }, [activeChat, loadMessages, messages]);
  
  useEffect(() => {
    if (activeChat && messages[activeChat.id]) {
      const apiHasModeratorMessages = messages[activeChat.id].hasModeratorMessages;
      
      if (apiHasModeratorMessages !== undefined) {
        setHasModeratorMessages(apiHasModeratorMessages);
      } else {
        const hasModerator = messages[activeChat.id].some(message => 
          message.is_from_moderator || 
          (activeChat.members && activeChat.members.some(member => 
            member.id === message.sender_id && member.is_moderator
          ))
        );
        setHasModeratorMessages(hasModerator);
      }
    } else {
      setHasModeratorMessages(false);
    }
  }, [activeChat, messages]);
  
  // Улучшенная функция прокрутки к низу с использованием якоря
  const scrollToBottom = useCallback((smooth = false) => {
    const container = messagesContainerRef.current;
    if (container) {
      const behavior = smooth ? 'smooth' : 'auto';
      container.scrollTo({ top: container.scrollHeight, behavior });
      return;
    }

    // fallback to anchor
    const anchorElement = messagesAnchorRef.current || messagesEndRef.current;
    if (anchorElement) {
      anchorElement.scrollIntoView({ behavior, block: 'end', inline: 'nearest' });
    }
  }, []);
  
  // Принудительная прокрутка к низу при открытии чата или получении новых сообщений
  useEffect(() => {
    if (activeChat && messages[activeChat.id] && autoScrollEnabled) {
      // Небольшая задержка для рендера сообщений
      const timeoutId = setTimeout(() => {
        scrollToBottom();
      }, 150);
      
      return () => clearTimeout(timeoutId);
    }
  }, [activeChat, messages, scrollToBottom, autoScrollEnabled]);
  
  // Прокрутка к низу при смене чата
  useEffect(() => {
    if (activeChat && messages[activeChat.id]) {
      const timeoutId = setTimeout(() => {
        scrollToBottom();
        setAutoScrollEnabled(true);
      }, 200);
      
      return () => clearTimeout(timeoutId);
    }
  }, [activeChat?.id, scrollToBottom]);
  
  const handleScroll = useCallback(() => {
    if (messagesContainerRef.current) {
      const { scrollHeight, scrollTop, clientHeight } = messagesContainerRef.current;
      const scrolledToBottom = Math.abs(scrollHeight - scrollTop - clientHeight) <= BOTTOM_SCROLL_THRESHOLD;
      setIsAtBottom(scrolledToBottom);
      
      if (scrolledToBottom && !autoScrollEnabled) {
        setAutoScrollEnabled(true);
      } 
      
      else if (!scrolledToBottom && autoScrollEnabled) {
        setAutoScrollEnabled(false);
      }
    }
  }, [autoScrollEnabled]);
  
  const throttledScrollHandler = useCallback(() => {
    let isThrottled = false;
    
    return () => {
      if (!isThrottled) {
        handleScroll();
        isThrottled = true;
        
        setTimeout(() => {
          isThrottled = false;
        }, 200);
      }
    };
  }, [handleScroll]);
  
  useEffect(() => {
    const container = messagesContainerRef.current;
    const throttled = throttledScrollHandler();
    
    if (container) {
      container.addEventListener('scroll', throttled);
      return () => container.removeEventListener('scroll', throttled);
    }
  }, [throttledScrollHandler]);
  
  const hasMoreMessagesForChat = activeChat && 
                               hasMoreMessages && 
                               Object.prototype.hasOwnProperty.call(hasMoreMessages, activeChat.id) && 
                               hasMoreMessages[activeChat.id];
                               
  // Улучшенная логика загрузки старых сообщений с сохранением позиции скролла
  useIntersectionObserver({
    target: loadMoreTriggerRef,
    onIntersect: () => {
      if (activeChat && hasMoreMessagesForChat && !loadingMessages) {
        const container = messagesContainerRef.current;
        if (container) {
          // Save current metrics before loading new portion
          const prevScrollHeight = container.scrollHeight;
          const prevScrollTop = container.scrollTop;

          // Disable auto-scroll while we are fetching older messages
          setAutoScrollEnabled(false);

          loadMessages(activeChat.id)
            .then(() => {
              // Wait for DOM to paint new messages
              requestAnimationFrame(() => {
                const currContainer = messagesContainerRef.current;
                if (!currContainer) return;

                const newScrollHeight = currContainer.scrollHeight;
                // Сохраняем позицию так, чтобы пользователь остался примерно там же,
                // но если он был прямо на самом верху (prevScrollTop≈0), добавим небольшой
                // отступ, чтобы новые сообщения не оказывались уже прокрученными.
                let newTop = newScrollHeight - prevScrollHeight + prevScrollTop;
                if (prevScrollTop < 5) {
                  newTop += 20; // микро-отступ, чтобы дать возможности доскроллить
                }
                currContainer.scrollTop = newTop;
              });
            })
            .catch((error) => {
              console.error('Error loading more messages:', error);
            });
        } else {
          loadMessages(activeChat.id);
        }
      }
    },
    enabled: !!activeChat && hasMoreMessagesForChat && !loadingMessages,
    threshold: 0.5,
    rootMargin: '100px'
  });
  
  const handleSendMessage = useCallback(async (text) => {
    if (!activeChat || !text.trim()) return;
    
    try {
      const replyToId = replyTo ? replyTo.id : null;
      await sendTextMessage(activeChat.id, text, replyToId);
      
      setReplyTo(null);
      
      // Включаем автопрокрутку и прокручиваем к низу при отправке сообщения
      setAutoScrollEnabled(true);
      setTimeout(() => scrollToBottom(true), 150);
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
    }
  }, [activeChat, replyTo, sendTextMessage, scrollToBottom]);
  
  const handleFileUpload = useCallback(async (file, type) => {
    if (!activeChat || !file) return;
    
    try {
      const replyToId = replyTo ? replyTo.id : null;
      await uploadFile(activeChat.id, file, type, replyToId);
      
      setReplyTo(null);
      
      // Включаем автопрокрутку и прокручиваем к низу при отправке файла
      setAutoScrollEnabled(true);
      setTimeout(() => scrollToBottom(true), 150);
    } catch (error) {
      console.error('Ошибка загрузки файла:', error);
    }
  }, [activeChat, replyTo, uploadFile, scrollToBottom]);
  
  const handleTyping = useCallback((isTyping) => {
    if (!activeChat) return;
    
    if (isTyping) {
      const now = new Date().getTime();
      const lastTypingEvent = typingTimestampRef.current || 0;
      
      if (now - lastTypingEvent > 2000) {
        sendTypingIndicator(activeChat.id, isTyping);
        typingTimestampRef.current = now;
      }
    } else {
      sendTypingIndicator(activeChat.id, isTyping);
    }
  }, [activeChat, sendTypingIndicator]);
  
  const renderTypingIndicator = useCallback(() => {
    if (!activeChat || !typingUsers[activeChat.id]) return null;
    
    const typingUserIds = Object.keys(typingUsers[activeChat.id]);
    if (typingUserIds.length === 0) return null;
    
    const typingUserNames = typingUserIds.map(userId => {
      const member = activeChat.members?.find(m => m.user_id === parseInt(userId));
      const name = member?.name || member?.username || 'Кто-то';
      return name.length > 6 ? name.substring(0, 6) + '...' : name;
    });
    
    let typingText = '';
    if (typingUserNames.length === 1) {
      typingText = `${typingUserNames[0]} печатает...`;
    } else if (typingUserNames.length === 2) {
      typingText = `${typingUserNames[0]} и ${typingUserNames[1]} печатают...`;
    } else {
      typingText = `${typingUserNames.length} человек печатают...`;
    }
    
    return (
      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <div className="typing-animation">
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
        {typingText}
      </Typography>
    );
  }, [activeChat, typingUsers]);
  
  const renderScrollToBottom = () => {
    if (isAtBottom) return null;
    
    return (
      <button 
        className="scroll-to-bottom"
        onClick={() => {
          setAutoScrollEnabled(true);
          scrollToBottom(true);
        }}
      >
        ↓
      </button>
    );
  };
  
  const getChatTitle = useCallback(() => {
    if (!activeChat) return 'Чат';
    
    if (activeChat.is_group || activeChat.chat_type === 'group') {
      return activeChat.title || 'Групповой чат';
    } else {
      const otherMember = activeChat.members?.find(member => {
        const memberId = member.user_id || member.id;
        
        const memberIdStr = memberId ? String(memberId) : null;
        const currentUserIdStr = user?.id ? String(user.id) : null;
        
        return memberIdStr && currentUserIdStr && memberIdStr !== currentUserIdStr;
      });
      
      if (otherMember) {
        return otherMember.name || otherMember.username || activeChat.title || 'Личная переписка';
      }
      
      return activeChat.title || 'Личная переписка';
    }
  }, [activeChat, user]);
  
  const getChatAvatar = useCallback(() => {
    if (!activeChat) return null;
    
    if (activeChat.is_group || activeChat.chat_type === 'group') {
      return activeChat.avatar || null;
    } else {
      const otherMember = activeChat.members?.find(member => {
        const memberId = member.user_id || member.id;
        
        const memberIdStr = memberId ? String(memberId) : null;
        const currentUserIdStr = user?.id ? String(user.id) : null;
        
        return memberIdStr && currentUserIdStr && memberIdStr !== currentUserIdStr;
      });
      
      if (otherMember) {
        const otherUserId = otherMember.user_id || otherMember.id;
        const photo = otherMember.photo || otherMember.avatar;
        
        if (photo && otherUserId && typeof photo === 'string') {
          if (!photo.startsWith('/') && !photo.startsWith('http') && !photo.startsWith('/static/')) {
            console.log(`ChatWindow: строим правильный путь аватара для ${otherUserId}`);
            return `/static/uploads/avatar/${otherUserId}/${photo}`;
          }
        }
        
        return otherMember.avatar || otherMember.photo || null;
      }
      
      return activeChat.avatar || null;
    }
  }, [activeChat, user]);

  const getAvatarLetter = useCallback(() => {
    const title = getChatTitle();
    return title?.[0]?.toUpperCase() || '?';
  }, [getChatTitle]);
  
  const chatMessages = activeChat ? (messages[activeChat.id] || []) : [];

  // Форматирование текста разделителя
  const formatDateSeparator = (dateKey) => {
    if (!dateKey) return '';
    const today = new Date();
    const todayKey = today.toISOString().slice(0, 10);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().slice(0, 10);
    if (dateKey === todayKey) return 'Сегодня';
    if (dateKey === yesterdayKey) return 'Вчера';
    const date = new Date(dateKey);
    return date.toLocaleDateString('ru-RU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Группировка сообщений с разделителями дат
  const memoizedMessages = useMemo(() => {
    if (!activeChat || !chatMessages.length) return [];
    const messagesWithSeparators = [];
    let lastDateKey = null;
    chatMessages.forEach((message, index) => {
      // Получаем date_key или создаем из created_at
      let dateKey = message.date_key;
      if (!dateKey && message.created_at) {
        try {
          const date = new Date(message.created_at);
          if (!isNaN(date.getTime())) {
            dateKey = date.toISOString().slice(0, 10);
          }
        } catch (e) {
          console.warn('Invalid date format:', message.created_at);
        }
      }
      
      if (dateKey && dateKey !== lastDateKey) {
        messagesWithSeparators.push({
          type: 'date_separator',
          text: formatDateSeparator(dateKey),
          id: `separator_${dateKey}_${index}`
        });
        lastDateKey = dateKey;
      }
      messagesWithSeparators.push({
        type: 'message',
        data: message
      });
    });
    return messagesWithSeparators.map(item => {
      if (item.type === 'date_separator') {
        return (
          <div key={item.id} className="date-separator">
            <span>{item.text}</span>
          </div>
        );
      } else {
        const message = item.data;
        // На сервере reply_to_id и id могут приходить как строки или числа.
        // Поэтому приводим к строке для корректного поиска, а также не
        // блокируем поиск временными сообщениями, если они есть.
        const replyMessage = message.reply_to_id ?
          chatMessages.find(m => String(m.id) === String(message.reply_to_id))
          : null;
        
        // Добавляем логирование для отладки ответов
        if (message.reply_to_id) {
          console.log(`Message ${message.id} has reply_to_id: ${message.reply_to_id}, found reply message:`, replyMessage ? replyMessage.id : 'NOT FOUND');
        }
        
        return (
          <MemoizedMessageItem
            key={message.id}
            message={message}
            isCurrentUser={message.sender_id === user?.id}
            decryptedContent={activeChat?.encrypted ? decryptMessage(message, activeChat.id) : message.content}
            onReply={() => setReplyTo(message)}
            replyMessage={replyMessage}
            chatMembers={activeChat?.members}
          />
        );
      }
    });
  }, [chatMessages, user, activeChat, decryptMessage, setReplyTo]);
  
  const formatLastActive = (dateObject) => {
    if (!dateObject) return "Не в сети";
    
    try {
      if (typeof dateObject === 'string' && /^\d{1,2}:\d{2}$/.test(dateObject)) {
        const today = new Date();
        const options = {
          month: 'long',
          day: 'numeric'
        };
        const formattedDate = today.toLocaleDateString('ru-RU', options);
        return `Был${isFemale ? 'а' : ''} в сети ${formattedDate} в ${dateObject}`;
      }
      
      if (typeof dateObject === 'string' && /^\d{1,2}\s+\w+$/.test(dateObject)) {
        return `Был${isFemale ? 'а' : ''} в сети ${dateObject}`;
      }
      
      const date = dateObject instanceof Date ? dateObject : new Date(dateObject);
      if (isNaN(date.getTime())) {
        console.error('Неверный формат даты:', dateObject);
        
        return typeof dateObject === 'string' 
          ? `Был${isFemale ? 'а' : ''} в сети ${dateObject}` 
          : "Не в сети";
      }
      
      const now = new Date();
      
      const diffMs = now - date;
      
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);
      
      if (diffMins < 1) return 'В сети';
      if (diffMins < 60) return `Был${isFemale ? 'а' : ''} в сети ${diffMins} мин. назад`;
      if (diffHours < 24) return `Был${isFemale ? 'а' : ''} в сети ${diffHours} ч. назад`;
      if (diffDays < 7) return `Был${isFemale ? 'а' : ''} в сети ${diffDays} дн. назад`;
      
      const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      };
      
      return `Был${isFemale ? 'а' : ''} в сети ${date.toLocaleString('ru-RU', options)}`;
    } catch (e) {
      console.error('Ошибка форматирования даты:', e, dateObject);
      
      return typeof dateObject === 'string' 
        ? `Был${isFemale ? 'а' : ''} в сети ${dateObject}` 
        : "Не в сети";
    }
  };
  
  const otherUser = useMemo(() => {
    if (!activeChat || activeChat.is_group || !activeChat.members) return null;
    
    return activeChat.members.find(member => {
      const memberId = member.user_id || member.id;
      
      const memberIdStr = memberId ? String(memberId) : null;
      const currentUserIdStr = user?.id ? String(user.id) : null;
      
      return memberIdStr && currentUserIdStr && memberIdStr !== currentUserIdStr;
    });
  }, [activeChat, user]);
  
  const isFemale = useMemo(() => {
    if (!otherUser) return false;
    
    if (otherUser.gender) {
      return otherUser.gender === 'female';
    }
    
    const name = otherUser.name || '';
    return name.endsWith('а') || name.endsWith('я');
  }, [otherUser]);
  
  const userStatus = useMemo(() => {
    if (!otherUser) return 'Не в сети';
    
    if (onlineUsers[otherUser.user_id || otherUser.id]) {
      return 'В сети';
    }
    
    if (otherUser.last_active) {
      return formatLastActive(otherUser.last_active);
    }
    
    return 'Не в сети';
  }, [otherUser, onlineUsers]);

  // Обработчик копирования ссылки-приглашения
  const handleCopyInviteLink = async () => {
    try {
      const response = await axios.post(`${API_URL}/messenger/chats/${activeChat.id}/invite`);
      if (response.data.success) {
        const inviteLink = `${window.location.origin}/messenger/join/${response.data.invite_link}`;
        await navigator.clipboard.writeText(inviteLink);
        setSnackbarMessage('Ссылка скопирована в буфер обмена');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error generating invite link:', error);
      setSnackbarMessage('Ошибка при генерации ссылки');
      setSnackbarOpen(true);
    }
  };

  // Обработчик изменения аватара группы
  const handleGroupAvatarChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const response = await axios.post(`${API_URL}/messenger/chats/${activeChat.id}/update`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (response.data.success) {
        setCurrentChat(prev => ({
          ...prev,
          avatar: response.data.avatar
        }));
        setSnackbarMessage('Аватар группы обновлен');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error updating group avatar:', error);
      setSnackbarMessage('Ошибка при обновлении аватара');
      setSnackbarOpen(true);
    }
  };

  // Обработчик изменения названия группы
  const handleGroupTitleChange = async (newTitle) => {
    try {
      const response = await axios.post(`${API_URL}/messenger/chats/${activeChat.id}/update`, {
        title: newTitle
      });
      if (response.data.success) {
        setCurrentChat(prev => ({
          ...prev,
          title: newTitle
        }));
        setSnackbarMessage('Название группы обновлено');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error updating group title:', error);
      setSnackbarMessage('Ошибка при обновлении названия');
      setSnackbarOpen(true);
    }
  };

  const isCurrentUserAdmin = activeChat && activeChat.members && user && activeChat.members.some(m => m.user_id === user.id && m.role === 'admin');
  const [editTitle, setEditTitle] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);

  useEffect(() => {
    if (groupInfoOpen && activeChat?.title) {
      setEditTitle(activeChat.title);
      setEditingTitle(false);
    }
  }, [groupInfoOpen, activeChat?.title]);

  if (!activeChat) {
    return (
      <div className="chat-window chat-window-empty">
        <div className="empty-state">
          <h3>Выберите чат или начните новый</h3>
          <p>Выберите существующий чат слева или создайте новый, чтобы начать общение</p>
        </div>
      </div>
    );
  }
  
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      height: '100dvh',        // динамическая высота вьюпорта, корректно реагирует на скрытие/появление адресной строки/клавиатуры
      maxHeight: '100dvh',
      overscrollBehavior: 'contain', // предотвращает "bounce-scroll"
      background: isMobile ? 'rgb(26 26 26)' : 'transparent',
    }}>
      {/* Заголовок чата */}
      <Box sx={{ 
        position: 'sticky', // фиксация при прокрутке
        top: 0,
        zIndex: 5,
        display: 'flex', 
        alignItems: 'center', 
        p: 0.5, 
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}>
        {isMobile && (
          <IconButton 
            onClick={backAction}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
        )}
        
        <Avatar 
          src={getChatAvatar() ? `${BASE_URL}${getChatAvatar()}` : undefined}
          alt={getChatTitle()}
          sx={{ 
            width: 40, 
            height: 40, 
            mr: 2,
            cursor: 'pointer'
          }}
          onClick={() => {
            if (activeChat?.is_group) {
              setGroupInfoOpen(true);
            }
          }}
        >
          {getAvatarLetter()}
        </Avatar>
        
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" noWrap>
            {getChatTitle()}
          </Typography>
          {!activeChat.is_group && activeChat.chat_type !== 'group' && (
            <Typography variant="caption" color="text.secondary">
              {userStatus}
            </Typography>
          )}
          {activeChat.is_group && (
            <Box sx={{ 
              minHeight: '10px', 
              display: 'flex', 
              alignItems: 'center'
            }}>
              {renderTypingIndicator() ? (
                renderTypingIndicator()
              ) : (
                <Typography variant="caption" color="text.secondary">
                  {activeChat.members?.length || 0} участников
                </Typography>
              )}
            </Box>
          )}
          {activeChat.encrypted && <Typography variant="caption" color="text.secondary">🔒</Typography>}
        </Box>
        
        <IconButton onClick={(e) => handleOpenMenu(e)}>
          <MoreVertIcon />
        </IconButton>
        
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleCloseMenu}
          PaperProps={{
            sx: {
              backgroundColor: 'rgba(10, 10, 10, 0.75)',
              color: '#fff',
              boxShadow: '0 8px 32px 0 rgba(0,0,0,0.37)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              borderRadius: '8px',
              minWidth: 180,
              p: 0.5
            }
          }}
        >
          {!activeChat?.is_group && (
            <MenuItem onClick={handleOpenProfile}>
              <PersonIcon fontSize="small" style={{ marginRight: '8px' }} />
              Профиль пользователя
            </MenuItem>
          )}
          <MenuItem onClick={handleOpenDeleteDialog}>
            <DeleteIcon fontSize="small" style={{ marginRight: '8px' }} />
            Удалить чат
          </MenuItem>
        </Menu>
      </Box>

      {/* Диалог с информацией о группе */}
      <Dialog
        fullScreen={isMobile}
        open={groupInfoOpen}
        onClose={() => setGroupInfoOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'rgba(255, 255, 255, 0.03)',
            color: '#fff',
            backdropFilter: 'blur(50px)',
            WebkitBackdropFilter: 'blur(50px)',
            borderRadius: '8px',
          }
        }}
      >
        <DialogTitle sx={{ bgcolor: 'transparent', color: '#fff' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Информация о группе</Typography>
            <IconButton onClick={() => setGroupInfoOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ bgcolor: 'transparent', color: '#fff' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, my: 2 }}>
            <Avatar
              src={getChatAvatar() ? `${BASE_URL}${getChatAvatar()}` : undefined}
              alt={getChatTitle()}
              sx={{ width: 100, height: 100, cursor: 'pointer' }}
              onClick={() => document.getElementById('groupAvatarInput').click()}
            >
              {getAvatarLetter()}
            </Avatar>
            <input
              type="file"
              id="groupAvatarInput"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleGroupAvatarChange}
            />
            <TextField
              fullWidth
              label="Название группы"
              value={editingTitle ? editTitle : activeChat?.title || ''}
              onChange={e => setEditTitle(e.target.value)}
              variant="outlined"
              disabled={!isCurrentUserAdmin || !editingTitle}
              InputProps={{
                endAdornment: isCurrentUserAdmin && !editingTitle ? (
                  <IconButton size="small" onClick={() => setEditingTitle(true)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                ) : null
              }}
            />
            {isCurrentUserAdmin && editingTitle && (
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={async () => {
                    await handleGroupTitleChange(editTitle);
                    setEditingTitle(false);
                  }}
                  disabled={!editTitle.trim()}
                >
                  Сохранить
                </Button>
                <Button size="small" onClick={() => { setEditTitle(activeChat.title); setEditingTitle(false); }}>Отмена</Button>
              </Box>
            )}
          </Box>
          <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Участники</Typography>
          <List>
            {activeChat?.members?.map((member) => (
              <ListItem key={member.user_id}>
                <ListItemAvatar>
                  <Avatar src={member.avatar ? `${BASE_URL}${member.avatar}` : undefined}>
                    {member.name?.[0]}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  primary={member.name || member.username || `Пользователь #${member.user_id}`}
                  secondary={member.role === 'admin' ? 'Администратор' : 'Участник'}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGroupInfoOpen(false)}>Закрыть</Button>
          <Button 
            onClick={() => {
              handleCopyInviteLink();
              setGroupInfoOpen(false);
            }}
            startIcon={<Link />}
          >
            Копировать ссылку
          </Button>
        </DialogActions>
      </Dialog>

      {/* Область сообщений с улучшенным контейнером */}
      <Box 
        ref={messagesContainerRef}
        sx={{ 
          flex: 1, 
          overflow: 'auto',
          pt: `${HEADER_HEIGHT}px`,
          pb: `${INPUT_HEIGHT}px`,
          px: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1
        }}
      >
        {/* Триггер для загрузки предыдущих сообщений при прокрутке вверх */}
        {hasMoreMessagesForChat && (
          <div 
            ref={loadMoreTriggerRef} 
            className="load-more-trigger"
          >
            {loadingMessages && (
              <div className="loading-more">
                <div className="loading-spinner-small"></div>
                <span>Загрузка истории...</span>
              </div>
            )}
          </div>
        )}
        
        {/* Список сообщений */}
        <div className="messages-list">
          {memoizedMessages}
          
          {/* Якорь в самом низу списка сообщений */}
          <div 
            ref={messagesAnchorRef} 
            style={{ 
              height: '1px', 
              visibility: 'hidden',
              marginTop: '8px'
            }} 
          />
        </div>
        
        {/* Резервный невидимый элемент для прокрутки вниз */}
        <div ref={messagesEndRef} style={{ height: '1px' }} />
      </Box>
      
      {/* Кнопка прокрутки вниз */}
      {renderScrollToBottom()}
      
      {/* Поле ввода сообщения */}
      <MessageInput 
        isMobile={isMobile}
        onSendMessage={handleSendMessage}
        onTyping={handleTyping}
        onFileUpload={handleFileUpload}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
      />
      
      {/* Диалог подтверждения удаления чата */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        PaperProps={{
          sx: {
            background: 'rgba(255, 255, 255, 0.03)',
            color: '#fff',
            backdropFilter: 'blur(50px)',
            WebkitBackdropFilter: 'blur(50px)',
            borderRadius: '8px',
          }
        }}
      >
        <DialogTitle sx={{ bgcolor: 'transparent', color: '#fff' }}>
          Удалить чат?
        </DialogTitle>
        <DialogContent sx={{ bgcolor: 'transparent', color: '#fff' }}>
          <DialogContentText sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Вы уверены, что хотите удалить этот чат? Это действие нельзя отменить.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ bgcolor: 'transparent' }}>
          <Button onClick={handleCloseDeleteDialog} sx={{ color: '#fff' }}>
            Отмена
          </Button>
          <Button onClick={handleDeleteChat} sx={{ color: '#f44336' }} autoFocus>
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default memo(ChatWindow); 