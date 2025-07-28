import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Button,
  Chip,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Tag as TagIcon,
  Person as PersonIcon,
  MonetizationOn as MonetizationOnIcon,
  Schedule as ScheduleIcon,
  ArrowUpward as ArrowUpwardIcon,
  InfoOutlined as InfoOutlinedIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import UniversalModal from '../../../../UIKIT/UniversalModal';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface AuctionDetailModalProps {
  open: boolean;
  onClose: () => void;
  auction: any;
  loading: boolean;
  user: any;
  onBidClick: (auction: any) => void;
  onBuyNow?: (auctionId: number) => void;
  onAcceptBid?: (auction: any) => void;
  onCancelAuction?: (auctionId: number) => void;
  loadingButtons: any;
}

const AuctionDetailModal: React.FC<AuctionDetailModalProps> = ({
  open,
  onClose,
  auction,
  loading,
  user,
  onBidClick,
  onBuyNow,
  onAcceptBid,
  onCancelAuction,
  loadingButtons,
}) => {
  const theme = useTheme();

  const formatTimeRemaining = (endDate: string) => {
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
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd MMM yyyy, HH:mm', { locale: ru });
    } catch (e) {
      return dateString;
    }
  };

  const currentPrice = auction?.current_price || auction?.highest_bid || auction?.min_price;
  const isOwner = auction?.seller_id === user?.id || auction?.seller?.id === user?.id;
  const isCompleted = auction?.status === 'completed';

  return (
    <UniversalModal
      open={open}
      onClose={onClose}
      title={`@${auction?.username}`}
      maxWidth="md"
      fullWidth
    >
      {loading ? (
        <Box display='flex' justifyContent='center' my={4}>
          <CircularProgress />
        </Box>
      ) : auction ? (
        <Grid container spacing={3}>
          {/* Информация об аукционе */}
          <Grid item xs={12} md={7}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mb: 3,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.background.paper, 0.7),
              }}
            >
              <Typography variant='h6' gutterBottom>
                Информация об аукционе
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PersonIcon
                    sx={{
                      mr: 1.5,
                      color: 'text.secondary',
                      fontSize: '1.2rem',
                    }}
                  />
                  <Typography variant='body1'>
                    Продавец:{' '}
                    <strong>
                      {auction.seller
                        ? auction.seller.username
                        : 'Unknown'}
                    </strong>
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <MonetizationOnIcon
                    sx={{
                      mr: 1.5,
                      color: 'text.secondary',
                      fontSize: '1.2rem',
                    }}
                  />
                  <Typography variant='body1'>
                    Минимальная цена:{' '}
                    <strong>{auction.min_price} баллов</strong>
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <MonetizationOnIcon
                    sx={{
                      mr: 1.5,
                      color: 'primary.main',
                      fontSize: '1.2rem',
                    }}
                  />
                  <Typography variant='body1'>
                    {isCompleted ? 'Финальная цена:' : 'Текущая цена:'}{' '}
                    <strong>
                      {isCompleted
                        ? auction.final_price || currentPrice
                        : currentPrice}{' '}
                      баллов
                    </strong>
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ScheduleIcon
                    sx={{
                      mr: 1.5,
                      color: 'text.secondary',
                      fontSize: '1.2rem',
                    }}
                  />
                  <Typography variant='body1'>
                    Создан:{' '}
                    <strong>
                      {formatDate(auction.created_at)}
                    </strong>
                  </Typography>
                </Box>
                {isCompleted ? (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ScheduleIcon
                      sx={{
                        mr: 1.5,
                        color: 'success.main',
                        fontSize: '1.2rem',
                      }}
                    />
                    <Typography variant='body1'>
                      Завершен:{' '}
                      <strong>
                        {formatDate(
                          auction.completed_at || auction.end_time
                        )}
                      </strong>
                    </Typography>
                  </Box>
                ) : (
                  <>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ScheduleIcon
                        sx={{
                          mr: 1.5,
                          color: 'warning.main',
                          fontSize: '1.2rem',
                        }}
                      />
                      <Typography variant='body1'>
                        Завершается:{' '}
                        <strong>
                          {formatDate(auction.end_time)}
                        </strong>
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ScheduleIcon
                        sx={{
                          mr: 1.5,
                          color: 'info.main',
                          fontSize: '1.2rem',
                        }}
                      />
                      <Typography variant='body1'>
                        Осталось:{' '}
                        <strong>
                          {auction.remaining_time_formatted ||
                            formatTimeRemaining(auction.end_time)}
                        </strong>
                      </Typography>
                    </Box>
                  </>
                )}
                {isCompleted &&
                  auction.winner_id && (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mt: 1,
                      }}
                    >
                      <PersonIcon
                        sx={{
                          mr: 1.5,
                          color: 'success.main',
                          fontSize: '1.2rem',
                        }}
                      />
                      <Typography variant='body1' color='success.main'>
                        Победитель:{' '}
                        <strong>
                          {auction.winner
                            ? auction.winner.username
                            : 'Unknown'}
                        </strong>
                      </Typography>
                    </Box>
                  )}
              </Box>
            </Paper>

            {isCompleted ? (
              <Button
                variant='outlined'
                fullWidth
                size='large'
                disabled={true}
                sx={{ mt: 1, borderRadius: 2, py: 1.25 }}
              >
                Аукцион завершен
              </Button>
            ) : !isOwner ? (
              <Button
                variant='contained'
                color='primary'
                fullWidth
                size='large'
                onClick={() => {
                  onClose();
                  onBidClick(auction);
                }}
                disabled={loadingButtons.bid}
                sx={{ mt: 1, borderRadius: 2, py: 1.25 }}
              >
                Сделать ставку
              </Button>
            ) : (
              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                {auction.bids_count > 0 && onAcceptBid && (
                  <Button
                    variant='contained'
                    color='success'
                    sx={{ flex: 1, borderRadius: 2, py: 1.25 }}
                    onClick={() => onAcceptBid(auction)}
                    disabled={loadingButtons.accept === auction.id}
                    startIcon={
                      loadingButtons.accept === auction.id ? (
                        <CircularProgress size={20} color='inherit' />
                      ) : null
                    }
                  >
                    {loadingButtons.accept === auction.id
                      ? 'Принятие...'
                      : 'Принять ставку'}
                  </Button>
                )}
                {onCancelAuction && (
                  <Button
                    variant='outlined'
                    color='error'
                    sx={{ flex: 1, borderRadius: 2, py: 1.25 }}
                    onClick={() => onCancelAuction(auction.id)}
                    disabled={loadingButtons.cancel === auction.id}
                    startIcon={
                      loadingButtons.cancel === auction.id ? (
                        <CircularProgress size={20} color='error' />
                      ) : null
                    }
                  >
                    {loadingButtons.cancel === auction.id
                      ? 'Отмена...'
                      : 'Отменить'}
                  </Button>
                )}
              </Box>
            )}
          </Grid>

          {/* История ставок */}
          <Grid item xs={12} md={5}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.background.paper, 0.7),
              }}
            >
              <Typography variant='h6' gutterBottom>
                История ставок{' '}
                {auction.bids && auction.bids.length > 0
                  ? `(${auction.bids.length})`
                  : ''}
              </Typography>

              {!auction.bids ||
              auction.bids.length === 0 ? (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <InfoOutlinedIcon
                    sx={{
                      fontSize: '3rem',
                      color: 'text.secondary',
                      mb: 1,
                      opacity: 0.5,
                    }}
                  />
                  <Typography variant='body1' color='text.secondary'>
                    {isCompleted
                      ? 'Аукцион завершен без ставок'
                      : 'Пока нет ставок'}
                  </Typography>
                  {!isCompleted && (
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      sx={{ mt: 1 }}
                    >
                      Будьте первым, кто сделает ставку!
                    </Typography>
                  )}
                </Box>
              ) : (
                <List
                  sx={{ maxHeight: '400px', overflowY: 'auto', pr: 1 }}
                >
                  {auction.bids
                    .sort((a: any, b: any) => new Date(b.time) - new Date(a.time))
                    .map((bid: any, index: number) => {
                      // Находим максимальную ставку для определения высшей
                      const maxBidAmount = Math.max(...auction.bids.map((b: any) => b.amount));
                      const isHighestBid = bid.amount === maxBidAmount;
                      const isMyBid = bid.bidder.id === user?.id;
                      const isWinner =
                        isCompleted &&
                        auction.winner_id === bid.bidder.id;

                      return (
                        <ListItem
                          key={`${bid.bidder.id}-${bid.time}`}
                          sx={{
                            borderRadius: 1,
                            mb: 1,
                            bgcolor: isHighestBid || isWinner
                              ? alpha(theme.palette.success.main, 0.1)
                              : alpha(theme.palette.background.paper, 0.5),
                            border: isHighestBid || isWinner
                              ? `1px solid ${alpha(theme.palette.success.main, 0.3)}`
                              : `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar
                              alt={bid.bidder.username}
                              src={
                                bid.bidder.avatar_url ||
                                (bid.bidder.photo
                                  ? bid.bidder.photo.startsWith('/') ||
                                    bid.bidder.photo.startsWith('http')
                                    ? bid.bidder.photo
                                    : `/static/uploads/avatar/${bid.bidder.id}/${bid.bidder.photo}`
                                  : null)
                              }
                              sx={
                                isHighestBid || isWinner
                                  ? {
                                      bgcolor: 'success.main',
                                      color: 'white',
                                    }
                                  : {}
                              }
                              onError={(e: any) => {
                                console.error(
                                  'Ошибка загрузки аватара:',
                                  bid.bidder.username
                                );
                                e.target.src = `/static/uploads/avatar/system/avatar.png`;
                              }}
                            >
                              {(isHighestBid || isWinner) && (
                                <ArrowUpwardIcon />
                              )}
                              {!(isHighestBid || isWinner) &&
                                bid.bidder.username.charAt(0)}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box
                                sx={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'baseline',
                                }}
                              >
                                <Typography
                                  variant='body1'
                                  fontWeight={
                                    isHighestBid || isWinner
                                      ? 'bold'
                                      : 'normal'
                                  }
                                >
                                  {bid.bidder.username}{' '}
                                  {isMyBid && '(Вы)'}
                                </Typography>
                                <Typography
                                  variant='body1'
                                  fontWeight='bold'
                                  color={
                                    isHighestBid || isWinner
                                      ? 'success.main'
                                      : 'inherit'
                                  }
                                >
                                  {bid.amount} баллов
                                </Typography>
                              </Box>
                            }
                            secondary={
                              <Typography
                                variant='body2'
                                color='text.secondary'
                              >
                                {formatDate(bid.time)}
                                {isCompleted && isWinner && (
                                  <Typography
                                    component='span'
                                    variant='body2'
                                    color='success.main'
                                    sx={{
                                      display: 'block',
                                      fontWeight: 'bold',
                                    }}
                                  >
                                    Победная ставка
                                  </Typography>
                                )}
                                {!isCompleted && isHighestBid && (
                                  <Typography
                                    component='span'
                                    variant='body2'
                                    color='success.main'
                                    sx={{
                                      display: 'block',
                                      fontWeight: 'bold',
                                    }}
                                  >
                                    Лидирующая ставка
                                  </Typography>
                                )}
                              </Typography>
                            }
                          />
                        </ListItem>
                      );
                    })}
                </List>
              )}
            </Paper>
          </Grid>
        </Grid>
      ) : null}
    </UniversalModal>
  );
};

export default AuctionDetailModal; 