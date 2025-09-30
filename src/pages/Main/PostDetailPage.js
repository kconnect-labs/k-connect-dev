import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  IconButton,
  Link as MuiLink,
  Snackbar,
  Alert,
  Dialog,

  Slide,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import axios from 'axios';
import DeleteIcon from '@mui/icons-material/Delete';
import SimpleImageViewer from '../../components/SimpleImageViewer';
import { Post } from '../../components/Post';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SEO from '../../components/SEO';

import { usePostDetail } from '../../context/PostDetailContext';
import { useLanguage } from '../../context/LanguageContext';
import UniversalModal from '../../UIKIT/UniversalModal';
import Comment from '../../UIKIT/Comment/Comment';
import CommentInput from '../../UIKIT/CommentInput/CommentInput';
import './PostDetailPage.css';

const sanitizeImagePath = imagePath => {
  if (!imagePath) return null;

  if (
    imagePath.includes('/static/uploads/') &&
    imagePath.indexOf('/static/uploads/') !==
      imagePath.lastIndexOf('/static/uploads/')
  ) {
    return imagePath.substring(imagePath.lastIndexOf('/static/uploads/'));
  }

  return imagePath;
};


const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction='up' ref={ref} {...props} />;
});

const PostDetailPage = ({ isOverlay = false, overlayPostId = null, disablePadding = false }) => {
  const { postId: paramId } = useParams();
  const postId = overlayPostId || paramId;
  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Добавляем состояния для пагинации комментариев
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [hasMoreComments, setHasMoreComments] = useState(false);
  const [commentsPagination, setCommentsPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    total_pages: 0,
    has_next: false,
    has_prev: false,
  });

  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyImage, setReplyImage] = useState(null);
  const [replyImagePreview, setReplyImagePreview] = useState('');
  const replyFileInputRef = useRef(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [postMenuAnchorEl, setPostMenuAnchorEl] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentLightboxImage, setCurrentLightboxImage] = useState('');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState('');
  const [lastCommentTime, setLastCommentTime] = useState(0);
  const [waitUntil, setWaitUntil] = useState(0);

  // Минимальный интервал между комментариями
  const MIN_COMMENT_INTERVAL = 3000;

  const [commentDeleteDialog, setCommentDeleteDialog] = useState({
    open: false,
    deleting: false,
    deleted: false,
    commentId: null,
  });

  const [replyDeleteDialog, setReplyDeleteDialog] = useState({
    open: false,
    deleting: false,
    deleted: false,
    commentId: null,
    replyId: null,
  });

  const { overlayOpen, closePostDetail } = usePostDetail();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const viewCounted = useRef(false);

  const { t } = useLanguage();

  const loadComments = async (page = 1, append = false) => {
    try {
      if (page === 1) {
        setCommentsLoading(true);
      }

      const response = await axios.get(`/api/posts/${postId}/comments`, {
        params: {
          page: page,
          limit: 20,
        },
      });

      if (response.data.comments) {
        const sanitizedComments = response.data.comments.map(comment => {
          if (comment.image) {
            comment.image = sanitizeImagePath(comment.image);
          }

          if (comment.replies && comment.replies.length > 0) {
            comment.replies = comment.replies.map(reply => {
              if (reply.image) {
                reply.image = sanitizeImagePath(reply.image);
              }
              return reply;
            });
          }

          return comment;
        });

        if (append) {
          setComments(prev => [...prev, ...sanitizedComments]);
        } else {
          setComments(sanitizedComments);
        }

        setCommentsPagination(response.data.pagination);
        setHasMoreComments(response.data.pagination.has_next);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
      setSnackbar({
        open: true,
        message: 'Ошибка при загрузке комментариев',
        severity: 'error',
      });
    } finally {
      setCommentsLoading(false);
    }
  };

  const loadMoreComments = async () => {
    if (!hasMoreComments || commentsLoading) return;

    const nextPage = commentsPagination.page + 1;
    await loadComments(nextPage, true);
  };

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        // Загружаем пост БЕЗ комментариев (include_comments=false по умолчанию)
        const response = await axios.get(`/api/posts/${postId}`);
        setPost(response.data.post);

        // Загружаем первую страницу комментариев отдельно
        await loadComments(1, false);

        setLoading(false);

        if (!viewCounted.current) {
          incrementViewCount(postId);
          viewCounted.current = true;
        }
      } catch (error) {
        console.error('Error fetching post details:', error);
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId, navigate]);

  const incrementViewCount = async postId => {
    try {
      const viewKey = `post_viewed_${postId}`;

      if (sessionStorage.getItem(viewKey)) {
        return;
      }

      sessionStorage.setItem(viewKey, 'true');

      const response = await axios.post(`/api/posts/${postId}/view`);

      if (response.data && response.data.success) {
        setPost(prevPost => {
          if (!prevPost) return null;

          return {
            ...prevPost,
            views_count: response.data.views_count,
          };
        });
      }
    } catch (error) {
      console.error('Error incrementing view count (detail page):', error);

      const retryViewCount = async (retries = 2) => {
        if (retries <= 0) return;

        try {
          const response = await axios.post(`/api/posts/${postId}/view`);

          if (response.data && response.data.success) {
            setPost(prevPost => {
              if (!prevPost) return null;
              return {
                ...prevPost,
                views_count: response.data.views_count,
              };
            });
          }
        } catch (retryError) {
          console.error('Error on retry (detail page):', retryError);
          setTimeout(() => retryViewCount(retries - 1), 1000);
        }
      };

      setTimeout(() => retryViewCount(), 1000);
    }
  };


  const handleReplyImageChange = event => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setReplyImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setReplyImagePreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveReplyImage = () => {
    setReplyImage(null);
    setReplyImagePreview('');
    if (replyFileInputRef.current) {
      replyFileInputRef.current.value = '';
    }
  };

  const handleCommentSubmit = async (content, image) => {
    if (!content.trim() && !image) return;

    const now = Date.now();
    if (now < waitUntil) {
      const secondsRemaining = Math.ceil((waitUntil - now) / 1000);
      setCommentError(
        `Пожалуйста, подождите ${secondsRemaining} сек. перед отправкой нового комментария`
      );
      setSnackbar({
        open: true,
        message: `Слишком частая отправка комментариев. Подождите ${secondsRemaining} сек.`,
        severity: 'warning',
      });
      return;
    }

    if (now - lastCommentTime < MIN_COMMENT_INTERVAL) {
      setCommentError('Пожалуйста, не отправляйте комментарии слишком часто');
      setSnackbar({
        open: true,
        message: 'Не отправляйте комментарии слишком часто',
        severity: 'warning',
      });
      return;
    }

    try {
      setIsSubmittingComment(true);
      setCommentError('');

      let response;
      if (image) {
        const formData = new FormData();
        formData.append('content', content.trim());
        formData.append('image', image);
        response = await axios.post(`/api/posts/${postId}/comments`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        response = await axios.post(
          `/api/posts/${postId}/comments`,
          {
            content: content.trim(),
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }

      const newComment = response.data.comment;
      if (newComment && newComment.image) {
        newComment.image = sanitizeImagePath(newComment.image);
      }

      setComments(prev => [newComment, ...prev]);

      setSnackbar({
        open: true,
        message: t('post.added'),
        severity: 'success',
      });

      setLastCommentTime(Date.now());
    } catch (error) {
      console.error('Error adding comment:', error);

      if (error.response && error.response.status === 429) {
        const rateLimit = error.response.data.rate_limit;
        let errorMessage = t('post.errorTooFrequent');

        if (rateLimit && rateLimit.reset) {
          const resetTime = new Date(rateLimit.reset * 1000);
          const now = new Date();
          const diffSeconds = Math.round((resetTime - now) / 1000);

          if (diffSeconds > 60) {
            const minutes = Math.floor(diffSeconds / 60);
            const seconds = diffSeconds % 60;
            errorMessage += `Следующий комментарий можно отправить через ${minutes} мин. ${seconds} сек.`;
          } else {
            errorMessage += `Следующий комментарий можно отправить через ${diffSeconds} сек.`;
          }

          setWaitUntil(now.getTime() + diffSeconds * 1000);
        } else {
          errorMessage += t('post.wait');

          setWaitUntil(Date.now() + 30000);
        }

        setCommentError(errorMessage);
        setSnackbar({
          open: true,
          message: errorMessage,
          severity: 'error',
        });
      } else if (
        error.response &&
        error.response.data &&
        error.response.data.error
      ) {
        setCommentError(error.response.data.error);
        setSnackbar({
          open: true,
          message: error.response.data.error,
          severity: 'error',
        });
      } else {
        setCommentError(t('post.errorAddComment'));
        setSnackbar({
          open: true,
          message: t('post.errorAddComment'),
          severity: 'error',
        });
      }
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleReplySubmit = async (commentId, content, image, parentReplyId = null) => {
    if (!content.trim() && !image) return;

    const now = Date.now();
    if (now < waitUntil) {
      const secondsRemaining = Math.ceil((waitUntil - now) / 1000);
      setCommentError(
        `Пожалуйста, подождите ${secondsRemaining} сек. перед отправкой нового комментария`
      );
      setSnackbar({
        open: true,
        message: `Слишком частая отправка комментариев. Подождите ${secondsRemaining} сек.`,
        severity: 'warning',
      });
      return;
    }

    if (now - lastCommentTime < MIN_COMMENT_INTERVAL) {
      setCommentError('Пожалуйста, не отправляйте комментарии слишком часто');
      setSnackbar({
        open: true,
        message: 'Не отправляйте комментарии слишком часто',
        severity: 'warning',
      });
      return;
    }

    try {
      setIsSubmittingComment(true);
      setCommentError('');

      let response;
      if (image) {
        const formData = new FormData();
        formData.append('content', content.trim());
        formData.append('image', image);
        if (parentReplyId) {
          formData.append('parent_reply_id', parentReplyId);
        }
        response = await axios.post(
          `/api/comments/${commentId}/replies`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
      } else {
        response = await axios.post(
          `/api/comments/${commentId}/replies`,
          {
            content: content.trim(),
            parent_reply_id: parentReplyId,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }

      if (response.data.reply && response.data.reply.image) {
        response.data.reply.image = sanitizeImagePath(
          response.data.reply.image
        );
      }

      if (response.data.reply) {
        console.log('Reply data structure:', {
          id: response.data.reply.id,
          image: response.data.reply.image,
          has_image: !!response.data.reply.image,
          image_type: typeof response.data.reply.image,
        });
      }

      // Обновляем комментарии, добавляя новый ответ
      setComments(prev =>
        prev.map(comment =>
          comment.id === commentId
            ? {
                ...comment,
                replies: [...(comment.replies || []), response.data.reply],
                replies_count: (comment.replies_count || 0) + 1,
              }
            : comment
        )
      );

      setSnackbar({
        open: true,
        message: t('post.replyAdded'),
        severity: 'success',
      });

      setLastCommentTime(Date.now());
    } catch (error) {
      console.error('Error adding reply:', error);

      if (error.response && error.response.status === 429) {
        const rateLimit = error.response.data.rate_limit;
        let errorMessage = t('post.errorTooFrequent');

        if (rateLimit && rateLimit.reset) {
          const resetTime = new Date(rateLimit.reset * 1000);
          const now = new Date();
          const diffSeconds = Math.round((resetTime - now) / 1000);

          if (diffSeconds > 60) {
            const minutes = Math.floor(diffSeconds / 60);
            const seconds = diffSeconds % 60;
            errorMessage += `Следующий комментарий можно отправить через ${minutes} мин. ${seconds} сек.`;
          } else {
            errorMessage += `Следующий комментарий можно отправить через ${diffSeconds} сек.`;
          }

          setWaitUntil(now.getTime() + diffSeconds * 1000);
        } else {
          errorMessage += t('post.wait');
          setWaitUntil(Date.now() + 30000);
        }

        setCommentError(errorMessage);
        setSnackbar({
          open: true,
          message: errorMessage,
          severity: 'error',
        });
      } else if (
        error.response &&
        error.response.data &&
        error.response.data.error
      ) {
        setCommentError(error.response.data.error);
        setSnackbar({
          open: true,
          message: error.response.data.error,
          severity: 'error',
        });
      } else {
        setCommentError(t('post.errorAddReply'));
        setSnackbar({
          open: true,
          message: t('post.errorAddReply'),
          severity: 'error',
        });
      }
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleLikeComment = async commentId => {

    try {
      setComments(prev =>
        prev.map(comment =>
          comment.id === commentId
            ? {
                ...comment,
                user_liked: !comment.user_liked,
                likes_count: comment.user_liked
                  ? Math.max(0, comment.likes_count - 1)
                  : comment.likes_count + 1,
              }
            : comment
        )
      );

      const response = await axios.post(`/api/comments/${commentId}/like`);

      setComments(prev =>
        prev.map(comment =>
          comment.id === commentId
            ? {
                ...comment,
                user_liked: response.data.liked,
                likes_count: response.data.likes_count,
              }
            : comment
        )
      );
    } catch (error) {
      console.error('Error liking comment:', error);

      setComments(prev => [...prev]);
    }
  };

  const handleLikeReply = async replyId => {

    try {
      // Оптимистичное обновление UI
      setComments(prev =>
        prev.map(comment => {
          // Находим комментарий, содержащий этот ответ
          if (
            !comment.replies ||
            !comment.replies.some(reply => reply.id === replyId)
          ) {
            return comment;
          }

          return {
            ...comment,
            replies: comment.replies.map(reply =>
              reply.id === replyId
                ? {
                    ...reply,
                    user_liked: !reply.user_liked,
                    likes_count: reply.user_liked
                      ? Math.max(0, reply.likes_count - 1)
                      : reply.likes_count + 1,
                  }
                : reply
            ),
          };
        })
      );

      // Отправляем запрос на сервер
      const response = await axios.post(`/api/replies/${replyId}/like`);

      // Обновляем UI с реальными данными с сервера
      setComments(prev =>
        prev.map(comment => {
          if (
            !comment.replies ||
            !comment.replies.some(reply => reply.id === replyId)
          ) {
            return comment;
          }

          return {
            ...comment,
            replies: comment.replies.map(reply =>
              reply.id === replyId
                ? {
                    ...reply,
                    user_liked: response.data.liked,
                    likes_count: response.data.likes_count,
                  }
                : reply
            ),
          };
        })
      );
    } catch (error) {
      console.error('Error liking reply:', error);
      // В случае ошибки возвращаем предыдущее состояние
      setComments(prev => [...prev]);
    }
  };

  const handlePostMenuOpen = () => {
    setPostMenuAnchorEl(true);
  };

  const handleDeleteComment = commentId => {

    setCommentDeleteDialog({
      open: true,
      deleting: false,
      deleted: false,
      commentId,
    });
  };

  const confirmDeleteComment = async () => {
    try {
      setCommentDeleteDialog(prev => ({ ...prev, deleting: true }));

      // Удаляем комментарий из локального состояния
      const updatedComments = comments.filter(
        comment => comment.id !== commentDeleteDialog.commentId
      );
      setComments(updatedComments);

      // Обновляем счетчик общего количества комментариев
      setCommentsPagination(prev => ({
        ...prev,
        total: Math.max(0, prev.total - 1),
      }));

      setCommentDeleteDialog(prev => ({
        ...prev,
        deleted: true,
        deleting: false,
      }));

      // Отправляем запрос на сервер для фактического удаления
      await axios.post(`/api/comments/${commentDeleteDialog.commentId}/delete`);

      setTimeout(() => {
        setCommentDeleteDialog(prev => ({ ...prev, open: false }));
      }, 1500);
    } catch (error) {
      console.error('Error deleting comment:', error);

      // В случае ошибки перезагружаем комментарии
      setSnackbar({
        open: true,
        message: t('post.errorDeleteComment'),
        severity: 'error',
      });

      // Перезагружаем первую страницу комментариев
      await loadComments(1, false);
    }
  };

  const handleDeleteReply = (commentId, replyId) => {

    console.log(
      'Current comments structure:',
      JSON.stringify(
        comments.map(c => ({
          id: c.id,
          content: c.content.substring(0, 20) + '...',
          replies_count: c.replies?.length,
        }))
      )
    );

    setReplyDeleteDialog({
      open: true,
      deleting: false,
      deleted: false,
      commentId,
      replyId,
    });
  };

  const confirmDeleteReply = async () => {
    try {
      setReplyDeleteDialog(prev => ({ ...prev, deleting: true }));

      // Обновляем комментарии, удаляя ответ
      const newComments = comments.map(comment => {
        if (comment.id !== replyDeleteDialog.commentId) {
          return { ...comment };
        }

        return {
          ...comment,
          replies: comment.replies.filter(
            reply => reply.id !== replyDeleteDialog.replyId
          ),
          replies_count: Math.max(0, (comment.replies_count || 0) - 1),
        };
      });

      setComments(newComments);

      setReplyDeleteDialog(prev => ({
        ...prev,
        deleted: true,
        deleting: false,
      }));

      // Отправляем запрос на сервер для фактического удаления
      await axios.post(`/api/replies/${replyDeleteDialog.replyId}/delete`);

      setTimeout(() => {
        setReplyDeleteDialog(prev => ({ ...prev, open: false }));
      }, 1500);
    } catch (error) {
      console.error('Error deleting reply:', error);

      setSnackbar({
        open: true,
        message: t('post.errorDeleteReply'),
        severity: 'error',
      });

      // В случае ошибки перезагружаем комментарии
      try {
        await loadComments(commentsPagination.page, false);
      } catch (refreshError) {
        console.error(
          'Error refreshing comments after delete error:',
          refreshError
        );
      }
    }
  };

  const handleClose = () => {
    closePostDetail();
  };

  const renderContent = () => (
    <Box sx={{ 
      ...(isOverlay ? {} : { 
        maxWidth: 'md', 
        mx: 'auto',
        pt: 2, 
        pb: 10, 
        px: 0,
        px: { xs: 0, sm: 0 } 
      })
    }}>
      {/* Image lightbox */}
      {lightboxOpen && (
        <SimpleImageViewer
          isOpen={lightboxOpen}
          onClose={() => {
            setLightboxOpen(false);
            setCurrentLightboxImage(null);
          }}
          images={
            currentLightboxImage ? [currentLightboxImage] : post?.images || []
          }
          initialIndex={0}
        />
      )}
      {post && !isOverlay && (
        <SEO
          title={`${post.user?.name || 'Пользователь'} - ${post.content.substring(0, 60)}${post.content.length > 60 ? '...' : ''}`}
          description={post.content.substring(0, 160)}
          image={
            post.images && Array.isArray(post.images) && post.images.length > 0
              ? typeof post.images[0] === 'string' &&
                post.images[0].startsWith('http')
                ? post.images[0]
                : `/static/uploads/posts/${post.images[0]}`
              : null
          }
          type='article'
          meta={{
            author: post.user?.name,
            publishedTime: post.created_at,
            modifiedTime: post.updated_at,
          }}
        />
      )}

      {!isOverlay && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: { xs: 2, sm: 3 },
            px: { xs: 2, sm: 0 },
          }}
        >
          <IconButton component={Link} to='/' sx={{ mr: 1 }} aria-label='Назад'>
            <ArrowBackIcon />
          </IconButton>
          <Typography
            variant='h5'
            sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }}
          >
            {t('post.post')}
          </Typography>
        </Box>
      )}

      {post && (
        <Post
          post={post}
          onDelete={() => navigate('/')}
          onOpenLightbox={imageUrl => {
            setLightboxOpen(true);

            if (Array.isArray(post.images)) {
              const index = post.images.indexOf(imageUrl);
              if (index !== -1) {
                setCurrentImageIndex(index);
              }
            }
          }}
        />
      )}

      {/* Comments Section */}
      <div className="comments-section" style={{ padding: disablePadding ? '0' : (isOverlay ? '0' : '0 16px'), marginBottom: isOverlay ? 0 : 16 }}>
        {commentError && (
          <div className="comment-error">
            <Alert
              severity='error'
              onClose={() => setCommentError('')}
            >
              {commentError}
            </Alert>
          </div>
        )}

        {user ? (
          <CommentInput
            user={user}
            placeholder={t('post.writeComment')}
            onSubmit={handleCommentSubmit}
            disabled={isSubmittingComment || Date.now() < waitUntil}
            isSubmitting={isSubmittingComment}
            maxLength={1000}
          />
        ) : (
          <div className="comment-login-prompt">
            <div className="comment-login-content">
              <MuiLink
                component={Link}
                to='/login'
                className="comment-login-link"
              >
                {t('post.loginToComment')}
              </MuiLink>
              , чтобы оставить комментарий
            </div>
          </div>
        )}

        {loading || (commentsLoading && commentsPagination.page === 1) ? (
          <div className="comments-loading">
            <CircularProgress size={30} thickness={4} />
          </div>
        ) : comments && comments.length > 0 ? (
          <div className="comments-list">
            {comments.map(comment => (
              <Comment
                key={comment.id}
                comment={comment}
                onLike={handleLikeComment}
                onLikeReply={handleLikeReply}
                onReply={(commentId, replyId) => {
                  // Handle reply logic here
                  console.log('Reply to comment:', commentId, replyId);
                }}
                onDelete={handleDeleteComment}
                onDeleteReply={handleDeleteReply}
                currentUserId={user?.id}
                isAdmin={user?.is_admin}
                onImageClick={(imageUrl) => {
                  setCurrentLightboxImage(imageUrl);
                  setLightboxOpen(true);
                }}
                onSubmitReply={handleReplySubmit}
                isSubmittingReply={isSubmittingComment}
                currentUser={user}
              />
            ))}

            {/* Load More Comments Button */}
            {hasMoreComments && (
              <div className="load-more-comments">
                <Button
                  variant='outlined'
                  onClick={loadMoreComments}
                  disabled={commentsLoading}
                  startIcon={
                    commentsLoading ? (
                      <CircularProgress size={16} />
                    ) : (
                      <ChatBubbleOutlineIcon />
                    )
                  }
                  className="load-more-button"
                >
                  {commentsLoading
                    ? 'Загрузка...'
                    : `Загрузить еще (${commentsPagination.total - comments.length})`}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="no-comments">
            <ChatBubbleOutlineIcon className="no-comments-icon" />
            <Typography
              variant='body1'
              className="no-comments-text"
            >
              {t('post.noComments')}
            </Typography>
          </div>
        )}
      </div>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={
            snackbar.severity === 'success' ||
            snackbar.severity === 'error' ||
            snackbar.severity === 'warning' ||
            snackbar.severity === 'info'
              ? snackbar.severity
              : 'success'
          }
          variant='filled'
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Dialog
        open={commentDeleteDialog.open}
        onClose={() =>
          !commentDeleteDialog.deleting &&
          !commentDeleteDialog.deleted &&
          setCommentDeleteDialog(prev => ({ ...prev, open: false }))
        }
        PaperProps={{
          sx: {
            bgcolor: 'rgba(32, 32, 36, 0.8)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
            width: '100%',
            maxWidth: '400px',
            borderRadius: 'var(--small-border-radius)',
            border: '1px solid rgba(100, 90, 140, 0.1)',
            '&:before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: 'var(--small-border-radius)',
              background:
                'linear-gradient(145deg, rgba(30, 30, 30, 0.6), rgba(20, 20, 20, 0.75))',
              backdropFilter: 'blur(30px)',
              zIndex: -1,
            },
          },
        }}
      >
        <Box sx={{ p: 3 }}>
          {commentDeleteDialog.deleted ? (
            <>
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <CheckCircleIcon
                  sx={{ fontSize: 56, color: '#4CAF50', mb: 2 }}
                />
                <Typography variant='h6' sx={{ mb: 1, color: 'white' }}>
                  {t('post.commentDeleted')}
                </Typography>
                <Typography
                  variant='body2'
                  sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                >
                  {t('post.commentDeleted')}
                </Typography>
              </Box>
            </>
          ) : (
            <>
              <Typography
                variant='h6'
                sx={{
                  mb: 2,
                  color: '#f44336',
                  fontWeight: 'medium',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <DeleteIcon sx={{ mr: 1 }} /> {t('post.confirmDelete')}
              </Typography>
              <Typography sx={{ mb: 3, color: 'rgba(255, 255, 255, 0.7)' }}>
                {t('post.sureDelete')}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button
                  onClick={() =>
                    setCommentDeleteDialog(prev => ({ ...prev, open: false }))
                  }
                  disabled={commentDeleteDialog.deleting}
                  sx={{
                    borderRadius: 'var(--large-border-radius)!important',
                    color: 'rgba(255, 255, 255, 0.7)',
                    px: 2,
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.08)',
                      color: 'rgba(255, 255, 255, 0.9)',
                    },
                  }}
                >
                  {t('post.cancel')}
                </Button>
                <Button
                  onClick={confirmDeleteComment}
                  disabled={commentDeleteDialog.deleting}
                  variant='contained'
                  color='error'
                  sx={{
                    borderRadius: 'var(--large-border-radius)!important',
                    boxShadow: 'none',
                    px: 2,
                  }}
                  endIcon={
                    commentDeleteDialog.deleting ? (
                      <CircularProgress size={16} color='inherit' />
                    ) : null
                  }
                >
                  {commentDeleteDialog.deleting
                    ? t('post.deleteInProgress')
                    : t('post.confirmDelete')}
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Dialog>

      <Dialog
        open={replyDeleteDialog.open}
        onClose={() =>
          !replyDeleteDialog.deleting &&
          !replyDeleteDialog.deleted &&
          setReplyDeleteDialog(prev => ({ ...prev, open: false }))
        }
        PaperProps={{
          sx: {
            bgcolor: 'rgba(32, 32, 36, 0.8)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
            width: '100%',
            maxWidth: '400px',
            borderRadius: 'var(--small-border-radius)',
            border: '1px solid rgba(100, 90, 140, 0.1)',
            '&:before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: 'var(--small-border-radius)',
              background:
                'linear-gradient(145deg, rgba(30, 30, 30, 0.6), rgba(20, 20, 20, 0.75))',
              backdropFilter: 'blur(30px)',
              zIndex: -1,
            },
          },
        }}
      >
        <Box sx={{ p: 3 }}>
          {replyDeleteDialog.deleted ? (
            <>
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <CheckCircleIcon
                  sx={{ fontSize: 56, color: '#4CAF50', mb: 2 }}
                />
                <Typography variant='h6' sx={{ mb: 1, color: 'white' }}>
                  {t('post.replyDeleted')}
                </Typography>
                <Typography
                  variant='body2'
                  sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                >
                  {t('post.replyDeleted')}
                </Typography>
              </Box>
            </>
          ) : (
            <>
              <Typography
                variant='h6'
                sx={{
                  mb: 2,
                  color: '#f44336',
                  fontWeight: 'medium',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <DeleteIcon sx={{ mr: 1 }} />{' '}
                {t('comment.dialog.delete_reply.title')}
              </Typography>
              <Typography sx={{ mb: 3, color: 'rgba(255, 255, 255, 0.7)' }}>
                {t('comment.dialog.delete_reply.message')}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button
                  onClick={() =>
                    setReplyDeleteDialog(prev => ({ ...prev, open: false }))
                  }
                  disabled={replyDeleteDialog.deleting}
                  sx={{
                    borderRadius: 'var(--large-border-radius)!important',
                    color: 'rgba(255, 255, 255, 0.7)',
                    px: 2,
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.08)',
                      color: 'rgba(255, 255, 255, 0.9)',
                    },
                  }}
                >
                  {t('comment.dialog.delete_reply.cancel')}
                </Button>
                <Button
                  onClick={confirmDeleteReply}
                  disabled={replyDeleteDialog.deleting}
                  variant='contained'
                  color='error'
                  sx={{
                    borderRadius: 'var(--large-border-radius)!important',
                    boxShadow: 'none',
                    px: 2,
                  }}
                >
                  {t('comment.dialog.delete_reply.confirm')}
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Dialog>
    </Box>
  );

  if (isOverlay) {
    return (
      <UniversalModal
        open={overlayOpen}
        onClose={handleClose}
        title={t('post.post')}
        maxWidth='md'
        fullWidth
        showBackButton
        onBack={handleClose}
        disableEscapeKeyDown={false}
        addBottomPadding
        disablePadding={disablePadding}
        maxWidthCustom={850}
      >
        {renderContent()}
      </UniversalModal>
    );
  }

  return renderContent();
};

export default PostDetailPage;
