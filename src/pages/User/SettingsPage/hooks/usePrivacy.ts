import { useState, useCallback, useEffect } from 'react';

interface PrivacySettings {
  isPrivate: boolean;
}

interface UsePrivacyReturn {
  privacySettings: PrivacySettings;
  loading: boolean;
  error: string | null;
  updateProfilePrivacy: (isPrivate: boolean) => Promise<void>;
  refreshSettings: () => Promise<void>;
}

export const usePrivacy = (): UsePrivacyReturn => {
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    isPrivate: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Загружаем текущие настройки приватности при инициализации
  useEffect(() => {
    refreshSettings();
  }, []);

  const refreshSettings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Загружаем настройку приватности профиля
      const profilePrivacyResponse = await fetch('/api/user/settings/privacy');
      const profilePrivacyData = await profilePrivacyResponse.json();

      setPrivacySettings({
        isPrivate: profilePrivacyData.success ? (profilePrivacyData.is_private || false) : false,
      });
    } catch (err) {
      console.error('Failed to load privacy settings:', err);
      setError('Не удалось загрузить настройки приватности');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfilePrivacy = useCallback(async (isPrivate: boolean) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/user/settings/privacy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_private: isPrivate }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setPrivacySettings(prev => ({ ...prev, isPrivate }));
      } else {
        throw new Error(data.error || 'Не удалось обновить настройку приватности профиля');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось обновить настройку приватности профиля');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    privacySettings,
    loading,
    error,
    updateProfilePrivacy,
    refreshSettings,
  };
}; 