/**
 * Утилиты для работы с цветами профиля и Lottie анимациями
 */

// Цвета из оригинального newoverlay.json
export const ORIGINAL_LOTTIE_COLORS = {
  // Основные цвета частиц
  primary: [1, 0, 0.51764681947, 1], // rgb(255, 0, 131) - розовый
  secondary: [1, 0.717231840246, 0.109803914089, 1], // rgb(255, 183, 28) - оранжевый
  tertiary: [1, 0.109803914089, 0.361153187471, 1], // rgb(255, 28, 92) - красный
  quaternary: [0.109803914089, 0.570611093559, 1, 1], // rgb(28, 145, 255) - голубой
  
  // Цвета обводок
  stroke: [0.01568627451, 0, 0.086274509804, 1], // Темно-синий из реального файла
  stroke2: [1, 0.541176470588, 0, 1], // rgb(255, 138, 0) - оранжевый
  stroke3: [0.039215682535, 0.740022906135, 1, 1], // rgb(10, 189, 255) - голубой
  
  // Фоновые цвета
  background: [0, 0.18472886927, 0.356862745098, 1], // rgb(0, 47, 91) - темно-синий
};

/**
 * Конвертирует hex цвет в RGB массив для Lottie
 */
export function hexToLottieRgba(hex: string, alpha: number = 1): [number, number, number, number] {
  // Убираем # если есть
  hex = hex.replace('#', '');
  
  // Конвертируем в RGB
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;
  
  return [r, g, b, alpha];
}

/**
 * Конвертирует RGB строку в RGB массив для Lottie
 */
export function rgbToLottieRgba(rgb: string, alpha: number = 1): [number, number, number, number] {
  // Извлекаем числа из строки типа "rgb(255, 0, 131)"
  const matches = rgb.match(/\d+/g);
  if (!matches || matches.length < 3) {
    return [1, 1, 1, alpha]; // Белый по умолчанию
  }
  
  const r = parseInt(matches[0]) / 255;
  const g = parseInt(matches[1]) / 255;
  const b = parseInt(matches[2]) / 255;
  
  return [r, g, b, alpha];
}

/**
 * Создает более светлый оттенок цвета
 */
export function lightenColor(color: [number, number, number, number], factor: number = 0.3): [number, number, number, number] {
  const [r, g, b, a] = color;
  return [
    Math.min(1, r + (1 - r) * factor),
    Math.min(1, g + (1 - g) * factor),
    Math.min(1, b + (1 - b) * factor),
    a
  ];
}

/**
 * Создает более темный оттенок цвета
 */
export function darkenColor(color: [number, number, number, number], factor: number = 0.3): [number, number, number, number] {
  const [r, g, b, a] = color;
  return [
    Math.max(0, r * (1 - factor)),
    Math.max(0, g * (1 - factor)),
    Math.max(0, b * (1 - factor)),
    a
  ];
}

/**
 * Создает контрастный цвет (для обводок)
 */
export function createContrastColor(color: [number, number, number, number], factor: number = 0.2): [number, number, number, number] {
  const [r, g, b, a] = color;
  
  // Создаем контрастный цвет, смешивая с белым или черным
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  
  if (luminance > 0.5) {
    // Светлый цвет - делаем темнее
    return darkenColor(color, factor);
  } else {
    // Темный цвет - делаем светлее
    return lightenColor(color, factor);
  }
}

/**
 * Создает палитру цветов на основе цвета профиля
 */
export function createProfileColorPalette(profileColor: string): {
  primary: [number, number, number, number];
  secondary: [number, number, number, number];
  tertiary: [number, number, number, number];
  stroke: [number, number, number, number];
  background: [number, number, number, number];
} {
  // Конвертируем цвет профиля в Lottie формат
  let baseColor: [number, number, number, number];
  
  if (profileColor.startsWith('#')) {
    baseColor = hexToLottieRgba(profileColor);
  } else if (profileColor.startsWith('rgb')) {
    baseColor = rgbToLottieRgba(profileColor);
  } else {
    // Fallback на оригинальный цвет
    baseColor = ORIGINAL_LOTTIE_COLORS.primary as [number, number, number, number];
  }
  
  return {
    // Основной цвет - цвет профиля
    primary: baseColor,
    
    // Вторичный цвет - светлее на 20%
    secondary: lightenColor(baseColor, 0.2),
    
    // Третичный цвет - темнее на 15%
    tertiary: darkenColor(baseColor, 0.15),
    
    // Цвет обводки - контрастный
    stroke: createContrastColor(baseColor, 0.3),
    
    // Фоновый цвет - очень темный оттенок
    background: darkenColor(baseColor, 0.8)
  };
}

/**
 * Применяет цветовую палитру к Lottie данным
 */
export function applyColorPaletteToLottie(
  lottieData: any, 
  colorPalette: ReturnType<typeof createProfileColorPalette>
): any {
  if (!lottieData || !lottieData.assets) {
    console.log('🎨 applyColorPaletteToLottie: Invalid lottie data');
    return lottieData;
  }
  
  console.log('🎨 applyColorPaletteToLottie: Applying colors', {
    originalAssets: lottieData.assets?.length,
    colorPalette: colorPalette
  });
  
  // Создаем копию данных
  const coloredData = JSON.parse(JSON.stringify(lottieData));
  
  // Функция для сравнения цветов с допуском
  function colorsEqual(color1: number[], color2: number[], tolerance: number = 0.01): boolean {
    if (color1.length !== color2.length) return false;
    return color1.every((val, i) => Math.abs(val - color2[i]) < tolerance);
  }
  
  // Функция для поиска похожего цвета
  function findSimilarColor(color: number[]): [number, number, number, number] | null {
    console.log('🎨 Looking for similar color to:', color);
    
    const originalColors = [
      ORIGINAL_LOTTIE_COLORS.primary,
      ORIGINAL_LOTTIE_COLORS.secondary,
      ORIGINAL_LOTTIE_COLORS.tertiary,
      ORIGINAL_LOTTIE_COLORS.quaternary,
      ORIGINAL_LOTTIE_COLORS.stroke,
      ORIGINAL_LOTTIE_COLORS.stroke2,
      ORIGINAL_LOTTIE_COLORS.stroke3,
      ORIGINAL_LOTTIE_COLORS.background,
    ];
    
    const newColors = [
      colorPalette.primary,
      colorPalette.secondary,
      colorPalette.tertiary,
      colorPalette.secondary, // quaternary -> secondary
      colorPalette.stroke,
      colorPalette.stroke,
      colorPalette.stroke,
      colorPalette.background,
    ];
    
    // Сначала пробуем точное совпадение
    for (let i = 0; i < originalColors.length; i++) {
      if (colorsEqual(color, originalColors[i], 0.001)) {
        console.log(`🎨 Found exact match for color ${JSON.stringify(color)} -> ${JSON.stringify(newColors[i])}`);
        return newColors[i];
      }
    }
    
    // Если точного совпадения нет, пробуем с большим допуском
    for (let i = 0; i < originalColors.length; i++) {
      if (colorsEqual(color, originalColors[i], 0.1)) {
        console.log(`🎨 Found approximate match for color ${JSON.stringify(color)} -> ${JSON.stringify(newColors[i])}`);
        return newColors[i];
      }
    }
    
    // Если ничего не найдено, проверяем, является ли цвет темным
    const brightness = (color[0] + color[1] + color[2]) / 3;
    if (brightness < 0.3) {
      // Темные цвета заменяем на stroke
      console.log(`🎨 Dark color ${JSON.stringify(color)} replaced with stroke color`);
      return colorPalette.stroke;
    } else if (brightness > 0.7) {
      // Светлые цвета заменяем на secondary
      console.log(`🎨 Light color ${JSON.stringify(color)} replaced with secondary color`);
      return colorPalette.secondary;
    } else {
      // Остальные цвета заменяем на primary
      console.log(`🎨 Medium color ${JSON.stringify(color)} replaced with primary color`);
      return colorPalette.primary;
    }
  }
  
  // Рекурсивно заменяем цвета в данных
  let colorReplacements = 0;
  function replaceColors(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(replaceColors);
    } else if (obj && typeof obj === 'object') {
      const newObj: any = {};
      for (const [key, value] of Object.entries(obj)) {
        if (key === 'c' && Array.isArray(value) && value.length === 4) {
          // Это цвет в формате [r, g, b, a]
          const newColor = findSimilarColor(value);
          if (newColor) {
            colorReplacements++;
            console.log(`🎨 Replacing color ${JSON.stringify(value)} with ${JSON.stringify(newColor)}`);
            newObj[key] = newColor;
          } else {
            newObj[key] = value;
          }
        } else {
          newObj[key] = replaceColors(value);
        }
      }
      return newObj;
    }
    return obj;
  }
  
  const result = replaceColors(coloredData);
  console.log(`🎨 applyColorPaletteToLottie: Replaced ${colorReplacements} colors`);
  return result;
}

/**
 * Получает цвет профиля из пользователя
 */
export function getProfileColor(user: any): string | null {
  // Приоритет: profile_color > status_color > null
  return user?.profile_color || user?.status_color || null;
}

/**
 * Создает адаптивную цветовую палитру на основе цвета профиля
 */
export function createAdaptiveColorPalette(user: any): ReturnType<typeof createProfileColorPalette> | null {
  const profileColor = getProfileColor(user);
  
  console.log('🎨 createAdaptiveColorPalette:', {
    user: user,
    profileColor: profileColor
  });
  
  if (!profileColor) {
    console.log('🎨 No profile color found, using original colors');
    return null; // Используем оригинальные цвета
  }
  
  const palette = createProfileColorPalette(profileColor);
  console.log('🎨 Created color palette:', palette);
  return palette;
}
