import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Card, CardContent, Chip, CircularProgress, Dialog, DialogContent, DialogTitle, IconButton, Alert } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { Close as CloseIcon, Diamond as DiamondIcon, Star as StarIcon, Lock as LockIcon } from '@mui/icons-material';
import PackCard from './PackCard';
import PackOpeningModal from './PackOpeningModal';
import { useAuth } from '../../../../context/AuthContext';
import axios from 'axios';
import InfoBlock from '../../../../UIKIT/InfoBlock';

const StyledContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  padding: theme.spacing(3),
  paddingBottom: '100px',
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(2),
    paddingBottom: '100px',
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
  const [confirmPurchaseOpen, setConfirmPurchaseOpen] = useState(false);
  const [packToPurchase, setPackToPurchase] = useState(null);
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

    // Открываем модалку подтверждения
    setPackToPurchase(pack);
    setConfirmPurchaseOpen(true);
  };

  const handleConfirmPurchase = async () => {
    if (!packToPurchase) return;

    try {
      const response = await fetch(`/api/inventory/packs/${packToPurchase.id}/buy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setUserPoints(data.remaining_points);
        setSelectedPack({ ...packToPurchase, purchase_id: data.purchase_id });
        setOpeningPack(true);
        fetchPacks(); // Обновляем список паков
        setConfirmPurchaseOpen(false);
        setPackToPurchase(null);
      } else {
        alert(data.message || 'Ошибка покупки пака');
      }
    } catch (err) {
      alert('Ошибка сети');
      console.error('Error buying pack:', err);
    }
  };

  const handleCancelPurchase = () => {
    setConfirmPurchaseOpen(false);
    setPackToPurchase(null);
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

  const isSoldOut = selectedPackDetails?.pack.is_limited && 
                    (selectedPackDetails.pack.max_quantity - selectedPackDetails.pack.sold_quantity <= 0);

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

      <Box sx={{ 
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        justifyContent: 'center',
        minHeight: '400px',
        '@media (max-width: 768px)': {
          gap: '8px',
          minHeight: '300px',
        }
      }}>
        {packs.map((pack) => (
          <Box
            key={pack.id}
            sx={{
              flex: '0 0 auto',
              width: {
                xs: '100%', // 1 в ряд на мобильных
                sm: 'calc(50% - 6px)', // 2 в ряд на планшетах
                md: 'calc(33.333% - 8px)', // 3 в ряд на средних экранах
                lg: 'calc(25% - 9px)', // 4 в ряд на больших экранах
                xl: 'calc(20% - 9.6px)', // 5 в ряд на очень больших экранах
              },
              minWidth: {
                xs: '280px',
                sm: '200px',
                md: '250px',
              },
              maxWidth: {
                xs: 'none',
                sm: '300px',
                md: '350px',
              }
            }}
          >
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
          </Box>
        ))}
      </Box>

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
        fullScreen={window.innerWidth <= 768}
        PaperProps={{
          sx: {
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: window.innerWidth <= 768 ? 0 : '8px',
            '@media (max-width: 768px)': {
              margin: 0,
              maxWidth: '100vw',
              maxHeight: '100vh',
              borderRadius: 0,
            }
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          color: 'text.primary',
          pb: 1,
          '@media (max-width: 768px)': {
            padding: '16px',
          }
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
        <DialogContent sx={{ 
          p: 3,
          '@media (max-width: 768px)': {
            padding: '0 16px 16px 16px',
          }
        }}>
          {selectedPackDetails && (
            <>
              <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                {selectedPackDetails.pack.description}
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Возможные предметы:
                </Typography>
                
                <Box sx={{ 
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: window.innerWidth <= 768 ? '5px' : '16px',
                  justifyContent: 'center'
                }}>
                  {selectedPackDetails.contents.map((item, index) => (
                    <Box
                      key={index}
                      sx={{
                        flex: '0 0 auto',
                        width: {
                          xs: 'calc(50% - 2.5px)', // 2 в ряд на мобильных
                          sm: 'calc(33.333% - 10.67px)', // 3 в ряд на планшетах
                          md: 'calc(25% - 12px)', // 4 в ряд на средних экранах
                        },
                        minWidth: {
                          xs: '120px',
                          sm: '150px',
                          md: '180px',
                        }
                      }}
                    >
                      <Card sx={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: 2,
                        p: 2,
                        textAlign: 'center',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        '@media (max-width: 768px)': {
                          padding: '8px',
                          minHeight: '120px',
                        }
                      }}>
                        <Box sx={{
                          width: '100%',
                          height: window.innerWidth <= 768 ? '60px' : '80px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 1,
                          '@media (max-width: 768px)': {
                            marginBottom: '4px',
                          }
                        }}>
                          <img
                            src={`/inventory/pack/${selectedPackDetails.pack.id}/${item.item_name}`}
                            alt={item.item_name}
                            style={{
                              maxWidth: '100%',
                              maxHeight: '100%',
                              objectFit: 'contain',
                            }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </Box>
                        
                        <Typography variant="body2" sx={{ 
                          fontWeight: 500, 
                          mb: 1,
                          fontSize: window.innerWidth <= 768 ? '0.75rem' : '0.875rem',
                        }}>
                          {item.item_name}
                        </Typography>
                        
                        <Chip
                          label={getRarityLabel(item.rarity)}
                          size={window.innerWidth <= 768 ? 'small' : 'medium'}
                          sx={{
                            backgroundColor: getRarityColor(item.rarity),
                            color: 'white',
                            fontWeight: 600,
                            fontSize: window.innerWidth <= 768 ? '0.7rem' : '0.75rem',
                            height: window.innerWidth <= 768 ? '20px' : '24px',
                          }}
                        />
                      </Card>
                    </Box>
                  ))}
                </Box>
              </Box>

              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 2,
                '@media (max-width: 768px)': {
                  flexDirection: 'column',
                  alignItems: 'stretch',
                }
              }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Цена: {selectedPackDetails.pack.price} баллов
                  </Typography>
                  {selectedPackDetails.pack.is_limited && (
                    <Typography variant="body2" color="text.secondary">
                      Осталось: {selectedPackDetails.pack.remaining_quantity} из {selectedPackDetails.pack.max_quantity}
                    </Typography>
                  )}
                </Box>
                
                <Button
                  variant="outlined"
                  disabled={!user || userPoints < selectedPackDetails.pack.price || isSoldOut}
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
                    '@media (max-width: 768px)': {
                      width: '100%',
                    }
                  }}
                >
                  {isSoldOut ? 'Закончился' : 
                   userPoints < selectedPackDetails.pack.price ? 'Недостаточно баллов' : 'Купить'}
                </Button>
              </Box>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Модалка подтверждения покупки */}
      <Dialog
        open={confirmPurchaseOpen}
        onClose={handleCancelPurchase}
        maxWidth="sm"
        fullWidth
        fullScreen={window.innerWidth <= 768}
        PaperProps={{
          sx: {
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: window.innerWidth <= 768 ? 0 : '8px',
            '@media (max-width: 768px)': {
              margin: 0,
              maxWidth: '100vw',
              maxHeight: '100vh',
              borderRadius: 0,
            }
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          color: 'text.primary',
          pb: 1,
          '@media (max-width: 768px)': {
            padding: '16px',
          }
        }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Подтверждение покупки
          </Typography>
          <IconButton
            onClick={handleCancelPurchase}
            sx={{ color: 'text.secondary' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ 
          p: 3,
          '@media (max-width: 768px)': {
            padding: '16px',
          }
        }}>
          {packToPurchase && (
            <>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  {packToPurchase.display_name}
                </Typography>
                
                <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
                  Вы точно уверены, что хотите купить этот пак за {packToPurchase.price} баллов?
                </Typography>

                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  mb: 3,
                  gap: 1 
                }}>
                  <Chip 
                    icon={<DiamondIcon />}
                    label={`${packToPurchase.price} баллов`}
                    sx={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: 'text.primary',
                      fontWeight: 500,
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  />
                  {packToPurchase.is_limited && (
                    <Chip 
                      icon={<LockIcon />}
                      label={`Осталось: ${packToPurchase.max_quantity - packToPurchase.sold_quantity}`}
                      sx={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: 'text.secondary',
                        fontSize: '0.75rem',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    />
                  )}
                </Box>
              </Box>

              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: 2,
                flexWrap: 'wrap',
                '@media (max-width: 768px)': {
                  flexDirection: 'column',
                  alignItems: 'stretch',
                }
              }}>
                <Button
                  variant="outlined"
                  onClick={handleCancelPurchase}
                  sx={{
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    color: 'text.primary',
                    fontWeight: 500,
                    '&:hover': {
                      borderColor: 'rgba(255, 255, 255, 0.4)',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    },
                    '@media (max-width: 768px)': {
                      width: '100%',
                    }
                  }}
                >
                  Отмена
                </Button>
                
                <Button
                  variant="contained"
                  onClick={handleConfirmPurchase}
                  sx={{
                    background: 'linear-gradient(135deg, #d0bcff 0%, #9c64f2 100%)',
                    color: '#1a1a1a',
                    fontWeight: 600,
                    borderRadius: 1,
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #cabcfc 0%, #8a5ce8 100%)',
                    },
                    '@media (max-width: 768px)': {
                      width: '100%',
                    }
                  }}
                >
                  Купить пак
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