import { useState, useEffect, useCallback } from 'react';

interface Ticket {
  id: number;
  title: string;
  description: string;
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  closed_at?: string;
  creator: {
    id: number;
    name: string;
    username: string;
    avatar: string;
  };
  assignee?: {
    id: number;
    name: string;
    username: string;
    avatar: string;
  };
  target_type?: string;
  target_id?: number;
  comments_count: number;
  is_active: boolean;
  is_resolved: boolean;
  is_closed: boolean;
}

interface Filters {
  status?: string;
  priority?: string;
  category?: string;
  assigned_to?: number;
  search?: string;
}

interface Pagination {
  page: number;
  per_page: number;
  total: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

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
  const [filters, setFilters] = useState<Filters>({});

  const fetchTickets = useCallback(
    async (page = 1, newFilters?: Filters) => {
      setLoading(true);
      setError(null);

      try {
        // Merge filters: newFilters take precedence over filters
        const mergedFilters: Record<string, string> = {
          page: page.toString(),
          per_page: pagination.per_page.toString(),
        };

        // Add filters from filters and newFilters, converting all values to string and skipping undefined/null
        const allFilters = { ...filters, ...newFilters };
        for (const [key, value] of Object.entries(allFilters)) {
          if (value !== undefined && value !== null) {
            mergedFilters[key] = String(value);
          }
        }

        const params = new URLSearchParams(mergedFilters);

        const response = await fetch(`/api/moderator/tickets?${params}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          setTickets(data.tickets);
          setPagination(data.pagination);
        } else {
          throw new Error(data.error || 'Ошибка загрузки тикетов');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
        console.error('Ошибка загрузки тикетов:', err);
      } finally {
        setLoading(false);
      }
    },
    [filters, pagination.per_page]
  );

  const updateFilters = useCallback((newFilters: Partial<Filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const refreshTickets = useCallback(() => {
    fetchTickets(1, filters);
  }, [fetchTickets, filters]);

  const loadMoreTickets = useCallback(() => {
    if (pagination.has_next && !loading) {
      fetchTickets(pagination.page + 1, filters);
    }
  }, [fetchTickets, pagination, loading, filters]);

  // Загрузка тикетов при изменении фильтров
  useEffect(() => {
    fetchTickets(1, filters);
  }, [filters]);

  return {
    tickets,
    loading,
    error,
    pagination,
    filters,
    fetchTickets,
    updateFilters,
    refreshTickets,
    loadMoreTickets,
  };
};
