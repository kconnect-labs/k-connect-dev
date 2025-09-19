import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import CachedImage from '../../../../components/Post/components/CachedImage';

// CSS стили для контейнера
const styles = `
  .overlay-avatar-container {
    -webkit-user-select: none !important;
    -moz-user-select: none !important;
    -ms-user-select: none !important;
    user-select: none !important;
    -webkit-touch-callout: none !important;
    -webkit-tap-highlight-color: transparent !important;
    outline: none !important;
    -webkit-outline: none !important;
    touch-action: none !important;
  }

  .overlay-avatar-container * {
    -webkit-user-select: none !important;
    -moz-user-select: none !important;
    -ms-user-select: none !important;
    user-select: none !important;
    -webkit-touch-callout: none !important;
    -webkit-tap-highlight-color: transparent !important;
  }
`;

// Добавляем стили в head
if (!document.getElementById('overlay-avatar-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'overlay-avatar-styles';
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

interface OverlayAvatarProps {
  item: any;
  index?: number;
  onPositionUpdate?: (itemId: number, newPosition: { x: number; y: number }) => void;
  isEditMode?: boolean;
  onEditModeActivate?: () => void;
}

const OverlayAvatar: React.FC<OverlayAvatarProps> = React.memo(({ 
  item, 
  index = 0, 
  onPositionUpdate, 
  isEditMode, 
  onEditModeActivate 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Для айтемов 2 и 3 уровня всегда центрируем по аватарке
  const [position, setPosition] = useState({ x: 50, y: 50 });

  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Отслеживаем размер экрана
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 600);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Обработчики перетаскивания (мышь)
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isEditMode) return;
    
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    
    // Запоминаем начальную позицию мыши относительно элемента
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setDragStart({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  }, [isEditMode]);

  // Обработчики перетаскивания (touch)
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!isEditMode) return;
    
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    
    // Запоминаем начальную позицию touch относительно элемента
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect && e.touches[0]) {
      const touch = e.touches[0];
      setDragStart({
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      });
    }
  }, [isEditMode]);

  // Throttling для лучшей производительности
  const lastUpdateTime = useRef(0);
  const THROTTLE_DELAY = 16; // ~60fps

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !isEditMode) return;
    
    const now = Date.now();
    if (now - lastUpdateTime.current < THROTTLE_DELAY) return;
    lastUpdateTime.current = now;
    
    e.preventDefault();
    e.stopPropagation();
    
    // Получаем контейнер аватарки (родительский элемент)
    const avatarContainer = containerRef.current?.closest('[data-avatar-container]') as HTMLElement;
    if (!avatarContainer) return;
    
    const avatarRect = avatarContainer.getBoundingClientRect();
    
    // Вычисляем позицию центра элемента в процентах относительно контейнера аватарки
    const newX = ((e.clientX - avatarRect.left) / avatarRect.width) * 100;
    const newY = ((e.clientY - avatarRect.top) / avatarRect.height) * 100;
    
    // Ограничиваем позицию в пределах контейнера
    const clampedX = Math.max(-5, Math.min(105, newX));
    const clampedY = Math.max(-5, Math.min(105, newY));
    
    const newPosition = { x: clampedX, y: clampedY };
    setPosition(newPosition);
    
    // Обновляем позицию в родительском компоненте в реальном времени
    if (onPositionUpdate) {
      onPositionUpdate(item.id, newPosition);
    }
  }, [isDragging, isEditMode, onPositionUpdate, item.id]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || !isEditMode) return;
    
    const now = Date.now();
    if (now - lastUpdateTime.current < THROTTLE_DELAY) return;
    lastUpdateTime.current = now;
    
    e.preventDefault();
    e.stopPropagation();
    
    // Получаем контейнер аватарки (родительский элемент)
    const avatarContainer = containerRef.current?.closest('[data-avatar-container]') as HTMLElement;
    if (!avatarContainer) return;
    
    const avatarRect = avatarContainer.getBoundingClientRect();
    
    // Вычисляем позицию центра элемента в процентах относительно контейнера аватарки
    const touch = e.touches[0];
    const newX = ((touch.clientX - avatarRect.left) / avatarRect.width) * 100;
    const newY = ((touch.clientY - avatarRect.top) / avatarRect.height) * 100;
    
    // Ограничиваем позицию в пределах контейнера
    const clampedX = Math.max(-5, Math.min(105, newX));
    const clampedY = Math.max(-5, Math.min(105, newY));
    
    const newPosition = { x: clampedX, y: clampedY };
    setPosition(newPosition);
    
    // Обновляем позицию в родительском компоненте в реальном времени
    if (onPositionUpdate) {
      onPositionUpdate(item.id, newPosition);
    }
  }, [isDragging, isEditMode, onPositionUpdate, item.id]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Добавляем глобальные обработчики мыши и touch
  useEffect(() => {
    if (isEditMode) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isEditMode, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  if (!item) {
    return null;
  }

  const isLevel2 = item.upgrade_level === 2;
  const isLevel3 = item.upgrade_level === 3;

  // Показываем только айтемы 2 и 3 уровня
  if (!isLevel2 && !isLevel3) {
    return null;
  }

  // Определяем размеры в зависимости от уровня и устройства
  const getItemSize = () => {
    if (isLevel3) {
      return isMobile ? '140px' : '150px';
    } else {
      return isMobile ? '170px' : '180px';
    }
  };

  const containerStyle = useMemo(() => ({
    position: 'absolute' as const,
    left: `${position.x}%`,
    top: `${position.y}%`,
    transform: isDragging ? 'translate(-50%, -50%) scale(1.1)' : 'translate(-50%, -50%)',
    width: getItemSize(),
    height: getItemSize(),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: isEditMode ? 'grab' : 'pointer',
    zIndex: 12 - index,
    userSelect: 'none' as const,
    WebkitUserSelect: 'none' as any,
    MozUserSelect: 'none' as any,
    msUserSelect: 'none' as any,
    pointerEvents: 'auto' as const,
    touchAction: 'none',
    WebkitTouchCallout: 'none' as any,
    WebkitTapHighlightColor: 'transparent',
    ...(isDragging && {
      cursor: 'grabbing',
    }),
  } as React.CSSProperties), [position.x, position.y, isDragging, isEditMode, index, isLevel2, isLevel3, isMobile]);

  return (
    <div
      ref={containerRef}
      className="overlay-avatar-container"
      style={containerStyle}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onDragStart={(e: React.DragEvent) => e.preventDefault()}
      onMouseEnter={(e: React.MouseEvent) => e.preventDefault()}
      onMouseLeave={(e: React.MouseEvent) => e.preventDefault()}
      onFocus={(e: React.FocusEvent) => e.preventDefault()}
      onBlur={(e: React.FocusEvent) => e.preventDefault()}
      tabIndex={-1}
    >
      <CachedImage
        src={`${(typeof window !== 'undefined' && window.location?.origin) || 'https://k-connect.ru'}${item.image_url}`}
        alt={item.item_name}
        width='100%'
        height='100%'
        showSkeleton={false}
        style={useMemo(() => ({
          width: '100%',
          height: '100%',
          objectFit: 'contain' as const,
          position: 'relative' as const,
          zIndex: 1,
          marginTop: '5px',
          pointerEvents: 'none' as const,
          userSelect: 'none' as const,
          WebkitUserSelect: 'none' as any,
          MozUserSelect: 'none' as any,
          msUserSelect: 'none' as any,
        } as React.CSSProperties), [])}
        onLoad={() => {
          // Обработчик загрузки изображения (пустой)
        }}
        onError={() => {
          // Обработчик ошибки изображения (пустой)
        }}
      />
    </div>
  );
});

const areEqual = (prevProps: any, nextProps: any) => {
  const keysToCheck = [
    'id',
    'image_url',
    'profile_position_x',
    'profile_position_y',
    'upgrade_level',
  ];

  const prev = prevProps.item;
  const next = nextProps.item;

  const itemEqual = keysToCheck.every(k => prev[k] === next[k]);

  return itemEqual && prevProps.isEditMode === nextProps.isEditMode;
};

export default React.memo(OverlayAvatar, areEqual);
