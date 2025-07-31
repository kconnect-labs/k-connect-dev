import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Chip,
} from '@mui/material';
import { Tag as TagIcon } from '@mui/icons-material';
import UniversalModal from '../../../../UIKIT/UniversalModal';

interface PlaceBidModalProps {
  open: boolean;
  onClose: () => void;
  auction: any;
  onSubmit: (auction: any, amount: string) => Promise<{ success: boolean; errors?: any }>;
  loading: boolean;
}

const PlaceBidModal: React.FC<PlaceBidModalProps> = ({
  open,
  onClose,
  auction,
  onSubmit,
  loading,
}) => {
  const [bidAmount, setBidAmount] = useState('');
  const [errors, setErrors] = useState<any>({});

  const handleSubmit = async () => {
    const result = await onSubmit(auction, bidAmount);
    if (result.success) {
      setBidAmount('');
      setErrors({});
      onClose();
    } else if (result.errors) {
      setErrors(result.errors);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setBidAmount('');
      setErrors({});
      onClose();
    }
  };

  const currentPrice = auction?.current_price || auction?.highest_bid || auction?.min_price;
  const minBidAmount = Number(currentPrice) + 1;

  return (
    <UniversalModal
      open={open}
      onClose={handleClose}
      title="Сделать ставку"
      maxWidth={false}
      maxWidthCustom={850}
      disableEscapeKeyDown={loading}
    >
      {auction && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <TagIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant='h6' component='h2'>
              @{auction.username}
            </Typography>
            {auction.status && (
              <Chip
                label={auction.status}
                size='small'
                sx={{ ml: 2 }}
                color={auction.status === 'completed' ? 'error' : 'primary'}
              />
            )}
          </Box>

          <Typography variant='body2' gutterBottom sx={{ mb: 2 }}>
            Текущая ставка:{' '}
            <b>{currentPrice} баллов</b>
          </Typography>

          {auction.status === 'completed' ? (
            <Box sx={{ 
              p: 2, 
              bgcolor: 'warning.main', 
              color: 'warning.contrastText',
              borderRadius: 1,
              mb: 2 
            }}>
              Этот аукцион уже завершен, ставки больше не принимаются.
            </Box>
          ) : (
            <TextField
              fullWidth
              label='Ваша ставка (баллы)'
              type='number'
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              error={!!errors.bidAmount}
              helperText={
                errors.bidAmount ||
                `Минимальная ставка: ${minBidAmount} баллов`
              }
              margin='normal'
              variant='outlined'
              disabled={loading || auction.status === 'completed'}
              InputProps={{
                inputProps: {
                  min: minBidAmount,
                },
              }}
            />
          )}
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          variant="outlined"
        >
          Отмена
        </Button>
        {auction && auction.status !== 'completed' && (
          <Button
            variant='contained'
            onClick={handleSubmit}
            disabled={
              !bidAmount ||
              isNaN(Number(bidAmount)) ||
              Number(bidAmount) <= Number(currentPrice) ||
              loading
            }
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Обработка...' : 'Сделать ставку'}
          </Button>
        )}
      </Box>
    </UniversalModal>
  );
};

export default PlaceBidModal; 