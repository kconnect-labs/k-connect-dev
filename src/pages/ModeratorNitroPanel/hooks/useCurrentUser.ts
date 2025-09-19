import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

interface ModeratorData {
  user: {
    id: number;
    name: string;
    username: string;
    role: string;
  };
  is_moderator: boolean;
  permissions: any;
  moderator_level?: number;
  assigned_info?: any;
}

export const useCurrentUser = () => {
  const [moderatorData, setModeratorData] = useState<ModeratorData | null>(
    null
  );
  const [permissions, setPermissions] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastModeratorCheck, setLastModeratorCheck] = useState(0);

  const checkModeratorStatus = useCallback(async () => {
    try {
      if (window._moderatorCheckInProgress) {
        await new Promise<void>(resolve => {
          const checkInterval = setInterval(() => {
            if (!window._moderatorCheckInProgress) {
              clearInterval(checkInterval);
              resolve();
            }
          }, 100);
        });
        return;
      }

      const now = Date.now();
      if (now - lastModeratorCheck < 15 * 60 * 1000 && moderatorData) {
        return;
      }

      window._moderatorCheckInProgress = true;
      const quickCheckResponse = await axios.get('/api/moderator/quick-status');

      if (!quickCheckResponse.data.is_moderator) {
        setLoading(false);
        setError('У вас нет прав модератора');
        window._moderatorCheckInProgress = false;
        return;
      }

      setLoading(true);
      const response = await axios.get('/api/moderator/status');

      if (response.data.is_moderator) {
        console.log('Moderator data received:', response.data);
        console.log('Full API response:', response);
        setModeratorData(response.data);
        setPermissions(response.data.permissions);
        setLastModeratorCheck(now);
        setError(null);
      } else {
        setError('У вас нет прав модератора');
      }
    } catch (err) {
      console.error('Error checking moderator status:', err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Не удалось проверить права модератора';
      setError(errorMessage);
    } finally {
      setLoading(false);
      window._moderatorCheckInProgress = false;
    }
  }, [lastModeratorCheck, moderatorData]);

  useEffect(() => {
    checkModeratorStatus();
  }, [checkModeratorStatus]);

  const hasAdminAccess = useCallback(
    (requiredAdminId: number = 3) => {
      return moderatorData?.user?.id === requiredAdminId;
    },
    [moderatorData]
  );

  const hasModeratorAccess = useCallback(() => {
    return moderatorData?.is_moderator || false;
  }, [moderatorData]);

  return {
    currentUser: moderatorData?.user || null,
    moderatorData,
    permissions,
    loading,
    error,
    isAdmin: moderatorData?.user?.id === 3,
    isModerator: hasModeratorAccess(),
    hasAdminAccess,
    refetch: checkModeratorStatus,
  };
};
