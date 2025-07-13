import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Link as LinkIcon,
  Public as PublicIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  Telegram as TelegramIcon,
  YouTube as YouTubeIcon
} from '@mui/icons-material';
import ProfileService from '../../../../services/ProfileService';

interface SocialLinksFormProps {
  onSuccess?: () => void;
  profileData?: any;
}

interface Social {
  name: string;
  link: string;
}

const SocialLinksForm: React.FC<SocialLinksFormProps> = ({ onSuccess, profileData }) => {
  const [socials, setSocials] = useState<Social[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newSocialName, setNewSocialName] = useState('');
  const [newSocialLink, setNewSocialLink] = useState('');
  const [error, setError] = useState('');

  // Загрузка социальных сетей из профиля
  useEffect(() => {
    console.log('SocialLinksForm - profileData:', profileData);
    console.log('SocialLinksForm - profileData.socials:', profileData?.socials);
    
    if (profileData?.socials) {
      console.log('Setting socials from profileData:', profileData.socials);
      setSocials(profileData.socials);
    }
  }, [profileData]);

  // Функция для получения иконки социальной сети
  const getSocialIcon = (name: string, url: string) => {
    if (url) {
      const lowerUrl = url.toLowerCase();
      if (lowerUrl.includes('facebook.com')) return <FacebookIcon />;
      if (lowerUrl.includes('twitter.com')) return <TwitterIcon />;
      if (lowerUrl.includes('instagram.com')) return <InstagramIcon />;
      if (lowerUrl.includes('t.me') || lowerUrl.includes('telegram.')) return <TelegramIcon />;
      if (lowerUrl.includes('youtube.com')) return <YouTubeIcon />;
      if (lowerUrl.includes('vk.com')) return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M15.07 2H8.93C3.33 2 2 3.33 2 8.93V15.07C2 20.67 3.33 22 8.93 22H15.07C20.67 22 22 20.67 22 15.07V8.93C22 3.33 20.67 2 15.07 2M15.54 13.5C15.24 13.41 14.95 13.33 14.7 13.21C13.3 12.58 12.64 11.3 12.34 10.55C12.23 10.26 12.16 10 12.15 9.89C12.15 9.89 12.15 9.89 12.15 9.89V9.85C12.15 9.63 12.34 9.44 12.56 9.44H13.43C13.6 9.44 13.75 9.59 13.75 9.76V9.76C13.81 9.93 13.82 9.98 13.96 10.26C14.11 10.59 14.36 11.09 14.91 11.54C15.18 11.77 15.34 11.75 15.46 11.66C15.46 11.66 15.5 11.55 15.5 11.13V10.11C15.46 9.85 15.4 9.77 15.35 9.67C15.32 9.61 15.29 9.56 15.27 9.47C15.27 9.37 15.35 9.28 15.45 9.28H17.1C17.27 9.28 17.4 9.41 17.4 9.58V10.94C17.4 11.05 17.42 11.94 18.05 11.94C18.38 11.94 18.66 11.63 19.07 11.15C19.5 10.57 19.71 10.08 19.81 9.85C19.86 9.76 19.93 9.53 20.04 9.47C20.12 9.42 20.21 9.44 20.28 9.44H21.1C21.27 9.44 21.42 9.59 21.42 9.77C21.42 9.77 21.42 9.77 21.42 9.77C21.46 9.97 21.39 10.14 21.17 10.45C20.88 10.91 20.57 11.32 20.32 11.66C19.58 12.68 19.58 12.75 20.35 13.46C20.65 13.76 20.9 14.02 21.1 14.25C21.27 14.45 21.45 14.66 21.6 14.89C21.69 15.04 21.77 15.19 21.74 15.37C21.71 15.57 21.53 15.72 21.33 15.72H20.2C19.84 15.72 19.77 15.5 19.44 15.11C19.37 15.02 19.28 14.94 19.2 14.85C18.98 14.59 18.81 14.4 18.59 14.23C18 13.71 17.57 13.77 17.33 13.77C17.13 13.79 16.98 13.95 16.98 14.15V15.07C16.98 15.35 16.95 15.5 16.71 15.62C16.66 15.62 16.57 15.67 16.53 15.67H15.54V13.5Z" />
        </svg>
      );
      if (lowerUrl.includes('tiktok.com')) return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.59-1.16-2.59-2.5 0-1.4 1.16-2.5 2.59-2.5.27 0 .53.04.77.13v-3.13c-.25-.02-.5-.04-.77-.04-3.09 0-5.59 2.57-5.59 5.67 0 3.1 2.5 5.67 5.59 5.67 3.09 0 5.59-2.57 5.59-5.67V9.14c.85.63 1.91 1.05 3.09 1.05V7.15c-1.32 0-2.59-.7-3.09-1.33z"/>
        </svg>
      );
    }
    
    const lowerName = (name || '').toLowerCase();
    switch (lowerName) {
      case 'facebook':
        return <FacebookIcon />;
      case 'twitter':
        return <TwitterIcon />;
      case 'instagram':
        return <InstagramIcon />;
      case 'telegram':
        return <TelegramIcon />;
      case 'youtube':
        return <YouTubeIcon />;
      case 'vk':
      case 'вконтакте':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.07 2H8.93C3.33 2 2 3.33 2 8.93V15.07C2 20.67 3.33 22 8.93 22H15.07C20.67 22 22 20.67 22 15.07V8.93C22 3.33 20.67 2 15.07 2M15.54 13.5C15.24 13.41 14.95 13.33 14.7 13.21C13.3 12.58 12.64 11.3 12.34 10.55C12.23 10.26 12.16 10 12.15 9.89C12.15 9.89 12.15 9.89 12.15 9.89V9.85C12.15 9.63 12.34 9.44 12.56 9.44H13.43C13.6 9.44 13.75 9.59 13.75 9.76V9.76C13.81 9.93 13.82 9.98 13.96 10.26C14.11 10.59 14.36 11.09 14.91 11.54C15.18 11.77 15.34 11.75 15.46 11.66C15.46 11.66 15.5 11.55 15.5 11.13V10.11C15.46 9.85 15.4 9.77 15.35 9.67C15.32 9.61 15.29 9.56 15.27 9.47C15.27 9.37 15.35 9.28 15.45 9.28H17.1C17.27 9.28 17.4 9.41 17.4 9.58V10.94C17.4 11.05 17.42 11.94 18.05 11.94C18.38 11.94 18.66 11.63 19.07 11.15C19.5 10.57 19.71 10.08 19.81 9.85C19.86 9.76 19.93 9.53 20.04 9.47C20.12 9.42 20.21 9.44 20.28 9.44H21.1C21.27 9.44 21.42 9.59 21.42 9.77C21.42 9.77 21.42 9.77 21.42 9.77C21.46 9.97 21.39 10.14 21.17 10.45C20.88 10.91 20.57 11.32 20.32 11.66C19.58 12.68 19.58 12.75 20.35 13.46C20.65 13.76 20.9 14.02 21.1 14.25C21.27 14.45 21.45 14.66 21.6 14.89C21.69 15.04 21.77 15.19 21.74 15.37C21.71 15.57 21.53 15.72 21.33 15.72H20.2C19.84 15.72 19.77 15.5 19.44 15.11C19.37 15.02 19.28 14.94 19.2 14.85C18.98 14.59 18.81 14.4 18.59 14.23C18 13.71 17.57 13.77 17.33 13.77C17.13 13.79 16.98 13.95 16.98 14.15V15.07C16.98 15.35 16.95 15.5 16.71 15.62C16.66 15.62 16.57 15.67 16.53 15.67H15.54V13.5Z" />
          </svg>
        );
      case 'tiktok':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.59-1.16-2.59-2.5 0-1.4 1.16-2.5 2.59-2.5.27 0 .53.04.77.13v-3.13c-.25-.02-.5-.04-.77-.04-3.09 0-5.59 2.57-5.59 5.67 0 3.1 2.5 5.67 5.59 5.67 3.09 0 5.59-2.57 5.59-5.67V9.14c.85.63 1.91 1.05 3.09 1.05V7.15c-1.32 0-2.59-.7-3.09-1.33z"/>
          </svg>
        );
      default:
        if (lowerName.includes('facebook')) return <FacebookIcon />;
        if (lowerName.includes('twitter')) return <TwitterIcon />;
        if (lowerName.includes('instagram')) return <InstagramIcon />;
        if (lowerName.includes('telegram')) return <TelegramIcon />;
        if (lowerName.includes('youtube')) return <YouTubeIcon />;
        if (lowerName.includes('vk') || lowerName.includes('вконтакте')) return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.07 2H8.93C3.33 2 2 3.33 2 8.93V15.07C2 20.67 3.33 22 8.93 22H15.07C20.67 22 22 20.67 22 15.07V8.93C22 3.33 20.67 2 15.07 2M15.54 13.5C15.24 13.41 14.95 13.33 14.7 13.21C13.3 12.58 12.64 11.3 12.34 10.55C12.23 10.26 12.16 10 12.15 9.89C12.15 9.89 12.15 9.89 12.15 9.89V9.85C12.15 9.63 12.34 9.44 12.56 9.44H13.43C13.6 9.44 13.75 9.59 13.75 9.76V9.76C13.81 9.93 13.82 9.98 13.96 10.26C14.11 10.59 14.36 11.09 14.91 11.54C15.18 11.77 15.34 11.75 15.46 11.66C15.46 11.66 15.5 11.55 15.5 11.13V10.11C15.46 9.85 15.4 9.77 15.35 9.67C15.32 9.61 15.29 9.56 15.27 9.47C15.27 9.37 15.35 9.28 15.45 9.28H17.1C17.27 9.28 17.4 9.41 17.4 9.58V10.94C17.4 11.05 17.42 11.94 18.05 11.94C18.38 11.94 18.66 11.63 19.07 11.15C19.5 10.57 19.71 10.08 19.81 9.85C19.86 9.76 19.93 9.53 20.04 9.47C20.12 9.42 20.21 9.44 20.28 9.44H21.1C21.27 9.44 21.42 9.59 21.42 9.77C21.42 9.77 21.42 9.77 21.42 9.77C21.46 9.97 21.39 10.14 21.17 10.45C20.88 10.91 20.57 11.32 20.32 11.66C19.58 12.68 19.58 12.75 20.35 13.46C20.65 13.76 20.9 14.02 21.1 14.25C21.27 14.45 21.45 14.66 21.6 14.89C21.69 15.04 21.77 15.19 21.74 15.37C21.71 15.57 21.53 15.72 21.33 15.72H20.2C19.84 15.72 19.77 15.5 19.44 15.11C19.37 15.02 19.28 14.94 19.2 14.85C18.98 14.59 18.81 14.4 18.59 14.23C18 13.71 17.57 13.77 17.33 13.77C17.13 13.79 16.98 13.95 16.98 14.15V15.07C16.98 15.35 16.95 15.5 16.71 15.62C16.66 15.62 16.57 15.67 16.53 15.67H15.54V13.5Z" />
          </svg>
        );
        if (lowerName.includes('tiktok')) return (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.59-1.16-2.59-2.5 0-1.4 1.16-2.5 2.59-2.5.27 0 .53.04.77.13v-3.13c-.25-.02-.5-.04-.77-.04-3.09 0-5.59 2.57-5.59 5.67 0 3.1 2.5 5.67 5.59 5.67 3.09 0 5.59-2.57 5.59-5.67V9.14c.85.63 1.91 1.05 3.09 1.05V7.15c-1.32 0-2.59-.7-3.09-1.33z"/>
          </svg>
        );
        return <PublicIcon />;
    }
  };

  // Добавление социальной сети
  const handleAddSocial = async () => {
    try {
      setSaving(true);
      setError('');
      
      if (!newSocialName || !newSocialLink) {
        setError('Пожалуйста, заполните все поля');
        setSaving(false);
        return;
      }
      
      // Автоматически добавляем https:// если его нет
      let url = newSocialLink;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      
      // Проверяем, не добавлена ли уже такая социальная сеть
      if (socials.some(social => social.name.toLowerCase() === newSocialName.toLowerCase())) {
        setError(`Социальная сеть ${newSocialName} уже добавлена`);
        setSaving(false);
        return;
      }
      
      // Используем ProfileService для добавления социальной сети
      const response = await ProfileService.addSocial(newSocialName, url);
      
      if (response.success) {
        setSocials([...socials, { name: newSocialName, link: url }]);
        setDialogOpen(false);
        setNewSocialName('');
        setNewSocialLink('');
        
        if (onSuccess) onSuccess();
      } else {
        setError(response.error || 'Ошибка добавления социальной сети');
      }
      
      setSaving(false);
    } catch (error: any) {
      console.error('Ошибка добавления социальной сети:', error);
      setError(error.response?.data?.error || error.message || 'Не удалось добавить социальную сеть');
      setSaving(false);
    }
  };

  // Удаление социальной сети
  const handleDeleteSocial = async (name: string) => {
    try {
      setSaving(true);
      
      const response = await ProfileService.deleteSocial(name);
      
      if (response.success) {
        setSocials(socials.filter(social => social.name !== name));
        
        if (onSuccess) onSuccess();
      } else {
        setError(response.error || 'Ошибка удаления социальной сети');
      }
      
      setSaving(false);
    } catch (error: any) {
      console.error('Ошибка удаления социальной сети:', error);
      setError('Ошибка удаления социальной сети');
      setSaving(false);
    }
  };

  const containerStyle = {
    p: 3,
    borderRadius: 2,
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    backdropFilter: 'blur(20px)',
    mb: 3
  };

  const listItemStyle = {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: 1.5,
    mb: 1,
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.05)',
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3, color: 'text.primary', fontSize: '1.2rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
        <LinkIcon /> 
        Социальные сети и ссылки
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {socials.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <PublicIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
            У вас пока нет добавленных социальных сетей
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            Добавьте ссылки на ваши социальные сети, чтобы другие пользователи могли вас найти
          </Typography>
        </Box>
      ) : (
        <List>
          {socials.map((social, index) => (
            <ListItem key={index} sx={listItemStyle}>
              <ListItemIcon sx={{ color: 'text.primary' }}>
                {getSocialIcon(social.name, social.link)}
              </ListItemIcon>
              <ListItemText
                primary={social.name}
                secondary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <Chip 
                      label="Ссылка" 
                      size="small" 
                      variant="outlined"
                      sx={{ 
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        color: 'text.secondary',
                        fontSize: '0.7rem'
                      }}
                    />
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                      {social.link}
                    </Typography>
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => handleDeleteSocial(social.name)}
                  disabled={saving}
                  sx={{
                    color: 'error.main',
                    '&:hover': {
                      background: 'rgba(244, 67, 54, 0.1)',
                    }
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}

      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={() => setDialogOpen(true)}
        sx={{
          mt: 2,
          borderColor: 'rgba(255, 255, 255, 0.3)',
          color: 'text.primary',
          '&:hover': {
            borderColor: 'rgba(255, 255, 255, 0.5)',
            backgroundColor: 'rgba(255, 255, 255, 0.05)'
          }
        }}
      >
        Добавить социальную сеть
      </Button>

      {/* Диалог добавления социальной сети */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        PaperProps={{
          sx: {
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: 2
          }
        }}
      >
        <DialogTitle sx={{ color: 'text.primary' }}>
          Добавить социальную сеть
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Название"
            value={newSocialName}
            onChange={(e) => setNewSocialName(e.target.value)}
            placeholder="Например: Instagram, YouTube, Telegram"
            sx={{
              mb: 2,
              mt: 1,
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'text.secondary',
              },
              '& .MuiInputBase-input': {
                color: 'text.primary',
              },
            }}
          />
          <TextField
            fullWidth
            label="Ссылка"
            value={newSocialLink}
            onChange={(e) => setNewSocialLink(e.target.value)}
            placeholder="https://instagram.com/username или instagram.com/username"
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                },
              },
              '& .MuiInputLabel-root': {
                color: 'text.secondary',
              },
              '& .MuiInputBase-input': {
                color: 'text.primary',
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDialogOpen(false)}
            sx={{ color: 'text.secondary' }}
          >
            Отмена
          </Button>
          <Button 
            onClick={handleAddSocial}
            disabled={saving || !newSocialName || !newSocialLink}
            variant="contained"
            sx={{
              color: 'text.primary',
              background: 'rgba(255, 255, 255, 0.1)',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.2)',
              }
            }}
          >
            {saving ? <CircularProgress size={20} /> : 'Добавить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SocialLinksForm; 