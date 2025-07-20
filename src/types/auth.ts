export interface AuthUser {
  id: number;
  username: string;
  name?: string;
  email?: string;
  avatar_url?: string;
  about?: string;
  account_type?: string;
  hasCredentials?: boolean;
  [key: string]: any; // для дополнительных полей
}

export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: any;
  checkAuth: (force?: boolean) => Promise<AuthUser | null>;
  login: (credentials: any) => Promise<{ success: boolean; error?: string; ban_info?: any }>;
  logout: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
  registerProfile: (profileData: any) => Promise<any>;
} 