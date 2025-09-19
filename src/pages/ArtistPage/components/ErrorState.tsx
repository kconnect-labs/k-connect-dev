import React from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
} from '@mui/material';
import { Error as ErrorIcon, Refresh, ArrowBack } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { ErrorStateProps } from '../types';

const StyledCard = styled(Card)(({ theme }) => ({
  background: 'var(--theme-background)',
  backdropFilter: 'var(--theme-backdrop-filter)',
  border: '1px solid rgba(255, 87, 87, 0.2)',
  borderRadius: '24px',
  textAlign: 'center',
  marginBottom: theme.spacing(4),
  boxShadow: '0 8px 32px rgba(255, 87, 87, 0.1)',
  overflow: 'hidden',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #ff5757, #ff8a80)',
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
  backgroundColor: 'rgba(255, 87, 87, 0.1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto',
  marginBottom: theme.spacing(3),
  border: '2px solid rgba(255, 87, 87, 0.2)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'conic-gradient(from 0deg, transparent, rgba(255, 87, 87, 0.2), transparent)',
    animation: 'rotate 4s linear infinite',
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

const StyledErrorIcon = styled(ErrorIcon)(({ theme }) => ({
  fontSize: 60,
  color: '#ff5757',
  zIndex: 1,
  [theme.breakpoints.down('md')]: {
    fontSize: 50,
  },
}));

const ErrorTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  marginBottom: theme.spacing(2),
  color: '#ff5757',
  [theme.breakpoints.down('md')]: {
    fontSize: '1.75rem',
  },
}));

const ErrorDescription = styled(Typography)(({ theme }) => ({
  color: 'rgba(255, 255, 255, 0.7)',
  lineHeight: 1.6,
  maxWidth: 500,
  margin: '0 auto',
  marginBottom: theme.spacing(3),
  [theme.breakpoints.down('md')]: {
    fontSize: '0.95rem',
    marginBottom: theme.spacing(2),
  },
}));

const ActionButtons = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  justifyContent: 'center',
  flexWrap: 'wrap',
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'center',
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: '20px',
  padding: theme.spacing(1.5, 3),
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '1rem',
  minWidth: 140,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
  },
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(1.25, 2.5),
    fontSize: '0.95rem',
    minWidth: 120,
  },
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    maxWidth: 200,
  },
}));

const PrimaryButton = styled(ActionButton)(({ theme }) => ({
  background: 'linear-gradient(135deg, #ff5757, #ff8a80)',
  color: '#fff',
  boxShadow: '0 4px 16px rgba(255, 87, 87, 0.3)',
  '&:hover': {
    background: 'linear-gradient(135deg, #ff4444, #ff7070)',
  },
}));

const SecondaryButton = styled(ActionButton)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  color: '#fff',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
}));

const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  onBackClick,
}) => {
  const handleRefresh = () => {
    window.location.reload();
  };

  const getErrorMessage = (errorText: string): string => {
    if (errorText.includes('404') || errorText.includes('не найден')) {
      return 'Исполнитель не найден в нашей базе данных. Проверьте правильность написания имени.';
    }
    if (errorText.includes('сеть') || errorText.includes('connection')) {
      return 'Проблемы с подключением к серверу. Проверьте интернет-соединение и попробуйте снова.';
    }
    if (errorText.includes('timeout')) {
      return 'Превышено время ожидания ответа сервера. Попробуйте обновить страницу.';
    }
    return 'Произошла непредвиденная ошибка при загрузке данных исполнителя.';
  };

  const getErrorTitle = (errorText: string): string => {
    if (errorText.includes('404') || errorText.includes('не найден')) {
      return 'Исполнитель не найден';
    }
    if (errorText.includes('сеть') || errorText.includes('connection')) {
      return 'Ошибка подключения';
    }
    if (errorText.includes('timeout')) {
      return 'Время ожидания истекло';
    }
    return 'Ошибка загрузки';
  };

  return (
    <StyledCard>
      <StyledCardContent>
        <IconContainer>
          <StyledErrorIcon />
        </IconContainer>

        <ErrorTitle variant="h4" component="h2">
          {getErrorTitle(error)}
        </ErrorTitle>

        <ErrorDescription variant="body1">
          {getErrorMessage(error)}
        </ErrorDescription>

        <ErrorDescription variant="body2" sx={{ fontSize: '0.9rem', opacity: 0.8 }}>
          Если проблема повторяется, попробуйте обновить страницу или
          вернуться к предыдущей странице.
        </ErrorDescription>

        <ActionButtons>
          <PrimaryButton
            variant="contained"
            onClick={handleRefresh}
            startIcon={<Refresh />}
          >
            Обновить
          </PrimaryButton>
          <SecondaryButton
            variant="outlined"
            onClick={onBackClick}
            startIcon={<ArrowBack />}
          >
            Назад
          </SecondaryButton>
        </ActionButtons>
      </StyledCardContent>
    </StyledCard>
  );
};

export default ErrorState;
