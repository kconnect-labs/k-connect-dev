import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { LeaderboardUserCard } from '../Leaderboard';
import CloseIcon from '@mui/icons-material/Close';
import DiamondIcon from '@mui/icons-material/Diamond';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import axios from 'axios';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-container': {
    zIndex: 999999999999,
  },
  '& .MuiDialog-paper': {
    borderRadius: 12,
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
    maxWidth: '600px',
    width: '100%',
    margin: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      width: '100%',
      maxWidth: '100%',
      margin: 0,
      borderRadius: 0,
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
    },
  },
}));

const DialogHeader = styled(Box)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  padding: theme.spacing(3),
  borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
  background: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(20px)',
  borderRadius: '12px 12px 0 0',
  [theme.breakpoints.down('sm')]: {
    borderRadius: 0,
    padding: theme.spacing(2),
  },
}));

const HeaderGlow = styled(Box)(({ theme }) => ({
  display: 'none', // Убираем свечение
}));

const DialogHeaderContent = styled(Box)(({ theme }) => ({
  position: 'relative',
  zIndex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const HeaderTitle = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
}));

const DecorationGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  maxHeight: '400px',
  overflowY: 'auto',
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
    maxHeight: 'none',
    flex: 1,
    padding: theme.spacing(1),
  },
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '3px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '3px',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    background: 'rgba(255, 255, 255, 0.3)',
  },
}));

const DecorationCard = styled(motion.div)(({ theme, selected }) => ({
  position: 'relative',
  borderRadius: 12,
  overflow: 'hidden',
  cursor: 'pointer',
  border: selected
    ? '2px solid rgba(255, 255, 255, 0.3)'
    : '1px solid rgba(255, 255, 255, 0.12)',
  transition: 'all 0.3s ease',
  background: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(20px)',
  '&:hover': {
    transform: 'translateY(-2px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
}));

const SelectionOverlay = styled(Box)(({ theme, selected }) => ({
  position: 'absolute',
  top: 8,
  right: 8,
  width: 24,
  height: 24,
  borderRadius: '50%',
  background: selected
    ? 'rgba(255, 255, 255, 0.9)'
    : 'rgba(255, 255, 255, 0.1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 10,
  transition: 'all 0.3s ease',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  '& svg': {
    color: selected ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.5)',
    fontSize: 16,
  },
}));

const DecorationPreview = styled(Box)(({ theme, background }) => ({
  height: '80px',
  background: background || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
}));

const DecorationItem = styled('img')({
  position: 'absolute',
  right: 0,
  bottom: 0,
  height: '100%',
  maxHeight: 120,
  objectFit: 'contain',
  transition: 'transform 0.35s cubic-bezier(.4,2,.3,1), z-index 0.2s',
});

const DecorationInfo = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1),
  background: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(20px)',
  borderTop: '1px solid rgba(255, 255, 255, 0.12)',
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: 8,
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(3),
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1),
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  color: '#fff',
  fontWeight: 500,
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.15)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
  },
  '&:disabled': {
    background: 'rgba(255, 255, 255, 0.05)',
    color: 'rgba(255, 255, 255, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
}));

const CancelButton = styled(Button)(({ theme }) => ({
  borderRadius: 8,
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(3),
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  color: 'rgba(255, 255, 255, 0.7)',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
}));

const SuccessContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(4),
  textAlign: 'center',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
    flex: 1,
    justifyContent: 'center',
  },
}));

const UltimateDecorationModal = ({
  open,
  onClose,
  availableDecorations = [],
  onSuccess,
}) => {
  const theme = useTheme();
  const [selectedDecoration, setSelectedDecoration] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const API_URL = 'https://k-connect.ru';

  // Функция для проверки является ли цвет светлым
  const isLightColor = color => {
    if (!color || !color.startsWith('#')) {
      return false;
    }
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128;
  };

  // Функция для парсинга настроек из строки пути
  const parseItemSettings = itemPath => {
    if (!itemPath || !itemPath.includes(';')) {
      return {
        path: itemPath,
        styles: {},
      };
    }

    const [path, ...stylesParts] = itemPath.split(';');
    const stylesString = stylesParts.join(';');

    const styles = {};
    stylesString.split(';').forEach(style => {
      const [property, value] = style.split(':').map(s => s.trim());
      if (property && value) {
        const camelProperty = property.replace(/-([a-z])/g, g =>
          g[1].toUpperCase()
        );
        styles[camelProperty] = value;
      }
    });

    return {
      path: path,
      styles: styles,
    };
  };

  // Сброс состояния при открытии модалки
  useEffect(() => {
    if (open) {
      setSelectedDecoration(null);
      setError('');
      setSuccess(false);
      setIsSubmitting(false);
    }
  }, [open]);

  const handleDecorationSelect = decoration => {
    setSelectedDecoration(decoration);
    setError('');
  };

  const handleSubmit = async () => {
    if (!selectedDecoration) {
      setError('Пожалуйста, выберите декорацию');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await axios.post('/api/ultimate/decorations/select', {
        decoration_id: selectedDecoration.id,
      });

      if (response.data.success) {
        setSuccess(true);
        if (onSuccess) {
          onSuccess(selectedDecoration);
        }
      } else {
        setError(response.data.error || 'Ошибка при выборе декорации');
      }
    } catch (error) {
      console.error('Ошибка при выборе декорации:', error);
      setError(
        error.response?.data?.error || 'Произошла ошибка при выборе декорации'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting && !success) {
      onClose();
    }
  };

  const handleSuccessClose = () => {
    setSuccess(false);
    onClose();
  };

  // Создаем тестового пользователя для предварительного просмотра
  const previewUser = {
    id: 1,
    name: 'Ваш профиль',
    username: 'preview_user',
    score: 15000,
    avatar_url: null,
    verification: null,
    achievement: null,
    decoration: selectedDecoration
      ? {
          ...selectedDecoration,
          // Убеждаемся, что item_path правильно обработан
          item_path: selectedDecoration.item_path,
        }
      : null,
  };

  return (
    <StyledDialog open={open} onClose={handleClose} maxWidth='md' fullWidth>
      <DialogHeader>
        <HeaderGlow />
        <DialogHeaderContent>
          <HeaderTitle>
            <DiamondIcon sx={{ color: '#D0BCFF', fontSize: 28 }} />
            <Box>
              <Typography variant='h5' fontWeight='bold' color='primary.light'>
                Выберите декорацию
              </Typography>
              <Typography
                variant='body2'
                color='text.secondary'
                sx={{ mt: 0.5 }}
              >
                Ultimate подписка позволяет выбрать одну декорацию бесплатно
              </Typography>
            </Box>
          </HeaderTitle>
          {!isSubmitting && !success && (
            <IconButton
              onClick={handleClose}
              sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </DialogHeaderContent>
      </DialogHeader>

      <DialogContent
        sx={{
          p: 0,
          bgcolor: 'transparent',
          [theme.breakpoints.down('sm')]: {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          },
        }}
      >
        {success ? (
          <SuccessContent>
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, type: 'spring' }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(76, 175, 80, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  marginBottom: 2,
                }}
              >
                <CheckCircleIcon sx={{ fontSize: 50, color: 'success.main' }} />
              </Box>
            </motion.div>

            <Typography variant='h6' gutterBottom>
              Декорация выбрана!
            </Typography>

            <Typography variant='body1' color='text.secondary' paragraph>
              Декорация "{selectedDecoration?.name}" успешно применена к вашему
              профилю
            </Typography>

            <Box
              sx={{
                mt: 3,
                p: 2,
                borderRadius: 8,
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                maxWidth: 300,
                width: '100%',
                [theme.breakpoints.down('sm')]: {
                  maxWidth: '100%',
                  mt: 2,
                },
              }}
            >
              <Typography variant='subtitle2' color='primary' gutterBottom>
                Выбранная декорация:
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                {selectedDecoration?.name}
              </Typography>
            </Box>
          </SuccessContent>
        ) : (
          <Box
            sx={{
              p: 3,
              [theme.breakpoints.down('sm')]: {
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              },
            }}
          >
            {error && (
              <Alert severity='error' sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Typography
              variant='body1'
              paragraph
              sx={{
                [theme.breakpoints.down('sm')]: {
                  fontSize: '0.9rem',
                  lineHeight: 1.4,
                },
              }}
            >
              Выберите одну из доступных декораций для вашего профиля. Декорация
              будет применена немедленно и останется активной навсегда.
              Управлять можно будет в Настройках.
            </Typography>

            <DecorationGrid>
              <AnimatePresence>
                {availableDecorations.map((decoration, index) => (
                  <motion.div
                    key={decoration.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <DecorationCard
                      selected={selectedDecoration?.id === decoration.id}
                      onClick={() => handleDecorationSelect(decoration)}
                    >
                      <SelectionOverlay
                        selected={selectedDecoration?.id === decoration.id}
                      >
                        {selectedDecoration?.id === decoration.id && (
                          <CheckCircleIcon />
                        )}
                      </SelectionOverlay>

                      <DecorationPreview
                        background={
                          decoration.background
                            ? decoration.background.includes('/')
                              ? `url(${API_URL}/${decoration.background})`
                              : decoration.background
                            : undefined
                        }
                      >
                        {decoration.item_path && decoration.item_path.trim() !== '' &&
                          (() => {
                            const { path, styles } = parseItemSettings(
                              decoration.item_path
                            );
                            return (
                              <DecorationItem
                                src={`${API_URL}/${path}`}
                                alt={decoration.name}
                                style={styles}
                              />
                            );
                          })()}
                      </DecorationPreview>

                      <DecorationInfo>
                        <Typography
                          variant='subtitle1'
                          fontWeight='bold'
                          gutterBottom
                        >
                          {decoration.name}
                        </Typography>
                      </DecorationInfo>
                    </DecorationCard>
                  </motion.div>
                ))}
              </AnimatePresence>
            </DecorationGrid>

            {selectedDecoration && (
              <Box
                sx={{
                  mt: 3,
                  p: 2,
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  [theme.breakpoints.down('sm')]: {
                    mt: 2,
                    p: 1.5,
                  },
                }}
              >
                <Typography variant='subtitle2' color='primary' gutterBottom>
                  Предварительный просмотр:
                </Typography>
                <Box
                  sx={{
                    maxWidth: '100%',
                    [theme.breakpoints.down('sm')]: {
                      maxWidth: '100%',
                    },
                  }}
                >
                  <LeaderboardUserCard
                    user={{
                      ...previewUser,
                      decoration: selectedDecoration,
                    }}
                    position={1}
                    index={0}
                    onCardClick={() => {}}
                  />
                </Box>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          p: 3,
          justifyContent: 'space-between',
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '0 0 12px 12px',
          [theme.breakpoints.down('sm')]: {
            borderRadius: 0,
            padding: theme.spacing(2),
          },
        }}
      >
        {success ? (
          <ActionButton onClick={handleSuccessClose} sx={{ mx: 'auto' }}>
            Отлично!
          </ActionButton>
        ) : (
          <>
            <CancelButton onClick={handleClose} variant='outlined'>
              Отмена
            </CancelButton>
            <ActionButton
              onClick={handleSubmit}
              disabled={!selectedDecoration || isSubmitting}
              startIcon={
                isSubmitting ? (
                  <CircularProgress size={16} color='inherit' />
                ) : null
              }
            >
              {isSubmitting ? 'Применяем...' : 'Выбрать декорацию'}
            </ActionButton>
          </>
        )}
      </DialogActions>
    </StyledDialog>
  );
};

export default UltimateDecorationModal;
