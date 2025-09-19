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

  const initializePreload = useCallback(async () => {
    // Временно отключена инициализация предзагрузки стикеров
    console.log('🚫 Sticker preload initialization temporarily disabled');
    setState(prev => ({
      ...prev,
      isPreloading: false,
      stats: {
        totalPacks: 0,
        totalStickers: 0,
        cachedStickers: 0,
        cacheSize: 0,
        lastUpdate: Date.now(),
      },
    }));
  }, []);

  const forcePreload = useCallback(async () => {
    await initializePreload();
  }, [initializePreload]);

  const clearCache = useCallback(() => {
    stickerCacheService.clearCache();
    setState(prev => ({
      ...prev,
      stats: stickerCacheService.getStats(),
    }));
  }, []);

  useEffect(() => {
    // Временно отключена автоматическая инициализация предзагрузки
    console.log('🚫 Auto sticker preload initialization temporarily disabled');
  }, []);

  useEffect(() => {
    const statsInterval = setInterval(() => {
      setState(prev => ({
        ...prev,
        stats: stickerCacheService.getStats(),
      }));
    }, 30000);

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

export const useStickerCacheStats = () => {
  const [stats, setStats] = useState(stickerCacheService.getStats());

  useEffect(() => {
    const updateStats = () => {
      setStats(stickerCacheService.getStats());
    };

    const interval = setInterval(updateStats, 10000);

    return () => clearInterval(interval);
  }, []);

  return stats;
};
