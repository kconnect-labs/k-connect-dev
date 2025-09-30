import React from 'react';
import { Typography, Container, Paper, Divider, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SecurityIcon from '@mui/icons-material/Security';
import RuleIcon from '@mui/icons-material/Rule';
import InfoBlock from '../../UIKIT/InfoBlock';

const PageContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(4),
  paddingLeft: '0 !important',
  paddingRight: '0 !important',
  [theme.breakpoints.down('sm')]: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(2),
  },
}));

const RuleCard = styled(Paper)(({ theme }) => ({
  marginBottom: '5px',
  borderRadius: 'var(--small-border-radius)',
  overflow: 'hidden',
  background: 'var(--theme-background, rgba(255, 255, 255, 0.03))',
  backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
  border: '1px solid rgba(0, 0, 0, 0.12)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
  [theme.breakpoints.down('sm')]: {
    borderRadius: 'var(--main-border-radius)',
    margin: '0 0 5px 0',
  },
}));

const RuleCardHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2),
  backgroundColor: 'rgba(208, 188, 255, 0.1)',
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1.5),
    flexDirection: 'column',
    textAlign: 'center',
    gap: theme.spacing(1),
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  fontWeight: 'bold',
  color: '#d0bcff',
  fontSize: '1.5rem',
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.25rem',
    marginBottom: theme.spacing(1),
  },
}));

const NavigationBar = styled(Paper)(({ theme }) => ({
  display: 'flex',
  flexDirection: { xs: 'column', sm: 'row' },
  justifyContent: 'center',
  alignItems: 'center',
  gap: 3,
  padding: theme.spacing(2),
  marginBottom: '5px',
  borderRadius: 'var(--small-border-radius)',
  background: 'var(--theme-background, rgba(255, 255, 255, 0.03))',
  backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
  border: '1px solid rgba(0, 0, 0, 0.12)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
  [theme.breakpoints.down('sm')]: {
    margin: '0 0 5px 0',
    borderRadius: 'var(--main-border-radius)',
    padding: theme.spacing(1),
    gap: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
}));

const NavLink = styled(Box)(({ theme, active }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textDecoration: 'none',
  color: active ? '#d0bcff' : 'rgba(255, 255, 255, 0.8)',
  fontWeight: 'medium',
  padding: theme.spacing(1, 2),
  borderRadius: 'var(--small-border-radius)',
  backgroundColor: active ? 'rgba(208, 188, 255, 0.15)' : 'transparent',
  transition: 'all 0.2s ease',
  minWidth: 'fit-content',
  whiteSpace: 'nowrap',
  '&:hover': {
    backgroundColor: active ? 'rgba(208, 188, 255, 0.25)' : 'rgba(255, 255, 255, 0.05)',
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(0.5, 1),
    fontSize: '0.8rem',
    width: 'auto',
    minWidth: 'auto',
    flex: 1,
    justifyContent: 'center',
    whiteSpace: 'normal',
    textAlign: 'center',
  },
}));

const ContentSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const StyledTypography = styled(Typography)(({ theme }) => ({
  color: 'rgba(255, 255, 255, 0.9)',
  lineHeight: 1.6,
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.875rem',
  },
}));

const StyledList = styled(Box)(({ theme }) => ({
  paddingLeft: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    paddingLeft: theme.spacing(1.5),
  },
}));

const StyledListItem = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  [theme.breakpoints.down('sm')]: {
    marginBottom: theme.spacing(0.75),
  },
}));

const PrivacyPolicyPage = () => {
  return (
    <PageContainer maxWidth='lg'>
      <NavigationBar elevation={0}>
        <NavLink component={RouterLink} to='/rules'>
          <RuleIcon sx={{ mr: 1, fontSize: 20 }} />
          <Typography variant='body2'>Правила сообщества</Typography>
        </NavLink>

        <NavLink component={RouterLink} to='/privacy-policy' active={true}>
          <SecurityIcon sx={{ mr: 1, fontSize: 20 }} />
          <Typography variant='body2'>Политика конфиденциальности</Typography>
        </NavLink>

        <NavLink component={RouterLink} to='/terms-of-service'>
          <AssignmentIcon sx={{ mr: 1, fontSize: 20 }} />
          <Typography variant='body2'>Условия использования</Typography>
        </NavLink>
      </NavigationBar>

      <InfoBlock
        title="Политика конфиденциальности К-Коннект"
        description="Как мы собираем, используем и защищаем вашу информацию"
        customStyle
      >
        <ContentSection>
          <StyledTypography variant='body2' sx={{ mb: 2, opacity: 0.7 }}>
            Последнее обновление: {new Date().toLocaleDateString()}
          </StyledTypography>

          <Divider sx={{ mb: 3, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

          <StyledTypography variant='body1' paragraph>
            К-Коннект уважает вашу конфиденциальность и стремится защитить ваши
            персональные данные. Эта политика конфиденциальности объясняет, как
            мы собираем, используем и защищаем вашу информацию.
          </StyledTypography>

          <Typography
            variant='h6'
            sx={{ 
              mt: 4, 
              mb: 2, 
              fontWeight: 'bold', 
              color: '#d0bcff',
              fontSize: { xs: '1.1rem', sm: '1.25rem' }
            }}
          >
            1. Собираемая информация
          </Typography>

          <StyledTypography variant='body1' paragraph>
            К-Коннект действует как платформа-посредник и собирает минимальную
            информацию, необходимую для функционирования сервиса:
          </StyledTypography>

          <StyledList component='ul'>
            <StyledListItem component='li'>
              <StyledTypography variant='body1'>
                <strong>Данные регистрации:</strong> никнейм, который
                пользователь выбирает самостоятельно (не является персональными
                данными).
              </StyledTypography>
            </StyledListItem>
            <StyledListItem component='li'>
              <StyledTypography variant='body1'>
                <strong>Email адрес:</strong> используется исключительно для
                подтверждения регистрации и предотвращения создания ботов. Мы не
                используем email для рассылок или маркетинга.
              </StyledTypography>
            </StyledListItem>
            <StyledListItem component='li'>
              <StyledTypography variant='body1'>
                <strong>Telegram ID:</strong> при регистрации через Telegram мы
                получаем только публичный Telegram ID и хеш для подтверждения
                подлинности аккаунта. Мы НЕ получаем username, аватар или другие
                данные Telegram.
              </StyledTypography>
            </StyledListItem>
            <StyledListItem component='li'>
              <StyledTypography variant='body1'>
                <strong>Пользовательский контент:</strong> посты, комментарии,
                изображения, которые пользователи загружают добровольно и по
                своей инициативе.
              </StyledTypography>
            </StyledListItem>
            <StyledListItem component='li'>
              <StyledTypography variant='body1'>
                <strong>Техническая информация:</strong> IP-адреса для
                обеспечения безопасности сессий и предотвращения
                злоупотреблений.
              </StyledTypography>
            </StyledListItem>
            <StyledListItem component='li'>
              <StyledTypography variant='body1'>
                <strong>Данные активности:</strong> время последнего входа для
                технического обслуживания системы.
              </StyledTypography>
            </StyledListItem>
          </StyledList>

          <Typography
            variant='h6'
            sx={{ 
              mt: 4, 
              mb: 2, 
              fontWeight: 'bold', 
              color: '#d0bcff',
              fontSize: { xs: '1.1rem', sm: '1.25rem' }
            }}
          >
            2. Использование информации
          </Typography>

          <StyledTypography variant='body1' paragraph>
            К-Коннект использует собранную информацию исключительно для:
          </StyledTypography>

          <StyledList component='ul'>
            <StyledListItem component='li'>
              <StyledTypography variant='body1'>
                Обеспечения технического функционирования платформы.
              </StyledTypography>
            </StyledListItem>
            <StyledListItem component='li'>
              <StyledTypography variant='body1'>
                Предотвращения злоупотреблений и обеспечения безопасности
                пользователей.
              </StyledTypography>
            </StyledListItem>
            <StyledListItem component='li'>
              <StyledTypography variant='body1'>
                Подтверждения регистрации (email) и верификации Telegram
                аккаунтов.
              </StyledTypography>
            </StyledListItem>
            <StyledListItem component='li'>
              <StyledTypography variant='body1'>
                Соблюдения требований законодательства при наличии
                соответствующих запросов.
              </StyledTypography>
            </StyledListItem>
            <StyledListItem component='li'>
              <StyledTypography variant='body1'>
                <strong>К-Коннект НЕ использует данные для:</strong>{' '}
                таргетированной рекламы, продажи третьим лицам, создания
                профилей пользователей.
              </StyledTypography>
            </StyledListItem>
          </StyledList>

          <Typography
            variant='h6'
            sx={{ 
              mt: 4, 
              mb: 2, 
              fontWeight: 'bold', 
              color: '#d0bcff',
              fontSize: { xs: '1.1rem', sm: '1.25rem' }
            }}
          >
            3. Использование контента для маркетинга
          </Typography>

          <StyledTypography variant='body1' paragraph>
            К-Коннект может использовать публичный контент платформы (скриншоты,
            профили, посты) для маркетинговых целей:
          </StyledTypography>

          <StyledList component='ul'>
            <StyledListItem component='li'>
              <StyledTypography variant='body1'>
                <strong>Промо-материалы:</strong> создание рекламных роликов,
                постов, скриншотов для продвижения платформы.
              </StyledTypography>
            </StyledListItem>
            <StyledListItem component='li'>
              <StyledTypography variant='body1'>
                <strong>Социальные сети:</strong> публикация контента в TikTok,
                и других платформах для привлечения новых пользователей.
              </StyledTypography>
            </StyledListItem>
            <StyledListItem component='li'>
              <StyledTypography variant='body1'>
                <strong>Развлекательный контент:</strong> создание видео, мемов
                и развлекательных материалов на основе активности пользователей.
              </StyledTypography>
            </StyledListItem>
            <StyledListItem component='li'>
              <StyledTypography variant='body1'>
                <strong>Ограничения:</strong> мы не используем приватные
                сообщения, личные данные или контент, помеченный как приватный.
              </StyledTypography>
            </StyledListItem>
          </StyledList>

          <StyledTypography variant='body1' paragraph>
            <strong>Согласие пользователя:</strong> Регистрируясь на платформе,
            пользователь соглашается с возможным использованием публичного
            контента для маркетинговых целей К-Коннект.
          </StyledTypography>

          <Typography
            variant='h6'
            sx={{ 
              mt: 4, 
              mb: 2, 
              fontWeight: 'bold', 
              color: '#d0bcff',
              fontSize: { xs: '1.1rem', sm: '1.25rem' }
            }}
          >
            4. Защита информации
          </Typography>

          <StyledTypography variant='body1' paragraph>
            К-Коннект принимает технические меры для защиты данных:
          </StyledTypography>

          <StyledList component='ul'>
            <StyledListItem component='li'>
              <StyledTypography variant='body1'>
                Шифрование данных при передаче (HTTPS).
              </StyledTypography>
            </StyledListItem>
            <StyledListItem component='li'>
              <StyledTypography variant='body1'>
                Ограничение доступа к серверной инфраструктуре.
              </StyledTypography>
            </StyledListItem>
            <StyledListItem component='li'>
              <StyledTypography variant='body1'>
                Регулярное обновление систем безопасности.
              </StyledTypography>
            </StyledListItem>
            <StyledListItem component='li'>
              <StyledTypography variant='body1'>
                <strong>Важно:</strong> К-Коннект не гарантирует абсолютную
                безопасность данных, так как это технически невозможно.
              </StyledTypography>
            </StyledListItem>
          </StyledList>

          <Typography
            variant='h6'
            sx={{ 
              mt: 4, 
              mb: 2, 
              fontWeight: 'bold', 
              color: '#d0bcff',
              fontSize: { xs: '1.1rem', sm: '1.25rem' }
            }}
          >
            5. Обмен информацией
          </Typography>

          <StyledTypography variant='body1' paragraph>
            К-Коннект НЕ продает и НЕ передает персональные данные третьим
            лицам. Передача данных возможна только в следующих случаях:
          </StyledTypography>

          <StyledList component='ul'>
            <StyledListItem component='li'>
              <StyledTypography variant='body1'>
                По требованию уполномоченных органов в соответствии с
                законодательством РФ.
              </StyledTypography>
            </StyledListItem>
            <StyledListItem component='li'>
              <StyledTypography variant='body1'>
                Для защиты прав и безопасности К-Коннект и других пользователей.
              </StyledTypography>
            </StyledListItem>
            <StyledListItem component='li'>
              <StyledTypography variant='body1'>
                <strong>К-Коннект НЕ передает данные:</strong> рекламным сетям,
                аналитическим сервисам, маркетинговым компаниям.
              </StyledTypography>
            </StyledListItem>
          </StyledList>

          <Typography
            variant='h6'
            sx={{ 
              mt: 4, 
              mb: 2, 
              fontWeight: 'bold', 
              color: '#d0bcff',
              fontSize: { xs: '1.1rem', sm: '1.25rem' }
            }}
          >
            6. Ответственность пользователей
          </Typography>

          <StyledTypography variant='body1' paragraph>
            <strong>КРИТИЧЕСКИ ВАЖНО:</strong> К-Коннект действует как
            платформа-посредник. Пользователи несут полную ответственность за:
          </StyledTypography>

          <StyledList component='ul'>
            <StyledListItem component='li'>
              <StyledTypography variant='body1'>
                <strong>Контент:</strong> вся ответственность за загружаемые
                материалы лежит на пользователях.
              </StyledTypography>
            </StyledListItem>
            <StyledListItem component='li'>
              <StyledTypography variant='body1'>
                <strong>Персональные данные:</strong> пользователи сами решают,
                какую информацию публиковать.
              </StyledTypography>
            </StyledListItem>
            <StyledListItem component='li'>
              <StyledTypography variant='body1'>
                <strong>Соблюдение законов:</strong> пользователи обязаны
                соблюдать законодательство при публикации контента.
              </StyledTypography>
            </StyledListItem>
            <StyledListItem component='li'>
              <StyledTypography variant='body1'>
                <strong>Авторские права:</strong> пользователи отвечают за
                соблюдение прав интеллектуальной собственности.
              </StyledTypography>
            </StyledListItem>
          </StyledList>

          <Typography
            variant='h6'
            sx={{ 
              mt: 4, 
              mb: 2, 
              fontWeight: 'bold', 
              color: '#d0bcff',
              fontSize: { xs: '1.1rem', sm: '1.25rem' }
            }}
          >
            7. Ваши права
          </Typography>

          <StyledTypography variant='body1' paragraph>
            Пользователи имеют право:
          </StyledTypography>

          <StyledList component='ul'>
            <StyledListItem component='li'>
              <StyledTypography variant='body1'>
                Удалить свой аккаунт и все связанные данные в любое время.
              </StyledTypography>
            </StyledListItem>
            <StyledListItem component='li'>
              <StyledTypography variant='body1'>
                Запросить удаление конкретного контента, который они
                опубликовали.
              </StyledTypography>
            </StyledListItem>
            <StyledListItem component='li'>
              <StyledTypography variant='body1'>
                Отозвать согласие на обработку данных, удалив аккаунт.
              </StyledTypography>
            </StyledListItem>
            <StyledListItem component='li'>
              <StyledTypography variant='body1'>
                <strong>Ограничение:</strong> К-Коннект не может удалить
                контент, который был скопирован другими пользователями.
              </StyledTypography>
            </StyledListItem>
          </StyledList>

          <Typography
            variant='h6'
            sx={{ 
              mt: 4, 
              mb: 2, 
              fontWeight: 'bold', 
              color: '#d0bcff',
              fontSize: { xs: '1.1rem', sm: '1.25rem' }
            }}
          >
            8. Cookies и отслеживание
          </Typography>

          <StyledTypography variant='body1' paragraph>
            К-Коннект использует минимальное количество cookies только для:
          </StyledTypography>

          <StyledList component='ul'>
            <StyledListItem component='li'>
              <StyledTypography variant='body1'>
                Сохранения сессии пользователя (авторизация).
              </StyledTypography>
            </StyledListItem>
            <StyledListItem component='li'>
              <StyledTypography variant='body1'>
                Базовой аналитики для улучшения работы платформы.
              </StyledTypography>
            </StyledListItem>
            <StyledListItem component='li'>
              <StyledTypography variant='body1'>
                <strong>К-Коннект НЕ использует:</strong> трекинговые cookies,
                рекламные пиксели, аналитику третьих сторон.
              </StyledTypography>
            </StyledListItem>
          </StyledList>

          <Typography
            variant='h6'
            sx={{ 
              mt: 4, 
              mb: 2, 
              fontWeight: 'bold', 
              color: '#d0bcff',
              fontSize: { xs: '1.1rem', sm: '1.25rem' }
            }}
          >
            9. Обработка данных при пожертвованиях
          </Typography>

          <StyledTypography variant='body1' paragraph>
            <strong>Благотворительные взносы:</strong> При совершении добровольных
            пожертвований на поддержку К-Коннект обрабатываются следующие данные:
          </StyledTypography>

          <StyledList component='ul'>
            <StyledListItem component='li'>
              <StyledTypography variant='body1'>
                <strong>Данные платежей:</strong> Сумма, дата и время
                пожертвования для учета поощрений и бонусов.
              </StyledTypography>
            </StyledListItem>
            <StyledListItem component='li'>
              <StyledTypography variant='body1'>
                <strong>Идентификация донатора:</strong> Привязка пожертвования к
                аккаунту пользователя для предоставления соответствующих поощрений.
              </StyledTypography>
            </StyledListItem>
            <StyledListItem component='li'>
              <StyledTypography variant='body1'>
                <strong>Статистика использования:</strong> Учет активности
                использования предоставленных баллов и привилегий.
              </StyledTypography>
            </StyledListItem>
            <StyledListItem component='li'>
              <StyledTypography variant='body1'>
                <strong>Платежные данные:</strong> К-Коннект НЕ хранит данные
                банковских карт. Вся обработка платежей осуществляется сторонними
                лицензированными платежными системами.
              </StyledTypography>
            </StyledListItem>
          </StyledList>

          <StyledTypography variant='body1' paragraph>
            <strong>Цель обработки:</strong> Данные используются исключительно для
            предоставления поощрений донаторам и ведения внутренней отчетности о
            поддержке платформы.
          </StyledTypography>

          <Typography
            variant='h6'
            sx={{ 
              mt: 4, 
              mb: 2, 
              fontWeight: 'bold', 
              color: '#d0bcff',
              fontSize: { xs: '1.1rem', sm: '1.25rem' }
            }}
          >
            10. Финансовая конфиденциальность
          </Typography>

          <StyledTypography variant='body1' paragraph>
            К-Коннект обеспечивает конфиденциальность финансовых операций:
          </StyledTypography>

          <StyledList component='ul'>
            <StyledListItem component='li'>
              <StyledTypography variant='body1'>
                <strong>Неразглашение сумм:</strong> Размеры пожертвований
                пользователей не разглашаются третьим лицам.
              </StyledTypography>
            </StyledListItem>
            <StyledListItem component='li'>
              <StyledTypography variant='body1'>
                <strong>Публичные поощрения:</strong> Могут отображаться только
                статусы и достижения, но не конкретные суммы поддержки.
              </StyledTypography>
            </StyledListItem>
            <StyledListItem component='li'>
              <StyledTypography variant='body1'>
                <strong>Отчетность:</strong> Финансовые данные передаются только
                налоговым органам в соответствии с законодательством РФ.
              </StyledTypography>
            </StyledListItem>
          </StyledList>

          <Typography
            variant='h6'
            sx={{ 
              mt: 4, 
              mb: 2, 
              fontWeight: 'bold', 
              color: '#d0bcff',
              fontSize: { xs: '1.1rem', sm: '1.25rem' }
            }}
          >
            11. Отказ от ответственности
          </Typography>

          <StyledTypography variant='body1' paragraph>
            <strong>
              К-Коннект действует как платформа-посредник и не несет
              ответственности за:
            </strong>
          </StyledTypography>

          <StyledList component='ul'>
            <StyledListItem component='li'>
              <StyledTypography variant='body1'>
                Контент, опубликованный пользователями.
              </StyledTypography>
            </StyledListItem>
            <StyledListItem component='li'>
              <StyledTypography variant='body1'>
                Нарушения авторских прав пользователями.
              </StyledTypography>
            </StyledListItem>
            <StyledListItem component='li'>
              <StyledTypography variant='body1'>
                Персональные данные, которые пользователи добровольно публикуют.
              </StyledTypography>
            </StyledListItem>
            <StyledListItem component='li'>
              <StyledTypography variant='body1'>
                Действия пользователей, нарушающие законодательство.
              </StyledTypography>
            </StyledListItem>
            <StyledListItem component='li'>
              <StyledTypography variant='body1'>
                <strong>Финансовые операции:</strong> убытки от использования
                сторонних платежных систем или неправильного указания данных
                донатором.
              </StyledTypography>
            </StyledListItem>
          </StyledList>

          <Typography
            variant='h6'
            sx={{ 
              mt: 4, 
              mb: 2, 
              fontWeight: 'bold', 
              color: '#d0bcff',
              fontSize: { xs: '1.1rem', sm: '1.25rem' }
            }}
          >
            12. Изменения в политике
          </Typography>

          <StyledTypography variant='body1' paragraph>
            К-Коннект может обновлять эту политику конфиденциальности.
            Пользователи будут уведомлены о существенных изменениях через
            платформу.
          </StyledTypography>

          <Typography
            variant='h6'
            sx={{ 
              mt: 4, 
              mb: 2, 
              fontWeight: 'bold', 
              color: '#d0bcff',
              fontSize: { xs: '1.1rem', sm: '1.25rem' }
            }}
          >
            13. Контакты
          </Typography>

          <StyledTypography variant='body1' paragraph>
            По вопросам политики конфиденциальности: verif@k-connect.ru
          </StyledTypography>
          
          <StyledTypography variant='body1' paragraph>
            По вопросам пожертвований и возвратов: verif@k-connect.ru
          </StyledTypography>

          <StyledTypography variant='body1' sx={{ mt: 4, fontStyle: 'italic', opacity: 0.8 }}>
            Используя К-Коннект, вы подтверждаете, что понимаете роль платформы
            как посредника и принимаете полную ответственность за публикуемый
            контент.
          </StyledTypography>
        </ContentSection>
      </InfoBlock>
    </PageContainer>
  );
};

export default PrivacyPolicyPage;
