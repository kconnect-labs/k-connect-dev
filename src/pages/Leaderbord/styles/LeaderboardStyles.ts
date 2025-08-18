import { styled } from '@mui/material/styles';
import { Container, Box } from '@mui/material';

export const LeaderboardContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  marginBottom: theme.spacing(8),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  paddingLeft: '0 !important',
  paddingRight: '0 !important',
  maxWidth: '1200px !important',

  [theme.breakpoints.down('sm')]: {
    alignItems: 'center',
  },
}));

export const LeaderboardHeaderContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  textAlign: 'left',
  [theme.breakpoints.down('sm')]: {
    alignItems: 'center',
    textAlign: 'center',
  },
}));
