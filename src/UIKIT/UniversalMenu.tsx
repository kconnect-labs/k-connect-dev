import React from 'react';
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  styled,
} from '@mui/material';

// Стилизованное меню в стиле ВКонтакте
const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiList-root': {
    padding: '8px 0',
  },
}));

const StyledMenuItem = styled(MenuItem, {
  shouldForwardProp: prop => prop !== 'danger',
})<{ danger?: boolean }>(({ theme, danger }) => ({
  padding: '8px 16px',
  fontSize: 14,
  color: danger ? 'var(--error-color, #ff6b6b)' : 'var(--text-primary, #ffffff)',
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

export interface MenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
  divider?: boolean;
}

interface UniversalMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  items: MenuItem[];
  onClick?: (event: React.MouseEvent) => void;
}

const UniversalMenu: React.FC<UniversalMenuProps> = ({
  anchorEl,
  open,
  onClose,
  items,
  onClick,
}) => {
  // Добавляем глобальные стили для переопределения Material-UI
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .universal-menu-override .MuiPaper-root,
      .universal-menu-override .MuiPopover-paper,
      .universal-menu-override .MuiMenu-paper {
        background-color: var(--theme-background, rgba(20, 20, 20, 0.4)) !important;
        border-radius: 8px !important;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12) !important;
        border: 1px solid var(--border-color, rgba(0, 0, 0, 0.08)) !important;
        min-width: 200px !important;
        overflow: hidden !important;
        backdrop-filter: var(--theme-backdrop-filter, blur(10px)) !important;
        background-image: none !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  const handleItemClick = (item: MenuItem) => (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!item.disabled) {
      item.onClick();
      onClose();
    }
  };

  const handleMenuClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (onClick) {
      onClick(event);
    }
  };

  return (
    <StyledMenu
      className="universal-menu-override"
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      onClick={handleMenuClick}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      {items.map((item, index) => (
        <React.Fragment key={item.id}>
          {item.divider && index > 0 && <StyledDivider />}
          <StyledMenuItem
            onClick={handleItemClick(item)}
            disabled={item.disabled}
            danger={item.danger}
          >
            {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
            <ListItemText>{item.label}</ListItemText>
          </StyledMenuItem>
        </React.Fragment>
      ))}
    </StyledMenu>
  );
};

export default UniversalMenu; 