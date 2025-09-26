import React, {
  createContext,
  useState,
  useEffect,
  useRef,
  useContext,
  useCallback,
} from 'react';
import axios from 'axios';


const getAudioUrl = filePath => {
  if (!filePath) return '';

  
  if (filePath.startsWith('http')) {
    return filePath;
  }

  
  const isLocalhost =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.includes('localhost');

  
  if (isLocalhost) {
    return `https://k-connect.ru${filePath}`;
  }

  return filePath;
};

export const MusicContext = createContext({
  tracks: [],
  popularTracks: [],
  likedTracks: [],
  newTracks: [],
  randomTracks: [],
  myVibeTracks: [],
  currentTrack: null,
  isPlaying: false,
  volume: 0.5,
  isMuted: false,
  currentTime: 0,
  duration: 0,
  isLoading: true,
  audioRef: null,
  hasMoreTracks: false,
  hasMoreByType: {},
  currentSection: 'all',
  isTrackLoading: false,
  isFullScreenPlayerOpen: false,
  setCurrentTrack: () => {},
  setCurrentSection: () => {},
  resetCurrentSection: () => {},
  setRandomTracks: () => {},
  playTrack: () => {},
  togglePlay: () => {},
  nextTrack: () => {},
  prevTrack: () => {},
  setVolume: () => {},
  toggleMute: () => {},
  seekTo: () => {},
  likeTrack: () => {},
  uploadTrack: () => {},
  loadMoreTracks: () => Promise.resolve(),
  resetPagination: () => {},
  enableCrossfade: true,
  searchResults: [],
  isSearching: false,
  searchTracks: () => Promise.resolve([]),
  getCurrentTimeRaw: () => 0,
  getDurationRaw: () => 0,
  playlistTracks: {},
  setPlaylistTracks: () => {},
  openFullScreenPlayer: () => {},
  closeFullScreenPlayer: () => {},
  playTrackById: () => {},
  enableTimeUpdates: () => {},
  disableTimeUpdates: () => {},
});

export const MusicProvider = ({ children }) => {
  const [tracks, setTracks] = useState([]);
  const [popularTracks, setPopularTracks] = useState([]);
  const [likedTracks, setLikedTracks] = useState([]);
  const [newTracks, setNewTracks] = useState([]);
  const [randomTracks, setRandomTracks] = useState([]);
  const [myVibeTracks, setMyVibeTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMoreTracks, setHasMoreTracks] = useState(true);
  const [hasMoreByType, setHasMoreByType] = useState({});
  const [page, setPage] = useState(1);
  const [pageByType, setPageByType] = useState({
    all: 1,
    popular: 1,
    liked: 1,
    new: 1,
    random: 1,
    'my-vibe': 1,
  });
  const [enableCrossfade, setEnableCrossfade] = useState(true);
  const [currentSection, setCurrentSection] = useState('all');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isTrackLoading, setIsTrackLoading] = useState(false);
  const [isFullScreenPlayerOpen, setIsFullScreenPlayerOpen] = useState(false);
  const [hasActiveTimeListeners, setHasActiveTimeListeners] = useState(false);

  const audioRef = useRef(new Audio());
  const nextAudioRef = useRef(new Audio());
  const initialMount = useRef(true);
  const crossfadeTimeoutRef = useRef(null);
  const isLoadingRef = useRef(true);
  const isLoadingMoreRef = useRef(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const preloadTimeRef = useRef({});

  const currentTimeRef = useRef(0);
  const durationRef = useRef(0);
  const timeUpdateThrottleRef = useRef(null);
  const lastTimeUpdateRef = useRef(0);
  const hasTimeListenersRef = useRef(false);
  const nextTrackCacheRef = useRef(null);
  const lastNextTrackCallRef = useRef(0);

  const likedTracksLastLoadedRef = useRef(null);

  const isLoadingLikedTracksRef = useRef(false);

  const hasCheckedLikedTracksRef = useRef(false);

  const [playlistTracks, setPlaylistTracksState] = useState({});

  useEffect(() => {
    let isMounted = true;

    const fetchTracks = async () => {
      
      if (isLoadingRef.current) {
        return;
      }

      const currentPath = window.location.pathname;
      const isMusicPage = currentPath.startsWith('/music');

      
      if (!isMusicPage) {
        console.log('Не на музыкальной странице, пропускаем загрузку треков');
        return;
      }

      if (
        isLoadingRef.current === false &&
        ((currentSection === 'all' && tracks.length > 0) ||
          (currentSection === 'liked' && likedTracks.length > 0) ||
          (currentSection === 'popular' && popularTracks.length > 0) ||
          (currentSection === 'new' && newTracks.length > 0) ||
          (currentSection === 'random' && randomTracks.length > 0))
      ) {
        return;
      }

      if (
        currentSection === 'liked' &&
        hasCheckedLikedTracksRef.current &&
        likedTracksLastLoadedRef.current
      ) {
        const now = Date.now();
        const cacheAge = now - likedTracksLastLoadedRef.current;

        if (likedTracks.length === 0 && cacheAge < 15 * 60 * 1000) {
          return;
        }

        if (likedTracks.length > 0 && cacheAge < 5 * 60 * 1000) {
          return;
        }
      }

      isLoadingRef.current = true;
      setIsLoading(true);

      try {
        let url = '/api/music';
        let params = { page: 1, per_page: 50 };

        if (currentSection === 'liked') {
          url = '/api/music/liked';

          if (isLoadingLikedTracksRef.current) {
            isLoadingRef.current = false;
            setIsLoading(false);
            return;
          }

          isLoadingLikedTracksRef.current = true;

          try {
            const response = await axios.get(url, {
              params: { ...params, _t: Date.now() },
              headers: {
                'Cache-Control': 'no-cache',
                Pragma: 'no-cache',
                Expires: '0',
              },
              withCredentials: true,
            });

            if (!isMounted) {
              isLoadingLikedTracksRef.current = false;
              isLoadingRef.current = false;
              return;
            }

            if (response.data && response.data.tracks) {
              const receivedTracks = response.data.tracks;

              setLikedTracks(receivedTracks);
              setHasMoreTracks(receivedTracks.length >= 50);
              setHasMoreByType(prev => ({
                ...prev,
                liked: receivedTracks.length >= 50,
              }));

              likedTracksLastLoadedRef.current = Date.now();

              hasCheckedLikedTracksRef.current = true;
            } else {
              setLikedTracks([]);
              setHasMoreTracks(false);
              setHasMoreByType(prev => ({ ...prev, liked: false }));

              likedTracksLastLoadedRef.current = Date.now();

              hasCheckedLikedTracksRef.current = true;
            }
          } catch (error) {
            console.error('Ошибка при загрузке понравившихся треков:', error);
          } finally {
            isLoadingLikedTracksRef.current = false;
            isLoadingRef.current = false;
            setIsLoading(false);
          }

          return;
        } else if (currentSection === 'my-vibe') {
          url = '/api/music/my-vibe';

          try {
            const response = await axios.get(url, {
              params: { ...params, _t: Date.now() },
              headers: {
                'Cache-Control': 'no-cache',
                Pragma: 'no-cache',
                Expires: '0',
              },
              withCredentials: true,
            });

            if (!isMounted) {
              isLoadingRef.current = false;
              return;
            }

            if (response.data && response.data.tracks) {
              const receivedTracks = response.data.tracks;

              
              setMyVibeTracks(receivedTracks);
              setHasMoreTracks(false); 
              setHasMoreByType(prev => ({ ...prev, 'my-vibe': false }));
            } else {
              setMyVibeTracks([]);
              setHasMoreTracks(false);
              setHasMoreByType(prev => ({ ...prev, 'my-vibe': false }));
            }
          } catch (error) {
            console.error('Ошибка при загрузке "Мой вайб":', error);
          } finally {
            isLoadingRef.current = false;
            setIsLoading(false);
          }

          return;
        } else if (currentSection === 'popular') {
          params.sort = 'popular';
        } else if (currentSection === 'new') {
          params.sort = 'date';
        } else if (currentSection === 'random') {
          params.random = true;

          params.nocache = Math.random();
        }

        const response = await axios.get(url, { params });
        if (!isMounted) return;

        if (response.data && response.data.tracks) {
          const receivedTracks = response.data.tracks;

          if (receivedTracks.length > 0) {
            
            
            if (isPlaying || currentTrack) {
              const prefetchCount = Math.min(3, receivedTracks.length);

              Promise.all(
                receivedTracks.slice(0, prefetchCount).map(async track => {
                  try {
                    const lyricsData = await fetchLyricsForTrack(track.id);
                    if (lyricsData) {
                      track.lyricsData = lyricsData;
                    }
                  } catch (err) {
                    console.error(
                      `Error pre-fetching lyrics for track ${track.id}:`,
                      err
                    );
                  }
                })
              ).catch(err =>
                console.error('Error in lyrics pre-fetch batch:', err)
              );
            } else {
            }
          }

          if (currentSection === 'all') {
            setTracks(receivedTracks);
            setHasMoreTracks(receivedTracks.length >= 50);
            setHasMoreByType(prev => ({
              ...prev,
              all: receivedTracks.length >= 50,
            }));
          } else if (currentSection === 'popular') {
            setPopularTracks(receivedTracks);
            setHasMoreTracks(receivedTracks.length >= 50);
            setHasMoreByType(prev => ({
              ...prev,
              popular: receivedTracks.length >= 50,
            }));
          } else if (currentSection === 'new') {
            setNewTracks(receivedTracks);
            setHasMoreTracks(receivedTracks.length >= 50);
            setHasMoreByType(prev => ({
              ...prev,
              new: receivedTracks.length >= 50,
            }));
          } else if (currentSection === 'random') {
            const shuffledTracks = [...receivedTracks].sort(
              () => Math.random() - 0.5
            );
            setRandomTracks(shuffledTracks);
            setHasMoreTracks(receivedTracks.length >= 50);
            setHasMoreByType(prev => ({
              ...prev,
              random: receivedTracks.length >= 50,
            }));
          }

          setTimeout(() => {
            if (
              receivedTracks.length >= 50 &&
              hasMoreByType[currentSection] !== false
            ) {
              loadMoreTracks(currentSection).catch(error =>
                console.error('Ошибка при предзагрузке треков:', error)
              );
            }
          }, 2000);
        }

        isLoadingRef.current = false;
        setIsLoading(false);
      } catch (error) {
        console.error(
          `Ошибка при загрузке треков для секции ${currentSection}:`,
          error
        );
        if (isMounted) {
          setIsLoading(false);
          isLoadingRef.current = false;
        }
        if (currentSection === 'liked') {
          isLoadingLikedTracksRef.current = false;
        }
      }
    };

    fetchTracks();

    return () => {
      isMounted = false;
    };
  }, [currentSection]);

  useEffect(() => {
    let isMounted = true;

    const handleTimeUpdate = () => {
      if (isMounted) {
        const audio = audioRef.current;

        currentTimeRef.current = audio.currentTime;
        durationRef.current = audio.duration;

        if ('mediaSession' in navigator && audio.duration && isPlaying) {
          navigator.mediaSession.setPositionState({
            duration: audio.duration,
            position: audio.currentTime,
            playbackRate: audio.playbackRate,
          });
        }

        const now = Date.now();
        if (now - lastTimeUpdateRef.current > 100) { 
          
          if ((hasTimeListenersRef.current || isFullScreenPlayerOpen) && isPlaying && Math.abs(currentTimeRef.current - audio.currentTime) > 0.1) {
            setCurrentTime(audio.currentTime);
          }
          if ((hasTimeListenersRef.current || isFullScreenPlayerOpen) && Math.abs(durationRef.current - audio.duration) > 0.1) {
            setDuration(audio.duration);
          }
          lastTimeUpdateRef.current = now;
        }

        if (enableCrossfade && isPlaying && audio.duration > 0) {
          const timeRemaining = audio.duration - audio.currentTime;

          
          if (timeRemaining <= 10 && timeRemaining > 3 && !crossfadeTimeoutRef.current) {
            getNextTrack().then(nextTrackToLoad => {
              if (nextTrackToLoad && nextAudioRef.current) {
                console.log('Preloading next track:', nextTrackToLoad.title);
                nextAudioRef.current.src = nextTrackToLoad.file_path;
                nextAudioRef.current.load();
              }
            });
          }

          
          if (
            timeRemaining <= 3 &&
            timeRemaining > 0 &&
            !crossfadeTimeoutRef.current
          ) {
            console.log('Starting crossfade...');
            crossfadeTimeoutRef.current = true; 
            
            getNextTrack().then(nextTrackToPlay => {
              if (nextTrackToPlay) {
                nextAudioRef.current.src = nextTrackToPlay.file_path;
                nextAudioRef.current.volume = 0;

                const playPromise = nextAudioRef.current.play();
                if (playPromise !== undefined) {
                  playPromise.catch(error => {
                    console.error(
                      'Error playing next track during crossfade:',
                      error
                    );
                  });
                }

                const fadeInterval = setInterval(() => {
                  if (audioRef.current.paused === false) {
                    if (audioRef.current.volume > 0.1) {
                      audioRef.current.volume -= 0.1;
                    } else {
                      audioRef.current.volume = 0;
                    }

                    if (nextAudioRef.current.volume < volume - 0.1) {
                      nextAudioRef.current.volume += 0.1;
                    } else {
                      nextAudioRef.current.volume = volume;

                      audioRef.current.pause();

                      clearInterval(fadeInterval);

                      [audioRef.current, nextAudioRef.current] = [
                        nextAudioRef.current,
                        audioRef.current,
                      ];

                      setCurrentTrack(nextTrackToPlay);
                      setCurrentSectionHandler(currentSection);
                      localStorage.setItem('currentTrack', JSON.stringify(nextTrackToPlay));

                      crossfadeTimeoutRef.current = null;
                    }
                  } else {
                    clearInterval(fadeInterval);
                    crossfadeTimeoutRef.current = null;
                  }
                }, 100);
              }
            });
          }
        }
      }
    };

    const handleEnded = () => {
      if (isMounted) {
        console.log('Track ended, handling transition...');
        
        
        crossfadeTimeoutRef.current = null;
        
        
        audioRef.current.pause();
        
        
        if (enableCrossfade && nextAudioRef.current.src && !nextAudioRef.current.paused) {
          console.log('Using preloaded next track from crossfade');
          
          
          const tempAudio = audioRef.current;
          audioRef.current = nextAudioRef.current;
          nextAudioRef.current = tempAudio;
          
          
          getNextTrack()
            .then(nextTrackToPlay => {
              if (nextTrackToPlay) {
                setCurrentTrack(nextTrackToPlay);
                setCurrentSectionHandler(currentSection);
                localStorage.setItem('currentTrack', JSON.stringify(nextTrackToPlay));
              }
            })
            .catch(error => {
              console.error('Error getting next track after track ended:', error);
              nextTrack();
            });
        } else {
          
          console.log('Crossfade not active, switching to next track normally');
          nextTrack();
        }
      }
    };

    const audio = audioRef.current;
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadedmetadata', handleTimeUpdate);

    return () => {
      isMounted = false;
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadedmetadata', handleTimeUpdate);

      if (timeUpdateThrottleRef.current) {
        clearTimeout(timeUpdateThrottleRef.current);
        timeUpdateThrottleRef.current = null;
      }

      if (crossfadeTimeoutRef.current) {
        clearInterval(crossfadeTimeoutRef.current);
        crossfadeTimeoutRef.current = null;
      }
    };
  }, [
    enableCrossfade,
    isPlaying,
    volume,
    currentTrack,
    tracks,
    likedTracks,
    popularTracks,
    newTracks,
    randomTracks,
    myVibeTracks,
    searchResults,
    playlistTracks,
  ]);

  const fetchLyricsForTrack = async trackId => {
    try {
      const response = await fetch(`/api/music/${trackId}/lyrics`);
      if (!response.ok) {
        console.error('Failed to fetch lyrics for track', trackId);
        return null;
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching lyrics data:', error);
      return null;
    }
  };

  const playTrack = (track, section = null) => {
    if (isTrackLoading) {
      return;
    }

    
    if (typeof track === 'number') {
      const trackId = track;
      const foundTrack = 
        tracks.find(t => t.id === trackId) ||
        popularTracks.find(t => t.id === trackId) ||
        likedTracks.find(t => t.id === trackId) ||
        newTracks.find(t => t.id === trackId) ||
        randomTracks.find(t => t.id === trackId) ||
        myVibeTracks.find(t => t.id === trackId) ||
        searchResults.find(t => t.id === trackId);
      
      if (foundTrack) {
        track = foundTrack;
      } else {
        
        console.log('Track not found in local lists, loading from server:', trackId);
        axios.get(`/api/music/${trackId}`)
          .then(response => {
            if (response.data && response.data.success && response.data.track) {
              playTrack(response.data.track, section);
            } else {
              console.error('Failed to load track from server:', trackId);
              setIsTrackLoading(false);
            }
          })
          .catch(error => {
            console.error('Error loading track from server:', error);
            setIsTrackLoading(false);
          });
        return;
      }
    }

    setIsTrackLoading(true);

    try {
      if (crossfadeTimeoutRef.current) {
        clearTimeout(crossfadeTimeoutRef.current);
        crossfadeTimeoutRef.current = null;
      }

      if (currentTrack && track.id === currentTrack.id) {
        togglePlay();
        setIsTrackLoading(false);
        return;
      }

      
      let trackSection = section || determineSectionFromTrack(track);

      
      if (trackSection === 'all-tracks') {
        trackSection = 'all';
      }

      if (!track.lyricsData) {
        fetchLyricsForTrack(track.id)
          .then(lyricsData => {
            if (lyricsData) {
              track.lyricsData = lyricsData;

              if (currentTrack && track.id === currentTrack.id) {
                setCurrentTrack({ ...track });
              }
            }
          })
          .catch(err => console.error('Error fetching lyrics for track:', err));
      }

      
      setCurrentTime(0);
      setDuration(0);
      
      
      audioRef.current.pause();
      nextAudioRef.current.pause();

      
      if (crossfadeTimeoutRef.current) {
        clearInterval(crossfadeTimeoutRef.current);
        crossfadeTimeoutRef.current = null;
      }

      audioRef.current.src = '';
      nextAudioRef.current.src = '';

      
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
      if (nextAudioRef.current) {
        nextAudioRef.current.currentTime = 0;
      }

      setCurrentTrack(track);
      setCurrentSectionHandler(trackSection);
      
      
      nextTrackCacheRef.current = null;

      try {
        localStorage.setItem('currentTrack', JSON.stringify(track));
        localStorage.setItem('currentSection', trackSection);
      } catch (error) {
        console.error('Ошибка при сохранении трека в localStorage:', error);
      }

      audioRef.current = new Audio();

      
      

      const handleCanPlayThrough = () => {
        setIsTrackLoading(false);

        
        if (audioRef.current.duration && !isNaN(audioRef.current.duration)) {
          setDuration(audioRef.current.duration);
        }

        audioRef.current.volume = isMuted ? 0 : volume;

        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);

              try {
                axios
                  .post(
                    `/api/music/${track.id}/play`,
                    {},
                    { withCredentials: true }
                  )
                  .then(() => {
                    // Дополнительно обновляем настройки приватности, чтобы current_music_id был актуальным
                    axios.post(
                      '/api/user/settings/music-privacy',
                      { current_music_id: track.id },
                      { withCredentials: true }
                    ).catch(error =>
                      console.error(
                        'Ошибка при обновлении настроек приватности:',
                        error
                      )
                    );
                  })
                  .catch(error =>
                    console.error(
                      'Ошибка при отправке статистики воспроизведения:',
                      error
                    )
                  );


              } catch (error) {
                console.error(
                  'Ошибка при отправке статистики воспроизведения:',
                  error
                );
              }
            })
            .catch(error => {
              console.error('Ошибка при воспроизведении трека:', error);
              setIsPlaying(false);
              setIsTrackLoading(false);
            });
        }
      };

      const handleLoadStart = () => {};

      const handleLoadedMetadata = () => {
        
        if (audioRef.current.duration && !isNaN(audioRef.current.duration)) {
          setDuration(audioRef.current.duration);
        }
      };

      const handleError = error => {
        const audio = audioRef.current;
        
        
        if (!audio.error) {
          return; 
        }
        
        
        console.error('Ошибка при загрузке трека:', {
          errorCode: audio.error.code,
          errorMessage: audio.error.message,
          track: track ? { id: track.id, title: track.title, file_path: track.file_path } : 'N/A'
        });
        
        setIsTrackLoading(false);
      };

      audioRef.current.addEventListener(
        'canplaythrough',
        handleCanPlayThrough,
        { once: true }
      );
      audioRef.current.addEventListener('loadstart', handleLoadStart);
      audioRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
      audioRef.current.addEventListener('error', handleError);

      audioRef.current.src = getAudioUrl(track.file_path);
      audioRef.current.load();

      return () => {
        audioRef.current.removeEventListener(
          'canplaythrough',
          handleCanPlayThrough
        );
        audioRef.current.removeEventListener('loadstart', handleLoadStart);
        audioRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audioRef.current.removeEventListener('error', handleError);
      };
    } catch (error) {
      console.error('Ошибка при воспроизведении трека:', error);
      setIsTrackLoading(false);
    }
  };

  const togglePlay = () => {
    if (isTrackLoading) {
      return;
    }

    try {
      const audio = audioRef.current;

      if (!audio.src) {
        if (currentTrack) {
          audio.src = getAudioUrl(currentTrack.file_path);
          audio.load();
        } else {
          return;
        }
      }

      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);


            })
            .catch(error => {
              console.error('Ошибка при воспроизведении:', error);
              setIsPlaying(false);
            });
        }
      }
    } catch (error) {
      console.error('Ошибка при переключении воспроизведения:', error);
    }
  };

  const nextTrack = async () => {
    if (isTrackLoading) {
      return;
    }

    setIsTrackLoading(true);

    try {
      const nextTrackItem = await getNextTrack();
      if (nextTrackItem) {
        
        playTrack(nextTrackItem, currentSection);
      } else {
        setIsTrackLoading(false);
      }
    } catch (error) {
      console.error('Error playing next track:', error);
      setIsTrackLoading(false);
    }
  };

  const prevTrack = async () => {
    if (isTrackLoading) {
      return;
    }

    setIsTrackLoading(true);

    try {
      if (currentTime < 3) {
        const prevTrackItem = await getPreviousTrack();
        if (prevTrackItem) {
          
          playTrack(prevTrackItem, currentSection);
        } else {
          audioRef.current.currentTime = 0;
          setIsTrackLoading(false);
        }
      } else {
        audioRef.current.currentTime = 0;
        setIsTrackLoading(false);
      }
    } catch (error) {
      console.error('Error playing previous track:', error);
      setIsTrackLoading(false);
    }
  };

  const getNextTrack = async () => {
    try {
      if (!currentTrack) return null;

      
      const now = Date.now();
      if (nextTrackCacheRef.current && (now - lastNextTrackCallRef.current) < 5000) {
        console.log('Using cached next track');
        return nextTrackCacheRef.current;
      }

      lastNextTrackCallRef.current = now;

      
      try {
        const response = await axios.get('/api/music/next', {
          params: {
            current_id: currentTrack.id,
            context: currentSection,
          },
          withCredentials: true,
        });

        if (response.data.success && response.data.track) {
          nextTrackCacheRef.current = response.data.track;
          return response.data.track;
        } else {
          return null;
        }
      } catch (error) {
        console.error(
          'Ошибка при запросе следующего трека к бэкенду:',
          error
        );
        
        
        let trackList;
        switch (currentSection) {
          case 'popular':
            trackList = popularTracks;
            break;
          case 'liked':
            trackList = likedTracks;
            break;
          case 'new':
            trackList = newTracks;
            break;
          case 'random':
            trackList = randomTracks;
            break;
          case 'search':
            trackList = searchResults;
            break;
          case 'my-vibe':
            trackList = myVibeTracks;
            break;
          default:
            trackList = tracks;
        }

        if (!trackList || trackList.length === 0) {
          return null;
        }

        
        const currentIndex = trackList.findIndex(
          track => track.id === currentTrack.id
        );

        if (currentIndex === -1) {
          
          const firstTrack = trackList[0];
          nextTrackCacheRef.current = firstTrack;
          return firstTrack;
        }

        
        const isNearingEnd = currentIndex >= trackList.length - 3;
        const isNearing15Increment =
          (currentIndex + 1) % 15 >= 12 || (currentIndex + 1) % 15 === 0;

        if (
          (isNearingEnd || isNearing15Increment) &&
          hasMoreByType[currentSection]
        ) {
          loadMoreTracks(currentSection);
        }

        
        if (currentIndex < trackList.length - 1) {
          const nextTrack = trackList[currentIndex + 1];
          nextTrackCacheRef.current = nextTrack;
          return nextTrack;
        } else {
          
          if (hasMoreByType[currentSection]) {
            const loaded = await loadMoreTracks(currentSection);

            if (loaded) {
              let updatedTrackList;
              switch (currentSection) {
                case 'popular':
                  updatedTrackList = popularTracks;
                  break;
                case 'liked':
                  updatedTrackList = likedTracks;
                  break;
                case 'new':
                  updatedTrackList = newTracks;
                  break;
                case 'random':
                  updatedTrackList = randomTracks;
                  break;
                case 'search':
                  updatedTrackList = searchResults;
                  break;
                case 'my-vibe':
                  updatedTrackList = myVibeTracks;
                  break;
                default:
                  updatedTrackList = tracks;
              }

              if (updatedTrackList.length > trackList.length) {
                const nextTrack = updatedTrackList[trackList.length];
                nextTrackCacheRef.current = nextTrack;
                return nextTrack;
              }
            }
          }

          
          const firstTrack = trackList[0];
          nextTrackCacheRef.current = firstTrack;
          return firstTrack;
        }
      }
    } catch (error) {
      console.error('Error getting next track:', error);
      return null;
    }
  };

  const getPreviousTrack = async () => {
    try {
      if (!currentTrack) return null;

      
      try {
        const response = await axios.get('/api/music/previous', {
          params: {
            current_id: currentTrack.id,
            context: currentSection,
          },
          withCredentials: true,
        });

        if (response.data.success && response.data.track) {
          return response.data.track;
        } else {
          return null;
        }
      } catch (error) {
        console.error(
          'Ошибка при запросе предыдущего трека к бэкенду:',
          error
        );
        
        
        let trackList;
        switch (currentSection) {
          case 'popular':
            trackList = popularTracks;
            break;
          case 'liked':
            trackList = likedTracks;
            break;
          case 'new':
            trackList = newTracks;
            break;
          case 'random':
            trackList = randomTracks;
            break;
          case 'search':
            trackList = searchResults;
            break;
          case 'my-vibe':
            trackList = myVibeTracks;
            break;
          default:
            trackList = tracks;
        }

        if (!trackList || trackList.length === 0) {
          return null;
        }

        
        const currentIndex = trackList.findIndex(
          track => track.id === currentTrack.id
        );

        if (currentIndex === -1) {
          
          return trackList[trackList.length - 1];
        }

        
        const isNearingStart = currentIndex <= 2;
        const isNearing15Increment =
          (currentIndex + 1) % 15 <= 3 || (currentIndex + 1) % 15 === 0;

        if (
          (isNearingStart || isNearing15Increment) &&
          hasMoreByType[currentSection]
        ) {
          loadMoreTracks(currentSection);
        }

        
        if (currentIndex > 0) {
          return trackList[currentIndex - 1];
        } else {
          
          if (hasMoreByType[currentSection]) {
            const loaded = await loadMoreTracks(currentSection);

            if (loaded) {
              let updatedTrackList;
              switch (currentSection) {
                case 'popular':
                  updatedTrackList = popularTracks;
                  break;
                case 'liked':
                  updatedTrackList = likedTracks;
                  break;
                case 'new':
                  updatedTrackList = newTracks;
                  break;
                case 'random':
                  updatedTrackList = randomTracks;
                  break;
                case 'search':
                  updatedTrackList = searchResults;
                  break;
                case 'my-vibe':
                  updatedTrackList = myVibeTracks;
                  break;
                default:
                  updatedTrackList = tracks;
              }

              if (updatedTrackList.length > trackList.length) {
                return updatedTrackList[updatedTrackList.length - 1];
              }
            }
          }

          
          return trackList[trackList.length - 1];
        }
      }
    } catch (error) {
      console.error('Error getting previous track:', error);
      return null;
    }
  };

  useEffect(() => {
    const audio = audioRef.current;

    const handleEnded = async () => {
      if (crossfadeTimeoutRef.current) {
        return;
      }

      try {
        const nextTrackItem = await getNextTrack();
        if (nextTrackItem) {
          
          playTrack(nextTrackItem, currentSection);
        } else {
        }
      } catch (error) {
        console.error('Error auto-playing next track:', error);
      }
    };

    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrack, currentSection]);

  const setVolumeHandler = newVolume => {
    setVolume(newVolume);
    audioRef.current.volume = newVolume;

    if (newVolume === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      audioRef.current.volume = volume;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const seekTo = time => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;

      setCurrentTime(time);

      currentTimeRef.current = time;
    }
  };

  const likeTrack = async trackId => {
    try {
      const trackToUpdate =
        currentTrack && currentTrack.id === trackId
          ? currentTrack
          : tracks.find(t => t.id === trackId) ||
            popularTracks.find(t => t.id === trackId) ||
            newTracks.find(t => t.id === trackId) ||
            randomTracks.find(t => t.id === trackId) ||
            likedTracks.find(t => t.id === trackId);

      if (trackToUpdate) {
        const newIsLiked = !trackToUpdate.is_liked;

        if (currentTrack && currentTrack.id === trackId) {
          setCurrentTrack({
            ...currentTrack,
            is_liked: newIsLiked,
            likes_count: newIsLiked
              ? (currentTrack.likes_count || 0) + 1
              : Math.max(0, (currentTrack.likes_count || 0) - 1),
          });
        }

        const updateTrackInList = list => {
          return list.map(track => {
            if (track.id === trackId) {
              return {
                ...track,
                is_liked: newIsLiked,
                likes_count: newIsLiked
                  ? (track.likes_count || 0) + 1
                  : Math.max(0, (track.likes_count || 0) - 1),
              };
            }
            return track;
          });
        };

        setTracks(updateTrackInList(tracks));
        setPopularTracks(updateTrackInList(popularTracks));
        setNewTracks(updateTrackInList(newTracks));
        setRandomTracks(updateTrackInList(randomTracks));
        setMyVibeTracks(updateTrackInList(myVibeTracks));

        if (newIsLiked) {
          if (likedTracks.findIndex(track => track.id === trackId) === -1) {
            const updatedTrack = { ...trackToUpdate, is_liked: true };
            setLikedTracks([updatedTrack, ...likedTracks]);
          }
        } else {
          setLikedTracks(likedTracks.filter(track => track.id !== trackId));
        }
      }

      const response = await axios.post(
        `/api/music/${trackId}/like`,
        {},
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        const isLiked = response.data.is_liked;

        if (trackToUpdate && trackToUpdate.is_liked !== isLiked) {
          const updateTrackInList = list => {
            return list.map(track => {
              if (track.id === trackId) {
                return {
                  ...track,
                  is_liked: isLiked,
                  likes_count: isLiked
                    ? (track.likes_count || 0) + 1
                    : Math.max(0, (track.likes_count || 0) - 1),
                };
              }
              return track;
            });
          };

          setTracks(updateTrackInList(tracks));
          setPopularTracks(updateTrackInList(popularTracks));
          setNewTracks(updateTrackInList(newTracks));
          setRandomTracks(updateTrackInList(randomTracks));
          setMyVibeTracks(updateTrackInList(myVibeTracks));

          if (!isLiked) {
            setLikedTracks(likedTracks.filter(track => track.id !== trackId));
          } else if (
            likedTracks.findIndex(track => track.id === trackId) === -1
          ) {
            const trackToAdd =
              tracks.find(track => track.id === trackId) ||
              popularTracks.find(track => track.id === trackId) ||
              newTracks.find(track => track.id === trackId) ||
              randomTracks.find(track => track.id === trackId);

            if (trackToAdd) {
              const updatedTrack = { ...trackToAdd, is_liked: true };
              setLikedTracks([updatedTrack, ...likedTracks]);
            }
          }
        }

        likedTracksLastLoadedRef.current = Date.now();

        return { success: true, is_liked: isLiked };
      } else {
        console.error('Ошибка при лайке/анлайке трека:', response.data.message);

        if (trackToUpdate) {
          const isLiked = trackToUpdate.is_liked;

          const updateTrackInList = list => {
            return list.map(track => {
              if (track.id === trackId) {
                return {
                  ...track,
                  is_liked: isLiked,
                  likes_count: isLiked
                    ? track.likes_count || 0
                    : Math.max(0, track.likes_count || 0),
                };
              }
              return track;
            });
          };

          setTracks(updateTrackInList(tracks));
          setPopularTracks(updateTrackInList(popularTracks));
          setNewTracks(updateTrackInList(newTracks));
          setRandomTracks(updateTrackInList(randomTracks));
          setMyVibeTracks(updateTrackInList(myVibeTracks));

          if (currentTrack && currentTrack.id === trackId) {
            setCurrentTrack({
              ...currentTrack,
              is_liked: isLiked,
            });
          }
        }

        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error('Ошибка при лайке/анлайке трека:', error);

      if (currentTrack && currentTrack.id === trackId) {
        setCurrentTrack({ ...currentTrack });
      }

      return {
        success: false,
        message: 'Произошла ошибка при обновлении статуса лайка',
      };
    }
  };

  const uploadTrack = async (file, trackInfo) => {
    try {
      const formData = new FormData();
      formData.append('audio', file);

      if (trackInfo) {
        formData.append('title', trackInfo.title || '');
        formData.append('artist', trackInfo.artist || '');
        formData.append('album', trackInfo.album || '');
      }

      try {
        const extractMetadata = () => {
          return new Promise((resolve, reject) => {
            if (typeof window.jsmediatags === 'undefined') {
              resolve(null);
              return;
            }

            window.jsmediatags.read(file, {
              onSuccess: function (tag) {
                const tags = tag.tags || {};
                const title = tags.title || '';
                const artist = tags.artist || '';
                const album = tags.album || '';

                let pictureData = null;
                if (tags.picture) {
                  const { data, format } = tags.picture;
                  const base64String = data.reduce(
                    (acc, byte) => acc + String.fromCharCode(byte),
                    ''
                  );
                  pictureData = `data:${format};base64,${window.btoa(base64String)}`;
                }

                resolve({
                  title: title || trackInfo?.title || '',
                  artist: artist || trackInfo?.artist || '',
                  album: album || trackInfo?.album || '',
                  pictureData,
                });
              },
              onError: function (error) {
                console.warn('Ошибка при извлечении метаданных:', error);
                resolve(null);
              },
            });
          });
        };

        const metadata = await extractMetadata();

        if (metadata) {
          if (metadata.title) formData.append('title', metadata.title);
          if (metadata.artist) formData.append('artist', metadata.artist);
          if (metadata.album) formData.append('album', metadata.album);

          if (metadata.pictureData) {
            const fetchResponse = await fetch(metadata.pictureData);
            const blob = await fetchResponse.blob();

            const coverFile = new File([blob], 'cover.jpg', {
              type: blob.type,
            });
            formData.append('cover', coverFile);
          }
        }
      } catch (error) {
        console.error('Ошибка при извлечении метаданных:', error);
      }

      const response = await axios.post('/api/music/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        const updatedTracks = [response.data.track, ...tracks];
        setTracks(updatedTracks);

        const newTracksList = [response.data.track, ...newTracks].slice(0, 10);
        setNewTracks(newTracksList);

        
        if (myVibeTracks.length > 0) {
          const updatedMyVibeTracks = [
            response.data.track,
            ...myVibeTracks,
          ].slice(0, 30);
          setMyVibeTracks(updatedMyVibeTracks);
        }

        return response.data.track;
      }

      return null;
    } catch (error) {
      console.error('Ошибка при загрузке трека:', error);
      return null;
    }
  };

  useEffect(() => {
    if (!currentTrack) return;

    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.artist,
        album: currentTrack.album || '',
        artwork: [
          {
            src:
              currentTrack.cover_path ||
              '/uploads/system/album_placeholder.jpg',
            sizes: '512x512',
            type: 'image/jpeg',
          },
        ],
      });

      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

      navigator.mediaSession.setActionHandler('play', togglePlay);
      navigator.mediaSession.setActionHandler('pause', togglePlay);
      navigator.mediaSession.setActionHandler('nexttrack', nextTrack);
      navigator.mediaSession.setActionHandler('previoustrack', prevTrack);

      navigator.mediaSession.setActionHandler('seekto', details => {
        if (details.seekTime) {
          seekTo(details.seekTime);
        }
      });

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          navigator.mediaSession.playbackState = isPlaying
            ? 'playing'
            : 'paused';
        }
      });

      const isIOS =
        /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      if (isIOS) {
        const audioElement = audioRef.current;

        const iosPlayHandler = () => {
          navigator.mediaSession.playbackState = 'playing';
          navigator.mediaSession.metadata = navigator.mediaSession.metadata;
        };

        const iosPauseHandler = () => {
          navigator.mediaSession.playbackState = 'paused';
          navigator.mediaSession.metadata = navigator.mediaSession.metadata;
        };

        audioElement.addEventListener('play', iosPlayHandler);
        audioElement.addEventListener('pause', iosPauseHandler);

        return () => {
          audioElement.removeEventListener('play', iosPlayHandler);
          audioElement.removeEventListener('pause', iosPauseHandler);
        };
      }
    }
  }, [currentTrack, isPlaying]);

  const loadMoreTracks = useCallback(
    async (type = 'all') => {
      if (isLoadingMoreRef.current) {
        return false;
      }

      const hasMoreForType = hasMoreByType[type] !== false;
      if (!hasMoreForType) {
        return false;
      }

      if (
        pageByType[type] === 1 &&
        ((type === 'all' && tracks.length === 0) ||
          (type === 'liked' && likedTracks.length === 0) ||
          (type === 'random' && randomTracks.length === 0) ||
          (type === 'popular' && popularTracks.length === 0) ||
          (type === 'new' && newTracks.length === 0))
      ) {
        return false;
      }

      isLoadingMoreRef.current = true;
      setIsLoadingMore(true);

      try {
        let nextPage = pageByType[type] + 1;

        let endpoint = '/api/music';
        let params = { page: nextPage, per_page: 50 };

        let response;

        if (type === 'liked') {
          endpoint = '/api/music/liked';
          params = { page: nextPage, per_page: 50 };

          const config = {
            params,
            headers: {
              'Cache-Control': 'no-cache',
              Pragma: 'no-cache',
              Expires: '0',
            },
            withCredentials: true,
          };

          response = await axios.get(endpoint, config);
          console.log(`[loadMoreTracks] Получен ответ для liked треков:`, {
            status: response.status,
            hasData: !!response.data,
            hasTracks: !!(response.data && response.data.tracks),
            tracksCount:
              response.data && response.data.tracks
                ? response.data.tracks.length
                : 0,
          });
        } else if (type === 'my-vibe') {
          endpoint = '/api/music/my-vibe';
          params = { page: nextPage, per_page: 50 };

          const config = {
            params,
            headers: {
              'Cache-Control': 'no-cache',
              Pragma: 'no-cache',
              Expires: '0',
            },
            withCredentials: true,
          };

          response = await axios.get(endpoint, config);
          console.log(`[loadMoreTracks] Получен ответ для "Мой вайб":`, {
            status: response.status,
            hasData: !!response.data,
            hasTracks: !!(response.data && response.data.tracks),
            tracksCount:
              response.data && response.data.tracks
                ? response.data.tracks.length
                : 0,
          });
        } else if (type === 'popular') {
          params.sort = 'popular';
        } else if (type === 'new') {
          params.sort = 'date';
        } else if (type === 'random') {
          params.random = true;

          params.nocache = Math.random();
        }

        // Убрана задержка для ускорения загрузки

        if (type !== 'liked') {
          response = await axios.get(endpoint, { params });
        }

        let newTracks = [];
        let has_more = false;

        if (response && response.data && response.data.tracks) {
          newTracks = response.data.tracks;
          has_more = newTracks.length >= 50;

          if (response.data.has_more !== undefined) {
            has_more = response.data.has_more;
          } else if (response.data.pages !== undefined) {
            has_more = nextPage < response.data.pages;
          }

          if (newTracks.length > 0) {
            const prefetchCount = Math.min(2, newTracks.length);

            Promise.all(
              newTracks.slice(0, prefetchCount).map(async track => {
                if (!track.lyricsData) {
                  try {
                    const lyricsData = await fetchLyricsForTrack(track.id);
                    if (lyricsData) {
                      track.lyricsData = lyricsData;
                    }
                  } catch (err) {
                    console.error(
                      `[loadMoreTracks] Error pre-fetching lyrics for track ${track.id}:`,
                      err
                    );
                  }
                }
              })
            ).catch(err =>
              console.error(
                '[loadMoreTracks] Error in lyrics pre-fetch batch:',
                err
              )
            );
          }
        } else if (response && Array.isArray(response.data)) {
          newTracks = response.data;
          has_more = newTracks.length >= 50;
        } else if (type !== 'liked') {
          console.warn(
            `[loadMoreTracks] Странный формат ответа API для типа ${type}:`,
            response ? response.data : 'Нет ответа'
          );
        }

        if (newTracks.length === 0) {
          has_more = false;
        }

        if (type === 'all') {
          setTracks(prevTracks => [...prevTracks, ...newTracks]);
        } else if (type === 'liked') {
          if (response && response.data && response.data.tracks) {
            setLikedTracks(prevTracks => [
              ...prevTracks,
              ...response.data.tracks,
            ]);
          } else {
            setLikedTracks(prevTracks => [...prevTracks, ...newTracks]);
          }
        } else if (type === 'my-vibe') {
          if (response && response.data && response.data.tracks) {
            setMyVibeTracks(prevTracks => [
              ...prevTracks,
              ...response.data.tracks,
            ]);
          } else {
            setMyVibeTracks(prevTracks => [...prevTracks, ...newTracks]);
          }
        } else if (type === 'popular') {
          setPopularTracks(prevTracks => [...prevTracks, ...newTracks]);
        } else if (type === 'new') {
          setNewTracks(prevTracks => [...prevTracks, ...newTracks]);
        } else if (type === 'random') {
          const shuffledNewTracks = [...newTracks].sort(
            () => Math.random() - 0.5
          );
          setRandomTracks(prevTracks => [...prevTracks, ...shuffledNewTracks]);
        }

        setPageByType(prev => ({
          ...prev,
          [type]: nextPage,
        }));

        setHasMoreByType(prev => ({
          ...prev,
          [type]: has_more,
        }));

        if (currentSection === type) {
          setHasMoreTracks(has_more);
        }

        if (has_more) {
          setTimeout(() => {
            preloadNextPage(nextPage + 1, type);
          }, 1000);
        }

        return true;
      } catch (error) {
        console.error('[loadMoreTracks] Ошибка при загрузке треков:', error);

        if (error.response && error.response.status === 404) {
          setHasMoreByType(prev => ({ ...prev, [type]: false }));
          if (currentSection === type) {
            setHasMoreTracks(false);
          }
        }

        return false;
      } finally {
        isLoadingMoreRef.current = false;
        setIsLoadingMore(false);
      }
    },
    [
      pageByType,
      hasMoreByType,
      tracks.length,
      likedTracks.length,
      randomTracks.length,
      popularTracks.length,
      newTracks.length,
      currentSection,
    ]
  );

  const preloadNextPage = useCallback(async (nextPage, type = 'all') => {
    try {
      const now = Date.now();
      const lastPreloadTime = preloadTimeRef.current?.[type] || 0;

      if (now - lastPreloadTime < 30000) {
        return;
      }

      preloadTimeRef.current = {
        ...(preloadTimeRef.current || {}),
        [type]: now,
      };

      if (type === 'liked') {
        let endpoint = '/api/music/liked';
        let params = { page: nextPage, per_page: 50 };

        try {
          const response = await axios.get(endpoint, {
            params,
            headers: {
              'Cache-Control': 'max-age=300',
            },
          });
        } catch (error) {
          console.error('Ошибка при предзагрузке понравившихся треков:', error);
        }
        return;
      }

      if (type === 'my-vibe') {
        let endpoint = '/api/music/my-vibe';
        let params = { page: nextPage, per_page: 50 };

        try {
          const response = await axios.get(endpoint, {
            params,
            headers: {
              'Cache-Control': 'max-age=300',
            },
          });
        } catch (error) {
          console.error('Ошибка при предзагрузке "Мой вайб":', error);
        }
        return;
      }

      let endpoint = '/api/music';
      let params = { page: nextPage, per_page: 50 };

      if (type === 'popular') {
        params.sort = 'popular';
      } else if (type === 'new') {
        params.sort = 'date';
      } else if (type === 'random') {
        params.random = true;
      }

      const response = await axios.get(endpoint, {
        params,
        headers: {
          'Cache-Control': 'max-age=300',
        },
      });
    } catch (error) {
      console.error('Ошибка при предзагрузке треков:', error);
    }
  }, []);

  const searchTracks = async query => {
    if (!query || query.trim() === '') {
      setSearchResults([]);
      return [];
    }

    try {
      setIsSearching(true);

      const response = await axios.get('/api/music/search', {
        params: { query: query.trim() },
        timeout: 10000,
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
          Expires: '0',
        },
        withCredentials: true, 
      });

      console.log('[SEARCH] Полный ответ сервера:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data),
        length: Array.isArray(response.data) ? response.data.length : 'N/A',
      });

      const tracks = response.data;

      
      if (!Array.isArray(tracks)) {
        console.warn('[SEARCH] Ответ сервера не является массивом:', tracks);
        setSearchResults([]);
        return [];
      }

      if (tracks.length === 0) {
        setSearchResults([]);
        return [];
      }

      
      const processedTracks = tracks.map((track, index) => {
        console.log(`[SEARCH] Обрабатываем трек ${index + 1}:`, {
          id: track.id,
          title: track.title,
          artist: track.artist,
          file_path: track.file_path,
          cover_path: track.cover_path,
        });

        return {
          ...track,
          
          is_liked:
            typeof track.is_liked === 'boolean'
              ? track.is_liked
              : Boolean(likedTracks.find(lt => lt.id === track.id)),
          
          file_path:
            track.file_path || '/static/uploads/system/audio_placeholder.mp3',
          cover_path:
            track.cover_path || '/static/uploads/system/album_placeholder.jpg',
        };
      });

      setSearchResults(processedTracks);
      return processedTracks;
    } catch (error) {
      console.error('[SEARCH] Подробная ошибка при поиске треков:', {
        message: error.message,
        response: error.response
          ? {
              status: error.response.status,
              statusText: error.response.statusText,
              data: error.response.data,
            }
          : 'Нет ответа',
        request: error.request
          ? 'Запрос был отправлен'
          : 'Запрос не был отправлен',
        config: error.config
          ? {
              url: error.config.url,
              method: error.config.method,
              params: error.config.params,
            }
          : 'Нет конфига',
      });

      
      if (error.response) {
        
        if (error.response.status === 401) {
          console.error('[SEARCH] Требуется аутентификация для поиска');
        } else if (error.response.status === 403) {
          console.error('[SEARCH] Доступ запрещен');
        } else if (error.response.status === 404) {
          console.error('[SEARCH] Эндпоинт поиска не найден');
        } else {
          console.error(
            `[SEARCH] Ошибка сервера: ${error.response.status} - ${error.response.data?.error || 'Неизвестная ошибка'}`
          );
        }
      } else if (error.request) {
        
        console.error('[SEARCH] Нет ответа от сервера при поиске');
      } else {
        
        console.error('[SEARCH] Ошибка при настройке запроса:', error.message);
      }

      setSearchResults([]);
      return [];
    } finally {
      setIsSearching(false);
    }
  };

  const resetPagination = useCallback(async (type, randomize = false) => {
    setPageByType(prev => ({
      ...prev,
      [type]: 1,
    }));

    return new Promise(async (resolve, reject) => {
      try {
        let url = '/api/music';
        let params = { page: 1, per_page: 50 };

        if (type === 'liked') {
          url = '/api/music/liked';

          try {
            const config = {
              params,
              headers: {
                'Cache-Control': 'no-cache',
                Pragma: 'no-cache',
                Expires: '0',
              },
              withCredentials: true,
            };

            const response = await axios.get(url, config);

            if (response.data && response.data.tracks) {
              const receivedTracks = response.data.tracks;

              const hasMore = receivedTracks.length >= params.per_page;

              setLikedTracks(receivedTracks);
              setHasMoreByType(prev => ({ ...prev, liked: hasMore }));

              if (currentSection === 'liked') {
                setHasMoreTracks(hasMore);
              }

              resolve(true);
              return;
            } else {
              setLikedTracks([]);
              setHasMoreByType(prev => ({ ...prev, liked: false }));

              if (currentSection === 'liked') {
                setHasMoreTracks(false);
              }

              resolve(false);
              return;
            }
          } catch (error) {
            console.error(
              '[resetPagination] Ошибка при загрузке понравившихся треков:',
              error
            );
            setHasMoreByType(prev => ({ ...prev, liked: false }));

            if (currentSection === 'liked') {
              setHasMoreTracks(false);
            }

            reject(error);
            return;
          }
        } else if (type === 'my-vibe') {
          url = '/api/music/my-vibe';

          try {
            const config = {
              params,
              headers: {
                'Cache-Control': 'no-cache',
                Pragma: 'no-cache',
                Expires: '0',
              },
              withCredentials: true,
            };

            const response = await axios.get(url, config);

            if (response.data && response.data.tracks) {
              const receivedTracks = response.data.tracks;

              const hasMore = receivedTracks.length >= params.per_page;

              setMyVibeTracks(receivedTracks);
              setHasMoreByType(prev => ({ ...prev, 'my-vibe': hasMore }));

              if (currentSection === 'my-vibe') {
                setHasMoreTracks(hasMore);
              }

              resolve(true);
              return;
            } else {
              setMyVibeTracks([]);
              setHasMoreByType(prev => ({ ...prev, 'my-vibe': false }));

              if (currentSection === 'my-vibe') {
                setHasMoreTracks(false);
              }

              resolve(false);
              return;
            }
          } catch (error) {
            console.error(
              '[resetPagination] Ошибка при загрузке "Мой вайб":',
              error
            );
            setHasMoreByType(prev => ({ ...prev, 'my-vibe': false }));

            if (currentSection === 'my-vibe') {
              setHasMoreTracks(false);
            }

            reject(error);
            return;
          }
        } else if (type === 'popular') {
          params.sort = 'popular';
        } else if (type === 'new') {
          params.sort = 'date';
        }

        if (randomize) {
          params.random = true;

          params.nocache = Math.random();
        }

        const response = await axios.get(url, { params });

        if (response.data && response.data.tracks) {
          const receivedTracks = response.data.tracks;

          if (type === 'all') {
            setTracks(receivedTracks);
            setHasMoreTracks(receivedTracks.length >= 50);
            setHasMoreByType(prev => ({
              ...prev,
              all: receivedTracks.length >= 50,
            }));
          } else if (type === 'liked') {
            setLikedTracks(receivedTracks);
            setHasMoreTracks(receivedTracks.length >= 50);
            setHasMoreByType(prev => ({
              ...prev,
              liked: receivedTracks.length >= 50,
            }));
          } else if (type === 'my-vibe') {
            setMyVibeTracks(receivedTracks);
            setHasMoreTracks(receivedTracks.length >= 50);
            setHasMoreByType(prev => ({
              ...prev,
              'my-vibe': receivedTracks.length >= 50,
            }));
          } else if (type === 'popular') {
            setPopularTracks(receivedTracks);
            setHasMoreTracks(receivedTracks.length >= 50);
            setHasMoreByType(prev => ({
              ...prev,
              popular: receivedTracks.length >= 50,
            }));
          } else if (type === 'new') {
            setNewTracks(receivedTracks);
            setHasMoreTracks(receivedTracks.length >= 50);
            setHasMoreByType(prev => ({
              ...prev,
              new: receivedTracks.length >= 50,
            }));
          }

          resolve(true);
        } else {
          reject(new Error('Не удалось загрузить треки'));
        }
      } catch (error) {
        console.error(`Ошибка при сбросе пагинации для типа ${type}:`, error);
        reject(error);
      }
    });
  }, []);

  useEffect(() => {
    if (initialMount.current) {
      try {
        const savedTrack = localStorage.getItem('currentTrack');
        const savedSection = localStorage.getItem('currentSection') || 'all';

        
        const validSections = [
          'all',
          'popular',
          'liked',
          'new',
          'random',
          'my-vibe',
        ];
        const isValidSection =
          validSections.includes(savedSection) ||
          savedSection.startsWith('playlist_');

        if (savedTrack) {
          const parsedTrack = JSON.parse(savedTrack);
          setCurrentTrack(parsedTrack);

          
          if (isValidSection) {
            setCurrentSectionHandler(savedSection);
          } else {
            setCurrentSectionHandler('all');
          }

          audioRef.current.src = parsedTrack.file_path;
          audioRef.current.volume = volume;
          setIsPlaying(false);
        } else {
          
          setCurrentSectionHandler('all');
        }
      } catch (error) {
        console.error('Ошибка при восстановлении трека:', error);
        
        setCurrentSectionHandler('all');
      }

      initialMount.current = false;
    }
  }, [volume]);



  const getCurrentTimeRaw = useCallback(() => {
    const audio = audioRef.current;

    if (audio && !isNaN(audio.currentTime)) {
      return audio.currentTime;
    }
    return currentTimeRef.current || 0;
  }, []);

  const enableTimeUpdates = useCallback(() => {
    hasTimeListenersRef.current = true;
    setHasActiveTimeListeners(true);
  }, []);

  const disableTimeUpdates = useCallback(() => {
    hasTimeListenersRef.current = false;
    setHasActiveTimeListeners(false);
  }, []);

  const getDurationRaw = useCallback(() => {
    const audio = audioRef.current;

    if (audio && !isNaN(audio.duration)) {
      return audio.duration;
    }
    return durationRef.current || 0;
  }, []);

  const setPlaylistTracks = useCallback((tracks, playlistId) => {
    setPlaylistTracksState(prevState => ({
      ...prevState,
      [playlistId]: tracks,
    }));
  }, []);

  
  const determineSectionFromTrack = track => {
    
    const currentPath = window.location.pathname;

    
    if (
      currentPath.includes('/music/liked') ||
      currentPath.includes('/liked')
    ) {
      return 'liked';
    }
    if (
      currentPath.includes('/music/popular') ||
      currentPath.includes('/popular')
    ) {
      return 'popular';
    }
    if (currentPath.includes('/music/new') || currentPath.includes('/new')) {
      return 'new';
    }
    if (
      currentPath.includes('/music/random') ||
      currentPath.includes('/random')
    ) {
      return 'random';
    }
    if (
      currentPath.includes('/music/my-vibe') ||
      currentPath.includes('/my-vibe')
    ) {
      return 'my-vibe';
    }
    if (
      currentPath.includes('/music/all') ||
      currentPath.includes('/all-tracks')
    ) {
      return 'all';
    }

    
    if (likedTracks.find(t => t.id === track.id)) {
      return 'liked';
    }
    if (popularTracks.find(t => t.id === track.id)) {
      return 'popular';
    }
    if (newTracks.find(t => t.id === track.id)) {
      return 'new';
    }
    if (randomTracks.find(t => t.id === track.id)) {
      return 'random';
    }
    if (myVibeTracks.find(t => t.id === track.id)) {
      return 'my-vibe';
    }
    if (searchResults.find(t => t.id === track.id)) {
      return 'search';
    }
    
    for (const [playlistId, tracks] of Object.entries(playlistTracks)) {
      if (tracks.find(t => t.id === track.id)) {
        return `playlist_${playlistId}`;
      }
    }
    
    return 'all';
  };

  
  const setCurrentSectionHandler = section => {
    setCurrentSection(section);

    
    if (section && !section.startsWith('playlist_') && section !== 'search') {
      try {
        localStorage.setItem('currentSection', section);
      } catch (error) {
        console.error('Ошибка при сохранении секции в localStorage:', error);
      }
    }
  };

  const resetCurrentSection = () => {
    setCurrentSection('all');

    try {
      localStorage.removeItem('currentSection');
    } catch (error) {
      console.error('Ошибка при удалении секции из localStorage:', error);
    }
  };

  
  const openFullScreenPlayer = useCallback(() => {
    setIsFullScreenPlayerOpen(true);
    hasTimeListenersRef.current = true; 

    
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari =
      /safari/i.test(navigator.userAgent) &&
      !/chrome/i.test(navigator.userAgent) &&
      !/android/i.test(navigator.userAgent);

    
    const rootElement = document.getElementById('root');
    if (rootElement) {
      if (isIOS || isSafari) {
        
        rootElement.style.transform = 'translateX(-100vw)';
        rootElement.style.position = 'fixed';
        rootElement.style.visibility = 'hidden';
        rootElement.style.opacity = '0';
      } else {
        
        rootElement.style.visibility = 'hidden';
        rootElement.style.position = 'fixed';
        rootElement.style.top = '-9999px';
        rootElement.style.left = '-9999px';
        rootElement.style.zIndex = '-1';
        rootElement.style.opacity = '0';
        rootElement.style.pointerEvents = 'none';
      }
    }

    
    if (typeof document !== 'undefined' && document.body) {
      document.body.style.overflow = 'hidden';
      if (isIOS) {
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.height = '100vh';
      }
    }
  }, []);

  const closeFullScreenPlayer = useCallback(() => {
    setIsFullScreenPlayerOpen(false);
    hasTimeListenersRef.current = false; 

    
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari =
      /safari/i.test(navigator.userAgent) &&
      !/chrome/i.test(navigator.userAgent) &&
      !/android/i.test(navigator.userAgent);

    
    const rootElement = document.getElementById('root');
    if (rootElement) {
      if (isIOS || isSafari) {
        
        rootElement.style.transform = '';
        rootElement.style.position = '';
        rootElement.style.visibility = '';
        rootElement.style.opacity = '';
        rootElement.style.pointerEvents = '';
      } else {
        
        rootElement.style.visibility = '';
        rootElement.style.position = '';
        rootElement.style.top = '';
        rootElement.style.left = '';
        rootElement.style.zIndex = '';
        rootElement.style.opacity = '';
        rootElement.style.pointerEvents = '';
      }
    }

    
    if (typeof document !== 'undefined' && document.body) {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    }
  }, []);

  
  const forceLoadTracks = useCallback(
    async (section = null) => {
      const targetSection = section || currentSection;

      
      if (targetSection === 'liked' && isLoadingLikedTracksRef.current) {
        return;
      }

      
      

      
      try {
        let url = '/api/music';
        let params = { page: 1, per_page: 50 };

        if (targetSection === 'liked') {
          url = '/api/music/liked';
          isLoadingLikedTracksRef.current = true; 
        } else if (targetSection === 'my-vibe') {
          url = '/api/music/my-vibe';
        } else if (targetSection === 'popular') {
          params.sort = 'popular';
        } else if (targetSection === 'new') {
          params.sort = 'date';
        } else if (targetSection === 'random') {
          params.random = true;
          params.nocache = Math.random();
        }

        setIsLoading(true);
        isLoadingRef.current = true;

        const response = await axios.get(url, { params });

        if (response.data && response.data.tracks) {
          const receivedTracks = response.data.tracks;

          if (targetSection === 'all') {
            setTracks(receivedTracks);
          } else if (targetSection === 'popular') {
            setPopularTracks(receivedTracks);
          } else if (targetSection === 'liked') {
            setLikedTracks(receivedTracks);
          } else if (targetSection === 'new') {
            setNewTracks(receivedTracks);
          } else if (targetSection === 'random') {
            const shuffledTracks = [...receivedTracks].sort(
              () => Math.random() - 0.5
            );
            setRandomTracks(shuffledTracks);
          } else if (targetSection === 'my-vibe') {
            setMyVibeTracks(receivedTracks);
          }

          setHasMoreTracks(receivedTracks.length >= 50);
          setHasMoreByType(prev => ({
            ...prev,
            [targetSection]: receivedTracks.length >= 50,
          }));
        }
      } catch (error) {
        console.error('Ошибка при принудительной загрузке треков:', error);
      } finally {
        setIsLoading(false);
        isLoadingRef.current = false;
        if (targetSection === 'liked') {
          isLoadingLikedTracksRef.current = false; 
        }
      }
    },
    [currentSection]
  );

  
  const playTrackById = useCallback(async trackId => {
    if (!trackId) return;

    try {
      const response = await axios.get(`/api/music/${trackId}`);
      if (response.data && response.data.success && response.data.track) {
        
        setCurrentTrack(response.data.track);
        console.log('Track loaded for deeplink:', trackId);
      } else {
        console.error('Failed to load track:', trackId);
      }
    } catch (e) {
      console.error('Error loading track:', e);
    }
  }, []);

  
  useEffect(() => {
    
    const deeplinkTrackId = localStorage.getItem('deeplinkTrackId');
    if (deeplinkTrackId) {
      
      playTrackById(deeplinkTrackId);
      localStorage.removeItem('deeplinkTrackId');
    }
  }, [playTrackById]);

  const musicContextValue = {
    tracks,
    popularTracks,
    likedTracks,
    newTracks,
    randomTracks,
    myVibeTracks,
    currentTrack,
    isPlaying,
    volume,
    isMuted,
    currentTime,
    duration,
    isLoading,
    audioRef,
    hasMoreTracks,
    hasMoreByType,
    currentSection,
    isTrackLoading,
    isFullScreenPlayerOpen,
    setCurrentTrack,
    setCurrentSection: setCurrentSectionHandler,
    resetCurrentSection,
    setRandomTracks,
    playTrack,
    togglePlay,
    nextTrack,
    prevTrack,
    setVolume: setVolumeHandler,
    toggleMute,
    seekTo,
    likeTrack,
    uploadTrack,
    loadMoreTracks,
    resetPagination,
    enableCrossfade,
    setEnableCrossfade,
    searchResults,
    isSearching,
    searchTracks,
    getCurrentTimeRaw,
    getDurationRaw,
    playlistTracks,
    setPlaylistTracks,
    openFullScreenPlayer,
    closeFullScreenPlayer,
    forceLoadTracks,
    playTrackById,
    enableTimeUpdates,
    disableTimeUpdates,
  };

  return (
    <MusicContext.Provider value={musicContextValue}>
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => useContext(MusicContext);
