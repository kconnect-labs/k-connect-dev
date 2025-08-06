import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Container,
  Box,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Typography,
  Avatar,
  Button,
  IconButton,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  Article as ArticleIcon,
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon,
  Verified as VerifiedIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { styled, alpha } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';
import { searchService, profileService } from '../../services';
import { MaxIcon } from '../../components/icons/CustomIcons';
import SimpleImageViewer from '../../components/SimpleImageViewer';
import Post from '../../components/Post/Post';

// TypeScript interfaces
interface User {
  id: number;
  username: string;
  name: string;
  photo?: string;
  verification_status?: 'verified' | 'unverified';
  decoration?: {
    background?: string;
    item_path?: string;
  };
  subscription?: {
    type?: string;
    subscription_type?: string;
  };
  subscription_type?: string;
}

interface Post {
  id: number;
  content: string;
  timestamp: string;
  image?: string;
  video?: string;
  likes?: number;
  likes_count?: number;
  comments?: number;
  comments_count?: number;
  total_comments?: number;
  user: User;
}

interface SearchResults {
  users: User[];
  posts: Post[];
  has_next?: boolean;
}

// Styled Components using theme system
const SearchContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(8),
}));

const SearchBox = styled(Box)(({ theme }) => ({

  zIndex: 10,
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
  borderRadius: 16,
  background: 'var(--theme-background)',
  backdropFilter: 'var(--theme-backdrop-filter)',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
}));

const SearchInput = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
            background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    transition: 'all 0.3s ease',
    '&:hover': {
      border: '1px solid rgba(255, 255, 255, 0.2)',
    },
    '&.Mui-focused': {
      border: `1px solid ${theme.palette.primary.main}`,
      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
    },
    '& fieldset': {
      border: 'none',
    },
  },
  '& .MuiOutlinedInput-input': {
    padding: '14px 16px',
    fontSize: '1rem',
    '&::placeholder': {
      color: alpha(theme.palette.text.secondary, 0.6),
      opacity: 1,
    },
  },
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  marginTop: theme.spacing(2),
  '& .MuiTabs-indicator': {
    backgroundColor: theme.palette.primary.main,
    height: 3,
    borderRadius: '3px 3px 0 0',
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontSize: '1rem',
  fontWeight: 500,
  minHeight: 48,
  color: alpha(theme.palette.text.secondary, 0.8),
  '&.Mui-selected': {
    color: theme.palette.primary.main,
    fontWeight: 600,
  },
  '&:hover': {
    color: theme.palette.text.primary,
  },
}));

const UserCard = styled(motion.div)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2.5),
  borderRadius: 16,
  marginBottom: theme.spacing(1.5),
  background: 'var(--theme-background)',
  backdropFilter: 'var(--theme-backdrop-filter)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
  },
}));



const LoadingContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '64px 24px',
});

const NoResultsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(8, 3),
  textAlign: 'center',
  color: alpha(theme.palette.text.secondary, 0.6),
}));

const SearchPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated } = React.useContext(AuthContext) as any;

  // URL params
  const searchParams = new URLSearchParams(location.search);
  const queryParam = searchParams.get('q') || '';
  const typeParam = searchParams.get('type') || 'all';

  // State
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [searchType, setSearchType] = useState(
    typeParam === 'users' ? 1 : typeParam === 'posts' ? 2 : 0
  );
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [userPage, setUserPage] = useState(1);
  const [postPage, setPostPage] = useState(1);
  const [hasMoreUsers, setHasMoreUsers] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(false);
  const [followingStatus, setFollowingStatus] = useState<Record<number, boolean>>({});

  // Lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState('');
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Refs
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSearchRef = useRef('');
  const performSearchRef = useRef<any>(null);

  // Update URL params
  const updateSearchParams = useCallback((query: string, type: number) => {
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
  }, [navigate]);

  // Remove duplicates utility
  const removeDuplicatesUsers = useCallback((array: User[]): User[] => {
    return array.filter((item, index, self) => 
      index === self.findIndex(t => t.id === item.id)
    );
  }, []);

  const removeDuplicatesPosts = useCallback((array: Post[]): Post[] => {
    return array.filter((item, index, self) => 
      index === self.findIndex(t => t.id === item.id)
    );
  }, []);

  // Load following status
  const loadFollowingStatus = useCallback(async (usersList: User[]) => {
    if (!isAuthenticated || !usersList.length) return;

    try {
      const statuses: Record<number, boolean> = {};
      
      for (const userItem of usersList) {
        if (userItem.id === currentUser?.id) continue;
        
        try {
          const response = await profileService.checkFollowing(userItem.id);
          statuses[userItem.id] = response.data.following;
        } catch (error) {
          console.error(`Error checking following status for user ${userItem.id}:`, error);
          statuses[userItem.id] = false;
        }
      }

      setFollowingStatus(prev => ({ ...prev, ...statuses }));
    } catch (error) {
      console.error('Error loading following statuses:', error);
    }
  }, [isAuthenticated, currentUser]);

  // Perform search (removed useCallback to prevent infinite loops)
  const performSearch = async (query: string, type: number, page = 1, append = false) => {
    if (loading) return;

    const cleanQuery = query.trim();
    if (!cleanQuery && !append) return;

    // Prevent duplicate searches
    const searchKey = `${cleanQuery}_${type}_${page}`;
    if (!append && lastSearchRef.current === searchKey) return;
    
    if (!append) lastSearchRef.current = searchKey;

    setLoading(true);
    
    try {
      let response;

      if (type === 1) {
        // Search users
        response = await searchService.searchUsers(cleanQuery, page);
        
        if (response.data?.users) {
          const uniqueUsers = removeDuplicatesUsers(response.data.users);
          
          if (append) {
            setUsers(prev => removeDuplicatesUsers([...prev, ...uniqueUsers]));
          } else {
            setUsers(uniqueUsers);
          }
          
          setHasMoreUsers(response.data.has_next || false);
          
          if (isAuthenticated && uniqueUsers.length > 0) {
            loadFollowingStatus(uniqueUsers);
          }
        }
      } else if (type === 2) {
        // Search posts
        response = await searchService.searchPosts(cleanQuery, page);
        
        if (response.data?.posts) {
          const uniquePosts = removeDuplicatesPosts(response.data.posts);
          
          if (append) {
            setPosts(prev => removeDuplicatesPosts([...prev, ...uniquePosts]));
          } else {
            setPosts(uniquePosts);
          }
          
          setHasMorePosts(response.data.has_next || false);
        }
      } else {
        // Search all
        response = await searchService.searchAll(cleanQuery);
        
        if (response.data) {
          if (response.data.users) {
            setUsers(removeDuplicatesUsers(response.data.users));
            if (isAuthenticated && response.data.users.length > 0) {
              loadFollowingStatus(response.data.users);
            }
          } else {
            setUsers([]);
          }
          
          if (response.data.posts) {
            setPosts(removeDuplicatesPosts(response.data.posts));
          } else {
            setPosts([]);
          }
        }
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Store performSearch in ref to avoid dependency cycles
  useEffect(() => {
    performSearchRef.current = performSearch;
  });

  // Handle follow toggle
  const handleFollowToggle = useCallback(async (userId: number) => {
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
  }, [isAuthenticated, followingStatus, navigate]);

  // Handle tab change
  const handleTabChange = useCallback((_: React.SyntheticEvent, newValue: number) => {
    setSearchType(newValue);
    setUserPage(1);
    setPostPage(1);
    updateSearchParams(searchQuery, newValue);
  }, [searchQuery, updateSearchParams]);

  // Handle search submit
  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const cleanQuery = searchQuery.trim();
    updateSearchParams(cleanQuery, searchType);
  }, [searchQuery, searchType, updateSearchParams]);

  // Load more results
  const loadMoreResults = useCallback(() => {
    if (searchType === 1 && hasMoreUsers) {
      const nextPage = userPage + 1;
      setUserPage(nextPage);
      performSearchRef.current?.(searchQuery, searchType, nextPage, true);
    } else if (searchType === 2 && hasMorePosts) {
      const nextPage = postPage + 1;
      setPostPage(nextPage);
      performSearchRef.current?.(searchQuery, searchType, nextPage, true);
    }
  }, [searchType, hasMoreUsers, hasMorePosts, userPage, postPage, searchQuery]);

  // Handle URL changes
  useEffect(() => {
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'all';
    const typeIndex = type === 'users' ? 1 : type === 'posts' ? 2 : 0;

    setSearchQuery(query);
    setSearchType(typeIndex);
    setUserPage(1);
    setPostPage(1);
    lastSearchRef.current = '';

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Perform search with debounce
    if (query.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        performSearchRef.current?.(query, typeIndex);
      }, 300);
    } else {
      setUsers([]);
      setPosts([]);
    }
  }, [location.search]);

  // Cleanup timeout
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Lightbox handlers (unused now since Post component handles it)
  const handleCloseLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  // Render user card
  const renderUserCard = useCallback((user: User, index: number) => (
    <UserCard
      key={user.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      onClick={() => navigate(`/profile/${user.username}`)}
      className="theme-card"
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
        sx={{
          width: 56,
          height: 56,
          marginRight: 2,
          border: `2px solid ${theme.palette.primary.main}`,
        }}
      />
      
      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mr: 1 }}>
            {user.name}
          </Typography>
          {user.verification_status === 'verified' && (
            <VerifiedIcon sx={{ fontSize: 18, color: 'primary.main' }} />
          )}
          {(user.subscription?.type === 'max' || 
            user.subscription_type === 'max' ||
            user.subscription?.subscription_type === 'max') && (
            <MaxIcon className="" size={20} color="#FF4D50" style={{ marginLeft: 4 }} />
          )}
        </Box>
        <Typography variant="body2" color="text.secondary">
          @{user.username}
        </Typography>
      </Box>

      {isAuthenticated && user && currentUser && currentUser.id !== user.id && (
        <Button
          variant={followingStatus[user.id] ? 'outlined' : 'contained'}
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            handleFollowToggle(user.id);
          }}
          startIcon={
            followingStatus[user.id] ? <PersonRemoveIcon /> : <PersonAddIcon />
          }
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            minWidth: 120,
          }}
        >
          {followingStatus[user.id] ? 'Отписаться' : 'Подписаться'}
        </Button>
      )}
    </UserCard>
  ), [navigate, theme.palette.primary.main, isAuthenticated, currentUser, followingStatus, handleFollowToggle]);

  // Render post using existing Post component
  const renderPostCard = useCallback((post: Post, index: number) => (
    <motion.div
      key={post.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      style={{ marginBottom: 16 }}
    >
      <Post 
        post={post} 
        onDelete={() => {}} 
        onOpenLightbox={() => {}} 
        isPinned={false}
        statusColor=""
      />
    </motion.div>
  ), []);

  return (
    <SearchContainer maxWidth="lg" >
      <SearchBox className="theme-modal">
        <form onSubmit={handleSearchSubmit}>
          <SearchInput
            fullWidth
            placeholder="Поиск пользователей, постов..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="primary" />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setSearchQuery('')}
                    edge="end"
                  >
                    <CloseIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </form>

        <StyledTabs
          value={searchType}
          onChange={handleTabChange}
          variant="fullWidth"
        >
          <StyledTab label="Все" icon={<SearchIcon />} iconPosition="start" />
          <StyledTab label="Пользователи" icon={<PersonIcon />} iconPosition="start" />
          <StyledTab label="Посты" icon={<ArticleIcon />} iconPosition="start" />
        </StyledTabs>
      </SearchBox>

      {/* Results */}
      <AnimatePresence mode="wait">
        {loading && !users.length && !posts.length ? (
          <LoadingContainer>
            <CircularProgress size={40} thickness={4} />
          </LoadingContainer>
        ) : (
          <motion.div
            key={searchType}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* All tab */}
            {searchType === 0 && (
              <Box>
                {users.length === 0 && posts.length === 0 ? (
                  <NoResultsContainer>
                    <SearchIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
                    <Typography variant="h5" gutterBottom>
                      Ничего не найдено
                    </Typography>
                    <Typography variant="body2">
                      Попробуйте изменить поисковый запрос
                    </Typography>
                  </NoResultsContainer>
                ) : (
                  <>
                    {users.length > 0 && (
                      <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                          Пользователи
                        </Typography>
                        <Box>
                          {users.slice(0, 4).map(renderUserCard)}
                        </Box>
                        {users.length > 4 && (
                          <Button
                            variant="outlined"
                            onClick={() => handleTabChange({} as React.SyntheticEvent, 1)}
                            sx={{ mt: 2 }}
                          >
                            Показать всех пользователей
                          </Button>
                        )}
                      </Box>
                    )}

                    {posts.length > 0 && (
                      <Box>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                          Посты
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {posts.slice(0, 3).map(renderPostCard)}
                        </Box>
                        {posts.length > 3 && (
                          <Button
                            variant="outlined"
                            onClick={() => handleTabChange({} as React.SyntheticEvent, 2)}
                            sx={{ mt: 2 }}
                          >
                            Показать все посты
                          </Button>
                        )}
                      </Box>
                    )}
                  </>
                )}
              </Box>
            )}

            {/* Users tab */}
            {searchType === 1 && (
              <Box>
                {users.length === 0 ? (
                  <NoResultsContainer>
                    <PersonIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
                    <Typography variant="h5" gutterBottom>
                      Пользователи не найдены
                    </Typography>
                    <Typography variant="body2">
                      Попробуйте изменить поисковый запрос
                    </Typography>
                  </NoResultsContainer>
                ) : (
                  <>
                    <Box>{users.map(renderUserCard)}</Box>
                    {hasMoreUsers && (
                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                        <Button
                          variant="outlined"
                          onClick={loadMoreResults}
                          disabled={loading}
                          size="large"
                        >
                          {loading ? <CircularProgress size={24} /> : 'Загрузить ещё'}
                        </Button>
                      </Box>
                    )}
                  </>
                )}
              </Box>
            )}

            {/* Posts tab */}
            {searchType === 2 && (
              <Box>
                {posts.length === 0 ? (
                  <NoResultsContainer>
                    <ArticleIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
                    <Typography variant="h5" gutterBottom>
                      Посты не найдены
                    </Typography>
                    <Typography variant="body2">
                      Попробуйте изменить поисковый запрос
                    </Typography>
                  </NoResultsContainer>
                ) : (
                  <>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {posts.map(renderPostCard)}
                    </Box>
                    {hasMorePosts && (
                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                        <Button
                          variant="outlined"
                          onClick={loadMoreResults}
                          disabled={loading}
                          size="large"
                        >
                          {loading ? <CircularProgress size={24} /> : 'Загрузить ещё'}
                        </Button>
                      </Box>
                    )}
                  </>
                )}
              </Box>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox */}
      <SimpleImageViewer
        isOpen={lightboxOpen}
        onClose={handleCloseLightbox}
        images={lightboxImages}
        initialIndex={currentImageIndex}
      />
    </SearchContainer>
  );
};

export default SearchPage;