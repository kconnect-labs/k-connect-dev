import React from 'react';
import { Link } from 'react-router-dom';
import { motion, Variants } from 'framer-motion';
import VerificationBadge from '../../UIKIT/VerificationBadge';
import { MaxIcon } from '../../components/icons/CustomIcons';
import { LeaderboardUserCardProps } from '../../types/leaderboard';
import './LeaderboardUserCard.css';

const API_URL =
  (typeof window !== 'undefined' && window.location?.origin) ||
  'https://k-connect.ru';

// Функция для проверки является ли цвет светлым
const isLightColor = (color: string): boolean => {
  if (!color || !color.startsWith('#')) {
    return false;
  }
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128;
};

// Функция для сокращения чисел
const formatCompactNumber = (number: number): string => {
  if (number < 1000) {
    return number.toString();
  }
  const units = ['', 'K', 'M', 'B'];
  const order = Math.floor(Math.log10(Math.abs(number)) / 3);
  const unitName = units[order];
  const value = (number / Math.pow(1000, order)).toFixed(1);
  return value.replace('.0', '') + unitName;
};

// Функция для парсинга настроек декорации
const parseItemSettings = (
  itemPath: string
): { path: string; styles: React.CSSProperties } => {
  if (!itemPath || !itemPath.includes(';')) {
    return {
      path: itemPath,
      styles: {},
    };
  }

  const [path, ...stylesParts] = itemPath.split(';');
  const stylesString = stylesParts.join(';');

  const styles: any = {};
  stylesString.split(';').forEach(style => {
    const [property, value] = style.split(':').map(s => s.trim());
    if (property && value) {
      const camelProperty = property.replace(/-([a-z])/g, g =>
        g[1].toUpperCase()
      );
      styles[camelProperty] = value;
    }
  });

  return {
    path: path,
    styles: styles,
  };
};

const LeaderboardUserCard: React.FC<LeaderboardUserCardProps> = ({
  user,
  position,
  index,
  onCardClick,
}) => {
  // Определяем тип фона
  const isGradient = user.decoration?.background?.includes('linear-gradient');
  const isImage = user.decoration?.background?.includes('/');
  const isHexColor = user.decoration?.background?.startsWith('#');
  const isLightBackground =
    isHexColor && isLightColor(user.decoration?.background || '');

  // Определяем стили для декорации
  let decorationStyles: React.CSSProperties = {};
  let hasBottom0 = false;
  if (user.decoration?.item_path && user.decoration.item_path.trim() !== '') {
    const { styles } = parseItemSettings(user.decoration.item_path);
    decorationStyles = styles;
    hasBottom0 = styles && styles.bottom === '0';
  }

  // Стили для карточки
  const cardStyle: React.CSSProperties = {
    background: user.decoration?.background
      ? isImage
        ? `url(${API_URL}/${user.decoration.background})`
        : user.decoration.background
      : 'var(--card-background)',
    backgroundSize: isImage ? 'cover' : 'auto',
    backgroundPosition: isImage ? 'center' : 'auto',
    backgroundRepeat: isImage ? 'no-repeat' : 'auto',
    color: isLightBackground ? 'rgba(0, 0, 0, 0.87)' : 'var(--text-primary)',
  };

  // Стили для декорации
  const decorationStyle: React.CSSProperties = {
    position: 'absolute',
    right: 0,
    height: 'max-content',
    maxHeight: 120,
    opacity: 1,
    pointerEvents: 'none',
    zIndex: 1,
    transition: 'transform 0.35s cubic-bezier(.4,2,.3,1), z-index 0.2s',
    ...decorationStyles,
  };

  // Стили для очков
  const scoreStyle: React.CSSProperties = {
    color:
      position <= 3
        ? '#fff'
        : isLightBackground
          ? 'rgba(0, 0, 0, 0.87)'
          : 'var(--text-primary)',
  };

  // Стили для ранга
  const getRankBackground = (): string => {
    if (position === 1)
      return 'linear-gradient(90deg, #FFFCA8 -0.05%, #FDB836 31.2%, #FDC966 75.92%, #F1DC83 100.02%)';
    if (position === 2)
      return 'linear-gradient(90deg, #FFF8C1 -0.05%, #C2E8FD -0.04%, #919191 31.2%, #DDDDDD 75.92%, #E3E3E3 100.02%)';
    if (position === 3)
      return 'linear-gradient(90.56deg, #9E8976 -0.5%, #7A5E50 -0.49%, #F6D0AB 31.04%, #9D774E 76.19%, #C99B70 100.51%)';
    return 'var(--rank-background)';
  };

  // Стили для аватара
  const getAvatarBorder = (): string => {
    if (position === 1) return '3px solid #FDB836';
    if (position === 2) return '3px solid #919191';
    if (position === 3) return '3px solid #7A5E50';
    return '2px solid var(--border-color)';
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 0.1,
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick(user);
    }
  };

  return (
    <motion.div
      className={`leaderboard-LEAD-user-card ${hasBottom0 ? 'has-bottom0' : ''}`}
      style={cardStyle}
      variants={cardVariants}
      initial='hidden'
      animate='visible'
      onClick={handleCardClick}
    >
      {/* Декорация */}
      {user.decoration?.item_path &&
        user.decoration.item_path.trim() !== '' && (
          <img
            src={`${API_URL}/${parseItemSettings(user.decoration.item_path).path}`}
            alt='decoration'
            style={decorationStyle}
            className={hasBottom0 ? 'decoration-bottom0' : ''}
          />
        )}

      {/* Основной контент */}
      <div className='LEAD-user-card-content'>
        {/* Очки */}
        <div className='score-display' style={scoreStyle}>
          {formatCompactNumber(user.score)}
        </div>

        {/* Аватар */}
        <div className='LEAD-user-avatar' style={{ border: getAvatarBorder() }}>
          {user.avatar_url ? (
            <img
              src={
                user.avatar_url.startsWith('http')
                  ? user.avatar_url
                  : `${API_URL}${user.avatar_url}`
              }
              alt={user.name}
              className='avatar-image'
            />
          ) : (
            <span className='avatar-fallback'>{user.name.charAt(0)}</span>
          )}
        </div>

        {/* Информация о пользователе */}
        <div className='LEAD-user-info'>
          <div className='LEAD-user-name-section'>
            <Link to={`/profile/${user.username}`} className='LEAD-user-name'>
              {user.name}
            </Link>

            {/* Верификация */}
            {user.verification && user.verification.status && (
              <VerificationBadge
                status={user.verification.status}
                {...({} as any)}
              />
            )}

            {/* MAX подписка */}
            {(user.subscription?.type === 'max' ||
              user.subscription_type === 'max' ||
              user.subscription?.subscription_type === 'max') && (
              <MaxIcon
                size={24}
                color='#FF4D50'
                style={{ margin: '0 2.5px' }}
                className='max-icon'
              />
            )}

            {/* Достижение */}
            {user.achievement && (
              <div className='achievement-badge' title={user.achievement.bage}>
                <img
                  src={`/static/images/bages/${user.achievement.image_path}`}
                  alt={user.achievement.bage}
                  className='achievement-image'
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LeaderboardUserCard;
