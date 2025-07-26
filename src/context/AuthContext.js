import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from 'react';
import axios from 'axios';
import { ThemeSettingsContext } from '../App';
import { resetMessengerSocket } from '../utils/MessengerSocket';
import { addLazyLoadingToImages } from '../utils/imageUtils';

import AuthService from '../services/AuthService';

export const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  loading: true,
  checkAuth: () => {},
  login: () => {},
  logout: () => {},
  setUser: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const themeContext = useContext(ThemeSettingsContext) || {};

  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      const response = await AuthService.checkAuth();

      if (response && response.data && response.data.isAuthenticated && response.data.user) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        return response.data.user;
      } else {
        setUser(null);
        setIsAuthenticated(false);
        return null;
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
      setIsAuthenticated(false);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Автоматическая проверка авторизации при инициализации
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async credentials => {
    try {
      setLoading(true);
      setError(null);

      const response = await AuthService.login(credentials);

      if (response.success) {
        setUser(response.user);
        setIsAuthenticated(true);

        if (themeContext && themeContext.loadThemeSettings) {
          themeContext.loadThemeSettings();
        }

        return { success: true };
      } else {
        const errorMessage = response.error || 'Ошибка при входе в систему';
        setError({ message: errorMessage });
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error('Login error:', error);

      if (error.response?.data?.ban_info) {
        const banInfo = error.response.data.ban_info;
        setError({
          message: 'Аккаунт заблокирован',
          ban_info: banInfo,
        });
        return {
          success: false,
          error: 'Аккаунт заблокирован',
          ban_info: banInfo,
        };
      }

      const errorMessage =
        error.response?.data?.message || 'Ошибка при входе в систему';
      setError({ message: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [themeContext]);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await AuthService.logout();
      
      localStorage.removeItem('token');
      resetMessengerSocket();
      setUser(null);
      setIsAuthenticated(false);

      if (themeContext && themeContext.loadThemeSettings) {
        themeContext.loadThemeSettings(true);
      }
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('token');
      resetMessengerSocket();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, [themeContext]);

  const registerProfile = async profileData => {
    try {
      setLoading(true);
      const response = await AuthService.registerProfile(profileData);

      if (response.success && response.user) {
        setUser(response.user);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        const errorMessage = response.error || 'Ошибка при регистрации профиля';
        setError({ message: errorMessage });
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error('Profile registration error:', error);
      const errorMessage =
        error.response?.data?.error || 'Ошибка при регистрации профиля';
      setError({ message: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && typeof window !== 'undefined') {
      addLazyLoadingToImages(
        '.SIDEBAR-user-avatar, .user-avatar, .profile-avatar',
        true
      );
    }
  }, [user]);

  const contextValue = {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    checkAuth,
    registerProfile,
    setUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
