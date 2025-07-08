import React, { useState, useEffect, useRef } from 'react';
import { Box, styled, useTheme, useMediaQuery, IconButton, Typography } from '@mui/material';
import { optimizeImage } from '../../utils/imageUtils';
import SimpleImageViewer from '../SimpleImageViewer';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';

const ImageContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  borderRadius: '8px',
  overflow: 'hidden',
  cursor: 'zoom-in',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#11111C',
  maxWidth: '100%',
  transition: 'transform 0.2s ease',
  '&:hover': {
    transform: 'scale(1.015)',
    '& .overlay': {
      opacity: 1,
    },
  },
}));

const CarouselContainer = styled(Box)(({ theme, isMobile }) => ({
  position: 'relative',
  width: '100%',
  borderRadius: '8px',
  overflow: 'hidden',
  backgroundColor: '#11111C',
}));

const CarouselImage = styled('img')(({ isMobile }) => ({
  width: '100%',
  maxHeight: '600px',
  objectFit: 'contain',
  display: 'block',
  transition: 'opacity 0.3s ease',
}));

const CarouselButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  backgroundColor: 'rgba(20, 20, 20, 0.2)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  color: 'white',
  '&:hover': {
    backgroundColor: 'rgba(27, 27, 27, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  zIndex: 10,
  width: 44,
  height: 44,
  borderRadius: '50%',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
}));

const ImageCounter = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '10px',
  right: '10px',
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  color: 'white',
  padding: '4px 8px',
  borderRadius: '12px',
  fontSize: '0.8rem',
  fontWeight: 'bold',
  zIndex: 10,
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
  }
});

const ImageGrid = ({ images, selectedImage = null, onImageClick, onImageError, hideOverlay = false, miniMode = false, maxHeight = 400 }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [optimizedImages, setOptimizedImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorImages, setErrorImages] = useState({});
  const [imageDimensions, setImageDimensions] = useState({});
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const carouselRef = useRef(null);
  
  const imageArray = Array.isArray(images) 
    ? images.filter(Boolean) 
    : (typeof images === 'string' && images ? [images] : []);
  
  if (imageArray.length === 0) {
    return null;
  }

  const formatImageUrl = (url) => {
    if (!url) return '';
    
    if (url.startsWith('http') || url.startsWith('/')) {
      return url;
    }
    
    if (url.includes('post/')) {
      return `/static/uploads/${url}`;
    }
    
    return url;
  };
  
  const supportsWebP = () => {
    try {
      return (
        'imageRendering' in document.documentElement.style && 
        !navigator.userAgent.includes('Safari') && 
        !navigator.userAgent.includes('Edge/')
      ) || 
      document.createElement('canvas')
        .toDataURL('image/webp')
        .indexOf('data:image/webp') === 0;
    } catch (e) {
      return false;
    }
  };
  
  const addFormatParam = (url, format = 'webp') => {
    if (!url || !url.startsWith('/')) return url;
    return `${url}${url.includes('?') ? '&' : '?'}format=${format}`;
  };

  // Функции для конвертации цветов
  const rgbToHsl = (r, g, b) => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return [h * 360, s * 100, l * 100];
  };

  const hslToRgb = (h, s, l) => {
    h /= 360;
    s /= 100;
    l /= 100;

    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return [r * 255, g * 255, b * 255];
  };

  useEffect(() => {
    const loadOptimizedImages = async () => {
      if (!images || images.length === 0) {
        setOptimizedImages([]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      
      try {
        const webpSupported = supportsWebP();
        console.log('WebP support detected:', webpSupported);
        
        const optimizedResults = await Promise.all(
          imageArray.map(async (imageUrl) => {
            let formattedUrl = formatImageUrl(imageUrl);
            
            if (webpSupported && formattedUrl.startsWith('/static/')) {
              formattedUrl = addFormatParam(formattedUrl, 'webp');
            }
            
            const optimized = await optimizeImage(formattedUrl, {
              quality: 0.85,
              maxWidth: 1200,
              cacheResults: true,
              preferWebP: webpSupported
            });
            
            return {
              ...optimized,
              originalSrc: formatImageUrl(imageUrl)
            };
          })
        );
        
        setOptimizedImages(optimizedResults);
        
        // Загружаем размеры всех изображений
        await Promise.all(
          imageArray.map((imageUrl, index) => loadImageDimensions(imageUrl, index))
        );
        
      } catch (error) {
        console.error('Error optimizing images:', error);
        
        setOptimizedImages(imageArray.map(url => ({
          src: formatImageUrl(url),
          originalSrc: formatImageUrl(url)
        })));
        
        // Загружаем размеры даже при ошибке оптимизации
        await Promise.all(
          imageArray.map((imageUrl, index) => loadImageDimensions(imageUrl, index))
        );
      } finally {
        setLoading(false);
      }
    };
    
    loadOptimizedImages();
  }, [images]);

  const getOptimizedImageUrl = (url) => {
    if (url.startsWith('http')) {
      return url;
    }
    
    if (url.includes('/static/uploads/')) {
      return `${url}?width=1200&height=800&optimize=true`;
    }
    
    return url;
  };

  const loadImageDimensions = (url, index) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        const maxWidth = isMobile ? 400 : 600;
        const maxHeight = 600;
        
        let calculatedHeight;
        if (aspectRatio > 1) {
          // Широкая фотография
          calculatedHeight = maxWidth / aspectRatio;
        } else {
          // Высокая фотография
          calculatedHeight = Math.min(maxHeight, maxWidth / aspectRatio);
        }
        
        // Извлекаем доминирующий цвет
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 50;
        canvas.height = 50;
        ctx.drawImage(img, 0, 0, 50, 50);
        const imageData = ctx.getImageData(0, 0, 50, 50);
        const data = imageData.data;
        
        let r = 0, g = 0, b = 0;
        let count = 0;
        
        // Анализируем каждый пиксель
        for (let i = 0; i < data.length; i += 4) {
          const pixelR = data[i];
          const pixelG = data[i + 1];
          const pixelB = data[i + 2];
          
          // Игнорируем слишком темные и слишком светлые пиксели
          const brightness = (pixelR + pixelG + pixelB) / 3;
          if (brightness > 30 && brightness < 220) {
            r += pixelR;
            g += pixelG;
            b += pixelB;
            count++;
          }
        }
        
        // Вычисляем средний цвет
        if (count > 0) {
          r = Math.round(r / count);
          g = Math.round(g / count);
          b = Math.round(b / count);
        } else {
          // Если не нашли подходящих пикселей, берем средний цвет
          r = Math.round(data.reduce((sum, val, i) => i % 4 === 0 ? sum + val : sum, 0) / (data.length / 4));
          g = Math.round(data.reduce((sum, val, i) => i % 4 === 1 ? sum + val : sum, 0) / (data.length / 4));
          b = Math.round(data.reduce((sum, val, i) => i % 4 === 2 ? sum + val : sum, 0) / (data.length / 4));
        }
        
        // Делаем цвет более насыщенным
        const hsl = rgbToHsl(r, g, b);
        hsl[1] = Math.min(100, hsl[1] * 1.5); // Увеличиваем насыщенность
        const [newR, newG, newB] = hslToRgb(hsl[0], hsl[1], hsl[2]);
        
        setImageDimensions(prev => ({
          ...prev,
          [index]: {
            width: img.width,
            height: img.height,
            aspectRatio,
            calculatedHeight: Math.min(calculatedHeight, maxHeight),
            dominantColor: `rgb(${Math.round(newR)}, ${Math.round(newG)}, ${Math.round(newB)})`
          }
        }));
        resolve();
      };
      img.onerror = () => {
        setImageDimensions(prev => ({
          ...prev,
          [index]: {
            calculatedHeight: 600,
            dominantColor: '#11111C'
          }
        }));
        resolve();
      };
      img.src = formatImageUrl(url);
    });
  };

  const openLightbox = (index, event) => {
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

  const nextImage = () => {
    setSelectedIndex((prev) => (prev + 1) % imageArray.length);
  };

  const prevImage = () => {
    setSelectedIndex((prev) => (prev - 1 + imageArray.length) % imageArray.length);
  };

  // Функции для свайпов
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches ? e.targetTouches[0].clientX : e.clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches ? e.targetTouches[0].clientX : e.clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && imageArray.length > 1) {
      nextImage();
    }
    if (isRightSwipe && imageArray.length > 1) {
      prevImage();
    }
  };

  // Функции для drag мыши
  const onMouseDown = (e) => {
    setTouchEnd(null);
    setTouchStart(e.clientX);
  };

  const onMouseMove = (e) => {
    if (touchStart !== null) {
      setTouchEnd(e.clientX);
    }
  };

  const onMouseUp = () => {
    if (touchStart !== null && touchEnd !== null) {
      onTouchEnd();
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  const handleImageError = (url, index) => {
    setErrorImages(prev => ({
      ...prev,
      [url]: true
    }));
    
    if (onImageError && typeof onImageError === 'function') {
      onImageError(url, index);
    }
  };

  const renderImage = (image, index) => {
    const imageUrl = formatImageUrl(image);
    const optimizedUrl = getOptimizedImageUrl(imageUrl);
    const imageDim = imageDimensions[index];
    const calculatedHeight = imageDim?.calculatedHeight || 600;
    
    const hasError = errorImages[imageUrl];
    
    if (hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            maxHeight: `${calculatedHeight}px`,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '0.8rem',
            padding: '10px',
            textAlign: 'center'
          }}
        >
          Ошибка при загрузке изображения
        </Box>
      );
    }
    
    return (
      <CarouselImage
        src={optimizedUrl}
        alt={`Изображение ${index + 1}`}
        loading="lazy"
        isMobile={isMobile}
        onError={() => handleImageError(imageUrl, index)}
        sx={{
          width: '100%',
          height: 'auto',
          objectFit: 'contain',
        }}
      />
    );
  };

  if (loading) {
    const defaultHeight = imageArray.length === 1 ? 600 : 600;
    return (
      <Box
        sx={{
          width: '100%',
          height: '600px',
          maxHeight: `${defaultHeight}px`,
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography color="text.secondary">Загрузка...</Typography>
      </Box>
    );
  }

  // Если только одно изображение
  if (imageArray.length === 1) {
    const singleImage = imageArray[0];
    const imageDim = imageDimensions[0];
    const calculatedHeight = imageDim?.calculatedHeight || 600;
    const dominantColor = imageDim?.dominantColor || '#11111C';
    
    return (
      <Box sx={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', mb: 1 }}>
        <ImageContainer
          onClick={(event) => openLightbox(0, event)}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          sx={{
            maxHeight: miniMode ? '150px' : `${calculatedHeight}px`,
            width: '100%',
            backgroundColor: dominantColor,
            userSelect: 'none',
          }}
        >
          <CarouselImage
            src={getOptimizedImageUrl(formatImageUrl(singleImage))}
            alt="Изображение"
            loading="lazy"
            isMobile={isMobile}
            onError={() => handleImageError(formatImageUrl(singleImage), 0)}
            sx={{
              width: '100%',
              height: 'auto',
              objectFit: 'contain',
              pointerEvents: 'none',
            }}
          />
          {!hideOverlay && <ImageOverlay />}
        </ImageContainer>
        
        {lightboxOpen && (
          <SimpleImageViewer
            src={formatImageUrl(imageArray[selectedIndex])}
            onClose={closeLightbox}
            alt="Полноразмерное изображение"
          />
        )}
      </Box>
    );
  }

  // Карусель для нескольких изображений
  const currentImageDim = imageDimensions[selectedIndex];
  const calculatedHeight = currentImageDim?.calculatedHeight || 600;
  const dominantColor = currentImageDim?.dominantColor || '#11111C';
  
  return (
    <Box sx={{ mb: 1 }}>
      <CarouselContainer
        ref={carouselRef}
        isMobile={isMobile}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        sx={{
          maxHeight: `${calculatedHeight}px`,
          backgroundColor: dominantColor,
          userSelect: 'none',
        }}
      >
        <CarouselImage
          src={getOptimizedImageUrl(formatImageUrl(imageArray[selectedIndex]))}
          alt={`Изображение ${selectedIndex + 1}`}
          loading="lazy"
          isMobile={isMobile}
          onError={() => handleImageError(formatImageUrl(imageArray[selectedIndex]), selectedIndex)}
          sx={{
            width: '100%',
            height: 'auto',
            objectFit: 'contain',
            pointerEvents: 'none',
          }}
        />
        
        {/* Счетчик изображений */}
        <ImageCounter>
          {selectedIndex + 1} / {imageArray.length}
        </ImageCounter>
        
        {/* Кнопка "Назад" */}
        {imageArray.length > 1 && (
          <CarouselButton
            onClick={prevImage}
            sx={{ left: '16px' }}
          >
            <NavigateBeforeIcon sx={{ fontSize: 24, fontWeight: 'bold' }} />
          </CarouselButton>
        )}
        
        {/* Кнопка "Вперед" */}
        {imageArray.length > 1 && (
          <CarouselButton
            onClick={nextImage}
            sx={{ right: '16px' }}
          >
            <NavigateNextIcon sx={{ fontSize: 24, fontWeight: 'bold' }} />
          </CarouselButton>
        )}
        
        {/* Оверлей для открытия лайтбокса */}
        <Box
          onClick={(event) => openLightbox(selectedIndex, event)}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            cursor: 'zoom-in',
            zIndex: 5,
          }}
        >
          {!hideOverlay && <ImageOverlay />}
        </Box>
      </CarouselContainer>
      
      {lightboxOpen && (
        <SimpleImageViewer
          src={formatImageUrl(imageArray[selectedIndex])}
          onClose={closeLightbox}
          alt="Полноразмерное изображение"
        />
      )}
    </Box>
  );
};

export default ImageGrid;