import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Alert,
  Typography,
  CircularProgress,
  MenuItem,
} from '@mui/material';
import UniversalModal from '../../../../UIKIT/UniversalModal';

interface CreateAuctionModalProps {
  open: boolean;
  onClose: () => void;
  usernames: Array<{ id: number; username: string; is_active: boolean }>;
  onSubmit: (data: {
    username: string;
    min_price: string;
    duration_hours: number;
  }) => Promise<{ success: boolean; errors?: any }>;
  loading: boolean;
}

const CreateAuctionModal: React.FC<CreateAuctionModalProps> = ({
  open,
  onClose,
  usernames,
  onSubmit,
  loading,
}) => {
  const [formData, setFormData] = useState({
    username: '',
    min_price: '',
    duration_hours: 24,
  });
  const [errors, setErrors] = useState<any>({});

  const handleSubmit = async () => {
    const result = await onSubmit(formData);
    if (result.success) {
      setFormData({
        username: '',
        min_price: '',
        duration_hours: 24,
      });
      setErrors({});
      onClose();
    } else if (result.errors) {
      setErrors(result.errors);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        username: '',
        min_price: '',
        duration_hours: 24,
      });
      setErrors({});
      onClose();
    }
  };

  const availableUsernames = usernames.filter(u => !u.is_active);

  return (
    <UniversalModal
      open={open}
      onClose={handleClose}
      title="Создать новый аукцион"
      maxWidth="sm"
      disableEscapeKeyDown={loading}
    >
      <Box sx={{ mb: 3 }}>
        <Typography variant='body1' gutterBottom>
          Выберите юзернейм для аукциона:
        </Typography>

        <TextField
          select
          fullWidth
          label='Юзернейм'
          value={formData.username}
          onChange={(e) =>
            setFormData({
              ...formData,
              username: e.target.value,
            })
          }
          error={!!errors.username}
          helperText={errors.username}
          margin='normal'
          variant='outlined'
          disabled={loading}
        >
          <MenuItem value=''>Выберите юзернейм</MenuItem>
          {availableUsernames.map((username) => (
            <MenuItem key={username.id} value={username.username}>
              @{username.username}
            </MenuItem>
          ))}
        </TextField>

        {availableUsernames.length === 0 && (
          <Alert severity='info' sx={{ mt: 2 }}>
            У вас нет неактивных юзернеймов для аукциона. Вы не можете
            выставить активный юзернейм.
          </Alert>
        )}

        <TextField
          fullWidth
          label='Минимальная цена (баллы)'
          type='number'
          value={formData.min_price}
          onChange={(e) =>
            setFormData({
              ...formData,
              min_price: e.target.value,
            })
          }
          error={!!errors.min_price}
          helperText={
            errors.min_price ||
            'Максимальная начальная цена: 15 000 000 баллов'
          }
          margin='normal'
          variant='outlined'
          disabled={loading}
          InputProps={{
            inputProps: {
              min: 1,
              max: 15000000,
            },
          }}
        />

        <TextField
          select
          fullWidth
          label='Длительность аукциона'
          value={formData.duration_hours}
          onChange={(e) =>
            setFormData({
              ...formData,
              duration_hours: parseFloat(e.target.value),
            })
          }
          margin='normal'
          variant='outlined'
          disabled={loading}
        >
          <MenuItem value={0.5}>30 минут</MenuItem>
          <MenuItem value={24}>24 часа</MenuItem>
          <MenuItem value={48}>2 дня</MenuItem>
          <MenuItem value={72}>3 дня</MenuItem>
          <MenuItem value={168}>1 неделя</MenuItem>
        </TextField>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          variant="outlined"
        >
          Отмена
        </Button>
        <Button
          variant='contained'
          onClick={handleSubmit}
          disabled={
            !formData.username ||
            !formData.min_price ||
            loading
          }
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Создание...' : 'Создать аукцион'}
        </Button>
      </Box>
    </UniversalModal>
  );
};

export default CreateAuctionModal; 