import * as React from 'react';
import { useContext, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { AuthContextType } from './types';
import { useLanguage } from '../../context/LanguageContext';
import { usePostActions } from '../User/ProfilePage/hooks/usePostActions';
import StyledTabs from '../../UIKIT/StyledTabs';
import { Post } from '../../components/Post';

import PostSkeleton from '../../components/Post/PostSkeleton';
import CreatePost from '../../components/CreatePost/CreatePost';
import UpdateInfo from '../../components/Updates/UpdateInfo';
import SimpleImageViewer from '../../components/SimpleImageViewer';

// Local components
import OnlineUsers from './components/OnlineUsers';
import RecommendationsPanel from './components/RecommendationsPanel';
import TelegramSubscribeBlock from './components/TelegramSubscribeBlock';

// Hooks
import { useMainPageState } from './hooks/useMainPageState';
import { usePostsLoader } from './hooks/usePostsLoader';

// Styles
import './MainPage.css';

const MainPage: React.FC = React.memo(() => {
  const { user } = useContext(AuthContext) as any;
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { handlePostCreated } = usePostActions();

  const {
    // State
    posts,
    loading,
    recommendations,
    loadingRecommendations,
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
    handleOpenLightbox,
    handleCloseLightbox,
    handleNextImage,
    handlePrevImage,
  } = useMainPageState();

  const { loaderRef } = usePostsLoader({
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
  });

  // Intersection Observer для бесконечной прокрутки
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
    };

    const observer = new IntersectionObserver(entries => {
      const [entry] = entries;
      if (
        entry.isIntersecting &&
        hasMore &&
        !loading &&
        !loadingMoreRef.current &&
        !feedTypeChanged.current
      ) {
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
  }, [hasMore, loading, posts.length, feedType, loadMorePosts]);

  return (
    <Container
      maxWidth='lg'
      sx={{
        mt: 2,
        mb: 0,
        px: { xs: 0.5, sm: 0 },
        width: '100%',
        maxWidth: '100%',
        pb: { xs: '100px', sm: 0 },
      }}
    >
      <div className='content-container'>
        <div className='left-column'>
          <OnlineUsers />
          <CreatePost onPostCreated={handlePostCreated} postType='post' />

          <StyledTabs
            value={feedType}
            onChange={(event, newValue) => setFeedType(newValue as 'all' | 'following' | 'recommended')}
            tabs={[
              { value: 'all', label: t('main_page.feed.tabs.all') },
              { value: 'following', label: t('main_page.feed.tabs.following') },
              {
                value: 'recommended',
                label: t('main_page.feed.tabs.recommended'),
              },
            ]}
            fullWidth
            customStyle
          />

          <Box sx={{ mt: 0 }}>
            {loading && posts.length === 0 ? (
              <>
                {[...Array(5)].map((_, index) => (
                  <PostSkeleton key={index} />
                ))}
              </>
            ) : posts.length > 0 ? (
              <Box sx={{ mt: 0 }}>
                {posts.map((post, index) => (
                  <Post
                    key={`${post.id}-${index}`}
                    post={post}
                    onDelete={handleDeletePost}
                    onOpenLightbox={handleOpenLightbox}
                    isPinned={false}
                    statusColor={null}
                  />
                ))}

                {hasMore && (
                  <Box
                    ref={loaderRef}
                    sx={{
                      textAlign: 'center',
                      py: 2,
                      opacity: loading ? 1 : 0,
                      transition: 'opacity 0.3s ease',
                    }}
                  >
                    {loading && (
                      <CircularProgress
                        size={30}
                        sx={{ color: 'primary.main' }}
                      />
                    )}
                  </Box>
                )}

                {!hasMore && (
                  <Box
                    sx={{
                      textAlign: 'center',
                      py: 3,
                      opacity: 0.7,
                    }}
                  >
                    <Typography variant='body2' color='text.secondary'>
                      {t('main_page.feed.end')}
                    </Typography>
                  </Box>
                )}
              </Box>
            ) : (
              <Box
                sx={{
                  textAlign: 'center',
                  py: 4,
                  mt: 2,
                }}
              >
                <Typography color='text.secondary'>
                  {t('main_page.feed.empty')}
                </Typography>
              </Box>
            )}
          </Box>
        </div>

        <div className='right-column'>
          <RecommendationsPanel
            recommendations={recommendations}
            loadingRecommendations={loadingRecommendations}
          />

          <TelegramSubscribeBlock />

          {latestUpdate && (
            <Box
              sx={{
                mb: 2,
                display: { xs: 'none', sm: 'block' },
                '&:hover': {
                  '& > *': { transform: 'translateY(-2px)' },
                  cursor: 'pointer',
                },
              }}
              onClick={() => navigate('/updates')}
            >
              <UpdateInfo
                version={latestUpdate.version}
                date={latestUpdate.date}
                title={latestUpdate.title}
                updates={latestUpdate.updates}
                fixes={latestUpdate.fixes}
                hideHeader={true}
                showAllUpdatesButton={false}
              />
            </Box>
          )}
        </div>
      </div>

      <SimpleImageViewer
        isOpen={lightbox.isOpen}
        onClose={handleCloseLightbox}
        images={lightbox.images}
        initialIndex={lightbox.currentImageIndex}
      />
    </Container>
  );
});

export default MainPage;
