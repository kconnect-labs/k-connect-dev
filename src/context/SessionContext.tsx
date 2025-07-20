import React, { useState, useEffect, useRef } from 'react';

// Типы для контекста сессии
interface SessionContextType {
  sessionActive: boolean;
  sessionExpired: boolean;
  lastFetchTime: number | null;
  broadcastUpdate: (type: string, data: any) => void;
  checkSessionStatus: () => boolean;
  refreshSession: () => void;
}

export const SessionContext = React.createContext<SessionContextType>({
  sessionActive: true,
  sessionExpired: false,
  lastFetchTime: null,
  broadcastUpdate: () => {},
  checkSessionStatus: () => true,
  refreshSession: () => {}
});

interface SessionProviderProps {
  children: React.ReactNode;
}

export const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
  const [sessionActive, setSessionActive] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  const sessionStartTime = useRef(Date.now());
  const lastFetchTime = useRef<number | null>(null);
  const broadcastChannel = useRef<BroadcastChannel | null>(null);
  const SESSION_TIMEOUT = 60 * 60 * 1000;
  const MIN_UPDATE_INTERVAL = 15000;

  useEffect(() => {
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        broadcastChannel.current = new BroadcastChannel('k_connect_app_channel');
        
        broadcastChannel.current.onmessage = (event) => {
          const { type, data, timestamp } = event.data;
          
          if (type === 'session_refresh') {
            sessionStartTime.current = timestamp;
            setSessionActive(true);
            setSessionExpired(false);
          } else if (type === 'last_fetch_update' && timestamp > (lastFetchTime.current || 0)) {
            lastFetchTime.current = timestamp;
          }
        };
      } catch (error) {
        console.error('BroadcastChannel initialization error:', error);
      }
    }    
    return () => {
      if (broadcastChannel.current) {
        try {
          broadcastChannel.current.close();
        } catch (error) {
          console.error('Error closing BroadcastChannel:', error);
        }
      }
    };
  }, []);

  useEffect(() => {
    const checkSessionExpiration = () => {
      const currentTime = Date.now();
      const sessionDuration = currentTime - sessionStartTime.current;
      
      if (sessionDuration >= SESSION_TIMEOUT && !sessionExpired) {
        setSessionExpired(true);
        setSessionActive(false);
      }
    };    
    const expirationInterval = setInterval(checkSessionExpiration, 60000);    
    return () => clearInterval(expirationInterval);
  }, [sessionExpired]);

  const broadcastUpdate = (type: string, data: any) => {
    if (broadcastChannel.current) {
      try {
        const message = {
          type,
          data,
          timestamp: Date.now()
        };
        broadcastChannel.current.postMessage(message);
      } catch (error) {
        console.error('Error broadcasting update:', error);
      }
    }
  };

  const checkSessionStatus = () => {
    const currentTime = Date.now();
    const sessionDuration = currentTime - sessionStartTime.current;
    return sessionDuration < SESSION_TIMEOUT;
  };

  const refreshSession = () => {
    const currentTime = Date.now();
    
    if (currentTime - (lastFetchTime.current || 0) >= MIN_UPDATE_INTERVAL) {
      sessionStartTime.current = currentTime;
      lastFetchTime.current = currentTime;
      setSessionActive(true);
      setSessionExpired(false);
      
      broadcastUpdate('session_refresh', { timestamp: currentTime });
    }
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && sessionExpired) {
        refreshSession();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [sessionExpired]);

  const contextValue: SessionContextType = {
    sessionActive,
    sessionExpired,
    lastFetchTime: lastFetchTime.current,
    broadcastUpdate,
    checkSessionStatus,
    refreshSession
  };

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  );
}; 