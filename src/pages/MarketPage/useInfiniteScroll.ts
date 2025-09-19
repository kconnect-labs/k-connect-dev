import { useEffect, useRef } from 'react';

interface UseInfiniteScrollOptions {
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
}

export const useInfiniteScroll = ({
  hasMore,
  loading,
  onLoadMore
}: UseInfiniteScrollOptions) => {
  const loadingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadingElement = loadingRef.current;
    
    if (!loadingElement) return;

    // Создаем Intersection Observer
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        
        console.log('Intersection Observer triggered:', {
          isIntersecting: entry.isIntersecting,
          loading,
          hasMore
        });
        
        // Если элемент виден, не загружаем и есть еще данные - загружаем
        if (entry.isIntersecting && !loading && hasMore) {
          console.log('Loading more items - last element is visible!');
          onLoadMore();
        }
      },
      {
        // Загружаем когда элемент на 10% виден
        threshold: 0.1,
        // Добавляем небольшой отступ снизу
        rootMargin: '0px 0px 50px 0px'
      }
    );

    // Начинаем наблюдение за элементом загрузки
    observer.observe(loadingElement);

    // Очищаем observer при размонтировании
    return () => {
      observer.disconnect();
    };
  }, [loading, hasMore, onLoadMore]);

  // Возвращаем ref для элемента загрузки
  return { loadingRef };
};
