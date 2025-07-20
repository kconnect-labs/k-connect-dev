import React from 'react';
import { Typography, Container, Paper, Divider, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SecurityIcon from '@mui/icons-material/Security';
import RuleIcon from '@mui/icons-material/Rule';

const PageContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(8),
  [theme.breakpoints.down('sm')]: {
    paddingTop: theme.spacing(2),
  },
}));

const RuleCard = styled(Paper)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
  },
}));

const RuleCardHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2),
  backgroundColor: 'rgba(208, 188, 255, 0.1)',
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  position: 'relative',
  display: 'inline-block',
  marginBottom: theme.spacing(2),
  fontWeight: 'bold',
  color: theme.palette.primary.main,
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -8,
    left: 0,
    width: '100%',
    height: 3,
    background: `linear-gradient(to right, ${theme.palette.primary.main}, transparent)`,
    borderRadius: 4,
  },
}));

const PrivacyPolicyPage = () => {
  return (
    <PageContainer maxWidth='lg'>
      <Paper
        elevation={0}
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'center',
          alignItems: 'center',
          gap: 3,
          p: 2,
          mb: 3,
          borderRadius: 2,
          background:
            'linear-gradient(90deg, rgba(255, 255, 255, 0.05) 0%, rgba(208, 188, 255, 0.1) 100%)',
          border: '1px solid rgba(208, 188, 255, 0.2)',
        }}
      >
        <Box
          component={RouterLink}
          to='/rules'
          sx={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            color: 'text.primary',
            fontWeight: 'medium',
            py: 0.5,
            px: 1.5,
            borderRadius: 1,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
            },
          }}
        >
          <RuleIcon sx={{ mr: 1, fontSize: 20 }} />
          <Typography variant='body2'>Правила сообщества</Typography>
        </Box>

        <Box
          component={RouterLink}
          to='/privacy-policy'
          sx={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            color: 'primary.main',
            fontWeight: 'medium',
            py: 0.5,
            px: 1.5,
            borderRadius: 1,
            backgroundColor: 'rgba(208, 188, 255, 0.15)',
            '&:hover': {
              backgroundColor: 'rgba(208, 188, 255, 0.25)',
            },
          }}
        >
          <SecurityIcon sx={{ mr: 1, fontSize: 20 }} />
          <Typography variant='body2'>Политика конфиденциальности</Typography>
        </Box>

        <Box
          component={RouterLink}
          to='/terms-of-service'
          sx={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            color: 'text.primary',
            fontWeight: 'medium',
            py: 0.5,
            px: 1.5,
            borderRadius: 1,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
            },
          }}
        >
          <AssignmentIcon sx={{ mr: 1, fontSize: 20 }} />
          <Typography variant='body2'>Условия использования</Typography>
        </Box>
      </Paper>

      <RuleCard>
        <RuleCardHeader>
          <SecurityIcon color='primary' fontSize='large' sx={{ mr: 2 }} />
          <SectionTitle variant='h5'>
            Политика конфиденциальности К-Коннект
          </SectionTitle>
        </RuleCardHeader>

        <Box sx={{ p: 3 }}>
          <Typography variant='body2' color='textSecondary' sx={{ mb: 2 }}>
            Последнее обновление: {new Date().toLocaleDateString()}
          </Typography>

          <Divider sx={{ mb: 3 }} />

          <Typography variant='body1' paragraph>
            К-Коннект уважает вашу конфиденциальность и стремится защитить ваши
            персональные данные. Эта политика конфиденциальности объясняет, как
            мы собираем, используем и защищаем вашу информацию.
          </Typography>

          <Typography
            variant='h6'
            sx={{ mt: 4, mb: 2, fontWeight: 'bold', color: 'primary.main' }}
          >
            1. Собираемая информация
          </Typography>

          <Typography variant='body1' paragraph>
            К-Коннект действует как платформа-посредник и собирает минимальную
            информацию, необходимую для функционирования сервиса:
          </Typography>

          <Box component='ul' sx={{ pl: 2 }}>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                <strong>Данные регистрации:</strong> никнейм, который
                пользователь выбирает самостоятельно (не является персональными
                данными).
              </Typography>
            </Box>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                <strong>Email адрес:</strong> используется исключительно для
                подтверждения регистрации и предотвращения создания ботов. Мы не
                используем email для рассылок или маркетинга.
              </Typography>
            </Box>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                <strong>Telegram ID:</strong> при регистрации через Telegram мы
                получаем только публичный Telegram ID и хеш для подтверждения
                подлинности аккаунта. Мы НЕ получаем username, аватар или другие
                данные Telegram.
              </Typography>
            </Box>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                <strong>Пользовательский контент:</strong> посты, комментарии,
                изображения, которые пользователи загружают добровольно и по
                своей инициативе.
              </Typography>
            </Box>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                <strong>Техническая информация:</strong> IP-адреса для
                обеспечения безопасности сессий и предотвращения
                злоупотреблений.
              </Typography>
            </Box>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                <strong>Данные активности:</strong> время последнего входа для
                технического обслуживания системы.
              </Typography>
            </Box>
          </Box>

          <Typography
            variant='h6'
            sx={{ mt: 4, mb: 2, fontWeight: 'bold', color: 'primary.main' }}
          >
            2. Использование информации
          </Typography>

          <Typography variant='body1' paragraph>
            К-Коннект использует собранную информацию исключительно для:
          </Typography>

          <Box component='ul' sx={{ pl: 2 }}>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                Обеспечения технического функционирования платформы.
              </Typography>
            </Box>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                Предотвращения злоупотреблений и обеспечения безопасности
                пользователей.
              </Typography>
            </Box>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                Подтверждения регистрации (email) и верификации Telegram
                аккаунтов.
              </Typography>
            </Box>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                Соблюдения требований законодательства при наличии
                соответствующих запросов.
              </Typography>
            </Box>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                <strong>К-Коннект НЕ использует данные для:</strong>{' '}
                таргетированной рекламы, продажи третьим лицам, создания
                профилей пользователей.
              </Typography>
            </Box>
          </Box>

          <Typography
            variant='h6'
            sx={{ mt: 4, mb: 2, fontWeight: 'bold', color: 'primary.main' }}
          >
            3. Использование контента для маркетинга
          </Typography>

          <Typography variant='body1' paragraph>
            К-Коннект может использовать публичный контент платформы (скриншоты,
            профили, посты) для маркетинговых целей:
          </Typography>

          <Box component='ul' sx={{ pl: 2 }}>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                <strong>Промо-материалы:</strong> создание рекламных роликов,
                постов, скриншотов для продвижения платформы.
              </Typography>
            </Box>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                <strong>Социальные сети:</strong> публикация контента в TikTok,
                и других платформах для привлечения новых пользователей.
              </Typography>
            </Box>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                <strong>Развлекательный контент:</strong> создание видео, мемов
                и развлекательных материалов на основе активности пользователей.
              </Typography>
            </Box>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                <strong>Ограничения:</strong> мы не используем приватные
                сообщения, личные данные или контент, помеченный как приватный.
              </Typography>
            </Box>
          </Box>

          <Typography variant='body1' paragraph>
            <strong>Согласие пользователя:</strong> Регистрируясь на платформе,
            пользователь соглашается с возможным использованием публичного
            контента для маркетинговых целей К-Коннект.
          </Typography>

          <Typography
            variant='h6'
            sx={{ mt: 4, mb: 2, fontWeight: 'bold', color: 'primary.main' }}
          >
            3. Защита информации
          </Typography>

          <Typography variant='body1' paragraph>
            К-Коннект принимает технические меры для защиты данных:
          </Typography>

          <Box component='ul' sx={{ pl: 2 }}>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                Шифрование данных при передаче (HTTPS).
              </Typography>
            </Box>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                Ограничение доступа к серверной инфраструктуре.
              </Typography>
            </Box>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                Регулярное обновление систем безопасности.
              </Typography>
            </Box>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                <strong>Важно:</strong> К-Коннект не гарантирует абсолютную
                безопасность данных, так как это технически невозможно.
              </Typography>
            </Box>
          </Box>

          <Typography
            variant='h6'
            sx={{ mt: 4, mb: 2, fontWeight: 'bold', color: 'primary.main' }}
          >
            4. Обмен информацией
          </Typography>

          <Typography variant='body1' paragraph>
            К-Коннект НЕ продает и НЕ передает персональные данные третьим
            лицам. Передача данных возможна только в следующих случаях:
          </Typography>

          <Box component='ul' sx={{ pl: 2 }}>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                По требованию уполномоченных органов в соответствии с
                законодательством РФ.
              </Typography>
            </Box>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                Для защиты прав и безопасности К-Коннект и других пользователей.
              </Typography>
            </Box>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                <strong>К-Коннект НЕ передает данные:</strong> рекламным сетям,
                аналитическим сервисам, маркетинговым компаниям.
              </Typography>
            </Box>
          </Box>

          <Typography
            variant='h6'
            sx={{ mt: 4, mb: 2, fontWeight: 'bold', color: 'primary.main' }}
          >
            5. Ответственность пользователей
          </Typography>

          <Typography variant='body1' paragraph>
            <strong>КРИТИЧЕСКИ ВАЖНО:</strong> К-Коннект действует как
            платформа-посредник. Пользователи несут полную ответственность за:
          </Typography>

          <Box component='ul' sx={{ pl: 2 }}>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                <strong>Контент:</strong> вся ответственность за загружаемые
                материалы лежит на пользователях.
              </Typography>
            </Box>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                <strong>Персональные данные:</strong> пользователи сами решают,
                какую информацию публиковать.
              </Typography>
            </Box>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                <strong>Соблюдение законов:</strong> пользователи обязаны
                соблюдать законодательство при публикации контента.
              </Typography>
            </Box>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                <strong>Авторские права:</strong> пользователи отвечают за
                соблюдение прав интеллектуальной собственности.
              </Typography>
            </Box>
          </Box>

          <Typography
            variant='h6'
            sx={{ mt: 4, mb: 2, fontWeight: 'bold', color: 'primary.main' }}
          >
            6. Ваши права
          </Typography>

          <Typography variant='body1' paragraph>
            Пользователи имеют право:
          </Typography>

          <Box component='ul' sx={{ pl: 2 }}>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                Удалить свой аккаунт и все связанные данные в любое время.
              </Typography>
            </Box>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                Запросить удаление конкретного контента, который они
                опубликовали.
              </Typography>
            </Box>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                Отозвать согласие на обработку данных, удалив аккаунт.
              </Typography>
            </Box>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                <strong>Ограничение:</strong> К-Коннект не может удалить
                контент, который был скопирован другими пользователями.
              </Typography>
            </Box>
          </Box>

          <Typography
            variant='h6'
            sx={{ mt: 4, mb: 2, fontWeight: 'bold', color: 'primary.main' }}
          >
            7. Cookies и отслеживание
          </Typography>

          <Typography variant='body1' paragraph>
            К-Коннект использует минимальное количество cookies только для:
          </Typography>

          <Box component='ul' sx={{ pl: 2 }}>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                Сохранения сессии пользователя (авторизация).
              </Typography>
            </Box>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                Базовой аналитики для улучшения работы платформы.
              </Typography>
            </Box>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                <strong>К-Коннект НЕ использует:</strong> трекинговые cookies,
                рекламные пиксели, аналитику третьих сторон.
              </Typography>
            </Box>
          </Box>

          <Typography
            variant='h6'
            sx={{ mt: 4, mb: 2, fontWeight: 'bold', color: 'primary.main' }}
          >
            8. Отказ от ответственности
          </Typography>

          <Typography variant='body1' paragraph>
            <strong>
              К-Коннект действует как платформа-посредник и не несет
              ответственности за:
            </strong>
          </Typography>

          <Box component='ul' sx={{ pl: 2 }}>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                Контент, опубликованный пользователями.
              </Typography>
            </Box>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                Нарушения авторских прав пользователями.
              </Typography>
            </Box>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                Персональные данные, которые пользователи добровольно публикуют.
              </Typography>
            </Box>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                Действия пользователей, нарушающие законодательство.
              </Typography>
            </Box>
          </Box>

          <Typography
            variant='h6'
            sx={{ mt: 4, mb: 2, fontWeight: 'bold', color: 'primary.main' }}
          >
            9. Изменения в политике
          </Typography>

          <Typography variant='body1' paragraph>
            К-Коннект может обновлять эту политику конфиденциальности.
            Пользователи будут уведомлены о существенных изменениях через
            платформу.
          </Typography>

          <Typography
            variant='h6'
            sx={{ mt: 4, mb: 2, fontWeight: 'bold', color: 'primary.main' }}
          >
            10. Контакты
          </Typography>

          <Typography variant='body1' paragraph>
            По вопросам политики конфиденциальности: verif@k-connect.ru
          </Typography>

          <Typography variant='body1' sx={{ mt: 4, fontStyle: 'italic' }}>
            Используя К-Коннект, вы подтверждаете, что понимаете роль платформы
            как посредника и принимаете полную ответственность за публикуемый
            контент.
          </Typography>
        </Box>
      </RuleCard>
    </PageContainer>
  );
};

export default PrivacyPolicyPage;
