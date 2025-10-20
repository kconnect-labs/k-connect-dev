import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  Chip,
  Grid,
  Paper,
} from '@mui/material';
import {
  Security as SecurityIcon,
  VerifiedUser as VerifiedUserIcon,
  AccessTime as AccessTimeIcon,
  Person as PersonIcon,
  PostAdd as PostAddIcon,
  MusicNote as MusicNoteIcon,
  Comment as CommentIcon,
  Photo as PhotoIcon,
  BugReport as BugReportIcon,
  EmojiEvents as EmojiEventsIcon,
  PersonAdd as PersonAddIcon,
  AdminPanelSettings,
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';


interface PermissionItemProps {
  title: string;
  enabled: boolean;
  icon: React.ReactElement;
}

interface ProfileTabProps {
  currentUser: any;
  moderatorData: any;
  permissions: any;
  loading: boolean;
  error: string | null;
}

const PermissionItem: React.FC<PermissionItemProps> = ({ title, enabled, icon }) => {
  return (
    <Box
      sx={{
        p: 1,
        borderRadius: 'var(--small-border-radius)',
        background: enabled
          ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)'
          : 'rgba(255, 255, 255, 0.03)',
        border: `1px solid ${enabled ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255, 255, 255, 0.08)'}`,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        backdropFilter: 'var(--theme-backdrop-filter)',
        '&::before': enabled ? {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, #4CAF50, #8BC34A)',
        } : {},
      }}
    >
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: 'var(--small-border-radius)',
          background: enabled
            ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.2) 0%, rgba(76, 175, 80, 0.1) 100%)'
            : 'rgba(255, 255, 255, 0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `1px solid ${enabled ? 'rgba(76, 175, 80, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
        }}
      >
        {React.cloneElement(icon, {
          fontSize: 'small',
          sx: {
            color: enabled
              ? '#4CAF50'
              : 'rgba(255, 255, 255, 0.4)',
            fontSize: 18,
          },
        })}
      </Box>
      
      <Box sx={{ flex: 1 }}>
        <Typography
          variant="body2"
          sx={{
            color: enabled
              ? 'rgba(255, 255, 255, 0.95)'
              : 'rgba(255, 255, 255, 0.6)',
            fontWeight: enabled ? 600 : 400,
            fontSize: '0.875rem',
          }}
        >
          {title}
        </Typography>
      </Box>
    </Box>
  );
};

const ProfileTab: React.FC<ProfileTabProps> = ({ currentUser, moderatorData, permissions, loading, error }) => {
  console.log('ProfileTab - loading:', loading, 'error:', error, 'moderatorData:', moderatorData, 'currentUser:', currentUser);
  console.log('ProfileTab - moderatorData.user:', moderatorData?.user);
  console.log('ProfileTab - permissions:', permissions);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Typography>Загрузка данных профиля...</Typography>
      </Box>
    );
  }

  if (error || !moderatorData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Typography color="error">
          {error || 'Не удалось загрузить данные профиля'}
        </Typography>
      </Box>
    );
  }

  
  const userData = currentUser || {
    id: 0,
    name: 'Модератор',
    username: 'moderator',
    photo: null,
    role: 'user'
  };

  console.log('ProfileTab - userData.photo:', userData.photo, 'type:', typeof userData.photo);

  const assignedDate = moderatorData.assigned_info?.assigned_at
    ? new Date(moderatorData.assigned_info.assigned_at)
    : null;

  const daysSinceAssigned = assignedDate
    ? Math.floor((new Date().getTime() - assignedDate.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto'}}>
      {/* Информация о пользователе */}
      <Box sx={{ mb: 1}}>
        <Paper
          sx={{
            p: 3,

            borderRadius: 'var(--main-border-radius)',
            background: 'var(--theme-background)',
            backdropFilter: 'var(--theme-backdrop-filter)',
            borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              mb: 1,
            }}
          >
            <Avatar
              src={userData.avatar_url && userData.avatar_url.trim() !== '' ? userData.avatar_url : undefined}
              sx={{
                width: 64,
                height: 64,
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                mr: 3,
              }}
            >
              {userData.name?.charAt(0) || 'M'}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight={500} sx={{ mb: 0.5 }}>
                {userData.name || 'Модератор'}
              </Typography>
              <Typography
                variant="body2"
                color="rgba(255,255,255,0.6)"
                sx={{ mb: 1 }}
              >
                @{userData.username || 'username'}
              </Typography>
              <Chip
                icon={
                  moderatorData.moderator_level >= 3 ? (
                    <VerifiedUserIcon />
                  ) : (
                    <SecurityIcon />
                  )
                }
                label={
                  moderatorData.moderator_level >= 3
                    ? 'Администратор'
                    : 'Модератор'
                }
                size="small"
                sx={{
                  borderRadius: 'var(--main-border-radius)',
                  background: 'rgba(255, 255, 255, 0.08)',
                  borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
                  color: 'rgba(255, 255, 255, 0.87)',
                  fontSize: '0.75rem',
                  height: 24,
                }}
              />
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Информация о назначении */}
      <Box sx={{ mb: 1 }}>
        <Paper
          sx={{
            p: 3,
            borderRadius: 'var(--main-border-radius)',
            background: 'var(--theme-background)',
            backdropFilter: 'var(--theme-backdrop-filter)',
            borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
          }}
        >
          {assignedDate && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AccessTimeIcon
                sx={{ mr: 2, fontSize: 20, color: 'rgba(255,255,255,0.6)' }}
              />
              <Box>
                <Typography variant="body2" color="rgba(255,255,255,0.6)">
                  Назначен модератором
                </Typography>
                <Typography variant="body1">
                  {assignedDate.toLocaleDateString()}
                  <Typography
                    component="span"
                    variant="body2"
                    color="rgba(255,255,255,0.6)"
                    sx={{ ml: 1 }}
                  >
                    ({daysSinceAssigned}{' '}
                    {daysSinceAssigned === 1
                      ? 'день'
                      : daysSinceAssigned && daysSinceAssigned < 5
                        ? 'дня'
                        : 'дней'}
                    )
                  </Typography>
                </Typography>
              </Box>
            </Box>
          )}

          {moderatorData.assigned_info?.assigned_by?.name && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PersonIcon
                sx={{ mr: 2, fontSize: 20, color: 'rgba(255,255,255,0.6)' }}
              />
              <Box>
                <Typography variant="body2" color="rgba(255,255,255,0.6)">
                  Назначен администратором
                </Typography>
                <Typography variant="body1">
                  {moderatorData.assigned_info.assigned_by.name}
                </Typography>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>

      {/* Права модератора */}
      <Box sx={{ mb: 1,  
            background: 'var(--theme-background)',
            backdropFilter: 'var(--theme-backdrop-filter)',
            borderRadius: 'var(--main-border-radius)', p: 3}}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Права модератора
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <PermissionItem
              title="Удаление постов"
              enabled={permissions.delete_posts}
              icon={<PostAddIcon />}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <PermissionItem
              title="Удаление музыки"
              enabled={permissions.delete_music}
              icon={<MusicNoteIcon />}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <PermissionItem
              title="Удаление комментариев"
              enabled={permissions.delete_comments}
              icon={<CommentIcon />}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <PermissionItem
              title="Удаление аватаров"
              enabled={permissions.delete_avatar}
              icon={<PhotoIcon />}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <PermissionItem
              title="Изменение имён"
              enabled={permissions.change_user_name}
              icon={<PersonIcon />}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <PermissionItem
              title="Изменение username"
              enabled={permissions.change_username}
              icon={<PersonIcon />}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <PermissionItem
              title="Управление баг-репортами"
              enabled={permissions.manage_bug_reports}
              icon={<BugReportIcon />}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <PermissionItem
              title="Удаление баг-репортов"
              enabled={permissions.delete_bug_reports}
              icon={<BugReportIcon />}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <PermissionItem
              title="Редактирование бейджиков"
              enabled={permissions.edit_badges}
              icon={<EmojiEventsIcon />}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <PermissionItem
              title="Удаление бейджиков"
              enabled={permissions.delete_badges}
              icon={<EmojiEventsIcon />}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <PermissionItem
              title="Управление артистами"
              enabled={permissions.manage_artists}
              icon={<PersonAddIcon />}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <PermissionItem
              title="Удаление артистов"
              enabled={permissions.delete_artists}
              icon={<PersonAddIcon />}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <PermissionItem
              title="Верификация пользователей"
              enabled={permissions.verify_users}
              icon={<VerifiedUserIcon />}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <PermissionItem
              title="Назначение модераторов"
              enabled={permissions.assign_moderators}
              icon={<AdminPanelSettings />}
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default ProfileTab;
