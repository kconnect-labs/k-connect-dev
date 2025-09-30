import React from 'react';
import ReactDOM from 'react-dom';
// Заменяем статический импорт на динамический для избежания конфликта
const PostDetailPage = React.lazy(() => import('../../pages/Main/PostDetailPage'));
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
    <React.Suspense fallback={<div>Загрузка...</div>}>
      <PostDetailPage isOverlay={true} overlayPostId={currentPostId} disablePadding={true} />
    </React.Suspense>,
    getOverlayRoot()
  );
};

export default PostDetailOverlay; 