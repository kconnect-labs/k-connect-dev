import { useState, useEffect } from 'react';

interface GradientData {
  center_color: string;
  corner_color: string;
  gradient: string;
  item_id: number;
}

interface BackgroundGradients {
  [key: string]: GradientData;
}

let gradientsCache: BackgroundGradients | null = null;
let isLoadingCache = false;
let errorCache: string | null = null;

export const useBackgroundGradients = () => {
  const [gradients, setGradients] = useState<BackgroundGradients>(
    gradientsCache || {}
  );
  const [isLoading, setIsLoading] = useState(isLoadingCache);
  const [error, setError] = useState<string | null>(errorCache);

  useEffect(() => {
    const loadGradients = async () => {
      const preloadedData = (window as any).__backgroundGradientsCache;
      if (preloadedData) {
        gradientsCache = preloadedData;
        setGradients(preloadedData);
        setIsLoading(false);
        return;
      }

      if (gradientsCache) {
        setGradients(gradientsCache);
        setIsLoading(false);
        return;
      }

      if (isLoadingCache) {
        return;
      }

      try {
        isLoadingCache = true;
        setIsLoading(true);
        setError(null);

        const response = await fetch('/background_gradients.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Сохраняем в кэш
        gradientsCache = data;
        setGradients(data);
      } catch (err) {
        console.error('Ошибка загрузки градиентов:', err);
        const errorMessage =
          err instanceof Error ? err.message : 'Неизвестная ошибка';
        errorCache = errorMessage;
        setError(errorMessage);
      } finally {
        isLoadingCache = false;
        setIsLoading(false);
      }
    };

    loadGradients();
  }, []);

  const getGradient = (backgroundId: string | number): string | null => {
    const id = String(backgroundId);
    return gradients[id]?.gradient || null;
  };

  const getGradientData = (
    backgroundId: string | number
  ): GradientData | null => {
    const id = String(backgroundId);
    return gradients[id] || null;
  };

  const getItemId = (backgroundId: string | number): number | null => {
    const id = String(backgroundId);
    return gradients[id]?.item_id || null;
  };

  return {
    gradients,
    isLoading,
    error,
    getGradient,
    getGradientData,
    getItemId,
  };
};
