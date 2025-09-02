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

// Хуки
import { useArtistData } from './hooks/useArtistData';
import { useArtistActions } from './hooks/useArtistActions';

// Компоненты
import ArtistHeader from './components/ArtistHeader';
import ArtistBiography from './components/ArtistBiography';
import TrackSection from './components/TrackSection';
import TrackList from './components/TrackList';
import NotFoundCard from './components/NotFoundCard';
import LoadingState, { DetailedLoadingState } from './components/LoadingState';
import ErrorState from './components/ErrorState';

// Типы
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

  // Хуки для данных и действий
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

  // Обработчики для полноэкранного плеера
  const handleOpenFullScreenPlayer = React.useCallback(() => {
    openFullScreenPlayer();
  }, [openFullScreenPlayer]);

  const handleCloseFullScreenPlayer = React.useCallback(() => {
    closeFullScreenPlayer();
    document.body.style.overflow = '';
    document.body.style.touchAction = '';
  }, [closeFullScreenPlayer]);

  // Обработчик для первого трека
  const handlePlayFirstTrack = React.useCallback(() => {
    if (tracks && tracks.length > 0) {
      handleTrackClick(tracks[0]);
    }
  }, [tracks, handleTrackClick]);

  // Обработчик поделиться
  const handleShareClick = React.useCallback(() => {
    if (artist) {
      shareArtist(artist);
    }
  }, [artist, shareArtist]);

  // Обработчик перехода к музыке
  const handleNavigateToMusic = React.useCallback(() => {
    window.location.href = '/music';
  }, []);

  // Состояние загрузки
  if (isLoading && !artist) {
    return (
      <PageContainer>
        <ContentContainer>
          {isMobile ? <LoadingState /> : <DetailedLoadingState />}
        </ContentContainer>
      </PageContainer>
    );
  }

  // Состояние ошибки
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

  // Проверка на отсутствие треков у неподтвержденного исполнителя
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

              {/* Новые треки */}
              {newestTracks && newestTracks.length > 0 && (
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
              )}

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
      <MobilePlayer />

      {/* Десктопный плеер */}
      {!isMobile && currentTrack && <DesktopPlayer />}
    </PageContainer>
  );
};

export default ArtistPage;
