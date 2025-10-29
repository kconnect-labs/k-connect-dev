import { styled, alpha } from '@mui/material/styles';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Chip,
  Dialog,
  DialogContent,
  FormControl,
  Paper,
  Container,
  Grid,
  DialogActions as MuiDialogActions,
} from '@mui/material';
import { Theme } from '@mui/material/styles';

// Card Components
export const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
  borderRadius: 16,
  overflow: 'hidden',
  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
  position: 'relative',
  background: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(20px)',
  '&:hover': {
    transform: 'translateY(-6px)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
    '& .badge-image': {
      transform: 'scale(1.05)',
    },
    '& .badge-overlay': {
      opacity: 1,
    },
  },
  [theme.breakpoints.down('sm')]: {
    '& .MuiCardMedia-root': {
      height: '150px',
    },
  },
}));

export const BadgeCardHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 2, 1.5),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  position: 'relative',
  '@media (max-width: 600px)': {
    padding: theme.spacing(1.5, 1.5, 1),
  },
}));

export const BadgeCardContent = styled(CardContent)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(1.5),
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  background: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(40px)',
  borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  '&:last-child': {
    paddingBottom: theme.spacing(1.5),
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
  },
}));

// Typography Components
export const BadgeTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '0.95rem',
  color: theme.palette.text.primary,
  textAlign: 'center',
  marginBottom: theme.spacing(0.5),
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.85rem',
  },
}));

export const BadgeDescription = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '0.8rem',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  textAlign: 'center',
  marginBottom: theme.spacing(1.5),
  lineHeight: 1.4,
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.75rem',
    marginBottom: theme.spacing(1),
  },
}));

export const BadgeCreatorName = styled(Typography)(({ theme }) => ({
  fontSize: '0.8rem',
  color: theme.palette.text.secondary,
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.7rem',
  },
}));

export const BadgePriceText = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  color: theme.palette.primary.main,
  fontSize: '0.9rem',
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.8rem',
  },
}));

// Layout Components
export const BadgeCreator = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(0.75),
  marginBottom: theme.spacing(1.5),
  [theme.breakpoints.down('sm')]: {
    marginBottom: theme.spacing(1),
  },
}));

export const BadgeFooter = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: 'auto',
  paddingTop: theme.spacing(1),
  borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  [theme.breakpoints.down('sm')]: {
    paddingTop: theme.spacing(0.5),
  },
}));

export const BadgePrice = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  [theme.breakpoints.down('sm')]: {
    gap: theme.spacing(0.25),
  },
}));

// Avatar Components
export const BadgeCreatorAvatar = styled(Avatar)(({ theme }) => ({
  width: 24,
  height: 24,
  border: `2px solid ${theme.palette.primary.main}`,
  [theme.breakpoints.down('sm')]: {
    width: 20,
    height: 20,
  },
}));

// Button Components
export const BadgeBuyButton = styled(Button)(({ theme }) => ({
  borderRadius: 20,
  textTransform: 'none',
  fontWeight: 600,
  padding: '4px 12px',
  minWidth: 'auto',
  fontSize: '0.75rem',
  boxShadow: 'var(--box-shadow)',
  backgroundColor: theme.palette.mode === 'dark' ? '#d0bcff' : '#6200ee',
  color: theme.palette.mode === 'dark' ? '#000' : '#fff',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? '#cabcfc' : '#5000d2',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
  },
  '&.Mui-disabled': {
    backgroundColor: alpha(theme.palette.action.disabled, 0.1),
    color: theme.palette.action.disabled,
  },
  [theme.breakpoints.down('sm')]: {
    padding: '2px 8px',
    fontSize: '0.7rem',
  },
}));

export const StyledButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(45deg, #d0bcff 30%, ${alpha('#d0bcff', 0.8)} 90%)`,
  color: '#1a1a1a',
  fontWeight: 'bold',
  padding: '8px 24px',
  borderRadius: 25,
  boxShadow: '0 3px 5px 2px rgba(208, 188, 255, 0.2)',
  '&:hover': {
    background: `linear-gradient(45deg, ${alpha('#d0bcff', 0.9)} 30%, #d0bcff 90%)`,
  },
  '@media (max-width: 600px)': {
    padding: '6px 16px',
    fontSize: '0.9rem',
  },
}));

export const StyledTabButton = styled(Button)(({ theme }) => ({
  background: 'transparent',
  border: 'none',
  outline: 'none',
  cursor: 'pointer',
  fontWeight: 500,
  fontSize: '0.875rem',
  textTransform: 'none',
  borderRadius: 8,
  minHeight: 40,
  transition: 'all 0.2s ease',
  color: 'rgba(255, 255, 255, 0.7)',
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0 16px',
  boxSizing: 'border-box',
  margin: '0 2px',
  fontFamily: 'inherit',
  '&:hover': {
    color: 'rgba(255, 255, 255, 0.9)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  '&.active': {
    color: '#1a1a1a',
    backgroundColor: '#D0BCFF',
  },
  '&.active:hover': {
    backgroundColor: '#c0a8ff',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.85rem',
    minHeight: 36,
    padding: '0 12px',
    margin: '0 1px',
  },
}));

export const StyledBalanceChip = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: '8px 16px',
  borderRadius: 8,
  background: 'transparent',
  border: 'none',
  outline: 'none',
  cursor: 'pointer',
  fontWeight: 500,
  fontSize: '0.875rem',
  textTransform: 'none',
  minHeight: 40,
  transition: 'all 0.2s ease',
  color: 'rgba(255, 255, 255, 0.7)',
  position: 'relative',
  boxSizing: 'border-box',
  margin: '0 2px',
  fontFamily: 'inherit',
  '&:hover': {
    color: 'rgba(255, 255, 255, 0.9)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.85rem',
    minHeight: 36,
    padding: '6px 12px',
    margin: '0 1px',
  },
}));

export const StyledInfoBlock = styled(Box)(({ theme }) => ({
  borderRadius: 'var(--main-border-radius) !important',
  background: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(20px)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
  borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
  padding: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(2),
  minHeight: 48,
  position: 'relative',
  zIndex: 2,
  boxSizing: 'border-box',
  contain: 'layout style paint',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.5),
    minHeight: 44,
    flexDirection: 'row',
    gap: theme.spacing(1.5),
  },
}));

// Chip Components
export const PriceChip = styled(Chip)(({ theme }) => ({
  fontWeight: 'bold',
  background: `linear-gradient(45deg, #d0bcff 30%, ${alpha('#d0bcff', 0.8)} 90%)`,
  color: '#1a1a1a',
  border: 'none',
  boxShadow: '0 3px 5px 2px rgba(208, 188, 255, 0.2)',
  borderRadius: 20,
  padding: '0 10px',
  '& .MuiChip-label': {
    fontSize: '0.9rem',
    '@media (max-width: 600px)': {
      fontSize: '0.8rem',
    },
  },
}));

export const BalanceChip = styled(Chip)(({ theme }) => ({
  fontWeight: 'bold',
  fontSize: '1.1rem',
  background: `linear-gradient(45deg, #d0bcff 30%, ${alpha('#d0bcff', 0.8)} 90%)`,
  color: '#1a1a1a',
  boxShadow: '0 3px 5px 2px rgba(208, 188, 255, 0.2)',
  borderRadius: 20,
  padding: '5px 15px',
  '@media (max-width: 600px)': {
    fontSize: '1rem',
    padding: '4px 12px',
  },
}));

export const CopiesChip = styled(Chip)<{ issoldout?: string }>(
  ({ theme, issoldout }) => ({
    position: 'absolute',
    top: 8,
    right: 8,
    height: 24,
    borderRadius: 'var(--main-border-radius) !important',
    fontWeight: 500,
    backgroundColor:
      issoldout === 'true'
        ? alpha(theme.palette.error.main, 0.1)
        : alpha(theme.palette.mode === 'dark' ? '#d0bcff' : '#6200ee', 0.1),
    color:
      issoldout === 'true'
        ? theme.palette.error.main
        : theme.palette.mode === 'dark'
          ? '#d0bcff'
          : '#6200ee',
    border: `1px solid ${
      issoldout === 'true'
        ? alpha(theme.palette.error.main, 0.2)
        : alpha(theme.palette.mode === 'dark' ? '#d0bcff' : '#6200ee', 0.2)
    }`,
    backdropFilter: 'blur(4px)',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    '& .MuiChip-label': {
      fontSize: '0.7rem',
      padding: '0 8px',
      letterSpacing: '0.02em',
    },
    [theme.breakpoints.down('sm')]: {
      height: 20,
      top: 6,
      right: 6,
      '& .MuiChip-label': {
        fontSize: '0.65rem',
      },
    },
  })
);

// Dialog Components
export const BadgeDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    maxWidth: '90%',
    width: '400px',
    margin: theme.spacing(2),
    borderRadius: theme.shape.borderRadius * 2,
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.down('sm')]: {
      width: '100%',
      maxWidth: '100%',
      margin: 0,
      borderRadius: 0,
      maxHeight: '100vh',
    },
    zIndex: 1000000,
    background: 'rgba(18, 18, 18, 0.8)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
  },
  '& .MuiBackdrop-root': {
    zIndex: 999999,
  },
}));

export const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-container': {
    zIndex: 999999999999,
  },
  '& .MuiDialog-paper': {
    borderRadius: 16,
    background:
      theme.palette.mode === 'dark'
        ? 'rgba(18, 18, 18, 0.8)'
        : 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    border:
      theme.palette.mode === 'dark'
        ? '1px solid rgba(66, 66, 66, 0.5)'
        : '1px solid rgba(208, 188, 255, 0.3)',
    overflow: 'hidden',
    maxWidth: '450px',
    width: '100%',
    margin: theme.spacing(2),
    [theme.breakpoints.down('sm')]: {
      width: '100%',
      maxWidth: '100%',
      margin: 0,
      borderRadius: 0,
    },
  },
  '& .MuiDialogTitle-root': {
    fontSize: '1.2rem',
    fontWeight: 500,
  },
}));

// Form Components
export const SortSelect = styled(FormControl)(({ theme }) => ({
  minWidth: 160,
  margin: theme.spacing(0, 2),
  '& .MuiOutlinedInput-root': {
    borderRadius: 'var(--main-border-radius) !important',
    background: 'rgba(255, 255, 255, 0.1)',
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
    '&:hover': {
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    },
  },
  [theme.breakpoints.down('sm')]: {
    minWidth: '100%',
    margin: theme.spacing(1, 0),
  },
}));

// Layout Components
export const BadgeGrid = styled(Grid)(({ theme }) => ({
  padding: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
  },
}));

export const PageContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(10),
  [theme.breakpoints.down('sm')]: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(8),
  },
}));

// Image Components
export const BadgeImage = styled('img')({
  width: '100%',
  height: '150px',
  objectFit: 'contain',
  padding: '12px',
  transition: 'transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)',
  '&:hover': {
    transform: 'scale(1.05)',
  },
  '@media (max-width: 600px)': {
    padding: '8px',
  },
});

export const BadgeOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background:
    'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%)',
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'center',
  padding: theme.spacing(2),
  opacity: 0,
  transition: 'opacity 0.3s ease',
  zIndex: 1,
}));

export const BadgeDialogImage = styled('img')(({ theme }) => ({
  width: '100%',
  height: 'auto',
  maxHeight: '200px',
  objectFit: 'contain',
  borderRadius: theme.shape.borderRadius,
  [theme.breakpoints.down('sm')]: {
    maxHeight: '150px',
  },
}));
