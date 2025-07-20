import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import MainLayout from '../components/Layout/MainLayout';
import { LoadingIndicator } from '../components/Loading/LoadingComponents';
import { PublicRoutesProps } from '../types/routes';

// Lazy imports
const RulesPage = React.lazy(() => import('../pages/Info/RulesPage'));
const PrivacyPolicyPage = React.lazy(
  () => import('../pages/Info/PrivacyPolicyPage')
);
const TermsOfServicePage = React.lazy(
  () => import('../pages/Info/TermsOfServicePage')
);
const AboutPage = React.lazy(() => import('../pages/Info/AboutPage'));

const PublicRoutes: React.FC<PublicRoutesProps> = () => {
  const { isAuthenticated } = useContext(AuthContext);

  const content = (
    <React.Suspense fallback={<LoadingIndicator />}>
      <Routes>
        <Route path='/rules' element={<RulesPage />} />
        <Route path='/privacy-policy' element={<PrivacyPolicyPage />} />
        <Route path='/terms-of-service' element={<TermsOfServicePage />} />
        <Route path='/about' element={<AboutPage />} />
      </Routes>
    </React.Suspense>
  );

  return isAuthenticated ? <MainLayout>{content}</MainLayout> : content;
};

export default PublicRoutes;
