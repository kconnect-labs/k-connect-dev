import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import OptimizedImage from '../../../../components/OptimizedImage';
import axios from 'axios';

// CSS анимации
const styles = `
  @keyframes particle {
    0% {
      transform: scale(1) translate(0, 0) rotate(0deg);
      opacity: 0.9;
    }
    25% {
      transform: scale(1.1) translate(-20px, 5px) rotate(90deg);
      opacity: 1;
    }
    50% {
      transform: scale(1.2) translate(0, 10px) rotate(180deg);
      opacity: 1;
    }
    75% {
      transform: scale(1.1) translate(20px, 5px) rotate(270deg);
      opacity: 0.8;
    }
    100% {
      transform: scale(0.5) translate(${Math.random() * 80 - 40}px, 40px) rotate(360deg);
      opacity: 0;
    }
  }

  @keyframes dragPulse {
    0% {
      transform: scale(1);
      box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7);
    }
    70% {
      transform: scale(1.05);
      box-shadow: 0 0 0 10px rgba(255, 255, 255, 0);
    }
    100% {
      transform: scale(1);
      box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
    }
  }

  .equipped-item-container {
    -webkit-user-select: none !important;
    -moz-user-select: none !important;
    -ms-user-select: none !important;
    user-select: none !important;
    -webkit-touch-callout: none !important;
    -webkit-tap-highlight-color: transparent !important;
    outline: none !important;
    -webkit-outline: none !important;
  }

  .equipped-item-container * {
    -webkit-user-select: none !important;
    -moz-user-select: none !important;
    -ms-user-select: none !important;
    user-select: none !important;
    -webkit-touch-callout: none !important;
    -webkit-tap-highlight-color: transparent !important;
  }

  .equipped-item-container {
    touch-action: none !important;
    -webkit-touch-callout: none !important;
    -webkit-tap-highlight-color: transparent !important;
  }
`;

// Добавляем стили в head
if (!document.getElementById('equipped-item-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'equipped-item-styles';
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

// Дефолтные позиции для айтемов (если не настроены)
// Позиции рассчитаны относительно аватара в левой части карточки
const getDefaultPosition = (index) => {
  const positions = [
    { x: 30, y: 10 }, // Верхний-правый от аватара (очень высоко)
    { x: 25, y: 35 }, // Нижний-правый от аватара  
    { x: 15, y: 35 }, // Нижний-левый от аватара
  ];
  return positions[index] || { x: 20, y: 25 };
};

const getParticleStyle = (color, delay, duration) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  width: `${Math.random() * 12 + 6}px`,
  height: `${Math.random() * 12 + 6}px`,
  background: `radial-gradient(circle at center, ${color} 0%, ${color} 50%, transparent 100%)`,
  clipPath:
    'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
  animation: `particle ${duration}s ease-out infinite`,
  animationDelay: `${delay}s`,
  opacity: 0,
  transform: 'translate(-50%, -50%)',
});

const getAverageColor = (imgElement, callback) => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', { willReadFrequently: true });
  const width = imgElement.width;
  const height = imgElement.height;

  if (width === 0 || height === 0) {
    callback('rgba(208, 188, 255, 0.8)');
    return;
  }

  canvas.width = width;
  canvas.height = height;

  context.drawImage(imgElement, 0, 0);

  let data;
  try {
    data = context.getImageData(0, 0, width, height).data;
  } catch (e) {
    console.error('Could not get image data for color extraction:', e);
    callback('rgba(208, 188, 255, 0.8)');
    return;
  }

  let r = 0,
    g = 0,
    b = 0;
  let count = 0;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] > 128) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      count++;
    }
  }

  if (count === 0) {
    callback('rgba(208, 188, 255, 0.8)');
    return;
  }

  r = Math.floor(r / count);
  g = Math.floor(g / count);
  b = Math.floor(b / count);

  callback(`rgba(${r}, ${g}, ${b}, 0.9)`);
};

const EquippedItem = React.memo(({ item, index = 0, onPositionUpdate, isEditMode, onEditModeActivate }) => {
  const [particleColor, setParticleColor] = useState('rgba(208, 188, 255, 0.8)');
  const [isDragging, setIsDragging] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  
  // Определяем позицию: если есть сохраненная - используем её, иначе дефолтную
  const defaultPos = getDefaultPosition(index);
  const [position, setPosition] = useState({
    x: item.profile_position_x !== null ? item.profile_position_x : defaultPos.x,
    y: item.profile_position_y !== null ? item.profile_position_y : defaultPos.y
  });

  // Отладка инициализации позиции (раскомментировать для отладки)
  // useEffect(() => {
  //   console.log('Position initialized:', {
  //     item_id: item.id,
  //     server_x: item.profile_position_x,
  //     server_y: item.profile_position_y,
  //     default_x: defaultPos.x,
  //     default_y: defaultPos.y,
  //     final_x: position.x,
  //     final_y: position.y
  //   });
  // }, [item.id, item.profile_position_x, item.profile_position_y, defaultPos.x, defaultPos.y, position.x, position.y]);
  
  // Отладка инициализации позиции (раскомментировать для отладки)
  // useEffect(() => {
  //   console.log('Item position initialized:', {
  //     item_id: item.id,
  //     server_x: item.profile_position_x,
  //     server_y: item.profile_position_y,
  //     default_x: defaultPos.x,
  //     default_y: defaultPos.y,
  //     final_x: position.x,
  //     final_y: position.y
  //   });
  // }, [item.id, item.profile_position_x, item.profile_position_y, defaultPos.x, defaultPos.y, position.x, position.y]);
  
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const imgRef = useRef(null);
  const containerRef = useRef(null);
  const clickTimeoutRef = useRef(null);

  useEffect(() => {
    if (item?.image_url) {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = item.image_url;
      img.onload = () => {
        getAverageColor(img, color => {
          setParticleColor(color);
        });
      };
      img.onerror = () => {
        setParticleColor('rgba(208, 188, 255, 0.8)');
      };
    }
  }, [item?.image_url]);

  // Надежный механизм тройного клика/тапа
  const handleClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const currentTime = Date.now();
    const timeDiff = currentTime - lastClickTime;
    
    // Если прошло больше 500мс, сбрасываем счетчик
    if (timeDiff > 500) {
      setClickCount(1);
    } else {
      setClickCount(prev => prev + 1);
    }
    
    setLastClickTime(currentTime);
    
    // Очищаем предыдущий таймаут
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }
    
    // Устанавливаем новый таймаут
    clickTimeoutRef.current = setTimeout(() => {
      if (clickCount >= 2) {
        // Тройной клик/тап - активируем режим редактирования
        if (onEditModeActivate) {
          onEditModeActivate();
        }
        setClickCount(0);
      } else {
        setClickCount(0);
      }
    }, 300);
  }, [clickCount, lastClickTime, onEditModeActivate]);

  // Отдельный обработчик для touch событий (для мобильных устройств)
  const handleTouch = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const currentTime = Date.now();
    const timeDiff = currentTime - lastClickTime;
    
    // Если прошло больше 500мс, сбрасываем счетчик
    if (timeDiff > 500) {
      setClickCount(1);
    } else {
      setClickCount(prev => prev + 1);
    }
    
    setLastClickTime(currentTime);
    
    console.log('Click count:', clickCount + 1, 'Time diff:', timeDiff); // Отладка
    
    // Очищаем предыдущий таймаут
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }
    
    // Устанавливаем новый таймаут
    clickTimeoutRef.current = setTimeout(() => {
      if (clickCount >= 2) {
        // Тройной тап - активируем режим редактирования
        console.log('Triple tap detected, activating edit mode'); // Отладка
        if (onEditModeActivate) {
          onEditModeActivate();
        }
        setClickCount(0);
      } else {
        setClickCount(0);
      }
    }, 300);
  }, [clickCount, lastClickTime, onEditModeActivate]);

  // Обработчик двойного клика (отключен в новом режиме)
  const handleDoubleClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    // Двойной клик больше не используется для сохранения
  }, []);

  // Обновление позиции в родительском компоненте
  const updatePosition = () => {
    if (onPositionUpdate) {
      onPositionUpdate(item.id, position);
    }
  };

  // Отладка изменения режима редактирования (раскомментировать для отладки)
  // useEffect(() => {
  //   console.log('Edit mode changed:', {
  //     item_id: item.id,
  //     isEditMode,
  //     position: { x: position.x, y: position.y }
  //   });
  // }, [isEditMode, item.id, position.x, position.y]);

  // Обработчики перетаскивания (мышь)
  const handleMouseDown = useCallback((e) => {
    if (!isEditMode) return;
    
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    
    // Запоминаем начальную позицию мыши относительно элемента
    const rect = containerRef.current.getBoundingClientRect();
    setDragStart({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  }, [isEditMode]);

  // Обработчики перетаскивания (touch)
  const handleTouchStart = useCallback((e) => {
    if (!isEditMode) return;
    
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    
    // Запоминаем начальную позицию touch относительно элемента
    const rect = containerRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    setDragStart({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    });
  }, [isEditMode]);

  // Throttling для лучшей производительности
  const lastUpdateTime = useRef(0);
  const THROTTLE_DELAY = 16; // ~60fps

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !isEditMode) return;
    
    const now = Date.now();
    if (now - lastUpdateTime.current < THROTTLE_DELAY) return;
    lastUpdateTime.current = now;
    
    e.preventDefault();
    e.stopPropagation();
    
    // Получаем контейнер профиля (родительский элемент)
    const profileContainer = containerRef.current.closest('[data-profile-container]');
    if (!profileContainer) return;
    
    const profileRect = profileContainer.getBoundingClientRect();
    
    // Вычисляем позицию центра элемента в процентах относительно контейнера профиля
    const newX = ((e.clientX - profileRect.left) / profileRect.width) * 100;
    const newY = ((e.clientY - profileRect.top) / profileRect.height) * 100;
    
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

  const handleTouchMove = useCallback((e) => {
    if (!isDragging || !isEditMode) return;
    
    const now = Date.now();
    if (now - lastUpdateTime.current < THROTTLE_DELAY) return;
    lastUpdateTime.current = now;
    
    e.preventDefault();
    e.stopPropagation();
    
    // Получаем контейнер профиля (родительский элемент)
    const profileContainer = containerRef.current.closest('[data-profile-container]');
    if (!profileContainer) return;
    
    const profileRect = profileContainer.getBoundingClientRect();
    
    // Вычисляем позицию центра элемента в процентах относительно контейнера профиля
    const touch = e.touches[0];
    const newX = ((touch.clientX - profileRect.left) / profileRect.width) * 100;
    const newY = ((touch.clientY - profileRect.top) / profileRect.height) * 100;
    
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

  // Очистка таймаута при размонтировании
  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

  if (!item) {
    return null;
  }

  const isUpgraded = item.upgrade_level === 1;

  const particles = isUpgraded
    ? Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          style={getParticleStyle(
            particleColor,
            Math.random() * 4,
            Math.random() * 3 + 3
          )}
        />
      ))
    : [];

  const containerStyle = useMemo(() => ({
    position: 'absolute',
    left: `${position.x}%`,
    top: `${position.y}%`,
    transform: isDragging ? 'translate(-50%, -50%) scale(1.1)' : 'translate(-50%, -50%)',
    width: '60px',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: isEditMode ? 'grab' : 'pointer',
    zIndex: 12 - index,
    userSelect: 'none',
    WebkitUserSelect: 'none',
    MozUserSelect: 'none',
    msUserSelect: 'none',
    pointerEvents: 'auto',
    touchAction: 'none',
    WebkitTouchCallout: 'none',
    WebkitTapHighlightColor: 'transparent',
    ...(isDragging && {
      cursor: 'grabbing',
    }),
  }), [position.x, position.y, isDragging, isEditMode, index]);

  return (
    <div
      ref={containerRef}
      className="equipped-item-container"
      style={containerStyle}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouch}

      onDragStart={(e) => e.preventDefault()}

      onMouseEnter={(e) => e.preventDefault()}
      onMouseLeave={(e) => e.preventDefault()}
      onFocus={(e) => e.preventDefault()}
      onBlur={(e) => e.preventDefault()}
      tabIndex={-1}
    >
      {isUpgraded && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1,
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        >
          {particles}
        </div>
      )}
      
      {/* Подсказка убрана - теперь используются кнопки внизу */}
      
      <OptimizedImage
        src={`https://k-connect.ru${item.image_url}`}
        alt={item.item_name}
        width='100%'
        height='100%'
        fallbackText=''
        showSkeleton={false}
        skipExistenceCheck={true}
        style={useMemo(() => ({
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          position: 'relative',
          zIndex: 1,
          pointerEvents: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
        }), [])}
        onLoad={e => {
          if (e && e.target && e.target.complete) {
            getAverageColor(e.target, color => {
              setParticleColor(color);
            });
          }
        }}
      />
    </div>
  );
});

const areEqual = (prevProps, nextProps) => {
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

export default React.memo(EquippedItem, areEqual);
