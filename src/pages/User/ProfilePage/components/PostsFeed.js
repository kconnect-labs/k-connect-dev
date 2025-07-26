import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useContext,
} from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import axios from 'axios';
import { AuthContext } from '../../../../context/AuthContext';
import { useLanguage } from '../../../../context/LanguageContext';
import FeedIcon from '@mui/icons-material/Feed';
import ImageIcon from '@mui/icons-material/Image';

import Post from '../../../../components/Post/Post';
import PostSkeleton from '../../../../components/Post/PostSkeleton';
import AttachmentsFeed from './AttachmentsFeed';

const PostsFeed = ({ userId, statusColor }) => {
  const { t } = useLanguage();
  const [posts, setPosts] = useState([]);
  const [pinnedPost, setPinnedPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0); // 0 - посты, 1 - вложения
  const checkedPinnedPostsRef = useRef(new Set());
  const observer = useRef();

  const isMounted = useRef(true);
  const loadingRef = useRef(false);
  const { isAuthenticated } = useContext(AuthContext);
  const isProfilePage = window.location.pathname.includes('/profile/');


  // username вычисляем один раз
  const username = React.useMemo(() => {
    const match = window.location.pathname.match(/\/profile\/([^/?#]+)/);
    return match ? match[1] : null;
  }, [window.location.pathname]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchPinnedPost = useCallback(
    async username => {
      if (!isProfilePage || !username) return null;
      if (checkedPinnedPostsRef.current.has(username)) {
        return pinnedPost;
      }
      try {
        const response = await axios.get(
          `/api/profile/pinned_post/${username}`
        );
        if (
          isMounted.current &&
          response.data &&
          response.data.success &&
          response.data.post
        ) {
          setPinnedPost(response.data.post);
          checkedPinnedPostsRef.current.add(username);
          return response.data.post;
        }
        // Если нет закрепленного поста или пользователь не найден, просто возвращаем null
        setPinnedPost(null);
        checkedPinnedPostsRef.current.add(username);
        return null;
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setPinnedPost(null);
          checkedPinnedPostsRef.current.add(username);
          return null;
        }
        console.error('Ошибка при загрузке закрепленного поста:', error);
        setPinnedPost(null);
        checkedPinnedPostsRef.current.add(username);
        return null;
      }
    },
    [isProfilePage]
  );

  // fetchPosts больше не вызывает fetchPinnedPost
  const fetchPosts = useCallback(
    async (pageNumber = 1) => {
      if (loadingRef.current) return;
      try {
        loadingRef.current = true;
        if (pageNumber === 1) {
          setLoading(true);
        } else {
          setIsLoadingMore(true);
        }
        const response = await axios.get(`/api/profile/${userId}/posts`, {
          params: {
            page: pageNumber,
            per_page: 10,
          },
          forceRefresh: true,
        });
        if (!isMounted.current) return;
        if (response.data.posts && Array.isArray(response.data.posts)) {
          // Дедупликация постов по ID
          const uniqueNewPosts = response.data.posts.filter(
            (post, index, self) =>
              index === self.findIndex(p => p.id === post.id)
          );

          if (pageNumber === 1) {
            setPosts(uniqueNewPosts);
          } else {
            setPosts(prevPosts => {
              const prevArray = Array.isArray(prevPosts) ? prevPosts : [];
              const existingPostIds = new Set(prevArray.map(p => p.id));
              const filteredNewPosts = uniqueNewPosts.filter(
                post => !existingPostIds.has(post.id)
              );
              return [...prevArray, ...filteredNewPosts];
            });
          }
          setHasMore(response.data.has_next);
        } else {
          if (pageNumber === 1) {
            setPosts([]);
          }
          setHasMore(false);
        }
      } catch (error) {
        console.error('Ошибка при загрузке постов:', error);
        if (isMounted.current) {
          if (error.response && error.response.status === 401) {
            setError(t('profile.feed.posts.auth_required'));
          } else {
            setError(t('profile.feed.posts.loading_error'));
          }
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
          setIsLoadingMore(false);
          loadingRef.current = false;
        }
      }
    },
    [userId, t]
  );

  // useEffect для pinnedPost (только один раз на username)
  useEffect(() => {
    if (username) {
      fetchPinnedPost(username);
    }
  }, [username, fetchPinnedPost]);

  useEffect(() => {
    if (userId) {
      setPage(1);
      setPosts([]);
      setPinnedPost(null);
      setHasMore(true);
      checkedPinnedPostsRef.current = new Set();
      fetchPosts(1);
    }
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [userId, fetchPosts]);

  const lastPostElementRef = useCallback(
    node => {
      if (loading || isLoadingMore || !hasMore) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        entries => {
          if (entries[0].isIntersecting && hasMore && !loadingRef.current) {
            setPage(prevPage => prevPage + 1);
          }
        },
        { threshold: 0.5 }
      );

      if (node) observer.current.observe(node);
    },
    [loading, isLoadingMore, hasMore]
  );

  useEffect(() => {
    if (page > 1) {
      fetchPosts(page);
    }
  }, [page, fetchPosts]);

  const handleDeletePost = (postId, updatedPost) => {
    if (updatedPost) {
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id.toString() === postId.toString() ? updatedPost : post
        )
      );
      if (pinnedPost && pinnedPost.id.toString() === postId.toString()) {
        setPinnedPost(updatedPost);
      }
    } else {
      setPosts(prevPosts =>
        prevPosts.filter(post => post.id.toString() !== postId.toString())
      );
      if (pinnedPost && pinnedPost.id.toString() === postId.toString()) {
        setPinnedPost(null);
      }
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  useEffect(() => {
    const handleGlobalPostCreated = event => {
      const newPost = event.detail;

      // Добавляем пост в ленту если:
      // 1. Это обычный пост (type === 'post' или не указан) и автор совпадает с userId
      // 2. Это не пост стены (type !== 'stena')
      const userIdMatch =
        newPost && newPost.user && newPost.user.id === parseInt(userId);
      const typeMatch = !newPost.type || newPost.type === 'post';

      if (newPost && userIdMatch && typeMatch) {
        setPosts(prevPosts => {
          const newPosts = [newPost, ...prevPosts];
          return newPosts;
        });
      }
    };

    window.addEventListener('post_created', handleGlobalPostCreated);

    return () => {
      window.removeEventListener('post_created', handleGlobalPostCreated);
    };
  }, [userId]);

  if (loading && posts.length === 0) {
    return (
      <Box sx={{ mt: 2 }}>
        {[1, 2, 3].map((_, index) => (
          <PostSkeleton key={index} />
        ))}
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          textAlign: 'center',
          py: 4,
          px: 3,
          bgcolor: 'background.paper',
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <FeedIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
        <Typography variant='h6' color='text.primary' gutterBottom>
          {error === t('profile.feed.posts.auth_required')
            ? t('profile.feed.posts.auth_required')
            : t('profile.feed.posts.error_title')}
        </Typography>
        <Typography
          variant='body1'
          color='text.secondary'
          sx={{ maxWidth: 400 }}
        >
          {error === t('profile.feed.posts.auth_required')
            ? t('profile.feed.posts.auth_required_description')
            : error}
        </Typography>
      </Box>
    );
  }

  if (posts.length === 0 && !loading && !pinnedPost) {
    return (
      <Box
        sx={{
          textAlign: 'center',
          py: 4,
          px: 3,
          bgcolor: 'background.paper',
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <FeedIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
        <Typography variant='h6' color='text.primary' gutterBottom>
          {isAuthenticated
            ? t('profile.feed.posts.empty')
            : t('profile.feed.posts.auth_required')}
        </Typography>
        <Typography
          variant='body1'
          color='text.secondary'
          sx={{ maxWidth: 400 }}
        >
          {isAuthenticated
            ? t('profile.feed.posts.empty_description')
            : t('profile.feed.posts.auth_required_description')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 0.5 }}>
      <Paper
        sx={{
          borderRadius: '12px',
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
          overflow: 'hidden',
          mb: '5px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Tabs
          value={activeTab}
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
          <Tab label={t('profile.feed.tabs.posts')} />
          <Tab label={t('profile.feed.tabs.attachments')} />
        </Tabs>
      </Paper>

      {/* Контент вкладок */}
      {activeTab === 0 && (
        <Box>
          {pinnedPost && (
            <Box
              sx={{
                position: 'relative',
              }}
            >
              <Post
                post={pinnedPost}
                onDelete={handleDeletePost}
                showActions
                isPinned
                statusColor={statusColor}
              />
            </Box>
          )}

          {posts.map((post, index) => {
            if (posts.length === index + 1) {
              return (
                <Box ref={lastPostElementRef} key={`${post.id}-${index}`}>
                  <Post
                    post={post}
                    onDelete={handleDeletePost}
                    showActions
                    statusColor={statusColor}
                  />
                </Box>
              );
            } else {
              return (
                <Post
                  key={`${post.id}-${index}`}
                  post={post}
                  onDelete={handleDeletePost}
                  showActions
                  statusColor={statusColor}
                />
              );
            }
          })}

          {isLoadingMore && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}

          {!hasMore && posts.length > 5 && (
            <Box sx={{ textAlign: 'center', py: 2, mt: 2 }}>
              <Typography variant='body2' color='text.secondary'>
                {t('profile.feed.posts.all_loaded')}
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {activeTab === 1 && (
        <AttachmentsFeed userId={userId} statusColor={statusColor} />
      )}
    </Box>
  );
};

export default PostsFeed;
