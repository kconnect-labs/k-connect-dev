import React from 'react';
import { Button, Box, Typography, Grid } from '@mui/material';
import {
  Person,
  Notifications,
  Edit,
  Chat,
  Link,
  Science,
  Brush,
  AccountCircle,
  EmojiEvents,
  AlternateEmail,
  Favorite,
  Storage,
  Style,
  Gavel,
  Security,
} from '@mui/icons-material';

interface SettingsSection {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
}

interface SettingsListProps {
  onOpenModal: (section: string) => void;
}

const settingsSections: SettingsSection[] = [
  {
    id: 'profile',
    title: 'Профиль',
    subtitle: 'Аватар, баннер',
    icon: <Person />,
    color: 'rgba(99, 101, 241, 0.66)', // #6366f1 с прозрачностью
  },
  {
    id: 'info',
    title: 'Основная информация',
    subtitle: 'Имя, юзернейм, описание',
    icon: <Edit />,
    color: 'rgba(139, 92, 246, 0.66)', // #8b5cf6 с прозрачностью
  },
  {
    id: 'status',
    title: 'Статусы',
    subtitle: 'Настройка статуса профиля',
    icon: <Chat />,
    color: 'rgba(6, 182, 212, 0.66)', // #06b6d4 с прозрачностью
  },
  {
    id: 'privacy',
    title: 'Приватность',
    subtitle: 'Настройки приватности профиля и музыки',
    icon: <Security />,
    color: 'rgba(34, 197, 94, 0.66)', // #22c55e с прозрачностью
  },
  {
    id: 'customization',
    title: 'Кастомизация',
    subtitle: 'Обои, цвета, декорации',
    icon: <Brush />,
    color: 'rgba(236, 72, 153, 0.66)', // #ec4899 с прозрачностью
  },
  {
    id: 'theme',
    title: 'Тема интерфейса',
    subtitle: 'Множество тем для интерфейса',
    icon: <Style />,
    color: 'rgba(168, 85, 247, 0.66)', // #a855f7 с прозрачностью
  },
  {
    id: 'badges',
    title: 'Бейджи',
    subtitle: 'Управление достижениями',
    icon: <EmojiEvents />,
    color: 'rgba(255, 193, 7, 0.66)', // #ffc107 с прозрачностью
  },
  {
    id: 'socials',
    title: 'Социальные сети',
    subtitle: 'Ссылки на социальные сети',
    icon: <Link />,
    color: 'rgba(16, 185, 129, 0.66)', // #10b981 с прозрачностью
  },
  {
    id: 'notifications',
    title: 'Уведомления',
    subtitle: 'Настройки уведомлений и оповещений',
    icon: <Notifications />,
    color: 'rgba(16, 185, 129, 0.66)', // #10b981 с прозрачностью
  },
  {
    id: 'cache',
    title: 'Управление кешем',
    subtitle: 'Очистка и управление хранилищем',
    icon: <Storage />,
    color: 'rgba(76, 175, 80, 0.66)', // #4caf50 с прозрачностью
  },
  {
    id: 'security',
    title: 'Безопасность',
    subtitle: 'Данные входа и защита аккаунта',
    icon: <Gavel />,
    color: 'rgba(239, 68, 68, 0.66)', // #ef4444 с прозрачностью
  },
  {
    id: 'account-status',
    title: 'Состояние аккаунта',
    subtitle: 'Предупреждения, баны и апелляции',
    icon: <Gavel />,
    color: 'rgba(245, 158, 11, 0.66)', // #f59e0b с прозрачностью
  },
  {
    id: 'experimental',
    title: 'Экспериментальные функции',
    subtitle: 'Функции в разработке',
    icon: <Science />,
    color: 'rgba(168, 85, 247, 0.66)', // #a855f7 с прозрачностью
  },
  {
    id: 'connections',
    title: 'Коннектики',
    subtitle: 'Поиск и управление связями',
    icon: <Favorite />,
    color: 'rgba(236, 72, 153, 0.66)', // #ec4899 с прозрачностью
  },
  {
    id: 'linked',
    title: 'Связанные аккаунты',
    subtitle: 'Telegram, Element и другие',
    icon: <AccountCircle />,
    color: 'rgba(59, 130, 246, 0.66)', // #3b82f6 с прозрачностью
  },
  {
    id: 'sessions',
    title: 'Сессии',
    subtitle: 'Управление сессиями',
    icon: <Gavel />,
    color: 'rgba(245, 158, 11, 0.66)', // #f59e0b с прозрачностью
  },
  {
    id: 'usernames',
    title: 'Магазин юзернеймов',
    subtitle: 'Покупка и управление юзернеймами',
    icon: <AlternateEmail />,
    color: 'rgba(156, 39, 176, 0.66)', // #9c27b0 с прозрачностью
  },
];

const SettingsList: React.FC<SettingsListProps> = React.memo(
  ({ onOpenModal }) => {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {settingsSections.map(section => (
          <Button
            key={section.id}
            onClick={() => onOpenModal(section.id)}
            className='theme-aware'
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              padding: '12px 16px',
              border: '1px solid rgba(66, 66, 66, 0.5)',
              borderRadius: 'var(--main-border-radius)',
              color: 'var(--theme-text-primary)',
              textTransform: 'none',
              transition: 'all 0.2s ease',
              '&:hover': {
                border: '1px solid rgba(255, 255, 255, 0.2)',
                transform: 'translateY(-1px)',
              },
              '&:active': {
                transform: 'translateY(0)',
              },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: 'var(--main-border-radius)',
                background: section.color,
                marginRight: 2,
                flexShrink: 0,
              }}
            >
              {section.icon}
            </Box>

            <Box sx={{ textAlign: 'left', flex: 1 }}>
              <Typography
                variant='h6'
                sx={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  marginBottom: 0.5,
                  color: 'var(--theme-text-primary)',
                }}
              >
                {section.title}
              </Typography>
              <Typography
                variant='body2'
                sx={{
                  color: 'var(--theme-text-secondary)',
                  fontSize: '0.875rem',
                }}
              >
                {section.subtitle}
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 24,
                height: 24,
                borderRadius: 'var(--main-border-radius)',
                background: 'rgba(255, 255, 255, 0.1)',
                marginLeft: 1,
              }}
            >
              <Edit
                sx={{ fontSize: 16, color: 'var(--theme-text-secondary)' }}
              />
            </Box>
          </Button>
        ))}
      </Box>
    );
  }
);

SettingsList.displayName = 'SettingsList';

export default SettingsList;
