import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, useTheme } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { LoadingIndicator } from '../components/Loading/LoadingComponents';

// Lazy imports
const Login = React.lazy(() => import('../pages/Auth/Login'));
const Register = React.lazy(() => import('../pages/Auth/Register'));
const RegisterProfile = React.lazy(() => import('../pages/Auth/RegisterProfile'));
const EmailConfirmation = React.lazy(() => import('../pages/Auth/EmailConfirmation'));
const ForgotPassword = React.lazy(() => import('../pages/Auth/ForgotPassword'));
const ResetPassword = React.lazy(() => import('../pages/Auth/ResetPassword'));
const ElementAuth = React.lazy(() => import('../pages/Auth/ElementAuth'));

const AuthRoutes = ({ setUser }) => {
  const theme = useTheme();
  const { isAuthenticated } = useAuth();

  return (
    <Box sx={{ minHeight: '100vh', background: theme.palette.background.default, display: 'flex', flexDirection: 'column' }}>
      <React.Suspense fallback={<LoadingIndicator />}>
        <Routes>
          <Route path="/login" element={
            isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <Login />
            )
          } />
          <Route path="/register" element={
            isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <Register setUser={setUser} />
            )
          } />
          <Route path="/register/profile" element={
            isAuthenticated ? (
              <RegisterProfile setUser={setUser} />
            ) : (
              <Navigate to="/login" replace />
            )
          } />
          <Route path="/confirm-email/:token" element={<EmailConfirmation />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/element-auth" element={<ElementAuth />} />
          <Route path="/auth_elem/:token" element={<ElementAuth />} />
          <Route path="/auth_elem/direct/:token" element={<ElementAuth />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </React.Suspense>
    </Box>
  );
};

export default AuthRoutes; 