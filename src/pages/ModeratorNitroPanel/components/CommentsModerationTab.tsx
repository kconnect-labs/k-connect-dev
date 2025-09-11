import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Avatar,
  Divider,
  Chip,
} from '@mui/material';
import {
  Comment,
  Search,
  Delete,
  Person,
  Favorite,
  Reply,
  Image,
} from '@mui/icons-material';
import { useNitroApi } from '../hooks/useNitroApi';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { Comment as CommentType, Reply as ReplyType } from '../types';

const CommentsModerationTab: React.FC = () => {
  const { currentUser, permissions } = useCurrentUser();
  const { getCommentsByPostId, deleteComment, loading, error, clearError } = useNitroApi();
  
  const [postInput, setPostInput] = useState('');
  const [comments, setComments] = useState<CommentType[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedComment, setSelectedComment] = useState<CommentType | null>(null);
  const [deleting, setDeleting] = useState(false);

  
  const canModerateComments = permissions?.delete_comments || false;

  const extractPostId = (input: string): number | null => {
    
    const trimmed = input.trim();
    
    
    if (/^\d+$/.test(trimmed)) {
      return parseInt(trimmed, 10);
    }
    
    
    const urlMatch = trimmed.match(/\/post\/(\d+)/);
    if (urlMatch) {
      return parseInt(urlMatch[1], 10);
    }
    
    
    const profileMatch = trimmed.match(/\/profile\/\d+\/post\/(\d+)/);
    if (profileMatch) {
      return parseInt(profileMatch[1], 10);
    }
    
    return null;
  };

  const handleSearchComments = async () => {
    if (!postInput.trim()) {
      setCommentsError('Введите ID поста или ссылку');
      return;
    }

    const postId = extractPostId(postInput);
    if (!postId) {
      setCommentsError('Неверный формат. Введите ID поста (число) или ссылку на пост');
      return;
    }

    setCommentsLoading(true);
    setCommentsError(null);
    setComments([]);

    try {
      const response = await getCommentsByPostId(postId);
      setComments(response.comments);
    } catch (err: any) {
      setCommentsError(err.response?.data?.error || 'Ошибка загрузки комментариев');
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleDeleteComment = async () => {
    if (!selectedComment) return;

    setDeleting(true);
    try {
      await deleteComment(selectedComment.id);
      setComments(prev => prev.filter(comment => comment.id !== selectedComment.id));
      setDeleteDialogOpen(false);
      setSelectedComment(null);
    } catch (err: any) {
      setCommentsError(err.response?.data?.error || 'Ошибка удаления комментария');
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteDialog = (comment: CommentType) => {
    setSelectedComment(comment);
    setDeleteDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('ru-RU');
    } catch {
      return 'Дата неизвестна';
    }
  };

  const renderReply = (reply: ReplyType, commentId: number) => (
    <Box
      key={reply.id}
      sx={{
        ml: 4,
        mt: 1,
        p: 2,
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 'var(--main-border-radius)',
        border: '1px solid var(--main-border-color)',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar
            src={reply.user?.avatar_url || undefined}
            sx={{ width: 24, height: 24 }}
          >
            {reply.user?.name ? reply.user.name.charAt(0) : '?'}
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              {reply.user?.name || 'Неизвестный пользователь'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDate(reply.timestamp)}
            </Typography>
          </Box>
        </Box>
        <Tooltip title="Удалить ответ">
          <IconButton
            size="small"
            onClick={() => openDeleteDialog({ ...reply, post_id: commentId } as CommentType)}
            sx={{
              borderRadius: 'var(--main-border-radius)',
              background: 'rgba(244, 67, 54, 0.05)',
              '&:hover': {
                background: 'rgba(244, 67, 54, 0.1)',
              },
            }}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      
      <Typography variant="body2" sx={{ mb: 1, whiteSpace: 'pre-wrap' }}>
        {reply.content}
      </Typography>
      
      {reply.image && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
          <Image fontSize="small" color="action" />
          <Typography variant="caption" color="text.secondary">
            Изображение
          </Typography>
        </Box>
      )}
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Favorite fontSize="small" color="action" />
          <Typography variant="caption" color="text.secondary">
            {reply.likes_count || 0}
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  if (!canModerateComments) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="error" sx={{ maxWidth: 600, mx: 'auto' }}>
          <Typography variant="h6" gutterBottom>
            Доступ запрещен
          </Typography>
          <Typography>
            У вас нет прав на модерацию комментариев
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 1 }} onClose={clearError}>
          {error}
        </Alert>
      )}

      {commentsError && (
        <Alert severity="error" sx={{ mb: 1 }} onClose={() => setCommentsError(null)}>
          {commentsError}
        </Alert>
      )}

      {/* Поиск комментариев */}
      <Box sx={{ 
        display: 'flex', 
        gap: 1, 
        alignItems: 'center', 
        background: 'var(--theme-background)', 
        backdropFilter: 'var(--theme-backdrop-filter)', 
        border: '1px solid var(--main-border-color)', 
        borderRadius: 'var(--main-border-radius)', 
        p: 2, 
        mb: 1 
      }}>
        <TextField
          fullWidth
          placeholder="Введите ID поста или ссылку на пост..."
          value={postInput}
          onChange={(e) => setPostInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearchComments()}
          size="small"
          InputProps={{
            startAdornment: (
              <Comment sx={{ mr: 1, color: 'text.secondary' }} />
            ),
          }}
        />
        <Button
          variant="contained"
          onClick={handleSearchComments}
          disabled={commentsLoading}
          startIcon={commentsLoading ? <CircularProgress size={20} /> : <Search />}
          size="small"
        >
          {commentsLoading ? 'Поиск...' : 'Найти'}
        </Button>
      </Box>

      {/* Список комментариев */}
      {commentsLoading && comments.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
          <CircularProgress size={28} />
        </Box>
      ) : comments.length === 0 && postInput ? (
        <Box
          sx={{
            p: 3,
            textAlign: 'center',
            borderRadius: 'var(--main-border-radius)',
            background: 'var(--theme-background)',
            backdropFilter: 'var(--theme-backdrop-filter)',
            border: '1px solid var(--main-border-color)',
          }}
        >
          <Typography variant="body1" color="text.secondary">
            Нет комментариев к этому посту
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {comments.map((comment) => (
            <Card
              key={comment.id}
              sx={{
                background: 'var(--theme-background)',
                backdropFilter: 'var(--theme-backdrop-filter)',
                border: '1px solid var(--main-border-color)',
                borderRadius: 'var(--main-border-radius)',
              }}
            >
              <CardContent sx={{ p: 2 }}>
                {/* Заголовок комментария */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar
                      src={comment.user?.avatar_url || undefined}
                      sx={{ width: 32, height: 32 }}
                    >
                      {comment.user?.name ? comment.user.name.charAt(0) : '?'}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        {comment.user?.name || 'Неизвестный пользователь'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        @{comment.user?.username || 'без_username'} • {formatDate(comment.timestamp)}
                      </Typography>
                    </Box>
                  </Box>
                  <Tooltip title="Удалить комментарий">
                    <IconButton
                      size="small"
                      onClick={() => openDeleteDialog(comment)}
                      sx={{
                        borderRadius: 'var(--main-border-radius)',
                        background: 'rgba(244, 67, 54, 0.05)',
                        '&:hover': {
                          background: 'rgba(244, 67, 54, 0.1)',
                        },
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>

                {/* Содержимое комментария */}
                <Typography variant="body2" sx={{ mb: 1, whiteSpace: 'pre-wrap' }}>
                  {comment.content}
                </Typography>

                {/* Изображение комментария */}
                {comment.image && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                    <Image fontSize="small" color="action" />
                    <Typography variant="caption" color="text.secondary">
                      Изображение
                    </Typography>
                  </Box>
                )}

                {/* Статистика комментария */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Favorite fontSize="small" color="action" />
                    <Typography variant="caption" color="text.secondary">
                      {comment.likes_count || 0}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Reply fontSize="small" color="action" />
                    <Typography variant="caption" color="text.secondary">
                      {comment.replies_count || 0} ответов
                    </Typography>
                  </Box>
                </Box>

                {/* Ответы к комментарию */}
                {comment.replies && comment.replies.length > 0 && (
                  <>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                      Ответы:
                    </Typography>
                    {comment.replies.map((reply) => renderReply(reply, comment.id))}
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Диалог удаления комментария */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'var(--theme-background)',
            backdropFilter: 'var(--theme-backdrop-filter)',
            border: '1px solid var(--main-border-color)',
            borderRadius: 'var(--main-border-radius)',
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          Удаление комментария
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography>
            Вы уверены, что хотите удалить этот комментарий?
          </Typography>
          {selectedComment && (
            <Box sx={{ mt: 2, p: 2, background: 'rgba(255, 255, 255, 0.05)', borderRadius: 'var(--main-border-radius)' }}>
              <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                "{selectedComment.content}"
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Автор: {selectedComment.user?.name || 'Неизвестный пользователь'}
              </Typography>
            </Box>
          )}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Это действие нельзя отменить. Все ответы к комментарию также будут удалены.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ pt: 1 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} size="small">
            Отмена
          </Button>
          <Button
            onClick={handleDeleteComment}
            variant="contained"
            color="error"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={20} /> : <Delete />}
            size="small"
          >
            {deleting ? 'Удаление...' : 'Удалить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CommentsModerationTab;
