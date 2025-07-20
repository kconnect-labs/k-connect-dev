import axios from './axiosConfig';
import AuthService from './AuthService';

interface PostData {
  content?: string;
  images?: File[];
  image?: File;
  video?: File;
  music?: any[];
  deleteImages?: boolean;
  deleteVideo?: boolean;
  deleteMusic?: boolean;
}

interface ApiResponse {
  success: boolean;
  error?: string;
  data?: any;
  post?: any;
}

interface FeedParams {
  page?: number;
  limit?: number;
}

const PostService = {
  getFeed: async (page: number = 1, limit: number = 10): Promise<ApiResponse> => {
    try {
      const response = await axios.get(`/api/posts/feed?page=${page}&limit=${limit}`, {
        forceRefresh: true
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching feed:', error);
      return { success: false, error: error.response?.data?.error || 'Не удалось загрузить ленту постов' };
    }
  },

  getPost: async (postId: string): Promise<ApiResponse> => {
    try {
      const response = await axios.get(`/api/posts/${postId}`, {
        forceRefresh: true
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching post:', error);
      return { success: false, error: error.response?.data?.error || 'Не удалось загрузить пост' };
    }
  },

  createPost: async (postData: PostData | FormData): Promise<ApiResponse> => {
    try {
      const formData = postData instanceof FormData 
        ? postData 
        : new FormData();
      
      if (!(postData instanceof FormData) && typeof postData === 'object') {
        if (postData.content) {
          formData.append('content', postData.content);
        }
        
        if (Array.isArray(postData.images)) {
          postData.images.forEach((image, index) => {
            formData.append(`images[${index}]`, image);
          });
        }
        
        if (postData.image && postData.image instanceof File) {
          formData.append('image', postData.image);
        }
        
        if (postData.video && postData.video instanceof File) {
          formData.append('video', postData.video);
        }
        
        if (postData.music && Array.isArray(postData.music) && postData.music.length > 0) {
          formData.append('music', JSON.stringify(postData.music));
        }
      }
      
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          // File handling logic
        } else {
          // Non-file handling logic
        }
      }
      
      try {
        const response = await axios.post('/api/posts/create', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          _invalidatesCache: true
        });
        
        return response.data;
      } catch (postError) {
        console.error('POST method failed:', postError);
        throw postError; // Просто пробрасываем ошибку вместо попытки несуществующих эндпоинтов
      }
    } catch (error) {
      console.error('All post creation methods failed:', error);
      throw error;
    }
  },

  likePost: async (postId: string): Promise<ApiResponse> => {
    try {
      const response = await axios.post(`/api/posts/${postId}/like`);
      
      // Clear cache for this specific post
      (axios as any).cache?.clearByUrlPrefix(`/api/posts/${postId}`);
      
      return response.data;
    } catch (error: any) {
      console.error('Error liking post:', error);
      return { success: false, error: error.response?.data?.error || 'Не удалось поставить лайк' };
    }
  },

  deletePost: async (postId: string): Promise<ApiResponse> => {
    try {
      const response = await axios.delete(`/api/posts/${postId}`, {
        params: {
          cascade: true,
          full_delete: true
        }
      });

      // Clear posts cache
      (axios as any).cache?.clearPostsCache();
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('post-deleted', {
          detail: { postId }
        }));
      }
      
      return response.data;
    } catch (error: any) {
      console.error(`Error deleting post ${postId} with DELETE method:`, error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Не удалось удалить пост. Проверьте соединение и попробуйте снова.'
      };
    }
  },

  editPost: async (postId: string, postData: PostData | FormData): Promise<ApiResponse> => {
    try {
      const formData = postData instanceof FormData 
        ? postData 
        : new FormData();
      
      if (!(postData instanceof FormData) && typeof postData === 'object') {
        if (postData.content) {
          formData.append('content', postData.content);
        }
        
        if (Array.isArray(postData.images)) {
          postData.images.forEach((image, index) => {
            formData.append(`images[${index}]`, image);
          });
        }
        
        if (postData.image && postData.image instanceof File) {
          formData.append('image', postData.image);
        }
        
        if (postData.video && postData.video instanceof File) {
          formData.append('video', postData.video);
        }
        
        if (postData.music && Array.isArray(postData.music) && postData.music.length > 0) {
          formData.append('music', JSON.stringify(postData.music));
        }
        
        if (postData.deleteImages) {
          formData.append('delete_images', 'true');
        }
        
        if (postData.deleteVideo) {
          formData.append('delete_video', 'true');
        }
        
        if (postData.deleteMusic) {
          formData.append('delete_music', 'true');
        }
      }
      
      const response = await axios.post(`/api/posts/${postId}/edit`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        _invalidatesCache: true // Mark this request as cache-invalidating
      });
      
      // Clear cache for posts and feed
      (axios as any).cache?.clearPostsCache();
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('post-updated', {
          detail: { postId, post: response.data.post }
        }));
      }
      
      return response.data;
    } catch (error) {
      console.error('Error editing post:', error);
      throw error;
    }
  },

  refreshFeed: async (): Promise<ApiResponse> => {
    try {
      // Clear posts cache
      (axios as any).cache?.clearPostsCache();
      
      const response = await axios.get('/api/posts/feed?page=1&limit=10', {
        forceRefresh: true
      });
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('feed-refreshed', {
          detail: { data: response.data }
        }));
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Error refreshing feed:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Не удалось обновить ленту'
      };
    }
  }
};

export default PostService; 