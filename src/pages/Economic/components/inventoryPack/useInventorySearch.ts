import { useState, useEffect, useCallback, useRef } from 'react';
import { SearchFilters, InventoryItem } from './types';

const SEARCH_DELAY = 500; // 2 секунды задержки как в ВК

export const useInventorySearch = (baseItems: InventoryItem[]) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [filteredItems, setFilteredItems] =
    useState<InventoryItem[]>(baseItems);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Функция для выполнения поиска через API
  const performSearch = useCallback(
    async (searchQuery: string, searchFilters: SearchFilters) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/inventory/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: searchQuery,
            category: 'inventory',
            page: 1,
            per_page: 1000,
            filters: searchFilters,
          }),
          signal: abortControllerRef.current.signal,
        });
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        if (data.success) {
          setFilteredItems(data.items);
        } else {
          throw new Error('Search failed');
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return;
        setError(
          error instanceof Error ? error.message : 'Unknown error occurred'
        );
        setFilteredItems(baseItems);
      } finally {
        setIsLoading(false);
      }
    },
    [baseItems]
  );

  // Обновление поискового запроса с debounce
  const updateQuery = useCallback(
    (newQuery: string) => {
      setQuery(newQuery);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      // Если нет фильтров и нет текста — показываем весь инвентарь
      if (!newQuery.trim() && Object.keys(filters).length === 0) {
        setFilteredItems(baseItems);
        setIsLoading(false);
        setError(null);
        return;
      }
      timeoutRef.current = setTimeout(() => {
        performSearch(newQuery.trim(), filters);
      }, SEARCH_DELAY);
    },
    [filters, performSearch, baseItems]
  );

  // Обновление фильтров — всегда делаем запрос (без debounce)
  const updateFilters = useCallback(
    (newFilters: SearchFilters) => {
      setFilters(newFilters);
      // Если нет фильтров и нет текста — показываем весь инвентарь
      if (Object.keys(newFilters).length === 0 && !query.trim()) {
        setFilteredItems(baseItems);
        setIsLoading(false);
        setError(null);
        return;
      }
      // Иначе сразу делаем API-запрос
      performSearch(query.trim(), newFilters);
    },
    [query, performSearch, baseItems]
  );

  // Сброс поиска
  const resetSearch = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (abortControllerRef.current) abortControllerRef.current.abort();
    setQuery('');
    setFilters({});
    setFilteredItems(baseItems);
    setIsLoading(false);
    setError(null);
  }, [baseItems]);

  // Обновляем базовые предметы при изменении
  useEffect(() => {
    if (!query.trim() && Object.keys(filters).length === 0) {
      setFilteredItems(baseItems);
    }
  }, [baseItems, query, filters]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  return {
    query,
    filters,
    filteredItems,
    isLoading,
    error,
    updateQuery,
    updateFilters,
    resetSearch,
  };
};
