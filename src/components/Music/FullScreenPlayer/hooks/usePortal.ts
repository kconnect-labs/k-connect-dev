import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

export const usePortal = (open: boolean) => {
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(
    null
  );

  useEffect(() => {
    // Безопасно получаем контейнер портала
    let container: HTMLElement | null = null;
    try {
      container = document.getElementById('fullscreen-player-portal');

      // Если контейнер не найден, создаем его
      if (!container) {
        container = document.createElement('div');
        container.id = 'fullscreen-player-portal';
        document.body.appendChild(container);
      }

      setPortalContainer(container);
    } catch (error) {
      console.error('Ошибка при создании портала:', error);
    }
  }, []);

  // Обновляем состояние контейнера при изменении открытия/закрытия
  useEffect(() => {
    if (portalContainer) {
      if (open) {
        portalContainer.classList.add('active');
        // Дополнительные проверки для мобильных устройств
        try {
          // Предотвращаем scroll на iOS
          const viewport = document.querySelector('meta[name=viewport]');
          if (viewport) {
            viewport.setAttribute(
              'content',
              viewport.getAttribute('content') + ', user-scalable=no'
            );
          }
        } catch (e) {
          console.warn('Не удалось обновить viewport meta:', e);
        }
      } else {
        portalContainer.classList.remove('active');
        // Восстанавливаем scroll на iOS
        try {
          const viewport = document.querySelector('meta[name=viewport]');
          if (viewport) {
            const content =
              viewport
                .getAttribute('content')
                ?.replace(', user-scalable=no', '') || '';
            viewport.setAttribute('content', content);
          }
        } catch (e) {
          console.warn('Не удалось восстановить viewport meta:', e);
        }
      }
    }
  }, [open, portalContainer]);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (portalContainer) {
        try {
          // Восстанавливаем viewport при размонтировании
          const viewport = document.querySelector('meta[name=viewport]');
          if (viewport) {
            const content =
              viewport
                .getAttribute('content')
                ?.replace(', user-scalable=no', '') || '';
            viewport.setAttribute('content', content);
          }
        } catch (e) {
          console.warn(
            'Не удалось восстановить viewport meta при размонтировании:',
            e
          );
        }
      }
    };
  }, [portalContainer]);

  return portalContainer;
};

// Хук для создания портала с компонентом
export const usePortalWithComponent = <T extends object>(
  open: boolean,
  Component: React.ComponentType<T>,
  props: T
) => {
  const portalContainer = usePortal(open);

  if (!open || !portalContainer) return null;

  return ReactDOM.createPortal(
    React.createElement(Component, props),
    portalContainer
  );
};
