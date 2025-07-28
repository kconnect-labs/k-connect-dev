
1. **Дефолтная тема** - без эффектов размытия, с твердым фоном
2. **Blur Glass тема** - с эффектами backdrop-filter и прозрачностью

###  Типы переключателей

1. **Кнопки** (`variant="buttons"`) - две отдельные кнопки для каждой темы
2. **Переключатель** (`variant="switch"`) - toggle switch
3. **Компактный** (`variant="compact"`) - одна кнопка с иконкой

```
frontend/src/
├── hooks/
│   └── useThemeManager.ts          # Основной хук управления темами
├── components/
│   ├── ThemeToggle/
│   │   └── ThemeToggle.tsx         # Компонент переключателя тем
│   └── ThemeSettingsModal.tsx      # Модальное окно настроек тем
├── styles/
│   └── theme.css                   # CSS переменные и утилитарные классы
└── pages/User/SettingsPage/
    └── components/
        └── ThemeSettingsModal.tsx  # Модальное окно настроек
```

## 🔧 Использование




##  Стили

### CSS переменные

Система использует CSS переменные для управления стилями:

```css
:root {
  --theme-background: rgba(15, 15, 15, 0.98);  /* Дефолтная тема */
  --theme-backdrop-filter: none;                /* Дефолтная тема */
  --theme-type: default;                        /* Дефолтная тема */
}
```

### Дефолтная тема
- `background: rgba(15, 15, 15, 0.98)`
- `backdrop-filter: none`
- Твердый фон

### Blur Glass тема
- `background: rgba(255, 255, 255, 0.03)`
- `backdrop-filter: blur(20px)`
- Прозрачный фон с размытием

## 🎯 Применение к компонентам

### Способ 1: CSS классы

```tsx
// Автоматическое применение темы
<div className="theme-aware">
  Содержимое с автоматической темой
</div>

// Принудительная тема
<div className="theme-blur">
  Всегда блюрная тема
</div>

<div className="theme-default">
  Всегда дефолтная тема
</div>
```

### Способ 2: CSS переменные в sx

```tsx
<Box
  sx={{
    background: 'var(--theme-background)',
    backdropFilter: 'var(--theme-backdrop-filter)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  }}
>
  Содержимое
</Box>
```

### Способ 3: Утилитарные классы

```tsx
// Для модальных окон
<Dialog className="theme-modal" />

// Для карточек
<Card className="theme-card" />

// Для кнопок
<Button className="theme-button" />

// Для сайдбара
<Box className="theme-sidebar" />

// Для хедера
<Box className="theme-header" />
```

## 📱 Мобильная адаптация

Система автоматически адаптируется для мобильных устройств:

```css
@media (max-width: 768px) {
  .theme-modal {
    border-radius: 0;
    margin: 0;
    max-width: 100vw;
    max-height: 100vh;
  }
}
```

## 🔄 Миграция существующих компонентов

### Что нужно удалить:

```tsx
// ❌ Удалить эти стили
background: 'rgba(255, 255, 255, 0.03)',
backdropFilter: 'blur(20px)',
WebkitBackdropFilter: 'blur(20px)',
```

### Что нужно добавить:

```tsx
// ✅ Добавить класс
className="theme-aware"

// Или использовать CSS переменные
sx={{
  background: 'var(--theme-background)',
  backdropFilter: 'var(--theme-backdrop-filter)',
}}
```

## 🎨 Примеры использования

### Модальное окно
```tsx
<Dialog
  className="theme-modal"
  PaperProps={{
    sx: {
      background: 'var(--theme-background)',
      backdropFilter: 'var(--theme-backdrop-filter)',
    }
  }}
>
```

### Карточка
```tsx
<Card className="theme-card">
  <CardContent>
    Содержимое карточки
  </CardContent>
</Card>
```

### Кнопка
```tsx
<Button
  className="theme-button"
  sx={{
    color: 'white',
    '&:hover': {
      background: 'var(--theme-background)',
    }
  }}
>
  Кнопка
</Button>
```

## 🔮 Будущие улучшения

- [ ] Анимации при смене темы
- [ ] Кастомные темы пользователей
- [ ] Автоматическое определение системной темы
- [ ] Темы для разных сезонов/событий
- [ ] Экспорт/импорт настроек темы 