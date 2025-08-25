import React, { useState, useEffect, Suspense, lazy } from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';

// Ленивая загрузка компонентов с мемоизацией
const ProfileUploader = lazy(() => import('./ProfileUploader'));
const ProfileInfoForm = lazy(() => import('./ProfileInfoForm'));
const StatusForm = lazy(() => import('./StatusForm'));
const NotificationsForm = lazy(() => import('./NotificationsForm'));
const SocialLinksForm = lazy(() => import('./SocialLinksForm'));
const ExperimentalFeaturesForm = lazy(
  () => import('./ExperimentalFeaturesForm')
);
const CustomizationForm = lazy(() => import('./CustomizationForm'));
const SessionsForm = lazy(() => import('./SessionsForm'));
const LinkedAccountsForm = lazy(() => import('./LinkedAccountsForm'));
const BadgesForm = lazy(() => import('./BadgesForm'));
const SecurityForm = lazy(() => import('./SecurityForm'));
const UsernamesForm = lazy(() => import('./UsernamesForm'));
const PrivacyForm = lazy(() => import('./PrivacyForm'));

// Компонент загрузки
const LoadingFallback = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 200,
      p: 3,
    }}
  >
    <CircularProgress size={40} />
  </Box>
);

// Компонент статистики загрузки (только в режиме разработки)
const LoadingStats = () => {
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'var(--theme-text-primary)',
        padding: 1,
        borderRadius: 1,
        fontSize: '12px',
        zIndex: 9999,
      }}
    >
      ⚡ Ленивая загрузка активна
    </Box>
  );
};

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  activeSection?: string | null;
  profileData?: any;
  onAvatarChange?: (file: File) => void;
  onBannerChange?: (file: File) => void;
  onAvatarDelete?: () => void;
  onBannerDelete?: () => void;
  onSaveProfileInfo?: (info: any) => Promise<void>;
  profileInfo?: any;
  loading?: boolean;
  subscription?: any;
  settings?: any;
  onStatusUpdate?: (statusData: any) => void;
  onSuccess?: () => void;
  onError?: (message: string) => void;
}

type Section =
  | 'main'
  | 'avatar'
  | 'info'
  | 'profile'
  | 'notifications'
  | 'appearance'
  | 'security'
  | 'status'
  | 'socials'
  | 'experimental'
  | 'customization'
  | 'sessions'
  | 'linked'
  | 'badges'
  | 'usernames'
  | 'privacy';

const SettingsModal: React.FC<SettingsModalProps> = ({
  open,
  onClose,
  activeSection,
  profileData,
  onAvatarChange,
  onBannerChange,
  onAvatarDelete,
  onBannerDelete,
  onSaveProfileInfo,
  profileInfo,
  loading,
  subscription,
  settings,
  onStatusUpdate,
  onSuccess,
  onError,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [currentSection, setCurrentSection] = useState<Section>('main');

  // Set initial section based on activeSection prop
  useEffect(() => {
    if (activeSection) {
      setCurrentSection(activeSection as Section);

      if (activeSection === 'profile' || activeSection === 'info') {
      }
    }
  }, [activeSection]);

  const handleClose = () => {
    onClose();
  };

  const modalStyle = {
    background: 'var(--theme-background, rgba(255, 255, 255, 0.03))',
    backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: isMobile ? 0 : '16px',
    maxWidth: activeSection === 'usernames' ? '800px' : '550px',
    width: '100%',
    maxHeight: isMobile ? '100vh' : '90vh',
    margin: isMobile ? 0 : 'auto',
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    background: 'var(--theme-background, rgba(255, 255, 255, 0.02))',
    backdropFilter: 'var(--theme-backdrop-filter, blur(10px))',
  };

  const renderContent = () => {
    switch (currentSection) {
      case 'profile':
      case 'avatar':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <ProfileUploader
              currentAvatar={profileData?.avatar}
              currentBanner={profileData?.banner}
              onAvatarChange={onAvatarChange}
              onBannerChange={onBannerChange}
              onAvatarDelete={onAvatarDelete}
              onBannerDelete={onBannerDelete}
            />
          </Suspense>
        );
      case 'info':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <ProfileInfoForm
              profileInfo={profileInfo}
              onSave={onSaveProfileInfo}
              loading={loading}
              onSuccess={onSuccess}
              subscription={subscription}
              settings={settings}
              onError={onError}
            />
          </Suspense>
        );
      case 'status':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <StatusForm
              profileData={profileData}
              subscription={subscription}
              onStatusUpdate={onStatusUpdate}
              loading={loading}
              onSuccess={onSuccess}
            />
          </Suspense>
        );
      case 'socials':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <SocialLinksForm profileData={profileData} onSuccess={onSuccess} />
          </Suspense>
        );
      case 'experimental':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <ExperimentalFeaturesForm onSuccess={onSuccess} />
          </Suspense>
        );
      case 'customization':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <CustomizationForm
              profileData={profileData}
              subscription={subscription}
              onSuccess={onSuccess}
            />
          </Suspense>
        );
      case 'sessions':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <SessionsForm onSuccess={onSuccess} />
          </Suspense>
        );
      case 'linked':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <LinkedAccountsForm
              profileData={profileData}
              onSuccess={onSuccess}
            />
          </Suspense>
        );
      case 'badges':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <BadgesForm onSuccess={onSuccess} />
          </Suspense>
        );
      case 'usernames':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <UsernamesForm onSuccess={onSuccess} />
          </Suspense>
        );
      case 'notifications':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <NotificationsForm onSuccess={onSuccess} />
          </Suspense>
        );
      case 'appearance':
        return (
          <Box sx={{ p: 2 }}>
            <Typography variant='h6' sx={{ mb: 2, color: 'var(--theme-text-primary)' }}>
              Настройки внешнего вида
            </Typography>
            <Typography variant='body2' sx={{ color: 'var(--theme-text-secondary)' }}>
              Раздел внешнего вида находится в разработке
            </Typography>
          </Box>
        );
      case 'security':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <SecurityForm onSuccess={onSuccess} />
          </Suspense>
        );
      case 'privacy':
        return (
          <Suspense fallback={<LoadingFallback />}>
            <PrivacyForm onSuccess={onSuccess} />
          </Suspense>
        );
      default:
        return null;
    }
  };

  const getSectionTitle = () => {
    switch (currentSection) {
      case 'profile':
      case 'avatar':
        return 'Фото профиля';
      case 'info':
        return 'Основная информация';
      case 'status':
        return 'Статусы';
      case 'socials':
        return 'Социальные сети';
      case 'experimental':
        return 'Экспериментальные функции';
      case 'customization':
        return 'Кастомизация';
      case 'sessions':
        return 'Сессии';
      case 'linked':
        return 'Связанные аккаунты';
      case 'badges':
        return 'Бейджи';
      case 'usernames':
        return 'Магазин юзернеймов';
      case 'notifications':
        return 'Уведомления';
      case 'appearance':
        return 'Внешний вид';
      case 'security':
        return 'Безопасность';
      case 'privacy':
        return 'Приватность';
      default:
        return 'Настройки профиля';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={false}
      PaperProps={{
        sx: modalStyle,
      }}
      fullScreen={isMobile}
    >
      <Box sx={headerStyle}>
        {isMobile ? (
          <IconButton onClick={handleClose} sx={{ color: 'var(--theme-text-primary)' }}>
            <ArrowBackIcon />
          </IconButton>
        ) : (
          <Box sx={{ width: 40 }} />
        )}

        <Typography
          variant='h6'
          sx={{ fontWeight: 600, color: 'var(--theme-text-primary)' }}
        >
          {getSectionTitle()}
        </Typography>

        <IconButton onClick={handleClose} sx={{ color: 'var(--theme-text-primary)' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: isMobile ? 2 : 3, overflow: 'auto' }}>
        {renderContent()}
      </DialogContent>
      <LoadingStats />
    </Dialog>
  );
};

export default SettingsModal;
