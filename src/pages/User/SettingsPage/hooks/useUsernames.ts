import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

interface UsernameData {
  available: boolean;
  price: number;
  owned: boolean;
  length_factor: number;
  popularity_factor: number;
}

interface PurchasedUsername {
  id: number;
  username: string;
  is_active: boolean;
  purchase_date: string;
  price_paid: number;
}

interface Subscription {
  active: boolean;
  subscription_type: string;
}

interface UseUsernamesReturn {
  // Состояние
  username: string;
  usernameData: UsernameData | null;
  loading: boolean;
  purchasing: boolean;
  purchased: PurchasedUsername[];
  error: string;
  userPoints: number;
  usernameLimit: number;
  limitReached: boolean;
  userSubscription: Subscription | null;
  isChangingActive: boolean;

  // Действия
  setUsername: (username: string) => void;
  handleUsernameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePurchase: () => Promise<void>;
  handleSetActive: (usernameObj: PurchasedUsername) => Promise<void>;
  fetchPurchasedUsernames: () => Promise<void>;
  fetchUserPoints: () => Promise<void>;
  fetchSubscriptionStatus: () => Promise<void>;
  clearError: () => void;
}

export const useUsernames = (): UseUsernamesReturn => {
  const [username, setUsername] = useState('');
  const [usernameData, setUsernameData] = useState<UsernameData | null>(null);
  const [loading, setLoading] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [purchased, setPurchased] = useState<PurchasedUsername[]>([]);
  const [error, setError] = useState('');
  const [userPoints, setUserPoints] = useState(0);
  const [usernameLimit, setUsernameLimit] = useState(3);
  const [limitReached, setLimitReached] = useState(false);
  const [userSubscription, setUserSubscription] = useState<Subscription | null>(
    null
  );
  const [isChangingActive, setIsChangingActive] = useState(false);

  // Расчет лимита юзернеймов на основе подписки
  const calculateUsernameLimit = useCallback((subscriptionType: string) => {
    if (!subscriptionType) return 3;
    if (subscriptionType === 'basic') return 5;
    if (subscriptionType === 'premium') return 8;
    if (subscriptionType === 'ultimate') return Infinity;
    return 3;
  }, []);

  // Валидация юзернейма
  const validateUsername = useCallback((value: string): string => {
    if (!value) return '';

    const isCyrillic = /[а-яА-ЯёЁ]/.test(value);
    const isLatin = /[a-zA-Z]/.test(value);

    if (value.length < 3) {
      return 'Юзернейм должен содержать не менее 3 символов';
    } else if (value.length > 16) {
      return 'Юзернейм не должен превышать 16 символов';
    } else if (isCyrillic && isLatin) {
      return 'Юзернейм не может содержать одновременно кириллицу и латиницу';
    } else if (isCyrillic) {
      if (!/^[а-яА-ЯёЁ0-9]+$/.test(value)) {
        return 'Кириллический юзернейм может содержать только буквы и цифры';
      }
    } else if (isLatin) {
      if (!/^[a-zA-Z]/.test(value)) {
        return 'Латинский юзернейм должен начинаться с буквы';
      } else if (!/^[a-zA-Z0-9._-]+$/.test(value)) {
        return 'Латинский юзернейм содержит недопустимые символы';
      } else if (/[._-]{2,}/.test(value)) {
        return 'Спецсимволы не могут идти подряд';
      } else if ((value.match(/[._-]/g) || []).length > 1) {
        return 'Может быть использован только один спецсимвол (. или _ или -)';
      }
    } else if (!isCyrillic && !isLatin) {
      return 'Юзернейм должен содержать хотя бы одну букву';
    }

    return '';
  }, []);

  // Получение статуса подписки
  const fetchSubscriptionStatus = useCallback(async () => {
    try {
      const response = await axios.get('/api/user/subscription/status');
      if (response.data.active) {
        setUserSubscription(response.data);
        const newLimit = calculateUsernameLimit(
          response.data.subscription_type
        );
        setUsernameLimit(newLimit);
      } else {
        setUserSubscription(null);
        setUsernameLimit(3);
      }
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      setUserSubscription(null);
      setUsernameLimit(3);
    }
  }, [calculateUsernameLimit]);

  // Получение купленных юзернеймов
  const fetchPurchasedUsernames = useCallback(async () => {
    try {
      const response = await axios.get('/api/username/purchased');
      if (response.data.success) {
        const usernames = response.data.usernames || [];
        setPurchased(usernames);
        setLimitReached(usernames.length >= usernameLimit);
      } else {
        setError(
          response.data.message || 'Failed to fetch purchased usernames'
        );
        setPurchased([]);
      }
    } catch (error: any) {
      console.error('Error fetching purchased usernames:', error);
      setError('Error loading purchased usernames: ' + error.message);
      setPurchased([]);
    }
  }, [usernameLimit]);

  // Получение баллов пользователя
  const fetchUserPoints = useCallback(async () => {
    try {
      const response = await axios.get('/api/user/points');
      setUserPoints(response.data.points);
    } catch (error) {
      console.error('Error fetching user points:', error);
    }
  }, []);

  // Расчет цены юзернейма
  const calculateUsernamePrice = useCallback(async (value: string) => {
    try {
      setLoading(true);
      setError('');

      const response = await axios.post('/api/username/calculate-price', {
        username: value,
      });

      if (response.data.success) {
        setUsernameData(response.data);
      } else {
        setUsernameData(null);
      }
    } catch (error: any) {
      console.error('Error calculating username price:', error);
      setUsernameData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Обработка изменения юзернейма
  const handleUsernameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setUsername(value);

      if (!value) {
        setUsernameData(null);
        setError('');
        return;
      }

      const validationError = validateUsername(value);

      if (validationError) {
        setError(validationError);
        setUsernameData(null);
        return;
      }

      setError('');

      const delayDebounceFn = setTimeout(() => {
        calculateUsernamePrice(value.trim());
      }, 500);

      return () => clearTimeout(delayDebounceFn);
    },
    [validateUsername, calculateUsernamePrice]
  );

  // Покупка юзернейма
  const handlePurchase = useCallback(async () => {
    if (
      !username ||
      !usernameData ||
      !usernameData.available ||
      usernameData.owned ||
      userPoints < usernameData.price
    ) {
      return;
    }

    setPurchasing(true);

    try {
      const response = await axios.post('/api/username/purchase', {
        username,
        price: usernameData.price,
      });

      if (response.data.success) {
        setUsername('');
        setUsernameData(null);
        await fetchPurchasedUsernames();
        await fetchUserPoints();
      } else {
        setError(response.data.message || 'Failed to purchase username');
      }
    } catch (error: any) {
      console.error('Error purchasing username:', error);
      const errorMessage = error.response?.data?.message || error.message;
      setError('Error purchasing username: ' + errorMessage);
    } finally {
      setPurchasing(false);
    }
  }, [
    username,
    usernameData,
    userPoints,
    fetchPurchasedUsernames,
    fetchUserPoints,
  ]);

  // Установка активного юзернейма
  const handleSetActive = useCallback(
    async (usernameObj: PurchasedUsername) => {
      setIsChangingActive(true);

      try {
        const response = await axios.post('/api/username/set-active', {
          username_id: usernameObj.id,
        });

        if (response.data.success) {
          // Обновляем локальное хранилище
          try {
            const userData = JSON.parse(
              localStorage.getItem('userData') || '{}'
            );
            userData.username = response.data.username;
            localStorage.setItem('userData', JSON.stringify(userData));
          } catch (e) {
            console.error('Error updating username in localStorage:', e);
          }

          await fetchPurchasedUsernames();
        } else {
          setError(response.data.message || 'Failed to change username');
        }
      } catch (error: any) {
        console.error('Error changing username:', error);
        setError(
          'Error changing username: ' +
            (error.response?.data?.message || error.message)
        );
      } finally {
        setIsChangingActive(false);
      }
    },
    [fetchPurchasedUsernames]
  );

  // Очистка ошибки
  const clearError = useCallback(() => {
    setError('');
  }, []);

  // Инициализация
  useEffect(() => {
    fetchPurchasedUsernames();
    fetchUserPoints();
    fetchSubscriptionStatus();
  }, [fetchPurchasedUsernames, fetchUserPoints, fetchSubscriptionStatus]);

  // Обновление лимита при изменении подписки
  useEffect(() => {
    setLimitReached(purchased.length >= usernameLimit);
  }, [usernameLimit, purchased.length]);

  return {
    // Состояние
    username,
    usernameData,
    loading,
    purchasing,
    purchased,
    error,
    userPoints,
    usernameLimit,
    limitReached,
    userSubscription,
    isChangingActive,

    // Действия
    setUsername,
    handleUsernameChange,
    handlePurchase,
    handleSetActive,
    fetchPurchasedUsernames,
    fetchUserPoints,
    fetchSubscriptionStatus,
    clearError,
  };
};
