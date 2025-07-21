import { useCallback } from 'react';
import axios from 'axios';
import { Badge, NewBadge, UserSubscription } from '../types';

interface UseBadgeShopAPIProps {
  setBadges: (badges: Badge[]) => void;
  setUserPoints: (points: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;
  setCreatedBadgesCount: (count: number) => void;
  setUserSubscription: (subscription: UserSubscription | null) => void;
  setBadgeLimit: (limit: number) => void;
  setBadgeLimitReached: (reached: boolean) => void;
  userPoints: number;
  badgeLimit: number;
  userSubscription: UserSubscription | null;
}

export const useBadgeShopAPI = ({
  setBadges,
  setUserPoints,
  setLoading,
  setError,
  setCreatedBadgesCount,
  setUserSubscription,
  setBadgeLimit,
  setBadgeLimitReached,
  userPoints,
  badgeLimit,
  userSubscription,
}: UseBadgeShopAPIProps) => {
  const fetchBadges = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/badges/shop');
      setBadges(response.data.badges || []);
    } catch (error) {
      console.error('Error fetching badges:', error);
      setError('Ошибка при загрузке бейджиков');
    } finally {
      setLoading(false);
    }
  }, [setBadges, setLoading, setError]);

  const fetchUserPoints = useCallback(async () => {
    try {
      const response = await axios.get('/api/user/points');
      setUserPoints(response.data.points);
    } catch (error) {
      console.error('Error fetching user points:', error);
    }
  }, [setUserPoints]);

  const fetchSubscriptionStatus = useCallback(async () => {
    try {
      const response = await axios.get('/api/user/subscription/status');
      if (response.data.active) {
        setUserSubscription(response.data);
        updateBadgeLimit(response.data.subscription_type);
      } else {
        setUserSubscription(null);
        setBadgeLimit(3);
      }
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      setUserSubscription(null);
      setBadgeLimit(3);
    }
  }, [setUserSubscription, setBadgeLimit]);

  const updateBadgeLimit = useCallback(
    (subscriptionType: string) => {
      if (!subscriptionType) {
        setBadgeLimit(3);
        return;
      }

      const subType = subscriptionType.toLowerCase().trim();

      if (subType === 'basic') {
        setBadgeLimit(5);
      } else if (subType === 'premium') {
        setBadgeLimit(8);
      } else if (subType === 'ultimate' || subType.includes('ultimate') || subType === 'max') {
        setBadgeLimit(Infinity);
      } else {
        setBadgeLimit(3);
      }
    },
    [setBadgeLimit]
  );

  const fetchCreatedBadgesCount = useCallback(async () => {
    try {
      const response = await axios.get('/api/badges/created');
      if (response.data && response.data.total_badges !== undefined) {
        setCreatedBadgesCount(response.data.total_badges);

        const isPremium =
          userSubscription &&
          userSubscription.subscription_type &&
          (userSubscription.subscription_type.toLowerCase() === 'ultimate' ||
            userSubscription.subscription_type
              .toLowerCase()
              .includes('ultimate') ||
            userSubscription.subscription_type.toLowerCase() === 'max' ||
            userSubscription.subscription_type
              .toLowerCase()
              .includes('max'));

        if (isPremium) {
          setBadgeLimitReached(false);
        } else {
          setBadgeLimitReached(response.data.total_badges >= badgeLimit);
        }
      }
    } catch (error) {
      console.error('Error fetching created badges count:', error);
    }
  }, [
    setCreatedBadgesCount,
    setBadgeLimitReached,
    userSubscription,
    badgeLimit,
  ]);

  const createBadge = useCallback(
    async (newBadge: NewBadge) => {
      try {
        if (
          !newBadge.name ||
          !newBadge.description ||
          !newBadge.price ||
          !newBadge.image
        ) {
          throw new Error('Пожалуйста, заполните все обязательные поля');
        }

        const price = parseInt(newBadge.price);
        if (isNaN(price) || price <= 0) {
          throw new Error('Цена должна быть положительным числом');
        }

        const creationCost = newBadge.is_upgraded ? 9000 : 3000;
        if (userPoints < creationCost) {
          throw new Error(
            `Недостаточно баллов. Требуется: ${creationCost} баллов`
          );
        }

        const formData = new FormData();
        formData.append('name', newBadge.name);
        formData.append('description', newBadge.description);
        formData.append('price', price.toString());
        formData.append(
          'royalty_percentage',
          newBadge.royalty_percentage.toString()
        );

        const maxCopies = parseInt(newBadge.max_copies) || 0;
        if (maxCopies === 1) {
          formData.append('max_copies', '1');
          formData.append('is_sold_out', 'true');
        } else if (newBadge.max_copies) {
          formData.append('max_copies', newBadge.max_copies);
        }

        formData.append('image', newBadge.image);
        formData.append('strip_path_prefix', 'true');
        formData.append('file_path_mode', 'clean');
        formData.append('auto_assign_to_creator', 'true');

        if (newBadge.is_upgraded) {
          formData.append('is_upgraded', 'true');
          formData.append('particle_color', newBadge.particle_color);
        }

        await axios.post('/api/badges/create', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        await fetchCreatedBadgesCount();
        await fetchBadges();
        await fetchUserPoints();

        return true;
      } catch (error: any) {
        console.error('Ошибка при создании бейджика:', error);
        throw new Error(
          error.response?.data?.error ||
            error.message ||
            'Ошибка при создании бейджика'
        );
      }
    },
    [userPoints, fetchCreatedBadgesCount, fetchBadges, fetchUserPoints]
  );

  const purchaseBadge = useCallback(
    async (badge: Badge) => {
      try {
        await axios.post(`/api/badges/purchase/${badge.id}`, {
          badge_info: {
            name: badge.name !== 'shop_1' ? badge.name : 'Бейджик',
            remove_badge_prefix: true,
            add_shop_prefix: true,
          },
        });

        await fetchBadges();
        await fetchUserPoints();

        return true;
      } catch (error: any) {
        console.error('Ошибка при покупке бейджика:', error);
        throw new Error(
          error.response?.data?.error || 'Ошибка при покупке бейджика'
        );
      }
    },
    [fetchBadges, fetchUserPoints]
  );

  return {
    fetchBadges,
    fetchUserPoints,
    fetchSubscriptionStatus,
    fetchCreatedBadgesCount,
    createBadge,
    purchaseBadge,
    updateBadgeLimit,
  };
};
