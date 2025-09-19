import { useState, useCallback } from 'react';

interface Comment {
  id: number;
  content: string;
  is_internal: boolean;
  created_at: string;
  updated_at: string;
  moderator: {
    id: number;
    name: string;
    username: string;
    avatar: string;
  };
}

export const useTicketComments = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);

  const makeRequest = useCallback(
    async (url: string, method: string, data?: any) => {
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
        console.error('Ошибка работы с комментариями:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchComments = useCallback(async (ticketId: number) => {
    try {
      const response = await fetch(`/api/moderator/tickets/${ticketId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.ticket) {
        setComments(data.ticket.comments || []);
      }
    } catch (error) {
      console.error('Ошибка загрузки комментариев:', error);
      setComments([]);
    }
  }, []);

  const addComment = useCallback(
    async (
      ticketId: number,
      data: { content: string; is_internal?: boolean }
    ) => {
      const result = await makeRequest(
        `/api/moderator/tickets/${ticketId}/comments`,
        'POST',
        data
      );

      if (result.success && result.comment) {
        setComments(prev => [...prev, result.comment]);
      }

      return result;
    },
    [makeRequest]
  );

  const updateComment = useCallback(
    async (ticketId: number, commentId: number, data: { content: string }) => {
      const result = await makeRequest(
        `/api/moderator/tickets/${ticketId}/comments/${commentId}`,
        'PUT',
        data
      );

      if (result.success) {
        setComments(prev =>
          prev.map(comment =>
            comment.id === commentId
              ? {
                  ...comment,
                  content: data.content,
                  updated_at: new Date().toISOString(),
                }
              : comment
          )
        );
      }

      return result;
    },
    [makeRequest]
  );

  const deleteComment = useCallback(
    async (ticketId: number, commentId: number) => {
      const result = await makeRequest(
        `/api/moderator/tickets/${ticketId}/comments/${commentId}`,
        'DELETE'
      );

      if (result.success) {
        setComments(prev => prev.filter(comment => comment.id !== commentId));
      }

      return result;
    },
    [makeRequest]
  );

  return {
    comments,
    loading,
    fetchComments,
    addComment,
    updateComment,
    deleteComment,
  };
};
