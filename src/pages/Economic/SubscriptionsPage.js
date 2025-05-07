import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Tabs, 
  Tab, 
  Avatar, 
  Button, 
  Paper, 
  CircularProgress,
  IconButton,
  Skeleton,
  styled,
  useTheme,
  useMediaQuery
} from '@mui/material';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { motion } from 'framer-motion';

const ProfileCard = styled(Paper)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2),
  marginBottom: theme.spacing(1.5),
  borderRadius: theme.spacing(1.5),
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)',
  }
}));

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(4),
}));

const SubscriptionsPage = ({ tabIndex = 0 }) => {
  const { username } = useParams();
  const { user: currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [value, setValue] = useState(tabIndex);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isLoadingFollowers, setIsLoadingFollowers] = useState(false);
  const [isLoadingFollowing, setIsLoadingFollowing] = useState(false);
  const [pageFollowers, setPageFollowers] = useState(1);
  const [pageFollowing, setPageFollowing] = useState(1);
  const [hasMoreFollowers, setHasMoreFollowers] = useState(true);
  const [hasMoreFollowing, setHasMoreFollowing] = useState(true);
  const [profileUser, setProfileUser] = useState(null);
  const [loadingFollow, setLoadingFollow] = useState({});
  
  // Track API request state to prevent duplicate requests
  const [requestState, setRequestState] = useState({
    followersInProgress: false,
    followingInProgress: false,
    profileInProgress: false,
  });
  
  // Cache for API responses
  const responseCache = useRef({
    followers: {}, // username_page -> data
    following: {}, // username_page -> data
    profile: {},   // username -> data
  });
  
  const loaderRef = useRef(null);
  
  // Fetch user profile data with cache
  const fetchUserData = useCallback(async () => {
    try {
      const targetUsername = username || currentUser?.username;
      if (!targetUsername) {
        setProfileUser(currentUser);
        return;
      }
      
      if (currentUser && targetUsername === currentUser.username) {
        setProfileUser(currentUser);
        return;
      }
      
      // Check cache and in-progress requests
      if (responseCache.current.profile[targetUsername]) {
        setProfileUser(responseCache.current.profile[targetUsername]);
        return;
      }
      
      if (requestState.profileInProgress) {
        return;
      }
      
      // Update request state to prevent duplicate calls
      setRequestState(prev => ({ ...prev, profileInProgress: true }));
      
      const response = await axios.get(`/api/users/${targetUsername}`);
      
      // Cache result
      responseCache.current.profile[targetUsername] = response.data;
      setProfileUser(response.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setRequestState(prev => ({ ...prev, profileInProgress: false }));
    }
  }, [username, currentUser]);
  
  // Fetch followers with cache and request tracking
  const fetchFollowers = useCallback(async () => {
    try {
      const targetUsername = username || currentUser?.username;
      
      if (!targetUsername) {
        return;
      }
      
      // Don't fetch if already in progress
      if (requestState.followersInProgress) {
        return;
      }
      
      // Check cache first
      const cacheKey = `${targetUsername}_1`;
      if (responseCache.current.followers[cacheKey]) {
        const cachedData = responseCache.current.followers[cacheKey];
        setFollowers(cachedData.followers || []);
        setHasMoreFollowers(cachedData.has_next || false);
        setPageFollowers(2);
        return;
      }
      
      setIsLoadingFollowers(true);
      setRequestState(prev => ({ ...prev, followersInProgress: true }));
      
      const response = await axios.get(`/api/users/${targetUsername}/followers`, {
        params: { page: 1, per_page: 20 }
      });
      
      // Cache response
      responseCache.current.followers[cacheKey] = response.data;
      
      setFollowers(response.data.followers || []);
      setHasMoreFollowers(response.data.has_next || false);
      setPageFollowers(2);
    } catch (error) {
      console.error('Error fetching followers:', error);
    } finally {
      setIsLoadingFollowers(false);
      setRequestState(prev => ({ ...prev, followersInProgress: false }));
    }
  }, [username, currentUser]);
  
  // Fetch following with cache and request tracking
  const fetchFollowing = useCallback(async () => {
    try {
      const targetUsername = username || currentUser?.username;
      
      if (!targetUsername) {
        return;
      }
      
      // Don't fetch if already in progress
      if (requestState.followingInProgress) {
        return;
      }
      
      // Check cache first
      const cacheKey = `${targetUsername}_1`;
      if (responseCache.current.following[cacheKey]) {
        const cachedData = responseCache.current.following[cacheKey];
        setFollowing(cachedData.following || []);
        setHasMoreFollowing(cachedData.has_next || false);
        setPageFollowing(2);
        return;
      }
      
      setIsLoadingFollowing(true);
      setRequestState(prev => ({ ...prev, followingInProgress: true }));
      
      const response = await axios.get(`/api/users/${targetUsername}/following`, {
        params: { page: 1, per_page: 20 }
      });
      
      // Cache response
      responseCache.current.following[cacheKey] = response.data;
      
      setFollowing(response.data.following || []);
      setHasMoreFollowing(response.data.has_next || false);
      setPageFollowing(2);
    } catch (error) {
      console.error('Error fetching following:', error);
    } finally {
      setIsLoadingFollowing(false);
      setRequestState(prev => ({ ...prev, followingInProgress: false }));
    }
  }, [username, currentUser]);
  
  // Load more followers with request tracking
  const loadMoreFollowers = useCallback(async () => {
    try {
      const targetUsername = username || currentUser?.username;
      
      // Don't load more if already loading
      if (isLoadingFollowers || requestState.followersInProgress) {
        return;
      }
      
      // Check cache first
      const cacheKey = `${targetUsername}_${pageFollowers}`;
      if (responseCache.current.followers[cacheKey]) {
        const cachedData = responseCache.current.followers[cacheKey];
        setFollowers(prev => [...prev, ...(cachedData.followers || [])]);
        setHasMoreFollowers(cachedData.has_next || false);
        setPageFollowers(prev => prev + 1);
        return;
      }
      
      setIsLoadingFollowers(true);
      setRequestState(prev => ({ ...prev, followersInProgress: true }));
      
      const response = await axios.get(`/api/users/${targetUsername}/followers`, {
        params: { page: pageFollowers, per_page: 20 }
      });
      
      // Cache response
      responseCache.current.followers[cacheKey] = response.data;
      
      setFollowers(prev => [...prev, ...(response.data.followers || [])]);
      setHasMoreFollowers(response.data.has_next || false);
      setPageFollowers(prev => prev + 1);
    } catch (error) {
      console.error('Error loading more followers:', error);
    } finally {
      setIsLoadingFollowers(false);
      setRequestState(prev => ({ ...prev, followersInProgress: false }));
    }
  }, [username, currentUser, pageFollowers, isLoadingFollowers, requestState.followersInProgress]);
  
  // Load more following with request tracking
  const loadMoreFollowing = useCallback(async () => {
    try {
      const targetUsername = username || currentUser?.username;
      
      // Don't load more if already loading
      if (isLoadingFollowing || requestState.followingInProgress) {
        return;
      }
      
      // Check cache first
      const cacheKey = `${targetUsername}_${pageFollowing}`;
      if (responseCache.current.following[cacheKey]) {
        const cachedData = responseCache.current.following[cacheKey];
        setFollowing(prev => [...prev, ...(cachedData.following || [])]);
        setHasMoreFollowing(cachedData.has_next || false);
        setPageFollowing(prev => prev + 1);
        return;
      }
      
      setIsLoadingFollowing(true);
      setRequestState(prev => ({ ...prev, followingInProgress: true }));
      
      const response = await axios.get(`/api/users/${targetUsername}/following`, {
        params: { page: pageFollowing, per_page: 20 }
      });
      
      // Cache response
      responseCache.current.following[cacheKey] = response.data;
      
      setFollowing(prev => [...prev, ...(response.data.following || [])]);
      setHasMoreFollowing(response.data.has_next || false);
      setPageFollowing(prev => prev + 1);
    } catch (error) {
      console.error('Error loading more following:', error);
    } finally {
      setIsLoadingFollowing(false);
      setRequestState(prev => ({ ...prev, followingInProgress: false }));
    }
  }, [username, currentUser, pageFollowing, isLoadingFollowing, requestState.followingInProgress]);
  
  // Only fetch profile once when component mounts or username changes
  useEffect(() => {
    fetchUserData();
  }, [username, currentUser, fetchUserData]);
  
  // Fetch appropriate tab data when tab changes
  useEffect(() => {
    if (value === 0 && followers.length === 0 && !requestState.followersInProgress) {
      fetchFollowers();
    } else if (value === 1 && following.length === 0 && !requestState.followingInProgress) {
      fetchFollowing();
    }
  }, [value, username, followers.length, following.length, fetchFollowers, fetchFollowing, requestState]);
  
  // Intersection observer for infinite scroll with debounce
  useEffect(() => {
    let timeoutId = null;
    
    const observer = new IntersectionObserver(
      entries => {
        const first = entries[0];
        if (first.isIntersecting) {
          // Debounce loading more content
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
          
          timeoutId = setTimeout(() => {
            if (value === 0 && hasMoreFollowers && !isLoadingFollowers && !requestState.followersInProgress) {
              loadMoreFollowers();
            } else if (value === 1 && hasMoreFollowing && !isLoadingFollowing && !requestState.followingInProgress) {
              loadMoreFollowing();
            }
          }, 300); // Debounce time of 300ms
        }
      },
      { threshold: 0.5 }
    );
    
    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }
    
    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [value, hasMoreFollowers, hasMoreFollowing, isLoadingFollowers, isLoadingFollowing, 
      loadMoreFollowers, loadMoreFollowing, requestState]);
  
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  
  // Clear cache after successful follow/unfollow actions
  const clearUserCache = () => {
    responseCache.current.followers = {};
    responseCache.current.following = {};
  };
  
  const handleFollow = async (userId) => {
    try {
      setLoadingFollow(prev => ({ ...prev, [userId]: true }));
      const response = await axios.post(`/api/profile/follow`, {
        followed_id: userId
      });
      
      if (response.data.success) {
        setFollowers(prev => prev.map(user => 
          user.id === userId ? { ...user, is_following: true } : user
        ));
        
        setFollowing(prev => prev.map(user => 
          user.id === userId ? { ...user, is_following: true } : user
        ));
        
        clearUserCache(); // Clear cache after successful action
      }
    } catch (error) {
      console.error('Error following user:', error);
    } finally {
      setLoadingFollow(prev => ({ ...prev, [userId]: false }));
    }
  };
  
  const handleUnfollow = async (userId) => {
    try {
      setLoadingFollow(prev => ({ ...prev, [userId]: true }));
      const response = await axios.post(`/api/profile/unfollow`, {
        unfollowed_id: userId
      });
      
      if (response.data.success) {
        setFollowers(prev => prev.map(user => 
          user.id === userId ? { ...user, is_following: false } : user
        ));
        
        setFollowing(prev => prev.map(user => 
          user.id === userId ? { ...user, is_following: false } : user
        ));
        
        clearUserCache(); // Clear cache after successful action
      }
    } catch (error) {
      console.error('Error unfollowing user:', error);
    } finally {
      setLoadingFollow(prev => ({ ...prev, [userId]: false }));
    }
  };
  
  const renderProfileCard = (user) => {
    const isFollowing = user.is_following;
    const isCurrentUser = currentUser && user.id === currentUser.id;
    
    let avatarUrl = user.photo;
    if (avatarUrl && !avatarUrl.startsWith('http') && !avatarUrl.startsWith('/')) {
      avatarUrl = `/static/uploads/avatar/${user.id}/${avatarUrl}`;
    }
    
    return (
      <motion.div
        key={user.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <ProfileCard>
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <Avatar
              src={avatarUrl || '/static/uploads/avatar/system/avatar.png'}
              alt={user.name || user.username}
              sx={{ 
                width: 50, 
                height: 50,
                marginRight: 2,
                border: '2px solid',
                borderColor: 'primary.main'
              }}
            />
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography 
                  variant="subtitle1" 
                  component={Link} 
                  to={`/profile/${user.username}`}
                  sx={{ 
                    color: 'text.primary',
                    textDecoration: 'none', 
                    '&:hover': {
                      color: 'primary.main'
                    }
                  }}
                >
                  {user.name || user.username}
                </Typography>
                {user.is_verified && (
                  <CheckCircleIcon 
                    sx={{ 
                      ml: 0.5,
                      fontSize: 16, 
                      color: 'primary.main' 
                    }} 
                  />
                )}
              </Box>
              <Typography variant="body2" color="text.secondary" noWrap>
                {user.about ? 
                  (user.about.length > 15 ? user.about.substring(0, 15) + '...' : user.about) 
                  : 'Нет описания'}
              </Typography>
            </Box>
          </Box>
          
          {!isCurrentUser && currentUser && (
            <Box sx={{ ml: 2 }}>
              {isFollowing ? (
                <IconButton
                  onClick={() => handleUnfollow(user.id)}
                  disabled={loadingFollow[user.id]}
                  color="primary"
                  size="small"
                >
                  {loadingFollow[user.id] ? (
                    <CircularProgress size={24} />
                  ) : (
                    <PersonRemoveIcon />
                  )}
                </IconButton>
              ) : (
                <IconButton
                  onClick={() => handleFollow(user.id)}
                  disabled={loadingFollow[user.id]}
                  color="primary"
                  size="small"
                >
                  {loadingFollow[user.id] ? (
                    <CircularProgress size={24} />
                  ) : (
                    <PersonAddIcon />
                  )}
                </IconButton>
              )}
            </Box>
          )}
        </ProfileCard>
      </motion.div>
    );
  };
  
  const renderSkeletonCards = () => {
    return Array(3).fill(0).map((_, index) => (
      <ProfileCard key={index}>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
        <Skeleton variant="circular" width={50} height={50} sx={{ mr: 2 }} />
        <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width={120} />
            <Skeleton variant="text" width={200} />
          </Box>
          <Skeleton variant="circular" width={40} height={40} />
        </Box>
      </ProfileCard>
    ));
  };
  
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
        <IconButton 
          onClick={() => navigate(-1)}
          sx={{ mr: 2 }}
          color="primary"
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" component="h1">
          {profileUser ? `Подписки ${profileUser.username}` : 'Подписки'}
        </Typography>
      </Box>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={value} 
          onChange={handleChange} 
          variant={isMobile ? "fullWidth" : "standard"}
          sx={{ 
            '& .MuiTab-root': {
              color: 'text.secondary',
              '&.Mui-selected': {
                color: 'primary.main',
              },
            },
          }}
        >
          <Tab label={`Подписчики (${followers.length})`} />
          <Tab label={`Подписки (${following.length})`} />
        </Tabs>
      </Box>
        
        <Box role="tabpanel" hidden={value !== 0}>
          {value === 0 && (
            <>
              {isLoadingFollowers && followers.length === 0 ? (
                renderSkeletonCards()
            ) : (
              followers.map(user => renderProfileCard(user))
              )}
            </>
          )}
        </Box>
        
        <Box role="tabpanel" hidden={value !== 1}>
          {value === 1 && (
            <>
              {isLoadingFollowing && following.length === 0 ? (
                renderSkeletonCards()
            ) : (
              following.map(user => renderProfileCard(user))
              )}
            </>
          )}
        </Box>
      
      {((value === 0 && hasMoreFollowers) || (value === 1 && hasMoreFollowing)) && (
        <LoadingContainer ref={loaderRef}>
          <CircularProgress size={40} />
        </LoadingContainer>
      )}
    </Container>
  );
};

export default SubscriptionsPage; 