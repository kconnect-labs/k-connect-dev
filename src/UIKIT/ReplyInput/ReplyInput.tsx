import React, { useState, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import './ReplyInput.css';

interface User {
  id: number;
  name: string;
  avatar_url?: string;
  photo?: string;
}

interface ReplyInputProps {
  user: User;
  placeholder?: string;
  onSubmit: (content: string, image?: File, parentReplyId?: number) => void;
  onCancel: () => void;
  disabled?: boolean;
  isSubmitting?: boolean;
  replyingTo?: {
    name: string;
    id?: number;
  };
  maxLength?: number;
  className?: string;
}

const ReplyInput: React.FC<ReplyInputProps> = ({
  user,
  placeholder,
  onSubmit,
  onCancel,
  disabled = false,
  isSubmitting = false,
  replyingTo,
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

    onSubmit(content.trim(), image || undefined, replyingTo?.id);

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
    <div className={`reply-input visible ${className}`}>
      {replyingTo && (
        <div className='reply-input-header'>
          <div className='reply-input-replying-to'>
            <svg viewBox='0 0 24 24' className='reply-input-reply-icon'>
              <path d='M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z' />
            </svg>
            <span className='reply-input-replying-text'>
              Ответ для {replyingTo.name}
            </span>
            <button
              type='button'
              className='reply-input-close'
              onClick={onCancel}
              title='Отменить ответ'
            >
              <svg viewBox='0 0 24 24'>
                <path d='M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z' />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className='reply-input-container'>
        <div className='reply-input-avatar'>
          <img
            src={getAvatarUrl(user)}
            alt={user.name}
            className='reply-input-avatar-img'
            onError={e => {
              const target = e.target as HTMLImageElement;
              target.src =
                'https://s3.k-connect.ru/static/uploads/avatar/system/avatar.png';
            }}
          />
        </div>

        <div className='reply-input-content'>
          <div className='reply-input-field'>
            <textarea
              ref={textareaRef}
              value={content}
              onChange={e => setContent(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder || 'Написать ответ...'}
              disabled={disabled}
              maxLength={maxLength}
              className='reply-input-textarea'
              rows={1}
            />

            <div className='reply-input-actions'>
              <button
                type='button'
                className='reply-input-action'
                onClick={handleImageClick}
                disabled={disabled}
                title='Добавить изображение'
              >
                <svg viewBox='0 0 24 24' className='reply-input-action-icon'>
                  <path d='M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z' />
                </svg>
              </button>

              <button
                type='button'
                className='reply-input-send'
                onClick={handleSubmit}
                disabled={!canSubmit}
                title='Отправить'
              >
                {isSubmitting ? (
                  <div className='reply-input-spinner'>
                    <div className='spinner'></div>
                  </div>
                ) : (
                  <svg viewBox='0 0 24 24' className='reply-input-send-icon'>
                    <path d='M2.01 21L23 12 2.01 3 2 10l15 2-15 2z' />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {imagePreview && (
            <div className='reply-input-image-preview'>
              <img
                src={imagePreview}
                alt='Preview'
                className='reply-input-preview-img'
              />
              <button
                type='button'
                className='reply-input-remove-image'
                onClick={handleRemoveImage}
                title='Удалить изображение'
              >
                <svg viewBox='0 0 24 24'>
                  <path d='M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z' />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type='file'
        accept='image/*'
        onChange={handleImageChange}
        style={{ display: 'none' }}
        disabled={disabled}
      />
    </div>
  );
};

export default ReplyInput;
