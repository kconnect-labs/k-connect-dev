import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Chip,
  Grid,
  Paper,
  useMediaQuery,
  useTheme,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Check as ApproveIcon,
  Close as RejectIcon,
  Image as ImageIcon,
  Diamond as DiamondIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const ItemImage = styled(Box)(({ theme }) => ({
  width: 80,
  height: 80,
  borderRadius: 8,
  overflow: 'hidden',
  background: 'var(--theme-background, rgba(255, 255, 255, 0.05))',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
}));

const StatusChip = styled(Chip)<{ status: string }>(({ status, theme }) => {
  const colors = {
    pending: { bg: '#f39c12', color: '#fff' },
    active: { bg: '#27ae60', color: '#fff' },
    rejected: { bg: '#e74c3c', color: '#fff' },
  };

  const color = colors[status as keyof typeof colors] || colors.pending;

  return {
    background: color.bg,
    color: color.color,
    fontWeight: 600,
    fontSize: '0.9rem',
    '& .MuiChip-label': {
      padding: '6px 12px',
    },
  };
});

interface ProposalPack {
  id: number;
  display_name: string;
  description: string;
  price: number;
  status: 'pending' | 'active' | 'rejected';
  proposed_at: string;
  reviewed_at?: string;
  rejection_reason?: string;
  items_count: number;
  is_limited?: boolean;
  max_quantity?: number;
  proposed_by: {
    id: number;
    username: string;
    name: string;
  };
  contents?: Array<{
    item_name: string;
    item_type: string;
    rarity: string;
  }>;
}

interface PackProposalDetailsProps {
  proposal: ProposalPack;
  onClose: () => void;
  onSuccess: () => void;
}

const PackProposalDetails: React.FC<PackProposalDetailsProps> = ({
  proposal,
  onClose,
  onSuccess,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    display_name: proposal.display_name,
    description: proposal.description,
    price: proposal.price,
    is_limited: proposal.is_limited || false,
    max_quantity: proposal.max_quantity || 0,
  });

  const handleAction = async (actionType: 'approve' | 'reject') => {
    setAction(actionType);
    setError('');
  };

  const confirmAction = async () => {
    if (action === 'reject' && !rejectionReason.trim()) {
      setError('Укажите причину отклонения');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/moderator/inventory/packs/${proposal.id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: action,
          rejection_reason: action === 'reject' ? rejectionReason : undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess();
        onClose();
      } else {
        setError(data.message || 'Ошибка при выполнении действия');
      }
    } catch (err) {
      setError('Ошибка сети');
    } finally {
      setLoading(false);
    }
  };

  const cancelAction = () => {
    setAction(null);
    setRejectionReason('');
    setError('');
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({
      display_name: proposal.display_name,
      description: proposal.description,
      price: proposal.price,
      is_limited: proposal.is_limited || false,
      max_quantity: proposal.max_quantity || 0,
    });
  };

  const handleSaveEdit = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/moderator/inventory/packs/${proposal.id}/edit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editData),
      });

      const data = await response.json();

      if (data.success) {
        setIsEditing(false);
        onSuccess(); // Обновляем данные
      } else {
        setError(data.message || 'Ошибка при сохранении изменений');
      }
    } catch (err) {
      setError('Ошибка сети');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({
      display_name: proposal.display_name,
      description: proposal.description,
      price: proposal.price,
      is_limited: proposal.is_limited || false,
      max_quantity: proposal.max_quantity || 0,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return '#f39c12';
      case 'epic':
        return '#9b59b6';
      case 'rare':
        return '#3498db';
      default:
        return '#95a5a6';
    }
  };

  const getRarityLabel = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'Легендарный';
      case 'epic':
        return 'Эпический';
      case 'rare':
        return 'Редкий';
      case 'common':
        return 'Обычный';
      default:
        return rarity;
    }
  };

  return (
    <Box sx={{ p: isMobile ? 1 : 2 }}>
      {/* Заголовок */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, fontSize: isMobile ? '1.5rem' : '2rem' }}>
          {proposal.display_name}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <StatusChip
            status={proposal.status}
            label={proposal.status === 'pending' ? 'На рассмотрении' : proposal.status === 'active' ? 'Одобрен' : 'Отклонен'}
          />
          <Chip
            icon={<DiamondIcon />}
            label={`${proposal.price} баллов`}
            size="small"
            sx={{
              background: 'var(--theme-background, rgba(255, 255, 255, 0.05))',
              color: 'text.primary',
            }}
          />
          <Chip
            icon={<ImageIcon />}
            label={`${proposal.items_count} предметов`}
            size="small"
            sx={{
              background: 'var(--theme-background, rgba(255, 255, 255, 0.05))',
              color: 'text.primary',
            }}
          />
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Основная информация */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, background: 'var(--theme-background, rgba(255, 255, 255, 0.03))', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Основная информация
              </Typography>
              {proposal.status === 'pending' && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={isEditing ? <SaveIcon /> : <EditIcon />}
                  onClick={isEditing ? handleSaveEdit : handleEdit}
                  disabled={loading}
                  sx={{ minWidth: 'auto' }}
                >
                  {isEditing ? 'Сохранить' : 'Изменить'}
                </Button>
              )}
            </Box>
            
            {isEditing ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Название пака"
                  value={editData.display_name}
                  onChange={(e) => setEditData({ ...editData, display_name: e.target.value })}
                  fullWidth
                  size="small"
                />
                
                <TextField
                  label="Описание"
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  multiline
                  rows={3}
                  fullWidth
                  size="small"
                />
                
                <TextField
                  label="Цена (баллы)"
                  type="number"
                  value={editData.price}
                  onChange={(e) => setEditData({ ...editData, price: parseInt(e.target.value) || 0 })}
                  fullWidth
                  size="small"
                  inputProps={{ min: 1000, max: 50000 }}
                />
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <input
                    type="checkbox"
                    checked={editData.is_limited}
                    onChange={(e) => setEditData({ ...editData, is_limited: e.target.checked })}
                    id="is-limited"
                  />
                  <label htmlFor="is-limited">
                    <Typography variant="body2">Лимитированный пак</Typography>
                  </label>
                </Box>
                
                {editData.is_limited && (
                  <TextField
                    label="Лимит (штук)"
                    type="number"
                    value={editData.max_quantity}
                    onChange={(e) => setEditData({ ...editData, max_quantity: parseInt(e.target.value) || 0 })}
                    fullWidth
                    size="small"
                    inputProps={{ min: 10, max: 1000 }}
                  />
                )}
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleCancelEdit}
                    disabled={loading}
                  >
                    Отмена
                  </Button>
                </Box>
              </Box>
            ) : (
              <>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Название:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {proposal.display_name}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Описание:
                  </Typography>
                  <Typography variant="body1">
                    {proposal.description}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Цена:
                  </Typography>
                  <Typography variant="body1">
                    {proposal.price} баллов
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Предложил:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                    <Typography variant="body1">
                      <strong>{proposal.proposed_by.name}</strong> (@{proposal.proposed_by.username})
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Дата предложения:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ScheduleIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                    <Typography variant="body1">
                      {formatDate(proposal.proposed_at)}
                    </Typography>
                  </Box>
                </Box>

                {proposal.is_limited && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Лимитированный пак:
                    </Typography>
                    <Typography variant="body1">
                      Максимум {proposal.max_quantity} штук
                    </Typography>
                  </Box>
                )}

                {proposal.reviewed_at && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Дата рассмотрения:
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(proposal.reviewed_at)}
                    </Typography>
                  </Box>
                )}

                {proposal.status === 'rejected' && proposal.rejection_reason && (
                  <Box sx={{ mt: 2, p: 2, background: 'rgba(255, 0, 0, 0.1)', border: '1px solid rgba(255, 0, 0, 0.2)', borderRadius: 1 }}>
                    <Typography variant="body2" color="error" sx={{ fontWeight: 500, mb: 1 }}>
                      Причина отклонения:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {proposal.rejection_reason}
                    </Typography>
                  </Box>
                )}
              </>
            )}
          </Paper>
        </Grid>

        {/* Предметы */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, background: 'var(--theme-background, rgba(255, 255, 255, 0.03))', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Предметы в паке ({proposal.contents?.length || 0})
            </Typography>

            {proposal.contents && proposal.contents.length > 0 ? (
              <Grid container spacing={2}>
                {proposal.contents.map((item, index) => (
                  <Grid item xs={6} sm={4} key={index}>
                    <Box sx={{ textAlign: 'center' }}>
                      <ItemImage sx={{ mb: 1 }}>
                        <img
                          src={`/inventory/pack/${proposal.id}/${item.item_name}`}
                          alt={item.item_name}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </ItemImage>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                        {item.item_name}
                      </Typography>
                      <Chip
                        label={getRarityLabel(item.rarity)}
                        size="small"
                        sx={{
                          background: getRarityColor(item.rarity),
                          color: 'white',
                          fontSize: '0.7rem',
                        }}
                      />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Предметы не загружены
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Действия */}
      {proposal.status === 'pending' && (
        <Paper sx={{ mt: 3, p: 3, background: 'var(--theme-background, rgba(255, 255, 255, 0.03))', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Действия модератора
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {action === null ? (
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                color="success"
                startIcon={<ApproveIcon />}
                onClick={() => handleAction('approve')}
                sx={{
                  background: '#27ae60',
                  '&:hover': { background: '#229954' },
                }}
              >
                Одобрить пак
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<RejectIcon />}
                onClick={() => handleAction('reject')}
                sx={{
                  background: '#e74c3c',
                  '&:hover': { background: '#c0392b' },
                }}
              >
                Отклонить пак
              </Button>
            </Box>
          ) : (
            <Box>
              {action === 'reject' && (
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Причина отклонения *"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  sx={{ mb: 2 }}
                  placeholder="Укажите причину отклонения заявки..."
                  error={action === 'reject' && !rejectionReason.trim()}
                  helperText={action === 'reject' && !rejectionReason.trim() ? 'Обязательное поле' : ''}
                />
              )}

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  color={action === 'approve' ? 'success' : 'error'}
                  startIcon={loading ? <CircularProgress size={16} /> : action === 'approve' ? <ApproveIcon /> : <RejectIcon />}
                  onClick={confirmAction}
                  disabled={loading || (action === 'reject' && !rejectionReason.trim())}
                  sx={{
                    background: action === 'approve' ? '#27ae60' : '#e74c3c',
                    '&:hover': { 
                      background: action === 'approve' ? '#229954' : '#c0392b' 
                    },
                    opacity: action === 'reject' && !rejectionReason.trim() ? 0.6 : 1,
                  }}
                >
                  {loading ? 'Выполняется...' : action === 'approve' ? 'Подтвердить одобрение' : 'Подтвердить отклонение'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={cancelAction}
                  disabled={loading}
                >
                  Отмена
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
      )}

      {/* Кнопка закрытия */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={loading}
        >
          Закрыть
        </Button>
      </Box>
    </Box>
  );
};

export default PackProposalDetails; 