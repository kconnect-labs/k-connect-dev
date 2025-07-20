import { useState, useCallback } from 'react';

interface UseNotificationsReturn {
  showNotification: (
    severity: 'success' | 'error' | 'warning' | 'info',
    message: string
  ) => void;
  closeNotification: () => void;
  notification: {
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  };
}

export const useNotifications = (): UseNotificationsReturn => {
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success' as const,
  });

  const showNotification = useCallback(
    (severity: 'success' | 'error' | 'warning' | 'info', message: string) => {
      setNotification({
        open: true,
        message,
        severity,
      });
    },
    []
  );

  const closeNotification = useCallback(() => {
    setNotification(prev => ({
      ...prev,
      open: false,
    }));
  }, []);

  return {
    showNotification,
    closeNotification,
    notification,
  };
};
