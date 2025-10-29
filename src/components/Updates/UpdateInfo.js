import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Chip,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import BugReportIcon from '@mui/icons-material/BugReport';
import UpdateIcon from '@mui/icons-material/Update';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

/**
 * Компонент для отображения информации об обновлениях системы
 * @param {Object} props - Свойства компонента
 * @param {string} props.version - Версия обновления (например, "2.5")
 * @param {string} props.date - Дата обновления (например, "01.06.2023")
 * @param {Array} props.updates - Массив с пунктами обновления
 * @param {Array} props.fixes - Массив с исправлениями
 * @param {string} props.title - Заголовок обновления (опционально)
 * @param {boolean} props.showAllUpdatesButton - Показывать ли кнопку "Все обновления" (по умолчанию true)
 * @param {boolean} props.hideHeader - Скрыть ли заголовок с версией (по умолчанию false)
 */
const UpdateInfo = ({
  version = '2.5',
  date = '01.06.2023',
  updates = [],
  fixes = [],
  title = 'Обновление системы',
  showAllUpdatesButton = true,
  hideHeader = false,
}) => {
  const navigate = useNavigate();

  const handleViewAllUpdates = () => {
    navigate('/updates');
  };

  return (
    <Paper
      sx={{
        p: 0,
        borderRadius: 'var(--main-border-radius)',
        background: 'var(--theme-background, rgba(255, 255, 255, 0.03))',
        backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
        borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
        boxShadow: 'var(--box-shadow)',
        overflow: 'hidden',
        
      }}
    >
      {/* Заголовок секции */}
      {!hideHeader && (
        <Box
          sx={{
            background: theme =>
              theme.palette.mode === 'dark'
                ? 'linear-gradient(90deg, rgba(208, 188, 255, 0.08), rgba(208, 188, 255, 0.02))'
                : 'linear-gradient(90deg, rgba(140, 82, 255, 0.05), rgba(140, 82, 255, 0.01))',
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <NewReleasesIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography
              variant='h6'
              sx={{
                fontWeight: 600,
                fontSize: '1.1rem',
                color: theme => theme.palette.text.primary,
                letterSpacing: '0.2px',
              }}
            >
              {title}
            </Typography>
          </Box>
          <Chip
            label={`v${version}`}
            size='small'
            sx={{
              backgroundColor: 'var(--theme-background, rgba(208, 188, 255, 0.1))',
              color: 'primary.main',
              fontWeight: 'medium',
              borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
            }}
          />
        </Box>
      )}

      {/* Содержимое обновления */}
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2,
          }}
        >
          <Typography variant='subtitle1' fontWeight='medium'>
            Что нового в К-Коннект
          </Typography>
          <Chip
            label={date}
            size='small'
            icon={<UpdateIcon sx={{ fontSize: '16px !important' }} />}
            sx={{
              fontSize: '0.75rem',
              backgroundColor: 'var(--theme-background, rgba(255, 255, 255, 0.05))',
              borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
            }}
          />
        </Box>

        {/* Список обновлений */}
        {updates.length > 0 && (
          <List dense disablePadding sx={{ mb: 2 }}>
            {updates.map((update, index) => (
              <ListItem key={`update-${index}`} sx={{ py: 0.5, px: 0 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <CheckCircleOutlineIcon fontSize='small' color='primary' />
                </ListItemIcon>
                <ListItemText
                  primary={update}
                  primaryTypographyProps={{
                    variant: 'body2',
                    sx: { opacity: 0.9 },
                  }}
                />
              </ListItem>
            ))}
          </List>
        )}

        {/* Список исправлений */}
        {fixes.length > 0 && (
          <>
            <Divider sx={{ my: 1.5, opacity: 0.1 }} />
            <Typography
              variant='subtitle2'
              fontWeight='medium'
              sx={{ mt: 1, mb: 1 }}
            >
              Исправления ошибок:
            </Typography>
            <List dense disablePadding>
              {fixes.map((fix, index) => (
                <ListItem key={`fix-${index}`} sx={{ py: 0.5, px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <BugReportIcon fontSize='small' sx={{ color: '#ff9800' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={fix}
                    primaryTypographyProps={{
                      variant: 'body2',
                      sx: { opacity: 0.8 },
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </>
        )}

        {/* Кнопка "Все обновления" */}
        {showAllUpdatesButton && (
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant='text'
              endIcon={<ArrowForwardIcon />}
              onClick={handleViewAllUpdates}
              sx={{
                textTransform: 'none',
                fontWeight: 'medium',
                fontSize: '0.85rem',
              }}
            >
              История обновлений
            </Button>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default UpdateInfo;
