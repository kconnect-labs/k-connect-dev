import React, { useState } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  IconButton,
  Tooltip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Search, Clear, FilterList } from '@mui/icons-material';

interface Filters {
  status?: string;
  priority?: string;
  category?: string;
  assigned_to?: number;
  search?: string;
}

interface TicketSearchProps {
  filters: Filters;
  onFiltersChange: (filters: Partial<Filters>) => void;
  onSearch: () => void;
}

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: theme.spacing(1),
    '&:hover': {
      border: '1px solid rgba(255, 255, 255, 0.2)',
    },
    '&.Mui-focused': {
      border: '1px solidrgb(243, 33, 226)',
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  '& .MuiInputBase-input': {
    color: 'rgba(255, 255, 255, 0.87)',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    borderRadius: theme.spacing(1),
    '&:hover': {
      border: '1px solid rgba(255, 255, 255, 0.2)',
    },
    '&.Mui-focused': {
      border: '1px solid rgba(33, 150, 243, 0.5)',
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  '& .MuiInputBase-input': {
    color: 'rgba(255, 255, 255, 0.87)',
  },
}));

const TicketSearch: React.FC<TicketSearchProps> = ({
  filters,
  onFiltersChange,
  onSearch,
}) => {
  const [localSearch, setLocalSearch] = useState(filters.search || '');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearch(event.target.value);
  };

  const handleSearchSubmit = () => {
    onFiltersChange({ search: localSearch });
    onSearch();
  };

  const handleClearFilters = () => {
    setLocalSearch('');
    onFiltersChange({
      status: '',
      priority: '',
      category: '',
      assigned_to: undefined,
      search: '',
    });
    onSearch();
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  return (
    <Box>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={4}>
          <StyledTextField
            fullWidth
            label="Поиск по тикетам"
            value={localSearch}
            onChange={handleSearchChange}
            onKeyPress={handleKeyPress}
            placeholder="Введите текст для поиска..."
            InputProps={{
              endAdornment: (
                <Tooltip title="Найти">
                  <IconButton
                    onClick={handleSearchSubmit}
                    sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                  >
                    <Search />
                  </IconButton>
                </Tooltip>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12} md={2}>
          <StyledFormControl fullWidth>
            <InputLabel>Статус</InputLabel>
            <Select
              value={filters.status || ''}
              onChange={(e) => onFiltersChange({ status: e.target.value })}
              label="Статус"
            >
              <MenuItem value="">Все статусы</MenuItem>
              <MenuItem value="new">Новые</MenuItem>
              <MenuItem value="in_progress">В работе</MenuItem>
              <MenuItem value="resolved">Решенные</MenuItem>
              <MenuItem value="closed">Закрытые</MenuItem>
            </Select>
          </StyledFormControl>
        </Grid>

        <Grid item xs={12} md={2}>
          <StyledFormControl fullWidth>
            <InputLabel>Приоритет</InputLabel>
            <Select
              value={filters.priority || ''}
              onChange={(e) => onFiltersChange({ priority: e.target.value })}
              label="Приоритет"
            >
              <MenuItem value="">Все приоритеты</MenuItem>
              <MenuItem value="urgent">Срочный</MenuItem>
              <MenuItem value="high">Высокий</MenuItem>
              <MenuItem value="medium">Средний</MenuItem>
              <MenuItem value="low">Низкий</MenuItem>
            </Select>
          </StyledFormControl>
        </Grid>

        <Grid item xs={12} md={2}>
          <StyledFormControl fullWidth>
            <InputLabel>Категория</InputLabel>
            <Select
              value={filters.category || ''}
              onChange={(e) => onFiltersChange({ category: e.target.value })}
              label="Категория"
            >
              <MenuItem value="">Все категории</MenuItem>
              <MenuItem value="abuse">Нарушения</MenuItem>
              <MenuItem value="spam">Спам</MenuItem>
              <MenuItem value="content">Контент</MenuItem>
              <MenuItem value="technical">Технические</MenuItem>
              <MenuItem value="other">Другое</MenuItem>
            </Select>
          </StyledFormControl>
        </Grid>

        <Grid item xs={12} md={2}>
          <Box display="flex" gap={1}>
            <Button
              variant="contained"
              onClick={handleSearchSubmit}
              startIcon={<Search />}
              sx={{
                background: 'linear-gradient(45deg, #d0bcff 30%, #cfbcfb 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #c4a7ff 30%, #b8a9ff 90%)',
                },
              }}
            >
              Найти
            </Button>
            <Tooltip title="Очистить фильтры">
              <IconButton
                onClick={handleClearFilters}
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                <Clear />
              </IconButton>
            </Tooltip>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TicketSearch; 