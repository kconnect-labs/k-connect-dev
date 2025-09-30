import React, { useState, useEffect } from 'react';
import {
  TextField,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Divider,
  Avatar,
} from '@mui/material';
import {
  FactCheck as FactCheckIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { FactModalProps, FactFormData } from './types';
import UniversalModal from '../../UIKIT/UniversalModal';
import ModalButtonContainer from './ModalButtonContainer';

const FactModal: React.FC<FactModalProps> = ({
  open,
  onClose,
  onSubmit,
  onDelete,
  loading,
  error,
  existingFact,
  postId,
}) => {
  const [formData, setFormData] = useState<FactFormData>({
    who_provided: '',
    explanation_text: '',
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Заполняем форму данными существующего факта при открытии модалки
  useEffect(() => {
    if (open) {
      if (existingFact) {
        setFormData({
          who_provided: existingFact.who_provided || '',
          explanation_text: existingFact.explanation_text || '',
        });
      } else {
        setFormData({
          who_provided: '',
          explanation_text: '',
        });
      }
      setShowDeleteConfirm(false);
    }
  }, [open, existingFact]);

  const handleInputChange = (field: keyof FactFormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = () => {
    if (!formData.who_provided.trim() || !formData.explanation_text.trim()) {
      return;
    }
    onSubmit(formData);
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete();
    } else {
      setShowDeleteConfirm(true);
    }
  };

  const isFormValid =
    formData.who_provided.trim() && formData.explanation_text.trim();

  return (
    <UniversalModal
      open={open}
      onClose={onClose}
      title={existingFact ? 'Редактировать факт' : 'Добавить факт'}
      maxWidth="md"
      fullWidth
      addBottomPadding
    >
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Avatar
          sx={{
            backgroundColor: 'rgba(110, 90, 157, 0.2)',
            color: '#6e5a9d',
            width: 60,
            height: 60,
            mx: 'auto',
            mb: 2,
          }}
        >
          <FactCheckIcon sx={{ fontSize: 32 }} />
        </Avatar>
        <Typography variant='h6' sx={{ color: '#cfbcfb', fontWeight: 600, mb: 1 }}>
          {existingFact ? 'Редактировать факт' : 'Добавить факт'}
        </Typography>
        <Typography
          variant='body2'
          sx={{
            color: 'rgba(207, 188, 251, 0.8)',
            maxWidth: '80%',
            mx: 'auto',
            lineHeight: 1.5,
          }}
        >
          {existingFact
            ? 'Отредактируйте информацию о проверке фактов для этого поста.'
            : 'Добавьте официальное разъяснение к этому посту для проверки фактов.'}
        </Typography>
      </Box>

      {error && (
        <Alert
          severity='error'
          sx={{
            mb: 3,
            backgroundColor: 'rgba(244, 67, 54, 0.1)',
            border: '1px solid rgba(244, 67, 54, 0.3)',
            color: '#f44336',
            '& .MuiAlert-icon': {
              color: '#f44336',
            },
          }}
        >
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 3 }}>
        <TextField
          label='Кто предоставил разъяснение'
          value={formData.who_provided}
          onChange={handleInputChange('who_provided')}
          fullWidth
          placeholder='например: Министерство здравоохранения РФ'
          disabled={loading}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              borderRadius: 'var(--main-border-radius)',
              '& fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.2)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.3)',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#6e5a9d',
                borderWidth: '2px',
              },
              '& input': {
                color: 'white',
              },
            },
            '& .MuiInputLabel-root': {
              color: 'rgba(255, 255, 255, 0.7)',
              '&.Mui-focused': {
                color: '#6e5a9d',
              },
            },
          }}
        />

        <TextField
          label='Текст разъяснения'
          value={formData.explanation_text}
          onChange={handleInputChange('explanation_text')}
          fullWidth
          multiline
          rows={4}
          placeholder='Введите подробное разъяснение или опровержение...'
          disabled={loading}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(10px)',
              borderRadius: 'var(--main-border-radius)',
              '& fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.2)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.3)',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#6e5a9d',
                borderWidth: '2px',
              },
              '& textarea': {
                color: 'white',
              },
            },
            '& .MuiInputLabel-root': {
              color: 'rgba(255, 255, 255, 0.7)',
              '&.Mui-focused': {
                color: '#6e5a9d',
              },
            },
          }}
        />
      </Box>

      {existingFact && (
        <>
          <Divider sx={{ my: 3, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

          <Box
            sx={{
              p: 2,
              borderRadius: 'var(--main-border-radius)',
              backgroundColor: 'rgba(244, 67, 54, 0.1)',
              border: '1px solid rgba(244, 67, 54, 0.3)',
              mb: 3,
            }}
          >
            <Typography
              variant='subtitle2'
              sx={{
                color: '#f44336',
                mb: 1,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <DeleteIcon fontSize='small' />
              Удаление факта
            </Typography>
            <Typography
              variant='body2'
              sx={{
                color: 'rgba(207, 188, 251, 0.8)',
                mb: 2,
                fontSize: '0.85rem',
              }}
            >
              {showDeleteConfirm
                ? 'Вы уверены, что хотите удалить этот факт? Это действие нельзя отменить.'
                : 'Удалить факт и все связанные с ним данные из этого поста.'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant='outlined'
                color='error'
                onClick={handleDelete}
                disabled={loading}
                startIcon={<DeleteIcon />}
                sx={{
                  borderRadius: 'var(--small-border-radius)',
                  borderColor: showDeleteConfirm ? '#f44336' : 'rgba(244, 67, 54, 0.5)',
                  color: showDeleteConfirm ? '#f44336' : 'rgba(244, 67, 54, 0.8)',
                  '&:hover': {
                    borderColor: '#f44336',
                    backgroundColor: 'rgba(244, 67, 54, 0.1)',
                    color: '#f44336',
                  },
                }}
              >
                {showDeleteConfirm ? 'Подтвердить удаление' : 'Удалить факт'}
              </Button>
              {showDeleteConfirm && (
                <Button
                  variant='text'
                  onClick={() => setShowDeleteConfirm(false)}
                  sx={{
                    color: 'rgba(207, 188, 251, 0.6)',
                    '&:hover': {
                      backgroundColor: 'rgba(207, 188, 251, 0.1)',
                    },
                  }}
                >
                  Отмена
                </Button>
              )}
            </Box>
          </Box>
        </>
      )}

      <ModalButtonContainer>
        <Button
          onClick={onClose}
          disabled={loading}
          variant='outlined'
          sx={{
            color: '#cfbcfb',
            borderColor: 'rgba(207, 188, 251, 0.3)',
            '&:hover': {
              borderColor: '#cfbcfb',
              backgroundColor: 'rgba(207, 188, 251, 0.1)',
            },
          }}
        >
          Отмена
        </Button>

        <Button
          onClick={handleSubmit}
          disabled={loading || !isFormValid}
          variant='contained'
          startIcon={
            loading ? (
              <CircularProgress size={16} color='inherit' />
            ) : existingFact ? (
              <EditIcon />
            ) : (
              <AddIcon />
            )
          }
          sx={{
            backgroundImage: 'linear-gradient(90deg, #6b5d97, #827095)',
            color: 'white',
            '&:hover': {
              opacity: 0.9,
            },
            '&:disabled': {
              color: 'rgba(255,255,255,0.5)',
              backgroundImage: 'none',
              backgroundColor: 'rgba(40, 40, 40, 0.4)',
            },
          }}
        >
          {loading
            ? existingFact
              ? 'Сохранение...'
              : 'Создание...'
            : existingFact
              ? 'Сохранить изменения'
              : 'Создать факт'}
        </Button>
      </ModalButtonContainer>
    </UniversalModal>
  );
};

export default FactModal; 