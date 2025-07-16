import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ThemeSettingsContext } from '../App';
import { resetMessengerSocket } from '../utils/MessengerSocket';
import { addLazyLoadingToImages } from '../utils/imageUtils';

import AuthService from '../services/AuthService';
import ProfileService from '../services/ProfileService';


export const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  loading: true,
  checkAuth: () => {},
  login: () => {},
  logout: () => {},
  setUser: () => {}
});


export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  
  const savedAuthState = JSON.parse(localStorage.getItem('k-connect-auth-state') || 'null');
  const savedUser = JSON.parse(localStorage.getItem('k-connect-user') || 'null');
  
  const [user, setUser] = useState(savedUser);
  const [isAuthenticated, setIsAuthenticated] = useState(!!savedAuthState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const themeContext = useContext(ThemeSettingsContext) || {};

  
  const persistAuthState = (authState, userData) => {
    if (authState) {
      localStorage.setItem('k-connect-auth-state', JSON.stringify({
        isAuthenticated: authState,
        lastCheck: Date.now()
      }));
      
      if (userData) {
        console.log('💾 Сохраняем данные пользователя в localStorage:', userData);
        localStorage.setItem('k-connect-user', JSON.stringify(userData));
      }
    } else {
      localStorage.removeItem('k-connect-auth-state');
      localStorage.removeItem('k-connect-user');
    }
  };

  
  const checkAuth = useCallback(async (force = false) => {
    try {
      setLoading(true);
      
      const response = await AuthService.checkAuth();
      
      if (response && response.data) {
        if (response.data.isAuthenticated && response.data.user) {
          const userData = response.data.user;
          setUser(userData);
          setIsAuthenticated(true);
          persistAuthState(true, userData);
          return userData;
        } else if (response.data.needsProfileSetup || response.data.hasSession) {
          setUser(null);
          setIsAuthenticated(true);
          persistAuthState(true, null);
          return null;
        } else {
          setUser(null);
          setIsAuthenticated(false);
          persistAuthState(false);
          return null;
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
        persistAuthState(false);
        return null;
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
      setIsAuthenticated(false);
      persistAuthState(false);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  
  const login = useCallback(async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await AuthService.login(credentials);
      
      if (response.success) {
        // Сначала устанавливаем аутентификацию с минимальными данными
        setUser(response.user);
        setIsAuthenticated(true);
        persistAuthState(true, response.user);
        // Делаем дополнительную проверку авторизации для получения полных данных пользователя
        try {
          // Проверяем, есть ли уже полные данные пользователя
          const hasFullData = response.user && (
            response.user.about !== undefined || 
            response.user.avatar_url !== undefined || 
            response.user.account_type !== undefined ||
            response.user.hasCredentials !== undefined
          );
          
          if (hasFullData) {
          } else {
            await new Promise(resolve => setTimeout(resolve, 100));
            
            console.log('🔍 Выполняем проверку авторизации для получения полных данных пользователя...');
            const authCheck = await checkAuth(true);
            if (authCheck) {
              console.log('✅ Получены полные данные пользователя:', authCheck);
              setUser(authCheck);
              persistAuthState(true, authCheck);
            } else {
              console.log('⚠️ Проверка авторизации не вернула данные пользователя');
            }
          }
        } catch (error) {
          console.warn('❌ ошибка кароче:', error);
        }
        
        if (themeContext && themeContext.loadThemeSettings) {
          themeContext.loadThemeSettings();
        }
        
        if (!credentials.preventRedirect) {
          // Проверяем, есть ли у пользователя профиль
          if (!response.user || !response.user.username || !response.user.id) {
            // У пользователя нет профиля - редирект на регистрацию профиля
            navigate('/register/profile', { replace: true });
          } else {
            // У пользователя есть профиль - редирект на главную
            const deeplinkTrackId = localStorage.getItem('deeplinkTrackId');
            if (deeplinkTrackId) {
              window.location.href = `/music/track/${deeplinkTrackId}`;
            } else {
              navigate('/', { replace: true });
            }
          }
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
          ban_info: banInfo 
        });
        return { 
          success: false, 
          error: 'Аккаунт заблокирован', 
          ban_info: banInfo 
        };
      }
      
      const errorMessage = error.response?.data?.message || 'Ошибка при входе в систему';
      setError({ message: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [navigate, themeContext, checkAuth]);

  
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      
      await AuthService.logout();
      
      localStorage.removeItem('token');
      persistAuthState(false);
      
      resetMessengerSocket();
      
      setUser(null);
      setIsAuthenticated(false);
      
      if (themeContext && themeContext.loadThemeSettings) {
        themeContext.loadThemeSettings(true);
      }
      
      navigate('/login', { replace: true });
      
    } catch (error) {
      console.error('Logout error:', error);
      
      localStorage.removeItem('token');
      persistAuthState(false);
      
      resetMessengerSocket();
      
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, [navigate, themeContext]);

  
  const registerProfile = async (profileData) => {
    try {
      setLoading(true);
      const response = await AuthService.registerProfile(profileData);
      
      if (response.success && response.user) {
        // Обновляем данные пользователя
        setUser(response.user);
        setIsAuthenticated(true);
        persistAuthState(true, response.user);
        
        // Делаем дополнительную проверку аутентификации для обновления сессии
        try {
          const authCheck = await checkAuth(true);
          if (authCheck) {
            // Если проверка прошла успешно, обновляем данные
            setUser(authCheck);
            persistAuthState(true, authCheck);
          }
        } catch (error) {
          console.warn('Auth check after profile registration failed:', error);
        }
        
        // Редирект на главную
        navigate('/', { replace: true });
        return { success: true };
      } else {
        const errorMessage = response.error || 'Ошибка при регистрации профиля';
        setError({ message: errorMessage });
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error('Profile registration error:', error);
      const errorMessage = error.response?.data?.error || 'Ошибка при регистрации профиля';
      setError({ message: errorMessage });
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response && error.response.status === 401) {
          if (isAuthenticated) {
            setUser(null);
            setIsAuthenticated(false);
            persistAuthState(false);
            
            const currentPath = window.location.pathname;
            const publicPages = ['/login', '/register', '/rules', '/about', '/privacy-policy', '/terms-of-service', '/bugs'];
            const isPublicPage = publicPages.some(page => currentPath.includes(page));
            
            if (!isPublicPage) {
              navigate('/login', { replace: true });
            }
          }
        }
        return Promise.reject(error);
      }
    );
    
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [isAuthenticated, navigate]);

  // Автоматическая проверка аутентификации при изменении состояния
  useEffect(() => {
    if (isAuthenticated && !user) {
      // Если пользователь аутентифицирован, но данных нет, делаем проверку
      checkAuth(true).catch(console.error);
    }
  }, [isAuthenticated, user, checkAuth]);

  // Принудительная загрузка аватарок при изменении пользователя
  useEffect(() => {
    if (user && typeof window !== 'undefined') {
      // Принудительно загружаем аватарки пользователя
      addLazyLoadingToImages('.SIDEBAR-user-avatar, .user-avatar, .profile-avatar', true);
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
    setUser
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}; 