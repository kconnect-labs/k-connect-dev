import React, { useState, useRef } from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  Avatar, 
  Grid, 
  Button
} from '@mui/material';
import { PhotoCamera, Delete } from '@mui/icons-material';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import UniversalModal from '../../../../UIKIT/UniversalModal';

// Добавляем стили для круглой обрезки
const cropStyles = `
  .ReactCrop__crop-selection {
    border: 2px solid #667eea !important;
    border-radius: 50% !important;
    box-shadow: 0 0 0 1px rgba(102, 126, 234, 0.5) !important;
  }
  .ReactCrop__drag-handle {
    background: #667eea !important;
    border: 2px solid white !important;
    border-radius: 50% !important;
    width: 12px !important;
    height: 12px !important;
  }
  .ReactCrop__drag-handle.ord-nw,
  .ReactCrop__drag-handle.ord-ne,
  .ReactCrop__drag-handle.ord-sw,
  .ReactCrop__drag-handle.ord-se {
    display: none !important;
  }
`;

// Вставляем стили в head
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = cropStyles;
  document.head.appendChild(styleElement);
}

interface ProfileUploaderProps {
  onAvatarChange?: (file: File) => void;
  onBannerChange?: (file: File) => void;
  onAvatarDelete?: () => void;
  onBannerDelete?: () => void;
  currentAvatar?: string;
  currentBanner?: string;
}

const ProfileUploader: React.FC<ProfileUploaderProps> = ({
  onAvatarChange,
  onBannerChange,
  onAvatarDelete,
  onBannerDelete,
  currentAvatar,
  currentBanner,
}) => {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    currentAvatar || null
  );
  const [bannerPreview, setBannerPreview] = useState<string | null>(
    currentBanner || null
  );
  
  // Состояния для обрезки аватара
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Создаем круглую область обрезки
  const centerAspectCrop = (mediaWidth: number, mediaHeight: number, aspect: number) => {
    return centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        aspect,
        mediaWidth,
        mediaHeight,
      ),
      mediaWidth,
      mediaHeight,
    );
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        const imageUrl = e.target?.result as string;
        setSelectedImage(imageUrl);
        setCropModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        setBannerPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      onBannerChange?.(file);
    }
  };

  const handleAvatarDelete = () => {
    setAvatarPreview(null);
    onAvatarDelete?.();
  };

  const handleBannerDelete = () => {
    setBannerPreview(null);
    onBannerDelete?.();
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const crop = centerAspectCrop(width, height, 1); // 1:1 для круглого аватара
    setCrop(crop);
  };

  // Правильная функция обрезки с учетом масштаба
  const createCroppedImage = (): Promise<{ blob: Blob; url: string }> => {
    return new Promise((resolve) => {
      if (!imgRef.current || !completedCrop) {
        resolve({ blob: new Blob(), url: selectedImage || '' });
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        resolve({ blob: new Blob(), url: selectedImage || '' });
        return;
      }

      // Вычисляем масштаб между отображаемым и реальным размером изображения
      const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
      const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

      // Размер для круглого аватара
      const size = Math.min(completedCrop.width, completedCrop.height);
      canvas.width = size;
      canvas.height = size;

      // Создаем круглую маску
      ctx.save();
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI);
      ctx.clip();

      // Рисуем изображение с правильными координатами
      ctx.drawImage(
        imgRef.current,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        completedCrop.width * scaleX,
        completedCrop.height * scaleY,
        0,
        0,
        size,
        size,
      );

      ctx.restore();

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          resolve({ blob, url });
        } else {
          resolve({ blob: new Blob(), url: selectedImage || '' });
        }
      }, 'image/png');
    });
  };

  // Создаем предпросмотр в реальном времени
  const createPreview = async () => {
    const { url } = await createCroppedImage();
    setPreviewUrl(url);
  };

  // Обновляем предпросмотр при изменении обрезки
  React.useEffect(() => {
    if (completedCrop) {
      createPreview();
    } else {
      setPreviewUrl(selectedImage);
    }
  }, [completedCrop, selectedImage]);

  const getCroppedImg = async (): Promise<File> => {
    // Используем точно такой же подход как в предпросмотре
    const { blob, url } = await createCroppedImage();
    
    // Создаем файл из blob, точно как в предпросмотре
    const file = new File([blob], 'avatar.png', { type: 'image/png' });
    
    // Очищаем URL, чтобы не было утечек памяти
    if (url && url !== selectedImage) {
      URL.revokeObjectURL(url);
    }
    
    return file;
  };

  const handleCropConfirm = async () => {
    const croppedFile = await getCroppedImg();
    const reader = new FileReader();
    reader.onload = e => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(croppedFile);
    
    onAvatarChange?.(croppedFile);
    setCropModalOpen(false);
    setSelectedImage(null);
    if (previewUrl && previewUrl !== selectedImage) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
  };

  const handleCropCancel = () => {
    setCropModalOpen(false);
    setSelectedImage(null);
    setCrop(undefined);
    setCompletedCrop(undefined);
    if (previewUrl && previewUrl !== selectedImage) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
  };

  const containerStyle = {
    background: 'var(--theme-background, rgba(255, 255, 255, 0.03))',
    backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px',
  };

  const sectionStyle = {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '16px',
  };

  return (
    <Box>
      <Typography
        variant='h6'
        sx={{
          mb: 3,
          color: 'text.primary',
          fontSize: '1.2rem',
          fontWeight: 600,
        }}
      >
        Фото профиля
      </Typography>

      {/* Avatar Section */}
      <Box sx={sectionStyle}>
        <Typography
          variant='subtitle1'
          sx={{ mb: 2, color: 'text.primary', fontWeight: 500 }}
        >
          Аватар профиля
        </Typography>

        <Grid container spacing={2} alignItems='center'>
          <Grid item>
            <Box
              component='label'
              sx={{
                position: 'relative',
                cursor: 'pointer',
                display: 'block',
              }}
            >
              <input
                type='file'
                accept='image/*'
                onChange={handleAvatarUpload}
                style={{ display: 'none' }}
              />
              <Avatar
                src={avatarPreview || undefined}
                sx={{
                  width: 80,
                  height: 80,
                  background: avatarPreview
                    ? 'transparent'
                    : 'rgba(255, 255, 255, 0.1)',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    border: '2px solid rgba(255, 255, 255, 0.4)',
                    transform: 'scale(1.05)',
                  },
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  background: 'rgba(0, 0, 0, 0.7)',
                  borderRadius: '50%',
                  width: 20,
                  height: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                }}
              >
                <PhotoCamera sx={{ fontSize: 12, color: 'white' }} />
              </Box>
            </Box>
          </Grid>

          <Grid item xs>
            <Box>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                Рекомендуемый размер: 1200x1200 пикселей
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                Форматы: JPG, PNG, GIF
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Максимальный размер: 5 МБ
              </Typography>
            </Box>
          </Grid>

          {avatarPreview && (
            <Grid item>
              <IconButton
                onClick={handleAvatarDelete}
                sx={{
                  background: 'rgba(255, 0, 0, 0.1)',
                  color: '#ff6b6b',
                  '&:hover': {
                    background: 'rgba(255, 0, 0, 0.2)',
                  },
                }}
              >
                <Delete sx={{ fontSize: 18 }} />
              </IconButton>
            </Grid>
          )}
        </Grid>
      </Box>

      {/* Banner Section */}
      <Box sx={sectionStyle}>
        <Typography
          variant='subtitle1'
          sx={{ mb: 2, color: 'text.primary', fontWeight: 500 }}
        >
          Обложка профиля
        </Typography>

        <Box sx={{ position: 'relative' }}>
          <Box
            component='label'
            sx={{
              position: 'relative',
              cursor: 'pointer',
              display: 'block',
              width: '100%',
              height: '120px',
              borderRadius: '8px',
              overflow: 'hidden',
              background: bannerPreview
                ? `url(${bannerPreview}) center/cover`
                : 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              border: bannerPreview
                ? 'none'
                : '2px dashed rgba(255, 255, 255, 0.2)',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: bannerPreview
                  ? `url(${bannerPreview}) center/cover`
                  : 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%)',
                border: bannerPreview
                  ? 'none'
                  : '2px dashed rgba(255, 255, 255, 0.4)',
              },
            }}
          >
            <input
              type='file'
              accept='image/*'
              onChange={handleBannerUpload}
              style={{ display: 'none' }}
            />
            {!bannerPreview && (
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                  color: 'text.secondary',
                }}
              >
                <PhotoCamera sx={{ fontSize: 32, mb: 1 }} />
                <Typography variant='body2' sx={{ fontSize: '0.875rem' }}>
                  Загрузить обложку
                </Typography>
              </Box>
            )}
          </Box>

          {bannerPreview && (
            <IconButton
              onClick={handleBannerDelete}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                background: 'rgba(255, 0, 0, 0.1)',
                color: '#ff6b6b',
                width: 32,
                height: 32,
                '&:hover': {
                  background: 'rgba(255, 0, 0, 0.2)',
                },
              }}
            >
              <Delete sx={{ fontSize: 18 }} />
            </IconButton>
          )}
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
            Рекомендуемый размер: 1200x300 пикселей
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
            Форматы: JPG, PNG, GIF
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Максимальный размер: 10 МБ
          </Typography>
        </Box>
      </Box>

      <Typography
        variant='body2'
        color='text.secondary'
        sx={{ mt: 2, textAlign: 'center', fontSize: '0.8rem' }}
      >
        Кликните на аватар или обложку для загрузки
      </Typography>

            {/* Модальное окно обрезки аватара */}
      <UniversalModal
        open={cropModalOpen}
        onClose={handleCropCancel}
        title="Обрезка аватара"
        maxWidth="md"
        fullWidth
      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Выберите область для обрезки мышкой или пальцами. Аватар будет круглым.
          </Typography>
          
          {selectedImage && (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              mb: 3,
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '8px',
              p: 2
            }}>
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={1}
                circularCrop
              >
                <img
                  ref={imgRef}
                  alt="Crop me"
                  src={selectedImage}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '400px',
                  }}
                  onLoad={onImageLoad}
                />
              </ReactCrop>
            </Box>
          )}

          {/* Предварительный просмотр в реальном времени */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            mb: 3,
            p: 2,
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '8px'
          }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Предварительный просмотр
              </Typography>
                             <Avatar
                 src={previewUrl || undefined}
                 sx={{
                   width: 80,
                   height: 80,
                   background: previewUrl ? 'transparent' : 'rgba(255, 255, 255, 0.1)',
                   border: '2px solid rgba(255, 255, 255, 0.2)',
                   transition: 'all 0.3s ease',
                   objectFit: 'cover',
                   objectPosition: 'center',
                 }}
               />
            </Box>
          </Box>

          {/* Кнопки действий */}
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            justifyContent: 'center',
            pt: 2,
            borderTop: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <Button 
              onClick={handleCropCancel}
              sx={{ 
                color: 'text.secondary',
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              Отмена
            </Button>
            <Button 
              onClick={handleCropConfirm}
              variant="contained"
              sx={{
                background: '#d0bcff',
                '&:hover': {
                  background: '#f0bcff'
                }
              }}
            >
              Применить
            </Button>
          </Box>
        </Box>
      </UniversalModal>
    </Box>
  );
};

export default ProfileUploader;
