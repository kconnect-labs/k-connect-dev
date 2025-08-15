import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  GlobalStyles,
  Grid,
  Dialog,
} from '@mui/material';
import {
  Person,
  Notifications,
  Palette,
  Security,
  PhotoCamera,
  Edit,
  Chat,
  Link,
  Science,
  Brush,
  AccountCircle,
  EmojiEvents,
  AlternateEmail,
  Favorite,
  Storage,
  Style,
  Gavel,
} from '@mui/icons-material';
import SettingsModal from './SettingsPage/components/SettingsModal';
import SuccessModal from './SettingsPage/components/SuccessModal';
import ProfilePreview from './SettingsPage/components/ProfilePreview';
import ProfileCard from './ProfilePage/components/ProfileCard';
import { useLanguage } from '../../context/LanguageContext';
import ConnectionsModal from './SettingsPage/components/ConnectionsModal';
import KonnectModal from './SettingsPage/components/KonnectModal';
import CacheManagementModal from './SettingsPage/components/CacheManagementModal';
import ThemeSettingsModal from './SettingsPage/components/ThemeSettingsModal';
import AccountStatusForm from './SettingsPage/components/AccountStatusForm';
import UniversalModal from '../../UIKIT/UniversalModal';
import {
  useProfile,
  useProfileInfo,
  useSubscription,
} from './SettingsPage/hooks';
import { useLocalUser } from './SettingsPage/hooks/useLocalUser';
import { AuthContext } from '../../context/AuthContext';


const SettingsPage = () => {
  const { t } = useLanguage();
  const { user, isAuthenticated } = useContext<any>(AuthContext);
  console.log('SettingsPage - AuthContext data:', { user, isAuthenticated });

  const localUser = useLocalUser();
  console.log('SettingsPage - LocalUser data:', localUser);

  const [openModal, setOpenModal] = useState<string | null>(null);
  const [connectionsModalOpen, setConnectionsModalOpen] = useState(false);
  const [konnectModalOpen, setKonnectModalOpen] = useState(false);
  const [cacheModalOpen, setCacheModalOpen] = useState(false);
  const [themeModalOpen, setThemeModalOpen] = useState(false);
  const [accountStatusModalOpen, setAccountStatusModalOpen] = useState(false);
  const [successModal, setSuccessModal] = useState<{
    open: boolean;
    message: string;
  }>({
    open: false,
    message: 'Обновлено',
  });

  const {
    profileData,
    loading,
    error,
    updateAvatar,
    updateBanner,
    deleteAvatar,
    deleteBanner,
    fetchProfile,
  } = useProfile();

  console.log('SettingsPage - useProfile data:', {
    profileData,
    loading,
    error,
  });



  const {
    profileInfo,
    loading: profileInfoLoading,
    error: profileInfoError,
    updateProfileInfo,
  } = useProfileInfo({
    name: (user || localUser)?.name || '',
    username: (user || localUser)?.username || '',
    about: (user || localUser)?.about || '',
  });

  const {
    subscription,
    loading: subscriptionLoading,
    error: subscriptionError,
    fetchSubscription,
  } = useSubscription();

  // Используем данные из AuthContext или localStorage как fallback
  // Объединяем с данными профиля для превью
  const [displayUser, setDisplayUser] = useState(() => ({
    ...(user || localUser),
  }));

  const [settings, setSettings] = useState<any>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  
  // Состояния для ProfileCard (как в ProfilePage.js)
  const [ownedUsernames, setOwnedUsernames] = useState<string[]>([]);
  const [equippedItems, setEquippedItems] = useState<any[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [following, setFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [postsCount, setPostsCount] = useState(0);
  const [isOnline, setIsOnline] = useState(false);
  const [fallbackAvatarUrl, setFallbackAvatarUrl] = useState('');
  const [userBanInfo, setUserBanInfo] = useState<any>(null);
  const [isCurrentUserModerator, setIsCurrentUserModerator] = useState(false);
  const [selectedUsername, setSelectedUsername] = useState<string | null>(null);
  const [usernameCardOpen, setUsernameCardOpen] = useState(false);

  useEffect(() => {
    console.log(
      'SettingsPage useEffect - isAuthenticated:',
      isAuthenticated,
      'user:',
      user,
      'localUser:',
      localUser,
      'profileData:',
      profileData
    );
    const currentUser = user || localUser;
    if (currentUser && currentUser.username) {
      fetchProfile(currentUser.username);
      fetchSettings();
      fetchProfileData(currentUser.username);
    }
  }, [isAuthenticated, user?.username, localUser?.username, fetchProfile]);



  // Загрузка данных профиля для превью
  const fetchProfileData = async (username: string) => {
    try {
      const response = await fetch(`/api/profile/${username}`);
      const data = await response.json();
      
      console.log('Profile API data for preview:', data);
      
      if (data.user) {
        // Полностью заменяем displayUser данными из API
        const updatedDisplayUser = {
          ...data.user,
          // Копируем данные из корневого объекта
          connect_info: data.connect_info || data.user.connect_info,
          is_friend: data.is_friend !== undefined ? data.is_friend : data.user.is_friend,
          subscription: data.subscription || data.user.subscription,
          achievement: data.achievement || data.user.achievement,
          verification_status: data.verification?.status || data.user.verification_status,
        };
        
        setDisplayUser(updatedDisplayUser);
        
        setFollowersCount(data.user.followers_count || 0);
        setFollowingCount(data.user.following_count || 0);
        setPostsCount(data.user.posts_count || 0);
        setFollowing(data.user.is_following || false);
        setUserBanInfo(data.user.ban || data.ban || null);
        
        // Загружаем owned usernames
        if (data.user.id) {
          try {
            const usernamesResponse = await fetch(`/api/username/purchased/${data.user.id}`);
            const usernamesData = await usernamesResponse.json();
            if (usernamesData.success) {
              const otherUsernames = usernamesData.usernames
                .filter((item: any) => !item.is_active && item.username !== data.user.username)
                .map((item: any) => item.username);
              setOwnedUsernames(otherUsernames);
            }
          } catch (error) {
            console.error('Error fetching owned usernames:', error);
          }
        }
        
        // Загружаем equipped items
        if (data.equipped_items) {
          setEquippedItems(data.equipped_items);
        }

        // Загружаем онлайн статус
        try {
          const onlineResponse = await fetch(`/api/profile/${username}/online_status`);
          const onlineData = await onlineResponse.json();
          if (onlineData.success) {
            setIsOnline(onlineData.is_online);
          }
        } catch (error) {
          console.error('Error fetching online status:', error);
        }

        // Загружаем статус модератора
        try {
          const moderatorResponse = await fetch('/api/moderator/quick-status');
          const moderatorData = await moderatorResponse.json();
          if (moderatorData && moderatorData.is_moderator) {
            setIsCurrentUserModerator(true);
          } else {
            setIsCurrentUserModerator(false);
          }
        } catch (error) {
          console.error('Error checking moderator status:', error);
          setIsCurrentUserModerator(false);
        }
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    }
  };

  // Показываем загрузку если пользователь еще не загружен
  if (!isAuthenticated && !localUser) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: { xs: 1, sm: 2 },
        }}
      >
        <Typography variant='h6' sx={{ color: 'var(--theme-text-primary)' }}>
          Загрузка...
        </Typography>
      </Box>
    );
  }

  const handleOpenModal = (section: string) => {
    if (section === 'connections') {
      setKonnectModalOpen(true);
    } else if (section === 'linked') {
      setConnectionsModalOpen(true);
    } else if (section === 'cache') {
      setCacheModalOpen(true);
    } else if (section === 'theme') {
      setThemeModalOpen(true);
    } else if (section === 'account-status') {
      setAccountStatusModalOpen(true);
    } else {
      setOpenModal(section);
    }
  };

  const handleCloseModal = () => {
    setOpenModal(null);
  };

  const showSuccess = (message: string = 'Обновлено') => {
    setSuccessModal({ open: true, message });
    // Обновляем превью при любом успешном изменении
    setTimeout(() => {
      updatePreview();
    }, 100); // Небольшая задержка для обновления данных
  };

  const hideSuccess = () => {
    setSuccessModal({ open: false, message: 'Обновлено' });
  };

  const handleAvatarChange = async (file: File) => {
    try {
      await updateAvatar(file);
      await fetchProfile(); // Обновляем данные профиля
      // Обновляем превью
      updatePreview();
    } catch (err) {
      console.error('Failed to update avatar:', err);
    }
  };

  const handleBannerChange = async (file: File) => {
    try {
      await updateBanner(file);
      await fetchProfile(); // Обновляем данные профиля
      // Обновляем превью
      updatePreview();
    } catch (err) {
      console.error('Failed to update banner:', err);
    }
  };

  const handleAvatarDelete = async () => {
    try {
      await deleteAvatar();
      await fetchProfile(); // Обновляем данные профиля
      // Обновляем превью
      updatePreview();
    } catch (err) {
      console.error('Failed to delete avatar:', err);
    }
  };

  const handleBannerDelete = async () => {
    try {
      await deleteBanner();
      await fetchProfile(); // Обновляем данные профиля
      // Обновляем превью
      updatePreview();
    } catch (err) {
      console.error('Failed to delete banner:', err);
    }
  };

  const handleSaveProfileInfo = async (info: {
    name: string;
    username: string;
    about: string;
  }) => {
    try {
      await updateProfileInfo(info);
      await fetchProfile(); // Обновляем данные профиля
      // Обновляем превью
      updatePreview();
      showSuccess('Информация обновлена');
    } catch (err) {
      console.error('Failed to update profile info:', err);
    }
  };

  const handleStatusUpdate = async (statusData: any) => {
    try {
      await fetchProfile(); // Обновляем данные профиля
      // Обновляем превью
      updatePreview();
      showSuccess('Статус обновлен');
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleError = (message: string) => {
    console.error('Settings error:', message);
    // Можно добавить показ ошибки пользователю
  };

  // Функция для обновления превью профиля
  const updatePreview = () => {
    if (displayUser?.username) {
      fetchProfileData(displayUser.username);
    }
  };

  // Функции для ProfileCard (как в ProfilePage.js)
  const handleItemPositionUpdate = useCallback((itemId: number, newPosition: { x: number; y: number }) => {
    setEquippedItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId 
          ? { ...item, profile_position_x: newPosition.x, profile_position_y: newPosition.y }
          : item
      )
    );
  }, []);

  const handleEditModeActivate = useCallback(() => {
    setIsEditMode(true);
  }, []);

  const handleUsernameClick = useCallback((event: React.MouseEvent, username: string) => {
    event.preventDefault();
    setSelectedUsername(username);
    setUsernameCardOpen(true);
  }, []);

  const handleCloseUsernameCard = useCallback(() => {
    setUsernameCardOpen(false);
  }, []);

  const openLightbox = useCallback((imageUrl: string) => {
    // Простая реализация для превью
    console.log('Open lightbox:', imageUrl);
  }, []);

  const getLighterColor = useCallback((color: string) => {
    // Простая реализация для превью
    return color;
  }, []);



  const fetchSettings = async () => {
    try {
      setSettingsLoading(true);
      const response = await fetch('/api/profile/settings');
      const data = await response.json();
      if (data.success) {
        setSettings(data.settings);
      }
    } catch (error) {
    } finally {
      setSettingsLoading(false);
    }
  };

  const settingsSections = [
    {
      id: 'profile',
      title: 'Профиль',
      subtitle: 'Аватар, баннер',
      icon: <Person />,
      color: 'rgba(99, 101, 241, 0.66)', // #6366f1 с прозрачностью
    },
    {
      id: 'info',
      title: 'Основная информация',
      subtitle: 'Имя, юзернейм, описание',
      icon: <Edit />,
      color: 'rgba(139, 92, 246, 0.66)', // #8b5cf6 с прозрачностью
    },
    {
      id: 'status',
      title: 'Статусы',
      subtitle: 'Настройка статуса профиля',
      icon: <Chat />,
      color: 'rgba(6, 182, 212, 0.66)', // #06b6d4 с прозрачностью
    },
    {
      id: 'customization',
      title: 'Кастомизация',
      subtitle: 'Обои, цвета, декорации',
      icon: <Brush />,
      color: 'rgba(236, 72, 153, 0.66)', // #ec4899 с прозрачностью
    },
    {
      id: 'theme',
      title: 'Тема интерфейса',
      subtitle: 'Множество тем для интерфейса',
      icon: <Style />,
      color: 'rgba(168, 85, 247, 0.66)', // #a855f7 с прозрачностью
    },
    {
      id: 'badges',
      title: 'Бейджи',
      subtitle: 'Управление достижениями',
      icon: <EmojiEvents />,
      color: 'rgba(255, 193, 7, 0.66)', // #ffc107 с прозрачностью
    },
    {
      id: 'socials',
      title: 'Социальные сети',
      subtitle: 'Ссылки на социальные сети',
      icon: <Link />,
      color: 'rgba(16, 185, 129, 0.66)', // #10b981 с прозрачностью
    },
    {
      id: 'notifications',
      title: 'Уведомления',
      subtitle: 'Настройки уведомлений и оповещений',
      icon: <Notifications />,
      color: 'rgba(16, 185, 129, 0.66)', // #10b981 с прозрачностью
    },
    {
      id: 'cache',
      title: 'Управление кешем',
      subtitle: 'Очистка и управление хранилищем',
      icon: <Storage />,
      color: 'rgba(76, 175, 80, 0.66)', // #4caf50 с прозрачностью
    },
    {
      id: 'security',
      title: 'Безопасность',
      subtitle: 'Данные входа и защита аккаунта',
      icon: <Security />,
      color: 'rgba(239, 68, 68, 0.66)', // #ef4444 с прозрачностью
    },
    {
      id: 'account-status',
      title: 'Состояние аккаунта',
      subtitle: 'Предупреждения, баны и апелляции',
      icon: <Gavel />,
      color: 'rgba(245, 158, 11, 0.66)', // #f59e0b с прозрачностью
    },
    {
      id: 'experimental',
      title: 'Экспериментальные функции',
      subtitle: 'Функции в разработке',
      icon: <Science />,
      color: 'rgba(168, 85, 247, 0.66)', // #a855f7 с прозрачностью
    },
    {
      id: 'connections',
      title: 'Коннектики',
      subtitle: 'Поиск и управление связями',
      icon: <Favorite />,
      color: 'rgba(236, 72, 153, 0.66)', // #ec4899 с прозрачностью
    },
    {
      id: 'linked',
      title: 'Связанные аккаунты',
      subtitle: 'Telegram, Element и другие',
      icon: <AccountCircle />,
      color: 'rgba(59, 130, 246, 0.66)', // #3b82f6 с прозрачностью
    },
    
    {
      id: 'sessions',
      title: 'Сессии',
      subtitle: 'Управление сессиями',
      icon: <Security />,
      color: 'rgba(245, 158, 11, 0.66)', // #f59e0b с прозрачностью
    },
    {
      id: 'usernames',
      title: 'Магазин юзернеймов',
      subtitle: 'Покупка и управление юзернеймами',
      icon: <AlternateEmail />,
      color: 'rgba(156, 39, 176, 0.66)', // #9c27b0 с прозрачностью
    },

  ];

  return (
    <>
      <GlobalStyles
        styles={{
          '@keyframes pulse': {
            '0%': {
              transform: 'scale(1)',
              boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
            },
            '50%': {
              transform: 'scale(1.05)',
              boxShadow: '0 6px 20px rgba(76, 175, 80, 0.4)',
            },
            '100%': {
              transform: 'scale(1)',
              boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
            },
          },
        }}
      />
      <Box
        sx={{
          minHeight: '100vh',
          mb: 12,
          paddingTop: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography
          variant='h6'
          className="theme-aware"
          sx={{
            color: 'var(--theme-text-primary)',
            mb: 1,
            mt: 1,
            padding: '8px 12px',
            width: '100%',
            maxWidth: 1400,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 1,
          }}
        >
          Настройки
        </Typography>

        <Grid
          container
          spacing={0.5}
          sx={{
            flexDirection: { xs: 'column', lg: 'row' },
            flexWrap: { xs: 'nowrap', lg: 'nowrap' },
          }}
        >
          {/* Левая колонка - список настроек */}
          <Grid item xs={12} lg={7} sx={{ order: { xs: 1, lg: 1 } }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {settingsSections.map(section => (
                <Button
                  key={section.id}
                  onClick={() => handleOpenModal(section.id)}
                  className="theme-aware"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    padding: '12px 16px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 1,
                    color: 'var(--theme-text-primary)',
                    textTransform: 'none',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      transform: 'translateY(-1px)',
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 40,
                      height: 40,
                      borderRadius: 1,
                      background: section.color,
                      marginRight: 2,
                      flexShrink: 0,
                    }}
                  >
                    {section.icon}
                  </Box>

                  <Box sx={{ textAlign: 'left', flex: 1 }}>
                    <Typography
                      variant='h6'
                      sx={{
                        fontSize: '1rem',
                        fontWeight: 600,
                        marginBottom: 0.5,
                        color: 'var(--theme-text-primary)',
                      }}
                    >
                      {section.title}
                    </Typography>
                    <Typography
                      variant='body2'
                      sx={{
                        color: 'var(--theme-text-secondary)',
                        fontSize: '0.875rem',
                      }}
                    >
                      {section.subtitle}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 24,
                      height: 24,
                      borderRadius: 1,
                      background: 'rgba(255, 255, 255, 0.1)',
                      marginLeft: 1,
                    }}
                  >
                    <Edit
                      sx={{ fontSize: 16, color: 'var(--theme-text-secondary)' }}
                    />
                  </Box>
                </Button>
              ))}
            </Box>
          </Grid>

          {/* Правая колонка - превью профиля (только для десктопа) */}
          <Grid
            item
            xs={12}
            lg={5}
            sx={{
              position: { xs: 'static', lg: 'sticky' },
              top: '50px',
              height: 'fit-content',
              zIndex: 2,
              order: { xs: 2, lg: 2 },
              display: { xs: 'none', lg: 'block' },
            }}
          >
            <ProfileCard
                user={displayUser}
                currentUser={displayUser}
                equippedItems={equippedItems}
                isOwnProfile={true}
                isEditMode={isEditMode}
                isOnline={isOnline}
                isCurrentUser={true}
                isCurrentUserModerator={isCurrentUserModerator}
                postsCount={postsCount}
                followersCount={followersCount}
                followingCount={followingCount}
                ownedUsernames={ownedUsernames}
                userBanInfo={userBanInfo}
                fallbackAvatarUrl={fallbackAvatarUrl}
                t={t}
                getLighterColor={getLighterColor}
                openLightbox={openLightbox}
                setFallbackAvatarUrl={setFallbackAvatarUrl}
                handleItemPositionUpdate={handleItemPositionUpdate}
                handleEditModeActivate={handleEditModeActivate}
                handleUsernameClick={handleUsernameClick}
              />
          </Grid>
        </Grid>

        <SettingsModal
          open={openModal !== null}
          onClose={handleCloseModal}
          activeSection={openModal}
          profileData={profileData}
          onAvatarChange={handleAvatarChange}
          onBannerChange={handleBannerChange}
          onAvatarDelete={handleAvatarDelete}
          onBannerDelete={handleBannerDelete}
          onSaveProfileInfo={handleSaveProfileInfo}
          profileInfo={profileInfo}
          loading={
            loading ||
            profileInfoLoading ||
            subscriptionLoading ||
            settingsLoading
          }
          subscription={subscription}
          settings={settings}
          onStatusUpdate={handleStatusUpdate}
          onSuccess={showSuccess}
          onError={handleError}

        />

        <ConnectionsModal
          open={connectionsModalOpen}
          onClose={() => setConnectionsModalOpen(false)}
          onSuccess={showSuccess}
        />

        <KonnectModal
          open={konnectModalOpen}
          onClose={() => setKonnectModalOpen(false)}
          onSuccess={showSuccess}
        />

        <CacheManagementModal
          open={cacheModalOpen}
          onClose={() => setCacheModalOpen(false)}
        />

        <ThemeSettingsModal
          open={themeModalOpen}
          onClose={() => setThemeModalOpen(false)}
          onSuccess={showSuccess}
        />

        <UniversalModal
          open={accountStatusModalOpen}
          onClose={() => setAccountStatusModalOpen(false)}
          title="Состояние аккаунта"
          maxWidth="md"
          fullWidth
          maxWidthCustom={'800px'}
        >
          <AccountStatusForm onClose={() => setAccountStatusModalOpen(false)} />
        </UniversalModal>

        <SuccessModal
          open={successModal.open}
          onClose={hideSuccess}
          message={successModal.message}
        />


      </Box>
    </>
  );
};

export default SettingsPage;
