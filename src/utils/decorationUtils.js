// Функция для парсинга настроек из строки пути декорации
export const parseItemSettings = itemPath => {
  if (!itemPath || !itemPath.includes(';')) {
    return {
      path: itemPath,
      styles: {},
    };
  }

  const [path, ...stylesParts] = itemPath.split(';');
  const stylesString = stylesParts.join(';');

  const styles = {};
  stylesString.split(';').forEach(style => {
    const [property, value] = style.split(':').map(s => s.trim());
    if (property && value) {
      const camelProperty = property.replace(/-([a-z])/g, g =>
        g[1].toUpperCase()
      );
      styles[camelProperty] = value;
    }
  });

  return {
    path: path,
    styles: styles,
  };
};

// Функция для получения только пути изображения без стилей
export const getDecorationImagePath = itemPath => {
  if (!itemPath) return null;
  const [path] = itemPath.split(';');
  return path;
};

// Функция для обработки фона декорации
export const getDecorationBackground = background => {
  if (!background) return null;
  
  // Если это градиент, возвращаем как есть
  if (background.includes('linear-gradient') || background.includes('radial-gradient')) {
    return background;
  }
  
  // Если это путь к изображению, добавляем API_URL
  if (background.includes('/')) {
    return background;
  }
  
  // Если это hex цвет, возвращаем как есть
  if (background.startsWith('#')) {
    return background;
  }
  
  return background;
};

// Функция для получения стилей фона для CSS
export const getBackgroundStyles = background => {
  if (!background) return {};
  
  const isGradient = background.includes('linear-gradient') || background.includes('radial-gradient');
  const isImage = background.includes('/');
  const isHexColor = background.startsWith('#');
  
  return {
    background: isImage ? `url(${background})` : background,
    backgroundSize: isImage ? 'cover' : 'auto',
    backgroundPosition: isImage ? 'center' : 'auto',
    backgroundRepeat: isImage ? 'no-repeat' : 'auto',
  };
};

// Функция для определения типа фона
export const getBackgroundType = background => {
  if (!background) return 'none';
  
  if (background.includes('linear-gradient') || background.includes('radial-gradient')) {
    return 'gradient';
  }
  
  if (background.includes('/')) {
    return 'image';
  }
  
  if (background.startsWith('#')) {
    return 'color';
  }
  
  return 'unknown';
};

// Функция для определения светлого/темного фона (для hex цветов)
export const isLightBackground = hexColor => {
  if (!hexColor || !hexColor.startsWith('#')) return false;
  
  // Убираем # и конвертируем в RGB
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Вычисляем яркость
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
  return brightness > 128;
};

// Функция для получения полных стилей декорации
export const getDecorationStyles = decoration => {
  if (!decoration) return {};
  
  const backgroundStyles = getBackgroundStyles(decoration.background);
  const itemStyles = decoration.item_path ? parseItemSettings(decoration.item_path).styles : {};
  
  return {
    ...backgroundStyles,
    ...itemStyles,
  };
}; 