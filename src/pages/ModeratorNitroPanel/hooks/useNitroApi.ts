import { useState, useCallback } from 'react';
import axios from 'axios';
import {
  User,
  Achievement,
  BadgeType,
  Subscription,
  SubscriptionType,
  RedemptionKey,
  ModeratorPermission,
  ApiResponse,
  PaginationResponse,
  Post,
  Comment,
  ShopBadge,
  Track,
  Artist,
  Warning,
  Ban,
} from '../types';

const API_BASE = '/api/moderator';

export const useNitroApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const makeRequest = useCallback(
    async <T>(endpoint: string, options: any = {}): Promise<T> => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios({
          url: `${API_BASE}${endpoint}`,
          method: options.method || 'GET',
          data: options.body || options.data,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
          ...options,
        });

        return response.data;
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.error || err.message || 'Произошла ошибка';
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const verifyUser = useCallback(
    async (userId: number, verificationLevel: number) => {
      return makeRequest<ApiResponse<any>>(`/verify/${userId}`, {
        method: 'POST',
        data: { verification_level: verificationLevel },
      });
    },
    [makeRequest]
  );

  const getAllAchievements = useCallback(async () => {
    return makeRequest<{ badges: BadgeType[] }>('/achievements');
  }, [makeRequest]);

  const getUserAchievements = useCallback(
    async (userId: number) => {
      return makeRequest<{ achievements: Achievement[]; total: number }>(
        `/users/${userId}/achievements`
      );
    },
    [makeRequest]
  );

  const giveAchievement = useCallback(
    async (userId: number, badgeTypeId: number) => {
      return makeRequest<ApiResponse<any>>(
        `/users/${userId}/give-achievement`,
        {
          method: 'POST',
          data: { badge_type_id: badgeTypeId },
        }
      );
    },
    [makeRequest]
  );

  const getBadgeTypes = useCallback(async () => {
    return makeRequest<{ badge_types: BadgeType[] }>('/badge-types');
  }, [makeRequest]);

  const getUserSubscriptions = useCallback(
    async (userId: number) => {
      return makeRequest<{ subscriptions: Subscription[] }>(
        `/users/${userId}/subscriptions`
      );
    },
    [makeRequest]
  );

  const giveSubscription = useCallback(
    async (userId: number, subscriptionType: string) => {
      return makeRequest<ApiResponse<any>>(
        `/users/${userId}/give-subscription`,
        {
          method: 'POST',
          data: { subscription_type: subscriptionType },
        }
      );
    },
    [makeRequest]
  );

  const deleteSubscription = useCallback(
    async (subscriptionId: number) => {
      return makeRequest<ApiResponse<any>>(`/subscriptions/${subscriptionId}`, {
        method: 'DELETE',
      });
    },
    [makeRequest]
  );

  const getSubscriptionTypes = useCallback(async () => {
    return makeRequest<{ subscription_types: SubscriptionType[] }>(
      '/subscription-types'
    );
  }, [makeRequest]);

  const assignModerator = useCallback(
    async (userId: number, permissions: Partial<ModeratorPermission>) => {
      return makeRequest<ApiResponse<any>>(`/assign-moderator/${userId}`, {
        method: 'POST',
        data: permissions,
      });
    },
    [makeRequest]
  );

  const getModerators = useCallback(async () => {
    const response = await axios.get('/api/admin/moderators');
    return response.data;
  }, []);

  const getRedemptionKeys = useCallback(
    async (
      userId: number,
      params?: {
        page?: number;
        per_page?: number;
        active?: boolean;
        used?: boolean;
        key_type?: string;
      }
    ) => {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            searchParams.append(key, value.toString());
          }
        });
      }

      const queryString = searchParams.toString();
      return makeRequest<PaginationResponse<RedemptionKey>>(
        `/users/${userId}/keys${queryString ? `?${queryString}` : ''}`
      );
    },
    [makeRequest]
  );

  const generateKeys = useCallback(
    async (
      userId: number,
      keyData: {
        type: 'points' | 'subscription';
        points?: number;
        subscription_type?: string;
        max_uses: number;
        count: number;
        expires_days?: number;
        description?: string;
        subscription_duration_days?: number;
      }
    ) => {
      return makeRequest<ApiResponse<{ keys: string[] }>>(
        `/users/${userId}/generate-keys`,
        {
          method: 'POST',
          data: keyData,
        }
      );
    },
    [makeRequest]
  );

  const getBugReports = useCallback(
    async (params?: { page?: number; per_page?: number; search?: string }) => {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            searchParams.append(key, value.toString());
          }
        });
      }

      const queryString = searchParams.toString();
      return makeRequest<{
        bug_reports: any[];
        total: number;
        page: number;
        has_next: boolean;
      }>(`/bug-reports${queryString ? `?${queryString}` : ''}`);
    },
    [makeRequest]
  );

  const updateBugReportStatus = useCallback(
    async (bugId: number, status: string) => {
      return makeRequest<ApiResponse<any>>(`/bug-reports/${bugId}`, {
        method: 'PUT',
        data: { status },
      });
    },
    [makeRequest]
  );

  const deleteBugReport = useCallback(
    async (bugId: number) => {
      return makeRequest<ApiResponse<any>>(`/bug-reports/${bugId}`, {
        method: 'DELETE',
      });
    },
    [makeRequest]
  );

  const getPostById = useCallback(
    async (postId: number) => {
      return makeRequest<Post>(`/posts/${postId}`);
    },
    [makeRequest]
  );

  const deletePost = useCallback(
    async (postId: number) => {
      return makeRequest<ApiResponse<any>>(`/posts/${postId}`, {
        method: 'DELETE',
      });
    },
    [makeRequest]
  );

  const getCommentsByPostId = useCallback(
    async (postId: number) => {
      return makeRequest<{ comments: Comment[] }>(`/posts/${postId}/comments`);
    },
    [makeRequest]
  );

  const deleteComment = useCallback(
    async (commentId: number) => {
      return makeRequest<ApiResponse<any>>(`/comments/${commentId}`, {
        method: 'DELETE',
      });
    },
    [makeRequest]
  );

  const getBadges = useCallback(
    async (params?: { page?: number; per_page?: number; search?: string }) => {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            searchParams.append(key, value.toString());
          }
        });
      }

      const queryString = searchParams.toString();
      return makeRequest<{
        badges: ShopBadge[];
        total: number;
        page: number;
        has_next: boolean;
      }>(`/badges${queryString ? `?${queryString}` : ''}`);
    },
    [makeRequest]
  );

  const getBadgeById = useCallback(
    async (badgeId: number) => {
      return makeRequest<ShopBadge>(`/badges/${badgeId}`);
    },
    [makeRequest]
  );

  const updateBadge = useCallback(
    async (
      badgeId: number,
      badgeData: {
        name?: string;
        description?: string;
        price?: number;
        is_active?: boolean;
        upgrade?: string;
        color_upgrade?: string;
      }
    ) => {
      return makeRequest<ApiResponse<any>>(`/badges/${badgeId}`, {
        method: 'PUT',
        data: badgeData,
      });
    },
    [makeRequest]
  );

  const deleteBadge = useCallback(
    async (badgeId: number) => {
      return makeRequest<ApiResponse<any>>(`/badges/${badgeId}`, {
        method: 'DELETE',
      });
    },
    [makeRequest]
  );

  const searchUsers = useCallback(
    async (query: string): Promise<User[]> => {
      const response = await makeRequest<{ users: User[] }>('/users', {
        method: 'GET',
        params: { search: query, per_page: 20 },
      });
      return response.users;
    },
    [makeRequest]
  );

  const getTracks = useCallback(
    async (
      page: number = 1,
      search: string = '',
      trackId?: number,
      suspiciousOnly: boolean = false
    ): Promise<PaginationResponse<Track>> => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: page.toString(),
          per_page: '20',
          ...(search && { search }),
          ...(trackId && { track_id: trackId.toString() }),
          ...(suspiciousOnly && { suspicious_only: 'true' }),
        });

        const response = await axios.get(`${API_BASE}/tracks?${params}`);
        return response.data as PaginationResponse<Track>;
      } catch (err: any) {
        setError(err.response?.data?.error || 'Ошибка загрузки треков');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteTrack = useCallback(async (trackId: number): Promise<void> => {
    try {
      setLoading(true);
      await axios.delete(`${API_BASE}/tracks/${trackId}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка удаления трека');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearTrackDescription = useCallback(
    async (trackId: number): Promise<void> => {
      try {
        setLoading(true);
        await axios.post(`${API_BASE}/tracks/${trackId}/clear-description`);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Ошибка очистки описания');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearTrackLyrics = useCallback(
    async (trackId: number): Promise<void> => {
      try {
        setLoading(true);
        await axios.post(`${API_BASE}/tracks/${trackId}/clear-lyrics`);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Ошибка очистки текста');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getArtists = useCallback(
    async (
      page: number = 1,
      search?: string
    ): Promise<PaginationResponse<Artist>> => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: page.toString(),
          per_page: '20',
        });
        if (search) params.append('search', search);

        const response = await axios.get(`${API_BASE}/artists?${params}`);
        return response.data;
      } catch (error) {
        console.error('Error fetching artists:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const createArtist = useCallback(
    async (artistData: FormData): Promise<ApiResponse<Artist>> => {
      try {
        setLoading(true);
        const response = await axios.post(`${API_BASE}/artists`, artistData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data;
      } catch (error) {
        console.error('Error creating artist:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateArtist = useCallback(
    async (
      id: number,
      artistData: FormData | any
    ): Promise<ApiResponse<Artist>> => {
      try {
        setLoading(true);
        const response = await axios.put(
          `${API_BASE}/artists/${id}`,
          artistData,
          {
            headers:
              artistData instanceof FormData
                ? {
                    'Content-Type': 'multipart/form-data',
                  }
                : {
                    'Content-Type': 'application/json',
                  },
          }
        );
        return response.data;
      } catch (error) {
        console.error('Error updating artist:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteArtist = useCallback(
    async (id: number): Promise<ApiResponse<void>> => {
      try {
        setLoading(true);
        const response = await axios.delete(`${API_BASE}/artists/${id}`);
        return response.data;
      } catch (error) {
        console.error('Error deleting artist:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getArtistTracks = useCallback(
    async (artistId: number): Promise<ApiResponse<any>> => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${API_BASE}/artists/${artistId}/tracks`
        );
        return response.data;
      } catch (error) {
        console.error('Error fetching artist tracks:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const searchTracksForArtist = useCallback(
    async (
      artistName: string,
      exactMatch: boolean = false,
      limit: number = 50
    ): Promise<ApiResponse<any>> => {
      try {
        setLoading(true);
        const response = await axios.post(`${API_BASE}/artists/search-tracks`, {
          artist_name: artistName,
          exact_match: exactMatch,
          limit: limit,
        });
        return response.data;
      } catch (error) {
        console.error('Error searching tracks for artist:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const assignTracksToArtist = useCallback(
    async (
      trackIds: number[],
      artistId: number
    ): Promise<ApiResponse<void>> => {
      try {
        setLoading(true);
        const response = await axios.post(`${API_BASE}/tracks/verify-batch`, {
          track_ids: trackIds,
          artist_id: artistId,
        });
        return response.data;
      } catch (error) {
        console.error('Error assigning tracks to artist:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const removeTrackFromArtist = useCallback(
    async (trackId: number, artistId: number): Promise<ApiResponse<void>> => {
      try {
        setLoading(true);
        const response = await axios.post(
          `${API_BASE}/artists/${artistId}/remove-track`,
          {
            track_id: trackId,
          }
        );
        return response.data;
      } catch (error) {
        console.error('Error removing track from artist:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getUsers = useCallback(async (page: number = 1, search?: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: '20',
        ...(search && { search }),
      });

      const response = await axios.get(`${API_BASE}/users?${params}`);
      return response.data;
    } catch (error: any) {
      setError(error.response?.data?.error || 'Ошибка загрузки пользователей');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUserInfo = useCallback(async (userId: number, userData: any) => {
    try {
      setLoading(true);
      const response = await axios.put(`${API_BASE}/users/${userId}`, userData);
      return response.data;
    } catch (error: any) {
      setError(error.response?.data?.error || 'Ошибка обновления пользователя');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteUserAvatar = useCallback(async (userId: number) => {
    try {
      setLoading(true);
      const response = await axios.delete(`${API_BASE}/users/${userId}/avatar`);
      return response.data;
    } catch (error: any) {
      setError(error.response?.data?.error || 'Ошибка удаления аватара');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserWarnings = useCallback(async (userId: number) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE}/warnings?user_id=${userId}`
      );
      return response.data;
    } catch (error: any) {
      setError(error.response?.data?.error || 'Ошибка загрузки предупреждений');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const issueWarning = useCallback(
    async (userId: number, reason: string, details?: string) => {
      try {
        setLoading(true);
        const response = await axios.post(`${API_BASE}/warnings`, {
          user_id: userId,
          reason,
          details,
        });
        return response.data;
      } catch (error: any) {
        setError(error.response?.data?.error || 'Ошибка выдачи предупреждения');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const removeWarning = useCallback(async (warningId: number) => {
    try {
      setLoading(true);
      const response = await axios.delete(`${API_BASE}/warnings/${warningId}`);
      return response.data;
    } catch (error: any) {
      setError(error.response?.data?.error || 'Ошибка снятия предупреждения');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserBans = useCallback(async (userId: number) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/bans?user_id=${userId}`);
      return response.data;
    } catch (error: any) {
      setError(error.response?.data?.error || 'Ошибка загрузки банов');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const banUser = useCallback(
    async (
      userId: number,
      reason: string,
      durationDays: number,
      details?: string
    ) => {
      try {
        setLoading(true);
        const response = await axios.post(`${API_BASE}/bans`, {
          user_id: userId,
          reason,
          duration_days: durationDays,
          details,
        });
        return response.data;
      } catch (error: any) {
        setError(
          error.response?.data?.error || 'Ошибка блокировки пользователя'
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const unbanUser = useCallback(async (banId: number) => {
    try {
      setLoading(true);
      const response = await axios.delete(`${API_BASE}/bans/${banId}`);
      return response.data;
    } catch (error: any) {
      setError(
        error.response?.data?.error || 'Ошибка разблокировки пользователя'
      );
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Функции для привязки артистов к пользователям
  const bindArtistToUser = useCallback(
    async (userId: number, artistId: number) => {
      try {
        setLoading(true);
        const response = await axios.post(
          '/api/artist-management/moderator/bind-artist',
          {
            user_id: userId,
            artist_id: artistId,
          }
        );
        return response.data;
      } catch (error: any) {
        setError(
          error.response?.data?.error ||
            'Ошибка привязки артиста к пользователю'
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const unbindArtistFromUser = useCallback(
    async (userId: number, artistId: number) => {
      try {
        setLoading(true);
        const response = await axios.post(
          '/api/artist-management/moderator/unbind-artist',
          {
            user_id: userId,
            artist_id: artistId,
          }
        );
        return response.data;
      } catch (error: any) {
        setError(
          error.response?.data?.error ||
            'Ошибка отвязки артиста от пользователя'
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getUnboundArtists = useCallback(
    async (page: number = 1, perPage: number = 20) => {
      try {
        setLoading(true);
        const response = await axios.get(
          `/api/artist-management/moderator/list-unbound-artists?page=${page}&per_page=${perPage}`
        );
        return response.data;
      } catch (error: any) {
        setError(
          error.response?.data?.error ||
            'Ошибка загрузки непривязанных артистов'
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getBoundArtists = useCallback(
    async (page: number = 1, perPage: number = 20) => {
      try {
        setLoading(true);
        const response = await axios.get(
          `/api/artist-management/moderator/list-bound-artists?page=${page}&per_page=${perPage}`
        );
        return response.data;
      } catch (error: any) {
        setError(
          error.response?.data?.error || 'Ошибка загрузки привязанных артистов'
        );
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    clearError: () => setError(null),

    verifyUser,
    searchUsers,

    getAllAchievements,
    getUserAchievements,
    giveAchievement,
    getBadgeTypes,

    getUserSubscriptions,
    giveSubscription,
    deleteSubscription,
    getSubscriptionTypes,

    assignModerator,
    getModerators,

    getRedemptionKeys,
    generateKeys,

    getBugReports,
    updateBugReportStatus,
    deleteBugReport,

    getPostById,
    deletePost,

    getCommentsByPostId,
    deleteComment,

    getBadges,
    getBadgeById,
    updateBadge,
    deleteBadge,

    getTracks,
    deleteTrack,
    clearTrackDescription,
    clearTrackLyrics,

    getArtists,
    createArtist,
    updateArtist,
    deleteArtist,

    getArtistTracks,
    searchTracksForArtist,
    assignTracksToArtist,
    removeTrackFromArtist,

    getUsers,
    updateUserInfo,
    deleteUserAvatar,
    getUserWarnings,
    issueWarning,
    removeWarning,
    getUserBans,
    banUser,
    unbanUser,

    // Функции для привязки артистов к пользователям
    bindArtistToUser,
    unbindArtistFromUser,
    getUnboundArtists,
    getBoundArtists,
  };
};
