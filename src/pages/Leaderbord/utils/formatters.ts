// Функция для сокращения чисел
export const formatCompactNumber = (number: number): string => {
  if (number < 1000) {
    return number.toString();
  }
  const units = ['', 'K', 'M', 'B'];
  const order = Math.floor(Math.log10(Math.abs(number)) / 3);
  const unitName = units[order];
  const value = (number / Math.pow(1000, order)).toFixed(1);
  return value.replace('.0', '') + unitName;
};
