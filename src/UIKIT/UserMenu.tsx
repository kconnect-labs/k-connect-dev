import React, { useState } from 'react';
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  styled,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import MessageIcon from '@mui/icons-material/Message';
import BlockIcon from '@mui/icons-material/Block';
import ReportIcon from '@mui/icons-material/Report';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ShareIcon from '@mui/icons-material/Share';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';

// Стилизованное меню в стиле ВКонтакте
const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    backgroundColor: 'var(--theme-background, rgba(20, 20, 20, 0.4))',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
    border: '1px solid var(--border-color, rgba(0, 0, 0, 0.08))',
    minWidth: '200px',
    overflow: 'hidden',
    '& .MuiList-root': {
      padding: '8px 0',
    },
  },
}));

const StyledMenuItem = styled(MenuItem, {
  shouldForwardProp: prop => prop !== 'danger',
})<{ danger?: boolean }>(({ theme, danger }) => ({
  padding: '8px 16px',
  fontSize: 14,
  color: danger
    ? 'var(--error-color, #ff6b6b)'
    : 'var(--text-primary, #ffffff)',
  '&:hover': {
    backgroundColor: danger
      ? 'var(--error-bg-hover, rgba(255, 107, 107, 0.1))'
      : 'var(--bg-hover, rgba(255, 255, 255, 0.08))',
  },
  '& .MuiListItemIcon-root': {
    minWidth: 32,
    color: 'inherit',
  },
}));

const StyledDivider = styled(Divider)(({ theme }) => ({
  margin: '4px 0',
  backgroundColor: 'var(--border-color, rgba(0, 0, 0, 0.08))',
}));

const MenuButton = styled(IconButton)(({ theme }) => ({
  color: 'var(--text-secondary, #666666)',
  padding: '8px',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: 'var(--bg-hover, rgba(0, 0, 0, 0.04))',
    color: 'var(--text-primary, #000000)',
    transform: 'scale(1.05)',
  },
  '&:active': {
    transform: 'scale(0.95)',
  },
}));

interface User {
  id: number;
  username: string;
  name?: string;
  photo?: string;
}

interface UserMenuProps {
  user?: User;
  id?: number;
  username?: string;
  isFollowing?: boolean;
  isCurrentUser?: boolean;
  onFollow?: (userId: number) => void;
  onUnfollow?: (userId: number) => void;
  onMessage?: (user: User) => void;
  onCopyLink?: (user: User) => void;
  onBlock?: (user: User) => void;
  onReport?: (user: User) => void;
  onShare?: (user: User) => void;
  showFollowButton?: boolean;
  showMessageButton?: boolean;
  showCopyLinkButton?: boolean;
  showShareButton?: boolean;
  showBlockButton?: boolean;
  showReportButton?: boolean;
  loading?: boolean;
  size?: 'small' | 'medium' | 'large';
  forceUnfollow?: boolean;
}

/**
 * UserMenu - Компонент меню пользователя в стиле ВКонтакте
 */
const UserMenu: React.FC<UserMenuProps> = ({
  user,
  id,
  username,
  isFollowing = false,
  isCurrentUser = false,
  onFollow,
  onUnfollow,
  onMessage,
  onCopyLink,
  onBlock,
  onReport,
  onShare,
  showFollowButton = true,
  showMessageButton = true,
  showCopyLinkButton = true,
  showShareButton = true,
  showBlockButton = true,
  showReportButton = true,
  loading = false,
  size = 'small',
  forceUnfollow = false,
  ...props
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Создаем объект пользователя из пропсов
  const userObject: User = user || {
    id: id || 0,
    username: username || '',
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleFollowClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const userId = userObject.id;
    if (userId) {
      try {
        if (forceUnfollow || isFollowing) {
          onUnfollow?.(userId);
        } else {
          onFollow?.(userId);
        }
      } catch (error) {
        console.error('Ошибка при подписке/отписке:', error);
      }
    }
    handleMenuClose();
  };

  const handleMessageClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onMessage?.(userObject);
    handleMenuClose();
  };

  const handleCopyLinkClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onCopyLink?.(userObject);
    handleMenuClose();
  };

  const handleBlockClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onBlock?.(userObject);
    handleMenuClose();
  };

  const handleReportClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onReport?.(userObject);
    handleMenuClose();
  };

  const handleShareClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onShare?.(userObject);
    handleMenuClose();
  };

  if (isCurrentUser) {
    return null;
  }

  return (
    <>
      <MenuButton onClick={handleMenuOpen} size={size} {...props}>
        <MoreVertIcon sx={{ fontSize: 20 }} />
      </MenuButton>

      <StyledMenu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          elevation: 0,
        }}
        onClick={e => e.stopPropagation()}
      >
        {showFollowButton && (
          <StyledMenuItem onClick={handleFollowClick} disabled={loading}>
            <ListItemIcon>
              {forceUnfollow || isFollowing ? (
                <PersonRemoveIcon sx={{ fontSize: 18 }} />
              ) : (
                <PersonAddIcon sx={{ fontSize: 18 }} />
              )}
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontSize: 14 }}>
              {forceUnfollow || isFollowing ? 'Отписаться' : 'Подписаться'}
            </ListItemText>
          </StyledMenuItem>
        )}

        {showMessageButton && (
          <StyledMenuItem onClick={handleMessageClick}>
            <ListItemIcon>
              <MessageIcon sx={{ fontSize: 18 }} />
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontSize: 14 }}>
              Написать сообщение
            </ListItemText>
          </StyledMenuItem>
        )}

        {showCopyLinkButton && (
          <StyledMenuItem onClick={handleCopyLinkClick}>
            <ListItemIcon>
              <ContentCopyIcon sx={{ fontSize: 18 }} />
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontSize: 14 }}>
              Скопировать ссылку
            </ListItemText>
          </StyledMenuItem>
        )}

        {showShareButton && (
          <StyledMenuItem onClick={handleShareClick}>
            <ListItemIcon>
              <ShareIcon sx={{ fontSize: 18 }} />
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontSize: 14 }}>
              Поделиться
            </ListItemText>
          </StyledMenuItem>
        )}

        {(showBlockButton || showReportButton) && <StyledDivider />}

        {showBlockButton && (
          <StyledMenuItem onClick={handleBlockClick} danger>
            <ListItemIcon>
              <BlockIcon sx={{ fontSize: 18 }} />
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontSize: 14 }}>
              Заблокировать
            </ListItemText>
          </StyledMenuItem>
        )}

        {showReportButton && (
          <StyledMenuItem onClick={handleReportClick} danger>
            <ListItemIcon>
              <ReportIcon sx={{ fontSize: 18 }} />
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontSize: 14 }}>
              Пожаловаться
            </ListItemText>
          </StyledMenuItem>
        )}
      </StyledMenu>
    </>
  );
};

export default UserMenu;
