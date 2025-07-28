# 🎨 Примеры использования системы тем

## Быстрое применение к компонентам

### ❌ Что НЕ нужно делать (удалить эти стили):

```tsx
// Удалить эти хардкодные стили
<Box sx={{
  background: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
}}>
```

### ✅ Что нужно делать (добавить эти стили):

#### Способ 1: CSS класс (рекомендуется)
```tsx
<Box className="theme-aware">
  Автоматически применяется текущая тема
</Box>
```

#### Способ 2: CSS переменные в sx
```tsx
<Box sx={{
  background: 'var(--theme-background)',
  backdropFilter: 'var(--theme-backdrop-filter)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
}}>
```

#### Способ 3: Принудительные классы
```tsx
// Всегда дефолтная тема
<Box className="theme-default">

// Всегда blur тема  
<Box className="theme-blur">
```

#### Способ 3: Утилитарные классы
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

## Примеры для разных компонентов

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

### Layout компоненты
```tsx
// MainLayout
<MainContainer className="theme-aware">

// Header
<StyledAppBar className="theme-aware">

// Sidebar
<div className="sidebar-container theme-aware">

// CommandPalette
<StyledDialog> // использует CSS переменные
```

### Сайдбар
```tsx
<Box className="theme-sidebar">
  <SidebarContent />
</Box>
```

### Хедер
```tsx
<Box className="theme-header">
  <HeaderContent />
</Box>
```

## Переключение тем

### В компоненте
```tsx
import { useThemeManager } from './hooks/useThemeManager';
import ThemeToggle from './components/ThemeToggle/ThemeToggle';

function MyComponent() {
  const { currentTheme, toggleTheme } = useThemeManager();
  
  return (
    <div>
      <p>Текущая тема: {currentTheme}</p>
      <ThemeToggle variant="compact" />
    </div>
  );
}
```

### Программное переключение
```tsx
const { switchToDefaultTheme, switchToBlurTheme } = useThemeManager();

// Переключить на дефолтную тему
await switchToDefaultTheme();

// Переключить на блюрную тему
await switchToBlurTheme();
```

## Миграция существующих компонентов

### Шаг 1: Найти компоненты с хардкодными стилями
```bash
grep -r "rgba(255, 255, 255, 0.03)" src/
grep -r "backdropFilter.*blur" src/
```

### Шаг 2: Заменить стили
```tsx
// Было:
<Box sx={{
  background: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
}}>

// Стало:
<Box className="theme-aware">
```

### Шаг 3: Протестировать
- Проверить на дефолтной теме
- Проверить на blur теме
- Проверить на мобильных устройствах

## Чек-лист для компонентов

- [ ] Удалены хардкодные стили `rgba(255, 255, 255, 0.03)`
- [ ] Удалены хардкодные стили `backdropFilter: 'blur(20px)'`
- [ ] Добавлен класс `theme-aware` или CSS переменные
- [ ] Протестировано на обеих темах
- [ ] Протестировано на мобильных устройствах
- [ ] Плавные переходы работают

## Отладка

### Проверка текущей темы
```tsx
console.log('Current theme:', currentTheme);
```

### Проверка CSS переменных
```tsx
const root = document.documentElement;
console.log('Background:', getComputedStyle(root).getPropertyValue('--theme-background'));
console.log('Backdrop filter:', getComputedStyle(root).getPropertyValue('--theme-backdrop-filter'));
```

### Проверка data-атрибута
```tsx
console.log('Data theme:', document.documentElement.getAttribute('data-theme'));
``` 