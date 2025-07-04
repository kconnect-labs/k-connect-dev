import React, { useState, useRef, useEffect, useCallback } from 'react';
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import PhotoIcon from '@mui/icons-material/Photo';
import CloseIcon from '@mui/icons-material/Close';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import StickerPicker from './StickerPicker';

const MessageInput = ({ 
  onSendMessage, 
  onTyping,
  onFileUpload,
  replyTo,
  onCancelReply,
  isMobile = false,
  containerRef
}) => {
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  
  
  useEffect(() => {
    if (replyTo && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [replyTo]);
  
  
  const handleSendMessage = useCallback(() => {
    if (!message.trim() && !isUploading) return;
    
    const currentMessage = message;
    
    
    const messageToSend = currentMessage;
    
    
    
    setMessage(' ');
    
    
    setTimeout(() => {
      
      setMessage('');
      
      
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
      
      
      onSendMessage(messageToSend);
    }, 10);
    
    
    onTyping(false);
  }, [message, onSendMessage, isUploading, onTyping]);
  
  
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);
  
  
  const handleMessageChange = useCallback((e) => {
    const newMessage = e.target.value;
    setMessage(newMessage);
    
    if (newMessage.trim()) {
      onTyping(true);
    }
  }, [onTyping]);
  
  
  const triggerFileUpload = useCallback(() => {
    
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('data-upload-type', 'photo');
      fileInputRef.current.click();
    }
  }, []);
  
  
  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const uploadType = 'photo';
    
    
    if (file.size > 50 * 1024 * 1024) {
      alert('Файл слишком большой. Максимальный размер: 50MB');
      return;
    }
    
    
    const fileType = file.type.split('/')[0];
    if (fileType !== 'image') {
      alert('Пожалуйста, выберите изображение');
      return;
    }
    
    
    setIsUploading(true);
    
    
    onFileUpload(file, uploadType)
      .finally(() => {
        setIsUploading(false);
        
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      });
  }, [onFileUpload]);
  
  // Обработка выбора стикера
  const handleStickerSelect = useCallback((stickerData) => {
    // Отправляем стикер как специальное сообщение
    const stickerMessage = `[STICKER_${stickerData.pack_id}_${stickerData.sticker_id}]`;
    onSendMessage(stickerMessage);
    setShowStickerPicker(false);
  }, [onSendMessage]);
  
  // Переключение стикер-пикера
  const toggleStickerPicker = useCallback(() => {
    setShowStickerPicker(prev => !prev);
  }, []);
  
  // Закрытие стикер-пикера
  const closeStickerPicker = useCallback(() => {
    setShowStickerPicker(false);
  }, []);
  
  const renderReplyInfo = () => {
    if (!replyTo) return null;
    
    let previewContent = '';
    if (replyTo.message_type === 'text') {
      // Проверяем, является ли текстовое сообщение стикером
      const stickerMatch = replyTo.content.match(/\[STICKER_(\d+)_(\d+)\]/);
      if (stickerMatch) {
        previewContent = '🏷️ Стикер';
      } else {
        previewContent = replyTo.content.length > 30 
          ? replyTo.content.substring(0, 30) + '...'
          : replyTo.content;
      }
    } else if (replyTo.message_type === 'photo') {
      previewContent = '📷 Фото';
    } else if (replyTo.message_type === 'video') {
      previewContent = '🎬 Видео';
    } else if (replyTo.message_type === 'audio') {
      previewContent = '🎵 Аудио';
    } else if (replyTo.message_type === 'sticker') {
      previewContent = '🏷️ Стикер';
    } else {
      previewContent = '📎 Файл';
    }
    
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          marginBottom: '4px',
          borderRadius: '12px 12px 0 0',
          backgroundColor: '#252525',
          borderLeft: '2px solid #D0BCFF'
        }}
      >
        <div className="reply-text" style={{ color: '#d8d8d8' }}>
          <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#D0BCFF' }}>
            {replyTo.sender_name}
          </div>
          <div style={{ fontSize: '13px' }}>{previewContent}</div>
        </div>
        <IconButton 
          size="small" 
          onClick={onCancelReply}
          sx={{ 
            color: '#6b6b6b',
            padding: '4px'
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
    );
  };
  
  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'sticky',
        bottom: 0,
        zIndex: 6,
        padding: '8px',
        pb: 'calc(env(safe-area-inset-bottom, 0px) + 20px)',
        backgroundColor: 'transparent' ? isMobile : '#1a1a1a',
        borderRadius: 0,
        boxShadow: 'none',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {renderReplyInfo()}
      
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#262626',
          borderRadius: isMobile ? '18px' : '8px',
          padding: isMobile ? '0 4px' : '4px 6px',
          boxShadow: isMobile ? 'none' : '0px 0px 2px rgb(0 0 0 / 43%), 0px 4px 16px rgb(46 46 46 / 86%)',
        }}
      >
        <IconButton 
          size="small"
          onClick={triggerFileUpload}
          sx={{ 
            color: '#D0BCFF', 
            padding: '8px',
            '&:hover': { 
              color: '#D0BCFF'
            }
          }}
        >
          <PhotoIcon fontSize="small" />
        </IconButton>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleMessageChange}
          onKeyDown={handleKeyDown}
          placeholder="Сообщение..."
          disabled={isUploading}
          style={{
            border: 'none',
            backgroundColor: 'transparent',
            color: '#ffffff',
            resize: 'none',
            outline: 'none',
            margin: '0',
            flex: 1,
            minHeight: '20px',
            maxHeight: '80px',
            fontSize: '14px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            alignContent: 'center'
          }}
        />
        
        <IconButton 
          size="small"
          onClick={toggleStickerPicker}
          sx={{ 
            color: showStickerPicker ? '#D0BCFF' : '#6b6b6b', 
            padding: '8px',
            '&:hover': { 
              color: '#D0BCFF'
            }
          }}
        >
          <EmojiEmotionsIcon fontSize="small" />
        </IconButton>
        
        <IconButton 
          size="small"
          onClick={handleSendMessage}
          disabled={!message.trim() && !isUploading}
          sx={{
            color: message.trim() ? '#D0BCFF' : '#3a3a3a',
            padding: '8px',
            '&:hover': { 
              color: message.trim() ? '#D0BCFF' : '#3a3a3a'
            }
          }}
        >
          {isUploading ? (
            <CircularProgress size={18} color="inherit" />
          ) : (
            <SendIcon fontSize="small" />
          )}
        </IconButton>
      </Box>
      
      {/* Стикер-пикер */}
      <StickerPicker
        isOpen={showStickerPicker}
        onStickerSelect={handleStickerSelect}
        onClose={closeStickerPicker}
      />
    </Box>
  );
};

export default React.memo(MessageInput); 