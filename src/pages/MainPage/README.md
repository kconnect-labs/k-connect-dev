# MainPage обновил 22.08.2025

## Структура

```
MainPage/
├── components/           # Компоненты страницы
│   ├── OnlineUsers.tsx   # Компонент отображения онлайн пользователей
│   ├── UserRecommendation.tsx # Компонент рекомендации пользователя
│   ├── UserRecommendation.css # Стили для UserRecommendation
│   └── RecommendationsPanel.tsx # Панель с рекомендациями
├── hooks/               # Кастомные хуки
│   ├── useMainPageState.ts # Хук управления состоянием страницы
│   └── usePostsLoader.ts   # Хук загрузки постов
├── types.ts             # TypeScript типы
├── MainPage.tsx         # Основной компонент страницы
├── MainPage.css         # Стили страницы
├── index.ts             # Экспорты
```

## Компоненты

### MainPage.tsx
Основной компонент страницы, который объединяет все остальные компоненты и управляет общим состоянием.

### OnlineUsers.tsx
Отображает список пользователей, которые сейчас онлайн. Включает:
- Счетчик онлайн пользователей
- Аватары пользователей с индикаторами онлайн статуса
- Автоматическую загрузку при скролле

### UserRecommendation.tsx
Компонент для отображения рекомендации пользователя. Включает:
- Аватар пользователя
- Имя и username
- Кнопку подписки/отписки
- Индикатор верификации

### RecommendationsPanel.tsx
Панель с рекомендациями пользователей. Включает:
- Состояния загрузки
- Пустое состояние
- Список рекомендаций

## Хуки

### useMainPageState.ts
Управляет состоянием главной страницы:
- Посты и их загрузка
- Рекомендации пользователей
- Состояние лайтбокса
- Обработка событий создания/удаления постов

### usePostsLoader.ts
Отвечает за загрузку постов:
- Начальная загрузка
- Загрузка при изменении типа ленты
- Intersection Observer для бесконечной прокрутки

## Типы

### User
```typescript
interface User {
  id: number;
  username: string;
  name?: string;
  photo?: string;
  is_verified?: boolean;
  is_following?: boolean;
  account_type?: string;
}
```

### Post
```typescript
interface Post {
  id: number;
  content: string;
  user: User;
  created_at: string;
  updated_at: string;
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
  is_repost: boolean;
  media?: string[];
  type?: string;
}
```

### FeedType
```typescript
interface FeedType {
  value: 'all' | 'following' | 'recommended';
  label: string;
}
```

## Использование

```typescript
import MainPage from '../pages/MainPage';

// В роутере
<Route path="/" element={<MainPage />} />
```

## Особенности

1. **TypeScript**: Полностью типизированный код
2. **Модульность**: Компоненты разделены на логические части
3. **Переиспользование**: Хуки можно использовать в других компонентах
4. **Производительность**: Используется React.memo для оптимизации
5. **Адаптивность**: Поддерживает мобильные и десктопные устройства
