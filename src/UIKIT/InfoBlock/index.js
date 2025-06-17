import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import { getGradientEffects, gradientBorder } from '../styles/gradientEffects';

const InfoBlockContainer = styled(Box)(({ theme, styleVariant = 'default' }) => ({
  width: '100%',
  margin: '0 auto',
  marginBottom: theme.spacing(1),
  ...gradientBorder(theme, styleVariant),
  color: styleVariant === 'dark' ? 'white' : theme.palette.text.primary,
  textAlign: 'left',
  padding: 14,
  ...getGradientEffects(theme, styleVariant),
}));

const InfoBlockTitle = styled(Typography)(({ theme, styleVariant = 'default' }) => ({
  fontWeight: 700,
  margin: 0,
  color: styleVariant === 'dark' ? 'white' : theme.palette.text.primary,
  '&.MuiTypography-root': {
    margin: 0,
    marginBottom: 0
  },
  ...theme.components?.InfoBlock?.styleOverrides?.title,
}));

const InfoBlockDescription = styled(Typography)(({ theme, styleVariant = 'default' }) => ({
  color: styleVariant === 'dark' ? 'rgba(255,255,255,0.7)' : theme.palette.text.secondary,
  ...theme.components?.InfoBlock?.styleOverrides?.description,
}));

/**
 * InfoBlock component for displaying information with gradient effects
 * @param {Object} props
 * @param {string} props.title - Title of the info block
 * @param {string} props.description - Description text
 * @param {React.ReactNode} props.children - Optional children content
 * @param {string} props.styleVariant - 'default' | 'dark' - Visual variant of the block
 * @param {Object} props.sx - Additional styles for the container
 * @param {Object} props.titleSx - Additional styles for the title
 * @param {Object} props.descriptionSx - Additional styles for the description
 */
const InfoBlock = ({
  title,
  description,
  children,
  styleVariant = 'default',
  sx,
  titleSx,
  descriptionSx,
  ...props
}) => {
  const theme = useTheme();

  return (
    <InfoBlockContainer styleVariant={styleVariant} sx={sx} {...props}>
      {title && (
        <InfoBlockTitle 
          variant="h5" 
          styleVariant={styleVariant}
          sx={titleSx}
        >
          {title}
        </InfoBlockTitle>
      )}
      {description && (
        <InfoBlockDescription 
          variant="body2" 
          styleVariant={styleVariant}
          sx={descriptionSx}
        >
          {description}
        </InfoBlockDescription>
      )}
      {children}
    </InfoBlockContainer>
  );
};

export default InfoBlock;
