import React, { useState, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import './CommentInput.css';

interface User {
  id: number;
  name: string;
  avatar_url?: string;
  photo?: string;
}

interface CommentInputProps {
  user: User;
  placeholder?: string;
  onSubmit: (content: string, image?: File) => void;
  onImageSelect?: (image: File) => void;
  disabled?: boolean;
  isSubmitting?: boolean;
  showAvatar?: boolean;
  maxLength?: number;
  className?: string;
}

const CommentInput: React.FC<CommentInputProps> = ({
  user,
  placeholder,
  onSubmit,
  onImageSelect,
  disabled = false,
  isSubmitting = false,
  showAvatar = true,
  maxLength = 1000,
  className = '',
}) => {
  const { t } = useLanguage();
  const [content, setContent] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const getAvatarUrl = (user: User) => {
    if (user.avatar_url) return user.avatar_url;
    if (user.photo && user.photo !== 'avatar.png') {
      return `https://s3.k-connect.ru/static/uploads/avatar/${user.id}/${user.photo}`;
    }
    return 'https://s3.k-connect.ru/static/uploads/avatar/system/avatar.png';
  };

  const handleSubmit = () => {
    if (!content.trim() && !image) return;
    
    onSubmit(content.trim(), image || undefined);
    
    // Reset form
    setContent('');
    setImage(null);
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImagePreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
      
      if (onImageSelect) {
        onImageSelect(file);
      }
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const canSubmit = (content.trim() || image) && !disabled && !isSubmitting;

  return (
    <div className={`comment-input ${className}`}>
      <div className="comment-input-container">
        {showAvatar && (
          <div className="comment-input-avatar">
            <img
              src={getAvatarUrl(user)}
              alt={user.name}
              className="comment-input-avatar-img"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://s3.k-connect.ru/static/uploads/avatar/system/avatar.png';
              }}
            />
          </div>
        )}
        
        <div className="comment-input-content">
          <div className="comment-input-field">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder || t('post.writeComment')}
              disabled={disabled}
              maxLength={maxLength}
              className="comment-input-textarea"
              rows={1}
            />
            
            <div className="comment-input-actions">
              <button
                type="button"
                className="comment-input-action"
                onClick={handleImageClick}
                disabled={disabled}
                title="Добавить изображение"
              >
                <svg viewBox="0 0 24 24" className="comment-input-action-icon">
                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                </svg>
              </button>
              
              <button
                type="button"
                className="comment-input-send"
                onClick={handleSubmit}
                disabled={!canSubmit}
                title="Отправить"
              >
                {isSubmitting ? (
                  <div className="comment-input-spinner">
                    <div className="spinner"></div>
                  </div>
                ) : (
                  <svg viewBox="0 0 24 24" className="comment-input-send-icon">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          {imagePreview && (
            <div className="comment-input-image-preview">
              <img
                src={imagePreview}
                alt="Preview"
                className="comment-input-preview-img"
              />
              <button
                type="button"
                className="comment-input-remove-image"
                onClick={handleRemoveImage}
                title="Удалить изображение"
              >
                <svg viewBox="0 0 24 24">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
          )}
          
        </div>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        style={{ display: 'none' }}
        disabled={disabled}
      />
    </div>
  );
};

export default CommentInput;
