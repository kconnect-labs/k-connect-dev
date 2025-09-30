import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { Box, IconButton, styled } from '@mui/material';
import { Close, NavigateBefore, NavigateNext, ZoomIn, ZoomOut } from '@mui/icons-material';

const Overlay = styled(Box)({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.9)',
  zIndex: 9999,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backdropFilter: 'blur(8px)',
});

const ImageContainer = styled(Box)({
  position: 'relative',
  maxWidth: '90vw',
  maxHeight: '90vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const Image = styled('img')({
  maxWidth: '100%',
  maxHeight: '100%',
  objectFit: 'contain',
  transition: 'transform 0.3s ease',
  cursor: 'grab',
  '&:active': {
    cursor: 'grabbing',
  },
});

const NavigationButton = styled(IconButton)({
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  color: 'white',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  zIndex: 10001,
});

const CloseButton = styled(IconButton)({
  position: 'absolute',
  top: 20,
  right: 20,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  color: 'white',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  zIndex: 10001,
});

const ZoomButton = styled(IconButton)({
  position: 'absolute',
  bottom: 20,
  right: 20,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  color: 'white',
  margin: '0 5px',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  zIndex: 10001,
});

const Counter = styled(Box)({
  position: 'absolute',
  bottom: 20,
  left: '50%',
  transform: 'translateX(-50%)',
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  color: 'white',
  padding: '8px 16px',
  borderRadius: 'var(--main-border-radius)',
  fontSize: '14px',
  fontWeight: 'bold',
  zIndex: 10001,
});

const SimpleImageViewer = ({ 
  isOpen = true, 
  onClose, 
  images, 
  src, 
  initialIndex = 0 
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);

  // Поддержка старого API (src) и нового API (images)
  const imageArray = useMemo(() => {
    if (src) {
      // Старый API - одно изображение через src
      return [src];
    }
    if (images) {
      // Новый API - массив изображений
      return Array.isArray(images)
    ? images.filter(Boolean)
    : typeof images === 'string' && images
      ? [images]
      : [];
    }
    return [];
  }, [src, images]);

  const currentImage = imageArray[currentIndex];

  // Сброс состояния при изменении изображения
  useEffect(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, [currentIndex]);

  // Обработка клавиатуры
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          if (imageArray.length > 1) {
            setCurrentIndex((prev) => (prev > 0 ? prev - 1 : imageArray.length - 1));
          }
          break;
        case 'ArrowRight':
          if (imageArray.length > 1) {
            setCurrentIndex((prev) => (prev < imageArray.length - 1 ? prev + 1 : 0));
          }
          break;
        case '+':
        case '=':
          setZoom((prev) => Math.min(prev * 1.2, 5));
          break;
        case '-':
          setZoom((prev) => Math.max(prev / 1.2, 0.5));
          break;
        case '0':
          setZoom(1);
          setPosition({ x: 0, y: 0 });
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, imageArray.length, onClose]);

  // Предотвращение скролла body
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handlePrev = () => {
    if (imageArray.length > 1) {
      setCurrentIndex((prev) => (prev > 0 ? prev - 1 : imageArray.length - 1));
    }
  };

  const handleNext = () => {
    if (imageArray.length > 1) {
      setCurrentIndex((prev) => (prev < imageArray.length - 1 ? prev + 1 : 0));
    }
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev * 1.2, 5));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev / 1.2, 0.5));
  };

  const handleWheel = (e) => {
    if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom((prev) => Math.max(0.5, Math.min(5, prev * delta)));
    }
  };

  const handleMouseDown = (e) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDoubleClick = () => {
    if (zoom === 1) {
      setZoom(2);
    } else {
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    }
  };

  if (!isOpen || !currentImage) {
    return null;
  }

  return ReactDOM.createPortal(
    <Overlay
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      onWheel={handleWheel}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <ImageContainer>
        <Image
          ref={imageRef}
          src={currentImage}
          alt={`Изображение ${currentIndex + 1}`}
          style={{
            transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
          }}
          onMouseDown={handleMouseDown}
          onDoubleClick={handleDoubleClick}
          draggable={false}
        />

        {/* Кнопка закрытия */}
        <CloseButton onClick={onClose} size="large">
          <Close />
        </CloseButton>

        {/* Навигация */}
        {imageArray.length > 1 && (
          <>
            <NavigationButton
              onClick={handlePrev}
              style={{ left: 20 }}
              size="large"
            >
              <NavigateBefore />
            </NavigationButton>
            <NavigationButton
              onClick={handleNext}
              style={{ right: 20 }}
              size="large"
            >
              <NavigateNext />
            </NavigationButton>
          </>
        )}

        {/* Зум */}
        <ZoomButton
          onClick={handleZoomOut}
          style={{ bottom: 20, right: 80 }}
          size="small"
        >
          <ZoomOut />
        </ZoomButton>
        <ZoomButton
          onClick={handleZoomIn}
          style={{ bottom: 20, right: 20 }}
          size="small"
        >
          <ZoomIn />
        </ZoomButton>

        {/* Счетчик */}
        {imageArray.length > 1 && (
          <Counter>
            {currentIndex + 1} / {imageArray.length}
          </Counter>
        )}
      </ImageContainer>
    </Overlay>,
    document.body
  );
};

export default SimpleImageViewer;