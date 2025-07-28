import { styled } from '@mui/material/styles';
import { Menu } from '@mui/material';

const BlurredMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    background:
      'linear-gradient(135deg, rgb(19 19 19 / 51%) 0%, rgb(25 24 24 / 39%) 100%)',
    backdropFilter: 'var(--theme-backdrop-filter, blur(10px))',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '12px',
    '& .MuiMenuItem-root': {
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
      },
    },
  },
}));

export default BlurredMenu;
