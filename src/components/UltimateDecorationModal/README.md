# UltimateDecorationModal Component

Модальное окно для выбора декорации профиля при активации Ultimate подписки.

## Описание

`UltimateDecorationModal` - это модальное окно, которое отображается пользователям с Ultimate подпиской, у которых еще нет декорации профиля. Позволяет выбрать одну декорацию из доступных вариантов.

## Особенности

- ✅ Адаптивный дизайн (fullscreen на мобильных)
- ✅ Минималистичные стили с размытием
- ✅ Предварительный просмотр выбранной декорации
- ✅ Анимации с Framer Motion
- ✅ Интеграция с LeaderboardUserCard для предпросмотра
- ✅ Обработка ошибок и состояний загрузки

## Установка

```bash
import { UltimateDecorationModal } from '../../components/UltimateDecorationModal';
```

## Использование

```jsx
import React, { useState } from 'react';
import { UltimateDecorationModal } from '../../components/UltimateDecorationModal';

const MyComponent = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [availableDecorations, setAvailableDecorations] = useState([]);

  const handleSuccess = (selectedDecoration) => {
    console.log('Выбрана декорация:', selectedDecoration);
    // Обновить состояние приложения
  };

  return (
    <UltimateDecorationModal
      open={modalOpen}
      onClose={() => setModalOpen(false)}
      availableDecorations={availableDecorations}
      onSuccess={handleSuccess}
    />
  );
};
```

## Props

| Prop | Тип | Обязательный | Описание |
|------|-----|--------------|----------|
| `open` | `boolean` | ✅ | Состояние открытия модалки |
| `onClose` | `function` | ✅ | Callback для закрытия модалки |
| `availableDecorations` | `array` | ✅ | Массив доступных декораций |
| `onSuccess` | `function` | ❌ | Callback при успешном выборе декорации |

## Структура объекта декорации

```javascript
{
  id: number,                    // ID декорации
  name: string,                  // Название декорации
  background: string,            // CSS градиент или цвет фона
  item_path: string,            // Путь к изображению декорации (опционально)
  description: string           // Описание декорации (опционально)
}
```

## Стили

Компонент использует минималистичные стили:

- **Фон**: `rgba(255, 255, 255, 0.03)`
- **Размытие**: `backdropFilter: 'blur(20px)'`
- **Границы**: `1px solid rgb(24 24 24)`
- **Радиус**: `8px` / `12px`
- **Мобильные**: Fullscreen без границ

## Адаптивность

- **Desktop**: Модальное окно с фиксированной шириной
- **Mobile**: Полноэкранный режим с оптимизированной компоновкой

## Состояния

1. **Выбор декорации** - пользователь выбирает из доступных вариантов
2. **Предварительный просмотр** - показывает как будет выглядеть профиль
3. **Загрузка** - во время отправки запроса на сервер
4. **Успех** - декорация успешно применена

## API Интеграция

Компонент отправляет POST запрос на `/api/ultimate/decorations/select` с выбранной декорацией:

```javascript
{
  decoration_id: number
}
```

## Примеры декораций

```javascript
const decorations = [
  {
    id: 1,
    name: 'Золотая тема',
    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
    item_path: '/static/decorations/gold_theme.png'
  },
  {
    id: 2,
    name: 'Космическая тема',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    item_path: '/static/decorations/space_theme.png'
  }
];
```

## Интеграция с BalancePage

Модалка автоматически открывается при активации Ultimate подписки, если у пользователя нет декорации:

```javascript
// В BalancePage.js
if (data.subscription_type === 'ultimate' && data.needs_decoration_selection) {
  setAvailableDecorations(data.available_decorations || []);
  setDecorationModalOpen(true);
}
```

## Зависимости

- React
- Material-UI
- Framer Motion
- LeaderboardUserCard (для предпросмотра)

## Файлы

- `UltimateDecorationModal.js` - основной компонент
- `index.js` - экспорт
- `UltimateDecorationModal.test.js` - тестовый компонент
- `README.md` - документация 