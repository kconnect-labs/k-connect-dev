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
  Chip,
  Avatar,
  Divider,
  Grid,
} from '@mui/material';
import {
  PostAdd,
  Search,
  Delete,
  Person,
  Visibility,
  Favorite,
  Comment,
  Share,
  Warning,
  Link,
} from '@mui/icons-material';
import { useNitroApi } from '../hooks/useNitroApi';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { Post } from '../types';

const PostsModerationTab: React.FC = () => {
  const { currentUser, permissions } = useCurrentUser();
  const { getPostById, deletePost, loading, error, clearError } = useNitroApi();
  
  const [postInput, setPostInput] = useState('');
  const [currentPost, setCurrentPost] = useState<Post | null>(null);
  const [postLoading, setPostLoading] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  
  const canModeratePosts = permissions?.delete_posts || false;

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

  const handleSearchPost = async () => {
    if (!postInput.trim()) {
      setPostError('Введите ID поста или ссылку');
      return;
    }

    const postId = extractPostId(postInput);
    if (!postId) {
      setPostError('Неверный формат. Введите ID поста (число) или ссылку на пост');
      return;
    }

    setPostLoading(true);
    setPostError(null);
    setCurrentPost(null);

    try {
      const post = await getPostById(postId);
      setCurrentPost(post);
    } catch (err: any) {
      setPostError(err.response?.data?.error || 'Пост не найден');
    } finally {
      setPostLoading(false);
    }
  };

  const handleDeletePost = async () => {
    if (!currentPost) return;

    setDeleting(true);
    try {
      await deletePost(currentPost.id);
      setCurrentPost(null);
      setPostInput('');
      setDeleteDialogOpen(false);
    } catch (err: any) {
      setPostError(err.response?.data?.error || 'Ошибка удаления поста');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('ru-RU');
    } catch {
      return 'Дата неизвестна';
    }
  };

  if (!canModeratePosts) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="error" sx={{ maxWidth: 600, mx: 'auto' }}>
          <Typography variant="h6" gutterBottom>
            Доступ запрещен
          </Typography>
          <Typography>
            У вас нет прав на модерацию постов
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

      {postError && (
        <Alert severity="error" sx={{ mb: 1 }} onClose={() => setPostError(null)}>
          {postError}
        </Alert>
      )}

      {/* Поиск поста */}
      <Box sx={{ 
        display: 'flex', 
        gap: 1, 
        alignItems: 'center', 
        background: 'var(--theme-background)', 
        backdropFilter: 'var(--theme-backdrop-filter)', 
        borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)', 
        borderRadius: 'var(--main-border-radius)', 
        p: 2, 
        mb: 1 
      }}>
        <TextField
          fullWidth
          placeholder="Введите ID поста или ссылку на пост..."
          value={postInput}
          onChange={(e) => setPostInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearchPost()}
          size="small"
          InputProps={{
            startAdornment: (
              <PostAdd sx={{ mr: 1, color: 'text.secondary' }} />
            ),
          }}
        />
        <Button
          variant="contained"
          onClick={handleSearchPost}
          disabled={postLoading}
          startIcon={postLoading ? <CircularProgress size={20} /> : <Search />}
          size="small"
        >
          {postLoading ? 'Поиск...' : 'Найти'}
        </Button>
      </Box>

      {/* Отображение поста */}
      {currentPost && (
        <Card
          sx={{
            background: 'var(--theme-background)',
            backdropFilter: 'var(--theme-backdrop-filter)',
            borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
            borderRadius: 'var(--main-border-radius)',
            mb: 1,
          }}
        >
          <CardContent sx={{ p: 2 }}>
            {/* Заголовок с информацией о посте */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  Пост #{currentPost.id}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Chip
                    label={currentPost.type === 'post' ? 'Обычный пост' : currentPost.type === 'repost' ? 'Репост' : currentPost.type}
                    size="small"
                    color={currentPost.type === 'repost' ? 'secondary' : 'primary'}
                  />
                  {currentPost.is_nsfw && (
                    <Chip
                      label="NSFW"
                      size="small"
                      color="warning"
                      icon={<Warning />}
                    />
                  )}
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(currentPost.timestamp)}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Tooltip title="Удалить пост">
                  <IconButton
                    size="small"
                    onClick={() => setDeleteDialogOpen(true)}
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
            </Box>

            {/* Автор поста */}
            {currentPost.user && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Avatar
                  src={currentPost.user.avatar_url || undefined}
                  sx={{ width: 32, height: 32 }}
                >
                  {currentPost.user.name ? currentPost.user.name.charAt(0) : '?'}
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    {currentPost.user.name || 'Неизвестный пользователь'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    @{currentPost.user.username || 'без_username'}
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Получатель (для постов на стене) */}
            {currentPost.recipient && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Пост на стене пользователя:
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Avatar
                    src={currentPost.recipient.avatar_url || undefined}
                    sx={{ width: 24, height: 24 }}
                  >
                    {currentPost.recipient.name ? currentPost.recipient.name.charAt(0) : '?'}
                  </Avatar>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {currentPost.recipient.name}
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Содержимое поста */}
            {currentPost.content && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {currentPost.content}
                </Typography>
              </Box>
            )}

            {/* Медиа контент */}
            {(currentPost.image || currentPost.video || currentPost.music) && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                  Медиа контент:
                </Typography>
                <Grid container spacing={1}>
                  {currentPost.image && (
                    <Grid item>
                      <Chip
                        label="Изображение"
                        size="small"
                        icon={<Link />}
                        color="info"
                      />
                    </Grid>
                  )}
                  {currentPost.video && (
                    <Grid item>
                      <Chip
                        label="Видео"
                        size="small"
                        icon={<Link />}
                        color="info"
                      />
                    </Grid>
                  )}
                  {currentPost.music && (
                    <Grid item>
                      <Chip
                        label="Музыка"
                        size="small"
                        icon={<Link />}
                        color="info"
                      />
                    </Grid>
                  )}
                </Grid>
              </Box>
            )}

            {/* Оригинальный пост (для репостов) */}
            {currentPost.original_post && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                  Оригинальный пост:
                </Typography>
                <Box
                  sx={{
                    p: 2,
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: 'var(--main-border-radius)',
                    borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
                  }}
                >
                  {currentPost.original_post.user && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Avatar
                        src={currentPost.original_post.user.avatar_url || undefined}
                        sx={{ width: 24, height: 24 }}
                      >
                        {currentPost.original_post.user.name ? currentPost.original_post.user.name.charAt(0) : '?'}
                      </Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {currentPost.original_post.user.name}
                      </Typography>
                    </Box>
                  )}
                  {currentPost.original_post.content && (
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {currentPost.original_post.content}
                    </Typography>
                  )}
                </Box>
              </Box>
            )}

            <Divider sx={{ my: 2 }} />

            {/* Статистика поста */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Visibility fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  {currentPost.views_count} просмотров
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Favorite fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  {currentPost.likes_count || 0} лайков
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Comment fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  {currentPost.comments_count || 0} комментариев
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Share fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  {currentPost.reposts_count || 0} репостов
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Диалог удаления поста */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'var(--theme-background)',
            backdropFilter: 'var(--theme-backdrop-filter)',
            borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
            borderRadius: 'var(--main-border-radius)',
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          Удаление поста
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography>
            Вы уверены, что хотите удалить пост #{currentPost?.id}?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Это действие нельзя отменить. Все связанные данные (комментарии, лайки, репосты) также будут удалены.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ pt: 1 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} size="small">
            Отмена
          </Button>
          <Button
            onClick={handleDeletePost}
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

export default PostsModerationTab;
