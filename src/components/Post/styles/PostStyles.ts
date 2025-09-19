import { styled } from '@mui/material/styles';
import { Card, Box, Typography } from '@mui/material';

// CSS анимация для скелетона
export const skeletonKeyframes = `
  @keyframes pulse {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.4;
    }
    100% {
      opacity: 1;
    }
  }
`;

export const PostCard = styled(Card, {
  shouldForwardProp: (prop: string) =>
    !['isPinned', 'statusColor'].includes(prop),
})(({ theme, isPinned, statusColor }: any) => ({
  marginBottom: theme.spacing(2),
  borderRadius: theme.spacing(1),
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  transition: 'box-shadow 0.3s ease-in-out',
  background: 'var(--theme-background, rgba(255, 255, 255, 0.03))',
  backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
  WebkitBackdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
  border: isPinned
    ? `1px solid ${statusColor ? `${statusColor}33` : 'rgba(140, 82, 255, 0.2)'}`
    : '1px solid rgba(66, 66, 66, 0.5)',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
  },
}));

export const FactCard = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  padding: theme.spacing(2),
  borderRadius: '18px',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(66, 66, 66, 0.5)',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '4px',
    height: '100%',
    backgroundColor: '#FFA726',
    borderRadius: '2px 0 0 2px',
  },
}));

export const FactHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(1.5),
  gap: theme.spacing(0.5),
}));

export const FactTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '0.9rem',
  color: 'rgba(255, 255, 255, 0.9)',
}));

export const FactText = styled(Typography)(({ theme }) => ({
  fontSize: '0.85rem',
  lineHeight: 1.5,
  color: 'rgba(255, 255, 255, 0.8)',
  marginBottom: theme.spacing(1.5),
}));

export const FactFooter = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  color: 'rgba(255, 255, 255, 0.6)',
  fontStyle: 'italic',
}));

// NSFW Overlay styles
export const NSFWOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  zIndex: 2,
  borderRadius: '18px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2),
  textAlign: 'center',
  overflow: 'hidden',
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
}));

export const NSFWIconContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(1),
  [theme.breakpoints.up('sm')]: {
    marginBottom: theme.spacing(2),
  },
}));

export const NSFWButton = styled(Box)(({ theme }) => ({
  borderRadius: '16px',
  fontWeight: 500,
  marginBottom: theme.spacing(1),
  background: '#5c5b5e',
  color: '#fff',
  boxShadow: 'none',
  fontSize: '0.75rem',
  padding: theme.spacing(0.25, 0.5),
  [theme.breakpoints.up('sm')]: {
    marginBottom: theme.spacing(2),
    fontSize: '0.85rem',
    padding: theme.spacing(0.5, 1),
  },
}));

export const NSFWText = styled(Typography)(({ theme }) => ({
  color: '#bdbdbd',
  opacity: 0.7,
  marginTop: theme.spacing(1),
  fontSize: '0.75rem',
  wordBreak: 'break-word',
  maxWidth: '100%',
  [theme.breakpoints.up('sm')]: {
    marginTop: theme.spacing(2),
    fontSize: '0.9rem',
  },
}));
