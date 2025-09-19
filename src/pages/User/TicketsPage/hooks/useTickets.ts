import { useState, useEffect, useCallback } from 'react';
import { Ticket, Pagination, Filters } from '../types';

export const useTickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    per_page: 20,
    total: 0,
    pages: 0,
    has_next: false,
    has_prev: false,
  });

  const makeRequest = useCallback(
    async (url: string, method: string = 'GET', data?: any) => {
      try {
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: data ? JSON.stringify(data) : undefined,
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Произошла ошибка');
        }

        return result;
      } catch (err) {
        throw new Error(
          err instanceof Error ? err.message : 'Произошла ошибка'
        );
      }
    },
    []
  );

  const fetchTickets = useCallback(
    async (filters: Filters = {}) => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();

        if (filters.status) params.append('status', filters.status);
        if (filters.page) params.append('page', filters.page.toString());
        if (filters.per_page)
          params.append('per_page', filters.per_page.toString());

        const url = `/api/user/tickets${params.toString() ? `?${params.toString()}` : ''}`;
        const result = await makeRequest(url);

        if (result.success) {
          setTickets(result.tickets);
          setPagination(result.pagination);
        } else {
          throw new Error(result.error || 'Не удалось загрузить тикеты');
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Произошла ошибка при загрузке тикетов'
        );
      } finally {
        setLoading(false);
      }
    },
    [makeRequest]
  );

  const refreshTickets = useCallback(() => {
    fetchTickets();
  }, [fetchTickets]);

  const loadMoreTickets = useCallback(async () => {
    if (!pagination.has_next || loading) return;

    try {
      const nextPage = pagination.page + 1;
      const params = new URLSearchParams();
      params.append('page', nextPage.toString());
      params.append('per_page', pagination.per_page.toString());

      const url = `/api/user/tickets?${params.toString()}`;
      const result = await makeRequest(url);

      if (result.success) {
        setTickets(prev => [...prev, ...result.tickets]);
        setPagination(result.pagination);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Произошла ошибка при загрузке тикетов'
      );
    }
  }, [pagination, loading, makeRequest]);

  // Загружаем тикеты при монтировании компонента
  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  return {
    tickets,
    loading,
    error,
    pagination,
    fetchTickets,
    refreshTickets,
    loadMoreTickets,
  };
};
