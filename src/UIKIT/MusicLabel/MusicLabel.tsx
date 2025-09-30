import React from 'react';
import { Box, Tooltip, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';


const MusicianIcon = `<svg width="48" height="56" viewBox="0 0 48 56" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M29.7723 0.0689854C26.3632 -0.333326 23.1308 1.71021 21.9655 5.00456C21.7029 5.74699 21.6112 6.54948 21.5688 7.3906C21.5369 8.02515 21.5296 8.78152 21.5289 9.67231L21.5294 10.9214C21.5294 10.9346 21.5294 10.9478 21.5294 10.9609L21.5521 33.1059C19.2644 30.9188 16.1884 29.5812 12.8067 29.5847C5.75053 29.5919 0.0363138 35.4359 0.0437043 42.6379C0.0510948 49.8399 5.77729 55.6722 12.8335 55.665C19.8899 55.6577 25.6039 49.8137 25.5965 42.6117L25.5718 18.4822C25.8538 18.6353 26.1593 18.7906 26.4941 18.9608L33.7804 22.6697C34.9062 23.2426 35.8222 23.7089 36.5727 24.042C37.3295 24.3778 38.0743 24.6515 38.8426 24.7421C42.2515 25.1444 45.4838 23.1008 46.6491 19.8066C46.912 19.0641 47.0034 18.2616 47.0461 17.4205C47.088 16.5864 47.087 15.5417 47.0856 14.2579L47.0857 14.0305C47.085 13.0758 47.0845 12.329 46.9511 11.6214C46.6077 9.7999 45.6191 8.17125 44.1744 7.04612C43.6128 6.60901 42.9581 6.27602 42.1208 5.85032L34.8345 2.14146C33.7087 1.56844 32.7927 1.10213 32.0421 0.769122C31.2854 0.433326 30.5406 0.159643 29.7723 0.0689854Z" fill="white"/>
</svg>
`;

const RepresentativeIcon = `<svg width="46" height="50" viewBox="0 0 46 50" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M18.2273 24.9073L41.409 16.5772V30.4268C40.0315 29.6345 38.3935 29.175 36.6363 29.175C31.741 29.175 27.7727 32.74 27.7727 37.1375C27.7727 41.535 31.741 45.1 36.6363 45.1C41.5315 45.1 45.5 41.535 45.5 37.1375V13.7309C45.5 10.931 45.5 8.58275 45.2808 6.7118C45.2498 6.44738 45.213 6.1845 45.1725 5.93922C44.9612 4.66102 44.588 3.46863 43.8675 2.47293C43.507 1.97505 43.06 1.52637 42.503 1.1407C42.3985 1.0684 42.29 0.9983 42.1778 0.9305L42.1552 0.916975C40.2265 -0.236175 38.0583 -0.1537 35.8245 0.357625C33.6643 0.85215 30.986 1.8592 27.702 3.09407L21.9908 5.2414C20.4515 5.82015 19.1473 6.31048 18.1235 6.81835C17.0344 7.3587 16.0962 7.996 15.3927 8.9457C14.6891 9.89542 14.3969 10.9189 14.2625 12.0301C14.1362 13.0744 14.1363 14.3445 14.1364 15.8436V35.3267C12.7587 34.5345 11.1209 34.075 9.36363 34.075C4.46838 34.075 0.5 37.64 0.5 42.0375C0.5 46.435 4.46838 50 9.36363 50C14.2589 50 18.2273 46.435 18.2273 42.0375V24.9073Z" fill="white"/>
</svg>
`;

interface MusicLabelProps {
  type: 'musician' | 'representative';
  profileColor?: string;
  size?: 'small' | 'medium' | 'large';
  showTooltip?: boolean;
}

const StyledMusicLabel = styled(Box)<{ 
  type: 'musician' | 'representative'; 
  size: 'small' | 'medium' | 'large';
  profileColor?: string;
}>(({ theme, type, size, profileColor }) => {
  const sizeMap = {
    small: { width: 20, height: 20, fontSize: '10px' },
    medium: { width: 24, height: 24, fontSize: '12px' },
    large: { width: 28, height: 28, fontSize: '14px' }
  };

  const currentSize = sizeMap[size];

  return {
    width: currentSize.width,
    height: currentSize.height,
    borderRadius: 'var(--avatar-border-radius)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    border: profileColor 
      ? `2px solid ${profileColor}` 
      : `2px solid ${theme.palette.primary.main}`,
    background: profileColor 
      ? `${profileColor}20` 
      : `${theme.palette.primary.main}20`,
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    boxShadow: profileColor
      ? `0 0 8px ${profileColor}40`
      : `0 0 8px ${theme.palette.primary.main}40`,
    transition: 'all 0.3s ease',
    
    '&:hover': {
      transform: 'scale(1.1)',
      boxShadow: profileColor
        ? `0 0 12px ${profileColor}60`
        : `0 0 12px ${theme.palette.primary.main}60`,
    },

    '& svg': {
      width: currentSize.width * 0.6,
      height: currentSize.height * 0.6,
      filter: profileColor 
        ? `drop-shadow(0 0 2px ${profileColor})`
        : `drop-shadow(0 0 2px ${theme.palette.primary.main})`,
    },

    
    animation: 'musicLabelPulse 2s infinite',
    '@keyframes musicLabelPulse': {
      '0%': {
        boxShadow: profileColor
          ? `0 0 0 0 ${profileColor}40`
          : `0 0 0 0 ${theme.palette.primary.main}40`,
      },
      '70%': {
        boxShadow: profileColor
          ? `0 0 0 4px ${profileColor}00`
          : `0 0 0 4px ${theme.palette.primary.main}00`,
      },
      '100%': {
        boxShadow: profileColor
          ? `0 0 0 0 ${profileColor}00`
          : `0 0 0 0 ${theme.palette.primary.main}00`,
      },
    },
  };
});

const MusicLabel: React.FC<MusicLabelProps> = ({
  type,
  profileColor,
  size = 'medium',
  showTooltip = true
}) => {
  
  const icon = type === 'musician' ? MusicianIcon : RepresentativeIcon;
  const tooltipText = type === 'musician' 
    ? 'Музыкант' 
    : 'Представитель';

  const label = (
    <StyledMusicLabel 
      type={type} 
      size={size} 
      profileColor={profileColor}
    >
      <div
        dangerouslySetInnerHTML={{ __html: icon }}
        style={{ 
          width: '100%', 
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      />
    </StyledMusicLabel>
  );

  
  const isLightColor = (color: string) => {
    if (!color) return false;
    
    
    const hex = color.replace('#', '');
    
    
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    
    return brightness > 128;
  };

  if (showTooltip) {
    const backgroundColor = profileColor || 'primary.main';
    const textColor = isLightColor(profileColor || '') ? 'black' : 'white';
    
    return (
      <Tooltip 
        title={tooltipText} 
        arrow 
        placement="top"
        componentsProps={{
          tooltip: {
            sx: {
              bgcolor: backgroundColor,
              color: textColor,
              fontSize: '12px',
              fontWeight: 500,
              '& .MuiTooltip-arrow': {
                color: backgroundColor,
              },
            },
          },
        }}
      >
        {label}
      </Tooltip>
    );
  }

  return label;
};

export default MusicLabel;
