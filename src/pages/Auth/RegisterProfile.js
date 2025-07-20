import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  TextField,
  Button,
  Alert,
  CircularProgress,
  Box,
  Checkbox,
  FormControlLabel,
  Typography,
  Avatar,
  useMediaQuery,
  Container,
  Paper,
  Fade,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { motion } from 'framer-motion';
import AuthService from '../../services/AuthService';

const RegisterProfile = ({ setUser }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    name: '',
    interests: '',
    about: '',
    agree_terms: false,
    agree_privacy: false,
    chat_id: '',
    referral_code: '',
  });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [referralRewards, setReferralRewards] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlChatId = params.get('chat_id');
    const urlReferralCode = params.get('ref');

    const storedChatId = localStorage.getItem('k-connect-chat-id');

    const chatId = urlChatId || storedChatId || '';
    const referralCode = urlReferralCode || '';

    if (chatId) {
      console.log('Found chat_id:', chatId);
      setFormData(prev => ({ ...prev, chat_id: chatId }));
    }

    if (referralCode) {
      console.log('Found referral code:', referralCode);
      setFormData(prev => ({
        ...prev,
        referral_code: referralCode.toUpperCase(),
      }));
    }
  }, [location.search]);

  const handleChange = e => {
    const { name, value, checked } = e.target;
    let newValue =
      name === 'agree_terms' || name === 'agree_privacy' ? checked : value;

    // Обработка реферального кода: преобразование в верхний регистр и удаление пробелов
    if (name === 'referral_code') {
      newValue = value.toUpperCase().replace(/\s/g, '');
    }

    setFormData(prev => ({ ...prev, [name]: newValue }));
    setError('');
  };

  const handleAvatarUpload = event => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Размер файла не должен превышать 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Пожалуйста, выберите изображение');
      return;
    }

    setAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));
    setError(null);
  };

  const validateForm = () => {
    if (!formData.name) {
      setError('Имя не может быть пустым');
      return false;
    }

    if (!formData.agree_terms || !formData.agree_privacy) {
      setError(
        'Необходимо согласиться с правилами и политикой конфиденциальности'
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const chatId = localStorage.getItem('k-connect-chat-id');

      const profileFormData = new FormData();

      Object.keys(formData).forEach(key => {
        profileFormData.append(key, formData[key]);
      });

      if (chatId && !formData.chat_id) {
        profileFormData.append('chat_id', chatId);
        console.log('Добавлен chat_id из localStorage:', chatId);
      }

      if (avatar) {
        profileFormData.append('photo', avatar);
      }

      console.log('Отправка профиля:');
      for (let pair of profileFormData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      const profileResponse =
        await AuthService.registerProfile(profileFormData);

      if (profileResponse.success && profileResponse.user) {
        setUser(profileResponse.user);
        localStorage.removeItem('k-connect-chat-id');

        // Сохраняем информацию о реферальных наградах, если они были применены
        if (profileResponse.referral_rewards) {
          setReferralRewards(profileResponse.referral_rewards);
          // Сохраняем в localStorage для отображения на главной странице
          localStorage.setItem(
            'k-connect-referral-rewards',
            JSON.stringify(profileResponse.referral_rewards)
          );
        }

        navigate('/', { replace: true });
      } else if (profileResponse.error) {
        setError(profileResponse.error);
      }
    } catch (err) {
      console.error('Error:', err);
      if (err.response && err.response.data && err.response.data.error) {
        const errorMsg = err.response.data.error;
        if (errorMsg.includes('chat_id is required')) {
          setError(
            'Ошибка идентификации. Попробуйте перейти по ссылке из письма повторно или обратитесь в поддержку.'
          );
        } else if (errorMsg.includes('уже существует')) {
          setError(
            'Профиль с этими данными уже существует. Попробуйте войти в систему.'
          );
        } else {
          setError(errorMsg);
        }
      } else {
        setError('Ошибка при создании профиля. Пожалуйста, попробуйте позже.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      disableGutters
      maxWidth={false}
      sx={{
        display: 'flex',
        minHeight: '100vh',
        width: '100%',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {!isMobile && (
        <Box
          sx={{
            flex: '0 0 45%',
            background:
              'linear-gradient(135deg, rgba(20, 20, 30, 1) 0%, rgba(40, 40, 60, 0.95) 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            p: 6,
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              width: '200%',
              height: '200%',
              top: '-50%',
              left: '-50%',
              background:
                'radial-gradient(circle, rgba(208, 188, 255, 0.05) 0%, rgba(208, 188, 255, 0) 70%)',
              zIndex: 0,
            }}
          />

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            style={{ position: 'relative', zIndex: 1 }}
          >
            <img
              src='/static/icons/clear-logonew.svg'
              alt='К-Коннект Лого'
              style={{ width: 180, marginBottom: 40 }}
            />
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}
          >
            <Typography variant='h3' sx={{ fontWeight: 700, mb: 2 }}>
              <span style={{ color: '#D0BCFF' }}>К</span>-КОННЕКТ
            </Typography>
            <Typography
              variant='h6'
              color='text.secondary'
              sx={{ maxWidth: 400 }}
            >
              Расскажите о себе и станьте частью нашего сообщества
            </Typography>
          </motion.div>

          <Box
            sx={{
              position: 'absolute',
              bottom: 40,
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'center',
              gap: 2,
            }}
          >
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.8 + i * 0.2 }}
              >
                <Box
                  sx={{
                    width: 12 + i * 4,
                    height: 12 + i * 4,
                    borderRadius: '50%',
                    background: `rgba(208, 188, 255, ${0.6 - i * 0.15})`,
                  }}
                />
              </motion.div>
            ))}
          </Box>
        </Box>
      )}

      <Box
        sx={{
          flex: isMobile ? 1 : '0 0 55%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 0,
          background: isMobile
            ? 'linear-gradient(135deg, rgba(20, 20, 30, 1) 0%, rgba(40, 40, 60, 0.95) 100%)'
            : 'transparent',
        }}
      >
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: isMobile ? '16px' : '40px',
          }}
        >
          {isMobile && (
            <Box
              sx={{
                position: 'absolute',
                top: '24px',
                left: 0,
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1.5,
              }}
            >
              <img
                src='/static/icons/clear-logonew.svg'
                alt='К-Коннект Лого'
                style={{ width: 30, height: 30 }}
              />
              <Typography variant='h6' component='h1' sx={{ fontWeight: 700 }}>
                <span style={{ color: '#D0BCFF' }}>К</span>-КОННЕКТ
              </Typography>
            </Box>
          )}

          <Paper
            elevation={isMobile ? 0 : 6}
            sx={{
              p: isMobile ? 3 : 4,
              width: '100%',
              maxWidth: '480px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              mt: isMobile ? '70px' : 0,
              overflowY: 'auto',
              maxHeight: isMobile ? 'calc(100vh - 200px)' : '80vh',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Typography
              variant='h5'
              component='h2'
              sx={{ mb: 1, fontWeight: 600 }}
            >
              Завершение регистрации
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
              Расскажите о себе и заполните свой профиль
            </Typography>

            {error && (
              <Alert
                severity='error'
                sx={{
                  mb: 3,
                  borderRadius: 2,
                  '& .MuiAlert-icon': { alignItems: 'center' },
                }}
              >
                {error
                  ? error.toString()
                  : 'Произошла ошибка при обработке запроса'}
              </Alert>
            )}

            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  mb: 3,
                }}
              >
                <Avatar
                  src={avatarPreview}
                  sx={{
                    width: 100,
                    height: 100,
                    mb: 2,
                    border: '2px solid #D0BCFF',
                  }}
                />
                <Button
                  variant='outlined'
                  component='label'
                  startIcon={<CloudUploadIcon />}
                  sx={{
                    borderColor: '#D0BCFF',
                    color: '#D0BCFF',
                    borderRadius: 2,
                    '&:hover': {
                      borderColor: '#B69DF8',
                      backgroundColor: 'rgba(208, 188, 255, 0.04)',
                    },
                  }}
                >
                  Загрузить аватар
                  <input
                    type='file'
                    hidden
                    accept='image/*'
                    onChange={handleAvatarUpload}
                  />
                </Button>
              </Box>

              <TextField
                margin='normal'
                required
                fullWidth
                id='name'
                label='Ваше имя'
                name='name'
                autoFocus
                value={formData.name}
                onChange={handleChange}
                variant='outlined'
                sx={{
                  mb: 2.5,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />

              <TextField
                margin='normal'
                fullWidth
                id='interests'
                label='Интересы'
                name='interests'
                value={formData.interests}
                onChange={handleChange}
                variant='outlined'
                placeholder='Музыка, спорт, программирование...'
                sx={{
                  mb: 2.5,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />

              <TextField
                margin='normal'
                fullWidth
                id='about'
                label='О себе'
                name='about'
                value={formData.about}
                onChange={handleChange}
                variant='outlined'
                multiline
                rows={4}
                placeholder='Расскажите немного о себе...'
                sx={{
                  mb: 2.5,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />

              <TextField
                margin='normal'
                fullWidth
                id='referral_code'
                label='Реферальный код (необязательно)'
                name='referral_code'
                value={formData.referral_code}
                onChange={handleChange}
                variant='outlined'
                placeholder='Введите код друга для получения бонусов'
                sx={{
                  mb: 1,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{
                  mb: 3,
                  display: 'block',
                  fontSize: '12px',
                  lineHeight: 1.4,
                }}
              >
                💡 Попросите реферальный код у друга, чтобы получить бонусы при
                регистрации
              </Typography>

              <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 600 }}>
                Правовые соглашения
              </Typography>

              <FormControlLabel
                control={
                  <Checkbox
                    name='agree_terms'
                    checked={formData.agree_terms}
                    onChange={handleChange}
                    color='primary'
                    required
                    sx={{
                      color: '#D0BCFF',
                      '&.Mui-checked': {
                        color: '#D0BCFF',
                      },
                    }}
                  />
                }
                label={
                  <Typography variant='body2'>
                    Я принимаю{' '}
                    <Button
                      href='/terms-of-service'
                      target='_blank'
                      sx={{
                        color: '#D0BCFF',
                        p: 0,
                        minWidth: 'auto',
                        fontWeight: 'normal',
                        textTransform: 'none',
                        fontSize: 'inherit',
                        '&:hover': {
                          background: 'transparent',
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      Правила пользования
                    </Button>
                  </Typography>
                }
                sx={{ mb: 1 }}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    name='agree_privacy'
                    checked={formData.agree_privacy}
                    onChange={handleChange}
                    color='primary'
                    required
                    sx={{
                      color: '#D0BCFF',
                      '&.Mui-checked': {
                        color: '#D0BCFF',
                      },
                    }}
                  />
                }
                label={
                  <Typography variant='body2'>
                    Я согласен с{' '}
                    <Button
                      href='/privacy'
                      target='_blank'
                      sx={{
                        color: '#D0BCFF',
                        p: 0,
                        minWidth: 'auto',
                        fontWeight: 'normal',
                        textTransform: 'none',
                        fontSize: 'inherit',
                        '&:hover': {
                          background: 'transparent',
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      Политикой конфиденциальности
                    </Button>
                  </Typography>
                }
                sx={{ mb: 3 }}
              />

              <Button
                type='submit'
                fullWidth
                variant='contained'
                size='large'
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  fontSize: '1rem',
                  textTransform: 'none',
                  background:
                    'linear-gradient(90deg, #B69DF8 0%, #D0BCFF 100%)',
                  boxShadow: '0 4px 12px rgba(182, 157, 248, 0.3)',
                  '&:hover': {
                    background:
                      'linear-gradient(90deg, #D0BCFF 0%, #E9DDFF 100%)',
                    boxShadow: '0 6px 16px rgba(182, 157, 248, 0.4)',
                  },
                  mb: 2,
                }}
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={24} color='inherit' />
                ) : (
                  'Создать профиль'
                )}
              </Button>
            </form>
          </Paper>
        </motion.div>
      </Box>
    </Container>
  );
};

export default RegisterProfile;
