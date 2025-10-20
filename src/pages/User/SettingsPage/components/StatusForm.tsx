import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  AlertTitle,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Avatar,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Chat as ChatIcon,
  Person as PersonIcon,
  Cloud as CloudIcon,
  MusicNote as MusicNoteIcon,
  LocationOn as LocationOnIcon,
  Cake as CakeIcon,
  Info as InfoIcon,
  Check as CheckIcon,
  Colorize as ColorizeIcon,
  Palette as PaletteIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { SvgIcon } from '@mui/material';
import { AuthContext } from '../../../../context/AuthContext';

interface StatusFormProps {
  profileData?: any;
  subscription?: any;
  onStatusUpdate?: (statusData: any) => void;
  loading?: boolean;
  onSuccess?: () => void;
}

const StatusForm: React.FC<StatusFormProps> = ({
  profileData,
  subscription,
  onStatusUpdate,
  loading = false,
  onSuccess,
}) => {
  const theme = useTheme();
  const { user } = useContext<any>(AuthContext);

  const [statusText, setStatusText] = useState('');
  const [statusColor, setStatusColor] = useState('#D0BCFF');
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [isUltimate, setIsUltimate] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [customColorOpen, setCustomColorOpen] = useState(false);

  const maxLength = 50;
  const isChannel = user?.account_type === 'channel';

  const presetColors = [
    '#D0BCFF',
    '#90CAF9',
    '#A5D6A7',
    '#FFCC80',
    '#EF9A9A',
    '#CE93D8',
    '#FFF59D',
    '#B0BEC5',
    '#F48FB1',
    '#81D4FA',
  ];

  const availableIcons = [
    { name: 'cloud', component: <CloudIcon sx={{ fontSize: 24 }} /> },
    {
      name: 'minion',
      component: (
        <SvgIcon sx={{ fontSize: 24 }}>
          <svg
            width='800'
            height='800'
            viewBox='0 0 800 800'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              d='M402.667 518C367.33 518 332.786 507.523 303.405 487.89C274.023 468.257 251.123 440.353 237.6 407.707C224.077 375.06 220.539 339.137 227.433 304.478C234.327 269.82 251.343 237.984 276.33 212.997C301.317 188.01 333.153 170.994 367.81 164.1C402.47 157.206 438.393 160.744 471.04 174.267C503.687 187.79 531.59 210.69 551.223 240.072C570.853 269.453 581.333 303.997 581.333 339.333C581.333 362.797 576.713 386.03 567.733 407.707C558.753 429.383 545.593 449.08 529.003 465.67C512.413 482.26 492.717 495.42 471.04 504.4C449.363 513.38 426.13 518 402.667 518ZM402.667 210.667C377.22 210.667 352.343 218.213 331.183 232.351C310.024 246.489 293.533 266.584 283.794 290.095C274.056 313.606 271.508 339.477 276.472 364.437C281.437 389.393 293.691 412.32 311.686 430.313C329.68 448.31 352.607 460.563 377.567 465.527C402.523 470.493 428.393 467.943 451.907 458.207C475.417 448.467 495.51 431.977 509.65 410.817C523.787 389.657 531.333 364.78 531.333 339.333C531.333 305.209 517.777 272.482 493.647 248.353C469.517 224.223 436.79 210.667 402.667 210.667Z'
              fill='currentColor'
            />
            <path
              d='M400 643.667C376.53 643.72 353.28 639.123 331.597 630.14C309.913 621.157 290.224 607.97 273.667 591.333C269.251 586.593 266.847 580.327 266.961 573.85C267.075 567.373 269.699 561.193 274.28 556.613C278.86 552.033 285.04 549.407 291.516 549.293C297.993 549.18 304.261 551.583 309 556C333.693 579.057 366.216 591.88 400 591.88C433.783 591.88 466.31 579.057 491 556C495.74 551.583 502.006 549.18 508.483 549.293C514.96 549.407 521.14 552.033 525.72 556.613C530.303 561.193 532.926 567.373 533.04 573.85C533.153 580.327 530.75 586.593 526.333 591.333C509.776 607.97 490.086 621.157 468.403 630.14C446.72 639.123 423.47 643.72 400 643.667Z'
              fill='currentColor'
            />
            <path
              d='M402.667 400C436.173 400 463.333 372.837 463.333 339.333C463.333 305.828 436.173 278.666 402.667 278.666C369.163 278.666 342 305.828 342 339.333C342 372.837 369.163 400 402.667 400Z'
              fill='currentColor'
            />
            <path
              d='M666.666 755.333C660.036 755.333 653.676 752.7 648.99 748.01C644.3 743.323 641.666 736.963 641.666 730.333V333.333C637.156 272.944 609.983 216.492 565.596 175.297C521.21 134.102 462.89 111.209 402.333 111.209C341.776 111.209 283.457 134.102 239.07 175.297C194.684 216.492 167.511 272.944 163 333.333V730.333C163 736.963 160.366 743.323 155.678 748.01C150.989 752.7 144.631 755.333 138 755.333C131.37 755.333 125.011 752.7 120.322 748.01C115.634 743.323 113 736.963 113 730.333V333.333C115.55 258.166 147.202 186.929 201.278 134.656C255.354 82.3832 327.623 53.1636 402.833 53.1636C478.043 53.1636 550.313 82.3832 604.39 134.656C658.466 186.929 690.116 258.166 692.666 333.333V730.333C692.623 733.69 691.913 737.003 690.58 740.08C689.246 743.16 687.313 745.943 684.893 748.27C682.476 750.597 679.62 752.417 676.49 753.63C673.36 754.843 670.023 755.423 666.666 755.333Z'
              fill='currentColor'
            />
            <path
              d='M666.666 755.333H138C131.37 755.333 125.011 752.7 120.322 748.01C115.634 743.323 113 736.963 113 730.333C113 723.703 115.634 717.343 120.322 712.657C125.011 707.967 131.37 705.333 138 705.333H666.666C673.296 705.333 679.656 707.967 684.343 712.657C689.033 717.343 691.666 723.703 691.666 730.333C691.666 736.963 689.033 743.323 684.343 748.01C679.656 752.7 673.296 755.333 666.666 755.333Z'
              fill='currentColor'
            />
          </svg>
        </SvgIcon>
      ),
    },
    {
      name: 'heart',
      component: (
        <SvgIcon sx={{ fontSize: 24 }}>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='currentColor'
          >
            <path d='M12,21.35l-1.45-1.32C5.4,15.36,2,12.28,2,8.5C2,5.42,4.42,3,7.5,3c1.74,0,3.41,0.81,4.5,2.09C13.09,3.81,14.76,3,16.5,3 C19.58,3,22,5.42,22,8.5c0,3.78-3.4,6.86-8.55,11.54L12,21.35z' />
          </svg>
        </SvgIcon>
      ),
    },
    {
      name: 'star',
      component: (
        <SvgIcon sx={{ fontSize: 24 }}>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='currentColor'
          >
            <path d='M12,17.27L18.18,21l-1.64-7.03L22,9.24l-7.19-0.61L12,2L9.19,8.63L2,9.24l5.46,4.73L5.82,21L12,17.27z' />
          </svg>
        </SvgIcon>
      ),
    },
    { name: 'music', component: <MusicNoteIcon sx={{ fontSize: 24 }} /> },
    { name: 'location', component: <LocationOnIcon sx={{ fontSize: 24 }} /> },
    { name: 'cake', component: <CakeIcon sx={{ fontSize: 24 }} /> },
    { name: 'chat', component: <ChatIcon sx={{ fontSize: 24 }} /> },
    { name: 'info', component: <InfoIcon sx={{ fontSize: 24 }} /> },
  ];

  useEffect(() => {
    console.log('StatusForm useEffect triggered with:', {
      profileData,
      subscription,
      isChannel,
    });

    if (profileData) {
      // Проверяем подписку для обычных пользователей
      if (!isChannel) {
        const hasValidSubscription =
          subscription &&
          (subscription.type === 'premium' ||
            subscription.type === 'ultimate' ||
            subscription.type === 'max' ||
            subscription.type === 'pick-me') &&
          subscription.active;

        setIsPremium(hasValidSubscription);
        setIsUltimate(
          subscription &&
            (subscription.type === 'ultimate' || subscription.type === 'max') &&
            subscription.active
        );
      }
      // Проверяем подписку для каналов (учитываем основной аккаунт)
      else if (
        isChannel &&
        profileData.user &&
        profileData.user.main_account_id
      ) {
        const hasValidSubscription =
          (subscription &&
            (subscription.type === 'premium' ||
              subscription.type === 'ultimate' ||
              subscription.type === 'pick-me') &&
            subscription.active) ||
          (profileData.main_account_subscription &&
                      (profileData.main_account_subscription.type === 'premium' ||
            profileData.main_account_subscription.type === 'ultimate' ||
            profileData.main_account_subscription.type === 'max' ||
            profileData.main_account_subscription.type === 'pick-me') &&
            profileData.main_account_subscription.active);

        setIsPremium(hasValidSubscription);

        const hasUltimateSubscription =
          (subscription &&
            (subscription.type === 'ultimate' || subscription.type === 'max') &&
            subscription.active) ||
          (profileData.main_account_subscription &&
            (profileData.main_account_subscription.type === 'ultimate' || profileData.main_account_subscription.type === 'max') &&
            profileData.main_account_subscription.active);

        setIsUltimate(hasUltimateSubscription);
      }
      // Если канал без основного аккаунта
      else {
        setIsPremium(false);
        setIsUltimate(false);
      }

      // Загружаем текущий статус
      console.log('Full profileData:', profileData);
      console.log('profileData.user:', profileData.user);
      console.log('profileData.status_text:', profileData.status_text);
      console.log(
        'profileData.user?.status_text:',
        profileData.user?.status_text
      );

      const statusTextToUse =
        profileData.user?.status_text || profileData.status_text;
      console.log('Status text from API:', statusTextToUse);

      if (statusTextToUse) {
        const parsedStatus = parseStatusText(statusTextToUse);
        console.log('Parsed status:', parsedStatus);
        setStatusText(parsedStatus.text);
        setSelectedIcon(parsedStatus.iconName);
      } else {
        console.log('No status text found');
      }

      const statusColorToUse =
        profileData.user?.status_color || profileData.status_color;
      console.log('Status color from API:', statusColorToUse);
      if (statusColorToUse) {
        setStatusColor(statusColorToUse);
      }

      setInitialLoaded(true);
    } else {
      console.log('No profileData available');
    }
  }, [profileData, subscription, isChannel]);

  const parseStatusText = (text: string) => {
    // Декодируем Unicode символы
    const decodedText = text.replace(/\\u([0-9a-fA-F]{4})/g, (match, hex) => {
      return String.fromCharCode(parseInt(hex, 16));
    });

    const iconTagRegex = /\{(\w+)\}/;
    const match = decodedText.match(iconTagRegex);

    const result = {
      text: decodedText,
      iconName: null as string | null,
    };

    if (match) {
      result.iconName = match[1].toLowerCase();
      result.text = decodedText.replace(iconTagRegex, '').trim();
    }

    return result;
  };

  const handleStatusTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value.length <= maxLength) {
      setStatusText(value);
      setHasError(false);
      setErrorMessage('');
    }
  };

  const handlePresetColorClick = (color: string) => {
    if (!color || color.trim() === '') {
      setStatusColor('#D0BCFF');
      return;
    }
    setStatusColor(color);
  };

  const handleIconSelect = (iconName: string) => {
    setSelectedIcon(iconName === selectedIcon ? null : iconName);
  };

  const getFullStatusText = () => {
    return selectedIcon ? `{${selectedIcon}} ${statusText}` : statusText;
  };

  const getContrastTextColor = (hexColor: string) => {
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);

    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    return brightness > 128 ? '#000000' : '#FFFFFF';
  };

  const saveStatus = async () => {
    if (!isPremium) {
      setHasError(true);
      if (isChannel) {
        setErrorMessage(
          'Для установки статуса необходимо, чтобы основной аккаунт имел подписку Premium, Ultimate, MAX или Pick-me!'
        );
      } else {
        setErrorMessage(
          'Для установки статуса необходима подписка Premium, Ultimate, MAX или Pick-me!'
        );
      }
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch('/api/profile/v2update-profilestatus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status_text: getFullStatusText(),
          status_color: statusColor,
          is_channel: isChannel,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setHasError(false);
        setErrorMessage('');

        if (onStatusUpdate) {
          onStatusUpdate({
            status_text: getFullStatusText(),
            status_color: statusColor,
          });
        }

        if (onSuccess) {
          onSuccess();
        }
      } else {
        setHasError(true);
        setErrorMessage(data.error || 'Ошибка при обновлении статуса');
      }
    } catch (error) {
      console.error('Ошибка при обновлении статуса:', error);
      setHasError(true);
      setErrorMessage('Ошибка соединения. Попробуйте позже.');
    } finally {
      setIsSaving(false);
    }
  };

  const StatusPreview = () => {
    const createGradientColor = (hexColor: string) => {
      let r = parseInt(hexColor.substr(1, 2), 16);
      let g = parseInt(hexColor.substr(3, 2), 16);
      let b = parseInt(hexColor.substr(5, 2), 16);

      const brightness = (r * 299 + g * 587 + b * 114) / 1000;

      if (brightness < 128) {
        r = Math.min(255, r + 30);
        g = Math.min(255, g + 30);
        b = Math.min(255, b + 30);
      } else {
        r = Math.max(0, r - 30);
        g = Math.max(0, g - 30);
        b = Math.max(0, b - 30);
      }

      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    };

    const gradientColor = createGradientColor(statusColor || '#D0BCFF');
    const textColor = getContrastTextColor(statusColor || '#D0BCFF');

    const getIconByName = (iconName: string) => {
      const icon = availableIcons.find(icon => icon.name === iconName);
      return icon ? icon.component : availableIcons[0].component;
    };

    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 'var(--main-border-radius)',
          padding: 2,
          marginBottom: 2,
          position: 'relative',
        }}
      >
        <Avatar sx={{ width: 50, height: 50, marginRight: 3 }}>
          <PersonIcon />
        </Avatar>

        {statusText || selectedIcon ? (
          <Box
            sx={{
              position: 'relative',
              ml: 1,
            }}
          >
            <Box
              sx={{
                position: 'relative',
                filter: `drop-shadow(0 4px 8px rgba(0,0,0,0.2))`,
                '&:before': {
                  content: '""',
                  position: 'absolute',
                  top: '40%',
                  left: -14,
                  width: 0,
                  height: 0,
                  borderStyle: 'solid',
                  borderWidth: '0 14px 14px 0',
                  borderColor: `transparent ${statusColor || '#D0BCFF'} transparent transparent`,
                  transform: 'rotate(40deg)',
                  filter: 'drop-shadow(-3px 2px 2px rgba(0,0,0,0.1))',
                  zIndex: 0,
                },
              }}
            >
              <Box
                sx={{
                  background: `linear-gradient(135deg, ${statusColor || '#D0BCFF'} 0%, ${gradientColor} 100%)`,
                  color: textColor,
                  padding: '8px 12px',
                  borderRadius: 'var(--main-border-radius)',
                  fontSize: '14px',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  boxShadow: `inset 0 0 10px rgba(255,255,255,0.15), 
                           0 1px 1px rgba(0,0,0,0.1),
                           0 4px 10px rgba(0,0,0,0.15)`,
                  backdropFilter: 'blur(4px)',
                  border: `1px solid ${statusColor === '#ffffff' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  maxWidth: '200px',
                }}
              >
                {selectedIcon ? (
                  getIconByName(selectedIcon)
                ) : (
                  <ChatIcon sx={{ fontSize: 16, opacity: 0.7 }} />
                )}
                {statusText}
              </Box>
            </Box>
          </Box>
        ) : (
          <Typography variant='body2' color='text.secondary'>
            Здесь будет отображаться ваш статус
          </Typography>
        )}
      </Box>
    );
  };

  const containerStyle = {
                background: 'var(--theme-background, rgba(255, 255, 255, 0.03))',
                backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
    borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
    borderRadius: 'var(--main-border-radius)',
    padding: '20px',
    marginBottom: '20px',
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
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <ChatIcon />
        Статус профиля
        {!isPremium && (
          <Chip label='Premium' size='small' color='secondary' sx={{ ml: 1 }} />
        )}
      </Typography>

      {!initialLoaded ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {!isPremium ? (
            <Alert
              severity='info'
              variant='filled'
              sx={{
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                '& .MuiAlert-icon': {
                  fontSize: '1.5rem',
                },
              }}
            >
              <AlertTitle>
                Функция доступна только для Premium-подписки
              </AlertTitle>
              Статус профиля доступен только пользователям с подписками{' '}
              <strong>Premium</strong>, <strong>Ultimate</strong>, <strong>MAX</strong> или{' '}
              <strong>Pick-me</strong>. Оформите подписку, чтобы установить свой
              уникальный статус и выделиться среди других пользователей.
            </Alert>
          ) : (
            <>
              <StatusPreview />

              <Box sx={{ mb: 3 }}>
                <Typography variant='subtitle2' gutterBottom>
                  Выберите иконку для статуса
                </Typography>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))',
                    gap: 1,
                    mt: 1,
                  }}
                >
                  {availableIcons.map(icon => (
                    <IconButton
                      key={icon.name}
                      onClick={() => handleIconSelect(icon.name)}
                      sx={{
                        borderRadius: 'var(--main-border-radius)',
                        padding: 1,
                        bgcolor:
                          selectedIcon === icon.name
                            ? alpha(theme.palette.primary.main, 0.2)
                            : 'transparent',
                        color:
                          selectedIcon === icon.name
                            ? theme.palette.primary.main
                            : 'inherit',
                        border:
                          selectedIcon === icon.name
                            ? `1px solid ${theme.palette.primary.main}`
                            : '1px solid rgba(255,255,255,0.1)',
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                        },
                      }}
                    >
                      {icon.component}
                    </IconButton>
                  ))}
                </Box>
              </Box>

              <TextField
                label='Текст статуса'
                value={statusText}
                onChange={handleStatusTextChange}
                fullWidth
                variant='outlined'
                margin='normal'
                helperText={`${statusText.length}/${maxLength} символов`}
                error={hasError}
                FormHelperTextProps={{
                  sx: {
                    display: 'flex',
                    justifyContent: 'space-between',
                  },
                }}
                InputProps={{
                  startAdornment: selectedIcon && (
                    <InputAdornment position='start'>
                      {
                        availableIcons.find(icon => icon.name === selectedIcon)
                          ?.component
                      }
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />

              {hasError && (
                <Typography color='error' variant='body2' sx={{ mb: 2 }}>
                  {errorMessage}
                </Typography>
              )}

              <Typography variant='subtitle2' sx={{ mt: 2, mb: 1 }}>
                Цвет статуса
              </Typography>

              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 1,
                  mb: 2,
                  mt: 1,
                  alignItems: 'center',
                }}
              >
                {presetColors.map(color => (
                  <Box
                    key={color}
                    onClick={() => handlePresetColorClick(color)}
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 'var(--avatar-border-radius)',
                      bgcolor: color,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      transform:
                        statusColor === color ? 'scale(1.2)' : 'scale(1)',
                      border:
                        statusColor === color
                          ? `2px solid white`
                          : '2px solid transparent',
                      boxShadow:
                        statusColor === color
                          ? `0 0 0 2px ${theme.palette.primary.main}, 0 0 10px rgba(0,0,0,0.2)`
                          : 'none',
                      '&:hover': {
                        transform: 'scale(1.1)',
                        boxShadow: '0 0 10px rgba(0,0,0,0.2)',
                      },
                    }}
                  />
                ))}

                {isUltimate && (
                  <Button
                    variant='outlined'
                    onClick={() => setCustomColorOpen(true)}
                    startIcon={<ColorizeIcon />}
                    sx={{
                      ml: 1,
                      borderColor: alpha(theme.palette.primary.main, 0.5),
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                      },
                    }}
                  >
                    Выбрать цвет с палитры
                  </Button>
                )}
              </Box>

              {isUltimate && (
                <Dialog
                  open={customColorOpen}
                  onClose={() => setCustomColorOpen(false)}
                  maxWidth='sm'
                  PaperProps={{
                    sx: {
                      bgcolor: 'var(--theme-background-full, rgba(255, 255, 255, 0.95))',
                      color: 'var(--theme-text-primary)',
                      borderRadius: 'var(--main-border-radius)',
                      boxShadow: theme.shadows[24],
                      '@media (max-width: 600px)': {
                        width: '100%',
                        maxWidth: '100%',
                        margin: 0,
                        borderRadius: 0,
                      },
                    },
                  }}
                >
                  <DialogTitle
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      pb: 2,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PaletteIcon fontSize='small' color='primary' />
                      <Typography variant='h6'>Выберите любой цвет</Typography>
                      <Chip label='Ultimate' size='small' color='secondary' />
                    </Box>
                    <IconButton
                      size='small'
                      onClick={() => setCustomColorOpen(false)}
                      color='inherit'
                    >
                      <CloseIcon fontSize='small' />
                    </IconButton>
                  </DialogTitle>

                  <DialogContent sx={{ pt: 3 }}>
                    <Box
                      sx={{
                        height: 100,
                        width: '100%',
                        backgroundColor: statusColor,
                        borderRadius: 'var(--main-border-radius)',
                        mb: 3,
                        boxShadow: `0 4px 20px ${alpha(statusColor, 0.5)}`,
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      }}
                    />

                    <input
                      type='color'
                      value={statusColor}
                      onChange={e => handlePresetColorClick(e.target.value)}
                      style={{
                        width: '100%',
                        height: 60,
                        border: 'none',
                        borderRadius: 8,
                        cursor: 'pointer',
                        background: 'none',
                      }}
                    />

                    <TextField
                      label='HEX код'
                      value={statusColor}
                      onChange={e => {
                        const value = e.target.value;
                        if (
                          value === '' ||
                          /^#([0-9A-F]{3}){1,2}$/i.test(value)
                        ) {
                          handlePresetColorClick(value || '#D0BCFF');
                        }
                      }}
                      fullWidth
                      margin='normal'
                      placeholder='#RRGGBB'
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position='start'>
                            <Box
                              sx={{
                                height: 16,
                                width: 16,
                                backgroundColor: statusColor,
                                borderRadius: 'var(--main-border-radius)',
                              }}
                            />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <Typography variant='subtitle2' sx={{ mt: 3, mb: 1 }}>
                      Предустановленные цвета
                    </Typography>

                    <Box
                      sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}
                    >
                      {[
                        '#000000',
                        '#FFFFFF',
                        '#F44336',
                        '#E91E63',
                        '#9C27B0',
                        '#673AB7',
                        '#3F51B5',
                        '#2196F3',
                        '#03A9F4',
                        '#00BCD4',
                        '#009688',
                        '#4CAF50',
                        '#8BC34A',
                        '#CDDC39',
                        '#FFEB3B',
                        '#FFC107',
                        '#FF9800',
                        '#FF5722',
                      ].map(presetColor => (
                        <Box
                          key={presetColor}
                          onClick={() => handlePresetColorClick(presetColor)}
                          sx={{
                            height: 32,
                            width: 32,
                            backgroundColor: presetColor,
                            borderRadius: 'var(--main-border-radius)',
                            cursor: 'pointer',
                            borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
                            transform:
                              statusColor === presetColor
                                ? 'scale(1.1)'
                                : 'scale(1)',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              transform: 'scale(1.1)',
                              boxShadow: '0 0 10px rgba(0,0,0,0.2)',
                            },
                          }}
                        />
                      ))}
                    </Box>
                  </DialogContent>

                  <DialogActions sx={{ p: 2, pt: 1 }}>
                    <Button
                      onClick={() => setCustomColorOpen(false)}
                      color='primary'
                      variant='contained'
                    >
                      Выбрать
                    </Button>
                  </DialogActions>
                </Dialog>
              )}

              <Box
                sx={{
                  mt: 1,
                  mb: 2,
                  p: 2,
                  borderRadius: 'var(--main-border-radius)',
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
                  borderColor: isUltimate
                    ? theme.palette.primary.main
                    : alpha(theme.palette.primary.main, 0.2),
                }}
              >
                <Typography
                  variant='body2'
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    color: theme.palette.primary.light,
                  }}
                >
                  <InfoIcon fontSize='small' sx={{ mr: 1 }} />
                  {isUltimate
                    ? 'С подпиской Ultimate или MAX вы можете выбрать любой цвет для вашего профиля!'
                    : 'Оформите подписку Ultimate или MAX, чтобы выбрать любой цвет для вашего профиля!'}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant='contained'
                  color='primary'
                  onClick={saveStatus}
                  disabled={isSaving}
                  startIcon={
                    isSaving ? <CircularProgress size={20} /> : <CheckIcon />
                  }
                  sx={{
                    borderRadius: 'var(--main-border-radius)',
                    py: 1,
                    px: 3,
                    minWidth: 140,
                  }}
                >
                  {isSaving ? 'Сохранение...' : 'Сохранить статус'}
                </Button>
              </Box>
            </>
          )}
        </>
      )}
    </Box>
  );
};

export default StatusForm;
