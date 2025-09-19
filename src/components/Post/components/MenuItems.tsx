import React from 'react';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import FlagIcon from '@mui/icons-material/Flag';
import { Link2 } from 'lucide-react';

export const getMenuItems = (
  t: (key: string) => string,
  currentUser: any,
  isCurrentUserPost: boolean,
  isPinned: boolean,
  handlers: {
    handleFactsClick: () => void;
    handleEdit: () => void;
    handleDelete: () => void;
    handlePinPost: () => void;
    handleCopyLink: () => void;
    handleReportClick: () => void;
  }
) => {
  const items = [];

  // Facts (only for user with id 3)
  if (currentUser && currentUser.id === 3) {
    items.push({
      id: 'facts',
      label: 'Факты',
      icon: <FactCheckIcon fontSize='small' />,
      onClick: handlers.handleFactsClick,
    });
  }

  // Items for post owner
  if (isCurrentUserPost) {
    items.push(
      {
        id: 'edit',
        label: t('post.menu_actions.edit'),
        icon: <EditIcon fontSize='small' />,
        onClick: handlers.handleEdit,
      },
      {
        id: 'delete',
        label: t('post.menu_actions.delete'),
        icon: <DeleteIcon fontSize='small' />,
        onClick: handlers.handleDelete,
        danger: true,
      },
      {
        id: 'pin',
        label: isPinned
          ? t('post.menu_actions.unpin')
          : t('post.menu_actions.pin'),
        icon: isPinned ? (
          <PushPinIcon fontSize='small' />
        ) : (
          <PushPinOutlinedIcon fontSize='small' />
        ),
        onClick: handlers.handlePinPost,
      }
    );
  }

  // Copy link (for everyone)
  items.push({
    id: 'copy-link',
    label: t('post.menu_actions.copy_link'),
    icon: <Link2 size={16} />,
    onClick: handlers.handleCopyLink,
  });

  // Report (only for other people's posts)
  if (!isCurrentUserPost) {
    items.push({
      id: 'report',
      label: t('post.menu_actions.report'),
      icon: <FlagIcon fontSize='small' />,
      onClick: handlers.handleReportClick,
      danger: true,
    });
  }

  return items;
};
