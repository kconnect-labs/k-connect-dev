export const usePostActions = () => {
  const handlePostCreated = newPost => {
    // Отправляем глобальное событие для обновления лент
    if (typeof window !== 'undefined') {
      console.log('usePostActions: Dispatching post_created event');
      window.dispatchEvent(
        new CustomEvent('post_created', {
          detail: newPost,
        })
      );
    }

    // Показываем уведомление об успехе
    window.dispatchEvent(
      new CustomEvent('showError', {
        detail: {
          message: 'Пост успешно создан',
          severity: 'success',
        },
      })
    );
  };

  return {
    handlePostCreated,
  };
};
