import React from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Skeleton,
  Grid,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { LoadingStateProps } from '../types';

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '60vh',
  padding: theme.spacing(4),
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(3),
    minHeight: '50vh',
  },
}));

const SkeletonContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: 1200,
  margin: '0 auto',
  padding: theme.spacing(2),
}));

const HeaderSkeleton = styled(Box)(({ theme }) => ({
  background: 'var(--theme-background)',
  backdropFilter: 'var(--theme-backdrop-filter)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '24px',
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  display: 'flex',
  gap: theme.spacing(3),
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: theme.spacing(3),
    borderRadius: '20px',
    marginBottom: theme.spacing(3),
  },
}));

const ContentSkeleton = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(4),
  [theme.breakpoints.down('md')]: {
    gap: theme.spacing(3),
  },
}));

const SectionSkeleton = styled(Box)(({ theme }) => ({
  background: 'var(--theme-background)',
  backdropFilter: 'var(--theme-backdrop-filter)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '20px',
  padding: theme.spacing(3),
  [theme.breakpoints.down('md')]: {
    borderRadius: '16px',
    padding: theme.spacing(2.5),
  },
}));

const LoadingSpinner = styled(CircularProgress)(({ theme }) => ({
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(2),
}));

const LoadingText = styled(Typography)(({ theme }) => ({
  color: 'rgba(255, 255, 255, 0.7)',
  textAlign: 'center',
  fontSize: '1.1rem',
  [theme.breakpoints.down('md')]: {
    fontSize: '1rem',
  },
}));

// Простое состояние загрузки с спиннером
export const SimpleLoadingState: React.FC<LoadingStateProps> = () => {
  return (
    <LoadingContainer>
      <LoadingSpinner size={48} thickness={4} />
      <LoadingText>
        Загрузка данных исполнителя...
      </LoadingText>
    </LoadingContainer>
  );
};

// Детализированное состояние загрузки со скелетонами
export const DetailedLoadingState: React.FC<LoadingStateProps> = () => {
  return (
    <SkeletonContainer>
      {/* Скелетон шапки исполнителя */}
      <HeaderSkeleton>
        <Skeleton
          variant="rectangular"
          width={160}
          height={160}
          sx={{
            borderRadius: 2,
            flexShrink: 0,
            '@media (max-width: 960px)': {
              width: 120,
              height: 120,
            },
            '@media (max-width: 600px)': {
              width: 100,
              height: 100,
            },
          }}
        />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Skeleton variant="text" width="60%" height={60} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="40%" height={32} sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" width={100} height={24} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" width={90} height={24} sx={{ borderRadius: 1 }} />
          </Box>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} variant="circular" width={40} height={40} />
            ))}
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 3 }} />
            <Skeleton variant="rectangular" width={100} height={40} sx={{ borderRadius: 3 }} />
          </Box>
        </Box>
      </HeaderSkeleton>

      <ContentSkeleton>
        {/* Скелетон биографии */}
        <SectionSkeleton>
          <Skeleton variant="text" width="30%" height={40} sx={{ mb: 2 }} />
          <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="80%" height={20} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="60%" height={20} />
        </SectionSkeleton>

        {/* Скелетон популярных треков */}
        <SectionSkeleton>
          <Skeleton variant="text" width="40%" height={40} sx={{ mb: 3 }} />
          <Grid container spacing={3}>
            {[...Array(5)].map((_, i) => (
              <Grid item xs={6} sm={4} md={3} lg={2.4} key={i}>
                <Box>
                  <Skeleton
                    variant="rectangular"
                    width="100%"
                    sx={{ aspectRatio: '1/1', borderRadius: 2, mb: 1 }}
                  />
                  <Skeleton variant="text" width="100%" height={24} />
                  <Skeleton variant="text" width="70%" height={20} />
                </Box>
              </Grid>
            ))}
          </Grid>
        </SectionSkeleton>

        {/* Скелетон новых треков */}
        <SectionSkeleton>
          <Skeleton variant="text" width="35%" height={40} sx={{ mb: 3 }} />
          <Grid container spacing={3}>
            {[...Array(5)].map((_, i) => (
              <Grid item xs={6} sm={4} md={3} lg={2.4} key={i}>
                <Box>
                  <Skeleton
                    variant="rectangular"
                    width="100%"
                    sx={{ aspectRatio: '1/1', borderRadius: 2, mb: 1 }}
                  />
                  <Skeleton variant="text" width="100%" height={24} />
                  <Skeleton variant="text" width="70%" height={20} />
                </Box>
              </Grid>
            ))}
          </Grid>
        </SectionSkeleton>

        {/* Скелетон списка всех треков */}
        <SectionSkeleton>
          <Skeleton variant="text" width="25%" height={40} sx={{ mb: 3 }} />
          {[...Array(8)].map((_, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Skeleton variant="rectangular" width={56} height={56} sx={{ borderRadius: 1, mr: 2 }} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="60%" height={24} sx={{ mb: 0.5 }} />
                <Skeleton variant="text" width="80%" height={20} />
              </Box>
              <Skeleton variant="circular" width={40} height={40} />
            </Box>
          ))}
        </SectionSkeleton>
      </ContentSkeleton>
    </SkeletonContainer>
  );
};

// Экспорт по умолчанию - простое состояние загрузки
const LoadingState: React.FC<LoadingStateProps> = SimpleLoadingState;

export default LoadingState;
