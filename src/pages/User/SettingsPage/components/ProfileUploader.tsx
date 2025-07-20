import React, { useState } from 'react';
import { Box, Typography, IconButton, Avatar, Grid } from '@mui/material';
import { PhotoCamera, Delete } from '@mui/icons-material';

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

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      onAvatarChange?.(file);
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

  const containerStyle = {
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(20px)',
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
                Рекомендуемый размер: 200x200 пикселей
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
    </Box>
  );
};

export default ProfileUploader;
