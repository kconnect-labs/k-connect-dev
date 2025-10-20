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

const TypographySection: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fonts = [
    {
      name: 'Mplus',
      description: 'Основной шрифт для брендированных материалов',
      usage: 'Используется для заголовков в баннерах, постах, рекламных материалах и других брендированных элементах. В самом приложении К-Коннект не используется.',
    },
    {
      name: 'Poppins',
      description: 'Шрифт для текста в брендированных материалах',
      usage: 'Используется для основного текста в баннерах, постах, описаниях и других брендированных материалах. В самом приложении К-Коннект не используется.',
    },
  ];

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
        Типографика
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
        Наша типографическая система для брендированных материалов основана на двух основных шрифтах: Mplus для заголовков и Poppins для основного текста.
        Эти шрифты используются исключительно для баннеров, постов, рекламных материалов и других брендированных элементов. В самом приложении К-Коннект используются другие шрифты.
      </Typography>

      {fonts.map((font, fontIndex) => (
        <Card
          key={fontIndex}
          sx={{
            mb: 4,
            ...gradientBorder(theme, 'dark'),
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="h4"
                sx={{
                  color: '#D0BCFF',
                  mb: 1,
                  fontWeight: 600,
                }}
              >
                {font.name}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  mb: 2,
                }}
              >
                {font.description}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  mb: 2,
                  lineHeight: 1.6,
                }}
              >
                {font.usage}
              </Typography>
              <Chip
                label={`font-family: ${font.name}`}
                sx={{
                  backgroundColor: 'rgba(208, 188, 255, 0.1)',
                  color: '#D0BCFF',
                  borderTop: '1px solid rgba(240, 240, 240, 0.24)',
        borderRight: '1px solid rgba(200, 200, 200, 0.322)',
        borderLeft: '1px solid rgba(200, 200, 200, 0.233)',
        borderBottom: '1px solid rgba(100, 100, 100, 0.486)',
                }}
              />
            </Box>
          </CardContent>
        </Card>
      ))}

      {/* Usage Guidelines */}
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
            Рекомендации по использованию
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
                  Mplus - для заголовков
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    mb: 2,
                  }}
                >
                  • Используйте для всех заголовков (H1-H6)
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    mb: 2,
                  }}
                >
                  • Идеально подходит для навигации и логотипов
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                  }}
                >
                  • Обеспечивает четкую визуальную иерархию
                </Typography>
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
                  Poppins - для текста
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    mb: 2,
                  }}
                >
                  • Используйте для основного текста и интерфейса
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    mb: 2,
                  }}
                >
                  • Отличная читаемость на всех размерах экрана
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                  }}
                >
                  • Подходит для кнопок, форм и описаний
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TypographySection; 