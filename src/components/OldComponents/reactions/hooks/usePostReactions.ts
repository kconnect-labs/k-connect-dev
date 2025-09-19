import { useState, useCallback } from 'react';
import axios from 'axios';
import { ReactionEmoji, ReactionsSummary, PostReactions } from '../types';

export interface UsePostReactionsReturn {
  reactionsSummary: ReactionsSummary;
  userReaction: ReactionEmoji | null;
  isLoading: boolean;
  error: string | null;
  addReaction: (emoji: ReactionEmoji) => Promise<void>;
  removeReaction: () => Promise<void>;
  getReactions: () => Promise<PostReactions | null>;
}

export const usePostReactions = (
  postId: number,
  initialReactionsSummary: ReactionsSummary = {},
  initialUserReaction: ReactionEmoji | null = null
): UsePostReactionsReturn => {
  const [reactionsSummary, setReactionsSummary] = useState<ReactionsSummary>(initialReactionsSummary);
  const [userReaction, setUserReaction] = useState<ReactionEmoji | null>(initialUserReaction);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addReaction = useCallback(async (emoji: ReactionEmoji) => {
    if (!postId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(`/api/posts/${postId}/reaction`, { emoji });
      
      if (response.data.success) {
        setReactionsSummary(response.data.reactions_summary);
        setUserReaction(response.data.user_reaction);
      }
    } catch (err: any) {
      console.error('Error adding reaction:', err);
      setError(err.response?.data?.error || 'Ошибка при добавлении реакции');
      
      // Обработка rate limit
      if (err.response?.status === 429) {
        const rateLimit = err.response.data.rate_limit;
        let errorMessage = err.response.data.error || 'Слишком много реакций. ';

        if (rateLimit && rateLimit.reset) {
          const resetTime = new Date(rateLimit.reset * 1000);
          const now = new Date();
          const diffSeconds = Math.round((resetTime - now) / 1000);

          if (!errorMessage.includes('подождите')) {
            if (diffSeconds > 60) {
              const minutes = Math.floor(diffSeconds / 60);
              const seconds = diffSeconds % 60;
              errorMessage += ` Пожалуйста, подождите ${minutes} мин. ${seconds} сек.`;
            } else {
              errorMessage += ` Пожалуйста, подождите ${diffSeconds} сек.`;
            }
          }
        }

        window.dispatchEvent(
          new CustomEvent('rate-limit-error', {
            detail: {
              message: errorMessage,
              shortMessage: 'Лимит реакций',
              notificationType: 'warning',
              animationType: 'bounce',
              retryAfter: rateLimit?.reset
                ? Math.round((new Date(rateLimit.reset * 1000) - new Date()) / 1000)
                : 60,
            },
          })
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  const removeReaction = useCallback(async () => {
    if (!postId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.delete(`/api/posts/${postId}/reaction`);
      
      if (response.data.success) {
        setReactionsSummary(response.data.reactions_summary);
        setUserReaction(response.data.user_reaction);
      }
    } catch (err: any) {
      console.error('Error removing reaction:', err);
      setError(err.response?.data?.error || 'Ошибка при удалении реакции');
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  const getReactions = useCallback(async (): Promise<PostReactions | null> => {
    if (!postId) return null;

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(`/api/posts/${postId}/reactions`);
      
      if (response.data.success) {
        const reactions = response.data;
        setReactionsSummary(reactions.reactions_summary);
        setUserReaction(reactions.user_reaction);
        return reactions;
      }
    } catch (err: any) {
      console.error('Error getting reactions:', err);
      setError(err.response?.data?.error || 'Ошибка при получении реакций');
    } finally {
      setIsLoading(false);
    }

    return null;
  }, [postId]);

  return {
    reactionsSummary,
    userReaction,
    isLoading,
    error,
    addReaction,
    removeReaction,
    getReactions,
  };
}; 