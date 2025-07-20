import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

interface Subscription {
  active: boolean;
  type: string;
  expires_at?: string;
  features?: string[];
}

interface UseSubscriptionReturn {
  subscription: Subscription | null;
  loading: boolean;
  error: string | null;
  fetchSubscription: () => Promise<void>;
}

export const useSubscription = (): UseSubscriptionReturn => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get('/api/user/subscription/status');

      if (response.data && response.data.active) {
        setSubscription({
          active: true,
          type: response.data.subscription_type,
          expires_at: response.data.expiration_date,
          features: response.data.features || [],
        });
      } else {
        setSubscription(null);
      }
    } catch (err) {
      console.error('Error fetching subscription status:', err);
      setError('Ошибка при загрузке статуса подписки');
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  return {
    subscription,
    loading,
    error,
    fetchSubscription,
  };
};
