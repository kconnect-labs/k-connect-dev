import { getSvgDataUrl } from '../../../../utils/svgAssets';

/**
 * Получает градиент для фонового изображения
 * @param backgroundId - ID фона из данных предмета
 * @param getGradient - функция для получения градиента по ID
 * @returns CSS градиент или fallback градиент
 */
export const getBackgroundGradient = (
  backgroundId: string | number | undefined,
  getGradient: (id: string | number) => string | null
): string => {
  if (!backgroundId) {
    // Fallback градиент если нет background_id
    return 'radial-gradient(50% 50% at 48.88% 50%, #666666 0%, #333333 100%)';
  }
  
  const gradient = getGradient(backgroundId);
  if (!gradient) {
    // Fallback градиент если градиент не найден в JSON
    return 'radial-gradient(50% 50% at 48.88% 50%, #666666 0%, #333333 100%)';
  }
  
  return gradient;
};

/**
 * Проверяет, является ли предмет оверлеем (upgradeable 2, 3, 4)
 * @param upgradeable - значение upgradeable предмета
 * @returns true если это оверлей
 */
export const isOverlayItem = (upgradeable: string | number): boolean => {
  const upgradeableStr = String(upgradeable);
  return upgradeableStr === '2' || upgradeableStr === '3' || upgradeableStr === '4';
};

/**
 * Создает CSS стили для четырех кругов SVG иконок
 * @param itemId - ID предмета для SVG иконки
 * @param size - размер иконок (внутренний круг)
 * @param upgradeable - значение upgradeable предмета (для определения оверлея)
 * @returns CSS объект с backgroundImage, backgroundSize и backgroundPosition или пустой объект для оверлеев
 */
export const createTwoCirclePattern = (itemId: number, size: number = 22, upgradeable?: string | number) => {
  if (upgradeable && isOverlayItem(upgradeable)) {
    return {};
  }
  
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  const adjustedSize = isMobile ? size * 0.55 : size;
  
  const svgDataUrl = getSvgDataUrl(itemId);
  
  return {
    backgroundImage: 
      /* Внутренний круг - 8 иконок */
      `url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       /* Средний круг - 12 иконок */
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       /* Внешний круг - 20 иконок */
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       /* Угловые иконки - 12 иконок */
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}")`,
    backgroundSize: 
      /* Внутренний круг - 8 иконок */
      `${adjustedSize}px ${adjustedSize}px, ${adjustedSize}px ${adjustedSize}px, ${adjustedSize}px ${adjustedSize}px, ${adjustedSize}px ${adjustedSize}px, ${adjustedSize}px ${adjustedSize}px, ${adjustedSize}px ${adjustedSize}px, ${adjustedSize}px ${adjustedSize}px, ${adjustedSize}px ${adjustedSize}px, ` +
      /* Средний круг - 12 иконок */
      `${adjustedSize}px ${adjustedSize}px, ${adjustedSize}px ${adjustedSize}px, ${adjustedSize}px ${adjustedSize}px, ${adjustedSize}px ${adjustedSize}px, ${adjustedSize}px ${adjustedSize}px, ${adjustedSize}px ${adjustedSize}px, ${adjustedSize}px ${adjustedSize}px, ${adjustedSize}px ${adjustedSize}px, ${adjustedSize}px ${adjustedSize}px, ${adjustedSize}px ${adjustedSize}px, ${adjustedSize}px ${adjustedSize}px, ${adjustedSize}px ${adjustedSize}px, ` +
      /* Внешний круг - 20 иконок */
      `${isMobile ? 13.5 : 18}px ${isMobile ? 13.5 : 18}px, ${isMobile ? 13.5 : 18}px ${isMobile ? 13.5 : 18}px, ${isMobile ? 13.5 : 18}px ${isMobile ? 13.5 : 18}px, ${isMobile ? 13.5 : 18}px ${isMobile ? 13.5 : 18}px, ${isMobile ? 13.5 : 18}px ${isMobile ? 13.5 : 18}px, ${isMobile ? 13.5 : 18}px ${isMobile ? 13.5 : 18}px, ${isMobile ? 13.5 : 18}px ${isMobile ? 13.5 : 18}px, ${isMobile ? 13.5 : 18}px ${isMobile ? 13.5 : 18}px, ${isMobile ? 13.5 : 18}px ${isMobile ? 13.5 : 18}px, ${isMobile ? 13.5 : 18}px ${isMobile ? 13.5 : 18}px, ${isMobile ? 13.5 : 18}px ${isMobile ? 13.5 : 18}px, ${isMobile ? 13.5 : 18}px ${isMobile ? 13.5 : 18}px, ${isMobile ? 13.5 : 18}px ${isMobile ? 13.5 : 18}px, ${isMobile ? 13.5 : 18}px ${isMobile ? 13.5 : 18}px, ${isMobile ? 13.5 : 18}px ${isMobile ? 13.5 : 18}px, ${isMobile ? 13.5 : 18}px ${isMobile ? 13.5 : 18}px, ${isMobile ? 13.5 : 18}px ${isMobile ? 13.5 : 18}px, ${isMobile ? 13.5 : 18}px ${isMobile ? 13.5 : 18}px, ${isMobile ? 13.5 : 18}px ${isMobile ? 13.5 : 18}px, ${isMobile ? 13.5 : 18}px ${isMobile ? 13.5 : 18}px, ` +
      /* Угловые иконки - 12 иконок */
      `${isMobile ? 10.5 : 14}px ${isMobile ? 10.5 : 14}px, ${isMobile ? 10.5 : 14}px ${isMobile ? 10.5 : 14}px, ${isMobile ? 10.5 : 14}px ${isMobile ? 10.5 : 14}px, ${isMobile ? 10.5 : 14}px ${isMobile ? 10.5 : 14}px, ${isMobile ? 10.5 : 14}px ${isMobile ? 10.5 : 14}px, ${isMobile ? 10.5 : 14}px ${isMobile ? 10.5 : 14}px, ${isMobile ? 10.5 : 14}px ${isMobile ? 10.5 : 14}px, ${isMobile ? 10.5 : 14}px ${isMobile ? 10.5 : 14}px, ${isMobile ? 10.5 : 14}px ${isMobile ? 10.5 : 14}px, ${isMobile ? 10.5 : 14}px ${isMobile ? 10.5 : 14}px, ${isMobile ? 10.5 : 14}px ${isMobile ? 10.5 : 14}px`,
    backgroundPosition: 
      /* Внутренний круг - 8 иконок */
      '50% 30%, 65% 35%, 70% 50%, 65% 65%, 50% 70%, 35% 65%, 30% 50%, 35% 35%, ' +
      /* Средний круг - 12 иконок */
      '50% 15%, 70% 22%, 80% 35%, 85% 50%, 80% 65%, 70% 78%, 50% 85%, 30% 78%, 20% 65%, 15% 50%, 20% 35%, 30% 22%, ' +
      /* Внешний круг - 20 иконок */
      '50% 0%, 65% 3%, 80% 10%, 90% 20%, 100% 35%, 100% 50%, 100% 65%, 90% 80%, 80% 90%, 65% 97%, 50% 100%, 35% 97%, 20% 90%, 10% 80%, 0% 65%, 0% 50%, 0% 35%, 10% 20%, 20% 10%, 35% 3%, ' +
      /* Угловые иконки - 12 иконок */
      '95% 5%, 98% 15%, 85% 2%, 95% 95%, 98% 85%, 85% 98%, 5% 95%, 15% 98%, 2% 85%, 5% 5%, 15% 2%, 2% 15%',
    backgroundRepeat: 'no-repeat',
    
  };
};

/**
 * Создает CSS стили для маленьких карточек (50% от обычного размера)
 */
export const createSmallCirclePattern = (itemId: number, upgradeable?: string | number) => {
  // Для оверлеев не создаем SVG паттерны
  if (upgradeable && isOverlayItem(upgradeable)) {
    return {};
  }
  
  // Проверяем ширину экрана для мобильных устройств
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  
  const svgDataUrl = getSvgDataUrl(itemId);
  
  return {
    backgroundImage: 
      /* Внутренний круг - 8 иконок */
      `url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       /* Средний круг - 12 иконок */
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       /* Внешний круг - 20 иконок */
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       /* Угловые иконки - 12 иконок */
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}")`,
    backgroundSize: 
      /* Внутренний круг - 8 иконок */
      `11px 11px, 11px 11px, 11px 11px, 11px 11px, 11px 11px, 11px 11px, 11px 11px, 11px 11px, ` +
      /* Средний круг - 12 иконок */
      `11px 11px, 11px 11px, 11px 11px, 11px 11px, 11px 11px, 11px 11px, 11px 11px, 11px 11px, 11px 11px, 11px 11px, 11px 11px, 11px 11px, ` +
      /* Внешний круг - 20 иконок */
      `9px 9px, 9px 9px, 9px 9px, 9px 9px, 9px 9px, 9px 9px, 9px 9px, 9px 9px, 9px 9px, 9px 9px, 9px 9px, 9px 9px, 9px 9px, 9px 9px, 9px 9px, 9px 9px, 9px 9px, 9px 9px, 9px 9px, 9px 9px, ` +
      /* Угловые иконки - 12 иконок */
      `7px 7px, 7px 7px, 7px 7px, 7px 7px, 7px 7px, 7px 7px, 7px 7px, 7px 7px, 7px 7px, 7px 7px, 7px 7px, 7px 7px`,
    backgroundPosition: 
      /* Внутренний круг - 8 иконок */
      '50% 30%, 65% 35%, 70% 50%, 65% 65%, 50% 70%, 35% 65%, 30% 50%, 35% 35%, ' +
      /* Средний круг - 12 иконок */
      '50% 15%, 70% 22%, 80% 35%, 85% 50%, 80% 65%, 70% 78%, 50% 85%, 30% 78%, 20% 65%, 15% 50%, 20% 35%, 30% 22%, ' +
      /* Внешний круг - 20 иконок */
      '50% 0%, 65% 3%, 80% 10%, 90% 20%, 100% 35%, 100% 50%, 100% 65%, 90% 80%, 80% 90%, 65% 97%, 50% 100%, 35% 97%, 20% 90%, 10% 80%, 0% 65%, 0% 50%, 0% 35%, 10% 20%, 20% 10%, 35% 3%, ' +
      /* Угловые иконки - 12 иконок */
      '95% 5%, 98% 15%, 85% 2%, 95% 95%, 98% 85%, 85% 98%, 5% 95%, 15% 98%, 2% 85%, 5% 5%, 15% 2%, 2% 15%',
    backgroundRepeat: 'no-repeat',
    
  };
};

/**
 * Создает CSS стили для средних карточек (75% от обычного размера)
 */
export const createMediumCirclePattern = (itemId: number, upgradeable?: string | number) => {
  // Для оверлеев не создаем SVG паттерны
  if (upgradeable && isOverlayItem(upgradeable)) {
    return {};
  }
  
  // Проверяем ширину экрана для мобильных устройств
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  
  const svgDataUrl = getSvgDataUrl(itemId);
  
  return {
    backgroundImage: 
      /* Внутренний круг - 8 иконок */
      `url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       /* Средний круг - 12 иконок */
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       /* Внешний круг - 20 иконок */
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       /* Угловые иконки - 12 иконок */
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}"),
       url("${svgDataUrl}")`,
       backgroundSize: 
       /* Внутренний круг - 8 иконок */
       `${isMobile ? 11.5 : 16.5}px ${isMobile ? 11.5 : 16.5}px, ${isMobile ? 11.5 : 16.5}px ${isMobile ? 11.5 : 16.5}px, ${isMobile ? 11.5 : 16.5}px ${isMobile ? 11.5 : 16.5}px, ${isMobile ? 11.5 : 16.5}px ${isMobile ? 11.5 : 16.5}px, ${isMobile ? 11.5 : 16.5}px ${isMobile ? 11.5 : 16.5}px, ${isMobile ? 11.5 : 16.5}px ${isMobile ? 11.5 : 16.5}px, ${isMobile ? 11.5 : 16.5}px ${isMobile ? 11.5 : 16.5}px, ` +
       /* Средний круг - 12 иконок */
       `${isMobile ? 11.5 : 16.5}px ${isMobile ? 11.5 : 16.5}px, ${isMobile ? 11.5 : 16.5}px ${isMobile ? 11.5 : 16.5}px, ${isMobile ? 11.5 : 16.5}px ${isMobile ? 11.5 : 16.5}px, ${isMobile ? 11.5 : 16.5}px ${isMobile ? 11.5 : 16.5}px, ${isMobile ? 11.5 : 16.5}px ${isMobile ? 11.5 : 16.5}px, ${isMobile ? 11.5 : 16.5}px ${isMobile ? 11.5 : 16.5}px, ${isMobile ? 11.5 : 16.5}px ${isMobile ? 11.5 : 16.5}px, ${isMobile ? 11.5 : 16.5}px ${isMobile ? 11.5 : 16.5}px, ${isMobile ? 11.5 : 16.5}px ${isMobile ? 11.5 : 16.5}px, ${isMobile ? 11.5 : 16.5}px ${isMobile ? 11.5 : 16.5}px, ` +
       /* Внешний круг - 20 иконок */
       `${isMobile ? 9 : 13.5}px ${isMobile ? 9 : 13.5}px, ${isMobile ? 9 : 13.5}px ${isMobile ? 9 : 13.5}px, ${isMobile ? 9 : 13.5}px ${isMobile ? 9 : 13.5}px, ${isMobile ? 9 : 13.5}px ${isMobile ? 9 : 13.5}px, ${isMobile ? 9 : 13.5}px ${isMobile ? 9 : 13.5}px, ${isMobile ? 9 : 13.5}px ${isMobile ? 9 : 13.5}px, ${isMobile ? 9 : 13.5}px ${isMobile ? 9 : 13.5}px, ${isMobile ? 9 : 13.5}px ${isMobile ? 9 : 13.5}px, ${isMobile ? 9 : 13.5}px ${isMobile ? 9 : 13.5}px, ${isMobile ? 9 : 13.5}px ${isMobile ? 9 : 13.5}px, ${isMobile ? 9 : 13.5}px ${isMobile ? 9 : 13.5}px, ${isMobile ? 9 : 13.5}px ${isMobile ? 9 : 13.5}px, ${isMobile ? 9 : 13.5}px ${isMobile ? 9 : 13.5}px, ${isMobile ? 9 : 13.5}px ${isMobile ? 9 : 13.5}px, ${isMobile ? 9 : 13.5}px ${isMobile ? 9 : 13.5}px, ${isMobile ? 9 : 13.5}px ${isMobile ? 9 : 13.5}px, ` +
       /* Угловые иконки - 12 иконок */
       `${isMobile ? 6.5 : 10.5}px ${isMobile ? 6.5 : 10.5}px, ${isMobile ? 6.5 : 10.5}px ${isMobile ? 6.5 : 10.5}px, ${isMobile ? 6.5 : 10.5}px ${isMobile ? 6.5 : 10.5}px, ${isMobile ? 6.5 : 10.5}px ${isMobile ? 6.5 : 10.5}px, ${isMobile ? 6.5 : 10.5}px ${isMobile ? 6.5 : 10.5}px, ${isMobile ? 6.5 : 10.5}px ${isMobile ? 6.5 : 10.5}px, ${isMobile ? 6.5 : 10.5}px ${isMobile ? 6.5 : 10.5}px, ${isMobile ? 6.5 : 10.5}px ${isMobile ? 6.5 : 10.5}px, ${isMobile ? 6.5 : 10.5}px ${isMobile ? 6.5 : 10.5}px, ${isMobile ? 6.5 : 10.5}px ${isMobile ? 6.5 : 10.5}px`,
     backgroundPosition: 
      /* Внутренний круг - 8 иконок */
      '50% 30%, 65% 35%, 70% 50%, 65% 65%, 50% 70%, 35% 65%, 30% 50%, 35% 35%, ' +
      /* Средний круг - 12 иконок */
      '50% 15%, 70% 22%, 80% 35%, 85% 50%, 80% 65%, 70% 78%, 50% 85%, 30% 78%, 20% 65%, 15% 50%, 20% 35%, 30% 22%, ' +
      /* Внешний круг - 20 иконок */
      '50% 0%, 65% 3%, 80% 10%, 90% 20%, 100% 35%, 100% 50%, 100% 65%, 90% 80%, 80% 90%, 65% 97%, 50% 100%, 35% 97%, 20% 90%, 10% 80%, 0% 65%, 0% 50%, 0% 35%, 10% 20%, 20% 10%, 35% 3%, ' +
      /* Угловые иконки - 12 иконок */
      '95% 5%, 98% 15%, 85% 2%, 95% 95%, 98% 85%, 85% 98%, 5% 95%, 15% 98%, 2% 85%, 5% 5%, 15% 2%, 2% 15%',
    backgroundRepeat: 'no-repeat',
    
  };
};
