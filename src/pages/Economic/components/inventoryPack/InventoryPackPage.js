import React, { useState, useEffect } from 'react';
import { Box, Grid, Typography, Button, Card, CardContent, Chip, CircularProgress, Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { Close as CloseIcon, Diamond as DiamondIcon, Star as StarIcon } from '@mui/icons-material';
import PackCard from './PackCard';
import PackOpeningModal from './PackOpeningModal';
import { useAuth } from '../../../../context/AuthContext';
import axios from 'axios';
import InfoBlock from '../../../../UIKIT/InfoBlock';

const StyledContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  padding: theme.spacing(3),
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(2),
  },
}));

const StyledCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: 16,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
  },
}));

const PageTitle = styled(Typography)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: theme.spacing(4),
  fontWeight: 700,
}));

const InventoryPackPage = () => {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPack, setSelectedPack] = useState(null);
  const [openingPack, setOpeningPack] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const [packDetailsOpen, setPackDetailsOpen] = useState(false);
  const [selectedPackDetails, setSelectedPackDetails] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchPacks();
    if (user) {
      fetchUserPoints();
    }
  }, [user]);

  const fetchPacks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/inventory/packs');
      const data = await response.json();
      
      if (data.success) {
        setPacks(data.packs);
      } else {
        setError('Ошибка загрузки паков');
      }
    } catch (err) {
      setError('Ошибка сети');
      console.error('Error fetching packs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPoints = async () => {
    try {
      const response = await axios.get('/api/user/points');
      setUserPoints(response.data.points);
    } catch (error) {
      console.error('Error fetching user points:', error);
    }
  };

  const handleBuyPack = async (pack) => {
    if (!user) {
      alert('Необходимо авторизоваться');
      return;
    }

    if (userPoints < pack.price) {
      alert('Недостаточно баллов');
      return;
    }

    try {
      const response = await fetch(`/api/inventory/packs/${pack.id}/buy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setUserPoints(data.remaining_points);
        setSelectedPack({ ...pack, purchase_id: data.purchase_id });
        setOpeningPack(true);
        fetchPacks(); // Обновляем список паков
      } else {
        alert(data.message || 'Ошибка покупки пака');
      }
    } catch (err) {
      alert('Ошибка сети');
      console.error('Error buying pack:', err);
    }
  };

  const handlePackOpened = () => {
    setOpeningPack(false);
    setSelectedPack(null);
    fetchUserPoints(); // Обновляем баланс
  };

  const handlePackClick = (pack, packContents) => {
    setSelectedPackDetails({ pack, contents: packContents });
    setPackDetailsOpen(true);
  };

  const handleClosePackDetails = () => {
    setPackDetailsOpen(false);
    setSelectedPackDetails(null);
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'legendary':
        return '#f39c12';
      case 'epic':
        return '#9b59b6';
      case 'rare':
        return '#3498db';
      default:
        return '#95a5a6';
    }
  };

  const getRarityLabel = (rarity) => {
    switch (rarity) {
      case 'legendary':
        return 'Легендарный';
      case 'epic':
        return 'Эпический';
      case 'rare':
        return 'Редкий';
      case 'common':
        return 'Обычный';
      default:
        return rarity;
    }
  };

  const getRarityIcon = (rarity) => {
    switch (rarity) {
      case 'legendary':
        return <DiamondIcon sx={{ fontSize: 16 }} />;
      case 'epic':
        return <StarIcon sx={{ fontSize: 16 }} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <StyledContainer>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress size={60} />
        </Box>
      </StyledContainer>
    );
  }

  if (error) {
    return (
      <StyledContainer>
        <StyledCard>
          <CardContent>
            <Typography color="error" textAlign="center">
              {error}
            </Typography>
            <Button 
              onClick={fetchPacks} 
              variant="contained" 
              sx={{ mt: 2, display: 'block', mx: 'auto' }}
            >
              Попробовать снова
            </Button>
          </CardContent>
        </StyledCard>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      <InfoBlock
        title="Паки и Сундуки"
        description="Откройте паки и сундуки, чтобы получить уникальные предметы для вашей коллекции"
        styleVariant="dark"
        sx={{ 
          textAlign: 'center',
          mb: 3,
          '& .MuiTypography-h5': {
            textAlign: 'center',
            fontWeight: 600
          },
          '& .MuiTypography-body2': {
            textAlign: 'center',
            opacity: 0.8
          }
        }}
      />

      <Grid container spacing={3} justifyContent="center" sx={{ 
        '& .MuiGrid-item': {
          paddingLeft: '12px !important',
          paddingTop: '12px !important',
          maxWidth: 'none !important',
          flexBasis: 'auto !important'
        }
      }}>
        {packs.map((pack) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={pack.id} sx={{
            maxWidth: 'none',
            flexBasis: 'auto'
          }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <PackCard 
                pack={pack}
                userPoints={userPoints}
                onBuy={() => handleBuyPack(pack)}
                disabled={!user || userPoints < pack.price}
                onPackClick={handlePackClick}
              />
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <AnimatePresence>
        {openingPack && selectedPack && (
          <PackOpeningModal
            pack={selectedPack}
            onClose={handlePackOpened}
          />
        )}
      </AnimatePresence>

      {/* Модалка с подробностями пака */}
      <Dialog
        open={packDetailsOpen}
        onClose={handleClosePackDetails}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 3,
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          color: 'text.primary',
          pb: 1
        }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {selectedPackDetails?.pack?.display_name}
          </Typography>
          <IconButton
            onClick={handleClosePackDetails}
            sx={{ color: 'text.secondary' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 0 }}>
          {selectedPackDetails && (
            <>
              <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                {selectedPackDetails.pack.description}
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Содержимое пака:
                </Typography>
                
                <Grid container spacing={2}>
                  {selectedPackDetails.contents?.map((item, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Box
                        sx={{
                          p: 2,
                          background: 'rgba(208, 188, 255, 0.05)',
                          borderRadius: 2,
                          border: '1px solid rgba(208, 188, 255, 0.1)',
                          textAlign: 'center',
                        }}
                      >
                        <Box
                          sx={{
                            width: 80,
                            height: 80,
                            margin: '0 auto',
                            borderRadius: 2,
                            background: 'rgba(208, 188, 255, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 1,
                            overflow: 'hidden',
                          }}
                        >
                          <img
                            src={`/inventory/pack/${selectedPackDetails.pack.id}/${item.item_name}`}
                            alt={item.item_name}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </Box>
                        
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                          {item.item_name}
                        </Typography>
                        
                        <Chip
                          label={getRarityLabel(item.rarity)}
                          icon={getRarityIcon(item.rarity)}
                          size="small"
                          sx={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            color: 'text.secondary',
                            fontWeight: 500,
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                          }}
                        />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Chip 
                    icon={<DiamondIcon />}
                    label={`${selectedPackDetails.pack.price} баллов`}
                    sx={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: 'text.primary',
                      fontWeight: 500,
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  />
                  {selectedPackDetails.pack.is_limited && (
                    <Chip 
                      label={`Осталось: ${selectedPackDetails.pack.max_quantity - selectedPackDetails.pack.sold_quantity}`}
                      sx={{
                        ml: 1,
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: 'text.secondary',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    />
                  )}
                </Box>
                
                <Button
                  variant="outlined"
                  disabled={!user || userPoints < selectedPackDetails.pack.price}
                  onClick={() => {
                    handleClosePackDetails();
                    handleBuyPack(selectedPackDetails.pack);
                  }}
                  sx={{
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    color: 'text.primary',
                    fontWeight: 500,
                    '&:hover': {
                      borderColor: 'rgba(255, 255, 255, 0.4)',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    },
                    '&:disabled': {
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      color: 'text.secondary',
                    },
                  }}
                >
                  {!user ? 'Войти' : userPoints < selectedPackDetails.pack.price ? 'Недостаточно баллов' : 'Купить'}
                </Button>
              </Box>
            </>
          )}
        </DialogContent>
      </Dialog>
    </StyledContainer>
  );
};

export default InventoryPackPage; 