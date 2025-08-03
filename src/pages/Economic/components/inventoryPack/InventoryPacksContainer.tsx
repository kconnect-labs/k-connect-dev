import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import StyledTabs from '../../../../UIKIT/StyledTabs';
import PackCard from './PackCard';
import MyProposals from './MyProposals';
import { Pack, PackContent } from './types';

interface InventoryPacksContainerProps {
  userPoints: number;
  onBuy: (pack: Pack) => Promise<void>;
  onPackClick?: (pack: Pack, packContents: PackContent[]) => void;
}

const InventoryPacksContainer: React.FC<InventoryPacksContainerProps> = ({
  userPoints,
  onBuy,
  onPackClick,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [activeTab, setActiveTab] = useState('packs');
  const [packs, setPacks] = useState<Pack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    fetchPacks();
  }, []);

  const fetchPacks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/inventory/packs');
      const data = await response.json();

      if (data.success) {
        setPacks(data.packs);
      } else {
        setError(data.message || 'Ошибка при загрузке паков');
      }
    } catch (err) {
      setError('Ошибка сети');
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async (pack: Pack) => {
    setDisabled(true);
    try {
      await onBuy(pack);
      // Обновляем список паков после покупки
      await fetchPacks();
    } finally {
      setDisabled(false);
    }
  };

  const handleProposeSuccess = () => {
    // Обновляем список паков после успешного предложения
    fetchPacks();
  };

  const tabs = [
    {
      value: 'packs',
      label: 'Паки',
    },
    {
      value: 'proposals',
      label: 'Мои заявки',
    },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: isMobile ? 1 : 2 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700, textAlign: 'center' }}>
        Инвентарь
      </Typography>

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
        <StyledTabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue as string)}
          tabs={tabs}
          centered
          fullWidth={isMobile}
        />
      </Box>

      {activeTab === 'packs' && (
        <>
          {packs.length === 0 ? (
            <Box sx={{ textAlign: 'center', p: 4 }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                Паки не найдены
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Попробуйте позже или предложите свой пак!
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {packs.map((pack) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={pack.id}>
                  <PackCard
                    pack={pack}
                    userPoints={userPoints}
                    onBuy={() => handleBuy(pack)}
                    disabled={disabled}
                    onPackClick={onPackClick}
                    showProposeButton={true}
                    onProposeSuccess={handleProposeSuccess}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {activeTab === 'proposals' && (
        <MyProposals />
      )}
    </Box>
  );
};

export default InventoryPacksContainer; 