import { useState, useCallback, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../../../context/AuthContext';

interface ProfileData {
  avatar?: string;
  banner?: string;
  username?: string;
  bio?: string;
  name?: string;
  about?: string;
  status_text?: string;
  status_color?: string;
  socials?: Array<{
    name: string;
    link: string;
  }>;
  user?: {
    status_text?: string;
    status_color?: string;
    main_account_id?: string;
  };
  main_account_subscription?: {
    type?: string;
    active?: boolean;
  };
}

interface UseProfileReturn {
  profileData: ProfileData | null;
  loading: boolean;
  error: string | null;
  updateAvatar: (file: File) => Promise<void>;
  updateBanner: (file: File) => Promise<void>;
  deleteAvatar: () => Promise<void>;
  deleteBanner: () => Promise<void>;
  updateProfile: (data: Partial<ProfileData>) => Promise<void>;
  fetchProfile: (username?: string) => Promise<void>;
}

export const useProfile = (): UseProfileReturn => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useContext<any>(AuthContext);

  console.log('useProfile - AuthContext user:', user);

  const fetchProfile = useCallback(async (username?: string) => {
    console.log('fetchProfile called with username:', username, 'user?.username:', user?.username);
    setLoading(true);
    setError(null);
    try {
      const uname = username || user?.username;
      console.log('fetchProfile - uname:', uname);
      if (!uname) throw new Error('No username provided');
      const response = await axios.get(`/api/profile/${uname}`);
      console.log('API response for profile:', response.data);
      console.log('Socials in API response:', response.data.socials);
      
      if (response.data) {
        setProfileData({
          avatar: response.data.user?.avatar_url,
          banner: response.data.user?.banner_url,
          username: response.data.user?.username,
          name: response.data.user?.name,
          about: response.data.user?.about,
          status_text: response.data.status_text,
          status_color: response.data.status_color,
          socials: response.data.socials,
          user: response.data.user,
          main_account_subscription: response.data.main_account_subscription,
        });
      }
    } catch (err) {
      console.error('fetchProfile error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [user?.username]); // Зависим только от username, а не от всего объекта user

  const updateAvatar = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await axios.post('/api/profile/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setProfileData(prev => prev ? { ...prev, avatar: response.data.avatar_url } : { avatar: response.data.avatar_url });
      } else {
        throw new Error(response.data.error || 'Failed to update avatar');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update avatar');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBanner = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('banner', file);

      const response = await axios.post('/api/profile/upload-banner', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setProfileData(prev => prev ? { ...prev, banner: response.data.banner_url } : { banner: response.data.banner_url });
      } else {
        throw new Error(response.data.error || 'Failed to update banner');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update banner');
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteAvatar = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('/api/profile/delete-avatar');
      if (response.data.success) {
        setProfileData(prev => prev ? { ...prev, avatar: undefined } : null);
      } else {
        throw new Error(response.data.error || 'Failed to delete avatar');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete avatar');
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteBanner = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('/api/profile/delete-banner');
      if (response.data.success) {
        setProfileData(prev => prev ? { ...prev, banner: undefined } : null);
      } else {
        throw new Error(response.data.error || 'Failed to delete banner');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete banner');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data: Partial<ProfileData>) => {
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && typeof value === 'string') {
          formData.append(key, value);
        }
      });

      const response = await axios.post('/api/profile/update', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setProfileData(prev => prev ? { ...prev, ...data } : data);
      } else {
        throw new Error(response.data.error || 'Failed to update profile');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    profileData,
    loading,
    error,
    updateAvatar,
    updateBanner,
    deleteAvatar,
    deleteBanner,
    updateProfile,
    fetchProfile,
  };
}; 