import axios from './axiosConfig';
import AuthService from './AuthService';

const PostService = {
    getFeed: async (page = 1, limit = 10) => {
    try {
      const response = await axios.get(`/api/posts/feed?page=${page}&limit=${limit}`, {
        forceRefresh: true
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching feed:', error);
      return { success: false, error: error.response?.data?.error || 'Не удалось загрузить ленту постов' };
    }
  },

    getPost: async (postId) => {
    try {
      const response = await axios.get(`/api/posts/${postId}`, {
        forceRefresh: true
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching post:', error);
      return { success: false, error: error.response?.data?.error || 'Не удалось загрузить пост' };
    }
  },

    createPost: async (postData) => {
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

        } else {

        }
      }
      
            try {

        const response = await axios.post('/api/posts/create', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          _invalidatesCache: true
        });

        
        // axios.cache.clearPostsCache();
        
        return response.data;
      } catch (postError) {
        console.error('POST method failed:', postError);
        
                try {

          const putResponse = await axios.put('/api/posts', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            },
            _invalidatesCache: true
          });

          
          // axios.cache.clearPostsCache();
          
          return putResponse.data;
        } catch (putError) {
          console.error('PUT method failed:', putError);
          

          const finalResponse = await axios.post('/api/post/new', formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });

          

          // axios.cache.clearPostsCache();
          

          return finalResponse.data;
        }
      }
    } catch (error) {
      console.error('All post creation methods failed:', error);
      throw error;
    }
  },

    likePost: async (postId) => {
    try {
      const response = await axios.post(`/api/posts/${postId}/like`);
      

      axios.cache.clearByUrlPrefix(`/api/posts/${postId}`);
      
      return response.data;
    } catch (error) {
      console.error('Error liking post:', error);
      return { success: false, error: error.response?.data?.error || 'Не удалось поставить лайк' };
    }
  },

    deletePost: async (postId) => {
    try {

      
            const response = await axios.delete(`/api/posts/${postId}`, {
        params: {
          cascade: true,
          full_delete: true
        }
      });

      

      axios.cache.clearPostsCache();
      

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('post-deleted', {
          detail: { postId }
        }));
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error deleting post ${postId} with DELETE method:`, error);
      
            if (error.response?.status === 404 || error.response?.status === 405 || error.response?.status === 500) {
        try {

          
                    const response = await axios.post(`/api/posts/${postId}/delete`, {
            cascade: true,
            full_delete: true
          });

          

          axios.cache.clearPostsCache();
          

          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('post-deleted', {
              detail: { postId }
            }));
          }
          
          return response.data;
        } catch (fallbackError) {
          console.error(`Fallback deletion also failed for post ${postId}:`, fallbackError);
          
                    try {

            const response = await axios.post(`/api/posts/delete/${postId}`, {
              cascade: true,
              full_delete: true
            });

            

            axios.cache.clearPostsCache();
            

            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('post-deleted', {
                detail: { postId }
              }));
            }
            
            return response.data;
          } catch (secondFallbackError) {
                        try {

              const response = await axios.get(`/api/posts/delete/${postId}/cascade`);

              

              axios.cache.clearPostsCache();
              

              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('post-deleted', {
                  detail: { postId }
                }));
              }
              
              return response.data;
            } catch (finalError) {
              console.error('All deletion methods failed:', finalError);
              return { 
                success: false, 
                error: 'Не удалось удалить пост. Возможно, у вас нет прав на это действие или сервер временно недоступен.'
              };
            }
          }
        }
      }
      
      return { 
        success: false, 
        error: error.response?.data?.error || 'Не удалось удалить пост. Проверьте соединение и попробуйте снова.'
      };
    }
  },

    editPost: async (postId, postData) => {
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
      
      const response = await axios.put(`/api/posts/${postId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        _invalidatesCache: true // Mark this request as cache-invalidating
      });
      
      // Clear cache for posts and feed
      axios.cache.clearPostsCache();
      
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

  refreshFeed: async () => {
    try {

      axios.cache.clearPostsCache();
      

      const response = await axios.get('/api/posts/feed?page=1&limit=10', {
        forceRefresh: true
      });
      

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('feed-refreshed', {
          detail: { data: response.data }
        }));
      }
      
      return response.data;
    } catch (error) {
      console.error('Error refreshing feed:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Не удалось обновить ленту'
      };
    }
  }
};

export default PostService;
