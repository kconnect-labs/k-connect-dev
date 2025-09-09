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
 * @param {Function} props.onClick - Обработчик клика
 */
const Badge = ({
  achievement,
  size = 'medium',
  className = '',
  onError,
  showTooltip = false,
  tooltipText,
  onClick,
  ...props
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [svgContent, setSvgContent] = useState(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  // Мемоизируем размеры для оптимизации - размеры как у VerificationBadge
  const badgeSize = useMemo(() => {
    switch (size) {
      case 'post':
        return { width: 24, height: 24 }; // Немного больше для постов
      case 'small':
        return { width: 20, height: 20 }; // Как у VerificationBadge small
      case 'large':
        return { width: 28, height: 28 }; // Больше для large
      case 'shop':
        return { width: 300, height: 150 }; // Баннерный формат 150x300
      default:
        return { width: 24, height: 24 }; // 24px как вы сказали
    }
  }, [size]);

  // Мемоизируем классы для оптимизации
  const badgeClasses = useMemo(() => {
    const classes = ['badge', `badge--${size}`];

    if (className) classes.push(className);
    if (imageLoaded) classes.push('badge--loaded');
    if (imageError) classes.push('badge--error');
    if (achievement?.upgrade && achievement.upgrade !== '0') classes.push('badge--upgraded');
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
        // Определяем правильный URL для изображения
        const imageUrl = achievement.image_path.startsWith('http') 
          ? achievement.image_path 
          : `/static/images/bages/${achievement.image_path}`;
          
        const response = await fetch(imageUrl);
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

  // Минималистичный эффект свечения для upgrade бейджиков
  useEffect(() => {
    if (!achievement?.upgrade || !containerRef.current || !imageLoaded) return;

    const container = containerRef.current;
    
    // Создаем элемент свечения
    const glowElement = document.createElement('div');
    glowElement.className = 'badge-glow';
    glowElement.style.setProperty('--glow-color', achievement.color_upgrade || '#FFD700');
    
    container.appendChild(glowElement);

    // Очистка
    return () => {
      if (glowElement.parentNode) {
        glowElement.parentNode.removeChild(glowElement);
      }
    };
  }, [
    achievement?.upgrade,
    achievement?.color_upgrade,
    imageLoaded,
    size,
  ]);

  // Если нет достижения, не рендерим ничего
  if (!achievement) return null;

  const badgeContent = (
    <Box
      ref={containerRef}
      className={badgeClasses}
      sx={{
        width: badgeSize.width,
        height: badgeSize.height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center', // Центрирование как у VerificationBadge
        position: 'relative',
        overflow: 'visible',
        cursor: onClick ? 'pointer' : 'default', // Курсор только если есть onClick
        transition: 'all 0.2s ease', // Такая же анимация как у VerificationBadge
        '--upgrade-color': achievement.color_upgrade || '#FFD700',
        '&:active': onClick ? {
          transform: 'scale(0.95)', // Такая же анимация как у VerificationBadge
        } : {},
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      <img
        ref={imageRef}
        src={achievement.image_path.startsWith('http') 
          ? achievement.image_path 
          : `/static/images/bages/${achievement.image_path}`}
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
