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
} from '@mui/icons-material';

const IconsSection: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const iconFiles = [
    {
      name: 'Icon SVG Background',
      filename: 'IconSVGBackground.svg',
      description: 'SVG иконка с градиентным фоном',
      type: 'SVG',
      size: '2.1KB',
    },
    {
      name: 'Icon 192px',
      filename: 'icon192.png',
      description: 'PNG иконка 192x192px',
      type: 'PNG',
      size: '37KB',
    },
    {
      name: 'Icon 192px Dark',
      filename: 'icon192d.png',
      description: 'PNG иконка 192x192px (темная)',
      type: 'PNG',
      size: '34KB',
    },
    {
      name: 'Icon 512px',
      filename: 'icon-512.png',
      description: 'PNG иконка 512x512px',
      type: 'PNG',
      size: '216KB',
    },
    {
      name: 'Icon 512px Dark',
      filename: 'icon-512d.png',
      description: 'PNG иконка 512x512px (темная)',
      type: 'PNG',
      size: '202KB',
    },
    {
      name: 'Icon 180px',
      filename: 'icon-180.png',
      description: 'PNG иконка 180x180px',
      type: 'PNG',
      size: '33KB',
    },
    {
      name: 'Icon 180px Dark',
      filename: 'icon-180d.png',
      description: 'PNG иконка 180x180px (темная)',
      type: 'PNG',
      size: '31KB',
    },
    {
      name: 'Icon 167px',
      filename: 'icon-167.png',
      description: 'PNG иконка 167x167px',
      type: 'PNG',
      size: '29KB',
    },
    {
      name: 'Icon 167px Dark',
      filename: 'icon-167d.png',
      description: 'PNG иконка 167x167px (темная)',
      type: 'PNG',
      size: '27KB',
    },
    {
      name: 'Icon 152px',
      filename: 'icon-152.png',
      description: 'PNG иконка 152x152px',
      type: 'PNG',
      size: '25KB',
    },
    {
      name: 'Icon 152px Dark',
      filename: 'icon-152d.png',
      description: 'PNG иконка 152x152px (темная)',
      type: 'PNG',
      size: '23KB',
    },
    {
      name: 'Icon Maskable',
      filename: 'icon-maskable.png',
      description: 'PNG иконка с маской для PWA',
      type: 'PNG',
      size: '477KB',
    },
    {
      name: 'Icon Small',
      filename: 'icon.png',
      description: 'PNG иконка малого размера',
      type: 'PNG',
      size: '4.6KB',
    },
    {
      name: 'Logo No Background',
      filename: 'logoNoBackground.png',
      description: 'PNG логотип без фона',
      type: 'PNG',
      size: '9.0KB',
    },
    {
      name: 'Logo No Background SVG',
      filename: 'logoNoBackground.svg',
      description: 'SVG логотип без фона',
      type: 'SVG',
      size: '1.0KB',
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

  const IconCard: React.FC<{
    name: string;
    filename: string;
    description: string;
    type: string;
    size: string;
  }> = ({ name, filename, description, type, size }) => (
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
            height: '120px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            borderRadius: 'var(--main-border-radius)',
            mb: 2,
            border: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          <img
            src={`/static/Brand/${filename}`}
            alt={name}
            style={{
              maxWidth: '80px',
              maxHeight: '80px',
              objectFit: 'contain',
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
        </Box>

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
        Иконки и логотипы
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
        Полная коллекция иконок и логотипов К-Коннект в различных форматах и
        размерах. Все файлы доступны для скачивания.
      </Typography>

      {/* Icons Grid */}
      <Grid container spacing={3}>
        {iconFiles.map((icon, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
            <IconCard {...icon} />
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
            Рекомендации по использованию
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
                  Размеры иконок
                </Typography>
                <Typography
                  variant='body2'
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    mb: 2,
                  }}
                >
                  • 192px - для веб-приложений и PWA
                </Typography>
                <Typography
                  variant='body2'
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    mb: 2,
                  }}
                >
                  • 512px - для высокого разрешения
                </Typography>
                <Typography
                  variant='body2'
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    mb: 2,
                  }}
                >
                  • 180px, 167px, 152px - для мобильных устройств
                </Typography>
                <Typography
                  variant='body2'
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                  }}
                >
                  • icon-maskable.png - для PWA с адаптивными иконками
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
                  Форматы файлов
                </Typography>
                <Typography
                  variant='body2'
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    mb: 2,
                  }}
                >
                  • SVG - для веб-разработки (масштабируемые)
                </Typography>
                <Typography
                  variant='body2'
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    mb: 2,
                  }}
                >
                  • PNG - для приложений и веб-сайтов
                </Typography>
                <Typography
                  variant='body2'
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    mb: 2,
                  }}
                >
                  • Темные версии (d) - для темных тем
                </Typography>
                <Typography
                  variant='body2'
                  sx={{
                    color: 'rgba(255, 255, 255, 0.8)',
                  }}
                >
                  • logoNoBackground - для наложения на любой фон
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
              HTML пример использования
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
              {`<!-- PWA manifest -->
<link rel="icon" type="image/png" sizes="192x192" href="/static/Brand/icon192.png">
<link rel="icon" type="image/png" sizes="512x512" href="/static/Brand/icon-512.png">
<link rel="apple-touch-icon" href="/static/Brand/icon-180.png">

<!-- SVG для веб -->
<img src="/static/Brand/IconSVGBackground.svg" alt="К-Коннект Logo">

<!-- Логотип без фона -->
<img src="/static/Brand/logoNoBackground.png" alt="К-Коннект Logo">`}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default IconsSection;
