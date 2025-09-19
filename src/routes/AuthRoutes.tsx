import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, useTheme } from '@mui/material';
import { useAuth } from '../context/AuthContext.js';
import { LoadingIndicator } from '../components/Loading/LoadingComponents';

interface AuthRoutesProps {
  setUser: (user: any) => void;
}

// Lazy imports
const Login = React.lazy(() => import('../pages/Auth/Login'));
const Register = React.lazy(() => import('../pages/Auth/Register'));
const RegisterProfile = React.lazy(
  () => import('../pages/Auth/RegisterProfile')
);
const RegisterChannel = React.lazy(
  () => import('../pages/Auth/RegisterChannel')
);
const EmailConfirmation = React.lazy(
  () => import('../pages/Auth/EmailConfirmation')
);
const ForgotPassword = React.lazy(() => import('../pages/Auth/ForgotPassword'));
const ResetPassword = React.lazy(() => import('../pages/Auth/ResetPassword'));
// const ElementAuth = React.lazy(() => import('../pages/Auth/ElementAuth'));

const AuthRoutes: React.FC<AuthRoutesProps> = ({ setUser }) => {
  const theme = useTheme();
  const { isAuthenticated, user, loading, hasTempSession } = useAuth();

  // Добавляем отладочную информацию
  console.log('AuthRoutes Debug:', {
    isAuthenticated,
    user,
    loading,
    hasTempSession,
    currentPath: window.location.pathname,
  });

  const hasProfile = (): boolean => {
    if (!user || typeof user !== 'object') return false;
    // Use optional chaining and type guards to avoid TS errors
    return Boolean(
      (user as { username?: string; id?: string | number }).username &&
        (user as { username?: string; id?: string | number }).id
    );
  };

  // Если есть временная сессия и мы НЕ на странице регистрации профиля, перенаправляем
  if (
    hasTempSession &&
    !loading &&
    window.location.pathname !== '/register/profile'
  ) {
    console.log('Redirecting to /register/profile due to temp session');
    return <Navigate to='/register/profile' replace />;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: theme.palette.background.default,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <React.Suspense fallback={<LoadingIndicator />}>
        <Routes>
          <Route
            path='/login'
            element={isAuthenticated ? <Navigate to='/' replace /> : <Login />}
          />
          <Route
            path='/register'
            element={
              isAuthenticated ? (
                <Navigate to='/' replace />
              ) : (
                <Register setUser={setUser} />
              )
            }
          />
          <Route
            path='/register/profile'
            element={
              isAuthenticated || hasTempSession ? (
                hasProfile() ? (
                  // Если у пользователя уже есть профиль, перенаправляем на главную
                  <Navigate to='/' replace />
                ) : (
                  // Если у пользователя нет профиля, показываем форму регистрации
                  <RegisterProfile setUser={setUser} />
                )
              ) : (
                <Navigate to='/login' replace />
              )
            }
          />
          <Route
            path='/register/channel'
            element={
              isAuthenticated ? (
                <RegisterChannel />
              ) : (
                <Navigate to='/login' replace />
              )
            }
          />
          <Route path='/confirm-email/:token' element={<EmailConfirmation />} />
          <Route path='/forgot-password' element={<ForgotPassword />} />
          <Route path='/reset-password' element={<ResetPassword />} />
          {/* <Route path="/element-auth" element={<ElementAuth />} /> */}
          {/* <Route path="/auth_elem/:token" element={<ElementAuth />} />
          <Route path="/auth_elem/direct/:token" element={<ElementAuth />} /> */}
        </Routes>
      </React.Suspense>
    </Box>
  );
};

export default AuthRoutes;
