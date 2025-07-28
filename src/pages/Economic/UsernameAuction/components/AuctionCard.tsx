import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  CircularProgress,
  Grid,
  alpha,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import TagIcon from '@mui/icons-material/Tag';
import PersonIcon from '@mui/icons-material/Person';
import ScheduleIcon from '@mui/icons-material/Schedule';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import GavelIcon from '@mui/icons-material/Gavel';

interface Auction {
  id: number;
  username: string;
  min_price: number;
  current_price?: number;
  highest_bid?: number;
  status: string;
  seller_id?: number;
  seller?: { username: string };
  end_time: string;
  created_at: string;
  completed_at?: string;
  bids_count?: number;
  bids?: Array<{
    bidder: { id: number; username: string; avatar_url?: string; photo?: string };
    amount: number;
    time: string;
  }>;
  remaining_time_formatted?: string;
  winner_id?: number;
  winner?: { username: string };
  final_price?: number;
}

interface UserBid {
  id: number;
  username: string;
  my_bid: number;
  highest_bid: number;
  status: string;
  end_time: string;
  remaining_time_formatted?: string;
  am_winning: boolean;
}

interface AuctionCardProps {
  auction: Auction | UserBid;
  type: 'auction' | 'userBid' | 'userAuction';
  user: any;
  loadingButtons: {
    bid: boolean;
    buy: number | null;
    accept: number | null;
    cancel: number | null;
    create: boolean;
  };
  onCardClick: (auction: Auction | UserBid) => void;
  onBidClick: (auction: Auction | UserBid) => void;
  onCancelClick?: (auctionId: number) => void;
  onAcceptClick?: (auction: Auction) => void;
  onBuyClick?: (auctionId: number) => void;
}

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  overflow: 'hidden',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  background: 'var(--theme-background, rgba(255, 255, 255, 0.03))',
  backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
  },
}));

const StatusChip = styled(Chip)(({ theme, status }: { theme: any; status: string }) => {
  let statusColor = theme.palette.primary.main;

  if (status === 'active') {
    statusColor = theme.palette.success.main;
  } else if (status === 'cancelled') {
    statusColor = theme.palette.error.main;
  } else if (status === 'completed') {
    statusColor = theme.palette.primary.main;
  }

  return {
    borderRadius: 12,
    fontWeight: 600,
    fontSize: '0.75rem',
    backgroundColor: alpha(statusColor, 0.15),
    color: statusColor,
    border: `1px solid ${alpha(statusColor, 0.3)}`,
    '& .MuiChip-label': {
      padding: '0 8px',
    },
  };
});

const formatTimeRemaining = (endDate: string) => {
  try {
    const end = new Date(endDate);
    const now = new Date();
    const diffMs = end.getTime() - now.getTime();

    if (diffMs <= 0) return 'Завершен';

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(
      (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffDays > 0) {
      return `${diffDays} д ${diffHours} ч`;
    } else if (diffHours > 0) {
      return `${diffHours} ч ${diffMinutes} мин`;
    } else {
      return `${diffMinutes} мин`;
    }
  } catch (error) {
    return 'Ошибка времени';
  }
};

const AuctionCard: React.FC<AuctionCardProps> = ({
  auction,
  type,
  user,
  loadingButtons,
  onCardClick,
  onBidClick,
  onCancelClick,
  onAcceptClick,
  onBuyClick,
}) => {
  const theme = useTheme();

  const isUserBid = type === 'userBid';
  const isUserAuction = type === 'userAuction';
  const isCompleted = auction.status === 'completed';
  
  const currentPrice = isUserBid 
    ? (auction as UserBid).highest_bid
    : (auction as Auction).current_price || (auction as Auction).highest_bid || (auction as Auction).min_price;

  const isMyAuction = isUserAuction && (auction as Auction).seller_id === user?.id;
  const canBid = !isMyAuction && !isCompleted && !isUserBid;

  const handleBidClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBidClick(auction);
  };

  const handleCancelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCancelClick && 'id' in auction) {
      onCancelClick(auction.id);
    }
  };

  const handleAcceptClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAcceptClick && type === 'userAuction') {
      onAcceptClick(auction as Auction);
    }
  };

  const handleBuyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onBuyClick && 'id' in auction) {
      onBuyClick(auction.id);
    }
  };

  const handleCardClick = () => {
    try {
      onCardClick(auction);
    } catch (error) {
      console.error('Error handling card click:', error);
    }
  };

  if (!auction) {
    return null;
  }

  return (
    <StyledCard onClick={handleCardClick}>
      <CardContent sx={{ p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TagIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant='h5' component='h2' fontWeight='bold'>
                @{auction.username}
              </Typography>
              <StatusChip
                theme={theme}
                label={auction.status || 'active'}
                status={auction.status || 'active'}
                size='small'
                sx={{ ml: 2 }}
              />
            </Box>

            {!isUserBid && (auction as Auction).seller && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PersonIcon sx={{ mr: 1, fontSize: '0.875rem', color: 'text.secondary' }} />
                <Typography variant='body2' color='text.secondary'>
                  Продавец: {(auction as Auction).seller?.username}
                </Typography>
              </Box>
            )}

            {isUserBid && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PersonIcon sx={{ mr: 1, fontSize: '0.875rem', color: 'text.secondary' }} />
                <Typography variant='body2' color='text.secondary'>
                  Ваша ставка: <b>{(auction as UserBid).my_bid} баллов</b>
                </Typography>
              </Box>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <ScheduleIcon sx={{ mr: 1, fontSize: '0.875rem', color: 'text.secondary' }} />
              <Typography variant='body2' color='text.secondary'>
                Осталось: {auction.remaining_time_formatted || formatTimeRemaining(auction.end_time)}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LocalOfferIcon sx={{ mr: 1, fontSize: '0.875rem', color: 'text.secondary' }} />
              <Typography variant='body2' color='text.secondary'>
                Ставок: {isUserBid ? '-' : (auction as Auction).bids_count || ((auction as Auction).bids ? (auction as Auction).bids!.length : 0)}
              </Typography>
            </Box>

            {isUserBid && (auction as UserBid).am_winning && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <GavelIcon sx={{ mr: 1, fontSize: '0.875rem', color: 'success.main' }} />
                <Typography variant='body2' color='success.main' fontWeight='bold'>
                  Вы лидируете!
                </Typography>
              </Box>
            )}

            {isUserAuction && (auction as Auction).winner_id && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <PersonIcon sx={{ mr: 1, fontSize: '0.875rem', color: 'success.main' }} />
                <Typography variant='body2' color='success.main' fontWeight='medium'>
                  Победитель: {(auction as Auction).winner?.username}
                </Typography>
              </Box>
            )}
          </Grid>

          <Grid
            item
            xs={12}
            sm={4}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              justifyContent: 'center',
            }}
          >
            <Typography
              variant='h6'
              color='primary'
              fontWeight='bold'
              sx={{ mb: 1 }}
            >
              {isUserBid 
                ? `Текущая: ${currentPrice} баллов`
                : `${currentPrice} баллов`
              }
            </Typography>

            {isCompleted ? (
              <Button
                variant='outlined'
                disabled={true}
                fullWidth
                sx={{ borderRadius: 2 }}
              >
                Аукцион завершен
              </Button>
            ) : isUserAuction ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
                    {((auction as Auction).bids_count || 0) > 0 && (                  
                    <Button
                    variant='contained'
                    color='success'
                    sx={{ borderRadius: 2 }}
                    onClick={handleAcceptClick}
                    disabled={loadingButtons.accept === (auction as Auction).id}
                    startIcon={
                      loadingButtons.accept === (auction as Auction).id ? (
                        <CircularProgress size={20} color='inherit' />
                      ) : null
                    }
                  >
                    {loadingButtons.accept === (auction as Auction).id
                      ? 'Принятие...'
                      : 'Принять ставку'}
                  </Button>
                )}
                <Button
                  variant='outlined'
                  color='error'
                  sx={{ borderRadius: 2 }}
                  onClick={handleCancelClick}
                  disabled={loadingButtons.cancel === (auction as Auction).id}
                  startIcon={
                    loadingButtons.cancel === (auction as Auction).id ? (
                      <CircularProgress size={20} color='error' />
                    ) : null
                  }
                >
                  {loadingButtons.cancel === (auction as Auction).id
                    ? 'Отмена...'
                    : 'Отменить'}
                </Button>
              </Box>
            ) : (
              <Button
                variant='contained'
                color='primary'
                fullWidth
                onClick={handleBidClick}
                disabled={!canBid || loadingButtons.bid}
                sx={{ borderRadius: 2 }}
                startIcon={
                  loadingButtons.bid ? <CircularProgress size={20} /> : null
                }
              >
                {loadingButtons.bid
                  ? 'Обработка...'
                  : isUserBid
                  ? 'Повысить ставку'
                  : 'Сделать ставку'}
              </Button>
            )}
          </Grid>
        </Grid>
      </CardContent>
    </StyledCard>
  );
};

export default AuctionCard; 