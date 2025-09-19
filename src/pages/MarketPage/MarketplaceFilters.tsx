import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  Typography,
  CircularProgress,
  Menu,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Clear as ClearIcon } from '@mui/icons-material';
import { useMarketplaceFilters, Pack, PackItem } from './useMarketplaceFilters';
import BallsIcon from '../Economic/components/inventoryPack/BallsIcon';
import MCoinIcon from '../Economic/components/inventoryPack/MCoinIcon';
import CurrencyToggle from '../Economic/components/inventoryPack/CurrencyToggle';

const StyledFiltersContainer = styled(Box)(({ theme }) => ({
  background: 'var(--theme-background)',
  backdropFilter: 'var(--theme-backdrop-filter)',
  borderRadius: 'var(--main-border-radius)',
  padding: theme.spacing(3),
  marginBottom: theme.spacing(1),
  border: '1px solid rgba(66, 66, 66, 0.5)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  position: 'relative',
  zIndex: 1,
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(2),
  },
}));

const FilterRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  alignItems: 'flex-start',
  flexWrap: 'wrap',
  position: 'relative',
  zIndex: 1,
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: theme.spacing(1.5),
  },
  [theme.breakpoints.up('md')]: {
    alignItems: 'center',
  },
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  minWidth: 0, // Убираем фиксированную минимальную ширину
  flex: '1 1 0', // Позволяем элементам сжиматься
  maxWidth: '100%', // Ограничиваем максимальную ширину
  '& .MuiInputLabel-root': {
    color: 'var(--theme-text-secondary)',
    '&.Mui-focused': {
      color: 'var(--theme-text-accent)',
    },
  },
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'var(--theme-background)',
    borderRadius: 'var(--main-border-radius)',
    '& fieldset': {
      borderColor: 'rgba(66, 66, 66, 0.5)',
    },
    '&:hover fieldset': {
      borderColor: 'var(--theme-text-accent)',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'var(--theme-text-accent)',
    },
    '& .MuiSelect-select': {
      color: 'var(--theme-text-primary)',
    },
  },
  '& .MuiSelect-icon': {
    color: 'var(--theme-text-secondary)',
  },
  [theme.breakpoints.down('md')]: {
    minWidth: '100%',
    flex: '1 1 100%',
    maxWidth: '100%',
  },
  [theme.breakpoints.up('md')]: {
    minWidth: 150, // Минимальная ширина для десктопа
    maxWidth: 250,
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  height: 40,
  borderRadius: 'var(--main-border-radius)',
  borderColor: 'rgba(66, 66, 66, 0.5)',
  color: 'var(--theme-text-primary)',
  backgroundColor: 'var(--theme-background)',
  position: 'relative',
  zIndex: 1,
  '&:hover': {
    borderColor: 'var(--theme-text-accent)',
    backgroundColor: 'var(--theme-background)',
    color: 'var(--theme-text-accent)',
  },
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  backgroundColor: 'var(--theme-text-accent)',
  color: 'var(--theme-text-primary)',
  fontWeight: 500,
  '& .MuiChip-deleteIcon': {
    color: 'var(--theme-text-primary)',
    '&:hover': {
      color: 'var(--theme-text-secondary)',
    },
  },
}));

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  color: 'var(--theme-text-primary)',
  backgroundColor: 'var(--theme-background)',
  '&:hover': {
    backgroundColor: 'var(--theme-background)',
    color: 'var(--theme-text-accent)',
  },
  '&.Mui-selected': {
    backgroundColor: 'var(--theme-text-accent)',
    color: 'var(--theme-text-primary)',
    '&:hover': {
      backgroundColor: 'var(--theme-text-accent)',
    },
  },
}));

interface MarketplaceFiltersProps {
  onFiltersChange: (filters: {
    pack_id?: number;
    item_name?: string;
  }) => void;
  currentFilters: any;
}

const MarketplaceFilters: React.FC<MarketplaceFiltersProps> = ({
  onFiltersChange,
  currentFilters,
}) => {
  const { packs, packItems, loading, error, fetchPackItems } = useMarketplaceFilters();
  const [selectedPack, setSelectedPack] = useState<number | ''>('');
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [selectedCurrency, setSelectedCurrency] = useState<'points' | 'mcoin' | ''>('');
  const [loadingItems, setLoadingItems] = useState(false);

  // Инициализация фильтров из пропсов
  useEffect(() => {
    if (currentFilters?.pack_id && currentFilters.pack_id !== selectedPack) {
      setSelectedPack(currentFilters.pack_id);
      fetchPackItems(currentFilters.pack_id);
    }
    if (currentFilters?.item_name && currentFilters.item_name !== selectedItem) {
      setSelectedItem(currentFilters.item_name);
    }
    if (currentFilters?.currency && currentFilters.currency !== selectedCurrency) {
      setSelectedCurrency(currentFilters.currency);
    }
  }, [currentFilters?.pack_id, currentFilters?.item_name, currentFilters?.currency]);

  const handlePackChange = useCallback(async (packId: number | '') => {
    setSelectedPack(packId);
    setSelectedItem(''); // Сбрасываем выбранный предмет
    
    if (packId) {
      setLoadingItems(true);
      try {
        await fetchPackItems(packId);
      } finally {
        setLoadingItems(false);
      }
    }
    
    applyFilters({
      pack_id: packId || undefined,
      item_name: undefined,
      currency: selectedCurrency || undefined,
    });
  }, [fetchPackItems]);

  const handleItemChange = useCallback((itemName: string) => {
    setSelectedItem(itemName);
    applyFilters({
      pack_id: selectedPack || undefined,
      item_name: itemName || undefined,
      currency: selectedCurrency || undefined,
    });
  }, [selectedPack, selectedCurrency]);

  const handleCurrencyChange = useCallback((currency: 'points' | 'mcoin' | '') => {
    setSelectedCurrency(currency);
    applyFilters({
      pack_id: selectedPack || undefined,
      item_name: selectedItem || undefined,
      currency: currency || undefined,
    });
  }, [selectedPack, selectedItem]);

  const applyFilters = useCallback((filters: any) => {
    onFiltersChange(filters);
  }, [onFiltersChange]);

  const clearFilters = useCallback(() => {
    setSelectedPack('');
    setSelectedItem('');
    setSelectedCurrency('');
    onFiltersChange({});
  }, [onFiltersChange]);


  return (
    <StyledFiltersContainer>
      <Typography variant="h6" sx={{ 
        mb: 2, 
        fontWeight: 600,
        color: 'var(--theme-text-primary)',
        fontSize: '1.1rem'
      }}>
        Фильтры
      </Typography>
      
      {/* Глобальные стили для Menu */}
      <style>{`
        .MuiMenu-paper {
          background-color: var(--theme-background) !important;
          backdrop-filter: var(--theme-backdrop-filter) !important;
          border: 1px solid rgba(66, 66, 66, 0.5) !important;
          border-radius: var(--main-border-radius) !important;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1) !important;
          background-image: none !important;
        }
        .MuiMenu-list {
          padding: 8px !important;
        }
        .MuiMenuItem-root {
          color: var(--theme-text-primary) !important;
          background-color: transparent !important;
          border-radius: var(--main-border-radius) !important;
          margin: 2px 0 !important;
        }
        .MuiMenuItem-root:hover {
          background-color: var(--theme-background) !important;
          color: var(--theme-text-accent) !important;
        }
        .MuiMenuItem-root.Mui-selected {
          background-color: var(--theme-text-accent) !important;
          color: var(--theme-text-primary) !important;
        }
        .MuiMenuItem-root.Mui-selected:hover {
          background-color: var(--theme-text-accent) !important;
        }
      `}</style>
      
      <FilterRow>
        {/* Выбор пака */}
        <StyledFormControl>
          <InputLabel>Пак</InputLabel>
          <Select
            value={selectedPack}
            label="Пак"
            onChange={(e) => handlePackChange(e.target.value as number | '')}
            disabled={loading}
          >
            <StyledMenuItem value="">
              <em>Все паки</em>
            </StyledMenuItem>
            {packs.map((pack) => (
              <StyledMenuItem key={pack.id} value={pack.id}>
                {pack.display_name}
              </StyledMenuItem>
            ))}
          </Select>
        </StyledFormControl>

        {/* Выбор предмета из пака */}
        <StyledFormControl disabled={!selectedPack}>
          <InputLabel>Предмет</InputLabel>
          <Select
            value={selectedItem}
            label="Предмет"
            onChange={(e) => handleItemChange(e.target.value as string)}
            disabled={!selectedPack || loadingItems}
            endAdornment={loadingItems ? <CircularProgress size={20} /> : null}
          >
            <StyledMenuItem value="">
              <em>Все предметы</em>
            </StyledMenuItem>
            {packItems.map((item) => (
              <StyledMenuItem key={item.id} value={item.item_name}>
                {item.item_name}
              </StyledMenuItem>
            ))}
          </Select>
        </StyledFormControl>

        {/* Фильтр валют */}
        <Box >
          <CurrencyToggle
            value={selectedCurrency}
            onChange={handleCurrencyChange}
            showAllOption={true}
          />
        </Box>

        {/* Кнопка очистки */}
        <StyledButton
          variant="outlined"
          startIcon={<ClearIcon />}
          onClick={clearFilters}
          sx={{

          } as any}
        >
          Очистить
        </StyledButton>
      </FilterRow>

      {/* Показываем ошибку если есть */}
      {error && (
        <Typography variant="body2" color="error" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}

      {/* Активные фильтры */}
      {(selectedPack || selectedItem) && (
        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ 
            color: 'var(--theme-text-secondary)',
            mr: 1
          }}>
            Активные фильтры:
          </Typography>
          {selectedPack && (
            <StyledChip
              label={`Пак: ${packs.find(p => p.id === selectedPack)?.display_name}`}
              onDelete={() => handlePackChange('')}
              size="small"
            />
          )}
          {selectedItem && (
            <StyledChip
              label={`Предмет: ${selectedItem}`}
              onDelete={() => handleItemChange('')}
              size="small"
            />
          )}
        </Box>
      )}
    </StyledFiltersContainer>
  );
};

export default MarketplaceFilters;
