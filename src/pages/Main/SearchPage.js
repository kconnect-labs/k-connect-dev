import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  Container,
  Box,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Button,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Paper,
  CircularProgress,
} from '@mui/material';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import VerifiedIcon from '@mui/icons-material/Verified';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { ThemeSettingsContext } from '../../App';
import { MaxIcon } from '../../components/icons/CustomIcons';
import { AuthContext } from '../../context/AuthContext';
import { searchService, profileService } from '../../services';
import SimpleImageViewer from '../../components/SimpleImageViewer';
import { motion } from 'framer-motion';

const StyledSearchBox = styled(Box)(({ theme }) => ({
  position: 'sticky',
  top: 70,
  zIndex: 10,
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
}));

const NoResultsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(4),
  textAlign: 'center',
  marginTop: theme.spacing(2),
}));

const TabPanel = props => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`search-tabpanel-${index}`}
      aria-labelledby={`search-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
};

// Добавляем стили для карточки пользователя
const UserCard = styled(motion.div)(({ theme, decoration }) => {
  // Определяем тип фона (градиент, изображение или цвет)
  const isGradient = decoration?.background?.includes('linear-gradient');
  const isImage = decoration?.background?.includes('/');
  const isHexColor = decoration?.background?.startsWith('#');
  const isLightBackground = isHexColor && isLightColor(decoration?.background);

  const hasCustomBackground = !!decoration?.background;

  return {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(2),
    borderRadius: theme.spacing(2),
    marginBottom: theme.spacing(1.5),
    backdropFilter: hasCustomBackground ? 'none' : 'blur(20px)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
    background: hasCustomBackground
      ? isImage
        ? `url(${decoration.background})`
        : decoration.background
      : 'rgba(15, 15, 15, 0.98)',
    backgroundSize: isImage ? 'cover' : 'auto',
    backgroundPosition: isImage ? 'center' : 'auto',
    color: isLightBackground
      ? 'rgba(0, 0, 0, 0.87)'
      : theme.palette.text.primary,
    '& .MuiTypography-root': {
      color: isLightBackground ? 'rgba(0, 0, 0, 0.87)' : 'inherit',
    },
    '& .MuiTypography-colorTextSecondary': {
      color: isLightBackground
        ? 'rgba(0, 0, 0, 0.6)'
        : theme.palette.text.secondary,
    },
    '&:hover': {
      transform: 'translateY(-3px)',
      boxShadow: theme.shadows[6],
    },
    '&::before': isGradient
      ? {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: decoration.background,
          opacity: 0.15,
          zIndex: 0,
        }
      : {},
  };
});

const DecorationItem = styled('img')({
  position: 'absolute',
  right: 0,
  height: 'max-content',
  maxHeight: 120,
  opacity: 1,
  pointerEvents: 'none',
  zIndex: 1,
});

// Функция для проверки светлого фона
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

const SearchPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { themeSettings } = useContext(ThemeSettingsContext);
  const { user, isAuthenticated } = useContext(AuthContext);

  const searchParams = new URLSearchParams(location.search);
  const queryParam = searchParams.get('q') || '';
  const typeParam = searchParams.get('type') || 'all';

  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [searchType, setSearchType] = useState(
    typeParam === 'users' ? 1 : typeParam === 'posts' ? 2 : 0
  );
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [followingStatus, setFollowingStatus] = useState({});
  const [loading, setLoading] = useState(false);
  const [userPage, setUserPage] = useState(1);
  const [postPage, setPostPage] = useState(1);
  const [hasMoreUsers, setHasMoreUsers] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const searchInputRef = useRef(null);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxImages, setLightboxImages] = useState([]);

  const [searchTimeout, setSearchTimeout] = useState(null);

  const updateSearchParams = (query, type) => {
    const newParams = new URLSearchParams();
    if (query) newParams.set('q', query);
    if (type === 1) {
      newParams.set('type', 'users');
    } else if (type === 2) {
      newParams.set('type', 'posts');
    } else {
      newParams.set('type', 'all');
    }
    navigate(`/search?${newParams.toString()}`);
  };

  const performSearch = async (query, type, page = 1, append = false) => {
    if (loading) return;
    
    // Предотвращаем поиск пустого запроса при инициализации
    if (!query && !append) return;

    setLoading(true);
    try {
      let response;

      const cleanQuery = query.trim();

      if (type === 1) {
        response = await searchService.searchUsers(cleanQuery, page);

        if (response.data && response.data.users) {
          const uniqueUsers = removeDuplicates(response.data.users, 'id');

          if (append) {
            setUsers(prev => {
              const combined = [...prev, ...uniqueUsers];
              return removeDuplicates(combined, 'id');
            });
          } else {
            setUsers(uniqueUsers);
          }

          setHasMoreUsers(response.data.has_next);

          if (isAuthenticated && uniqueUsers.length > 0) {
            loadFollowingStatus(uniqueUsers);
          }
        }
      } else if (type === 2) {
        response = await searchService.searchPosts(cleanQuery, page);

        if (response.data && response.data.posts) {
          const uniquePosts = removeDuplicates(response.data.posts, 'id');

          if (append) {
            setPosts(prev => {
              const combined = [...prev, ...uniquePosts];
              return removeDuplicates(combined, 'id');
            });
          } else {
            setPosts(uniquePosts);
          }

          setHasMorePosts(response.data.has_next);
        }
      } else {
        response = await searchService.searchAll(cleanQuery);

        if (!append && response.data) {
          if (response.data.users) {
            setUsers(removeDuplicates(response.data.users, 'id'));
          } else {
            setUsers([]);
          }

          if (response.data.posts) {
            setPosts(removeDuplicates(response.data.posts, 'id'));
          } else {
            setPosts([]);
          }

          if (
            isAuthenticated &&
            response.data.users &&
            response.data.users.length > 0
          ) {
            loadFollowingStatus(response.data.users);
          }
        }
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeDuplicates = (array, key) => {
    return array.filter(
      (item, index, self) => index === self.findIndex(t => t[key] === item[key])
    );
  };

  const loadFollowingStatus = async usersList => {
    if (!isAuthenticated || !usersList || usersList.length === 0) return;

    try {
      const statuses = {};

      for (const user of usersList) {
        if (user.id === user?.id) continue;

        try {
          const response = await profileService.checkFollowing(user.id);
          statuses[user.id] = response.data.following;
        } catch (error) {
          console.error(
            `Error checking following status for user ${user.id}:`,
            error
          );
          statuses[user.id] = false;
        }
      }

      setFollowingStatus(prev => ({ ...prev, ...statuses }));
    } catch (error) {
      console.error('Error loading following statuses:', error);
    }
  };

  const handleFollowToggle = async userId => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      if (followingStatus[userId]) {
        await profileService.unfollowUser(userId);
      } else {
        await profileService.followUser(userId);
      }

      setFollowingStatus(prev => ({
        ...prev,
        [userId]: !prev[userId],
      }));
    } catch (error) {
      console.error('Error toggling follow status:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setSearchType(newValue);

    let type = 'all';
    if (newValue === 1) type = 'users';
    else if (newValue === 2) type = 'posts';

    updateSearchParams(searchQuery, newValue);

    setUserPage(1);
    setPostPage(1);

    performSearch(searchQuery, newValue);
  };

  const handleSearchSubmit = e => {
    e.preventDefault();
    const cleanQuery = searchQuery.trim();

    if (!cleanQuery && searchType === 1) {
      performSearch('', searchType);
    } else {
      updateSearchParams(cleanQuery, searchType);

      setUserPage(1);
      setPostPage(1);

      performSearch(cleanQuery, searchType);
    }
  };

  const loadMoreResults = () => {
    if (searchType === 1 && hasMoreUsers) {
      const nextPage = userPage + 1;
      setUserPage(nextPage);
      performSearch(searchQuery, searchType, nextPage, true);
    } else if (searchType === 2 && hasMorePosts) {
      const nextPage = postPage + 1;
      setPostPage(nextPage);
      performSearch(searchQuery, searchType, nextPage, true);
    }
  };

  useEffect(() => {
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'all';

    setSearchQuery(query);
    setSearchType(type === 'users' ? 1 : type === 'posts' ? 2 : 0);

    if (!initialLoad || query) {
      performSearch(query, type === 'users' ? 1 : type === 'posts' ? 2 : 0);
    }

    setInitialLoad(false);
  }, [location.search, initialLoad]);

  useEffect(() => {
    if (initialLoad && !queryParam) {
      performSearch('', 1);
    }
  }, [initialLoad, queryParam]);

  const handleOpenPostImage = (image, allImages, index) => {
    setCurrentImage(image);
    setLightboxImages(allImages);
    setCurrentImageIndex(index || 0);
    setLightboxOpen(true);
  };

  const handleCloseLightbox = () => {
    setLightboxOpen(false);
  };

  const handleNextImage = () => {
    setCurrentImageIndex(prevIndex => {
      const nextIndex = (prevIndex + 1) % lightboxImages.length;
      setCurrentImage(lightboxImages[nextIndex]);
      return nextIndex;
    });
  };

  const handlePrevImage = () => {
    setCurrentImageIndex(prevIndex => {
      const nextIndex =
        (prevIndex - 1 + lightboxImages.length) % lightboxImages.length;
      setCurrentImage(lightboxImages[nextIndex]);
      return nextIndex;
    });
  };

  useEffect(() => {
    const debounceTime = 1000;

    const cleanQuery = searchQuery.trim();

    if (cleanQuery) {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      const handler = setTimeout(() => {
        if (cleanQuery.length >= 2) {
          updateSearchParams(cleanQuery, searchType);
          performSearch(cleanQuery, searchType);
        }
      }, debounceTime);

      setSearchTimeout(handler);

      return () => {
        if (handler) clearTimeout(handler);
      };
    }
  }, [searchQuery, searchType]);

  return (
    <Container maxWidth='lg' sx={{ pt: 2, pb: 8 }}>
      <StyledSearchBox
        sx={{
          background: `unset`,
        }}
      >
        <form onSubmit={handleSearchSubmit}>
          <TextField
            fullWidth
            variant='outlined'
            placeholder='Поиск пользователей, постов...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            inputRef={searchInputRef}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon color='action' />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position='end'>
                  <IconButton
                    size='small'
                    onClick={() => {
                      setSearchQuery('');
                      searchInputRef.current?.focus();
                    }}
                  >
                    <MoreHorizIcon />
                  </IconButton>
                </InputAdornment>
              ),
              sx: {
                borderRadius: 6,
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                },
              },
            }}
          />
        </form>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 2 }}>
          <Tabs
            value={searchType}
            onChange={handleTabChange}
            variant='fullWidth'
            sx={{
              '& .MuiTabs-indicator': {
                backgroundColor: '#D0BCFF',
                height: 3,
              },
            }}
          >
            <Tab label='Все' />
            <Tab label='Пользователи' />
            <Tab label='Посты' />
          </Tabs>
        </Box>
      </StyledSearchBox>

      {loading && !users.length && !posts.length ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TabPanel value={searchType} index={0}>
            {users.length === 0 && posts.length === 0 ? (
              <NoResultsContainer>
                <Typography variant='h6' color='text.secondary' gutterBottom>
                  Ничего не найдено
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Попробуйте изменить поисковый запрос
                </Typography>
              </NoResultsContainer>
            ) : (
              <>
                {users.length > 0 && (
                  <Box sx={{ mb: 4 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 2,
                      }}
                    >
                      <Typography variant='h6'>Пользователи</Typography>
                      {users.length > 4 && (
                        <Button
                          variant='text'
                          color='primary'
                          onClick={() => handleTabChange(null, 1)}
                        >
                          Показать все
                        </Button>
                      )}
                    </Box>
                    <Paper
                      sx={{
                        borderRadius: 2,
                        background: `unset`,
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      <List>
                        {users.slice(0, 4).map((user, index) => (
                          <UserCard
                            key={user.id}
                            decoration={user.decoration}
                            component={motion.div}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            onClick={() =>
                              navigate(`/profile/${user.username}`)
                            }
                          >
                            {user.decoration?.item_path &&
                              (() => {
                                const [path, ...styles] =
                                  user.decoration.item_path.split(';');
                                const styleObj = styles.reduce((acc, style) => {
                                  const [key, value] = style
                                    .split(':')
                                    .map(s => s.trim());
                                  // Уменьшаем размеры в два раза для height
                                  if (key === 'height') {
                                    const numValue = parseInt(value);
                                    if (!isNaN(numValue)) {
                                      return {
                                        ...acc,
                                        [key]: `${numValue / 2}px`,
                                      };
                                    }
                                  }
                                  return { ...acc, [key]: value };
                                }, {});

                                return (
                                  <DecorationItem
                                    src={path}
                                    style={styleObj}
                                    alt=''
                                  />
                                );
                              })()}
                            <Box
                              sx={{
                                position: 'relative',
                                zIndex: 2,
                                display: 'flex',
                                alignItems: 'center',
                                width: '100%',
                              }}
                            >
                              <Avatar
                                src={
                                  user.photo && user.photo !== 'avatar.png'
                                    ? user.photo.startsWith('/')
                                      ? user.photo
                                      : `/static/uploads/avatar/${user.id}/${user.photo}`
                                    : `/static/uploads/avatar/system/avatar.png`
                                }
                                alt={user.name}
                                component={Link}
                                to={`/profile/${user.username}`}
                                sx={{
                                  width: 50,
                                  height: 50,
                                  marginRight: 2,
                                  border: '2px solid #D0BCFF',
                                }}
                                onError={e => {
                                  console.error(
                                    `Failed to load avatar for ${user.username}`
                                  );
                                  e.target.onerror = null;
                                  e.target.src = `/static/uploads/avatar/system/avatar.png`;
                                }}
                              />

                              <Box sx={{ flex: 1 }}>
                                <Box
                                  sx={{ display: 'flex', alignItems: 'center' }}
                                >
                                  <Typography
                                    component={Link}
                                    to={`/profile/${user.username}`}
                                    variant='subtitle1'
                                    sx={{
                                      fontWeight: 'bold',
                                      textDecoration: 'none',
                                      color: 'text.primary',
                                      '&:hover': {
                                        textDecoration: 'underline',
                                      },
                                    }}
                                  >
                                    {user.name}
                                  </Typography>
                                  {user.verification_status === 'verified' && (
                                    <VerifiedIcon
                                      sx={{
                                        fontSize: 16,
                                        ml: 0.5,
                                        color: '#D0BCFF',
                                      }}
                                    />
                                  )}
                                  {(user.subscription?.type === 'max' || 
                                    user.subscription_type === 'max' ||
                                    user.subscription?.subscription_type === 'max') && (
                                    <MaxIcon size={24} color="#FF4D50" style={{ margin: '0 2.5px' }} />
                                  )}
                                </Box>
                                <Typography
                                  variant='body2'
                                  color='text.secondary'
                                >
                                  @{user.username}
                                </Typography>
                              </Box>

                              {isAuthenticated && user.id !== user?.id && (
                                <Button
                                  variant='outlined'
                                  size='small'
                                  color='primary'
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleFollowToggle(user.id);
                                  }}
                                  startIcon={
                                    followingStatus[user.id] ? (
                                      <PersonRemoveIcon />
                                    ) : (
                                      <PersonAddIcon />
                                    )
                                  }
                                  sx={{
                                    borderRadius: 6,
                                    textTransform: 'none',
                                    borderColor: followingStatus[user.id]
                                      ? 'rgba(255, 255, 255, 0.2)'
                                      : '#D0BCFF',
                                    color: followingStatus[user.id]
                                      ? 'text.secondary'
                                      : '#D0BCFF',
                                    zIndex: 2,
                                  }}
                                >
                                  {followingStatus[user.id]
                                    ? 'Отписаться'
                                    : 'Подписаться'}
                                </Button>
                              )}
                            </Box>
                          </UserCard>
                        ))}
                      </List>
                    </Paper>
                  </Box>
                )}

                {posts.length > 0 && (
                  <Box>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 2,
                      }}
                    >
                      <Typography variant='h6'>Посты</Typography>
                      {posts.length > 3 && (
                        <Button
                          variant='text'
                          color='primary'
                          onClick={() => handleTabChange(null, 2)}
                        >
                          Показать все
                        </Button>
                      )}
                    </Box>
                    <Box
                      sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                    >
                      {posts.slice(0, 3).map((post, index) => (
                        <Card
                          key={`${post.id}-${index}`}
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            borderRadius: 2,
                            overflow: 'hidden',
                            textDecoration: 'none',
                            background: `linear-gradient(145deg, ${themeSettings.paperColor} 0%, rgba(26, 26, 26, 0.9) 100%)`,
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                            transition: 'transform 0.2s',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                            },
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              pt: 2,
                              px: 2,
                            }}
                          >
                            <Avatar
                              src={
                                post.user.photo &&
                                post.user.photo !== 'avatar.png'
                                  ? post.user.photo.startsWith('/')
                                    ? post.user.photo
                                    : `/static/uploads/avatar/${post.user.id}/${post.user.photo}`
                                  : `/static/uploads/avatar/system/avatar.png`
                              }
                              alt={post.user.name}
                              component={Link}
                              to={`/profile/${post.user.username}`}
                              sx={{
                                width: 40,
                                height: 40,
                                mr: 1.5,
                                border: '2px solid #D0BCFF',
                              }}
                              onError={e => {
                                console.error(
                                  `Failed to load user avatar for post`
                                );
                                e.target.onerror = null;
                                e.target.src = `/static/uploads/avatar/system/avatar.png`;
                              }}
                            />
                            <Box>
                              <Typography
                                variant='subtitle1'
                                component={Link}
                                to={`/profile/${post.user.username}`}
                                sx={{
                                  fontWeight: 'bold',
                                  textDecoration: 'none',
                                  color: 'text.primary',
                                  '&:hover': {
                                    textDecoration: 'underline',
                                  },
                                }}
                              >
                                {post.user.name}
                              </Typography>
                              <Typography
                                variant='caption'
                                color='text.secondary'
                                component={Link}
                                to={`/profile/${post.user.username}`}
                                sx={{ textDecoration: 'none' }}
                              >
                                @{post.user.username}
                              </Typography>
                            </Box>
                            <Box sx={{ ml: 'auto' }}>
                              <Typography
                                variant='caption'
                                color='text.secondary'
                              >
                                {new Date(post.timestamp).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </Box>

                          <Box
                            sx={{
                              px: 2,
                              pt: 1.5,
                              pb: post.image || post.video ? 0 : 1,
                            }}
                          >
                            <Typography
                              variant='body2'
                              component={Link}
                              to={`/post/${post.id}`}
                              sx={{
                                mb: 1.5,
                                display: 'block',
                                textDecoration: 'none',
                                color: 'text.primary',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                              }}
                            >
                              {post.content}
                            </Typography>
                          </Box>

                          {post.image && (
                            <Box
                              sx={{
                                position: 'relative',
                                mt: 1,
                                cursor: 'pointer',
                              }}
                              component={Link}
                              to={`/post/${post.id}`}
                            >
                              <img
                                src={
                                  post.image.startsWith('/')
                                    ? post.image
                                    : `/static/uploads/post/${post.id}/${post.image}`
                                }
                                alt='Post image'
                                style={{
                                  width: '100%',
                                  height: '250px',
                                  objectFit: 'cover',
                                  backgroundColor: '#111',
                                }}
                                onClick={e => {
                                  e.preventDefault();
                                  handleOpenPostImage(
                                    post.image.startsWith('/')
                                      ? post.image
                                      : `/static/uploads/post/${post.id}/${post.image}`,
                                    [
                                      post.image.startsWith('/')
                                        ? post.image
                                        : `/static/uploads/post/${post.id}/${post.image}`,
                                    ],
                                    0
                                  );
                                }}
                                onError={e => {
                                  console.error('Failed to load post image');
                                  e.target.src = `/static/uploads/avatar/system/avatar.png`;
                                }}
                              />
                            </Box>
                          )}

                          {post.video && (
                            <Box
                              sx={{
                                height: 250,
                                mt: 1,
                                backgroundColor: '#111',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                              }}
                              component={Link}
                              to={`/post/${post.id}`}
                            >
                              <video
                                src={
                                  post.video.startsWith('/')
                                    ? post.video
                                    : `/static/uploads/post/${post.id}/${post.video}`
                                }
                                style={{
                                  maxHeight: '100%',
                                  maxWidth: '100%',
                                  objectFit: 'contain',
                                }}
                                onError={e => {
                                  console.error('Failed to load post video');
                                  e.target.src = `/static/uploads/avatar/system/avatar.png`;
                                }}
                              />
                            </Box>
                          )}

                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              p: 2,
                              gap: 2,
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <IconButton size='small' sx={{ mr: 0.5 }}>
                                <ThumbUpOutlinedIcon fontSize='small' />
                              </IconButton>
                              <Typography variant='body2'>
                                {post.likes || post.likes_count || 0}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <IconButton size='small' sx={{ mr: 0.5 }}>
                                <ChatBubbleOutlineIcon fontSize='small' />
                              </IconButton>
                              <Typography variant='body2'>
                                {post.comments ||
                                  post.comments_count ||
                                  post.total_comments ||
                                  0}
                              </Typography>
                            </Box>
                            <Button
                              variant='text'
                              size='small'
                              component={Link}
                              to={`/post/${post.id}`}
                              sx={{
                                ml: 'auto',
                                textTransform: 'none',
                                borderRadius: '20px',
                              }}
                            >
                              Открыть
                            </Button>
                          </Box>
                        </Card>
                      ))}
                    </Box>
                  </Box>
                )}
              </>
            )}
          </TabPanel>

          <TabPanel value={searchType} index={1}>
            {users.length === 0 ? (
              <NoResultsContainer>
                <Typography variant='h6' color='text.secondary' gutterBottom>
                  {searchQuery
                    ? 'Пользователи не найдены'
                    : 'Рекомендуемые пользователи'}
                </Typography>
                {searchQuery && (
                  <Typography variant='body2' color='text.secondary'>
                    Попробуйте изменить поисковый запрос
                  </Typography>
                )}
              </NoResultsContainer>
            ) : (
              <Paper
                sx={{
                  borderRadius: 2,
                  background: `linear-gradient(145deg, ${themeSettings.paperColor} 0%, rgba(26, 26, 26, 0.9) 100%)`,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                }}
              >
                <List>
                  {users.map((user, index) => (
                    <UserCard
                      key={user.id}
                      decoration={user.decoration}
                      component={motion.div}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      onClick={() => navigate(`/profile/${user.username}`)}
                    >
                      {user.decoration?.item_path &&
                        (() => {
                          const [path, ...styles] =
                            user.decoration.item_path.split(';');
                          const styleObj = styles.reduce((acc, style) => {
                            const [key, value] = style
                              .split(':')
                              .map(s => s.trim());
                            // Уменьшаем размеры в два раза для height
                            if (key === 'height') {
                              const numValue = parseInt(value);
                              if (!isNaN(numValue)) {
                                return { ...acc, [key]: `${numValue / 2}px` };
                              }
                            }
                            return { ...acc, [key]: value };
                          }, {});

                          return (
                            <DecorationItem
                              src={path}
                              style={styleObj}
                              alt=''
                            />
                          );
                        })()}
                      <Box
                        sx={{
                          position: 'relative',
                          zIndex: 2,
                          display: 'flex',
                          alignItems: 'center',
                          width: '100%',
                        }}
                      >
                        <Avatar
                          src={
                            user.photo && user.photo !== 'avatar.png'
                              ? user.photo.startsWith('/')
                                ? user.photo
                                : `/static/uploads/avatar/${user.id}/${user.photo}`
                              : `/static/uploads/avatar/system/avatar.png`
                          }
                          alt={user.name}
                          component={Link}
                          to={`/profile/${user.username}`}
                          sx={{
                            width: 50,
                            height: 50,
                            marginRight: 2,
                            border: '2px solid #D0BCFF',
                          }}
                          onError={e => {
                            console.error(
                              `Failed to load avatar for ${user.username}`
                            );
                            e.target.onerror = null;
                            e.target.src = `/static/uploads/avatar/system/avatar.png`;
                          }}
                        />

                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography
                              component={Link}
                              to={`/profile/${user.username}`}
                              variant='subtitle1'
                              sx={{
                                fontWeight: 'bold',
                                textDecoration: 'none',
                                color: 'text.primary',
                                '&:hover': {
                                  textDecoration: 'underline',
                                },
                              }}
                            >
                              {user.name}
                            </Typography>
                            {user.verification_status === 'verified' && (
                              <VerifiedIcon
                                sx={{
                                  fontSize: 16,
                                  ml: 0.5,
                                  color: '#D0BCFF',
                                }}
                              />
                            )}
                          </Box>
                          <Typography variant='body2' color='text.secondary'>
                            @{user.username}
                          </Typography>
                        </Box>

                        {isAuthenticated && user.id !== user?.id && (
                          <Button
                            variant='outlined'
                            size='small'
                            color='primary'
                            onClick={e => {
                              e.stopPropagation();
                              handleFollowToggle(user.id);
                            }}
                            startIcon={
                              followingStatus[user.id] ? (
                                <PersonRemoveIcon />
                              ) : (
                                <PersonAddIcon />
                              )
                            }
                            sx={{
                              borderRadius: 6,
                              textTransform: 'none',
                              borderColor: followingStatus[user.id]
                                ? 'rgba(255, 255, 255, 0.2)'
                                : '#D0BCFF',
                              color: followingStatus[user.id]
                                ? 'text.secondary'
                                : '#D0BCFF',
                              zIndex: 2,
                            }}
                          >
                            {followingStatus[user.id]
                              ? 'Отписаться'
                              : 'Подписаться'}
                          </Button>
                        )}
                      </Box>
                    </UserCard>
                  ))}
                </List>

                {hasMoreUsers && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <Button
                      variant='outlined'
                      color='primary'
                      onClick={loadMoreResults}
                      disabled={loading}
                      sx={{
                        borderRadius: 6,
                        textTransform: 'none',
                      }}
                    >
                      {loading ? (
                        <CircularProgress size={24} />
                      ) : (
                        'Загрузить еще'
                      )}
                    </Button>
                  </Box>
                )}
              </Paper>
            )}
          </TabPanel>

          <TabPanel value={searchType} index={2}>
            {posts.length === 0 ? (
              <NoResultsContainer>
                <Typography variant='h6' color='text.secondary' gutterBottom>
                  Посты не найдены
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  Попробуйте изменить поисковый запрос
                </Typography>
              </NoResultsContainer>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {posts.map((post, index) => (
                  <Card
                    key={`${post.id}-${index}`}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 2,
                      overflow: 'hidden',
                      textDecoration: 'none',
                      background: `linear-gradient(145deg, ${themeSettings.paperColor} 0%, rgba(26, 26, 26, 0.9) 100%)`,
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0  12px rgba(0, 0, 0, 0.15)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        pt: 2,
                        px: 2,
                      }}
                    >
                      <Avatar
                        src={
                          post.user.photo && post.user.photo !== 'avatar.png'
                            ? post.user.photo.startsWith('/')
                              ? post.user.photo
                              : `/static/uploads/avatar/${post.user.id}/${post.user.photo}`
                            : `/static/uploads/avatar/system/avatar.png`
                        }
                        alt={post.user.name}
                        component={Link}
                        to={`/profile/${post.user.username}`}
                        sx={{
                          width: 40,
                          height: 40,
                          mr: 1.5,
                          border: '2px solid #D0BCFF',
                        }}
                        onError={e => {
                          console.error(`Failed to load user avatar for post`);
                          e.target.onerror = null;
                          e.target.src = `/static/uploads/avatar/system/avatar.png`;
                        }}
                      />
                      <Box>
                        <Typography
                          variant='subtitle1'
                          component={Link}
                          to={`/profile/${post.user.username}`}
                          sx={{
                            fontWeight: 'bold',
                            textDecoration: 'none',
                            color: 'text.primary',
                            '&:hover': {
                              textDecoration: 'underline',
                            },
                          }}
                        >
                          {post.user.name}
                        </Typography>
                        <Typography
                          variant='caption'
                          color='text.secondary'
                          component={Link}
                          to={`/profile/${post.user.username}`}
                          sx={{ textDecoration: 'none' }}
                        >
                          @{post.user.username}
                        </Typography>
                      </Box>
                      <Box sx={{ ml: 'auto' }}>
                        <Typography variant='caption' color='text.secondary'>
                          {new Date(post.timestamp).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        px: 2,
                        pt: 1.5,
                        pb: post.image || post.video ? 0 : 1,
                      }}
                    >
                      <Typography
                        variant='body2'
                        component={Link}
                        to={`/post/${post.id}`}
                        sx={{
                          mb: 1.5,
                          display: 'block',
                          textDecoration: 'none',
                          color: 'text.primary',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {post.content}
                      </Typography>
                    </Box>

                    {post.image && (
                      <Box
                        sx={{
                          position: 'relative',
                          mt: 1,
                          cursor: 'pointer',
                        }}
                        component={Link}
                        to={`/post/${post.id}`}
                      >
                        <img
                          src={
                            post.image.startsWith('/')
                              ? post.image
                              : `/static/uploads/post/${post.id}/${post.image}`
                          }
                          alt='Post image'
                          style={{
                            width: '100%',
                            height: '250px',
                            objectFit: 'cover',
                            backgroundColor: '#111',
                          }}
                          onClick={e => {
                            e.preventDefault();
                            handleOpenPostImage(
                              post.image.startsWith('/')
                                ? post.image
                                : `/static/uploads/post/${post.id}/${post.image}`,
                              [
                                post.image.startsWith('/')
                                  ? post.image
                                  : `/static/uploads/post/${post.id}/${post.image}`,
                              ],
                              0
                            );
                          }}
                          onError={e => {
                            console.error('Failed to load post image');
                            e.target.src = `/static/uploads/avatar/system/avatar.png`;
                          }}
                        />
                      </Box>
                    )}

                    {post.video && (
                      <Box
                        sx={{
                          height: 250,
                          mt: 1,
                          backgroundColor: '#111',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                        component={Link}
                        to={`/post/${post.id}`}
                      >
                        <video
                          src={
                            post.video.startsWith('/')
                              ? post.video
                              : `/static/uploads/post/${post.id}/${post.video}`
                          }
                          style={{
                            maxHeight: '100%',
                            maxWidth: '100%',
                            objectFit: 'contain',
                          }}
                          onError={e => {
                            console.error('Failed to load post video');
                            e.target.src = `/static/uploads/avatar/system/avatar.png`;
                          }}
                        />
                      </Box>
                    )}

                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 2,
                        gap: 2,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton size='small' sx={{ mr: 0.5 }}>
                          <ThumbUpOutlinedIcon fontSize='small' />
                        </IconButton>
                        <Typography variant='body2'>
                          {post.likes || post.likes_count || 0}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton size='small' sx={{ mr: 0.5 }}>
                          <ChatBubbleOutlineIcon fontSize='small' />
                        </IconButton>
                        <Typography variant='body2'>
                          {post.comments ||
                            post.comments_count ||
                            post.total_comments ||
                            0}
                        </Typography>
                      </Box>
                      <Button
                        variant='text'
                        size='small'
                        component={Link}
                        to={`/post/${post.id}`}
                        sx={{
                          ml: 'auto',
                          textTransform: 'none',
                          borderRadius: '20px',
                        }}
                      >
                        Открыть
                      </Button>
                    </Box>
                  </Card>
                ))}

                {hasMorePosts && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <Button
                      variant='outlined'
                      color='primary'
                      onClick={loadMoreResults}
                      disabled={loading}
                      sx={{
                        borderRadius: 6,
                        textTransform: 'none',
                      }}
                    >
                      {loading ? (
                        <CircularProgress size={24} />
                      ) : (
                        'Загрузить еще'
                      )}
                    </Button>
                  </Box>
                )}
              </Box>
            )}
          </TabPanel>
        </>
      )}

      <SimpleImageViewer
        isOpen={lightboxOpen}
        onClose={handleCloseLightbox}
        images={lightboxImages}
        initialIndex={currentImageIndex}
      />
    </Container>
  );
};

export default SearchPage;
