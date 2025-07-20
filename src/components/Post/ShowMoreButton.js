import { styled } from '@mui/material/styles';
import { Button } from '@mui/material';

const ShowMoreButton = styled(Button)(({ theme }) => ({
  margin: '8px auto 0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background:
    'linear-gradient(180deg, rgba(26,26,26,0) 0%, rgba(26,26,26,0.8) 30%, rgba(26,26,26,1) 100%)',
  color: theme.palette.primary.main,
  borderRadius: '0 0 10px 10px',
  textTransform: 'none',
  fontWeight: 'normal',
  padding: '8px',
  width: '100%',
  position: 'absolute',
  bottom: 0,
  left: 0,
  '&:hover': {
    background:
      'linear-gradient(180deg, rgba(26,26,26,0) 0%, rgba(26,26,26,0.9) 30%, rgba(26,26,26,1) 100%)',
  },
}));

export default ShowMoreButton;
