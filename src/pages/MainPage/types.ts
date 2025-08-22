export interface User {
  id: number;
  username: string;
  name?: string;
  photo?: string;
  is_verified?: boolean;
  is_following?: boolean;
  account_type?: string;
}

export interface Post {
  id: number;
  content: string;
  user: User;
  created_at: string;
  updated_at: string;
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
  is_repost: boolean;
  media?: string[];
  type?: string;
}

export interface FeedType {
  value: 'all' | 'following' | 'recommended';
  label: string;
}

export interface LightboxState {
  isOpen: boolean;
  currentImage: string;
  currentImageIndex: number;
  images: string[];
}

export interface UpdateInfo {
  version: string;
  date: string;
  title: string;
  updates: string[];
  fixes: string[];
}

export interface OnlineUsersProps {
  // No props needed
}

export interface UserRecommendationProps {
  user: User;
}

export interface MainPageState {
  posts: Post[];
  loading: boolean;
  recommendations: User[];
  loadingRecommendations: boolean;
  trendingBadges: any[];
  page: number;
  hasMore: boolean;
  feedType: FeedType['value'];
  requestId: number;
  latestUpdate: UpdateInfo | null;
  lightbox: LightboxState;
}

// AuthContext types
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  checkAuth: () => Promise<User | null>;
  login: (credentials: any) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  hasTempSession: boolean;
}
