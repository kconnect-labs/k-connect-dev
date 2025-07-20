import { useState, useCallback } from 'react';
import { 
  BadgeShopState, 
  BadgeShopActions, 
  BadgeShopContextType,
  TabValue,
  SortOption,
  Badge,
  NewBadge,
  UserSubscription
} from '../types';

const initialNewBadge: NewBadge = {
  name: '',
  description: '',
  price: '',
  royalty_percentage: 30,
  max_copies: '',
  image: null,
  is_upgraded: false,
  particle_color: '#FFD700'
};

const initialState: BadgeShopState = {
  tabValue: 0,
  sortOption: 'newest',
  badges: [],
  userPoints: 0,
  loading: true,
  error: '',
  selectedBadge: null,
  openBadgeDialog: false,
  openCreateDialog: false,
  openPurchaseDialog: false,
  purchaseStep: 0,
  newBadge: initialNewBadge,
  isPurchasing: false,
  showConfetti: false,
  createdBadgesCount: 0,
  badgeLimitReached: false,
  badgeLimit: 3,
  userSubscription: null,
  previewUrl: null,
  purchaseSuccess: false,
};

export const useBadgeShop = (): BadgeShopContextType => {
  const [state, setState] = useState<BadgeShopState>(initialState);

  const setTabValue = useCallback((value: TabValue) => {
    setState(prev => ({ ...prev, tabValue: value }));
  }, []);

  const setSortOption = useCallback((option: SortOption) => {
    setState(prev => ({ ...prev, sortOption: option }));
  }, []);

  const setBadges = useCallback((badges: Badge[]) => {
    setState(prev => ({ ...prev, badges }));
  }, []);

  const setUserPoints = useCallback((points: number) => {
    setState(prev => ({ ...prev, userPoints: points }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: string) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const setSelectedBadge = useCallback((badge: Badge | null) => {
    setState(prev => ({ ...prev, selectedBadge: badge }));
  }, []);

  const setOpenBadgeDialog = useCallback((open: boolean) => {
    setState(prev => ({ ...prev, openBadgeDialog: open }));
  }, []);

  const setOpenCreateDialog = useCallback((open: boolean) => {
    setState(prev => ({ ...prev, openCreateDialog: open }));
  }, []);

  const setOpenPurchaseDialog = useCallback((open: boolean) => {
    setState(prev => ({ ...prev, openPurchaseDialog: open }));
  }, []);

  const setPurchaseStep = useCallback((step: number) => {
    setState(prev => ({ ...prev, purchaseStep: step }));
  }, []);

  const setNewBadge = useCallback((badge: NewBadge) => {
    setState(prev => ({ ...prev, newBadge: badge }));
  }, []);

  const setIsPurchasing = useCallback((purchasing: boolean) => {
    setState(prev => ({ ...prev, isPurchasing: purchasing }));
  }, []);

  const setShowConfetti = useCallback((show: boolean) => {
    setState(prev => ({ ...prev, showConfetti: show }));
  }, []);

  const setCreatedBadgesCount = useCallback((count: number) => {
    setState(prev => ({ ...prev, createdBadgesCount: count }));
  }, []);

  const setBadgeLimitReached = useCallback((reached: boolean) => {
    setState(prev => ({ ...prev, badgeLimitReached: reached }));
  }, []);

  const setBadgeLimit = useCallback((limit: number) => {
    setState(prev => ({ ...prev, badgeLimit: limit }));
  }, []);

  const setUserSubscription = useCallback((subscription: UserSubscription | null) => {
    setState(prev => ({ ...prev, userSubscription: subscription }));
  }, []);

  const setPreviewUrl = useCallback((url: string | null) => {
    setState(prev => ({ ...prev, previewUrl: url }));
  }, []);

  const setPurchaseSuccess = useCallback((success: boolean) => {
    setState(prev => ({ ...prev, purchaseSuccess: success }));
  }, []);

  const resetNewBadge = useCallback(() => {
    setState(prev => ({ ...prev, newBadge: initialNewBadge }));
  }, []);

  const resetPurchaseState = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      purchaseStep: 0, 
      purchaseSuccess: false, 
      showConfetti: false,
      isPurchasing: false 
    }));
  }, []);

  return {
    ...state,
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
  };
}; 