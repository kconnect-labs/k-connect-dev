import React, { memo } from 'react';
import { Box, Typography, styled, useTheme, Chip } from '@mui/material';
import { useLanguage } from '../../../context/LanguageContext';
import { IoStar } from 'react-icons/io5';

// Enhanced footer container with better styling
const FooterContainer = styled(Box)(({ theme, themecolor }) => ({
  padding: theme.spacing(1.5, 1, 1),
  textAlign: 'center',
  position: 'relative',
  [theme.breakpoints.down('lg')]: {
    padding: theme.spacing(1, 0.8, 0.8),
  }
}));

// Enhanced typography with better styling
const FooterTypography = styled(Typography)(({ theme }) => ({
  color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
  fontSize: '0.7rem',
  fontWeight: 400,
  letterSpacing: '0.2px',
  transition: 'color 0.2s ease-in-out',
  '&:hover': {
    color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
  }
}));

// Version chip with enhanced styling
const VersionChip = styled(Chip)(({ theme, themecolor }) => ({
  background: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
  border: theme.palette.mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
  color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
  fontWeight: 500,
  fontSize: '0.65rem',
  height: '20px',
  '& .MuiChip-label': {
    padding: theme.spacing(0, 0.8),
  },
  '&:hover': {
    background: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
  },
  transition: 'all 0.2s ease-in-out',
}));

// Enhanced title typography
const FooterTitle = styled(Typography)(({ theme, themecolor }) => ({
  fontWeight: 500,
  color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
  marginBottom: theme.spacing(0.8),
  letterSpacing: '0.3px',
  fontSize: '0.75rem',
}));

// Contact info container
const ContactInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.2),
  marginTop: theme.spacing(0.8),
  padding: theme.spacing(0.5, 0),
}));

const areEqual = (prevProps, nextProps) => {
  return prevProps.primaryColor === nextProps.primaryColor;
};

const SidebarFooter = ({ primaryColor }) => {
  const theme = useTheme();
  const { t } = useLanguage();
  
  return (
    <FooterContainer themecolor={primaryColor}>
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <FooterTitle variant="subtitle2" themecolor={primaryColor}>
          {t('sidebar.footer.version')}
        </FooterTitle>
        
        <VersionChip 
          label="v2.9" 
          size="small" 
          themecolor={primaryColor}
          icon={<IoStar size={16} />}
        />
        
        <ContactInfo>
          <FooterTypography variant="caption" display="block">
            {t('sidebar.footer.copyright')}
          </FooterTypography>
          <FooterTypography variant="caption" display="block">
            {t('sidebar.footer.email')}
          </FooterTypography>
        </ContactInfo>
      </Box>
    </FooterContainer>
  );
};

export default memo(SidebarFooter, areEqual); 