/**
 * Утилиты для работы с аватарками пользователей
 */

/**
 * Форматирует URL аватарки пользователя
 * @param photo - фото пользователя (может быть полным URL или именем файла)
 * @param userId - ID пользователя (нужен для формирования пути)
 * @returns полный URL аватарки или null если фото нет
 */
export const formatUserAvatar = (
  photo: string | null | undefined,
  userId?: number
): string | null => {
  if (!photo) {
    return null;
  }

  // Если уже полный URL, возвращаем как есть
  if (photo.startsWith('http')) {
    return photo;
  }

  // Если начинается с /static/, добавляем домен S3
  if (photo.startsWith('/static/')) {
    return `https://s3.k-connect.ru${photo}`;
  }

  // Если есть userId, формируем полный путь
  if (userId) {
    return `https://s3.k-connect.ru/static/uploads/avatar/${userId}/${photo}`;
  }

  // Fallback - возвращаем как есть
  return photo;
};

/**
 * Получает fallback для аватарки (первую букву имени)
 * @param name - имя пользователя
 * @returns первая буква имени в верхнем регистре
 */
export const getAvatarFallback = (name: string): string => {
  return name.charAt(0).toUpperCase();
};
