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

/**
 * InventoryItemCardPure – оптимизированная версия без Material UI.
 * Использует чистый CSS для лучшей производительности.
 */
const InventoryItemCardPure = memo(({ item, onClick, className = '', style = {}, ...other }) => {
  const rarityColor = useMemo(() => getRarityColor(item.rarity), [item.rarity]);
  const rarityLabel = useMemo(() => getRarityLabel(item.rarity), [item.rarity]);

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
        className="image-container"
        style={{
          '--background-url': item.background_url ? `url(${item.background_url})` : 'none'
        }}
      >
        <OptimizedImage
          src={item.image_url}
          alt={item.item_name}
          width="75%"
          height="75%"
          loading="lazy"
          fallbackText="Предмет недоступен"
          showSkeleton
          style={{ position: 'relative', zIndex: 2, objectFit: 'contain' }}
        />
        {item.marketplace && (
          <div className="marketplace-badge">
            <img
              src="/static/icons/KBalls.svg"
              alt="KBalls"
              className="kballs-icon"
            />
            <span className="price-text">
              {item.marketplace.price}
            </span>
          </div>
        )}
      </div>

      <div className="item-name">
        {item.item_name}
      </div>

      <div className="rarity-container">
        <span 
          className="rarity-chip"
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
});

export default InventoryItemCardPure; 