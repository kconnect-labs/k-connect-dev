import { useEffect, useState, useCallback } from 'react';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { stickerCacheService, StickerPack } from '../services/stickerCache';

export interface StickerPreloaderState {
  isPreloading: boolean;
  progress: {
    current: number;
    total: number;
    percentage: number;
  };
  stats: {
    totalPacks: number;
    totalStickers: number;
    cachedStickers: number;
    cacheSize: number;
    lastUpdate: number;
  };
  error: string | null;
}

export const useStickerPreloader = () => {
  const { isAuthenticated, loading: authLoading } = useContext(AuthContext);
  const [state, setState] = useState<StickerPreloaderState>({
    isPreloading: false,
    progress: { current: 0, total: 0, percentage: 0 },
    stats: {
      totalPacks: 0,
      totalStickers: 0,
      cachedStickers: 0,
      cacheSize: 0,
      lastUpdate: 0,
    },
    error: null,
  });

  // Инициализация предзагрузки
  const initializePreload = useCallback(async () => {
    if (!isAuthenticated || authLoading) {
      return;
    }

    try {
      setState(prev => ({ ...prev, isPreloading: true, error: null }));

      console.log('Starting sticker preload initialization...');

      // Загружаем стикерпаки пользователя (с поддержкой batch API)
      const packs = await stickerCacheService.loadUserStickerPacks();
      
      if (packs.length === 0) {
        console.log('No sticker packs found for user');
        setState(prev => ({ 
          ...prev, 
          isPreloading: false,
          stats: stickerCacheService.getStats(),
        }));
        return;
      }

      console.log(`Found ${packs.length} sticker packs, starting preload...`);

      // Обновляем статистику
      setState(prev => ({ 
        ...prev, 
        stats: stickerCacheService.getStats(),
      }));

      // Запускаем предзагрузку в фоне (автоматически использует batch если доступен)
      await stickerCacheService.preloadStickers(packs);

      // Мониторим прогресс
      const progressInterval = setInterval(() => {
        const progress = stickerCacheService.getPreloadProgress();
        const isPreloading = stickerCacheService.isPreloadingInProgress();
        const stats = stickerCacheService.getStats();

        setState(prev => ({
          ...prev,
          isPreloading,
          progress,
          stats,
        }));

        // Если предзагрузка завершена, останавливаем мониторинг
        if (!isPreloading) {
          clearInterval(progressInterval);
          console.log('Sticker preload completed');
        }
      }, 1000);

    } catch (error) {
      console.error('Error during sticker preload initialization:', error);
      setState(prev => ({ 
        ...prev, 
        isPreloading: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }));
    }
  }, [isAuthenticated, authLoading]);

  // Принудительная предзагрузка
  const forcePreload = useCallback(async () => {
    await initializePreload();
  }, [initializePreload]);

  // Очистка кеша
  const clearCache = useCallback(() => {
    stickerCacheService.clearCache();
    setState(prev => ({
      ...prev,
      stats: stickerCacheService.getStats(),
    }));
  }, []);

  // Автоматическая инициализация при авторизации
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      // Увеличенная задержка для снижения нагрузки на сеть
      const timer = setTimeout(() => {
        initializePreload();
      }, 5000); // Увеличили до 5 секунд

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, authLoading, initializePreload]);

  // Периодическое обновление статистики
  useEffect(() => {
    const statsInterval = setInterval(() => {
      setState(prev => ({
        ...prev,
        stats: stickerCacheService.getStats(),
      }));
    }, 30000); // Каждые 30 секунд

    return () => clearInterval(statsInterval);
  }, []);

  return {
    ...state,
    initializePreload,
    forcePreload,
    clearCache,
    updateUserActivity: () => stickerCacheService.updateUserActivity(),
  };
};

// Хук для получения статистики кеша
export const useStickerCacheStats = () => {
  const [stats, setStats] = useState(stickerCacheService.getStats());

  useEffect(() => {
    const updateStats = () => {
      setStats(stickerCacheService.getStats());
    };

    // Обновляем статистику каждые 10 секунд
    const interval = setInterval(updateStats, 10000);

    return () => clearInterval(interval);
  }, []);

  return stats;
}; 