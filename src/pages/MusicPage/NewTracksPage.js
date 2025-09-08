import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  IconButton,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
  Search,
  PlayArrowRounded,
  PauseRounded,
  ArrowBack,
  NewReleases,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useMusic } from '../../context/MusicContext';
import MobilePlayer from '../../components/Music/MobilePlayer';
import apiClient from '../../services/axiosConfig';
import NewTracksBlock from './components/NewTracksBlock';


const SearchContainer = styled(Box)(({ theme, open }) => ({
  position: 'sticky',
  top: 0,
  zIndex: 5,
  width: '100%',
  padding: open ? theme.spacing(2, 1) : theme.spacing(2, 2, 1),
  backdropFilter: 'var(--theme-backdrop-filter, blur(10px))',
  backgroundColor: open
    ? theme.palette.mode === 'dark'
      ? 'rgba(18,18,18,0.9)'
      : 'rgba(250,250,250,0.9)'
    : theme.palette.mode === 'dark'
      ? 'rgba(18,18,18,0.6)'
      : 'rgba(250,250,250,0.6)',
  transition: 'all 0.3s ease',
  borderRadius: open ? 0 : '0 0 16px 16px',
  boxShadow: open ? 'none' : '0 4px 20px rgba(0,0,0,0.1)',
}));

const StyledSearchInput = styled(Box)(({ theme, focused }) => ({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  borderRadius: 24,
  backgroundColor: focused
    ? theme.palette.mode === 'dark'
      ? 'rgba(255,255,255,0.15)'
      : 'rgba(0,0,0,0.15)'
    : theme.palette.mode === 'dark'
      ? 'rgba(255,255,255,0.1)'
      : 'rgba(0,0,0,0.1)',
  padding: theme.spacing(1, 2),
  transition: 'all 0.3s ease',
  boxShadow: focused ? `0 0 0 2px ${theme.palette.primary.main}66` : 'none',
  '& input': {
    width: '100%',
    border: 'none',
    outline: 'none',
    background: 'transparent',
    color: theme.palette.text.primary,
    fontSize: '16px',
    '&::placeholder': {
      color: theme.palette.text.secondary,
    },
  },
}));

const NewTracksPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const {
    currentTrack,
    isPlaying,
    playTrack,
    pauseTrack,
    searchTracks,
    searchResults,
    isSearching,
  } = useMusic();

  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchInputRef = useRef(null);
  const abortControllerRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  
  const performSearch = useCallback(
    async query => {
      
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      
      if (!query.trim() || query.trim().length < 2) {
        return;
      }

      setSearchLoading(true);

      
      abortControllerRef.current = new AbortController();

      try {
        const results = await searchTracks(query);

        if (results.length === 0) {
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('[NewTracksPage] Ошибка поиска:', error);
          setSnackbar({
            open: true,
            message: 'Ошибка поиска',
            severity: 'error',
          });
        }
      } finally {
        setSearchLoading(false);
        abortControllerRef.current = null;
      }
    },
    [searchTracks]
  );

  
  const handleSearchChange = e => {
    const query = e.target.value;
    setSearchQuery(query);

    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    
    if (query.trim().length < 2) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        setSearchLoading(false);
      }
      return;
    }

    
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(query.trim());
    }, 1200); 
  };

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
  };

  const handleSearchBlur = () => {
    setTimeout(() => setIsSearchFocused(false), 200);
  };

  const clearSearch = () => {
    setSearchQuery('');
    if (searchInputRef.current) {
      searchInputRef.current.value = '';
    }
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setSearchLoading(false);
    }
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }
  };

  const handleToggleSearch = useCallback(() => {
    setShowSearchBar(prev => !prev);
    if (!showSearchBar) {
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 100);
    } else {
      clearSearch();
    }
  }, [showSearchBar]);

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  
  if (searchQuery.trim()) {
    return (
      <Box sx={{ p: 2 }}>
        <SearchContainer open={true}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1,
            }}
          >
            <StyledSearchInput focused={isSearchFocused}>
              <Search sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
              <input
                ref={searchInputRef}
                placeholder='Поиск трека или исполнителя (мин. 2 символа)'
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
              />
              {searchQuery && (
                <IconButton
                  size='small'
                  onClick={clearSearch}
                  sx={{ color: 'rgba(255, 255, 255, 0.7)', p: 0.5 }}
                >
                  <Box sx={{ fontSize: 18, fontWeight: 'bold' }}>×</Box>
                </IconButton>
              )}
            </StyledSearchInput>

            <Button
              onClick={handleToggleSearch}
              sx={{
                ml: 1,
                textTransform: 'none',
                minWidth: 'auto',
              }}
            >
              Отмена
            </Button>
          </Box>
        </SearchContainer>

        <Box sx={{ mt: 2 }}>
          {searchLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>Поиск...</Typography>
            </Box>
          ) : searchQuery.trim() && searchQuery.trim().length < 2 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <Typography variant='body1' color='text.secondary'>
                Введите минимум 2 символа для поиска
              </Typography>
            </Box>
          ) : searchResults && searchResults.length > 0 ? (
            <Grid container spacing={1}>
              {searchResults.map((track, index) => (
                <Grid item xs={12} key={track.id || index}>
                  <Paper
                    sx={{
                      p: 1,
                      borderRadius: '18px',
                      background: 'var(--theme-background, rgba(255, 255, 255, 0.1))',
                      backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
                      border: '1px solid rgba(66, 66, 66, 0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'var(--theme-background, rgba(255, 255, 255, 0.15))',
                      },
                    }}
                    onClick={() => playTrack(track, 'search')}
                  >
                    <Box
                      component='img'
                      src={track.cover_path || '/default-cover.jpg'}
                      alt={track.title}
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '16px',
                        objectFit: 'cover',
                      }}
                    />
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography variant='body2' noWrap>
                        {track.title}
                      </Typography>
                      <Typography
                        variant='caption'
                        color='text.secondary'
                        noWrap
                      >
                        {track.artist}
                      </Typography>
                    </Box>
                    <IconButton
                      size='small'
                      onClick={e => {
                        e.stopPropagation();
                        isPlaying && currentTrack?.id === track.id
                          ? pauseTrack()
                          : playTrack(track, 'search');
                      }}
                    >
                      {isPlaying && currentTrack?.id === track.id ? (
                        <PauseRounded />
                      ) : (
                        <PlayArrowRounded />
                      )}
                    </IconButton>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          ) : searchQuery.trim().length >= 2 ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                p: 4,
              }}
            >
              <Typography variant='body1' sx={{ textAlign: 'center', mb: 1 }}>
                Ничего не найдено по запросу "{searchQuery}"
              </Typography>
              <Typography
                variant='body2'
                color='text.secondary'
                sx={{ textAlign: 'center' }}
              >
                Попробуйте изменить поисковый запрос
              </Typography>
            </Box>
          ) : null}
        </Box>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* Поиск сверху */}
      <SearchContainer open={showSearchBar}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: showSearchBar ? 0 : 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              color='inherit'
              onClick={() => navigate('/music')}
              sx={{ mr: 1 }}
            >
              <ArrowBack />
            </IconButton>
            <Typography
              variant='h6'
              fontWeight='600'
              sx={{
                display: { xs: showSearchBar ? 'none' : 'block', sm: 'block' },
                fontSize: { xs: '1.1rem', sm: '1.25rem' },
              }}
            >
              Новые треки
            </Typography>
          </Box>

          {showSearchBar ? (
            <StyledSearchInput focused={isSearchFocused}>
              <Search sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
              <input
                ref={searchInputRef}
                placeholder='Поиск трека или исполнителя (мин. 2 символа)'
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
              />
              {searchQuery && (
                <IconButton
                  size='small'
                  onClick={clearSearch}
                  sx={{ color: 'rgba(255, 255, 255, 0.7)', p: 0.5 }}
                >
                  <Box sx={{ fontSize: 18, fontWeight: 'bold' }}>×</Box>
                </IconButton>
              )}
            </StyledSearchInput>
          ) : (
            <IconButton
              color='inherit'
              onClick={handleToggleSearch}
              sx={{ mr: 0.5 }}
            >
              <Search />
            </IconButton>
          )}

          {showSearchBar && (
            <Button
              onClick={handleToggleSearch}
              sx={{
                ml: 1,
                textTransform: 'none',
                minWidth: 'auto',
              }}
            >
              Отмена
            </Button>
          )}
        </Box>
      </SearchContainer>

      {/* Контент */}
      <Box sx={{ mt: 2 }}>
        <Typography variant='h5' sx={{ mb: 2, fontWeight: 600, color: '#fff' }}>
          Новые треки Connect
        </Typography>

        <NewTracksBlock />
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Mobile Player */}
      <MobilePlayer isMobile={isMobile} />
    </Box>
  );
};

export default NewTracksPage;
