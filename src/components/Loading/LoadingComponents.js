import React, { useEffect } from 'react';

// Добавляем CSS стили один раз при загрузке модуля
let stylesAdded = false;

const addLoadingStyles = () => {
  if (stylesAdded) return;
  
  const style = document.createElement('style');
  style.textContent = `
    @keyframes loading-spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
  stylesAdded = true;
};

// Общие стили для контейнера
const containerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
  backgroundColor: 'transparent',
};

// Простой и быстрый индикатор загрузки
export const LoadingIndicator = () => {
  useEffect(() => {
    addLoadingStyles();
  }, []);

  return (
    <div style={containerStyle}>
      <div
        style={{
          width: '40px',
          height: '40px',
          border: '3px solid var(--theme-border-color)',
          borderTop: '3px solid var(--theme-main-color)',
          borderRadius: '50%',
          animation: 'loading-spin 1s linear infinite',
        }}
      />
    </div>
  );
};

// Для Suspense fallback - еще более простой
export const SuspenseFallback = () => {
  useEffect(() => {
    addLoadingStyles();
  }, []);

  return (
    <div style={containerStyle}>
      <div
        style={{
          width: '32px',
          height: '32px',
          border: '2px solid var(--theme-border-color)',
          borderTop: '2px solid var(--theme-main-color)',
          borderRadius: '50%',
          animation: 'loading-spin 0.8s linear infinite',
        }}
      />
    </div>
  );
};