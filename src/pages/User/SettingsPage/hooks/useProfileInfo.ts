import { useState, useCallback } from 'react';
import axios from 'axios';

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

export const useProfileInfo = (initialInfo?: ProfileInfo): UseProfileInfoReturn => {
  const [profileInfo, setProfileInfo] = useState<ProfileInfo>(initialInfo || {
    name: '',
    username: '',
    about: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateName = useCallback(async (name: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('name', name);

      const response = await axios.post('/api/profile/update-name', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setProfileInfo(prev => ({ ...prev, name }));
      } else {
        throw new Error(response.data.error || 'Не удалось обновить имя');
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
      const formData = new FormData();
      formData.append('username', username);

      const response = await axios.post('/api/profile/update-username', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setProfileInfo(prev => ({ ...prev, username }));
      } else {
        throw new Error(response.data.error || 'Не удалось обновить имя пользователя');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось обновить имя пользователя');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAbout = useCallback(async (about: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('about', about);

      const response = await axios.post('/api/profile/update-about', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setProfileInfo(prev => ({ ...prev, about }));
      } else {
        throw new Error(response.data.error || 'Не удалось обновить описание');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось обновить описание');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfileInfo = useCallback(async (info: Partial<ProfileInfo>) => {
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      Object.entries(info).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, value);
        }
      });

      const response = await axios.post('/api/profile/update', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setProfileInfo(prev => ({ ...prev, ...info }));
      } else {
        throw new Error(response.data.error || 'Не удалось обновить информацию профиля');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось обновить информацию профиля');
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