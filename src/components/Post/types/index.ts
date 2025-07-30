export interface User {
  id: number;
  username: string;
  name?: string;
  photo?: string;
  avatar_url?: string;
  verification?: string;
}

export interface MusicTrack {
  id: string;
  title: string;
  artist?: string;
  duration?: number;
  url?: string;
}

// Типы для системы реакций
export type ReactionEmoji = '🔥' | '❤️' | '😂' | '😮' | '😢';

export interface ReactionUser {
  id: number;
  name: string;
  username: string;
  photo: string;
  timestamp: string;
}

export interface ReactionDetail {
  emoji: ReactionEmoji;
  count: number;
  users: ReactionUser[];
}

export type ReactionsSummary = Partial<Record<ReactionEmoji, number>>;

export interface PostReactions {
  reactions_summary: ReactionsSummary;
  reactions_detail: ReactionDetail[];
  user_reaction: ReactionEmoji | null;
}

export interface Post {
  id: number;
  content: string;
  timestamp: string;
  user: User;
  images?: string[];
  image?: string;
  video?: string;
  music?: MusicTrack[] | string;
  likes_count?: number;
  views_count?: number;
  is_liked?: boolean;
  user_liked?: boolean;
  is_reposted?: boolean;
  is_pinned?: boolean;
  fact?: Fact;
  // Добавляем поля для реакций
  reactions_summary?: ReactionsSummary;
  user_reaction?: ReactionEmoji | null;
}

export interface Fact {
  id: number;
  who_provided: string;
  explanation_text: string;
  created_at: string;
  updated_at: string;
}

export interface Repost {
  id: number;
  user: User;
  original_post: Post;
  repost_text?: string;
  timestamp: string;
}

export interface EditDialogState {
  open: boolean;
  content: string;
  loading: boolean;
  previews: string[];
  deleteImages: boolean;
  deleteVideo: boolean;
  deleteMusic: boolean;
  newImages?: File[];
  newVideo?: File | null;
  error?: string | null;
}

export interface DeleteDialogState {
  open: boolean;
  deleting: boolean;
  deleted: boolean;
}

export interface ReportDialogState {
  open: boolean;
  reason: string;
  customReason?: string;
  submitting: boolean;
  submitted: boolean;
  error: string | null;
}

export interface FactModalState {
  open: boolean;
  loading: boolean;
  error: string | null;
}

export interface ImageGridProps {
  images: string[] | string;
  selectedImage?: string | null;
  onImageClick?: (index: number) => void;
  onImageError?: (url: string, index: number) => void;
  hideOverlay?: boolean;
  miniMode?: boolean;
  maxHeight?: number;
}

export interface DeleteDialogProps {
  open: boolean;
  onClose: () => void;
  deleteDialog: DeleteDialogState;
  setDeleteDialog: (state: DeleteDialogState) => void;
  confirmDelete: () => void;
  t: (key: string) => string;
}

export interface EditPostDialogProps {
  open: boolean;
  onClose: () => void;
  editDialog: EditDialogState;
  t: (key: string) => string;
  post: Post;
  handleEditContentChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleToggleDeleteImages: () => void;
  handleToggleDeleteVideo: () => void;
  handleToggleDeleteMusic: () => void;
  handleSubmitEdit: () => void;
  submitting: boolean;
  error?: string | null;
}

export interface FactModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { who_provided: string; explanation_text: string }) => void;
  onDelete: () => void;
  loading: boolean;
  error?: string | null;
  existingFact?: Fact | null;
  postId?: number;
}

export interface FactFormData {
  who_provided: string;
  explanation_text: string;
}

export interface MediaErrorDisplayProps {
  type: 'image' | 'video';
  t: (key: string) => string;
}

export interface PostSkeletonProps {
  // Пока пустой, но может понадобиться в будущем
}

export interface ReportDialogProps {
  open: boolean;
  onClose: () => void;
  reportDialog: ReportDialogState;
  t: (key: string) => string;
  post: Post;
  reportReasons: string[];
  setReportDialog: (state: ReportDialogState) => void;
  handleReportSubmit: () => void;
  submitting: boolean;
  error?: string | null;
}

export interface RepostImageGridProps {
  images: string[];
  onImageClick?: (index: number) => void;
}

export interface RepostModalProps {
  open: boolean;
  onClose: () => void;
  post: Post;
  repostContent: string;
  setRepostContent: (content: string) => void;
  repostLoading: boolean;
  handleCreateRepost: () => void;
  t: (key: string) => string;
} 