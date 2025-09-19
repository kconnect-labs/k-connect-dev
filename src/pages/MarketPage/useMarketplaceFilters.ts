import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export interface Pack {
  id: number;
  display_name: string;
  name: string;
  description: string;
  price: number;
  items_count: number;
}

export interface PackItem {
  id: number;
  item_name: string;
  rarity: string;
  drop_rate: number;
  pack_name: string;
}

export const useMarketplaceFilters = () => {
  const [packs, setPacks] = useState<Pack[]>([]);
  const [packItems, setPackItems] = useState<PackItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPacks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/inventory/packs');
      if (response.data.success) {
        setPacks(response.data.packs);
      } else {
        setError('Ошибка загрузки паков');
      }
    } catch (err) {
      console.error('Error fetching packs:', err);
      setError('Ошибка загрузки паков');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPackItems = useCallback(async (packId: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        `/api/inventory/packs/${packId}/contents`
      );
      if (response.data.success) {
        setPackItems(response.data.contents);
      } else {
        setError('Ошибка загрузки предметов пака');
      }
    } catch (err) {
      console.error('Error fetching pack items:', err);
      setError('Ошибка загрузки предметов пака');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPacks();
  }, [fetchPacks]);

  return {
    packs,
    packItems,
    loading,
    error,
    fetchPackItems,
    refetchPacks: fetchPacks,
  };
};
