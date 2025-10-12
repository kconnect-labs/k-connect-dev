import React from 'react';
import { Box, Container, Grid, Paper, Skeleton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PostSkeleton from '../../../../components/Post/PostSkeleton';

const ProfileSkeleton = () => {
  const theme = useTheme();

  const skeletonBgColor =
    theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.1)'
      : 'rgba(0, 0, 0, 0.1)';

  return (
    <Container
      maxWidth='lg'
      sx={{
        pt: 0,
        pb: 4,
        px: 0,
        width: '100%',
        marginRight: 'auto',
        marginLeft: '0!important',
        paddingTop: '15px',
        paddingBottom: '40px',
        paddingLeft: '0',
        paddingRight: '0',
        minHeight: 'calc(100vh - 64px)',
        '@media (min-width: 0px)': {
          paddingLeft: '0 !important',
          paddingRight: '0 !important',
        },
        '@media (min-width: 600px)': {
          paddingLeft: '0 !important',
          paddingRight: '0 !important',
        },
        '@media (min-width: 700px)': {
          paddingLeft: '0 !important',
          paddingRight: '0 !important',
        },
        '@media (min-width: 900px)': {
          paddingLeft: '0 !important',
          paddingRight: '0 !important',
        },
      }}
    >
      <Grid
        container
        spacing={0.5}
        sx={{ flexDirection: { xs: 'column', lg: 'row' }, flexWrap: { xs: 'nowrap', lg: 'nowrap' } }}
      >
        {/* Левая колонка (информация профиля) */}
        <Grid item xs={12} lg={5}>
          <Paper
            sx={{ borderRadius: 'var(--small-border-radius)', overflow: 'hidden', mb: '5px', background: 'var(--theme-background, rgba(255,255,255,0.03))', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
          >
            {/* Баннер */}
            <Skeleton
              variant='rectangular'
              sx={{ width: '100%', height: { xs: 90, sm: 90 }, bgcolor: 'transparent' }}
            />

            <Box sx={{ px: 3, pb: 3, pt: 0, mt: -7 }}>
              {/* Аватар */}
              <Skeleton variant='circular' width={130} height={130} sx={{ mt: -8, bgcolor: skeletonBgColor }} animation='wave' />

              {/* Имя */}
              <Skeleton variant='text' width='60%' height={32} sx={{ mt: 2, bgcolor: skeletonBgColor }} animation='wave' />
              {/* Username */}
              <Skeleton variant='text' width='40%' height={24} sx={{ bgcolor: skeletonBgColor }} animation='wave' />

              {/* Статистика */}
              <Grid container spacing={1} sx={{ mt: 1 }}>
                {Array.from({ length: 3 }).map((_, idx) => (
                  <Grid item xs={4} key={idx}>
                    <Skeleton
                      variant='rectangular'
                      width='100%'
                      height={60}
                      animation='wave'
                      sx={{ bgcolor: skeletonBgColor, borderRadius: 'var(--small-border-radius)' }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Paper>
        </Grid>

        {/* Правая колонка (лента постов) */}
        <Grid item xs={12} lg={7}>
          {/* Таббар */}
          <Paper sx={{ borderRadius: 'var(--main-border-radius)', mb: '5px', overflow: 'hidden', boxShadow: 'none', background: 'var(--theme-background, rgba(255,255,255,0.03))', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
            <Box sx={{ display: 'flex' }}>
              {Array.from({ length: 4 }).map((_, idx) => (
                <Skeleton key={idx} variant='rectangular' width='25%' height={48} animation='wave' sx={{ bgcolor: skeletonBgColor }} />
              ))}
            </Box>
          </Paper>

          {/* Скелетоны постов */}
          {Array.from({ length: 3 }).map((_, idx) => (
            <PostSkeleton key={idx}  />
          ))}
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProfileSkeleton; 