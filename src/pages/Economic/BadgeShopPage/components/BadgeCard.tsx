import React from 'react';
import {
  Box,
  Typography,
  Chip,
} from '@mui/material';
import {
  StyledCard,
  BadgeCardHeader,
  BadgeCardContent,
  BadgeTitle,
  BadgeDescription,
  BadgeCreator,
  BadgeCreatorAvatar,
  BadgeCreatorName,
  BadgeFooter,
  BadgePrice,
  BadgePriceText,
  BadgeBuyButton,
  BadgeImage,
  BadgeOverlay,
  CopiesChip,
} from './StyledComponents';
import { Badge as BadgeType } from '../types';
import { getBadgeImageUrl, isBadgeSoldOut, isBadgePurchasedByUser, canUserBuyBadge } from '../utils/badgeUtils';
import BadgeComponent from '../../../../UIKIT/Badge/Badge';


interface BadgeCardProps {
  badge: BadgeType;
  userPoints: number;
  userId?: number;
  onBadgeClick: (badge: BadgeType) => void;
  onPurchaseClick: (badge: BadgeType) => void;
}

export const BadgeCard: React.FC<BadgeCardProps> = ({
  badge,
  userPoints,
  userId,
  onBadgeClick,
  onPurchaseClick,
}) => {
  const isSoldOut = isBadgeSoldOut(badge);
  const isPurchased = isBadgePurchasedByUser(badge, userId);
  const canBuy = canUserBuyBadge(badge, userId);

  const handleCardClick = () => {
    onBadgeClick(badge);
  };

  const handlePurchaseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPurchaseClick(badge);
  };

  return (
    <StyledCard onClick={handleCardClick} sx={{ cursor: 'pointer', height: '100%' }}>
      <Box sx={{ position: 'relative', overflow: 'hidden' }}>
        {(badge.is_upgraded || badge.upgrade) ? (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            height: '150px',
            padding: '12px',
            '@media (max-width: 600px)': {
              padding: '8px',
            }
          }}>
            <BadgeComponent 
              achievement={{
                image_path: `shop/${badge.image_path}`,
                upgrade: (badge.is_upgraded || badge.upgrade) ? 'upgraded' : '',
                color_upgrade: badge.particle_color || badge.color_upgrade || '#FFD700',
                bage: badge.name || 'Бейджик'
              }}
              size="shop"
              className=""
              onError={() => {}}
              showTooltip={true}
              tooltipText={badge.name || 'Бейджик'}
            />
          </Box>
        ) : (
          <BadgeImage 
            className="badge-image"
            src={getBadgeImageUrl(badge.image_path)}
            alt={badge.name || 'Бейджик'} 
          />
        )}
        
        <BadgeOverlay className="badge-overlay">
          <Typography variant="body2" color="white" sx={{ textAlign: 'center' }}>
            Нажмите для подробностей
          </Typography>
        </BadgeOverlay>
        
        {(badge.is_upgraded || badge.upgrade) && (
          <Chip
            size="small"
            label="Улучшенный"
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              height: 24,
              borderRadius: 12,
              fontWeight: 500,
              backgroundColor: 'rgba(183, 0, 255, 0.9)',
              color: '#fffff',
              border: '1px solid rgba(255, 0, 179, 0.18)',
              backdropFilter: 'blur(4px)',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              '& .MuiChip-label': {
                fontSize: '0.7rem',
                padding: '0 8px',
                letterSpacing: '0.02em',
              },
              '@media (max-width: 600px)': {
                height: 20,
                top: 6,
                left: 6,
                '& .MuiChip-label': {
                  fontSize: '0.65rem',
                }
              }
            }}
          />
        )}
        
        {badge.max_copies && badge.max_copies > 0 && (
          <CopiesChip
            size="small"
            label={`${badge.copies_sold || 0}/${badge.max_copies}`}
            issoldout={isSoldOut.toString()}
          />
        )}
      </Box>
      
      <BadgeCardHeader>
        <BadgeTitle variant="subtitle1">
          {badge.name || 'Бейджик без названия'}
        </BadgeTitle>
      </BadgeCardHeader>
      
      <BadgeCardContent>
        <BadgeDescription variant="body2">
          {badge.description || 'Описание отсутствует'}
        </BadgeDescription>
        
        <BadgeCreator>
          <BadgeCreatorAvatar 
            src={badge.creator?.avatar_url} 
            alt={badge.creator?.name || 'Создатель'} 
          />
          <BadgeCreatorName variant="caption">
            {badge.creator?.name || 'Создатель'}
          </BadgeCreatorName>
        </BadgeCreator>
        
        <BadgeFooter>
          <BadgePrice>
            <Box
              component="img"
              src="/static/icons/KBalls.svg" 
              alt="KBalls" 
              sx={{ 
                width: 20, 
                height: 20,
                '@media (max-width: 600px)': {
                  width: 16,
                  height: 16,
                }
              }}
            />
            <BadgePriceText>
              {badge.price} баллов
            </BadgePriceText>
          </BadgePrice>
          
          {isSoldOut ? (
            <BadgeBuyButton
              variant="outlined"
              color="error"
              disabled
            >
              Распродано
            </BadgeBuyButton>
          ) : !isPurchased && (
            <BadgeBuyButton
              onClick={handlePurchaseClick}
              disabled={userPoints < badge.price}
            >
              Купить
            </BadgeBuyButton>
          )}
        </BadgeFooter>
      </BadgeCardContent>
    </StyledCard>
  );
}; 