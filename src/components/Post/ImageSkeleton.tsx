import React from 'react';
import { Box, Skeleton, styled } from '@mui/material';
import { ImageDimensions } from './types';

const SkeletonContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: '100%',
  borderRadius: '16px',
  overflow: 'hidden',
  backgroundColor: 'var(--theme-background)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const GradientPreview = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  borderRadius: '16px',
});

interface ImageSkeletonProps {
  isSingle?: boolean;
  isMobile?: boolean;
  height?: string;
  width?: string;
  imageDimensions?: ImageDimensions | null;
  maxWidth?: number;
  maxHeight?: number;
}

const ImageSkeleton: React.FC<ImageSkeletonProps> = ({
  isSingle = false,
  isMobile = false,
  height = 'auto',
  width = '100%',
  imageDimensions = null,
  maxWidth,
  maxHeight,
}) => {
  // Вычисляем правильную высоту на основе размеров изображения
  let skeletonHeight = height;

  if (imageDimensions && imageDimensions.width && imageDimensions.height) {
    const aspectRatio = imageDimensions.width / imageDimensions.height;

    if (isSingle) {
      // Для одиночного изображения в ленте
      const maxW = maxWidth || (isMobile ? 400 : 600); // Максимальная ширина в ленте
      const maxH = maxHeight || (isMobile ? 400 : 500); // Максимальная высота в ленте

      if (aspectRatio > 1) {
        // Ландшафтное изображение - ограничиваем по ширине
        skeletonHeight = `${maxW / aspectRatio}px`;
      } else {
        // Портретное изображение - ограничиваем по высоте
        skeletonHeight = `${Math.min(maxW / aspectRatio, maxH)}px`;
      }
    } else {
      // Для сетки изображений используем пропорции
      // В сетке изображения обычно квадратные или с фиксированной высотой
      skeletonHeight = '100%';
    }
  }

  return (
    <SkeletonContainer
      sx={{
        height: skeletonHeight,
        width: width,
        backgroundColor: 'var(--theme-background)',
        position: 'relative',
      }}
    >
      <Skeleton
        variant='rectangular'
        width='100%'
        height='100%'
        animation='wave'
        sx={{
          borderRadius: '16px',
          backgroundColor: 'var(--theme-background)',
          '&::after': {
            background:
              'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
          },
        }}
      />
    </SkeletonContainer>
  );
};

export default ImageSkeleton;
