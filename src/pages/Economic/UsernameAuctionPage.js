import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Divider,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  List,
  ListItem,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Tabs,
  Tab,
  Avatar,
  IconButton,
  Snackbar,
  Badge,
  alpha,
  useTheme,
  InputAdornment,
  Fade,
  useMediaQuery,
  Stack,
  ListItemText,
  ListItemAvatar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import GavelIcon from '@mui/icons-material/Gavel';
import TagIcon from '@mui/icons-material/Tag';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PersonIcon from '@mui/icons-material/Person';
import HistoryIcon from '@mui/icons-material/History';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import CloseIcon from '@mui/icons-material/Close';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import format from 'date-fns/format';
import { ru } from 'date-fns/locale';

// Styled components
const PageHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginBottom: theme.spacing(4),
  textAlign: 'center',
}));

const AuctionCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  marginBottom: theme.spacing(2),
  overflow: 'hidden',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  background: theme.palette.mode === 'dark' 
    ? alpha(theme.palette.background.paper, 0.8)
    : alpha(theme.palette.background.paper, 0.9),
  backdropFilter: 'blur(10px)',
  border: theme.palette.mode === 'dark' 
    ? '1px solid rgba(255, 255, 255, 0.1)'
    : '1px solid rgba(208, 188, 255, 0.3)',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 12px 40px -12px rgba(0,0,0,0.3)',
  },
}));

const SearchBar = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  '& .MuiOutlinedInput-root': {
    borderRadius: 30,
    backgroundColor: theme.palette.mode === 'dark' 
      ? alpha(theme.palette.background.paper, 0.6)
      : alpha(theme.palette.background.paper, 0.7),
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s',
    '&:hover': {
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    },
    '&.Mui-focused': {
      boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
    }
  }
}));

const EmptyStateBox = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(6, 2),
  background: theme.palette.mode === 'dark' 
    ? alpha(theme.palette.background.paper, 0.4)
    : alpha(theme.palette.background.paper, 0.7),
  backdropFilter: 'blur(10px)',
  borderRadius: 16,
  boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
  border: theme.palette.mode === 'dark' 
    ? '1px solid rgba(255, 255, 255, 0.08)'
    : '1px solid rgba(208, 188, 255, 0.2)',
}));

const StatusChip = styled(Chip)(({ theme, status }) => {
  let statusColor = theme.palette.primary.main;
  
  if (status === 'active') {
    statusColor = theme.palette.success.main;
  } else if (status === 'cancelled') {
    statusColor = theme.palette.error.main;
  } else if (status === 'completed') {
    statusColor = theme.palette.primary.main;
  }
  
  return {
    borderRadius: 12,
    fontWeight: 600,
    fontSize: '0.75rem',
    backgroundColor: alpha(statusColor, 0.15),
    color: statusColor,
    border: `1px solid ${alpha(statusColor, 0.3)}`,
    '& .MuiChip-label': {
      padding: '0 8px',
    }
  };
});

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`tabpanel-${index}`}
    aria-labelledby={`tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);

const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    borderRadius: 16,
    background: theme.palette.mode === 'dark' 
      ? 'rgba(18, 18, 18, 0.8)' 
      : 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    border: theme.palette.mode === 'dark' 
      ? '1px solid rgba(255, 255, 255, 0.1)'
      : '1px solid rgba(208, 188, 255, 0.3)',
  }
}));

const DetailDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    borderRadius: theme.shape.borderRadius,
    [theme.breakpoints.down('sm')]: {
      margin: 0,
      width: '100%',
      maxHeight: '100%',
      height: '100%',
      maxWidth: '100%',
      borderRadius: 0,
    },
    background: theme.palette.mode === 'dark' 
      ? alpha(theme.palette.background.paper, 0.95)
      : alpha(theme.palette.background.paper, 0.95),
    backdropFilter: 'blur(8px)',
  }
}));

const BidHistoryItem = styled(ListItem)(({ theme, isWinning }) => ({
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(1),
  background: isWinning 
    ? alpha(theme.palette.success.main, 0.1)
    : alpha(theme.palette.background.paper, 0.5),
  border: isWinning
    ? `1px solid ${alpha(theme.palette.success.main, 0.3)}`
    : `1px solid ${alpha(theme.palette.divider, 0.1)}`,
}));

const UsernameAuctionPage = () => {
  const { user } = useContext(AuthContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(true);
  const [auctions, setAuctions] = useState([]);
  const [filteredAuctions, setFilteredAuctions] = useState([]);
  const [userAuctions, setUserAuctions] = useState([]);
  const [userBids, setUserBids] = useState([]);
  const [usernames, setUsernames] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [bidDialogOpen, setBidDialogOpen] = useState(false);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [detailAuction, setDetailAuction] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [loadingButtons, setLoadingButtons] = useState({
    bid: false,
    buy: null,
    accept: null,
    cancel: null,
    create: false
  });
  const [newAuctionData, setNewAuctionData] = useState({
    username: '',
    min_price: '',
    duration_hours: 24
  });
  const [bidAmount, setBidAmount] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [errors, setErrors] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [sessionActive, setSessionActive] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  const sessionStartTime = useRef(Date.now());
  const broadcastChannel = useRef(null);
  const lastFetchTime = useRef(null);
  const updateInterval = useRef(null);
  const SESSION_TIMEOUT = 60 * 60 * 1000; // 1 hour in milliseconds
  const MIN_UPDATE_INTERVAL = 15000; // Minimum 15 seconds between updates across tabs

  // Initialize broadcast channel for cross-tab communication
  useEffect(() => {
    // Check if BroadcastChannel is supported
    if (typeof BroadcastChannel !== 'undefined') {
      broadcastChannel.current = new BroadcastChannel('username_auction_channel');
      
      // Set up listener for messages from other tabs
      broadcastChannel.current.onmessage = (event) => {
        const { type, data, timestamp } = event.data;
        
        // Check if the data is newer than our last update
        if (!lastFetchTime.current || timestamp > lastFetchTime.current) {
          lastFetchTime.current = timestamp;
          
          // Update relevant state based on message type
          if (type === 'auctions') {
            setAuctions(data.auctions || []);
            setFilteredAuctions(data.auctions || []);
          } else if (type === 'user_auctions') {
            setUserAuctions(data.active_auctions || []);
          } else if (type === 'transaction_complete') {
            // Обработка завершенных транзакций от других вкладок
            console.log(`Получено уведомление о транзакции: ${data.type} для аукциона ${data.auctionId}`);
            
            // Обновляем данные в зависимости от типа транзакции
            if (data.type === 'buy_now' || data.type === 'accept_bid' || data.type === 'place_bid') {
              // Загружаем свежие данные с сервера
              fetchAuctions(true); // silent = true
              fetchUserAuctions(true); // silent = true
              
              // Если у нас открыт диалог детализации для затронутого аукциона, обновляем его
              if (detailAuction && detailAuction.id === data.auctionId) {
                handleOpenAuctionDetail(detailAuction);
              }
              
              // Показываем уведомление, если транзакция была не от текущей вкладки
              if (data.source !== 'current_tab') {
                setSnackbar({
                  open: true,
                  message: 'Данные аукционов были обновлены',
                  severity: 'info'
                });
              }
            }
          }
        }
      };
    }
    
    return () => {
      if (broadcastChannel.current) {
        broadcastChannel.current.close();
      }
    };
  }, []);

  // Session expiration check
  useEffect(() => {
    const checkSessionExpiration = () => {
      const currentTime = Date.now();
      const sessionDuration = currentTime - sessionStartTime.current;
      
      if (sessionDuration >= SESSION_TIMEOUT && !sessionExpired) {
        setSessionExpired(true);
        setSessionActive(false);
        
        // Show notification to reload
        setSnackbar({
          open: true,
          message: 'Сессия устарела. Пожалуйста, обновите страницу для получения актуальных данных.',
          severity: 'warning'
        });
        
        // Clear any active intervals
        if (updateInterval.current) {
          clearInterval(updateInterval.current);
          updateInterval.current = null;
        }
      }
    };
    
    // Check every minute
    const expirationInterval = setInterval(checkSessionExpiration, 60000);
    
    return () => clearInterval(expirationInterval);
  }, [sessionExpired]);

  // Fetch active auctions
  useEffect(() => {
    if (user && sessionActive) {
      fetchAuctions();
      fetchUserAuctions();
      fetchUsernames();
      
      // Set up the auto-refresh interval
      updateInterval.current = setInterval(() => {
        if (sessionActive && document.visibilityState === 'visible') {
          // Only fetch if we are the active tab (or no fetch has happened recently)
          const currentTime = Date.now();
          if (!lastFetchTime.current || (currentTime - lastFetchTime.current) > MIN_UPDATE_INTERVAL) {
            fetchAuctions(true);
            fetchUserAuctions(true);
          }
        }
      }, 30000); // Refresh every 30 seconds
      
      return () => {
        if (updateInterval.current) {
          clearInterval(updateInterval.current);
        }
      };
    }
  }, [user, sessionActive]);

  // Filter auctions when search query changes
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timer = setTimeout(() => {
      if (searchQuery.trim() === '') {
        setFilteredAuctions(auctions);
      } else {
        const query = searchQuery.toLowerCase();
        const filtered = auctions.filter(auction => 
          auction.username.toLowerCase().includes(query) || 
          (auction.seller && auction.seller.username.toLowerCase().includes(query))
        );
        setFilteredAuctions(filtered);
      }
    }, 1500);

    setSearchTimeout(timer);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [searchQuery, auctions]);

  const broadcastUpdate = (type, data) => {
    if (broadcastChannel.current) {
      try {
        // Добавляем информацию об источнике сообщения для отличия транзакций из текущей вкладки
        const message = {
          type,
          data: { ...data, source: 'current_tab' },
          timestamp: Date.now()
        };
        
        broadcastChannel.current.postMessage(message);
        console.log('Отправлено обновление в другие вкладки:', type, message);
      } catch (error) {
        console.error('Ошибка при отправке обновления:', error);
      }
    }
  };

  const fetchAuctions = async (silent = false) => {
    if (!sessionActive) return;
    
    try {
      if (!silent) setLoading(true);
      const response = await axios.get('/api/username/auctions');
      
      // Record the fetch time
      lastFetchTime.current = Date.now();
      
      const auctionsData = response.data.auctions || [];
      setAuctions(auctionsData);
      setFilteredAuctions(auctionsData);
      
      // Broadcast update to other tabs
      broadcastUpdate('auctions', response.data);
    } catch (error) {
      console.error('Error fetching auctions:', error);
      if (!silent) {
        setSnackbar({
          open: true,
          message: 'Не удалось загрузить аукционы',
          severity: 'error'
        });
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const fetchUserAuctions = async (silent = false) => {
    if (!sessionActive) return;
    
    try {
      const response = await axios.get('/api/username/my-auctions');
      
      // Record the fetch time
      lastFetchTime.current = Date.now();
      
      setUserAuctions(response.data.active_auctions || []);
      setUserBids(response.data.my_bids || []);
      
      // Broadcast update to other tabs
      broadcastUpdate('user_auctions', response.data);
    } catch (error) {
      console.error('Error fetching user auctions:', error);
      if (!silent) {
        setSnackbar({
          open: true,
          message: 'Не удалось загрузить информацию о ваших аукционах',
          severity: 'error'
        });
      }
    }
  };

  const fetchUsernames = async (silent = false) => {
    if (!sessionActive) return;
    
    try {
      const response = await axios.get('/api/username/purchased');
      
      // Record the fetch time
      lastFetchTime.current = Date.now();
      
      setUsernames(response.data.usernames || []);
      
      // Broadcast update to other tabs
      broadcastUpdate('usernames', response.data);
    } catch (error) {
      console.error('Error fetching usernames:', error);
      if (!silent) {
        setSnackbar({
          open: true,
          message: 'Не удалось загрузить ваши юзернеймы',
          severity: 'error'
        });
      }
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleCreateAuction = async () => {
    const errors = {};
    if (!newAuctionData.username) errors.username = 'Выберите юзернейм';
    if (!newAuctionData.min_price) {
      errors.min_price = 'Введите минимальную цену';
    } else if (isNaN(newAuctionData.min_price) || parseInt(newAuctionData.min_price) <= 0) {
      errors.min_price = 'Цена должна быть положительным числом';
    } else if (parseInt(newAuctionData.min_price) > 15000) {
      errors.min_price = 'Максимальная начальная цена: 15 000 баллов';
    }
    
    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }
    
    setErrors({});
    setLoadingButtons(prev => ({ ...prev, create: true }));
    
    try {
      const response = await axios.post('/api/username/create-auction', {
        username: newAuctionData.username,
        min_price: parseInt(newAuctionData.min_price),
        duration_hours: parseFloat(newAuctionData.duration_hours)
      });
      
      if (response.data.success) {
        setSnackbar({
          open: true,
          message: 'Аукцион успешно создан!',
          severity: 'success'
        });
        
        // Refresh auctions
        fetchAuctions();
        fetchUserAuctions();
        
        // Close the dialog and reset form
        setCreateDialogOpen(false);
        setNewAuctionData({
          username: '',
          min_price: '',
          duration_hours: 24
        });
      }
    } catch (error) {
      console.error('Error creating auction:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Ошибка при создании аукциона',
        severity: 'error'
      });
    } finally {
      setLoadingButtons(prev => ({ ...prev, create: false }));
    }
  };

  const handlePlaceBid = async () => {
    if (!bidAmount || isNaN(bidAmount) || parseInt(bidAmount) <= 0) {
      setErrors({ bidAmount: 'Введите корректную сумму ставки' });
      return;
    }
    
    setLoadingButtons(prev => ({ ...prev, bid: true }));
    
    if (!selectedAuction) {
      setSnackbar({
        open: true,
        message: 'Не выбран аукцион, обновите страницу',
        severity: 'warning'
      });
      setLoadingButtons(prev => ({ ...prev, bid: false }));
      return;
    }

    const transactionId = `bid-${selectedAuction.id}-${Date.now()}`;
    
    if (localStorage.getItem(transactionId)) {
      console.log('Операция уже выполняется, предотвращение дублирования');
      setLoadingButtons(prev => ({ ...prev, bid: false }));
      return;
    }
    
    localStorage.setItem(transactionId, 'pending');
    
    setErrors({});
    try {
      const response = await axios.post(`/api/username/auctions/${selectedAuction.id}/bid`, {
        amount: parseInt(bidAmount),
        transaction_id: transactionId
      });
      
      if (response.data.success) {
        localStorage.removeItem(transactionId);
        
        lastFetchTime.current = Date.now();
        broadcastUpdate('transaction_complete', { 
          type: 'place_bid', 
          auctionId: selectedAuction.id,
          result: response.data 
        });
        
        setSnackbar({
          open: true,
          message: 'Ставка успешно размещена!',
          severity: 'success'
        });
        
        fetchAuctions();
        fetchUserAuctions();
        
        setBidDialogOpen(false);
        setBidAmount('');
        setSelectedAuction(null);
      }
    } catch (error) {
      console.error('Error placing bid:', error);
      
      localStorage.removeItem(transactionId);
      
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Ошибка при размещении ставки',
        severity: 'error'
      });
    } finally {
      setLoadingButtons(prev => ({ ...prev, bid: false }));
    }
  };

  const handleCancelAuction = async (auctionId) => {
    setLoadingButtons(prev => ({ ...prev, cancel: auctionId }));
    
    try {
      const response = await axios.post(`/api/username/auctions/${auctionId}/cancel`);
      
      if (response.data.success) {
        setSnackbar({
          open: true,
          message: 'Аукцион успешно отменен',
          severity: 'success'
        });
        
        fetchAuctions();
        fetchUserAuctions();
      }
    } catch (error) {
      console.error('Error cancelling auction:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Ошибка при отмене аукциона',
        severity: 'error'
      });
    } finally {
      setLoadingButtons(prev => ({ ...prev, cancel: null }));
    }
  };

  const formatTimeRemaining = (endDate) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffMs = end - now;
    
    if (diffMs <= 0) return "Завершен";
    
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffDays > 0) {
      return `${diffDays} д ${diffHours} ч`;
    } else if (diffHours > 0) {
      return `${diffHours} ч ${diffMinutes} мин`;
    } else {
      return `${diffMinutes} мин`;
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setFilteredAuctions(auctions);
  };

  const handleOpenAuctionDetail = async (auction) => {
    setDetailAuction({ ...auction, bids: [] });
    setDetailDialogOpen(true);
    setDetailLoading(true);
    
    try {
      // Получаем детальную информацию об аукционе
      const response = await axios.get(`/api/username/auctions/${auction.id}`);
      if (response.data.success) {
        setDetailAuction(response.data.auction);
      }
    } catch (error) {
      console.error('Error fetching auction details:', error);
      setSnackbar({
        open: true,
        message: 'Не удалось загрузить детали аукциона',
        severity: 'error'
      });
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseAuctionDetail = () => {
    setDetailDialogOpen(false);
    setTimeout(() => setDetailAuction(null), 300); // Очищаем данные после закрытия анимации
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd MMM yyyy, HH:mm', { locale: ru });
    } catch (e) {
      return dateString;
    }
  };

  const handleBuyNow = async (auctionId) => {
    setLoadingButtons(prev => ({ ...prev, buy: auctionId }));
    
    if (!auctionId) {
      setSnackbar({
        open: true,
        message: 'Не выбран аукцион, обновите страницу',
        severity: 'warning'
      });
      setLoadingButtons(prev => ({ ...prev, buy: null }));
      return;
    }

    const transactionId = `buy-${auctionId}-${Date.now()}`;
    
    if (localStorage.getItem(transactionId)) {
      console.log('Операция уже выполняется, предотвращение дублирования');
      setLoadingButtons(prev => ({ ...prev, buy: null }));
      return;
    }
    
    localStorage.setItem(transactionId, 'pending');
    
    try {
      const response = await axios.post(`/api/username/auctions/${auctionId}/buy-now`, {
        transaction_id: transactionId
      });
      
      if (response.data.success) {
        localStorage.removeItem(transactionId);
        
        lastFetchTime.current = Date.now();
        broadcastUpdate('transaction_complete', { 
          type: 'buy_now', 
          auctionId,
          result: response.data 
        });
        
        setSnackbar({
          open: true,
          message: response.data.message || 'Юзернейм успешно куплен!',
          severity: 'success'
        });
        
        fetchAuctions();
        fetchUserAuctions();
      }
    } catch (error) {
      console.error('Error buying username:', error);
      
      localStorage.removeItem(transactionId);
      
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Ошибка при покупке юзернейма',
        severity: 'error'
      });
    } finally {
      setLoadingButtons(prev => ({ ...prev, buy: null }));
    }
  };

  const handleAcceptBid = async (auction) => {
    if (!auction || !auction.id) return;
    
    setLoadingButtons(prev => ({ ...prev, accept: auction.id }));
    
    if (!auction.id) {
      setSnackbar({
        open: true,
        message: 'Не выбран аукцион, обновите страницу',
        severity: 'warning'
      });
      setLoadingButtons(prev => ({ ...prev, accept: null }));
      return;
    }

    const transactionId = `accept-bid-${auction.id}-${Date.now()}`;
    
    if (localStorage.getItem(transactionId)) {
      console.log('Операция уже выполняется, предотвращение дублирования');
      setLoadingButtons(prev => ({ ...prev, accept: null }));
      return;
    }
    
    localStorage.setItem(transactionId, 'pending');
    
    try {
      const response = await axios.post(`/api/username/auctions/${auction.id}/accept-bid`, {
        transaction_id: transactionId
      });
      
      if (response.data.success) {
        localStorage.removeItem(transactionId);
        
        lastFetchTime.current = Date.now();
        broadcastUpdate('transaction_complete', { 
          type: 'accept_bid', 
          auctionId: auction.id,
          result: response.data 
        });
        
        setSnackbar({
          open: true,
          message: response.data.message || 'Ставка успешно принята!',
          severity: 'success'
        });
        
        fetchAuctions();
        fetchUserAuctions();
      }
    } catch (error) {
      console.error('Error accepting bid:', error);
      
      localStorage.removeItem(transactionId);
      
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Ошибка при принятии ставки',
        severity: 'error'
      });
    } finally {
      setLoadingButtons(prev => ({ ...prev, accept: null }));
    }
  };

  const checkSessionStatus = () => {
    if (isMobile) {
      return true;
    }
    
    if (sessionExpired) {
      console.log('Сессия истекла, запрос отклонен');
      return false;
    }
    
    const currentTime = Date.now();
    if (lastFetchTime.current && (currentTime - lastFetchTime.current) < MIN_UPDATE_INTERVAL) {
      console.log('Последний запрос был слишком недавно, ожидаем...');
      return false;
    }
    
    lastFetchTime.current = currentTime;
    
    if (document.visibilityState !== 'visible') {
      console.log('Страница не видима, запрос отклонен');
      return false;
    }
    
    return true;
  };

  return (
    <Container maxWidth="md" sx={{ py: 4, mb: 10 }}>
      <PageHeader>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Аукцион Юзернеймов
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 2, maxWidth: 600 }}>
          Участвуйте в аукционах на уникальные юзернеймы или выставляйте свои собственные
        </Typography>
      </PageHeader>

      <Box sx={{ 
        mb: 3, 
        display: 'flex', 
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
          sx={{ 
            borderRadius: 2,
            px: 2
          }}
        >
          Выставить юзернейм на аукцион
        </Button>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem',
            }
          }}
        >
          <Tab 
            icon={<GavelIcon />} 
            iconPosition="start" 
            label="Активные аукционы" 
          />
          <Tab 
            icon={<PersonIcon />} 
            iconPosition="start" 
            label="Мои аукционы" 
          />
          <Tab 
            icon={<HistoryIcon />} 
            iconPosition="start" 
            label="Мои ставки" 
          />
        </Tabs>
      </Box>

      {/* Tab contents */}
      <TabPanel value={tabValue} index={0}>
        {tabValue === 0 && (
          <Fade in={true} timeout={500}>
            <Box>
              {/* Info Banner about the new system */}
              <Alert 
                severity="info" 
                sx={{ 
                  mb: 3, 
                  borderRadius: 2,
                  '& .MuiAlert-message': { width: '100%' }
                }}
              >
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Обновление системы аукционов
                </Typography>
                <Typography variant="body2">
                  Теперь при размещении ставки баллы резервируются, а при перебитии возвращаются автоматически.
                  Также появилась возможность досрочного принятия ставки продавцом!
                </Typography>
              </Alert>
              
              <SearchBar
                fullWidth
                variant="outlined"
                placeholder="Поиск по юзернейму или продавцу..."
                value={searchQuery}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={clearSearch}>
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Box>
          </Fade>
        )}
        
        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : filteredAuctions.length === 0 ? (
          <EmptyStateBox>
            <Typography variant="h6" gutterBottom>
              {searchQuery ? 'По вашему запросу ничего не найдено' : 'В данный момент нет активных аукционов'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {searchQuery ? 'Попробуйте изменить параметры поиска' : 'Будьте первым, кто выставит свой юзернейм на аукцион!'}
            </Typography>
          </EmptyStateBox>
        ) : (
          <Grid container spacing={2}>
            {filteredAuctions.map((auction) => (
              <Grid item xs={12} key={auction.id}>
                <Fade in={true} timeout={300}>
                  <AuctionCard 
                    elevation={2}
                    onClick={() => handleOpenAuctionDetail(auction)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={8}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <TagIcon sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography variant="h5" component="h2" fontWeight="bold">
                              @{auction.username}
                            </Typography>
                            <StatusChip 
                              label={auction.status || "active"}
                              status={auction.status || "active"}
                              size="small"
                              sx={{ ml: 2 }}
                            />
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <PersonIcon sx={{ mr: 1, fontSize: '0.875rem', color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              Продавец: {auction.seller ? auction.seller.username : 'Unknown'}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <ScheduleIcon sx={{ mr: 1, fontSize: '0.875rem', color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              Осталось: {auction.remaining_time || formatTimeRemaining(auction.end_time)}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LocalOfferIcon sx={{ mr: 1, fontSize: '0.875rem', color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              Ставок: {auction.bids_count || (auction.bids ? auction.bids.length : 0)}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
                          <Typography variant="h6" color="primary" fontWeight="bold" sx={{ mb: 1 }}>
                            {auction.current_price || auction.highest_bid || auction.min_price} баллов
                          </Typography>
                          <Button 
                            variant="contained" 
                            color="primary"
                            fullWidth
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAuction(auction);
                              setBidDialogOpen(true);
                            }}
                            disabled={auction.seller_id === user?.id || auction.seller?.id === user?.id || loadingButtons.buy === auction.id}
                            sx={{ 
                              borderRadius: 2
                            }}
                            startIcon={loadingButtons.buy === auction.id ? <CircularProgress size={20} /> : null}
                          >
                            {loadingButtons.buy === auction.id ? 'Обработка...' : 'Сделать ставку'}
                          </Button>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </AuctionCard>
                </Fade>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {userAuctions.length === 0 ? (
          <EmptyStateBox>
            <Typography variant="h6" gutterBottom>
              У вас нет активных аукционов
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Выставите свой юзернейм на аукцион и заработайте баллы!
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={() => setCreateDialogOpen(true)}
              sx={{ 
                borderRadius: 2,
                px: 2
              }}
            >
              Создать аукцион
            </Button>
          </EmptyStateBox>
        ) : (
          <Grid container spacing={2}>
            {userAuctions.map((auction) => (
              <Grid item xs={12} key={auction.id}>
                <Fade in={true} timeout={300}>
                  <AuctionCard elevation={2}>
                    <CardContent sx={{ p: 3 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={8}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <TagIcon sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography variant="h5" component="h2" fontWeight="bold">
                              @{auction.username}
                            </Typography>
                            <StatusChip 
                              label={auction.status || "active"}
                              status={auction.status || "active"}
                              size="small"
                              sx={{ ml: 2 }}
                            />
                          </Box>
                          {(auction.status === 'active' || !auction.status) && (
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <ScheduleIcon sx={{ mr: 1, fontSize: '0.875rem', color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                Осталось: {auction.remaining_time || formatTimeRemaining(auction.end_time)}
                              </Typography>
                            </Box>
                          )}
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LocalOfferIcon sx={{ mr: 1, fontSize: '0.875rem', color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              Ставок: {auction.bids_count || (auction.bids ? auction.bids.length : 0)}
                            </Typography>
                          </Box>
                          {auction.status === 'completed' && auction.winner_id && (
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                              <PersonIcon sx={{ mr: 1, fontSize: '0.875rem', color: 'success.main' }} />
                              <Typography variant="body2" color="success.main" fontWeight="medium">
                                Победитель: {auction.winner ? auction.winner.username : 'Unknown'}
                              </Typography>
                            </Box>
                          )}
                        </Grid>
                        <Grid item xs={12} sm={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
                          <Typography variant="h6" color="primary" fontWeight="bold" sx={{ mb: 1 }}>
                            {auction.status === 'completed' && auction.final_price 
                              ? `${auction.final_price} баллов` 
                              : `${auction.current_price || auction.highest_bid || auction.min_price} баллов`}
                          </Typography>
                          {(auction.status === 'active' || !auction.status) && (
                            <>
                              {auction.bids_count > 0 && (
                                <Button 
                                  variant="contained" 
                                  color="success"
                                  sx={{ 
                                    borderRadius: 2,
                                    mb: 1
                                  }}
                                  onClick={() => handleAcceptBid(auction)}
                                  disabled={loadingButtons.accept === auction.id}
                                  startIcon={loadingButtons.accept === auction.id ? <CircularProgress size={20} color="inherit" /> : null}
                                >
                                  {loadingButtons.accept === auction.id ? 'Принятие...' : 'Принять ставку'}
                                </Button>
                              )}
                              <Button 
                                variant="outlined" 
                                color="error"
                                sx={{ 
                                  borderRadius: 2
                                }}
                                onClick={() => handleCancelAuction(auction.id)}
                                disabled={loadingButtons.cancel === auction.id}
                                startIcon={loadingButtons.cancel === auction.id ? <CircularProgress size={20} color="error" /> : null}
                              >
                                {loadingButtons.cancel === auction.id ? 'Отмена...' : 'Отменить'}
                              </Button>
                            </>
                          )}
                        </Grid>
                      </Grid>
                    </CardContent>
                  </AuctionCard>
                </Fade>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {userBids.length === 0 ? (
          <EmptyStateBox>
            <Typography variant="h6" gutterBottom>
              У вас нет активных ставок
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Поучаствуйте в аукционах, чтобы получить уникальный юзернейм!
            </Typography>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => setTabValue(0)}
              sx={{ 
                borderRadius: 2,
                px: 2
              }}
            >
              Смотреть аукционы
            </Button>
          </EmptyStateBox>
        ) : (
          <Grid container spacing={2}>
            {userBids.map((bid) => (
              <Grid item xs={12} key={bid.id}>
                <Fade in={true} timeout={300}>
                  <AuctionCard elevation={2}>
                    <CardContent sx={{ p: 3 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={8}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <TagIcon sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography variant="h5" component="h2" fontWeight="bold">
                              @{bid.username}
                            </Typography>
                            <StatusChip 
                              label="active"
                              status="active"
                              size="small"
                              sx={{ ml: 2 }}
                            />
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <MonetizationOnIcon sx={{ mr: 1, fontSize: '0.875rem', color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              Ваша ставка: <b>{bid.my_bid} баллов</b>
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <ScheduleIcon sx={{ mr: 1, fontSize: '0.875rem', color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              Осталось: {bid.remaining_time || formatTimeRemaining(bid.end_time)}
                            </Typography>
                          </Box>
                          {bid.am_winning && (
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                              <GavelIcon sx={{ mr: 1, fontSize: '0.875rem', color: 'success.main' }} />
                              <Typography variant="body2" color="success.main" fontWeight="bold">
                                Вы лидируете!
                              </Typography>
                            </Box>
                          )}
                        </Grid>
                        <Grid item xs={12} sm={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
                          <Typography variant="h6" color="primary" fontWeight="bold" sx={{ mb: 1 }}>
                            Текущая: {bid.highest_bid} баллов
                          </Typography>
                          <Button 
                            variant="contained" 
                            color="primary"
                            fullWidth
                            onClick={() => {
                              const auctionObj = {
                                id: bid.id,
                                username: bid.username,
                                min_price: 0,
                                highest_bid: bid.highest_bid
                              };
                              setSelectedAuction(auctionObj);
                              setBidDialogOpen(true);
                            }}
                            disabled={loadingButtons.bid}
                            sx={{ 
                              borderRadius: 2
                            }}
                          >
                            Повысить ставку
                          </Button>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </AuctionCard>
                </Fade>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      {/* Dialog for creating a new auction */}
      <StyledDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Создать новый аукцион</DialogTitle>
        <DialogContent sx={{ pb: 4 }}>
          <Box sx={{ mb: 3, mt: 2 }}>
            <Typography variant="body1" gutterBottom>
              Выберите юзернейм для аукциона:
            </Typography>
            
            <TextField
              select
              fullWidth
              label="Юзернейм"
              value={newAuctionData.username}
              onChange={(e) => setNewAuctionData({...newAuctionData, username: e.target.value})}
              error={!!errors.username}
              helperText={errors.username}
              margin="normal"
              variant="outlined"
              SelectProps={{
                native: true,
              }}
            >
              <option value="">Выберите юзернейм</option>
              {usernames.filter(u => !u.is_active).map((username) => (
                <option key={username.id} value={username.username}>
                  @{username.username}
                </option>
              ))}
            </TextField>
            
            {usernames.filter(u => !u.is_active).length === 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                У вас нет неактивных юзернеймов для аукциона. Вы не можете выставить активный юзернейм.
              </Alert>
            )}
            
            <TextField
              fullWidth
              label="Минимальная цена (баллы)"
              type="number"
              value={newAuctionData.min_price}
              onChange={(e) => setNewAuctionData({...newAuctionData, min_price: e.target.value})}
              error={!!errors.min_price}
              helperText={errors.min_price || "Максимальная начальная цена: 15 000 баллов"}
              margin="normal"
              variant="outlined"
              InputProps={{ 
                inputProps: { 
                  min: 1,
                  max: 15000
                } 
              }}
            />
            
            <TextField
              select
              fullWidth
              label="Длительность аукциона"
              value={newAuctionData.duration_hours}
              onChange={(e) => setNewAuctionData({...newAuctionData, duration_hours: parseFloat(e.target.value)})}
              margin="normal"
              variant="outlined"
              SelectProps={{
                native: true,
              }}
            >
              <option value={0.5}>30 минут</option>
              <option value={24}>24 часа</option>
              <option value={48}>2 дня</option>
              <option value={72}>3 дня</option>
              <option value={168}>1 неделя</option>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => setCreateDialogOpen(false)}
            disabled={loadingButtons.create}
          >
            Отмена
          </Button>
          <Button 
            variant="contained" 
            onClick={handleCreateAuction}
            disabled={!newAuctionData.username || !newAuctionData.min_price || loadingButtons.create}
            startIcon={loadingButtons.create ? <CircularProgress size={20} /> : null}
          >
            {loadingButtons.create ? 'Создание...' : 'Создать аукцион'}
          </Button>
        </DialogActions>
      </StyledDialog>
      
      {/* Dialog for placing a bid */}
      <StyledDialog
        open={bidDialogOpen}
        onClose={() => !loadingButtons.bid && setBidDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Сделать ставку</DialogTitle>
        <DialogContent sx={{ pb: 4 }}>
          {selectedAuction && (
            <Box sx={{ mb: 3, mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TagIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" component="h2">
                  @{selectedAuction.username}
                </Typography>
              </Box>
              
              <Typography variant="body2" gutterBottom sx={{ mb: 2 }}>
                Текущая ставка: <b>{selectedAuction.current_price || selectedAuction.highest_bid || selectedAuction.min_price} баллов</b>
              </Typography>
              
              <TextField
                fullWidth
                label="Ваша ставка (баллы)"
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                error={!!errors.bidAmount}
                helperText={errors.bidAmount || `Минимальная ставка: ${(parseInt(selectedAuction.current_price || selectedAuction.highest_bid || selectedAuction.min_price) + 1)} баллов`}
                margin="normal"
                variant="outlined"
                disabled={loadingButtons.bid}
                InputProps={{ 
                  inputProps: { 
                    min: parseInt(selectedAuction.current_price || selectedAuction.highest_bid || selectedAuction.min_price) + 1 
                  } 
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => setBidDialogOpen(false)}
            disabled={loadingButtons.bid}
          >
            Отмена
          </Button>
          <Button 
            variant="contained" 
            onClick={handlePlaceBid}
            disabled={!bidAmount || isNaN(bidAmount) || 
                     parseInt(bidAmount) <= parseInt(selectedAuction?.current_price || 
                     selectedAuction?.highest_bid || 
                     selectedAuction?.min_price) || 
                     loadingButtons.bid}
            startIcon={loadingButtons.bid ? <CircularProgress size={20} /> : null}
          >
            {loadingButtons.bid ? 'Обработка...' : 'Сделать ставку'}
          </Button>
        </DialogActions>
      </StyledDialog>
      
      {/* Detail Dialog */}
      <DetailDialog
        open={detailDialogOpen}
        onClose={handleCloseAuctionDetail}
        fullWidth
        maxWidth="md"
        fullScreen={isMobile}
      >
        {detailAuction && (
          <>
            <DialogTitle sx={{ borderBottom: `1px solid ${theme.palette.divider}`, position: 'relative', pb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TagIcon sx={{ mr: 1.5, color: 'primary.main', fontSize: '1.75rem' }} />
                <Typography variant="h5" component="h2" fontWeight="bold">
                  @{detailAuction.username}
                </Typography>
                <StatusChip 
                  label={detailAuction.status || "active"}
                  status={detailAuction.status || "active"}
                  size="small"
                  sx={{ ml: 2 }}
                />
              </Box>
              <IconButton
                aria-label="close"
                onClick={handleCloseAuctionDetail}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                }}
                disabled={loadingButtons.bid}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
              {detailLoading ? (
                <Box display="flex" justifyContent="center" my={4}>
                  <CircularProgress />
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {/* Информация об аукционе */}
                  <Grid item xs={12} md={7}>
                    <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: alpha(theme.palette.background.paper, 0.7) }}>
                      <Typography variant="h6" gutterBottom>
                        Информация об аукционе
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PersonIcon sx={{ mr: 1.5, color: 'text.secondary', fontSize: '1.2rem' }} />
                          <Typography variant="body1">
                            Продавец: <strong>{detailAuction.seller ? detailAuction.seller.username : 'Unknown'}</strong>
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <MonetizationOnIcon sx={{ mr: 1.5, color: 'text.secondary', fontSize: '1.2rem' }} />
                          <Typography variant="body1">
                            Минимальная цена: <strong>{detailAuction.min_price} баллов</strong>
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <MonetizationOnIcon sx={{ mr: 1.5, color: 'primary.main', fontSize: '1.2rem' }} />
                          <Typography variant="body1">
                            Текущая цена: <strong>{detailAuction.current_price || detailAuction.min_price} баллов</strong>
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <ScheduleIcon sx={{ mr: 1.5, color: 'text.secondary', fontSize: '1.2rem' }} />
                          <Typography variant="body1">
                            Создан: <strong>{formatDate(detailAuction.created_at)}</strong>
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <ScheduleIcon sx={{ mr: 1.5, color: 'warning.main', fontSize: '1.2rem' }} />
                          <Typography variant="body1">
                            Завершается: <strong>{formatDate(detailAuction.end_time)}</strong>
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <ScheduleIcon sx={{ mr: 1.5, color: 'info.main', fontSize: '1.2rem' }} />
                          <Typography variant="body1">
                            Осталось: <strong>{detailAuction.remaining_time || formatTimeRemaining(detailAuction.end_time)}</strong>
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                    
                    {detailAuction.seller_id !== user?.id && (
                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        size="large"
                        onClick={() => {
                          setDetailDialogOpen(false);
                          setSelectedAuction(detailAuction);
                          setBidDialogOpen(true);
                        }}
                        disabled={detailAuction.seller_id === user?.id || loadingButtons.bid}
                        sx={{ mt: 1, borderRadius: 2, py: 1.25 }}
                      >
                        Сделать ставку
                      </Button>
                    )}
                  </Grid>
                  
                  {/* История ставок */}
                  <Grid item xs={12} md={5}>
                    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.background.paper, 0.7) }}>
                      <Typography variant="h6" gutterBottom>
                        История ставок {detailAuction.bids && detailAuction.bids.length > 0 ? `(${detailAuction.bids.length})` : ''}
                      </Typography>
                      
                      {(!detailAuction.bids || detailAuction.bids.length === 0) ? (
                        <Box sx={{ py: 4, textAlign: 'center' }}>
                          <InfoOutlinedIcon sx={{ fontSize: '3rem', color: 'text.secondary', mb: 1, opacity: 0.5 }} />
                          <Typography variant="body1" color="text.secondary">
                            Пока нет ставок
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Будьте первым, кто сделает ставку!
                          </Typography>
                        </Box>
                      ) : (
                        <List sx={{ maxHeight: '400px', overflowY: 'auto', pr: 1 }}>
                          {detailAuction.bids
                            .sort((a, b) => new Date(b.time) - new Date(a.time))
                            .map((bid, index) => {
                              const isHighestBid = index === 0;
                              const isMyBid = bid.bidder.id === user?.id;
                              
                              return (
                                <BidHistoryItem 
                                  key={`${bid.bidder.id}-${bid.time}`}
                                  isWinning={isHighestBid}
                                >
                                  <ListItemAvatar>
                                    <Avatar 
                                      alt={bid.bidder.username}
                                      src={bid.bidder.avatar_url || (bid.bidder.photo && `/static/uploads/avatar/${bid.bidder.id}/${bid.bidder.photo}`)} 
                                      sx={isHighestBid ? {
                                        bgcolor: 'success.main',
                                        color: 'white'
                                      } : {}}
                                      onError={(e) => {
                                        console.error("Ошибка загрузки аватара:", bid.bidder.username);
                                        e.target.src = `/static/uploads/avatar/system/avatar.png`;
                                      }}
                                    >
                                      {isHighestBid && <ArrowUpwardIcon />}
                                      {!isHighestBid && bid.bidder.username.charAt(0)}
                                    </Avatar>
                                  </ListItemAvatar>
                                  <ListItemText
                                    primary={
                                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                        <Typography variant="body1" fontWeight={isHighestBid ? 'bold' : 'normal'}>
                                          {bid.bidder.username} {isMyBid && '(Вы)'}
                                        </Typography>
                                        <Typography variant="body1" fontWeight="bold" color={isHighestBid ? 'success.main' : 'inherit'}>
                                          {bid.amount} баллов
                                        </Typography>
                                      </Box>
                                    }
                                    secondary={
                                      <Typography variant="body2" color="text.secondary">
                                        {formatDate(bid.time)}
                                        {isHighestBid && (
                                          <Typography 
                                            component="span" 
                                            variant="body2" 
                                            color="success.main"
                                            sx={{ display: 'block', fontWeight: 'bold' }}
                                          >
                                            Лидирующая ставка
                                          </Typography>
                                        )}
                                      </Typography>
                                    }
                                  />
                                </BidHistoryItem>
                              );
                            })}
                        </List>
                      )}
                    </Paper>
                  </Grid>
                </Grid>
              )}
            </DialogContent>
          </>
        )}
      </DetailDialog>
      
      {/* Add a session expiration warning */}
      {sessionExpired && (
        <Alert 
          severity="warning" 
          sx={{ 
            mb: 3, 
            borderRadius: 2,
            '& .MuiAlert-message': { width: '100%' }
          }}
          action={
            <Button 
              color="inherit" 
              size="small"
              onClick={() => window.location.reload()}
            >
              Обновить
            </Button>
          }
        >
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Требуется обновление
          </Typography>
          <Typography variant="body2">
            Данные могут быть устаревшими. Пожалуйста, обновите страницу для получения актуальной информации.
          </Typography>
        </Alert>
      )}
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={snackbar.severity === 'warning' ? null : 6000}
        onClose={() => snackbar.severity !== 'warning' && setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => snackbar.severity !== 'warning' && setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
          action={
            snackbar.severity === 'warning' && (
              <Button 
                color="inherit" 
                size="small"
                onClick={() => window.location.reload()}
              >
                Обновить
              </Button>
            )
          }
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UsernameAuctionPage; 