import React, { useState } from 'react';
import { Button, Box } from '@mui/material';
import { UltimateDecorationModal } from './index';

// Тестовые данные декораций с правильным форматом
const testDecorations = [
  {
    id: 1,
    name: 'Золотая тема',
    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
    item_path: '/static/decoration/items/gold_theme.png',
    description: 'Эксклюзивная золотая тема для Ultimate подписки',
  },
  {
    id: 2,
    name: 'Космическая тема',
    background:
      'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    item_path: '/static/decoration/items/space_theme.png',
    description: 'Загадочная космическая тема',
  },
  {
    id: 3,
    name: 'Природная тема',
    background:
      'linear-gradient(135deg, #2d5016 0%, #4a7c59 50%, #6b8e23 100%)',
    item_path: '/static/decoration/items/nature_theme.png',
    description: 'Успокаивающая природная тема',
  },
  {
    id: 4,
    name: 'Океанская тема',
    background:
      'linear-gradient(135deg, #006994 0%, #0099cc 50%, #00bfff 100%)',
    item_path: '/static/decoration/items/ocean_theme.png',
    description: 'Глубокий океанский градиент',
  },
  {
    id: 5,
    name: 'Лягушка (bottom:0)',
    background: 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)',
    item_path: '/static/decoration/items/frog_ser.png;bottom:0;',
    description: 'Лягушка с позиционированием bottom:0',
  },
  {
    id: 6,
    name: 'Кастомная позиция',
    background: 'linear-gradient(135deg, #E91E63 0%, #9C27B0 100%)',
    item_path:
      '/static/decoration/items/custom_item.png;bottom:10px;right:20px;',
    description: 'Декорация с кастомным позиционированием',
  },
];

const TestComponent = () => {
  const [open, setOpen] = useState(false);

  const handleSuccess = selectedDecoration => {
    console.log('Выбрана декорация:', selectedDecoration);
    alert(`Выбрана декорация: ${selectedDecoration.name}`);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Button variant='contained' onClick={() => setOpen(true)} sx={{ mb: 2 }}>
        Открыть модалку выбора декорации
      </Button>

      <UltimateDecorationModal
        open={open}
        onClose={() => setOpen(false)}
        availableDecorations={testDecorations}
        onSuccess={handleSuccess}
      />
    </Box>
  );
};

export default TestComponent;
