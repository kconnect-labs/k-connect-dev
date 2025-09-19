import { useState, useCallback } from 'react';

interface TicketActionData {
  status?: string;
  priority?: string;
  assigned_to?: number;
}

export const useTicketActions = () => {
  const [loading, setLoading] = useState(false);

  const makeRequest = useCallback(async (url: string, method: string, data?: any) => {
    setLoading(true);
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',

        },
        credentials: 'include',
        ...(data && { body: JSON.stringify(data) }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Ошибка выполнения действия');
      }

      return result;
    } catch (error) {
      console.error('Ошибка выполнения действия:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTicket = useCallback(async (ticketId: number, data: TicketActionData) => {
    return await makeRequest(`/api/moderator/tickets/${ticketId}`, 'PUT', data);
  }, [makeRequest]);

  const assignTicket = useCallback(async (ticketId: number) => {
    return await makeRequest(`/api/moderator/tickets/${ticketId}/assign`, 'POST');
  }, [makeRequest]);

  const resolveTicket = useCallback(async (ticketId: number) => {
    return await makeRequest(`/api/moderator/tickets/${ticketId}/resolve`, 'POST');
  }, [makeRequest]);

  const closeTicket = useCallback(async (ticketId: number) => {
    return await makeRequest(`/api/moderator/tickets/${ticketId}/close`, 'POST');
  }, [makeRequest]);

  return {
    updateTicket,
    assignTicket,
    resolveTicket,
    closeTicket,
    loading,
  };
}; 