import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  useTheme,
  useMediaQuery,
  Chip,
} from '@mui/material';
import { gradientBorder } from '../../../UIKIT/styles/gradientEffects';
import {
  Download as DownloadIcon,
  Image as ImageIcon,
  AspectRatio as AspectRatioIcon,
} from '@mui/icons-material';

const BannersSection: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const bannerFiles = [
    {
      name: 'Banner No Info',
      filename: 'BannerNoInfo.png',
      description: 'Готовый баннер для наложения любого контента',
      type: 'PNG',
      size: '654KB',
      dimensions: '1200x400px',
      usage: 'Основной баннер для промо-материалов',
    },
    {
      name: 'Banner 1080x1080',
      filename: 'Banner1080x1080.png',
      description: 'Квадратный баннер для Instagram и социальных сетей',
      type: 'PNG',
      size: '723KB',
      dimensions: '1080x1080px',
      usage: 'Telegram, VK, YouTube',
    },
    {
      name: 'Banner 1280x720',
      filename: 'Banner1280x720.png',
      description: 'Широкоформатный баннер для YouTube и видео',
      type: 'PNG',
      size: '109KB',
      dimensions: '1280x720px',
      usage: 'YouTube, видео контент',
    },
    {
      name: 'Banner 1200x588',
      filename: 'Banner1200x588.png',
      description: 'Баннер для Facebook и LinkedIn',
      type: 'PNG',
      size: '531KB',
      dimensions: '1200x588px',
      usage: 'Telegram, VK, YouTube',
    },
  ];

  const handleDownload = (filename: string) => {
    const link = document.createElement('a');
    link.href = `/static/Brand/${filename}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const BannerCard: React.FC<{
    name: string;
    filename: string;
    description: string;
    type: string;
    size: string;
    dimensions: string;
    usage: string;
  }> = ({ name, filename, description, type, size, dimensions, usage }) => (
    <Card
      sx={{
        ...gradientBorder(theme, 'dark'),
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardContent
        sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}
      >
        <Box
          sx={{
            width: '100%',
            height: '200px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            borderRadius: 'var(--main-border-radius)',
            mb: 2,
            border: '1px solid rgba(255, 255, 255, 0.05)',
            overflow: 'hidden',
          }}
        >
          <img
            src={`/static/Brand/${filename}`}
            alt={name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </Box>

        <Typography
          variant='h6'
          sx={{
            color: 'white',
            mb: 1,
            fontWeight: 500,
          }}
        >
          {name}
        </Typography>

        <Typography
          variant='body2'
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
            mb: 2,
            flex: 1,
          }}
        >
          {description}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Chip
            label={type}
            size='small'
            sx={{
              backgroundColor: 'rgba(208, 188, 255, 0.1)',
              color: '#D0BCFF',
              border: '1px solid rgba(208, 188, 255, 0.3)',
            }}
          />
          <Chip
            label={size}
            size='small'
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: 'rgba(255, 255, 255, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          />
          <Chip
            label={dimensions}
            size='small'
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: 'rgba(255, 255, 255, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          />
        </Box>

        <Typography
          variant='caption'
          sx={{
            color: 'rgba(255, 255, 255, 0.6)',
            mb: 2,
            fontStyle: 'italic',
          }}
        >
          {usage}
        </Typography>

        <Button
          variant='outlined'
          startIcon={<DownloadIcon />}
          onClick={() => handleDownload(filename)}
          sx={{
            borderColor: 'rgba(208, 188, 255, 0.3)',
            color: '#D0BCFF',
          }}
        >
          Скачать
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography
        variant='h3'
        sx={{
          color: 'white',
          mb: 4,
          fontWeight: 600,
          textAlign: 'center',
        }}
      >
        Баннеры
      </Typography>

      <Typography
        variant='body1'
        sx={{
          color: 'rgba(255, 255, 255, 0.8)',
          mb: 6,
          textAlign: 'center',
          maxWidth: '800px',
          mx: 'auto',
        }}
      >
        Готовые баннеры для использования в промо-материалах, социальных сетях и
        рекламе. Все баннеры оптимизированы для различных платформ.
      </Typography>

      {/* Banner Preview */}
      <Card
        sx={{
          mb: 4,
          ...gradientBorder(theme, 'dark'),
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant='h4'
            sx={{
              color: '#D0BCFF',
              mb: 3,
              fontWeight: 600,
            }}
          >
            Пример использования BannerNoInfo
          </Typography>

          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: '300px',
              borderRadius: 'var(--main-border-radius)',
              overflow: 'hidden',
              mb: 3,
              border: '1px solid rgba(66, 66, 66, 0.5)',
            }}
          >
            <img
              src='/static/Brand/BannerNoInfo.png'
              alt='BannerNoInfo'
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />

            {/* Overlay content example */}
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                color: 'white',
                zIndex: 2,
              }}
            >
              <Typography
                variant='h3'
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                }}
              >
                К-Коннект
              </Typography>
              <Typography
                variant='h6'
                sx={{
                  textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                }}
              >
                Ваш контент здесь
              </Typography>
            </Box>
          </Box>

          <Typography
            variant='body1'
            sx={{
              color: 'rgba(255, 255, 255, 0.8)',
              mb: 3,
            }}
          >
            BannerNoInfo - это готовый баннер с градиентным фоном, на который
            можно наложить любой контент: текст, логотипы, изображения или
            другие элементы дизайна.
          </Typography>
        </CardContent>
      </Card>

      {/* Banners Grid */}
      <Grid container spacing={3}>
        {bannerFiles.map((banner, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <BannerCard {...banner} />
          </Grid>
        ))}
      </Grid>

      {/* Usage Guidelines */}
      <Card
        sx={{
          mt: 4,
          ...gradientBorder(theme, 'dark'),
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant='h5'
            sx={{
              color: '#D0BCFF',
              mb: 3,
              fontWeight: 600,
            }}
          >
            Рекомендации по использованию баннеров
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant='h6'
                  sx={{
                    color: 'white',
                    mb: 2,
                    fontWeight: 500,
                  }}
                >
                  Размеры и форматы
                </Typography>
                <Typography
                  variant='body2'
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    mb: 2,
                  }}
                >
                  • 1200x400px - основной баннер для веб
                </Typography>
                <Typography
                  variant='body2'
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    mb: 2,
                  }}
                >
                  • 1080x1080px - квадратный для Instagram
                </Typography>
                <Typography
                  variant='body2'
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    mb: 2,
                  }}
                >
                  • 1280x720px - широкоформатный для YouTube
                </Typography>
                <Typography
                  variant='body2'
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    mb: 2,
                  }}
                >
                  • 1200x588px - для Facebook и LinkedIn
                </Typography>
                <Typography
                  variant='body2'
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                  }}
                >
                  • PNG формат для лучшего качества
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant='h6'
                  sx={{
                    color: 'white',
                    mb: 2,
                    fontWeight: 500,
                  }}
                >
                  Применение
                </Typography>
                <Typography
                  variant='body2'
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    mb: 2,
                  }}
                >
                  • Instagram (1080x1080px)
                </Typography>
                <Typography
                  variant='body2'
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    mb: 2,
                  }}
                >
                  • YouTube (1280x720px)
                </Typography>
                <Typography
                  variant='body2'
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    mb: 2,
                  }}
                >
                  • Facebook, LinkedIn (1200x588px)
                </Typography>
                <Typography
                  variant='body2'
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    mb: 2,
                  }}
                >
                  • Веб-сайты и блоги (1200x400px)
                </Typography>
                <Typography
                  variant='body2'
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                  }}
                >
                  • Email рассылки и презентации
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Box
            sx={{
              mt: 3,
              p: 3,
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              borderRadius: 2,
            }}
          >
            <Typography
              variant='h6'
              sx={{
                color: '#D0BCFF',
                mb: 2,
                fontWeight: 500,
              }}
            >
              CSS пример наложения контента
            </Typography>
            <Box
              sx={{
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                color: '#D0BCFF',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                p: 2,
                borderRadius: 'var(--main-border-radius)',
                overflow: 'auto',
              }}
            >
              {`.banner-container {
  position: relative;
  width: 100%;
  height: 400px;
  background-image: url('/static/Brand/BannerNoInfo.png');
  background-size: cover;
  background-position: center;
}

.banner-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: white;
  z-index: 2;
}

.banner-content h1 {
  font-size: 3rem;
  font-weight: 700;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
  margin-bottom: 1rem;
}`}
            </Box>
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography
              variant='h6'
              sx={{
                color: 'white',
                mb: 2,
                fontWeight: 500,
              }}
            >
              Советы по дизайну
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography
                  variant='body2'
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    mb: 1,
                  }}
                >
                  • Используйте белый текст для лучшей читаемости
                </Typography>
                <Typography
                  variant='body2'
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    mb: 1,
                  }}
                >
                  • Добавляйте тени для контраста
                </Typography>
                <Typography
                  variant='body2'
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                  }}
                >
                  • Не перегружайте баннер элементами
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography
                  variant='body2'
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    mb: 1,
                  }}
                >
                  • Сохраняйте отступы от краев
                </Typography>
                <Typography
                  variant='body2'
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    mb: 1,
                  }}
                >
                  • Используйте брендовые цвета
                </Typography>
                <Typography
                  variant='body2'
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                  }}
                >
                  • Тестируйте на разных устройствах
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default BannersSection;
