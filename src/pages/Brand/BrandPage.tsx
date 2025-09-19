import React, { useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Button,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Palette as PaletteIcon,
  TextFields as TextFieldsIcon,
  Image as ImageIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { gradientBorder } from '../../UIKIT/styles/gradientEffects';

import TypographySection from './components/TypographySection';
import ColorsSection from './components/ColorsSection';
import IconsSection from './components/IconsSection';
import BannersSection from './components/BannersSection';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`brand-tabpanel-${index}`}
      aria-labelledby={`brand-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const BrandPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              color: 'white',
              mb: 2,
              fontSize: isMobile ? '2.5rem' : '3.5rem',
              background: 'linear-gradient(135deg, #B69DF8 0%, #D0BCFF 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Бренд К-Коннект
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255, 255, 255, 0.8)',
              maxWidth: '600px',
              mx: 'auto',
              lineHeight: 1.6,
            }}
          >
            Руководство по использованию элементов бренда, типографики, цветов и ресурсов
          </Typography>
        </Box>

        {/* Tabs */}
        <Box sx={{ mb: 3 }}>
          <Box sx={gradientBorder(theme, 'dark')}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant={isMobile ? 'scrollable' : 'fullWidth'}
              scrollButtons={isMobile ? 'auto' : false}
              sx={{
                '& .MuiTab-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 500,
                  minHeight: '60px',
                  '&.Mui-selected': {
                    color: '#D0BCFF',
                  },
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#D0BCFF',
                },
              }}
            >
              <Tab
                icon={<TextFieldsIcon />}
                label="Типографика"
                iconPosition="start"
              />
              <Tab
                icon={<PaletteIcon />}
                label="Цвета"
                iconPosition="start"
              />
              <Tab
                icon={<StarIcon />}
                label="Иконки"
                iconPosition="start"
              />
              <Tab
                icon={<ImageIcon />}
                label="Баннеры"
                iconPosition="start"
              />
            </Tabs>
          </Box>
        </Box>

        {/* Tab Content */}
        <TabPanel value={tabValue} index={0}>
          <TypographySection />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <ColorsSection />
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <IconsSection />
        </TabPanel>
        <TabPanel value={tabValue} index={3}>
          <BannersSection />
        </TabPanel>
      </Container>
    </Box>
  );
};

export default BrandPage;