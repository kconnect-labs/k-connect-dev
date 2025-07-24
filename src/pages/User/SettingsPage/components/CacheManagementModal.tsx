import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Dialog,
  DialogContent,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
  Button,
  Checkbox,
  FormControlLabel,
  LinearProgress,
  Chip,
  Alert,
} from '@mui/material';
import {
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  Storage,
  Delete,
  Refresh,
  Person,
  Image,
  Article,
  Chat,
  MusicNote,
  Message,
} from '@mui/icons-material';
import { getCacheInfo, clearCache, getFileTypeStats, getFileTypeSizes, getFolderStats, isSupported } from '../../../../services/cacheManager';

interface CacheCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  size: number;
  selected: boolean;
}

interface CacheManagementModalProps {
  open: boolean;
  onClose: () => void;
}

const CacheManagementModal: React.FC<CacheManagementModalProps> = ({
  open,
  onClose,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [cacheInfo, setCacheInfo] = useState<any>(null);
  const [fileTypeStats, setFileTypeStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<CacheCategory[]>([]);

  const loadCacheInfo = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [info, stats, sizes, folders] = await Promise.all([
        getCacheInfo(),
        getFileTypeStats(),
        getFileTypeSizes(),
        getFolderStats(),
      ]);
      
      setCacheInfo(info);
      setFileTypeStats(stats);
      
      // Создаем категории на основе папок и типов файлов
      const newCategories: CacheCategory[] = [
        {
          id: 'images',
          name: 'Фотографии',
          icon: <Image />,
          color: '#FF6B35',
          size: (sizes.jpg || 0) + (sizes.jpeg || 0) + (sizes.png || 0) + (sizes.gif || 0) + (sizes.webp || 0),
          selected: true,
        },
        {
          id: 'avatars',
          name: 'Аватары',
          icon: <Person />,
          color: '#96CEB4',
          size: folders.avatars || 0,
          selected: true,
        },
        {
          id: 'posts',
          name: 'Посты',
          icon: <Article />,
          color: '#45B7D1',
          size: folders.posts || 0,
          selected: true,
        },
        {
          id: 'comments',
          name: 'Комментарии',
          icon: <Chat />,
          color: '#FF6B9D',
          size: folders.comments || 0,
          selected: true,
        },
        {
          id: 'inventory',
          name: 'Инвентарь',
          icon: <Storage />,
          color: '#FF6B6B',
          size: folders.inventory || 0,
          selected: true,
        },
        {
          id: 'badges',
          name: 'Бейджи',
          icon: <Message />,
          color: '#9B59B6',
          size: folders.badges || 0,
          selected: true,
        },
        {
            id: 'videos',
            name: 'Видео',
            icon: <Article />,
            color: '#4ECDC4',
            size: (sizes.mp4 || 0) + (sizes.webm || 0) + (sizes.ogg || 0),
            selected: true,
          },
          {
            id: 'audio',
            name: 'Аудио',
            icon: <MusicNote />,
            color: '#45B7D1',
            size: (sizes.mp3 || 0) + (sizes.wav || 0),
            selected: true,
          },
      ];
      
      setCategories(newCategories);
    } catch (err) {
      setError('Не удалось загрузить информацию о кеше');
      console.error('Failed to load cache info:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = async () => {
    setClearing(true);
    setError(null);
    
    try {
      const success = await clearCache();
      if (success) {
        await loadCacheInfo();
      } else {
        setError('Не удалось очистить кеш');
      }
    } catch (err) {
      setError('Ошибка при очистке кеша');
      console.error('Failed to clear cache:', err);
    } finally {
      setClearing(false);
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    setCategories(prev => 
      prev.map(cat => 
        cat.id === categoryId 
          ? { ...cat, selected: !cat.selected }
          : cat
      )
    );
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Б';
    
    const k = 1024;
    const sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const calculateTotalSize = (): number => {
    return categories.reduce((total, cat) => total + cat.size, 0);
  };

  const calculateSelectedSize = (): number => {
    return categories
      .filter(cat => cat.selected)
      .reduce((total, cat) => total + cat.size, 0);
  };

  const getSelectedCategories = () => {
    return categories.filter(cat => cat.selected);
  };

  const renderPieChart = () => {
    const selectedCategories = getSelectedCategories();
    const selectedTotalSize = calculateSelectedSize();
    
    if (selectedTotalSize === 0) {
      return (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Box
            sx={{
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              position: 'relative',
            }}
          >
            <Typography variant="h6" color="text.secondary">
              Нет выбранных
            </Typography>
          </Box>
        </motion.div>
      );
    }

    let currentAngle = 0;
    const radius = 80;
    const centerX = 100;
    const centerY = 100;

    return (
      <Box sx={{ position: 'relative', width: 200, height: 200 }}>
        <svg width="200" height="200" viewBox="0 0 200 200">
          {categories
            .filter(category => category.size > 0)
            .map((category, index) => {
              const isSelected = category.selected;
              const percentage = selectedTotalSize > 0 ? (category.size / selectedTotalSize) : 0;
              const angle = isSelected ? percentage * 360 : 0;
              const startAngle = currentAngle;
              currentAngle += angle;

              const startRad = (startAngle - 90) * (Math.PI / 180);
              const endRad = (startAngle + angle - 90) * (Math.PI / 180);

              const x1 = centerX + radius * Math.cos(startRad);
              const y1 = centerY + radius * Math.sin(startRad);
              const x2 = centerX + radius * Math.cos(endRad);
              const y2 = centerY + radius * Math.sin(endRad);

              const largeArcFlag = angle > 180 ? 1 : 0;

              const pathData = [
                `M ${centerX} ${centerY}`,
                `L ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z'
              ].join(' ');

              return (
                <motion.path
                  key={category.id}
                  d={pathData}
                  fill={category.color}
                  stroke="rgba(255, 255, 255, 0.15)"
                  strokeWidth="3"
                  animate={{ 
                    opacity: isSelected ? 1 : 0.3,
                    scale: isSelected ? 1 : 0.8
                  }}
                  transition={{ 
                    duration: 0.4,
                    type: "spring",
                    stiffness: 200,
                    damping: 15
                  }}
                  style={{
                    filter: isSelected 
                      ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' 
                      : 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))',
                  }}
                />
              );
            })}
        </svg>
        
        {/* Центральный текст */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            background: 'rgba(0, 0, 0, 0.9)',
            borderRadius: '50%',
            width: 80,
            height: 80,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          <motion.div
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              duration: 0.3,
              type: "spring",
              stiffness: 200,
              damping: 15
            }}
          >
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Typography variant="h6" sx={{ fontSize: '0.9rem', fontWeight: 600, color: 'white' }}>
                {formatBytes(selectedTotalSize)}
              </Typography>
            </motion.div>
          </motion.div>
        </Box>
      </Box>
    );
  };

  useEffect(() => {
    if (open) {
      loadCacheInfo();
    }
  }, [open]);

  if (!isSupported()) {
    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: isMobile ? 0 : 2,
          },
        }}
      >
        <DialogContent sx={{ p: 3 }}>
          <Alert severity="warning">
            Ваш браузер не поддерживает кеширование медиа контента
          </Alert>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: isMobile ? 0 : 1,
          minHeight: isMobile ? '100vh' : 600,
          maxWidth: isMobile ? '100%' : 400,

        },
      }}
    >
      {/* Заголовок */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {isMobile && (
            <IconButton onClick={onClose} sx={{ mr: 1 }}>
              <ArrowBackIcon />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Управление хранилищем
          </Typography>
        </Box>
        {!isMobile && (
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      <DialogContent sx={{ p: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <LinearProgress sx={{ width: '100%' }} />
          </Box>
        ) : (
          <Box>
            {/* Круговая диаграмма */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
              {renderPieChart()}
            </Box>

            {/* Информация об использовании */}
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Использование памяти
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Выбрано {formatBytes(calculateSelectedSize())} из {formatBytes(calculateTotalSize())} кэша
              </Typography>
              

            </Box>

            {/* Инструкция */}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Нажмите на категорию, чтобы выбрать или отменить выбор для очистки
            </Typography>

            {/* Список категорий */}
            <Box sx={{ mb: 4 }}>
              {categories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ 
                    x: 0, 
                    opacity: category.selected ? 1 : 0.6,
                    scale: category.selected ? 1 : 0.98
                  }}
                  transition={{ 
                    duration: 0.4, 
                    delay: 0.1 + index * 0.1,
                    type: "spring",
                    stiffness: 100
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      p: 1.5,
                      mb: 1,
                      background: category.selected 
                        ? 'rgba(255, 255, 255, 0.08)' 
                        : 'rgba(255, 255, 255, 0.03)',
                      borderRadius: 1,
                      border: category.selected 
                        ? `1px solid ${category.color}40` 
                        : '1px solid rgba(255, 255, 255, 0.05)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: category.selected 
                          ? 'rgba(255, 255, 255, 0.12)' 
                          : 'rgba(255, 255, 255, 0.06)',
                        transform: 'translateX(4px)',
                      },
                    }}
                    onClick={() => handleCategoryToggle(category.id)}
                  >
                    <motion.div
                      animate={{
                        scale: category.selected ? 1.05 : 1,
                        opacity: category.selected ? 1 : 0.7
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 28,
                          height: 28,
                          borderRadius: 0.5,
                          background: category.color,
                          mr: 1.5,
                        }}
                      >
                        <Box sx={{ 
                          fontSize: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '100%',
                          height: '100%',
                          '& svg': {
                            width: '16px',
                            height: '16px'
                          }
                        }}>
                          {category.icon}
                        </Box>
                      </Box>
                    </motion.div>

                    <Box sx={{ flex: 1 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 500,
                          color: category.selected ? 'white' : 'rgba(255, 255, 255, 0.8)',
                          fontSize: '0.875rem'
                        }}
                      >
                        {category.name}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{
                          color: category.selected ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.5)',
                          fontSize: '0.75rem'
                        }}
                      >
                        {formatBytes(category.size)}
                      </Typography>
                    </Box>

                    <motion.div
                      animate={{
                        scale: category.selected ? 1.1 : 1
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <Checkbox
                        checked={category.selected}
                        sx={{
                          color: category.color,
                          '&.Mui-checked': {
                            color: category.color,
                          },
                          '& .MuiSvgIcon-root': {
                            fontSize: 18,
                          }
                        }}
                      />
                    </motion.div>
                  </Box>
                </motion.div>
              ))}
            </Box>

            {/* Кнопки действий */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <motion.div
                animate={{
                  scale: calculateSelectedSize() > 0 ? 1 : 0.95,
                  opacity: calculateSelectedSize() > 0 ? 1 : 0.7
                }}
                transition={{ duration: 0.3 }}
              >
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  startIcon={<Delete />}
                  onClick={handleClearCache}
                  disabled={clearing || calculateSelectedSize() === 0}
                  sx={{
                    background: calculateSelectedSize() > 0 
                      ? 'rgb(192, 169, 247)'
                      : 'rgba(255, 255, 255, 0.1)',
                    color: 'white',
                    py: 1.5,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: calculateSelectedSize() > 0
                        ? 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
                        : 'rgba(255, 255, 255, 0.15)',
                      transform: calculateSelectedSize() > 0 ? 'translateY(-2px)' : 'none',
                      boxShadow: calculateSelectedSize() > 0 
                        ? '0 8px 25px rgba(102, 126, 234, 0.4)' 
                        : 'none',
                    },
                  }}
                >
                  {clearing ? 'Очистка...' : `Очистить выбранное (${formatBytes(calculateSelectedSize())})`}
                </Button>
              </motion.div>

              <motion.div
                animate={{
                  scale: calculateTotalSize() > 0 ? 1 : 0.95,
                  opacity: calculateTotalSize() > 0 ? 1 : 0.7
                }}
                transition={{ duration: 0.3 }}
              >
                <Button
                  variant="outlined"
                  fullWidth
                  size="large"
                  startIcon={<Delete />}
                  onClick={handleClearCache}
                  disabled={clearing || calculateTotalSize() === 0}
                  sx={{
                    borderColor: calculateTotalSize() > 0 
                      ? 'rgba(255, 255, 255, 0.3)' 
                      : 'rgba(255, 255, 255, 0.1)',
                    color: calculateTotalSize() > 0 
                      ? 'rgba(255, 255, 255, 0.8)' 
                      : 'rgba(255, 255, 255, 0.4)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: calculateTotalSize() > 0 
                        ? 'rgba(255, 255, 255, 0.5)' 
                        : 'rgba(255, 255, 255, 0.2)',
                      background: calculateTotalSize() > 0 
                        ? 'rgba(255, 255, 255, 0.05)' 
                        : 'rgba(255, 255, 255, 0.02)',
                      transform: calculateTotalSize() > 0 ? 'translateY(-1px)' : 'none',
                    },
                  }}
                >
                  Очистить весь кэш ({formatBytes(calculateTotalSize())})
                </Button>
              </motion.div>
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CacheManagementModal; 