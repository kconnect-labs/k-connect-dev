import React from 'react';
import {
  Box,
  Typography,
  Button,
  alpha,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  actionIcon?: React.ReactNode;
}

const EmptyStateContainer = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(6, 2),
  background: 'var(--theme-background, rgba(255, 255, 255, 0.03))',
  backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
  borderRadius: 16,
  boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
  borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
  marginBottom: theme.spacing(3),
}));

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  actionIcon = <AddIcon />,
}) => {
  const theme = useTheme();

  return (
    <EmptyStateContainer>
      <Typography
        variant='h6'
        gutterBottom
        sx={{
          fontWeight: 600,
          color: 'text.primary',
          mb: 2,
        }}
      >
        {title}
      </Typography>
      
      <Typography
        variant='body2'
        color='text.secondary'
        sx={{
          mb: actionText ? 3 : 0,
          maxWidth: 400,
          margin: '0 auto',
        }}
      >
        {description}
      </Typography>

      {actionText && onAction && (
        <Button
          variant='contained'
          color='primary'
          startIcon={actionIcon}
          onClick={onAction}
          sx={{
            borderRadius: 'var(--main-border-radius)',
            px: 2,
            py: 1,
            fontWeight: 500,
          }}
        >
          {actionText}
        </Button>
      )}
    </EmptyStateContainer>
  );
};

export default EmptyState; 