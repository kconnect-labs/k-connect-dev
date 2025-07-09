import React, { useState, useContext, useEffect, useRef, lazy, Suspense } from 'react';
import { 
  Box, 
  Typography,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Card,
  styled,
  Button,
  CircularProgress,
  Alert,
  Tooltip,
  useTheme
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { MusicContext } from '../../context/MusicContext';
import { useLanguage } from '../../context/LanguageContext';
import ReactMarkdown from 'react-markdown';
import { formatTimeAgo, formatTimeAgoDiff, parseDate, getRussianWordForm } from '../../utils/dateUtils';
import { optimizeImage, handleImageError as safeImageError } from '../../utils/imageUtils';
import { linkRenderers, URL_REGEX, USERNAME_MENTION_REGEX, HASHTAG_REGEX, processTextWithLinks, LinkPreview } from '../../utils/LinkUtils';
import { Icon } from '@iconify/react';
import { MessageCircle, Repeat2, Link2, Heart } from 'lucide-react';

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

import { ContextMenu, useContextMenu } from '../../UIKIT';
import { VerificationBadge } from '../../UIKIT';

// Ленивая загрузка тяжелых компонентов
const SimpleImageViewer = React.lazy(() => import('../SimpleImageViewer'));
const VideoPlayer = React.lazy(() => import('../VideoPlayer'));
const ImageGrid = React.lazy(() => import('./ImageGrid'));
const RepostImageGrid = React.lazy(() => import('./RepostImageGrid'));
const MusicTrack = React.lazy(() => import('./MusicTrack'));
const Lottie = React.lazy(() => import('lottie-react'));
// Ленивая загрузка синтаксиса только когда нужен
const SyntaxHighlighter = React.lazy(() => import('react-syntax-highlighter').then(module => ({
  default: module.Prism
})));
const vscDarkPlus = React.lazy(() => import('react-syntax-highlighter/dist/esm/styles/prism').then(module => ({
  default: module.vscDarkPlus
})));
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';

import MediaErrorDisplay from './MediaErrorDisplay';
import HeartAnimation from './HeartAnimation';
import ChannelTag from './ChannelTag';
import ShowMoreButton from './ShowMoreButton';
import MarkdownContent from './MarkdownContent';
import BlurredMenu from './BlurredMenu';

const ReportDialog = lazy(() => import('./ReportDialog'));
const FactModal = lazy(() => import('./FactModal'));
const RepostModal = lazy(() => import('./RepostModal'));
const DeleteDialog = lazy(() => import('./DeleteDialog'));

// CSS анимация для скелетона
const skeletonKeyframes = `
  @keyframes pulse {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.4;
    }
    100% {
      opacity: 1;
    }
  }
`;

const PostCard = styled(Card, {
  shouldForwardProp: (prop) => !['isPinned', 'statusColor'].includes(prop),
})(({ theme, isPinned, statusColor }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: theme.spacing(1),
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  transition: 'box-shadow 0.3s ease-in-out',
  background: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: isPinned 
    ? `1px solid ${statusColor ? `${statusColor}33` : 'rgba(140, 82, 255, 0.2)'}` 
    : '1px solid rgba(255, 255, 255, 0.1)',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
  },
}));

const EditPostDialog = lazy(() => import('./EditPostDialog'));

const Post = ({ post, onDelete, onOpenLightbox, isPinned: isPinnedPost, statusColor }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const theme = useTheme();
  const { user: currentUser } = useContext(AuthContext);
  const { playTrack, currentTrack, isPlaying, togglePlay } = useContext(MusicContext);
  const { setPostDetail, openPostDetail } = usePostDetail();
  const { show: showContextMenu, contextMenuState, handleContextMenu, closeContextMenu } = useContextMenu();

  // Функция для форматирования времени с переводами
  const formatTimeAgoWithTranslation = (dateString) => {
    if (!dateString) return '';
    
    const date = parseDate(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    return formatTimeAgoDiff(diffInSeconds, t);
  };
  // вместо useMediaQuery используем window.matchMedia, чтобы убрать useSyncExternalStore
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth <= 600 : false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = () => setIsMobile(window.innerWidth <= 600);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  
  const [liked, setLiked] = useState(post?.user_liked || post?.is_liked || false);
  const [likesCount, setLikesCount] = useState(post?.likes_count || 0);
  const [viewsCount, setViewsCount] = useState(post?.views_count || 0);
  const [lastLikedUsers, setLastLikedUsers] = useState([]);
  const [clickTimer, setClickTimer] = useState(null); 
  const isCurrentUserPost = currentUser && post?.user && currentUser.id === post.user.id;
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
    deleteMusic: false
  });
  
  const [musicTracks, setMusicTracks] = useState([]);
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsExpandButton, setNeedsExpandButton] = useState(false);
  const contentRef = useRef(null);
  
  const [processedContent, setProcessedContent] = useState('');
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'error'
  });
  
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    deleting: false,
    deleted: false
  });
  
  const [reportDialog, setReportDialog] = useState({
    open: false,
    reason: '',
    submitting: false,
    submitted: false,
    error: null
  });
  const [mediaError, setMediaError] = useState({ type: null, url: null }); 
  
  const [showSensitive, setShowSensitive] = useState(false);
  
  const [factModal, setFactModal] = useState({
    open: false,
    loading: false,
    error: null
  });
  
  const [lastComment, setLastComment] = useState(null);
  const [lastCommentLoading, setLastCommentLoading] = useState(false);
  
  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Hearts animation state
  const [hearts, setHearts] = useState([]);
  const [lastTap, setLastTap] = useState({ time: 0, x: 0, y: 0 });
  
  const reportReasons = [
    t('post.report.reasons.spam'),
    t('post.report.reasons.insult'),
    t('post.report.reasons.inappropriate_content'),
    t('post.report.reasons.violation'),
    t('post.report.reasons.misinformation'),
    t('post.report.reasons.harmful_content'),
    t('post.report.reasons.other')
  ];
  
  useEffect(() => {
    if (post) {
      setLiked(post.user_liked || post.is_liked || false);
      setLikesCount(post.likes_count || 0);
      setViewsCount(post.views_count || 0);
      setReposted(post.is_reposted || false);
      
      setIsExpanded(false);
      
      setEditDialog(prev => ({
        ...prev,
        content: post.content || ''
      }));
      
      if (post.content) {
        let content = post.content;
        USERNAME_MENTION_REGEX.lastIndex = 0;
        HASHTAG_REGEX.lastIndex = 0;
        URL_REGEX.lastIndex = 0;
        
        // Обработка обычных ссылок
        content = content.replace(URL_REGEX, (match) => {
          return `[${match}](${match.startsWith('http') ? match : `https://${match}`})`;
        });

        // Обработка упоминаний пользователей
        content = content.replace(USERNAME_MENTION_REGEX, (match, prefix, username) => {
          const adjustedMatch = prefix ? match.substring(prefix.length) : match;
          return `${prefix || ''}[${adjustedMatch}](/profile/${username})`;
        });
        
        // Обработка хештегов
        content = content.replace(HASHTAG_REGEX, (match, hashtag) => {
          return `[${match}](https://k-connect.ru/search?q=${encodeURIComponent(hashtag)}&type=posts)`;
        });
        
        setProcessedContent(content);
      } else {
        setProcessedContent('');
      }
      
      if (post.id && post.likes_count > 0) {
        const postLikesCache = window._postLikesCache || {};
        const cachedData = postLikesCache[post.id];
        const now = Date.now();
        
        if (cachedData && cachedData.timestamp && (now - cachedData.timestamp < 5 * 60 * 1000)) {
          console.log(`Using cached likes data for post ${post.id} (from useEffect)`);
          setLastLikedUsers(cachedData.users);
        } else {
          fetchLastLikedUsers(post.id);
        }
      }
      
      // Загружаем последний комментарий (всегда, чтобы хуки вызывались в одинаковом порядке)
      if (post.id) {
        fetchLastComment(post.id);
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
          
          console.log('Parsed music tracks:', parsedTracks);
          setMusicTracks(Array.isArray(parsedTracks) ? parsedTracks : []);
        } else {
          setMusicTracks([]);
        }
      } catch (musicError) {
        setMusicTracks([]);
      }
    }
  }, [post]);
  
  const getCoverPath = (track) => {
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
  
  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  
  const truncateText = (text, maxLength = 500) => {
    if (!text || text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };
  
  const handleTrackPlay = (track, event) => {
    if (event) event.stopPropagation(); 
    
    const isCurrentlyPlaying = currentTrack && currentTrack.id === track.id;
    
    if (isCurrentlyPlaying) {
      togglePlay();
    } else {
      
      playTrack(track, 'post');
    }
  };
  
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

  const fetchLastLikedUsers = async (postId) => {
    try {
      const response = await axios.get(`/api/posts/${postId}/likes`, {
        params: { limit: 3 },
        forceRefresh: true
      });
      
      if (response.data && Array.isArray(response.data.users)) {
        setLastLikedUsers(response.data.users);
      }
    } catch (error) {
      console.error('Error fetching last liked users:', error);
    }
  };

  const fetchLastComment = async (postId) => {
    try {
      setLastCommentLoading(true);
      const response = await axios.get(`/api/posts/${postId}/comments`, {
        params: { page: 1, limit: 1 }
      });
      
      if (response.data.comments && response.data.comments.length > 0) {
        const comment = response.data.comments[0];
        setLastComment(comment);
      } else {
        setLastComment(null);
      }
    } catch (error) {
      setLastComment(null);
    } finally {
      setLastCommentLoading(false);
    }
  };

  const processImages = () => {
    if (mediaError.type === 'image') {
      return []; 
    }
    
    if (post?.images && Array.isArray(post.images) && post.images.length > 0) {
      return post.images;
    }
    
    if (post?.image && typeof post.image === 'string') {
      if (post.image.includes('||') || post.image.includes(',')) {
        return post.image.split(/[||,]/).map(url => url.trim()).filter(Boolean);
      }
      return [post.image];
    }
    
    return [];
  };
  
  const hasVideo = () => {
    return post?.video && typeof post.video === 'string' && post.video.trim() !== '';
  };
  
  const formatVideoUrl = (url) => {
    if (!url) return '';
    
    if (url.startsWith('http') || url.startsWith('//')) {
      return url;
    }
    
    if (url.startsWith('/static/uploads/post/')) {
      return url;
    }
    
    return `/static/uploads/post/${post.id}/${url}`;
  };
  
  const images = processImages();
  const videoUrl = hasVideo() ? formatVideoUrl(post.video) : null;
  
  const handleOpenImage = async (index) => {
    
    if (window.event) {
      window.event.stopPropagation();
    }

    
    if (onOpenLightbox && typeof onOpenLightbox === 'function') {
      const allImages = processImages();
      if (allImages.length > 0) {
        onOpenLightbox(allImages[index], allImages, index);
      }
      return;
    }
    
    
    const allImages = processImages();
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
  
  const handleCloseLightbox = () => {
    setLightboxOpen(false);
  };
  
  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };
  
  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };
  
  const handleLike = async (e) => {
    if (e) e.stopPropagation();
    
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
        let errorMessage = error.response.data.error || "Слишком много лайков. ";
        
        if (rateLimit && rateLimit.reset) {
          const resetTime = new Date(rateLimit.reset * 1000);
          const now = new Date();
          const diffSeconds = Math.round((resetTime - now) / 1000);
          
          if (!errorMessage.includes("подождите")) {
            if (diffSeconds > 60) {
              const minutes = Math.floor(diffSeconds / 60);
              const seconds = diffSeconds % 60;
              errorMessage += ` Пожалуйста, подождите ${minutes} мин. ${seconds} сек.`;
            } else {
              errorMessage += ` Пожалуйста, подождите ${diffSeconds} сек.`;
            }
          }
        }
        
        
        window.dispatchEvent(new CustomEvent('rate-limit-error', { 
          detail: { 
            message: errorMessage,
            shortMessage: "Лимит лайков",
            notificationType: "warning",
            animationType: "bounce", 
            retryAfter: rateLimit?.reset ? Math.round((new Date(rateLimit.reset * 1000) - new Date()) / 1000) : 60
          } 
        }));
      }
    }
  };

  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleDelete = () => {
    handleMenuClose();
    setDeleteDialog({ ...deleteDialog, open: true });
  };

  const handleEdit = () => {
    handleMenuClose();
    if (!isPostEditable()) {
      setSnackbar({
        open: true,
        message: "Редактирование доступно только в течение 3 часов после публикации",
        severity: 'warning'
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
      error: null
    });
  };

  const handleCloseEditDialog = () => {
    setEditDialog({
      ...editDialog,
      open: false,
      error: null,
      previews: []
    });
  };

  const handleEditContentChange = (e) => {
    setEditDialog({
      ...editDialog,
      content: e.target.value
    });
  };

  const handleEditImageSelect = (e) => {
    const files = Array.from(e.target.files);
    
    const fileObjects = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    
    setEditDialog({
      ...editDialog,
      newImages: [...editDialog.newImages, ...files],
      previews: [...editDialog.previews, ...fileObjects.map(fo => fo.preview)]
    });
  };

  const handleEditVideoSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      setEditDialog({
        ...editDialog,
        newVideo: file
      });
    }
  };

  const handleToggleDeleteImages = () => {
    setEditDialog({
      ...editDialog,
      deleteImages: !editDialog.deleteImages
    });
  };

  const handleToggleDeleteVideo = () => {
    setEditDialog({
      ...editDialog,
      deleteVideo: !editDialog.deleteVideo
    });
  };

  const handleToggleDeleteMusic = () => {
    setEditDialog({
      ...editDialog,
      deleteMusic: !editDialog.deleteMusic
    });
  };

  const handleSubmitEdit = async () => {
    try {
      if (!isPostEditable()) {
        setEditDialog({ 
          ...editDialog, 
          error: "Время редактирования истекло. Посты можно редактировать только в течение 3 часов после публикации." 
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
      
      const response = await axios.post(`/api/posts/${post.id}/edit`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
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
          error: null
        });
        
        setSnackbar({
          open: true,
          message: "Пост успешно обновлен",
          severity: 'success'
        });
      } else {
        throw new Error(response.data.error || 'Ошибка при обновлении поста');
      }
    } catch (error) {
      console.error('Error updating post:', error);
      setEditDialog({
        ...editDialog,
        submitting: false,
        error: error.response?.data?.error || error.message || 'Ошибка при обновлении поста'
      });
    }
  };

  const confirmDelete = async () => {
    try {
      setDeleteDialog({ ...deleteDialog, deleting: true });
      
      // Сразу удаляем пост из UI
      if (onDelete) {
        onDelete(post.id);
      }
      
      // Очищаем кеш
      if (axios.cache) {
        axios.cache.clearPostsCache();
        axios.cache.clearByUrlPrefix(`/api/profile/pinned_post`);
        axios.cache.clearByUrlPrefix(`/api/posts/${post.id}`);
      }
      
      // Отправляем запрос на удаление
      await axios.delete(`/api/posts/${post.id}`);
      
      // Закрываем диалог
      setDeleteDialog({ open: false, deleting: false, deleted: false });
      
    } catch (error) {
      console.error('Error deleting post:', error);
      setDeleteDialog({ open: false, deleting: false, deleted: false });
      
      // Показываем ошибку
      setSnackbar({
        open: true,
        message: "Не удалось удалить пост. Попробуйте позже.",
        severity: 'error'
      });
    }
  };
  
  const handleRepostClick = (e) => {
    e.stopPropagation();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    setRepostContent('');
    setRepostModalOpen(true);
  };
  
  
  const handleOpenRepostModal = (e) => {
    e.stopPropagation();
    setRepostModalOpen(true);
  };
  
  const handleCloseRepostModal = () => {
    setRepostModalOpen(false);
  };
  
  


  
  const handleCreateRepost = async () => {
    
    if (repostLoading) return;
    
    try {
      setRepostLoading(true);
      
      const response = await axios.post(`/api/posts/${post.id}/repost`, {
        text: repostContent
      });
      
      
      if (response.data.success) {
        
        setRepostModalOpen(false);
        setReposted(true);
        
        
        window.dispatchEvent(new CustomEvent('show-error', { 
          detail: { 
            message: 'Пост успешно добавлен в вашу ленту',
            shortMessage: "Репост создан",
            notificationType: "success",
            animationType: "pill"
          } 
        }));
        
        if (onDelete) {
          onDelete(post.id, null, 'repost');
        }
      } else {
        
        setSnackbarMessage(response.data.error || 'Произошла ошибка при репосте');
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
    }}

  
  const handleCommentClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Comment button clicked, opening overlay for post ID:", post.id);
    openPostDetail(post.id, e);
  };
  
  
  const handleShare = (e) => {
    e.stopPropagation();
    const postUrl = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(postUrl)
      .then(() => {
        window.dispatchEvent(new CustomEvent('show-error', { 
          detail: { 
            message: "Ссылка скопирована в буфер обмена",
            shortMessage: "Ссылка скопирована",
            notificationType: "success",
            animationType: "pill"
          } 
        }));
      })
      .catch(err => {
        console.error('Не удалось скопировать ссылку:', err);
        window.dispatchEvent(new CustomEvent('show-error', { 
          detail: { 
            message: "Не удалось скопировать ссылку",
            shortMessage: "Ошибка",
            notificationType: "error",
            animationType: "pill"
          } 
        }));
      });
  };

  
  const handleCopyLink = () => {
    try {
      const linkToCopy = `https://k-connect.ru/post/${post.id}`;
      navigator.clipboard.writeText(linkToCopy);
      
      
      window.dispatchEvent(new CustomEvent('show-error', { 
        detail: { 
          message: "Ссылка скопирована в буфер обмена",
          shortMessage: "Ссылка скопирована",
          notificationType: "success",
          animationType: "pill"
        } 
      }));
      
    } catch (error) {
      console.error('Ошибка при копировании ссылки:', error);
      
      
      window.dispatchEvent(new CustomEvent('show-error', { 
        detail: { 
          message: "Не удалось скопировать ссылку",
          shortMessage: "Ошибка копирования",
          notificationType: "error",
          animationType: "pill"
        } 
      }));
    }
  };

  
  const handleOpenPostFromMenu = () => {
    console.log("Opening post comments from context menu, ID:", post.id);
    
    
    setPostDetail(post.id);
  };

  
  const toggleExpanded = (e) => {
    e.stopPropagation(); 
    setIsExpanded(!isExpanded);
  };

  


  
  const getOptimizedImageUrl = (url) => {
    if (!url) return '/static/uploads/avatar/system/avatar.png';
    
    
    if (url.includes('format=webp')) {
      return url;
    }
    
    
    const supportsWebP = 'imageRendering' in document.documentElement.style;
    
    
    if (supportsWebP && (url.startsWith('/static/') || url.startsWith('/uploads/'))) {
      return `${url}${url.includes('?') ? '&' : '?'}format=webp`;
    }
    
    return url;
  };

  
  const isPostEditable = () => {
    if (!post?.timestamp) return false;
    
    const postTime = new Date(post.timestamp);
    const currentTime = new Date();
    const timeDifference = (currentTime - postTime) / (1000 * 60 * 60); 
    
    return timeDifference <= 3;
  };

  
  const incrementViewCount = async () => {
    
    if (post && post.id) {
      try {
        
        const viewKey = `post_viewed_${post.id}`;
        if (sessionStorage.getItem(viewKey)) {
          return;
        }

        
        sessionStorage.setItem(viewKey, 'true');

        
        const attemptViewCount = async (retries = 3) => {
          try {
            
            const response = await axios.post(`/api/posts/${post.id}/view`);
            if (response.data && response.data.success) {
              
              setViewsCount(response.data.views_count);
            }
          } catch (error) {
            
            if (retries > 1) {
              setTimeout(() => attemptViewCount(retries - 1), 1000); 
            }
          }
        };

        
        attemptViewCount();
      } catch (error) {
        console.error('Error incrementing view count:', error);
      }
    }
  };

  
  const postRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          console.log(`Post ${post.id} is more than 50% visible, triggering view count`);
          
          incrementViewCount();
          
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
    if (!reportDialog.reason) {
      setReportDialog({...reportDialog, error: t('post.report_dialog.select_reason')});
      return;
    }
    
    setReportDialog({...reportDialog, submitting: true, error: null});
    
    try {
      
      const reportMessage = `🚨 *ЖАЛОБА НА ПОСТ*\n\n` +
        `📝 *ID поста*: ${post.id}\n` +
        `👤 *Автор*: ${post.user?.name} (@${post.user?.username})\n` +
        `🚩 *Причина*: ${reportDialog.reason}\n` +
        `👮 *Отправитель*: ${currentUser?.name} (@${currentUser?.username})\n` +
        `⏰ *Время*: ${new Date().toLocaleString()}` +
        (post.content ? `\n\n📄 *Текст поста*:\n${post.content?.substring(0, 300)}${post.content?.length > 300 ? '...' : ''}` : `\n\n📄 *Пост содержит медиа-контент без текста*`);
      
      
      const response = await axios.post('/api/report/send-to-telegram', {
        message: reportMessage,
        post_id: post.id,
        reason: reportDialog.reason,
        post_author: post.user?.username,
        reporter: currentUser?.username
      });
      
      if (response.data && response.data.success) {
        setReportDialog({...reportDialog, submitting: false, submitted: true});
        
        setTimeout(() => {
          setReportDialog({open: false, reason: '', submitting: false, submitted: false, error: null});
        }, 2000);
      } else {
        throw new Error(response.data?.error || t('post.report_dialog.error'));
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      setReportDialog({
        ...reportDialog, 
        submitting: false, 
        error: error.response?.data?.error || t('post.report_dialog.error')
      });
    }
  };
  
  
  const handleReportClick = () => {
    handleMenuClose();
    setReportDialog({...reportDialog, open: true});
  };

  const handleFactsClick = () => {
    handleMenuClose();
    setFactModal({ ...factModal, open: true });
  };

  const handleFactModalClose = () => {
    setFactModal({ open: false, loading: false, error: null });
  };

  const handleFactSubmit = async (factData) => {
    setFactModal({ ...factModal, loading: true, error: null });
    
    try {
      if (post.fact) {
        // Обновляем существующий факт
        await axios.put(`/api/facts/${post.fact.id}`, factData);
      } else {
        // Создаем новый факт и привязываем к посту
        const factResponse = await axios.post('/api/facts', factData);
        const factId = factResponse.data.fact.id;
        await axios.post(`/api/posts/${post.id}/attach-fact`, { fact_id: factId });
      }
      
      // Перезагружаем страницу для обновления данных
      window.location.reload();
    } catch (error) {
      console.error('Error submitting fact:', error);
      setFactModal({ 
        ...factModal, 
        loading: false, 
        error: error.response?.data?.error || 'Ошибка при сохранении факта' 
      });
    }
  };

  const handleFactDelete = async () => {
    setFactModal({ ...factModal, loading: true, error: null });
    
    try {
      // Отвязываем факт от поста
      await axios.delete(`/api/posts/${post.id}/detach-fact`);
      
      // Перезагружаем страницу для обновления данных
      window.location.reload();
    } catch (error) {
      console.error('Error deleting fact:', error);
      setFactModal({ 
        ...factModal, 
        loading: false, 
        error: error.response?.data?.error || 'Ошибка при удалении факта' 
      });
    }
  };

  const handlePostClick = (e) => {
    if (e.target.closest('a, button')) return; 
    incrementViewCount();
  };
  
  const handlePostContextMenu = (e) => {
    
    e.stopPropagation();
    
    
    handleContextMenu(e, { postId: post.id });
  };
  
  
  const getContextMenuItems = () => {
    const items = [];
    
    items.push({
      id: 'share',
      label: t('post.context_menu.copy_link'),
      icon: <Link2 size={16} />,
      onClick: handleCopyLink 
    });
    
    items.push({
      id: 'comment',
      label: t('post.context_menu.comment'),
      icon: <MessageCircle size={16} />,
      onClick: handleOpenPostFromMenu 
    });
    
    // Добавляем кнопку "Факты" для пользователя с ID 3
    if (currentUser && currentUser.id === 3) {
      items.push({
        id: 'facts',
        label: 'Факты',
        icon: <FactCheckIcon fontSize="small" />,
        onClick: handleFactsClick
      });
    }
    
    if (isCurrentUserPost) {
      if (isPostEditable()) {
        items.push({
          id: 'edit',
          label: t('post.context_menu.edit'),
          icon: <EditIcon fontSize="small" />,
          onClick: () => handleEdit()
        });
      }
      
      items.push({
        id: 'delete',
        label: t('post.context_menu.delete'),
        icon: <DeleteIcon fontSize="small" />,
        onClick: () => handleDelete()
      });
    } else {
      items.push({
        id: 'report',
        label: t('post.context_menu.report'),
        icon: <FlagIcon fontSize="small" />,
        onClick: () => handleReportClick()
      });
    }
    
    return items;
  };
  
  
  const getRandomRotation = () => {
    const possibleAngles = [
      -60, -50, -45, -40, -35, 
      35, 40, 45, 50, 60
    ];
    
    return possibleAngles[Math.floor(Math.random() * possibleAngles.length)];
  };
  
  
  const getRandomSize = () => {
    return Math.floor(Math.random() * 40) + 60;
  };
  
  
  const addHeart = (x, y) => {
    const newHeart = {
      id: Date.now() + Math.random(),
      x,
      y,
      rotation: getRandomRotation(),
      size: getRandomSize()
    };
    
    setHearts(prevHearts => [...prevHearts, newHeart]);
    
    setTimeout(() => {
      setHearts(prevHearts => prevHearts.filter(heart => heart.id !== newHeart.id));
    }, 1000);
  };
  
  
  const handleDoubleClick = (e) => {
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

  
  const handleTouchStart = (e) => {
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
      y: touch.clientY - e.currentTarget.getBoundingClientRect().top
    });
  };
  
  
  const handleClick = (e) => {
    if (hearts.length > 0) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      addHeart(x, y);
    }
  };
  
  
  
  const handleImageError = (url) => {
    console.log('Ошибка загрузки изображения:', url);
    setMediaError({ type: 'image', url });
  };

  
  const handleVideoError = (url) => {
    console.log('Ошибка загрузки видео:', url);
    setMediaError({ type: 'video', url });
  };

  

  
  // Add pin post handler
  const handlePinPost = async () => {
    try {
      if (isPinned) {
        await axios.post('/api/profile/unpin_post', {}, {
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        setIsPinned(false);
        window.dispatchEvent(new CustomEvent('show-error', {
          detail: {
            message: t('post.pin.unpinned'),
            shortMessage: t('post.pin.unpinned_short'),
            notificationType: 'info',
            animationType: 'pill'
          }
        }));
        window.dispatchEvent(new CustomEvent('post-pinned-state-changed', {
          detail: { postId: post.id, isPinned: false }
        }));
      } else {
        await axios.post(`/api/profile/pin_post/${post.id}`, {}, {
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        setIsPinned(true);
        window.dispatchEvent(new CustomEvent('show-error', {
          detail: {
            message: t('post.pin.pinned'),
            shortMessage: t('post.pin.pinned_short'),
            notificationType: 'success',
            animationType: 'pill'
          }
        }));
        window.dispatchEvent(new CustomEvent('post-pinned-state-changed', {
          detail: { postId: post.id, isPinned: true }
        }));
      }
    } catch (error) {
      console.error(t('post.pin.pin_error'), error);
      window.dispatchEvent(new CustomEvent('show-error', {
        detail: {
          message: t('post.pin.error'),
          shortMessage: t('post.pin.error_short'),
          notificationType: 'error'
        }
      }));
    }
  };

  const markdownComponents = {
    ...linkRenderers,
    code({node, inline, className, children, ...props}) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={match[1]}
          PreTag="div"
          customStyle={{
            backgroundColor: 'transparent'
          }}
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
  };

  // NSFW Overlay (монотонный стиль)
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
      <Box sx={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', mb: isMobile ? 1 : 2 }}>
        <ShieldOutlinedIcon sx={{ fontSize: isMobile ? 48 : 72, color: '#bdbdbd' }} />
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
            textShadow: '0 1px 2px rgba(0,0,0,0.18)'
          }}
        >
          18+
        </Typography>
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 500, mb: isMobile ? 1 : 2, color: '#fff', fontSize: isMobile ? '1rem' : '1.25rem' }}>
        Деликатный контент
      </Typography>
      <Button
        variant="contained"
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
      <Typography variant="caption" sx={{ color: '#bdbdbd', opacity: 0.7, mt: isMobile ? 1 : 2, fontSize: isMobile ? '0.75rem' : '0.9rem', wordBreak: 'break-word', maxWidth: '100%' }}>
        Тут может быть шокирующий контент
      </Typography>
    </Box>
  );

  // Добавляем эффект для hover-появления аватарок
  useEffect(() => {
    const likeBox = document.querySelectorAll('.like-avatars');
    const parentBox = document.querySelectorAll('[data-like-parent]');
    parentBox.forEach((el, idx) => {
      el.onmouseenter = () => {
        if (likeBox[idx]) {
          likeBox[idx].style.opacity = 1;
          likeBox[idx].style.pointerEvents = 'auto';
          likeBox[idx].style.transform = 'translateY(-50%) translateX(8px)';
        }
      };
      el.onmouseleave = () => {
        if (likeBox[idx]) {
          likeBox[idx].style.opacity = 0;
          likeBox[idx].style.pointerEvents = 'none';
          likeBox[idx].style.transform = 'translateY(-50%)';
        }
      };
    });
    return () => {
      parentBox.forEach((el, idx) => {
        el.onmouseenter = null;
        el.onmouseleave = null;
      });
    };
  }, [lastLikedUsers, isMobile]);

  const FactCard = styled(Box)(({ theme }) => ({
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2),
    borderRadius: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: '4px',
      height: '100%',
      backgroundColor: '#FFA726',
      borderRadius: '2px 0 0 2px',
    }
  }));

  const FactHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(1.5),
    gap: theme.spacing(0.5),
  }));

  const FactTitle = styled(Typography)(({ theme }) => ({
    fontWeight: 600,
    fontSize: '0.9rem',
    color: 'rgba(255, 255, 255, 0.9)',
  }));

  const FactText = styled(Typography)(({ theme }) => ({
    fontSize: '0.85rem',
    lineHeight: 1.5,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: theme.spacing(1.5),
  }));

  const FactFooter = styled(Typography)(({ theme }) => ({
    fontSize: '0.75rem',
    color: 'rgba(255, 255, 255, 0.6)',
    fontStyle: 'italic',
  }));

  return (
    <>
      <style>{skeletonKeyframes}</style>
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e0bbff" />
            <stop offset="50%" stopColor="#d1aaff" />
            <stop offset="100%" stopColor="#c299ff" />
          </linearGradient>
        </defs>
      </svg>
      
      <PostCard
        isPinned={isPinned}
        statusColor={statusColor}
        onClick={handlePostClick}
        onContextMenu={handlePostContextMenu}
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
          borderColor: isPinned ? (statusColor || 'primary.main') : 'divider',
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
                y: [0, -10, -20]
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 1, times: [0, 0.2, 0.8, 1] }}
              style={{ 
                left: `${heart.x - (heart.size/2)}px`, 
                top: `${heart.y - (heart.size/2)}px`,
                transform: `rotate(${heart.rotation}deg)`
              }}
            >
              <Heart size={heart.size} />
            </HeartAnimation>
          ))}
        </AnimatePresence>
        
        <Box sx={{ px: 2, pt: 2, pb: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar 
                src={post.user ? getOptimizedImageUrl(post.user?.avatar_url || `/static/uploads/avatar/${post.user?.id}/${post.user?.photo}`) : '/static/uploads/avatar/system/avatar.png'} 
                alt={post.user?.name || 'User'}
                component={Link}
                to={`/profile/${post.user?.username || 'unknown'}`}
                onClick={(e) => e.stopPropagation()}
                sx={{ 
                  width: 40, 
                  height: 40,
                  mr: 1.5
                }}
              />
              <Box sx={{ flex: 1 , whiteSpace: 'nowrap' }}>
                <Typography 
                  variant="subtitle1"
                  component={Link}
                  to={`/profile/${post.user?.username}`}
                  onClick={(e) => e.stopPropagation()}
                  sx={{ 
                    fontWeight: 'bold',
                    textDecoration: 'none',
                    color: 'text.primary',
                    '&:hover': {
                      color: 'primary.main'
                    },
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {post.user?.name}
                  
                  {isPinned && (
                    <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                      <Tooltip title={t('post.pin.tooltip')}>
                        <span>
                          <PushPinIcon sx={{ 
                            fontSize: 16, 
                            color: statusColor || 'primary.main'
                          }} />
                        </span>
                      </Tooltip>
                    </Box>
                  )}
                  
                  {(post.user?.account_type === 'channel' || post.user?.is_channel === true) && (
                    <ChannelTag 
                      label={t('post.channel.label')}
                      size="small"
                      sx={{ ml: 1, height: 20 }}
                    />
                  )}
                  
                  {post.user?.verification && post.user?.verification.status > 0 && (
                    post.user.verification.status === 6 ? (
                      <Icon 
                        icon="material-symbols:verified-rounded" 
                        style={{ 
                          fontSize: '24px',
                          color: '#1e88e5',
                          marginLeft: '4px' 
                        }} 
                      />
                    ) : post.user.verification.status === 7 ? (
                      <Icon 
                        icon="material-symbols:verified-user-rounded" 
                        style={{ 
                          fontSize: '24px',
                          color: '#7c4dff',
                          marginLeft: '4px' 
                        }} 
                      />
                    ) : (
                      <VerificationBadge 
                        status={post.user.verification.status} 
                        size="small" 
                      />
                    )
                  )}
                  {post.user?.achievement && (
                    <Box 
                      component="img" 
                      sx={{ 
                        width: 'auto', 
                        height: 20,  
                        ml: 0.5
                      }} 
                      src={`/static/images/bages/${post.user.achievement.image_path}`} 
                      alt={post.user.achievement.bage}
                      onError={safeImageError}
                    />
                  )}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.75rem' }}>
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
                  urlTransform={(url) => url}
                >
                  {processedContent}
                </ReactMarkdown>
              )}
            </MarkdownContent>
            
            {needsExpandButton && !isExpanded && (
              <ShowMoreButton onClick={toggleExpanded}>
                <Typography variant="body2" sx={{ mr: 1 }}>
                  Показать полностью
                </Typography>
                <Icon icon="solar:alt-arrow-down-bold" width="20" height="20" />
              </ShowMoreButton>
            )}
            
            {isExpanded && (
              <Button
                variant="text"
                size="small"
                onClick={toggleExpanded}
                startIcon={<Icon icon="solar:alt-arrow-up-bold" width="20" height="20" />}
                sx={{ 
                  display: 'flex',
                  mt: 1,
                  color: 'primary.main',
                  textTransform: 'none'
                }}
              >
                Свернуть
              </Button>
            )}
          </Box>
          
          {/* Отображение репоста (пост внутри поста) */}
          {post.type === 'repost' && post.original_post && (
            <Box 
              sx={{ 
                mb: 2, 
                mt: 1,
                px: 2, 
                py: 1.5, 
                borderRadius: '12px', 
                border: theme => `1px solid ${theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.1)' 
                  : 'rgba(0, 0, 0, 0.12)'}`,
                backgroundColor: theme => theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.03)'
                  : 'rgba(0, 0, 0, 0.03)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: theme => theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.05)'
                    : 'rgba(0, 0, 0, 0.05)',
                  borderColor: theme => theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.15)'
                    : 'rgba(0, 0, 0, 0.2)'
                }
              }}
            >
              {/* Заголовок с информацией о репосте */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <Repeat2 size={16} color={theme.palette.primary.main} style={{ marginRight: '4px' }} />
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  component={Link}
                  to={`/profile/${post.original_post.user?.username}`}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  sx={{ 
                    textDecoration: 'none',
                    '&:hover': {
                      color: 'primary.main',
                      textDecoration: 'underline'
                    }
                  }}
                >
                  Репост от
                </Typography>
                <Avatar
                  src={post.original_post.user?.photo && post.original_post.user?.photo !== 'avatar.png'
                    ? post.original_post.user?.avatar_url
                    : `/static/uploads/avatar/system/avatar.png`}
                  alt={post.original_post.user?.name || "User"}
                  component={Link}
                  to={`/profile/${post.original_post.user?.username}`}
                  onClick={(e) => e.stopPropagation()}
                  sx={{ 
                    width: 18, 
                    height: 18, 
                    ml: 0.5,
                    mr: 0.5
                  }}
                />
                <Typography 
                  variant="caption" 
                  color="text.primary"
                  component={Link}
                  to={`/profile/${post.original_post.user?.username}`}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  sx={{ 
                    fontWeight: 'medium',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    '&:hover': {
                      color: 'primary.main',
                      textDecoration: 'underline'
                    }
                  }}
                >
                  {post.original_post.user?.name || 'Unknown'}
                  {post.original_post.user?.verification && post.original_post.user?.verification.status > 0 && (
                    <VerificationBadge 
                      status={post.original_post.user?.verification.status} 
                      size="small" 
                    />
                  )}
                </Typography>
              </Box>
              
              {/* Контент оригинального поста */}
              <Box 
                onClick={(e) => {
                  e.stopPropagation();
                  
                  openPostDetail(post.original_post.id);
                }}
                sx={{ 
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'block',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.03)'
                  }
                }}
              >
                {post.original_post.content && (
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2" sx={{ color: 'text.primary', fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>
                      {truncateText(post.original_post.content, 500)}
                      {post.original_post.content.length > 500 && (
                        <Box 
                          component="span" 
                          sx={{ 
                            color: 'primary.main', 
                            cursor: 'pointer',
                            display: 'inline-block',
                            fontSize: '0.85rem',
                            ml: 0.5
                          }}
                          onClick={(e) => {
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
                      const { urls } = processTextWithLinks(truncateText(post.original_post.content, 500), theme);
                      return urls.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                          {urls.map((url, index) => (
                            <LinkPreview key={`repost-link-${index}`} url={url} />
                          ))}
                        </Box>
                      );
                    })()}
                  </Box>
                )}
                
                {/* Replacing the single image with our new RepostImageGrid component */}
                {post.original_post.image && (
                  <Box sx={{ mb: 1 }}>
                    <Suspense fallback={<Box sx={{ width: '100%', height: 150, bgcolor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box>}>
                      <RepostImageGrid 
                        images={post.original_post.images || [post.original_post.image]} 
                        onImageClick={(index) => {
                          setCurrentImageIndex(index);
                          setLightboxImages(post.original_post.images || [post.original_post.image]);
                          setLightboxOpen(true);
                        }}
                      />
                    </Suspense>
                  </Box>
                )}
                
                {/* Видео оригинального поста (если есть) */}
                {post.original_post.video && (
                  <Box sx={{ mt: 1 }}>
                    <Suspense fallback={<Box sx={{ width: '100%', height: 200, bgcolor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box>}>
                      <VideoPlayer 
                        videoUrl={post.original_post.video} 
                        sx={{ maxHeight: '200px' }}
                        onError={() => {
                          console.error("Repost video failed to load:", post.original_post.video);
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
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      backdropFilter: 'blur(8px)',
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
                      }
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
                        title="Это разъяснение было предоставлено организацией"
                        placement="top"
                        arrow
                        sx={{
                          '& .MuiTooltip-tooltip': {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            backdropFilter: 'blur(10px)',
                            fontSize: '0.7rem',
                            maxWidth: 180,
                          }
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
                              }
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
                
                {/* Статистика оригинального поста */}
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  mt: 1,
                  pt: 1,
                  borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                  opacity: 0.7
                }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    {formatTimeAgo(post.original_post.timestamp)}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Heart size={12} color="text.secondary" style={{ marginRight: '4px' }} />
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        {post.original_post.likes_count || 0}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <MessageCircle size={12} color="text.secondary" style={{ marginRight: '4px' }} />
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        {post.original_post.comments_count || 0}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <VisibilityIcon sx={{ fontSize: 12, mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        {post.original_post.views_count || 0}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
          
          {videoUrl && mediaError.type !== 'video' ? (
            <Box sx={{ mb: 2, position: 'relative', borderRadius: '12px', overflow: 'hidden' }} data-no-navigate>
              <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                <Box sx={{ filter: post.is_nsfw && !showSensitive ? 'blur(16px)' : 'none', transition: 'filter 0.3s', pointerEvents: post.is_nsfw && !showSensitive ? 'none' : 'auto', width: '100%', height: '100%' }}>
                  <Suspense fallback={<Box sx={{ width: '100%', height: 200, bgcolor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box>}>
                    <VideoPlayer videoUrl={videoUrl} poster={images.length > 0 ? formatVideoUrl(images[0]) : undefined} onError={() => handleVideoError(videoUrl)} />
                  </Suspense>
                </Box>
                {post.is_nsfw && !showSensitive && NSFWOverlay}
              </Box>
            </Box>
          ) : mediaError.type === 'video' && (
            <Box sx={{ mb: 2 }}>
              <MediaErrorDisplay type="video" t={t} />
            </Box>
          )}
          
          
          {images.length > 0 && mediaError.type !== 'image' ? (
            <Box sx={{ mb: 2, width: '100%', position: 'relative', borderRadius: '12px', overflow: 'hidden' }} data-no-navigate>
              <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                <Box sx={{ filter: post.is_nsfw && !showSensitive ? 'blur(16px)' : 'none', transition: 'filter 0.3s', pointerEvents: post.is_nsfw && !showSensitive ? 'none' : 'auto', width: '100%', height: '100%' }}>
                  <Suspense fallback={<Box sx={{ width: '100%', height: 200, bgcolor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box>}>
                    <ImageGrid images={images} onImageClick={handleOpenImage} onImageError={handleImageError} />
                  </Suspense>
                </Box>
                {post.is_nsfw && !showSensitive && NSFWOverlay}
              </Box>
            </Box>
          ) : mediaError.type === 'image' && (
            <Box sx={{ mb: 2 }}>
                              <MediaErrorDisplay type="image" t={t} />
            </Box>
          )}
          
          
          {musicTracks.length > 0 && (
            <Box sx={{ mt: 0, mb: 0 }}>
              {musicTracks.map((track, index) => (
                <Suspense key={`track-${index}`} fallback={<Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1, mb: 1 }}><CircularProgress size={20} /></Box>}>
                  <MusicTrack onClick={(e) => handleTrackPlay(track, e)}>
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
                      justifyContent: 'center'
                    }}
                  >
                    <img 
                      src={getCoverPath(track)} 
                      alt={track.title} 
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover' 
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
                        background: 'linear-gradient(145deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.3))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {currentTrack && currentTrack.id === track.id && isPlaying ? (
                        <PauseIcon sx={{ color: 'white', fontSize: 18, filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.3))' }} />
                      ) : (
                        <PlayArrowIcon sx={{ color: 'white', fontSize: 18, filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.3))' }} />
                      )}
                    </Box>
                  </Box>
                  
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" noWrap sx={{ 
                      fontWeight: currentTrack && currentTrack.id === track.id ? 'medium' : 'normal',
                      color: currentTrack && currentTrack.id === track.id ? 'primary.main' : 'text.primary',
                      fontSize: '0.85rem'
                    }}>
                      {track.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {track.artist}
                    </Typography>
                  </Box>
                  
                  <Typography variant="caption" color="text.secondary" sx={{ 
                    py: 0.4,
                    px: 1,
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    fontSize: '0.7rem',
                    ml: 1
                  }}>
                    {formatDuration(track.duration)}
                  </Typography>
                </MusicTrack>
                </Suspense>
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
                }
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
                  title="Это разъяснение было предоставлено организацией"
                  placement="top"
                  arrow
                  sx={{
                    '& .MuiTooltip-tooltip': {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      backdropFilter: 'blur(10px)',
                      fontSize: '0.75rem',
                      maxWidth: 200,
                    }
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
                        }
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
          
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 2,
            gap: 1.7 // уменьшено с 2
          }}>
            {/* Левая группа: лайк, коммент, репост, поделиться */}
            <Box sx={{
              display: 'flex',
              gap: 1.7, // уменьшено с 2
              background: 'rgba(0, 0, 0, 0.05)',
              backdropFilter: 'blur(40px)',
              border: '1px solid #333',
              borderRadius: '10px', // было 12px
              px: 2.5, // было 3
              py: 0.85, // было 1
              alignItems: 'center',
              minWidth: 185 // было 220
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.85, cursor: 'pointer', position: 'relative' }} onClick={handleLike} data-like-parent>
                {liked ? <Heart size={21} color={theme.palette.primary.main} fill={theme.palette.primary.main} /> : <Heart size={21} color="#fff" />}
                <Typography sx={{ color: '#fff', fontSize: '0.85rem', ml: 0.4 }}>{likesCount > 0 ? likesCount : ''}</Typography>
                {/* Аватарки последних лайкнувших — появляются при наведении */}
                {!isMobile && lastLikedUsers.length > 0 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      left: '110%',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      display: 'flex',
                      alignItems: 'center',
                      opacity: 0,
                      pointerEvents: 'none',
                      transition: 'opacity 0.25s cubic-bezier(.4,2,.6,1), transform 0.25s cubic-bezier(.4,2,.6,1)',
                      zIndex: 20,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                    }}
                    className="like-avatars"
                  >
                    {lastLikedUsers.slice(0, 3).map((user, index) => {
                      const avatarUrl = user.avatar_url || (user.avatar ? `/static/uploads${user.avatar}` : null) || `/static/uploads/avatar/${user.id}/${user.photo || 'avatar.png'}`;
                      return (
                        <Avatar
                          key={user.id}
                          src={avatarUrl}
                          alt={user.name}
                          sx={{
                            width: 22,
                            height: 22,
                            ml: index > 0 ? -0.7 : 0,
                            zIndex: 3 - index,
                            background: '#eee',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.10)',
                            transition: 'transform 0.18s',
                            '&:hover': {
                              transform: 'scale(1.13)',
                              zIndex: 10
                            }
                          }}
                          onError={safeImageError}
                        />
                      );
                    })}
                  </Box>
                )}
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.85, cursor: 'pointer' }} onClick={handleCommentClick}>
                <MessageCircle size={21} color="#fff" />
                <Typography sx={{ color: '#fff', fontSize: '0.85rem', ml: 0.4 }}>{(post?.total_comments_count || post?.comments_count) > 0 ? (post?.total_comments_count || post?.comments_count) : ''}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.85, cursor: 'pointer' }} onClick={handleRepostClick}>
                <Repeat2 size={21} color="#fff" />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.85, cursor: 'pointer' }} onClick={handleShare}>
                <Link2 size={21} color="#fff" />
              </Box>
            </Box>

            {/* Правая группа: просмотры и меню */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(0, 0, 0, 0.05)',
              backdropFilter: 'blur(40px)',
              border: '1px solid #333',
              borderRadius: '10px', // было 12px
              px: 1.7, // было 2
              py: 0.85, // было 1
              minWidth: 68, // было 80
              justifyContent: 'center',
              gap: 0.85 // было 1
            }}>
              <VisibilityIcon sx={{ color: '#fff', mr: 0.85, fontSize: 21 }} />
              <Typography sx={{ color: '#fff', fontSize: '0.85rem', mr: 1.7 }}>{viewsCount}</Typography>
              <MoreVertIcon sx={{ color: '#fff', cursor: 'pointer', fontSize: 21 }} onClick={handleMenuOpen} data-no-navigate />
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
                '&:hover': {
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                }
              }}
              onClick={handleCommentClick}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                {/* Аватар автора комментария */}
                <Avatar
                  src={lastComment.user?.avatar_url || `/static/uploads/avatar/${lastComment.user?.id}/${lastComment.user?.photo || 'avatar.png'}`}
                  alt={lastComment.user?.name || 'User'}
                  sx={{
                    width: 28,
                    height: 28,
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    flexShrink: 0
                  }}
                  onError={safeImageError}
                />
                
                {/* Контент комментария */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  {/* Имя автора и время */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography
                      sx={{
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: 'rgba(255, 255, 255, 0.9)',
                        textDecoration: 'none',
                        '&:hover': {
                          color: '#D0BCFF'
                        }
                      }}
                      component={Link}
                      to={`/profile/${lastComment.user?.username || 'unknown'}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {lastComment.user?.name || 'Пользователь'}
                    </Typography>

                    
                    <Typography
                      sx={{
                        fontSize: '0.7rem',
                        color: 'rgba(255, 255, 255, 0.5)',
                        ml: 'auto'
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
                      textOverflow: 'ellipsis'
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
                        maxHeight: 80
                      }}
                    >
                      <img
                        src={lastComment.image}
                        alt="Comment"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        onError={safeImageError}
                      />
                    </Box>
                  )}
                  

                </Box>
              </Box>
              
              {/* Индикатор "Показать все комментарии" */}
              {(post?.total_comments_count > 1 || post?.comments_count > 1) && (
                <Box
                  sx={{
                    mt: 0.7,
                    pt: 0.3,
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '0.75rem',
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontWeight: 500,
                      '&:hover': {
                        color: '#D0BCFF'
                      }
                    }}
                  >
                    Показать все {(post?.total_comments_count || post?.comments_count) - 1} комментариев
                  </Typography>
                </Box>
              )}
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
                border: '1px solid rgba(255, 255, 255, 0.12)'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)',
                    flexShrink: 0
                  }}
                />
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Box
                      sx={{
                        width: 80,
                        height: 12,
                        borderRadius: '6px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        animation: 'pulse 1.5s ease-in-out infinite'
                      }}
                    />
                    <Box
                      sx={{
                        width: 50,
                        height: 10,
                        borderRadius: '5px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        animation: 'pulse 1.5s ease-in-out infinite',
                        animationDelay: '0.2s'
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
                      animationDelay: '0.4s'
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

      <BlurredMenu
        anchorEl={menuAnchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
      >
        {currentUser && currentUser.id === 3 && (
          <MenuItem onClick={handleFactsClick}>
            <ListItemIcon>
              <FactCheckIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Факты</ListItemText>
          </MenuItem>
        )}
        {isCurrentUserPost && (
          <>
            <MenuItem onClick={handleEdit}>
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>{t('post.menu_actions.edit')}</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleDelete}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>{t('post.menu_actions.delete')}</ListItemText>
            </MenuItem>
          </>
        )}
        {isCurrentUserPost && (
          <MenuItem onClick={handlePinPost}>
            <ListItemIcon>
              {isPinned ? <PushPinIcon fontSize="small" /> : <PushPinOutlinedIcon fontSize="small" />}
            </ListItemIcon>
            <ListItemText>{isPinned ? t('post.menu_actions.unpin') : t('post.menu_actions.pin')}</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={handleCopyLink}>
          <ListItemIcon>
            <Link2 size={16} />
          </ListItemIcon>
          <ListItemText>{t('post.menu_actions.copy_link')}</ListItemText>
        </MenuItem>
        {!isCurrentUserPost && (
          <MenuItem onClick={handleReportClick}>
            <ListItemIcon>
              <FlagIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{t('post.menu_actions.report')}</ListItemText>
          </MenuItem>
        )}
      </BlurredMenu>
      
      
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
          images={images}
          initialIndex={currentImageIndex}
        />
      )}
      
      
      <Suspense fallback={null}>
        <DeleteDialog
          open={deleteDialog.open}
          onClose={() => !deleteDialog.deleting && !deleteDialog.deleted && setDeleteDialog({ ...deleteDialog, open: false })}
          deleteDialog={deleteDialog}
          setDeleteDialog={setDeleteDialog}
          confirmDelete={confirmDelete}
          t={t}
        />
      </Suspense>
      
      
      <Suspense fallback={null}>
        <ReportDialog
          open={reportDialog.open}
          onClose={() => !reportDialog.submitting && !reportDialog.submitted && setReportDialog({...reportDialog, open: false})}
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
      
      
      <ContextMenu
        items={getContextMenuItems()}
        x={contextMenuState.x}
        y={contextMenuState.y}
        show={contextMenuState.show && contextMenuState.data?.postId === post.id}
        onClose={closeContextMenu}
      />
    </>
  );
};

export default Post; 