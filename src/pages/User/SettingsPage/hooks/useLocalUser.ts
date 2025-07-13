import { useState, useEffect } from 'react';

interface LocalUser {
  about: string;
  account_type: string;
  avatar_url: string;
  banner: string | null;
  banner_url: string | null;
  hasCredentials: boolean;
  id: number;
  main_account_id: number | null;
  name: string;
  photo: string;
  username: string;
}

export const useLocalUser = () => {
  const [localUser, setLocalUser] = useState<LocalUser | null>(null);

  useEffect(() => {
    try {
      const userData = localStorage.getItem('k-connect-user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        console.log('useLocalUser - parsed user from localStorage:', parsedUser);
        setLocalUser(parsedUser);
      }
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
    }
  }, []);

  return localUser;
}; 