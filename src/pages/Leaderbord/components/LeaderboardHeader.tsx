import React from 'react';
import { Box, Typography, Paper, Tabs, Tab } from '@mui/material';
import { styled } from '@mui/material/styles';
import { TimePeriod } from '../types/leaderboard';

const StyledPaper = styled(Paper)(({ theme }) => ({
  background: 'var(--theme-background)',
  backdropFilter: 'var(--theme-backdrop-filter)',
  border: '1px solid rgba(66, 66, 66, 0.5)',
  borderRadius: '16px',
  boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)',
  overflow: 'hidden',
  marginBottom: theme.spacing(1),
  width: '100%',
  maxWidth: 1200,
  minWidth: 320,
  position: 'relative',
  zIndex: 2,
}));

const LeaderboardHeaderContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  textAlign: 'left',
  maxWidth: '100%',
  [theme.breakpoints.down('sm')]: {
    alignItems: 'center',
    textAlign: 'center',
  },
}));

interface LeaderboardHeaderProps {
  timePeriod: TimePeriod;
  onTimePeriodChange: (
    event: React.SyntheticEvent,
    newValue: TimePeriod
  ) => void;
}

export const LeaderboardHeader: React.FC<LeaderboardHeaderProps> = ({
  timePeriod,
  onTimePeriodChange,
}) => {
  return (
    <LeaderboardHeaderContainer>
      <Box
        className='theme-aware'
        sx={{
          width: '100%',
          maxWidth: 1200,
          minWidth: 320,
          mx: 'auto',
          mb: 1,
          p: { xs: 2, md: 3 },
          borderRadius: '16px',
          border: '1px solid rgba(66, 66, 66, 0.5)',
          color: 'white',
          textAlign: 'left',
          position: 'relative',
          overflow: 'hidden',
          zIndex: 2,
        }}
      >
        <Typography
          variant='h5'
          sx={{ fontWeight: 700, mb: 1, color: 'white' }}
        >
          Рейтинг ТОП лидеров
        </Typography>
        <Typography variant='body2' sx={{ color: 'rgba(255,255,255,0.7)' }}>
          20 пользователей, получивших наибольшее количество очков сообщества
          K-Коннект за совокупность активности: созданных постов, полученных
          лайков, комментариев, ответов, репостов, просмотров и реакций на
          истории.
        </Typography>
      </Box>

      <StyledPaper>
        <Tabs
          value={timePeriod}
          onChange={onTimePeriodChange}
          variant='fullWidth'
          sx={{
            '& .MuiTab-root': {
              color: 'rgba(255, 255, 255, 0.7)',
              backgroundColor: 'transparent',
              fontWeight: 'bold',
              fontSize: '1rem',
              textTransform: 'none',
              borderRadius: 0,
              minHeight: 48,
              transition: 'color 0.2s',
              '&.Mui-selected': {
                color: '#D0BCFF',
                backgroundColor: 'transparent',
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#D0BCFF',
              height: 3,
              borderRadius: '3px',
              transition: 'all 0.2s',
            },
            minHeight: 48,
          }}
        >
          <Tab label='Неделя' value='week' />
          <Tab label='Месяц' value='month' />
          <Tab label='Всё время' value='all_time' />
        </Tabs>
      </StyledPaper>
    </LeaderboardHeaderContainer>
  );
};
