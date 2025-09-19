import axios from 'axios';

const AuthService = {
  login: async credentials => {
    try {
      const { usernameOrEmail, password } = credentials;
      const response = await axios.post(
        '/api/auth/login',
        {
          username: usernameOrEmail,
          password,
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data && response.data.ban_info) {
        return {
          success: false,
          error: response.data.error || 'Аккаунт заблокирован',
          ban_info: response.data.ban_info,
        };
      }

      if (response.data && response.data.success) {
        // Система работает на куки, token не нужен
        // if (response.data.token) {
        //   localStorage.setItem('token', response.data.token);
        // }

        return {
          success: true,
          user: response.data.user || null,
          // token: response.data.token || null,
        };
      } else {
        return {
          success: false,
          error: response.data.error || 'Неизвестная ошибка при входе',
        };
      }
    } catch (error) {
      if (error.response?.data?.ban_info) {
        return {
          success: false,
          error: error.response.data.error || 'Аккаунт заблокирован',
          ban_info: error.response.data.ban_info,
        };
      }

      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Ошибка при входе в систему',
      };
    }
  },

  googleLogin: async (googleToken) => {
    try {
      const response = await axios.post(
        '/api/auth/google',
        {
          token: googleToken,
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data && response.data.ban_info) {
        return {
          success: false,
          error: response.data.error || 'Аккаунт заблокирован',
          ban_info: response.data.ban_info,
        };
      }

      if (response.data && response.data.success) {
        // Система работает на куки, token не нужен
        // if (response.data.token) {
        //   localStorage.setItem('token', response.data.token);
        // }

        return {
          success: true,
          user: response.data.user || null,
          // token: response.data.token || null,
          needs_profile_setup: response.data.needs_profile_setup || false,
        };
      } else {
        return {
          success: false,
          error: response.data.error || 'Неизвестная ошибка при входе через Google',
        };
      }
    } catch (error) {
      if (error.response?.data?.ban_info) {
        return {
          success: false,
          error: error.response.data.error || 'Аккаунт заблокирован',
          ban_info: error.response.data.ban_info,
        };
      }

      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Ошибка при входе через Google',
      };
    }
  },

  register: async (username, email, password) => {
    try {
      const userData = {
        username: username,
        email: email,
        password: password,
      };

      console.log('Отправляемые данные для регистрации:', {
        ...userData,
        password: '[HIDDEN]',
      });

      const response = await axios.post('/api/auth/register', userData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Ошибка при регистрации:', error);
      if (error.response) {
        console.error('Данные ответа:', error.response.data);
        console.error('Статус ответа:', error.response.status);
        console.error('Заголовки ответа:', error.response.headers);
      }
      throw error;
    }
  },

  checkAuth: async () => {
    try {
      try {
        const response = await axios.get('/api/auth/check', {
          withCredentials: true,
          headers: {
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
          },
        });

        // Проверяем наличие временной сессии
        if (
          response.data &&
          response.data.sessionExists &&
          !response.data.user
        ) {
          response.data.hasSession = true;
          response.data.isAuthenticated = false;
        }

        // Проверяем случай needsProfileSetup
        if (
          response.data &&
          response.data.needsProfileSetup &&
          response.data.sessionExists
        ) {
          response.data.hasSession = true;
          response.data.isAuthenticated = false;
        }

        window._lastAuthCheckResponse = response;
        return response;
      } catch (error) {
        if (error.response && error.response.status === 404) {
          const fallbackResponse = await axios.get('/api/check-auth', {
            withCredentials: true,
            headers: {
              'Cache-Control': 'no-cache',
              Pragma: 'no-cache',
            },
          });

          // Проверяем наличие временной сессии
          if (
            fallbackResponse.data &&
            fallbackResponse.data.sessionExists &&
            !fallbackResponse.data.user
          ) {
            fallbackResponse.data.hasSession = true;
            fallbackResponse.data.isAuthenticated = false;
          }

          // Проверяем случай needsProfileSetup
          if (
            fallbackResponse.data &&
            fallbackResponse.data.needsProfileSetup &&
            fallbackResponse.data.sessionExists
          ) {
            fallbackResponse.data.hasSession = true;
            fallbackResponse.data.isAuthenticated = false;
          }

          window._lastAuthCheckResponse = fallbackResponse;
          return fallbackResponse;
        }
        throw error;
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      const errorResponse = {
        data: {
          isAuthenticated: false,
          user: null,
          hasSession: false,
          error: error.response?.data?.error || error.message,
        },
      };
      window._lastAuthCheckResponse = errorResponse;
      return errorResponse;
    }
  },

  logout: async () => {
    try {
      const response = await axios.post(
        '/api/auth/logout',
        {},
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      // localStorage.removeItem('token'); // Система работает на куки

      return response.data;
    } catch (error) {
      // localStorage.removeItem('token'); // Система работает на куки

      throw error;
    }
  },

  registerProfile: async profileData => {
    try {
      const response = await axios.post(
        '/api/auth/register-profile',
        profileData,
        {
          withCredentials: true,
          headers: {
            'Content-Type':
              profileData instanceof FormData
                ? 'multipart/form-data'
                : 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Ошибка при регистрации профиля:', error);
      if (error.response) {
        console.error('Данные ответа:', error.response.data);
      }
      throw error;
    }
  },
};

export default AuthService;
