import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  Box,
  Container,
  Grid,
  CircularProgress,
  TextField,
  InputAdornment,
} from '@mui/material';
import StyledTabs from '../../UIKIT/StyledTabs';
import FriendsList from '../../UIKIT/FriendsList';
import InfoBlock from '../../UIKIT/InfoBlock';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import { useParams } from 'react-router-dom';

const TABS = [
  { label: 'Друзья', value: 0 },
  { label: 'Подписчики', value: 1 },
  { label: 'Подписки', value: 2 },
];

const FriendsPage = () => {
  const { username } = useParams();
  const { user: currentUser } = useContext(AuthContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [tab, setTab] = useState(0);
  const [friends, setFriends] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingIds, setLoadingIds] = useState({});
  const [search, setSearch] = useState('');
  const [suggested, setSuggested] = useState([]);

  const fetchFriends = useCallback(async () => {
    if (!username) return;
    setLoading(true);
    try {
      const res = await axios.get(`/api/profile/${username}/friends`, {
        params: { page: 1, per_page: 50 },
      });
      setFriends(res.data.friends || []);
    } catch (e) {
      setFriends([]);
    } finally {
      setLoading(false);
    }
  }, [username]);

  const fetchFollowers = useCallback(async () => {
    if (!username) return;
    setLoading(true);
    try {
      const res = await axios.get(`/api/users/${username}/followers`, {
        params: { page: 1, per_page: 50 },
      });
      // Только не-друзья
      setFollowers((res.data.followers || []).filter(f => !f.is_friend));
    } catch (e) {
      setFollowers([]);
    } finally {
      setLoading(false);
    }
  }, [username]);

  const fetchFollowing = useCallback(async () => {
    if (!username) return;
    setLoading(true);
    try {
      const res = await axios.get(`/api/users/${username}/following`, {
        params: { page: 1, per_page: 50 },
      });
      setFollowing(res.data.following || []);
    } catch (e) {
      setFollowing([]);
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    if (!username) return;
    fetchFollowers();
    if (tab === 0) fetchFriends();
    if (tab === 2) fetchFollowing();
  }, [tab, username, fetchFriends, fetchFollowers, fetchFollowing]);

  useEffect(() => {
    if (followers.length && suggested.length === 0) {
      const getRandomUsers = (arr, n) => {
        if (arr.length <= n) return arr;
        const shuffled = arr.slice().sort(() => 0.5 - Math.random());
        return shuffled.slice(0, n);
      };
      setSuggested(getRandomUsers(followers, 3));
    }
  }, [followers, suggested.length]);

  const handleUnfollow = async userId => {
    setLoadingIds(prev => ({ ...prev, [userId]: true }));
    try {
      const response = await axios.post('/api/profile/unfollow', { followed_id: userId });
      
      if (response.data.success) {
        // Немедленно обновляем список без перезагрузки с сервера
        if (tab === 0) {
          // На вкладке друзей - убираем из списка друзей
          setFriends(prev => prev.filter(friend => friend.id !== userId));
        } else if (tab === 1) {
          // На вкладке подписчиков - убираем из списка подписчиков
          setFollowers(prev => prev.filter(follower => follower.id !== userId));
        } else if (tab === 2) {
          // На вкладке подписок - убираем из списка подписок
          setFollowing(prev => prev.filter(following => following.id !== userId));
        }
      }
    } catch (e) {
      console.error('Ошибка при отписке:', e);
      // В случае ошибки перезагружаем данные с сервера
      if (tab === 0) fetchFriends();
      if (tab === 1) fetchFollowers();
      if (tab === 2) fetchFollowing();
    } finally {
      setLoadingIds(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleFollow = async userId => {
    setLoadingIds(prev => ({ ...prev, [userId]: true }));
    try {
      const response = await axios.post('/api/profile/follow', { followed_id: userId });
      
      if (response.data.success) {
        // Немедленно обновляем список без перезагрузки с сервера
        if (tab === 0) {
          // На вкладке друзей после подписки нужно перезагрузить список
          fetchFriends();
        } else if (tab === 1) {
          // На вкладке подписчиков после подписки убираем из списка
          setFollowers(prev => prev.filter(follower => follower.id !== userId));
        } else if (tab === 2) {
          // На вкладке подписок после подписки перезагружаем список
          fetchFollowing();
        }
      }
    } catch (e) {
      console.error('Ошибка при подписке:', e);
      // В случае ошибки перезагружаем данные с сервера
      if (tab === 0) fetchFriends();
      if (tab === 1) fetchFollowers();
      if (tab === 2) fetchFollowing();
    } finally {
      setLoadingIds(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleCopyLink = async (user) => {
    const profileUrl = `${window.location.origin}/profile/${user.username}`;
    try {
      await navigator.clipboard.writeText(profileUrl);
      // Можно добавить уведомление об успешном копировании
    } catch (error) {
      console.error('Ошибка при копировании ссылки:', error);
    }
  };

  const filterUsers = arr => {
    if (!search.trim()) return arr;
    const q = search.trim().toLowerCase();
    return arr.filter(
      u =>
        (u.username && u.username.toLowerCase().includes(q)) ||
        (u.name && u.name.toLowerCase().includes(q))
    );
  };

  const getList = () => {
    if (tab === 0) return filterUsers(friends);
    if (tab === 1)
      return filterUsers(
        followers.filter(f => !friends.some(fr => fr.id === f.id))
      );
    if (tab === 2)
      return filterUsers(
        following.filter(f => !friends.some(fr => fr.id === f.id))
      );
    return [];
  };

  return (
    <Container
      maxWidth='lg'
      sx={{ pt: '20px', px: { xs: '2.5px', sm: 2 }, mb: '60px' }}
    >
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <StyledTabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            tabs={TABS}
            fullWidth
            variant='fullWidth'
            customStyle
          />
          <TextField
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder='Поиск по пользователям'
            size='small'
            fullWidth
            sx={{ 
              mb: 1.5, 
              mt: 1,
              '& .MuiOutlinedInput-root': {
                background: 'var(--theme-background, rgba(255,255,255,0.03))',
                backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
                border: '1px solid rgba(0, 0, 0, 0.12)',
                borderRadius: 'var(--main-border-radius)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'var(--theme-background, rgba(255,255,255,0.05))',
                },
                '&.Mui-focused': {
                  border: '1px solid rgba(208, 188, 255, 0.5)',
                  boxShadow: '0 0 0 2px rgba(208, 188, 255, 0.1)',
                },
              },
              '& .MuiOutlinedInput-input': {
                color: 'var(--theme-text-primary, inherit)',
                '&::placeholder': {
                  color: 'var(--theme-text-secondary, rgba(255,255,255,0.5))',
                  opacity: 1,
                },
              },
              '& .MuiInputAdornment-root': {
                color: 'var(--theme-text-secondary, rgba(255,255,255,0.6))',
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon fontSize='small' />
                </InputAdornment>
              ),
            }}
          />
          <Box sx={{ mt: '5px', minHeight: 300 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress size={40} />
              </Box>
            ) : (
              <FriendsList
                users={getList().map(u => ({
                  ...u,
                  photo: u.avatar_url || u.photo, // Используем avatar_url если есть, иначе photo
                  onUnfollow: handleUnfollow,
                  onFollow: handleFollow,
                  onCopyLink: handleCopyLink,
                  loading: !!loadingIds[u.id],
                  showFollowButton: true, // Показываем кнопку подписки везде
                  showMessageButton: false,
                  showCopyLinkButton: true,
                  showShareButton: false, // Скрываем "Поделиться" на странице друзей
                  showBlockButton: false,
                  showReportButton: false,
                }))}
                cardSpacing={2}
                cardRadius={12}
                forceUnfollow={tab === 0} // На вкладке "Друзья" показываем "Отписаться", на других - "Подписаться"
              />
            )}
          </Box>
        </Grid>
        {!isMobile && (
          <Grid item xs={12} md={4}>
            <InfoBlock
              title={TABS[tab].label}
              description={
                tab === 0
                  ? 'Здесь отображаются пользователи, с которыми у вас взаимные подписки.'
                  : tab === 1
                    ? 'Пользователи, которые подписаны на вас.'
                    : 'Пользователи, на которых вы подписаны.'
              }
              customStyle
            />
            <InfoBlock title='Возможно вам знакомы' customStyle sx={{ mt: 2 }}>
              {suggested.length === 0 ? (
                <Box sx={{ color: 'text.secondary', fontSize: 14, py: 1 }}>
                  Нет рекомендаций
                </Box>
              ) : (
                suggested.map(user => (
                  <Box
                    key={user.id}
                    component='a'
                    href={`/profile/${user.username}`}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      mb: 1.2,
                      textDecoration: 'none',
                      cursor: 'pointer',
                      background: 'rgba(255,255,255,0.07)',
                      borderRadius: 'var(--main-border-radius)',
                      px: 1.5,
                      py: 1,
                      transition: 'background 0.18s',
                      '&:hover': { background: 'rgba(208,188,255,0.13)' },
                    }}
                  >
                    <Box
                      component='img'
                      src={
                        user.avatar_url || (user.photo && user.photo !== ''
                          ? `/static/uploads/avatar/${user.id}/${user.photo}`
                          : '/static/uploads/avatar/system/avatar.png')
                      }
                      alt={user.name || user.username}
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 'var(--avatar-border-radius)',
                        mr: 1.5,
                        objectFit: 'cover',
                        border: '1.5px solid #D0BCFF',
                      }}
                    />
                    <Box>
                      <Box
                        sx={{
                          fontWeight: 500,
                          fontSize: 15,
                          color: 'text.primary',
                          lineHeight: 1,
                        }}
                      >
                        {user.name || user.username}
                      </Box>
                      <Box
                        sx={{
                          fontSize: 13,
                          color: 'text.secondary',
                          lineHeight: 1.2,
                        }}
                      >
                        @{user.username}
                      </Box>
                    </Box>
                  </Box>
                ))
              )}
            </InfoBlock>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default FriendsPage;
