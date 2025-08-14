import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useRef,
  useMemo,
} from 'react';
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
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  Button,
  Tabs,
  Tab,
  DialogActions as MuiDialogActions,
  TextField,
  Snackbar,
  Alert,
  InputAdornment,
  useMediaQuery,
  TableRow,
  TableCell,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import TimelineIcon from '@mui/icons-material/Timeline';
import InfoIcon from '@mui/icons-material/Info';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PeopleIcon from '@mui/icons-material/People';
import AddIcon from '@mui/icons-material/Add';
import PaymentIcon from '@mui/icons-material/Payment';
import SendIcon from '@mui/icons-material/Send';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import DiamondIcon from '@mui/icons-material/Diamond';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { ReactComponent as BallsSVG } from '../../assets/balls.svg';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import { MaxIcon } from '../../components/icons/CustomIcons';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TagIcon from '@mui/icons-material/Tag';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { downloadPdfReceipt } from '../../utils/pdfGenerator';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import CallMadeIcon from '@mui/icons-material/CallMade';
import CallReceivedIcon from '@mui/icons-material/CallReceived';
import CasinoIcon from '@mui/icons-material/Casino';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import TransferMenu from '../../UIKIT/TransferMenu';
import StyledTabs from '../../UIKIT/StyledTabs';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import InfoBlock from '../../UIKIT/InfoBlock';
import UniversalModal from '../../UIKIT/UniversalModal';
import { UltimateDecorationModal } from '../../components/UltimateDecorationModal';
import { useLanguage } from '@/context/LanguageContext';
import { 
  getDecorationImagePath, 
  getDecorationBackground, 
  getBackgroundStyles, 
  getBackgroundType, 
  isLightBackground,
  getDecorationStyles,
  parseItemSettings
} from '../../utils/decorationUtils';

const BalanceAmount = styled(Typography)(({ theme }) => ({
  fontSize: '3.5rem',
  fontWeight: '700',
  marginTop: theme.spacing(0.5),
  marginBottom: theme.spacing(0.5),
  color: 'var(--theme-text-primary)',
  lineHeight: 1.2,
}));

const TransactionItem = styled(ListItem)(({ theme }) => ({
  borderRadius: 12,
  marginBottom: theme.spacing(1),
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    transform: 'translateX(4px)',
  },
}));

const TransactionAmount = styled(Typography)(({ theme, type }) => ({
  fontWeight: 'bold',
  fontSize: '0.9rem',
  padding: '4px 8px',
  borderRadius: '8px',
  backgroundColor:
    type === 'positive'
      ? alpha(theme.palette.success.main, 0.1)
      : alpha(theme.palette.error.main, 0.1),
  color:
    type === 'positive' ? theme.palette.success.main : theme.palette.error.main,
}));

const BadgeImage = styled('img')({
  width: 40,
  height: 40,
  objectFit: 'contain',
});

const PointsIcon = styled(Box)(({ theme }) => ({
  width: 64,
  height: 64,
  margin: '0 auto',
  marginBottom: theme.spacing(2),
  '& svg': {
    width: '100%',
    height: '100%',
    filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))',
  },
}));

const CreatedBadgeImage = styled('img')({
  width: 50,
  height: 50,
  objectFit: 'contain',
});

const ActionButtonsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  gap: theme.spacing(2),
  marginTop: theme.spacing(2),
}));

const ActionButtonItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  flex: 1,
  padding: theme.spacing(1),
  cursor: 'pointer',
  borderRadius: 16,
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
  },
}));

const ActionCircleIcon = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 44,
  height: 44,
  borderRadius: '50%',
  backgroundColor: '#614C93',
  marginBottom: theme.spacing(0.8),
  '& svg': {
    color: '#fff',
    fontSize: 24,
  },
}));

const ActionButtonText = styled(Typography)(({ theme }) => ({
  fontSize: '0.6rem',
  fontWeight: 500,
  color: '#fff',
  textAlign: 'center',
  whiteSpace: 'nowrap',
  textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
}));

const BalanceToggleContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '8px 16px',
  marginTop: '16px',
  borderRadius: '12px',
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
}));

const ToggleButton = styled(Box)(({ theme, active }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '8px 12px',
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  background: active ? 'rgba(207, 188, 251, 0.2)' : 'transparent',
  border: active ? '1px solid rgba(207, 188, 251, 0.3)' : '1px solid transparent',
  color: active ? '#cfbcfb' : 'rgba(255, 255, 255, 0.5)',
  '&:hover': {
    background: active ? 'rgba(207, 188, 251, 0.25)' : 'rgba(255, 255, 255, 0.1)',
    color: active ? '#cfbcfb' : 'rgba(255, 255, 255, 0.7)',
  },
}));

const ToggleIcon = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '20px',
  height: '20px',
  marginRight: '6px',
}));

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role='tabpanel'
    hidden={value !== index}
    id={`tabpanel-${index}`}
    aria-labelledby={`tab-${index}`}
    {...other}
    style={{ marginTop: '8px' }}
  >
    {value === index && <Box>{children}</Box>}
  </div>
);


const CancelButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(3),
  borderColor:
    theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.2)'
      : 'rgba(0, 0, 0, 0.2)',
  color:
    theme.palette.mode === 'dark'
      ? 'rgba(255, 255, 255, 0.7)'
      : 'rgba(0, 0, 0, 0.7)',
  '&:hover': {
    borderColor:
      theme.palette.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.4)'
        : 'rgba(0, 0, 0, 0.4)',
    background:
      theme.palette.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.05)'
        : 'rgba(0, 0, 0, 0.05)',
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  paddingLeft: theme.spacing(4),
  paddingRight: theme.spacing(4),
  paddingTop: theme.spacing(0.75),
  paddingBottom: theme.spacing(0.75),
  borderColor: '#cfbcfb',
  color: '#cfbcfb',
  backgroundColor: 'transparent',
  '&:hover': {
    backgroundColor: 'rgba(207, 188, 251, 0.1)',
    borderColor: '#cfbcfb',
  },
  '&:disabled': {
    borderColor: 'rgba(207, 188, 251, 0.3)',
    color: 'rgba(207, 188, 251, 0.5)',
  },
}));

const ContentBox = styled(Box)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(1),
  borderRadius: 8,
  backgroundColor:
    theme.palette.mode === 'dark'
      ? 'rgba(208, 188, 255, 0.05)'
      : 'rgba(208, 188, 255, 0.1)',
  border: `1px solid ${
    theme.palette.mode === 'dark'
      ? 'rgba(208, 188, 255, 0.2)'
      : 'rgba(208, 188, 255, 0.3)'
  }`,
  marginBottom: theme.spacing(2),
}));

const KeyTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    backgroundColor:
      theme.palette.mode === 'dark'
        ? 'rgba(0, 0, 0, 0.3)'
        : 'rgba(255, 255, 255, 0.8)',
    '&:hover': {
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
      },
    },
    '&.Mui-focused': {
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
        borderWidth: 2,
      },
    },
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor:
      theme.palette.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.2)'
        : 'rgba(0, 0, 0, 0.1)',
  },
  '& .MuiInputLabel-root': {
    color:
      theme.palette.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.7)'
        : 'rgba(0, 0, 0, 0.7)',
  },
}));




const UserAvatar = styled(Avatar)(({ theme }) => ({
  width: 32,
  height: 32,
  fontSize: '0.9rem',
  marginRight: theme.spacing(1.5),
  backgroundColor: theme.palette.primary.main,
}));

const GradientButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(3),
  background: 'linear-gradient(45deg, #6200ee 30%, #9c64f2 90%)',
  color: '#fff',
  boxShadow: '0 4px 10px rgba(98, 0, 238, 0.25)',
  '&:hover': {
    boxShadow: '0 6px 12px rgba(98, 0, 238, 0.4)',
  },
  '&:disabled': {
    background:
      theme.palette.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.12)'
        : 'rgba(0, 0, 0, 0.12)',
    color:
      theme.palette.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.3)'
        : 'rgba(0, 0, 0, 0.26)',
  },
}));

const ReceiptIconButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(1),
  padding: theme.spacing(1.5),
  borderRadius: 16,
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  color: theme.palette.primary.main,
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.2),
  },
}));

const SuccessIconWrapper = styled(Box)(({ theme }) => ({
  width: 80,
  height: 80,
  borderRadius: '50%',
  backgroundColor: alpha(theme.palette.success.main, 0.2),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto',
  marginBottom: theme.spacing(2),
}));

const generateReceiptForTransaction = async transaction => {
  try {
    const transactionId = `TR-${transaction.id || Date.now().toString().slice(-8)}`;

    const response = await axios.post('/api/user/generate-receipt', {
      transaction_data: {
        transactionId: transactionId,
        amount: Math.abs(transaction.amount),
        recipientUsername:
          transaction.type === 'transfer'
            ? transaction.amount < 0
              ? transaction.recipient_username
              : transaction.sender_username
            : '',
        senderUsername:
          transaction.type === 'transfer'
            ? transaction.amount < 0
              ? transaction.sender_username
              : transaction.recipient_username
            : '',
        date: transaction.date,
      },
    });

    if (response.data && response.data.success) {
      const pdfDataUrl = `data:application/pdf;base64,${response.data.pdf_data}`;

      downloadPdfReceipt(pdfDataUrl, transactionId, response.data.file_path);
    } else {
      throw new Error(t('balance.errors.receipt_generation'));
    }
  } catch (error) {
    console.error('Ошибка при создании чека для транзакции:', error);
  }
};

// TransactionDetailDialog удален - теперь используется UniversalModal

const TransactionDetailHeader = styled(Box)(({ theme, type }) => ({
  padding: theme.spacing(3, 3, 3.5, 3),
  background:
    type === 'income'
      ? 'linear-gradient(135deg, rgba(46, 125, 50, 0.1) 0%, rgba(76, 175, 80, 0.2) 100%)'
      : 'linear-gradient(135deg, rgba(211, 47, 47, 0.1) 0%, rgba(244, 67, 54, 0.2) 100%)',
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  position: 'relative',
  overflow: 'hidden',
}));

const TransactionDetailAmount = styled(Typography)(({ theme, type }) => ({
  fontWeight: 700,
  fontSize: '2.2rem',
  lineHeight: 1.2,
  color:
    type === 'income' ? theme.palette.success.main : theme.palette.error.main,
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(0.5),
}));

const TransactionStatusChip = styled(Chip)(({ theme, status }) => ({
  borderRadius: 12,
  height: 24,
  fontSize: '0.7rem',
  fontWeight: 600,
  backgroundColor:
    status === 'completed'
      ? alpha(theme.palette.success.main, 0.1)
      : alpha(theme.palette.grey[500], 0.1),
  color:
    status === 'completed'
      ? theme.palette.success.main
      : theme.palette.grey[500],
  border: `1px solid ${
    status === 'completed'
      ? alpha(theme.palette.success.main, 0.3)
      : alpha(theme.palette.grey[500], 0.3)
  }`,
  margin: theme.spacing(0, 0.5),
}));

const DetailRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: { xs: 'column', sm: 'row' },
  justifyContent: 'space-between',
  alignItems: { xs: 'flex-start', sm: 'center' },
  padding: theme.spacing(1.5, 0),
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  gap: { xs: 0.5, sm: 0 },
  '&:last-child': {
    borderBottom: 'none',
  },
}));

const DetailLabel = styled(Typography)(({ theme }) => ({
  color: alpha(theme.palette.text.primary, 0.6),
  fontSize: { xs: '0.8rem', sm: '0.85rem' },
  fontWeight: 500,
  marginBottom: { xs: 0.5, sm: 0 },
}));

const DetailValue = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
  fontSize: { xs: '0.8rem', sm: '0.85rem' },
  fontWeight: 600,
  textAlign: { xs: 'left', sm: 'right' },
  wordBreak: 'break-word',
  maxWidth: { xs: '100%', sm: '50%' },
  width: { xs: '100%', sm: 'auto' },
}));

const TransactionAvatar = styled(Avatar, {
  shouldForwardProp: prop => prop !== 'transactionType',
})(({ theme, transactionType }) => ({
  width: 46,
  height: 46,
  borderRadius: 14,
  backgroundColor:
    transactionType === 'positive'
      ? alpha(theme.palette.success.main, 0.15)
      : alpha(theme.palette.error.main, 0.15),
  border: `1px solid ${
    transactionType === 'positive'
      ? alpha(theme.palette.success.main, 0.3)
      : alpha(theme.palette.error.main, 0.3)
  }`,
  padding: theme.spacing(0.7),
  '& .MuiSvgIcon-root': {
    fontSize: '1.4rem',
  },
}));

const BankStyleTransactionItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '2.5px',
  width: '100%',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: 'var(--theme-background, rgba(255, 255, 255, 0.05))',
  },
}));

const TransactionInfo = styled(Box)(({ theme }) => ({
  marginLeft: theme.spacing(2),
  flex: 1,
  width: '100%',
  overflow: 'hidden',
}));

const TransactionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '0.95rem',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: '260px',
  '@media (max-width: 600px)': {
    maxWidth: '160px',
  },
}));

const TransactionDate = styled(Typography)(({ theme }) => ({
  fontSize: '0.75rem',
  color: alpha(theme.palette.text.secondary, 0.8),
  marginTop: 2,
}));

// TransactionDetailContent удален - теперь используется Box

// Add styled component for expandable content
const ExpandableContent = styled(Box, {
  shouldForwardProp: prop => prop !== 'expanded',
})(({ theme, expanded }) => ({
  maxHeight: expanded ? '1000px' : '0',
  overflow: 'hidden',
  opacity: expanded ? 1 : 0,
  transition: theme.transitions.create(['opacity', 'max-height'], {
    duration: theme.transitions.duration.standard,
  }),
}));

const ExpandIcon = styled(ExpandMoreIcon, {
  shouldForwardProp: prop => prop !== 'expanded',
})(({ theme, expanded }) => ({
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
  transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
  color: 'rgba(255,255,255,0.7)',
}));

const BalancePage = () => {
  const { t } = useLanguage();
  const { user } = useContext(AuthContext);
  const theme = useTheme();
  const navigate = useNavigate();
  
  // Проверка авторизации для обычных пользователей (не каналов)
  useEffect(() => {
    if (!user && !localStorage.getItem('channel_token')) {
      navigate('/login');
    }
  }, [user, navigate]);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [userPoints, setUserPoints] = useState(0);
  const [mcoinBalance, setMCoinBalance] = useState(0);
  const [mcoinTransactions, setMCoinTransactions] = useState([]);
  const [weeklyEstimate, setWeeklyEstimate] = useState(0);
  const [balanceType, setBalanceType] = useState('kballs'); // 'kballs' или 'mcoin'
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [royaltyHistory, setRoyaltyHistory] = useState([]);
  const [transferHistory, setTransferHistory] = useState([]);
  const [createdBadges, setCreatedBadges] = useState([]);
  const [usernamePurchases, setUsernamePurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [newTransferMenuOpen, setNewTransferMenuOpen] = useState(false);
  const [transferData, setTransferData] = useState({
    username: '',
    amount: '',
    message: '',
    recipient_id: null,
  });
  const [transferErrors, setTransferErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
  });
  const [userSearch, setUserSearch] = useState({
    loading: false,
    exists: false,
    suggestions: [],
    timer: null,
  });
  const [openKeyDialog, setOpenKeyDialog] = useState(false);
  const [keyValue, setKeyValue] = useState('');
  const [isSubmittingKey, setIsSubmittingKey] = useState(false);
  const [keyError, setKeyError] = useState('');
  const [keySuccess, setKeySuccess] = useState(null);
  const [activeTopupTab, setActiveTopupTab] = useState(0);
  const [transferSuccess, setTransferSuccess] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [isTransferring, setIsTransferring] = useState(false);

  // Состояние для проверки декорации
  const [isCheckingDecoration, setIsCheckingDecoration] = useState(false);
  const [decorationCheckError, setDecorationCheckError] = useState('');

  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [gameTransactions, setGameTransactions] = useState([]);

  // Состояние для модалки выбора декорации Ultimate
  const [decorationModalOpen, setDecorationModalOpen] = useState(false);
  const [mcoinPurchaseModalOpen, setMcoinPurchaseModalOpen] = useState(false);
  const [decorations, setDecorations] = useState([]);
  const [selectedDecoration, setSelectedDecoration] = useState(null);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [subscriptionPlans, setSubscriptionPlans] = useState({});
                  const [activeTab, setActiveTab] = useState(0); // 0 - подписки, 1 - декорации, 2 - конвертация, 3 - пополнение
                  const [availableDecorations, setAvailableDecorations] = useState([]);
                const [convertAmount, setConvertAmount] = useState(1);
                const [convertLoading, setConvertLoading] = useState(false);
                const [depositAmount, setDepositAmount] = useState(100);
                const [depositLoading, setDepositLoading] = useState(false);
                const [paymentUrl, setPaymentUrl] = useState('');
                const [showPaymentLink, setShowPaymentLink] = useState(false);

  const debounceTimerRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [isPointsInfoExpanded, setIsPointsInfoExpanded] = useState(false);
  const { language } = useLanguage();

  const allTransactions = React.useMemo(() => {
    const purchases = purchaseHistory.map(purchase => ({
      ...purchase,
      type: 'purchase',
      date: new Date(purchase.purchase_date),
      amount: -purchase.price_paid,
      title: t('balance.transactions.badge_purchase'),
      description: `"${purchase.badge.name}"`,
      icon: <ShoppingCartIcon sx={{ color: 'error.main' }} />,
    }));

    const royalties = royaltyHistory.map(royalty => ({
      ...royalty,
      type: 'royalty',
      date: new Date(royalty.purchase_date),
      amount: royalty.royalty_amount,
      title: t('balance.transactions.royalty_from_purchase'),
      description: `${royalty.buyer.name}`,
      buyer_name: royalty.buyer.name,
      badge_name: royalty.badge_name,
      icon: <MonetizationOnIcon sx={{ color: 'success.main' }} />,
    }));

    const transfers = transferHistory.map(transfer => {
      const senderId = parseInt(transfer.sender_id, 10);
      const userId = parseInt(user.id, 10);
      const is_sender = senderId === userId;

      const isClickerWithdrawal =
        transfer.sender_id === transfer.recipient_id &&
        transfer.message ===
          t('balance.transactions.clicker_withdrawal_message');

      let title = isClickerWithdrawal
        ? t('balance.transactions.clicker_withdrawal')
        : is_sender
          ? t('balance.transactions.transfer')
          : t('balance.transactions.deposit');
      let description = isClickerWithdrawal
        ? t('balance.transactions.clicker_points')
        : is_sender
          ? transfer.recipient_username
          : transfer.sender_username;

      return {
        ...transfer,
        type: 'transfer',
        date: new Date(transfer.date),
        amount: isClickerWithdrawal
          ? transfer.amount
          : is_sender
            ? -transfer.amount
            : transfer.amount,
        title: title,
        description: description,
        is_sender: isClickerWithdrawal ? false : is_sender,
        icon: isClickerWithdrawal ? (
          <TouchAppIcon sx={{ color: 'success.main' }} />
        ) : is_sender ? (
          <SendIcon sx={{ color: 'error.main' }} />
        ) : (
          <AccountBalanceWalletIcon sx={{ color: 'success.main' }} />
        ),
      };
    });

    const usernames = usernamePurchases.map(purchase => ({
      ...purchase,
      type: 'username',
      date: new Date(purchase.purchase_date),
      amount: -purchase.price_paid,
      title: t('balance.transactions.username_purchase'),
      description: `@${purchase.username}`,
      icon: <AccountCircleIcon sx={{ color: 'error.main' }} />,
    }));

    const weeklyActivities = gameTransactions
      .filter(transaction => transaction.transaction_type === 'weekly_activity')
      .map(transaction => {
        return {
          ...transaction,
          type: 'weekly_activity',
          date: new Date(transaction.date || transaction.created_at),
          title: t('balance.transactions.weekly_points'),
          description:
            transaction.description ||
            t('balance.transactions.activity_reward'),
          icon: <TrendingUpIcon sx={{ color: 'success.main' }} />,
        };
      });

    const otherGameTransactions = gameTransactions
      .filter(transaction => transaction.transaction_type !== 'weekly_activity')
      .map(transaction => {
        let icon = null;
        let title =
          transaction.description || t('balance.transactions.transaction');
        let type = transaction.transaction_type || 'unknown';

        // Игровые транзакции (Blackjack)
        if (type.includes('blackjack')) {
          if (type === 'blackjack_win' || type === 'blackjack_win_21') {
            icon = <CasinoIcon sx={{ color: 'success.main' }} />;
            title = t('balance.transactions.blackjack_win');
          } else if (type === 'blackjack_tie') {
            icon = <CasinoIcon sx={{ color: 'info.main' }} />;
            title = t('balance.transactions.blackjack_tie');
          } else if (
            type === 'blackjack_lose' ||
            type === 'blackjack_lose_bust'
          ) {
            icon = <CasinoIcon sx={{ color: 'error.main' }} />;
            title = t('balance.transactions.blackjack_lose');
          } else if (type === 'blackjack_bet') {
            icon = <CasinoIcon sx={{ color: 'error.main' }} />;
            title = t('balance.transactions.blackjack_bet');
          }
        }
        // Игровые транзакции (Roulette)
        else if (type.includes('roulette')) {
          if (type === 'roulette_win') {
            icon = <CasinoIcon sx={{ color: 'success.main' }} />;
            title = t('balance.transactions.roulette_win');
          } else if (type === 'roulette_bet') {
            icon = <CasinoIcon sx={{ color: 'error.main' }} />;
            title = t('balance.transactions.roulette_bet');
          }
        }
        // Игровые транзакции (Cups)
        else if (type === 'cups_win') {
          icon = <CasinoIcon sx={{ color: 'success.main' }} />;
          title = t('balance.transactions.cups_win');
        }
        // Мини-игры
        else if (type === 'minigame_bet') {
          icon = <SportsEsportsIcon sx={{ color: 'error.main' }} />;
          title = t('balance.transactions.minigame_bet');
        }
        // Аукционы
        else if (
          type.includes('auction') &&
          !type.includes('username_auction')
        ) {
          if (type === 'auction_bid' || type === 'auction_bid_increase') {
            icon = <TagIcon sx={{ color: 'error.main' }} />;
            title = t('balance.transactions.auction_bid');
          } else if (
            type === 'auction_bid_refund' ||
            type === 'auction_refund'
          ) {
            icon = <TagIcon sx={{ color: 'success.main' }} />;
            title = t('balance.transactions.auction_refund');
          } else if (type === 'auction_sale') {
            icon = <TagIcon sx={{ color: 'success.main' }} />;
            title = t('balance.transactions.auction_sale');
          }
        }
        // Аукционы юзернеймов
        else if (type.includes('username_auction')) {
          if (type === 'username_auction_bid') {
            icon = <AccountCircleIcon sx={{ color: 'error.main' }} />;
            title = t('balance.transactions.username_auction_bid');
          } else if (type === 'username_auction_refund') {
            icon = <AccountCircleIcon sx={{ color: 'success.main' }} />;
            title = t('balance.transactions.username_auction_refund');
          } else if (
            type === 'username_auction_sale' ||
            type === 'username_bid_accepted_sale'
          ) {
            icon = <AccountCircleIcon sx={{ color: 'success.main' }} />;
            title = t('balance.transactions.username_auction_sale');
          }
        }
        // Покупки юзернеймов
        else if (
          type === 'username_immediate_purchase' ||
          type === 'username_purchase'
        ) {
          icon = <AccountCircleIcon sx={{ color: 'error.main' }} />;
          title = t('balance.transactions.username_purchase');
        }
        // Покупки пачек
        else if (type === 'pack_purchase') {
          icon = <ShoppingCartIcon sx={{ color: 'error.main' }} />;
          title = t('balance.transactions.pack_purchase');
        }
        // Маркетплейс
        else if (type.includes('marketplace')) {
          if (type === 'marketplace_buy') {
            icon = <ShoppingCartIcon sx={{ color: 'error.main' }} />;
            title = t('balance.transactions.marketplace_buy');
          } else if (type === 'marketplace_sell') {
            icon = <ShoppingCartIcon sx={{ color: 'success.main' }} />;
            title = t('balance.transactions.marketplace_sell');
          }
        }
        // Передачи предметов
        else if (type === 'item_transfer') {
          icon = <SendIcon sx={{ color: 'error.main' }} />;
          title = t('balance.transactions.item_transfer');
        }
        // Апгрейд предметов
        else if (type === 'item_upgrade') {
          icon = <TrendingUpIcon sx={{ color: 'error.main' }} />;
          title = t('balance.transactions.item_upgrade');
        }
        // Конвертация
        else if (type.includes('conversion')) {
          if (type === 'conversion_deposit') {
            icon = <AccountBalanceWalletIcon sx={{ color: 'success.main' }} />;
            title = t('balance.transactions.conversion_deposit');
          } else if (type === 'conversion_withdrawal') {
            icon = <AccountBalanceWalletIcon sx={{ color: 'error.main' }} />;
            title = t('balance.transactions.conversion_withdrawal');
          }
        }
        // Компенсация
        else if (type === 'compensation') {
          icon = <MonetizationOnIcon sx={{ color: 'success.main' }} />;
          title = t('balance.transactions.compensation');
        }
        // Кастомная активность
        else if (type === 'custom_period_activity') {
          icon = <TrendingUpIcon sx={{ color: 'success.main' }} />;
          title = t('balance.transactions.custom_period_activity');
        }
        // Призы за топ
        else if (type === 'top_prize') {
          icon = <DiamondIcon sx={{ color: 'success.main' }} />;
          title = t('balance.transactions.top_prize');
        }
        // По умолчанию
        else {
          icon = (
            <SportsEsportsIcon
              sx={{
                color: transaction.amount > 0 ? 'success.main' : 'error.main',
              }}
            />
          );
          title =
            transaction.description || t('balance.transactions.transaction');
        }

        return {
          ...transaction,
          type: 'game',
          date: new Date(transaction.date),
          title: title,
          description: transaction.transaction_type.replace(/_/g, ' '),
          icon: icon,
        };
      });

    const mcoinTransactionsData = mcoinTransactions.map(transaction => ({
      ...transaction,
      type: 'mcoin',
      date: new Date(transaction.created_at),
      amount: transaction.amount,
      title: (() => {
        if (transaction.transaction_type.startsWith('key_redemption')) {
          return 'Активация ключа MCoin';
        }
        if (transaction.transaction_type.startsWith('deposit')) {
          return 'Пополнение MCoin';
        }
        if (transaction.transaction_type.startsWith('subscription_purchase')) {
          return 'Покупка подписки';
        }
        if (transaction.transaction_type.startsWith('decoration_purchase')) {
          return 'Покупка декорации';
        }
        if (transaction.transaction_type.startsWith('convert_to_points')) {
          return 'Конвертация в баллы';
        }
        if (transaction.transaction_type.startsWith('payment_deposit')) {
          return 'Пополнение через платеж';
        }
        return 'Операция MCoin';
      })(),
      description: (() => {
        // Сначала проверяем transaction_type
        if (transaction.transaction_type) {
          if (transaction.transaction_type.startsWith('subscription_purchase_')) {
            const subscriptionType = transaction.transaction_type.replace('subscription_purchase_', '');
            const subscriptionNames = {
              'premium': 'Premium',
              'ultimate': 'Ultimate',
              'max': 'MAX'
            };
            return subscriptionNames[subscriptionType] || 'Подписка';
          }
          if (transaction.transaction_type.startsWith('decoration_purchase_')) {
            const decorationId = transaction.transaction_type.replace('decoration_purchase_', '');
            return `Декорация #${decorationId}`;
          }
          if (transaction.transaction_type.startsWith('key_redemption_')) {
            const keyInfo = transaction.transaction_type.replace('key_redemption_', '');
            return `Ключ: ${keyInfo}`;
          }
          if (transaction.transaction_type.startsWith('convert_to_points_')) {
            const amount = transaction.transaction_type.replace('convert_to_points_', '');
            return `${amount} MCoin → ${amount * 250} баллов`;
          }
          if (transaction.transaction_type.startsWith('payment_deposit_')) {
            const orderId = transaction.transaction_type.replace('payment_deposit_', '');
            // Если есть информация о платеже, показываем больше деталей
            if (transaction.payment) {
              const payment = transaction.payment;
              let paymentInfo = `Платеж #${orderId}`;
              
              if (payment.payment_method && payment.payment_method !== 'unknown') {
                paymentInfo += ` (${payment.payment_method})`;
              }
              
              if (payment.commission_amount && payment.commission_amount > 0) {
                paymentInfo += ` | Комиссия: ${payment.commission_amount}₽`;
              }
              
              return paymentInfo;
            }
            return `Платеж #${orderId}`;
          }
        }
        
        // Если есть description, используем его
        if (transaction.description) {
          if (transaction.description.startsWith('subscription_purchase_')) {
            const subscriptionType = transaction.description.replace('subscription_purchase_', '');
            const subscriptionNames = {
              'premium': 'Premium',
              'ultimate': 'Ultimate',
              'max': 'MAX'
            };
            return subscriptionNames[subscriptionType] || 'Подписка';
          }
          if (transaction.description.startsWith('decoration_purchase_')) {
            const decorationId = transaction.description.replace('decoration_purchase_', '');
            return `Декорация #${decorationId}`;
          }
          if (transaction.description.startsWith('key_redemption_')) {
            const keyInfo = transaction.description.replace('key_redemption_', '');
            return `Ключ: ${keyInfo}`;
          }
          return transaction.description;
        }
        
        return '';
      })(),
      icon: <CurrencyExchangeIcon sx={{ color: transaction.amount > 0 ? 'success.main' : 'error.main' }} />,
    }));

    // Фильтруем транзакции в зависимости от выбранного типа баланса
    const transactionsToShow = balanceType === 'mcoin' 
      ? mcoinTransactionsData 
      : [
          ...purchases,
          ...royalties,
          ...transfers,
          ...usernames,
          ...weeklyActivities,
          ...otherGameTransactions,
        ];

    return transactionsToShow.sort((a, b) => b.date - a.date);
  }, [
    purchaseHistory,
    royaltyHistory,
    transferHistory,
    usernamePurchases,
    gameTransactions,
    mcoinTransactions,
    balanceType,
    user?.id,
    t,
  ]);

  useEffect(() => {
    if (user || localStorage.getItem('channel_token')) {
      fetchUserPoints();
      fetchMCoinBalance();
    fetchMCoinTransactions();
    fetchDecorations();
    fetchSubscriptionPlans();
      fetchWeeklyEstimate();
      fetchPurchaseHistory();
      fetchRoyaltyHistory();
      fetchCreatedBadges();
      fetchTransferHistory();
      fetchUsernamePurchases();
      fetchSubscriptionStatus();
      fetchGameTransactions();
    }
  }, [user]);

  useEffect(() => {
    console.log('Subscription state changed:', subscription);
  }, [subscription]);

  const fetchUserPoints = async () => {
    try {
      const response = await axios.get('/api/user/points');
      setUserPoints(response.data.points);
    } catch (error) {
      console.error('Ошибка при загрузке баллов:', error);
      setError(t('balance.errors.points_loading'));
    }
  };

  const fetchMCoinBalance = async () => {
    try {
      const response = await axios.get('/api/mcoin/balance');
      setMCoinBalance(response.data.balance);
    } catch (error) {
      console.error('Ошибка при загрузке баланса MCoin:', error);
    }
  };

  const fetchMCoinTransactions = async () => {
    try {
      const response = await axios.get('/api/mcoin/transactions');
      if (response.data.success) {
        setMCoinTransactions(response.data.transactions || []);
      }
    } catch (error) {
      console.error('Ошибка при загрузке транзакций MCoin:', error);
    }
  };

  const fetchDecorations = async () => {
    try {
      const response = await axios.get('/api/mcoin/decorations');
      if (response.data.success) {
        setDecorations(response.data.decorations);
      }
    } catch (error) {
      console.error('Error fetching decorations:', error);
    }
  };

  const fetchSubscriptionPlans = async () => {
    try {
      const response = await axios.get('/api/mcoin/subscriptions');
      if (response.data.success) {
        setSubscriptionPlans(response.data.subscription_plans);
      }
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
    }
  };

  // Функция для определения доступности подписки
  const isSubscriptionAvailable = (subscriptionType) => {
    const priorities = {
      'premium': 1,
      'ultimate': 2,
      'max': 3
    };
    
    // Находим максимальную активную подписку
    let maxActivePriority = 0;
    Object.entries(subscriptionPlans).forEach(([type, plan]) => {
      if (plan.is_active) {
        maxActivePriority = Math.max(maxActivePriority, priorities[type] || 0);
      }
    });
    
    const requestedPriority = priorities[subscriptionType] || 0;
    return requestedPriority > maxActivePriority;
  };

  const handlePurchaseSubscription = async (subscriptionType) => {
    setPurchaseLoading(true);
    try {
      const response = await axios.post('/api/mcoin/purchase-subscription', {
        subscription_type: subscriptionType
      });
      
      if (response.data.success) {
        // Обновляем баланс MCoin
        await fetchMCoinBalance();
        // Обновляем планы подписок
        await fetchSubscriptionPlans();
        
        // Показываем уведомление об успехе
        setSnackbar({
          open: true,
          message: response.data.message,
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('Error purchasing subscription:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Ошибка при покупке подписки',
        severity: 'error'
      });
    } finally {
      setPurchaseLoading(false);
    }
  };

  const handlePurchaseDecoration = async (decorationId) => {
    setPurchaseLoading(true);
    try {
      const response = await axios.post('/api/mcoin/purchase-decoration', {
        decoration_id: decorationId
      });
      
      if (response.data.success) {
        // Обновляем баланс MCoin
        await fetchMCoinBalance();
        // Обновляем список декораций
        await fetchDecorations();
        
        // Показываем уведомление об успехе
        setSnackbar({
          open: true,
          message: response.data.message,
          severity: 'success'
        });
        
        // Закрываем модалку
        setMcoinPurchaseModalOpen(false);
        setSelectedDecoration(null);
      }
    } catch (error) {
      console.error('Error purchasing decoration:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Ошибка при покупке декорации',
        severity: 'error'
      });
    } finally {
      setPurchaseLoading(false);
    }
  };

  const handleConvertMCoin = async () => {
    if (convertLoading || convertAmount <= 0) return;
    
    try {
      setConvertLoading(true);
      
      const response = await axios.post('/api/mcoin/convert', {
        mcoin_amount: convertAmount
      });
      
      if (response.data.success) {
        // Обновляем балансы
        setMCoinBalance(response.data.new_mcoin_balance);
        setUserPoints(response.data.new_points_balance);
        
        // Обновляем транзакции
        fetchMCoinTransactions();
        
        // Показываем уведомление
        window.dispatchEvent(
          new CustomEvent('show-error', {
            detail: {
              message: response.data.message,
              shortMessage: 'Конвертация выполнена',
              notificationType: 'success',
              animationType: 'pill',
            },
          })
        );
      }
    } catch (error) {
      console.error('Ошибка при конвертации:', error);
      window.dispatchEvent(
        new CustomEvent('show-error', {
          detail: {
            message: error.response?.data?.error || 'Ошибка при конвертации',
            shortMessage: 'Ошибка',
            notificationType: 'error',
          },
        })
      );
    } finally {
      setConvertLoading(false);
    }
  };

  const handleCopyPaymentLink = async () => {
    try {
      await navigator.clipboard.writeText(paymentUrl);
      window.dispatchEvent(
        new CustomEvent('show-error', {
          detail: {
            message: 'Ссылка скопирована в буфер обмена',
            shortMessage: 'Скопировано',
            notificationType: 'success',
            animationType: 'pill',
          },
        })
      );
    } catch (error) {
      console.error('Ошибка при копировании:', error);
      window.dispatchEvent(
        new CustomEvent('show-error', {
          detail: {
            message: 'Не удалось скопировать ссылку',
            shortMessage: 'Ошибка',
            notificationType: 'error',
            animationType: 'pill',
          },
        })
      );
    }
  };

  const handleCreateDeposit = async () => {
    if (depositLoading || depositAmount < 10) return;
    
    try {
      setDepositLoading(true);
      setShowPaymentLink(false);
      setPaymentUrl('');
      
      // Добавляем информацию о пользователе для отключения проверки подписи для ID 3
      const requestData = {
        amount_rub: depositAmount
      };
      

      const response = await axios.post('/api/mcoin/create-payment', requestData);
      
      if (response.data.success) {
        // Пытаемся открыть страницу оплаты в новом окне
        const paymentWindow = window.open(response.data.payment_url, '_blank');
        
        // Сохраняем ссылку на платеж
        setPaymentUrl(response.data.payment_url);
        
        // Проверяем, удалось ли открыть окно (может быть заблокировано на мобильных)
        if (paymentWindow) {
          // Окно открылось успешно
          window.dispatchEvent(
            new CustomEvent('show-error', {
              detail: {
                message: `Платеж создан на сумму ${depositAmount} рублей. Страница оплаты открыта в новой вкладке.`,
                shortMessage: 'Платеж создан',
                notificationType: 'success',
                animationType: 'pill',
              },
            })
          );
        } else {
          // Окно заблокировано (часто на мобильных устройствах)
          setShowPaymentLink(true);
          window.dispatchEvent(
            new CustomEvent('show-error', {
              detail: {
                message: `Платеж создан на сумму ${depositAmount} рублей. Используйте кнопку ниже для копирования ссылки.`,
                shortMessage: 'Платеж создан',
                notificationType: 'warning',
                animationType: 'pill',
              },
            })
          );
        }
      }
    } catch (error) {
      console.error('Ошибка при создании платежа:', error);
      window.dispatchEvent(
        new CustomEvent('show-error', {
          detail: {
            message: error.response?.data?.error || 'Ошибка при создании платежа',
            shortMessage: 'Ошибка',
            notificationType: 'error',
          },
        })
      );
    } finally {
      setDepositLoading(false);
    }
  };

  const fetchWeeklyEstimate = async () => {
    try {
      const response = await axios.get(
        '/api/leaderboard/user/' + user.id + '?period=week'
      );
      setWeeklyEstimate(response.data.score || 0);
    } catch (error) {
      console.error('Ошибка при загрузке прогноза:', error);
      setWeeklyEstimate(0);
    }
  };

  const fetchPurchaseHistory = async () => {
    try {
      const response = await axios.get('/api/badges/purchases');

      const sortedPurchases = response.data.purchases.sort(
        (a, b) => new Date(b.purchase_date) - new Date(a.purchase_date)
      );
      setPurchaseHistory(sortedPurchases);
    } catch (error) {
      console.error('Ошибка при загрузке истории покупок:', error);
      setPurchaseHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoyaltyHistory = async () => {
    try {
      const response = await axios.get('/api/badges/royalties');

      console.log('Received royalty data:', response.data);
      setRoyaltyHistory(response.data.royalties || []);
    } catch (error) {
      console.error('Ошибка при загрузке истории роялти:', error);
      setRoyaltyHistory([]);
    }
  };

  const fetchCreatedBadges = async () => {
    try {
      const response = await axios.get('/api/badges/created');
      console.log('Received created badges data:', response.data);
      setCreatedBadges(response.data.badges || []);
    } catch (error) {
      console.error('Ошибка при загрузке созданных бейджиков:', error);
      setCreatedBadges([]);
    }
  };

  const fetchTransferHistory = async () => {
    try {
      const response = await axios.get('/api/user/transfer-history');
      if (response.data && response.data.transfers) {
        setTransferHistory(response.data.transfers);
      }
    } catch (error) {
      console.error('Ошибка при получении истории переводов:', error);
    }
  };

  const fetchUsernamePurchases = async () => {
    try {
      const response = await axios.get('/api/user/username-purchases');
      if (response.data && response.data.purchases) {
        setUsernamePurchases(response.data.purchases);
      }
    } catch (error) {
      console.error('Ошибка при получении истории покупок юзернеймов:', error);
    }
  };

  const searchUser = useCallback(username => {
    // Always clear previous timer first to reset the debounce
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // If username is empty, just reset everything
    if (!username) {
      setUserSearch(prev => ({
        ...prev,
        loading: false,
        exists: false,
        suggestions: [],
      }));
      setTransferData(prev => ({ ...prev, recipient_id: null }));
      return;
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      // Only show loading and make the API call after timeout
      setUserSearch(prev => ({ ...prev, loading: true }));

      axios
        .get(`/api/user/search-recipients?query=${username}`)
        .then(response => {
          if (response.data && response.data.users) {
            // Find exact match
            const exactMatch = response.data.users.find(
              user => user.username.toLowerCase() === username.toLowerCase()
            );

            // Update recipient ID if exact match found
            if (exactMatch) {
              setTransferData(prev => ({
                ...prev,
                recipient_id: exactMatch.id,
              }));
            } else {
              setTransferData(prev => ({ ...prev, recipient_id: null }));
            }

            // Update search results
            setUserSearch(prev => ({
              ...prev,
              loading: false,
              exists: !!exactMatch,
              suggestions: response.data.users.slice(0, 3),
            }));
          } else {
            setUserSearch(prev => ({
              ...prev,
              loading: false,
              exists: false,
              suggestions: [],
            }));
            setTransferData(prev => ({ ...prev, recipient_id: null }));
          }
        })
        .catch(error => {
          console.error('Ошибка при поиске пользователя:', error);
          setUserSearch(prev => ({
            ...prev,
            loading: false,
            exists: false,
            suggestions: [],
          }));
          setTransferData(prev => ({ ...prev, recipient_id: null }));
        });
    }, 1000); // 1 second delay
  }, []);

  const handleUsernameChange = e => {
    const username = e.target.value;
    setTransferData(prev => ({ ...prev, username }));

    // Simple pass to searchUser, which now handles proper debouncing
    if (username.trim()) {
      searchUser(username.trim());
    } else {
      // If empty, reset search state and clear any pending timers
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      setUserSearch(prev => ({
        ...prev,
        loading: false,
        exists: false,
        suggestions: [],
      }));
      setTransferData(prev => ({ ...prev, recipient_id: null }));
    }
  };

  const selectSuggestion = (username, userId) => {
    setTransferData(prev => ({ ...prev, username, recipient_id: userId }));
    setUserSearch(prev => ({
      ...prev,
      loading: false,
      exists: true,
      suggestions: [],
    }));
  };

  const handleTransferPoints = async () => {
    const errors = {};
    if (!transferData.username)
      errors.username = t('balance.transfer.errors.enter_username');
    if (!transferData.recipient_id)
      errors.username = t('balance.transfer.errors.user_not_found');
    if (!transferData.amount) {
      errors.amount = t('balance.transfer.errors.enter_amount');
    } else if (
      isNaN(transferData.amount) ||
      parseInt(transferData.amount) <= 0
    ) {
      errors.amount = t('balance.transfer.errors.positive_amount');
    } else if (parseInt(transferData.amount) > userPoints) {
      errors.amount = t('balance.transfer.errors.insufficient_points');
    }

    if (Object.keys(errors).length > 0) {
      setTransferErrors(errors);
      return;
    }

    if (isTransferring) return;

    setTransferErrors({});
    setIsTransferring(true);

    try {
      const response = await axios.post('/api/user/transfer-points', {
        recipient_username: transferData.username,
        recipient_id: transferData.recipient_id,
        amount: parseInt(transferData.amount),
        message: transferData.message,
      });

      fetchUserPoints();

      setTransferDialogOpen(false);

      try {
        const now = new Date();
        const transactionId = `TR-${Date.now().toString().slice(-8)}`;

        const response = await axios.post('/api/user/generate-receipt', {
          transaction_data: {
            transactionId: transactionId,
            amount: parseInt(transferData.amount),
            recipientUsername: transferData.username,
            senderUsername: user.username,
            date: now.toISOString(),
          },
        });

        if (response.data && response.data.success) {
          const receiptData = {
            dataUrl: `data:application/pdf;base64,${response.data.pdf_data}`,
            filePath: response.data.file_path,
          };

          setReceiptData(receiptData);
          setTransferSuccess(true);
        } else {
          throw new Error('Не удалось сгенерировать чек на сервере');
        }
      } catch (error) {
        console.error('Ошибка при создании чека:', error);
      }

      fetchTransferHistory();

      setTransferData({
        username: '',
        amount: '',
        message: '',
        recipient_id: null,
      });
    } catch (error) {
      console.error('Ошибка при переводе баллов:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Ошибка при переводе баллов',
        severity: 'error',
      });
    } finally {
      setIsTransferring(false);
    }
  };

  const formatDate = dateString => {
    const date = new Date(dateString);

    const userTimezoneOffset = date.getTimezoneOffset();

    const userDate = new Date(date.getTime() - userTimezoneOffset * 60000);

    const formattedDate = userDate.toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZoneName: 'short',
    });

    return formattedDate;
  };

  const getCurrentWeekRange = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 50, 0, 0);

    return {
      start: monday.toLocaleDateString(language === 'EN' ? 'en-US' : 'ru-RU', {
        day: 'numeric',
        month: 'long',
      }),
      end: sunday.toLocaleDateString(language === 'EN' ? 'en-US' : 'ru-RU', {
        day: 'numeric',
        month: 'long',
      }),
    };
  };

  const weekRange = useMemo(() => getCurrentWeekRange(), [language]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const formatKeyInput = input => {
    const cleaned = input.replace(/[^A-Za-z0-9]/g, '').toUpperCase();

    let formatted = '';
    for (let i = 0; i < cleaned.length; i++) {
      if (i > 0 && i % 4 === 0 && i < 16) {
        formatted += '-';
      }
      if (i < 16) {
        formatted += cleaned[i];
      }
    }

    return formatted;
  };

  const handleKeyChange = e => {
    const formattedKey = formatKeyInput(e.target.value);
    setKeyValue(formattedKey);
    setKeyError('');
  };

  const isValidKeyFormat = key => {
    return /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(key);
  };

  const handleRedeemKey = async () => {
    setKeyError('');
    setKeySuccess(null);
    setIsSubmittingKey(true);

    try {
      const response = await fetch('/api/user/redeem-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key: keyValue }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (
          data.error &&
          data.error.includes('Невозможно активировать подписку') &&
          data.error.includes(
            'так как у вас уже есть подписка более высокого уровня'
          )
        ) {
          setKeyError(data.error);
        } else {
          setKeyError(data.error || 'Ошибка при активации ключа');
        }
        setIsSubmittingKey(false);
        return;
      }

      if (data.type === 'points') {
        setKeySuccess({
          message: data.message,
          type: 'points',
          newBalance: data.new_balance,
        });

        setUserPoints(data.new_balance);
      } else if (data.type === 'mcoin') {
        setKeySuccess({
          message: data.message,
          type: 'mcoin',
          mcoinAdded: data.mcoin_added,
          oldBalance: data.old_balance,
          newBalance: data.new_balance,
        });

        // Обновляем баланс MCoin если есть функция для этого
        if (typeof setMCoinBalance === 'function') {
          setMCoinBalance(data.new_balance);
        }
      } else if (data.type === 'subscription') {
        setKeySuccess({
          message: data.message,
          type: 'subscription',
          subscriptionType: data.subscription_type,
          expiresAt: data.expires_at,
          duration_days: data.duration_days,
        });

        fetchSubscriptionStatus();

        // Проверяем, нужно ли показать модалку выбора декорации
        if (
          data.subscription_type === 'ultimate' &&
          data.needs_decoration_selection
        ) {
          setAvailableDecorations(data.available_decorations || []);
          setDecorationModalOpen(true);
        }
      }
    } catch (error) {
      console.error('Ошибка при активации ключа:', error);
      setKeyError('Произошла ошибка при активации ключа');
    } finally {
      setIsSubmittingKey(false);
    }
  };

  const fetchSubscriptionStatus = async () => {
    try {
      console.log('Fetching subscription status...');
      const response = await axios.get('/api/user/subscription/status');

      if (response.data) {
        console.log('Received subscription data:', response.data);

        if (response.data.active && response.data.subscription_type) {
          setSubscription({
            active: true,
            type: response.data.subscription_type,
            expires_at: response.data.expiration_date,

            features: response.data.features || [],
          });
        } else {
          setSubscription(null);
        }
      } else {
        console.error('Invalid subscription status response');
        setSubscription(null);
      }
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      setSubscription(null);
    }
  };

  const handleOpenTransactionDetails = transaction => {
    setSelectedTransaction(transaction);
    setDetailDialogOpen(true);
  };

  const handleCloseTransactionDetails = () => {
    setDetailDialogOpen(false);
    setSelectedTransaction(null);
  };

  const formatCurrency = amount => {
    const absAmount = Math.abs(amount);
    return `${amount < 0 ? '-' : '+'}${formatNumberWithSpaces(absAmount)}`;
  };

  const formatNumberWithSpaces = number => {
    if (number === null || number === undefined) return '0';

    // Safari-совместимый способ разделения чисел пробелами
    // Используем простую логику без lookahead/lookbehind
    const str = number.toString();
    const parts = [];
    let i = str.length;

    while (i > 0) {
      const start = Math.max(0, i - 3);
      parts.unshift(str.slice(start, i));
      i = start;
    }

    return parts.join(' ');
  };

  const getTransactionId = transaction => {
    return `TR-${transaction.id || new Date(transaction.date).getTime().toString().slice(-8)}`;
  };

  const fetchGameTransactions = async () => {
    try {
      const response = await axios.get('/api/user/transactions-history');
      if (response.data && response.data.transactions) {
        setGameTransactions(response.data.transactions);
      }
    } catch (error) {
      console.error('Ошибка при получении истории игровых транзакций:', error);
    }
  };

  // Add new useEffect to reset loading state when username changes
  useEffect(() => {
    // If user changes the username, cancel any loading state
    if (userSearch.loading) {
      setUserSearch(prev => ({
        ...prev,
        loading: false,
      }));
    }
  }, [transferData.username]);

  // Update the dialog close handler
  const handleCloseTransferDialog = () => {
    // Clear the debounce timer properly
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    // Reset all state
    setTransferDialogOpen(false);
    setTransferData({
      username: '',
      amount: '',
      message: '',
      recipient_id: null,
    });
    setTransferErrors({});
    setUserSearch({
      loading: false,
      exists: false,
      suggestions: [],
    });
  };

  // Find the useEffect for dialog closing and update it
  useEffect(() => {
    if (!newTransferMenuOpen && debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  }, [newTransferMenuOpen]);

  // Add a cleanup useEffect after the existing one
  useEffect(() => {
    // Cleanup function for component unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, []);

  // Add handler for the new transfer menu
  const handleNewTransferSuccess = receiptData => {
    // Don't set transferSuccess to true, as the new component has its own success UI
    // Just update the balance and history
    fetchUserPoints();
    fetchTransferHistory();
  };

  const handleDecorationSelectionSuccess = selectedDecoration => {
    // Обновляем статус подписки после выбора декорации
    fetchSubscriptionStatus();

    // Показываем уведомление об успешном выборе
    setSnackbar({
      open: true,
      message: `Декорация "${selectedDecoration.name}" успешно применена!`,
      severity: 'success',
    });
  };

  const handleCheckDecoration = async () => {
    setIsCheckingDecoration(true);
    setDecorationCheckError('');

    try {
      const response = await axios.get('/api/ultimate/decorations/check');

      if (response.data.success) {
        if (response.data.needs_selection) {
          // Показываем модалку выбора декорации
          setAvailableDecorations(response.data.available_decorations || []);
          setDecorationModalOpen(true);
        } else {
          // У пользователя уже есть декорация
          setSnackbar({
            open: true,
            message: 'У вас уже есть декорация профиля',
            severity: 'info',
          });
        }
      } else {
        setDecorationCheckError(
          response.data.error || 'Ошибка при проверке декорации'
        );
      }
    } catch (error) {
      console.error('Ошибка при проверке декорации:', error);
      setDecorationCheckError(
        error.response?.data?.error || 'Произошла ошибка при проверке декорации'
      );
    } finally {
      setIsCheckingDecoration(false);
    }
  };

  const getTransactionDescription = transaction => {
    switch (transaction.transaction_type) {
      case 'weekly_activity':
        return 'Еженедельное начисление баллов за активность';
      case 'custom_period_activity':
        return 'Начисление баллов за активность за период';
      case 'top_prize':
        if (transaction.description.includes('Ultimate подписка')) {
          return 'Приз за 1 место - Ultimate подписка на 30 дней';
        } else if (transaction.description.includes('2 место')) {
          return 'Приз за 2 место - бонусные баллы';
        } else if (transaction.description.includes('3 место')) {
          return 'Приз за 3 место - бонусные баллы';
        }
        return transaction.description;
      case 'compensation':
        return 'Компенсация';
      case 'conversion_deposit':
        return 'Конвертация - пополнение';
      case 'conversion_withdrawal':
        return 'Конвертация - списание';
      case 'blackjack_win':
      case 'blackjack_win_21':
        return 'Выигрыш в блэкджек';
      case 'blackjack_lose':
      case 'blackjack_lose_bust':
        return 'Проигрыш в блэкджек';
      case 'blackjack_tie':
        return 'Ничья в блэкджек';
      case 'blackjack_bet':
        return 'Ставка в блэкджек';
      case 'roulette_win':
        return 'Выигрыш в рулетке';
      case 'roulette_bet':
        return 'Ставка в рулетке';
      case 'cups_win':
        return 'Выигрыш в игре "Чашки"';
      case 'minigame_bet':
        return 'Ставка в мини-игре';
      case 'auction_bid':
      case 'auction_bid_increase':
        return 'Ставка на аукционе';
      case 'auction_bid_refund':
      case 'auction_refund':
        return 'Возврат ставки с аукциона';
      case 'auction_sale':
        return 'Продажа на аукционе';
      case 'username_auction_bid':
        return 'Ставка на аукционе юзернейма';
      case 'username_auction_refund':
        return 'Возврат ставки с аукциона юзернейма';
      case 'username_auction_sale':
      case 'username_bid_accepted_sale':
        return 'Продажа юзернейма на аукционе';
      case 'username_immediate_purchase':
      case 'username_purchase':
        return 'Покупка юзернейма';
      case 'pack_purchase':
        return 'Покупка пачки';
      case 'marketplace_buy':
        return 'Покупка на маркетплейсе';
      case 'marketplace_sell':
        return 'Продажа на маркетплейсе';
      case 'item_transfer':
        return 'Передача предмета';
      case 'item_upgrade':
        return 'Апгрейд предмета';
      case 'purchase':
        return 'Покупка';
      case 'transfer':
        return transaction.description || 'Перевод баллов';
      case 'royalty':
        return 'Роялти';
      case 'game':
        return 'Игровая транзакция';
      case 'key_redeem':
        return 'Активация ключа';
      default:
        return transaction.description || 'Транзакция';
    }
  };

  const renderTransactionRow = transaction => {
    const positiveTypes = [
      'weekly_activity',
      'custom_period_activity',
      'top_prize',
      'royalty',
      'key_redeem',
      'compensation',
      'conversion_deposit',
      'blackjack_win',
      'blackjack_win_21',
      'roulette_win',
      'cups_win',
      'auction_bid_refund',
      'auction_refund',
      'auction_sale',
      'username_auction_refund',
      'username_auction_sale',
      'username_bid_accepted_sale',
      'marketplace_sell',
    ];
    const isPositive = positiveTypes.includes(transaction.transaction_type);
    const amount = transaction.amount || 0;

    return (
      <TableRow
        key={getTransactionId(transaction)}
        hover
        onClick={() => handleOpenTransactionDetails(transaction)}
        sx={{ cursor: 'pointer' }}
      >
        <TableCell>
          <Typography variant='body2'>
            {getTransactionDescription(transaction)}
          </Typography>
          <Typography variant='caption' color='textSecondary'>
            {formatDate(transaction.created_at)}
          </Typography>
        </TableCell>
        <TableCell align='right'>
          <Typography
            variant='body2'
            color={isPositive ? 'success.main' : 'error.main'}
            sx={{ fontWeight: 'bold' }}
          >
            {isPositive ? '+' : '-'}
            {formatCurrency(amount)}
          </Typography>
        </TableCell>
      </TableRow>
    );
  };

  // Calculate paginated transactions
  const paginatedTransactions = React.useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return allTransactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [allTransactions, currentPage]);

  const hasNextPage = allTransactions.length > currentPage * ITEMS_PER_PAGE;

  const handleNextPage = () => {
    setCurrentPage(prev => prev + 1);
  };

  if (loading) {
    return (
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        minHeight='80vh'
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container
      maxWidth='md'
      sx={{
        pb: 12.5,
        pl: '0 !important',
        pr: '0 !important',
        paddingTop: 2,
        marginLeft: 0, // Прижимаем к левой стороне
        marginRight: 'auto', // Оставляем auto только справа
        [theme.breakpoints.down('sm')]: { pl: 1, pr: 1 },
      }}
    >
      <InfoBlock
        styleVariant='dark'
        sx={{
          '&::before': {
            bottom: 0,
            transform: 'rotate(-12deg)',
          },
          '&::after': {
            bottom: 0,
            transform: 'rotate(12deg)',
          },
        }}
        title={
          <Box sx={{ textAlign: 'center' }}>
            <PointsIcon>
              {balanceType === 'kballs' ? (
                <BallsSVG />
              ) : (
                <MaxIcon size={32} color="#cfbcfb" />
              )}
            </PointsIcon>
            <Typography
              variant='subtitle1'
              sx={{
                color: 'rgba(255,255,255,0.8)',
                marginBottom: 1,
              }}
            >
              {balanceType === 'kballs' 
                ? t('balance.current_balance.title')
                : 'MCoin Баланс'
              }
            </Typography>
            <BalanceAmount>
              {balanceType === 'kballs' 
                ? formatNumberWithSpaces(userPoints)
                : formatNumberWithSpaces(mcoinBalance)
              }
            </BalanceAmount>
          </Box>
        }
        description={
          <>
            <ActionButtonsContainer>
              <ActionButtonItem
                key='action-pay'
                onClick={() => {
                  if (balanceType === 'mcoin') {
                    fetchDecorations();
                    setMcoinPurchaseModalOpen(true);
                  } else {
                    navigate('/badge-shop');
                  }
                }}
              >
                <ActionCircleIcon>
                  <PaymentIcon />
                </ActionCircleIcon>
                <ActionButtonText>{t('balance.actions.pay')}</ActionButtonText>
              </ActionButtonItem>

              <ActionButtonItem
                key='action-topup'
                onClick={() => {
                  setOpenKeyDialog(true);
                  setKeySuccess(null);
                  setActiveTopupTab(0);
                }}
              >
                <ActionCircleIcon>
                  <AddIcon />
                </ActionCircleIcon>
                <ActionButtonText>{t('balance.actions.topup')}</ActionButtonText>
              </ActionButtonItem>

              <ActionButtonItem
                key='action-transfer'
                onClick={() => setNewTransferMenuOpen(true)}
              >
                <ActionCircleIcon>
                  <SendIcon />
                </ActionCircleIcon>
                <ActionButtonText>
                  {t('balance.actions.transfer')}
                </ActionButtonText>
              </ActionButtonItem>
            </ActionButtonsContainer>
            
            <BalanceToggleContainer>
              <ToggleButton
                active={balanceType === 'kballs'}
                onClick={() => setBalanceType('kballs')}
              >
                <ToggleIcon>
                  <BallsSVG />
                </ToggleIcon>
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  Kballs
                </Typography>
              </ToggleButton>
              
              <ToggleButton
                active={balanceType === 'mcoin'}
                onClick={() => setBalanceType('mcoin')}
              >
                <ToggleIcon>
                  <MaxIcon size={16} color="currentColor" />
                </ToggleIcon>
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  MCoin
                </Typography>
              </ToggleButton>
            </BalanceToggleContainer>
          </>
        }
      />

      <InfoBlock
        styleVariant='dark'
        description={
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CalendarTodayIcon
                sx={{ mr: 1, color: 'rgba(255,255,255,0.7)' }}
              />
              <Typography
                component='div'
                variant='body2'
                sx={{ color: 'rgba(255,255,255,0.7)' }}
              >
                {`${weekRange.start} — ${weekRange.end}`}
              </Typography>
            </Box>

            <Typography
              component='div'
              variant='h4'
              sx={{ fontWeight: 'bold', color: '#4caf50', mb: 2 }}
            >
              {`+${formatNumberWithSpaces(weeklyEstimate)} ${t('balance.current_balance.points_suffix')}`}
            </Typography>

            <Typography
              component='div'
              variant='body2'
              sx={{ color: 'rgba(255,255,255,0.7)' }}
            >
              {t('balance.weekly_forecast.description')}
            </Typography>
          </>
        }
      />

      <InfoBlock
        styleVariant='dark'
        title={
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              cursor: 'pointer',
              marginBottom: 0,
            }}
            onClick={() => setIsPointsInfoExpanded(!isPointsInfoExpanded)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <InfoIcon sx={{ mr: 1, color: 'rgba(255,255,255,0.7)' }} />
              <Typography variant='h6' sx={{ color: 'white' }}>
                {t('balance.weekly_forecast.how_to_earn.title')}
              </Typography>
              <ExpandIcon expanded={isPointsInfoExpanded} sx={{ ml: 1 }} />
            </Box>
            <Box onClick={e => e.stopPropagation()}>
              <Tooltip title={t('balance.weekly_forecast.how_to_earn.tooltip')}>
                <IconButton
                  size='small'
                  component={Link}
                  to='/leaderboard'
                  sx={{
                    color: 'rgba(255,255,255,0.7)',
                    '&:hover': {
                      color: 'white',
                      backgroundColor: 'var(--theme-background, rgba(255,255,255,0.1))',
                    },
                  }}
                >
                  <TimelineIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        }
        description={
          <ExpandableContent expanded={isPointsInfoExpanded}>
            <Typography
              component='div'
              variant='body2'
              sx={{ color: 'rgba(255,255,255,0.7)', mt: 2 }}
            >
              {t('balance.weekly_forecast.how_to_earn.description')}
            </Typography>
            <Box
              component='ul'
              sx={{
                color: 'rgba(255,255,255,0.7)',
                mt: 1,
                pl: 2,
                '& li': { mb: 1 },
              }}
            >
              <Typography component='div' variant='subtitle2' gutterBottom>
                {t('balance.points.earning_methods.title')}
              </Typography>
              <li key='points-posts'>
                {t('balance.points.earning_methods.posts')}
              </li>
              <li key='points-likes'>
                {t('balance.points.earning_methods.likes')}
              </li>
              <li key='points-replies'>
                {t('balance.points.earning_methods.replies')}
              </li>
              <li key='points-reposts'>
                {t('balance.points.earning_methods.reposts')}
              </li>
              <li key='points-reactions'>
                {t('balance.points.earning_methods.reactions')}
              </li>
            </Box>
            <Typography
              component='div'
              variant='body2'
              sx={{ color: 'rgba(255,255,255,0.7)', mt: 2 }}
            >
              {t('balance.weekly_forecast.how_to_earn.details')}
            </Typography>
          </ExpandableContent>
        }
      />

      <StyledTabs
        value={tabValue}
        onChange={handleTabChange}
        variant='fullWidth'
        fullWidth={true}
        tabs={[
          {
            label: t('balance.tabs.history'),
            value: 0,
            icon: ReceiptLongIcon,
            iconPosition: 'start',
          },
          {
            label: t('balance.tabs.assets'),
            value: 1,
            icon: DiamondIcon,
            iconPosition: 'start',
          },
          {
            label: t('balance.tabs.subscription'),
            value: 2,
            icon: FlashOnIcon,
            iconPosition: 'start',
            key: 'subscription-tab',
          },
        ]}
      />

      <TabPanel value={tabValue} index={0}>
        <InfoBlock
          styleVariant='dark'
          description={null}
          sx={{
            pt: 0,
            padding: '2.5px',
            '&::before': {
              top: 0,
              transform: 'rotate(-12deg)',
              height: '90px',
            },
            '&::after': {
              top: 0,
              transform: 'rotate(12deg)',
              height: '90px',
            },
          }}
        >
          {loading ? (
            <Box display='flex' justifyContent='center' my={4}>
              <CircularProgress size={30} />
            </Box>
          ) : allTransactions.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant='body2' color='text.secondary'>
                {t('balance.transactions.no_history')}
              </Typography>
            </Box>
          ) : (
            <>
              <List sx={{ width: '100%' }}>
                {paginatedTransactions.map((transaction, index) => (
                  <TransactionItem
                    key={`${transaction.type}-${transaction.id || index}`}
                    onClick={() => handleOpenTransactionDetails(transaction)}
                  >
                    <BankStyleTransactionItem>
                      <TransactionAvatar
                        transactionType={
                          transaction.amount > 0 ? 'positive' : 'negative'
                        }
                      >
                        {transaction.type === 'purchase' ? (
                          <BadgeImage
                            src={`/static/images/bages/shop/${transaction.badge.image_path}`}
                            alt={transaction.badge.name}
                          />
                        ) : (
                          transaction.icon
                        )}
                      </TransactionAvatar>
                      <TransactionInfo>
                        <TransactionTitle>{transaction.title}</TransactionTitle>
                        <TransactionDate>
                          {formatDate(transaction.date)}
                        </TransactionDate>
                      </TransactionInfo>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-end',
                        }}
                      >
                        <TransactionAmount
                          type={
                            transaction.amount > 0 ? 'positive' : 'negative'
                          }
                        >
                          {transaction.amount > 0 ? '+' : ''}
                          {formatNumberWithSpaces(transaction.amount)}
                          {balanceType === 'mcoin' ? ' MCoin' : ''}
                        </TransactionAmount>
                        <Typography
                          variant='caption'
                          sx={{ mt: 0.5, fontWeight: 500, opacity: 0.7 }}
                        >
                          {transaction.description &&
                          transaction.description.length > 18
                            ? transaction.description.slice(0, 18) + '...'
                            : transaction.description}
                        </Typography>
                      </Box>
                    </BankStyleTransactionItem>
                  </TransactionItem>
                ))}
              </List>
              {hasNextPage && (
                <Box display='flex' justifyContent='center' mt={2} mb={1}>
                  <Button
                    variant='outlined'
                    onClick={handleNextPage}
                    endIcon={<ArrowForwardIcon />}
                  >
                    {t('balance.transactions.load_more')}
                  </Button>
                </Box>
              )}
            </>
          )}
        </InfoBlock>
      </TabPanel>

      <UniversalModal
        open={detailDialogOpen}
        onClose={handleCloseTransactionDetails}
        title="Детали транзакции"
        maxWidth="sm"
        fullWidth
        disablePadding
      >
        {selectedTransaction && (
          <>
            <TransactionDetailHeader
              type={selectedTransaction.amount > 0 ? 'income' : 'expense'}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {selectedTransaction.type === 'transfer' &&
                  selectedTransaction.sender_id ===
                    selectedTransaction.recipient_id &&
                  selectedTransaction.message ===
                    t('balance.transactions.clicker_withdrawal_message') ? (
                    <TouchAppIcon sx={{ mr: 1, color: 'success.main' }} />
                  ) : selectedTransaction.type === 'transfer' &&
                    selectedTransaction.is_sender ? (
                    <CallMadeIcon sx={{ mr: 1, color: 'error.main' }} />
                  ) : selectedTransaction.type === 'transfer' ? (
                    <CallReceivedIcon sx={{ mr: 1, color: 'success.main' }} />
                  ) : selectedTransaction.type === 'purchase' ? (
                    <ShoppingCartIcon sx={{ mr: 1, color: 'error.main' }} />
                  ) : selectedTransaction.type === 'username' ? (
                    <AccountCircleIcon sx={{ mr: 1, color: 'info.main' }} />
                  ) : selectedTransaction.type === 'weekly_activity' ? (
                    <TrendingUpIcon sx={{ mr: 1, color: 'success.main' }} />
                  ) : selectedTransaction.type === 'mcoin' ? (
                    <CurrencyExchangeIcon
                      sx={{
                        mr: 1,
                        color:
                          selectedTransaction.amount > 0
                            ? 'success.main'
                            : 'error.main',
                      }}
                    />
                  ) : selectedTransaction.type === 'game' ? (
                    <CasinoIcon
                      sx={{
                        mr: 1,
                        color:
                          selectedTransaction.amount > 0
                            ? 'success.main'
                            : 'error.main',
                      }}
                    />
                  ) : (
                    <DiamondIcon sx={{ mr: 1, color: 'success.main' }} />
                  )}
                                    <Typography
                    variant='subtitle1'
                    fontWeight={600}
                    color='text.primary'
                  >
                    {selectedTransaction.type === 'transfer'
                      ? selectedTransaction.sender_id ===
                          selectedTransaction.recipient_id &&
                        selectedTransaction.message ===
                          t('balance.transactions.clicker_withdrawal_message')
                        ? t('balance.transactions.clicker_withdrawal')
                        : selectedTransaction.is_sender
                          ? t('balance.transactions.transfer')
                          : t('balance.transactions.deposit')
                      : selectedTransaction.type === 'purchase'
                        ? t('balance.transactions.badge_purchase')
                        : selectedTransaction.type === 'royalty'
                          ? t('balance.transactions.royalty_from_purchase')
                          : selectedTransaction.type === 'weekly_activity'
                            ? t('balance.transactions.weekly_points')
                            : selectedTransaction.type ===
                                'custom_period_activity'
                              ? t('balance.transactions.custom_period_activity')
                              : selectedTransaction.type === 'username'
                                ? t('balance.transactions.username_purchase')
                                : selectedTransaction.type === 'mcoin'
                                  ? (() => {
                                      // Специальная обработка для MCoin транзакций
                                      if (selectedTransaction.transaction_type) {
                                        if (selectedTransaction.transaction_type.startsWith('payment_deposit')) {
                                          return 'Пополнение через платеж';
                                        }
                                        if (selectedTransaction.transaction_type.startsWith('subscription_purchase')) {
                                          return 'Покупка подписки';
                                        }
                                        if (selectedTransaction.transaction_type.startsWith('decoration_purchase')) {
                                          return 'Покупка декорации';
                                        }
                                        if (selectedTransaction.transaction_type.startsWith('convert_to_points')) {
                                          return 'Конвертация в баллы';
                                        }
                                        if (selectedTransaction.transaction_type.startsWith('key_redemption')) {
                                          return 'Активация ключа';
                                        }
                                      }
                                      return selectedTransaction.title || 'Операция MCoin';
                                    })()
                                : selectedTransaction.type === 'game'
                                  ? getTransactionDescription(
                                      selectedTransaction
                                    )
                                  : selectedTransaction.type === 'compensation'
                                    ? t('balance.transactions.compensation')
                                    : selectedTransaction.type ===
                                        'conversion_deposit'
                                      ? t(
                                          'balance.transactions.conversion_deposit'
                                        )
                                      : selectedTransaction.type ===
                                          'conversion_withdrawal'
                                        ? t(
                                          'balance.transactions.conversion_withdrawal'
                                        )
                                        : selectedTransaction.type ===
                                            'top_prize'
                                          ? t('balance.transactions.top_prize')
                                          : getTransactionDescription(
                                              selectedTransaction
                                            )}
                  </Typography>
                </Box>
                <TransactionStatusChip 
                  label={
                    selectedTransaction.transaction_type && selectedTransaction.transaction_type.startsWith('payment_deposit') && selectedTransaction.payment_display
                      ? selectedTransaction.payment_display.status_display
                      : 'Выполнен'
                  } 
                  status={
                    selectedTransaction.transaction_type && selectedTransaction.transaction_type.startsWith('payment_deposit') && selectedTransaction.payment
                      ? selectedTransaction.payment.status
                      : 'completed'
                  } 
                />
              </Box>

              <TransactionDetailAmount
                type={selectedTransaction.amount > 0 ? 'income' : 'expense'}
              >
                {balanceType === 'mcoin' 
                  ? `${formatNumberWithSpaces(selectedTransaction.amount)} MCoin`
                  : formatCurrency(selectedTransaction.amount)
                }
                {selectedTransaction.transaction_type && selectedTransaction.transaction_type.startsWith('payment_deposit') && selectedTransaction.payment && (
                  <Typography variant='caption' color='text.secondary' sx={{ mt: 0.5 }}>
                    ({formatNumberWithSpaces(selectedTransaction.payment.amount_rub)} ₽)
                  </Typography>
                )}
              </TransactionDetailAmount>

              <Typography variant='caption' color='text.secondary'>
                {formatDate(selectedTransaction.date)}
              </Typography>
            </TransactionDetailHeader>

            <Box sx={{ overflow: 'auto', px: 2 }}>
              <DetailRow key='transaction-id'>
                <DetailLabel>ID транзакции</DetailLabel>
                <DetailValue>
                  {getTransactionId(selectedTransaction)}
                </DetailValue>
              </DetailRow>

              {selectedTransaction.type === 'transfer' && (
                <>
                  <DetailRow key='transfer-type'>
                    <DetailLabel>Тип</DetailLabel>
                    <DetailValue>
                      {selectedTransaction.sender_id ===
                        selectedTransaction.recipient_id &&
                      selectedTransaction.message ===
                        t('balance.transactions.clicker_withdrawal_message')
                        ? t('balance.transactions.clicker_withdrawal')
                        : selectedTransaction.is_sender
                          ? t('balance.transactions.transfer')
                          : t('balance.transactions.deposit')}
                    </DetailValue>
                  </DetailRow>

                  {selectedTransaction.sender_id ===
                    selectedTransaction.recipient_id &&
                  selectedTransaction.message ===
                    t('balance.transactions.clicker_withdrawal_message') ? (
                    <>
                      <DetailRow key='transfer-source'>
                        <DetailLabel>Источник</DetailLabel>
                        <DetailValue>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <TouchAppIcon
                              sx={{
                                fontSize: '1rem',
                                mr: 0.5,
                                color: 'success.main',
                              }}
                            />
                            <span>
                              {t('balance.transactions.clicker_points')}
                            </span>
                          </Box>
                        </DetailValue>
                      </DetailRow>
                      <DetailRow key='transfer-operation-type'>
                        <DetailLabel>Тип операции</DetailLabel>
                        <DetailValue>
                          {t('balance.transactions.withdrawal')}
                        </DetailValue>
                      </DetailRow>
                    </>
                  ) : (
                    <>
                      <DetailRow key='transfer-sender'>
                        <DetailLabel>Отправитель</DetailLabel>
                        <DetailValue>
                          {selectedTransaction.sender_username}
                        </DetailValue>
                      </DetailRow>
                      <DetailRow key='transfer-recipient'>
                        <DetailLabel>Получатель</DetailLabel>
                        <DetailValue>
                          {selectedTransaction.recipient_username}
                        </DetailValue>
                      </DetailRow>
                    </>
                  )}

                  {selectedTransaction.message && (
                    <DetailRow key='transfer-message'>
                      <DetailLabel>Сообщение</DetailLabel>
                      <DetailValue>{selectedTransaction.message}</DetailValue>
                    </DetailRow>
                  )}
                </>
              )}

              {selectedTransaction.type === 'purchase' && (
                <>
                  <DetailRow key='purchase-badge-name'>
                    <DetailLabel>Название бейджика</DetailLabel>
                    <DetailValue>{selectedTransaction.badge.name}</DetailValue>
                  </DetailRow>
                  {selectedTransaction.badge.description && (
                    <DetailRow key='purchase-badge-description'>
                      <DetailLabel>Описание</DetailLabel>
                      <DetailValue>
                        {selectedTransaction.badge.description}
                      </DetailValue>
                    </DetailRow>
                  )}
                </>
              )}

              {selectedTransaction.type === 'royalty' && (
                <>
                  <DetailRow key='royalty-badge-name'>
                    <DetailLabel>Название бейджика</DetailLabel>
                    <DetailValue>{selectedTransaction.badge_name}</DetailValue>
                  </DetailRow>
                  <DetailRow key='royalty-buyer'>
                    <DetailLabel>Покупатель</DetailLabel>
                    <DetailValue>{selectedTransaction.buyer_name}</DetailValue>
                  </DetailRow>
                </>
              )}

              {selectedTransaction.type === 'username' && (
                <DetailRow key='username-value'>
                  <DetailLabel>
                    {t('balance.transaction_details.username.label')}
                  </DetailLabel>
                  <DetailValue>
                    {t('balance.transaction_details.username.prefix')}
                    {selectedTransaction.username}
                  </DetailValue>
                </DetailRow>
              )}

              {selectedTransaction.type === 'weekly_activity' && (
                <>
                  <DetailRow key='weekly-activity-type'>
                    <DetailLabel>
                      {t('balance.transaction_details.operation.type')}
                    </DetailLabel>
                    <DetailValue>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <TrendingUpIcon
                          sx={{
                            fontSize: '1rem',
                            mr: 0.5,
                            color: 'success.main',
                          }}
                        />
                        <span>{t('balance.transactions.weekly_points')}</span>
                      </Box>
                    </DetailValue>
                  </DetailRow>

                  <DetailRow key='weekly-activity-description'>
                    <DetailLabel>
                      {t('balance.transaction_details.operation.description')}
                    </DetailLabel>
                    <DetailValue>{selectedTransaction.description}</DetailValue>
                  </DetailRow>

                  <DetailRow key='weekly-activity-date'>
                    <DetailLabel>
                      {t('balance.transaction_details.operation.date')}
                    </DetailLabel>
                    <DetailValue>
                      {formatDate(selectedTransaction.date)}
                    </DetailValue>
                  </DetailRow>
                </>
              )}

              {selectedTransaction.type === 'game' && (
                <>
                  <DetailRow key='game-operation-type'>
                    <DetailLabel>
                      {t('balance.transaction_details.operation.type')}
                    </DetailLabel>
                    <DetailValue>{selectedTransaction.description}</DetailValue>
                  </DetailRow>
                  <DetailRow key='game-description'>
                    <DetailLabel>
                      {t('balance.transaction_details.operation.description')}
                    </DetailLabel>
                    <DetailValue>{selectedTransaction.title}</DetailValue>
                  </DetailRow>
                </>
              )}

              {/* Информация о MCoin платежах */}
              {selectedTransaction.transaction_type && selectedTransaction.transaction_type.startsWith('payment_deposit') && selectedTransaction.payment && (
                <>
                  <DetailRow key='payment-order-id'>
                    <DetailLabel>Номер заказа</DetailLabel>
                    <DetailValue>{selectedTransaction.payment.order_id}</DetailValue>
                  </DetailRow>
                  
                  {selectedTransaction.payment.rukassa_id && (
                    <DetailRow key='payment-rukassa-id'>
                      <DetailLabel>ID в Rukassa</DetailLabel>
                      <DetailValue>{selectedTransaction.payment.rukassa_id}</DetailValue>
                    </DetailRow>
                  )}
                  
                  <DetailRow key='payment-amount-rub'>
                    <DetailLabel>Сумма в рублях</DetailLabel>
                    <DetailValue>{formatNumberWithSpaces(selectedTransaction.payment.amount_rub)} ₽</DetailValue>
                  </DetailRow>
                  

                  

                  
                  {selectedTransaction.payment.payment_method && selectedTransaction.payment.payment_method !== 'unknown' && (
                    <DetailRow key='payment-method'>
                      <DetailLabel>Способ оплаты</DetailLabel>
                      <DetailValue>
                        {selectedTransaction.payment_display && selectedTransaction.payment_display.payment_method_display 
                          ? selectedTransaction.payment_display.payment_method_display 
                          : selectedTransaction.payment.payment_method}
                      </DetailValue>
                    </DetailRow>
                  )}
                  
                  {selectedTransaction.payment.payment_system && (
                    <DetailRow key='payment-system'>
                      <DetailLabel>Платежная система</DetailLabel>
                      <DetailValue>
                        {selectedTransaction.payment_display && selectedTransaction.payment_display.payment_system_display 
                          ? selectedTransaction.payment_display.payment_system_display 
                          : selectedTransaction.payment.payment_system}
                      </DetailValue>
                    </DetailRow>
                  )}
                  
                  {selectedTransaction.payment.currency && (
                    <DetailRow key='payment-currency'>
                      <DetailLabel>Валюта</DetailLabel>
                      <DetailValue>{selectedTransaction.payment.currency}</DetailValue>
                    </DetailRow>
                  )}
                  

                  
                  <DetailRow key='payment-created-at'>
                    <DetailLabel>Дата создания</DetailLabel>
                    <DetailValue>{formatDate(selectedTransaction.payment.created_at)}</DetailValue>
                  </DetailRow>
                  
                  {selectedTransaction.payment.completed_at && (
                    <DetailRow key='payment-completed-at'>
                      <DetailLabel>Дата завершения</DetailLabel>
                      <DetailValue>{formatDate(selectedTransaction.payment.completed_at)}</DetailValue>
                    </DetailRow>
                  )}
                </>
              )}

              {/* Информация о других MCoin транзакциях */}
              {selectedTransaction.transaction_type && (
                <>
                  {selectedTransaction.transaction_type.startsWith('subscription_purchase_') && (
                    <DetailRow key='subscription-type'>
                      <DetailLabel>Тип подписки</DetailLabel>
                      <DetailValue>
                        {(() => {
                          const subscriptionType = selectedTransaction.transaction_type.replace('subscription_purchase_', '');
                          const subscriptionNames = {
                            'premium': 'Premium',
                            'ultimate': 'Ultimate',
                            'max': 'MAX'
                          };
                          return subscriptionNames[subscriptionType] || 'Подписка';
                        })()}
                      </DetailValue>
                    </DetailRow>
                  )}
                  
                  {selectedTransaction.transaction_type.startsWith('decoration_purchase_') && (
                    <DetailRow key='decoration-id'>
                      <DetailLabel>ID декорации</DetailLabel>
                      <DetailValue>
                        {selectedTransaction.transaction_type.replace('decoration_purchase_', '')}
                      </DetailValue>
                    </DetailRow>
                  )}
                  
                  {selectedTransaction.transaction_type.startsWith('key_redemption_') && (
                    <DetailRow key='key-id'>
                      <DetailLabel>ID ключа</DetailLabel>
                      <DetailValue>
                        {selectedTransaction.transaction_type.replace('key_redemption_', '')}
                      </DetailValue>
                    </DetailRow>
                  )}
                  
                  {selectedTransaction.transaction_type.startsWith('convert_to_points_') && (
                    <DetailRow key='conversion-amount'>
                      <DetailLabel>Конвертировано</DetailLabel>
                      <DetailValue>
                        {(() => {
                          const amount = selectedTransaction.transaction_type.replace('convert_to_points_', '');
                          return `${amount} MCoin → ${amount * 250} баллов`;
                        })()}
                      </DetailValue>
                    </DetailRow>
                  )}
                </>
              )}

              <DetailRow key='transaction-amount'>
                <DetailLabel>
                  {t('balance.transaction_details.operation.amount')}
                </DetailLabel>
                <DetailValue
                  sx={{
                    color:
                      selectedTransaction.amount > 0
                        ? 'success.main'
                        : 'error.main',
                    fontWeight: 700,
                  }}
                >
                  {balanceType === 'mcoin' 
                    ? `${formatNumberWithSpaces(selectedTransaction.amount)} MCoin`
                    : formatCurrency(selectedTransaction.amount)
                  }
                </DetailValue>
              </DetailRow>



              {selectedTransaction.type === 'weekly_activity' && (
                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    bgcolor: 'rgba(76, 175, 80, 0.1)',
                    borderRadius: 2,
                  }}
                >
                  <Typography variant='body2' color='success.main'>
                    {t(
                      'balance.transaction_details.weekly_activity.description'
                    )}
                  </Typography>
                </Box>
              )}

              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '12px 16px',
                borderTop: '1px solid rgba(207, 188, 251, 0.2)',
                position: { xs: 'fixed', sm: 'sticky' },
                bottom: { xs: 0, sm: 'auto' },
                left: { xs: 0, sm: 'auto' },
                right: { xs: 0, sm: 'auto' },
                zIndex: { xs: 1000, sm: 'auto' },
                marginTop: { xs: 'auto', sm: 'auto' },
                gap: (selectedTransaction.type === 'transfer' || 
                      (selectedTransaction.sender_id === selectedTransaction.recipient_id &&
                       selectedTransaction.message === t('balance.transactions.clicker_withdrawal_message'))) ? '12px' : 0
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  gap: '12px', 
                  flex: (selectedTransaction.type === 'transfer' || 
                        (selectedTransaction.sender_id === selectedTransaction.recipient_id &&
                         selectedTransaction.message === t('balance.transactions.clicker_withdrawal_message'))) ? 1 : 0
                }}>
                  {selectedTransaction.type === 'transfer' && (
                    <Button
                      startIcon={<PictureAsPdfIcon />}
                      variant='outlined'
                      onClick={() =>
                        generateReceiptForTransaction(selectedTransaction)
                      }
                      sx={{ 
                        borderRadius: '12px',
                        borderColor: '#cfbcfb',
                        color: '#cfbcfb',
                        padding: '6px 12px',
                        fontSize: '0.875rem',
                        minHeight: '36px',
                        flex: 1,
                        '&:hover': {
                          borderColor: '#cfbcfb',
                          backgroundColor: 'rgba(207, 188, 251, 0.1)',
                        },
                      }}
                    >
                      {t('balance.transaction_details.receipt.download')}
                    </Button>
                  )}
                  {selectedTransaction.sender_id ===
                    selectedTransaction.recipient_id &&
                    selectedTransaction.message ===
                      t('balance.transactions.clicker_withdrawal_message') && (
                    <Button
                      startIcon={<TouchAppIcon />}
                      variant='outlined'
                      onClick={() =>
                        generateReceiptForTransaction(selectedTransaction)
                      }
                      sx={{ 
                        borderRadius: '12px',
                        borderColor: '#cfbcfb',
                        color: '#cfbcfb',
                        padding: '6px 12px',
                        fontSize: '0.875rem',
                        minHeight: '36px',
                        flex: 1,
                        '&:hover': {
                          borderColor: '#cfbcfb',
                          backgroundColor: 'rgba(207, 188, 251, 0.1)',
                        },
                      }}
                    >
                      {t('balance.transaction_details.receipt.payment')}
                    </Button>
                  )}
                </Box>
                <Button
                  variant='outlined'
                  onClick={handleCloseTransactionDetails}
                  sx={{ 
                    borderRadius: '12px',
                    border: '1px solid rgba(207, 188, 251, 0.5)',
                    borderColor: '#cfbcfb',
                    color: '#cfbcfb',
                    padding: '6px 12px',
                    fontSize: '0.875rem',
                    minHeight: '36px',
                    flex: (selectedTransaction.type === 'transfer' || 
                          (selectedTransaction.sender_id === selectedTransaction.recipient_id &&
                           selectedTransaction.message === t('balance.transactions.clicker_withdrawal_message'))) ? 1 : 'none',
                    width: (selectedTransaction.type === 'transfer' || 
                           (selectedTransaction.sender_id === selectedTransaction.recipient_id &&
                            selectedTransaction.message === t('balance.transactions.clicker_withdrawal_message'))) ? 'auto' : '100%',
                    '&:hover': {
                      borderColor: '#cfbcfb',
                      backgroundColor: 'rgba(207, 188, 251, 0.1)',
                    },
                  }}
                >
                  {t('balance.transaction_details.receipt.close')}
                </Button>
              </Box>
            </Box>
          </>
        )}
      </UniversalModal>

      <TabPanel value={tabValue} index={1}>
        <InfoBlock
          styleVariant='dark'
          description={null}
          sx={{
            pt: 0,
            padding: '2.5px',
            '&::before': {
              top: 0,
              transform: 'rotate(-12deg)',
              height: '90px',
            },
            '&::after': {
              top: 0,
              transform: 'rotate(12deg)',
              height: '90px',
            },
          }}
        >
          {createdBadges.length > 0 || usernamePurchases.length > 0 ? (
            <List sx={{ width: '100%' }}>
              {createdBadges.map(badge => (
                <Accordion
                  key={badge.id}
                  sx={{
                    mb: 2,
                    borderRadius: '12px',
                    overflow: 'hidden',
                    '&:before': { display: 'none' },
                    boxShadow: 'none',
                    background: 'rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{ borderRadius: '12px' }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                      }}
                    >
                      <Avatar
                        variant='rounded'
                        sx={{ mr: 2, bgcolor: 'background.paper', p: 0.5 }}
                      >
                        <CreatedBadgeImage
                          src={`/static/images/bages/shop/${badge.image_path}`}
                          alt={badge.name}
                        />
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant='subtitle1'>
                          {badge.name}
                        </Typography>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mt: 0.5,
                          }}
                        >
                          <Chip
                            size='small'
                            label={t('balance.assets.badges.points_cost', {
                              amount: badge.price,
                            })}
                            sx={{ mr: 1, fontSize: '0.7rem' }}
                          />
                          <Badge
                            badgeContent={badge.purchases.length}
                            color='primary'
                            sx={{ mr: 1 }}
                          >
                            <PeopleIcon fontSize='small' />
                          </Badge>
                          {badge.total_royalty_earned > 0 && (
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <MonetizationOnIcon
                                sx={{
                                  color: 'success.main',
                                  fontSize: '1rem',
                                  mr: 0.5,
                                }}
                              />
                              <Typography
                                variant='caption'
                                color='success.main'
                                fontWeight='bold'
                              >
                                +{badge.total_royalty_earned}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      paragraph
                    >
                      {badge.description ||
                        t('balance.assets.badges.no_description')}
                    </Typography>

                    {badge.purchases.length > 0 ? (
                      <>
                        <Typography variant='subtitle2' gutterBottom>
                          {t('balance.assets.badges.purchases.title', {
                            count: badge.purchases.length,
                          })}
                        </Typography>
                        <List
                          dense
                          sx={{
                            bgcolor: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: 2,
                            mb: 1,
                          }}
                        >
                          {badge.purchases.map((purchase, index) => (
                            <ListItem key={purchase.id || `purchase-${index}`}>
                              <ListItemAvatar>
                                <Avatar
                                  src={purchase.buyer.avatar_url}
                                  alt={purchase.buyer.name}
                                  sx={{ width: 32, height: 32 }}
                                />
                              </ListItemAvatar>
                              <ListItemText
                                primary={purchase.buyer.name}
                                secondary={
                                  <Box
                                    component='span'
                                    sx={{
                                      display: 'flex',
                                      flexDirection: 'column',
                                      mt: 0.5,
                                    }}
                                  >
                                    <Typography
                                      variant='caption'
                                      color='text.secondary'
                                    >
                                      {t(
                                        'balance.assets.badges.purchases.date',
                                        {
                                          date: formatDate(
                                            purchase.purchase_date
                                          ),
                                        }
                                      )}
                                    </Typography>
                                  </Box>
                                }
                              />
                              <Box
                                sx={{ display: 'flex', alignItems: 'center' }}
                              >
                                <MonetizationOnIcon
                                  sx={{
                                    color: 'success.main',
                                    fontSize: '1rem',
                                    mr: 0.5,
                                  }}
                                />
                                <Typography
                                  variant='caption'
                                  color='success.main'
                                  fontWeight='bold'
                                >
                                  +{purchase.royalty_amount}
                                </Typography>
                              </Box>
                            </ListItem>
                          ))}
                        </List>
                      </>
                    ) : (
                      <Typography variant='body2' color='text.secondary'>
                        {t('balance.assets.badges.purchases.none')}
                      </Typography>
                    )}
                  </AccordionDetails>
                </Accordion>
              ))}

              {createdBadges.length > 0 && usernamePurchases.length > 0 && (
                <Typography
                  variant='subtitle1'
                  sx={{
                    px: 2,
                    py: 1,
                    color: 'text.secondary',
                    fontWeight: 500,
                  }}
                >
                  {t('balance.assets.usernames.section_title')}
                </Typography>
              )}

              {usernamePurchases.map(purchase => (
                <ListItem
                  key={purchase.id}
                  sx={{
                    borderRadius: '12px',
                    mb: 2,
                    background: 'rgba(255, 255, 255, 0.05)',
                    padding: '12px 16px',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        bgcolor: purchase.is_active
                          ? 'success.main'
                          : 'action.disabled',
                        width: 40,
                        height: 40,
                      }}
                    >
                      <TagIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography
                          variant='subtitle1'
                          sx={{ fontWeight: 600 }}
                        >
                          @{purchase.username}
                        </Typography>
                        {purchase.is_active && (
                          <Chip
                            size='small'
                            label={t('balance.assets.usernames.active')}
                            color='success'
                            sx={{
                              ml: 1,
                              height: 20,
                              '& .MuiChip-label': { px: 1, py: 0.2 },
                            }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box
                        component='span'
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          mt: 0.5,
                        }}
                      >
                        <Typography variant='caption' color='text.secondary'>
                          {t('balance.assets.usernames.purchased_on')}:{' '}
                          {formatDate(purchase.purchase_date)}
                        </Typography>
                      </Box>
                    }
                  />
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      ml: 1,
                    }}
                  >
                    <MonetizationOnIcon
                      sx={{ color: 'error.main', fontSize: '1rem', mr: 0.5 }}
                    />
                    <Typography
                      variant='subtitle2'
                      fontWeight='bold'
                      color='error.main'
                    >
                      -{purchase.price_paid}
                    </Typography>
                  </Box>
                </ListItem>
              ))}
            </List>
          ) : (
            <Box
              sx={{
                textAlign: 'center',
                py: 5,
                px: 3,
                bgcolor: alpha(theme.palette.background.paper, 0.4),
                borderRadius: 4,
              }}
            >
              <AccountBalanceWalletIcon
                sx={{
                  fontSize: 60,
                  color: 'primary.main',
                  opacity: 0.7,
                  mb: 2,
                }}
              />
              <Typography component='div' variant='h6' gutterBottom>
                {t('balance.assets.empty.title')}
              </Typography>
              <Typography
                component='div'
                variant='body2'
                color='text.secondary'
                sx={{ mb: 3 }}
              >
                {t('balance.assets.empty.description')}
              </Typography>
              <Button
                variant='contained'
                color='primary'
                onClick={() => navigate('/username-auction')}
                startIcon={<AccountCircleIcon />}
                sx={{ mr: 2, mb: { xs: 2, sm: 0 } }}
              >
                {t('balance.assets.empty.username_auction')}
              </Button>
              <Button
                variant='outlined'
                color='primary'
                onClick={() => navigate('/badge-shop')}
                startIcon={<ShoppingCartIcon />}
              >
                {t('balance.assets.empty.badge_shop')}
              </Button>
            </Box>
          )}
        </InfoBlock>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <InfoBlock
          styleVariant='dark'
          description={null}
          sx={{
            pt: 0,
            padding: '2.5px',
          }}
        >
          {user && (user.account_type === 'channel' || user.is_channel === true) ? (
            <Card
              elevation={3}
              sx={{
                backgroundImage: `unset`,
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <DiamondIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography component='div' variant='h6' fontWeight='bold'>
                    Канал
                  </Typography>
                </Box>
                <Typography component='div' variant='body2' color='text.secondary'>
                  Это канал. Каналы имеют специкацию акканута. В дальнейшейм тут будет краткий дашборд с информацией о канале.
                </Typography>
              </CardContent>
            </Card>
          ) : subscription && subscription.active ? (
            <Card
              elevation={3}
              sx={{
                backgroundImage: `unset`,
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <DiamondIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography component='div' variant='h6' fontWeight='bold'>
                    {t('balance.subscription.active.title')}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography component='div' variant='body1'>
                    {t('balance.subscription.active.type')}:{' '}
                    <Chip
                      label={
                        subscription.type === 'basic'
                          ? t('balance.subscription.types.basic')
                          : subscription.type === 'premium'
                            ? t('balance.subscription.types.premium')
                            : subscription.type === 'ultimate'
                              ? t('balance.subscription.types.ultimate')
                              : subscription.type
                      }
                      color={
                        subscription.type === 'premium'
                          ? 'secondary'
                          : subscription.type === 'ultimate'
                            ? 'primary'
                            : 'default'
                      }
                      size='small'
                      sx={{ fontWeight: 'bold', ml: 1 }}
                    />
                  </Typography>

                  <Typography component='div' variant='body2'>
                    {t('balance.subscription.active.expires')}:{' '}
                    {new Date(subscription.expires_at).toLocaleDateString()}
                    <Typography
                      component='span'
                      variant='caption'
                      color='text.secondary'
                      sx={{ ml: 1 }}
                    >
                      {t('balance.subscription.active.days_left', {
                        days: Math.ceil(
                          (new Date(subscription.expires_at) - new Date()) /
                            (1000 * 60 * 60 * 24)
                        ),
                      })}
                    </Typography>
                  </Typography>

                  <Box sx={{ mt: 1 }}>
                    <Typography
                      component='div'
                      variant='body2'
                      fontWeight='medium'
                    >
                      {t('balance.subscription.active.features.title')}:
                    </Typography>
                    <List dense sx={{ pl: 2 }}>
                      {subscription.type === 'basic' && (
                        <Box key='basic-features'>
                          <ListItem key='basic-monthly-points' sx={{ py: 0 }}>
                            <ListItemText
                              primary={t(
                                'balance.subscription.active.features.basic.monthly_points'
                              )}
                            />
                          </ListItem>
                          <ListItem key='basic-no-ads' sx={{ py: 0 }}>
                            <ListItemText
                              primary={t(
                                'balance.subscription.active.features.basic.no_ads'
                              )}
                            />
                          </ListItem>
                          <ListItem key='basic-badge-limit' sx={{ py: 0 }}>
                            <ListItemText
                              primary={t(
                                'balance.subscription.active.features.basic.badge_limit'
                              )}
                            />
                          </ListItem>
                          <ListItem key='basic-username-limit' sx={{ py: 0 }}>
                            <ListItemText
                              primary={t(
                                'balance.subscription.active.features.basic.username_limit'
                              )}
                            />
                          </ListItem>
                        </Box>
                      )}
                      {subscription.type === 'premium' && (
                        <Box key='premium-features'>
                          <ListItem key='premium-monthly-points' sx={{ py: 0 }}>
                            <ListItemText
                              primary={t(
                                'balance.subscription.active.features.premium.monthly_points'
                              )}
                            />
                          </ListItem>
                          <ListItem key='premium-features' sx={{ py: 0 }}>
                            <ListItemText
                              primary={t(
                                'balance.subscription.active.features.premium.features'
                              )}
                            />
                          </ListItem>
                          <ListItem key='premium-support' sx={{ py: 0 }}>
                            <ListItemText
                              primary={t(
                                'balance.subscription.active.features.premium.support'
                              )}
                            />
                          </ListItem>
                          <ListItem key='premium-badge-limit' sx={{ py: 0 }}>
                            <ListItemText
                              primary={t(
                                'balance.subscription.active.features.premium.badge_limit'
                              )}
                            />
                          </ListItem>
                          <ListItem key='premium-username-limit' sx={{ py: 0 }}>
                            <ListItemText
                              primary={t(
                                'balance.subscription.active.features.premium.username_limit'
                              )}
                            />
                          </ListItem>
                        </Box>
                      )}
                      {(subscription.type === 'ultimate' || subscription.type === 'max') && (
                        <Box key='ultimate-features'>
                          <ListItem key='premium-benefits' sx={{ py: 0 }}>
                            <ListItemText
                              primary={t(
                                'balance.subscription.active.features.ultimate.premium_benefits'
                              )}
                            />
                          </ListItem>
                          <ListItem key='monthly-points' sx={{ py: 0 }}>
                            <ListItemText
                              primary={t(
                                'balance.subscription.active.features.ultimate.monthly_points'
                              )}
                            />
                          </ListItem>
                          <ListItem key='animated-badges' sx={{ py: 0 }}>
                            <ListItemText
                              primary={t(
                                'balance.subscription.active.features.ultimate.animated_badges'
                              )}
                            />
                          </ListItem>
                          <ListItem key='unlimited-badges' sx={{ py: 0 }}>
                            <ListItemText
                              primary={t(
                                'balance.subscription.active.features.ultimate.unlimited_badges'
                              )}
                            />
                          </ListItem>
                          <ListItem key='unlimited-usernames' sx={{ py: 0 }}>
                            <ListItemText
                              primary={t(
                                'balance.subscription.active.features.ultimate.unlimited_usernames'
                              )}
                            />
                          </ListItem>
                        </Box>
                      )}
                      {subscription.type === 'max' && (
                        <Box key='max-features'>
                          <ListItem key='max-exclusive' sx={{ py: 0 }}>
                            <ListItemText
                              primary="🔥 Эксклюзивный MAX значок"
                            />
                          </ListItem>
                          <ListItem key='max-priority' sx={{ py: 0 }}>
                            <ListItemText
                              primary="⚡ Приоритет во всех очередях"
                            />
                          </ListItem>
                          <ListItem key='max-manager' sx={{ py: 0 }}>
                            <ListItemText
                              primary="👑 Персональный менеджер"
                            />
                          </ListItem>
                          <ListItem key='max-closed' sx={{ py: 0 }}>
                            <ListItemText
                              primary="🔒 Доступ к закрытым функциям"
                            />
                          </ListItem>
                          <ListItem key='max-unlimited' sx={{ py: 0 }}>
                            <ListItemText
                              primary="∞ Максимальные лимиты на все"
                            />
                          </ListItem>
                          <ListItem key='max-beta' sx={{ py: 0 }}>
                            <ListItemText
                              primary="🚀 Ранний доступ к новым функциям"
                            />
                          </ListItem>
                          <ListItem key='max-animations' sx={{ py: 0 }}>
                            <ListItemText
                              primary="✨ Специальные анимации профиля"
                            />
                          </ListItem>
                          <ListItem key='max-customization' sx={{ py: 0 }}>
                            <ListItemText
                              primary="🎨 Неограниченные возможности кастомизации"
                            />
                          </ListItem>
                        </Box>
                      )}
                    </List>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ) : (
            <Box
              sx={{
                textAlign: 'center',
                py: 5,
                px: 3,
                bgcolor: alpha(theme.palette.background.paper, 0.4),
                borderRadius: 4,
              }}
            >
              <FlashOnIcon
                sx={{
                  fontSize: 60,
                  color: 'primary.main',
                  opacity: 0.7,
                  mb: 2,
                }}
              />
              <Typography component='div' variant='h6' gutterBottom>
                У вас нет активной подписки
              </Typography>
              <Typography
                component='div'
                variant='body2'
                color='text.secondary'
                sx={{ mb: 3 }}
              >
                Активируйте подписку, чтобы получить доступ к расширенным
                возможностям платформы
              </Typography>
              <Button
                variant='contained'
                color='primary'
                onClick={() => {
                  setOpenKeyDialog(true);
                  setKeySuccess(null);
                  setActiveTopupTab(0);
                }}
                startIcon={<AddIcon />}
              >
                Активировать ключ
              </Button>
            </Box>
          )}
        </InfoBlock>
      </TabPanel>

      <UniversalModal
        open={openKeyDialog}
        onClose={() => {
          if (!isSubmittingKey && !isCheckingDecoration) {
            setOpenKeyDialog(false);
            setKeyValue('');
            setKeyError('');
            setKeySuccess(null);
            setDecorationCheckError('');
            setActiveTopupTab(0);
          }
        }}
        title="Пополнение баланса"
        maxWidth="md"
        fullWidth
        addBottomPadding
      >
        <Box sx={{ bgcolor: 'transparent' }}>
          <StyledTabs
            value={activeTopupTab}
            onChange={(e, newValue) => {
              setActiveTopupTab(newValue);
              // Сбрасываем ошибки при смене вкладок
              setKeyError('');
              setDecorationCheckError('');
            }}
            tabs={[
              { value: 0, label: 'Пополнить' },
              { value: 1, label: t('balance.topup.tabs.key') },
              { value: 2, label: t('balance.topup.tabs.donate') },
              { value: 3, label: 'Проверить декорацию' },
            ]}
            fullWidth
            style={{ marginBottom: '16px' }}
          />

          {activeTopupTab === 0 ? (
            <ContentBox>
              <Typography
                component='div'
                variant='subtitle1'
                fontWeight='bold'
                gutterBottom
              >
                Пополнение MCoin
              </Typography>
              <Typography component='div' variant='body2' paragraph>
                Пополните баланс MCoin через платежную систему Rukassa.
                Курс пополнения: 1 рубль = 1 MCoin
              </Typography>

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 3,
                  p: 3,
                  borderRadius: 2,
                  mt: 2,
                }}
              >
                {/* Информация о курсе */}
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Typography variant='h6' sx={{ color: '#cfbcfb', mb: 1 }}>
                    Курс пополнения
                  </Typography>
                  <Typography variant='body1' sx={{ color: 'rgba(255, 255, 255, 0.87)' }}>
                    1 рубль = 1 MCoin
                  </Typography>
                </Box>

                {/* Поле ввода */}
                <Box sx={{ width: '100%', maxWidth: 300 }}>
                  <TextField
                    type="number"
                    label="Сумма в рублях"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Math.max(10, parseInt(e.target.value) || 10))}
                    fullWidth
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: 'rgba(255, 255, 255, 0.87)',
                        '& fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.23)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.4)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#cfbcfb',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255, 255, 255, 0.6)',
                        '&.Mui-focused': {
                          color: '#cfbcfb',
                        },
                      },
                    }}
                    InputProps={{
                      inputProps: { min: 10 }
                    }}
                  />
                </Box>

                {/* Результат пополнения */}
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant='body2' sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 1 }}>
                    Получите:
                  </Typography>
                  <Typography variant='h5' sx={{ color: '#cfbcfb', fontWeight: 600 }}>
                    {depositAmount} MCoin
                  </Typography>
                </Box>

                {/* Кнопка пополнения */}
                <Button
                  variant="contained"
                  fullWidth
                  disabled={depositLoading || depositAmount < 10}
                  onClick={handleCreateDeposit}
                  sx={{
                    bgcolor: '#cfbcfb',
                    color: 'white',
                    fontWeight: 600,
                    textTransform: 'none',
                    py: 1.5,
                    borderRadius: '8px',
                    '&:hover': {
                      bgcolor: '#cfbcfb',
                    },
                    '&:disabled': {
                      bgcolor: 'rgba(207, 188, 251, 0.3)',
                      color: 'rgba(255, 255, 255, 0.5)',
                    },
                  }}
                >
                  {depositLoading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    `Пополнить на ${depositAmount} ₽`
                  )}
                </Button>

                {/* Кнопка копирования ссылки (показывается если окно заблокировано) */}
                {showPaymentLink && paymentUrl && (
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={handleCopyPaymentLink}
                    sx={{
                      mt: 2,
                      borderColor: '#cfbcfb',
                      color: '#cfbcfb',
                      fontWeight: 600,
                      textTransform: 'none',
                      py: 1.5,
                      borderRadius: '8px',
                      '&:hover': {
                        borderColor: '#b8a8f0',
                        color: '#b8a8f0',
                      },
                    }}
                  >
                    📋 Скопировать ссылку для оплаты
                  </Button>
                )}

                {/* Информация о способах оплаты */}
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Typography variant='caption' sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                    Доступные валюты пополнения: RUB, USD, EUR, KZT
                  </Typography>
                </Box>
              </Box>
            </ContentBox>
                                  ) : activeTopupTab === 1 && !keySuccess ? (
              <ContentBox>
                <Typography component='div' variant='body1' gutterBottom>
                  {t('balance.topup.key.enter')}
                </Typography>

                <KeyTextField
                  fullWidth
                  label={t('balance.topup.key.label')}
                  variant='outlined'
                  placeholder={t('balance.topup.key.placeholder')}
                  value={keyValue}
                  onChange={handleKeyChange}
                  error={!!keyError}
                  helperText={keyError}
                  disabled={isSubmittingKey}
                  sx={{ mt: { xs: 1.5, sm: 2 }, mb: { xs: 1.5, sm: 2 } }}
                  InputProps={{
                    endAdornment: keyValue && (
                      <InputAdornment position='end'>
                        <IconButton onClick={() => setKeyValue('')} edge='end'>
                          <CloseIcon fontSize='small' />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Typography
                  component='div'
                  variant='caption'
                  color='text.secondary'
                >
                  {t('balance.topup.key.hint')}
                </Typography>
              </ContentBox>
            ) : activeTopupTab === 2 ? (
              <ContentBox>
                <Typography
                  component='div'
                  variant='subtitle1'
                  fontWeight='bold'
                  gutterBottom
                >
                  {t('balance.topup.donate.title')}
                </Typography>
                <Typography component='div' variant='body2' paragraph>
                  {t('balance.topup.donate.description')}
                </Typography>
                <Typography
                  component='div'
                  variant='body2'
                  sx={{ fontWeight: 'bold', mb: 2 }}
                >
                  {t('balance.topup.donate.rate')}
                </Typography>
                <Button
                  variant='outlined'
                  color='primary'
                  startIcon={<MonetizationOnIcon />}
                  fullWidth
                onClick={() => window.open('https://boosty.to/qsoul', '_blank')}
                sx={{ 
                  mt: { xs: 1.5, sm: 2 },
                  minHeight: { xs: '40px', sm: '48px' },
                  borderColor: '#cfbcfb',
                  color: '#cfbcfb',
                  '&:hover': {
                    borderColor: '#cfbcfb',
                    backgroundColor: 'rgba(207, 188, 251, 0.1)',
                  },
                }}
              >
                {t('balance.topup.donate.button')}
              </Button>
            </ContentBox>
          ) : activeTopupTab === 3 ? (
            <ContentBox>
              <Typography
                component='div'
                variant='subtitle1'
                fontWeight='bold'
                gutterBottom
              >
                Проверить доступность декорации
              </Typography>
              <Typography component='div' variant='body2' paragraph>
                Если у вас есть Ultimate/MAX подписка и еще нет декорации профиля,
                вы можете получить одну декорацию бесплатно.
              </Typography>

              {decorationCheckError && (
                <Alert severity='error' sx={{ mb: 2 }}>
                  {decorationCheckError}
                </Alert>
              )}

              <Button
                variant='outlined'
                color='primary'
                startIcon={<DiamondIcon />}
                fullWidth
                onClick={handleCheckDecoration}
                disabled={isCheckingDecoration}
                sx={{ 
                  mt: { xs: 1.5, sm: 2 },
                  minHeight: { xs: '40px', sm: '48px' },
                  borderColor: '#cfbcfb',
                  color: '#cfbcfb',
                  '&:hover': {
                    borderColor: '#cfbcfb',
                    backgroundColor: 'rgba(207, 188, 251, 0.1)',
                  },
                  '&:disabled': {
                    borderColor: 'rgba(207, 188, 251, 0.3)',
                    color: 'rgba(207, 188, 251, 0.5)',
                  },
                }}
              >
                {isCheckingDecoration ? (
                  <>
                    <CircularProgress
                      size={16}
                      color='inherit'
                      sx={{ mr: 1 }}
                    />
                    Проверяем...
                  </>
                ) : (
                  'Проверить доступность'
                )}
              </Button>
            </ContentBox>
          ) : activeTopupTab === 3 ? (
            <ContentBox>
              <Typography
                component='div'
                variant='subtitle1'
                fontWeight='bold'
                gutterBottom
              >
                Пополнение MCoin
              </Typography>
              <Typography component='div' variant='body2' paragraph>
                Пополните баланс MCoin через платежную систему Rukassa.
                Курс пополнения: 1 рубль = 1 MCoin
              </Typography>

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 3,
                  p: 3,
                  borderRadius: 2,
                  backgroundColor: '#1e1e1e',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  mt: 2,
                }}
              >
                {/* Информация о курсе */}
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Typography variant='h6' sx={{ color: '#cfbcfb', mb: 1 }}>
                    Курс пополнения
                  </Typography>
                  <Typography variant='body1' sx={{ color: 'rgba(255, 255, 255, 0.87)' }}>
                    1 рубль = 1 MCoin
                  </Typography>
                </Box>

                {/* Поле ввода */}
                <Box sx={{ width: '100%', maxWidth: 300 }}>
                  <TextField
                    type="number"
                    label="Сумма в рублях"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Math.max(10, parseInt(e.target.value) || 10))}
                    fullWidth
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: 'rgba(255, 255, 255, 0.87)',
                        '& fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.23)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.4)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#cfbcfb',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255, 255, 255, 0.6)',
                        '&.Mui-focused': {
                          color: '#cfbcfb',
                        },
                      },
                    }}
                    InputProps={{
                      inputProps: { min: 10 }
                    }}
                  />
                </Box>

                {/* Результат пополнения */}
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant='body2' sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 1 }}>
                    Получите:
                  </Typography>
                  <Typography variant='h5' sx={{ color: '#cfbcfb', fontWeight: 600 }}>
                    {depositAmount} MCoin
                  </Typography>
                </Box>

                {/* Кнопка пополнения */}
                <Button
                  variant="contained"
                  fullWidth
                  disabled={depositLoading || depositAmount < 10}
                  onClick={handleCreateDeposit}
                  sx={{
                    bgcolor: '#cfbcfb',
                    color: 'white',
                    fontWeight: 600,
                    textTransform: 'none',
                    py: 1.5,
                    borderRadius: 2,
                    '&:hover': {
                      bgcolor: '#cfbcfb',
                    },
                    '&:disabled': {
                      bgcolor: 'rgba(207, 188, 251, 0.3)',
                      color: 'rgba(255, 255, 255, 0.5)',
                    },
                  }}
                >
                  {depositLoading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    `Пополнить на ${depositAmount} ₽`
                  )}
                </Button>

                {/* Информация о способах оплаты */}
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Typography variant='caption' sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                    Доступные способы: карты, СБП, Яндекс.Деньги
                  </Typography>
                </Box>
              </Box>
            </ContentBox>
          ) : (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: { xs: 3, sm: 4 },
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  animation:
                    'pop-in 0.5s cubic-bezier(0.19, 1, 0.22, 1) forwards',
                  '@keyframes pop-in': {
                    '0%': { transform: 'scale(0)', opacity: 0 },
                    '80%': { transform: 'scale(1.1)', opacity: 1 },
                    '100%': { transform: 'scale(1)', opacity: 1 },
                  },
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  zIndex: 2,
                }}
              >
                <CheckCircleIcon color='success' sx={{ fontSize: { xs: 60, sm: 80 }, mb: { xs: 1.5, sm: 2 } }} />
                <Typography
                  component='div'
                  variant='h6'
                  gutterBottom
                  align='center'
                >
                  {t('balance.topup.key.success.title')}
                </Typography>
                <Typography component='div' variant='body1' align='center'>
                  {keySuccess?.message}
                </Typography>

                {keySuccess?.type === 'points' ? (
                  <Box
                    sx={{
                      mt: { xs: 2, sm: 3 },
                      p: { xs: 1.5, sm: 2 },
                      borderRadius: 2,
                      bgcolor: 'background.paper',
                      boxShadow: 1,
                      width: '100%',
                      maxWidth: 250,
                      animation: 'fade-in 1s ease-in-out forwards',
                      '@keyframes fade-in': {
                        from: { opacity: 0, transform: 'translateY(20px)' },
                        to: { opacity: 1, transform: 'translateY(0)' },
                      },
                    }}
                  >
                    <Typography
                      component='div'
                      variant='subtitle2'
                      color='text.secondary'
                      gutterBottom
                      align='center'
                    >
                      {t('balance.topup.key.success.new_balance')}
                    </Typography>
                    <Typography
                      component='div'
                      variant='h6'
                      color='primary'
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <AccountBalanceWalletIcon sx={{ mr: 1 }} />
                      {keySuccess?.newBalance}{' '}
                      {t('balance.topup.key.success.points')}
                    </Typography>
                  </Box>
                ) : keySuccess?.type === 'mcoin' ? (
                  <Box
                    sx={{
                      mt: { xs: 2, sm: 3 },
                      p: { xs: 1.5, sm: 2 },
                      borderRadius: 2,
                      bgcolor: 'background.paper',
                      boxShadow: 1,
                      width: '100%',
                      maxWidth: 250,
                      animation: 'fade-in 1s ease-in-out forwards',
                      '@keyframes fade-in': {
                        from: { opacity: 0, transform: 'translateY(20px)' },
                        to: { opacity: 1, transform: 'translateY(0)' },
                      },
                    }}
                  >
                    <Typography
                      component='div'
                      variant='subtitle2'
                      color='text.secondary'
                      gutterBottom
                      align='center'
                    >
                      {t('balance.topup.key.success.new_balance')}
                    </Typography>
                    <Typography
                      component='div'
                      variant='h6'
                      color='primary'
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <CurrencyExchangeIcon sx={{ mr: 1 }} />
                      {keySuccess?.newBalance}{' '}
                      MCoin
                    </Typography>
                    {keySuccess?.oldBalance !== null && (
                      <Typography
                        component='div'
                        variant='body2'
                        color='text.secondary'
                        align='center'
                        sx={{ mt: 1 }}
                      >
                        +{keySuccess?.mcoinAdded} MCoin
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <Box
                    sx={{
                      mt: { xs: 2, sm: 3 },
                      p: { xs: 1.5, sm: 2 },
                      borderRadius: 2,
                      bgcolor: 'background.paper',
                      boxShadow: 1,
                      width: '100%',
                      maxWidth: 300,
                      animation: 'fade-in 1s ease-in-out forwards',
                      '@keyframes fade-in': {
                        from: { opacity: 0, transform: 'translateY(20px)' },
                        to: { opacity: 1, transform: 'translateY(0)' },
                      },
                    }}
                  >
                    <Typography
                      component='div'
                      variant='subtitle2'
                      color='text.secondary'
                      gutterBottom
                      align='center'
                    >
                      {t('balance.topup.key.success.subscription_activated')}
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2,
                      }}
                    >
                      <Chip
                        label={keySuccess?.subscriptionType ? t(
                          `balance.subscription.types.${keySuccess.subscriptionType}`
                        ) : 'Подписка'}
                        color='secondary'
                        sx={{ fontSize: '1rem', py: 2, px: 1 }}
                      />
                    </Box>
                    <Typography
                      component='div'
                      variant='body2'
                      color='text.secondary'
                      align='center'
                    >
                      {t('balance.topup.key.success.expires_at', {
                        date: keySuccess?.expiresAt
                          ? new Date(keySuccess.expiresAt).toLocaleDateString()
                          : t('balance.subscription.duration.unlimited'),
                      })}
                    </Typography>
                    <Typography
                      component='div'
                      variant='body2'
                      color='text.secondary'
                      align='center'
                      sx={{ mt: 1 }}
                    >
                      {keySuccess?.duration_days ? t('balance.topup.key.success.duration', {
                        days: keySuccess.duration_days,
                      }) : 'Бессрочная подписка'}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </Box>

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '12px 16px',
          borderTop: '1px solid rgba(207, 188, 251, 0.2)',
          position: { xs: 'fixed', sm: 'sticky' },
          bottom: { xs: 0, sm: 'auto' },
          left: { xs: 0, sm: 'auto' },
          right: { xs: 0, sm: 'auto' },
          zIndex: { xs: 1000, sm: 'auto' },
          marginTop: { xs: 'auto', sm: 'auto' },
        }}>
          {!keySuccess ? (
            <>
              <CancelButton
                onClick={() => setOpenKeyDialog(false)}
                variant='outlined'
                disabled={isSubmittingKey}
                sx={{
                  borderRadius: '12px',
                  borderColor: '#cfbcfb',
                  color: '#cfbcfb',
                  padding: '6px 12px',
                  fontSize: '0.875rem',
                  minHeight: '36px',
                  '&:hover': {
                    borderColor: '#cfbcfb',
                    backgroundColor: 'rgba(207, 188, 251, 0.1)',
                  },
                }}
              >
                {t('balance.common.cancel')}
              </CancelButton>
              <ActionButton
                variant='outlined'
                onClick={handleRedeemKey}
                disabled={!keyValue || isSubmittingKey || keyValue.length < 19}
                startIcon={
                  isSubmittingKey ? (
                    <CircularProgress size={16} color='inherit' />
                  ) : null
                }
                sx={{
                  borderRadius: '12px',
                  borderColor: '#cfbcfb',
                  color: '#cfbcfb',
                  padding: '6px 12px',
                  fontSize: '0.875rem',
                  minHeight: '36px',
                  '&:hover': {
                    borderColor: '#cfbcfb',
                    backgroundColor: 'rgba(207, 188, 251, 0.1)',
                  },
                }}
              >
                {isSubmittingKey
                  ? t('balance.topup.key.process')
                  : t('balance.topup.key.activate')}
              </ActionButton>
            </>
          ) : (
            <ActionButton
              onClick={() => {
                setOpenKeyDialog(false);
                setKeySuccess(null);
                setKeyValue('');
              }}
              sx={{ 
                mx: 'auto',
                borderRadius: '12px',
                borderColor: '#cfbcfb',
                color: '#cfbcfb',
                padding: '6px 12px',
                fontSize: '0.875rem',
                minHeight: '36px',
                '&:hover': {
                  borderColor: '#cfbcfb',
                  backgroundColor: 'rgba(207, 188, 251, 0.1)',
                },
              }}
            >
              {t('balance.common.done')}
            </ActionButton>
          )}
        </Box>
      </UniversalModal>

      <UniversalModal
        open={transferSuccess}
        onClose={() => setTransferSuccess(false)}
        title={t('balance.transactions.success.title')}
        maxWidth="sm"
        fullWidth
      >
        <Box sx={{ p: 3, pt: 2.5, bgcolor: 'transparent' }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 2,
              textAlign: 'center',
            }}
          >
            <SuccessIconWrapper>
              <CheckCircleIcon color='success' sx={{ fontSize: 50 }} />
            </SuccessIconWrapper>

            <Typography component='div' variant='h5' gutterBottom>
              {t('balance.transactions.success.title')}
            </Typography>

            <Typography
              component='div'
              variant='body1'
              color='text.secondary'
              paragraph
            >
              {t('balance.transactions.success.amount_sent', {
                amount: transferData.amount,
                username: transferData.username,
              })}
            </Typography>

            <Typography component='div' variant='subtitle2' sx={{ mb: 2 }}>
              {t('balance.transactions.success.receipt_info')}
            </Typography>

            <ReceiptIconButton
              onClick={() => {
                if (receiptData) {
                  try {
                    downloadPdfReceipt(
                      receiptData.dataUrl,
                      `TR-${Date.now().toString().slice(-8)}`,
                      receiptData.filePath
                    );
                  } catch (error) {
                    console.error(
                      t('balance.transactions.success.receipt_error'),
                      error
                    );
                    setSnackbar({
                      open: true,
                      message: t('balance.transactions.success.receipt_error'),
                      severity: 'error',
                    });
                  }
                }
              }}
              startIcon={<PictureAsPdfIcon />}
              endIcon={<DownloadIcon />}
              disabled={!receiptData}
            >
              {t('balance.transactions.success.open_receipt')}
            </ReceiptIconButton>
          </Box>
        </Box>
      </UniversalModal>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
      />

      {/* New Transfer Menu Component */}
      <TransferMenu
        open={newTransferMenuOpen}
        onClose={() => setNewTransferMenuOpen(false)}
        userPoints={userPoints}
        onSuccess={handleNewTransferSuccess}
      />

      {/* Ultimate Decoration Selection Modal */}
      <UltimateDecorationModal
        open={decorationModalOpen}
        onClose={() => setDecorationModalOpen(false)}
        availableDecorations={availableDecorations}
        onSuccess={handleDecorationSelectionSuccess}
      />

      {/* MCoin Purchase Modal */}
      <UniversalModal
        open={mcoinPurchaseModalOpen}
        onClose={() => {
          setMcoinPurchaseModalOpen(false);
          setSelectedDecoration(null);
          setActiveTab(0);
        }}
        title="Покупка за MCoin"
        maxWidth="md"
        fullWidth
      >
        <Box sx={{ p: 0, pt: 2.5, bgcolor: 'transparent' }}>
          {/* Табы */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs 
              value={activeTab} 
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{
                '& .MuiTab-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                  '&.Mui-selected': {
                    color: '#cfbcfb',
                  },
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#cfbcfb',
                },
              }}
            >
              <Tab label="Подписки" />
              <Tab label="Декорации" />
              <Tab label="Конвертация" />
            </Tabs>
          </Box>

          {/* Таб Подписки */}
          {activeTab === 0 && (
            <Box>
              <Typography
                component='div'
                variant='body1'
                color='text.secondary'
                sx={{ mb: 3, textAlign: 'center' }}
              >
                Выберите подписку для покупки за MCoin
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {Object.entries(subscriptionPlans).map(([type, plan]) => (
                  <Box
                    key={type}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: 2,
                      borderRadius: 2,
                      backgroundColor: '#1e1e1e',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                      transition: 'all 0.3s ease',
                      cursor: plan.is_active || !isSubscriptionAvailable(type) ? 'default' : 'pointer',
                      opacity: plan.is_active || !isSubscriptionAvailable(type) ? 0.6 : 1,
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': plan.is_active || !isSubscriptionAvailable(type) ? {} : {
                        transform: 'translateY(-3px)',
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
                      },
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                    }}
                  >
                    {/* Иконка подписки */}
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '12px',
                        background: type === 'max' ? '#FF4D50' : '#cfbcfb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: 2,
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      {type === 'max' ? (
                        <MaxIcon size={32} color="#fff" />
                      ) : (
                        <DiamondIcon sx={{ fontSize: 32, color: '#fff' }} />
                      )}
                    </Box>

                    {/* Информация о подписке */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        component='div'
                        variant='subtitle1'
                        sx={{ 
                          fontWeight: 600, 
                          color: 'rgba(255, 255, 255, 0.87)',
                          mb: 0.5,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {plan.name}
                      </Typography>
                      
                      <Typography 
                        variant='body2' 
                        sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 1 }}
                      >
                        {plan.description}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <MaxIcon size={16} color="#FF4D50" />
                        <Typography 
                          variant='body2' 
                          sx={{ color: 'rgba(255, 255, 255, 0.6)' }}
                        >
                          {plan.price} MCoin
                        </Typography>
                      </Box>
                    </Box>

                    {/* Статус покупки */}
                    <Box sx={{ marginLeft: 'auto' }}>
                      {plan.is_active ? (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            color: '#4caf50',
                          }}
                        >
                          <CheckCircleIcon sx={{ fontSize: 20 }} />
                          <Typography variant='body2' sx={{ fontWeight: 500 }}>
                            Активна
                          </Typography>
                        </Box>
                      ) : !isSubscriptionAvailable(type) ? (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            color: 'rgba(255, 255, 255, 0.5)',
                          }}
                        >
                          <Typography variant='body2' sx={{ fontSize: '0.75rem' }}>
                            Недоступно
                          </Typography>
                        </Box>
                      ) : (
                        <Button
                          variant="contained"
                          size="small"
                          disabled={purchaseLoading || mcoinBalance < plan.price}
                          onClick={() => handlePurchaseSubscription(type)}
                          sx={{
                            bgcolor: type === 'max' ? '#FF4D50' : '#cfbcfb',
                            color: 'white',
                            fontWeight: 600,
                            textTransform: 'none',
                            px: 2,
                            py: 1,
                            borderRadius: 2,
                            '&:hover': {
                              bgcolor: type === 'max' ? '#E63946' : '#b8a8f0',
                            },
                            '&:disabled': {
                              bgcolor: type === 'max' ? 'rgba(255, 77, 80, 0.3)' : 'rgba(207, 188, 251, 0.3)',
                              color: 'rgba(255, 255, 255, 0.5)',
                            },
                          }}
                        >
                          {purchaseLoading ? (
                            <CircularProgress size={16} color="inherit" />
                          ) : (
                            'Купить'
                          )}
                        </Button>
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>

              {Object.keys(subscriptionPlans).length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant='body1' color='text.secondary'>
                    Нет доступных планов подписок
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {/* Таб Декорации */}
          {activeTab === 1 && (
            <Box>
              <Typography
                component='div'
                variant='body1'
                color='text.secondary'
                sx={{ mb: 3, textAlign: 'center' }}
              >
                Выберите декорацию для покупки за 199 MCoin
              </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {decorations.map((decoration) => (
              <Box
                key={decoration.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: 2,
                  borderRadius: 2,
                  backgroundColor: '#1e1e1e',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                  transition: 'all 0.3s ease',
                  cursor: decoration.is_purchased ? 'default' : 'pointer',
                  opacity: decoration.is_purchased ? 0.6 : 1,
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': decoration.is_purchased ? {} : {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
                  },
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                }}
              >
                {/* Декорация */}
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 2,
                    position: 'relative',
                    overflow: 'hidden',
                    ...getBackgroundStyles(decoration.background || '#2a2a2a'),
                  }}
                >
                  {decoration.item_path && (
                    <img
                      src={getDecorationImagePath(decoration.item_path)}
                      alt={decoration.name}
                      style={{
                        maxWidth: '80%',
                        maxHeight: '80%',
                        objectFit: 'contain',
                        ...parseItemSettings(decoration.item_path).styles,
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                </Box>

                {/* Информация о декорации */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    component='div'
                    variant='subtitle1'
                    sx={{ 
                      fontWeight: 600, 
                      color: (() => {
                        const bgType = getBackgroundType(decoration.background);
                        if (bgType === 'color' && isLightBackground(decoration.background)) {
                          return 'rgba(0, 0, 0, 0.87)';
                        }
                        return 'rgba(255, 255, 255, 0.87)';
                      })(),
                      mb: 0.5,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {decoration.name}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MaxIcon size={16} color="#FF4D50" />
                    <Typography 
                      variant='body2' 
                      sx={{ 
                        color: (() => {
                          const bgType = getBackgroundType(decoration.background);
                          if (bgType === 'color' && isLightBackground(decoration.background)) {
                            return 'rgba(0, 0, 0, 0.6)';
                          }
                          return 'rgba(255, 255, 255, 0.6)';
                        })(),
                      }}
                    >
                      199 MCoin
                    </Typography>
                  </Box>
                </Box>

                {/* Статус покупки */}
                <Box sx={{ marginLeft: 'auto' }}>
                  {decoration.is_purchased ? (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        color: '#4caf50',
                      }}
                    >
                      <CheckCircleIcon sx={{ fontSize: 20 }} />
                      <Typography variant='body2' sx={{ fontWeight: 500 }}>
                        Куплено
                      </Typography>
                    </Box>
                  ) : (
                    <Button
                      variant="contained"
                      size="small"
                      disabled={purchaseLoading || mcoinBalance < 199}
                      onClick={() => handlePurchaseDecoration(decoration.id)}
                      sx={{
                        bgcolor: '#cfbcfb',
                        color: 'white',
                        fontWeight: 600,
                        textTransform: 'none',
                        px: 2,
                        py: 1,
                        borderRadius: 2,
                        '&:hover': {
                          bgcolor: '#cfbcfb',
                        },
                        '&:disabled': {
                          bgcolor: 'rgba(207, 188, 251, 0.3)',
                          color: 'rgba(255, 255, 255, 0.5)',
                        },
                      }}
                    >
                      {purchaseLoading ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : (
                        'Купить'
                      )}
                    </Button>
                  )}
                </Box>
              </Box>
            ))}
          </Box>

          {decorations.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant='body1' color='text.secondary'>
                Нет доступных декораций
              </Typography>
            </Box>
          )}

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant='caption' color='text.secondary'>
              Ваш баланс: {mcoinBalance} MCoin
            </Typography>
          </Box>
            </Box>
          )}

          {/* Таб Конвертация */}
          {activeTab === 2 && (
            <Box>
              <Typography
                component='div'
                variant='body1'
                color='text.secondary'
                sx={{ mb: 3, textAlign: 'center' }}
              >
                Конвертируйте MCoin в обычные баллы
              </Typography>

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                }}
              >
                {/* Информация о курсе */}
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Typography variant='h6' sx={{ color: '#cfbcfb', mb: 1 }}>
                    Курс конвертации
                  </Typography>
                  <Typography variant='body1' sx={{ color: 'rgba(255, 255, 255, 0.87)' }}>
                    1 MCoin = 250 баллов
                  </Typography>
                </Box>

                {/* Поле ввода */}
                <Box sx={{ width: '100%', maxWidth: 300 }}>
                  <TextField
                    type="number"
                    label="Количество MCoin"
                    value={convertAmount}
                    onChange={(e) => setConvertAmount(Math.max(1, parseInt(e.target.value) || 1))}
                    fullWidth
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: 'rgba(255, 255, 255, 0.87)',
                        '& fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.23)',
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(255, 255, 255, 0.4)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#cfbcfb',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: 'rgba(255, 255, 255, 0.6)',
                        '&.Mui-focused': {
                          color: '#cfbcfb',
                        },
                      },
                    }}
                    InputProps={{
                      inputProps: { min: 1, max: mcoinBalance }
                    }}
                  />
                </Box>

                {/* Результат конвертации */}
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant='body2' sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 1 }}>
                    Получите:
                  </Typography>
                  <Typography variant='h5' sx={{ color: '#cfbcfb', fontWeight: 600 }}>
                    {convertAmount * 250} баллов
                  </Typography>
                </Box>

                {/* Кнопка конвертации */}
                <Button
                  variant="contained"
                  fullWidth
                  disabled={convertLoading || convertAmount > mcoinBalance || convertAmount <= 0}
                  onClick={handleConvertMCoin}
                  sx={{
                    bgcolor: '#cfbcfb',
                    color: 'white',
                    fontWeight: 600,
                    textTransform: 'none',
                    py: 1.5,
                    borderRadius: '8px',
                    '&:hover': {
                      bgcolor: '#cfbcfb',
                    },
                    '&:disabled': {
                      bgcolor: 'rgba(207, 188, 251, 0.3)',
                      color: 'rgba(255, 255, 255, 0.5)',
                    },
                  }}
                >
                  {convertLoading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    `Конвертировать ${convertAmount} MCoin`
                  )}
                </Button>

                {/* Информация о балансе */}
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Typography variant='caption' sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                    Доступно: {mcoinBalance} MCoin
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}


        </Box>
      </UniversalModal>
    </Container>
  );
};

export default BalancePage;
