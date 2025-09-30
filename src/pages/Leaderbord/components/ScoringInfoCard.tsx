import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import InfoIcon from '@mui/icons-material/Info';

const StyledCard = styled(Card)(({ theme }) => ({
  background: 'var(--theme-background)',
  backdropFilter: 'var(--theme-backdrop-filter)',
  border: '1px solid rgba(66, 66, 66, 0.5)',
  borderRadius: 'var(--small-border-radius)',
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  boxShadow: 'none',
  marginTop: theme.spacing(4),
  width: '100%',
  maxWidth: 750,
  minWidth: 320,
  zIndex: 2,
}));

export const ScoringInfoCard: React.FC = () => {
  return (
    <StyledCard>
      <CardContent sx={{ position: 'relative', zIndex: 2 }}>
        <Box display='flex' alignItems='center' mb={2}>
          <InfoIcon color='primary' sx={{ mr: 1 }} />
          <Typography variant='h6'>Как начисляются очки?</Typography>
        </Box>
        <Typography variant='body2' paragraph>
          Очки начисляются за активность в социальной сети:
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 2,
          }}
        >
          <Box>
            <Typography variant='subtitle2'>
              • Создание поста: 5 очков
            </Typography>
            <Typography variant='subtitle2'>
              • Лайк на ваш пост: 1 очков
            </Typography>
            <Typography variant='subtitle2'>
              • Написание комментария: 5 очков
            </Typography>
            <Typography variant='subtitle2'>
              • Лайк на ваш комментарий: 1 очков
            </Typography>
          </Box>
          <Box>
            <Typography variant='subtitle2'>
              • Ответ на комментарий: 3 очков
            </Typography>
            <Typography variant='subtitle2'>
              • Лайк на ваш ответ: 1 очков
            </Typography>
            <Typography variant='subtitle2'>• Репост: 4 очков</Typography>
          </Box>
        </Box>
        <Typography variant='body2' sx={{ mt: 2 }}>
          Очки обновляются раз в час. Если вы удалите пост или комментарий,
          или кто-то уберет лайк, соответствующие очки будут вычтены из вашего
          счета.
        </Typography>

        <Box
          sx={{
            mt: 3,
            p: 2,
            bgcolor: 'rgba(208, 188, 255, 0.05)',
            borderRadius: 'var(--main-border-radius)',
            border: '1px solid rgba(208, 188, 255, 0.1)',
          }}
        >
          <Typography
            variant='subtitle2'
            color='primary.light'
            fontWeight='medium'
            gutterBottom
          >
            Периоды расчета очков:
          </Typography>
          <Typography variant='body2'>
            • <strong>Неделя:</strong> с понедельника 00:00 до воскресенья
            19:00
          </Typography>
          <Typography variant='body2'>
            • <strong>Месяц:</strong> с 1-го числа 00:00 до последнего дня
            месяца 23:59
          </Typography>
          <Typography variant='body2'>
            • <strong>Всё время:</strong> полная история активности
          </Typography>
        </Box>
      </CardContent>
    </StyledCard>
  );
};
