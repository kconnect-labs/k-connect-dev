# LeaderboardUserCard Component

Компонент карточки пользователя для лидерборда без использования MUI.

## Описание

`LeaderboardUserCard` - это переиспользуемый компонент для отображения информации о пользователе в лидерборде. Компонент поддерживает декорации профиля, верификацию, достижения и адаптивный дизайн.

## Особенности

- ✅ Без MUI (использует только CSS)
- ✅ Поддержка декораций профиля (градиенты, изображения)
- ✅ Анимации с Framer Motion
- ✅ Адаптивный дизайн
- ✅ Поддержка темной/светлой темы
- ✅ Верификация и достижения
- ✅ Hover эффекты
- ✅ Специальные эффекты для декораций

## Установка

```bash
# Компонент уже включен в проект
import { LeaderboardUserCard } from '../../components/Leaderboard';
```

## Использование

```jsx
import React from 'react';
import { LeaderboardUserCard } from '../../components/Leaderboard';

const MyComponent = () => {
  const user = {
    id: 1,
    name: 'Иван Петров',
    username: 'ivan_petrov',
    score: 15420,
    avatar_url: '/static/uploads/avatar/1/avatar.jpg',
    verification: {
      status: 'verified'
    },
    achievement: {
      bage: 'Топ комментатор',
      image_path: 'top_commentator.png'
    },
    decoration: {
      background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
      item_path: '/static/decorations/gold_theme.png'
    }
  };

  const handleCardClick = (user) => {
    console.log('Clicked on user:', user.name);
  };

  return (
    <LeaderboardUserCard
      user={user}
      position={1}
      index={0}
      onCardClick={handleCardClick}
    />
  );
};
```

## Props

| Prop | Тип | Обязательный | Описание |
|------|-----|--------------|----------|
| `user` | `object` | ✅ | Объект с данными пользователя |
| `position` | `number` | ✅ | Позиция в рейтинге (1, 2, 3, ...) |
| `index` | `number` | ✅ | Индекс для анимации |
| `onCardClick` | `function` | ❌ | Callback при клике на карточку |

## Структура объекта user

```javascript
{
  id: number,                    // ID пользователя
  name: string,                  // Имя пользователя
  username: string,              // Username
  score: number,                 // Количество очков
  avatar_url: string,            // URL аватара (опционально)
  verification: {                // Верификация (опционально)
    status: string               // 'verified' или другой статус
  },
  achievement: {                 // Достижение (опционально)
    bage: string,                // Название достижения
    image_path: string           // Путь к изображению
  },
  decoration: {                  // Декорация (опционально)
    background: string,          // CSS градиент или цвет
    item_path: string           // Путь к изображению декорации
  }
}
```

## Декорации

Компонент поддерживает различные типы декораций:

### Градиенты
```javascript
decoration: {
  background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
  item_path: '/static/decorations/gold_theme.png'
}
```

### Изображения
```javascript
decoration: {
  background: '/static/decorations/background.jpg',
  item_path: '/static/decorations/item.png'
}
```

### Цвета
```javascript
decoration: {
  background: '#FFD700',
  item_path: '/static/decorations/item.png'
}
```

### Специальные стили
Можно добавить CSS стили к декорации через `item_path`:

```javascript
decoration: {
  background: 'linear-gradient(135deg, #006994 0%, #00bfff 100%)',
  item_path: '/static/decorations/ocean_theme.png;bottom:0;right:10px'
}
```

## CSS Переменные

Компонент использует CSS переменные для настройки тем:

```css
:root {
  --card-background: #1e1e1e;
  --text-primary: rgba(255, 255, 255, 0.87);
  --text-secondary: rgba(255, 255, 255, 0.6);
  --border-color: rgb(24 24 24);
  --rank-background: #424242;
  --card-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  --card-shadow-hover: 0 4px 16px rgba(0, 0, 0, 0.4);
  --primary-color: #D0BCFF;
}
```

## Адаптивность

Компонент автоматически адаптируется под размер экрана:

- **Desktop**: полный размер карточки
- **Mobile**: уменьшенные размеры элементов

## Анимации

- Появление карточек с задержкой
- Hover эффекты
- Специальные эффекты для декораций с `bottom: 0`

## Примеры

Смотрите файл `LeaderboardUserCard.example.js` для полных примеров использования.

## Зависимости

- React
- React Router (для Link)
- Framer Motion (для анимаций)
- VerificationBadge (компонент верификации)

## Файлы

- `LeaderboardUserCard.js` - основной компонент
- `LeaderboardUserCard.css` - стили
- `index.js` - экспорт
- `LeaderboardUserCard.example.js` - примеры использования
- `README.md` - документация 