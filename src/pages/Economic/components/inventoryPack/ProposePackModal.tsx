import React, { useState, useRef } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  FormControlLabel,
  Switch,
  Chip,
  IconButton,
  Grid,
  Paper,
  Alert,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  CloudUpload as UploadIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import UniversalModal from '../../../../UIKIT/UniversalModal';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const UploadArea = styled(Box)(({ theme }) => ({
  border: '2px dashed rgba(255, 255, 255, 0.2)',
  borderRadius: 12,
  padding: theme.spacing(3),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  background: 'var(--theme-background, rgba(255, 255, 255, 0.02))',
  '&:hover': {
    borderColor: 'rgba(255, 255, 255, 0.4)',
    background: 'var(--theme-background, rgba(255, 255, 255, 0.05))',
  },
  '@media (max-width: 768px)': {
    padding: theme.spacing(2),
  },
}));

const FilePreview = styled(Box)(({ theme }) => ({
  position: 'relative',
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

const ItemNameInput = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    background: 'var(--theme-background, rgba(255, 255, 255, 0.02))',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    '&:hover': {
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    '&.Mui-focused': {
      borderColor: 'rgba(255, 255, 255, 0.4)',
    },
  },
  '& .MuiInputLabel-root': {
    color: 'text.secondary',
  },
  '& .MuiInputBase-input': {
    color: 'text.primary',
  },
}));

interface FileWithPreview {
  file: File;
  preview: string;
  itemName: string;
}

interface ProposePackModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ProposePackModal: React.FC<ProposePackModalProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    displayName: '',
    description: '',
    price: '',
    isLimited: false,
    maxQuantity: '',
  });

  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    
    if (selectedFiles.length + files.length > 20) {
      setError('Максимум 20 файлов');
      return;
    }

    const newFiles: FileWithPreview[] = selectedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      itemName: file.name.replace(/\.[^/.]+$/, ''), // Убираем расширение
    }));

    setFiles(prev => [...prev, ...newFiles]);
    setError('');
  };

  const handleRemoveFile = (index: number) => {
    const fileToRemove = files[index];
    URL.revokeObjectURL(fileToRemove.preview);
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleItemNameChange = (index: number, name: string) => {
    setFiles(prev => prev.map((file, i) => 
      i === index ? { ...file, itemName: name } : file
    ));
  };

  const validateForm = () => {
    if (!formData.displayName.trim()) {
      setError('Введите название пака');
      return false;
    }
    if (formData.displayName.length < 3) {
      setError('Название должно содержать минимум 3 символа');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Введите описание пака');
      return false;
    }
    if (formData.description.length < 10) {
      setError('Описание должно содержать минимум 10 символов');
      return false;
    }
    if (!formData.price || parseInt(formData.price) < 1000 || parseInt(formData.price) > 50000) {
      setError('Цена должна быть от 1000 до 50000 баллов');
      return false;
    }
    if (formData.isLimited && (!formData.maxQuantity || parseInt(formData.maxQuantity) < 10 || parseInt(formData.maxQuantity) > 1000)) {
      setError('Лимит должен быть от 10 до 1000 штук');
      return false;
    }
    if (files.length < 5) {
      setError('Необходимо загрузить минимум 5 изображений');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('display_name', formData.displayName);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('is_limited', formData.isLimited.toString());
      if (formData.isLimited) {
        formDataToSend.append('max_quantity', formData.maxQuantity);
      }

      files.forEach((fileData, index) => {
        formDataToSend.append('files', fileData.file);
        formDataToSend.append(`item_name_${index}`, fileData.itemName);
      });

      const response = await fetch('/api/inventory/propose-pack', {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (data.success) {
        onSuccess?.();
        onClose();
        // Очищаем форму
        setFormData({
          displayName: '',
          description: '',
          price: '',
          isLimited: false,
          maxQuantity: '',
        });
        files.forEach(file => URL.revokeObjectURL(file.preview));
        setFiles([]);
      } else {
        setError(data.message || 'Ошибка при отправке предложения');
      }
    } catch (err) {
      setError('Ошибка сети');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Очищаем превью файлов
    files.forEach(file => URL.revokeObjectURL(file.preview));
    setFiles([]);
    setError('');
    onClose();
  };

  return (
    <UniversalModal
      open={open}
      onClose={handleClose}
      title="Предложить новый пак"
      maxWidth="md"
      fullWidth
    >
      <Box sx={{ p: isMobile ? 0 : 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={isMobile ? 2 : 3}>
          {/* Основная информация */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontSize: isMobile ? '1.1rem' : '1.25rem' }}>
              Основная информация
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 1.5 : 2 }}>
              <ItemNameInput
                label="Название пака"
                value={formData.displayName}
                onChange={(e) => handleInputChange('displayName', e.target.value)}
                placeholder="Введите название пака"
                fullWidth
                size={isMobile ? "small" : "medium"}
              />

              <ItemNameInput
                label="Описание"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Опишите содержимое пака"
                multiline
                rows={isMobile ? 2 : 3}
                fullWidth
                size={isMobile ? "small" : "medium"}
              />

              <ItemNameInput
                label="Цена (баллы)"
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                placeholder="1000-50000"
                fullWidth
                size={isMobile ? "small" : "medium"}
                inputProps={{ min: 1000, max: 50000 }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isLimited}
                    onChange={(e) => handleInputChange('isLimited', e.target.checked)}
                  />
                }
                label="Лимитированный пак"
                sx={{ fontSize: isMobile ? '0.9rem' : '1rem' }}
              />

              {formData.isLimited && (
                <ItemNameInput
                  label="Лимит (штук)"
                  type="number"
                  value={formData.maxQuantity}
                  onChange={(e) => handleInputChange('maxQuantity', e.target.value)}
                  placeholder="10-1000"
                  fullWidth
                  size={isMobile ? "small" : "medium"}
                  inputProps={{ min: 10, max: 1000 }}
                />
              )}
            </Box>
          </Grid>

          {/* Загрузка файлов */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, fontSize: isMobile ? '1.1rem' : '1.25rem' }}>
              Изображения предметов ({files.length}/20)
            </Typography>

            {files.length === 0 ? (
              <UploadArea onClick={() => fileInputRef.current?.click()}>
                <UploadIcon sx={{ fontSize: isMobile ? 36 : 48, color: 'text.secondary', mb: 1 }} />
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: isMobile ? '0.9rem' : '1rem' }}>
                  Нажмите для загрузки файлов
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: isMobile ? '0.75rem' : '0.75rem' }}>
                  PNG, JPG, JPEG, GIF, SVG (5-20 файлов)
                </Typography>
                <VisuallyHiddenInput
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                />
              </UploadArea>
            ) : (
              <Box>
                <Box sx={{ 
                  display: 'flex', 
                  gap: isMobile ? 0.5 : 1, 
                  mb: 2, 
                  flexWrap: 'wrap',
                  justifyContent: isMobile ? 'center' : 'flex-start'
                }}>
                  {files.map((fileData, index) => (
                    <Paper
                      key={index}
                      sx={{
                        p: isMobile ? 0.5 : 1,
                        background: 'var(--theme-background, rgba(255, 255, 255, 0.05))',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: 2,
                        position: 'relative',
                        width: isMobile ? 'calc(50% - 4px)' : 'auto',
                        minWidth: isMobile ? '120px' : 'auto',
                      }}
                    >
                      <FilePreview sx={{ width: isMobile ? 60 : 80, height: isMobile ? 60 : 80 }}>
                        <img src={fileData.preview} alt={fileData.itemName} />
                      </FilePreview>
                      <ItemNameInput
                        size="small"
                        value={fileData.itemName}
                        onChange={(e) => handleItemNameChange(index, e.target.value)}
                        placeholder="Название предмета"
                        sx={{ 
                          mt: 1, 
                          minWidth: isMobile ? '100%' : 120,
                          '& .MuiInputBase-input': {
                            fontSize: isMobile ? '0.8rem' : '0.875rem',
                          }
                        }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveFile(index)}
                        sx={{
                          position: 'absolute',
                          top: isMobile ? -4 : -8,
                          right: isMobile ? -4 : -8,
                          background: 'rgba(255, 0, 0, 0.8)',
                          color: 'white',
                          width: isMobile ? 20 : 24,
                          height: isMobile ? 20 : 24,
                          '&:hover': {
                            background: 'rgba(255, 0, 0, 1)',
                          },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Paper>
                  ))}
                </Box>

                {files.length < 20 && (
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => fileInputRef.current?.click()}
                    sx={{ 
                      mt: 1,
                      fontSize: isMobile ? '0.85rem' : '0.875rem',
                      py: isMobile ? 0.5 : 1,
                    }}
                  >
                    Добавить файлы
                  </Button>
                )}

                <VisuallyHiddenInput
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                />
              </Box>
            )}
          </Grid>
        </Grid>

        {/* Кнопки */}
        <Box sx={{ 
          display: 'flex', 
          gap: isMobile ? 1 : 2, 
          mt: 3, 
          justifyContent: isMobile ? 'stretch' : 'flex-end',
          flexDirection: isMobile ? 'column' : 'row'
        }}>
          <Button
            variant="outlined"
            onClick={handleClose}
            disabled={loading}
            sx={{
              fontSize: isMobile ? '0.9rem' : '0.875rem',
              py: isMobile ? 1.5 : 1,
            }}
          >
            Отмена
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || files.length < 5}
            startIcon={loading ? <CircularProgress size={isMobile ? 14 : 16} /> : <ImageIcon />}
            sx={{
              fontSize: isMobile ? '0.9rem' : '0.875rem',
              py: isMobile ? 1.5 : 1,
            }}
          >
            {loading ? 'Отправка...' : 'Предложить пак'}
          </Button>
        </Box>
      </Box>
    </UniversalModal>
  );
};

export default ProposePackModal; 