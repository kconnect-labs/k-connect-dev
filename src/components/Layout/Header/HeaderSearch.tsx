import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  Avatar,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  Fade,
  Grow,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  Tag as TagIcon,
  Verified as VerifiedIcon,
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';

// TypeScript interfaces
interface User {
  id: string;
  username: string;
  name: string;
  photo?: string;
  avatar_url?: string;
  verification_status?: 'verified' | 'unverified';
}

interface Channel {
  id: string;
  username: string;
  name: string;
  photo?: string;
  avatar_url?: string;
  is_verified?: boolean;
}

interface SearchResults {
  users: User[];
  channels: Channel[];
}

interface HeaderSearchProps {
  showSearch: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: SearchResults;
  searchTab: number;
  setSearchTab: (tab: number) => void;
  searchLoading: boolean;
  showSearchResults: boolean;
  setShowSearchResults: (show: boolean) => void;
  searchInputRef: React.RefObject<HTMLInputElement>;
  t: (key: string) => string;
  handleSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleSearchFocus: () => void;
  handleClickAway: (event: MouseEvent | TouchEvent) => void;
  handleSearchTabChange: (
    event: React.SyntheticEvent,
    newValue: number
  ) => void;
  handleViewAll: () => void;
  handleSearchItemClick: (path: string) => void;
  toggleSearch: () => void;
  isMobile: boolean;
}

// Styled Components в стиле Command Palette
const SearchContainer = styled(motion.div)<{ isMobile: boolean }>(
  ({ theme, isMobile }) => ({
    position: 'fixed',
    top: isMobile ? '20px' : '80px',
    ...(isMobile
      ? {
          left: '16px',
          right: '16px',
          width: 'auto',
          maxWidth: 'none',
        }
      : {
          left: '50%',
          width: '600px',
          maxWidth: '600px',
        }),
    zIndex: 1300,
  })
);

const StyledPaper = styled(Paper, {
  shouldForwardProp: prop => prop !== 'isMobile',
})<{ isMobile: boolean }>(({ theme, isMobile }) => ({
  background: isMobile
    ? 'rgba(15, 15, 25, 0.98)' // Более темный и насыщенный фон для мобильных
    : 'var(--theme-background)',
  backdropFilter: isMobile
    ? 'none' // Отключаем backdrop-filter на мобильных
    : 'var(--theme-backdrop-filter)',
  border: '1px solid rgba(0, 0, 0, 0.12)',
  borderRadius: 16,
  overflow: 'hidden',
  boxShadow: isMobile
    ? '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.08)'
    : '0 16px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)',
}));

const SearchInputField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 0,
    border: 'none',
    backgroundColor: 'transparent',
    fontSize: '1.1rem',
    fontWeight: 500,
    padding: '4px 16px',
    '& fieldset': {
      border: 'none',
    },
    '&:hover fieldset': {
      border: 'none',
    },
    '&.Mui-focused fieldset': {
      border: 'none',
    },
  },
  '& .MuiOutlinedInput-input': {
    padding: '16px 0',
    color: theme.palette.text.primary,
    '&::placeholder': {
      color: alpha(theme.palette.text.secondary, 0.6),
      opacity: 1,
    },
  },
}));

const SearchTabsContainer = styled(Box)(({ theme }) => ({
  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  minHeight: 48,
  '& .MuiTabs-indicator': {
    backgroundColor: theme.palette.primary.main,
    height: 3,
    borderRadius: '3px 3px 0 0',
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontSize: '0.95rem',
  fontWeight: 500,
  minHeight: 48,
  color: alpha(theme.palette.text.secondary, 0.8),
  '&.Mui-selected': {
    color: theme.palette.primary.main,
    fontWeight: 600,
  },
}));

const ResultsContainer = styled(Box)(({ theme }) => ({
  maxHeight: '420px',
  overflowY: 'auto',
  overflowX: 'hidden',
  padding: '8px 0 0 0',
  // Custom scrollbar
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'transparent',
  },
  '&::-webkit-scrollbar-thumb': {
    background: alpha(theme.palette.primary.main, 0.3),
    borderRadius: '3px',
    '&:hover': {
      background: alpha(theme.palette.primary.main, 0.5),
    },
  },
  // Firefox scrollbar
  scrollbarWidth: 'thin',
  scrollbarColor: `${alpha(theme.palette.primary.main, 0.3)} transparent`,
}));

const SearchResultItem = styled(motion.div)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '12px 16px',
  margin: '0 8px 4px',
  borderRadius: 'var(--main-border-radius) !important',
  cursor: 'pointer',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    transform: 'translateX(4px)',
  },
  '&:active': {
    transform: 'translateX(2px) scale(0.98)',
  },
}));

const UserAvatar = styled(Avatar)(({ theme }) => ({
  width: 48,
  height: 48,
  marginRight: 16,
  border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  transition: 'border-color 0.2s ease',
  '.search-result-item:hover &': {
    borderColor: alpha(theme.palette.primary.main, 0.4),
  },
}));

const ResultContent = styled(Box)({
  flex: 1,
  minWidth: 0,
});

const ResultName = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '1rem',
  color: theme.palette.text.primary,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  marginBottom: 2,
}));

const ResultUsername = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  color: alpha(theme.palette.text.secondary, 0.8),
  fontWeight: 400,
}));

const LoadingContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '32px 16px',
});

const NoResultsContainer = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: '48px 24px',
  color: alpha(theme.palette.text.secondary, 0.6),
}));

const ViewAllButton = styled(Button)(({ theme }) => ({
  margin: '16px 0 8px 0',
  borderRadius: 'var(--main-border-radius) !important',
  textTransform: 'none',
  fontWeight: 600,
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  color: theme.palette.primary.main,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.15),
    borderColor: alpha(theme.palette.primary.main, 0.3),
  },
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
  color: alpha(theme.palette.text.secondary, 0.7),
  '&:hover': {
    backgroundColor: alpha(theme.palette.error.main, 0.1),
    color: theme.palette.error.main,
  },
}));

const SearchBackdrop = styled(motion.div)({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  zIndex: 1299,
});

// Main Component
const HeaderSearch: React.FC<HeaderSearchProps> = ({
  showSearch,
  searchQuery,
  setSearchQuery,
  searchResults,
  searchTab,
  setSearchTab,
  searchLoading,
  showSearchResults,
  setShowSearchResults,
  searchInputRef,
  t,
  handleSearchChange,
  handleSearchFocus,
  handleClickAway,
  handleSearchTabChange,
  handleViewAll,
  handleSearchItemClick,
  toggleSearch,
  isMobile,
}) => {
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle click outside
  useEffect(() => {
    const handleClick = (event: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        handleClickAway(event);
      }
    };

    if (showSearch) {
      document.addEventListener('mousedown', handleClick);
      document.addEventListener('touchstart', handleClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, [showSearch, handleClickAway]);

  if (!showSearch) return null;

  const renderUserResult = (user: User) => (
    <SearchResultItem
      key={user.id}
      className='search-result-item'
      onClick={() => handleSearchItemClick(`/profile/${user.username}`)}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
    >
      <UserAvatar
        src={
          user.avatar_url ||
          (user.photo
            ? `/static/uploads/avatar/${user.id}/${user.photo}`
            : undefined)
        }
        alt={user.name || user.username}
      >
        {!user.avatar_url && !user.photo && <PersonIcon />}
      </UserAvatar>
      <ResultContent>
        <ResultName>
          {user.name}
          {user.verification_status === 'verified' && (
            <VerifiedIcon sx={{ fontSize: 18, color: 'primary.main' }} />
          )}
        </ResultName>
        <ResultUsername>@{user.username}</ResultUsername>
      </ResultContent>
    </SearchResultItem>
  );

  const renderChannelResult = (channel: Channel) => (
    <SearchResultItem
      key={channel.id}
      className='search-result-item'
      onClick={() => handleSearchItemClick(`/profile/${channel.username}`)}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
    >
      <UserAvatar src={channel.avatar_url || channel.photo} alt={channel.name}>
        {!channel.avatar_url && !channel.photo && <TagIcon />}
      </UserAvatar>
      <ResultContent>
        <ResultName>
          {channel.name}
          {channel.is_verified && (
            <VerifiedIcon sx={{ fontSize: 18, color: 'primary.main' }} />
          )}
        </ResultName>
        <ResultUsername>@{channel.username}</ResultUsername>
      </ResultContent>
    </SearchResultItem>
  );

  return (
    <>
      {/* Backdrop */}
      <SearchBackdrop
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={toggleSearch}
      />

      {/* Search Container */}
      <SearchContainer
        ref={containerRef}
        isMobile={isMobile}
        initial={{
          opacity: 0,
          scale: 0.95,
          y: -10,
          x: isMobile ? 0 : '-50%',
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
          x: isMobile ? 0 : '-50%',
        }}
        exit={{
          opacity: 0,
          scale: 0.95,
          y: -10,
          x: isMobile ? 0 : '-50%',
        }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <StyledPaper elevation={0} className='theme-modal' isMobile={isMobile}>
          {/* Search Input */}
          <Box sx={{ position: 'relative' }}>
            <SearchInputField
              fullWidth
              placeholder={t('header.search.placeholder')}
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
              inputRef={searchInputRef}
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position='start'>
                    <SearchIcon sx={{ color: 'primary.main', fontSize: 24 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position='end'>
                    <CloseButton onClick={toggleSearch} size='small'>
                      <CloseIcon />
                    </CloseButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Search Results */}
          <AnimatePresence>
            {showSearchResults && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Tabs */}
                <SearchTabsContainer>
                  <StyledTabs
                    value={searchTab}
                    onChange={handleSearchTabChange}
                    variant='fullWidth'
                  >
                    <StyledTab
                      label={t('header.search.tabs.all')}
                      icon={<PersonIcon />}
                      iconPosition='start'
                    />
                    <StyledTab
                      label={t('header.search.tabs.channels')}
                      icon={<TagIcon />}
                      iconPosition='start'
                    />
                  </StyledTabs>
                </SearchTabsContainer>

                {/* Results Content */}
                <ResultsContainer>
                  {searchLoading ? (
                    <LoadingContainer>
                      <CircularProgress size={32} thickness={4} />
                    </LoadingContainer>
                  ) : (
                    <AnimatePresence mode='wait'>
                      {searchTab === 0 ? (
                        // All Users Tab
                        searchResults.users.length > 0 ? (
                          <motion.div
                            key='users'
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            {searchResults.users.map(renderUserResult)}
                            <Box sx={{ padding: '0 16px' }}>
                              <ViewAllButton fullWidth onClick={handleViewAll}>
                                {t('header.search.view_all')}
                              </ViewAllButton>
                            </Box>
                          </motion.div>
                        ) : (
                          <motion.div
                            key='no-users'
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            <NoResultsContainer>
                              <PersonIcon
                                sx={{ fontSize: 48, mb: 2, opacity: 0.3 }}
                              />
                              <Typography variant='h6' gutterBottom>
                                {t('header.search.no_results.users')}
                              </Typography>
                            </NoResultsContainer>
                          </motion.div>
                        )
                      ) : // Channels Tab
                      searchResults.channels.length > 0 ? (
                        <motion.div
                          key='channels'
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          {searchResults.channels.map(renderChannelResult)}
                          <Box sx={{ padding: '0 16px' }}>
                            <ViewAllButton fullWidth onClick={handleViewAll}>
                              {t('header.search.view_all')}
                            </ViewAllButton>
                          </Box>
                        </motion.div>
                      ) : (
                        <motion.div
                          key='no-channels'
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <NoResultsContainer>
                            <TagIcon
                              sx={{ fontSize: 48, mb: 2, opacity: 0.3 }}
                            />
                            <Typography variant='h6' gutterBottom>
                              {t('header.search.no_results.channels')}
                            </Typography>
                          </NoResultsContainer>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </ResultsContainer>
              </motion.div>
            )}
          </AnimatePresence>
        </StyledPaper>
      </SearchContainer>
    </>
  );
};

export default HeaderSearch;
