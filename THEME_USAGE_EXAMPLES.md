# 🎨 Примеры использования системы тем

## Доступные темы

### 1. **Классическая** (`default`)
- Темная тема без эффектов размытия
- `background: rgba(15, 15, 15, 0.98)`
- `backdrop-filter: none`

### 2. **Blur Glass** (`blur`)
- Прозрачная тема с эффектами размытия
- `background: rgba(255, 255, 255, 0.03)`
- `backdrop-filter: blur(20px)`

### 3. **Midnight** (`midnight`)
- Глубокий темно-синий с фиолетовым оттенком
- `background: rgba(5, 8, 20, 0.95)`
- `backdrop-filter: none`

### 4. **Ocean** (`ocean`)
- Яркий синий с бирюзовым оттенком
- `background: rgba(8, 25, 40, 0.92)`
- `backdrop-filter: none`

### 5. **Sunset** (`sunset`)
- Яркий красно-оранжевый закат
- `background: rgba(40, 15, 8, 0.94)`
- `backdrop-filter: none`

### 6. **Forest** (`forest`)
- Яркий зеленый лес
- `background: rgba(8, 30, 15, 0.93)`
- `backdrop-filter: none`

### 7. **Aurora** (`aurora`)
- Яркий зелено-голубой северные сияния
- `background: rgba(12, 35, 25, 0.91)`
- `backdrop-filter: none`

### 8. **Cosmic** (`cosmic`)
- Яркий пурпурно-розовый космос
- `background: rgba(30, 8, 35, 0.96)`
- `backdrop-filter: blur(20px)`

### 9. **Neon** (`neon`)
- Яркий электрический синий
- `background: rgba(8, 20, 45, 0.89)`
- `backdrop-filter: blur(20px)`

### 10. **Vintage** (`vintage`)
- Теплый коричнево-золотой
- `background: rgba(35, 20, 8, 0.95)`
- `backdrop-filter: blur(20px)`

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

// Для фона сайта
<body className="theme-site-background">
```

#### Способ 2: CSS переменные в sx
```tsx
<Box sx={{
  background: 'var(--theme-background)',
  backdropFilter: 'var(--theme-backdrop-filter)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
}}>

// Для фона сайта
<Box sx={{
  background: 'var(--theme-site-background)',
}}>
```

#### Способ 3: Принудительные классы
```tsx
// Всегда дефолтная тема
<Box className="theme-default">

// Всегда blur тема  
<Box className="theme-blur">

// Всегда midnight тема
<Box className="theme-midnight">

// Всегда ocean тема
<Box className="theme-ocean">

// Всегда sunset тема
<Box className="theme-sunset">

// Всегда forest тема
<Box className="theme-forest">

// Всегда aurora тема
<Box className="theme-aurora">

// Всегда cosmic тема
<Box className="theme-cosmic">

// Всегда neon тема
<Box className="theme-neon">

// Всегда vintage тема
<Box className="theme-vintage">
```

#### Способ 4: Утилитарные классы
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

// Фон сайта
<body className="theme-site-background">
<html className="theme-site-background">
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
const { 
  switchToDefaultTheme, 
  switchToBlurTheme,
  switchToMidnightTheme,
  switchToOceanTheme,
  switchToSunsetTheme,
  switchToForestTheme,
  switchToAuroraTheme,
  switchToCosmicTheme,
  switchToNeonTheme,
  switchToVintageTheme
} = useThemeManager();

// Переключить на дефолтную тему
await switchToDefaultTheme();

// Переключить на блюрную тему
await switchToBlurTheme();

// Переключить на midnight тему
await switchToMidnightTheme();

// Переключить на ocean тему
await switchToOceanTheme();

// Переключить на sunset тему
await switchToSunsetTheme();

// Переключить на forest тему
await switchToForestTheme();

// Переключить на aurora тему
await switchToAuroraTheme();

// Переключить на cosmic тему
await switchToCosmicTheme();

// Переключить на neon тему
await switchToNeonTheme();

// Переключить на vintage тему
await switchToVintageTheme();
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
- Проверить на всех десяти темах
- Проверить на мобильных устройствах

## Чек-лист для компонентов

- [ ] Удалены хардкодные стили `rgba(255, 255, 255, 0.03)`
- [ ] Удалены хардкодные стили `backdropFilter: 'blur(20px)'`
- [ ] Добавлен класс `theme-aware` или CSS переменные
- [ ] Протестировано на всех десяти темах
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
console.log('Site background:', getComputedStyle(root).getPropertyValue('--theme-site-background'));
```

### Проверка data-атрибута
```tsx
console.log('Data theme:', document.documentElement.getAttribute('data-theme'));
``` 