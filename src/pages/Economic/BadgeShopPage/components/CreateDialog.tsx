import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { NewBadge } from '../types';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

interface CreateDialogProps {
  open: boolean;
  newBadge: NewBadge;
  error: string;
  loading: boolean;
  badgeLimitReached: boolean;
  badgeLimit: number;
  createdBadgesCount: number;
  previewUrl: string | null;
  onClose: () => void;
  onCreate: () => void;
  onNewBadgeChange: (badge: NewBadge) => void;
  onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const CreateDialog: React.FC<CreateDialogProps> = ({
  open,
  newBadge,
  error,
  loading,
  badgeLimitReached,
  badgeLimit,
  createdBadgesCount,
  previewUrl,
  onClose,
  onCreate,
  onNewBadgeChange,
  onImageChange,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleInputChange = (
    field: keyof NewBadge,
    value: string | number | boolean
  ) => {
    onNewBadgeChange({
      ...newBadge,
      [field]: value,
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onImageChange(event);
  };

  const modalStyle = {
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: isMobile ? 0 : '16px',
    maxWidth: '600px',
    width: '100%',
    maxHeight: isMobile ? '100vh' : '90vh',
    margin: isMobile ? 0 : 'auto',
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    background: 'rgba(255, 255, 255, 0.02)',
    backdropFilter: 'blur(10px)',
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: modalStyle,
      }}
      fullScreen={isMobile}
    >
      <Box sx={headerStyle}>
        {isMobile ? (
          <IconButton onClick={onClose} sx={{ color: 'text.primary' }}>
            <ArrowBackIcon />
          </IconButton>
        ) : (
          <Box sx={{ width: 40 }} />
        )}

        <Typography
          variant='h6'
          sx={{ fontWeight: 600, color: 'text.primary' }}
        >
          Создать новый бейджик
        </Typography>

        <IconButton onClick={onClose} sx={{ color: 'text.primary' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: isMobile ? 2 : 3, overflow: 'auto' }}>
        <Box
          sx={{
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            padding: '20px',
            marginBottom: '20px',
            borderRadius: '12px',
          }}
        >
          <Typography
            variant='h6'
            sx={{
              mb: 3,
              color: 'text.primary',
              fontSize: '1.2rem',
              fontWeight: 600,
            }}
          >
            Создание нового бейджика
          </Typography>

          <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
            Создано: {createdBadgesCount} /{' '}
            {badgeLimit === Infinity ? '∞' : badgeLimit}
          </Typography>

          <Box
            sx={{
              mb: 2,
              p: 2,
              bgcolor: 'rgba(255, 255, 255, 0.03)',
              borderRadius: 1,
            }}
          >
            <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 600 }}>
              Стоимость создания:
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 0.5 }}>
              • Обычный бейджик: 3000 баллов
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              • Улучшенный бейджик: 9000 баллов
            </Typography>
          </Box>

          {badgeLimitReached && (
            <Alert severity='warning' sx={{ mb: 2 }}>
              Достигнут лимит создания бейджей ({badgeLimit}). Обновите подписку
              для увеличения лимита.
            </Alert>
          )}

          {error && (
            <Alert severity='error' sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
        </Box>

        {/* Предпросмотр изображения */}
        {previewUrl && (
          <Box
            sx={{
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              padding: '20px',
              marginBottom: '20px',
              textAlign: 'center',
              borderRadius: '12px',
            }}
          >
            <Typography variant='h6' sx={{ mb: 2, color: 'text.primary' }}>
              Предпросмотр
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 120,
                border: '2px dashed rgba(255, 255, 255, 0.2)',
                p: 2,
                mb: 2,
              }}
            >
              <img
                src={previewUrl}
                alt='Предпросмотр'
                style={{
                  maxWidth: '100%',
                  maxHeight: 120,
                  objectFit: 'contain',
                }}
              />
            </Box>
            {newBadge.name && (
              <Typography variant='subtitle1' sx={{ mb: 1 }}>
                {newBadge.name}
              </Typography>
            )}
            {newBadge.description && (
              <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                {newBadge.description}
              </Typography>
            )}
            {newBadge.price && (
              <Typography variant='body2'>
                Цена: {newBadge.price} баллов
              </Typography>
            )}
          </Box>
        )}

        {/* Форма создания */}
        <Box
          sx={{
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            padding: '20px',
            marginBottom: '20px',
            borderRadius: '12px',
          }}
        >
          <Typography
            variant='h6'
            sx={{
              mb: 3,
              color: 'text.primary',
              fontSize: '1.2rem',
              fontWeight: 600,
            }}
          >
            Основная информация
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label='Название бейджика'
              value={newBadge.name}
              onChange={e => handleInputChange('name', e.target.value)}
              fullWidth
              required
              disabled={badgeLimitReached}
              sx={{ mb: 2 }}
            />

            <TextField
              label='Описание'
              value={newBadge.description}
              onChange={e => handleInputChange('description', e.target.value)}
              fullWidth
              multiline
              rows={3}
              required
              disabled={badgeLimitReached}
              sx={{ mb: 2 }}
            />

            <TextField
              label='Цена (баллы)'
              value={newBadge.price}
              onChange={e => handleInputChange('price', e.target.value)}
              fullWidth
              type='number'
              required
              disabled={badgeLimitReached}
              inputProps={{ min: 3000 }}
              helperText='Минимальная стоимость: 3000 баллов'
              sx={{ mb: 2 }}
            />

            <TextField
              label='Максимальное количество копий'
              value={newBadge.max_copies}
              onChange={e => handleInputChange('max_copies', e.target.value)}
              fullWidth
              type='number'
              helperText='Оставьте пустым для неограниченного количества'
              disabled={badgeLimitReached}
              sx={{ mb: 2 }}
            />

            <TextField
              label='Процент роялти'
              value={newBadge.royalty_percentage}
              onChange={e =>
                handleInputChange('royalty_percentage', Number(e.target.value))
              }
              fullWidth
              type='number'
              inputProps={{ min: 0, max: 100 }}
              disabled={badgeLimitReached}
              sx={{ mb: 2 }}
            />

            <Box
              sx={{
                mb: 2,
                p: 2,
                bgcolor: 'rgba(208, 188, 255, 0.1)',
                borderRadius: 1,
                border: '1px solid rgba(208, 188, 255, 0.3)',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 1,
                }}
              >
                <Typography variant='subtitle2' sx={{ fontWeight: 600 }}>
                  Улучшенный Бейдж
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={newBadge.is_upgraded}
                      onChange={e =>
                        handleInputChange('is_upgraded', e.target.checked)
                      }
                      disabled={badgeLimitReached}
                    />
                  }
                  label=''
                />
              </Box>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
                Добавляет анимированные частицы с настраиваемым цветом
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Стоимость создания: {newBadge.is_upgraded ? '9000' : '3000'}{' '}
                баллов
              </Typography>
            </Box>

            {newBadge.is_upgraded && (
              <Box sx={{ mb: 2 }}>
                <Typography variant='body2' sx={{ mb: 1 }}>
                  Цвет частиц для улучшенного бейджика:
                </Typography>
                <input
                  type='color'
                  value={newBadge.particle_color}
                  onChange={e =>
                    handleInputChange('particle_color', e.target.value)
                  }
                  disabled={badgeLimitReached}
                  style={{
                    width: '100%',
                    height: 40,
                    border: 'none',
                    borderRadius: 4,
                    cursor: badgeLimitReached ? 'not-allowed' : 'pointer',
                  }}
                />
              </Box>
            )}

            <Box sx={{ mb: 2 }}>
              <Typography variant='body2' sx={{ mb: 1 }}>
                Изображение бейджика:
              </Typography>
              <Button
                variant='outlined'
                component='label'
                startIcon={<CloudUploadIcon />}
                disabled={badgeLimitReached}
                sx={{
                  width: '100%',
                  height: 56,
                  border: '2px dashed rgba(255, 255, 255, 0.3)',
                  borderRadius: 8,
                  '&:hover': {
                    border: '2px dashed rgba(255, 255, 255, 0.5)',
                  },
                }}
              >
                {newBadge.image ? 'Файл выбран' : 'Выберите файл'}
                <input
                  accept='.svg,.gif'
                  type='file'
                  hidden
                  onChange={handleFileChange}
                  disabled={badgeLimitReached}
                />
              </Button>
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  bgcolor: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: 1,
                }}
              >
                <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 600 }}>
                  Требования к изображению:
                </Typography>
                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{ mb: 0.5 }}
                >
                  • Загружайте только SVG или GIF формат
                </Typography>
                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{ mb: 0.5 }}
                >
                  • Максимальный размер файла: 100 КБ
                </Typography>
                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{ mb: 0.5 }}
                >
                  • Максимальная ширина: 100px
                </Typography>
                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{ mb: 0.5 }}
                >
                  • Ограничения по высоте: 23px, 30px, 60px
                </Typography>
                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{ mb: 1 }}
                >
                  • Рекомендуем использовать SVG с минимальным весом для лучшей
                  производительности
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          onClick={onClose}
          color='inherit'
          disabled={loading}
          sx={{
            borderRadius: 8,
            py: 1,
            px: 3,
          }}
        >
          Отмена
        </Button>
        <Button
          onClick={onCreate}
          variant='contained'
          disabled={
            loading ||
            badgeLimitReached ||
            !newBadge.name ||
            !newBadge.description ||
            !newBadge.price ||
            !newBadge.image
          }
          startIcon={loading ? <CircularProgress size={16} /> : undefined}
          sx={{
            borderRadius: 8,
            py: 1,
            px: 3,
            minWidth: 140,
          }}
        >
          {loading ? 'Создание...' : 'Создать бейджик'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
