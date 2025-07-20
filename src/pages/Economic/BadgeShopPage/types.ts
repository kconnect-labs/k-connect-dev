export interface User {
  id: number;
  username: string;
  name: string;
  avatar_url?: string;
}

export interface BadgeCreator {
  id: number;
  name: string;
  avatar_url?: string;
}

export interface BadgePurchase {
  id: number;
  buyer_id: number;
  buyer?: User;
  created_at: string;
}

export interface Badge {
  id: number;
  name: string;
  description: string;
  price: number;
  image_path: string;
  creator_id: number;
  creator?: BadgeCreator;
  purchases?: BadgePurchase[];
  max_copies?: number;
  copies_sold?: number;
  is_upgraded?: boolean;
  upgrade?: boolean;
  particle_color?: string;
  color_upgrade?: string;
  royalty_percentage?: number;
}

export interface NewBadge {
  name: string;
  description: string;
  price: string;
  royalty_percentage: number;
  max_copies: string;
  image: File | null;
  is_upgraded: boolean;
  particle_color: string;
}

export interface UserSubscription {
  active: boolean;
  subscription_type: string;
}

export type SortOption = 'newest' | 'oldest' | 'popular' | 'price-low' | 'price-high';

export type TabValue = 0 | 1 | 2 | 3;

export interface BadgeShopState {
  tabValue: TabValue;
  sortOption: SortOption;
  badges: Badge[];
  userPoints: number;
  loading: boolean;
  error: string;
  selectedBadge: Badge | null;
  openBadgeDialog: boolean;
  openCreateDialog: boolean;
  openPurchaseDialog: boolean;
  purchaseStep: number;
  newBadge: NewBadge;
  isPurchasing: boolean;
  showConfetti: boolean;
  createdBadgesCount: number;
  badgeLimitReached: boolean;
  badgeLimit: number;
  userSubscription: UserSubscription | null;
  previewUrl: string | null;
  purchaseSuccess: boolean;
}

export interface BadgeShopActions {
  setTabValue: (value: TabValue) => void;
  setSortOption: (option: SortOption) => void;
  setBadges: (badges: Badge[]) => void;
  setUserPoints: (points: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;
  setSelectedBadge: (badge: Badge | null) => void;
  setOpenBadgeDialog: (open: boolean) => void;
  setOpenCreateDialog: (open: boolean) => void;
  setOpenPurchaseDialog: (open: boolean) => void;
  setPurchaseStep: (step: number) => void;
  setNewBadge: (badge: NewBadge) => void;
  setIsPurchasing: (purchasing: boolean) => void;
  setShowConfetti: (show: boolean) => void;
  setCreatedBadgesCount: (count: number) => void;
  setBadgeLimitReached: (reached: boolean) => void;
  setBadgeLimit: (limit: number) => void;
  setUserSubscription: (subscription: UserSubscription | null) => void;
  setPreviewUrl: (url: string | null) => void;
  setPurchaseSuccess: (success: boolean) => void;
  resetNewBadge: () => void;
  resetPurchaseState: () => void;
}

export interface BadgeShopContextType extends BadgeShopState, BadgeShopActions {} 