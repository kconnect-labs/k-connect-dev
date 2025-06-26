import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  CircularProgress,
  Chip,
  IconButton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Close as CloseIcon,
  Diamond as DiamondIcon,
  Star as StarIcon,
  Celebration as CelebrationIcon
} from '@mui/icons-material';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: window.innerWidth <= 768 ? 0 : '8px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    maxWidth: window.innerWidth <= 768 ? '100vw' : 500,
    width: window.innerWidth <= 768 ? '100%' : '90%',
    overflow: 'hidden',
    '@media (max-width: 768px)': {
      margin: 0,
      maxHeight: '100vh',
      borderRadius: 0,
    }
  },
}));

const ModalContent = styled(Box)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(3),
  textAlign: 'center',
  minHeight: 400,
}));

const PackContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: 200,
  height: 200,
  margin: '0 auto 24px',
  background: 'linear-gradient(135deg, rgba(208, 188, 255, 0.2) 0%, rgba(156, 100, 242, 0.2) 100%)',
  borderRadius: 12,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at center, rgba(208, 188, 255, 0.1) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
}));

const ItemContainer = styled(Box)(({ theme }) => ({
  width: 250,
  height: 250,
  borderRadius: 16,
  background: 'rgba(255, 255, 255, 0.1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '2px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
  overflow: 'hidden',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    borderRadius: 'inherit',
    zIndex: 1,
  },
}));

const ItemImage = styled('img')({
  width: '75%',
  height: '75%',
  objectFit: 'contain',
  borderRadius: 'inherit',
  position: 'relative',
  zIndex: 2,
});

const RarityChip = styled(Chip)(({ rarity, theme }) => {
  const colors = {
    common: { bg: '#95a5a6', color: '#fff' },
    rare: { bg: '#3498db', color: '#fff' },
    epic: { bg: '#9b59b6', color: '#fff' },
    legendary: { bg: '#f39c12', color: '#fff' },
  };
  
  return {
    background: colors[rarity]?.bg || colors.common.bg,
    color: colors[rarity]?.color || colors.common.color,
    fontWeight: 700,
    fontSize: '1rem',
    padding: '8px 16px',
    '& .MuiChip-label': {
      padding: '4px 12px',
    },
  };
});

const Sparkle = styled(motion.div)({
  position: 'absolute',
  width: 4,
  height: 4,
  background: '#d0bcff',
  borderRadius: '50%',
  pointerEvents: 'none',
});

const PackOpeningModal = ({ pack, onClose }) => {
  const [opening, setOpening] = useState(true);
  const [obtainedItem, setObtainedItem] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [sparkles, setSparkles] = useState([]);

  useEffect(() => {
    if (pack && pack.purchase_id) {
      openPack();
    }
  }, [pack]);

  useEffect(() => {
    if (opening) {
      // Создаем искры во время открытия
      const sparkleInterval = setInterval(() => {
        setSparkles(prev => [
          ...prev,
          {
            id: Date.now(),
            x: Math.random() * 100,
            y: Math.random() * 100,
            delay: Math.random() * 0.5,
          }
        ]);
      }, 100);

      return () => clearInterval(sparkleInterval);
    }
  }, [opening]);

  const openPack = async () => {
    try {
      const response = await fetch(`/api/inventory/packs/${pack.purchase_id}/open`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        // Имитируем задержку открытия
        setTimeout(() => {
          setObtainedItem(data.item);
          setOpening(false);
          setShowResult(true);
        }, 2000);
      } else {
        alert(data.message || 'Ошибка открытия пака');
        onClose();
      }
    } catch (err) {
      alert('Ошибка сети');
      onClose();
    }
  };

  const getRarityIcon = (rarity) => {
    switch (rarity) {
      case 'legendary':
        return <DiamondIcon sx={{ fontSize: 24 }} />;
      case 'epic':
        return <StarIcon sx={{ fontSize: 24 }} />;
      default:
        return null;
    }
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

  const handleClose = () => {
    if (!opening) {
      onClose();
    }
  };

  return (
    <StyledDialog
      open={true}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      fullScreen={window.innerWidth <= 768}
      disableEscapeKeyDown={opening}
    >
      <DialogContent sx={{ p: 0 }}>
        <ModalContent>
          <IconButton
            onClick={handleClose}
            disabled={opening}
            sx={{
              position: 'absolute',
              right: 16,
              top: 16,
              color: 'text.secondary',
              '&:hover': {
                color: 'primary.main',
              },
            }}
          >
            <CloseIcon />
          </IconButton>

          <AnimatePresence mode="wait">
            {opening ? (
              <motion.div
                key="opening"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5 }}
              >
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700, 
                    mb: 3,
                  }}
                >
                  Открываем пак...
                </Typography>

                <PackContainer>
                  <motion.div
                    animate={{ 
                      rotate: [0, 360],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{ 
                      rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                      scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
                    }}
                  >
                    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                      {/* Искры */}
                      {sparkles.map((sparkle) => (
                        <Sparkle
                          key={sparkle.id}
                          initial={{ 
                            opacity: 0, 
                            scale: 0,
                            x: sparkle.x,
                            y: sparkle.y,
                          }}
                          animate={{ 
                            opacity: [0, 1, 0],
                            scale: [0, 1, 0],
                            x: sparkle.x + (Math.random() - 0.5) * 50,
                            y: sparkle.y + (Math.random() - 0.5) * 50,
                          }}
                          transition={{ 
                            duration: 1,
                            delay: sparkle.delay,
                          }}
                          onAnimationComplete={() => {
                            setSparkles(prev => prev.filter(s => s.id !== sparkle.id));
                          }}
                        />
                      ))}
                      
                      <Typography 
                        variant="h2" 
                        sx={{ 
                          fontWeight: 700,
                        }}
                      >
                        ?
                      </Typography>
                    </Box>
                  </motion.div>
                </PackContainer>

                <CircularProgress 
                  size={40} 
                  sx={{ mb: 2 }} 
                />
                
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: 'text.secondary',
                    fontSize: '1.1rem'
                  }}
                >
                  Пожалуйста, подождите...
                </Typography>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 200, 
                    damping: 15,
                    delay: 0.2
                  }}
                >
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 700, 
                      mb: 1,
                    }}
                  >
                    Поздравляем!
                  </Typography>
                </motion.div>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 200, 
                    damping: 15,
                    delay: 0.4
                  }}
                >
                  <PackContainer>
                    <ItemContainer sx={{
                      ...(obtainedItem?.background_url && {
                        '&::before': {
                          backgroundImage: `url(${obtainedItem.background_url})`,
                        }
                      })
                    }}>
                      <ItemImage 
                        src={`/inventory/${obtainedItem?.id}`}
                        alt={obtainedItem?.name}
                        onError={(e) => {
                          console.error(`Failed to load image: /inventory/${obtainedItem?.id}`);
                          e.target.style.display = 'none';
                        }}
                        onLoad={() => {
                          console.log(`Successfully loaded image: /inventory/${obtainedItem?.id}`);
                        }}
                      />
                    </ItemContainer>
                  </PackContainer>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 600, 
                      mb: 1
                    }}
                  >
                    {obtainedItem?.name}
                  </Typography>

                  <Box sx={{ mb: 3 }}>
                    <RarityChip
                      rarity={obtainedItem?.rarity}
                      label={getRarityLabel(obtainedItem?.rarity)}
                      icon={getRarityIcon(obtainedItem?.rarity)}
                    />
                  </Box>

                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: 'text.secondary',
                      mb: 3,
                      fontSize: '1.1rem'
                    }}
                  >
                    Предмет добавлен в ваш инвентарь!
                  </Typography>

                  <Button
                    variant="contained"
                    onClick={onClose}
                    startIcon={<CelebrationIcon />}
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
                    }}
                  >
                    Отлично!
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </ModalContent>
      </DialogContent>
    </StyledDialog>
  );
};

export default PackOpeningModal; 