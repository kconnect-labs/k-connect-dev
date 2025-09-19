import React, { useState } from 'react';
import {
  Box,
  Typography,
  Popover,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame } from 'lucide-react';
import { ReactionEmoji, ReactionsSummary } from '../types';

// Импортируем кастомные эмодзи
// TODO: Добавить недостающие изображения для ❤️ и 😢
import fireEmoji from '../../../assets/emoji/fire_1f525.png';
import heartEmoji from '../../../assets/emoji/red-heart_2764-fe0f.png';
import joyEmoji from '../../../assets/emoji/face-with-tears-of-joy_1f602.png';
import astonishedEmoji from '../../../assets/emoji/astonished-face_1f632.png';
import sadEmoji from '../../../assets/emoji/smiling-face-with-tear_1f972.png'; // Используем как sad

interface ReactionsButtonProps {
  postId: number;
  reactionsSummary: ReactionsSummary;
  userReaction: ReactionEmoji | null;
  onReactionChange: (emoji: ReactionEmoji) => void;
  isLoading?: boolean;
}

const REACTION_EMOJIS: { emoji: ReactionEmoji; label: string; icon: string; image: string }[] = [
  { emoji: '🔥', label: 'Огонь', icon: 'flame', image: fireEmoji },
  { emoji: '❤️', label: 'Любовь', icon: 'heart', image: heartEmoji },
  { emoji: '😂', label: 'Смех', icon: 'laugh', image: joyEmoji },
  { emoji: '😮', label: 'Удивление', icon: 'surprised', image: astonishedEmoji },
  { emoji: '😢', label: 'Грусть', icon: 'sad', image: sadEmoji },
];

// Функция для определения Apple устройства
const isAppleDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = window.navigator.userAgent.toLowerCase();
  const platform = window.navigator.platform.toLowerCase();
  
  return (
    userAgent.includes('iphone') ||
    userAgent.includes('ipad') ||
    userAgent.includes('ipod') ||
    userAgent.includes('mac') ||
    platform.includes('mac') ||
    platform.includes('iphone') ||
    platform.includes('ipad')
  );
};

// Функция для получения изображения эмодзи
const getEmojiImage = (emoji: ReactionEmoji): string => {
  const reaction = REACTION_EMOJIS.find(r => r.emoji === emoji);
  return reaction?.image || fireEmoji;
};

export const ReactionsButton: React.FC<ReactionsButtonProps> = ({
  postId,
  reactionsSummary,
  userReaction,
  onReactionChange,
  isLoading = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Определяем, является ли устройство Apple
  const isApple = isAppleDevice();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleReactionClick = (emoji: ReactionEmoji) => {
    onReactionChange(emoji);
    handleClose();
  };

  const open = Boolean(anchorEl);

  // Получаем общее количество реакций
  const totalReactions = Object.values(reactionsSummary).reduce((sum, count) => sum + count, 0);

  // Получаем активные реакции (с количеством > 0)
  const getActiveReactions = () => {
    const activeReactions = Object.entries(reactionsSummary)
      .filter(([_, count]) => count > 0)
      .sort(([_, a], [__, b]) => b - a); // Сортируем по убыванию количества
    
    // На мобильных показываем только топ-3, на ПК все
    return isMobile ? activeReactions.slice(0, 3) : activeReactions;
  };

  const activeReactions = getActiveReactions();

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          position: 'relative',
          transition: 'all 0.2s ease',
        }}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {activeReactions.length > 0 ? (
          // Показываем активные реакции с количеством
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            {activeReactions.map(([emoji, count], index) => (
              <motion.div
                key={`${emoji}-${index}`}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ 
                  duration: 0.3, 
                  type: 'spring',
                  delay: index * 0.1 
                }}
                style={{
                  position: 'relative',
                  zIndex: activeReactions.length - index,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px',
                  }}
                >
                  {isApple ? (
                    // Для Apple устройств используем нативные эмодзи
                    <Typography
                      sx={{
                        fontSize: '16px',
                        lineHeight: 1,
                        opacity: emoji === userReaction ? 1 : 0.8,
                      }}
                    >
                      {emoji}
                    </Typography>
                  ) : (
                    // Для остальных устройств используем кастомные изображения
                    <Box
                      component="img"
                      src={getEmojiImage(emoji as ReactionEmoji)}
                      alt={emoji}
                      sx={{
                        width: '16px',
                        height: '16px',
                        filter: isHovered ? 'drop-shadow(0 0 8px rgba(255,255,255,0.3))' : 'none',
                        opacity: emoji === userReaction ? 1 : 0.8,
                      }}
                    />
                  )}
                  <Typography
                    sx={{
                      color: '#fff',
                      fontSize: '0.75rem',
                      opacity: emoji === userReaction ? 1 : 0.7,
                    }}
                  >
                    {count}
                  </Typography>
                </Box>
              </motion.div>
            ))}
          </Box>
        ) : (
          // Показываем дефолтную иконку если нет реакций
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 21,
              height: 21,
              lineHeight: 0,
            }}
          >
            <motion.div
              key="default-icon"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Flame
                size={21}
                color="#fff"
                style={{
                  display: 'block',
                  verticalAlign: 'middle',
                }}
              />
            </motion.div>
          </Box>
        )}
      </Box>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        PaperProps={{
          sx: {
            background: 'var(--background-color)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 0, 0, 0.12)',
            borderRadius: '999px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            p: '2px',
            minWidth: 'auto',
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
          }}
        >
            {REACTION_EMOJIS.map((reaction) => {
              const emoji = reaction.emoji;
              const count = reactionsSummary[emoji as keyof ReactionsSummary] || 0;
              const isSelected = userReaction === emoji;

              return (
                <Tooltip key={emoji} title={reaction.label} placement="top">
                  <motion.div
                    whileTap={{ scale: 0.95 }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        width: '30px',
                        height: '30px',
                        borderRadius: '100%',
                        background: isSelected 
                          ? 'rgba(255, 255, 255, 0.15)' 
                          : 'transparent',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.1)',
                        },
                      }}
                      onClick={() => handleReactionClick(emoji)}
                    >
                      {isApple ? (
                        // Для Apple устройств используем нативные эмодзи
                        <Typography
                          sx={{
                            fontSize: '20px',
                            lineHeight: 1,
                          }}
                        >
                          {emoji}
                        </Typography>
                      ) : (
                        // Для остальных устройств используем кастомные изображения
                        <Box
                          component="img"
                          src={reaction.image}
                          alt={emoji}
                          sx={{
                            width: '20px',
                            height: '20px',
                          }}
                        />
                      )}
                    </Box>
                  </motion.div>
                </Tooltip>
              );
            })}
          </Box>
      </Popover>
    </>
  );
}; 