import React, { useState, useEffect, useContext, useRef, useCallback, useMemo } from 'react';
import { 
  Box, 
  Typography,
  Container,
  Card,
  Avatar,
  Button,
  CircularProgress,
  Divider,
  Paper,
  IconButton,
  styled,
  InputBase,
  Tooltip,
  Snackbar,
  useTheme,
  ImageList,
  ImageListItem,
  Alert,
  Dialog,
} from '@mui/material';
import StyledTabs from '../../UIKIT/StyledTabs';
import './MainPage.css';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import axios from '../../services/axiosConfig';
import { handleImageError as safeImageError } from '../../utils/imageUtils';

import CloseIcon from '@mui/icons-material/Close';

import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { Post } from '../../components/Post';
import RepostItem from '../../components/RepostItem';
import PostSkeleton from '../../components/Post/PostSkeleton';

import MusicNoteIcon from '@mui/icons-material/MusicNote';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import { MusicContext } from '../../context/MusicContext';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';


import TimerIcon from '@mui/icons-material/Timer';
import UpdateInfo from '../../components/Updates/UpdateInfo';
import UpdateService from '../../services/UpdateService';
import SimpleImageViewer from '../../components/SimpleImageViewer';
import DynamicIslandNotification from '../../components/DynamicIslandNotification';
import WarningIcon from '@mui/icons-material/Warning';
import FavoriteIcon from '@mui/icons-material/Favorite';
import StarIcon from '@mui/icons-material/Star';
import { usePageCommands } from '../../context/CommandPalleteContext';
import ReactMarkdown from 'react-markdown';
import MarkdownContent from '../../components/Post/MarkdownContent';
import CreatePost from '../../components/CreatePost/CreatePost';
import { usePostActions } from '../User/ProfilePage/hooks/usePostActions';









const OnlineUsersCard = styled(Card)(({ theme }) => ({
  borderRadius: '12px',
  overflow: 'hidden',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  background: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(20px)',
  border: theme.palette.mode === 'dark' 
    ? '1px solid rgba(255, 255, 255, 0.1)' 
    : '1px solid rgba(0, 0, 0, 0.1)'
}));



const OnlineUsers = () => {
  const { t } = useLanguage();
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const theme = useTheme();
  
  useEffect(() => {
    const fetchOnlineUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/users/online?limit=1200');
        
        if (Array.isArray(response.data)) {
          setOnlineUsers(response.data);
        } else if (response.data && Array.isArray(response.data.users)) {
          setOnlineUsers(response.data.users);
        } else {
          setOnlineUsers([]);
        }
      } catch (error) {
        console.error('Error fetching online users:', error);
        setOnlineUsers([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOnlineUsers();
    
    
    const interval = setInterval(fetchOnlineUsers, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleUserClick = (username) => {
    navigate(`/profile/${username}`);
  };
  
  if (loading) {
    return (
      <OnlineUsersCard sx={{ p: 1, minHeight: 56, display: 'flex', alignItems: 'center' }}>
        <CircularProgress size={18} sx={{ mr: 1 }} />
        <Typography variant="body2" sx={{ fontSize: '0.95rem' }}>{t('main_page.loading')}</Typography>
      </OnlineUsersCard>
    );
  }
  
  if (onlineUsers.length === 0) {
    return null;
  }
  
  return (
    <OnlineUsersCard sx={{ p: 1, minHeight: 56, display: 'flex', alignItems: 'center', overflowX: 'auto' }}>
      <Box sx={{
        display: 'flex',
        flexWrap: 'nowrap',
        gap: 1,
        overflowX: 'auto',
        pb: 0,
        '&::-webkit-scrollbar': { height: '0px', display: 'none' },
        msOverflowStyle: 'none',
        scrollbarWidth: 'none',
      }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            px: 1,
            py: 0.5,
            borderRadius: '12px',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            border: '1px solid rgba(76, 175, 80, 0.2)',
            minWidth: 'fit-content',
            height: 36,
            mr: 0.5
          }}
        >
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#4caf50',
              boxShadow: '0 0 8px rgba(76, 175, 80, 0.5)'
            }}
          />
          <Typography
            variant="body2"
            sx={{
              fontSize: '0.75rem',
              fontWeight: 500,
              color: '#4caf50'
            }}
          >
            {t('main_page.online_count', { count: onlineUsers.length })}
          </Typography>
        </Box>
        {onlineUsers.map(user => (
          <Box
            key={user.id}
            sx={{ position: 'relative', cursor: 'pointer', mx: 0.25 }}
            onClick={() => handleUserClick(user.username)}
          >
            <Avatar
              src={user?.photo || '/static/uploads/system/avatar.png'}
              alt={user?.username || 'User'}
              sx={{
                width: 36,
                height: 36,
                border: `2px solid ${theme.palette.background.paper}`,
                boxSizing: 'border-box',
                background: '#222',
              }}
              onError={safeImageError}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: 2,
                right: 2,
                width: 9,
                height: 9,
                borderRadius: '50%',
                backgroundColor: '#4caf50',
                border: `1.5px solid ${theme.palette.background.paper}`,
                boxSizing: 'border-box',
              }}
            />
          </Box>
        ))}
      </Box>
    </OnlineUsersCard>
  );
};

const UserRecommendation = ({ user }) => {
  const { t } = useLanguage();
  const [following, setFollowing] = useState(user.is_following || false);
  const { user: currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const handleFollow = async (e) => {
    e.stopPropagation();
    try {
      setFollowing(!following);
      
      const response = await axios.post(`/api/profile/follow`, {
        followed_id: user.id
      });
      
      if (response.data && response.data.success) {
        setFollowing(response.data.is_following);
      }
    } catch (error) {
      setFollowing(following);
      console.error('Error toggling follow:', error);
    }
  };
  
  const handleCardClick = () => {
    navigate(`/profile/${user.username}`);
  };

  const getAvatarSrc = () => {
    if (!user?.photo) return '/static/uploads/system/avatar.png';
    
    if (user.photo.startsWith('/') || user.photo.startsWith('http')) {
      return user.photo;
    }
    
    return `/static/uploads/avatar/${user.id}/${user.photo}`;
  };
  
  const isChannelAccount = currentUser && currentUser.account_type === 'channel';
  
  return (
    <div 
      className="user-recommendation"
      onClick={handleCardClick} 
    >
      <div className="user-recommendation-content">
        <div className="user-info">
          <img 
            src={getAvatarSrc()}
            alt={user.name || user.username}
            className="user-avatar-large"
            onError={safeImageError}
          />
          <div className="user-details">
            <div className="user-name">
              {user.name || user.username}
            </div>
            <div className="user-username">
              <span className="username-text">
                @{user.username}
              </span>
              {user.is_verified && (
                <span className="verified-badge">
                  ✓
                </span>
              )}
            </div>
          </div>
          
          {!isChannelAccount && (
            <button
              className={`follow-button ${following ? 'following' : ''}`}
              onClick={handleFollow}
            >
              {following ? t('main_page.follow.unfollow') : t('main_page.follow.follow')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};


const MainPage = React.memo(() => {
  const { user } = useContext(AuthContext);
  const { t } = useLanguage();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);
  const [trendingBadges, setTrendingBadges] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [feedType, setFeedType] = useState('all'); 
  const [requestId, setRequestId] = useState(0); 
  const isFirstRender = useRef(true); 
  const feedTypeChanged = useRef(false); 
  const navigate = useNavigate(); 
  const loadingMoreRef = useRef(false); 
  const loaderRef = useRef(null); 
  
  const { handlePostCreated } = usePostActions();
  
  
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxImages, setLightboxImages] = useState([]);

  const [latestUpdate, setLatestUpdate] = useState(null);
  
  // Перемещаем usePageCommands в начало, сразу после всех useState
  usePageCommands([
		{
			id: 'cmd_reload_posts',
			title: t(`commands.cmd_reload_posts.title`),
			description: t(`commands.cmd_reload_posts.description`),
			action: async () => {
					console.log(`FEED TYPE CHANGED TO: ${feedType} - LOADING NEW POSTS`)
					try {
						setLoading(true)
						setPosts([])

						const params = {
							page: 1,
							per_page: 20,
							sort: feedType,
							include_all: feedType === 'all',
						}

						const currentRequestId = requestId + 1
						setRequestId(currentRequestId)

						let response
						try {
							response = await axios.get('/api/posts/feed', { params })
						} catch (apiError) {
							console.error(`Error in API call for ${feedType} feed:`, apiError)

							if (feedType === 'recommended') {
								setHasMore(false)
								setPosts([])
								setLoading(false)
								feedTypeChanged.current = false
								return
							}

							throw apiError
						}

						if (requestId !== currentRequestId - 1) return

						if (response.data && Array.isArray(response.data.posts)) {
							// Дедупликация постов по ID
							const uniquePosts = response.data.posts.filter((post, index, self) => 
								index === self.findIndex(p => p.id === post.id)
							);
							setPosts(uniquePosts)
							setHasMore(response.data.has_next === true)
							setPage(2)
						} else {
							setPosts([])
							setHasMore(false)
						}
					} catch (error) {
						console.error(`Error loading ${feedType} posts:`, error)
						setPosts([])
						setHasMore(false)
					} finally {
						setLoading(false)
						feedTypeChanged.current = false
					}
				},
      
			keywords: ['посты', 'обновить', 'лайк', 'коменты'],
			group: 'global',
		},
	])
  
  useEffect(() => {
    const options = {
      root: null, 
      rootMargin: '0px',
      threshold: 0.1 
    };

    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !loading && !loadingMoreRef.current && !feedTypeChanged.current) {
        loadMorePosts();
      }
    }, options);

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [hasMore, loading, posts.length, feedType]);
  
  useEffect(() => {
    if (!isFirstRender.current) return; 
    
    const initialLoad = async () => {
      console.log("INITIAL MOUNT - ONE TIME LOAD");
      try {
        setLoading(true);
        setPosts([]);
        
        const params = {
          page: 1,
          per_page: 20,
          sort: feedType,
          include_all: feedType === 'all'
        };
        
        
        const currentRequestId = requestId + 1;
        setRequestId(currentRequestId);
        
        const response = await axios.get('/api/posts/feed', { params });
        
        
        if (requestId !== currentRequestId - 1) return;
        
        if (response.data && Array.isArray(response.data.posts)) {
          // Дедупликация постов по ID
          const uniquePosts = response.data.posts.filter((post, index, self) => 
            index === self.findIndex(p => p.id === post.id)
          );
          setPosts(uniquePosts);
          setHasMore(response.data.has_next === true);
          setPage(2);
        } else {
          setPosts([]);
          setHasMore(false);
        }
      } catch (error) {
        console.error('Error loading initial posts:', error);
        setPosts([]);
        setHasMore(false);
      } finally {
        setLoading(false);
        isFirstRender.current = false; 
      }
    };
    
    initialLoad();
    
    
  }, []);
  
  
  useEffect(() => {
    
    if (isFirstRender.current) return;
    
    
    feedTypeChanged.current = true;
    
    const loadFeedPosts = async () => {
      console.log(`FEED TYPE CHANGED TO: ${feedType} - LOADING NEW POSTS`);
      try {
        setLoading(true);
        setPosts([]);
        
        const params = {
          page: 1,
          per_page: 20,
          sort: feedType,
          include_all: feedType === 'all'
        };
        
        
        const currentRequestId = requestId + 1;
        setRequestId(currentRequestId);
        
        
        let response;
        try {
          response = await axios.get('/api/posts/feed', { params });
        } catch (apiError) {
          console.error(`Error in API call for ${feedType} feed:`, apiError);
          
          
          if (feedType === 'recommended') {
            
            setHasMore(false);
            setPosts([]);
            setLoading(false);
            feedTypeChanged.current = false;
            return;
          }
          
          
          throw apiError;
        }
        
        
        if (requestId !== currentRequestId - 1) return;
        
        if (response.data && Array.isArray(response.data.posts)) {
          // Дедупликация постов по ID
          const uniquePosts = response.data.posts.filter((post, index, self) => 
            index === self.findIndex(p => p.id === post.id)
          );
          setPosts(uniquePosts);
          setHasMore(response.data.has_next === true);
          setPage(2);
        } else {
          setPosts([]);
          setHasMore(false);
        }
      } catch (error) {
        console.error(`Error loading ${feedType} posts:`, error);
        setPosts([]);
        setHasMore(false);
      } finally {
        setLoading(false);
        feedTypeChanged.current = false; 
      }
    };
    
    loadFeedPosts();
    
    
  }, [feedType]);
  
  
  useEffect(() => {
    
    if (!isFirstRender.current) return;
    
    const fetchRecommendations = async () => {
      try {
        setLoadingRecommendations(true);
        
        
        if (recommendations.length > 0) {
          setLoadingRecommendations(false);
          return;
        }
        
        
        try {
          const response = await axios.get('/api/users/recent-channels', { timeout: 5000 });
          if (Array.isArray(response.data)) {
            setRecommendations(response.data || []);
          } else {
            
            console.log('Unexpected response format:', response.data);
            setRecommendations([]);
          }
        } catch (error) {
          console.error('Error fetching recent channels:', error);
          
          setRecommendations([]);
        }
      } finally {
        setLoadingRecommendations(false);
      }
    };

    fetchRecommendations();
    
  }, []);


  
  const loadMorePosts = async () => {
    if (loading || !hasMore || feedTypeChanged.current || loadingMoreRef.current) return;
    
    try {
      loadingMoreRef.current = true;
      setLoading(true);
      
      const currentPage = page;
      
      const params = {
        page: currentPage,
        per_page: 10, 
        sort: feedType,
        include_all: feedType === 'all'
      };
      
      const currentRequestId = requestId + 1;
      setRequestId(currentRequestId);
      
      setPage(currentPage + 1);
      
      const response = await axios.get('/api/posts/feed', { params });
      
      if (requestId !== currentRequestId - 1) return;
      
      if (response.data && Array.isArray(response.data.posts)) {
        setPosts(prev => {
          const existingPostIds = new Set(prev.map(p => p.id));
          const newPosts = response.data.posts.filter(post => !existingPostIds.has(post.id));
          return [...prev, ...newPosts];
        });
        setHasMore(response.data.has_next === true && response.data.posts.length > 0);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more posts:', error);
      setHasMore(false);
    } finally {
      setLoading(false);
      loadingMoreRef.current = false;
    }
  };
  
  const handlePostCreatedLocal = (newPost, deletedPostId = null) => {
    if (axios.cache) {
      axios.cache.clearPostsCache();
      axios.cache.clearByUrlPrefix('/api/posts/feed');
      axios.cache.clearByUrlPrefix('/api/profile/pinned_post');
    }
    
    if (deletedPostId) {
      setPosts(prevPosts => prevPosts.filter(p => p.id !== deletedPostId));
      return;
    }
    
    if (!newPost) {
      setPosts([]); 
      setPage(1); 
      
      const refreshFeed = async () => {
        try {
          setLoading(true);
          const params = {
            page: 1,
            per_page: 20,
            sort: feedType,
            include_all: feedType === 'all'
          };
          
          const currentRequestId = requestId + 1;
          setRequestId(currentRequestId);
          
          const response = await axios.get('/api/posts/feed', { 
            params,
            forceRefresh: true
          });
          
          if (requestId !== currentRequestId - 1) return;
          
          if (response.data && Array.isArray(response.data.posts)) {
            // Дедупликация постов по ID
            const uniquePosts = response.data.posts.filter((post, index, self) => 
              index === self.findIndex(p => p.id === post.id)
            );
            setPosts(uniquePosts);
            setHasMore(response.data.has_next === true);
            setPage(2);
          } else {
            setPosts([]);
            setHasMore(false);
          }
        } catch (error) {
          console.error(`Error refreshing ${feedType} posts:`, error);
          setPosts([]);
          setHasMore(false);
        } finally {
          setLoading(false);
        }
      };
      
      refreshFeed();
      return;
    }
    
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };

  const handleDeletePost = (postId, updatedPost) => {
    if (updatedPost) {
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id.toString() === postId.toString() ? updatedPost : post
        )
      );
    } else {
      setPosts(prevPosts => 
        prevPosts.filter(post => post.id.toString() !== postId.toString())
      );
    }
  };
  
  const handleFollow = async (userId, isFollowing) => {
    try {
      await axios.post('/api/profile/follow', { followed_id: userId });
    } catch (error) {
      console.error("Error following user:", error);
      setRecommendations(recommendations.map(rec => 
        rec.id === userId 
          ? { ...rec, isFollowing: !isFollowing } 
          : rec
      ));
    }
  };
  
  const handleOpenLightbox = (image, allImages, index) => {
    setCurrentImage(image);
    setLightboxImages(Array.isArray(allImages) ? allImages : [image]);
    setCurrentImageIndex(index || 0);
    setLightboxOpen(true);
  };
  
  const handleCloseLightbox = () => {
    setLightboxOpen(false);
  };
  
  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) => {
      const nextIndex = (prevIndex + 1) % lightboxImages.length;
      setCurrentImage(lightboxImages[nextIndex]);
      return nextIndex;
    });
  };
  
  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) => {
      const nextIndex = (prevIndex - 1 + lightboxImages.length) % lightboxImages.length;
      setCurrentImage(lightboxImages[nextIndex]);
      return nextIndex;
    });
  };
  
  useEffect(() => {
    const update = UpdateService.getLatestUpdate();
    setLatestUpdate(update);
  }, []);

  // Обработчик глобального события удаления постов
  useEffect(() => {
    const handleGlobalPostDeleted = (event) => {
      const { postId } = event.detail;
      if (postId) {
        setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
      }
    };
    
    window.addEventListener('post-deleted', handleGlobalPostDeleted);
    
    return () => {
      window.removeEventListener('post-deleted', handleGlobalPostDeleted);
    };
  }, []);

  // Обработчик глобального события создания постов
  useEffect(() => {
    const handleGlobalPostCreated = (event) => {
      const newPost = event.detail;
      if (newPost && (!newPost.type || newPost.type === 'post')) {
        setPosts(prevPosts => [newPost, ...prevPosts]);
      }
    };
    
    window.addEventListener('post_created', handleGlobalPostCreated);
    
    return () => {
      window.removeEventListener('post_created', handleGlobalPostCreated);
    };
  }, []);
  
  return (
    <Container maxWidth="lg" sx={{ 
      mt: 2, 
      mb: 0,
      px: { xs: 0.5, sm: 0 },
      width: '100%',
      maxWidth: '100%',
      overflow: { xs: 'hidden', md: 'visible' },
      pb: { xs: '100px', sm: 0 }
    }}>
      <div className="content-container">
        <div className="left-column">
          <OnlineUsers />
          <CreatePost onPostCreated={handlePostCreated} postType="post" />
          
          
          <StyledTabs
            value={feedType}
            onChange={(event, newValue) => setFeedType(newValue)}
            tabs={[
              { value: 'all', label: t('main_page.feed.tabs.all') },
              { value: 'following', label: t('main_page.feed.tabs.following') },
              { value: 'recommended', label: t('main_page.feed.tabs.recommended') }
            ]}
            fullWidth
            customStyle
          />
          
          
          <Box sx={{ mt: 0 }}>
            {loading && posts.length === 0 ? (
              
              <>
                {[...Array(5)].map((_, index) => (
                  <PostSkeleton key={index} />
                ))}
              </>
            ) : posts.length > 0 ? (
              <Box sx={{ mt: 0 }}>
                {posts.map((post, index) => (
                  post.is_repost ? (
                    <RepostItem key={`${post.id}-${index}`} post={post} />
                  ) : (
                    <Post 
                      key={`${post.id}-${index}`} 
                      post={post} 
                      showPostDetails={false}
                      onOpenLightbox={handleOpenLightbox}
                      onDelete={handleDeletePost}
                    />
                  )
                ))}
                
                
                {hasMore && (
                  <Box 
                    ref={loaderRef}
                    sx={{ 
                      textAlign: 'center', 
                      py: 2, 
                      opacity: loading ? 1 : 0,
                      transition: 'opacity 0.3s ease'
                    }}
                  >
                    {loading && (
                      <CircularProgress size={30} sx={{ color: 'primary.main' }} />
                    )}
                  </Box>
                )}
                
                
                {!hasMore && (
                  <Box sx={{ 
                    textAlign: 'center', 
                    py: 3,
                    opacity: 0.7
                  }}>
                    <Typography variant="body2" color="text.secondary">
                      {t('main_page.feed.end')}
                    </Typography>
                  </Box>
                )}
              </Box>
            ) : (
              <Box sx={{ 
                textAlign: 'center', 
                py: 4,
                mt: 2
              }}>
                <Typography color="text.secondary">
                  {t('main_page.feed.empty')}
                </Typography>
              </Box>
            )}
          </Box>
        </div>
        
        <div className="right-column">
          
          <Box 
            component={Paper} 
            sx={{ 
              p: 0, 
              borderRadius: '12px', 
              mb: -0.625,
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              overflow: 'hidden',
              display: { xs: 'none', sm: 'block' } 
            }}
          >

            
            {loadingRecommendations ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3, px: 2 }}>
                <Box sx={{ 
                  width: '100%', 
                  height: 170,
                  '@keyframes pulse': {
                    '0%': { opacity: 1 },
                    '50%': { opacity: 0.5 },
                    '100%': { opacity: 1 }
                  }
                }}>
                  <Box sx={{ 
                    width: '100%', 
                    height: 50, 
                    borderRadius: '8px',
                    backgroundColor: '#292929',
                    mb: 1,
                    animation: 'pulse 2s infinite'
                  }} />
                  <Box sx={{ 
                    width: '100%', 
                    height: 50, 
                    borderRadius: '8px',
                    backgroundColor: '#292929',
                    mb: 1,
                    animation: 'pulse 2s infinite'
                  }} />
                  <Box sx={{ 
                    width: '100%', 
                    height: 50, 
                    borderRadius: '8px',
                    backgroundColor: '#292929',
                    animation: 'pulse 2s infinite'
                  }} />
                </Box>
              </Box>
            ) : recommendations.length === 0 ? (
              <Box sx={{ 
                textAlign: 'center', 
                py: 3, 
                px: 2,
                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.01), rgba(255, 255, 255, 0.03))'
              }}>
                <Avatar 
                  sx={{ 
                    width: 50, 
                    height: 50, 
                    mx: 'auto', 
                    mb: 2,
                    bgcolor: 'rgba(208, 188, 255, 0.1)',
                    border: '1px solid rgba(208, 188, 255, 0.25)'
                  }}
                >
                  <PersonAddIcon sx={{ color: '#D0BCFF', fontSize: 26 }} />
                </Avatar>
                <Typography variant="body2" sx={{ fontWeight: 500, color: theme => theme.palette.text.secondary }}>
                  {t('main_page.recommendations.empty.title')}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', mt: 1, maxWidth: '80%', mx: 'auto', color: theme => theme.palette.text.disabled }}>
                  {t('main_page.recommendations.empty.description')}
                </Typography>
              </Box>
            ) : (
              <Box>
                {recommendations.map((channel, index) => (
                  <Box key={channel.id}>
                    <UserRecommendation user={channel} />
                    {index < recommendations.length - 1 && (
                      <Divider sx={{ opacity: 0.1, mx: 2 }} />
                    )}
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          {latestUpdate && (
            <Box 
              sx={{ 
                mb: 2, 
                display: { xs: 'none', sm: 'block' },
                '&:hover': {
                  '& > *': { transform: 'translateY(-2px)' },
                  cursor: 'pointer'
                }
              }}
              onClick={() => navigate('/updates')}
            >
              <UpdateInfo 
                version={latestUpdate.version}
                date={latestUpdate.date}
                title={latestUpdate.title}
                updates={latestUpdate.updates}
                fixes={latestUpdate.fixes}
                hideHeader={true}
              />
            </Box>
          )}
        </div>
      </div>
      
      
      <SimpleImageViewer 
        isOpen={lightboxOpen}
        onClose={handleCloseLightbox}
        images={lightboxImages}
        initialIndex={currentImageIndex}
      />
    </Container>
  );
});

export default MainPage; 