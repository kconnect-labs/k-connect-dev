import { Badge, SortOption, TabValue } from '../types';

export const getBadgeImageUrl = (imagePath: string): string => {
  if (!imagePath) return '';
  // Просто возвращаем imagePath как есть, так как бэкенд уже возвращает полный URL
  return imagePath;
};

export const getSortedBadges = (
  badges: Badge[],
  sortOption: SortOption
): Badge[] => {
  if (!badges.length) return [];

  switch (sortOption) {
    case 'newest':
      return [...badges].sort((a, b) => b.id - a.id);
    case 'oldest':
      return [...badges].sort((a, b) => a.id - b.id);
    case 'popular':
      return [...badges].sort(
        (a, b) => (b.purchases?.length || 0) - (a.purchases?.length || 0)
      );
    case 'price-low':
      return [...badges].sort((a, b) => a.price - b.price);
    case 'price-high':
      return [...badges].sort((a, b) => b.price - a.price);
    default:
      return badges;
  }
};

export const filterBadgesByTab = (
  badges: Badge[],
  tabValue: TabValue,
  userId?: number
): Badge[] => {
  let filtered = badges;

  if (tabValue === 0) {
    // Все - показываем все бейджики без фильтрации
    filtered = badges;
  } else if (tabValue === 1) {
    // Мои - созданные пользователем
    filtered = badges.filter(badge => badge.creator_id === userId);
  } else if (tabValue === 2) {
    // Купленные - купленные пользователем
    filtered = badges.filter(badge =>
      badge.purchases?.some(p => p.buyer_id === userId)
    );
  } else if (tabValue === 3) {
    // Скупленные - полностью распроданные
    filtered = badges.filter(
      badge =>
        (badge.max_copies === 1 && (badge.copies_sold || 0) >= 1) ||
        (badge.max_copies && (badge.copies_sold || 0) >= badge.max_copies)
    );
  }

  return filtered;
};

export const isBadgeSoldOut = (badge: Badge): boolean => {
  const maxCopies = typeof badge.max_copies === 'number' ? badge.max_copies : undefined;
  const copiesSold = typeof badge.copies_sold === 'number' ? badge.copies_sold : 0;

  if (maxCopies === 1) {
    return copiesSold >= 1;
  }
  if (typeof maxCopies === 'number') {
    return copiesSold >= maxCopies;
  }
  return false;
};

export const isBadgePurchasedByUser = (
  badge: Badge,
  userId?: number
): boolean => {
  return badge.purchases?.some(p => p.buyer_id === userId) || false;
};

export const canUserBuyBadge = (badge: Badge, userId?: number): boolean => {
  return (
    !isBadgeSoldOut(badge) &&
    !isBadgePurchasedByUser(badge, userId) &&
    badge.creator_id !== userId
  );
};

export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

export const validateImageFile = (
  file: File
): { isValid: boolean; error?: string } => {
  const allowedTypes = ['image/svg+xml', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Пожалуйста, загрузите SVG или GIF файл' };
  }

  const maxSize = 100 * 1024; // 100 KB
  if (file.size > maxSize) {
    const fileSizeKB = Math.round(file.size / 1024);
    return {
      isValid: false,
      error: `Размер файла превышает лимит в 100 КБ. Текущий размер: ${fileSizeKB} КБ`,
    };
  }

  return { isValid: true };
};

export const getCreationCost = (isUpgraded: boolean): number => {
  return isUpgraded ? 9000 : 3000;
};

export const getBadgeLimitBySubscription = (
  subscriptionType?: string
): number => {
  if (!subscriptionType) return 3;

  const subType = subscriptionType.toLowerCase().trim();

  if (subType === 'basic') {
    return 5;
  } else if (subType === 'premium') {
    return 8;
  } else if (subType === 'ultimate' || subType.includes('ultimate') || subType === 'max' || subType.includes('max')) {
    return Infinity;
  } else {
    return 3;
  }
};
