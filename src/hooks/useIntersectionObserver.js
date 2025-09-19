import { useEffect, useRef } from 'react';

/**
 * Хук для обнаружения пересечения элемента с областью видимости
 * Используется для бесконечной прокрутки и подгрузки контента
 */
const useIntersectionObserver = ({
  target, 
  onIntersect, 
  threshold = 0.1, 
  rootMargin = '0px', 
  enabled = true, 
  debounceTime = 300, 
}) => {
  
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!enabled || !target.current) {
      return;
    }

    
    const handleIntersect = entries => {
      const [entry] = entries;

      if (entry.isIntersecting) {
        
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }

        
        debounceRef.current = setTimeout(() => {
          onIntersect();
          debounceRef.current = null;
        }, debounceTime);
      }
    };

    const observer = new IntersectionObserver(handleIntersect, {
      threshold,
      rootMargin,
    });

    observer.observe(target.current);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      observer.disconnect();
    };
  }, [target, enabled, threshold, rootMargin, onIntersect, debounceTime]);
};

export default useIntersectionObserver;
