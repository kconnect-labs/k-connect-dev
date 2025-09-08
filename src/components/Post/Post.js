import React, {
  useState,
  useContext,
  useEffect,
  useRef,
  Suspense,
} from 'react';
import {
  Box,
  Typography,
  Avatar,
  Snackbar,
  Button,
  CircularProgress,
  Alert,
  Tooltip,
  useTheme,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { MusicContext } from '../../context/MusicContext';
import { useLanguage } from '../../context/LanguageContext';
import ReactMarkdown from 'react-markdown';
import {
  formatTimeAgo,
  formatTimeAgoDiff,
  parseDate,
  getRussianWordForm,
} from '../../utils/dateUtils';
import {
  optimizeImage,
  handleImageError as safeImageError,
} from '../../utils/imageUtils';
import {
  linkRenderers,
  URL_REGEX,
  USERNAME_MENTION_REGEX,
  HASHTAG_REGEX,
  processTextWithLinks,
  LinkPreview,
  GroupedLinkPreviews,
} from '../../utils/LinkUtils';
import { getMarkdownComponents } from './MarkdownConfig';
import {
  Repeat2,
  Link2,
  Heart,
  MessageCircle,
  RefreshCw,
  Share2,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  UserCheck,
} from 'lucide-react';

import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';

import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FlagIcon from '@mui/icons-material/Flag';
import EditIcon from '@mui/icons-material/Edit';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import { usePostDetail } from '../../context/PostDetailContext';

import { VerificationBadge } from '../../UIKIT';
import Badge from '../../UIKIT/Badge/Badge';
import { MaxIcon } from '../icons/CustomIcons';


import SimpleImageViewer from '../SimpleImageViewer';
import ImageGrid from './ImageGrid';
import RepostImageGrid from './RepostImageGrid';
import MusicTrack from './MusicTrack';


const VideoPlayer = React.lazy(() => import('../VideoPlayer'));




const ReportDialog = React.lazy(() => import('./ReportDialog'));
const FactModal = React.lazy(() => import('./FactModal'));
const RepostModal = React.lazy(() => import('./RepostModal'));
const DeleteDialog = React.lazy(() => import('./DeleteDialog'));
const EditPostDialog = React.lazy(() => import('./EditPostDialog'));


import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';

import MediaErrorDisplay from './MediaErrorDisplay';
import {
  processImages,
  processImageDimensions,
  hasVideo,
  formatVideoUrl,
  formatVideoPosterUrl,
  getCoverPath,
  formatDuration,
  truncateText,
  getOptimizedImageUrl,
  isPostEditable,
  getRandomRotation,
  getRandomSize,
  incrementViewCount,

  createLightboxHandlers,
  createMenuHandlers,
  createCopyLinkHandler,
  createToggleExpandedHandler,
  createTrackPlayHandler,
  createOpenPostFromMenuHandler,
  createCloseRepostModalHandler,
  createCommentClickHandler,
  createShareHandler,
  createOpenImageHandler,
} from './utils/postUtils';
import HeartAnimation from './HeartAnimation';
import ChannelTag from './ChannelTag';
import ShowMoreButton from './ShowMoreButton';
import MarkdownContent from './MarkdownContent';
import { UniversalMenu } from '../../UIKIT';
import MetaWarningBanner from './MetaWarningBanner';
import {
  skeletonKeyframes,
  PostCard,
} from './styles/PostStyles';

const Post = ({
  post,
  onDelete,
  onOpenLightbox,
  isPinned: isPinnedPost,
  statusColor,
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const theme = useTheme();
  const { user: currentUser } = useContext(AuthContext);
  const { playTrack, currentTrack, isPlaying, togglePlay } =
    useContext(MusicContext);
  const { setPostDetail, openPostDetail } = usePostDetail();


  
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth <= 600 : false
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = () => setIsMobile(window.innerWidth <= 600);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const [liked, setLiked] = useState(
    post?.user_liked || post?.is_liked || false
  );
  const [likesCount, setLikesCount] = useState(post?.likes_count || 0);
  const [viewsCount, setViewsCount] = useState(post?.views_count || 0);

  const [clickTimer, setClickTimer] = useState(null);
  const isCurrentUserPost =
    currentUser && post?.user && currentUser.id === post.user.id;
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const menuOpen = Boolean(menuAnchorEl);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [reposted, setReposted] = useState(post?.is_reposted || false);
  const [repostModalOpen, setRepostModalOpen] = useState(false);
  const [repostContent, setRepostContent] = useState('');
  const [repostLoading, setRepostLoading] = useState(false);


  
  const [isPinned, setIsPinned] = useState(isPinnedPost || false);
  const [editDialog, setEditDialog] = useState({
    open: false,
    content: post?.content || '',
    loading: false,
    previews: [],
    deleteImages: false,
    deleteVideo: false,
    deleteMusic: false,
  });

  const [musicTracks, setMusicTracks] = useState([]);

  const [isExpanded, setIsExpanded] = useState(false);
  const [needsExpandButton, setNeedsExpandButton] = useState(false);
  const contentRef = useRef(null);

  const [processedContent, setProcessedContent] = useState('');
  const [postUrls, setPostUrls] = useState([]);
  const [repostUrls, setRepostUrls] = useState([]);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'error',
  });

  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    deleting: false,
    deleted: false,
  });

  const [reportDialog, setReportDialog] = useState({
    open: false,
    reason: '',
    submitting: false,
    submitted: false,
    error: null,
  });
  const [mediaError, setMediaError] = useState({ type: null, url: null });

  const [showSensitive, setShowSensitive] = useState(false);

  const [factModal, setFactModal] = useState({
    open: false,
    loading: false,
    error: null,
  });

  const [lastComment, setLastComment] = useState(null);
  const [lastCommentLoading, setLastCommentLoading] = useState(false);

  
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  
  const [hearts, setHearts] = useState([]);
  const [lastTap, setLastTap] = useState({ time: 0, x: 0, y: 0 });

  const reportReasons = [
    t('post.report.reasons.spam'),
    t('post.report.reasons.insult'),
    t('post.report.reasons.inappropriate_content'),
    t('post.report.reasons.violation'),
    t('post.report.reasons.misinformation'),
    t('post.report.reasons.harmful_content'),
    t('post.report.reasons.other'),
  ];

  
  const { handleCloseLightbox, handleNextImage, handlePrevImage } = createLightboxHandlers(
    setLightboxOpen,
    setCurrentImageIndex,
    processImages,
    post,
    mediaError
  );

  const { handleMenuOpen, handleMenuClose } = createMenuHandlers(setMenuAnchorEl);

  
  const handleCopyLink = createCopyLinkHandler(post.id);
  const toggleExpanded = createToggleExpandedHandler(setIsExpanded);

  
  const handleTrackPlay = createTrackPlayHandler(currentTrack, togglePlay, playTrack);
  const handleOpenPostFromMenu = createOpenPostFromMenuHandler(setPostDetail);
  const handleCloseRepostModal = createCloseRepostModalHandler(setRepostModalOpen);

  
  const handleCommentClick = createCommentClickHandler(openPostDetail);
  const handleShare = createShareHandler(post.id);

  
  const handleOpenImage = createOpenImageHandler(
    post,
    mediaError,
    onOpenLightbox,
    setCurrentImageIndex,
    setLightboxOpen
  );

  useEffect(() => {
    if (post) {
      setLiked(post.user_liked || post.is_liked || false);
      setLikesCount(post.likes_count || 0);
      setViewsCount(post.views_count || 0);
      setReposted(post.is_reposted || false);

      setIsExpanded(false);

      setEditDialog(prev => ({
        ...prev,
        content: post.content || '',
      }));

      if (post.content) {
        let content = post.content;
        USERNAME_MENTION_REGEX.lastIndex = 0;
        HASHTAG_REGEX.lastIndex = 0;
        URL_REGEX.lastIndex = 0;

        
        const urlMarkers = [];
        let markerIndex = 0;

        
        content = content.replace(URL_REGEX, match => {
          const marker = `__URL_MARKER_${markerIndex}__`;
          urlMarkers.push({
            marker,
            replacement: `[${match}](${match.startsWith('http') ? match : `https://${match}`})`,
          });
          markerIndex++;
          return marker;
        });

        
        content = content.replace(
          USERNAME_MENTION_REGEX,
          (match, prefix, username) => {
            const adjustedMatch = prefix
              ? match.substring(prefix.length)
              : match;
            return `${prefix || ''}[${adjustedMatch}](/profile/${username})`;
          }
        );

        
        content = content.replace(HASHTAG_REGEX, (match, hashtag) => {
          return `[${match}](https://k-connect.ru/search?q=${encodeURIComponent(hashtag)}&type=posts)`;
        });

        
        urlMarkers.forEach(({ marker, replacement }) => {
          content = content.replace(marker, replacement);
        });

        setProcessedContent(content);
        
        
        const urls = [];
        URL_REGEX.lastIndex = 0;
        let urlMatch;
        while ((urlMatch = URL_REGEX.exec(post.content)) !== null) {
          urls.push(urlMatch[0]);
        }
        setPostUrls(urls);
      } else {
        setProcessedContent('');
        setPostUrls([]);
      }

      
      if (post.type === 'repost' && post.original_post && post.original_post.content) {
        const repostUrls = [];
        URL_REGEX.lastIndex = 0;
        let urlMatch;
        while ((urlMatch = URL_REGEX.exec(post.original_post.content)) !== null) {
          repostUrls.push(urlMatch[0]);
        }
        setRepostUrls(repostUrls);
      } else {
        setRepostUrls([]);
      }



      
      if (post.last_comment) {
        setLastComment(post.last_comment);
        setLastCommentLoading(false);
      } else {
        setLastComment(null);
        setLastCommentLoading(false);
      }

      try {
        if (post.music) {
          let parsedTracks;

          if (typeof post.music === 'string') {
            try {
              parsedTracks = JSON.parse(post.music);
            } catch (parseError) {
              parsedTracks = [];
            }
          } else if (Array.isArray(post.music)) {
            parsedTracks = post.music;
          } else {
            parsedTracks = [];
          }

          setMusicTracks(Array.isArray(parsedTracks) ? parsedTracks : []);
        } else {
          setMusicTracks([]);
        }
      } catch (musicError) {
        setMusicTracks([]);
      }
    }
  }, [post]);





  useEffect(() => {
    const checkHeight = () => {
      if (contentRef.current) {
        const contentHeight = contentRef.current.scrollHeight;
        setNeedsExpandButton(contentHeight > 450);
      }
    };

    const timeoutId = setTimeout(() => {
      checkHeight();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [post?.content]);







  const handleLike = async e => {
    if (e) e.stopPropagation();

    
    if (!post?.id || post.id === 'undefined') {
      console.warn('handleLike: post.id is undefined or invalid:', post?.id);
      return;
    }

    const wasLiked = liked;
    const prevCount = likesCount;

    try {
      setLiked(!wasLiked);
      setLikesCount(wasLiked ? Math.max(0, prevCount - 1) : prevCount + 1);

      const response = await axios.post(`/api/posts/${post.id}/like`);
      if (response.data) {
        setLiked(response.data.liked);
        setLikesCount(response.data.likes_count);
      }
    } catch (error) {
      console.error('Error liking post:', error);
      setLiked(wasLiked);
      setLikesCount(prevCount);

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



  const handleDelete = () => {
    handleMenuClose();
    setDeleteDialog({ ...deleteDialog, open: true });
  };

  const handleEdit = () => {
    handleMenuClose();
    if (!isPostEditable(post)) {
      setSnackbar({
        open: true,
        message:
          'Редактирование доступно только в течение 3 часов после публикации',
        severity: 'warning',
      });
      return;
    }

    setEditDialog({
      ...editDialog,
      open: true,
      content: post.content || '',
      deleteImages: false,
      deleteVideo: false,
      deleteMusic: false,
      newImages: [],
      newVideo: null,
      previews: [],
      error: null,
    });
  };

  const handleCloseEditDialog = () => {
    setEditDialog({
      ...editDialog,
      open: false,
      error: null,
      previews: [],
    });
  };

  const handleEditContentChange = e => {
    setEditDialog({
      ...editDialog,
      content: e.target.value,
    });
  };

  const handleEditImageSelect = e => {
    const files = Array.from(e.target.files);

    const fileObjects = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setEditDialog({
      ...editDialog,
      newImages: [...editDialog.newImages, ...files],
      previews: [...editDialog.previews, ...fileObjects.map(fo => fo.preview)],
    });
  };

  const handleEditVideoSelect = e => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      setEditDialog({
        ...editDialog,
        newVideo: file,
      });
    }
  };

  const handleToggleDeleteImages = () => {
    setEditDialog({
      ...editDialog,
      deleteImages: !editDialog.deleteImages,
    });
  };

  const handleToggleDeleteVideo = () => {
    setEditDialog({
      ...editDialog,
      deleteVideo: !editDialog.deleteVideo,
    });
  };

  const handleToggleDeleteMusic = () => {
    setEditDialog({
      ...editDialog,
      deleteMusic: !editDialog.deleteMusic,
    });
  };

  const handleSubmitEdit = async () => {
    
    if (!post?.id || post.id === 'undefined') {
      console.warn('handleSubmitEdit: post.id is undefined or invalid:', post?.id);
      setEditDialog({
        ...editDialog,
        error: 'Ошибка: не удалось определить ID поста',
      });
      return;
    }

    try {
      if (!isPostEditable(post)) {
        setEditDialog({
          ...editDialog,
          error:
            'Время редактирования истекло. Посты можно редактировать только в течение 3 часов после публикации.',
        });
        return;
      }

      if (
        !editDialog.content.trim() &&
        (!editDialog.newImages || editDialog.newImages.length === 0) &&
        (!editDialog.newVideo || editDialog.newVideo === null)
      ) {
        setEditDialog({
          ...editDialog,
          error:
            'Пост не может быть пустым. Пожалуйста, добавьте текст или файлы.',
        });
        return;
      }

      setEditDialog({ ...editDialog, submitting: true, error: null });

      const formData = new FormData();
      formData.append('content', editDialog.content);

      formData.append('delete_images', editDialog.deleteImages);
      formData.append('delete_video', editDialog.deleteVideo);
      formData.append('delete_music', editDialog.deleteMusic);

      editDialog.newImages.forEach((image, index) => {
        formData.append(`images[${index}]`, image);
      });

      if (editDialog.newVideo) {
        formData.append('video', editDialog.newVideo);
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

        setEditDialog({
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
        });

        setSnackbar({
          open: true,
          message: 'Пост успешно обновлен',
          severity: 'success',
        });
      } else {
        throw new Error(response.data.error || 'Ошибка при обновлении поста');
      }
    } catch (error) {
      console.error('Error updating post:', error);
      setEditDialog({
        ...editDialog,
        submitting: false,
        error:
          error.response?.data?.error ||
          error.message ||
          'Ошибка при обновлении поста',
      });
    }
  };

  const confirmDelete = async () => {
    
    if (!post?.id || post.id === 'undefined') {
      console.warn('confirmDelete: post.id is undefined or invalid:', post?.id);
      setDeleteDialog({ open: false, deleting: false, deleted: false });
      setSnackbar({
        open: true,
        message: 'Ошибка: не удалось определить ID поста',
        severity: 'error',
      });
      return;
    }

    try {
      setDeleteDialog({ ...deleteDialog, deleting: true });

      
      if (onDelete) {
        onDelete(post.id);
      }

      
      if (axios.cache) {
        axios.cache.clearPostsCache();
        axios.cache.clearByUrlPrefix(`/api/profile/pinned_post`);
        axios.cache.clearByUrlPrefix(`/api/posts/${post.id}`);
      }

      
      await axios.delete(`/api/posts/${post.id}`);

      
      setDeleteDialog({ open: false, deleting: false, deleted: false });
    } catch (error) {
      console.error('Error deleting post:', error);
      setDeleteDialog({ open: false, deleting: false, deleted: false });

      
      setSnackbar({
        open: true,
        message: 'Не удалось удалить пост. Попробуйте позже.',
        severity: 'error',
      });
    }
  };

  const handleRepostClick = e => {
    e.stopPropagation();
    if (!currentUser) {
      navigate('/login');
      return;
    }

    setRepostContent('');
    setRepostModalOpen(true);
  };

  const handleOpenRepostModal = e => {
    e.stopPropagation();
    setRepostModalOpen(true);
  };



  const handleCreateRepost = async () => {
    if (repostLoading) return;

    
    if (!post?.id || post.id === 'undefined') {
      console.warn('handleCreateRepost: post.id is undefined or invalid:', post?.id);
      setSnackbarMessage('Ошибка: не удалось определить ID поста');
      setSnackbarOpen(true);
      return;
    }

    try {
      setRepostLoading(true);

      const response = await axios.post(`/api/posts/${post.id}/repost`, {
        text: repostContent,
      });

      if (response.data.success) {
        setRepostModalOpen(false);
        setReposted(true);

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
        setSnackbarMessage(
          response.data.error || 'Произошла ошибка при репосте'
        );
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error creating repost:', error);

      setSnackbarMessage(
        error.response?.data?.error || 'Произошла ошибка при репосте'
      );
      setSnackbarOpen(true);
    } finally {
      setRepostLoading(false);
    }
  };













  const postRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          if (post?.id && post.id !== 'undefined') {
            incrementViewCount(post.id, viewsCount).then(newViewsCount => {
              if (newViewsCount !== viewsCount) {
                setViewsCount(newViewsCount);
              }
            });
          } else {
            console.warn('Post ID is undefined or invalid:', post?.id);
          }

          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.5 }
    );

    if (postRef.current) {
      observer.observe(postRef.current);
    }

    return () => {
      if (postRef.current) {
        observer.unobserve(postRef.current);
      }
    };
  }, [post?.id]);

  const handleReportSubmit = async () => {
    
    if (!post?.id || post.id === 'undefined') {
      console.warn('handleReportSubmit: post.id is undefined or invalid:', post?.id);
      setReportDialog({
        ...reportDialog,
        error: 'Ошибка: не удалось определить ID поста',
      });
      return;
    }

    if (!reportDialog.reason) {
      setReportDialog({
        ...reportDialog,
        error: t('post.report_dialog.select_reason'),
      });
      return;
    }

    setReportDialog({ ...reportDialog, submitting: true, error: null });

    try {
      
      const createdDate = post.created_at ? new Date(post.created_at).toLocaleString('ru-RU') : 'Дата не указана';
      
      const reportDescription = `Информация о посте:
• Автор: ${post.user?.name} (@${post.user?.username})
• ID поста: ${post.id}
• Создан: ${createdDate}

Содержание поста:
${post.content ? post.content.substring(0, 500) + (post.content.length > 500 ? '...' : '') : 'Пост содержит только медиа-контент'}

Дополнительная информация:
• Лайки: ${post.likes_count || 0}
• Комментарии: ${post.comments_count || 0}
• Репосты: ${post.reposts_count || 0}`;

      const response = await axios.post('/api/complaints', {
        target_type: 'post',
        target_id: post.id,
        reason: reportDialog.reason,
        description: reportDescription,
        evidence: post.content || 'Пост содержит медиа-контент'
      });

      if (response.data && response.data.success) {
        setReportDialog({
          ...reportDialog,
          submitting: false,
          submitted: true,
        });
        
        
        if (typeof showNotification === 'function') {
          showNotification('success', 'Жалоба отправлена модераторам');
        }

        setTimeout(() => {
          setReportDialog({
            open: false,
            reason: '',
            submitting: false,
            submitted: false,
            error: null,
          });
        }, 2000);
      } else {
        throw new Error(response.data?.error || t('post.report_dialog.error'));
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      setReportDialog({
        ...reportDialog,
        submitting: false,
        error: error.response?.data?.error || t('post.report_dialog.error'),
      });
    }
  };

  const handleReportClick = () => {
    handleMenuClose();
    setReportDialog({ ...reportDialog, open: true });
  };

  const handleFactsClick = () => {
    handleMenuClose();
    setFactModal({ ...factModal, open: true });
  };

  const handleFactModalClose = () => {
    setFactModal({ open: false, loading: false, error: null });
  };

  const handleFactSubmit = async factData => {
    
    if (!post?.id || post.id === 'undefined') {
      console.warn('handleFactSubmit: post.id is undefined or invalid:', post?.id);
      setFactModal({
        ...factModal,
        loading: false,
        error: 'Ошибка: не удалось определить ID поста',
      });
      return;
    }

    setFactModal({ ...factModal, loading: true, error: null });

    try {
      if (post.fact) {
        
        await axios.put(`/api/facts/${post.fact.id}`, factData);
      } else {
        
        const factResponse = await axios.post('/api/facts', factData);
        const factId = factResponse.data.fact.id;
        await axios.post(`/api/posts/${post.id}/attach-fact`, {
          fact_id: factId,
        });
      }

      
      window.location.reload();
    } catch (error) {
      console.error('Error submitting fact:', error);
      setFactModal({
        ...factModal,
        loading: false,
        error: error.response?.data?.error || 'Ошибка при сохранении факта',
      });
    }
  };

  const handleFactDelete = async () => {
    
    if (!post?.id || post.id === 'undefined') {
      console.warn('handleFactDelete: post.id is undefined or invalid:', post?.id);
      setFactModal({
        ...factModal,
        loading: false,
        error: 'Ошибка: не удалось определить ID поста',
      });
      return;
    }

    setFactModal({ ...factModal, loading: true, error: null });

    try {
      
      await axios.delete(`/api/posts/${post.id}/detach-fact`);

      
      window.location.reload();
    } catch (error) {
      console.error('Error deleting fact:', error);
      setFactModal({
        ...factModal,
        loading: false,
        error: error.response?.data?.error || 'Ошибка при удалении факта',
      });
    }
  };

  const handlePostClick = e => {
    if (e.target.closest('a, button')) return;
    
    if (post?.id && post.id !== 'undefined') {
      incrementViewCount(post.id, viewsCount);
    }
  };







  const addHeart = (x, y) => {
    const newHeart = {
      id: `${Date.now()}-${Math.random()}-${hearts.length}`,
      x,
      y,
      rotation: getRandomRotation(),
      size: getRandomSize(),
    };

    setHearts(prevHearts => [...prevHearts, newHeart]);

    setTimeout(() => {
      setHearts(prevHearts =>
        prevHearts.filter(heart => heart.id !== newHeart.id)
      );
    }, 1000);
  };

  const handleDoubleClick = e => {
    e.stopPropagation();

    if (clickTimer) {
      clearTimeout(clickTimer);
      setClickTimer(null);
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

    if (!liked) {
      handleLike(e);
    }
  };

  const handleTouchStart = e => {
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
    const timeDiff = now - lastTap.time;

    if (timeDiff < 300) {
      if (clickTimer) {
        clearTimeout(clickTimer);
        setClickTimer(null);
      }

      const rect = e.currentTarget.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      const xDiff = Math.abs(x - lastTap.x);
      const yDiff = Math.abs(y - lastTap.y);

      if (xDiff < 30 && yDiff < 30) {
        e.preventDefault();

        addHeart(x, y);

        if (!liked) {
          handleLike();
        }
      }
    }

    setLastTap({
      time: now,
      x: touch.clientX - e.currentTarget.getBoundingClientRect().left,
      y: touch.clientY - e.currentTarget.getBoundingClientRect().top,
    });
  };

  const handleClick = e => {
    if (hearts.length > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      addHeart(x, y);
    }
  };

  const handleImageError = url => {
    console.log('Ошибка загрузки изображения:', url);
    setMediaError({ type: 'image', url });
  };

  const handleVideoError = url => {
    console.log('Ошибка загрузки видео:', url);
    setMediaError({ type: 'video', url });
  };


  const handlePinPost = async () => {
    if (!post?.id || post.id === 'undefined') {
      console.warn('handlePinPost: post.id is undefined or invalid:', post?.id);
      window.dispatchEvent(
        new CustomEvent('show-error', {
          detail: {
            message: 'Ошибка: не удалось определить ID поста',
            shortMessage: 'Ошибка',
            notificationType: 'error',
          },
        })
      );
      return;
    }

    try {
      if (isPinned) {
        await axios.post(
          '/api/profile/unpin_post',
          {},
          {
            headers: {
              'Cache-Control': 'no-cache',
            },
          }
        );
        setIsPinned(false);
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
        setIsPinned(true);
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

  const markdownComponents = getMarkdownComponents();

  
  const NSFWOverlay = (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 2,
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: isMobile ? 2 : 4,
        textAlign: 'center',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: isMobile ? 1 : 2,
        }}
      >
        <ShieldOutlinedIcon
          sx={{ fontSize: isMobile ? 48 : 72, color: '#bdbdbd' }}
        />
        <Typography
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -54%)',
            color: '#fff',
            fontWeight: 700,
            fontSize: isMobile ? 8 : 14,
            letterSpacing: 0.5,
            userSelect: 'none',
            pointerEvents: 'none',
            textShadow: '0 1px 2px rgba(0,0,0,0.18)',
          }}
        >
          18+
        </Typography>
      </Box>
      <Typography
        variant='h6'
        sx={{
          fontWeight: 500,
          mb: isMobile ? 1 : 2,
          color: '#fff',
          fontSize: isMobile ? '1rem' : '1.25rem',
        }}
      >
        Деликатный контент
      </Typography>
      <Button
        variant='contained'
        disableElevation
        sx={{
          borderRadius: '8px',
          fontWeight: 500,
          mb: isMobile ? 1 : 2,
          background: '#5c5b5e',
          color: '#fff',
          boxShadow: 'none',
          fontSize: isMobile ? '0.75rem' : '0.85rem',
          px: isMobile ? 0.5 : 1,
          py: isMobile ? 0.25 : 0.5,
        }}
        onClick={() => setShowSensitive(true)}
      >
        Посмотреть
      </Button>
      <Typography
        variant='caption'
        sx={{
          color: '#bdbdbd',
          opacity: 0.7,
          mt: isMobile ? 1 : 2,
          fontSize: isMobile ? '0.75rem' : '0.9rem',
          wordBreak: 'break-word',
          maxWidth: '100%',
        }}
      >
        Тут может быть шокирующий контент
      </Typography>
    </Box>
  );



  
  const menuItems = React.useMemo(() => {
    const items = [];

    
    if (currentUser && currentUser.id === 3) {
      items.push({
        id: 'facts',
        label: 'Факты',
        icon: <FactCheckIcon fontSize='small' />,
        onClick: handleFactsClick,
      });
    }

    
    if (isCurrentUserPost) {
      items.push(
        {
          id: 'edit',
          label: t('post.menu_actions.edit'),
          icon: <EditIcon fontSize='small' />,
          onClick: handleEdit,
        },
        {
          id: 'delete',
          label: t('post.menu_actions.delete'),
          icon: <DeleteIcon fontSize='small' />,
          onClick: handleDelete,
          danger: true,
        },
        {
          id: 'pin',
          label: isPinned ? t('post.menu_actions.unpin') : t('post.menu_actions.pin'),
          icon: isPinned ? <PushPinIcon fontSize='small' /> : <PushPinOutlinedIcon fontSize='small' />,
          onClick: handlePinPost,
        }
      );
    }

    
    items.push({
      id: 'copy-link',
      label: t('post.menu_actions.copy_link'),
      icon: <Link2 size={16} />,
      onClick: handleCopyLink,
    });

    
    if (!isCurrentUserPost) {
      items.push({
        id: 'report',
        label: t('post.menu_actions.report'),
        icon: <FlagIcon fontSize='small' />,
        onClick: handleReportClick,
        danger: true,
      });
    }

    return items;
  }, [currentUser, isCurrentUserPost, isPinned, t]);

  return (
    <>
      <style>{skeletonKeyframes}</style>
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <linearGradient
            id='heartGradient'
            x1='0%'
            y1='0%'
            x2='100%'
            y2='100%'
          >
            <stop offset='0%' stopColor='#e0bbff' />
            <stop offset='50%' stopColor='#d1aaff' />
            <stop offset='100%' stopColor='#c299ff' />
          </linearGradient>
        </defs>
      </svg>

      <PostCard
        isPinned={isPinned}
        statusColor={statusColor}
        onClick={handlePostClick}

        onDoubleClick={handleDoubleClick}
        onTouchStart={handleTouchStart}
        ref={postRef}
        elevation={0}
        sx={{
          overflow: 'visible',
          mb: 1,
          borderRadius: 1,
          border: isPinned
            ? `1px solid ${statusColor ? `${statusColor}33` : 'rgba(140, 82, 255, 0.2)'}`
            : '1px solid rgba(255, 255, 255, 0.1)',
          borderColor: isPinned ? statusColor || 'primary.main' : 'divider',
          cursor: 'auto',
          position: 'relative',
        }}
      >
        <AnimatePresence>
          {hearts.map(heart => (
            <HeartAnimation
              key={heart.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 1, 0],
                scale: [0, 1.2, 1.5, 0.8],
                y: [0, -10, -20],
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 1, times: [0, 0.2, 0.8, 1] }}
              style={{
                left: `${heart.x - heart.size / 2}px`,
                top: `${heart.y - heart.size / 2}px`,
                transform: `rotate(${heart.rotation}deg)`,
              }}
            >
              <Heart size={heart.size} />
            </HeartAnimation>
          ))}
        </AnimatePresence>

        <Box sx={{ px: 2, pt: 2, pb: 1.5 }}>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar
                src={
                  post.user
                    ? getOptimizedImageUrl(
                        post.user?.avatar_url ||
                          `/static/uploads/avatar/${post.user?.id}/${post.user?.photo}`
                      )
                    : '/static/uploads/avatar/system/avatar.png'
                }
                alt={post.user?.name || 'User'}
                component={Link}
                to={`/profile/${post.user?.username || 'unknown'}`}
                onClick={e => e.stopPropagation()}
                sx={{
                  width: 40,
                  height: 40,
                  mr: 1.5,
                }}
              />
              <Box sx={{ flex: 1, whiteSpace: 'nowrap' }}>
                <Typography
                  variant='subtitle1'
                  component={Link}
                  to={`/profile/${post.user?.username}`}
                  onClick={e => e.stopPropagation()}
                  sx={{
                    fontWeight: 'bold',
                    textDecoration: 'none',
                    color: 'text.primary',
                    '&:hover': {
                      color: 'primary.main',
                    },
                    display: 'flex',
                    alignItems: 'center',
                    height: '24px',
                  }}
                >
                  {post.user?.name}

                  {isPinned && (
                    <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                      <Tooltip title={t('post.pin.tooltip')}>
                        <span>
                          <PushPinIcon
                            sx={{
                              fontSize: 16,
                              color: statusColor || 'primary.main',
                            }}
                          />
                        </span>
                      </Tooltip>
                    </Box>
                  )}

                  {(post.user?.account_type === 'channel' ||
                    post.user?.is_channel === true) && (
                    <ChannelTag
                      label={t('post.channel.label')}
                      size='small'
                      sx={{ ml: 1, height: 20 }}
                    />
                  )}

                  {post.user?.verification &&
                    ((typeof post.user.verification === 'number' && post.user.verification > 0) ||
                     (typeof post.user.verification === 'object' && post.user.verification.status > 0)) &&
                    (() => {
                      const status = typeof post.user.verification === 'number' 
                        ? post.user.verification 
                        : post.user.verification.status;
                      
                      return status === 6 ? (
                        <CheckCircle
                          size={24}
                          color="#1e88e5"
                          style={{
                            marginLeft: '4px',
                          }}
                        />
                      ) : status === 7 ? (
                        <UserCheck
                          size={24}
                          color="#7c4dff"
                          style={{
                            marginLeft: '4px',
                          }}
                        />
                      ) : (
                        <VerificationBadge
                          status={status}
                          size='small'
                        />
                      );
                    })()}
                  {(post.user?.subscription?.type === 'max' ||
                    post.user?.subscription_type === 'max' ||
                    post.user?.subscription?.subscription_type === 'max') && (
                    <MaxIcon size={24} color="#FF4D50" style={{ marginLeft: '5px' }} />
                  )}
                  {post.user?.achievement && (
                    <Box sx={{ mt: 'auto' }}>
                      <Badge achievement={post.user.achievement} size='post' />
                    </Box>
                  )}
                </Typography>
                <Typography
                  variant='caption'
                  color='text.secondary'
                  sx={{ display: 'block', fontSize: '0.75rem' }}
                >
                  {formatTimeAgo(post.timestamp)}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ position: 'relative' }}>
            <MarkdownContent
              ref={contentRef}
              isExpanded={isExpanded}
              sx={{
                mb: 2,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
              }}
            >
              {processedContent && (
                <ReactMarkdown
                  components={markdownComponents}
                  urlTransform={url => url}
                >
                  {processedContent}
                </ReactMarkdown>
              )}
            </MarkdownContent>

            {needsExpandButton && !isExpanded && (
              <ShowMoreButton onClick={toggleExpanded}>
                <Typography variant='body2' sx={{ mr: 1 }}>
                  Показать полностью
                </Typography>
                <ChevronDown size={20} />
              </ShowMoreButton>
            )}

            {isExpanded && (
              <Button
                variant='text'
                size='small'
                onClick={toggleExpanded}
                startIcon={
                  <ChevronUp size={20} />
                }
                sx={{
                  display: 'flex',
                  mt: 1,
                  color: 'primary.main',
                  textTransform: 'none',
                }}
              >
                Свернуть
              </Button>
            )}

            {/* Баннер предупреждения о Meta */}
            <MetaWarningBanner content={post?.content || ''} />
          </Box>

          {/* Отображение репоста (пост внутри поста) */}
          {post.type === 'repost' &&
            post.original_post &&
            post.original_post.user && (
              <Box
                sx={{
                  mb: 2,
                  mt: 1,
                  px: 2,
                  py: 1.5,
                  borderRadius: '12px',
                  border: theme =>
                    `1px solid ${
                      theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.1)'
                        : 'rgba(0, 0, 0, 0.12)'
                    }`,
                  backgroundColor: theme =>
                    theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.03)'
                      : 'rgba(0, 0, 0, 0.03)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: theme =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(0, 0, 0, 0.05)',
                    borderColor: theme =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.15)'
                        : 'rgba(0, 0, 0, 0.2)',
                  },
                }}
              >
                {/* Заголовок с информацией о репосте */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                  <Repeat2
                    size={16}
                    color={theme.palette.primary.main}
                    style={{ marginRight: '4px' }}
                  />
                  <Typography
                    variant='caption'
                    color='text.secondary'
                    component={Link}
                    to={`/profile/${post.original_post.user?.username || 'unknown'}`}
                    onClick={e => {
                      e.stopPropagation();
                    }}
                    sx={{
                      textDecoration: 'none',
                      '&:hover': {
                        color: 'primary.main',
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    Репост от
                  </Typography>
                  <Avatar
                    src={
                      post.original_post.user?.photo &&
                      post.original_post.user?.photo !== 'avatar.png'
                        ? post.original_post.user?.avatar_url
                        : `/static/uploads/avatar/system/avatar.png`
                    }
                    alt={post.original_post.user?.name || 'User'}
                    component={Link}
                    to={`/profile/${post.original_post.user?.username || 'unknown'}`}
                    onClick={e => e.stopPropagation()}
                    sx={{
                      width: 18,
                      height: 18,
                      ml: 0.5,
                      mr: 0.5,
                    }}
                  />
                  <Typography
                    variant='caption'
                    color='text.primary'
                    component={Link}
                    to={`/profile/${post.original_post.user?.username || 'unknown'}`}
                    onClick={e => {
                      e.stopPropagation();
                    }}
                    sx={{
                      fontWeight: 'medium',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',

                    }}
                  >
                    {post.original_post.user?.name || 'Unknown'}
                    {post.original_post.user?.verification &&
                      ((typeof post.original_post.user.verification === 'number' && post.original_post.user.verification > 0) ||
                       (typeof post.original_post.user.verification === 'object' && post.original_post.user.verification.status > 0)) && (
                        <VerificationBadge
                          status={typeof post.original_post.user.verification === 'number' 
                            ? post.original_post.user.verification 
                            : post.original_post.user.verification.status}
                          size='small'
                        />
                      )}
                    {(post.original_post.user?.subscription?.type === 'max' ||
                      post.original_post.user?.subscription_type === 'max' ||
                      post.original_post.user?.subscription?.subscription_type === 'max') && (
                      <MaxIcon size={24} color="#FF4D50" style={{ marginLeft: '5px' }} />
                    )}
                    {post.original_post.user?.achievement && (
                      <Box sx={{ ml: 0.5, mt: 'auto' }}>
                        <Badge
                          achievement={post.original_post.user.achievement}
                          size='post'
                        />
                      </Box>
                    )}
                  </Typography>
                </Box>

                {/* Контент оригинального поста */}
                <Box
                  onClick={e => {
                    e.stopPropagation();

                    openPostDetail(post.original_post.id);
                  }}
                  sx={{
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'block',
                    cursor: 'pointer',
                  }}
                >
                  {post.original_post.content && (
                    <Box sx={{ mb: 1 }}>
                      <Typography
                        variant='body2'
                        sx={{
                          color: 'text.primary',
                          fontSize: '0.9rem',
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {truncateText(post.original_post.content, 500)}
                        {post.original_post.content.length > 500 && (
                          <Box
                            component='span'
                            sx={{
                              color: 'primary.main',
                              cursor: 'pointer',
                              display: 'inline-block',
                              fontSize: '0.85rem',
                              ml: 0.5,
                            }}
                            onClick={e => {
                              e.stopPropagation();
                              openPostDetail(post.original_post.id);
                            }}
                          >
                            Читать далее
                          </Box>
                        )}
                      </Typography>

                      {/* Отображение ссылок для репоста */}
                      {(() => {
                        const { urls } = processTextWithLinks(
                          truncateText(post.original_post.content, 500),
                          theme
                        );
                        return null; 
                      })()}
                    </Box>
                  )}

                  {/* Replacing the single image with our new RepostImageGrid component */}
                  {post.original_post.image && (
                    <Box sx={{ mb: 1 }}>
                      <RepostImageGrid
                        images={
                          post.original_post.images || [
                            post.original_post.image,
                          ]
                        }
                        onImageClick={index => {
                          setCurrentImageIndex(index);
                          setLightboxImages(
                            post.original_post.images || [
                              post.original_post.image,
                            ]
                          );
                          setLightboxOpen(true);
                        }}
                        imageDimensions={processImageDimensions(post.original_post)}
                      />
                    </Box>
                  )}

                  {/* Видео оригинального поста (если есть) */}
                  {post.original_post.video && (
                    <Box sx={{ mt: 1 }}>
                      <Suspense
                        fallback={
                          <Box
                            sx={{
                              width: '100%',
                              height: 200,
                              bgcolor: 'rgba(255,255,255,0.1)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <CircularProgress />
                          </Box>
                        }
                      >
                        <VideoPlayer
                          videoUrl={post.original_post.video}
                          poster={
                            post.original_post.video_poster 
                              ? formatVideoPosterUrl(post.original_post.video_poster, post.original_post.id)
                              : (processImages(post.original_post, mediaError).length > 0
                                ? formatVideoUrl(processImages(post.original_post, mediaError)[0])
                                : '/static/images/video_placeholder.png')
                          }
                          onError={() => {
                            console.error(
                              'Repost video failed to load:',
                              post.original_post.video
                            );
                          }}
                        />
                      </Suspense>
                    </Box>
                  )}

                  {/* Блок фактов оригинального поста в репосте */}
                  {post.original_post.fact && (
                    <Box
                      sx={{
                        mt: 1.5,
                        p: 1.5,
                        borderRadius: '8px',
                        backgroundColor: 'var(--theme-background, rgba(255, 255, 255, 0.03))',
                        backdropFilter: 'var(--theme-backdrop-filter, blur(8px))',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        position: 'relative',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '8px',
                          height: '100%',
                          backgroundColor: '#6e5a9d',
                          borderRadius: '8px 0 0 8px',
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            color: 'rgba(255, 255, 255, 0.9)',
                          }}
                        >
                          Проверка фактов
                        </Typography>
                        <Tooltip
                          title='Это разъяснение было предоставлено организацией'
                          placement='top'
                          arrow
                          sx={{
                            '& .MuiTooltip-tooltip': {
                              backgroundColor: 'rgba(0, 0, 0, 0.8)',
                              backdropFilter: 'blur(10px)',
                              fontSize: '0.7rem',
                              maxWidth: 180,
                            },
                          }}
                        >
                          <span>
                            <Box
                              sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 14,
                                height: 14,
                                borderRadius: '50%',
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                cursor: 'help',
                                fontSize: '0.65rem',
                                color: 'rgba(255, 255, 255, 0.7)',
                                '&:hover': {
                                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                },
                              }}
                            >
                              ?
                            </Box>
                          </span>
                        </Tooltip>
                      </Box>

                      <Typography
                        sx={{
                          fontSize: '0.75rem',
                          lineHeight: 1.4,
                          color: 'rgba(255, 255, 255, 0.8)',
                        }}
                      >
                        {post.original_post.fact.explanation_text}
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: '0.7rem',
                          color: 'rgba(255, 255, 255, 0.6)',
                          fontStyle: 'italic',
                        }}
                      >
                        Предоставлено {post.original_post.fact.who_provided}
                      </Typography>
                    </Box>
                  )}

                  {/* Баннер предупреждения о Meta для репоста */}
                  <MetaWarningBanner
                    content={post.original_post?.content || ''}
                  />

                  {/* Статистика оригинального поста */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mt: 1,
                      pt: 1,
                      borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                      opacity: 0.7,
                    }}
                  >
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      sx={{ fontSize: '0.7rem' }}
                    >
                      {formatTimeAgo(post.original_post.timestamp)}
                    </Typography>

                    <Box
                      sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <VisibilityIcon
                          sx={{
                            fontSize: 12,
                            mr: 0.5,
                            color: 'text.secondary',
                          }}
                        />
                        <Typography
                          variant='caption'
                          color='text.secondary'
                          sx={{ fontSize: '0.7rem' }}
                        >
                          {post.original_post.views_count || 0}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            )}

          {post.video && mediaError.type !== 'video' ? (
            <Box
              sx={{
                mb: 2,
                position: 'relative',
                borderRadius: '12px',
                overflow: 'hidden',
              }}
              data-no-navigate
            >
              <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                <Box
                  sx={{
                    filter:
                      post.is_nsfw && !showSensitive ? 'blur(16px)' : 'none',
                    transition: 'filter 0.3s',
                    pointerEvents:
                      post.is_nsfw && !showSensitive ? 'none' : 'auto',
                    width: '100%',
                    height: '100%',
                  }}
                >
                  <Suspense
                    fallback={
                      <Box
                        sx={{
                          width: '100%',
                          height: 200,
                          bgcolor: 'rgba(255,255,255,0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <CircularProgress />
                      </Box>
                    }
                  >
                                                       <VideoPlayer
                                     videoUrl={post.video}
                                     poster={
                        post.video_poster 
                          ? formatVideoPosterUrl(post.video_poster, post.id)
                          : (processImages(post, mediaError).length > 0
                                         ? formatVideoUrl(processImages(post, mediaError)[0])
                            : '/static/images/video_placeholder.png')
                                     }
                      onError={() => handleVideoError(post.video)}
                    />
                  </Suspense>
                </Box>
                {post.is_nsfw && !showSensitive && NSFWOverlay}
              </Box>
            </Box>
          ) : (
            mediaError.type === 'video' && (
              <Box sx={{ mb: 2 }}>
                <MediaErrorDisplay type='video' t={t} />
              </Box>
            )
          )}

                                   {processImages(post, mediaError).length > 0 && mediaError.type !== 'image' ? (
            <Box
              sx={{
                mb: 2,
                width: '100%',
                position: 'relative',
                borderRadius: '12px',
                overflow: 'hidden',
              }}
              data-no-navigate
            >
              <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                <Box
                  sx={{
                    filter:
                      post.is_nsfw && !showSensitive ? 'blur(16px)' : 'none',
                    transition: 'filter 0.3s',
                    pointerEvents:
                      post.is_nsfw && !showSensitive ? 'none' : 'auto',
                    width: '100%',
                    height: '100%',
                  }}
                >
                  <ImageGrid
                    images={processImages(post, mediaError)}
                    onImageClick={handleOpenImage}
                    onImageError={handleImageError}
                    imageDimensions={processImageDimensions(post)}
                  />
                </Box>
                {post.is_nsfw && !showSensitive && NSFWOverlay}
              </Box>
            </Box>
          ) : (
            mediaError.type === 'image' && (
              <Box sx={{ mb: 2 }}>
                <MediaErrorDisplay type='image' t={t} />
              </Box>
            )
          )}

          {musicTracks.length > 0 && (
            <Box sx={{ mt: 0, mb: 0 }}>
              {musicTracks.map((track, index) => (
                <MusicTrack key={`track-${index}`} onClick={e => handleTrackPlay(track, e)}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '8px',
                        overflow: 'hidden',
                        position: 'relative',
                        mr: 2,
                        flexShrink: 0,
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.15)',
                        bgcolor: 'rgba(0, 0, 0, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <img
                        src={getCoverPath(track)}
                        alt={track.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                        onError={safeImageError}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          background:
                            'linear-gradient(145deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.3))',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {currentTrack &&
                        currentTrack.id === track.id &&
                        isPlaying ? (
                          <PauseIcon
                            sx={{
                              color: 'white',
                              fontSize: 18,
                              filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.3))',
                            }}
                          />
                        ) : (
                          <PlayArrowIcon
                            sx={{
                              color: 'white',
                              fontSize: 18,
                              filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.3))',
                            }}
                          />
                        )}
                      </Box>
                    </Box>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant='body2'
                        noWrap
                        sx={{
                          fontWeight:
                            currentTrack && currentTrack.id === track.id
                              ? 'medium'
                              : 'normal',
                          color:
                            currentTrack && currentTrack.id === track.id
                              ? 'primary.main'
                              : 'text.primary',
                          fontSize: '0.85rem',
                        }}
                      >
                        {track.title}
                      </Typography>
                      <Typography
                        variant='caption'
                        color='text.secondary'
                        noWrap
                      >
                        {track.artist}
                      </Typography>
                    </Box>

                    <Typography
                      variant='caption'
                      color='text.secondary'
                      sx={{
                        py: 0.4,
                        px: 1,
                        borderRadius: '12px',
                        background: 'var(--theme-background, rgba(255, 255, 255, 0.03))',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        fontSize: '0.7rem',
                        ml: 1,
                      }}
                    >
                      {formatDuration(track.duration)}
                    </Typography>
                  </MusicTrack>
              ))}
            </Box>
          )}

          {/* Блок фактов */}
          {post?.fact && (
            <Box
              sx={{
                mt: 1,
                mb: 1,
                p: 2,
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                backdropFilter: 'blur(50px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '8px',
                  height: '100%',
                  backgroundColor: '#6e5a9d',
                  borderRadius: '8px 0 0 8px',
                },
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 1,
                  gap: 0.5,
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    color: 'rgba(255, 255, 255, 0.9)',
                  }}
                >
                  Проверка фактов
                </Typography>
                <Tooltip
                  title='Это разъяснение было предоставлено организацией'
                  placement='top'
                  arrow
                  sx={{
                    '& .MuiTooltip-tooltip': {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      backdropFilter: 'blur(10px)',
                      fontSize: '0.75rem',
                      maxWidth: 200,
                    },
                  }}
                >
                  <span>
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        cursor: 'help',
                        fontSize: '0.7rem',
                        color: 'rgba(255, 255, 255, 0.7)',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        },
                      }}
                    >
                      ?
                    </Box>
                  </span>
                </Tooltip>
              </Box>

              <Typography
                sx={{
                  fontSize: '0.85rem',
                  lineHeight: 1.5,
                  color: 'rgba(255, 255, 255, 0.8)',
                  mb: 1.5,
                }}
              >
                {post.fact.explanation_text}
              </Typography>

              <Typography
                sx={{
                  fontSize: '0.75rem',
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontStyle: 'italic',
                }}
              >
                Это разъяснение было предоставлено {post.fact.who_provided}
              </Typography>
            </Box>
          )}

          {/* Link Previews - отображаются после всего контента, но перед кнопками действий */}
          {(postUrls.length > 0 || repostUrls.length > 0) && (
            <GroupedLinkPreviews 
              urls={[...postUrls, ...repostUrls]} 
              maxCount={3} 
            />
          )}

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 2,
              gap: 1.7, 
            }}
          >
            {/* Левая группа: лайк, коммент, репост, поделиться */}
            <Box
              sx={{
                display: 'flex',
                gap: 1.7,
                background: 'rgba(0, 0, 0, 0.05)',
                backdropFilter: 'blur(40px)',
                WebkitBackdropFilter: 'blur(0px)',
                border: '1px solid #333',
                borderRadius: '10px',
                px: 2.5,
                py: 0.85,
                alignItems: 'center',
              }}
            >

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                }}
                onClick={handleLike}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 21,
                    height: 21,
                  }}
                >
                  {liked ? (
                    <Heart
                      size={21}
                      color={theme.palette.primary.main}
                      fill={theme.palette.primary.main}
                    />
                  ) : (
                    <Heart
                      size={21}
                      color='#fff'
                    />
                  )}
                </Box>
                {likesCount > 0 && (
                  <Typography
                    sx={{ color: '#fff', fontSize: '0.85rem', ml: 0.4 }}
                  >
                    {likesCount}
                  </Typography>
                )}
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                }}
                onClick={(e) => handleCommentClick(post.id, e)}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 21,
                    height: 21,
                  }}
                >
                  <MessageCircle
                    size={21}
                    color='#fff'
                  />
                </Box>
                {(post?.total_comments_count || post?.comments_count) > 0 && (
                  <Typography
                    sx={{ color: '#fff', fontSize: '0.85rem', ml: 0.4 }}
                  >
                    {post?.total_comments_count || post?.comments_count}
                  </Typography>
                )}
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                }}
                onClick={handleRepostClick}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 21,
                    height: 21,
                  }}
                >
                  <RefreshCw
                    size={21}
                    color='#fff'
                  />
                </Box>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                }}
                onClick={handleShare}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 21,
                    height: 21,
                  }}
                >
                  <Share2
                    size={21}
                    color='#fff'
                  />
                </Box>
              </Box>
            
            </Box>

            {/* Правая группа: просмотры и меню */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                borderRadius: '10px', 
                px: 1.2, 
                py: 0.85, 
                minWidth: 68, 
                justifyContent: 'center',
                gap: 0.5, 
              }}
            >
              {/* <VisibilityIcon sx={{ color: '#fff', mr: 0.85, fontSize:14 }} />
              <Typography sx={{ color: '#fff', fontSize: '0.65rem', mr: 1.7 }}>{viewsCount}</Typography> */}
              <MoreVertIcon
                sx={{ color: '#fff', cursor: 'pointer', fontSize: 21 }}
                onClick={handleMenuOpen}
                data-no-navigate
              />
            </Box>
          </Box>

          {/* Компонент последнего комментария в стиле ВК */}
          {lastComment && !lastCommentLoading && (
            <Box
              sx={{
                padding: '12px',
                borderRadius: '0 0 12px 12px',
                background: 'rgba(255, 255, 255, 0.03)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                marginTop: '12px',
                marginBottom: '-13px',
                marginLeft: '-17px',
                marginRight: '-17px',
              }}
              onClick={(e) => handleCommentClick(post.id, e)}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                {/* Аватар автора комментария */}
                <Avatar
                  src={
                    lastComment.user?.avatar_url ||
                    `/static/uploads/avatar/${lastComment.user?.id}/${lastComment.user?.photo || 'avatar.png'}`
                  }
                  alt={lastComment.user?.name || 'User'}
                  sx={{
                    width: 28,
                    height: 28,
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    flexShrink: 0,
                  }}
                  onError={safeImageError}
                />

                {/* Контент комментария */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  {/* Имя автора и время */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 0.5,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        color: 'rgba(255, 255, 255, 0.9)',
                        textDecoration: 'none',
                        '&:hover': {
                          color: '#D0BCFF',
                        },
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      component={Link}
                      to={`/profile/${lastComment.user?.username || 'unknown'}`}
                      onClick={e => e.stopPropagation()}
                    >
                      {lastComment.user?.name || 'Пользователь'}
                      {(lastComment.user?.verification?.status > 0 || 
                        lastComment.user?.verification_status === 'verified' ||
                        lastComment.user?.verification_status > 0) && (
                          <VerificationBadge
                            status={lastComment.user?.verification?.status || lastComment.user?.verification_status}
                            size='small'
                          />
                        )}
                      {(lastComment.user?.subscription?.type === 'max' || 
                        lastComment.user?.subscription_type === 'max' ||
                        lastComment.user?.subscription?.subscription_type === 'max') && (
                        <MaxIcon size={20} color="#FF4D50" style={{ marginLeft: '5px' }} />
                      )}
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: '0.7rem',
                        color: 'rgba(255, 255, 255, 0.5)',
                        ml: 'auto',
                      }}
                    >
                      {formatTimeAgo(lastComment.timestamp)}
                    </Typography>
                  </Box>

                  {/* Текст комментария */}
                  <Typography
                    sx={{
                      fontSize: '0.8rem',
                      lineHeight: 1.4,
                      color: 'rgba(255, 255, 255, 0.85)',
                      wordBreak: 'break-word',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {lastComment.content}
                  </Typography>

                  {/* Изображение комментария (если есть) */}
                  {lastComment.image && (
                    <Box
                      sx={{
                        mt: 0.8,
                        borderRadius: '8px',
                        overflow: 'hidden',
                        maxWidth: 120,
                        maxHeight: 80,
                      }}
                    >
                      <img
                        src={lastComment.image}
                        alt='Comment'
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                        onError={safeImageError}
                      />
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          )}

          {/* Скелетон загрузки последнего комментария */}
          {lastCommentLoading && (
            <Box
              sx={{
                mt: 1.5,
                mb: 1.5,
                p: 1.5,
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)',
                    flexShrink: 0,
                  }}
                />
                <Box sx={{ flex: 1 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 0.5,
                    }}
                  >
                    <Box
                      sx={{
                        width: 80,
                        height: 12,
                        borderRadius: '6px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        animation: 'pulse 1.5s ease-in-out infinite',
                      }}
                    />
                    <Box
                      sx={{
                        width: 50,
                        height: 10,
                        borderRadius: '5px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        animation: 'pulse 1.5s ease-in-out infinite',
                        animationDelay: '0s',
                      }}
                    />
                  </Box>
                  <Box
                    sx={{
                      width: '100%',
                      height: 16,
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      animation: 'pulse 1.5s ease-in-out infinite',
                      animationDelay: '0.4s',
                    }}
                  />
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </PostCard>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />

      <UniversalMenu
        anchorEl={menuAnchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        items={menuItems}
        onClick={e => e.stopPropagation()}
      />

      <Suspense fallback={null}>
        <RepostModal
          open={repostModalOpen}
          onClose={handleCloseRepostModal}
          post={post}
          repostContent={repostContent}
          setRepostContent={setRepostContent}
          repostLoading={repostLoading}
          handleCreateRepost={handleCreateRepost}
          t={t}
        />
      </Suspense>

      {lightboxOpen && !onOpenLightbox && (
        <SimpleImageViewer
          isOpen={lightboxOpen}
          onClose={handleCloseLightbox}
          images={processImages(post, mediaError)}
          initialIndex={currentImageIndex}
        />
      )}

      <Suspense fallback={null}>
        <DeleteDialog
          open={deleteDialog.open}
          onClose={() =>
            !deleteDialog.deleting &&
            !deleteDialog.deleted &&
            setDeleteDialog({ ...deleteDialog, open: false })
          }
          deleteDialog={deleteDialog}
          setDeleteDialog={setDeleteDialog}
          confirmDelete={confirmDelete}
          t={t}
        />
      </Suspense>

      <Suspense fallback={null}>
        <ReportDialog
          open={reportDialog.open}
          onClose={() =>
            !reportDialog.submitting &&
            !reportDialog.submitted &&
            setReportDialog({ ...reportDialog, open: false })
          }
          reportDialog={reportDialog}
          t={t}
          post={post}
          reportReasons={reportReasons}
          setReportDialog={setReportDialog}
          handleReportSubmit={handleReportSubmit}
          submitting={reportDialog.submitting}
          error={reportDialog.error}
        />
      </Suspense>

      <Suspense fallback={null}>
        <FactModal
          open={factModal.open}
          onClose={handleFactModalClose}
          onSubmit={handleFactSubmit}
          onDelete={handleFactDelete}
          loading={factModal.loading}
          error={factModal.error}
          existingFact={post.fact}
          postId={post.id}
        />
      </Suspense>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Suspense fallback={null}>
        <EditPostDialog
          open={editDialog.open}
          onClose={() => !editDialog.submitting && handleCloseEditDialog()}
          editDialog={editDialog}
          t={t}
          post={post}
          handleEditContentChange={handleEditContentChange}
          handleToggleDeleteImages={handleToggleDeleteImages}
          handleToggleDeleteVideo={handleToggleDeleteVideo}
          handleToggleDeleteMusic={handleToggleDeleteMusic}
          handleSubmitEdit={handleSubmitEdit}
          submitting={editDialog.submitting}
          error={editDialog.error}
        />
      </Suspense>


    </>
  );
};

export default Post;
