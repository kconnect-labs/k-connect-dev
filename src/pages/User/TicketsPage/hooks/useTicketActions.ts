import { useState, useCallback } from 'react';

export const useTicketActions = () => {
  const [loading, setLoading] = useState(false);

  const makeRequest = useCallback(
    async (url: string, method: string = 'GET', data?: any) => {
      try {
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: data ? JSON.stringify(data) : undefined,
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Произошла ошибка');
        }

        return result;
      } catch (err) {
        throw new Error(
          err instanceof Error ? err.message : 'Произошла ошибка'
        );
      }
    },
    []
  );

  const addComment = useCallback(
    async (ticketId: number, content: string) => {
      setLoading(true);

      try {
        const result = await makeRequest(
          `/api/user/tickets/${ticketId}/comments`,
          'POST',
          {
            content,
          }
        );

        if (result.success) {
          return result.comment;
        } else {
          throw new Error(result.error || 'Не удалось добавить комментарий');
        }
      } catch (err) {
        throw new Error(
          err instanceof Error
            ? err.message
            : 'Произошла ошибка при добавлении комментария'
        );
      } finally {
        setLoading(false);
      }
    },
    [makeRequest]
  );

  const createTicket = useCallback(
    async (ticketData: {
      title: string;
      description: string;
      category?: string;
      priority?: string;
      target_type?: string;
      target_id?: number;
    }) => {
      setLoading(true);

      try {
        const result = await makeRequest(
          '/api/user/tickets',
          'POST',
          ticketData
        );

        if (result.success) {
          return result.ticket;
        } else {
          throw new Error(result.error || 'Не удалось создать тикет');
        }
      } catch (err) {
        throw new Error(
          err instanceof Error
            ? err.message
            : 'Произошла ошибка при создании тикета'
        );
      } finally {
        setLoading(false);
      }
    },
    [makeRequest]
  );

  return {
    loading,
    addComment,
    createTicket,
  };
};
