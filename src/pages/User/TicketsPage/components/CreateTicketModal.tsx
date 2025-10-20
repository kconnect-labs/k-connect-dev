import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  IconButton,
  CircularProgress,
  Alert,
  Skeleton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Close as CloseIcon,
  BugReport,
  ContentPaste,
  Security,
  Report,
  Warning
} from '@mui/icons-material';
import { useTicketActions } from '../hooks/useTicketActions';

interface CreateTicketModalProps {
  open: boolean;
  onClose: () => void;
  onTicketCreated: (ticket: any) => void;
}

// Стилизованные компоненты
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    background: 'rgba(18, 18, 18, 0.95)',
    backdropFilter: 'blur(20px)',
    borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
    borderRadius: theme.spacing(2),
    maxWidth: 600,
    width: '90vw',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    color: 'rgba(255, 255, 255, 0.87)',
    '& fieldset': {
      borderColor: 'rgba(207, 188, 251, 0.3)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(207, 188, 251, 0.5)',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#d0bcff',
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.6)',
    '&.Mui-focused': {
      color: '#d0bcff',
    },
  },
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    color: 'rgba(255, 255, 255, 0.87)',
    '& fieldset': {
      borderColor: 'rgba(207, 188, 251, 0.3)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(207, 188, 251, 0.5)',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#d0bcff',
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.6)',
    '&.Mui-focused': {
      color: '#d0bcff',
    },
  },
  '& .MuiSelect-icon': {
    color: 'rgba(255, 255, 255, 0.6)',
  },
}));

const categories = [
  { value: 'technical', label: 'Техническое', icon: <BugReport /> },
  { value: 'spam', label: 'Спам', icon: <ContentPaste /> },
  { value: 'abuse', label: 'Нарушения', icon: <Security /> },
  { value: 'content', label: 'Контент', icon: <Report /> },
  { value: 'appeal', label: 'Апелляция', icon: <Warning /> },
  { value: 'other', label: 'Другое', icon: <Report /> },
];

const priorities = [
  { value: 'low', label: 'Низкий' },
  { value: 'medium', label: 'Средний' },
  { value: 'high', label: 'Высокий' },
  { value: 'urgent', label: 'Срочный' },
];

const CreateTicketModal: React.FC<CreateTicketModalProps> = ({
  open,
  onClose,
  onTicketCreated
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other',
    priority: 'medium',
    target_type: '',
    target_id: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { createTicket } = useTicketActions();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Заголовок обязателен';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Заголовок должен содержать минимум 5 символов';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Описание обязательно';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Описание должно содержать минимум 10 символов';
    }

    if (formData.target_type && !formData.target_id) {
      newErrors.target_id = 'Укажите ID цели';
    }

    if (formData.target_id && !formData.target_type) {
      newErrors.target_type = 'Укажите тип цели';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const ticketData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        priority: formData.priority,
        ...(formData.target_type && formData.target_id && {
          target_type: formData.target_type,
          target_id: parseInt(formData.target_id),
        }),
      };

      const ticket = await createTicket(ticketData);
      onTicketCreated(ticket);
      
      // Сбрасываем форму
      setFormData({
        title: '',
        description: '',
        category: 'other',
        priority: 'medium',
        target_type: '',
        target_id: '',
      });
      setErrors({});
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Произошла ошибка при создании тикета');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      onClose();
      // Сбрасываем форму при закрытии
      setFormData({
        title: '',
        description: '',
        category: 'other',
        priority: 'medium',
        target_type: '',
        target_id: '',
      });
      setErrors({});
      setSubmitError(null);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Очищаем ошибку для этого поля
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <StyledDialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ 
        color: 'rgba(255, 255, 255, 0.87)',
        borderBottom: '1px solid rgb(24 24 24)',
        pb: 2
      }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" component="div">
            Создать тикет
          </Typography>
          <IconButton
            onClick={handleClose}
            disabled={submitting}
            sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {submitError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {submitError}
          </Alert>
        )}

        <Box display="flex" flexDirection="column" gap={3}>
          {/* Заголовок */}
          <StyledTextField
            label="Заголовок тикета"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            error={!!errors.title}
            helperText={errors.title}
            disabled={submitting}
            fullWidth
          />

          {/* Описание */}
          <StyledTextField
            label="Описание проблемы"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            error={!!errors.description}
            helperText={errors.description}
            disabled={submitting}
            multiline
            rows={4}
            fullWidth
          />

          {/* Категория и приоритет */}
          <Box display="flex" gap={2}>
            <StyledFormControl fullWidth error={!!errors.category}>
              <InputLabel>Категория</InputLabel>
              <Select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                disabled={submitting}
                label="Категория"
              >
                {categories.map((category) => (
                  <MenuItem key={category.value} value={category.value}>
                    <Box display="flex" alignItems="center" gap={1}>
                      {category.icon}
                      {category.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </StyledFormControl>

            <StyledFormControl fullWidth error={!!errors.priority}>
              <InputLabel>Приоритет</InputLabel>
              <Select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                disabled={submitting}
                label="Приоритет"
              >
                {priorities.map((priority) => (
                  <MenuItem key={priority.value} value={priority.value}>
                    {priority.label}
                  </MenuItem>
                ))}
              </Select>
            </StyledFormControl>
          </Box>

          {/* Цель тикета (опционально) */}
          <Box>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 2 }}>
              Цель тикета (опционально)
            </Typography>
            <Box display="flex" gap={2}>
              <StyledTextField
                label="Тип цели"
                value={formData.target_type}
                onChange={(e) => handleInputChange('target_type', e.target.value)}
                error={!!errors.target_type}
                helperText={errors.target_type}
                disabled={submitting}
                placeholder="post, user, comment, etc."
                sx={{ flex: 1 }}
              />
              <StyledTextField
                label="ID цели"
                value={formData.target_id}
                onChange={(e) => handleInputChange('target_id', e.target.value)}
                error={!!errors.target_id}
                helperText={errors.target_id}
                disabled={submitting}
                placeholder="123"
                type="number"
                sx={{ flex: 1 }}
              />
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ 
        p: 3, 
        borderTop: '1px solid rgb(24 24 24)' 
      }}>
        <Button
          onClick={handleClose}
          disabled={submitting}
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
            borderColor: 'rgba(255, 255, 255, 0.3)',
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
          onClick={handleSubmit}
          disabled={submitting || !formData.title.trim() || !formData.description.trim()}
          sx={{
            background: 'linear-gradient(45deg, #cfbcfb 30%, #827095 90%)',
            color: 'white',
            '&:hover': {
              background: 'linear-gradient(45deg, #b8a8e8 30%, #6b5b7a 90%)',
            },
            '&:disabled': {
              background: 'rgb(24 24 24)',
              color: 'rgba(255, 255, 255, 0.3)',
            },
          }}
        >
          {submitting ? (
            <CircularProgress size={20} sx={{ color: 'white' }} />
          ) : (
            'Создать тикет'
          )}
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default CreateTicketModal; 