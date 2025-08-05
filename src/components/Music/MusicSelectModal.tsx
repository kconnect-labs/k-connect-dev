import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Button,
  TextField,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Avatar,
  Typography,
  IconButton,
  CircularProgress,
  Chip,
  InputAdornment,
  Tab,
  Tabs,
  styled,
  alpha,
} from '@mui/material';
import {
  Search,
  PlayArrow,
  Pause,
  Check,
  MusicNote,
} from '@mui/icons-material';
import { useMusic } from '../../context/MusicContext';
import UniversalModal from '../../UIKIT/UniversalModal';

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontSize: '0.9rem',
  fontWeight: 'normal',
  minWidth: 100,
  '&.Mui-selected': {
    fontWeight: 'medium',
    color: theme.palette.primary.main,
  },
}));

const StyledTrack = styled(ListItem)(({ theme, selected }) => ({
  borderRadius: 8,
  marginBottom: 8,
  backgroundColor: selected
    ? alpha(theme.palette.primary.main, 0.1)
    : 'rgba(255, 255, 255, 0.03)',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: selected
      ? alpha(theme.palette.primary.main, 0.15)
      : 'rgba(255, 255, 255, 0.05)',
  },
  border: selected
    ? `1px solid ${alpha(theme.palette.primary.main, 0.3)}`
    : '1px solid rgba(255, 255, 255, 0.05)',
}));

const SearchInput = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.main,
      borderWidth: 1,
    },
  },
}));

interface MusicTrack {
  id: number;
  title: string;
  artist: string;
  duration: number;
  file_path: string;
  cover_path: string;
}

interface MusicSelectModalProps {
  open: boolean;
  onClose: () => void;
  onSelectTracks: (tracks: MusicTrack[]) => void;
  maxTracks?: number;
}

const MusicSelectModal: React.FC<MusicSelectModalProps> = ({
  open,
  onClose,
  onSelectTracks,
  maxTracks = 3,
}) => {
  const { tracks, likedTracks, isLoading, searchTracks: contextSearchTracks, forceLoadTracks } = useMusic();
  const [selectedTracks, setSelectedTracks] = useState<MusicTrack[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<MusicTrack[]>([]);
  const [currentPlayingTrack, setCurrentPlayingTrack] = useState<MusicTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAllTracks, setIsLoadingAllTracks] = useState(false);
  const [isLoadingLikedTracks, setIsLoadingLikedTracks] = useState(false);
  const [hasTriedLoadAllTracks, setHasTriedLoadAllTracks] = useState(false);
  const [hasTriedLoadLikedTracks, setHasTriedLoadLikedTracks] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(new Audio());
  const lastSearchQuery = useRef('');

  // Загружаем треки при открытии модалки
  useEffect(() => {
    if (open) {
      // Загружаем треки только если их нет и еще не пытались загрузить
      if (forceLoadTracks) {
        // Загружаем все треки
        if (
          tracks.length === 0 &&
          !isLoadingAllTracks &&
          !hasTriedLoadAllTracks
        ) {
          setIsLoadingAllTracks(true);
          setHasTriedLoadAllTracks(true);
          forceLoadTracks('all').finally(() => {
            setIsLoadingAllTracks(false);
          });
        }

        // Загружаем любимые треки
        if (
          likedTracks.length === 0 &&
          !isLoadingLikedTracks &&
          !hasTriedLoadLikedTracks
        ) {
          setIsLoadingLikedTracks(true);
          setHasTriedLoadLikedTracks(true);
          forceLoadTracks('liked').finally(() => {
            setIsLoadingLikedTracks(false);
          });
        }
      }
    } else {
      // Сбрасываем флаги попыток загрузки при закрытии модалки
      setHasTriedLoadAllTracks(false);
      setHasTriedLoadLikedTracks(false);
    }
  }, [open, tracks.length, likedTracks.length, forceLoadTracks, isLoadingAllTracks, isLoadingLikedTracks, hasTriedLoadAllTracks, hasTriedLoadLikedTracks]);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      setIsPlaying(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const searchTracksHandler = useCallback(
    debounce(async (query: string) => {
      if (query.trim()) {
        if (query === lastSearchQuery.current) {
          return;
        }

        lastSearchQuery.current = query;

        setIsSearching(true);
        try {
          const results = await contextSearchTracks(query);
          setSearchResults(results);
        } catch (error) {
          console.error('Search error:', error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setIsSearching(false);
      }
    }, 300),
    [contextSearchTracks]
  );

  useEffect(() => {
    if (searchQuery) {
      searchTracksHandler(searchQuery);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [searchQuery, searchTracksHandler]);

  const handleSelectTrack = (track: MusicTrack) => {
    const isSelected = selectedTracks.some(t => t.id === track.id);
    
    if (isSelected) {
      setSelectedTracks(prev => prev.filter(t => t.id !== track.id));
    } else if (selectedTracks.length < maxTracks) {
      setSelectedTracks(prev => [...prev, track]);
    }
  };

  const handleTrackPlay = (track: MusicTrack) => {
    if (currentPlayingTrack?.id === track.id) {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        audioRef.current?.play();
        setIsPlaying(true);
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      
      audioRef.current.src = track.file_path;
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentPlayingTrack(null);
      });
      
      audioRef.current.play();
      setCurrentPlayingTrack(track);
      setIsPlaying(true);
    }
  };

  const handleComplete = () => {
    stopAudio();
    onSelectTracks(selectedTracks);
    onClose();
  };

  const handleClose = () => {
    stopAudio();
    onClose();
  };

  // Останавливаем аудио при изменении видимости страницы
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopAudio();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const getDisplayedTracks = () => {
    if (searchQuery && searchResults.length > 0) {
      return searchResults;
    }
    
    if (tabValue === 0) {
      return tracks;
    } else if (tabValue === 1) {
      return likedTracks;
    }
    
    return [];
  };

  const displayedTracks = getDisplayedTracks();

  return (
    <UniversalModal
      open={open}
      onClose={handleClose}
      title="Выбор музыки"
      maxWidth="md"
      maxWidthCustom={600}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Поиск */}
        <Box sx={{ mb: 2 }}>
          <SearchInput
            fullWidth
            placeholder="Поиск музыки..."
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Табы */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant="fullWidth"
            sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}
          >
            <StyledTab label="Все треки" />
            <StyledTab label="Любимые" />
          </Tabs>
        </Box>

        {/* Выбранные треки */}
        {selectedTracks.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Выбрано ({selectedTracks.length}/{maxTracks}):
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {selectedTracks.map((track) => (
                <Chip
                  key={`selected-${track.id}`}
                  label={`${track.title} - ${track.artist}`}
                  onDelete={() => handleSelectTrack(track)}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Список треков */}
        <Box sx={{ flex: 1, overflow: 'auto', minHeight: 300 }}>
          {isSearching ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress size={30} />
            </Box>
          ) : (tabValue === 0 && isLoadingAllTracks) ||
            (tabValue === 1 && isLoadingLikedTracks) ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress size={30} />
            </Box>
          ) : displayedTracks.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 6,
              }}
            >
              <MusicNote
                sx={{
                  fontSize: 40,
                  color: 'text.secondary',
                  opacity: 0.5,
                  mb: 2,
                }}
              />
              <Typography color="text.secondary">
                {searchQuery
                  ? 'Ничего не найдено'
                  : tabValue === 0
                    ? isLoadingAllTracks
                      ? 'Загрузка треков...'
                      : 'Нет доступных треков'
                    : isLoadingLikedTracks
                      ? 'Загрузка любимых треков...'
                      : 'У вас пока нет любимых треков'}
              </Typography>
              {!searchQuery &&
                tabValue === 0 &&
                !isLoadingAllTracks &&
                tracks.length === 0 &&
                !hasTriedLoadAllTracks && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      if (isLoadingAllTracks) return;
                      setIsLoadingAllTracks(true);
                      setHasTriedLoadAllTracks(true);
                      forceLoadTracks &&
                        forceLoadTracks('all').finally(() => {
                          setIsLoadingAllTracks(false);
                        });
                    }}
                    disabled={isLoadingAllTracks}
                    sx={{ mt: 2 }}
                  >
                    {isLoadingAllTracks ? 'Загрузка...' : 'Загрузить треки'}
                  </Button>
                )}
              {!searchQuery &&
                tabValue === 1 &&
                !isLoadingLikedTracks &&
                likedTracks.length === 0 &&
                !hasTriedLoadLikedTracks && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      if (isLoadingLikedTracks) return;
                      setIsLoadingLikedTracks(true);
                      setHasTriedLoadLikedTracks(true);
                      forceLoadTracks &&
                        forceLoadTracks('liked').finally(() => {
                          setIsLoadingLikedTracks(false);
                        });
                    }}
                    disabled={isLoadingLikedTracks}
                    sx={{ mt: 2 }}
                  >
                    {isLoadingLikedTracks ? 'Загрузка...' : 'Загрузить любимые треки'}
                  </Button>
                )}
            </Box>
          ) : (
            <List>
              {displayedTracks.map((track) => {
                const isSelected = selectedTracks.some(t => t.id === track.id);
                const isPlaying = currentPlayingTrack?.id === track.id;
                
                return (
                  <StyledTrack
                    key={track.id}
                    selected={isSelected}
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleSelectTrack(track)}
                  >
                    <ListItemAvatar>
                      <Avatar
                        src={track.cover_path || '/static/music/default-cover.jpg'}
                        sx={{ width: 48, height: 48 }}
                      />
                    </ListItemAvatar>
                    
                    <ListItemText
                      primary={track.title}
                      secondary={track.artist}
                      primaryTypographyProps={{
                        sx: { fontWeight: isSelected ? 'medium' : 'normal' }
                      }}
                    />
                    
                    <ListItemSecondaryAction>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTrackPlay(track);
                          }}
                          sx={{ color: isPlaying ? 'primary.main' : 'text.secondary' }}
                        >
                          {isPlaying ? <Pause /> : <PlayArrow />}
                        </IconButton>
                        
                        {isSelected && (
                          <Check sx={{ color: 'primary.main', fontSize: 20 }} />
                        )}
                      </Box>
                    </ListItemSecondaryAction>
                  </StyledTrack>
                );
              })}
            </List>
          )}
        </Box>

        {/* Кнопки действий */}
        <Box sx={{ display: 'flex', gap: 2, mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button
            variant="outlined"
            onClick={handleClose}
            fullWidth
            sx={{ borderRadius: '12px' }}
          >
            Отмена
          </Button>
          <Button
            variant="contained"
            onClick={handleComplete}
            disabled={selectedTracks.length === 0}
            fullWidth
            sx={{ borderRadius: '12px' }}
          >
            Добавить ({selectedTracks.length})
          </Button>
        </Box>
      </Box>
    </UniversalModal>
  );
};

export default MusicSelectModal; 