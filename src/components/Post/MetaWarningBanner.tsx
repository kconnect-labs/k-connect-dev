import React from 'react';
import { Box, Typography } from '@mui/material';

interface MetaWarningBannerProps {
  content: string;
}

const MetaWarningBanner: React.FC<MetaWarningBannerProps> = ({ content }) => {
  // Список социальных сетей Meta для проверки
  const metaPlatforms = [
    { name: 'Facebook', keywords: ['facebook', 'фейсбук'] },
    { name: 'Instagram', keywords: ['instagram', 'инстаграм', 'инста'] },
    { name: 'WhatsApp', keywords: ['whatsapp', 'вотсап', 'вайбер'] },
    { name: 'Meta', keywords: ['meta', 'мета'] }
  ];

  // Проверяем, какие платформы упоминаются в контенте
  const mentionedPlatforms = metaPlatforms.filter(platform =>
    platform.keywords.some(keyword =>
      content.toLowerCase().includes(keyword.toLowerCase())
    )
  );

  // Если нет упоминаний, не показываем баннер
  if (mentionedPlatforms.length === 0) {
    return null;
  }

  // Формируем текст предупреждения
  const getWarningText = () => {
    if (mentionedPlatforms.length === 1) {
      const platform = mentionedPlatforms[0];
      if (platform.name === 'Meta') {
        return 'Meta (признана в России экстремистской и запрещена)';
      } else {
        return `${platform.name} (принадлежит компании Meta, признанной в России экстремистской и запрещённой)`;
      }
    } else {
      const platformNames = mentionedPlatforms.map(p => p.name).join(', ');
      return `Все упомянутые социальные сети ${platformNames} принадлежат компании Meta, признанной в России экстремистской и запрещённой.`;
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '8px',
        mt: 1,
        mb: 1,
        overflow: 'hidden'
      }}
    >
      <Typography
        sx={{
          fontSize: '0.75rem',
          lineHeight: 1.4,
          color: 'rgba(255, 255, 255, 0.8)',
          whiteSpace: 'pre-line',
          p: 1.5
        }}
      >
        {getWarningText()}
      </Typography>
    </Box>
  );
};

export default MetaWarningBanner; 