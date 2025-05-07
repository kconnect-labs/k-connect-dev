import { useState, useCallback, useContext } from 'react';
import axios from 'axios';
import { SessionContext } from '../App';

/**
 * Custom hook for making API requests with session tracking
 * @param {Function} apiFunction - The API function to call 
 */
const useApi = (apiFunction) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { sessionActive, checkSessionStatus } = useContext(SessionContext);

  const execute = useCallback(async (...args) => {
    // Remove session checks and directly make the API call
    // Server-side login_required will handle authentication
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiFunction(...args);
      setData(result);
      setLoading(false);
      return result;
    } catch (error) {
      setError(error);
      setLoading(false);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Произошла ошибка при запросе'
      };
    }
  }, [apiFunction]);

  return { execute, data, loading, error };
};

/**
 * Custom hook for making direct API requests with session tracking
 */
export const useDirectApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { sessionActive, checkSessionStatus } = useContext(SessionContext);

  const fetchData = useCallback(async (url, options = {}) => {
    // Don't execute if session is expired or if another tab just fetched
    if (!sessionActive || !checkSessionStatus()) {
      setError({ message: 'Сессия устарела. Пожалуйста, обновите страницу.' });
      return { success: false, message: 'Session expired' };
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios(url, options);
      setLoading(false);
      return response.data;
    } catch (error) {
      setError(error);
      setLoading(false);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Произошла ошибка при запросе'
      };
    }
  }, [sessionActive, checkSessionStatus]);

  return { fetchData, loading, error };
};

export default useApi; 