import { useState, useEffect, useMemo } from 'react';
import { extractDominantColor } from '../../../../utils/imageUtils';
import { DominantColor, Track } from '../types';

const defaultCover = '/static/uploads/system/album_placeholder.jpg';

export const useDominantColor = (currentTrack: Track | null) => {
  const [dominantColor, setDominantColor] = useState<DominantColor | null>(
    null
  );

  // Извлечение доминирующего цвета из обложки
  useEffect(() => {
    if (currentTrack?.cover_path) {
      extractDominantColor(
        currentTrack.cover_path || defaultCover,
        (colorString: string) => {
          if (colorString) {
            const [r, g, b] = colorString
              .split(',')
              .map(c => parseInt(c.trim()));

            // Проверяем, не является ли цвет слишком светлым или белым
            const brightness = (r + g + b) / 3;
            const isTooLight = brightness > 180;
            const isTooWhite = r > 220 && g > 220 && b > 220;

            if (isTooLight || isTooWhite) {
              // Используем темный цвет по умолчанию
              setDominantColor({ r: 87, g: 63, b: 135 });
            } else {
              // Затемняем цвета для более приглушенного матового фона
              const darkenedColor: DominantColor = {
                r: Math.max(20, Math.round(r * 0.6)),
                g: Math.max(20, Math.round(g * 0.6)),
                b: Math.max(20, Math.round(b * 0.6)),
              };
              setDominantColor(darkenedColor);
            }
          } else {
            setDominantColor(null);
          }
        }
      );
    } else {
      setDominantColor(null);
    }
  }, [currentTrack?.cover_path]);

  // Мемоизированные цветовые значения
  const activeColor = useMemo(() => {
    if (dominantColor) {
      return `rgb(${dominantColor.r}, ${dominantColor.g}, ${dominantColor.b})`;
    }
    return '#9a7ace';
  }, [dominantColor]);

  const buttonBackgroundColor = useMemo(() => {
    if (dominantColor) {
      return `rgba(${dominantColor.r}, ${dominantColor.g}, ${dominantColor.b}, 0.15)`;
    }
    return 'rgba(255, 45, 85, 0.15)';
  }, [dominantColor]);

  const backgroundColor = useMemo(() => {
    if (dominantColor) {
      return `rgb(${dominantColor.r}, ${dominantColor.g}, ${dominantColor.b})`;
    }
    return 'rgb(87, 63, 135)';
  }, [dominantColor]);

  const overlayColor = useMemo(() => {
    if (dominantColor) {
      return `rgba(${dominantColor.r}, ${dominantColor.g}, ${dominantColor.b}, 0.1)`;
    }
    return 'rgba(87, 63, 135, 0.1)';
  }, [dominantColor]);

  return {
    dominantColor,
    activeColor,
    buttonBackgroundColor,
    backgroundColor,
    overlayColor,
    setDominantColor,
  };
};
