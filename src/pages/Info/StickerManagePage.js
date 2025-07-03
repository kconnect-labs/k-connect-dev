import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  CardMedia,
  Grid,
  IconButton,
  Chip,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  Tooltip,
  Fab,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
  Tabs,
  Tab,
  Paper,
  LinearProgress,
  List,
  ListItem
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Upload as UploadIcon,
  Close as CloseIcon,
  MoreVert as MoreVertIcon,
  Folder as FolderIcon,
  Image as ImageIcon,
  Movie as MovieIcon,
  EmojiEmotions as EmojiIcon,
  Public as PublicIcon,
  Lock as LockIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SEO from '../../components/SEO';
import { useMessenger } from '../../contexts/MessengerContext';

// API URL для мессенджера
const API_URL = 'https://k-connect.ru/apiMes';

// Стили для компонентов
const cardStyles = {
  background: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  borderRadius: '8px',
  color: 'inherit'
};

const buttonStyles = {
  borderRadius: '8px',
  background: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  color: 'inherit',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.08)',
  }
};

const StickerManagePage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Используем MessengerContext для правильной авторизации
  const { sessionKey, isChannel, loading: messengerLoading } = useMessenger();
  
  // Логируем состояние для отладки
  useEffect(() => {
    console.log('StickerManagePage: MessengerContext state:', {
      hasSessionKey: !!sessionKey,
      sessionKeyLength: sessionKey?.length || 0,
      isChannel,
      messengerLoading
    });
  }, [sessionKey, isChannel, messengerLoading]);
  
  // Состояния
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [stickerDialogOpen, setStickerDialogOpen] = useState(false);
  const [selectedPack, setSelectedPack] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [initialized, setInitialized] = useState(false);
  
  // Состояние для управления вкладками в диалоге
  const [tabValue, setTabValue] = useState(0);
  
  // Состояние для диалога управления стикерами
  const [manageStickersOpen, setManageStickersOpen] = useState(false);
  
  // Состояния для публичных стикерпаков
  const [mainTab, setMainTab] = useState(0); // 0 - Мои паки, 1 - Публичные
  const [publicPacks, setPublicPacks] = useState([]);
  const [publicLoading, setPublicLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [installingPacks, setInstallingPacks] = useState(new Set());
  
  // Формы
  const [packForm, setPackForm] = useState({
    name: '',
    description: '',
    is_public: false
  });
  
  const [stickerForm, setStickerForm] = useState({
    name: '',
    emoji: '',
    file: null,
    preview: null
  });

  // Новое состояние для мультизагрузки стикеров
  const [multiStickerForm, setMultiStickerForm] = useState({
    files: [],
    previews: [],
    uploading: false,
    uploadResults: null
  });

  // Проверяем доступность для каналов
  useEffect(() => {
    if (isChannel) {
      setError('Каналы не могут создавать стикерпаки');
      setLoading(false);
      return;
    }
  }, [isChannel]);

  // Функция для создания заголовков авторизации
  const getAuthHeaders = useCallback(() => {
    console.log('getAuthHeaders called, sessionKey:', sessionKey ? 'present' : 'missing');
    
    if (!sessionKey) {
      console.error('No session key available');
      return null;
    }
    
    const headers = {
      'Authorization': `Bearer ${sessionKey}`,
      'Content-Type': 'application/json'
    };
    
    console.log('Generated auth headers:', { 
      Authorization: `Bearer ${sessionKey.substring(0, 10)}...`,
      'Content-Type': 'application/json'
    });
    
    return headers;
  }, [sessionKey]);

  // Загрузка стикерпаков
  const loadPacks = useCallback(async () => {
    if (isChannel) {
      setLoading(false);
      return;
    }
    
    if (!sessionKey) {
      console.log('Waiting for session key...');
      setLoading(false); // Останавливаем загрузку если нет sessionKey
      setError('Необходима авторизация');
      return;
    }
    
    try {
      setLoading(true);
      setError(''); // Очищаем предыдущие ошибки
      
      const headers = getAuthHeaders();
      if (!headers) {
        setLoading(false);
        return;
      }

      console.log('Loading sticker packs with session key:', sessionKey ? 'present' : 'missing');
      
      const response = await axios.get(`${API_URL}/messenger/sticker-packs/my`, {
        headers
      });
      
      console.log('Sticker packs response:', response.data);
      
      if (response.data.success) {
        setPacks(response.data.packs || []);
      } else {
        setError(response.data.error || 'Ошибка загрузки стикерпаков');
      }
    } catch (error) {
      console.error('Error loading sticker packs:', error);
      if (error.response?.status === 401) {
        setError('Ошибка авторизации. Попробуйте войти в систему заново.');
      } else {
        setError('Ошибка загрузки стикерпаков');
      }
    } finally {
      setLoading(false);
    }
  }, [isChannel, sessionKey]); // Убираем getAuthHeaders из зависимостей

  // Инициализация - загружаем данные только когда есть sessionKey и пользователь не канал
  useEffect(() => {
    console.log('StickerManagePage useEffect triggered:', { 
      sessionKey: !!sessionKey, 
      isChannel, 
      initialized
    });
    
    // Предотвращаем повторную инициализацию
    if (initialized) {
      return;
    }
    
    if (isChannel) {
      setError('Каналы не могут создавать стикерпаки');
      setInitialized(true);
      return;
    }
    
    if (sessionKey) {
      console.log('Session key available, loading sticker packs...');
      setInitialized(true);
      loadPacks();
    } else {
      console.log('No session key available yet, waiting...');
      // Не устанавливаем initialized = true, ждем появления sessionKey
    }
  }, [sessionKey, isChannel, initialized]); // Используем initialized вместо messengerLoading

  // Создание стикерпака
  const handleCreatePack = async () => {
    if (isChannel) return;
    
    if (!packForm.name.trim()) {
      setError('Название стикерпака не может быть пустым');
      return;
    }

    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      const response = await axios.post(`${API_URL}/messenger/sticker-packs`, packForm, {
        headers
      });

      if (response.data.success) {
        setSuccess('Стикерпак успешно создан');
        setCreateDialogOpen(false);
        setPackForm({ name: '', description: '', is_public: false });
        loadPacks();
      } else {
        setError(response.data.error || 'Ошибка создания стикерпака');
      }
    } catch (error) {
      console.error('Error creating pack:', error);
      if (error.response?.status === 401) {
        setError('Ошибка авторизации. Попробуйте войти в систему заново.');
      } else {
        setError('Ошибка создания стикерпака');
      }
    }
  };

  // Редактирование стикерпака
  const handleEditPack = async () => {
    if (!selectedPack || isChannel) return;

    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      const response = await axios.put(`${API_URL}/messenger/sticker-packs/${selectedPack.id}`, packForm, {
        headers
      });

      if (response.data.success) {
        setSuccess('Стикерпак успешно обновлен');
        setEditDialogOpen(false);
        loadPacks();
      } else {
        setError(response.data.error || 'Ошибка обновления стикерпака');
      }
    } catch (error) {
      console.error('Error updating pack:', error);
      if (error.response?.status === 401) {
        setError('Ошибка авторизации. Попробуйте войти в систему заново.');
      } else {
        setError('Ошибка обновления стикерпака');
      }
    }
  };

  // Удаление стикерпака
  const handleDeletePack = async (packId) => {
    if (isChannel) return;
    
    if (!window.confirm('Вы уверены, что хотите удалить стикерпак? Это действие нельзя отменить.')) {
      return;
    }

    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      const response = await axios.delete(`${API_URL}/messenger/sticker-packs/${packId}`, {
        headers
      });

      if (response.data.success) {
        setSuccess('Стикерпак удален');
        loadPacks();
      } else {
        setError(response.data.error || 'Ошибка удаления стикерпака');
      }
    } catch (error) {
      console.error('Error deleting pack:', error);
      if (error.response?.status === 401) {
        setError('Ошибка авторизации. Попробуйте войти в систему заново.');
      } else {
        setError('Ошибка удаления стикерпака');
      }
    }
  };

  // Добавление стикера
  const handleAddSticker = async () => {
    if (isChannel) return;
    
    if (!stickerForm.name.trim() || !stickerForm.file) {
      setError('Заполните название и выберите файл');
      return;
    }

    const formData = new FormData();
    formData.append('name', stickerForm.name);
    formData.append('emoji', stickerForm.emoji);
    formData.append('file', stickerForm.file);

    try {
      if (!sessionKey) {
        setError('Отсутствует токен авторизации');
        return;
      }

      const response = await axios.post(`${API_URL}/messenger/sticker-packs/${selectedPack.id}/stickers`, formData, {
        headers: {
          'Authorization': `Bearer ${sessionKey}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setSuccess('Стикер добавлен');
        setStickerDialogOpen(false);
        setStickerForm({ name: '', emoji: '', file: null, preview: null });
        loadPacks();
      } else {
        setError(response.data.error || 'Ошибка добавления стикера');
      }
    } catch (error) {
      console.error('Error adding sticker:', error);
      if (error.response?.status === 401) {
        setError('Ошибка авторизации. Попробуйте войти в систему заново.');
      } else {
        setError('Ошибка добавления стикера');
      }
    }
  };

  // Удаление стикера
  const handleDeleteSticker = async (packId, stickerId) => {
    if (isChannel) return;
    
    if (!window.confirm('Удалить стикер?')) return;

    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      const response = await axios.delete(`${API_URL}/messenger/sticker-packs/${packId}/stickers/${stickerId}`, {
        headers
      });

      if (response.data.success) {
        setSuccess('Стикер удален');
        loadPacks();
      } else {
        setError(response.data.error || 'Ошибка удаления стикера');
      }
    } catch (error) {
      console.error('Error deleting sticker:', error);
      if (error.response?.status === 401) {
        setError('Ошибка авторизации. Попробуйте войти в систему заново.');
      } else {
        setError('Ошибка удаления стикера');
      }
    }
  };

  // Обработка файла
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Проверка типа файла
    const allowedTypes = ['image/webp', 'video/webm', 'image/png', 'image/jpeg'];
    if (!allowedTypes.includes(file.type)) {
      setError('Поддерживаются только файлы WEBP, WEBM, PNG, JPEG');
      return;
    }

    // Проверка размера
    if (file.size > 1024 * 1024) { // 1MB
      setError('Размер файла не должен превышать 1MB');
      return;
    }

    setStickerForm(prev => ({
      ...prev,
      file,
      preview: URL.createObjectURL(file)
    }));
  };

  // Обработка множественных файлов
  const handleMultiFileChange = (event) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;

    if (files.length > 20) {
      setError('Можно выбрать максимум 20 файлов за раз');
      return;
    }

    const allowedTypes = ['image/webp', 'video/webm', 'image/png', 'image/jpeg'];
    const validFiles = [];
    const previews = [];
    let hasErrors = false;

    files.forEach(file => {
      if (!allowedTypes.includes(file.type)) {
        setError(`Файл ${file.name} имеет неподдерживаемый тип`);
        hasErrors = true;
        return;
      }

      if (file.size > 1024 * 1024) {
        setError(`Файл ${file.name} превышает размер 1MB`);
        hasErrors = true;
        return;
      }

      validFiles.push(file);
      
      // Генерируем название из имени файла
      const baseName = file.name.replace(/\.[^/.]+$/, ""); // Убираем расширение
      const stickerName = baseName
        .replace(/[_-]/g, ' ') // Заменяем _ и - на пробелы
        .replace(/\s+/g, ' ') // Убираем лишние пробелы
        .trim()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' '); // Делаем Title Case
      
      previews.push({
        file: file,
        url: URL.createObjectURL(file),
        name: file.name,
        stickerName: stickerName.substring(0, 30), // Ограничиваем длину
        emoji: '',
        id: Date.now() + Math.random() // Уникальный ID для каждого превью
      });
    });

    if (!hasErrors && validFiles.length > 0) {
      setMultiStickerForm(prev => ({
        ...prev,
        files: validFiles,
        previews: previews,
        uploadResults: null
      }));
      setError('');
    }
  };

  // Удаление файла из превью
  const removeFileFromPreview = (index) => {
    setMultiStickerForm(prev => {
      // Освобождаем URL объект
      if (prev.previews[index]) {
        URL.revokeObjectURL(prev.previews[index].url);
      }
      
      return {
        ...prev,
        files: prev.files.filter((_, i) => i !== index),
        previews: prev.previews.filter((_, i) => i !== index),
        uploadResults: null
      };
    });
  };

  // Обновление названия стикера
  const updateStickerName = (index, newName) => {
    setMultiStickerForm(prev => ({
      ...prev,
      previews: prev.previews.map((preview, i) => 
        i === index ? { ...preview, stickerName: newName.substring(0, 30) } : preview
      )
    }));
  };

  // Обновление эмодзи стикера
  const updateStickerEmoji = (index, newEmoji) => {
    setMultiStickerForm(prev => ({
      ...prev,
      previews: prev.previews.map((preview, i) => 
        i === index ? { ...preview, emoji: newEmoji.substring(0, 10) } : preview
      )
    }));
  };

  // Массовая загрузка стикеров
  const handleBulkUpload = async () => {
    if (isChannel) return;
    
    if (!multiStickerForm.files.length) {
      setError('Выберите файлы для загрузки');
      return;
    }

    // Проверяем, что у всех стикеров есть названия
    const emptyNames = multiStickerForm.previews.filter(preview => !preview.stickerName.trim());
    if (emptyNames.length > 0) {
      setError('Все стикеры должны иметь название');
      return;
    }

    setMultiStickerForm(prev => ({ ...prev, uploading: true }));
    setError('');
    setSuccess('');

    try {
      if (!sessionKey) {
        setError('Отсутствует токен авторизации');
        return;
      }

      // Загружаем стикеры по одному с индивидуальными названиями
      const results = [];
      
      for (let i = 0; i < multiStickerForm.files.length; i++) {
        const file = multiStickerForm.files[i];
        const preview = multiStickerForm.previews[i];
        
        try {
          const formData = new FormData();
          formData.append('name', preview.stickerName.trim());
          formData.append('emoji', preview.emoji.trim());
          formData.append('file', file);

          const response = await axios.post(
            `${API_URL}/messenger/sticker-packs/${selectedPack.id}/stickers`, 
            formData, 
            {
              headers: {
                'Authorization': `Bearer ${sessionKey}`,
                'Content-Type': 'multipart/form-data'
              }
            }
          );

          if (response.data.success) {
            results.push({
              filename: file.name,
              success: true,
              sticker_id: response.data.sticker_id,
              name: preview.stickerName
            });
          } else {
            results.push({
              filename: file.name,
              success: false,
              error: response.data.error || 'Неизвестная ошибка'
            });
          }
        } catch (error) {
          results.push({
            filename: file.name,
            success: false,
            error: error.response?.data?.error || 'Ошибка загрузки'
          });
        }
      }
      
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);
      
      setMultiStickerForm(prev => ({
        ...prev,
        uploadResults: {
          success: true,
          successful_uploads: successful.length,
          failed_uploads: failed.length,
          total_files: results.length,
          successful_files: successful,
          failed_files: failed
        }
      }));
      
      if (failed.length === 0) {
        setSuccess(`Все ${successful.length} стикеров успешно загружены!`);
      } else {
        setSuccess(`Загружено ${successful.length} из ${results.length} стикеров`);
        if (failed.length > 0) {
          setError(`Не удалось загрузить ${failed.length} файлов`);
        }
      }
      
      // Обновляем список стикерпаков
      loadPacks();
      
      // Очищаем форму если все загружено успешно
      if (failed.length === 0) {
        setTimeout(() => {
          // Освобождаем URL объекты
          multiStickerForm.previews.forEach(preview => {
            URL.revokeObjectURL(preview.url);
          });
          
          setMultiStickerForm({
            files: [],
            previews: [],
            uploading: false,
            uploadResults: null
          });
          setStickerDialogOpen(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Error in bulk upload:', error);
      if (error.response?.status === 401) {
        setError('Ошибка авторизации. Попробуйте войти в систему заново.');
      } else {
        setError('Ошибка массовой загрузки стикеров');
      }
    } finally {
      setMultiStickerForm(prev => ({ ...prev, uploading: false }));
    }
  };

  // Открытие диалога редактирования
  const openEditDialog = (pack) => {
    setSelectedPack(pack);
    setPackForm({
      name: pack.name,
      description: pack.description || '',
      is_public: pack.is_public || false
    });
    setEditDialogOpen(true);
    setMenuAnchor(null);
  };

  // Открытие диалога добавления стикера
  const openStickerDialog = (pack) => {
    setSelectedPack(pack);
    setStickerDialogOpen(true);
    setMenuAnchor(null);
  };

  // Закрытие диалога стикеров с очисткой состояния
  const closeStickerDialog = () => {
    // Освобождаем URL объекты
    multiStickerForm.previews.forEach(preview => {
      URL.revokeObjectURL(preview.url);
    });
    
    // Очищаем состояния
    setMultiStickerForm({
      files: [],
      previews: [],
      uploading: false,
      uploadResults: null
    });
    
    setStickerForm({
      name: '',
      emoji: '',
      file: null,
      preview: null
    });
    
    setStickerDialogOpen(false);
    setError('');
    setSuccess('');
  };

  // Открытие диалога управления стикерами
  const openManageStickers = (pack) => {
    setSelectedPack(pack);
    setManageStickersOpen(true);
    setMenuAnchor(null);
  };

  // Загрузка публичных стикерпаков
  const loadPublicPacks = useCallback(async () => {
    try {
      setPublicLoading(true);
      setError('');
      
      const params = new URLSearchParams();
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }
      
      const url = `${API_URL}/messenger/sticker-packs/public${params.toString() ? '?' + params.toString() : ''}`;
      
      const response = await axios.get(url);
      
      if (response.data.success) {
        setPublicPacks(response.data.packs || []);
      } else {
        setError('Ошибка загрузки публичных стикерпаков');
      }
    } catch (error) {
      console.error('Error loading public packs:', error);
      setError('Ошибка загрузки публичных стикерпаков');
    } finally {
      setPublicLoading(false);
    }
  }, [searchQuery]);

  // Установка стикерпака
  const handleInstallPack = async (packId) => {
    if (isChannel) return;
    
    if (installingPacks.has(packId)) return; // Уже устанавливается
    
    try {
      setInstallingPacks(prev => new Set([...prev, packId]));
      
      const headers = getAuthHeaders();
      if (!headers) return;
      
      const response = await axios.post(`${API_URL}/messenger/sticker-packs/${packId}/install`, {}, {
        headers
      });
      
      if (response.data.success) {
        setSuccess('Стикерпак добавлен в вашу коллекцию');
        // Обновляем список ваших паков
        loadPacks();
      } else {
        setError(response.data.error || 'Ошибка установки стикерпака');
      }
    } catch (error) {
      console.error('Error installing pack:', error);
      if (error.response?.status === 401) {
        setError('Ошибка авторизации. Попробуйте войти в систему заново.');
      } else {
        setError('Ошибка установки стикерпака');
      }
    } finally {
      setInstallingPacks(prev => {
        const newSet = new Set(prev);
        newSet.delete(packId);
        return newSet;
      });
    }
  };

  // Поиск публичных стикерпаков
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Загрузка публичных паков при смене вкладки или поиска
  useEffect(() => {
    if (mainTab === 1) { // Вкладка "Публичные"
      loadPublicPacks();
    }
  }, [mainTab, loadPublicPacks]);

  // Дебаунс для поиска
  useEffect(() => {
    if (mainTab === 1) { // Только для вкладки "Публичные"
      const debounceTimer = setTimeout(() => {
        loadPublicPacks();
      }, 500); // 500мс задержка

      return () => clearTimeout(debounceTimer);
    }
  }, [searchQuery, mainTab, loadPublicPacks]);

  // Если инициализированы но нет sessionKey - пользователь не авторизован
  if (initialized && !sessionKey && !isChannel) {
    return (
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        <Alert severity="warning" sx={cardStyles}>
          Необходима авторизация для управления стикерпаками. 
          <Button onClick={() => window.location.href = '/login'} sx={{ ml: 2 }}>
            Войти
          </Button>
        </Alert>
      </Box>
    );
  }
  
  if (!initialized && !isChannel) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ ml: 2 }}>
          Откройте сначала мессенджер и после вернитесь сюда...
        </Typography>
      </Box>
    );
  }
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ ml: 2 }}>
          Загрузка стикерпаков...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <SEO 
        title="Управление стикерпаками - K-Connect"
        description="Создание и редактирование стикерпаков для мессенджера K-Connect"
      />

      {/* Заголовок */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={() => navigate(-1)} sx={buttonStyles}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant={isMobile ? 'h5' : 'h4'} gutterBottom>
            Управление стикерпаками
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Создавайте и редактируйте свои стикерпаки для мессенджера
          </Typography>
        </Box>
      </Box>

      {/* Алерты */}
      {error && (
        <Alert severity="error" sx={{ mb: 2, ...cardStyles }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2, ...cardStyles }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Главные вкладки */}
      <Box sx={{ mb: 3 }}>
        <Tabs
          value={mainTab}
          onChange={(e, newValue) => setMainTab(newValue)}
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: 'primary.main'
            }
          }}
        >
          <Tab label="Мои стикерпаки" />
          <Tab label="Публичные стикерпаки" />
        </Tabs>
      </Box>

      {/* Поиск для публичных стикерпаков */}
      {mainTab === 1 && (
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Поиск публичных стикерпаков..."
            value={searchQuery}
            onChange={handleSearchChange}
            sx={cardStyles}
            InputProps={{
              style: { color: 'inherit' }
            }}
          />
        </Box>
      )}

      {/* Список стикерпаков */}
      {mainTab === 0 ? (
        // Вкладка "Мои стикерпаки"
        <>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {packs.map((pack) => (
                <Grid item xs={12} sm={6} md={4} key={pack.id}>
                  <Card sx={cardStyles}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" gutterBottom>
                            {pack.name}
                          </Typography>
                          {pack.description && (
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              {pack.description}
                            </Typography>
                          )}
                        </Box>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            setSelectedPack(pack);
                            setMenuAnchor(e.currentTarget);
                          }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Box>

                      {/* Статус */}
                      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <Chip
                          size="small"
                          icon={pack.is_public ? <PublicIcon /> : <LockIcon />}
                          label={pack.is_public ? 'Публичный' : 'Приватный'}
                          variant="outlined"
                        />
                        <Chip
                          size="small"
                          label={`${pack.stickers?.length || 0} стикеров`}
                          variant="outlined"
                        />
                      </Box>

                      {/* Превью стикеров */}
                      {pack.stickers && pack.stickers.length > 0 && (
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                          {pack.stickers.slice(0, 4).map((sticker) => (
                            <Box
                              key={sticker.id}
                              sx={{
                                width: 40,
                                height: 40,
                                ...cardStyles,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden',
                                position: 'relative',
                                '&:hover .delete-btn': {
                                  opacity: 1
                                }
                              }}
                            >
                              <img
                                src={sticker.url}
                                alt={sticker.name}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover'
                                }}
                              />
                              <IconButton
                                className="delete-btn"
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSticker(pack.id, sticker.id);
                                }}
                                sx={{
                                  position: 'absolute',
                                  top: -2,
                                  right: -2,
                                  width: 16,
                                  height: 16,
                                  bgcolor: 'error.main',
                                  color: 'white',
                                  opacity: 0,
                                  transition: 'opacity 0.2s',
                                  '&:hover': {
                                    bgcolor: 'error.dark'
                                  }
                                }}
                              >
                                <CloseIcon sx={{ fontSize: 12 }} />
                              </IconButton>
                            </Box>
                          ))}
                          {pack.stickers.length > 4 && (
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                ...cardStyles,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <Typography variant="caption">
                                +{pack.stickers.length - 4}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      )}

                      {/* Действия */}
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          startIcon={<AddIcon />}
                          onClick={() => openStickerDialog(pack)}
                          sx={buttonStyles}
                        >
                          Добавить стикер
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}

              {/* Карточка создания нового пака */}
              <Grid item xs={12} sm={6} md={4}>
                <Card
                  sx={{
                    ...cardStyles,
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.08)',
                    }
                  }}
                  onClick={() => setCreateDialogOpen(true)}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <FolderIcon sx={{ fontSize: 48, mb: 2, color: 'text.secondary' }} />
                    <Typography variant="h6" gutterBottom>
                      Создать стикерпак
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Нажмите, чтобы создать новый стикерпак
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </>
      ) : (
        // Вкладка "Публичные стикерпаки"
        <>
          {publicLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {publicPacks.map((pack) => (
                <Grid item xs={12} sm={6} md={4} key={pack.id}>
                  <Card sx={cardStyles}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" gutterBottom>
                            {pack.name}
                          </Typography>
                          {pack.description && (
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              {pack.description}
                            </Typography>
                          )}
                          <Typography variant="caption" color="text.secondary">
                            Автор: {pack.owner_name}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Статус */}
                      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <Chip
                          size="small"
                          icon={<PublicIcon />}
                          label="Публичный"
                          variant="outlined"
                        />
                        <Chip
                          size="small"
                          label={`${pack.sticker_count || 0} стикеров`}
                          variant="outlined"
                        />
                      </Box>

                      {/* Превью стикеров */}
                      {pack.stickers && pack.stickers.length > 0 && (
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                          {pack.stickers.slice(0, 4).map((sticker) => (
                            <Box
                              key={sticker.id}
                              sx={{
                                width: 40,
                                height: 40,
                                ...cardStyles,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden'
                              }}
                            >
                              <img
                                src={sticker.url}
                                alt={sticker.name}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover'
                                }}
                              />
                            </Box>
                          ))}
                          {pack.sticker_count > 4 && (
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                ...cardStyles,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <Typography variant="caption">
                                +{pack.sticker_count - 4}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      )}

                      {/* Действия */}
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          startIcon={installingPacks.has(pack.id) ? <CircularProgress size={16} /> : <AddIcon />}
                          onClick={() => handleInstallPack(pack.id)}
                          disabled={installingPacks.has(pack.id) || isChannel}
                          sx={buttonStyles}
                        >
                          {installingPacks.has(pack.id) ? 'Устанавливается...' : 'Установить стикерпак'}
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}

              {publicPacks.length === 0 && !publicLoading && (
                <Grid item xs={12}>
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <EmojiIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Публичных стикерпаков не найдено
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {searchQuery ? 'Попробуйте другой поисковый запрос' : 'Пока что никто не создал публичных стикерпаков'}
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          )}
        </>
      )}

      {/* Меню действий */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        PaperProps={{ sx: cardStyles }}
      >
        <MenuItem onClick={() => openEditDialog(selectedPack)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Редактировать</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => openStickerDialog(selectedPack)}>
          <ListItemIcon>
            <AddIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Добавить стикер</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => openManageStickers(selectedPack)}>
          <ListItemIcon>
            <ImageIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Управлять стикерами</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleDeletePack(selectedPack?.id)} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Удалить пак</ListItemText>
        </MenuItem>
      </Menu>

      {/* Диалог создания стикерпака */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: cardStyles }}
      >
        <DialogTitle>
          Создать новый стикерпак
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Название стикерпака"
            fullWidth
            value={packForm.name}
            onChange={(e) => setPackForm(prev => ({ ...prev, name: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Описание (необязательно)"
            fullWidth
            multiline
            rows={2}
            value={packForm.description}
            onChange={(e) => setPackForm(prev => ({ ...prev, description: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={packForm.is_public}
                onChange={(e) => setPackForm(prev => ({ ...prev, is_public: e.target.checked }))}
              />
            }
            label="Публичный стикерпак"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>
            Отмена
          </Button>
          <Button onClick={handleCreatePack} variant="contained">
            Создать
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог редактирования стикерпака */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: cardStyles }}
      >
        <DialogTitle>
          Редактировать стикерпак
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Название стикерпака"
            fullWidth
            value={packForm.name}
            onChange={(e) => setPackForm(prev => ({ ...prev, name: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Описание (необязательно)"
            fullWidth
            multiline
            rows={2}
            value={packForm.description}
            onChange={(e) => setPackForm(prev => ({ ...prev, description: e.target.value }))}
            sx={{ mb: 2 }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={packForm.is_public}
                onChange={(e) => setPackForm(prev => ({ ...prev, is_public: e.target.checked }))}
              />
            }
            label="Публичный стикерпак"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>
            Отмена
          </Button>
          <Button onClick={handleEditPack} variant="contained">
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Новый диалог с мультизагрузкой */}
      <Dialog
        open={stickerDialogOpen}
        onClose={closeStickerDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: cardStyles }}
      >
        <DialogTitle>
          Добавить стикеры в "{selectedPack?.name}"
        </DialogTitle>
        <DialogContent>
          {/* Загрузка файлов */}
          <Box sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadIcon />}
              fullWidth
              sx={buttonStyles}
            >
              Выбрать файлы (WEBP, WEBM, PNG, JPEG)
              <input
                type="file"
                hidden
                accept=".webp,.webm,.png,.jpeg,.jpg"
                multiple
                onChange={handleMultiFileChange}
              />
            </Button>
          </Box>

          {/* Превью выбранных файлов */}
          {multiStickerForm.previews.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Выбранные стикеры ({multiStickerForm.previews.length})
              </Typography>
              
              <Box sx={{ maxHeight: '400px', overflowY: 'auto' }}>
                {multiStickerForm.previews.map((preview, index) => (
                  <Card key={preview.id} sx={{ ...cardStyles, mb: 2, p: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                      {/* Превью изображения */}
                      <Grid item xs={12} sm={3} md={2}>
                        <Box
                          sx={{
                            width: '100%',
                            aspectRatio: '1',
                            ...cardStyles,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            position: 'relative'
                          }}
                        >
                          <img
                            src={preview.url}
                            alt={preview.name}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain'
                            }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => removeFileFromPreview(index)}
                            sx={{
                              position: 'absolute',
                              top: 4,
                              right: 4,
                              bgcolor: 'error.main',
                              color: 'white',
                              width: 24,
                              height: 24,
                              '&:hover': {
                                bgcolor: 'error.dark'
                              }
                            }}
                          >
                            <CloseIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Box>
                      </Grid>
                      
                      {/* Поля ввода */}
                      <Grid item xs={12} sm={9} md={10}>
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <Typography variant="caption" color="text.secondary">
                              Файл: {preview.name}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} md={8}>
                            <TextField
                              fullWidth
                              label="Название стикера"
                              value={preview.stickerName}
                              onChange={(e) => updateStickerName(index, e.target.value)}
                              variant="outlined"
                              size="small"
                              inputProps={{ maxLength: 30 }}
                              helperText={`${preview.stickerName.length}/30`}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  ...cardStyles
                                }
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <TextField
                              fullWidth
                              label="Эмодзи (необязательно)"
                              value={preview.emoji}
                              onChange={(e) => updateStickerEmoji(index, e.target.value)}
                              variant="outlined"
                              size="small"
                              inputProps={{ maxLength: 10 }}
                              helperText={`${preview.emoji.length}/10`}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  ...cardStyles
                                }
                              }}
                            />
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Card>
                ))}
              </Box>
            </Box>
          )}

          {/* Результаты загрузки */}
          {multiStickerForm.uploadResults && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Результаты загрузки
              </Typography>
              
              {multiStickerForm.uploadResults.successful_files?.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="success.main" gutterBottom>
                    ✅ Успешно загружено ({multiStickerForm.uploadResults.successful_files.length}):
                  </Typography>
                  <List dense>
                    {multiStickerForm.uploadResults.successful_files.map((file, index) => (
                      <ListItem key={index} sx={{ py: 0.5 }}>
                        <Typography variant="body2" color="success.main">
                          • {file.name} → "{file.filename}"
                        </Typography>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
              
              {multiStickerForm.uploadResults.failed_files?.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" color="error.main" gutterBottom>
                    ❌ Ошибки загрузки ({multiStickerForm.uploadResults.failed_files.length}):
                  </Typography>
                  <List dense>
                    {multiStickerForm.uploadResults.failed_files.map((file, index) => (
                      <ListItem key={index} sx={{ py: 0.5 }}>
                        <Typography variant="body2" color="error.main">
                          • {file.filename}: {file.error}
                        </Typography>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Box>
          )}

          <Typography variant="caption" color="text.secondary">
            Поддерживаемые форматы: WEBP, WEBM, PNG, JPEG. Максимальный размер: 1MB.
            PNG автоматически конвертируется в WEBP.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeStickerDialog}>
            Отмена
          </Button>
          <Button 
            onClick={handleBulkUpload} 
            variant="contained"
            disabled={multiStickerForm.uploading || multiStickerForm.files.length === 0}
            startIcon={multiStickerForm.uploading ? <CircularProgress size={16} /> : <UploadIcon />}
          >
            {multiStickerForm.uploading ? 'Загружается...' : `Загрузить ${multiStickerForm.files.length} стикеров`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог управления стикерами */}
      <Dialog
        open={manageStickersOpen}
        onClose={() => setManageStickersOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: cardStyles }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Управление стикерами "{selectedPack?.name}"</span>
            <IconButton onClick={() => setManageStickersOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedPack?.stickers && selectedPack.stickers.length > 0 ? (
            <Grid container spacing={2}>
              {selectedPack.stickers.map((sticker) => (
                <Grid item xs={6} sm={4} md={3} key={sticker.id}>
                  <Card sx={{ ...cardStyles, position: 'relative' }}>
                    <CardMedia
                      component="img"
                      image={sticker.url}
                      alt={sticker.name}
                      sx={{ 
                        height: 100,
                        objectFit: 'contain',
                        p: 1
                      }}
                    />
                    <CardContent sx={{ p: 1, pb: '8px !important' }}>
                      <Typography variant="caption" noWrap title={sticker.name}>
                        {sticker.name}
                      </Typography>
                      {sticker.emoji && (
                        <Typography variant="caption" display="block" color="text.secondary">
                          {sticker.emoji}
                        </Typography>
                      )}
                    </CardContent>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteSticker(selectedPack.id, sticker.id)}
                      sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        bgcolor: 'error.main',
                        color: 'white',
                        '&:hover': {
                          bgcolor: 'error.dark'
                        }
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <ImageIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                В этом стикерпаке пока нет стикеров
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Добавьте стикеры, чтобы начать их использовать в чатах
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setManageStickersOpen(false);
                  openStickerDialog(selectedPack);
                }}
              >
                Добавить стикеры
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            startIcon={<AddIcon />}
            onClick={() => {
              setManageStickersOpen(false);
              openStickerDialog(selectedPack);
            }}
          >
            Добавить стикеры
          </Button>
          <Button onClick={() => setManageStickersOpen(false)}>
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StickerManagePage; 