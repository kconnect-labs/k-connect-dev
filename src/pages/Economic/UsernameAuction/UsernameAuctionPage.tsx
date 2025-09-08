import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  CircularProgress,
  Grid,
  Alert,
  Snackbar,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogContent,
  IconButton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { AuthContext } from '../../../context/AuthContext';
import { useAuctionData } from './hooks/useAuctionData';
import { useAuctionActions } from './hooks/useAuctionActions';
import StyledTabs from '../../../UIKIT/StyledTabs';
import InfoBlock from '../../../UIKIT/InfoBlock';
import AuctionCard from './components/AuctionCard';
import SearchBar from './components/SearchBar';
import EmptyState from './components/EmptyState';
import CreateAuctionModal from './components/CreateAuctionModal';
import PlaceBidModal from './components/PlaceBidModal';
import AuctionDetailModal from './components/AuctionDetailModal';
import UsernamesForm from '../../User/SettingsPage/components/UsernamesForm';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import GavelIcon from '@mui/icons-material/Gavel';
import PersonIcon from '@mui/icons-material/Person';
import HistoryIcon from '@mui/icons-material/History';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

const PageHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginBottom: theme.spacing(4),
  textAlign: 'center',
}));

const TabPanel = ({ children, value, index, ...other }: any) => (
  <div
    role='tabpanel'
    hidden={value !== index}
    id={`tabpanel-${index}`}
    aria-labelledby={`tab-${index}`}
    {...other}
  >
    {value === index && <Box>{children}</Box>}
  </div>
);

const AnimatedGrid = styled(Grid)(({ theme }) => ({
  opacity: 0,
  transform: 'translateY(20px)',
  animation: 'fadeInUp 0.3s ease-out forwards',
  '@keyframes fadeInUp': {
    to: {
      opacity: 1,
      transform: 'translateY(0)',
    },
  },
}));

const UsernameAuctionPage: React.FC = () => {
  const { user } = useContext(AuthContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [tabValue, setTabValue] = useState(0);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [bidDialogOpen, setBidDialogOpen] = useState(false);
  const [selectedAuction, setSelectedAuction] = useState<any>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [detailAuction, setDetailAuction] = useState<any>(null);
  const [newAuctionData, setNewAuctionData] = useState({
    username: '',
    min_price: '',
    duration_hours: 24,
  });
  const [bidAmount, setBidAmount] = useState('');
  const [usernamesSettingsOpen, setUsernamesSettingsOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info' as 'success' | 'error' | 'warning' | 'info',
  });
  const [errors, setErrors] = useState<any>({});

  const {
    // Data
    auctions,
    filteredAuctions,
    completedAuctions,
    userAuctions,
    userBids,
    usernames,

    // Loading states
    loading,
    detailLoading,
    loadingButtons,

    // UI states
    searchQuery,
    sessionActive,
    sessionExpired,

    // Actions
    fetchAuctions,
    fetchUserAuctions,
    fetchUsernames,
    setSearchQuery,
    setLoadingButtons,
    setDetailLoading,
    broadcastUpdate,
  } = useAuctionData();

  const {
    handleCreateAuction,
    handlePlaceBid,
    handleCancelAuction,
    handleBuyNow,
    handleAcceptBid,
  } = useAuctionActions({
    user,
    setLoadingButtons,
    setSnackbar,
    fetchAuctions,
    fetchUserAuctions,
    broadcastUpdate,
  });

  // Initialize data
  useEffect(() => {
    if (user && sessionActive) {
      fetchAuctions();
      fetchUserAuctions();
      fetchUsernames();
    }
  }, [user, sessionActive]);

  const handleTabChange = (event: any, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCreateAuctionClick = async (data: any) => {
    return await handleCreateAuction(data);
  };

  const handleBidClick = (auction: any) => {
    setSelectedAuction(auction);
    setBidDialogOpen(true);
  };

  const handlePlaceBidClick = async (auction: any, amount: string) => {
    return await handlePlaceBid(auction, amount);
  };

  const handleCardClick = async (auction: any) => {
    setDetailAuction({ ...auction, bids: [] });
    setDetailDialogOpen(true);
    setDetailLoading(true);

    try {
      const response = await axios.get(`/api/username/auctions/${auction.id}`);
      if (response.data.success) {
        setDetailAuction(response.data.auction);
      }
    } catch (error) {
      console.error('Error fetching auction details:', error);
      setSnackbar({
        open: true,
        message: 'Не удалось загрузить детали аукциона',
        severity: 'error',
      });
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseAuctionDetail = () => {
    setDetailDialogOpen(false);
    setTimeout(() => setDetailAuction(null), 300);
  };

  const handleCancelClick = async (auctionId: number) => {
    await handleCancelAuction(auctionId);
  };

  const handleAcceptClick = async (auction: any) => {
    await handleAcceptBid(auction);
  };

  const handleBuyNowClick = async (auctionId: number) => {
    await handleBuyNow(auctionId);
  };

  const tabs = [
    {
      value: 0,
      label: 'Активные аукционы',
      icon: GavelIcon,
    },
    {
      value: 1,
      label: 'Мои аукционы',
      icon: PersonIcon,
    },
    {
      value: 2,
      label: 'Мои ставки',
      icon: HistoryIcon,
    },
    {
      value: 3,
      label: 'Завершенные',
      icon: HistoryIcon,
    },
  ];

  return (
    <Container maxWidth='md' sx={{ py: 2, mb: 10 }}>
      <Box
        sx={{
          mb: 1,
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant='contained'
            color='primary'
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
            sx={{
              borderRadius: '16px',
              px: 2,
            }}
          >
            Выставить юзернейм на аукцион
          </Button>
          <Button
            variant='outlined'
            color='primary'
            startIcon={<SettingsIcon />}
            onClick={() => setUsernamesSettingsOpen(true)}
            sx={{
              borderRadius: '16px',
              px: 2,
            }}
          >
            Настройки юзернеймов
          </Button>
        </Box>
      </Box>

      <Box sx={{ mb: 1 }}>
        <StyledTabs
          value={tabValue}
          onChange={handleTabChange as any}
          tabs={tabs}
          fullWidth
          customStyle
        />
      </Box>

      {/* Session expiration warning */}
      {sessionExpired && (
        <Alert
          severity='warning'
          sx={{
            mb: 1,
            borderRadius: 'var(--main-border-radius)',
            '& .MuiAlert-message': { width: '100%' },
          }}
          action={
            <Button
              color='inherit'
              size='small'
              onClick={() => window.location.reload()}
            >
              Обновить
            </Button>
          }
        >
          <Typography variant='subtitle1' fontWeight='bold' gutterBottom>
            Требуется обновление
          </Typography>
          <Typography variant='body2'>
            Данные могут быть устаревшими. Пожалуйста, обновите страницу для
            получения актуальной информации.
          </Typography>
        </Alert>
      )}

      {/* Tab contents */}
      <TabPanel value={tabValue} index={0}>
        <Box>
          <SearchBar value={searchQuery} onChange={setSearchQuery} />

          {loading ? (
            <Box display='flex' justifyContent='center' my={4}>
              <CircularProgress />
            </Box>
          ) : filteredAuctions.length === 0 ? (
            <EmptyState
              title={
                searchQuery
                  ? 'По вашему запросу ничего не найдено'
                  : 'В данный момент нет активных аукционов'
              }
              description={
                searchQuery
                  ? 'Попробуйте изменить параметры поиска'
                  : 'Будьте первым, кто выставит свой юзернейм на аукцион!'
              }
            />
          ) : (
            <Grid container spacing={2}>
              {filteredAuctions.map((auction, index) => (
                <AnimatedGrid
                  item
                  xs={12}
                  key={auction.id}
                  sx={{
                    animationDelay: `${index * 0.1}s`,
                  }}
                >
                  <AuctionCard
                    auction={auction}
                    type='auction'
                    user={user}
                    loadingButtons={loadingButtons}
                    onCardClick={handleCardClick}
                    onBidClick={handleBidClick}
                  />
                </AnimatedGrid>
              ))}
            </Grid>
          )}
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {userAuctions.length === 0 ? (
          <EmptyState
            title='У вас нет активных аукционов'
            description='Выставите свой юзернейм на аукцион и заработайте баллы!'
            actionText='Создать аукцион'
            onAction={() => setCreateDialogOpen(true)}
          />
        ) : (
          <Grid container spacing={2}>
            {userAuctions.map((auction, index) => (
              <AnimatedGrid
                item
                xs={12}
                key={auction.id}
                sx={{
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                <AuctionCard
                  auction={auction}
                  type='userAuction'
                  user={user}
                  loadingButtons={loadingButtons}
                  onCardClick={handleCardClick}
                  onBidClick={handleBidClick}
                  onCancelClick={handleCancelClick}
                  onAcceptClick={handleAcceptClick}
                />
              </AnimatedGrid>
            ))}
          </Grid>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {userBids.length === 0 ? (
          <EmptyState
            title='У вас нет активных ставок'
            description='Поучаствуйте в аукционах, чтобы получить уникальный юзернейм!'
            actionText='Смотреть аукционы'
            onAction={() => setTabValue(0)}
          />
        ) : (
          <Grid container spacing={2}>
            {userBids.map((bid, index) => (
              <AnimatedGrid
                item
                xs={12}
                key={bid.id}
                sx={{
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                <AuctionCard
                  auction={bid}
                  type='userBid'
                  user={user}
                  loadingButtons={loadingButtons}
                  onCardClick={handleCardClick}
                  onBidClick={handleBidClick}
                />
              </AnimatedGrid>
            ))}
          </Grid>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        {completedAuctions.length === 0 ? (
          <EmptyState
            title='Нет завершенных аукционов'
            description='Завершенные аукционы будут отображаться здесь.'
            actionText='К активным аукционам'
            onAction={() => setTabValue(0)}
          />
        ) : (
          <Grid container spacing={2}>
            {completedAuctions.map((auction, index) => (
              <AnimatedGrid
                item
                xs={12}
                key={auction.id}
                sx={{
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                <AuctionCard
                  auction={auction}
                  type='auction'
                  user={user}
                  loadingButtons={loadingButtons}
                  onCardClick={handleCardClick}
                  onBidClick={handleBidClick}
                />
              </AnimatedGrid>
            ))}
          </Grid>
        )}
      </TabPanel>

      {/* New Modals */}
      <CreateAuctionModal
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        usernames={usernames}
        onSubmit={handleCreateAuctionClick}
        loading={loadingButtons.create}
      />

      <PlaceBidModal
        open={bidDialogOpen}
        onClose={() => setBidDialogOpen(false)}
        auction={selectedAuction}
        onSubmit={handlePlaceBidClick}
        loading={loadingButtons.bid}
      />

      <AuctionDetailModal
        open={detailDialogOpen}
        onClose={handleCloseAuctionDetail}
        auction={detailAuction}
        loading={detailLoading}
        user={user}
        onBidClick={handleBidClick}
        onBuyNow={handleBuyNowClick}
        onAcceptBid={handleAcceptClick}
        onCancelAuction={handleCancelClick}
        loadingButtons={loadingButtons}
      />

      {/* Usernames Settings Modal */}
      <Dialog
        open={usernamesSettingsOpen}
        onClose={() => setUsernamesSettingsOpen(false)}
        maxWidth='md'
        fullWidth
        PaperProps={{
          sx: {
            background: 'var(--theme-background, rgba(255, 255, 255, 0.03))',
            backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
            border: '1px solid rgba(0, 0, 0, 0.12)',
            borderRadius: '16px',
            maxHeight: '90vh',
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid rgba(66, 66, 66, 0.5)',
            background: 'var(--theme-background, rgba(255, 255, 255, 0.02))',
            backdropFilter: 'var(--theme-backdrop-filter, blur(10px))',
          }}
        >
          <Typography
            variant='h6'
            sx={{ fontWeight: 600, color: 'text.primary' }}
          >
            Настройки юзернеймов
          </Typography>
          <IconButton
            onClick={() => setUsernamesSettingsOpen(false)}
            sx={{ color: 'text.primary' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <DialogContent sx={{ p: 3, overflow: 'auto' }}>
          <UsernamesForm
            onSuccess={() => {
              setUsernamesSettingsOpen(false);
              setSnackbar({
                open: true,
                message: 'Настройки юзернеймов обновлены',
                severity: 'success',
              });
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={snackbar.severity === 'warning' ? null : 6000}
        onClose={() =>
          snackbar.severity !== 'warning' &&
          setSnackbar({ ...snackbar, open: false })
        }
      >
        <Alert
          onClose={() =>
            snackbar.severity !== 'warning' &&
            setSnackbar({ ...snackbar, open: false })
          }
          severity={snackbar.severity}
          sx={{ width: '100%' }}
          action={
            snackbar.severity === 'warning' && (
              <Button
                color='inherit'
                size='small'
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
