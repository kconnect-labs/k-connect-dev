import React, { useState, useEffect, useRef } from 'react';
import OptimizedImage from '../../../../components/OptimizedImage';

// CSS анимации
const styles = `
  @keyframes particle {
    0% {
      transform: scale(1) translate(0, 0) rotate(0deg);
      opacity: 0.9;
    }
    25% {
      transform: scale(1.1) translate(-20px, 5px) rotate(90deg);
      opacity: 1;
    }
    50% {
      transform: scale(1.2) translate(0, 10px) rotate(180deg);
      opacity: 1;
    }
    75% {
      transform: scale(1.1) translate(20px, 5px) rotate(270deg);
      opacity: 0.8;
    }
    100% {
      transform: scale(0.5) translate(${Math.random() * 80 - 40}px, 40px) rotate(360deg);
      opacity: 0;
    }
  }
`;

// Добавляем стили в head
if (!document.getElementById('equipped-item-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'equipped-item-styles';
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

const getContainerStyle = index => {
  const positions = [
    { top: '-15px', right: '0px', zIndex: 12 }, // Верхний-правый
    { top: '70px', right: '-20px', zIndex: 11 }, // Нижний-правый
    { top: '70px', left: '-20px', zIndex: 10, right: 'auto' }, // Нижний-левый
  ];
  const position = positions[index] || positions[0];

  return {
    position: 'absolute',
    ...position,
    width: '60px',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
    // Убрали анимацию движения
  };
};

const getParticleStyle = (color, delay, duration) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  width: `${Math.random() * 12 + 6}px`, // Увеличили размер в 1.5 раза (было 4-12px, стало 6-18px)
  height: `${Math.random() * 12 + 6}px`, // Увеличили размер в 1.5 раза
  background: `radial-gradient(circle at center, ${color} 0%, ${color} 50%, transparent 100%)`,
  clipPath:
    'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
  animation: `particle ${duration}s ease-out infinite`,
  animationDelay: `${delay}s`,
  opacity: 0,
  transform: 'translate(-50%, -50%)',
});

const getAverageColor = (imgElement, callback) => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', { willReadFrequently: true });
  const width = imgElement.width;
  const height = imgElement.height;

  if (width === 0 || height === 0) {
    callback('rgba(208, 188, 255, 0.8)');
    return;
  }

  canvas.width = width;
  canvas.height = height;

  context.drawImage(imgElement, 0, 0);

  let data;
  try {
    data = context.getImageData(0, 0, width, height).data;
  } catch (e) {
    console.error('Could not get image data for color extraction:', e);
    callback('rgba(208, 188, 255, 0.8)'); // fallback color
    return;
  }

  let r = 0,
    g = 0,
    b = 0;
  let count = 0;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] > 128) {
      // a(alpha) > 128 to ignore transparent pixels
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      count++;
    }
  }

  if (count === 0) {
    callback('rgba(208, 188, 255, 0.8)'); // fallback if all transparent
    return;
  }

  r = Math.floor(r / count);
  g = Math.floor(g / count);
  b = Math.floor(b / count);

  callback(`rgba(${r}, ${g}, ${b}, 0.9)`);
};

const EquippedItem = ({ item, index = 0 }) => {
  const [particleColor, setParticleColor] = useState(
    'rgba(208, 188, 255, 0.8)'
  );
  const imgRef = useRef(null);

  useEffect(() => {
    if (item?.image_url) {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = item.image_url;
      img.onload = () => {
        getAverageColor(img, color => {
          setParticleColor(color);
        });
      };
      img.onerror = () => {
        setParticleColor('rgba(208, 188, 255, 0.8)');
      };
    }
  }, [item?.image_url]);

  if (!item) {
    return null;
  }

  const isUpgraded = item.upgrade_level === 1;

  const particles = isUpgraded
    ? Array.from({ length: 10 }).map(
        (
          _,
          i // Уменьшили количество частиц в 2 раза (с 20 до 10)
        ) => (
          <div
            key={i}
            style={getParticleStyle(
              particleColor,
              Math.random() * 4,
              Math.random() * 3 + 3
            )}
          />
        )
      )
    : [];

  return (
    <div style={getContainerStyle(index)}>
      {isUpgraded && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 1,
          }}
        >
          {particles}
        </div>
      )}
      <OptimizedImage
        src={`https://k-connect.ru${item.image_url}`}
        alt={item.item_name}
        width='100%'
        height='100%'
        fallbackText=''
        showSkeleton={false}
        skipExistenceCheck={true}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          position: 'relative',
          zIndex: 1,
        }}
        onLoad={e => {
          if (e && e.target && e.target.complete) {
            getAverageColor(e.target, color => {
              setParticleColor(color);
            });
          }
        }}
      />
    </div>
  );
};

export default EquippedItem;
