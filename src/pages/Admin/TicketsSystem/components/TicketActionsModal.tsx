import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Warning,
  Block,
  Delete,
  Send,
  Close,
} from '@mui/icons-material';

interface TicketActionsModalProps {
  open: boolean;
  onClose: () => void;
  ticket: any;
  onIssueWarning: (userId: number, reason: string, duration: string, ticketId?: number, targetType?: string, targetId?: number) => void;
  onBanUser: (userId: number, reason: string, duration: string, ticketId?: number, targetType?: string, targetId?: number) => void;
  onDeletePost: (postId: number, ticketId?: number) => void;
}

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(0, 0, 0, 0.12)',
    borderRadius: theme.spacing(2),
    color: 'rgba(255, 255, 255, 0.87)',
  },
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.03)',
  borderRadius: theme.spacing(1),
  marginBottom: theme.spacing(1),
  border: '1px solid rgba(255, 255, 255, 0.08)',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(0, 0, 0, 0.12)',
  },
}));

const TicketActionsModal: React.FC<TicketActionsModalProps> = ({
  open,
  onClose,
  ticket,
  onIssueWarning,
  onBanUser,
  onDeletePost,
}) => {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [duration, setDuration] = useState('24h');

  const handleActionClick = (action: string) => {
    setSelectedAction(action);
    setReason('');
    setDuration('24h');
  };

  const handleConfirmAction = () => {
    if (!selectedAction || !reason.trim()) return;

    switch (selectedAction) {
      case 'warning_complainer':
        // Предупреждение отправителю жалобы
        onIssueWarning(ticket.creator?.id, reason, duration, ticket.id);
        break;
      case 'warning_violator':
        // Предупреждение нарушителю (автору поста/комментария)
        // Передаем target_type и target_id, API сам получит правильный user_id
        onIssueWarning(0, reason, duration, ticket.id, ticket.target_type, ticket.target_id);
        break;
      case 'ban_complainer':
        // Бан отправителя жалобы
        onBanUser(ticket.creator?.id, reason, duration, ticket.id);
        break;
      case 'ban_violator':
        // Бан нарушителя
        // Передаем target_type и target_id, API сам получит правильный user_id
        onBanUser(0, reason, duration, ticket.id, ticket.target_type, ticket.target_id);
        break;
      case 'delete_post':
        onDeletePost(ticket.target_id, ticket.id);
        break;
    }

    handleClose();
  };

  const handleClose = () => {
    setSelectedAction(null);
    setReason('');
    setDuration('24h');
    onClose();
  };

  const renderActionForm = () => {
    if (!selectedAction) return null;

    return (
      <Box mt={2}>
        <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.87)', mb: 2 }}>
          {selectedAction === 'warning_complainer' && 'Выдать предупреждение отправителю жалобы'}
          {selectedAction === 'warning_violator' && 'Выдать предупреждение нарушителю'}
          {selectedAction === 'ban_complainer' && 'Забанить отправителя жалобы'}
          {selectedAction === 'ban_violator' && 'Забанить нарушителя'}
          {selectedAction === 'delete_post' && 'Удалить пост'}
        </Typography>

        <TextField
          fullWidth
          multiline
          rows={3}
          label="Причина"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(0, 0, 0, 0.12)',
              '&:hover': {
                border: '1px solid rgba(255, 255, 255, 0.2)',
              },
              '&.Mui-focused': {
                border: '1px solid rgba(207, 188, 251, 0.5)',
              },
            },
            '& .MuiInputLabel-root': {
              color: 'rgba(255, 255, 255, 0.7)',
            },
            '& .MuiInputBase-input': {
              color: 'rgba(255, 255, 255, 0.87)',
            },
          }}
        />

        {(selectedAction === 'warning_complainer' || selectedAction === 'warning_violator' || selectedAction === 'ban_complainer' || selectedAction === 'ban_violator') && (
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Длительность
            </InputLabel>
            <Select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              sx={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(0, 0, 0, 0.12)',
                '& .MuiSelect-icon': {
                  color: 'rgba(255, 255, 255, 0.7)',
                },
                '& .MuiSelect-select': {
                  color: 'rgba(255, 255, 255, 0.87)',
                },
              }}
            >
              <MenuItem value="1h">1 час</MenuItem>
              <MenuItem value="24h">24 часа</MenuItem>
              <MenuItem value="7d">7 дней</MenuItem>
              <MenuItem value="30d">30 дней</MenuItem>
              <MenuItem value="permanent">Навсегда</MenuItem>
            </Select>
          </FormControl>
        )}

        <Box display="flex" gap={2} justifyContent="flex-end">
          <Button
            variant="outlined"
            onClick={() => setSelectedAction(null)}
            sx={{
              borderColor: 'rgba(255, 255, 255, 0.3)',
              color: 'rgba(255, 255, 255, 0.7)',
              '&:hover': {
                borderColor: 'rgba(255, 255, 255, 0.5)',
                background: 'rgba(255, 255, 255, 0.05)',
              },
            }}
          >
            Отмена
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmAction}
            disabled={!reason.trim()}
            sx={{
              background: 'linear-gradient(45deg, #d0bcff 30%, #cfbcfb 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #c4a7ff 30%, #b8a9ff 90%)',
              },
              '&:disabled': {
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'rgba(255, 255, 255, 0.3)',
              },
            }}
          >
            Подтвердить
          </Button>
        </Box>
      </Box>
    );
  };

  return (
    <StyledDialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ color: 'rgba(255, 255, 255, 0.87)' }}>
        Действия с тикетом #{ticket?.id}
      </DialogTitle>
      <DialogContent>
        {!selectedAction ? (
          <List>
            <StyledListItem
              onClick={() => handleActionClick('warning_complainer')}
            >
              <ListItemIcon>
                <Warning sx={{ color: '#FF9800' }} />
              </ListItemIcon>
              <ListItemText
                primary="Предупреждение отправителю жалобы"
                secondary={`Отправить предупреждение ${ticket.creator?.name || 'отправителю жалобы'}`}
                sx={{
                  '& .MuiListItemText-primary': {
                    color: 'rgba(255, 255, 255, 0.87)',
                  },
                  '& .MuiListItemText-secondary': {
                    color: 'rgba(255, 255, 255, 0.6)',
                  },
                }}
              />
            </StyledListItem>

            <StyledListItem
              onClick={() => handleActionClick('warning_violator')}
            >
              <ListItemIcon>
                <Warning sx={{ color: '#FF9800' }} />
              </ListItemIcon>
              <ListItemText
                primary="Предупреждение нарушителю"
                secondary="Отправить предупреждение нарушителю"
                sx={{
                  '& .MuiListItemText-primary': {
                    color: 'rgba(255, 255, 255, 0.87)',
                  },
                  '& .MuiListItemText-secondary': {
                    color: 'rgba(255, 255, 255, 0.6)',
                  },
                }}
              />
            </StyledListItem>

            <StyledListItem
              onClick={() => handleActionClick('ban_complainer')}
            >
              <ListItemIcon>
                <Block sx={{ color: '#f44336' }} />
              </ListItemIcon>
              <ListItemText
                primary="Забанить отправителя жалобы"
                secondary={`Заблокировать ${ticket.creator?.name || 'отправителя жалобы'}`}
                sx={{
                  '& .MuiListItemText-primary': {
                    color: 'rgba(255, 255, 255, 0.87)',
                  },
                  '& .MuiListItemText-secondary': {
                    color: 'rgba(255, 255, 255, 0.6)',
                  },
                }}
              />
            </StyledListItem>

            <StyledListItem
              onClick={() => handleActionClick('ban_violator')}
            >
              <ListItemIcon>
                <Block sx={{ color: '#f44336' }} />
              </ListItemIcon>
              <ListItemText
                primary="Забанить нарушителя"
                secondary="Заблокировать нарушителя"
                sx={{
                  '& .MuiListItemText-primary': {
                    color: 'rgba(255, 255, 255, 0.87)',
                  },
                  '& .MuiListItemText-secondary': {
                    color: 'rgba(255, 255, 255, 0.6)',
                  },
                }}
              />
            </StyledListItem>

            {ticket?.target_type === 'post' && (
              <StyledListItem
                onClick={() => handleActionClick('delete_post')}
              >
                <ListItemIcon>
                  <Delete sx={{ color: '#f44336' }} />
                </ListItemIcon>
                <ListItemText
                  primary="Удалить пост"
                  secondary="Удалить проблемный пост"
                  sx={{
                    '& .MuiListItemText-primary': {
                      color: 'rgba(255, 255, 255, 0.87)',
                    },
                    '& .MuiListItemText-secondary': {
                      color: 'rgba(255, 255, 255, 0.6)',
                    },
                  }}
                />
              </StyledListItem>
            )}
          </List>
        ) : (
          renderActionForm()
        )}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleClose}
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
            '&:hover': {
              background: 'rgba(255, 255, 255, 0.05)',
            },
          }}
        >
          Закрыть
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default TicketActionsModal; 