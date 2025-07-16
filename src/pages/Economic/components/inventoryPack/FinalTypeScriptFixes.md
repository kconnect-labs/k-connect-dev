# Финальные исправления TypeScript ошибок

## InventoryPackPage.tsx

### Проблемы:
1. Конфликт импорта Pack с локальным интерфейсом
2. Неправильные пропсы для InfoBlock
3. Неправильные пропсы для PackOpeningModal
4. Ошибка в onError (nError)
5. Отсутствие remaining_quantity в типе Pack
6. Null проверки для confirmPack

### Исправления:

1. **Удалить локальный интерфейс Pack** и использовать импортированный из types.ts
2. **Исправить InfoBlock**:
```tsx
<InfoBlock
  title="Пачки"
  description="Откройте Пачки, чтобы получить уникальные предметы для вашей коллекции"
  styleVariant="dark"
  style={{ 
    textAlign: 'center',
    marginBottom: '24px',
  }}
  children={null}
  titleStyle={{}}
  descriptionStyle={{}}
  customStyle={false}
  className=""
/>
```

3. **Исправить PackOpeningModal**:
```tsx
<PackOpeningModal
  pack={openedPack}
  onClose={() => setOpenedPack(null)}
  onItemObtained={handleItemObtained}
  onOpenAnother={() => {}}
  onBalanceUpdate={() => {}}
/>
```

4. **Исправить onError**:
```tsx
onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  const target = e.target as HTMLImageElement;
  target.style.display = 'none';
}}
```

5. **Добавить remaining_quantity в тип Pack в types.ts**:
```tsx
export interface Pack {
  id: number;
  display_name: string;
  description: string;
  price: number;
  is_limited: boolean;
  max_quantity?: number;
  sold_quantity?: number;
  remaining_quantity?: number;
  contents?: PackContent[];
}
```

6. **Исправить null проверки**:
```tsx
onClick={async () => {
  if (!confirmPack) return;
  const res = await fetch(`/api/inventory/packs/${confirmPack.id}/buy`, { method: 'POST', credentials: 'include' });
  const data = await res.json();
  if (data.success) {
    setOpenedPack({ ...confirmPack, purchase_id: data.purchase_id } as PackWithPurchaseId);
  } else {
    alert(data.message || 'Ошибка покупки');
  }
  setConfirmPack(null);
}}
```

## InventoryPage.tsx

### Проблемы:
1. Неправильные типы для user (never)
2. Отсутствие upgradeable в EquippedItem
3. Неправильный тип для useImperativeHandle
4. Неправильные пропсы для InfoBlock и StyledTabs
5. Неправильный onClick для Button

### Исправления:

1. **Исправить типы для user** - добавить проверки на null
2. **Добавить upgradeable в EquippedItem в types.ts**:
```tsx
export interface EquippedItem {
  item_id: number;
  item_name: string;
  rarity: string;
  upgrade_level: number;
  image_url: string;
  background_url: string;
  upgradeable?: boolean;
}
```

3. **Исправить useImperativeHandle**:
```tsx
useImperativeHandle(ref, () => ({
  openItemModalById: (id: string | number) => {
    const item = items.find(i => String(i.id) === String(id));
    if (item) {
      setSelectedItem(item);
      setShowItemInfo(true);
    }
  }
}));
```

4. **Исправить InfoBlock**:
```tsx
<InfoBlock
  title="Мой Инвентарь"
  description="Лимитированные вещи в коннекте - коллекционные предметы, которые можно получить из паков и сундуков"
  styleVariant="dark"
  style={{ 
    textAlign: 'center',
    mb: 1,
    '& .MuiTypography-h5': {
      textAlign: 'center',
      fontWeight: 600
    },
    '& .MuiTypography-body2': {
      textAlign: 'center',
      opacity: 0.8
    }
  }}
  children={null}
  titleStyle={{}}
  descriptionStyle={{}}
  customStyle={false}
  className=""
/>
```

5. **Исправить StyledTabs**:
```tsx
<StyledTabs
  value={activeTab}
  onChange={(e, newValue) => setActiveTab(newValue)}
  tabs={tabs}
  variant="standard"
  centered
  fullWidth
  customStyle={false}
  className=""
  style={{}}
/>
```

6. **Исправить Button onClick**:
```tsx
<Button 
  onClick={() => fetchInventory()} 
  variant="contained" 
  sx={{ mt: 2, display: 'block', mx: 'auto' }}
>
  Попробовать снова
</Button>
```

## ItemInfoModal.tsx

### Проблемы:
1. Неправильные пропсы для AnimatedSparkle и AnimatedStar
2. Null проверки для item
3. Неправильные типы для updatedItem
4. Неправильные типы для обработчиков событий

### Исправления:

1. **Исправить AnimatedSparkle и AnimatedStar** - убрать неподдерживаемые пропсы или создать кастомные компоненты
2. **Добавить null проверки**:
```tsx
const handleEquipItem = async () => {
  if (!item) return;
  // ... остальной код
};
```

3. **Исправить типы для updatedItem**:
```tsx
const updatedItem: InventoryItem = {
  ...item,
  is_equipped: true
} as InventoryItem;
```

4. **Исправить типы для обработчиков**:
```tsx
const searchUser = (query: string) => {
  // ... код
};

const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  // ... код
};

const selectSuggestion = (username: string, userId: number) => {
  // ... код
};
```

## Общие рекомендации:

1. **Проверить все импорты** - убедиться, что типы импортируются правильно
2. **Добавить null проверки** везде, где это необходимо
3. **Использовать правильные типы** для всех параметров функций
4. **Проверить совместимость** с внешними компонентами (InfoBlock, StyledTabs, etc.)
5. **Тестировать** после внесения изменений

## Команды для проверки:

```bash
# Проверить TypeScript ошибки
npx tsc --noEmit

# Проверить линтер
npm run lint

# Запустить в режиме разработки
npm start
``` 