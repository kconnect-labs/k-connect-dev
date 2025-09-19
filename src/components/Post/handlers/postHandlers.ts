import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { MusicContext } from '../../../context/MusicContext';
import { usePostDetail } from '../../../context/PostDetailContext';
import { useLanguage } from '../../../context/LanguageContext';
import { PostState, DialogState } from '../hooks/usePostState';
import { isPostEditable, incrementViewCount } from '../utils/postUtils';

export const usePostHandlers = (
  post: any,
  postState: PostState,
  setPostState: React.Dispatch<React.SetStateAction<PostState>>,
  dialogState: DialogState,
  setDialogState: React.Dispatch<React.SetStateAction<DialogState>>,
  onDelete?: (postId: string, updatedPost?: any, action?: string) => void
) => {
  const navigate = useNavigate();
  const { user: currentUser } = useContext(AuthContext);
  const { playTrack, currentTrack, isPlaying, togglePlay } =
    useContext(MusicContext);
  const { setPostDetail, openPostDetail } = usePostDetail();
  const { t } = useLanguage();

  const isCurrentUserPost =
    currentUser && post?.user && currentUser.id === post.user.id;

  // Like handler
  const handleLike = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const wasLiked = postState.liked;
    const prevCount = postState.likesCount;

    try {
      setPostState(prev => ({
        ...prev,
        liked: !wasLiked,
        likesCount: wasLiked ? Math.max(0, prevCount - 1) : prevCount + 1,
      }));

      const response = await axios.post(`/api/posts/${post.id}/like`);
      if (response.data) {
        setPostState(prev => ({
          ...prev,
          liked: response.data.liked,
          likesCount: response.data.likes_count,
        }));
      }
    } catch (error) {
      console.error('Error liking post:', error);
      setPostState(prev => ({
        ...prev,
        liked: wasLiked,
        likesCount: prevCount,
      }));

      if (error.response && error.response.status === 429) {
        const rateLimit = error.response.data.rate_limit;
        let errorMessage =
          error.response.data.error || 'Слишком много лайков. ';

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
              shortMessage: 'Лимит лайков',
              notificationType: 'warning',
              animationType: 'bounce',
              retryAfter: rateLimit?.reset
                ? Math.round(
                    (new Date(rateLimit.reset * 1000) - new Date()) / 1000
                  )
                : 60,
            },
          })
        );
      }
    }
  };

  // Menu handlers
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setPostState(prev => ({ ...prev, menuAnchorEl: event.currentTarget }));
  };

  const handleMenuClose = () => {
    setPostState(prev => ({ ...prev, menuAnchorEl: null }));
  };

  const handleDelete = () => {
    handleMenuClose();
    setDialogState(prev => ({
      ...prev,
      deleteDialog: { ...prev.deleteDialog, open: true },
    }));
  };

  const handleEdit = () => {
    handleMenuClose();
    if (!isPostEditable(post)) {
      setPostState(prev => ({
        ...prev,
        snackbar: {
          open: true,
          message:
            'Редактирование доступно только в течение 3 часов после публикации',
          severity: 'warning',
        },
      }));
      return;
    }

    setDialogState(prev => ({
      ...prev,
      editDialog: {
        ...prev.editDialog,
        open: true,
        content: post.content || '',
        deleteImages: false,
        deleteVideo: false,
        deleteMusic: false,
        newImages: [],
        newVideo: null,
        previews: [],
        error: null,
      },
    }));
  };

  // Edit dialog handlers
  const handleCloseEditDialog = () => {
    setDialogState(prev => ({
      ...prev,
      editDialog: {
        ...prev.editDialog,
        open: false,
        error: null,
        previews: [],
      },
    }));
  };

  const handleEditContentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDialogState(prev => ({
      ...prev,
      editDialog: {
        ...prev.editDialog,
        content: e.target.value,
      },
    }));
  };

  const handleToggleDeleteImages = () => {
    setDialogState(prev => ({
      ...prev,
      editDialog: {
        ...prev.editDialog,
        deleteImages: !prev.editDialog.deleteImages,
      },
    }));
  };

  const handleToggleDeleteVideo = () => {
    setDialogState(prev => ({
      ...prev,
      editDialog: {
        ...prev.editDialog,
        deleteVideo: !prev.editDialog.deleteVideo,
      },
    }));
  };

  const handleToggleDeleteMusic = () => {
    setDialogState(prev => ({
      ...prev,
      editDialog: {
        ...prev.editDialog,
        deleteMusic: !prev.editDialog.deleteMusic,
      },
    }));
  };

  const handleSubmitEdit = async () => {
    try {
      if (!isPostEditable(post)) {
        setDialogState(prev => ({
          ...prev,
          editDialog: {
            ...prev.editDialog,
            error:
              'Время редактирования истекло. Посты можно редактировать только в течение 3 часов после публикации.',
          },
        }));
        return;
      }

      if (
        !dialogState.editDialog.content.trim() &&
        (!dialogState.editDialog.newImages ||
          dialogState.editDialog.newImages.length === 0) &&
        (!dialogState.editDialog.newVideo ||
          dialogState.editDialog.newVideo === null)
      ) {
        setDialogState(prev => ({
          ...prev,
          editDialog: {
            ...prev.editDialog,
            error:
              'Пост не может быть пустым. Пожалуйста, добавьте текст или файлы.',
          },
        }));
        return;
      }

      setDialogState(prev => ({
        ...prev,
        editDialog: { ...prev.editDialog, submitting: true, error: null },
      }));

      const formData = new FormData();
      formData.append('content', dialogState.editDialog.content);
      formData.append(
        'delete_images',
        dialogState.editDialog.deleteImages.toString()
      );
      formData.append(
        'delete_video',
        dialogState.editDialog.deleteVideo.toString()
      );
      formData.append(
        'delete_music',
        dialogState.editDialog.deleteMusic.toString()
      );

      dialogState.editDialog.newImages.forEach((image, index) => {
        formData.append(`images[${index}]`, image);
      });

      if (dialogState.editDialog.newVideo) {
        formData.append('video', dialogState.editDialog.newVideo);
      }

      const response = await axios.post(
        `/api/posts/${post.id}/edit`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        const updatedPost = response.data.post;

        if (onDelete) {
          onDelete(post.id, updatedPost);
        } else {
          window.location.reload();
        }

        setDialogState(prev => ({
          ...prev,
          editDialog: {
            open: false,
            content: '',
            submitting: false,
            deleteImages: false,
            deleteVideo: false,
            deleteMusic: false,
            newImages: [],
            newVideo: null,
            previews: [],
            error: null,
            loading: false,
          },
        }));

        setPostState(prev => ({
          ...prev,
          snackbar: {
            open: true,
            message: 'Пост успешно обновлен',
            severity: 'success',
          },
        }));
      } else {
        throw new Error(response.data.error || 'Ошибка при обновлении поста');
      }
    } catch (error) {
      console.error('Error updating post:', error);
      setDialogState(prev => ({
        ...prev,
        editDialog: {
          ...prev.editDialog,
          submitting: false,
          error:
            error.response?.data?.error ||
            error.message ||
            'Ошибка при обновлении поста',
        },
      }));
    }
  };

  // Delete handler
  const confirmDelete = async () => {
    try {
      setDialogState(prev => ({
        ...prev,
        deleteDialog: { ...prev.deleteDialog, deleting: true },
      }));

      // Immediately remove post from UI
      if (onDelete) {
        onDelete(post.id);
      }

      // Clear cache
      if (axios.cache) {
        axios.cache.clearPostsCache();
        axios.cache.clearByUrlPrefix(`/api/profile/pinned_post`);
        axios.cache.clearByUrlPrefix(`/api/posts/${post.id}`);
      }

      // Send delete request
      await axios.delete(`/api/posts/${post.id}`);

      // Close dialog
      setDialogState(prev => ({
        ...prev,
        deleteDialog: { open: false, deleting: false, deleted: false },
      }));
    } catch (error) {
      console.error('Error deleting post:', error);
      setDialogState(prev => ({
        ...prev,
        deleteDialog: { open: false, deleting: false, deleted: false },
      }));

      setPostState(prev => ({
        ...prev,
        snackbar: {
          open: true,
          message: 'Не удалось удалить пост. Попробуйте позже.',
          severity: 'error',
        },
      }));
    }
  };

  // Repost handlers
  const handleRepostClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      navigate('/login');
      return;
    }

    setPostState(prev => ({
      ...prev,
      repostContent: '',
      repostModalOpen: true,
    }));
  };

  const handleCloseRepostModal = () => {
    setPostState(prev => ({ ...prev, repostModalOpen: false }));
  };

  const handleCreateRepost = async () => {
    if (postState.repostLoading) return;

    try {
      setPostState(prev => ({ ...prev, repostLoading: true }));

      const response = await axios.post(`/api/posts/${post.id}/repost`, {
        text: postState.repostContent,
      });

      if (response.data.success) {
        setPostState(prev => ({
          ...prev,
          repostModalOpen: false,
          reposted: true,
        }));

        window.dispatchEvent(
          new CustomEvent('show-error', {
            detail: {
              message: 'Пост успешно добавлен в вашу ленту',
              shortMessage: 'Репост создан',
              notificationType: 'success',
              animationType: 'pill',
            },
          })
        );

        if (onDelete) {
          onDelete(post.id, null, 'repost');
        }
      } else {
        setPostState(prev => ({
          ...prev,
          snackbarMessage:
            response.data.error || 'Произошла ошибка при репосте',
          snackbarOpen: true,
        }));
      }
    } catch (error) {
      console.error('Error creating repost:', error);

      setPostState(prev => ({
        ...prev,
        snackbarMessage:
          error.response?.data?.error || 'Произошла ошибка при репосте',
        snackbarOpen: true,
      }));
    } finally {
      setPostState(prev => ({ ...prev, repostLoading: false }));
    }
  };

  // Comment handler
  const handleCommentClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(
      'Comment button clicked, opening overlay for post ID:',
      post.id
    );
    openPostDetail(post.id, e);
  };

  // Share handler
  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const postUrl = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard
      .writeText(postUrl)
      .then(() => {
        window.dispatchEvent(
          new CustomEvent('show-error', {
            detail: {
              message: 'Ссылка скопирована в буфер обмена',
              shortMessage: 'Ссылка скопирована',
              notificationType: 'success',
              animationType: 'pill',
            },
          })
        );
      })
      .catch(err => {
        console.error('Не удалось скопировать ссылку:', err);
        window.dispatchEvent(
          new CustomEvent('show-error', {
            detail: {
              message: 'Не удалось скопировать ссылку',
              shortMessage: 'Ошибка',
              notificationType: 'error',
              animationType: 'pill',
            },
          })
        );
      });
  };

  // Copy link handler
  const handleCopyLink = () => {
    try {
      const linkToCopy = `https://k-connect.ru/post/${post.id}`;
      navigator.clipboard.writeText(linkToCopy);

      window.dispatchEvent(
        new CustomEvent('show-error', {
          detail: {
            message: 'Ссылка скопирована в буфер обмена',
            shortMessage: 'Ссылка скопирована',
            notificationType: 'success',
            animationType: 'pill',
          },
        })
      );
    } catch (error) {
      console.error('Ошибка при копировании ссылки:', error);

      window.dispatchEvent(
        new CustomEvent('show-error', {
          detail: {
            message: 'Не удалось скопировать ссылку',
            shortMessage: 'Ошибка копирования',
            notificationType: 'error',
            animationType: 'pill',
          },
        })
      );
    }
  };

  // Post click handler
  const handlePostClick = (e: React.MouseEvent) => {
    if (e.target.closest('a, button')) return;
    incrementViewCount(post.id, postState.viewsCount).then(newViews => {
      setPostState(prev => ({ ...prev, viewsCount: newViews }));
    });
  };

  // Open post from menu handler
  const handleOpenPostFromMenu = () => {
    handleMenuClose();
    navigate(`/post/${post.id}`);
  };

  // Track play handler
  const handleTrackPlay = (track: any, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();

    const isCurrentlyPlaying = currentTrack && currentTrack.id === track.id;

    if (isCurrentlyPlaying) {
      togglePlay();
    } else {
      playTrack(track, 'post');
    }
  };

  // Expand handler
  const toggleExpanded = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPostState(prev => ({ ...prev, isExpanded: !prev.isExpanded }));
  };

  // Lightbox handlers
  const handleOpenImage = async (index: number) => {
    if (window.event) {
      (window.event as any).stopPropagation();
    }

    if (onOpenLightbox && typeof onOpenLightbox === 'function') {
      const allImages = processImages(post, postState.mediaError);
      if (allImages.length > 0) {
        onOpenLightbox(allImages[index], allImages, index);
      }
      return;
    }

    const allImages = processImages(post, postState.mediaError);
    if (allImages.length > 0) {
      try {
        setPostState(prev => ({
          ...prev,
          currentImageIndex: index,
          lightboxOpen: true,
        }));
      } catch (error) {
        console.error('Error opening lightbox:', error);
        setPostState(prev => ({
          ...prev,
          currentImageIndex: index,
          lightboxOpen: true,
        }));
      }
    }
  };

  const handleCloseLightbox = () => {
    setPostState(prev => ({ ...prev, lightboxOpen: false }));
  };

  const handleNextImage = () => {
    const images = processImages(post, postState.mediaError);
    setPostState(prev => ({
      ...prev,
      currentImageIndex: (prev.currentImageIndex + 1) % images.length,
    }));
  };

  const handlePrevImage = () => {
    const images = processImages(post, postState.mediaError);
    setPostState(prev => ({
      ...prev,
      currentImageIndex:
        (prev.currentImageIndex - 1 + images.length) % images.length,
    }));
  };

  // Heart animation handlers
  const getRandomRotation = () => {
    const possibleAngles = [-60, -50, -45, -40, -35, 35, 40, 45, 50, 60];
    return possibleAngles[Math.floor(Math.random() * possibleAngles.length)];
  };

  const getRandomSize = () => {
    return Math.floor(Math.random() * 40) + 60;
  };

  const addHeart = (x: number, y: number) => {
    const newHeart = {
      id: `${Date.now()}-${Math.random()}-${postState.hearts.length}`,
      x,
      y,
      rotation: getRandomRotation(),
      size: getRandomSize(),
    };

    setPostState(prev => ({ ...prev, hearts: [...prev.hearts, newHeart] }));

    setTimeout(() => {
      setPostState(prev => ({
        ...prev,
        hearts: prev.hearts.filter(heart => heart.id !== newHeart.id),
      }));
    }, 1000);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (postState.clickTimer) {
      clearTimeout(postState.clickTimer);
      setPostState(prev => ({ ...prev, clickTimer: null }));
    }

    if (
      e.target.closest('[data-no-navigate]') ||
      e.target.closest('.MuiMenu-root') ||
      e.target.closest('.MuiMenuItem-root') ||
      e.target.closest('.MuiDialog-root') ||
      e.target.closest('.post-action-button') ||
      e.target.closest('.lightbox-trigger') ||
      e.target.closest('a') ||
      e.target.closest('button')
    ) {
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    addHeart(x, y);

    if (!postState.liked) {
      handleLike(e);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (
      e.target.closest('[data-no-navigate]') ||
      e.target.closest('.MuiMenu-root') ||
      e.target.closest('.MuiMenuItem-root') ||
      e.target.closest('.MuiDialog-root') ||
      e.target.closest('.post-action-button') ||
      e.target.closest('.lightbox-trigger') ||
      e.target.closest('a') ||
      e.target.closest('button')
    ) {
      return;
    }

    const touch = e.touches[0];
    const now = new Date().getTime();
    const timeDiff = now - postState.lastTap.time;

    if (timeDiff < 300) {
      if (postState.clickTimer) {
        clearTimeout(postState.clickTimer);
        setPostState(prev => ({ ...prev, clickTimer: null }));
      }

      const rect = e.currentTarget.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      const xDiff = Math.abs(x - postState.lastTap.x);
      const yDiff = Math.abs(y - postState.lastTap.y);

      if (xDiff < 30 && yDiff < 30) {
        e.preventDefault();

        addHeart(x, y);

        if (!postState.liked) {
          handleLike();
        }
      }
    }

    setPostState(prev => ({
      ...prev,
      lastTap: {
        time: now,
        x: touch.clientX - e.currentTarget.getBoundingClientRect().left,
        y: touch.clientY - e.currentTarget.getBoundingClientRect().top,
      },
    }));
  };

  const handleClick = (e: React.MouseEvent) => {
    if (postState.hearts.length > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      addHeart(x, y);
    }
  };

  // Media error handlers
  const handleImageError = (url: string) => {
    console.log('Ошибка загрузки изображения:', url);
    setPostState(prev => ({ ...prev, mediaError: { type: 'image', url } }));
  };

  const handleVideoError = (url: string) => {
    console.log('Ошибка загрузки видео:', url);
    setPostState(prev => ({ ...prev, mediaError: { type: 'video', url } }));
  };

  // Pin post handler
  const handlePinPost = async () => {
    try {
      if (postState.isPinned) {
        await axios.post(
          '/api/profile/unpin_post',
          {},
          {
            headers: {
              'Cache-Control': 'no-cache',
            },
          }
        );
        setPostState(prev => ({ ...prev, isPinned: false }));
        window.dispatchEvent(
          new CustomEvent('show-error', {
            detail: {
              message: t('post.pin.unpinned'),
              shortMessage: t('post.pin.unpinned_short'),
              notificationType: 'info',
              animationType: 'pill',
            },
          })
        );
        window.dispatchEvent(
          new CustomEvent('post-pinned-state-changed', {
            detail: { postId: post.id, isPinned: false },
          })
        );
      } else {
        await axios.post(
          `/api/profile/pin_post/${post.id}`,
          {},
          {
            headers: {
              'Cache-Control': 'no-cache',
            },
          }
        );
        setPostState(prev => ({ ...prev, isPinned: true }));
        window.dispatchEvent(
          new CustomEvent('show-error', {
            detail: {
              message: t('post.pin.pinned'),
              shortMessage: t('post.pin.pinned_short'),
              notificationType: 'success',
              animationType: 'pill',
            },
          })
        );
        window.dispatchEvent(
          new CustomEvent('post-pinned-state-changed', {
            detail: { postId: post.id, isPinned: true },
          })
        );
      }
    } catch (error) {
      console.error(t('post.pin.pin_error'), error);
      window.dispatchEvent(
        new CustomEvent('show-error', {
          detail: {
            message: t('post.pin.error'),
            shortMessage: t('post.pin.error_short'),
            notificationType: 'error',
          },
        })
      );
    }
  };

  return {
    handleLike,
    handleMenuOpen,
    handleMenuClose,
    handleDelete,
    handleEdit,
    handleCloseEditDialog,
    handleEditContentChange,
    handleToggleDeleteImages,
    handleToggleDeleteVideo,
    handleToggleDeleteMusic,
    handleSubmitEdit,
    confirmDelete,
    handleRepostClick,
    handleCloseRepostModal,
    handleCreateRepost,
    handleCommentClick,
    handleShare,
    handleCopyLink,
    handlePostClick,
    handleTrackPlay,
    toggleExpanded,
    handleOpenImage,
    handleCloseLightbox,
    handleNextImage,
    handlePrevImage,
    handleDoubleClick,
    handleTouchStart,
    handleClick,
    handleImageError,
    handleVideoError,
    handlePinPost,
    handleOpenPostFromMenu,
    isCurrentUserPost,
  };
};
