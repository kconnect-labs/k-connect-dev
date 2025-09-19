import { useEffect, useRef } from 'react';
import { PostState } from './usePostState';

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



  // Effect for setting last comment from post data
  useEffect(() => {
    if (post?.last_comment) {
      setPostState(prev => ({ 
        ...prev, 
        lastComment: post.last_comment,
        lastCommentLoading: false 
      }));
    } else {
      setPostState(prev => ({ 
        ...prev, 
        lastComment: null,
        lastCommentLoading: false 
      }));
    }
  }, [post?.last_comment, setPostState]);

  return {
    contentRef,
  };
}; 