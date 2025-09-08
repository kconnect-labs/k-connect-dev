import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { gradientBorder } from '../../../UIKIT/styles/gradientEffects';

const ColorsSection: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const colorPalette = {
    primary: [
      { name: 'Primary Purple', hex: '#D0BCFF', description: 'Основной цвет карточек' },
      { name: 'Gradient Start', hex: '#B69DF8', description: 'Начало градиента' },
      { name: 'Gradient End', hex: '#D0BCFF', description: 'Конец градиента' },
    ],
    backgrounds: [
      { name: 'White Background', hex: 'var(--theme-text-primary)', description: 'Светлый фон' },
      { name: 'Dark Background', hex: '#1C1C1C', description: 'Темный фон' },
      { name: 'Card Background', hex: '#171717', description: 'Фон карточек' },
    ],
    gradients: [
      {
        name: 'Primary Gradient',
        start: '#B69DF8',
        end: '#D0BCFF',
        description: 'Основной градиент бренда',
      },
    ],
  };

  const ColorSwatch: React.FC<{
    name: string;
    hex: string;
    description: string;
  }> = ({ name, hex, description }) => (
    <Box
      sx={{
        p: 3,
        border: '1px solid rgba(66, 66, 66, 0.5)',
        borderRadius: 'var(--main-border-radius)',
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        height: '100%',
      }}
    >
      <Box
        sx={{
          width: '100%',
          height: '80px',
          backgroundColor: hex,
          borderRadius: 'var(--main-border-radius)',
          mb: 2,
          border: '1px solid rgba(66, 66, 66, 0.5)',
        }}
      />
      <Typography
        variant="h6"
        sx={{
          color: 'white',
          mb: 1,
          fontWeight: 500,
        }}
      >
        {name}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: 'rgba(255, 255, 255, 0.7)',
          mb: 2,
        }}
      >
        {description}
      </Typography>
      <Chip
        label={hex}
        sx={{
          backgroundColor: 'rgba(208, 188, 255, 0.1)',
          color: '#D0BCFF',
          border: '1px solid rgba(208, 188, 255, 0.3)',
          fontFamily: 'monospace',
        }}
      />
    </Box>
  );

  const GradientSwatch: React.FC<{
    name: string;
    start: string;
    end: string;
    description: string;
  }> = ({ name, start, end, description }) => (
    <Box
      sx={{
        p: 3,
        border: '1px solid rgba(66, 66, 66, 0.5)',
        borderRadius: 'var(--main-border-radius)',
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        height: '100%',
      }}
    >
      <Box
        sx={{
          width: '100%',
          height: '80px',
          background: `linear-gradient(135deg, ${start} 0%, ${end} 100%)`,
          borderRadius: 'var(--main-border-radius)',
          mb: 2,
          border: '1px solid rgba(66, 66, 66, 0.5)',
        }}
      />
      <Typography
        variant="h6"
        sx={{
          color: 'white',
          mb: 1,
          fontWeight: 500,
        }}
      >
        {name}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: 'rgba(255, 255, 255, 0.7)',
          mb: 2,
        }}
      >
        {description}
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Chip
          label={start}
          size="small"
          sx={{
            backgroundColor: 'rgba(208, 188, 255, 0.1)',
            color: '#D0BCFF',
            border: '1px solid rgba(208, 188, 255, 0.3)',
            fontFamily: 'monospace',
          }}
        />
        <Chip
          label={end}
          size="small"
          sx={{
            backgroundColor: 'rgba(208, 188, 255, 0.1)',
            color: '#D0BCFF',
            border: '1px solid rgba(208, 188, 255, 0.3)',
            fontFamily: 'monospace',
          }}
        />
      </Box>
    </Box>
  );

  return (
    <Box>
      <Typography
        variant="h3"
        sx={{
          color: 'white',
          mb: 4,
          fontWeight: 600,
          textAlign: 'center',
        }}
      >
        Цветовая палитра
      </Typography>

      <Typography
        variant="body1"
        sx={{
          color: 'rgba(255, 255, 255, 0.8)',
          mb: 6,
          textAlign: 'center',
          maxWidth: '800px',
          mx: 'auto',
        }}
      >
        Наша цветовая система основана на фиолетовой палитре с градиентами и нейтральными фонами.
        Это создает современный и привлекательный дизайн.
      </Typography>

      {/* Primary Colors */}
      <Card
        sx={{
          mb: 4,
          ...gradientBorder(theme, 'dark'),
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant="h4"
            sx={{
              color: '#D0BCFF',
              mb: 3,
              fontWeight: 600,
            }}
          >
            Основные цвета
          </Typography>
          <Grid container spacing={3}>
            {colorPalette.primary.map((color, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <ColorSwatch {...color} />
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Background Colors */}
      <Card
        sx={{
          mb: 4,
          ...gradientBorder(theme, 'dark'),
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant="h4"
            sx={{
              color: '#D0BCFF',
              mb: 3,
              fontWeight: 600,
            }}
          >
            Цвета фонов
          </Typography>
          <Grid container spacing={3}>
            {colorPalette.backgrounds.map((color, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <ColorSwatch {...color} />
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Gradients */}
      <Card
        sx={{
          mb: 4,
          ...gradientBorder(theme, 'dark'),
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant="h4"
            sx={{
              color: '#D0BCFF',
              mb: 3,
              fontWeight: 600,
            }}
          >
            Градиенты
          </Typography>
          <Grid container spacing={3}>
            {colorPalette.gradients.map((gradient, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <GradientSwatch {...gradient} />
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Usage Examples */}
      <Card
        sx={{
          ...gradientBorder(theme, 'dark'),
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant="h5"
            sx={{
              color: '#D0BCFF',
              mb: 3,
              fontWeight: 600,
            }}
          >
            Примеры использования
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: 'white',
                    mb: 2,
                    fontWeight: 500,
                  }}
                >
                  CSS переменные
                </Typography>
                <Box
                  sx={{
                    p: 2,
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: 'var(--main-border-radius)',
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    color: '#D0BCFF',
                  }}
                >
                  {`:root {
  --primary-purple: #D0BCFF;
  --gradient-start: #B69DF8;
  --gradient-end: #D0BCFF;
  --bg-white: #FFFFFF;
  --bg-dark: #1C1C1C;
  --bg-card: #171717;
}`}
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: 'white',
                    mb: 2,
                    fontWeight: 500,
                  }}
                >
                  Material-UI sx
                </Typography>
                <Box
                  sx={{
                    p: 2,
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    borderRadius: 'var(--main-border-radius)',
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    color: '#D0BCFF',
                  }}
                >
                  {`sx={{
  background: 'linear-gradient(135deg, #B69DF8 0%, #D0BCFF 100%)',
  color: '#D0BCFF',
  backgroundColor: '#171717',
}`}
                </Box>
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3 }}>
            <Typography
              variant="h6"
              sx={{
                color: 'white',
                mb: 2,
                fontWeight: 500,
              }}
            >
              Рекомендации
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    mb: 1,
                  }}
                >
                  • Используйте #D0BCFF для акцентов и кнопок
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    mb: 1,
                  }}
                >
                  • Градиент для заголовков и важных элементов
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                  }}
                >
                  • #171717 для карточек и модальных окон
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    mb: 1,
                  }}
                >
                  • #1C1C1C для темных фонов
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    mb: 1,
                  }}
                >
                  • #FFFFFF для светлых элементов
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                  }}
                >
                  • Сохраняйте контрастность для читаемости
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ColorsSection; 