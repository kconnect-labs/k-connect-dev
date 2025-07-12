import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@mui/material';

// Lazy imports
const StreetBlacklistPage = React.lazy(() => import('../pages/Collab/StreetBlacklistPage'));
const StreetBlacklistV1Page = React.lazy(() => import('../pages/Collab/StreetBlacklistV1Page'));

const SpecialRoutes = () => {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      bgcolor: 'background.default'
    }}>
      <React.Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/street/blacklist" element={<StreetBlacklistPage />} />
          <Route path="/street/blacklist/v1" element={<StreetBlacklistV1Page />} />
        </Routes>
      </React.Suspense>
    </Box>
  );
};

export default SpecialRoutes; 