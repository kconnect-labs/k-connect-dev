import React, { createContext, useState, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PostDetailContext = createContext();

export const PostDetailProvider = ({ children }) => {
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [currentPostId, setCurrentPostId] = useState(null);
  const [backgroundLocation, setBackgroundLocation] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // URL watcher removed; overlay controlled explicitly via openPostDetail/closePostDetail

  const openPostDetail = (postId, event) => {
    if (
      event &&
      (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)
    ) {
      return true;
    }

    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    setCurrentPostId(postId);
    setOverlayOpen(true);
    return false;
  };

  const closePostDetail = () => {
    setOverlayOpen(false);

    setCurrentPostId(null);
  };

  return (
    <PostDetailContext.Provider
      value={{
        overlayOpen,
        currentPostId,
        backgroundLocation,
        openPostDetail,
        closePostDetail,
      }}
    >
      {children}
    </PostDetailContext.Provider>
  );
};

export const usePostDetail = () => useContext(PostDetailContext);

export default PostDetailContext;
