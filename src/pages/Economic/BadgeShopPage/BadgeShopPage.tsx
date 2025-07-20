import React, { useEffect, useContext } from 'react';
import {
  Box,
  Container,
  Grid,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import { AuthUser } from '../../../types/auth';
import { useBadgeShop } from './hooks/useBadgeShop';
import { useBadgeShopAPI } from './hooks/useBadgeShopAPI';
import { getSortedBadges, filterBadgesByTab, validateImageFile } from './utils/badgeUtils';
import { BadgeShopHeader } from './components/BadgeShopHeader';
import { BadgeShopControls } from './components/BadgeShopControls';
import { BadgeCard } from './components/BadgeCard';
import { BadgeDialog } from './components/BadgeDialog';
import { CreateDialog } from './components/CreateDialog';
import { PurchaseDialog } from './components/PurchaseDialog';


const BadgeShopPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:700px)');
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext) as { user: AuthUser | null };

  const badgeShopState = useBadgeShop();
  const {
    tabValue,
    sortOption,
    badges,
    userPoints,
    loading,
    error,
    selectedBadge,
    openBadgeDialog,
    openCreateDialog,
    openPurchaseDialog,
    purchaseStep,
    newBadge,
    isPurchasing,
    showConfetti,
    createdBadgesCount,
    badgeLimitReached,
    badgeLimit,
    userSubscription,
    previewUrl,
    purchaseSuccess,
    setTabValue,
    setSortOption,
    setBadges,
    setUserPoints,
    setLoading,
    setError,
    setSelectedBadge,
    setOpenBadgeDialog,
    setOpenCreateDialog,
    setOpenPurchaseDialog,
    setPurchaseStep,
    setNewBadge,
    setIsPurchasing,
    setShowConfetti,
    setCreatedBadgesCount,
    setBadgeLimitReached,
    setBadgeLimit,
    setUserSubscription,
    setPreviewUrl,
    setPurchaseSuccess,
    resetNewBadge,
    resetPurchaseState,
  } = badgeShopState;

  const api = useBadgeShopAPI({
    setBadges,
    setUserPoints,
    setLoading,
    setError,
    setCreatedBadgesCount,
    setUserSubscription,
    setBadgeLimit,
    setBadgeLimitReached,
    userPoints,
    badgeLimit,
    userSubscription,
  });

  // Инициализация данных
  useEffect(() => {
    api.fetchBadges();
    api.fetchUserPoints();
    api.fetchSubscriptionStatus();
  }, []);

  // Обновление лимитов при изменении подписки
  useEffect(() => {
    const isUltimate = userSubscription && userSubscription.subscription_type &&
      (userSubscription.subscription_type.toLowerCase() === 'ultimate' ||
       userSubscription.subscription_type.toLowerCase().includes('ultimate'));

    if (isUltimate) {
      setBadgeLimitReached(false);
    } else {
      setBadgeLimitReached(createdBadgesCount >= badgeLimit);
    }
  }, [badgeLimit, createdBadgesCount, userSubscription, setBadgeLimitReached]);

  // Обновление количества созданных бейджей при изменении подписки
  useEffect(() => {
    api.fetchCreatedBadgesCount();
  }, [userSubscription]);

  // Открытие бейджика по openBadgeId из state
  useEffect(() => {
    if (location.state && location.state.openBadgeId && badges.length > 0) {
      const badgeToOpen = badges.find(b => String(b.id) === String(location.state.openBadgeId));
      if (badgeToOpen) {
        setSelectedBadge(badgeToOpen);
        setOpenBadgeDialog(true);
        navigate('/badge-shop', { replace: true, state: {} });
      }
    }
  }, [location.state, badges, setSelectedBadge, setOpenBadgeDialog, navigate]);

  // Очистка URL при размонтировании
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleTabChange = (event: React.SyntheticEvent | null, newValue: number) => {
    setTabValue(newValue as any);
  };

  const handleSortChange = (event: any) => {
    setSortOption(event.target.value);
  };

  const handleCreateClick = () => {
    setOpenCreateDialog(true);
  };

  const handleBadgeClick = (badge: any) => {
    setSelectedBadge(badge);
    setOpenBadgeDialog(true);
  };

  const handlePurchaseClick = (badge: any) => {
    setSelectedBadge(badge);
    setPurchaseStep(0);
    setPurchaseSuccess(false);
    setOpenPurchaseDialog(true);
  };

  const handleCloseBadgeDialog = () => {
    setOpenBadgeDialog(false);
    setSelectedBadge(null);
  };

  // Обработка создания бейджика
  const handleCreateBadge = async () => {
    try {
      await api.createBadge(newBadge);
      setOpenCreateDialog(false);
      resetNewBadge();
    } catch (error: any) {
      setError(error.message);
    }
  };

  // Обработка покупки бейджика
  const handlePurchaseBadge = async (badge: any) => {
    if (isPurchasing) return;

    try {
      setIsPurchasing(true);
      setPurchaseStep(1.5);

      await new Promise(resolve => setTimeout(resolve, 1000));
      await api.purchaseBadge(badge);

      setPurchaseStep(2);
      setPurchaseSuccess(true);
      setShowConfetti(true);

      setTimeout(() => {
        setOpenPurchaseDialog(false);
        resetPurchaseState();
      }, 3000);
    } catch (error: any) {
      setError(error.message);
      setPurchaseStep(0);
      setIsPurchasing(false);
    }
  };

  // Обработка изменения изображения
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.isValid) {
      setError(validation.error || 'Ошибка валидации файла');
      return;
    }

    setNewBadge({ ...newBadge, image: file });
    setError('');

    const fileUrl = URL.createObjectURL(file);
    setPreviewUrl(fileUrl);
  };

  // Получение отфильтрованных и отсортированных бейджей
  const processedBadges = () => {
    const filtered = filterBadgesByTab(badges, tabValue, user?.id);
    return getSortedBadges(filtered, sortOption);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: isMobile ? 2 : 4, pb: isMobile ? 12 : 4 }}>
      <BadgeShopHeader
        userPoints={userPoints}
        onCreateClick={handleCreateClick}
        isMobile={isMobile}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 1 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <BadgeShopControls
        tabValue={tabValue}
        sortOption={sortOption}
        onTabChange={handleTabChange}
        onSortChange={handleSortChange}
        isMobile={isMobile}
      />

      <Grid container spacing={isMobile ? 1 : 2}>
        {processedBadges().map((badge) => (
          <Grid item xs={6} sm={4} md={3} key={badge.id}>
            <BadgeCard
              badge={badge}
              userPoints={userPoints}
              userId={user?.id}
              onBadgeClick={handleBadgeClick}
              onPurchaseClick={handlePurchaseClick}
            />
          </Grid>
        ))}
      </Grid>

      {/* Модальные окна */}
      <BadgeDialog
        open={openBadgeDialog}
        badge={selectedBadge}
        userPoints={userPoints}
        userId={user?.id}
        onClose={handleCloseBadgeDialog}
        onPurchase={handlePurchaseClick}
      />

      <CreateDialog
        open={openCreateDialog}
        newBadge={newBadge}
        error={error}
        loading={loading}
        badgeLimitReached={badgeLimitReached}
        badgeLimit={badgeLimit}
        createdBadgesCount={createdBadgesCount}
        previewUrl={previewUrl}
        onClose={() => setOpenCreateDialog(false)}
        onCreate={handleCreateBadge}
        onNewBadgeChange={setNewBadge}
        onImageChange={handleImageChange}
      />

      <PurchaseDialog
        open={openPurchaseDialog}
        badge={selectedBadge}
        userPoints={userPoints}
        purchaseStep={purchaseStep}
        isPurchasing={isPurchasing}
        purchaseSuccess={purchaseSuccess}
        error={error}
        onClose={() => setOpenPurchaseDialog(false)}
        onPurchase={handlePurchaseBadge}
      />


    </Container>
  );
};

export default BadgeShopPage; 