import React, { useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import useMarketplace from './useMarketplace';
import { useInfiniteScroll } from './useInfiniteScroll';
import MarketplaceItemCard from './MarketplaceItemCard';
import MarketplaceModal from './MarketplaceModal.js';
import MarketplaceFilters from './MarketplaceFilters';
import { MarketplaceListing } from './types';

const StyledContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  padding: theme.spacing(2),
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(1),
  },
}));

const StyledHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  background: 'var(--theme-background, rgba(255, 255, 255, 0.03))',
  backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(1),
  borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
  textAlign: 'center',
}));

const StyledGrid = styled(Grid)(({ theme }) => ({
  marginBottom: theme.spacing(3),
}));


const EmptyState = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(6),
  color: 'text.secondary',
}));

const MarketplacePage: React.FC = () => {
  const {
    listings,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    applyFilters,
    filters
  } = useMarketplace();

  const [selectedListing, setSelectedListing] = useState<MarketplaceListing | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Добавляем infinite scroll
  const { loadingRef } = useInfiniteScroll({
    hasMore,
    loading,
    onLoadMore: loadMore,
  });

  const handleItemClick = (listing: MarketplaceListing) => {
    setSelectedListing(listing);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedListing(null);
  };

  const handlePurchaseSuccess = () => {
    // Обновляем список после покупки
    refresh();
    handleCloseModal();
  };

  if (error) {
    return (
      <StyledContainer>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={refresh}
        >
          Попробовать снова
        </Button>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      <StyledHeader>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Маркетплейс
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Покупайте и продавайте предметы с другими игроками
        </Typography>
      </StyledHeader>

      {/* Фильтры */}
      <MarketplaceFilters
        onFiltersChange={applyFilters}
        currentFilters={filters}
      />

      {loading && listings.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : listings.length === 0 ? (
        <EmptyState>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Предметы не найдены
          </Typography>
          <Typography variant="body2" color="text.secondary">
            В маркетплейсе пока нет доступных предметов
          </Typography>
        </EmptyState>
      ) : (
        <>
          <StyledGrid container spacing={1}>
            {listings.map((listing, index) => (
              <Grid item xs={6} sm={6} md={4} lg={3} key={`${listing.id}-${index}`}>
                <MarketplaceItemCard
                  listing={listing}
                  onClick={handleItemClick}
                />
              </Grid>
            ))}
          </StyledGrid>

          {/* Невидимый элемент для отслеживания видимости */}
          {hasMore && (
            <Box 
              ref={loadingRef} 
              sx={{ 
                height: '20px', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                py: 2
              }}
            >
              {loading && (
                <>
                  <CircularProgress size={24} />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                    Загружаем еще предметы...
                  </Typography>
                </>
              )}
            </Box>
          )}
          

          {/* Сообщение когда все загружено */}
          {!hasMore && listings.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Все предметы загружены
              </Typography>
            </Box>
          )}
        </>
      )}

      {selectedListing && (
        <MarketplaceModal
          open={modalOpen}
          onClose={handleCloseModal}
          listing={selectedListing}
          onPurchaseSuccess={handlePurchaseSuccess}
        />
      )}
    </StyledContainer>
  );
};

export default MarketplacePage;
