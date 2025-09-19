import React from 'react';
import {
  TextField,
  InputAdornment,
  IconButton,
  Box,
  alpha,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  fullWidth?: boolean;
}

const StyledSearchBar = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  '& .MuiOutlinedInput-root': {
    borderRadius: 'var(--main-border-radius) !important',
    backgroundColor: 'var(--theme-background, rgba(255, 255, 255, 0.03))',
    backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
    transition: 'all 0.3s',
    border: '1px solid rgba(0, 0, 0, 0.12)',
    '&:hover': {
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
    },
    '&.Mui-focused': {
      boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
    },
  },
  '& .MuiOutlinedInput-input': {
    color: 'inherit',
    '&::placeholder': {
      color: 'rgba(255, 255, 255, 0.5)',
      opacity: 1,
    },
  },
}));

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Поиск по юзернейму или продавцу...',
  fullWidth = true,
}) => {
  const theme = useTheme();

  const handleClear = () => {
    onChange('');
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <StyledSearchBar
        fullWidth={fullWidth}
        variant='outlined'
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position='start'>
              <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.5)' }} />
            </InputAdornment>
          ),
          endAdornment: value && (
            <InputAdornment position='end'>
              <IconButton
                size='small'
                onClick={handleClear}
                sx={{
                  color: 'rgba(255, 255, 255, 0.5)',
                  '&:hover': {
                    color: 'rgba(255, 255, 255, 0.8)',
                  },
                }}
              >
                <ClearIcon fontSize='small' />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
};

export default SearchBar; 