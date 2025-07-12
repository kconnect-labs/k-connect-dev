import { useContext } from 'react';
import { SessionContext } from '../App';

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession Используйте SessionProvider для доступа к сессии');
  }
  return context;
}; 