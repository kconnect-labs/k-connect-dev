import { useEffect, useRef } from 'react';
import axios from '../../../services/axiosConfig';
import { Post, FeedType } from '../types';

interface UsePostsLoaderProps {
  feedType: FeedType['value'];
  requestId: number;
  isFirstRender: React.MutableRefObject<boolean>;
  feedTypeChanged: React.MutableRefObject<boolean>;
  setPosts: (posts: Post[]) => void;
  setLoading: (loading: boolean) => void;
  setHasMore: (hasMore: boolean) => void;
  setPage: (page: number) => void;
  setRequestId: (id: number) => void;
  loadMorePosts: () => Promise<void>;
}

export const usePostsLoader = ({
  feedType,
  requestId,
  isFirstRender,
  feedTypeChanged,
  setPosts,
  setLoading,
  setHasMore,
  setPage,
  setRequestId,
  loadMorePosts,
}: UsePostsLoaderProps) => {
  const loaderRef = useRef<HTMLDivElement>(null);

  // Intersection Observer для бесконечной прокрутки
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
    };

    const observer = new IntersectionObserver(entries => {
      const [entry] = entries;
      if (entry.isIntersecting) {
        loadMorePosts();
      }
    }, options);

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [loadMorePosts]);

  // Начальная загрузка постов
  useEffect(() => {
    if (!isFirstRender.current) return;

    const initialLoad = async () => {
      console.log('INITIAL MOUNT - ONE TIME LOAD');
      try {
        setLoading(true);
        setPosts([]);

        const params = {
          page: 1,
          per_page: 20,
          sort: feedType,
          include_all: feedType === 'all',
        };

        const currentRequestId = requestId + 1;
        setRequestId(currentRequestId);

        const response = await axios.get('/api/posts/feed', { params });

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
        console.error('Error loading initial posts:', error);
        setPosts([]);
        setHasMore(false);
      } finally {
        setLoading(false);
        isFirstRender.current = false;
      }
    };

    initialLoad();
  }, []);

  // Загрузка постов при изменении типа ленты
  useEffect(() => {
    if (isFirstRender.current) return;

    feedTypeChanged.current = true;

    const loadFeedPosts = async () => {
      console.log(`FEED TYPE CHANGED TO: ${feedType} - LOADING NEW POSTS`);
      try {
        setLoading(true);
        setPosts([]);

        const params = {
          page: 1,
          per_page: 20,
          sort: feedType,
          include_all: feedType === 'all',
        };

        const currentRequestId = requestId + 1;
        setRequestId(currentRequestId);

        let response;
        try {
          response = await axios.get('/api/posts/feed', { params });
        } catch (apiError) {
          console.error(`Error in API call for ${feedType} feed:`, apiError);

          if (feedType === 'recommended') {
            setHasMore(false);
            setPosts([]);
            setLoading(false);
            feedTypeChanged.current = false;
            return;
          }

          throw apiError;
        }

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
        console.error(`Error loading ${feedType} posts:`, error);
        setPosts([]);
        setHasMore(false);
      } finally {
        setLoading(false);
        feedTypeChanged.current = false;
      }
    };

    loadFeedPosts();
  }, [feedType]);

  return { loaderRef };
};
