import React from 'react';
import ReactDOM from 'react-dom';
import PostDetailPage from '../../pages/Main/PostDetailPage';
import { usePostDetail } from '../../context/PostDetailContext';

const getOverlayRoot = () => {
  let root = document.getElementById('overlay-root');
  if (!root) {
    root = document.createElement('div');
    root.id = 'overlay-root';
    document.body.appendChild(root);
  }
  return root;
};

const PostDetailOverlay: React.FC = () => {
  const { overlayOpen, currentPostId } = usePostDetail();

  if (!overlayOpen) return null;

  return ReactDOM.createPortal(
    <PostDetailPage isOverlay={true} overlayPostId={currentPostId} />,
    getOverlayRoot()
  );
};

export default PostDetailOverlay; 