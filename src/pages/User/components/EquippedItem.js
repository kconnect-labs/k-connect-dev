import React, { useState, useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { keyframes } from '@mui/system';

const particleAnimation = (color) => keyframes`
  0% {
    transform: scale(1) translate(0, 0);
    opacity: 0.8;
  }
  100% {
    transform: scale(${Math.random() * 0.5 + 0.5}) translate(${(Math.random() - 0.5) * 120}px, ${(Math.random() - 0.5) * 120}px);
    opacity: 0;
  }
`;

const levitationAnimation = keyframes`
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-5px);
  }
  100% {
    transform: translateY(0px);
  }
`;

const EquippedItemContainer = styled(Box)(({ index }) => {
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
        animation: `${levitationAnimation} ${3 + Math.random()}s ease-in-out infinite`,
        animationDelay: `${index * 0.2}s`,
    };
});

const ItemImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'contain',
  filter: 'drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.5))',
  position: 'relative',
  zIndex: 1,
});

const ParticlesContainer = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  zIndex: 1,
});

const Particle = styled(Box)(({ color, delay, duration }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  width: `${Math.random() * 5 + 2}px`,
  height: `${Math.random() * 5 + 2}px`,
  borderRadius: '50%',
  backgroundColor: color,
  animation: `${particleAnimation(color)} ${duration}s ease-out infinite`,
  animationDelay: `${delay}s`,
  opacity: 0,
}));

const getAverageColor = (imgElement, callback) => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d', { willReadFrequently: true });
  const width = imgElement.width;
  const height = imgElement.height;

  if (width === 0 || height === 0) {
    callback('rgba(208, 188, 255, 0.7)');
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
    callback('rgba(208, 188, 255, 0.7)'); // fallback color
    return;
  }

  let r = 0, g = 0, b = 0;
  let count = 0;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] > 128) { // a(alpha) > 128 to ignore transparent pixels
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      count++;
    }
  }
  
  if (count === 0) {
      callback('rgba(208, 188, 255, 0.7)'); // fallback if all transparent
      return;
  }

  r = Math.floor(r / count);
  g = Math.floor(g / count);
  b = Math.floor(b / count);

  callback(`rgba(${r}, ${g}, ${b}, 0.8)`);
};

const EquippedItem = ({ item, index = 0 }) => {
  const [particleColor, setParticleColor] = useState('rgba(208, 188, 255, 0.7)');
  const imgRef = useRef(null);

  useEffect(() => {
    if (item?.image_url) {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = item.image_url;
      img.onload = () => {
        getAverageColor(img, (color) => {
          setParticleColor(color);
        });
      };
      img.onerror = () => {
        setParticleColor('rgba(208, 188, 255, 0.7)');
      }
    }
  }, [item?.image_url]);

  if (!item) {
    return null;
  }

  const particles = Array.from({ length: 25 }).map((_, i) => (
    <Particle
      key={i}
      color={particleColor}
      delay={Math.random() * 3}
      duration={Math.random() * 2 + 2}
    />
  ));

  return (
    <EquippedItemContainer index={index}>
      <ParticlesContainer>{particles}</ParticlesContainer>
      <ItemImage ref={imgRef} src={item.image_url} alt={item.item_name} />
    </EquippedItemContainer>
  );
};

export default EquippedItem; 