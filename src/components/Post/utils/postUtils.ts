import axios from 'axios';
import { parseDate } from '../../../utils/dateUtils';
import { staticCache } from '../../../utils/staticCache';

// Media processing functions
export const processImages = (
  post: any,
  mediaError: { type: string | null; url: string | null }
) => {
  if (mediaError.type === 'image') {
    return [];
  }

  if (post?.images && Array.isArray(post.images) && post.images.length > 0) {
    return post.images;
  }

  if (post?.image && typeof post.image === 'string') {
    if (post.image.includes('||') || post.image.includes(',')) {
      return post.image
        .split(/[||,]/)
        .map((url: string) => url.trim())
        .filter(Boolean);
    }
    return [post.image];
  }

  return [];
};

// Функция для обработки размеров изображений
export const processImageDimensions = (post: any) => {
  const dimensions: Record<string, any> = {};

  if (post?.image_dimensions) {
    // Если есть одно изображение
    if (post.image && typeof post.image === 'string') {
      dimensions[post.image] = post.image_dimensions;
    }

    // Если есть массив изображений
    if (post.images && Array.isArray(post.images)) {
      post.images.forEach((imageUrl: string, index: number) => {
        if (post.image_dimensions[imageUrl]) {
          dimensions[imageUrl] = post.image_dimensions[imageUrl];
        } else if (index === 0 && typeof post.image_dimensions === 'object') {
          // Если размеры для первого изображения
          dimensions[imageUrl] = post.image_dimensions;
        }
      });
    }
  }

  return dimensions;
};

export const hasVideo = (post: any) => {
  return (
    post?.video && typeof post.video === 'string' && post.video.trim() !== ''
  );
};

export const formatVideoUrl = (url: string, postId?: string) => {
  if (!url) return '';

  if (url.startsWith('http') || url.startsWith('//')) {
    return url;
  }

  if (url.startsWith('/static/uploads/post/')) {
    return url;
  }

  if (url.startsWith('/static/')) {
    return url;
  }

  return `/static/uploads/post/${postId}/${url}`;
};

// Функция для форматирования URL превьюшки видео
export const formatVideoPosterUrl = (poster: string, postId?: string) => {
  if (!poster) return '/static/images/video_placeholder.png';

  if (poster.startsWith('http') || poster.startsWith('//')) {
    return poster;
  }

  if (poster.startsWith('/static/')) {
    return poster;
  }

  if (poster.startsWith('/static/uploads/post/')) {
    return poster;
  }

  return `/static/uploads/post/${postId}/${poster}`;
};

// Music functions
export const getCoverPath = (track: any) => {
  if (!track || !track.cover_path) {
    return '/uploads/system/album_placeholder.jpg';
  }

  if (track.cover_path.startsWith('/static/')) {
    return track.cover_path;
  }

  if (track.cover_path.startsWith('static/')) {
    return `/${track.cover_path}`;
  }

  if (track.cover_path.startsWith('http')) {
    return track.cover_path;
  }

  return `/static/music/${track.cover_path}`;
};

export const formatDuration = (seconds: number) => {
  if (!seconds) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Image optimization
export const getOptimizedImageUrl = (url: string) => {
  if (!url) return '/static/uploads/avatar/system/avatar.png';

  if (url.includes('format=webp')) {
    return url;
  }

  const supportsWebP = 'imageRendering' in document.documentElement.style;

  if (
    supportsWebP &&
    (url.startsWith('/static/') || url.startsWith('/uploads/'))
  ) {
    return `${url}${url.includes('?') ? '&' : '?'}format=webp`;
  }

  return url;
};

// Функция для получения кешированного изображения
export const getCachedImageUrl = async (url: string): Promise<string> => {
  if (!url) return '/static/uploads/avatar/system/avatar.png';

  try {
    // Сначала проверяем кеш статических файлов
    const cachedSrc = await staticCache.getFile(url);
    if (cachedSrc) {
      return cachedSrc;
    }

    // Если не найдено в кеше, загружаем и кешируем
    const cachedUrl = await staticCache.loadFile(url);
    if (cachedUrl) {
      return cachedUrl;
    }

    // Fallback на оптимизированный URL
    return getOptimizedImageUrl(url);
  } catch (error) {
    console.warn('Failed to get cached image:', error);
    return getOptimizedImageUrl(url);
  }
};

// Text processing functions
export const truncateText = (text: string, maxLength: number = 500) => {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

// Post validation functions
export const isPostEditable = (post: any) => {
  if (!post?.timestamp) return false;

  const postTime = parseDate(post.timestamp);
  const currentTime = new Date();
  const timeDifference =
    (currentTime.getTime() - postTime.getTime()) / (1000 * 60 * 60);

  return timeDifference <= 3;
};

// Heart animation functions
export const getRandomRotation = () => {
  const possibleAngles = [-60, -50, -45, -40, -35, 35, 40, 45, 50, 60];
  return possibleAngles[Math.floor(Math.random() * possibleAngles.length)];
};

export const getRandomSize = () => {
  return Math.floor(Math.random() * 40) + 60;
};

export const incrementViewCount = async (
  postId: string,
  currentViews: number
) => {
  if (!postId || postId === 'undefined') {
    return currentViews;
  }

  try {
    const viewKey = `post_viewed_${postId}`;
    if (sessionStorage.getItem(viewKey)) {
      return currentViews;
    }

    sessionStorage.setItem(viewKey, 'true');

    const attemptViewCount = async (retries: number = 3): Promise<number> => {
      try {
        const response = await axios.post(`/api/posts/${postId}/view`);
        if (response.data && response.data.success) {
          return response.data.views_count;
        }
        return currentViews;
      } catch (error) {
        if (retries > 1) {
          return new Promise(resolve => {
            setTimeout(() => {
              attemptViewCount(retries - 1).then(resolve);
            }, 1000);
          });
        }
        return currentViews;
      }
    };

    return await attemptViewCount();
  } catch (error) {
    console.error('Error incrementing view count:', error);
    return currentViews;
  }
};

// Lightbox handlers
export const createLightboxHandlers = (
  setLightboxOpen: (open: boolean) => void,
  setCurrentImageIndex: (index: number | ((prev: number) => number)) => void,
  processImages: (post: any, mediaError: any) => string[],
  post: any,
  mediaError: any
) => {
  const handleCloseLightbox = () => {
    setLightboxOpen(false);
  };

  const handleNextImage = () => {
    setCurrentImageIndex(
      prevIndex => (prevIndex + 1) % processImages(post, mediaError).length
    );
  };

  const handlePrevImage = () => {
    setCurrentImageIndex(
      prevIndex =>
        (prevIndex - 1 + processImages(post, mediaError).length) %
        processImages(post, mediaError).length
    );
  };

  return {
    handleCloseLightbox,
    handleNextImage,
    handlePrevImage,
  };
};

// Menu handlers
export const createMenuHandlers = (
  setMenuAnchorEl: (el: HTMLElement | null) => void
) => {
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  return {
    handleMenuOpen,
    handleMenuClose,
  };
};

// Utility handlers
export const createCopyLinkHandler = (postId: string) => {
  return () => {
    // Проверяем, что postId существует
    if (!postId || postId === 'undefined') {
      console.warn(
        'createCopyLinkHandler: postId is undefined or invalid:',
        postId
      );
      window.dispatchEvent(
        new CustomEvent('show-error', {
          detail: {
            message: 'Ошибка: не удалось определить ID поста',
            shortMessage: 'Ошибка',
            notificationType: 'error',
            animationType: 'pill',
          },
        })
      );
      return;
    }

    try {
      const linkToCopy = `https://k-connect.ru/post/${postId}`;
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
};

export const createToggleExpandedHandler = (
  setIsExpanded: (expanded: boolean | ((prev: boolean) => boolean)) => void
) => {
  return (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(prev => !prev);
  };
};

// Music and post handlers
export const createTrackPlayHandler = (
  currentTrack: any,
  togglePlay: () => void,
  playTrack: (track: any, source: string) => void
) => {
  return (track: any, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();

    const isCurrentlyPlaying = currentTrack && currentTrack.id === track.id;

    if (isCurrentlyPlaying) {
      togglePlay();
    } else {
      playTrack(track, 'post');
    }
  };
};

export const createOpenPostFromMenuHandler = (
  setPostDetail: (postId: string) => void
) => {
  return (postId: string) => {
    console.log('Opening post comments from context menu, ID:', postId);
    setPostDetail(postId);
  };
};

export const createCloseRepostModalHandler = (
  setRepostModalOpen: (open: boolean) => void
) => {
  return () => {
    setRepostModalOpen(false);
  };
};

// Comment and share handlers
export const createCommentClickHandler = (
  openPostDetail: (postId: string, event: React.MouseEvent) => void
) => {
  return (postId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Comment button clicked, opening overlay for post ID:', postId);
    openPostDetail(postId, e);
  };
};

export const createShareHandler = (postId: string) => {
  return (e: React.MouseEvent) => {
    e.stopPropagation();

    // Проверяем, что postId существует
    if (!postId || postId === 'undefined') {
      console.warn(
        'createShareHandler: postId is undefined or invalid:',
        postId
      );
      window.dispatchEvent(
        new CustomEvent('show-error', {
          detail: {
            message: 'Ошибка: не удалось определить ID поста',
            shortMessage: 'Ошибка',
            notificationType: 'error',
            animationType: 'pill',
          },
        })
      );
      return;
    }

    const postUrl = `${window.location.origin}/post/${postId}`;
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
};

// Image handlers
export const createOpenImageHandler = (
  post: any,
  mediaError: any,
  onOpenLightbox: any,
  setCurrentImageIndex: (index: number) => void,
  setLightboxOpen: (open: boolean) => void
) => {
  return async (index: number) => {
    if (window.event) {
      window.event.stopPropagation();
    }

    if (onOpenLightbox && typeof onOpenLightbox === 'function') {
      const allImages = processImages(post, mediaError);
      if (allImages.length > 0) {
        onOpenLightbox(allImages[index], allImages, index);
      }
      return;
    }

    const allImages = processImages(post, mediaError);
    if (allImages.length > 0) {
      try {
        const currentImageUrl = allImages[index];
        setCurrentImageIndex(index);
        setLightboxOpen(true);
      } catch (error) {
        console.error('Error opening lightbox:', error);
        setCurrentImageIndex(index);
        setLightboxOpen(true);
      }
    }
  };
};
