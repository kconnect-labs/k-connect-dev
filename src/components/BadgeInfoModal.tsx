import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Chip,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Link } from 'react-router-dom';
import axios from 'axios';
import UniversalModal from '../UIKIT/UniversalModal/UniversalModal';
import { useLanguage } from '../context/LanguageContext';
import VerifiedIcon from '@mui/icons-material/Verified';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonIcon from '@mui/icons-material/Person';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

interface BadgeInfo {
  id: number;
  name: string;
  description: string;
  image_path: string;
  price: number;
  copies_sold: number;
  max_copies: number | null;
  is_sold_out: boolean;
  upgrade: string | null;
  color_upgrade: string | null;
  created_at: string | null;
  creator: {
    id: number;
    username: string;
    name: string;
    avatar_url: string | null;
  };
  user_purchase: {
    owned: boolean;
    purchase_date: string | null;
    price_paid: number | null;
    is_creator: boolean;
  };
  statistics: {
    total_copies_sold: number;
    total_revenue: number;
    royalty_percentage: number;
    recent_buyers: Array<{
      id: number;
      username: string;
      name: string;
      avatar_url: string | null;
      purchase_date: string;
      price_paid: number;
    }>;
  };
}

interface BadgeInfoModalProps {
  open: boolean;
  onClose: () => void;
  badgeId?: number | null;
  imagePath?: string | null;
}

const BadgeInfoModal: React.FC<BadgeInfoModalProps> = ({
  open,
  onClose,
  badgeId,
  imagePath,
}) => {
  const { t } = useLanguage();
  const [badgeInfo, setBadgeInfo] = useState<BadgeInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && (badgeId || imagePath)) {
      fetchBadgeInfo();
    } else {
      // Очищаем данные только при закрытии модалки
      if (!open) {
        setBadgeInfo(null);
        setError(null);
      }
    }
  }, [open, badgeId, imagePath]);

  const fetchBadgeInfo = async () => {
    if (!badgeId && !imagePath) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let response;
      if (badgeId) {
        response = await axios.get(`/api/badges/info/${badgeId}`);
      } else if (imagePath) {
        response = await axios.get(`/api/badges/info/by-image-path?image_path=${encodeURIComponent(imagePath)}`);
      }
      
      if (response) {
        setBadgeInfo(response.data);
      }
    } catch (err: any) {
      console.error('Error fetching badge info:', err);
      setError(err.response?.data?.error || 'Ошибка при загрузке информации о бейдже');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('ru-RU');
  };

  if (!open) return null;

  return (
    <UniversalModal
      open={open}
      onClose={onClose}
      title="Информация о бейдже"
      maxWidth={false}
      maxWidthCustom="800px"
      fullWidth
    >
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : badgeInfo ? (
        <Box>
          {/* Основная информация о бейдже */}
          <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
            <Box
              component="img"
              src={badgeInfo.image_path}
              alt={badgeInfo.name}
              sx={{
                width: 120,
                height: 120,
                objectFit: 'contain',
                borderRadius: 1.5,
                border: '2px solid rgba(255, 255, 255, 0.1)',
              }}
            />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                {badgeInfo.name}
              </Typography>
              
              {badgeInfo.description && (
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  {badgeInfo.description}
                </Typography>
              )}

              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                <Chip
                  icon={<MonetizationOnIcon />}
                  label={`${formatPrice(badgeInfo.price)} баллов`}
                  color="primary"
                  variant="outlined"
                />
                
                {badgeInfo.is_sold_out ? (
                  <Chip label="Распродан" color="error" variant="outlined" />
                ) : (
                  <Chip
                    label={`${badgeInfo.copies_sold}${badgeInfo.max_copies ? `/${badgeInfo.max_copies}` : ''} копий`}
                    color="success"
                    variant="outlined"
                  />
                )}

                {badgeInfo.upgrade && (
                  <Chip
                    label={`Улучшение: ${badgeInfo.upgrade}`}
                    color="secondary"
                    variant="outlined"
                  />
                )}
              </Box>

              {/* Информация о владении */}
              {badgeInfo.user_purchase.owned && (
                <Box
                  sx={{
                    p: 1.5,
                    bgcolor: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: 1.5,
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500, mb: 0.5 }}>
                    {badgeInfo.user_purchase.is_creator ? 'Вы создатель этого бейджа' : 'У вас есть этот бейдж'}
                  </Typography>
                  {badgeInfo.user_purchase.purchase_date && (
                    <Typography variant="caption" color="text.secondary">
                      Получен: {formatDate(badgeInfo.user_purchase.purchase_date)}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Информация о создателе */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Создатель
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                src={badgeInfo.creator.avatar_url || undefined}
                alt={badgeInfo.creator.name}
                sx={{ width: 48, height: 48 }}
              />
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {badgeInfo.creator.name}
                  </Typography>
                  <VerifiedIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                </Box>
                <Typography
                  component={Link}
                  to={`/profile/${badgeInfo.creator.username}`}
                  variant="body2"
                  color="text.secondary"
                  sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                >
                  @{badgeInfo.creator.username}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Статистика */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Статистика
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
              <Box
                sx={{
                  p: 2,
                  bgcolor: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: 1.5,
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <ShoppingCartIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                  <Typography variant="body2" color="text.secondary">
                    Продано копий
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {badgeInfo.statistics.total_copies_sold}
                </Typography>
              </Box>

              <Box
                sx={{
                  p: 2,
                  bgcolor: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: 1.5,
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <TrendingUpIcon sx={{ fontSize: 20, color: 'success.main' }} />
                  <Typography variant="body2" color="text.secondary">
                    Общий доход
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {formatPrice(badgeInfo.statistics.total_revenue)} баллов
                </Typography>
              </Box>

              {badgeInfo.created_at && (
                <Box
                  sx={{
                    p: 2,
                    bgcolor: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: 1.5,
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <CalendarTodayIcon sx={{ fontSize: 20, color: 'info.main' }} />
                    <Typography variant="body2" color="text.secondary">
                      Дата создания
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {formatDate(badgeInfo.created_at)}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          {/* Недавние покупатели */}
          {badgeInfo.statistics.recent_buyers.length > 0 && (
            <>
              <Divider sx={{ my: 3 }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Недавние покупатели
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {badgeInfo.statistics.recent_buyers.map((buyer) => (
                    <Box
                      key={buyer.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 2,
                        bgcolor: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: 1.5,
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          src={buyer.avatar_url || undefined}
                          alt={buyer.name}
                          sx={{ width: 32, height: 32 }}
                        />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {buyer.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            @{buyer.username}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {formatPrice(buyer.price_paid)} баллов
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(buyer.purchase_date)}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </>
          )}
        </Box>
      ) : null}
    </UniversalModal>
  );
};

export default BadgeInfoModal;
