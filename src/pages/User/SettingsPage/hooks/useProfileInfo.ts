import { useState, useCallback, useEffect } from 'react';

interface ProfileInfo {
  name: string;
  username: string;
  about: string;
}

interface UseProfileInfoReturn {
  profileInfo: ProfileInfo;
  loading: boolean;
  error: string | null;
  updateName: (name: string) => Promise<void>;
  updateUsername: (username: string) => Promise<void>;
  updateAbout: (about: string) => Promise<void>;
  updateProfileInfo: (info: Partial<ProfileInfo>) => Promise<void>;
  setProfileInfo: (info: ProfileInfo) => void;
}

export const useProfileInfo = (
  initialInfo?: ProfileInfo
): UseProfileInfoReturn => {
  const [profileInfo, setProfileInfo] = useState<ProfileInfo>(
    initialInfo || {
      name: '',
      username: '',
      about: '',
    }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Загружаем текущие данные профиля при инициализации
  useEffect(() => {
    const loadProfileInfo = async () => {
      try {
        // Получаем текущего пользователя из контекста или localStorage
        const currentUser = JSON.parse(
          localStorage.getItem('currentUser') || '{}'
        );
        const username = currentUser.username;

        if (!username) {
          console.error('No username available for profile info');
          return;
        }

        const response = await fetch(`/api/profile/${username}`);
        const data = await response.json();

        if (response.ok && data.user) {
          setProfileInfo({
            name: data.user.name || '',
            username: data.user.username || '',
            about: data.user.about || '',
          });
        }
      } catch (err) {
        console.error('Failed to load profile info:', err);
      }
    };

    loadProfileInfo();
  }, []);

  const updateName = useCallback(async (name: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/profile/update-name', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setProfileInfo(prev => ({ ...prev, name }));
      } else {
        throw new Error(data.error || 'Не удалось обновить имя');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось обновить имя');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUsername = useCallback(async (username: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/profile/update-username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setProfileInfo(prev => ({ ...prev, username }));
      } else {
        throw new Error(data.error || 'Не удалось обновить имя пользователя');
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Не удалось обновить имя пользователя'
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAbout = useCallback(async (about: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/profile/update-about', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          about: about || '', // Отправляем пустую строку если about пустой
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setProfileInfo(prev => ({ ...prev, about: about || '' }));
      } else {
        throw new Error(data.error || 'Не удалось обновить описание');
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Не удалось обновить описание'
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfileInfo = useCallback(async (info: Partial<ProfileInfo>) => {
    setLoading(true);
    setError(null);

    try {
      // Обновляем каждое поле отдельно, используя соответствующие эндпоинты
      const updatePromises = [];

      if (info.name !== undefined) {
        updatePromises.push(
          fetch('/api/profile/update-name', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: info.name }),
          })
        );
      }

      if (info.username !== undefined) {
        updatePromises.push(
          fetch('/api/profile/update-username', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: info.username }),
          })
        );
      }

      if (info.about !== undefined) {
        updatePromises.push(
          fetch('/api/profile/update-about', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ about: info.about || '' }),
          })
        );
      }

      // Выполняем все запросы параллельно
      const responses = await Promise.all(updatePromises);
      const results = await Promise.all(responses.map(r => r.json()));

      // Проверяем, что все запросы прошли успешно
      const allSuccessful = results.every(result => result.success);

      if (allSuccessful) {
        setProfileInfo(prev => ({ ...prev, ...info }));
      } else {
        const errorMessages = results
          .filter(result => !result.success)
          .map(result => result.error)
          .join(', ');
        throw new Error(
          errorMessages || 'Не удалось обновить информацию профиля'
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Не удалось обновить информацию профиля'
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    profileInfo,
    loading,
    error,
    updateName,
    updateUsername,
    updateAbout,
    updateProfileInfo,
    setProfileInfo,
  };
};
