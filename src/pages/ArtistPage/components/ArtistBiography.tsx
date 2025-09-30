import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Collapse,
  useTheme,
} from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { ArtistBiographyProps } from '../types';

const BiographyContainer = styled(Box)(({ theme }) => ({
  background: 'var(--theme-background)',
  backdropFilter: 'var(--theme-backdrop-filter)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: 'var(--main-border-radius)',
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
    transform: 'translateY(-2px)',
  },
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(2.5),
    borderRadius: 'var(--small-border-radius)',
    marginBottom: theme.spacing(2),
  },
}));

const BiographyTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  marginBottom: theme.spacing(2),
  background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -8,
    left: 0,
    width: '60px',
    height: '3px',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    borderRadius: '2px',
  },
}));

const BiographyText = styled(Typography)<{ expanded?: boolean }>(({ theme, expanded }) => ({
  lineHeight: 1.7,
  color: 'rgba(255, 255, 255, 0.85)',
  whiteSpace: 'pre-line',
  fontSize: '1rem',
  position: 'relative',
  ...(!expanded && {
    maxHeight: '120px',
    overflow: 'hidden',
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '40px',
      background: 'linear-gradient(transparent, var(--theme-background, rgba(15, 15, 15, 0.98)))',
      pointerEvents: 'none',
    },
  }),
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.95rem',
  },
}));

const ExpandButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  borderRadius: 'var(--small-border-radius)',
  padding: theme.spacing(1, 2),
  fontWeight: 600,
  textTransform: 'none',
  color: theme.palette.primary.main,
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  border: `1px solid ${theme.palette.primary.main}40`,
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: `${theme.palette.primary.main}20`,
    borderColor: `${theme.palette.primary.main}80`,
    transform: 'translateY(-1px)',
  },
}));

const ArtistBiography: React.FC<ArtistBiographyProps> = ({
  bio,
  isMobile,
}) => {
  const [expanded, setExpanded] = useState(false);
  const theme = useTheme();

  
  const needsExpansion = bio.length > (isMobile ? 200 : 300);

  const handleToggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <BiographyContainer>
      <BiographyTitle variant="h5">
        Биография
      </BiographyTitle>
      
      <Collapse in={expanded || !needsExpansion} collapsedSize={120}>
        <BiographyText 
          variant="body1" 
          expanded={expanded || !needsExpansion}
        >
          {bio}
        </BiographyText>
      </Collapse>

      {needsExpansion && (
        <Box textAlign="center">
          <ExpandButton
            onClick={handleToggleExpanded}
            endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
            size="small"
          >
            {expanded ? 'Свернуть' : 'Читать полностью'}
          </ExpandButton>
        </Box>
      )}
    </BiographyContainer>
  );
};

export default ArtistBiography;
