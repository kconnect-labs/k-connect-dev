import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Avatar, Switch, Paper } from '@mui/material';
import { PhotoCamera, Delete } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// iOS-style switch component
const IOSSwitch = styled((props: any) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 42,
  height: 26,
  padding: 0,
  '& .MuiSwitch-switchBase': {
    padding: 0,
    margin: 2,
    transitionDuration: '300ms',
    '&.Mui-checked': {
      transform: 'translateX(16px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        backgroundColor: '#D0BCFF',
        opacity: 1,
        border: 0,
      },
      '&.Mui-disabled + .MuiSwitch-track': {
        opacity: 0.5,
      },
    },
    '&.Mui-focusVisible .MuiSwitch-thumb': {
      color: '#D0BCFF',
      border: '6px solid #fff',
    },
    '&.Mui-disabled .MuiSwitch-thumb': {
      color: theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[600],
    },
    '&.Mui-disabled + .MuiSwitch-track': {
      opacity: theme.palette.mode === 'light' ? 0.7 : 0.3,
    },
  },
  '& .MuiSwitch-thumb': {
    boxSizing: 'border-box',
    width: 22,
    height: 22,
  },
  '& .MuiSwitch-track': {
    borderRadius: 26 / 2,
    backgroundColor: theme.palette.mode === 'light' ? '#555' : '#39393D',
    opacity: 1,
    transition: theme.transitions.create(['background-color'], {
      duration: 500,
    }),
  },
}));

interface ProfileUploaderProps {
  onAvatarChange?: (file: File) => void;
  onBannerChange?: (file: File) => void;
  onAvatarDelete?: () => void;
  onBannerDelete?: () => void;
  currentAvatar?: string;
  currentBanner?: string;
  profileData?: any;
  subscription?: any;
  onSuccess?: () => void;
}

const ProfileUploader: React.FC<ProfileUploaderProps> = ({
  onAvatarChange,
  onBannerChange,
  onAvatarDelete,
  onBannerDelete,
  currentAvatar,
  currentBanner,
  profileData,
  subscription,
  onSuccess,
}) => {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(currentAvatar || null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(currentBanner || null);
  const [isCustomProfileActive, setIsCustomProfileActive] = useState(false);

  // Инициализация состояния необычного профиля
  useEffect(() => {
    if (profileData?.user?.profile_id) {
      setIsCustomProfileActive(profileData.user.profile_id === 2);
    }
  }, [profileData]);

  // Обработчик переключения необычного профиля
  const handleCustomProfileToggle = async () => {
    try {
      const newProfileId = isCustomProfileActive ? 1 : 2;
      const response = await fetch('/api/user/profile-style', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ profile_id: newProfileId })
      });
      
      const data = await response.json();
      if (data.success) {
        setIsCustomProfileActive(!isCustomProfileActive);
        if (onSuccess) onSuccess();
      } else {
        console.error('Error updating profile style:', data.error);
      }
    } catch (error) {
      console.error('Error updating profile style:', error);
    }
  };

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

      {/* Необычный профиль - только для Ultimate подписки */}
      {subscription?.type === 'ultimate' && (
        <Paper sx={{ 
          mt: 3, 
          p: 2, 
          borderRadius: 2, 
          bgcolor: 'rgba(18, 18, 18, 0.9)',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="subtitle1" fontWeight={600} sx={{ color: 'text.primary' }}>
                Необычный профиль
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Изменить внешний вид профиля
              </Typography>
            </Box>
            <IOSSwitch 
              checked={isCustomProfileActive}
              onChange={handleCustomProfileToggle}
            />
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default ProfileUploader; 