// MessengerSocket.js
// Менеджер-синглтон для EnhancedWebSocketClient.

import EnhancedWebSocketClient from './EnhancedWebSocketClient';

let instance = null;

/**
 * Получить (или создать) общий экземпляр WebSocket-клиента мессенджера.
 * Повторный вызов с другим sessionKey перезапустит клиент.
 */
export const getMessengerSocket = (config) => {
  // Если экземпляр не существует - создаем новый
  if (!instance) {

    instance = new EnhancedWebSocketClient(config);
    return instance;
  }
  
  // Если sessionKey изменился - пересоздаем экземпляр
  if (config && config.sessionKey && instance.config.sessionKey !== config.sessionKey) {

    instance.disconnect();
    instance = new EnhancedWebSocketClient(config);
    return instance;
  }
  
  // Если конфигурация передана, но экземпляр уже существует, обновляем только нужные поля
  if (config) {
    Object.assign(instance.config, config);

  }
  
  // Если экземпляр существует и sessionKey не изменился - возвращаем существующий

  return instance;
};

/** Сбросить глобальный экземпляр. Полезно при логауте. */
export const resetMessengerSocket = () => {
  if (instance) {
    try {
      instance.disconnect();
    } catch {}
    instance = null;
  }
};
