import { useState, useEffect, useRef } from 'react';
import axios from '../../../services/axiosConfig';
import UpdateService from '../../../services/UpdateService';
import { Post, User, UpdateInfo, LightboxState, FeedType } from '../types';

export const useMainPageState = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<User[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);
  const [trendingBadges, setTrendingBadges] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [feedType, setFeedType] = useState<FeedType['value']>('all');
  const [requestId, setRequestId] = useState(0);
  const [latestUpdate, setLatestUpdate] = useState<UpdateInfo | null>(null);
  const [lightbox, setLightbox] = useState<LightboxState>({
    isOpen: false,
    currentImage: '',
    currentImageIndex: 0,
    images: [],
  });

  const isFirstRender = useRef(true);
  const feedTypeChanged = useRef(false);
  const loadingMoreRef = useRef(false);

  // Загрузка рекомендаций
  useEffect(() => {
    if (!isFirstRender.current) return;

    const fetchRecommendations = async () => {
      try {
        setLoadingRecommendations(true);

        if (recommendations.length > 0) {
          setLoadingRecommendations(false);
          return;
        }

        try {
          const response = await axios.get('/api/users/recent-channels', {
            timeout: 5000,
          });
          if (Array.isArray(response.data)) {
            setRecommendations(response.data || []);
          } else {
            console.log('Unexpected response format:', response.data);
            setRecommendations([]);
          }
        } catch (error) {
          console.error('Error fetching recent channels:', error);
          setRecommendations([]);
        }
      } finally {
        setLoadingRecommendations(false);
      }
    };

    fetchRecommendations();
  }, []);

  // Загрузка обновлений
  useEffect(() => {
    const update = UpdateService.getLatestUpdate();
    setLatestUpdate(update as any);
  }, []);

  // Обработчик глобального события удаления постов
  useEffect(() => {
    const handleGlobalPostDeleted = (event: CustomEvent) => {
      const { postId } = event.detail;
      if (postId) {
        setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
      }
    };

    window.addEventListener(
      'post-deleted',
      handleGlobalPostDeleted as EventListener
    );

    return () => {
      window.removeEventListener(
        'post-deleted',
        handleGlobalPostDeleted as EventListener
      );
    };
  }, []);

  // Обработчик глобального события создания постов
  useEffect(() => {
    const handleGlobalPostCreated = (event: CustomEvent) => {
      const newPost = event.detail;
      if (newPost && (!newPost.type || newPost.type === 'post')) {
        setPosts(prevPosts => [newPost, ...prevPosts]);
      }
    };

    window.addEventListener(
      'post_created',
      handleGlobalPostCreated as EventListener
    );

    return () => {
      window.removeEventListener(
        'post_created',
        handleGlobalPostCreated as EventListener
      );
    };
  }, []);

  const loadMorePosts = async () => {
    if (
      loading ||
      !hasMore ||
      feedTypeChanged.current ||
      loadingMoreRef.current
    )
      return;

    try {
      loadingMoreRef.current = true;
      setLoading(true);

      const currentPage = page;

      const params = {
        page: currentPage,
        per_page: 10,
        sort: feedType,
        include_all: feedType === 'all',
      };

      const currentRequestId = requestId + 1;
      setRequestId(currentRequestId);

      setPage(currentPage + 1);

      const response = await axios.get('/api/posts/feed', { params });

      if (requestId !== currentRequestId - 1) return;

      if (response.data && Array.isArray(response.data.posts)) {
        setPosts(prev => {
          const existingPostIds = new Set(prev.map(p => p.id));
          const newPosts = response.data.posts.filter(
            (post: Post) => !existingPostIds.has(post.id)
          );
          return [...prev, ...newPosts];
        });
        setHasMore(
          response.data.has_next === true && response.data.posts.length > 0
        );
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more posts:', error);
      setHasMore(false);
    } finally {
      setLoading(false);
      loadingMoreRef.current = false;
    }
  };

  const handlePostCreatedLocal = (
    newPost: Post | null,
    deletedPostId?: number | null
  ) => {
    // @ts-ignore - axios.cache is a custom property
    if (axios.cache) {
      // @ts-ignore
      axios.cache.clearPostsCache();
      // @ts-ignore
      axios.cache.clearByUrlPrefix('/api/posts/feed');
      // @ts-ignore
      axios.cache.clearByUrlPrefix('/api/profile/pinned_post');
    }

    if (deletedPostId) {
      setPosts(prevPosts => prevPosts.filter(p => p.id !== deletedPostId));
      return;
    }

    if (!newPost) {
      setPosts([]);
      setPage(1);

      const refreshFeed = async () => {
        try {
          setLoading(true);
          const params = {
            page: 1,
            per_page: 20,
            sort: feedType,
            include_all: feedType === 'all',
          };

          const currentRequestId = requestId + 1;
          setRequestId(currentRequestId);

          const response = await axios.get('/api/posts/feed', {
            params,
            // @ts-ignore - forceRefresh is a custom property
            forceRefresh: true,
          });

          if (requestId !== currentRequestId - 1) return;

          if (response.data && Array.isArray(response.data.posts)) {
            // Дедупликация постов по ID
            const uniquePosts = response.data.posts.filter(
              (post: Post, index: number, self: Post[]) =>
                index === self.findIndex(p => p.id === post.id)
            );
            setPosts(uniquePosts);
            setHasMore(response.data.has_next === true);
            setPage(2);
          } else {
            setPosts([]);
            setHasMore(false);
          }
        } catch (error) {
          console.error(`Error refreshing ${feedType} posts:`, error);
          setPosts([]);
          setHasMore(false);
        } finally {
          setLoading(false);
        }
      };

      refreshFeed();
      return;
    }

    setPosts(prevPosts => [newPost, ...prevPosts]);
  };

  const handleDeletePost = (postId: number, updatedPost?: Post) => {
    if (updatedPost) {
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id.toString() === postId.toString() ? updatedPost : post
        )
      );
    } else {
      setPosts(prevPosts =>
        prevPosts.filter(post => post.id.toString() !== postId.toString())
      );
    }
  };

  const handleFollow = async (userId: number, isFollowing: boolean) => {
    try {
      await axios.post('/api/profile/follow', { followed_id: userId });
    } catch (error) {
      console.error('Error following user:', error);
      setRecommendations(
        recommendations.map(rec =>
          rec.id === userId ? { ...rec, isFollowing: !isFollowing } : rec
        )
      );
    }
  };

  const handleOpenLightbox = (
    image: string,
    allImages: string[],
    index?: number
  ) => {
    setLightbox({
      isOpen: true,
      currentImage: image,
      currentImageIndex: index || 0,
      images: Array.isArray(allImages) ? allImages : [image],
    });
  };

  const handleCloseLightbox = () => {
    setLightbox(prev => ({ ...prev, isOpen: false }));
  };

  const handleNextImage = () => {
    setLightbox(prev => {
      const nextIndex = (prev.currentImageIndex + 1) % prev.images.length;
      return {
        ...prev,
        currentImageIndex: nextIndex,
        currentImage: prev.images[nextIndex],
      };
    });
  };

  const handlePrevImage = () => {
    setLightbox(prev => {
      const nextIndex =
        (prev.currentImageIndex - 1 + prev.images.length) % prev.images.length;
      return {
        ...prev,
        currentImageIndex: nextIndex,
        currentImage: prev.images[nextIndex],
      };
    });
  };

  return {
    // State
    posts,
    loading,
    recommendations,
    loadingRecommendations,
    trendingBadges,
    page,
    hasMore,
    feedType,
    requestId,
    latestUpdate,
    lightbox,

    // Refs
    isFirstRender,
    feedTypeChanged,
    loadingMoreRef,

    // Actions
    setPosts,
    setLoading,
    setHasMore,
    setPage,
    setFeedType,
    setRequestId,
    loadMorePosts,
    handlePostCreatedLocal,
    handleDeletePost,
    handleFollow,
    handleOpenLightbox,
    handleCloseLightbox,
    handleNextImage,
    handlePrevImage,
  };
};
