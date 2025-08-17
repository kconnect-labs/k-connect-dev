import { useState, useEffect } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { formatTimeAgoDiff, parseDate } from '../../../utils/dateUtils';
import { USERNAME_MENTION_REGEX, HASHTAG_REGEX, URL_REGEX } from '../../../utils/LinkUtils';

export interface PostState {
  liked: boolean;
  likesCount: number;
  viewsCount: number;
  reposted: boolean;
  isPinned: boolean;
  isExpanded: boolean;
  needsExpandButton: boolean;
  processedContent: string;
  mediaError: { type: string | null; url: string | null };
  showSensitive: boolean;
  lastComment: any;
  lastCommentLoading: boolean;
  lightboxOpen: boolean;
  currentImageIndex: number;
  hearts: any[];
  lastTap: { time: number; x: number; y: number };
  clickTimer: NodeJS.Timeout | null;
  menuAnchorEl: HTMLElement | null;
  snackbarOpen: boolean;
  snackbarMessage: string;
  repostModalOpen: boolean;
  repostContent: string;
  repostLoading: boolean;
  snackbar: {
    open: boolean;
    message: string;
    severity: 'error' | 'success' | 'warning' | 'info';
  };
  musicTracks: any[];
}

export interface DialogState {
  editDialog: {
    open: boolean;
    content: string;
    loading: boolean;
    previews: string[];
    deleteImages: boolean;
    deleteVideo: boolean;
    deleteMusic: boolean;
    newImages: File[];
    newVideo: File | null;
    error: string | null;
    submitting: boolean;
  };
  deleteDialog: {
    open: boolean;
    deleting: boolean;
    deleted: boolean;
  };
  reportDialog: {
    open: boolean;
    reason: string;
    customReason?: string;
    submitting: boolean;
    submitted: boolean;
    error: string | null;
  };
  factModal: {
    open: boolean;
    loading: boolean;
    error: string | null;
  };
}

export const usePostState = (post: any, isPinnedPost: boolean) => {
  const { t } = useLanguage();
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth <= 600 : false
  );

  const [postState, setPostState] = useState<PostState>({
    liked: post?.user_liked || post?.is_liked || false,
    likesCount: post?.likes_count || 0,
    viewsCount: post?.views_count || 0,
    reposted: post?.is_reposted || false,
    isPinned: isPinnedPost || false,
    isExpanded: false,
    needsExpandButton: false,
    processedContent: '',
    mediaError: { type: null, url: null },
    showSensitive: false,
    lastComment: null,
    lastCommentLoading: false,
    lightboxOpen: false,
    currentImageIndex: 0,
    hearts: [],
    lastTap: { time: 0, x: 0, y: 0 },
    clickTimer: null,
    menuAnchorEl: null,
    snackbarOpen: false,
    snackbarMessage: '',
    repostModalOpen: false,
    repostContent: '',
    repostLoading: false,
    snackbar: {
      open: false,
      message: '',
      severity: 'error',
    },
    musicTracks: [],
  });

  const [dialogState, setDialogState] = useState<DialogState>({
    editDialog: {
      open: false,
      content: post?.content || '',
      loading: false,
      previews: [],
      deleteImages: false,
      deleteVideo: false,
      deleteMusic: false,
      newImages: [],
      newVideo: null,
      error: null,
      submitting: false,
    },
    deleteDialog: {
      open: false,
      deleting: false,
      deleted: false,
    },
    reportDialog: {
      open: false,
      reason: '',
      customReason: '',
      submitting: false,
      submitted: false,
      error: null,
    },
    factModal: {
      open: false,
      loading: false,
      error: null,
    },
  });

  const [musicTracks, setMusicTracks] = useState<any[]>([]);

  // Mobile detection effect
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = () => setIsMobile(window.innerWidth <= 600);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // Post data effect
  useEffect(() => {
    if (post) {
      setPostState(prev => ({
        ...prev,
        liked: post.user_liked || post.is_liked || false,
        likesCount: post.likes_count || 0,
        viewsCount: post.views_count || 0,
        reposted: post.is_reposted || false,
        isExpanded: false,
      }));

      setDialogState(prev => ({
        ...prev,
        editDialog: {
          ...prev.editDialog,
          content: post.content || '',
        },
      }));



      // Process content
      if (post.content) {
        let content = post.content;
        USERNAME_MENTION_REGEX.lastIndex = 0;
        HASHTAG_REGEX.lastIndex = 0;
        URL_REGEX.lastIndex = 0;

        // Create temporary markers for URLs to protect them from mention processing
        const urlMarkers: Array<{ marker: string; replacement: string }> = [];
        let markerIndex = 0;

        // Process regular links with marker creation
        content = content.replace(URL_REGEX, (match: string) => {
          const marker = `__URL_MARKER_${markerIndex}__`;
          urlMarkers.push({
            marker,
            replacement: `[${match}](${match.startsWith('http') ? match : `https://${match}`})`,
          });
          markerIndex++;
          return marker;
        });

        // Process user mentions (only those not in URLs)
        content = content.replace(
          USERNAME_MENTION_REGEX,
          (match: string, prefix: string, username: string) => {
            const adjustedMatch = prefix
              ? match.substring(prefix.length)
              : match;
            return `${prefix || ''}[${adjustedMatch}](/profile/${username})`;
          }
        );

        // Process hashtags
        content = content.replace(HASHTAG_REGEX, (match: string, hashtag: string) => {
          return `[${match}](https://k-connect.ru/search?q=${encodeURIComponent(hashtag)}&type=posts)`;
        });

        // Restore URLs from markers
        urlMarkers.forEach(({ marker, replacement }) => {
          content = content.replace(marker, replacement);
        });

        setPostState(prev => ({ ...prev, processedContent: content }));
      } else {
        setPostState(prev => ({ ...prev, processedContent: '' }));
      }

      // Parse music tracks
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

  // Format time ago with translation
  const formatTimeAgoWithTranslation = (dateString: string) => {
    if (!dateString) return '';

    const date = parseDate(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    return formatTimeAgoDiff(diffInSeconds, t);
  };

  return {
    postState,
    setPostState,
    dialogState,
    setDialogState,
    musicTracks,
    setMusicTracks,
    isMobile,
    formatTimeAgoWithTranslation,
  };
}; 