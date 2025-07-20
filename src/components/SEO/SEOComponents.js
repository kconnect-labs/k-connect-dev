import React from 'react';
import SEO from '../SEO';

export const DefaultSEO = () => {
  // Получаем текущий URL
  const currentUrl =
    typeof window !== 'undefined'
      ? window.location.href
      : 'https://k-connect.ru';

  // Определяем тип страницы
  const getPageType = () => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.includes('/post/')) return 'article';
      if (path.includes('/profile/')) return 'profile';
      if (path.includes('/music/')) return 'music';
    }
    return 'website';
  };

  return (
    <SEO
      title='К-Коннект'
      description='К-Коннект - социальная сеть от независимого разработчика с функциями для общения, публикации постов, музыки и многого другого.'
      image='/icon-512.png'
      url={currentUrl}
      type={getPageType()}
      meta={{
        keywords:
          'социальная сеть, к-коннект, общение, музыка, лента, сообщения',
        viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
      }}
    />
  );
};
