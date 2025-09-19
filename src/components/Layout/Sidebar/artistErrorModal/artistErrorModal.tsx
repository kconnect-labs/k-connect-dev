import { Box, Button, Typography } from '@mui/material';
import UniversalModal from '../../../../UIKIT/UniversalModal/UniversalModal';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../../context/LanguageContext';

interface ArtistErrorModalProps {
  isArtistModalOpen: boolean;
  setIsArtistModalOpen: (isArtistModalOpen: boolean) => void;
  artistModalError: string;
}

export const ArtistErrorModal = ({
  isArtistModalOpen,
  setIsArtistModalOpen,
  artistModalError,
}: ArtistErrorModalProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const onClose = () => {
    setIsArtistModalOpen(false);
  };

  const onNavigateToTickets = () => {
    navigate('/tickets');
    onClose();
  };

  return (
    <UniversalModal
      open={isArtistModalOpen}
      onClose={onClose}
      title={'Карточка артиста'}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography textAlign='center'>{artistModalError}</Typography>
        <Button
          onClick={() => onNavigateToTickets()}
          variant='contained'
          color='primary'
        >
          {t('sidebar.navigation.artistErrorModal.tickets')}
        </Button>
      </Box>
    </UniversalModal>
  );
};
