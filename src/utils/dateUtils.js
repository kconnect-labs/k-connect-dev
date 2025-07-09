/**
 * Utility functions for date and time formatting with timezone support
 * 
 * TODO: There are duplicate date formatting functions in formatters.js that should be
 * consolidated with these functions to maintain consistency throughout the application.
 * The formatters in this file provide better timezone handling and should be preferred.
 */

export const getLocalTimezoneOffset = () => {
  return new Date().getTimezoneOffset();
};

export const getMoscowTimezoneOffset = () => {
  return -180; 
};

export const getUserTimezoneName = () => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

/**
 * Parses a date string consistently handling UTC and timezones
 * @param {string} dateString - The date string to parse
 * @returns {Date} - A properly parsed Date object
 */
export const parseDate = (dateString) => {
  if (!dateString) return new Date();
  
  if (dateString.endsWith('Z')) {
    return new Date(dateString);
  } 
  else if (dateString.includes('T') && !dateString.includes('Z')) {
    return new Date(dateString + 'Z');
  } 
  else {
    return new Date(dateString);
  }
};

/**
 * Утилита для отладки парсинга даты
 * @param {string} dateString - Строка даты для проверки
 * @returns {Object} - Информация о том, как парсится дата
 */
export const debugDate = (dateString) => {
  const standardParse = new Date(dateString);
  const utcParse = new Date(dateString + 'Z');
  const now = new Date();
  
  return {
    originalString: dateString,
    standardParseResult: standardParse.toString(),
    standardParseISO: standardParse.toISOString(),
    utcParseResult: utcParse.toString(),
    utcParseISO: utcParse.toISOString(),
    currentTime: now.toString(),
    currentTimeISO: now.toISOString(),
    diffStandard: Math.floor((now - standardParse) / 1000) + ' seconds',
    diffUTC: Math.floor((now - utcParse) / 1000) + ' seconds',
    userTimezone: getUserTimezoneName(),
    timezoneOffset: getLocalTimezoneOffset() + ' minutes'
  };
};

// Pure function for formatting time differences
export const formatTimeAgoDiff = (diffInSeconds, t) => {
  if (diffInSeconds < 0) {
    return t ? t('post.time.just_now') : 'только что';
  } else if (diffInSeconds < 60) {
    return t ? t('post.time.just_now') : 'только что';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    if (t) {
      const minuteForm = minutes % 10 === 1 && minutes % 100 !== 11 
        ? t('post.time.minute')
        : ([2, 3, 4].includes(minutes % 10) && ![12, 13, 14].includes(minutes % 100))
          ? t('post.time.minutes')
          : t('post.time.minutes_many');
      return `${minutes} ${minuteForm} ${t('post.time.ago')}`;
    }
    // Fallback без перевода
    const minuteForm = minutes % 10 === 1 && minutes % 100 !== 11
      ? 'минуту'
      : ([2, 3, 4].includes(minutes % 10) && ![12, 13, 14].includes(minutes % 100))
        ? 'минуты'
        : 'минут';
    return `${minutes} ${minuteForm} назад`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    if (t) {
      const hourForm = hours % 10 === 1 && hours % 100 !== 11
        ? t('post.time.hour')
        : ([2, 3, 4].includes(hours % 10) && ![12, 13, 14].includes(hours % 100))
          ? t('post.time.hours')
          : t('post.time.hours_many');
      return `${hours} ${hourForm} ${t('post.time.ago')}`;
    }
    // Fallback без перевода
    const hourForm = hours % 10 === 1 && hours % 100 !== 11
      ? 'час'
      : ([2, 3, 4].includes(hours % 10) && ![12, 13, 14].includes(hours % 100))
        ? 'часа'
        : 'часов';
    return `${hours} ${hourForm} назад`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    if (t) {
      const dayForm = days % 10 === 1 && days % 100 !== 11
        ? t('post.time.day')
        : ([2, 3, 4].includes(days % 10) && ![12, 13, 14].includes(days % 100))
          ? t('post.time.days')
          : t('post.time.days_many');
      return `${days} ${dayForm} ${t('post.time.ago')}`;
    }
    // Fallback без перевода
    const dayForm = days % 10 === 1 && days % 100 !== 11
      ? 'день'
      : ([2, 3, 4].includes(days % 10) && ![12, 13, 14].includes(days % 100))
        ? 'дня'
        : 'дней';
    return `${days} ${dayForm} назад`;
  } else {
    const date = new Date(Date.now() - (diffInSeconds * 1000));
    return formatDateTimeShort(date.toISOString());
  }
};

// Pure function that doesn't use hooks
export const formatTimeAgo = (dateString) => {
  if (!dateString) return '';
  
  const date = parseDate(dateString);
  const now = new Date();
  
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  return formatTimeAgoDiff(diffInSeconds);
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = parseDate(dateString);
  
  return new Intl.DateTimeFormat(navigator.language || 'ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: getUserTimezoneName() 
  }).format(date);
};

export const formatDateTimeShort = (dateString) => {
  if (!dateString) return '';
  
  const date = parseDate(dateString);
  
  return new Intl.DateTimeFormat(navigator.language || 'ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: getUserTimezoneName()
  }).format(date);
};

export const getRussianWordForm = (number, forms) => {
  const cases = [2, 0, 1, 1, 1, 2];
  const mod100 = number % 100;
  const mod10 = number % 10;
  return forms[(mod100 > 4 && mod100 < 20) ? 2 : cases[(mod10 < 5) ? mod10 : 5]];
}; 