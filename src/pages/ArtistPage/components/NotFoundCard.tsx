import React from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
} from '@mui/material';
import { MusicOff, ArrowForward } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { NotFoundCardProps } from '../types';

const StyledCard = styled(Card)(({ theme }) => ({
  background: 'var(--theme-background)',
  backdropFilter: 'var(--theme-backdrop-filter)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '24px',
  textAlign: 'center',
  marginBottom: theme.spacing(4),
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
  overflow: 'hidden',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  },
  [theme.breakpoints.down('md')]: {
    borderRadius: '20px',
    marginBottom: theme.spacing(3),
  },
}));

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(4),
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(3),
  },
}));

const IconContainer = styled(Box)(({ theme }) => ({
  width: 120,
  height: 120,
  borderRadius: '50%',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto',
  marginBottom: theme.spacing(3),
  border: '2px solid rgba(255, 255, 255, 0.1)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `conic-gradient(from 0deg, transparent, ${theme.palette.primary.main}20, transparent)`,
    animation: 'rotate 3s linear infinite',
  },
  '@keyframes rotate': {
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(360deg)' },
  },
  [theme.breakpoints.down('md')]: {
    width: 100,
    height: 100,
    marginBottom: theme.spacing(2),
  },
}));

const NotFoundIcon = styled(MusicOff)(({ theme }) => ({
  fontSize: 60,
  color: 'rgba(255, 255, 255, 0.4)',
  zIndex: 1,
  [theme.breakpoints.down('md')]: {
    fontSize: 50,
  },
}));

const Title = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  marginBottom: theme.spacing(2),
  background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  [theme.breakpoints.down('md')]: {
    fontSize: '1.75rem',
  },
}));

const Description = styled(Typography)(({ theme }) => ({
  color: 'rgba(255, 255, 255, 0.7)',
  lineHeight: 1.6,
  maxWidth: 600,
  margin: '0 auto',
  marginBottom: theme.spacing(3),
  [theme.breakpoints.down('md')]: {
    fontSize: '0.95rem',
    marginBottom: theme.spacing(2),
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: '20px',
  padding: theme.spacing(1.5, 4),
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '1.1rem',
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  color: '#000',
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
    background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.secondary.light})`,
  },
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(1.25, 3),
    fontSize: '1rem',
  },
}));

const NotFoundCard: React.FC<NotFoundCardProps> = ({
  artist,
  onNavigateToMusic,
}) => {
  return (
    <StyledCard>
      <StyledCardContent>
        <IconContainer>
          <NotFoundIcon />
        </IconContainer>

        <Title variant="h4" component="h2">
          Исполнитель не подтвержден
        </Title>

        <Description variant="body1">
          {artist ? (
            <>
              У нас нет информации о треках исполнителя «{artist.name}».
              Возможно, это связано с проблемами в написании имени или
              исполнитель еще не добавлен в нашу базу данных.
            </>
          ) : (
            <>
              Исполнитель не найден в нашей базе данных.
              Проверьте правильность написания имени или попробуйте найти
              другого исполнителя.
            </>
          )}
        </Description>

        <Description variant="body2">
          Попробуйте проверить написание имени исполнителя или вернитесь
          позже. Мы постоянно добавляем новых исполнителей в нашу коллекцию.
        </Description>

        <ActionButton
          variant="contained"
          onClick={onNavigateToMusic}
          endIcon={<ArrowForward />}
        >
          Перейти к музыке
        </ActionButton>
      </StyledCardContent>
    </StyledCard>
  );
};

export default NotFoundCard;
