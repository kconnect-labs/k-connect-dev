import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { MarketplaceState, MarketplaceFilters, MarketplaceListing } from './types';

const useMarketplace = () => {
  const [state, setState] = useState<MarketplaceState>({
    listings: [],
    loading: false,
    error: null,
    hasMore: true,
    page: 1,
    filters: {}
  });

  const fetchListings = useCallback(async (page: number = 1, filters: MarketplaceFilters = {}) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: '20',
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== undefined && value !== '')
        )
      });

      const response = await axios.get(`/api/marketplace/listings?${params}`);
      
      if (response.data.success) {
        const { listings, pagination } = response.data;
        
        setState(prev => ({
          ...prev,
          listings: page === 1 ? (listings || []) : [...prev.listings, ...(listings || [])],
          hasMore: pagination?.has_next || false,
          page: pagination?.page || page,
          loading: false
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: response.data.message || 'Ошибка загрузки маркетплейса',
          loading: false
        }));
      }
    } catch (error) {
      console.error('Error fetching marketplace listings:', error);
      setState(prev => ({
        ...prev,
        error: 'Ошибка при загрузке маркетплейса',
        loading: false
      }));
    }
  }, []);

  const loadMore = useCallback(() => {
    setState(prev => {
      if (!prev.loading && prev.hasMore) {
        const nextPage = prev.page + 1;
        fetchListings(nextPage, prev.filters);
      }
      return prev;
    });
  }, [fetchListings]);

  const applyFilters = useCallback((filters: MarketplaceFilters) => {
    setState(prev => ({ ...prev, filters, page: 1, listings: [] }));
    fetchListings(1, filters);
  }, [fetchListings]);

  const refresh = useCallback(() => {
    fetchListings(1, state.filters);
  }, [fetchListings, state.filters]);

  // Загружаем данные при монтировании
  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  return {
    ...state,
    loadMore,
    applyFilters,
    refresh
  };
};

export default useMarketplace;
