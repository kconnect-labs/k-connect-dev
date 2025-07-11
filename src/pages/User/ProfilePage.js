import React, { useState, useEffect, useContext } from 'react';
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
import { Link, useParams, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import 'react-medium-image-zoom/dist/styles.css';
import { ThemeSettingsContext } from '../../App';
import { UsernameCard, VerificationBadge, Badge } from '../../UIKIT';
import InventoryItemCardPure from '../../UIKIT/InventoryItemCard';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import { useLanguage } from '../../context/LanguageContext';
// Импорты вынесенных компонентов
import { 
  CreatePost, 
  TabPanel, 
  SubscriptionBadge,
  UpgradeEffects,
  UserStatus,
  InventoryTab,
  PostsFeed, 
  WallFeed, 
  EquippedItem 
} from './ProfilePage/components';
import { getLighterColor } from './ProfilePage/utils/colorUtils';
import { requireAuth } from './ProfilePage/utils/authUtils';

import { WallPostsTab, PostsTab } from './ProfilePage/components/TabComponents';
import ImageLightbox from './ProfilePage/components/ImageLightbox';
import { useLightbox } from './ProfilePage/hooks/useLightbox';
import ProfileLoader from './ProfilePage/components/ProfileLoader';
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



const ProfilePage = () => {
  const { t } = useLanguage();
  const { username } = useParams();
  const { user: currentUser, isAuthenticated } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [ownedUsernames, setOwnedUsernames] = useState([]);
  const [equippedItems, setEquippedItems] = useState([]);
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
  const { themeSettings, setProfileBackground, clearProfileBackground, globalProfileBackgroundEnabled } = useContext(ThemeSettingsContext);
  const [totalLikes, setTotalLikes] = useState(0);
  
  const [isOnline, setIsOnline] = useState(false);
  const [lastActive, setLastActive] = useState(null);
  
  const [fallbackAvatarUrl, setFallbackAvatarUrl] = useState('');
  

  
  const [selectedUsername, setSelectedUsername] = useState(null);
  const [usernameCardAnchor, setUsernameCardAnchor] = useState(null);
  const [usernameCardOpen, setUsernameCardOpen] = useState(false);
  

  const [userBanInfo, setUserBanInfo] = useState(null);
  

  const [isCurrentUserModerator, setIsCurrentUserModerator] = useState(false);
  
  const { lightboxIsOpen, currentImage, openLightbox, closeLightbox } = useLightbox();
  const { handlePostCreated } = usePostActions();
  
  const handleFollow = async () => {
    if (!requireAuth(currentUser, isAuthenticated, navigate)) {
      return;
    }
    
    try {
      const response = await axios.post('/api/profile/follow', {
        followed_id: user.id
      });
      
      if (response.data.success) {
        setFollowing(response.data.is_following);
        setFollowersCount(prev => response.data.is_following ? prev + 1 : prev - 1);
      }
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
    }
  };
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        console.log(`Fetching profile for username: ${username}`);
        
        const response = await axios.get(`/api/profile/${username}`);
        console.log("Profile API response:", response.data);
        
        
        console.log("Profile achievement data:", {
          rootAchievement: response.data.achievement_data,
          userAchievement: response.data.user?.achievement
        });
        
        
        if (response.data.user) {
          
          if (response.data.user.verification_status === undefined && response.data.verification) {
            response.data.user.verification_status = response.data.verification.status || null;
          }
          
          
          if (response.data.achievement) {
            response.data.user.achievement = response.data.achievement;
            console.log('Copied achievement data from root to user object:', response.data.achievement);
          }
          
          // Копируем connect_info из корневого объекта, если он есть
          if (response.data.connect_info) {
            response.data.user.connect_info = response.data.connect_info;
            console.log('Copied connect_info from root to user object:', response.data.connect_info);
          }
          
          setUser(response.data.user);
          
          
          if (response.data.user.total_likes !== undefined) {
            setTotalLikes(response.data.user.total_likes);
          }
          
          
          if (response.data.subscription) {
            response.data.user.subscription = response.data.subscription;
            console.log('Subscription data found:', response.data.subscription);
          } else if (response.data.user.subscription) {
            console.log('Subscription data found in user object:', response.data.user.subscription);
          } else {
            console.log('No subscription data found in API response');
            console.log('Full API response:', response.data);
          }
          
          
          
          if (response.data.user.photos) {
            
            const photosData = Array.isArray(response.data.user.photos) ? response.data.user.photos : [];
            setPhotos(photosData);
          } else {
            setPhotos([]);
          }
          
          if (response.data.user.videos) {
            
            const videosData = Array.isArray(response.data.user.videos) ? response.data.user.videos : [];
            setVideos(videosData);
          } else {
            setVideos([]);
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
            const usernamesResponse = await axios.get(`/api/username/purchased/${response.data.user.id}`);
            if (usernamesResponse.data.success) {
              const otherUsernames = usernamesResponse.data.usernames
                .filter(item => !item.is_active && item.username !== response.data.user.username)
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
          

          if (response.data.current_user_is_moderator !== undefined) {
            setIsCurrentUserModerator(response.data.current_user_is_moderator);
          }
          
          // Получаем надетые предметы из API профиля
          if (response.data.equipped_items) {
            setEquippedItems(response.data.equipped_items);
          } else {
            setEquippedItems([]);
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
  }, [username, setLoading, setUser, setFollowersCount, setFollowingCount, setFollowing, setPostsCount, setSocials, setTotalLikes]);
  
  
  useEffect(() => {
    if (!currentUser) {
      setUser(null);
    }
  }, [currentUser]);

  
  useEffect(() => {
    
    if (user && user.id) {
      setLoadingFollowers(true);
      setLoadingFollowing(true);
      setLoadingFriends(true);
      
      console.log(`Загрузка подписчиков для пользователя ${user.id}`);
      
      axios.get(`/api/profile/${user.id}/followers`)
        .then(response => {
          console.log('Ответ API подписчиков:', response.data);
          if (response.data && response.data.followers) {
            
            const followersData = Array.isArray(response.data.followers) 
              ? response.data.followers.filter(f => f && typeof f === 'object') 
              : [];
            console.log(`Получено ${followersData.length} подписчиков`);
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
      
      console.log(`Загрузка подписок для пользователя ${user.id}`);
      
      axios.get(`/api/profile/${user.id}/following`)
        .then(response => {
          console.log('Ответ API подписок:', response.data);
          if (response.data && response.data.following) {
            
            const followingData = Array.isArray(response.data.following) 
              ? response.data.following.filter(f => f && typeof f === 'object') 
              : [];
            console.log(`Получено ${followingData.length} подписок`);
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
        
      console.log(`Загрузка друзей для пользователя ${user.id}`);
      
      axios.get(`/api/profile/${user.id}/friends`)
        .then(response => {
          console.log('Ответ API друзей:', response.data);
          if (response.data && response.data.friends) {
            
            const friendsData = Array.isArray(response.data.friends) 
              ? response.data.friends.filter(f => f && typeof f === 'object') 
              : [];
            console.log(`Получено ${friendsData.length} друзей`);
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
  }, [user]);

  
  useEffect(() => {
    const fetchTotalLikes = async () => {
      try {
        if (user && user.id) {
          const response = await axios.get(`/api/profile/${user.id}/stats`);
          if (response.data && response.data.total_likes !== undefined) {
            setTotalLikes(response.data.total_likes);
          } else {
            setTotalLikes(0);
          }
        }
      } catch (error) {
        console.error('Error fetching total likes:', error);
        setTotalLikes(0);
      }
    };
    
    if (user && user.id) {
      fetchTotalLikes();
    }
  }, [user]);

  
  const fetchOnlineStatus = async () => {
    try {
      if (!username) return;
      
      const response = await axios.get(`/api/profile/${username}/online_status`);
      
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
        verification_status: user.verification_status
      });
    }
  }, [user]);




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
        const response = await axios.get(`/api/inventory/user/${user.id}/equipped`);
        if (response.data.success) {
          setEquippedItems(response.data.equipped_items || []);
        }
      } catch (error) {
        console.error('Error refreshing equipped items:', error);
      }
    }
  };

  useEffect(() => {
    const restoreMyBackground = () => {
      if (globalProfileBackgroundEnabled) {
        let myBg = localStorage.getItem('myProfileBackgroundUrl');
        if (!myBg) {
          const match = document.cookie.match(/(?:^|; )myProfileBackgroundUrl=([^;]*)/);
          if (match) myBg = decodeURIComponent(match[1]);
        }
        if (myBg) {
          setProfileBackground(myBg);
        } else {
          clearProfileBackground();
        }
      } else {
        clearProfileBackground();
      }
    };

    if (user?.profile_background_url) {
      setProfileBackground(user.profile_background_url);
      return () => {
        restoreMyBackground();
      };
    } else {
      restoreMyBackground();
    }
  }, [user, globalProfileBackgroundEnabled, setProfileBackground, clearProfileBackground]);

  const [searchParams] = useSearchParams();
  const itemIdToOpen = searchParams.get('item');

  useEffect(() => {
    if (itemIdToOpen) {
      setTabValue(2);
    }
  }, [itemIdToOpen]);

  if (loading) {
    return <ProfileLoader />;
  }
  
  if (!user) {
    return <UserNotFound />;
  }
  
  const isCurrentUser = currentUser && currentUser.username === user.username;

  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        pt: 0, 
        pb: 4, 
        px: { xs: 0.5, sm: 1 },
        width: '100%',
        marginRight: 'auto',
        marginLeft: '0!important',
        paddingTop: '24px',
        paddingBottom: '40px',
        paddingLeft: '0',
        paddingRight: '0',
        minHeight: 'calc(100vh - 64px)',
      }}
    >
      <Grid 
        container 
        spacing={0.5}
        sx={{
          flexDirection: { xs: 'column', lg: 'row' },
          flexWrap: { xs: 'nowrap', lg: 'nowrap' }
        }}
      >
        
                <Grid item xs={12} lg={5} sx={{
          position: { xs: 'static', lg: 'sticky' },
          top: '60px',
          height: 'fit-content',
          zIndex: 2
        }}>
          
          <Paper sx={{
            p: 0,
            borderRadius: '16px',
            background: user?.profile_id === 2 && user?.banner_url
              ? `url(${user.banner_url}), rgba(255, 255, 255, 0.03)`
              : 'rgba(255, 255, 255, 0.03)',
            backgroundSize: user?.profile_id === 2 && user?.banner_url ? 'cover' : undefined,
            backgroundPosition: user?.profile_id === 2 && user?.banner_url ? 'center' : undefined,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
            overflow: 'hidden',
            mb: '5px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            position: 'relative',
            zIndex: 2
          }}>
            {/* Banner section */}
            {user?.profile_id !== 2 ? (
              user?.banner_url ? (
                <Box sx={{ 
                  width: '100%',
                  height: { xs: 150, sm: 200 },
                  backgroundImage: `url(${user.banner_url})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative',
                  transition: 'transform 0.5s ease',
                  '&:hover': {
                    transform: 'scale(1.02)'
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 1
                  }
                }}></Box>
              ) : (
                <Box sx={{ 
                  width: '100%',
                  height: { xs: 100, sm: 120 },
                  position: 'relative',
                }}></Box>
              )
            ) : (
              null
            )}
            
            <Box sx={{ px: 3, pb: 3, pt: 0, mt: user?.profile_id === 2 ? 2 : -7 }}>
              
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'flex-start'
              }}>
                
                <Box sx={{ position: 'relative' }}>
                  <Tooltip title="Открыть аватар" arrow placement="top">
                    <Avatar 
                      src={user?.avatar_url} 
                      alt={user?.name}
                      onClick={() => {
                        const imageUrl = user?.avatar_url || fallbackAvatarUrl;
                        if (imageUrl) openLightbox(imageUrl);
                      }}
                      sx={{ 
                        width: { xs: 110, sm: 130 }, 
                        height: { xs: 110, sm: 130 }, 
                        border: (user?.status_color && user?.status_text && user?.subscription) 
                          ? `4px solid ${user.status_color}` 
                          : user?.subscription 
                            ? `4px solid ${user.subscription.type === 'premium' ? 'rgba(186, 104, 200)' : user.subscription.type === 'pick-me' ? 'rgba(208, 188, 255)' : user.subscription.type === 'ultimate' ? 'rgba(124, 77, 255)' : 'rgba(66, 165, 245)'}` 
                          : theme => theme.palette.mode === 'dark'
                              ? '4px solid #121212'
                              : '4px solid #ffffff',
                        boxShadow: (user?.status_color && user?.status_text && user.subscription) 
                          ? `0 0 15px ${user.status_color}80` 
                          : user?.subscription 
                            ? (user.subscription.type === 'premium' ? '0 0 15px rgba(186, 104, 200, 0.5)' : user.subscription.type === 'pick-me' ? '0 0 15px rgba(208, 188, 255, 0.5)' : user.subscription.type === 'ultimate' ? '0 0 15px rgba(124, 77, 255, 0.5)' : '0 0 15px rgba(66, 165, 245, 0.5)') 
                            : '0 8px 20px rgba(0, 0, 0, 0.25)',
                        bgcolor: 'primary.dark',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                      }}
                      onError={(e) => {
                        if (user?.id) {
                          const fallbackSrc = `/static/uploads/avatar/${user.id}/${user.photo || 'default.png'}`;
                          e.currentTarget.src = fallbackSrc;
                          setFallbackAvatarUrl(fallbackSrc);
                        }
                      }}
                    />
                  </Tooltip>
                  {equippedItems.map((item, index) => (
                    <EquippedItem key={item.id} item={item} index={index} />
                  ))}
                  
                  
                  {isOnline && user?.subscription?.type !== 'channel' && (
                    <Box
                      sx={{
                        position: 'absolute',
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        bgcolor: '#4caf50',
                        border: theme => theme.palette.mode === 'dark'
                          ? '2px solid #121212'
                          : '2px solid #ffffff',
                        bottom: 5,
                        right: 15,
                        boxShadow: '0 0 8px rgba(76, 175, 80, 0.9)',
                        zIndex: 2,
                        animation: 'pulse 2s infinite',
                        '@keyframes pulse': {
                          '0%': {
                            boxShadow: '0 0 0 0 rgba(76, 175, 80, 0.7)'
                          },
                          '70%': {
                            boxShadow: '0 0 0 6px rgba(76, 175, 80, 0)'
                          },
                          '100%': {
                            boxShadow: '0 0 0 0 rgba(76, 175, 80, 0)'
                          }
                        }
                      }}
                    />
                  )}
                  
                  
                  <UserStatus statusText={user?.status_text} statusColor={user?.status_color} />
                </Box>
                

              </Box>
              
              
              <Box sx={{ whiteSpace: 'nowrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        fontWeight: 700,
                        color: user?.profile_id === 2 ? '#fff' : 'inherit',
                        textShadow: user?.profile_id === 2 ? '0 1px 3px rgba(0,0,0,0.7)' : 'none',
                        background: user?.profile_id === 2 ? 'none' : theme => theme.palette.mode === 'dark' 
                          ? 'linear-gradient(90deg, #fff 0%, rgba(255,255,255,0.8) 100%)'
                          : 'linear-gradient(90deg, #000 0%, rgba(0,0,0,0.8) 100%)',
                        WebkitBackgroundClip: user?.profile_id === 2 ? 'unset' : 'text',
                        WebkitTextFillColor: user?.profile_id === 2 ? 'unset' : 'transparent'
                      }}>
                      {user?.name || 'Пользователь'}
                    </Typography>
                    <VerificationBadge status={user?.verification_status} size="small" />
                    


                    {user?.achievement && (
                      <Badge 
                        achievement={user.achievement}
                        size="medium"
                        className="profile-achievement-badge"
                        showTooltip={true}
                        tooltipText={user.achievement.bage}
                        onError={(e) => {
                          console.error("Achievement badge failed to load:", e);
                        }}
                      />
                    )}
                  </Box>


                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5, flexWrap: 'wrap', maxWidth: '100%' }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 500,
                      color: user?.profile_id === 2 ? 'rgba(255,255,255,0.9)' : theme => theme.palette.text.secondary,
                      textShadow: user?.profile_id === 2 ? '0 1px 2px rgba(0,0,0,0.5)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      background: user?.profile_id === 2 
                        ? 'rgba(0,0,0,0.3)'
                        : theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                      px: 1.2,
                      py: 0.4,
                      borderRadius: 1,
                      border: user?.profile_id === 2
                        ? '1px solid rgba(255,255,255,0.15)'
                        : theme => theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)'
                    }}
                  >
                    @{user?.username || 'username'}
                  </Typography>

                  {user?.connect_info && user.connect_info.length > 0 && (
                    <>
                      <LinkRoundedIcon 
                        sx={theme => ({ 
                          width: '2em',
                          height: '2em',
                          fontSize: 16,
                          color: user?.profile_id === 2 ? 'rgba(255,255,255,0.9)' : theme.palette.text.secondary
                        })} 
                      />
                      <Typography
                        variant="body2"
                        component={Link}
                        to={`/profile/${user.connect_info[0].username}`}
                        sx={theme => ({
                          fontWeight: 500,
                          color: user?.profile_id === 2 ? 'rgba(255,255,255,0.9)' : theme.palette.text.secondary,
                          textShadow: user?.profile_id === 2 ? '0 1px 2px rgba(0,0,0,0.5)' : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          background: user?.profile_id === 2
                            ? 'rgba(0,0,0,0.3)'
                            : theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                          px: 1.2,
                          py: 0.4,
                          borderRadius: 1,
                          border: user?.profile_id === 2
                            ? '1px solid rgba(255,255,255,0.15)'
                            : theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
                          textDecoration: 'none',
                          cursor: 'pointer'
                        })}
                      >
                        @{user.connect_info[0].username}
                      </Typography>
                    </>
                  )}

                  <UserScamBadge user={user} />
                  
                  <UserSubscriptionBadge user={user} />
                  
                </Box>
                  
                <OwnedUsernames 
                  ownedUsernames={ownedUsernames}
                  user={user}
                  t={t}
                  getLighterColor={getLighterColor}
                  handleUsernameClick={handleUsernameClick}
                />
                
                <UserBanInfo 
                  userBanInfo={userBanInfo}
                  user={user}
                  currentUser={currentUser}
                  isCurrentUserModerator={isCurrentUserModerator}
                  showTooltip={false}
                  showDetailed={true}
                />
                
                <ProfileAbout user={user} getLighterColor={getLighterColor} />

                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: user?.subscription?.type === 'channel' ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', 
                  gap: 1, 
                  mt: 1 
                }}>
                  
                  <Paper sx={{ 
                    p: 1, 
                    borderRadius: 1, 
                    textAlign: 'center',
                    background: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                    backdropFilter: 'blur(5px)',
                    border: (user.status_color && user.status_text && user.subscription) ? 
                    `1px solid ${user.status_color}33` : 
                    theme => theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
                    transition: 'all 0.2s ease'
                  }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 700,
                        color: (user.status_color && user.status_text && user.subscription) ? 
                          user.status_color : 
                          'primary.main'
                      }}
                    >
                      {postsCount || 0}
                    </Typography>
                    <Typography variant="caption" sx={{ 
                      color: user?.status_color ? getLighterColor(user.status_color) : theme => theme.palette.text.secondary
                    }}>
                      {t('profile.stats.posts')}
                    </Typography>
                  </Paper>
                  
                  
                  <Paper 
                    component={Link}
                    to={`/friends/${user?.username}`}
                    sx={{ 
                      p: 1, 
                      borderRadius: 1, 
                      textAlign: 'center',
                      background: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                      backdropFilter: 'blur(5px)',
                      border: (user.status_color && user.status_text && user.subscription) ? 
                        `1px solid ${user.status_color}33` : 
                        theme => theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
                      textDecoration: 'none',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 700,
                        color: (user.status_color && user.status_text && user.subscription) ? 
                          user.status_color : 
                          'primary.main'
                      }}
                    >
                      {followersCount || 0}
                    </Typography>
                    <Typography variant="caption" sx={{ 
                      color: user?.status_color ? getLighterColor(user.status_color) : theme => theme.palette.text.secondary
                    }}>
                      {t('profile.stats.followers')}
                    </Typography>
                  </Paper>
                  
                  
                  {(!user?.subscription || user.subscription.type !== 'channel') && (
                    <Paper 
                      component={Link}
                      to={`/friends/${user?.username}`}
                      sx={{ 
                        p: 1, 
                        borderRadius: 1, 
                        textAlign: 'center',
                        background: theme => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                        backdropFilter: 'blur(5px)',
                        border: (user.status_color && user.status_text && user.subscription) ? 
                          `1px solid ${user.status_color}33` : 
                          theme => theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
                        textDecoration: 'none',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 700,
                          color: (user.status_color && user.status_text && user.subscription) ? 
                            user.status_color : 
                            'primary.main'
                        }}
                      >
                        {followingCount || 0}
                      </Typography>
                      <Typography variant="caption" sx={{ 
                        color: user?.status_color ? getLighterColor(user.status_color) : theme => theme.palette.text.secondary
                      }}>
                        {t('profile.stats.following')}
                      </Typography>
                    </Paper>
                  )}
                </Box>
                
                
                {!isCurrentUser && (!currentUser?.account_type || currentUser.account_type !== 'channel') && (
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 1, 
                    mt: 2,
                    justifyContent: 'center'
                  }}>
                    <Button 
                      variant="contained" 
                      color="primary"
                      startIcon={following ? <PersonRemoveIcon /> : <PersonAddIcon />}
                      onClick={handleFollow}
                      fullWidth
                      sx={{ 
                        borderRadius: 6,
                        py: 0.7,
                        fontWeight: 'bold',
                        textTransform: 'none',
                        boxShadow: (user.status_color && user.status_text && user.subscription) ?
                          `0 2px 8px ${user.status_color}40` : 
                          '0 2px 8px rgba(208, 188, 255, 0.25)',
                        backgroundColor: following ? 
                          'rgba(255, 255, 255, 0.1)' : 
                          (user.status_color && user.status_text && user.subscription) ?
                            user.status_color :
                            'primary.main',
                        color: following ? 'text.primary' : '#fff',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: following ? 
                            'rgba(255, 255, 255, 0.15)' : 
                            (user.status_color && user.status_text && user.subscription) ?
                              `${user.status_color}E6` : 
                              'primary.dark',
                          transform: 'translateY(-2px)',
                          boxShadow: (user.status_color && user.status_text && user.subscription) ?
                            `0 4px 12px ${user.status_color}66` : 
                            '0 4px 12px rgba(208, 188, 255, 0.4)'
                        },
                        '&:active': {
                          transform: 'translateY(0)'
                        }
                      }}
                    >
                      {following ? t('profile.actions.unfollow') : t('profile.actions.follow')}
                    </Button>
                  </Box>
                )}
                

                
              </Box>

            </Box>
            
          </Paper>
              {user?.profile_id === 2 && equippedItems && equippedItems.length > 0 && (
 
                      <Box sx={{ 
                        display: 'flex', 
                        gap: 1, 
                        justifyContent: 'flex-start',
                        width: '100%'
                      }}>
                        {equippedItems.slice(0, 3).map((item, index) => (
                          <Box key={item.id || index} sx={{ 
                            width: 'calc((100% - 8px) / 3)',
                            aspectRatio: '1',
                            minWidth: 0
                          }}>
                            <InventoryItemCardPure 
                              item={item}
                              style={{
                                width: '100%',
                                height: '100%'
                              }}
                              className="equipped-item-compact"
                            />
                          </Box>
                        ))}
                      </Box>
                  )}
        </Grid>
        
        
        <Grid item xs={12} lg={7} sx={{
          pt: 0,
          ml: { xs: 0, lg: '5px' },
          mb: '100px',
          ...(tabValue === 2 && {
            height: '100vh',
          })
        }}>
        
          <Paper sx={{ 
            borderRadius: '12px', 
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
            overflow: 'hidden',
            mb: '5px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange}
              indicatorColor="primary"
              variant="fullWidth"
              sx={{
                '& .MuiTab-root': {
                  color: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                  '&.Mui-selected': {
                    color: theme => theme.palette.primary.main,
                  }
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: 'primary.main',
                }
              }}
            >
              <Tab label={t('profile.tabs.posts')} />
              <Tab label={t('profile.tabs.wall')} />
              <Tab label="Инвентарь" />
              <Tab label={t('profile.tabs.about')} />
            </Tabs>
          </Paper>
          
          
          <TabPanel value={tabValue} index={0} sx={{ p: 0, mt: 1 }}>
            {isCurrentUser && (
              <CreatePost onPostCreated={handlePostCreated} />
            )}
            
            <PostsTab userId={user?.id} statusColor={user?.status_color} PostsFeed={PostsFeed} />
          </TabPanel>
          
          <TabPanel value={tabValue} index={1} sx={{ p: 0, mt: 1 }}>
            {currentUser && (!currentUser.subscription || currentUser.subscription.type !== 'channel') && (
              <CreatePost 
                onPostCreated={handlePostCreated} 
                postType="stena" 
                recipientId={user.id} 
              />
            )}
            
            <WallPostsTab userId={user.id} WallFeed={WallFeed} />
          </TabPanel>
          
          <TabPanel value={tabValue} index={2} sx={{ p: 0, mt: 1 }}>
            <UpgradeEffects item={user}>
                          <InventoryTab 
              userId={user?.id} 
              itemIdToOpen={itemIdToOpen} 
              equippedItems={equippedItems}
              onEquippedItemsUpdate={refreshEquippedItems}
              currentUserId={currentUser?.id}
            />
            </UpgradeEffects>
          </TabPanel>
          
          <TabPanel value={tabValue} index={3} sx={{ p: 0, mt: 1 }}>
            <ProfileInfo 
              user={user} 
              socials={socials}
              onUsernameClick={handleUsernameClick}
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