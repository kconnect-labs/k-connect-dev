/**
 * Предзагрузчик популярных бейджей для улучшения UX
 */

import { badgeCache } from './badgeCache';

// Список популярных бейджей для предзагрузки
const POPULAR_BADGES = [
  '5be5c288-fe2d-4445-9ece-b2405125737a.svg',
  // Добавьте сюда другие популярные бейджи
];

class BadgePreloader {
  private preloaded = new Set<string>();
  private isPreloading = false;

  /**
   * Предзагрузить популярные бейджи
   */
  async preloadPopularBadges(): Promise<void> {
    if (this.isPreloading) return;

    this.isPreloading = true;

    try {
      const promises = POPULAR_BADGES.map(badgePath =>
        badgeCache.getBadge(badgePath).then(result => {
          if (result) {
            this.preloaded.add(badgePath);
          }
        })
      );

      await Promise.allSettled(promises);
      console.log(`Preloaded ${this.preloaded.size} popular badges`);
    } catch (error) {
      console.warn('Failed to preload some badges:', error);
    } finally {
      this.isPreloading = false;
    }
  }

  /**
   * Предзагрузить бейджи из списка достижений пользователя
   */
  async preloadUserBadges(achievements: any[]): Promise<void> {
    if (!achievements || achievements.length === 0) return;

    try {
      const badgePaths = achievements
        .filter(achievement => achievement?.image_path)
        .map(achievement => achievement.image_path);

      const promises = badgePaths.map(badgePath =>
        badgeCache.getBadge(badgePath).then(result => {
          if (result) {
            this.preloaded.add(badgePath);
          }
        })
      );

      await Promise.allSettled(promises);
      console.log(`Preloaded ${badgePaths.length} user badges`);
    } catch (error) {
      console.warn('Failed to preload user badges:', error);
    }
  }

  /**
   * Проверить, предзагружен ли бейдж
   */
  isPreloaded(badgePath: string): boolean {
    return this.preloaded.has(badgePath);
  }

  /**
   * Получить статистику предзагрузки
   */
  getPreloadStats(): { preloaded: number; total: number } {
    return {
      preloaded: this.preloaded.size,
      total: POPULAR_BADGES.length,
    };
  }
}

// Создаем глобальный экземпляр предзагрузчика
export const badgePreloader = new BadgePreloader();

// Автоматически предзагружаем популярные бейджи при загрузке страницы
if (typeof window !== 'undefined') {
  // Предзагружаем через небольшую задержку, чтобы не блокировать основной рендеринг
  setTimeout(() => {
    badgePreloader.preloadPopularBadges();
  }, 1000);
}
