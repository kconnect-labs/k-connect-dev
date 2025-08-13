import React from 'react';
import { Box } from '@mui/material';
import ImageSkeleton from './ImageSkeleton';

// Тестовые данные из API
const testDimensions = {
  width: 735,
  height: 561,
  aspect_ratio: 1.31
};

const TestImageSkeleton = () => {
  return (
    <Box sx={{ p: 2, maxWidth: 600 }}>
      <h3>Тест скелетона изображения</h3>
      <p>Размеры из API: {testDimensions.width} x {testDimensions.height} (ratio: {testDimensions.aspect_ratio})</p>
      
      <Box sx={{ mb: 2 }}>
        <h4>Одиночное изображение (десктоп, стандартные размеры):</h4>
        <ImageSkeleton 
          isSingle={true}
          isMobile={false}
          imageDimensions={testDimensions}
        />
      </Box>
      
      <Box sx={{ mb: 2 }}>
        <h4>Одиночное изображение (десктоп, кастомные размеры):</h4>
        <ImageSkeleton 
          isSingle={true}
          isMobile={false}
          imageDimensions={testDimensions}
          maxWidth={500}
          maxHeight={400}
        />
      </Box>
      
      <Box sx={{ mb: 2 }}>
        <h4>Одиночное изображение (мобильный):</h4>
        <ImageSkeleton 
          isSingle={true}
          isMobile={true}
          imageDimensions={testDimensions}
        />
      </Box>
      
      <Box sx={{ mb: 2 }}>
        <h4>В сетке изображений:</h4>
        <ImageSkeleton 
          isSingle={false}
          isMobile={false}
          imageDimensions={testDimensions}
        />
      </Box>
    </Box>
  );
};

export default TestImageSkeleton;
