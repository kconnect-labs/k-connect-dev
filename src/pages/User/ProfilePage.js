import React, { useState, useEffect, useContext, useRef, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Container,
  Grid,
  Avatar,
  Paper,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Link as MuiLink,
} from '@mui/material';
import { AnimatePresence } from 'framer-motion';
import {
  Link,
  useParams,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import 'react-medium-image-zoom/dist/styles.css';
import { ThemeSettingsContext } from '../../App';
import { UsernameCard, VerificationBadge, Badge } from '../../UIKIT';
import { MaxIcon } from '../../components/icons/CustomIcons';
import InventoryItemCardPure from '../../UIKIT/InventoryItemCard';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useLanguage } from '../../context/LanguageContext';
// Импорты вынесенных компонентов
import {
  TabPanel,
  UpgradeEffects,
  UserStatus,
  InventoryTab,
  PostsFeed,
  WallFeed,
  EquippedItem,
  ProfileCard,
} from './ProfilePage/components';
import CreatePost from '../../components/CreatePost/CreatePost';
import { getLighterColor } from './ProfilePage/utils/colorUtils';

import { WallPostsTab, PostsTab } from './ProfilePage/components/TabComponents';
import ImageLightbox from './ProfilePage/components/ImageLightbox';
import { useLightbox } from './ProfilePage/hooks/useLightbox';
import ProfileSkeleton from './ProfilePage/components/ProfileSkeleton';
import UserNotFound from './ProfilePage/components/UserNotFound';
import ProfileInfo from './ProfilePage/components/ProfileInfo';
import { useTabs } from './ProfilePage/hooks/useTabs';
import { usePostActions } from './ProfilePage/hooks/usePostActions';
import UserBanInfo from './ProfilePage/components/UserBanInfo';
import UserScamBadge from './ProfilePage/components/UserScamBadge';
import UserSubscriptionBadge from './ProfilePage/components/UserSubscriptionBadge';
import { OwnedUsernames } from './ProfilePage/components';
import { ProfileAbout } from './ProfilePage/components';
import './ProfilePage.css';
import { getProfileMediaCache, setProfileMediaCache } from '../../utils/profileMediaCache';

const ProfilePage = () => {
  const { t } = useLanguage();
  const { username } = useParams();
  const { user: currentUser, isAuthenticated } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [ownedUsernames, setOwnedUsernames] = useState([]);
  const [equippedItems, setEquippedItems] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const { tabValue, setTabValue, handleTabChange } = useTabs();
  const [loading, setLoading] = useState(true);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [postsCount, setPostsCount] = useState(0);
  const [followers, setFollowers] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loadingFollowers, setLoadingFollowers] = useState(true);
  const [loadingFollowing, setLoadingFollowing] = useState(true);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [socials, setSocials] = useState([]);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const { themeSettings } = useContext(ThemeSettingsContext);
  const { setUserBackground, restoreUserBackground } =
    useContext(ThemeSettingsContext);
  const [stats, setStats] = useState({
    avg_likes_per_post: 0,
    days_active: 0,
    posts_count: 0,
    total_likes: 0,
  });

  const [isOnline, setIsOnline] = useState(false);
  const [lastActive, setLastActive] = useState(null);

  const [fallbackAvatarUrl, setFallbackAvatarUrl] = useState('');

  const [selectedUsername, setSelectedUsername] = useState(null);
  const [usernameCardAnchor, setUsernameCardAnchor] = useState(null);
  const [usernameCardOpen, setUsernameCardOpen] = useState(false);

  const [userBanInfo, setUserBanInfo] = useState(null);

  const [isCurrentUserModerator, setIsCurrentUserModerator] = useState(false);
  const [hasModeratorAccess, setHasModeratorAccess] = useState(false);
  const [isGrantingAccess, setIsGrantingAccess] = useState(false);
  const [lastModeratorCheck, setLastModeratorCheck] = useState(0);

  // Определяем isCurrentUser здесь, чтобы он был доступен во всех useEffect
  const isCurrentUser = currentUser && user && currentUser.username === user.username;

  const { lightboxIsOpen, currentImage, openLightbox, closeLightbox } =
    useLightbox();
  const { handlePostCreated } = usePostActions();

  const handleFollow = async () => {

    try {
      const response = await axios.post('/api/profile/follow', {
        followed_id: user.id,
      });

      if (response.data.success) {
        setFollowing(response.data.is_following);
        setFollowersCount(prev =>
          response.data.is_following ? prev + 1 : prev - 1
        );
      }
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
    }
  };

  // Функция для предоставления временного доступа модератора
  const handleGrantModeratorAccess = async () => {
    if (!user?.id || !isCurrentUserModerator) return;

    try {
      setIsGrantingAccess(true);
      const response = await axios.post('/api/moderator/private-profile/grant-access', {
        target_user_id: user.id,
        duration_hours: 24
      });

      if (response.data.success) {
        setHasModeratorAccess(true);
        // Перезагружаем профиль для обновления данных
        window.location.reload();
      }
    } catch (error) {
      console.error('Error granting moderator access:', error);
    } finally {
      setIsGrantingAccess(false);
    }
  };

  // Функция для отзыва временного доступа модератора
  const handleRevokeModeratorAccess = async () => {
    if (!user?.id || !isCurrentUserModerator) return;

    try {
      const response = await axios.post('/api/moderator/private-profile/revoke-access', {
        target_user_id: user.id
      });

      if (response.data.success) {
        setHasModeratorAccess(false);
        // Перезагружаем профиль для обновления данных
        window.location.reload();
      }
    } catch (error) {
      console.error('Error revoking moderator access:', error);
    }
  };

  // Проверяем статус модератора через quick-status
  const checkModeratorStatus = async () => {
    try {
      if (window._moderatorCheckInProgress) {
        console.log('Moderator check already in progress, skipping...');
        return;
      }

      const now = Date.now();
      if (now - lastModeratorCheck < 15 * 60 * 1000) {
        console.log('Using cached moderator status');
        return;
      }

      window._moderatorCheckInProgress = true;

      const response = await axios.get('/api/moderator/quick-status');
      if (response.data && response.data.is_moderator) {
        setIsCurrentUserModerator(true);
      } else {
        setIsCurrentUserModerator(false);
      }

      setLastModeratorCheck(now);
    } catch (error) {
      console.error('Error checking moderator status:', error);
      setIsCurrentUserModerator(false);
    } finally {
      window._moderatorCheckInProgress = false;
    }
  };

  // Проверяем временный доступ модератора при загрузке профиля
  const checkModeratorAccess = async () => {
    if (!user?.id || !isCurrentUserModerator) return;

    try {
      const response = await axios.get(`/api/moderator/private-profile/check-access?target_user_id=${user.id}`);
      setHasModeratorAccess(response.data.has_access || false);
    } catch (error) {
      console.error('Error checking moderator access:', error);
    }
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);

        const response = await axios.get(`/api/profile/${username}`);

        console.log('Profile achievement data:', {
          rootAchievement: response.data.achievement_data,
          userAchievement: response.data.user?.achievement,
        });

        if (response.data.user) {
          if (
            response.data.user.verification_status === undefined &&
            response.data.verification
          ) {
            response.data.user.verification_status =
              response.data.verification.status || null;
          }

          if (response.data.achievement) {
            response.data.user.achievement = response.data.achievement;
          }

          // Копируем connect_info из корневого объекта, если он есть
          if (response.data.connect_info) {
            response.data.user.connect_info = response.data.connect_info;
          }

          // Копируем is_friend из корневого объекта, если он есть
          if (response.data.is_friend !== undefined) {
            response.data.user.is_friend = response.data.is_friend;
          }

          // Копируем музыку из корневого объекта, если она есть
          if (response.data.music) {
            response.data.user.music = response.data.music;
          }

          // Копируем настройки приватности музыки из корневого объекта, если они есть
          if (response.data.music_privacy !== undefined) {
            response.data.user.music_privacy = response.data.music_privacy;
          }

          // Копируем настройки приватности инвентаря из корневого объекта, если они есть
          if (response.data.inventory_privacy !== undefined) {
            response.data.user.inventory_privacy = response.data.inventory_privacy;
          }

          if (response.data.musician_type !== undefined) {
            response.data.user.musician_type = response.data.musician_type;
          }

          // Копируем количество артистов из корневого объекта, если оно есть
          if (response.data.total_artists_count !== undefined) {
            response.data.user.total_artists_count = response.data.total_artists_count;
          }

          setUser(response.data.user);

          if (response.data.subscription) {
            response.data.user.subscription = response.data.subscription;
          } else if (response.data.user.subscription) {
          } else {
          }

          if (response.data.user.photos) {
            const photosData = Array.isArray(response.data.user.photos)
              ? response.data.user.photos
              : [];
            if (!deepEqual(photosData, photos)) {
              setPhotos(photosData);
            }
          } else {
            // Не очищаем, если фото уже есть
          }

          if (response.data.user.videos) {
            const videosData = Array.isArray(response.data.user.videos)
              ? response.data.user.videos
              : [];
            if (!deepEqual(videosData, videos)) {
              setVideos(videosData);
            }
          } else {
            // Не очищаем, если видео уже есть
          }

          if (response.data.user.followers_count !== undefined) {
            setFollowersCount(response.data.user.followers_count);
          }

          if (response.data.user.following_count !== undefined) {
            setFollowingCount(response.data.user.following_count);
          }

          if (response.data.user.is_following !== undefined) {
            setFollowing(response.data.user.is_following);
          } else if (response.data.is_following !== undefined) {
            setFollowing(response.data.is_following);
          }

          if (response.data.user.posts_count !== undefined) {
            setPostsCount(response.data.user.posts_count);
          } else if (response.data.posts_count !== undefined) {
            setPostsCount(response.data.posts_count);
          }

          if (response.data.socials) {
            setSocials(response.data.socials);
          }

          try {
            const usernamesResponse = await axios.get(
              `/api/username/purchased/${response.data.user.id}`
            );
            if (usernamesResponse.data.success) {
              const otherUsernames = usernamesResponse.data.usernames
                .filter(
                  item =>
                    !item.is_active &&
                    item.username !== response.data.user.username
                )
                .map(item => item.username);

              setOwnedUsernames(otherUsernames);
            }
          } catch (error) {
            console.error('Error fetching owned usernames:', error);
            setOwnedUsernames([]);
          }

          if (response.data.user.ban || response.data.ban) {
            setUserBanInfo(response.data.user.ban || response.data.ban);
          } else {
            setUserBanInfo(null);
          }

          // Проверяем статус модератора через quick-status
          await checkModeratorStatus();

          // Получаем надетые предметы из API профиля
          if (response.data.equipped_items) {
            if (!deepEqual(response.data.equipped_items, equippedItems)) {
              setEquippedItems(response.data.equipped_items);
            }
          } else {
            // Не очищаем, если уже есть айтемы
          }

          // === Сравниваем и обновляем кэш медиа ===
          try {
            const newMediaData = {
              banner_url: response.data.user.banner_url || null,
              avatar_url: response.data.user.avatar_url || null,
              photos: Array.isArray(response.data.user.photos) ? response.data.user.photos : [],
              videos: Array.isArray(response.data.user.videos) ? response.data.user.videos : [],
              equipped_items: response.data.equipped_items || [],
            };

            if (!mediaCache || JSON.stringify(newMediaData) !== JSON.stringify(mediaCache)) {
              setMediaCache(newMediaData);
              setProfileMediaCache(username, newMediaData);

              // Обновляем состояния, только если данные изменились
              setPhotos(newMediaData.photos);
              setVideos(newMediaData.videos);
              setEquippedItems(newMediaData.equipped_items);
            }
          } catch (cacheErr) {
            console.error('Media cache update error', cacheErr);
          }

        } else {
          console.error('User data not found in response', response.data);
          setUser(null);
        }
      } catch (error) {
        console.error('Error fetching profile', error);
        if (error.response && error.response.status === 404) {
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [username]);

  useEffect(() => {
    if (user && user.id) {
      setLoadingFollowers(true);
      setLoadingFollowing(true);
      setLoadingFriends(true);

      // Проверяем временный доступ модератора
      if (isCurrentUserModerator && user.is_private) {
        checkModeratorAccess();
      }



      axios
        .get(`/api/profile/${user.id}/followers`)
        .then(response => {
          if (response.data && response.data.followers) {
            const followersData = Array.isArray(response.data.followers)
              ? response.data.followers.filter(f => f && typeof f === 'object')
              : [];

            setFollowers(followersData);
          } else {
            console.warn('Нет данных о подписчиках в ответе API');
            setFollowers([]);
          }
        })
        .catch(error => {
          console.error('Ошибка загрузки подписчиков:', error);
          setFollowers([]);
        })
        .finally(() => {
          setLoadingFollowers(false);
        });

      axios
        .get(`/api/profile/${user.id}/following`)
        .then(response => {
          if (response.data && response.data.following) {
            const followingData = Array.isArray(response.data.following)
              ? response.data.following.filter(f => f && typeof f === 'object')
              : [];

            setFollowingList(followingData);
          } else {
            console.warn('Нет данных о подписках в ответе API');
            setFollowingList([]);
          }
        })
        .catch(error => {
          console.error('Ошибка загрузки подписок:', error);
          setFollowingList([]);
        })
        .finally(() => {
          setLoadingFollowing(false);
        });

      axios
        .get(`/api/profile/${user.id}/friends`)
        .then(response => {
          if (response.data && response.data.friends) {
            const friendsData = Array.isArray(response.data.friends)
              ? response.data.friends.filter(f => f && typeof f === 'object')
              : [];

            setFriends(friendsData);
          } else {
            console.warn('Нет данных о друзьях в ответе API');
            setFriends([]);
          }
        })
        .catch(error => {
          console.error('Ошибка загрузки друзей:', error);
          setFriends([]);
        })
        .finally(() => {
          setLoadingFriends(false);
        });
    }
  }, [user?.id]);

  useEffect(() => {
    if (!currentUser) {
      setUser(null);
    } else {
      // Проверяем статус модератора при загрузке компонента
      checkModeratorStatus();
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (user && user.id) {
          const response = await axios.get(`/api/profile/${user.id}/stats`);
          if (response.data) {
            setStats({
              avg_likes_per_post: response.data.avg_likes_per_post || 0,
              days_active: response.data.days_active || 0,
              posts_count: response.data.posts_count || 0,
              total_likes: response.data.total_likes || 0,
            });
          } else {
            setStats({
              avg_likes_per_post: 0,
              days_active: 0,
              posts_count: 0,
              total_likes: 0,
            });
          }
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
        setStats({
          avg_likes_per_post: 0,
          days_active: 0,
          posts_count: 0,
          total_likes: 0,
        });
      }
    };

    if (user && user.id) {
      fetchStats();
    }
  }, [user?.id]);

  const fetchOnlineStatus = async () => {
    try {
      if (!username) return;

      const response = await axios.get(
        `/api/profile/${username}/online_status`
      );

      if (response.data.success) {
        setIsOnline(response.data.is_online);
        setLastActive(response.data.last_active);
      }
    } catch (error) {
      console.error('Error fetching online status:', error);
    }
  };

  useEffect(() => {
    if (username) {
      fetchOnlineStatus();
    }
  }, [username]);

  useEffect(() => {
    if (user) {
      console.log('User state after setting:', {
        name: user.name,
        achievement: user.achievement,
        verification_status: user.verification_status,
      });
    }
  }, [user?.id]);

  // Применяем обои пользователя при загрузке профиля
  useEffect(() => {
    // Проверяем, что пользователь авторизован
    if (!isAuthenticated || !currentUser) {
      return;
    }

    // Если данные пользователя еще не загружены, не применяем обои
    if (!user || !user.username) {
      return;
    }

    // Проверяем, не это ли наш собственный профиль
    const isCurrentUserProfile =
      currentUser && currentUser.username === user.username;

    if (user.profile_background_url && !isCurrentUserProfile) {
      // Применяем обои только если это не наш профиль
      setUserBackground(user.profile_background_url);
    } else if (isCurrentUserProfile) {
      // Если это наш профиль, загружаем и применяем наши обои
      if (user.profile_background_url) {
        // Сохраняем обои пользователя в localStorage
        localStorage.setItem(
          'myProfileBackgroundUrl',
          user.profile_background_url
        );
        document.cookie = `myProfileBackgroundUrl=${encodeURIComponent(user.profile_background_url)};path=/;max-age=31536000`;
        // Применяем обои
        setUserBackground(user.profile_background_url);
      } else {
        restoreUserBackground();
      }
    } else if (user.profile_background_url) {
      // Если это чужой профиль и у него есть обои, применяем их без сохранения
      setUserBackground(user.profile_background_url);
    }
  }, [
    user?.username,
    user?.profile_background_url,
    currentUser?.username,
    setUserBackground,
    restoreUserBackground,
    isAuthenticated,
    currentUser,
  ]);

  // Восстанавливаем обои при уходе со страницы профиля
  useEffect(() => {
    return () => {
      // Восстанавливаем обои только при уходе со страницы профиля
      if (
        user &&
        user.username &&
        currentUser &&
        currentUser.username !== user.username
      ) {
        restoreUserBackground();
      }
    };
  }, []); // Пустой массив зависимостей - срабатывает только при размонтировании компонента

  const handleUsernameClick = (event, username) => {
    event.preventDefault();
    setSelectedUsername(username);
    setUsernameCardOpen(true);
  };

  const handleCloseUsernameCard = () => {
    setUsernameCardOpen(false);
  };

  // Функция для обновления надетых предметов
  const refreshEquippedItems = async () => {
    if (user?.id) {
      try {
        const response = await axios.get(
          `/api/inventory/user/${user.id}/equipped`
        );
        if (response.data.success) {
          setEquippedItems(response.data.equipped_items || []);
        }
      } catch (error) {
        console.error('Error refreshing equipped items:', error);
      }
    }
  };

  // Функция для обработки обновления позиции айтема
  const handleItemPositionUpdate = useCallback((itemId, newPosition) => {
    setEquippedItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId 
          ? { ...item, profile_position_x: newPosition.x, profile_position_y: newPosition.y }
          : item
      )
    );
  }, []);

  // Функция для активации режима редактирования
  const handleEditModeActivate = useCallback(() => {
    setIsEditMode(true);
  }, []);

  // Функция для сохранения позиций всех айтемов
  const handleSavePositions = useCallback(async () => {
    try {
      // Сохраняем позиции всех айтемов
      for (const item of equippedItems) {
        if (item.profile_position_x !== null && item.profile_position_y !== null) {
          await axios.post(`/api/inventory/item/${item.id}/position`, {
            position_x: item.profile_position_x,
            position_y: item.profile_position_y
          });
        }
      }
      setIsEditMode(false);
    } catch (error) {
      console.error('Error saving item positions:', error);
    }
  }, [equippedItems]);

  // Функция для отмены изменений
  const handleCancelEdit = useCallback(() => {
    // Перезагружаем айтемы с сервера, чтобы сбросить изменения
    refreshEquippedItems();
    setIsEditMode(false);
  }, [refreshEquippedItems]);

  // Проверяем, есть ли у пользователя настроенные айтемы
  const hasConfiguredItems = equippedItems.some(item => 
    item.profile_position_x !== null && item.profile_position_y !== null
  );

  // Проверяем, является ли текущий пользователь владельцем профиля
  const isOwnProfile = currentUser && user && currentUser.id === user.id;

  const [searchParams] = useSearchParams();
  const itemIdToOpen = searchParams.get('item');

  useEffect(() => {
    if (itemIdToOpen) {
      setTabValue(2);
    }
  }, [itemIdToOpen]);

  // Разделяем айтемы по уровням для разных компонентов
  const equippedItemsByLevel = useMemo(() => {
    const normalItems = []; // уровни 0 и 1
    const overlayItems = []; // уровни 2 и 3
    
    equippedItems.forEach(item => {
      const upgradeable = item.upgradeable;
      // Проверяем upgradeable (максимальный уровень улучшения)
      if (upgradeable === '0' || upgradeable === '1' || upgradeable === 0 || upgradeable === 1) {
        normalItems.push(item);
      } else if (upgradeable === '2' || upgradeable === '3' || upgradeable === 2 || upgradeable === 3) {
        overlayItems.push(item);
      }
    });
    

    
    return { normalItems, overlayItems };
  }, [equippedItems]);

  const equippedItemsPreview = useMemo(() => {
    // Только айтемы уровней 0 и 1 для превью под профилем
    return equippedItemsByLevel.normalItems.slice(0, 3);
  }, [equippedItemsByLevel]);

  const [mediaCache, setMediaCache] = useState(null);

  // Загружаем медиа из кеша при первой загрузке
  useEffect(() => {
    const loadCache = async () => {
      if (!username) return;
      try {
        const cache = await getProfileMediaCache(username);
        if (cache) {
          setMediaCache(cache);
          if (cache.photos) setPhotos(cache.photos);
          if (cache.videos) setVideos(cache.videos);
          if (cache.equipped_items) setEquippedItems(cache.equipped_items);
        }
      } catch (e) {
        console.error('Error loading media cache', e);
      }
    };
    loadCache();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  // utility deep compare
  const deepEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!user) {
    return <UserNotFound />;
  }



  return (
    <Container
      maxWidth='lg'
      sx={{
        pt: 0,
        pb: 4,
        px: 0,
        width: '100%',
        marginRight: 'auto',
        marginLeft: '0!important',
        paddingTop: '15px',
        paddingBottom: '40px',
        paddingLeft: '0',
        paddingRight: '0',
        minHeight: 'calc(100vh - 64px)',
        // Переопределяем стили Material-UI для отключения паддингов на всех экранах
        '@media (min-width: 0px)': {
          paddingLeft: '0 !important',
          paddingRight: '0 !important',
        },
        '@media (min-width: 600px)': {
          paddingLeft: '0 !important',
          paddingRight: '0 !important',
        },
        '@media (min-width: 700px)': {
          paddingLeft: '0 !important',
          paddingRight: '0 !important',
        },
        '@media (min-width: 900px)': {
          paddingLeft: '0 !important',
          paddingRight: '0 !important',
        },
      }}
    >
      <Grid
        container
        spacing={0.5}
        sx={{
          flexDirection: { xs: 'column', lg: 'row' },
          flexWrap: { xs: 'nowrap', lg: 'nowrap' },
          '& .MuiGrid-item': {
            order: { xs: 'unset', lg: user?.profile_id === 3 ? 'unset' : 'unset' },
          },
          '& .MuiGrid-item:first-of-type': {
            order: { xs: 1, lg: user?.profile_id === 3 ? 2 : 1 },
          },
          '& .MuiGrid-item:last-of-type': {
            order: { xs: 2, lg: user?.profile_id === 3 ? 1 : 2 },
          },
        }}
      >
        <Grid
          item
          xs={12}
          lg={5}
          sx={{
            position: { xs: 'static', lg: 'sticky' },
            top: '50px',
            height: 'fit-content',
            zIndex: 2,
          }}
        >
          <ProfileCard
            user={user}
            currentUser={currentUser}
            equippedItems={equippedItems}
            normalEquippedItems={equippedItemsByLevel.normalItems}
            overlayEquippedItems={equippedItemsByLevel.overlayItems}
            isOwnProfile={isOwnProfile}
            isEditMode={isEditMode}
            isOnline={isOnline}
            isCurrentUser={isCurrentUser}
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
          {/* Блок с кнопкой подписки */}
          {!isCurrentUser &&
            (!currentUser?.account_type ||
              currentUser.account_type !== 'channel') && (
            <Paper
              sx={{
                p: 1,
                borderRadius: '18px',
                background: 'var(--theme-background, rgba(255, 255, 255, 0.03))',
                backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
                WebkitBackdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
                border: '1px solid rgba(66, 66, 66, 0.5)',
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '2px',
              }}
            >
              <Button
                variant='contained'
                color='primary'
                startIcon={
                  following ? <PersonRemoveIcon /> : <PersonAddIcon />
                }
                onClick={handleFollow}
                fullWidth
                sx={{
                  borderRadius: '18px',
                  py: 1.2,
                  fontWeight: 'bold',
                  textTransform: 'none',
                  boxShadow:
                    user.status_color &&
                    user.status_text &&
                    user.subscription
                      ? `0 2px 8px ${user.status_color}40`
                      : '0 2px 8px rgba(208, 188, 255, 0.25)',
                  backgroundColor: following
                    ? 'rgba(255, 255, 255, 0.1)'
                    : user.status_color &&
                        user.status_text &&
                        user.subscription
                      ? user.status_color
                      : 'primary.main',
                  color: following ? 'text.primary' : '#fff',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: following
                      ? 'rgba(255, 255, 255, 0.15)'
                      : user.status_color &&
                          user.status_text &&
                          user.subscription
                        ? `${user.status_color}E6`
                        : 'primary.dark',
                    transform: 'translateY(-2px)',
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  },
                }}
              >
                {following
                  ? t('profile.actions.unfollow')
                  : t('profile.actions.follow')}
              </Button>
            </Paper>
          )}

          {/* Блок с кнопкой просмотра профиля для модераторов */}
          {!isCurrentUser && isCurrentUserModerator && user?.is_private && (
            <Paper
              sx={{
                p: 1,
                borderRadius: '18px',
                background: 'var(--theme-background, rgba(255, 255, 255, 0.03))',
                backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
                WebkitBackdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
                border: '1px solid rgba(0, 0, 0, 0.12)',
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '2px',
              }}
            >
              <Button
                variant={hasModeratorAccess ? 'outlined' : 'contained'}
                color={hasModeratorAccess ? 'warning' : 'secondary'}
                onClick={hasModeratorAccess ? handleRevokeModeratorAccess : handleGrantModeratorAccess}
                disabled={isGrantingAccess}
                fullWidth
                startIcon={
                  isGrantingAccess ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : hasModeratorAccess ? (
                    <PersonRemoveIcon />
                  ) : (
                    <VisibilityIcon />
                  )
                }
                sx={{
                  borderRadius: '18px',
                  py: 1.2,
                  fontWeight: 'bold',
                  textTransform: 'none',
                  backgroundColor: hasModeratorAccess 
                    ? 'rgba(255, 193, 7, 0.1)' 
                    : 'secondary.main',
                  color: hasModeratorAccess ? 'warning.main' : '#fff',
                  borderColor: hasModeratorAccess ? 'warning.main' : 'transparent',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: hasModeratorAccess 
                      ? 'rgba(255, 193, 7, 0.2)' 
                      : 'secondary.dark',
                    transform: 'translateY(-2px)',
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  },
                  '&:disabled': {
                    opacity: 0.6,
                  },
                }}
              >
                {isGrantingAccess 
                  ? 'Предоставление доступа...' 
                  : hasModeratorAccess 
                    ? 'Отозвать доступ' 
                    : 'Просмотреть профиль'}
              </Button>
            </Paper>
          )}
          
          {/* Блок с кнопками редактирования айтемов */}
          {isEditMode && (
            <Paper
              sx={{
                p: 1,
                borderRadius: '18px',
                background: 'var(--theme-background, rgba(255, 255, 255, 0.03))',
                backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
                WebkitBackdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
                boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
                border: '1px solid rgba(0, 0, 0, 0.12)',
                mb: 1,
                display: 'flex',
                gap: 2,
                justifyContent: 'center',
              }}
            >
              <Button
                variant="outlined"
                onClick={handleCancelEdit}
                sx={{
                  borderRadius: '18px',

                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'text.primary',
                  '&:hover': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  },
                }}
              >
                Отменить
              </Button>
              <Button
                variant="contained"
                onClick={handleSavePositions}
                sx={{
                  borderRadius: '18px',

                  backgroundColor: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                }}
              >
                Сохранить
              </Button>
            </Paper>
          )}
          
          {(user?.profile_id === 2 || user?.profile_id === 3) &&
            equippedItemsPreview &&
            equippedItemsPreview.length > 0 && (
              <Box
                sx={{
                  display: 'flex',
                  gap: 1,
                  justifyContent: 'flex-start',
                  width: '100%',
                }}
              >
                {equippedItemsPreview.map(item => (
                  <Box
                    key={item.id}
                    sx={{
                      width: 'calc((100% - 8px) / 3)',
                      aspectRatio: '1',
                      minWidth: 0,
                    }}
                  >
                    <InventoryItemCardPure
                      item={item}
                      style={{
                        width: '100%',
                        height: '100%',
                      }}
                      className='equipped-item-compact'
                    />
                  </Box>
                ))}
              </Box>
            )}
        </Grid>

        <Grid
          item
          xs={12}
          lg={7}
          sx={{
            pt: 0,
            ml: { xs: 0, lg: user?.profile_id === 3 ? 0 : '5px' },
            mr: { xs: 0, lg: user?.profile_id === 3 ? '5px' : 0 },
            mb: '100px',
            ...(tabValue === 2 && {
              height: '100vh',
            }),
          }}
        >
          <Paper
            sx={{
              borderRadius: '18px',
              background: 'var(--theme-background, rgba(255, 255, 255, 0.03))',
              backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
              WebkitBackdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
              boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
              overflow: 'hidden',
              mb: '5px',
              border: '1px solid rgba(66, 66, 66, 0.5)',
            }}
          >
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              indicatorColor='primary'
              variant='fullWidth'
              sx={{
                '& .MuiTab-root': {
                  color: theme =>
                    theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.7)'
                      : 'rgba(0, 0, 0, 0.7)',
                  '&.Mui-selected': {
                    color: theme => theme.palette.primary.main,
                  },
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: 'primary.main',
                },
              }}
            >
              <Tab label={t('profile.tabs.posts')} />
              <Tab label={t('profile.tabs.wall')} />
              {user?.inventory_privacy !== 1 && <Tab label='Инвентарь' />}
              <Tab label={t('profile.tabs.about')} />
            </Tabs>
          </Paper>

          <TabPanel value={tabValue} index={0} sx={{ p: 0, mt: 1 }}>
            {isCurrentUser && <CreatePost onPostCreated={handlePostCreated} sx={{ mb: 0.5 }}/>}

            <PostsTab
              userId={user?.id}
              statusColor={user?.status_color}
              PostsFeed={PostsFeed}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={1} sx={{ p: 0, mt: 1 }}>
            {currentUser &&
              (!currentUser.subscription ||
                currentUser.subscription.type !== 'channel') && (
                <CreatePost
                  onPostCreated={handlePostCreated}
                  postType='stena'
                  recipientId={user.id}
                  sx={{ mb: 0.5 }}
                />
              )}

            <WallPostsTab userId={user.id} WallFeed={WallFeed} />
          </TabPanel>

          {user?.inventory_privacy !== 1 && (
            <TabPanel value={tabValue} index={2} sx={{ p: 0, mt: 1 }}>
              <UpgradeEffects item={user}>
                <InventoryTab
                  userId={user?.id}
                  itemIdToOpen={itemIdToOpen}
                  equippedItems={equippedItems}
                  onEquippedItemsUpdate={refreshEquippedItems}
                  currentUserId={currentUser?.id}
                  user={user}
                />
              </UpgradeEffects>
            </TabPanel>
          )}

          <TabPanel value={tabValue} index={user?.inventory_privacy === 1 ? 2 : 3} sx={{ p: 0, mt: 1 }}>
            <ProfileInfo
              user={user}
              socials={socials}
              onUsernameClick={handleUsernameClick}
              stats={stats}
              currentUser={currentUser}
            />
          </TabPanel>
        </Grid>
      </Grid>

      <ImageLightbox
        isOpen={lightboxIsOpen}
        imageUrl={currentImage}
        onClose={closeLightbox}
      />

      <AnimatePresence>
        {selectedUsername && (
          <UsernameCard
            username={selectedUsername}
            onClose={handleCloseUsernameCard}
            open={usernameCardOpen}
          />
        )}
      </AnimatePresence>
    </Container>
  );
};

export default ProfilePage;
