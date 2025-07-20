// Утилиты для работы с cookie
export const setCookie = (
  name: string,
  value: string,
  days: number = 365
): void => {
  try {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  } catch (error) {
    console.error(`Ошибка при установке cookie ${name}:`, error);
  }
};

export const getCookie = (name: string): string | null => {
  try {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
  } catch (error) {
    console.error(`Ошибка при получении cookie ${name}:`, error);
  }
  return null;
};
