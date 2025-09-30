import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import MCoinIcon from './MCoinIcon';
import BallsIcon from './BallsIcon';
import { Diamond as DiamondIcon } from '@mui/icons-material';

// Светло-фиолетовые цвета
const LIGHT_PURPLE_MAIN = '#d0bcff';
const LIGHT_PURPLE_ACCENT = '#bda6f7';
const LIGHT_PURPLE_BORDER = 'rgba(208, 188, 255, 0.3)';
const LIGHT_PURPLE_BG = 'rgba(208, 188, 255, 0.1)';
const LIGHT_PURPLE_CHIP_BG = 'rgba(208, 188, 255, 0.2)';
const LIGHT_PURPLE_CHIP_BORDER = 'rgba(208, 188, 255, 0.4)';

const StyledBanner = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${LIGHT_PURPLE_BG} 0%, ${LIGHT_PURPLE_ACCENT}10 100%)`,
  border: `2px solid ${LIGHT_PURPLE_BORDER}`,
  borderRadius: 'var(--small-border-radius)',
  padding: theme.spacing(3),
  margin: theme.spacing(1, 0),
  textAlign: 'center',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(45deg, transparent 30%, ${LIGHT_PURPLE_BG} 50%, transparent 70%)`,
    animation: 'shimmer 3s ease-in-out infinite',
  },
  '@keyframes shimmer': {
    '0%': { transform: 'translateX(-100%)' },
    '100%': { transform: 'translateX(100%)' },
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
    margin: theme.spacing(2, 0),
  },
}));

const IconContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(2),
}));

const Title = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  background: `linear-gradient(135deg, ${LIGHT_PURPLE_MAIN} 0%, ${LIGHT_PURPLE_ACCENT} 100%)`,
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  marginBottom: theme.spacing(1),
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.5rem',
  },
}));

const Description = styled(Typography)(({ theme }) => ({
  color: 'text.secondary',
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.9rem',
  },
}));

const FeatureChip = styled(Chip)(({ theme }) => ({
  background: LIGHT_PURPLE_CHIP_BG,
  color: LIGHT_PURPLE_MAIN,
  border: `1px solid ${LIGHT_PURPLE_CHIP_BORDER}`,
  fontWeight: 600,
  margin: theme.spacing(0.5),
  '& .MuiChip-icon': {
    color: LIGHT_PURPLE_MAIN,
  },
}));

const MCoinBanner: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <StyledBanner>
        <IconContainer>
          <MCoinIcon sx={{ fontSize: 32, color: LIGHT_PURPLE_MAIN }} />
          <BallsIcon sx={{ fontSize: 32, color: LIGHT_PURPLE_MAIN }} />
        </IconContainer>
        
        <Title variant="h4">
          Теперь доступны за Мкоины!
        </Title>
        
        <Description variant="h6">
          Покупайте паки и продавайте предметы за Мкоины
        </Description>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1 }}>
          <FeatureChip
            icon={<MCoinIcon sx={{ fontSize: 16 }} />}
            label="Покупка паков"
            variant="outlined"
          />
          <FeatureChip
            icon={<MCoinIcon sx={{ fontSize: 16 }} />}
            label="Продажа предметов"
            variant="outlined"
          />
          <FeatureChip
            icon={<MCoinIcon sx={{ fontSize: 16 }} />}
            label="Маркетплейс"
            variant="outlined"
          />
        </Box>
      </StyledBanner>
    </motion.div>
  );
};

export default MCoinBanner;
