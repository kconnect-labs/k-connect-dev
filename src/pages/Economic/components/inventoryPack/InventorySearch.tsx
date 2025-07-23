import React, { useState } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Collapse,
  Divider,
  Slider,
  FormControlLabel,
  Switch,
  Paper,
  CircularProgress,
  Typography,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { SearchFilters } from './types';

interface InventorySearchProps {
  onFiltersChange: (filters: SearchFilters) => void;
  onQueryChange: (query: string) => void;
  showFilters?: boolean;
  placeholder?: string;
  isLoading?: boolean;
  error?: string | null;
}

const rarityColors = {
  common: '#9e9e9e',
  rare: '#2196f3',
  epic: '#9c27b0',
  legendary: '#ff9800',
};

const rarityLabels = {
  common: 'Обычный',
  rare: 'Редкий',
  epic: 'Эпический',
  legendary: 'Легендарный',
};

export const InventorySearch: React.FC<InventorySearchProps> = ({
  onFiltersChange,
  onQueryChange,
  showFilters = true,
  placeholder = 'Поиск предметов...',
  isLoading = false,
  error = null,
}) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = event.target.value;
    setQuery(newQuery);
    onQueryChange(newQuery);
  };

  const handleRarityChange = (rarity: string | null) => {
    const newFilters: SearchFilters = {
      ...filters,
      rarity: rarity as any || undefined,
    };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleEquippedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFilters: SearchFilters = {
      ...filters,
      is_equipped: event.target.checked,
    };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters: SearchFilters = {};
    setFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const clearSearch = () => {
    setQuery('');
    onQueryChange('');
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,

        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '12px',
      }}
    >
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
        {/* Поле поиска */}
        <TextField
          fullWidth
          value={query}
          onChange={handleQueryChange}
          placeholder={placeholder}
          variant="outlined"
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                {isLoading ? (
                  <CircularProgress size={20} sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                ) : (
                  <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                )}
              </InputAdornment>
            ),
            endAdornment: query && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={clearSearch}
                  sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                >
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
            sx: {
              '& .MuiOutlinedInput-root': {
                color: 'rgba(255, 255, 255, 0.9)',
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
              },
              '& .MuiInputBase-input::placeholder': {
                color: 'rgba(255, 255, 255, 0.5)',
                opacity: 1,
              },
            },
          }}
        />

        {/* Кнопка фильтров */}
        {showFilters && (
          <IconButton
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            sx={{
              color: hasActiveFilters ? 'primary.main' : 'rgba(255, 255, 255, 0.7)',
              border: hasActiveFilters ? '1px solid' : '1px solid rgba(255, 255, 255, 0.2)',
              borderColor: hasActiveFilters ? 'primary.main' : 'rgba(255, 255, 255, 0.2)',
            }}
          >
            <FilterIcon />
          </IconButton>
        )}
      </Box>

      {/* Расширенные фильтры */}
      {showFilters && (
        <Collapse in={showAdvancedFilters}>
          <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            {/* Фильтр по редкости */}
            <Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {Object.entries(rarityLabels).map(([key, label]) => (
                  <Chip
                    key={key}
                    label={label}
                    size="small"
                    onClick={() => handleRarityChange(filters.rarity === key ? null : key)}
                    sx={{
                      backgroundColor: filters.rarity === key ? rarityColors[key as keyof typeof rarityColors] : 'rgba(255, 255, 255, 0.1)',
                      color: filters.rarity === key ? 'white' : 'rgba(255, 255, 255, 0.8)',
                      '&:hover': {
                        backgroundColor: filters.rarity === key ? rarityColors[key as keyof typeof rarityColors] : 'rgba(255, 255, 255, 0.2)',
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>


            {/* Кнопка очистки фильтров */}
            {hasActiveFilters && (
              <Button
                size="small"
                onClick={clearFilters}
                startIcon={<ClearIcon />}
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  '&:hover': {
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  },
                }}
                variant="outlined"
              >
                Очистить фильтры
              </Button>
            )}
          </Box>
        </Collapse>
      )}

      {/* Отображение ошибки */}
      {error && (
        <Box sx={{ mt: 1, p: 1, borderRadius: '8px', backgroundColor: 'rgba(244, 67, 54, 0.1)', border: '1px solid rgba(244, 67, 54, 0.3)' }}>
          <Typography variant="caption" sx={{ color: 'rgba(244, 67, 54, 0.9)' }}>
            Ошибка поиска: {error}
          </Typography>
        </Box>
      )}
    </Paper>
  );
}; 