import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Box, Tooltip } from '@mui/material';
import './Badge.css';

/**
 * Оптимизированный компонент бейджика с поддержкой upgrade эффектов
 * @param {Object} props - Свойства компонента
 * @param {Object} props.achievement - Данные достижения
 * @param {string} props.achievement.bage - Название бейджика
 * @param {string} props.achievement.image_path - Путь к изображению
 * @param {string} props.achievement.upgrade - Тип улучшения
 * @param {string} props.achievement.color_upgrade - Цвет улучшения
 * @param {string} props.size - Размер бейджика ('small', 'medium', 'large')
 * @param {string} props.className - Дополнительные CSS классы
 * @param {Function} props.onError - Обработчик ошибки загрузки
 * @param {boolean} props.showTooltip - Показывать ли тултип
 * @param {string} props.tooltipText - Текст тултипа
 */
const Badge = ({
  achievement,
  size = 'medium',
  className = '',
  onError,
  showTooltip = false,
  tooltipText,
  ...props
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [svgContent, setSvgContent] = useState(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  // Мемоизируем размеры для оптимизации
  const badgeSize = useMemo(() => {
    switch (size) {
      case 'post':
        return { width: 24, height: 24 };
      case 'small':
        return { width: 16, height: 16 };
      case 'large':
        return { width: 32, height: 32 };
      case 'shop':
        return { width: 150, height: 150 };
      default:
        return { width: 24, height: 24 };
    }
  }, [size]);

  // Мемоизируем классы для оптимизации
  const badgeClasses = useMemo(() => {
    const classes = ['badge', `badge--${size}`];

    if (className) classes.push(className);
    if (imageLoaded) classes.push('badge--loaded');
    if (imageError) classes.push('badge--error');
    if (achievement?.upgrade) classes.push('badge--upgraded');
    if (isHovered) classes.push('badge--hovered');

    return classes.join(' ');
  }, [
    size,
    className,
    imageLoaded,
    imageError,
    achievement?.upgrade,
    isHovered,
  ]);

  // Загружаем SVG содержимое изображения
  useEffect(() => {
    if (!achievement?.image_path || !imageLoaded) return;

    const loadSvgContent = async () => {
      try {
        const response = await fetch(
          `/static/images/bages/${achievement.image_path}`
        );
        if (response.ok) {
          const svgText = await response.text();
          setSvgContent(svgText);
        }
      } catch (error) {
        console.warn('Failed to load SVG content for particles:', error);
      }
    };

    // Проверяем, является ли файл SVG
    if (achievement.image_path.toLowerCase().endsWith('.svg')) {
      loadSvgContent();
    }
  }, [achievement?.image_path, imageLoaded]);

  // Обработчик загрузки изображения
  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  // Обработчик ошибки изображения
  const handleImageError = e => {
    setImageError(true);
    setImageLoaded(false);

    // Скрываем изображение при ошибке
    if (e.target) {
      e.target.style.display = 'none';
    }

    // Вызываем пользовательский обработчик
    if (onError) {
      onError(e);
    }
  };

  // Эффект для создания летающих бейджиков при upgrade
  useEffect(() => {
    if (!achievement?.upgrade || !containerRef.current || !imageLoaded) return;

    const container = containerRef.current;
    const particles = [];
    const particleCount = 6; // Уменьшено с 8 до 6 (на 30%)
    const colors = achievement.color_upgrade
      ? [achievement.color_upgrade]
      : ['#FFD700', '#FFA500', '#FF6B35'];

    // Настройки для разных размеров
    const isPostSize = size === 'post';
    const isShopSize = size === 'shop';
    const baseDistance = isPostSize ? 4 : isShopSize ? 40 : 8;
    const distanceVariation = isPostSize ? 3 : isShopSize ? 30 : 6;
    const particleSize = isPostSize ? 6 : isShopSize ? 30 : 12;

    // Создаем летающие бейджики
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'badge-particle';

      // Случайный цвет из палитры
      const color = colors[Math.floor(Math.random() * colors.length)];
      particle.style.setProperty('--particle-color', color);

      // Случайная позиция вокруг бейджика (еще больше уменьшена)
      const angle = (i / particleCount) * 2 * Math.PI;
      const distance = baseDistance + Math.random() * distanceVariation;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;

      particle.style.setProperty('--particle-x', `${x}px`);
      particle.style.setProperty('--particle-y', `${y}px`);
      particle.style.setProperty('--particle-delay', `${i * 0.15}s`);
      particle.style.setProperty(
        '--particle-rotation',
        `${Math.random() * 360}deg`
      );

      // Если есть SVG содержимое, используем его для частиц
      if (svgContent) {
        particle.innerHTML = svgContent;
        particle.style.setProperty('--particle-size', `${particleSize}px`);
      } else {
        // Fallback - создаем простую иконку
        particle.innerHTML = `
          <svg width="${particleSize}" height="${particleSize}" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z"/>
          </svg>
        `;
        particle.style.setProperty('--particle-size', `${particleSize}px`);
      }

      container.appendChild(particle);
      particles.push(particle);
    }

    // Очистка частиц
    return () => {
      particles.forEach(particle => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      });
    };
  }, [
    achievement?.upgrade,
    achievement?.color_upgrade,
    imageLoaded,
    svgContent,
    size,
  ]);

  // Если нет достижения, не рендерим ничего
  if (!achievement) return null;

  const badgeContent = (
    <Box
      ref={containerRef}
      className={badgeClasses}
      sx={{
        width: Math.min(badgeSize.width, 100), // Максимум 100px ширина
        height: badgeSize.height,
        minWidth: badgeSize.width,
        minHeight: badgeSize.height,
        maxWidth: 100,
        maxHeight: badgeSize.height,
        ml: '0px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'visible',
        cursor: 'pointer',
        '--upgrade-color': achievement.color_upgrade || '#FFD700',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      <img
        ref={imageRef}
        src={`/static/images/bages/${achievement.image_path}`}
        alt={achievement.bage}
        className='badge__image'
        onLoad={handleImageLoad}
        onError={handleImageError}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          borderRadius: 'inherit',
        }}
      />
    </Box>
  );

  // Оборачиваем в Tooltip если нужно
  if (showTooltip) {
    return (
      <Tooltip title={tooltipText || achievement.bage}>
        {badgeContent}
      </Tooltip>
    );
  }

  return badgeContent;
};

export default Badge;
