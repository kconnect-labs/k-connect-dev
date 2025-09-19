import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Button,
  Grid,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useArtistManagement } from './hooks/useArtistManagement';
import { Artist } from '../../types/artist';

import InfoBlock from '../../UIKIT/InfoBlock/';

const ArtistManagementPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useContext(AuthContext);
  const { getMyArtists, loading, error } = useArtistManagement();
  const [artists, setArtists] = useState<Artist[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadArtists();
    }
  }, [user]);

  const loadArtists = async () => {
    try {
      const response = await getMyArtists();
      if (response.success) {
        setArtists(response.artists || []);
      }
    } catch (err) {
      console.error('Error loading artists:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh',
          p: 2,
          background: 'transparent',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2, background: 'transparent' }}>
        <Alert severity='error'>{error}</Alert>
      </Box>
    );
  }

  if (!artists.length) {
    return (
      <Box sx={{ p: 2, background: 'transparent' }}>
        <Box
          sx={{
            textAlign: 'center',
            py: 4,
            border: '1px solid rgba(66, 66, 66, 0.5)',
          }}
        >
          <Icon
            icon='solar:user-outline'
            width={64}
            height={64}
            style={{ opacity: 0.5, marginBottom: 16 }}
          />
          <Typography variant='h6' gutterBottom>
            У вас нет привязанных артистов
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Обратитесь к модератору для привязки карточки артиста к вашему
            аккаунту
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, background: 'transparent' }}>
      <InfoBlock
        title='Мои артисты'
        description='Управление привязанными карточками артистов'
        style={{ marginBottom: 16 }}
        useTheme={true}
        styleVariant='default'
        customStyle={false}
        className=''
        titleStyle={{}}
        descriptionStyle={{}}
      >
        {null}
      </InfoBlock>

      <Grid container spacing={1}>
        {artists.map(artist => (
          <Grid item xs={12} sm={6} md={4} key={artist.id}>
            <Card
              className='theme-card'
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.2s ease',
              }}
            >
              <CardContent sx={{ flexGrow: 1, p: 2 }}>
                {/* Заголовок карточки */}
                <Box
                  sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}
                >
                  <Avatar
                    src={artist.avatar_url}
                    sx={{ width: 40, height: 40 }}
                  >
                    <Icon icon='solar:user-outline' />
                  </Avatar>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography
                      variant='subtitle1'
                      sx={{
                        fontWeight: 600,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {artist.name}
                    </Typography>
                    <Box
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                    >
                      <Typography variant='caption' color='text.secondary'>
                        {formatDate(artist.created_at)}
                      </Typography>
                      {artist.verified && (
                        <Icon
                          icon='solar:verified-check-bold'
                          width={16}
                          height={16}
                          style={{ color: 'var(--main-accent-color)' }}
                        />
                      )}
                    </Box>
                  </Box>
                </Box>

                {/* Биография */}
                {artist.bio && (
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{
                      mb: 1,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      fontSize: '0.8rem',
                      lineHeight: 1.3,
                    }}
                  >
                    {artist.bio}
                  </Typography>
                )}

                {/* Статистика */}
                <Box
                  sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}
                >
                  <Chip
                    label={`${artist.tracks_count || 0} треков`}
                    size='small'
                    variant='outlined'
                    sx={{ fontSize: '0.7rem', height: 20 }}
                  />
                  {artist.verified && (
                    <Chip
                      label='Верифицирован'
                      size='small'
                      color='success'
                      variant='outlined'
                      sx={{ fontSize: '0.7rem', height: 20 }}
                    />
                  )}
                </Box>

                {/* Кнопки действий */}
                <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                  <Button
                    variant='contained'
                    size='small'
                    startIcon={<Icon icon='solar:pen-outline' />}
                    onClick={() => {
                      console.log(
                        '🎯 Переходим к редактированию артиста:',
                        artist.id
                      );
                      navigate(`/artist-management/edit/${artist.id}`);
                    }}
                    sx={{
                      flexGrow: 1,
                      fontSize: '0.75rem',
                      py: 0.5,
                    }}
                  >
                    Редактировать
                  </Button>
                  <Button
                    variant='outlined'
                    size='small'
                    startIcon={<Icon icon='solar:eye-outline' />}
                    onClick={() => {
                      console.log('🎯 Открываем карточку артиста:', artist.id);
                      window.open(`/artist/${artist.id}`, '_blank');
                    }}
                    sx={{
                      fontSize: '0.75rem',
                      py: 0.5,
                      minWidth: 'auto',
                      px: 1,
                    }}
                  >
                    Просмотр
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ArtistManagementPage;
