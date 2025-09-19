import React from 'react';
import {
  Container,
  Box,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useParams } from 'react-router-dom';
import { useMusic } from '../../context/MusicContext';
import SEO from '../../components/SEO';
import MobilePlayer from '../../components/Music/MobilePlayer';
import DesktopPlayer from '../../components/Music/DesktopPlayer';
import InfoBlock from '../../UIKIT/InfoBlock';


import { useArtistData } from './hooks/useArtistData';
import { useArtistActions } from './hooks/useArtistActions';
import { useArtistAlbums } from './hooks/useArtistAlbums';


import ArtistHeader from './components/ArtistHeader';
import ArtistBiography from './components/ArtistBiography';
import TrackSection from './components/TrackSection';
import TrackList from './components/TrackList';
import NotFoundCard from './components/NotFoundCard';
import LoadingState, { DetailedLoadingState } from './components/LoadingState';
import ErrorState from './components/ErrorState';
import AlbumsSection from './components/AlbumsSection';
import AlbumModal from './components/AlbumModal';


import { ArtistPageProps } from './types';

const PageContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  backgroundColor: 'transparent',
  
  paddingBottom: theme.spacing(14),
  [theme.breakpoints.up('md')]: {
    paddingBottom: theme.spacing(16),
  },
}));

const ContentContainer = styled(Container)(({ theme }) => ({
  maxWidth: '1400px !important',
  padding: '0px !important',
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(0, 0),
  },
}));

const TracksSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '5px',
  marginTop: '5px',
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 800,
  fontSize: '1.75rem',
  color: '#ffffff',
  marginBottom: '5px',
  letterSpacing: '-0.01em',
  [theme.breakpoints.down('md')]: {
    fontSize: '1.5rem',
  },
}));

const ArtistPage: React.FC<ArtistPageProps> = () => {
  const { artistParam } = useParams<{ artistParam: string }>();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const {
    currentTrack,
    isPlaying,
    openFullScreenPlayer,
    closeFullScreenPlayer,
    isFullScreenPlayerOpen,
  } = useMusic();

  
  const {
    artist,
    tracks,
    mostListenedTracks,
    newestTracks,
    isLoading,
    error,
    hasMoreTracks,
    loadingMoreTracks,
    loadMoreTracks,
  } = useArtistData({ artistParam: artistParam || '' });

  const {
    handleTrackClick,
    handlePlayTrack,
    handleLikeTrack,
    handleTogglePlay,
    handleBackClick,
    shareArtist,
  } = useArtistActions(artist);

  
  const {
    albums,
    isLoading: albumsLoading,
    error: albumsError,
  } = useArtistAlbums(artist?.id || null);

  
  const handleOpenFullScreenPlayer = React.useCallback(() => {
    openFullScreenPlayer();
  }, [openFullScreenPlayer]);

  const handleCloseFullScreenPlayer = React.useCallback(() => {
    closeFullScreenPlayer();
    document.body.style.overflow = '';
    document.body.style.touchAction = '';
  }, [closeFullScreenPlayer]);

  
  const handlePlayFirstTrack = React.useCallback(() => {
    if (tracks && tracks.length > 0) {
      handleTrackClick(tracks[0]);
    }
  }, [tracks, handleTrackClick]);

  
  const handleShareClick = React.useCallback(() => {
    if (artist) {
      shareArtist(artist);
    }
  }, [artist, shareArtist]);

  
  const handleNavigateToMusic = React.useCallback(() => {
    window.location.href = '/music';
  }, []);

  
  const [selectedAlbum, setSelectedAlbum] = React.useState<any>(null);
  const [isAlbumModalOpen, setIsAlbumModalOpen] = React.useState(false);

  
  const handleAlbumClick = React.useCallback((album: any) => {
    setSelectedAlbum(album);
    setIsAlbumModalOpen(true);
  }, []);

  
  const handleCloseAlbumModal = React.useCallback(() => {
    setIsAlbumModalOpen(false);
    setSelectedAlbum(null);
  }, []);

  
  if (isLoading && !artist) {
    return (
      <PageContainer>
        <ContentContainer>
          {isMobile ? <LoadingState /> : <DetailedLoadingState />}
        </ContentContainer>
      </PageContainer>
    );
  }

  
  if (error || !artist) {
    return (
      <PageContainer>
        <ContentContainer>
          <ErrorState
            error={error || 'Исполнитель не найден'}
            onBackClick={handleBackClick}
          />
        </ContentContainer>
      </PageContainer>
    );
  }

  
  const noTracksAndNotVerified = (!tracks || tracks.length === 0) && !artist.verified;

  return (
    <PageContainer marginTop="20px">
      <SEO
        title={`${artist.name} - К-Коннект`}
        description={`Слушайте треки ${artist.name} на К-Коннект. ${artist.bio ? artist.bio.slice(0, 150) + '...' : ''}`}
        image={artist.avatar_url || '/static/uploads/system/album_placeholder.jpg'}
        url={window.location.href}
        type="music.musician"
        meta={{}}
      />

      {noTracksAndNotVerified ? (
        <ContentContainer>
          <NotFoundCard
            artist={artist}
            onNavigateToMusic={handleNavigateToMusic}
          />
        </ContentContainer>
      ) : (
        <>
          {/* Шапка исполнителя - на всю ширину */}
          <ArtistHeader
            artist={artist}
            tracks={tracks}
            onBackClick={handleBackClick}
            onShareClick={handleShareClick}
            onPlayClick={handlePlayFirstTrack}
          />

                              {/* Контент с ограничением ширины */}
                    <ContentContainer>
                      {/* Биография */}
                      {artist.bio && (
                        <InfoBlock
                          title="Биография"
                          description={artist.bio}
                          children={null}
                          useTheme={true}
                          style={{ marginBottom: '5px' }}
                          styleVariant="default"
                          titleStyle={{}}
                          descriptionStyle={{}}
                          customStyle={false}
                          className=""
                        />
                      )}

                      {/* Альбомы */}
                      <AlbumsSection
                        albums={albums}
                        isLoading={albumsLoading}
                        error={albumsError}
                        onAlbumClick={handleAlbumClick}
                      />

                      <TracksSection>
              {/* Самые прослушиваемые треки */}
              {mostListenedTracks && mostListenedTracks.length > 0 && (
                <InfoBlock
                  title="Популярные"
                  description=""
                  useTheme={true}
                  style={{ marginBottom: '5px', padding: '16px' }}
                  styleVariant="default"
                  titleStyle={{}}
                  descriptionStyle={{}}
                  customStyle={false}
                  className=""
                >
                  <TrackSection
                    title=""
                    tracks={mostListenedTracks}
                    featured={true}
                    onTrackClick={handleTrackClick}
                    onLikeTrack={handleLikeTrack}
                    currentTrack={currentTrack}
                    isPlaying={isPlaying}
                  />
                </InfoBlock>
              )}

              {/* {newestTracks && newestTracks.length > 0 && (
                <InfoBlock
                  title="Новые релизы"
                  description=""
                  useTheme={true}
                  style={{ marginBottom: '5px', padding: '16px' }}
                  styleVariant="default"
                  titleStyle={{}}
                  descriptionStyle={{}}
                  customStyle={false}
                  className=""
                >
                  <TrackSection
                    title=""
                    tracks={newestTracks}
                    featured={true}
                    onTrackClick={handleTrackClick}
                    onLikeTrack={handleLikeTrack}
                    currentTrack={currentTrack}
                    isPlaying={isPlaying}
                  />
                </InfoBlock>
              )} */}

              {/* Все треки */}
              <InfoBlock
                title="Дискография"
                description=""
                useTheme={true}
                style={{ marginBottom: '5px', padding: '16px' }}
                styleVariant="default"
                titleStyle={{}}
                descriptionStyle={{}}
                customStyle={false}
                className=""
              >
                {tracks && tracks.length > 0 ? (
                  <TrackList
                    tracks={tracks}
                    onTrackClick={handleTrackClick}
                    onLikeTrack={handleLikeTrack}
                    currentTrack={currentTrack}
                    isPlaying={isPlaying}
                    hasMoreTracks={hasMoreTracks}
                    loadingMoreTracks={loadingMoreTracks}
                    onLoadMore={loadMoreTracks}
                  />
                ) : (
                  <Box
                    sx={{
                      textAlign: 'center',
                      py: 4,
                      color: 'rgba(255, 255, 255, 0.6)',
                    }}
                  >
                    <Typography variant="h6">
                      Треки не найдены
                    </Typography>
                  </Box>
                )}
              </InfoBlock>
            </TracksSection>
          </ContentContainer>
        </>
      )}

      {/* Мобильный плеер */}
      <MobilePlayer
        isMobile={isMobile}
        isModalOpen={isAlbumModalOpen}
      />

              {/* Десктопный плеер */}
        {!isMobile && currentTrack && <DesktopPlayer />}

        {/* Модалка альбома */}
        <AlbumModal
          album={selectedAlbum}
          isOpen={isAlbumModalOpen}
          onClose={handleCloseAlbumModal}
          onTrackClick={handleTrackClick}
          onLikeTrack={handleLikeTrack}
          currentTrack={currentTrack}
          isPlaying={isPlaying}
        />
      </PageContainer>
    );
  };

  export default ArtistPage;
