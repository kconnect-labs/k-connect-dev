import * as React from 'react';
import {
  Box,
  Typography,
  Avatar,
  Divider,
  Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import UserRecommendation from './UserRecommendation';
import { User } from '../types';

interface RecommendationsPanelProps {
  recommendations: User[];
  loadingRecommendations: boolean;
}

const RecommendationsPanel: React.FC<RecommendationsPanelProps> = ({
  recommendations,
  loadingRecommendations,
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  if (loadingRecommendations) {
    return (
      <Box
        component={Paper}
        sx={{
          p: 0,
          borderRadius: '18px',
          mb: -0.625,
          background: 'var(--theme-background, rgba(255, 255, 255, 0.03))',
          backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          overflow: 'hidden',
          display: { xs: 'none', sm: 'block' },
        }}
      >
        <Box
          sx={{ display: 'flex', justifyContent: 'center', py: 3, px: 2 }}
        >
          <Box
            sx={{
              width: '100%',
              height: 170,
              '@keyframes pulse': {
                '0%': { opacity: 1 },
                '50%': { opacity: 0.5 },
                '100%': { opacity: 1 },
              },
            }}
          >
            <Box
              sx={{
                width: '100%',
                height: 50,
                borderRadius: '16px',
                backgroundColor: '#292929',
                mb: 1,
                animation: 'pulse 2s infinite',
              }}
            />
            <Box
              sx={{
                width: '100%',
                height: 50,
                borderRadius: '16px',
                backgroundColor: '#292929',
                mb: 1,
                animation: 'pulse 2s infinite',
              }}
            />
            <Box
              sx={{
                width: '100%',
                height: 50,
                borderRadius: '16px',
                backgroundColor: '#292929',
                animation: 'pulse 2s infinite',
              }}
            />
          </Box>
        </Box>
      </Box>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Box
        component={Paper}
        sx={{
          p: 0,
          borderRadius: '18px',
          mb: -0.625,
          background: 'var(--theme-background, rgba(255, 255, 255, 0.03))',
          backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          overflow: 'hidden',
          display: { xs: 'none', sm: 'block' },
        }}
      >
        <Box
          sx={{
            textAlign: 'center',
            py: 3,
            px: 2,
            background:
              'linear-gradient(180deg, var(--theme-background, rgba(255, 255, 255, 0.01)), var(--theme-background, rgba(255, 255, 255, 0.03)))',
          }}
        >
          <Avatar
            sx={{
              width: 50,
              height: 50,
              mx: 'auto',
              mb: 2,
              bgcolor: 'rgba(208, 188, 255, 0.1)',
              border: '1px solid rgba(208, 188, 255, 0.25)',
            }}
          >
            <PersonAddIcon sx={{ color: '#D0BCFF', fontSize: 26 }} />
          </Avatar>
          <Typography
            variant='body2'
            sx={{
              fontWeight: 500,
              color: theme => theme.palette.text.secondary,
            }}
          >
            {t('main_page.recommendations.empty.title')}
          </Typography>
          <Typography
            variant='caption'
            sx={{
              display: 'block',
              mt: 1,
              maxWidth: '80%',
              mx: 'auto',
              color: theme => theme.palette.text.disabled,
            }}
          >
            {t('main_page.recommendations.empty.description')}
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      component={Paper}
      sx={{
        p: 0,
        borderRadius: '18px',
        mb: -0.625,
        background: 'var(--theme-background, rgba(255, 255, 255, 0.03))',
        backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        overflow: 'hidden',
        display: { xs: 'none', sm: 'block' },
      }}
    >
      <Box>
        {recommendations.map((channel, index) => (
          <Box key={channel.id}>
            <UserRecommendation user={channel} />
            {index < recommendations.length - 1 && (
              <Divider sx={{ opacity: 0.1, mx: 2 }} />
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default RecommendationsPanel;
