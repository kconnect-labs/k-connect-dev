import React, { useState, useEffect } from 'react';
import { Box, styled, useTheme, useMediaQuery } from '@mui/material';
import { optimizeImage } from '../../utils/imageUtils';
import SimpleImageViewer from '../SimpleImageViewer';
import { createImageProps } from '../../utils/imageUtils';
import { ImageGridProps } from './types';
import ImageSkeleton from './ImageSkeleton';

const ImageContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: '100%',
  borderRadius: '0px',
  overflow: 'hidden',
  cursor: 'zoom-in',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#11111C',
  maxWidth: '100%',
  transition: 'transform 0.2s ease',

}));

const BackgroundImage = styled('div')({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  filter: 'blur(10px)',
  opacity: 0.5,
  transform: 'scale(1.1)',
});

interface ImageProps {
  isSingle?: boolean;
  isMobile?: boolean;
}

const Image = styled('img')<ImageProps>(({ isSingle, isMobile }) => ({
  maxWidth: '100%',
  maxHeight: isSingle ? (isMobile ? '620px' : '620px') : '100%',
  width: 'auto',
  height: isSingle ? '100%' : 'auto',
  objectFit: isSingle ? 'contain' : 'contain',
  position: 'relative',
  zIndex: 2,
  display: 'block',
}));

const ImageOverlay = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.2)',
  opacity: 0,
  transition: 'all 0.2s ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 3,
  className: 'overlay',
  '&::after': {
    content: '"🔍"',
    fontSize: '24px',
    opacity: 0.85,
    filter: 'drop-shadow(0px 0px 4px rgba(0,0,0,0.5))',
    transform: 'scale(0.8)',
    transition: 'transform 0.2s ease',
  },
  '&:hover::after': {
    transform: 'scale(1.0)',
  },
});

interface GridLayout {
  gridTemplateColumns: string;
  gridTemplateRows: string;
  maxHeight: string;
  height?: string;
  gridTemplateAreas?: string;
}

const ImageGrid: React.FC<ImageGridProps> = ({
  images,
  selectedImage = null,
  onImageClick,
  onImageError,
  hideOverlay = false,
  miniMode = false,
  maxHeight = 620,
  imageDimensions = {},
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [optimizedImages, setOptimizedImages] = useState<Array<{
    src: string;
    originalSrc: string;
    [key: string]: any;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [errorImages, setErrorImages] = useState<Record<string, boolean>>({});
  const [imageLoadingStates, setImageLoadingStates] = useState<Record<string, boolean>>({});

  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const imageArray = Array.isArray(images)
    ? images.filter(Boolean)
    : typeof images === 'string' && images
      ? [images]
      : [];

  const limitedImages = imageArray.slice(0, 9);
  const remainingCount = imageArray.length - 9;

  if (limitedImages.length === 0) {
    return null;
  }

  const getGridLayout = (count: number, isMobile = false): GridLayout => {
    switch (count) {
      case 1:
        return {
          gridTemplateColumns: '1fr',
          gridTemplateRows: 'auto',
          maxHeight: isMobile ? '620px' : '620px',
          height: 'auto',
        };
      case 2:
        return {
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '350px',
          maxHeight: '350px',
        };
      case 3:
        return {
          gridTemplateColumns: '2fr 1fr',
          gridTemplateRows: '200px 200px',
          gridTemplateAreas: '"img1 img2" "img1 img3"',
          maxHeight: '400px',
        };
      case 4:
        return {
          gridTemplateColumns: 'repeat(2, 1fr)',
          gridTemplateRows: 'repeat(2, 200px)',
          gridTemplateAreas: '"img1 img2" "img3 img4"',
          maxHeight: '400px',
        };
      case 5:
        return {
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridTemplateRows: '200px 200px',
          gridTemplateAreas: '"img1 img1 img2" "img3 img4 img5"',
          maxHeight: '400px',
        };
      case 6:
        return {
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridTemplateRows: '180px 180px',
          gridTemplateAreas: '"img1 img2 img3" "img4 img5 img6"',
          maxHeight: '360px',
        };
      case 7:
        return {
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridTemplateRows: 'repeat(3, 160px)',
          gridTemplateAreas:
            '"img1 img1 img2" "img3 img4 img5" "img6 img7 img7"',
          maxHeight: '480px',
        };
      case 8:
        return {
          gridTemplateColumns: 'repeat(4, 1fr)',
          gridTemplateRows: 'repeat(2, 180px)',
          gridTemplateAreas: '"img1 img2 img3 img4" "img5 img6 img7 img8"',
          maxHeight: '360px',
        };
      case 9:
        return {
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridTemplateRows: 'repeat(3, 140px)',
          gridTemplateAreas:
            '"img1 img2 img3" "img4 img5 img6" "img7 img8 img9"',
          maxHeight: '420px',
        };
      default:
        if (count > 9) {
          const columns = count >= 12 ? 4 : 3;
          const rows = Math.ceil(count / columns);
          return {
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, ${500 / rows}px)`,
            maxHeight: `${rows * (500 / rows)}px`,
          };
        }
        return {
          gridTemplateColumns: '1fr',
          gridTemplateRows: '300px',
          maxHeight: isMobile ? '600px' : '450px',
        };
    }
  };

  const formatImageUrl = (url: string): string => {
    if (!url) return '';

    if (url.startsWith('http') || url.startsWith('/')) {
      return url;
    }

    if (url.includes('post/')) {
      return `/static/uploads/${url}`;
    }

    return url;
  };

  const supportsWebP = (): boolean => {
    try {
      return (
        ('imageRendering' in document.documentElement.style &&
          !navigator.userAgent.includes('Safari') &&
          !navigator.userAgent.includes('Edge/')) ||
        document
          .createElement('canvas')
          .toDataURL('image/webp')
          .indexOf('data:image/webp') === 0
      );
    } catch (e) {
      return false;
    }
  };

  const addFormatParam = (url: string, format = 'webp'): string => {
    if (!url || !url.startsWith('/')) return url;
    return `${url}${url.includes('?') ? '&' : '?'}format=${format}`;
  };

  useEffect(() => {
    const loadOptimizedImages = async () => {
      if (!images || (Array.isArray(images) && images.length === 0)) {
        setOptimizedImages([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      // Инициализируем состояния загрузки для всех изображений
      const initialLoadingStates: Record<string, boolean> = {};
      limitedImages.forEach((imageUrl: string) => {
        const formattedUrl = formatImageUrl(imageUrl);
        initialLoadingStates[formattedUrl] = true;
      });
      setImageLoadingStates(initialLoadingStates);

      try {
        const webpSupported = supportsWebP();

        const optimizedResults = await Promise.all(
          limitedImages.map(async (imageUrl: string) => {
            let formattedUrl = formatImageUrl(imageUrl);
            
            if (webpSupported && formattedUrl.startsWith('/static/')) {
              formattedUrl = addFormatParam(formattedUrl, 'webp');
            }

            const optimized = await optimizeImage(formattedUrl, {
              quality: 0.85,
              maxWidth: 1200,
              cacheResults: false,
            });

            return {
              ...optimized,
              originalSrc: formatImageUrl(imageUrl),
            };
          })
        );

        setOptimizedImages(optimizedResults);
      } catch (error) {
        console.error('Error optimizing images:', error);

        setOptimizedImages(
          limitedImages.map((url: string) => ({
            src: formatImageUrl(url),
            originalSrc: formatImageUrl(url),
          }))
        );
      } finally {
        setLoading(false);
      }
    };

    loadOptimizedImages();
  }, [images]);

  const getOptimizedImageUrl = (url: string, isSingle = false): string => {
    const width = isSingle ? 1200 : 600;
    const height = isSingle ? 900 : 600;

    if (url.startsWith('http')) {
      return url;
    }

    if (url.includes('/static/uploads/')) {
      return `${url}?width=${width}&height=${height}&optimize=true`;
    }

    return url;
  };

  const openLightbox = (index: number, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }

    setSelectedIndex(index);
    setLightboxOpen(true);

    if (onImageClick && typeof onImageClick === 'function') {
      onImageClick(index);
    }
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const getCellGridArea = (index: number, count: number): string => {
    if (count === 1) return '';

    if (count === 2) {
      return index === 0
        ? 'span 1 / span 1 / auto / auto'
        : 'span 1 / span 1 / auto / auto';
    }

    if (count === 3) {
      if (index === 0) return 'span 2 / span 1 / auto / auto';
      return 'span 1 / span 1 / auto / auto';
    }

    if (count === 4) {
      return 'span 1 / span 1 / auto / auto';
    }

    if (count === 5) {
      if (index === 0) return 'span 1 / span 2 / auto / auto';
      return 'span 1 / span 1 / auto / auto';
    }

    if (count === 6) {
      return 'span 1 / span 1 / auto / auto';
    }

    if (count === 7) {
      if (index === 0) return 'span 1 / span 2 / auto / auto';
      if (index === 6) return 'span 1 / span 2 / auto / auto';
      return 'span 1 / span 1 / auto / auto';
    }

    if (count === 8) {
      return 'span 1 / span 1 / auto / auto';
    }

    if (count === 9) {
      return 'span 1 / span 1 / auto / auto';
    }

    return '';
  };

  const handleImageError = (url: string, index: number) => {
    setErrorImages(prev => ({
      ...prev,
      [url]: true,
    }));

    // Сбрасываем состояние загрузки при ошибке
    setImageLoadingStates(prev => ({
      ...prev,
      [url]: false,
    }));

    if (onImageError && typeof onImageError === 'function') {
      onImageError(url, index);
    }
  };

  const renderImage = (image: string, index: number, isSingle: boolean) => {
    const imageUrl = formatImageUrl(image);
    const optimizedUrl = getOptimizedImageUrl(imageUrl, isSingle);
    const isLoading = imageLoadingStates[imageUrl] !== false; // true by default until loaded

    const hasError = errorImages[imageUrl];

    // Получаем размеры изображения
    const dimensions = imageDimensions[imageUrl] || imageDimensions[image];
    const aspectRatio = dimensions?.aspect_ratio || 1;
    const isPortrait = aspectRatio < 1;
    const isLandscape = aspectRatio > 1.5;

    if (hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '0px',
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '0.8rem',
            padding: '10px',
            textAlign: 'center',
          }}
        >
          Ошибка при загрузке изображения
        </Box>
      );
    }

    const handleImageLoad = () => {
      setImageLoadingStates(prev => ({
        ...prev,
        [imageUrl]: false
      }));
    };

    const imageProps = createImageProps(optimizedUrl, {
      lazy: true,
      alt: `Изображение ${index + 1}`,
      style: {},
    });

    return (
      <React.Fragment>
        {isLoading && (
          <ImageSkeleton 
            isSingle={limitedImages.length === 1} 
            isMobile={isMobile}
            height={isPortrait ? "100%" : "auto"}
            width="100%"
            imageDimensions={dimensions}
          />
        )}
        <BackgroundImage style={{ backgroundImage: `url(${optimizedUrl})` }} />
        <Image 
          {...imageProps}
          onLoad={handleImageLoad}
          onError={() => handleImageError(imageUrl, index)}
          style={{
            opacity: isLoading ? 0 : 1,
            transition: 'opacity 0.3s ease',
          }}
        />
        {!hideOverlay && <ImageOverlay />}
      </React.Fragment>
    );
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'grid',
          gap: 1,
          ...getGridLayout(limitedImages.length, isMobile),
          opacity: 0.7,
        }}
      >
        {limitedImages.map((image, index) => {
          const imageUrl = formatImageUrl(image);
          const dimensions = imageDimensions[imageUrl] || imageDimensions[image];
          
          return (
            <Box
              key={index}
              sx={{
                gridArea: getCellGridArea(index, limitedImages.length),
              }}
            >
              <ImageSkeleton 
                isSingle={limitedImages.length === 1}
                isMobile={isMobile}
                height="100%"
                width="100%"
                imageDimensions={dimensions}
              />
            </Box>
          );
        })}
      </Box>
    );
  }

  if (limitedImages.length === 1) {
    const singleImage = limitedImages[0];
    return (
      <Box
        sx={{
          position: 'relative',
          borderRadius: '0px',
          overflow: 'hidden',
          mb: 1,
        }}
      >
        <ImageContainer
          onClick={(event: React.MouseEvent) => openLightbox(0, event)}
          sx={{
            height: miniMode ? '150px' : 'auto',
            maxHeight: miniMode ? '150px' : '620px',
          }}
        >
          {renderImage(singleImage, 0, true)}
        </ImageContainer>

        {lightboxOpen && (
          <SimpleImageViewer
            isOpen={lightboxOpen}
            images={limitedImages.map(formatImageUrl)}
            src={limitedImages[selectedIndex || 0] ? formatImageUrl(limitedImages[selectedIndex || 0]) : ''}
            onClose={closeLightbox}
            initialIndex={selectedIndex || 0}
          />
        )}
      </Box>
    );
  }

  const layoutProps = getGridLayout(limitedImages.length, isMobile);

  return (
    <Box sx={{ mb: 1 }}>
      <Box
        sx={{
          display: 'grid',
          gap: '4px',
          ...layoutProps,
          borderRadius: '0px',
          overflow: 'hidden',
        }}
      >
        {limitedImages.map((image, index) => (
          <ImageContainer
            key={`image-${index}`}
            onClick={(event: React.MouseEvent) => openLightbox(index, event)}
            sx={{
              gridArea: getCellGridArea(index, limitedImages.length),
              cursor: 'pointer',
              height: '100%',
            }}
          >
            {renderImage(image, index, false)}
          </ImageContainer>
        ))}

        {remainingCount > 0 && (
          <Box
            sx={{
              position: 'absolute',
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: '#fff',
              padding: '4px 8px',
              borderRadius: '0px',
              fontSize: '0.8rem',
              fontWeight: 'bold',
            }}
          >
            +{remainingCount}
          </Box>
        )}
      </Box>

      {lightboxOpen && (
        <SimpleImageViewer
          isOpen={lightboxOpen}
          images={limitedImages.map(formatImageUrl)}
          src={limitedImages[selectedIndex || 0] ? formatImageUrl(limitedImages[selectedIndex || 0]) : ''}
          onClose={closeLightbox}
          initialIndex={selectedIndex || 0}
        />
      )}
    </Box>
  );
};

export default ImageGrid; 