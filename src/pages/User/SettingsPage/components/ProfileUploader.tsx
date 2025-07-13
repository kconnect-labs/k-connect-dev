import React, { useState } from 'react';
import { Box, Typography, IconButton, Avatar } from '@mui/material';
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
  const [avatarPreview, setAvatarPreview] = useState<string | null>(currentAvatar || null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(currentBanner || null);

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
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
      reader.onload = (e) => {
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

  return (
    <Box sx={containerStyle}>
      <Typography variant="h6" sx={{ mb: 3, color: 'text.primary', fontSize: '1.2rem', fontWeight: 600 }}>
        Фото профиля
      </Typography>
      
      <Box sx={{ position: 'relative', width: '100%', height: '140px', borderRadius: '12px', overflow: 'hidden' }}>
        {/* Banner Background */}
        <Box
          component="label"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '100%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: bannerPreview 
              ? `url(${bannerPreview}) center/cover`
              : 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            border: bannerPreview ? 'none' : '2px dashed rgba(255, 255, 255, 0.2)',
            transition: 'all 0.3s ease',
            '&:hover': {
              background: bannerPreview 
                ? `url(${bannerPreview}) center/cover`
                : 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%)',
              border: bannerPreview ? 'none' : '2px dashed rgba(255, 255, 255, 0.4)',
            },
          }}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleBannerUpload}
            style={{ display: 'none' }}
          />
          {!bannerPreview && (
            <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
              <PhotoCamera sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                Загрузить обложку
              </Typography>
            </Box>
          )}
        </Box>

        {/* Avatar Overlay */}
        <Box
          sx={{
            position: 'absolute',
            bottom: '5px',
            left: '5px',
            zIndex: 2,
          }}
        >
          <Box
            component="label"
            sx={{
              position: 'relative',
              cursor: 'pointer',
              display: 'block',
            }}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              style={{ display: 'none' }}
            />
            <Avatar
              src={avatarPreview || undefined}
              sx={{ 
                width: 130, 
                height: 130,
                background: avatarPreview ? 'transparent' : 'rgba(255, 255, 255, 0.1)',
                border: '3px solid rgba(255, 255, 255, 0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  border: '3px solid rgba(255, 255, 255, 0.4)',
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
                width: 24,
                height: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
              }}
            >
              <PhotoCamera sx={{ fontSize: 14, color: 'white' }} />
            </Box>
          </Box>
        </Box>

        {/* Delete Buttons */}
        {bannerPreview && (
          <IconButton
            onClick={handleBannerDelete}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              background: 'rgba(0, 0, 0, 0.6)',
              color: 'white',
              width: 32,
              height: 32,
              '&:hover': {
                background: 'rgba(0, 0, 0, 0.8)',
              },
            }}
          >
            <Delete sx={{ fontSize: 18 }} />
          </IconButton>
        )}

        {avatarPreview && (
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              handleAvatarDelete();
            }}
            sx={{
              position: 'absolute',
              bottom: 8,
              left: 104,
              background: 'rgba(0, 0, 0, 0.6)',
              color: 'white',
              width: 24,
              height: 24,
              '&:hover': {
                background: 'rgba(0, 0, 0, 0.8)',
              },
            }}
          >
            <Delete sx={{ fontSize: 14 }} />
          </IconButton>
        )}
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center', fontSize: '0.8rem' }}>
        Кликните на обложку или аватар для загрузки
      </Typography>
    </Box>
  );
};

export default ProfileUploader; 