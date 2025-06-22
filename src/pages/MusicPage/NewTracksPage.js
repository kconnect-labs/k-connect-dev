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
  Alert
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { 
  Search,
  PlayArrowRounded,
  PauseRounded,
  ArrowBack,
  NewReleases
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useMusic } from '../../context/MusicContext';
import apiClient from '../../services/axiosConfig';
import NewTracksBlock from './components/NewTracksBlock';

// Стили для поиска
const SearchContainer = styled(Box)(({ theme, open }) => ({
  position: 'sticky',
  top: 0,
  zIndex: 5,
  width: '100%',
  padding: open ? theme.spacing(2, 1) : theme.spacing(2, 2, 1),
  backdropFilter: 'blur(10px)',
  backgroundColor: open 
    ? theme.palette.mode === 'dark' ? 'rgba(18,18,18,0.9)' : 'rgba(250,250,250,0.9)'  
    : theme.palette.mode === 'dark' ? 'rgba(18,18,18,0.6)' : 'rgba(250,250,250,0.6)',
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
    ? theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)' 
    : theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
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
    }
  }
}));

const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const NewTracksPage = () => {
  const navigate = useNavigate();
  const { 
    currentTrack, 
    isPlaying, 
    playTrack, 
    pauseTrack,
    searchTracks,
    searchResults,
    isSearching
  } = useMusic();

  // Состояние для поиска
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchInputRef = useRef(null);

  // Состояние для уведомлений
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Debounced search
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (!query.trim()) {
        return;
      }
      setSearchLoading(true);
      try {
        const results = await searchTracks(query);
        console.log('Search results:', results);
      } catch (error) {
        console.error('Error searching tracks:', error);
        setSnackbar({ open: true, message: 'Ошибка поиска', severity: 'error' });
      } finally {
        setSearchLoading(false);
      }
    }, 500),
    [searchTracks]
  );

  // Обработчики поиска
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim()) {
      debouncedSearch(query);
    }
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
      setSearchQuery('');
      if (searchInputRef.current) {
        searchInputRef.current.value = '';
      }
    }
  }, [showSearchBar]);

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  // Если есть поисковый запрос, показываем страницу поиска
  if (searchQuery.trim()) {
    return (
      <Box sx={{ p: 2 }}>
        <SearchContainer open={true}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 1
          }}>
            <StyledSearchInput focused={isSearchFocused}>
              <Search sx={{ fontSize: 20, mr: 1, color: 'text.secondary' }} />
              <input
                ref={searchInputRef}
                placeholder="Поиск трека или исполнителя"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
              />
              {searchQuery && (
                <IconButton 
                  size="small" 
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
                minWidth: 'auto'
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
            </Box>
          ) : searchResults && searchResults.length > 0 ? (
            <Grid container spacing={1}>
              {searchResults.map((track, index) => (
                <Grid item xs={12} key={track.id || index}>
                  <Paper
                    sx={{
                      p: 1,
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'rgba(255, 255, 255, 0.15)',
                      }
                    }}
                    onClick={() => playTrack(track, 'search')}
                  >
                    <Box
                      component="img"
                      src={track.cover_path || '/default-cover.jpg'}
                      alt={track.title}
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '8px',
                        objectFit: 'cover'
                      }}
                    />
                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography variant="body2" noWrap>
                        {track.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {track.artist}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        isPlaying && currentTrack?.id === track.id ? pauseTrack() : playTrack(track, 'search');
                      }}
                    >
                      {isPlaying && currentTrack?.id === track.id ? <PauseRounded /> : <PlayArrowRounded />}
                    </IconButton>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="body1" sx={{ textAlign: 'center', p: 4 }}>
              Ничего не найдено
            </Typography>
          )}
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
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: showSearchBar ? 0 : 1
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton 
              color="inherit" 
              onClick={() => navigate('/music')}
              sx={{ mr: 1 }}
            >
              <ArrowBack />
            </IconButton>
            <Typography 
              variant="h6" 
              fontWeight="600"
              sx={{ 
                display: { xs: showSearchBar ? 'none' : 'block', sm: 'block' },
                fontSize: { xs: '1.1rem', sm: '1.25rem' }
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
                placeholder="Поиск трека или исполнителя"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
              />
              {searchQuery && (
                <IconButton 
                  size="small" 
                  onClick={clearSearch}
                  sx={{ color: 'rgba(255, 255, 255, 0.7)', p: 0.5 }}
                >
                  <Box sx={{ fontSize: 18, fontWeight: 'bold' }}>×</Box>
                </IconButton>
              )}
            </StyledSearchInput>
          ) : (
            <IconButton 
              color="inherit" 
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
                minWidth: 'auto'
              }}
            >
              Отмена
            </Button>
          )}
        </Box>
      </SearchContainer>

      {/* Контент */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: '#fff' }}>
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
    </Box>
  );
};

export default NewTracksPage; 