import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Avatar,
  Snackbar,
  Alert,
  IconButton,
  ImageList,
  TextField,
  ImageListItem,
  Typography,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { AuthContext } from '../../context/AuthContext';
import { MusicContext } from '../../context/MusicContext';
import { useLanguage } from '../../context/LanguageContext';
import MusicSelectDialog from '../Music/MusicSelectDialog';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import CloseIcon from '@mui/icons-material/Close';
import WarningIcon from '@mui/icons-material/Warning';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import { handleImageError as safeImageError } from '../../utils/imageUtils';
import ReactMarkdown from 'react-markdown';
import MarkdownContent from '../Post/MarkdownContent';
import axios from 'axios';
import { getMarkdownComponents } from '../Post/MarkdownConfig';

// Стилизованные компоненты
const PostInput = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-root': {
    background:
      theme.palette.mode === 'dark'
        ? 'rgba(0, 0, 0, 0.2)'
        : 'rgba(0, 0, 0, 0.03)',
    backdropFilter: 'blur(5px)',
    WebkitBackdropFilter: 'blur(0px)',
    borderRadius: '12px',
    border:
      theme.palette.mode === 'dark'
        ? '1px solid rgba(255, 255, 255, 0.05)'
        : '1px solid rgba(0, 0, 0, 0.05)',
    fontSize: '0.95rem',
    padding: theme.spacing(1.5, 2),
    color: theme.palette.text.primary,
    transition: 'all 0.3s ease',
    '&:hover': {
      borderColor: 'rgba(208, 188, 255, 0.3)',
      background:
        theme.palette.mode === 'dark'
          ? 'rgba(0, 0, 0, 0.25)'
          : 'rgba(0, 0, 0, 0.05)',
    },
    '&.Mui-focused': {
      borderColor: 'rgba(208, 188, 255, 0.5)',
      boxShadow: '0 0 0 2px rgba(208, 188, 255, 0.1)',
    },
  },
  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none',
  },
  width: '100%',
}));

const PostActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  padding: theme.spacing(1.5, 0, 0),
  borderTop: '1px solid rgba(255, 255, 255, 0.05)',
  marginTop: theme.spacing(1.5),
}));

const PublishButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  textTransform: 'none',
  fontSize: '0.8rem',
  fontWeight: 400,
  boxShadow: '0 2px 8px rgba(124, 77, 255, 0.25)',
  padding: theme.spacing(0.4, 1.5),
  background:
    theme.palette.mode === 'dark'
      ? 'linear-gradient(90deg, rgb(180 163 220) 0%, rgb(177 161 216) 100%)'
      : 'linear-gradient(90deg, rgb(124 77 255) 0%, rgb(148 108 255) 100%)',
  color: theme.palette.mode === 'dark' ? '#000' : '#fff',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(124, 77, 255, 0.35)',
  },
  '&.Mui-disabled': {
    background:
      theme.palette.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.05)'
        : 'rgba(0, 0, 0, 0.05)',
    color:
      theme.palette.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.3)'
        : 'rgba(0, 0, 0, 0.3)',
  },
}));

const CreatePost = ({
  onPostCreated,
  postType = 'post',
  recipientId = null,
}) => {
  const { t } = useLanguage();
  const { user } = useContext(AuthContext);
  const { playTrack, currentTrack, isPlaying, togglePlay } =
    useContext(MusicContext);
  const [content, setContent] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaType, setMediaType] = useState('');
  const [mediaPreview, setMediaPreview] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [mediaNotification, setMediaNotification] = useState({
    open: false,
    message: '',
  });
  const [musicSelectOpen, setMusicSelectOpen] = useState(false);
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'error',
  });
  const [rateLimitDialog, setRateLimitDialog] = useState({
    open: false,
    message: '',
    timeRemaining: 0,
  });
  const [showSizeError, setShowSizeError] = useState(false);
  const [sizeErrorMessage, setSizeErrorMessage] = useState('');
  const [isNsfw, setIsNsfw] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Константы
  const MAX_VIDEO_SIZE = 150 * 1024 * 1024; // 150MB in bytes
  const MAX_PHOTO_SIZE = 50 * 1024 * 1024; // 50MB in bytes
  const ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/heic',
    'image/heif',
  ];
  const ALLOWED_VIDEO_TYPES = [
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-matroska',
  ];

  useEffect(() => {
    if (error) setError('');
  }, [content, mediaFiles, selectedTracks, error]);

  const dragCounter = useRef(0);

  const handleDragEnter = e => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (dragCounter.current === 1) {
      setIsDragging(true);
    }
  };

  const handleDragOver = e => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = e => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDrop = e => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const handleMediaChange = event => {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
      processFiles(files);
    }
    event.target.value = '';
  };

  const processFiles = files => {
    const validFiles = [];
    const previews = [];

    files.forEach(file => {
      // Проверка размера файла
      if (file.type.startsWith('image/')) {
        if (file.size > MAX_PHOTO_SIZE) {
          setSizeErrorMessage(
            `Файл ${file.name} слишком большой. Максимальный размер: 50MB`
          );
          setShowSizeError(true);
          return;
        }
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
          setError(`Неподдерживаемый формат изображения: ${file.name}`);
          return;
        }
      } else if (file.type.startsWith('video/')) {
        if (file.size > MAX_VIDEO_SIZE) {
          setSizeErrorMessage(
            `Файл ${file.name} слишком большой. Максимальный размер: 150MB`
          );
          setShowSizeError(true);
          return;
        }
        if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
          setError(`Неподдерживаемый формат видео: ${file.name}`);
          return;
        }
      } else {
        setError(`Неподдерживаемый тип файла: ${file.name}`);
        return;
      }

      validFiles.push(file);

      // Создание превью
      const reader = new FileReader();
      reader.onload = e => {
        previews.push(e.target.result);
        if (previews.length === validFiles.length) {
          setMediaPreview(previews);
        }
      };
      reader.readAsDataURL(file);
    });

    if (validFiles.length > 0) {
      setMediaFiles(validFiles);
      setMediaType(validFiles[0].type.startsWith('image/') ? 'image' : 'video');
    }
  };

  const handleRemoveMedia = () => {
    setMediaFiles([]);
    setMediaPreview([]);
    setMediaType('');
  };

  const handleMusicSelect = tracks => {
    setSelectedTracks(tracks);
    setMusicSelectOpen(false);
  };

  const handleRemoveTrack = trackId => {
    setSelectedTracks(prev => prev.filter(track => track.id !== trackId));
  };

  const clearForm = () => {
    setContent('');
    setMediaFiles([]);
    setMediaPreview([]);
    setMediaType('');
    setSelectedTracks([]);
    setError('');
    setShowPreview(false);
  };

  const handleTrackPlay = (track, event) => {
    if (event) {
      event.stopPropagation();
    }

    if (currentTrack && currentTrack.id === track.id) {
      togglePlay();
    } else {
      playTrack(track, 'main');
    }
  };

  const handleSubmit = async () => {
    if (
      !content.trim() &&
      mediaFiles.length === 0 &&
      selectedTracks.length === 0
    )
      return;

    try {
      setIsSubmitting(true);
      setError('');
      console.log('Starting post submission...');

      const formData = new FormData();
      formData.append('content', content.trim());
      formData.append('is_nsfw', isNsfw.toString());

      console.log('Added content to FormData:', content.trim());

      if (postType && postType !== 'post') {
        formData.append('type', postType);
      }

      if (recipientId) {
        formData.append('recipient_id', recipientId);
      }

      if (mediaType === 'image') {
        // Отправляем все изображения с правильным форматом
        mediaFiles.forEach((file, index) => {
          console.log(`Adding image[${index}]:`, file.name, file.size);
          formData.append(`images[${index}]`, file); // Исправлено на правильный формат
        });
      } else if (mediaType === 'video') {
        console.log(
          'Adding video to FormData:',
          mediaFiles[0].name,
          mediaFiles[0].size
        );
        formData.append('video', mediaFiles[0]);
      }

      if (selectedTracks.length > 0) {
        console.log(`Adding ${selectedTracks.length} music tracks to post`);

        const trackData = selectedTracks.map(track => ({
          id: track.id,
          title: track.title,
          artist: track.artist,
          duration: track.duration,
          file_path: track.file_path,
          cover_path: track.cover_path,
        }));
        formData.append('music', JSON.stringify(trackData));
      }

      console.log('Sending post request to server...');
      const response = await axios.post('/api/posts/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Post created:', response);

      if (response.data && response.data.success) {
        setSnackbar({
          open: true,
          message: 'Пост успешно создан!',
          severity: 'success',
        });

        clearForm();

        if (onPostCreated) {
          onPostCreated(response.data.post);
        }
      } else {
        setError(response.data?.error || 'Ошибка создания поста');
      }
    } catch (err) {
      console.error('Error creating post:', err);

      if (err.response?.status === 429) {
        const retryAfter = err.response.headers['retry-after'];
        const timeRemaining = retryAfter ? parseInt(retryAfter) : 60;

        setRateLimitDialog({
          open: true,
          message: `Слишком много запросов. Попробуйте через ${timeRemaining} секунд.`,
          timeRemaining,
        });
      } else {
        setError(err.response?.data?.error || 'Ошибка создания поста');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaste = e => {
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;

    for (let item of items) {
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file) {
          processFiles([file]);
        }
      }
    }
  };

  // Если пользователь не авторизован, не показываем компонент
  if (!user) {
    return null;
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 1,
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(0px)',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      {error && (
        <Alert severity='error' sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
        }}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            borderRadius: '12px',
            border: isDragging ? '2px dashed #D0BCFF' : 'none',
            backgroundColor: isDragging
              ? 'rgba(208, 188, 255, 0.05)'
              : 'transparent',
            padding: isDragging ? 1 : 0,
            transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
          }}
        >
          {isDragging && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                backgroundColor: 'rgba(26, 26, 26, 0.7)',
                borderRadius: '12px',
                zIndex: 10,
                opacity: isDragging ? 1 : 0,
                transition: 'opacity 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
              }}
            >
              <ImageOutlinedIcon
                sx={{
                  fontSize: 40,
                  color: '#D0BCFF',
                  mb: 1,
                  filter: 'drop-shadow(0 0 8px rgba(208, 188, 255, 0.6))',
                }}
              />
              <Typography
                variant='body1'
                color='primary'
                sx={{
                  fontWeight: 'medium',
                  textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                }}
              >
                Перетащите файлы сюда
              </Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
            <Avatar
              src={
                user?.photo
                  ? `/static/uploads/avatar/${user.id}/${user.photo}`
                  : undefined
              }
              alt={user?.name || 'User'}
              sx={{
                mr: 1.5,
                width: 40,
                height: 40,
                border: '2px solid rgba(208, 188, 255)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: '0 3px 10px rgba(0, 0, 0, 0.3)',
                },
              }}
            />
            <Box sx={{ flex: 1, position: 'relative' }}>
              <PostInput
                placeholder={
                  postType === 'wall'
                    ? t('profile.create_post.wall_placeholder')
                    : t('profile.create_post.placeholder')
                }
                multiline
                value={content}
                onChange={e => {
                  setContent(e.target.value);
                }}
                onPaste={handlePaste}
                fullWidth
                minRows={1}
                maxRows={8}
                sx={{
                  '& .MuiInputBase-root': {
                    minHeight: 'auto',
                    padding: '12px 16px',
                  },
                  '& .MuiInputBase-input': {
                    resize: 'none',
                    '&::placeholder': {
                      opacity: 0.7,
                    },
                  },
                }}
              />

              {/* Кнопка предпросмотра */}
              {content.trim() &&
                (content.includes('**') ||
                  content.includes('*') ||
                  content.includes('`') ||
                  content.includes('#') ||
                  content.includes('~~')) && (
                  <Box
                    sx={{ mt: 1, display: 'flex', justifyContent: 'center' }}
                  >
                    <Button
                      variant='text'
                      size='small'
                      onClick={() => setShowPreview(!showPreview)}
                      sx={{
                        color: 'rgba(255, 255, 255, 0.6)',
                        textTransform: 'none',
                        fontSize: '0.75rem',
                        '&:hover': {
                          color: 'rgba(255, 255, 255, 0.8)',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        },
                      }}
                    >
                      {showPreview ? 'Предпросмотр свернуть' : 'Предпросмотр'}
                    </Button>
                  </Box>
                )}

              {/* Предпросмотр markdown */}
              {showPreview && content.trim() && (
                <Box
                  sx={{
                    mt: 1,
                    p: 1.5,
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    position: 'relative',
                  }}
                >
                  <Typography
                    variant='caption'
                    sx={{
                      position: 'absolute',
                      top: -8,
                      left: 8,
                      backgroundColor: 'rgba(26, 26, 26, 0.9)',
                      px: 0.5,
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontSize: '0.7rem',
                    }}
                  >
                    Предпросмотр
                  </Typography>
                  <MarkdownContent
                    sx={{
                      fontSize: '0.875rem',
                      '& p': { margin: 0 },
                      '& > *:first-of-type': { marginTop: 0 },
                      '& > *:last-child': { marginBottom: 0 },
                    }}
                  >
                    <ReactMarkdown
                      components={getMarkdownComponents()}
                      urlTransform={url => url}
                    >
                      {content.replace(/\n/g, '  \n')}
                    </ReactMarkdown>
                  </MarkdownContent>
                </Box>
              )}

              {/* Подсказки форматирования */}
              {content.length > 10 && (
                <Box sx={{ mt: 1 }}>
                  <Typography
                    variant='caption'
                    sx={{
                      fontSize: '0.7rem',
                      color: 'rgba(255, 255, 255, 0.4)',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 1,
                    }}
                  >
                    <Box
                      component='span'
                      sx={{
                        cursor: 'pointer',
                        '&:hover': { color: 'rgba(255, 255, 255, 0.7)' },
                      }}
                      onClick={() => {
                        const textarea = document.querySelector(
                          '.MuiInputBase-input'
                        );
                        if (textarea) {
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const selectedText =
                            content.substring(start, end) || 'текст';
                          const newContent =
                            content.substring(0, start) +
                            `**${selectedText}**` +
                            content.substring(end);
                          setContent(newContent);
                          setTimeout(() => {
                            textarea.focus();
                            textarea.setSelectionRange(
                              start + 2,
                              start + 2 + selectedText.length
                            );
                          }, 0);
                        }
                      }}
                    >
                      **жирный**
                    </Box>
                    <Box
                      component='span'
                      sx={{
                        cursor: 'pointer',
                        '&:hover': { color: 'rgba(255, 255, 255, 0.7)' },
                      }}
                      onClick={() => {
                        const textarea = document.querySelector(
                          '.MuiInputBase-input'
                        );
                        if (textarea) {
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const selectedText =
                            content.substring(start, end) || 'текст';
                          const newContent =
                            content.substring(0, start) +
                            `*${selectedText}*` +
                            content.substring(end);
                          setContent(newContent);
                          setTimeout(() => {
                            textarea.focus();
                            textarea.setSelectionRange(
                              start + 1,
                              start + 1 + selectedText.length
                            );
                          }, 0);
                        }
                      }}
                    >
                      *курсив*
                    </Box>
                    <Box
                      component='span'
                      sx={{
                        cursor: 'pointer',
                        '&:hover': { color: 'rgba(255, 255, 255, 0.7)' },
                      }}
                      onClick={() => {
                        const textarea = document.querySelector(
                          '.MuiInputBase-input'
                        );
                        if (textarea) {
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const selectedText =
                            content.substring(start, end) || 'код';
                          const newContent =
                            content.substring(0, start) +
                            `\`${selectedText}\`` +
                            content.substring(end);
                          setContent(newContent);
                          setTimeout(() => {
                            textarea.focus();
                            textarea.setSelectionRange(
                              start + 1,
                              start + 1 + selectedText.length
                            );
                          }, 0);
                        }
                      }}
                    >
                      `код`
                    </Box>
                    <Box
                      component='span'
                      sx={{
                        cursor: 'pointer',
                        '&:hover': { color: 'rgba(255, 255, 255, 0.7)' },
                      }}
                      onClick={() => {
                        const textarea = document.querySelector(
                          '.MuiInputBase-input'
                        );
                        if (textarea) {
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const selectedText =
                            content.substring(start, end) || 'текст';
                          const newContent =
                            content.substring(0, start) +
                            `~~${selectedText}~~` +
                            content.substring(end);
                          setContent(newContent);
                          setTimeout(() => {
                            textarea.focus();
                            textarea.setSelectionRange(
                              start + 2,
                              start + 2 + selectedText.length
                            );
                          }, 0);
                        }
                      }}
                    >
                      ~~зачеркнутый~~
                    </Box>
                    <Box
                      component='span'
                      sx={{
                        cursor: 'pointer',
                        '&:hover': { color: 'rgba(255, 255, 255, 0.7)' },
                      }}
                      onClick={() => {
                        const textarea = document.querySelector(
                          '.MuiInputBase-input'
                        );
                        if (textarea) {
                          const start = textarea.selectionStart;
                          const newContent =
                            content.substring(0, start) +
                            '\n# Заголовок\n' +
                            content.substring(start);
                          setContent(newContent);
                          setTimeout(() => {
                            textarea.focus();
                            textarea.setSelectionRange(start + 3, start + 12);
                          }, 0);
                        }
                      }}
                    >
                      # заголовок
                    </Box>
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          {/* Медиа превью */}
          {mediaPreview.length > 0 && (
            <Box sx={{ position: 'relative', mb: 2 }}>
              <Box
                sx={{
                  position: 'relative',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                }}
              >
                {mediaType === 'image' ? (
                  <ImageList
                    sx={{
                      width: '100%',
                      height: 'auto',
                      maxHeight: 500,
                      margin: 0,
                      padding: 1,
                    }}
                    cols={mediaPreview.length > 3 ? 3 : mediaPreview.length}
                    rowHeight={164}
                    gap={8}
                  >
                    {mediaPreview.map((preview, index) => (
                      <ImageListItem
                        key={index}
                        sx={{
                          position: 'relative',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                      >
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          style={{
                            objectFit: 'cover',
                            height: '100%',
                            width: '100%',
                            borderRadius: '8px',
                          }}
                        />
                        <IconButton
                          onClick={() => {
                            setMediaFiles(prev =>
                              prev.filter((_, i) => i !== index)
                            );
                            setMediaPreview(prev =>
                              prev.filter((_, i) => i !== index)
                            );
                            if (mediaPreview.length === 1) {
                              setMediaType('');
                            }
                          }}
                          sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            backgroundColor: 'rgba(0, 0, 0, 0.6)',
                            color: 'white',
                            padding: '4px',
                            '&:hover': {
                              backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            },
                            backdropFilter: 'blur(4px)',
                          }}
                        >
                          <CloseIcon fontSize='small' />
                        </IconButton>
                      </ImageListItem>
                    ))}
                  </ImageList>
                ) : (
                  <video
                    src={mediaPreview[0]}
                    controls
                    style={{
                      width: '100%',
                      maxHeight: '300px',
                      borderRadius: '12px',
                    }}
                  />
                )}
                {mediaType === 'video' && (
                  <IconButton
                    onClick={handleRemoveMedia}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: 'rgba(0, 0, 0, 0.6)',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      },
                      padding: '8px',
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    <CloseIcon fontSize='small' />
                  </IconButton>
                )}
              </Box>
            </Box>
          )}

          {/* Музыкальные треки */}
          {selectedTracks.length > 0 && (
            <Box sx={{ mt: 2, mb: 2 }}>
              {selectedTracks.map(track => (
                <Box
                  key={track.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    py: 1,
                    px: 1.5,
                    mb: 1,
                    borderRadius: '10px',
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={e => handleTrackPlay(track, e)}
                >
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '6px',
                      overflow: 'hidden',
                      mr: 1.5,
                      position: 'relative',
                      bgcolor: 'rgba(0, 0, 0, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                    }}
                  >
                    <img
                      src={
                        !track.cover_path
                          ? '/uploads/system/album_placeholder.jpg'
                          : track.cover_path.startsWith('/static/')
                            ? track.cover_path
                            : track.cover_path.startsWith('static/')
                              ? `/${track.cover_path}`
                              : track.cover_path.startsWith('http')
                                ? track.cover_path
                                : `/static/music/${track.cover_path}`
                      }
                      alt={track.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                      onError={e => {
                        e.target.src = '/uploads/system/album_placeholder.jpg';
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background:
                          'linear-gradient(145deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.3))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {currentTrack &&
                      currentTrack.id === track.id &&
                      isPlaying ? (
                        <PauseIcon sx={{ color: 'white', fontSize: 16 }} />
                      ) : (
                        <MusicNoteIcon
                          sx={{
                            fontSize: 14,
                            color: 'rgba(255, 255, 255, 0.9)',
                            filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.3))',
                          }}
                        />
                      )}
                    </Box>
                  </Box>
                  <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                    <Typography
                      variant='body2'
                      sx={{
                        fontWeight:
                          currentTrack && currentTrack.id === track.id
                            ? 'medium'
                            : 'normal',
                        color:
                          currentTrack && currentTrack.id === track.id
                            ? 'primary.main'
                            : 'text.primary',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        fontSize: '0.85rem',
                      }}
                    >
                      {track.title}
                    </Typography>
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      sx={{
                        display: 'block',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        fontSize: '0.75rem',
                      }}
                    >
                      {track.artist}
                    </Typography>
                  </Box>
                  {currentTrack && currentTrack.id === track.id ? (
                    isPlaying ? (
                      <PauseIcon
                        color='primary'
                        fontSize='small'
                        sx={{ mr: 1, fontSize: 16 }}
                      />
                    ) : (
                      <PlayArrowIcon
                        color='primary'
                        fontSize='small'
                        sx={{ mr: 1, fontSize: 16 }}
                      />
                    )
                  ) : null}
                  <IconButton
                    size='small'
                    onClick={e => {
                      e.stopPropagation();
                      handleRemoveTrack(track.id);
                    }}
                    sx={{
                      color: 'rgba(255, 255, 255, 0.5)',
                      '&:hover': {
                        color: 'rgba(255, 255, 255, 0.8)',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      },
                    }}
                  >
                    <CloseIcon fontSize='small' />
                  </IconButton>
                </Box>
              ))}
            </Box>
          )}

          <PostActions>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <input
                ref={fileInputRef}
                type='file'
                accept='image/*,video/*'
                onChange={handleMediaChange}
                multiple
                style={{ display: 'none' }}
                id='media-upload-profile'
              />
              <label htmlFor='media-upload-profile'>
                <Button
                  component='span'
                  startIcon={<ImageOutlinedIcon sx={{ fontSize: 18 }} />}
                  sx={{
                    color:
                      mediaFiles.length > 0 || selectedTracks.length > 0
                        ? 'primary.main'
                        : 'text.secondary',
                    borderRadius: '10px',
                    textTransform: 'none',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    border:
                      mediaFiles.length > 0 || selectedTracks.length > 0
                        ? '1px solid rgba(208, 188, 255, 0.5)'
                        : theme =>
                            theme.palette.mode === 'dark'
                              ? '1px solid rgba(255, 255, 255, 0.12)'
                              : '1px solid rgba(0, 0, 0, 0.12)',
                    padding: '4px 10px',
                    '&:hover': {
                      backgroundColor: 'rgba(208, 188, 255, 0.08)',
                      borderColor: 'rgba(208, 188, 255, 0.4)',
                    },
                  }}
                  size='small'
                >
                  {mediaFiles.length > 0
                    ? t('profile.create_post.files_count', {
                        count: mediaFiles.length,
                      })
                    : t('profile.create_post.media')}
                </Button>
              </label>

              <Button
                startIcon={<MusicNoteIcon sx={{ fontSize: 18 }} />}
                onClick={() => setMusicSelectOpen(true)}
                sx={{
                  color:
                    selectedTracks.length > 0
                      ? 'primary.main'
                      : 'text.secondary',
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  border:
                    selectedTracks.length > 0
                      ? '1px solid rgba(208, 188, 255, 0.5)'
                      : theme =>
                          theme.palette.mode === 'dark'
                            ? '1px solid rgba(255, 255, 255, 0.12)'
                            : '1px solid rgba(0, 0, 0, 0.12)',
                  padding: '4px 10px',
                  '&:hover': {
                    backgroundColor: 'rgba(208, 188, 255, 0.08)',
                    borderColor: 'rgba(208, 188, 255, 0.4)',
                  },
                }}
                size='small'
              >
                {selectedTracks.length > 0
                  ? t('profile.create_post.music_count', {
                      count: selectedTracks.length,
                    })
                  : t('profile.create_post.music')}
              </Button>

              {(mediaFiles.length > 0 || selectedTracks.length > 0) && (
                <Tooltip title='Деликатный контент' placement='top'>
                  <IconButton
                    onClick={() => setIsNsfw(!isNsfw)}
                    sx={{
                      color: isNsfw ? '#ff6b6b' : 'text.secondary',
                      borderRadius: '50%',
                      width: 32,
                      height: 32,
                      minWidth: 32,
                      minHeight: 32,
                      padding: 0,
                      border: isNsfw
                        ? '1px solid rgba(255, 107, 107, 0.5)'
                        : theme =>
                            theme.palette.mode === 'dark'
                              ? '1px solid rgba(255, 255, 255, 0.12)'
                              : '1px solid rgba(0, 0, 0, 0.12)',
                      backgroundColor: isNsfw
                        ? 'rgba(255, 107, 107, 0.1)'
                        : 'transparent',
                      '&:hover': {
                        backgroundColor: isNsfw
                          ? 'rgba(255, 107, 107, 0.2)'
                          : 'rgba(255, 107, 107, 0.08)',
                        borderColor: 'rgba(255, 107, 107, 0.4)',
                      },
                      transition: 'all 0.2s ease',
                      flexShrink: 0,
                    }}
                    size='small'
                  >
                    <WarningIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              )}
            </Box>

            <PublishButton
              variant='contained'
              type='button'
              onClick={handleSubmit}
              disabled={
                isSubmitting ||
                (!content.trim() &&
                  mediaFiles.length === 0 &&
                  selectedTracks.length === 0)
              }
              endIcon={
                isSubmitting ? (
                  <CircularProgress size={14} color='inherit' />
                ) : null
              }
              size='small'
            >
              {t('profile.create_post.publish')}
            </PublishButton>
          </PostActions>

          <MusicSelectDialog
            open={musicSelectOpen}
            onClose={() => setMusicSelectOpen(false)}
            onSelectTracks={handleMusicSelect}
            maxTracks={3}
          />
        </Box>
      </Box>
    </Paper>
  );
};

export default CreatePost;
