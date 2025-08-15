import React, { memo, useMemo, useCallback } from 'react';
import OptimizedImage from '../components/OptimizedImage';
import './InventoryItemCardPure.css';

// Utilities to determine rarity presentation
const getRarityColor = (rarity = 'common') => {
  switch (rarity) {
    case 'legendary':
      return '#f39c12';
    case 'epic':
      return '#9b59b6';
    case 'rare':
      return '#3498db';
    case 'common':
    default:
      return '#95a5a6';
  }
};

// Utility to check if item is overlay item (levels 2, 3, 4)
const isOverlayItem = (item) => {
  const upgradeable = String(item.upgradeable);
  return upgradeable === '2' || upgradeable === '3' || upgradeable === '4';
};

const getRarityLabel = (rarity = 'common') => {
  switch (rarity) {
    case 'legendary':
      return 'Легендарный';
    case 'epic':
      return 'Эпический';
    case 'rare':
      return 'Редкий';
    case 'common':
    default:
      return 'Обычный';
  }
};

function areEqual(prevProps, nextProps) {
  const prev = prevProps.item;
  const next = nextProps.item;
  return (
    prev.id === next.id &&
    prev.image_url === next.image_url &&
    prev.is_equipped === next.is_equipped &&
    prev.background_url === next.background_url &&
    prev.item_name === next.item_name &&
    prev.rarity === next.rarity &&
    JSON.stringify(prev.marketplace) === JSON.stringify(next.marketplace) &&
    prevProps.className === nextProps.className &&
    JSON.stringify(prevProps.style) === JSON.stringify(nextProps.style)
  );
}

/**
 * InventoryItemCardPure – оптимизированная версия без Material UI.
 * Использует чистый CSS для лучшей производительности.
 */
const InventoryItemCardPure = memo(
  ({ item, onClick, className = '', style = {}, ...other }) => {
    const rarityColor = useMemo(
      () => getRarityColor(item.rarity),
      [item.rarity]
    );
    const rarityLabel = useMemo(
      () => getRarityLabel(item.rarity),
      [item.rarity]
    );

    const handleClick = useCallback(() => {
      if (onClick) onClick(item);
    }, [onClick, item]);

    return (
      <div
        className={`inventory-item-card ${className}`}
        onClick={handleClick}
        style={style}
        {...other}
      >
        <div
          className={`image-container ${item.background_url ? 'has-background' : ''}`}
          style={{
            '--background-url': item.background_url
              ? `url(${item.background_url})`
              : 'none',
          }}
        >
          <OptimizedImage
            src={item.image_url}
            alt={item.item_name}
            width='75%'
            height='75%'
            loading='lazy'
            fallbackText='Предмет недоступен'
            showSkeleton
            style={{ position: 'relative', zIndex: 2, objectFit: 'contain' }}
          />
          {item.marketplace && (
            <div className='marketplace-badge'>
              <img
                src='/static/icons/KBalls.svg'
                alt='KBalls'
                className='kballs-icon'
              />
              <span className='price-text'>{item.marketplace.price}</span>
            </div>
          )}

          {(isOverlayItem(item) || item.is_equipped) && (
            <div className='equipped-badge'>
              <span className='equipped-text'>
                {isOverlayItem(item) && item.is_equipped ? 'Оверлей + Надет' : 
                 isOverlayItem(item) ? 'Оверлей' : 'Надет'}
              </span>
            </div>
          )}
        </div>

        <div className='item-name'>{item.item_name}</div>

        <div className='rarity-container'>
          <span
            className='rarity-chip'
            style={{
              backgroundColor: `${rarityColor}20`,
              color: rarityColor,
            }}
          >
            {rarityLabel}
          </span>
        </div>
      </div>
    );
  },
  areEqual
);

export default InventoryItemCardPure;
