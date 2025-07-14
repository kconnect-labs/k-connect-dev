// Утилиты для работы с темами
export const getThemeColors = (mode) => {
  return {
    backgroundColor: '#151515',
    textColor: '#FFFFFF'
  };
};

export const saveThemeSetting = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error(`Ошибка при сохранении настройки темы ${key}:`, error);
  }
};

export const getThemeSetting = (key, defaultValue = null) => {
  try {
    return localStorage.getItem(key) || defaultValue;
  } catch (error) {
    console.error(`Ошибка при получении настройки темы ${key}:`, error);
    return defaultValue;
  }
}; 