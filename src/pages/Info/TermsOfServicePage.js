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

const TermsOfServicePage = () => {
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
          <AssignmentIcon sx={{ mr: 1, fontSize: 20 }} />
          <Typography variant='body2'>Условия использования</Typography>
        </Box>
      </Paper>

      <RuleCard>
        <RuleCardHeader>
          <AssignmentIcon color='primary' fontSize='large' sx={{ mr: 2 }} />
          <SectionTitle variant='h5'>
            Условия использования К-Коннект
          </SectionTitle>
        </RuleCardHeader>

        <Box sx={{ p: 3 }}>
          <Typography variant='body2' color='textSecondary' sx={{ mb: 2 }}>
            Последнее обновление: 07.06.2025
          </Typography>

          <Divider sx={{ mb: 3 }} />

          <Typography variant='body1' paragraph>
            Добро пожаловать в К-Коннект. Пожалуйста, внимательно прочитайте эти
            условия использования перед регистрацией аккаунта и использованием
            нашего сервиса. Регистрируясь или используя К-Коннект, вы
            соглашаетесь соблюдать эти условия.
          </Typography>

          <Typography
            variant='h6'
            sx={{ mt: 4, mb: 2, fontWeight: 'bold', color: 'primary.main' }}
          >
            1. Принятие условий
          </Typography>

          <Typography variant='body1' paragraph>
            Используя К-Коннект, вы соглашаетесь с настоящими Условиями
            использования, нашей Политикой конфиденциальности, Правилами
            сообщества и другими политиками, которые могут быть опубликованы на
            платформе. Если вы не согласны с любым из этих условий, пожалуйста,
            не используйте наш сервис.
          </Typography>

          <Typography
            variant='h6'
            sx={{ mt: 4, mb: 2, fontWeight: 'bold', color: 'primary.main' }}
          >
            2. Роль К-Коннект как платформы-посредника
          </Typography>

          <Typography variant='body1' paragraph>
            <strong>КРИТИЧЕСКИ ВАЖНО:</strong> К-Коннект действует исключительно
            как платформа-посредник, предоставляющая техническую инфраструктуру
            для обмена информацией между пользователями. К-Коннект:
          </Typography>

          <Box component='ul' sx={{ pl: 2 }}>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                <strong>НЕ создает, не редактирует и не контролирует</strong>{' '}
                контент, публикуемый пользователями.
              </Typography>
            </Box>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                <strong>НЕ несет ответственности</strong> за действия, контент
                или поведение пользователей.
              </Typography>
            </Box>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                <strong>НЕ является владельцем</strong> интеллектуальной
                собственности, публикуемой пользователями.
              </Typography>
            </Box>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                <strong>НЕ гарантирует</strong> точность, законность или
                качество пользовательского контента.
              </Typography>
            </Box>
          </Box>

          <Typography
            variant='h6'
            sx={{ mt: 4, mb: 2, fontWeight: 'bold', color: 'primary.main' }}
          >
            3. Регистрация и безопасность аккаунта
          </Typography>

          <Typography variant='body1' paragraph>
            Для использования всех функций К-Коннект вам нужно создать аккаунт.
            Вы соглашаетесь:
          </Typography>

          <Box component='ul' sx={{ pl: 2 }}>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                Предоставлять точную и актуальную информацию во время
                регистрации.
              </Typography>
            </Box>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                Сохранять конфиденциальность своего пароля и немедленно
                уведомлять нас о любом несанкционированном использовании вашего
                аккаунта.
              </Typography>
            </Box>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                Нести ответственность за все действия, происходящие под вашим
                аккаунтом.
              </Typography>
            </Box>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                Не создавать несколько аккаунтов без явного разрешения
                администрации.
              </Typography>
            </Box>
          </Box>

          <Typography
            variant='h6'
            sx={{ mt: 4, mb: 2, fontWeight: 'bold', color: 'primary.main' }}
          >
            4. Ответственность за контент
          </Typography>

          <Typography variant='body1' paragraph>
            <strong>ПОЛНАЯ ОТВЕТСТВЕННОСТЬ ПОЛЬЗОВАТЕЛЯ:</strong> Вы несете
            полную и исключительную ответственность за весь контент, который
            публикуете на К-Коннект:
          </Typography>

          <Box component='ul' sx={{ pl: 2 }}>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                <strong>Законность:</strong> Вы гарантируете, что ваш контент не
                нарушает законодательство РФ или страны вашего проживания.
              </Typography>
            </Box>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                <strong>Авторские права:</strong> Вы гарантируете, что владеете
                правами на публикуемый контент или имеете разрешение на его
                использование.
              </Typography>
            </Box>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                <strong>Персональные данные:</strong> Вы несете ответственность
                за публикацию персональных данных третьих лиц.
              </Typography>
            </Box>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                <strong>Ущерб:</strong> Вы соглашаетесь возместить любой ущерб,
                причиненный вашим контентом.
              </Typography>
            </Box>
          </Box>

          <Typography
            variant='h6'
            sx={{ mt: 4, mb: 2, fontWeight: 'bold', color: 'primary.main' }}
          >
            5. Правила контента
          </Typography>

          <Typography variant='body1' paragraph>
            Вы обязуетесь не публиковать и не распространять контент, который:
          </Typography>

          <Box component='ul' sx={{ pl: 2 }}>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                Нарушает чьи-либо права, включая права интеллектуальной
                собственности.
              </Typography>
            </Box>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                Является незаконным, оскорбительным, дискриминационным,
                угрожающим или враждебным.
              </Typography>
            </Box>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                Содержит спам, фишинг, вредоносное ПО и другие формы
                нежелательного контента.
              </Typography>
            </Box>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                Включает личную информацию других лиц без их согласия.
              </Typography>
            </Box>
          </Box>

          <Typography
            variant='h6'
            sx={{ mt: 4, mb: 2, fontWeight: 'bold', color: 'primary.main' }}
          >
            6. Интеллектуальная собственность
          </Typography>

          <Typography variant='body1' paragraph>
            <strong>Права пользователей:</strong> Публикуя контент, вы
            сохраняете все права на него. К-Коннект не претендует на владение
            вашим контентом.
          </Typography>

          <Typography variant='body1' paragraph>
            <strong>Лицензия платформе:</strong> Вы предоставляете К-Коннект
            неисключительную, бесплатную лицензию на использование,
            воспроизведение, модификацию и отображение вашего контента
            исключительно в рамках функционирования платформы.
          </Typography>

          <Typography variant='body1' paragraph>
            <strong>Маркетинговая лицензия:</strong> Публикуя контент на
            платформе, вы также предоставляете К-Коннект право использовать ваш
            публичный контент (скриншоты, профили, посты) для маркетинговых
            целей, включая:
          </Typography>

          <Box component='ul' sx={{ pl: 2 }}>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                Создание рекламных материалов и промо-роликов.
              </Typography>
            </Box>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                Публикацию в социальных сетях (TikTok, Instagram, YouTube) для
                продвижения платформы.
              </Typography>
            </Box>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                Создание развлекательного контента ("рофло" видео, мемы) на
                основе активности пользователей.
              </Typography>
            </Box>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                <strong>Ограничения:</strong> К-Коннект не использует приватные
                сообщения, личные данные или контент, помеченный как приватный.
              </Typography>
            </Box>
          </Box>

          <Typography variant='body1' paragraph>
            <strong>Права платформы:</strong> К-Коннект и весь контент,
            созданный самой платформой, защищены авторским правом.
          </Typography>

          <Typography
            variant='h6'
            sx={{ mt: 4, mb: 2, fontWeight: 'bold', color: 'primary.main' }}
          >
            7. Регистрация и верификация
          </Typography>

          <Typography variant='body1' paragraph>
            К-Коннект предлагает два способа регистрации:
          </Typography>

          <Box component='ul' sx={{ pl: 2 }}>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                <strong>Email регистрация:</strong> Email адрес используется
                исключительно для подтверждения регистрации и предотвращения
                создания ботов. Мы не используем email для рассылок или
                маркетинга.
              </Typography>
            </Box>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                <strong>Telegram регистрация:</strong> При регистрации через
                Telegram мы получаем только публичный Telegram ID и хеш для
                подтверждения подлинности аккаунта. Мы НЕ получаем username,
                аватар или другие данные Telegram.
              </Typography>
            </Box>
          </Box>

          <Typography variant='body1' paragraph>
            <strong>Верификация:</strong> Оба способа регистрации направлены на
            предотвращение создания фейковых аккаунтов и ботов. К-Коннект не
            собирает дополнительную персональную информацию.
          </Typography>

          <Typography
            variant='h6'
            sx={{ mt: 4, mb: 2, fontWeight: 'bold', color: 'primary.main' }}
          >
            8. Использование сервиса
          </Typography>

          <Typography variant='body1' paragraph>
            Вы соглашаетесь:
          </Typography>

          <Box component='ul' sx={{ pl: 2 }}>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                Использовать сервис только для законных целей и в соответствии с
                действующим законодательством.
              </Typography>
            </Box>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                Не пытаться получить несанкционированный доступ к любой части
                сервиса.
              </Typography>
            </Box>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                Не использовать автоматизированные скрипты или боты без нашего
                разрешения.
              </Typography>
            </Box>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                Не нарушать работу сервиса или сетей, связанных с сервисом.
              </Typography>
            </Box>
          </Box>

          <Typography
            variant='h6'
            sx={{ mt: 4, mb: 2, fontWeight: 'bold', color: 'primary.main' }}
          >
            9. Полный отказ от ответственности
          </Typography>

          <Typography variant='body1' paragraph>
            <strong>К-Коннект НЕ несет ответственности за:</strong>
          </Typography>

          <Box component='ul' sx={{ pl: 2 }}>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                <strong>
                  Любые прямые, косвенные, случайные или штрафные убытки
                </strong>
                , связанные с использованием платформы.
              </Typography>
            </Box>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                <strong>Любые действия или контент</strong>, опубликованный
                третьими лицами (пользователями).
              </Typography>
            </Box>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                <strong>Перебои в работе сервиса</strong> или потерю данных по
                техническим причинам.
              </Typography>
            </Box>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                <strong>Нарушения авторских прав</strong> или интеллектуальной
                собственности пользователями.
              </Typography>
            </Box>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                <strong>Персональные данные</strong>, которые пользователи
                добровольно публикуют.
              </Typography>
            </Box>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                <strong>Юридические последствия</strong> публикации незаконного
                контента пользователями.
              </Typography>
            </Box>
          </Box>

          <Typography variant='body1' paragraph>
            <strong>Ограничение ответственности:</strong> В максимальной
            степени, разрешенной законом, общая ответственность К-Коннект
            ограничена суммой, уплаченной пользователем за использование сервиса
            в течение последних 12 месяцев.
          </Typography>

          <Typography
            variant='h6'
            sx={{ mt: 4, mb: 2, fontWeight: 'bold', color: 'primary.main' }}
          >
            10. Прекращение использования
          </Typography>

          <Typography variant='body1' paragraph>
            Мы имеем право:
          </Typography>

          <Box component='ul' sx={{ pl: 2 }}>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                Приостановить или удалить ваш аккаунт, если вы нарушаете наши
                условия.
              </Typography>
            </Box>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                Удалить любой контент, нарушающий наши правила.
              </Typography>
            </Box>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                Прекратить предоставление сервиса или его частей по нашему
                усмотрению с предварительным уведомлением.
              </Typography>
            </Box>
          </Box>

          <Typography
            variant='h6'
            sx={{ mt: 4, mb: 2, fontWeight: 'bold', color: 'primary.main' }}
          >
            11. Возмещение ущерба
          </Typography>

          <Typography variant='body1' paragraph>
            Вы соглашаетесь защищать, возмещать ущерб и ограждать К-Коннект от
            любых претензий, убытков, обязательств, расходов и издержек (включая
            судебные издержки), возникающих в связи с:
          </Typography>

          <Box component='ul' sx={{ pl: 2 }}>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                Вашим использованием платформы.
              </Typography>
            </Box>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                Контентом, который вы публикуете.
              </Typography>
            </Box>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                Нарушением вами настоящих условий.
              </Typography>
            </Box>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                Нарушением вами прав третьих лиц.
              </Typography>
            </Box>
          </Box>

          <Typography
            variant='h6'
            sx={{ mt: 4, mb: 2, fontWeight: 'bold', color: 'primary.main' }}
          >
            12. Изменения условий
          </Typography>

          <Typography variant='body1' paragraph>
            Мы можем изменять эти условия время от времени. Мы уведомим вас о
            существенных изменениях через сервис К-Коннект. Продолжая
            использовать сервис после таких изменений, вы соглашаетесь с новыми
            условиями.
          </Typography>

          <Typography
            variant='h6'
            sx={{ mt: 4, mb: 2, fontWeight: 'bold', color: 'primary.main' }}
          >
            13. Применимое право
          </Typography>

          <Typography variant='body1' paragraph>
            Настоящие условия регулируются и толкуются в соответствии с
            законодательством Российской Федерации, без учета принципов
            коллизионного права.
          </Typography>

          <Typography
            variant='h6'
            sx={{ mt: 4, mb: 2, fontWeight: 'bold', color: 'primary.main' }}
          >
            14. Возрастные ограничения
          </Typography>

          <Typography variant='body1' paragraph>
            Регистрация разрешена с 12 лет (или 16 лет, в зависимости от
            законодательства вашей страны). Пользователи младше 18 лет не имеют
            доступа к контенту с маркировкой 18+.
          </Typography>

          <Typography variant='body1' paragraph>
            <strong>Ответственность родителей:</strong> Родители или опекуны
            несовершеннолетних пользователей несут ответственность за их
            действия на платформе.
          </Typography>

          <Typography
            variant='h6'
            sx={{ mt: 4, mb: 2, fontWeight: 'bold', color: 'primary.main' }}
          >
            15. Автоматическая модерация
          </Typography>

          <Typography variant='body1' paragraph>
            К-Коннект использует автоматические системы модерации для выявления
            потенциально нарушающего правила контента:
          </Typography>

          <Box component='ul' sx={{ pl: 2 }}>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                <strong>Автоматическое удаление:</strong> Система может
                автоматически удалять контент, который нарушает правила.
              </Typography>
            </Box>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                <strong>Временные блокировки:</strong> Автоматические санкции
                могут применяться без предварительного уведомления.
              </Typography>
            </Box>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                <strong>Ошибки системы:</strong> К-Коннект не несет
                ответственности за ложные срабатывания автоматической модерации.
              </Typography>
            </Box>
          </Box>

          <Typography
            variant='h6'
            sx={{ mt: 4, mb: 2, fontWeight: 'bold', color: 'primary.main' }}
          >
            16. Технические ограничения
          </Typography>

          <Typography variant='body1' paragraph>
            К-Коннект оставляет за собой право:
          </Typography>

          <Box component='ul' sx={{ pl: 2 }}>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                Ограничивать доступ к определенным функциям платформы.
              </Typography>
            </Box>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                Изменять технические требования и интерфейс без предварительного
                уведомления.
              </Typography>
            </Box>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                Приостанавливать работу сервиса для технического обслуживания.
              </Typography>
            </Box>
            <Box component='li' sx={{ mb: 1 }}>
              <Typography variant='body1'>
                Ограничивать объем загружаемого контента или количество постов.
              </Typography>
            </Box>
          </Box>

          <Typography variant='body1' sx={{ mt: 4, fontStyle: 'italic' }}>
            Используя К-Коннект, вы подтверждаете, что прочитали, поняли и
            соглашаетесь с этими Условиями использования, а также принимаете
            полную ответственность за публикуемый контент и понимаете роль
            К-Коннект как платформы-посредника.
          </Typography>
        </Box>
      </RuleCard>
    </PageContainer>
  );
};

export default TermsOfServicePage;
