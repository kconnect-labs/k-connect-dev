import React from 'react';
import { Box, Tooltip } from '@mui/material';
import { Error, Warning, Info, CheckCircle } from '@mui/icons-material';

interface PriorityIconProps {
  priority: string;
  size?: 'small' | 'medium' | 'large';
}

const PriorityIcon: React.FC<PriorityIconProps> = ({
  priority,
  size = 'medium',
}) => {
  const getPriorityConfig = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent':
        return {
          icon: <Error />,
          color: '#F44336',
          tooltip: 'Срочный',
        };
      case 'high':
        return {
          icon: <Warning />,
          color: '#FF9800',
          tooltip: 'Высокий',
        };
      case 'medium':
        return {
          icon: <Info />,
          color: '#d0bcff',
          tooltip: 'Средний',
        };
      case 'low':
        return {
          icon: <CheckCircle />,
          color: '#4CAF50',
          tooltip: 'Низкий',
        };
      default:
        return {
          icon: <Info />,
          color: '#9E9E9E',
          tooltip: 'Неизвестный',
        };
    }
  };

  const config = getPriorityConfig(priority);
  const iconSize = size === 'small' ? 16 : size === 'large' ? 24 : 20;

  return (
    <Tooltip title={config.tooltip} arrow>
      <Box
        sx={{
          color: config.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: iconSize,
          height: iconSize,
        }}
      >
        {React.cloneElement(config.icon, {
          sx: { fontSize: iconSize },
        })}
      </Box>
    </Tooltip>
  );
};

export default PriorityIcon;
