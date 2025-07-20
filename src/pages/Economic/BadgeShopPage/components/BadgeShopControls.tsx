import React from 'react';
import {
  Box,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material';
import { SortSelect } from './StyledComponents';
import StyledTabs from '../../../../UIKIT/StyledTabs';
import SortIcon from '@mui/icons-material/Sort';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { TabValue, SortOption } from '../types';

interface BadgeShopControlsProps {
  tabValue: TabValue;
  sortOption: SortOption;
  onTabChange: (event: React.SyntheticEvent | null, newValue: TabValue) => void;
  onSortChange: (event: any) => void;
  isMobile: boolean;
}

export const BadgeShopControls: React.FC<BadgeShopControlsProps> = ({
  tabValue,
  sortOption,
  onTabChange,
  onSortChange,
  isMobile,
}) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: isMobile ? 'column' : 'row', 
      alignItems: isMobile ? 'stretch' : 'center',
      justifyContent: 'space-between',
      mb: 1,
      gap: 0
    }}>
      <StyledTabs
        value={tabValue}
        onChange={(event, newValue) => onTabChange(event, newValue as TabValue)}
        tabs={[
          { value: 0, label: "Доступные" },
          { value: 1, label: "Мои" },
          { value: 2, label: "Купленные" },
          { value: 3, label: "Скупленные" }
        ]}
        fullWidth
        customStyle
        style={{ 
          marginBottom: isMobile ? 0 : 0,
          display: isMobile ? 'none' : 'block'
        }}
      />

      <SortSelect size="small">
        <InputLabel id="sort-select-label">
          <Box display="flex" alignItems="center" gap={0.5}>
            <SortIcon fontSize="small" />
            <span>Сортировка</span>
          </Box>
        </InputLabel>
        <Select
          labelId="sort-select-label"
          value={sortOption}
          onChange={onSortChange}
          label={
            <Box display="flex" alignItems="center" gap={0.5}>
              <SortIcon fontSize="small" />
              <span>Сортировка</span>
            </Box>
          }
          size="small"
        >
          <MenuItem value="newest">
            <Box display="flex" alignItems="center" gap={1}>
              <NewReleasesIcon fontSize="small" />
              <span>Сначала новые</span>
            </Box>
          </MenuItem>
          <MenuItem value="oldest">
            <Box display="flex" alignItems="center" gap={1}>
              <NewReleasesIcon fontSize="small" sx={{ transform: 'rotate(180deg)' }} />
              <span>Сначала старые</span>
            </Box>
          </MenuItem>
          <MenuItem value="popular">
            <Box display="flex" alignItems="center" gap={1}>
              <TrendingUpIcon fontSize="small" />
              <span>Популярные</span>
            </Box>
          </MenuItem>
          <MenuItem value="price-low">
            <Box display="flex" alignItems="center" gap={1}>
              <AttachMoneyIcon fontSize="small" />
              <span>Дешевле</span>
            </Box>
          </MenuItem>
          <MenuItem value="price-high">
            <Box display="flex" alignItems="center" gap={1}>
              <AttachMoneyIcon fontSize="small" sx={{ transform: 'scale(1.2)' }} />
              <span>Дороже</span>
            </Box>
          </MenuItem>
        </Select>
      </SortSelect>
    </Box>
  );
}; 