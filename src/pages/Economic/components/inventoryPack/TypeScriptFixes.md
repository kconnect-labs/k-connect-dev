# TypeScript Fixes for Inventory Pack Components

## Общие исправления для всех файлов:

### 1. PackCard.tsx
- Добавить типизацию для OptimizedImage компонента
- Исправить типизацию для кнопки disabled
- Добавить проверки для undefined значений

### 2. ItemInfoModal.tsx  
- Добавить типизацию для UpgradeEffects компонента
- Исправить типизацию для функций getRarityIcon, getRarityLabel
- Добавить типизацию для всех параметров функций

### 3. InventoryPage.tsx
- Добавить типизацию для всех useState хуков
- Исправить типизацию для event handlers
- Добавить проверки для null значений user

### 4. InventoryPackPage.tsx
- Исправить типизацию для InfoBlock компонента
- Добавить недостающие пропсы для PackOpeningModal
- Исправить типизацию для event handlers

## Основные типы уже созданы в types.ts:

```typescript
export interface InventoryItem {
  id: number;
  item_name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  upgrade_level: number;
  is_equipped: boolean;
  image_url: string;
  background_url?: string;
  pack_name: string;
  pack_price: number;
  upgradeable: boolean;
  item_number?: number;
  total_count?: number;
  marketplace?: {
    id: number;
    status: 'active' | 'sold' | 'cancelled';
    price: number;
  } | null;
}

export interface Pack {
  id: number;
  display_name: string;
  description: string;
  price: number;
  image_path?: string;
  is_limited: boolean;
  max_quantity?: number;
  sold_quantity?: number;
  contents?: PackContent[];
}

export interface PackContent {
  item_name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  background_url?: string;
}

export interface EquippedItem {
  item_id: number;
  item_name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  upgrade_level: number;
  image_url: string;
  background_url?: string;
}

export interface User {
  id: number;
  username: string;
  name: string;
  photo?: string;
}

export interface PackDetails {
  pack: Pack;
  contents: PackContent[];
}

export type ItemAction = 'equip' | 'unequip' | 'upgrade' | 'marketplace_list' | 'marketplace_remove';

export interface ItemUpdateEvent {
  item: InventoryItem;
  action: ItemAction;
}

export interface ItemObtainedEvent {
  detail: InventoryItem;
}
```

## Следующие шаги:
1. Исправить оставшиеся ошибки типизации в каждом файле
2. Добавить недостающие типы для внешних компонентов
3. Протестировать функциональность после добавления типизации 