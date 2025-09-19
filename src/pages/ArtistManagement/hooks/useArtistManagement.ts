import { useState } from 'react';
import axios from 'axios';

export interface ArtistManagementResponse {
  success: boolean;
  artists?: any[];
  tracks?: any[];
  error?: string;
}

export const useArtistManagement = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getMyArtists = async (): Promise<ArtistManagementResponse> => {
    try {
      console.log('🔄 Загружаем артистов...');
      setLoading(true);
      setError(null);
      
      const response = await axios.get('/api/artist-management/my-artists');
      console.log('✅ Ответ от API:', response.data);
      return response.data;
    } catch (err: any) {
      console.error('❌ Ошибка загрузки артистов:', err);
      const errorMessage = err.response?.data?.error || 'Ошибка загрузки артистов';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updateArtist = async (artistId: number, data: any): Promise<ArtistManagementResponse> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.put(`/api/artist-management/artists/${artistId}`, data);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Ошибка обновления артиста';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatar = async (artistId: number, file: File): Promise<ArtistManagementResponse> => {
    try {
      setLoading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await axios.post(`/api/artist-management/artists/${artistId}/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Ошибка загрузки аватара';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const getArtistTracks = async (artistId: number): Promise<ArtistManagementResponse> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`/api/artist-management/artists/${artistId}/tracks`);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Ошибка загрузки треков';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const assignTrack = async (artistId: number, trackId: number): Promise<ArtistManagementResponse> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(`/api/artist-management/artists/${artistId}/assign-track`, {
        track_id: trackId
      });
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Ошибка привязки трека';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const unassignTrack = async (artistId: number, trackId: number): Promise<ArtistManagementResponse> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(`/api/artist-management/artists/${artistId}/unassign-track`, {
        track_id: trackId
      });
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Ошибка отвязки трека';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const deleteArtist = async (artistId: number): Promise<ArtistManagementResponse> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.delete(`/api/artist-management/artists/${artistId}`);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Ошибка удаления артиста';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getMyArtists,
    updateArtist,
    uploadAvatar,
    getArtistTracks,
    assignTrack,
    unassignTrack,
    deleteArtist,
  };
};
