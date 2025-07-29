import { useEffect, useRef } from 'react';
import { PostState } from './usePostState';
import { fetchLastLikedUsers, fetchLastComment } from '../utils/postUtils';

export const usePostEffects = (
  post: any,
  postState: PostState,
  setPostState: React.Dispatch<React.SetStateAction<PostState>>
) => {
  const contentRef = useRef<HTMLDivElement>(null);

  // Effect for checking content height
  useEffect(() => {
    const checkHeight = () => {
      if (contentRef.current) {
        const contentHeight = contentRef.current.scrollHeight;
        setPostState(prev => ({ ...prev, needsExpandButton: contentHeight > 450 }));
      }
    };

    const timeoutId = setTimeout(() => {
      checkHeight();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [post?.content, setPostState]);

  // Effect for fetching last liked users
  useEffect(() => {
    if (post?.id && postState.likesCount > 0) {
      fetchLastLikedUsers(post.id).then(users => {
        setPostState(prev => ({ ...prev, lastLikedUsers: users }));
      });
    }
  }, [post?.id, postState.likesCount, setPostState]);

  // Effect for fetching last comment
  useEffect(() => {
    if (post?.id && post.comments_count > 0) {
      setPostState(prev => ({ ...prev, lastCommentLoading: true }));
      fetchLastComment(post.id).then(comment => {
        setPostState(prev => ({ 
          ...prev, 
          lastComment: comment,
          lastCommentLoading: false 
        }));
      }).catch(() => {
        setPostState(prev => ({ 
          ...prev, 
          lastComment: null,
          lastCommentLoading: false 
        }));
      });
    }
  }, [post?.id, post?.comments_count, setPostState]);

  return {
    contentRef,
  };
}; 