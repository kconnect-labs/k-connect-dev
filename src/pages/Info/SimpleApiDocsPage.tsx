import React from 'react';
import {
  Box,
  Container,
  Typography,
  Divider,
  Paper,
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  useTheme,
  alpha
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ApiIcon from '@mui/icons-material/Api';
import HttpIcon from '@mui/icons-material/Http';
import CodeIcon from '@mui/icons-material/Code';
import LockIcon from '@mui/icons-material/Lock';
import SecurityIcon from '@mui/icons-material/Security';
import PeopleIcon from '@mui/icons-material/People';
import SearchIcon from '@mui/icons-material/Search';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import StorefrontIcon from '@mui/icons-material/Storefront';
import BugReportIcon from '@mui/icons-material/BugReport';

import InventoryIcon from '@mui/icons-material/Inventory';
import SmartToyIcon from '@mui/icons-material/SmartToy';

// Типы для пропсов
interface ApiEndpointProps {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  authRequired: boolean;
  request: string;
  response: string;
}

interface MethodChipProps {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
}

const PageContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(8),
}));

const ApiTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  marginBottom: theme.spacing(3),
  padding: theme.spacing(1, 0),
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  display: 'flex',
  alignItems: 'center',
  '& svg': {
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main,
  }
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  '& svg': {
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main,
  }
}));

const ApiCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(2),
  overflow: 'visible',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: theme.shadows[4],
    transform: 'translateY(-2px)',
  }
}));

const MethodChip = styled(Chip)<MethodChipProps>(({ theme, method }) => {
  const colors: Record<string, { bg: string; color: string }> = {
    GET: {
      bg: '#e3f2fd',
      color: '#1565c0'
    },
    POST: {
      bg: '#e8f5e9',
      color: '#2e7d32'
    },
    PUT: {
      bg: '#fff8e1',
      color: '#f57f17'
    },
    DELETE: {
      bg: '#ffebee',
      color: '#c62828'
    },
    PATCH: {
      bg: '#e0f7fa',
      color: '#00838f'
    }
  };
  const defaultColor = {
    bg: alpha(theme.palette.text.primary, 0.1),
    color: theme.palette.text.primary
  };
  const color = colors[method] || defaultColor;
  return {
    backgroundColor: theme.palette.mode === 'dark' ? alpha(color.color, 0.2) : color.bg,
    color: color.color,
    fontWeight: 600,
    fontSize: '0.75rem',
    height: 24,
  };
});

const EndpointPath = styled(Typography)(({ theme }) => ({
  fontFamily: 'monospace',
  padding: theme.spacing(0.5, 1),
  backgroundColor: alpha(theme.palette.background.default, 0.5),
  borderRadius: theme.spacing(0.5),
  fontSize: '0.9rem',
  fontWeight: 500,
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(1)
}));

const CodeBlock = styled(Box)(({ theme }) => ({
  fontFamily: 'monospace',
  fontSize: '0.9rem',
  padding: theme.spacing(1.5),
  backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.background.default, 0.4) : alpha(theme.palette.background.default, 0.7),
  borderRadius: theme.spacing(1),
  overflowX: 'auto',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  '&::-webkit-scrollbar': {
    height: '4px',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: alpha(theme.palette.primary.main, 0.2),
    borderRadius: '2px',
  }
}));

const ApiEndpoint: React.FC<ApiEndpointProps> = ({ method, path, description, authRequired, request, response }) => {
  const theme = useTheme();
  return (
    <ApiCard elevation={2}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <MethodChip 
            label={method} 
            method={method}
            size="small"
            sx={{ mr: 2 }}
          />
          <EndpointPath>
            {path}
          </EndpointPath>
          {authRequired && (
            <Chip 
              icon={<LockIcon fontSize="small" />}
              label="Требуется авторизация"
              size="small"
              sx={{ ml: 2, fontSize: '0.7rem' }}
            />
          )}
        </Box>
        <Typography variant="body2" color="text.secondary" paragraph>
          {description}
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
          <HttpIcon fontSize="small" sx={{ mr: 1 }} />
          Пример запроса:
        </Typography>
        <CodeBlock>
          {request}
        </CodeBlock>
        <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, display: 'flex', alignItems: 'center' }}>
          <CodeIcon fontSize="small" sx={{ mr: 1 }} />
          Пример ответа:
        </Typography>
        <CodeBlock>
          {response}
        </CodeBlock>
      </CardContent>
    </ApiCard>
  );
};

const SimpleApiDocsPage: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = React.useState<number>(0);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <PageContainer maxWidth="lg">
      <ApiTitle variant="h4">
        <ApiIcon fontSize="large" />
        Документация API К-Коннект
      </ApiTitle>
      <Typography variant="body1" paragraph>
        Здесь вы найдете документацию по API К-Коннект с примерами запросов и ответов.
        API позволяет взаимодействовать с системой программно для разработки собственных интеграций.
      </Typography>
      <Paper sx={{ borderRadius: theme.spacing(2), mb: 4 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: 2 }}
        >
          <Tab label="Авторизация" sx={{ textTransform: 'none', fontWeight: 500 }} />
          <Tab label="Профиль" sx={{ textTransform: 'none', fontWeight: 500 }} />
          <Tab label="Посты" sx={{ textTransform: 'none', fontWeight: 500 }} />
          <Tab label="Комментарии" sx={{ textTransform: 'none', fontWeight: 500 }} />
          <Tab label="Уведомления" sx={{ textTransform: 'none', fontWeight: 500 }} />
          <Tab label="Лидерборд" sx={{ textTransform: 'none', fontWeight: 500 }} />
          <Tab label="Поиск" sx={{ textTransform: 'none', fontWeight: 500 }} />
          <Tab label="Музыка" sx={{ textTransform: 'none', fontWeight: 500 }} />
          <Tab label="Магазин бейджиков" sx={{ textTransform: 'none', fontWeight: 500 }} />
          <Tab label="Баг-репорты" sx={{ textTransform: 'none', fontWeight: 500 }} />
          <Tab label="Инвентарь" sx={{ textTransform: 'none', fontWeight: 500 }} />
          <Tab label="Боты" sx={{ textTransform: 'none', fontWeight: 500 }} />
        </Tabs>
      </Paper>
      {activeTab === 0 && (
        <>
          <Box sx={{ 
            mb: 4, 
            p: 3, 
            borderRadius: 2,
            backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.primary.main, 0.05) : alpha(theme.palette.primary.main, 0.03),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SecurityIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
              <Typography variant="h6">API доступ и безопасность</Typography>
            </Box>
            <Typography variant="body2" paragraph>
              API К-Коннект защищено от несанкционированного доступа с помощью CORS и механизма проверки API-ключей. Для использования API из внешних приложений или скриптов необходимо получить API-ключ.
            </Typography>
            
            <SectionTitle variant="subtitle2">Ограничения CORS</SectionTitle>
            <Typography variant="body2" paragraph>
              По умолчанию API доступно только для запросов с домена k-connect.ru и локальных разработочных сред. Для доступа из внешних приложений используйте API-ключ.
            </Typography>
            
            <SectionTitle variant="subtitle2">Использование API-ключа</SectionTitle>
            <Typography variant="body2" paragraph>
              Для обхода ограничений CORS и получения доступа к API из любого приложения, необходимо добавить специальный заголовок <code>X-API-Key</code> ко всем запросам.
            </Typography>
            
            <CodeBlock>
{`// Пример запроса с API-ключом
fetch('https://k-connect.ru/api/posts', {
  method: 'GET',
  headers: {
    'X-API-Key': 'ваш-api-ключ-здесь'
  }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Ошибка:', error));`}
            </CodeBlock>
            
            <SectionTitle variant="subtitle2">Получение API-ключа</SectionTitle>
            <Typography variant="body2" paragraph>
              API-ключ можно получить у администрации К-Коннект. Для получения ключа необходимо:
            </Typography>
            <ol>
              <li>Быть зарегистрированным пользователем К-Коннект</li>
              <li>Отправить запрос администрации с описанием цели использования API</li>
              <li>После одобрения запроса вам будет выдан персональный API-ключ</li>
            </ol>
            <Typography variant="body2" sx={{ 
              mt: 2, 
              p: 2, 
              borderRadius: 1,
              backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.warning.main, 0.1) : alpha(theme.palette.warning.main, 0.05),
              color: theme.palette.warning.main,
              border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
            }}>
              <b>Важно:</b> Храните ваш API-ключ в безопасности и не передавайте его третьим лицам. Ключ может быть отозван в случае нарушения правил использования API.
            </Typography>
          </Box>
          
          <Box sx={{ 
            mb: 4, 
            p: 3, 
            borderRadius: 2,
            backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.primary.main, 0.05) : alpha(theme.palette.primary.main, 0.03),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SecurityIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
              <Typography variant="h6">Способы авторизации</Typography>
            </Box>
            <Typography variant="body2" paragraph>
              К-Коннект поддерживает несколько способов авторизации для максимальной гибкости и безопасности.
            </Typography>
            
            <SectionTitle variant="subtitle2">1. Session Key (рекомендуется)</SectionTitle>
            <Typography variant="body2" paragraph>
              Используйте session_key из LocalStorage для авторизации. Это наиболее безопасный и удобный способ для веб-приложений.
            </Typography>
            <CodeBlock>
{`// Получение session_key из LocalStorage
const sessionKey = localStorage.getItem('session_key');

// Использование в заголовке Authorization
fetch('/api/auth/check', {
  headers: {
    'Authorization': \`Bearer \${sessionKey}\`
  }
});

// Или в куки (автоматически)
document.cookie = \`session_key=\${sessionKey}; path=/\`;`}
            </CodeBlock>
            
            <SectionTitle variant="subtitle2">2. Email/Password</SectionTitle>
            <Typography variant="body2" paragraph>
              Классическая авторизация с логином и паролем. Поддерживает remember me функциональность.
            </Typography>
            
            <SectionTitle variant="subtitle2">3. Telegram</SectionTitle>
            <Typography variant="body2" paragraph>
              Авторизация через Telegram Bot API. Пользователь авторизуется через Telegram и получает доступ к системе.
            </Typography>
            
            <SectionTitle variant="subtitle2">4. Element (Matrix)</SectionTitle>
            <Typography variant="body2" paragraph>
              Авторизация через Element клиент. Создает пользователя автоматически при первом входе.
            </Typography>
            
            <SectionTitle variant="subtitle2">Безопасность</SectionTitle>
            <ul>
              <li>Session Key хранится в LocalStorage и автоматически отправляется с запросами</li>
              <li>Поддержка HTTP-only cookies для дополнительной защиты</li>
              <li>Автоматическая проверка источника запроса (CORS)</li>
              <li>Rate limiting для предотвращения брутфорс атак</li>
              <li>Блокировка IP при подозрительной активности</li>
            </ul>
          </Box>
          <SectionTitle variant="h6" sx={{ mt: 3, mb: 2 }}>
            Основные эндпоинты авторизации
          </SectionTitle>
          
          <ApiEndpoint 
            method="POST"
            path="/api/auth/register"
            description="Регистрация нового пользователя с email и паролем. Включает защиту от ботов и ограничения по IP."
            authRequired={false}
            request={
`POST /api/auth/register
Content-Type: application/json
{
  "username": "string (3-30 символов, только буквы, цифры, _)",
  "email": "string (валидный email)",
  "password": "string (минимум 8 символов)",
  "name": "string (опционально, по умолчанию = username)"
}`
            }
            response={
`{
  "success": true,
  "message": "Регистрация успешна. Проверьте email для подтверждения."
}

// Ошибки:
{
  "error": "Слишком много попыток регистрации. Повторите через X секунд.",
  "retry_after": number
}

{
  "error": "Ваш IP временно заблокирован из-за подозрительной активности.",
  "blocked": true,
  "retry_after": number
}`
            }
          />
          
          <ApiEndpoint 
            method="POST"
            path="/api/auth/login"
            description="Вход в систему с email/username и паролем. Поддерживает remember me."
            authRequired={false}
            request={
`POST /api/auth/login
Content-Type: application/json
{
  "usernameOrEmail": "string (email или username)",
  "password": "string",
  "remember": boolean (опционально, по умолчанию false)
}`
            }
            response={
`{
  "success": true,
  "message": "Вход выполнен успешно",
  "user": {
    "id": number,
    "name": "string",
    "username": "string",
    "photo": "string"
  }
}

// Ошибки:
{
  "success": false,
  "error": "Неверный логин или пароль."
}

{
  "success": false,
  "error": "Слишком много попыток входа. Повторите через X секунд.",
  "retry_after": number
}`
            }
          />
          
          <ApiEndpoint 
            method="GET"
            path="/api/auth/check"
            description="Проверка статуса авторизации пользователя. Поддерживает session_key из LocalStorage."
            authRequired={false}
            request={
`GET /api/auth/check

// Варианты авторизации:
// 1. Session Key в заголовке:
Authorization: Bearer <session_key>

// 2. Session Key в куки:
Cookie: session_key=<session_key>

// 3. Обычная сессия (устаревший способ)`
            }
            response={
`{
  "isAuthenticated": true,
  "user": {
    "id": number,
    "name": "string",
    "username": "string",
    "photo": "string,
    "banner": "string",
    "about": "string",
    "avatar_url": "string",
    "banner_url": "string",
    "hasCredentials": boolean,
    "account_type": "string",
    "main_account_id": number
  }
}

// Не авторизован:
{
  "isAuthenticated": false,
  "sessionExists": boolean
}

// Нужна настройка профиля:
{
  "isAuthenticated": true,
  "sessionExists": true,
  "needsProfileSetup": true,
  "user_id": number,
  "hasAuthMethod": boolean
}

// Забаненный пользователь:
{
  "isAuthenticated": false,
  "sessionExists": false,
  "error": "Аккаунт заблокирован",
  "ban_info": object
}`
            }
          />
          
          <ApiEndpoint 
            method="POST"
            path="/api/auth/logout"
            description="Выход из системы. Удаляет сессию и куки."
            authRequired={true}
            request={
`POST /api/auth/logout`
            }
            response={
`{
  "success": true,
  "message": "Выход выполнен успешно"
}`
            }
          />
          
          <SectionTitle variant="h6" sx={{ mt: 3, mb: 2 }}>
            Альтернативные способы авторизации
          </SectionTitle>
          
          <ApiEndpoint 
            method="POST"
            path="/api/auth/telegram"
            description="Авторизация через Telegram Bot API. Создает или находит пользователя по chat_id."
            authRequired={false}
            request={
`POST /api/auth/telegram
Content-Type: application/json
{
  "chat_id": "string (Telegram chat_id)",
  "username": "string (опционально, Telegram username)"
}`
            }
            response={
`{
  "status": "success",
  "redirect": "/",
  "user": {
    "id": number,
    "username": "string",
    "name": "string",
    "photo": "string"
  }
}

// Для новых пользователей:
{
  "status": "success",
  "redirect": "/register/profile",
  "needs_profile_setup": true,
  "chat_id": "string"
}`
            }
          />
          
          <ApiEndpoint 
            method="POST"
            path="/api/auth/element"
            description="Авторизация через Element (Matrix) клиент. Создает пользователя автоматически."
            authRequired={false}
            request={
`POST /api/auth/element
Content-Type: application/json
{
  "chat_id": "string (Element chat_id)"
}`
            }
            response={
`{
  "success": true,
  "user": {
    "id": number,
    "name": "string",
    "username": "string",
    "photo": "string"
  },
  "needsProfileSetup": true
}`
            }
          />
          
          <SectionTitle variant="h6" sx={{ mt: 3, mb: 2 }}>
            Управление сессиями
          </SectionTitle>
          
          <ApiEndpoint 
            method="GET"
            path="/api/auth/sessions"
            description="Получение списка активных сессий пользователя."
            authRequired={true}
            request={
`GET /api/auth/sessions`
            }
            response={
`{
  "sessions": [
    {
      "id": "string",
      "created_at": "string",
      "expires_at": "string",
      "ip_address": "string",
      "user_agent": "string",
      "is_current": boolean
    }
  ]
}`
            }
          />
          
          <ApiEndpoint 
            method="DELETE"
            path="/api/auth/sessions/{session_id}"
            description="Удаление конкретной сессии пользователя."
            authRequired={true}
            request={
`DELETE /api/auth/sessions/{session_id}`
            }
            response={
`{
  "success": true,
  "message": "Сессия удалена"
}`
            }
          />
          
          <SectionTitle variant="h6" sx={{ mt: 3, mb: 2 }}>
            Восстановление пароля
          </SectionTitle>
          
          <ApiEndpoint 
            method="POST"
            path="/api/auth/forgot-password"
            description="Запрос на восстановление пароля. Отправляет email с токеном."
            authRequired={false}
            request={
`POST /api/auth/forgot-password
Content-Type: application/json
{
  "email": "string"
}`
            }
            response={
`{
  "success": true,
  "message": "Инструкции отправлены на email"
}`
            }
          />
          
          <ApiEndpoint 
            method="POST"
            path="/api/auth/reset-password"
            description="Сброс пароля по токену из email."
            authRequired={false}
            request={
`POST /api/auth/reset-password
Content-Type: application/json
{
  "token": "string (токен из email)",
  "password": "string (новый пароль, минимум 8 символов)"
}`
            }
            response={
`{
  "success": true,
  "message": "Пароль успешно изменен"
}`
            }
          />
          
          <SectionTitle variant="h6" sx={{ mt: 3, mb: 2 }}>
            Настройка учетных данных
          </SectionTitle>
          
          <ApiEndpoint 
            method="POST"
            path="/api/auth/setup-credentials"
            description="Настройка email/пароля для пользователей, зарегистрированных через Telegram/Element."
            authRequired={true}
            request={
`POST /api/auth/setup-credentials
Content-Type: application/json
{
  "email": "string",
  "password": "string"
}`
            }
            response={
`{
  "success": true,
  "message": "Учетные данные настроены"
}`
            }
          />
          
          <Box sx={{ 
            mt: 4, 
            p: 3, 
            borderRadius: 2,
            backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.warning.main, 0.1) : alpha(theme.palette.warning.main, 0.05),
            border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
          }}>
            <Typography variant="h6" sx={{ color: theme.palette.warning.main, mb: 2 }}>
              Ограничения и безопасность
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Rate Limiting:</strong>
              <br />• Регистрация: максимум 3 попытки в минуту с одного IP
              <br />• Вход: максимум 3 попытки в минуту с одного IP
              <br />• Максимум 1 регистрация с одного IP в неделю
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Блокировки:</strong>
              <br />• IP блокируется на 24 часа при подозрительной активности
              <br />• Пользователи блокируются на 15 минут после 5 неудачных попыток входа
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Валидация:</strong>
              <br />• Username: 3-30 символов, только буквы, цифры, подчеркивание
              <br />• Email: валидный формат, проверка домена
              <br />• Password: минимум 8 символов
            </Typography>
            <Typography variant="body2">
              <strong>Session Key:</strong>
              <br />• Используйте session_key из LocalStorage для авторизации
              <br />• Отправляйте в заголовке: Authorization: Bearer &lt;session_key&gt;
              <br />• Или в куки: session_key=&lt;session_key&gt;
            </Typography>
          </Box>
        </>
      )}
      {activeTab === 1 && (
        <>
          <SectionTitle variant="h5">
            <ApiIcon fontSize="medium" sx={{ mr: 1 }} />
            API профиля пользователя
          </SectionTitle>
          
          <ApiEndpoint 
            method="GET"
            path="/api/profile/<user_identifier>"
            description="Получить профиль пользователя по username, ID или купленному юзернейму"
            authRequired={false}
            request={
`GET /api/profile/username
GET /api/profile/123
GET /api/profile/premium_username`
            }
            response={
`{
  "user": {
    "id": 1,
    "name": "Имя пользователя",
    "username": "username",
    "about": "Описание профиля",
    "photo": "avatar.jpg",
    "cover_photo": "banner.jpg",
    "status_text": "Статус профиля",
    "status_color": "#ff0000",
    "profile_id": "unique_id",
    "followers_count": 100,
    "following_count": 50,
    "friends_count": 25,
    "posts_count": 25,
    "photos_count": 10,
    "total_likes": 1000,
    "avatar_url": "/static/uploads/avatar/1/avatar.jpg",
    "banner_url": "/static/uploads/banner/1/banner.jpg",
    "profile_background_url": "/static/uploads/prof_back/1/bg.jpg",
    "verification_status": "verified",
    "interests": ["музыка", "спорт"],
    "purchased_usernames": [
      {
        "id": 1,
        "username": "premium_username",
        "price_paid": 5000,
        "purchase_date": "2024-01-01T00:00:00Z",
        "is_active": true
      }
    ],
    "registration_date": "2024-01-01T00:00:00Z",
    "scam": false,
    "account_type": "user",
    "main_account_id": null,
    "element_connected": true,
    "element_id": "element_id",
    "telegram_id": "123456789",
    "telegram_username": "@username"
  },
  "is_following": false,
  "is_friend": false,
  "notifications_enabled": true,
  "socials": [
    { "name": "Telegram", "link": "https://t.me/username" }
  ],
  "verification": {
    "status": "verified",
    "date": "01.01.2024"
  },
  "achievement": {
    "bage": "gold",
    "image_path": "/static/achievements/gold.png",
    "upgrade": 1,
    "color_upgrade": "#ffd700"
  },
  "subscription": {
    "type": "premium",
    "subscription_date": "2024-01-01T00:00:00Z",
    "expires_at": "2024-12-31T23:59:59Z",
    "total_duration_months": 12.0,
    "active": true
  },
  "connect_info": [
    {
      "username": "friend_username",
      "type": "friend",
      "status": "confirmed",
      "is_mutual": true,
      "connection_date": "2024-01-01T00:00:00Z",
      "days": 30
    }
  ],
  "equipped_items": [
    {
      "id": 1,
      "item_name": "Редкий меч",
      "image_url": "/static/items/sword.png",
      "rarity": "rare",
      "upgradeable": true,
      "is_equipped": true
    }
  ],
  "ban": {
    "is_banned": false
  },
  "current_user_is_moderator": false
}`
            }
          />
          
          <ApiEndpoint 
            method="GET"
            path="/api/profile/current"
            description="Получить профиль текущего авторизованного пользователя"
            authRequired={true}
            request={
`GET /api/profile/current`
            }
            response={
`{
  "user": {
    "id": 1,
    "name": "Имя пользователя",
    "username": "username",
    "element_connected": true,
    "element_id": "element_id",
    "telegram_id": "123456789",
    "telegram_username": "@username"
  }
}`
            }
          />
          
          <ApiEndpoint 
            method="GET"
            path="/api/profile/<user_identifier>/stats"
            description="Получить статистику профиля пользователя"
            authRequired={false}
            request={
`GET /api/profile/username/stats`
            }
            response={
`{
  "total_likes": 1000,
  "posts_count": 50,
  "days_active": 365,
  "avg_likes_per_post": 20.0
}`
            }
          />
          
          <ApiEndpoint 
            method="POST"
            path="/api/profile/name"
            description="Обновить имя пользователя"
            authRequired={true}
            request={
`POST /api/profile/name
Content-Type: application/json
{
  "name": "Новое имя"
}`
            }
            response={
`{
  "success": true,
  "message": "Имя успешно обновлено"
}`
            }
          />
          
          <ApiEndpoint 
            method="POST"
            path="/api/profile/username"
            description="Обновить username"
            authRequired={true}
            request={
`POST /api/profile/username
Content-Type: application/json
{
  "username": "new_username"
}`
            }
            response={
`{
  "success": true,
  "message": "Имя пользователя успешно обновлено"
}`
            }
          />
          
          <ApiEndpoint 
            method="POST"
            path="/api/profile/about"
            description="Обновить описание профиля"
            authRequired={true}
            request={
`POST /api/profile/about
Content-Type: application/json
{
  "about": "Новое описание профиля"
}`
            }
            response={
`{
  "success": true,
  "message": "Описание профиля успешно обновлено"
}`
            }
          />
          
          <ApiEndpoint 
            method="POST"
            path="/api/profile/avatar"
            description="Загрузить аватар"
            authRequired={true}
            request={
`POST /api/profile/avatar
Content-Type: multipart/form-data
{
  "avatar": "file"
}`
            }
            response={
`{
  "success": true,
  "message": "Аватар успешно загружен",
  "avatar_url": "/static/uploads/avatar/1/avatar.jpg"
}`
            }
          />
          
          <ApiEndpoint 
            method="POST"
            path="/api/profile/banner"
            description="Загрузить баннер"
            authRequired={true}
            request={
`POST /api/profile/banner
Content-Type: multipart/form-data
{
  "banner": "file"
}`
            }
            response={
`{
  "success": true,
  "message": "Баннер успешно загружен",
  "banner_url": "/static/uploads/banner/1/banner.jpg"
}`
            }
          />
          
          <ApiEndpoint 
            method="POST"
            path="/api/profile/background"
            description="Загрузить фоновую картинку (только Ultimate)"
            authRequired={true}
            request={
`POST /api/profile/background
Content-Type: multipart/form-data
{
  "background": "file"
}`
            }
            response={
`{
  "success": true,
  "message": "Фон успешно загружен",
  "profile_background_url": "/static/uploads/prof_back/1/bg.jpg"
}`
            }
          />
          
          <ApiEndpoint 
            method="POST"
            path="/api/profile/background/delete"
            description="Удалить фоновую картинку (только Ultimate)"
            authRequired={true}
            request={
`POST /api/profile/background/delete`
            }
            response={
`{
  "success": true,
  "message": "Фон успешно удален"
}`
            }
          />
          
          <ApiEndpoint 
            method="POST"
            path="/api/profile/avatar/delete"
            description="Удалить аватар"
            authRequired={true}
            request={
`POST /api/profile/avatar/delete`
            }
            response={
`{
  "success": true,
  "message": "Аватар успешно удален"
}`
            }
          />
          
          <ApiEndpoint 
            method="POST"
            path="/api/profile/banner/delete"
            description="Удалить баннер"
            authRequired={true}
            request={
`POST /api/profile/banner/delete`
            }
            response={
`{
  "success": true,
  "message": "Баннер успешно удален"
}`
            }
          />
          
          <ApiEndpoint 
            method="POST"
            path="/api/profile/social"
            description="Добавить/обновить социальную сеть"
            authRequired={true}
            request={
`POST /api/profile/social
Content-Type: application/x-www-form-urlencoded
{
  "name": "Telegram",
  "link": "https://t.me/username"
}`
            }
            response={
`{
  "success": true,
  "message": "Социальная сеть успешно обновлена"
}`
            }
          />
          
          <ApiEndpoint 
            method="POST"
            path="/api/profile/social/delete"
            description="Удалить социальную сеть"
            authRequired={true}
            request={
`POST /api/profile/social/delete
Content-Type: application/x-www-form-urlencoded
{
  "name": "Telegram"
}`
            }
            response={
`{
  "success": true,
  "message": "Социальная сеть успешно удалена"
}`
            }
          />
          
          <ApiEndpoint 
            method="POST"
            path="/api/profile/follow/<username>"
            description="Подписаться/отписаться от пользователя"
            authRequired={true}
            request={
`POST /api/profile/follow/username`
            }
            response={
`{
  "success": true,
  "is_following": true,
  "is_friend": false,
  "friend_status_changed": false,
  "notifications_enabled": true,
  "message": "Вы подписались на пользователя"
}`
            }
          />
          
          <ApiEndpoint 
            method="POST"
            path="/api/profile/unfollow/<username>"
            description="Отписаться от пользователя"
            authRequired={true}
            request={
`POST /api/profile/unfollow/username`
            }
            response={
`{
  "success": true,
  "is_following": false,
  "is_friend": false,
  "friend_status_changed": true,
  "message": "Вы отписались от пользователя"
}`
            }
          />
          
          <ApiEndpoint 
            method="POST"
            path="/api/profile/notifications/toggle"
            description="Переключить уведомления о подписке"
            authRequired={true}
            request={
`POST /api/profile/notifications/toggle
Content-Type: application/json
{
  "followed_id": 1
}`
            }
            response={
`{
  "success": true,
  "notifications_enabled": true,
  "message": "Уведомления включены"
}`
            }
          />
          
          <ApiEndpoint 
            method="GET"
            path="/api/profile/<user_identifier>/posts"
            description="Получить посты пользователя"
            authRequired={false}
            request={
`GET /api/profile/username/posts?page=1&per_page=20&media=photos`
            }
            response={
`{
  "posts": [],
  "page": 1,
  "per_page": 20,
  "total": 100,
  "has_next": true,
  "has_prev": false,
  "pages": 5
}`
            }
          />
          
          <ApiEndpoint 
            method="GET"
            path="/api/profile/<user_identifier>/wall"
            description="Получить посты стены пользователя"
            authRequired={false}
            request={
`GET /api/profile/username/wall?page=1&per_page=10`
            }
            response={
`{
  "posts": [],
  "page": 1,
  "per_page": 10,
  "total": 20,
  "has_next": false,
  "has_prev": false,
  "pages": 2
}`
            }
          />
          
          <ApiEndpoint 
            method="GET"
            path="/api/profile/<user_identifier>/followers"
            description="Получить подписчиков пользователя"
            authRequired={false}
            request={
`GET /api/profile/username/followers`
            }
            response={
`{
  "followers": [],
  "total": 100,
  "page": 1,
  "per_page": 100,
  "pages": 1,
  "has_next": false,
  "has_prev": false
}`
            }
          />
          
          <ApiEndpoint 
            method="GET"
            path="/api/profile/<user_identifier>/following"
            description="Получить подписки пользователя"
            authRequired={false}
            request={
`GET /api/profile/username/following`
            }
            response={
`{
  "following": [],
  "total": 50,
  "page": 1,
  "per_page": 50,
  "pages": 1,
  "has_next": false,
  "has_prev": false
}`
            }
          />
          
          <ApiEndpoint 
            method="GET"
            path="/api/profile/<user_identifier>/friends"
            description="Получить друзей пользователя"
            authRequired={false}
            request={
`GET /api/profile/username/friends`
            }
            response={
`{
  "friends": [],
  "total": 25,
  "page": 1,
  "per_page": 25,
  "pages": 1,
  "has_next": false,
  "has_prev": false
}`
            }
          />
          
          <ApiEndpoint 
            method="GET"
            path="/api/profile/<user_identifier>/media"
            description="Получить медиафайлы пользователя"
            authRequired={false}
            request={
`GET /api/profile/username/media?media_type=photo&page=1&per_page=20`
            }
            response={
`{
  "media": [],
  "has_next": false,
  "total": 50,
  "page": 1,
  "pages": 1
}`
            }
          />
          
          <ApiEndpoint 
            method="GET"
            path="/api/profile/<user_identifier>/attachments"
            description="Получить вложения пользователя"
            authRequired={false}
            request={
`GET /api/profile/username/attachments?media_type=photo&page=1&per_page=20`
            }
            response={
`{
  "attachments": [],
  "has_next": false,
  "total": 30,
  "page": 1,
  "pages": 1
}`
            }
          />
          
          <ApiEndpoint 
            method="GET"
            path="/api/profile/<user_identifier>/photos"
            description="Получить фотографии пользователя"
            authRequired={false}
            request={
`GET /api/profile/username/photos?page=1&per_page=20`
            }
            response={
`{
  "media": [],
  "has_next": false,
  "total": 30,
  "page": 1,
  "pages": 1
}`
            }
          />
          
          <ApiEndpoint 
            method="GET"
            path="/api/profile/<user_identifier>/videos"
            description="Получить видео пользователя"
            authRequired={false}
            request={
`GET /api/profile/username/videos?page=1&per_page=20`
            }
            response={
`{
  "media": [],
  "has_next": false,
  "total": 20,
  "page": 1,
  "pages": 1
}`
            }
          />
          
          <ApiEndpoint 
            method="GET"
            path="/api/profile/<user_identifier>/pinned"
            description="Получить закрепленный пост пользователя"
            authRequired={false}
            request={
`GET /api/profile/username/pinned`
            }
            response={
`{
  "id": 1,
  "content": "Текст поста",
  "timestamp": "2024-01-01T12:00:00Z",
  "image": "/static/uploads/post/1/image.jpg",
  "images": ["/static/uploads/post/1/image.jpg"],
  "video": null,
  "music": null,
  "views_count": 100,
  "type": "post",
  "user": {
    "id": 1,
    "username": "username",
    "name": "Имя пользователя",
    "photo": "avatar.jpg",
    "avatar_url": "/static/uploads/avatar/1/avatar.jpg",
    "verification": { "status": "verified" },
    "achievement": { "bage": "gold" }
  },
  "likes_count": 50,
  "dislikes_count": 2,
  "comments_count": 10,
  "reposts_count": 5,
  "is_pinned": true,
  "is_liked": false,
  "is_owner": false
}`
            }
          />
          
          <ApiEndpoint 
            method="POST"
            path="/api/profile/pin/<post_id>"
            description="Закрепить пост"
            authRequired={true}
            request={
`POST /api/profile/pin/123`
            }
            response={
`{
  "message": "Post pinned successfully"
}`
            }
          />
          
          <ApiEndpoint 
            method="POST"
            path="/api/profile/unpin"
            description="Открепить пост"
            authRequired={true}
            request={
`POST /api/profile/unpin`
            }
            response={
`{
  "message": "Post unpinned successfully"
}`
            }
          />
          
          <ApiEndpoint 
            method="POST"
            path="/api/profile/status/v2"
            description="Обновить статус профиля (требует Premium/Ultimate/Pick-me)"
            authRequired={true}
            request={
`POST /api/profile/status/v2
Content-Type: application/json
{
  "status_text": "Новый статус",
  "status_color": "#ff0000",
  "is_channel": false
}`
            }
            response={
`{
  "success": true,
  "message": "Статус успешно обновлен",
  "status": {
    "text": "Новый статус",
    "color": "#ff0000"
  }
}`
            }
          />
          
          <ApiEndpoint 
            method="GET"
            path="/api/profile/<user_identifier>/medals"
            description="Получить медали пользователя"
            authRequired={false}
            request={
`GET /api/profile/username/medals`
            }
            response={
`{
  "success": true,
  "medals": [
    {
      "id": 1,
      "name": "gold",
      "description": "Золотая медаль",
      "image_path": "/static/medals/gold.svg",
      "awarded_at": "2024-01-01T00:00:00Z",
      "awarded_by": "moderator_username"
    }
  ],
  "total": 5
}`
            }
          />
          
          <ApiEndpoint 
            method="GET"
            path="/api/medals"
            description="Получить все доступные медали"
            authRequired={false}
            request={
`GET /api/medals`
            }
            response={
`{
  "success": true,
  "medals": [
    {
      "name": "gold",
      "description": "Золотая медаль",
      "image_path": "/static/medals/gold.svg"
    }
  ],
  "total": 20
}`
            }
          />
          
          <ApiEndpoint 
            method="GET"
            path="/api/medals/<medal_name>/users"
            description="Получить пользователей с медалью"
            authRequired={false}
            request={
`GET /api/medals/gold/users`
            }
            response={
`{
  "success": true,
  "medal_name": "gold",
  "image_path": "/static/medals/gold.svg",
  "users": [
    {
      "id": 1,
      "username": "username",
      "name": "Имя пользователя",
      "avatar_url": "/static/uploads/avatar/1/avatar.jpg",
      "medal_id": 1,
      "awarded_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 10
}`
            }
          />
          
          <ApiEndpoint 
            method="GET"
            path="/api/profile/<user_identifier>/friendship/status"
            description="Проверить статус дружбы между пользователями"
            authRequired={true}
            request={
`GET /api/profile/username/friendship/status`
            }
            response={
`{
  "success": true,
  "is_self": false,
  "is_following": true,
  "is_followed_by": true,
  "is_friend": true,
  "relationship": "friend"
}`
            }
          />
          
          <ApiEndpoint 
            method="GET"
            path="/api/settings"
            description="Получить настройки пользователя"
            authRequired={true}
            request={
`GET /api/settings`
            }
            response={
`{
  "success": true,
  "settings": {
    "primary_color": "#D0BCFF",
    "theme": "dark"
  }
}`
            }
          />
          
          <ApiEndpoint 
            method="POST"
            path="/api/settings"
            description="Обновить настройки пользователя"
            authRequired={true}
            request={
`POST /api/settings
Content-Type: application/json
{
  "primary_color": "#ff0000",
  "theme": "light"
}`
            }
            response={
`{
  "success": true,
  "message": "Настройки успешно обновлены",
  "updated_settings": ["primary_color", "theme"]
}`
            }
          />
          
          <ApiEndpoint 
            method="GET"
            path="/api/achievements"
            description="Получить достижения пользователя"
            authRequired={true}
            request={
`GET /api/achievements`
            }
            response={
`{
  "achievements": [
    {
      "id": 1,
      "bage": "gold",
      "image_path": "/static/achievements/gold.png",
      "is_active": true,
      "date_awarded": "2024-01-01T00:00:00Z",
      "profile_name": "ACTIVE",
      "is_active_badge": true,
      "upgrade": 1,
      "color_upgrade": "#ffd700"
    }
  ]
}`
            }
          />
          
          <ApiEndpoint 
            method="POST"
            path="/api/achievements/activate"
            description="Активировать достижение"
            authRequired={true}
            request={
`POST /api/achievements/activate
Content-Type: application/json
{
  "achievement_id": 1
}`
            }
            response={
`{
  "success": true,
  "message": "Активное достижение обновлено",
  "achievement": {
    "id": 1,
    "bage": "gold",
    "image_path": "/static/achievements/gold.png",
    "is_active": true,
    "date_awarded": "2024-01-01T00:00:00Z",
    "profile_name": "ACTIVE"
  }
}`
            }
          />
          
          <ApiEndpoint 
            method="POST"
            path="/api/achievements/clear"
            description="Удалить активное достижение"
            authRequired={true}
            request={
`POST /api/achievements/clear`
            }
            response={
`{
  "success": true,
  "message": "Активный бейдж удален"
}`
            }
          />
          
          <ApiEndpoint 
            method="GET"
            path="/api/element/status"
            description="Проверить статус подключения Element"
            authRequired={true}
            request={
`GET /api/element/status`
            }
            response={
`{
  "success": true,
  "connected": true,
  "elem_id": "element_id"
}`
            }
          />
          
          <ApiEndpoint 
            method="POST"
            path="/api/telegram/connect"
            description="Привязать Telegram ID к аккаунту"
            authRequired={true}
            request={
`POST /api/telegram/connect
Content-Type: application/json
{
  "telegram_id": "123456789"
}`
            }
            response={
`{
  "success": true,
  "message": "Telegram ID успешно привязан к аккаунту",
  "telegram_connected": true,
  "telegram_notifications_enabled": true
}`
            }
          />
          
          <ApiEndpoint 
            method="POST"
            path="/api/telegram/disconnect"
            description="Отвязать Telegram ID от аккаунта"
            authRequired={true}
            request={
`POST /api/telegram/disconnect`
            }
            response={
`{
  "success": true,
  "message": "Telegram ID успешно отвязан от аккаунта",
  "telegram_connected": false,
  "telegram_notifications_enabled": false,
  "old_telegram_id": "123456789"
}`
            }
          />
        </>
      )}
      {activeTab === 2 && (
        <>
          <SectionTitle variant="h5">
            <ApiIcon fontSize="medium" sx={{ mr: 1 }} />
            API постов
          </SectionTitle>
          
          <ApiEndpoint 
            method="GET"
            path="/api/posts"
            description="Получение глобальной ленты постов с пагинацией и фильтрацией."
            authRequired={false}
            request={
`GET /api/posts?page=1&per_page=20&media=photos&sort=newest`
            }
            response={
`{
  "posts": [
    {
      "id": 456,
      "text": "Пример текста поста",
      "content": "Полный текст поста",
      "author": {
        "id": 123,
        "username": "author",
        "name": "Автор поста",
        "photo": "avatar.jpg",
        "avatar_url": "/static/uploads/avatar/123/avatar.jpg",
        "verification": { "status": "verified" },
        "achievement": { "badge": "gold" }
      },
      "created_at": "2023-05-20T12:00:00Z",
      "updated_at": "2023-05-20T12:00:00Z",
      "likes_count": 10,
      "dislikes_count": 2,
      "comments_count": 5,
      "reposts_count": 3,
      "views_count": 150,
      "is_liked": false,
      "is_disliked": false,
      "is_owner": false,
      "is_reposted": false,
      "is_pinned": false,
      "is_edited": false,
      "type": "post",
      "media": ["/static/uploads/post/456/image.jpg"],
      "images": ["/static/uploads/post/456/image.jpg"],
      "video": null,
      "music": null,
      "fact": null,
      "repost": null,
      "comments": []
    }
  ],
  "total": 50,
  "page": 1,
  "per_page": 20,
  "pages": 3,
  "has_next": true,
  "has_prev": false
}`
            }
          />
          
          <ApiEndpoint 
            method="GET"
            path="/api/posts/feed"
            description="Получение персонализированной ленты постов (от подписок пользователя)."
            authRequired={true}
            request={
`GET /api/posts/feed?page=1&per_page=20&media=all`
            }
            response={
`{
  "posts": [
    {
      "id": 457,
      "text": "Пост из ленты подписок",
      "content": "Полный текст поста",
      "author": {
        "id": 124,
        "username": "followed",
        "name": "Пользователь из подписок",
        "photo": "avatar.jpg",
        "avatar_url": "/static/uploads/avatar/124/avatar.jpg",
        "verification": { "status": "verified" },
        "achievement": { "badge": "silver" }
      },
      "created_at": "2023-05-20T13:00:00Z",
      "updated_at": "2023-05-20T13:00:00Z",
      "likes_count": 15,
      "dislikes_count": 1,
      "comments_count": 3,
      "reposts_count": 2,
      "views_count": 200,
      "is_liked": true,
      "is_disliked": false,
      "is_owner": false,
      "is_reposted": false,
      "is_pinned": false,
      "is_edited": false,
      "type": "post",
      "media": [],
      "images": [],
      "video": null,
      "music": null,
      "fact": null,
      "repost": null,
      "comments": []
    }
  ],
  "total": 30,
  "page": 1,
  "per_page": 20,
  "pages": 2,
  "has_next": true,
  "has_prev": false
}`
            }
          />
          
          <ApiEndpoint 
            method="GET"
            path="/api/posts/:post_id"
            description="Получение детальной информации о конкретном посте с комментариями."
            authRequired={false}
            request={
`GET /api/posts/456?include_comments=true`
            }
            response={
`{
  "post": {
    "id": 456,
    "text": "Пример текста поста",
    "content": "Полный текст поста",
    "author": {
      "id": 123,
      "username": "author",
      "name": "Автор поста",
      "photo": "avatar.jpg",
      "avatar_url": "/static/uploads/avatar/123/avatar.jpg",
      "verification": { "status": "verified" },
      "achievement": { "badge": "gold" }
    },
    "created_at": "2023-05-20T12:00:00Z",
    "updated_at": "2023-05-20T12:00:00Z",
    "likes_count": 10,
    "dislikes_count": 2,
    "comments_count": 5,
    "reposts_count": 3,
    "views_count": 150,
    "is_liked": false,
    "is_disliked": false,
    "is_owner": false,
    "is_reposted": false,
    "is_pinned": false,
    "is_edited": false,
    "type": "post",
    "media": ["/static/uploads/post/456/image.jpg"],
    "images": ["/static/uploads/post/456/image.jpg"],
    "video": null,
    "music": null,
    "fact": null,
    "repost": null,
    "comments": [
      {
        "id": 789,
        "text": "Комментарий к посту",
        "author": {
          "id": 125,
          "username": "commenter",
          "name": "Комментатор",
          "photo": "avatar.jpg",
          "avatar_url": "/static/uploads/avatar/125/avatar.jpg",
          "verification": { "status": "unverified" },
          "achievement": null
        },
        "created_at": "2023-05-20T12:30:00Z",
        "likes_count": 2,
        "dislikes_count": 0,
        "is_liked": false,
        "is_disliked": false,
        "is_owner": false
      }
    ]
  }
}`
            }
          />
          
          <ApiEndpoint 
            method="POST"
            path="/api/posts"
            description="Создание нового поста с поддержкой медиафайлов."
            authRequired={true}
            request={
`POST /api/posts
Content-Type: application/json
{
  "text": "Текст нового поста",
  "media": ["/static/uploads/post/temp/image.jpg"],
  "images": ["/static/uploads/post/temp/image.jpg"],
  "video": null,
  "music": null,
  "nsfw": false
}`
            }
            response={
`{
  "success": true,
  "post": {
    "id": 458,
    "text": "Текст нового поста",
    "content": "Текст нового поста",
    "author": {
      "id": 123,
      "username": "author",
      "name": "Автор поста",
      "photo": "avatar.jpg",
      "avatar_url": "/static/uploads/avatar/123/avatar.jpg",
      "verification": { "status": "verified" },
      "achievement": { "badge": "gold" }
    },
    "created_at": "2023-05-20T14:00:00Z",
    "updated_at": "2023-05-20T14:00:00Z",
    "likes_count": 0,
    "dislikes_count": 0,
    "comments_count": 0,
    "reposts_count": 0,
    "views_count": 0,
    "is_liked": false,
    "is_disliked": false,
    "is_owner": true,
    "is_reposted": false,
    "is_pinned": false,
    "is_edited": false,
    "type": "post",
    "media": ["/static/uploads/post/458/image.jpg"],
    "images": ["/static/uploads/post/458/image.jpg"],
    "video": null,
    "music": null,
    "fact": null,
    "repost": null,
    "comments": []
  }
}`
            }
          />
          
          <ApiEndpoint 
            method="PUT"
            path="/api/posts/:post_id"
            description="Редактирование поста (доступно в течение 3 часов после создания)."
            authRequired={true}
            request={
`PUT /api/posts/458
Content-Type: application/json
{
  "text": "Обновленный текст поста",
  "media": ["/static/uploads/post/458/new_image.jpg"],
  "images": ["/static/uploads/post/458/new_image.jpg"],
  "video": null,
  "music": null,
  "nsfw": false
}`
            }
            response={
`{
  "success": true,
  "post": {
    "id": 458,
    "text": "Обновленный текст поста",
    "content": "Обновленный текст поста",
    "author": {
      "id": 123,
      "username": "author",
      "name": "Автор поста",
      "photo": "avatar.jpg",
      "avatar_url": "/static/uploads/avatar/123/avatar.jpg",
      "verification": { "status": "verified" },
      "achievement": { "badge": "gold" }
    },
    "created_at": "2023-05-20T14:00:00Z",
    "updated_at": "2023-05-20T15:30:00Z",
    "likes_count": 0,
    "dislikes_count": 0,
    "comments_count": 0,
    "reposts_count": 0,
    "views_count": 0,
    "is_liked": false,
    "is_disliked": false,
    "is_owner": true,
    "is_reposted": false,
    "is_pinned": false,
    "is_edited": true,
    "type": "post",
    "media": ["/static/uploads/post/458/new_image.jpg"],
    "images": ["/static/uploads/post/458/new_image.jpg"],
    "video": null,
    "music": null,
    "fact": null,
    "repost": null,
    "comments": []
  }
}`
            }
          />
          
          <ApiEndpoint 
            method="DELETE"
            path="/api/posts/:post_id"
            description="Удаление поста. Доступно только автору поста или администратору."
            authRequired={true}
            request={
`DELETE /api/posts/458`
            }
            response={
`{
  "success": true,
  "message": "Пост успешно удален"
}`
            }
          />
          
          <ApiEndpoint 
            method="POST"
            path="/api/posts/:post_id/like"
            description="Лайк поста (переключает состояние)."
            authRequired={true}
            request={
`POST /api/posts/456/like`
            }
            response={
`{
  "success": true,
  "is_liked": true,
  "likes_count": 11,
  "dislikes_count": 2
}`
            }
          />
          
          <ApiEndpoint 
            method="GET"
            path="/api/posts/:post_id/likes"
            description="Получение списка пользователей, поставивших лайк на пост."
            authRequired={false}
            request={
`GET /api/posts/456/likes?page=1&per_page=20`
            }
            response={
`{
  "likes": [
    {
      "id": 125,
      "username": "liker",
      "name": "Пользователь",
      "photo": "avatar.jpg",
      "avatar_url": "/static/uploads/avatar/125/avatar.jpg",
      "verification": { "status": "unverified" },
      "achievement": null,
      "liked_at": "2023-05-20T12:30:00Z"
    }
  ],
  "total": 11,
  "page": 1,
  "per_page": 20,
  "pages": 1,
  "has_next": false,
  "has_prev": false
}`
            }
          />
          
          <ApiEndpoint 
            method="POST"
            path="/api/posts/:post_id/repost"
            description="Создание репоста."
            authRequired={true}
            request={
`POST /api/posts/456/repost
Content-Type: application/json
{
  "text": "Дополнительный текст к репосту"
}`
            }
            response={
`{
  "success": true,
  "repost": {
    "id": 459,
    "text": "Дополнительный текст к репосту",
    "content": "Дополнительный текст к репосту",
    "author": {
      "id": 123,
      "username": "author",
      "name": "Автор репоста",
      "photo": "avatar.jpg",
      "avatar_url": "/static/uploads/avatar/123/avatar.jpg",
      "verification": { "status": "verified" },
      "achievement": { "badge": "gold" }
    },
    "created_at": "2023-05-20T16:00:00Z",
    "updated_at": "2023-05-20T16:00:00Z",
    "likes_count": 0,
    "dislikes_count": 0,
    "comments_count": 0,
    "reposts_count": 0,
    "views_count": 0,
    "is_liked": false,
    "is_disliked": false,
    "is_owner": true,
    "is_reposted": false,
    "is_pinned": false,
    "is_edited": false,
    "type": "repost",
    "media": [],
    "images": [],
    "video": null,
    "music": null,
    "fact": null,
    "repost": {
      "id": 456,
      "text": "Оригинальный пост",
      "author": {
        "id": 124,
        "username": "original_author",
        "name": "Оригинальный автор",
        "photo": "avatar.jpg",
        "avatar_url": "/static/uploads/avatar/124/avatar.jpg",
        "verification": { "status": "verified" },
        "achievement": { "badge": "silver" }
      },
      "created_at": "2023-05-20T12:00:00Z",
      "likes_count": 10,
      "comments_count": 5,
      "media": ["/static/uploads/post/456/image.jpg"]
    },
    "comments": []
  }
}`
            }
          />
          
          <ApiEndpoint 
            method="DELETE"
            path="/api/reposts/:repost_id"
            description="Удаление репоста."
            authRequired={true}
            request={
`DELETE /api/reposts/459`
            }
            response={
`{
  "success": true,
  "message": "Репост успешно удален"
}`
            }
          />
          
          <ApiEndpoint 
            method="POST"
            path="/api/posts/:post_id/view"
            description="Отметить просмотр поста."
            authRequired={false}
            request={
`POST /api/posts/456/view`
            }
            response={
`{
  "success": true,
  "views_count": 151
}`
            }
          />
          
          <ApiEndpoint 
            method="POST"
            path="/api/facts"
            description="Создание факта."
            authRequired={true}
            request={
`POST /api/facts
Content-Type: application/json
{
  "text": "Интересный факт",
  "source": "Источник факта"
}`
            }
            response={
`{
  "success": true,
  "fact": {
    "id": 1,
    "text": "Интересный факт",
    "source": "Источник факта",
    "author": {
      "id": 123,
      "username": "author",
      "name": "Автор факта",
      "photo": "avatar.jpg",
      "avatar_url": "/static/uploads/avatar/123/avatar.jpg"
    },
    "created_at": "2023-05-20T17:00:00Z",
    "attached_to_post": null
  }
}`
            }
          />
          
          <ApiEndpoint 
            method="POST"
            path="/api/posts/:post_id/facts/attach"
            description="Прикрепить факт к посту."
            authRequired={true}
            request={
`POST /api/posts/456/facts/attach
Content-Type: application/json
{
  "fact_id": 1
}`
            }
            response={
`{
  "success": true,
  "message": "Факт прикреплен к посту"
}`
            }
          />
          
          <ApiEndpoint 
            method="POST"
            path="/api/posts/:post_id/facts/detach"
            description="Открепить факт от поста."
            authRequired={true}
            request={
`POST /api/posts/456/facts/detach`
            }
            response={
`{
  "success": true,
  "message": "Факт откреплен от поста"
}`
            }
          />
          
          <ApiEndpoint 
            method="GET"
            path="/api/facts"
            description="Получение списка фактов."
            authRequired={true}
            request={
`GET /api/facts?page=1&per_page=20`
            }
            response={
`{
  "facts": [
    {
      "id": 1,
      "text": "Интересный факт",
      "source": "Источник факта",
      "author": {
        "id": 123,
        "username": "author",
        "name": "Автор факта",
        "photo": "avatar.jpg",
        "avatar_url": "/static/uploads/avatar/123/avatar.jpg"
      },
      "created_at": "2023-05-20T17:00:00Z",
      "attached_to_post": 456
    }
  ],
  "total": 10,
  "page": 1,
  "per_page": 20,
  "pages": 1,
  "has_next": false,
  "has_prev": false
}`
            }
          />
          
          <ApiEndpoint 
            method="PUT"
            path="/api/facts/:fact_id"
            description="Обновление факта."
            authRequired={true}
            request={
`PUT /api/facts/1
Content-Type: application/json
{
  "text": "Обновленный факт",
  "source": "Новый источник"
}`
            }
            response={
`{
  "success": true,
  "fact": {
    "id": 1,
    "text": "Обновленный факт",
    "source": "Новый источник",
    "author": {
      "id": 123,
      "username": "author",
      "name": "Автор факта",
      "photo": "avatar.jpg",
      "avatar_url": "/static/uploads/avatar/123/avatar.jpg"
    },
    "created_at": "2023-05-20T17:00:00Z",
    "attached_to_post": 456
  }
}`
            }
          />
          
          <ApiEndpoint 
            method="DELETE"
            path="/api/facts/:fact_id"
            description="Удаление факта."
            authRequired={true}
            request={
`DELETE /api/facts/1`
            }
            response={
`{
  "success": true,
  "message": "Факт успешно удален"
}`
            }
          />
        </>
      )}
      {activeTab === 3 && (
        <>
          <SectionTitle variant="h5">
            <ApiIcon fontSize="medium" sx={{ mr: 1 }} />
            API комментариев
          </SectionTitle>
          <ApiEndpoint 
            method="GET"
            path="/api/posts/:post_id/comments"
            description="Получение списка комментариев к посту."
            authRequired={false}
            request={
`GET /api/posts/456/comments?page=1&per_page=20`
            }
            response={
`{
  "comments": [
    {
      "id": 789,
      "text": "Комментарий к посту",
      "author": {
        "id": 125,
        "username": "commenter",
        "name": "Комментатор",
        "photo": "/static/uploads/avatar/125/photo.jpg"
      },
      "created_at": "2023-05-20T12:30:00Z",
      "likes_count": 2,
      "is_liked": false
    }
  ],
  "total": 5,
  "page": 1,
  "pages": 1
}`
            }
          />
          <ApiEndpoint 
            method="POST"
            path="/api/posts/:post_id/comments"
            description="Добавление комментария к посту."
            authRequired={true}
            request={
`POST /api/posts/456/comments
Content-Type: application/json
{
  "text": "Текст нового комментария"
}`
            }
            response={
`{
  "success": true,
  "comment": {
    "id": 790,
    "text": "Текст нового комментария",
    "author": {
      "id": 123,
      "username": "author",
      "name": "Автор комментария",
      "photo": "/static/uploads/avatar/123/photo.jpg"
    },
    "created_at": "2023-05-20T14:30:00Z",
    "likes_count": 0,
    "is_liked": false
  }
}`
            }
          />
          <ApiEndpoint 
            method="DELETE"
            path="/api/comments/:comment_id"
            description="Удаление комментария. Доступно только автору комментария или администратору."
            authRequired={true}
            request={
`DELETE /api/comments/790`
            }
            response={
`{
  "success": true,
  "message": "Комментарий успешно удален"
}`
            }
          />
          <ApiEndpoint 
            method="POST"
            path="/api/comments/:comment_id/like"
            description="Лайк комментария."
            authRequired={true}
            request={
`POST /api/comments/789/like`
            }
            response={
`{
  "success": true,
  "is_liked": true,
  "likes_count": 3
}`
            }
          />
          <ApiEndpoint 
            method="POST"
            path="/api/comments/:comment_id/unlike"
            description="Удаление лайка с комментария."
            authRequired={true}
            request={
`POST /api/comments/789/unlike`
            }
            response={
`{
  "success": true,
  "is_liked": false,
  "likes_count": 2
}`
            }
          />
        </>
      )}
      {activeTab === 4 && (
        <>
          <SectionTitle variant="h5">
            <ApiIcon fontSize="medium" sx={{ mr: 1 }} />
            API уведомлений
          </SectionTitle>
          <ApiEndpoint 
            method="GET"
            path="/api/notifications"
            description="Получение списка уведомлений текущего пользователя."
            authRequired={true}
            request={
`GET /api/notifications?page=1&per_page=20`
            }
            response={
`{
  "notifications": [
    {
      "id": 321,
      "type": "like",
      "text": "Пользователь лайкнул ваш пост",
      "is_read": false,
      "created_at": "2023-05-20T12:00:00Z",
      "link": "/post/456",
      "from_user": {
        "id": 125,
        "username": "liker",
        "name": "Пользователь",
        "photo": "/static/uploads/avatar/125/photo.jpg"
      }
    },
    {
      "id": 322,
      "type": "comment",
      "text": "Пользователь прокомментировал ваш пост",
      "is_read": true,
      "created_at": "2023-05-20T11:30:00Z",
      "link": "/post/456",
      "from_user": {
        "id": 126,
        "username": "commenter",
        "name": "Комментатор",
        "photo": "/static/uploads/avatar/126/photo.jpg"
      }
    }
  ],
  "unread_count": 1,
  "total": 10,
  "page": 1,
  "pages": 1
}`
            }
          />
          <ApiEndpoint 
            method="POST"
            path="/api/notifications/read-all"
            description="Пометить все уведомления как прочитанные."
            authRequired={true}
            request={
`POST /api/notifications/read-all`
            }
            response={
`{
  "success": true,
  "message": "Все уведомления помечены как прочитанные",
  "unread_count": 0
}`
            }
          />
          <ApiEndpoint 
            method="POST"
            path="/api/notifications/:notification_id/read"
            description="Пометить конкретное уведомление как прочитанное."
            authRequired={true}
            request={
`POST /api/notifications/321/read`
            }
            response={
`{
  "success": true,
  "message": "Уведомление помечено как прочитанное",
  "unread_count": 0
}`
            }
          />
          <ApiEndpoint 
            method="POST"
            path="/api/push/subscribe"
            description="Подписка на push-уведомления."
            authRequired={true}
            request={
`POST /api/push/subscribe
Content-Type: application/json
{
  "subscription": {
    "endpoint": "https:
    "keys": {
      "p256dh": "...",
      "auth": "..."
    }
  }
}`
            }
            response={
`{
  "success": true,
  "message": "Подписка на push-уведомления успешно создана"
}`
            }
          />
          <ApiEndpoint 
            method="DELETE"
            path="/api/push/unsubscribe"
            description="Отписка от push-уведомлений."
            authRequired={true}
            request={
`DELETE /api/push/unsubscribe
Content-Type: application/json
{
  "endpoint": "https:
}`
            }
            response={
`{
  "success": true,
  "message": "Подписка на push-уведомления успешно удалена"
}`
            }
          />
          <ApiEndpoint
            method="POST"
            path="/api/notifications/test"
            description="Отправка тестового push-уведомления текущему пользователю."
            authRequired={true}
            request={`POST /api/notifications/test
Content-Type: application/json
{
  "title": "Тестовое уведомление",
  "body": "Это тестовое push-уведомление",
  "url": "/notifications"
}`}
            response={`{
  "success": true,
  "message": "Тестовое уведомление отправлено"
}`}
          />
        </>
      )}
            {activeTab === 5 && (
        <>
          <SectionTitle variant="h5">
            <ApiIcon fontSize="medium" sx={{ mr: 1 }} />
            API лидерборда
          </SectionTitle>
          
          <ApiEndpoint
            method="GET"
            path="/api/leaderboard"
            description="Получение рейтинга пользователей по их активности за определенный период."
            authRequired={false}
            request={
`GET /api/leaderboard?period=week&limit=20`
            }
            response={
`{
  "success": true,
  "leaderboard": [
    {
      "id": 123,
      "name": "Пользователь",
      "username": "username",
      "photo": "avatar.jpg",
      "avatar_url": "/static/uploads/avatar/123/avatar.jpg",
      "verification": { "status": "verified" },
      "achievement": { "badge": "gold" },
      "decoration": {
        "background": "gradient_1",
        "item_path": "/static/decorations/gradient_1.svg"
      },
      "stats": {
        "posts_count": 15,
        "followers_count": 42
      },
      "score": 250,
      "activity_data": {
        "posts_count": 5,
        "likes_received": 20,
        "comments_count": 10,
        "comment_likes": 5,
        "replies_count": 3,
        "reply_likes": 2,
        "reposts_count": 2,
        "stories_count": 8,
        "story_views": 50,
        "story_reactions": 15
      }
    }
  ],
  "time_period": "week",
  "date_range": {
    "start": "2024-01-01T00:00:00Z",
    "end": "2024-01-07T23:59:59Z"
  },
  "current_user": {
    "position": 5,
    "score": 180
  },
  "snapshot_generated_at": "2024-01-07T20:00:00Z"
}`
            }
          />
          
          <ApiEndpoint
            method="GET"
            path="/api/leaderboard/user/:user_id"
            description="Получение детальной статистики конкретного пользователя в лидерборде."
            authRequired={false}
            request={
`GET /api/leaderboard/user/123?period=week`
            }
            response={
`{
  "success": true,
  "user": {
    "id": 123,
    "name": "Пользователь",
    "username": "username",
    "photo": "avatar.jpg",
    "avatar_url": "/static/uploads/avatar/123/avatar.jpg"
  },
  "score": 250,
  "position": 5,
  "breakdown": {
    "posts": {
      "count": 5,
      "points": 25,
      "weight": 5
    },
    "post_likes": {
      "count": 20,
      "points": 20,
      "weight": 1
    },
    "comments": {
      "count": 10,
      "points": 50,
      "weight": 5
    },
    "comment_likes": {
      "count": 5,
      "points": 5,
      "weight": 1
    },
    "replies": {
      "count": 3,
      "points": 9,
      "weight": 3
    },
    "reply_likes": {
      "count": 2,
      "points": 2,
      "weight": 1
    },
    "reposts": {
      "count": 2,
      "points": 8,
      "weight": 4
    },
    "stories": {
      "count": 8,
      "points": 16,
      "weight": 2
    },
    "story_views": {
      "count": 50,
      "points": 50,
      "weight": 1
    },
    "story_reactions": {
      "count": 15,
      "points": 30,
      "weight": 2
    }
  },
  "time_period": "week",
  "date_range": {
    "start": "2024-01-01T00:00:00Z",
    "end": "2024-01-07T23:59:59Z"
  }
}`
            }
          />
          
          <Box sx={{ 
            mb: 4, 
            p: 3, 
            borderRadius: 2,
            backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.info.main, 0.05) : alpha(theme.palette.info.main, 0.03),
            border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SecurityIcon sx={{ mr: 1, color: theme.palette.info.main }} />
              <Typography variant="h6">Система подсчета очков</Typography>
            </Box>
            <Typography variant="body2" paragraph>
              Очки в лидерборде начисляются за различные виды активности:
            </Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              <li><strong>Создание поста:</strong> 5 очков</li>
              <li><strong>Лайк на посте:</strong> 1 очко</li>
              <li><strong>Создание комментария:</strong> 5 очков</li>
              <li><strong>Лайк на комментарии:</strong> 1 очко</li>
              <li><strong>Создание ответа:</strong> 3 очка</li>
              <li><strong>Лайк на ответе:</strong> 1 очко</li>
              <li><strong>Репост:</strong> 4 очка</li>
              <li><strong>Создание истории:</strong> 2 очка</li>
              <li><strong>Просмотр истории:</strong> 1 очко</li>
              <li><strong>Реакция на историю:</strong> 2 очка</li>
            </Box>
            <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
              <strong>Примечание:</strong> Активность каналов не учитывается в лидерборде. 
              Периоды: неделя (с воскресенья 19:00 МСК), месяц, все время.
            </Typography>
          </Box>
        </>
      )}
      {activeTab === 6 && (
        <>
          <ApiTitle>
            <SearchIcon fontSize="large" />
            Поиск
          </ApiTitle>
          <ApiEndpoint
            method="GET"
            path="/api/search"
            description="Поиск пользователей и постов по запросу."
            authRequired={false}
            request={`GET /api/search?q=запрос&type=all&page=1&per_page=10`}
            response={`{
  "users": [
  ],
  "posts": [
    {
      "id": 456,
      "content": "Текст поста, содержащий запрос",
      "timestamp": "2023-06-15T14:30:45",
      "image": "/static/uploads/post/456/image.jpg",
      "video": null,
      "user": {
        "id": 123,
        "name": "Пользователь",
        "username": "username",
        "photo": "/static/uploads/avatar/123/avatar.png"
      }
    }
  ]
}`}
          />
          <ApiEndpoint
            method="GET"
            path="/api/search"
            description="Поиск только пользователей."
            authRequired={false}
            request={`GET /api/search?q=запрос&type=users&page=1&per_page=20`}
            response={`{
  "users": [
  ],
  "has_next": true,
  "total": 35,
  "page": 1,
  "pages": 2
}`}
          />
          <ApiEndpoint
            method="GET"
            path="/api/search"
            description="Поиск только постов."
            authRequired={false}
            request={`GET /api/search?q=запрос&type=posts&page=1&per_page=20`}
            response={`{
  "posts": [
    {
      "id": 456,
      "content": "Текст поста, содержащий запрос",
      "timestamp": "2023-06-15T14:30:45",
      "image": "/static/uploads/post/456/image.jpg",
      "video": null,
      "user": {
        "id": 123,
        "name": "Пользователь",
        "username": "username",
        "photo": "/static/uploads/avatar/123/avatar.png"
      }
    }
  ],
  "has_next": true,
  "total": 42,
  "page": 1,
  "pages": 3
}`}
          />
        </>
      )}
      {activeTab === 7 && (
        <>
          <SectionTitle variant="h5">
            <ApiIcon fontSize="medium" sx={{ mr: 1 }} />
            API музыки
          </SectionTitle>
          
          <Box sx={{ 
            mb: 4, 
            p: 3, 
            borderRadius: 2,
            backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.warning.main, 0.05) : alpha(theme.palette.warning.main, 0.03),
            border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SecurityIcon sx={{ mr: 1, color: theme.palette.warning.main }} />
              <Typography variant="h6">Специальный ключ для загрузки музыки</Typography>
            </Box>
            <Typography variant="body2" paragraph>
              Для загрузки треков и текстов песен используется отдельный ключ доступа. В отличие от общего API-ключа, 
              музыкальный ключ работает только с эндпоинтами загрузки музыки.
            </Typography>
            
            <SectionTitle variant="subtitle2">Использование X-Key для загрузки треков</SectionTitle>
            <Typography variant="body2" paragraph>
              При загрузке треков (/api/music/upload) или текстов песен (/api/music/&lt;track_id&gt;/lyrics/upload), 
              необходимо добавить заголовок <code>X-Key</code> с соответствующим ключом, полученным у администрации.
            </Typography>
            
            <CodeBlock>
{`// Пример запроса для загрузки трека с X-Key
fetch('https://k-connect.ru/api/music/upload', {
  method: 'POST',
  headers: {
    'X-Key': 'ваш-ключ-для-музыки'
  },
  body: formData // FormData с файлами и метаданными трека
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Ошибка:', error));`}
            </CodeBlock>
            
            <Typography variant="body2" sx={{ 
              mt: 2, 
              p: 2, 
              borderRadius: 1,
              backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.info.main, 0.1) : alpha(theme.palette.info.main, 0.05),
              color: theme.palette.info.main,
              border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
            }}>
              <b>Примечание:</b> Музыкальный ключ (X-Key) работает <i>только</i> с эндпоинтами загрузки. Для других операций с музыкой используйте стандартный API-ключ (X-API-Key).
            </Typography>
          </Box>
          
          <ApiEndpoint
            method="GET"
            path="/api/music"
            description="Получение списка всей музыки с пагинацией."
            authRequired={false}
            request={
`GET /api/music?page=1&per_page=20`
            }
            response={
`{
  "success": true,
  "tracks": [
    {
      "id": 123,
      "title": "Название трека",
      "artist": "Исполнитель",
      "album": "Альбом",
      "duration": 180,
      "file_path": "/static/music/456/123/track.mp3",
      "cover_path": "/static/music/456/123/cover.jpg",
      "user_id": 456,
      "user_name": "Загрузивший пользователь",
      "user_username": "username",
      "genre": "Жанр",
      "description": "Описание трека",
      "plays_count": 42,
      "likes_count": 15,
      "verified": false,
      "artist_id": null,
      "created_at": "2023-06-15T14:30:45",
      "is_liked": false
    }
  ],
  "total": 100,
  "pages": 5,
  "current_page": 1
}`
            }
          />
          
          <ApiEndpoint
            method="GET"
            path="/api/music/user/:user_id"
            description="Получение музыки конкретного пользователя."
            authRequired={false}
            request={
`GET /api/music/user/456?page=1&per_page=20`
            }
            response={
`{
  "success": true,
  "tracks": [
    {
      "id": 123,
      "title": "Название трека",
      "artist": "Исполнитель",
      "album": "Альбом",
      "duration": 180,
      "file_path": "/static/music/456/123/track.mp3",
      "cover_path": "/static/music/456/123/cover.jpg",
      "user_id": 456,
      "user_name": "Загрузивший пользователь",
      "user_username": "username",
      "genre": "Жанр",
      "description": "Описание трека",
      "plays_count": 42,
      "likes_count": 15,
      "verified": false,
      "artist_id": null,
      "created_at": "2023-06-15T14:30:45",
      "is_liked": false
    }
  ],
  "total": 5,
  "pages": 1,
  "current_page": 1,
  "user": {
    "id": 456,
    "name": "Загрузивший пользователь",
    "username": "username",
    "avatar_url": "/static/uploads/avatar/456/avatar.png"
  }
}`
            }
          />
          
          <ApiEndpoint
            method="GET"
            path="/api/music/:track_id"
            description="Получение информации о конкретном треке."
            authRequired={false}
            request={
`GET /api/music/123`
            }
            response={
`{
  "success": true,
  "track": {
    "id": 123,
    "title": "Название трека",
    "artist": "Исполнитель",
    "album": "Альбом",
    "duration": 180,
    "file_path": "/static/music/456/123/track.mp3",
    "cover_path": "/static/music/456/123/cover.jpg",
    "user_id": 456,
    "user_name": "Загрузивший пользователь",
    "user_username": "username",
    "genre": "Жанр",
    "description": "Описание трека",
    "plays_count": 43,
    "likes_count": 15,
    "verified": false,
    "artist_id": null,
    "created_at": "2023-06-15T14:30:45",
    "is_liked": false,
    "artist_info": {
      "id": 1,
      "avatar_url": "/static/artists/artist1.jpg",
      "verified": true
    }
  }
}`
            }
          />
          
          <ApiEndpoint
            method="POST"
            path="/api/music/:track_id/like"
            description="Лайк/анлайк трека."
            authRequired={true}
            request={
`POST /api/music/123/like`
            }
            response={
`{
  "success": true,
  "message": "Лайк добавлен",
  "likes_count": 16
}`
            }
          />
          
          <ApiEndpoint
            method="POST"
            path="/api/music/upload"
            description="Загрузка нового трека (одиночная или множественная)."
            authRequired={true}
            request={
`POST /api/music/upload
Content-Type: multipart/form-data

// Одиночная загрузка:
file: [аудиофайл]
cover: [изображение]
title: "Название трека"
artist: "Исполнитель"
album: "Альбом"
genre: "Жанр"
description: "Описание"
duration: 180

// Множественная загрузка:
file[0]: [аудиофайл1]
cover[0]: [изображение1]
title[0]: "Трек 1"
artist[0]: "Исполнитель 1"
// ... и так далее для каждого трека`
            }
            response={
`{
  "success": true,
  "message": "Трек успешно загружен",
  "track": {
    "id": 124,
    "title": "Название трека",
    "artist": "Исполнитель",
    "album": "Альбом",
    "duration": 180,
    "file_path": "/static/music/456/124/track.mp3",
    "cover_path": "/static/music/456/124/cover.jpg",
    "user_id": 456,
    "user_name": "Загрузивший пользователь",
    "user_username": "username",
    "genre": "Жанр",
    "description": "Описание трека",
    "plays_count": 0,
    "likes_count": 0,
    "verified": false,
    "artist_id": null,
    "created_at": "2023-06-15T15:30:45",
    "is_liked": false
  }
}`
            }
          />
          
          <ApiEndpoint
            method="POST"
            path="/api/music/metadata"
            description="Извлечение метаданных из аудиофайла."
            authRequired={false}
            request={
`POST /api/music/metadata
Content-Type: multipart/form-data

file: [аудиофайл]`
            }
            response={
`{
  "success": true,
  "metadata": {
    "title": "Название трека",
    "artist": "Исполнитель",
    "album": "Альбом",
    "genre": "Жанр",
    "cover_data": "data:image/jpeg;base64,...",
    "cover_mime": "image/jpeg",
    "duration": 180,
    "file_format": "MP3",
    "sample_rate": 44100,
    "bit_depth": 16,
    "channels": 2,
    "file_size": 5242880
  }
}`
            }
          />
          
          <ApiEndpoint
            method="GET"
            path="/api/music/popular"
            description="Получение популярной музыки по числу прослушиваний."
            authRequired={false}
            request={
`GET /api/music/popular?limit=10`
            }
            response={
`{
  "success": true,
  "tracks": [
    {
      "id": 123,
      "title": "Популярный трек",
      "artist": "Исполнитель",
      "album": "Альбом",
      "duration": 180,
      "file_path": "/static/music/456/123/track.mp3",
      "cover_path": "/static/music/456/123/cover.jpg",
      "user_id": 456,
      "user_name": "Загрузивший пользователь",
      "user_username": "username",
      "genre": "Жанр",
      "description": "Описание трека",
      "plays_count": 1000,
      "likes_count": 50,
      "verified": false,
      "artist_id": null,
      "created_at": "2023-06-15T14:30:45",
      "is_liked": false
    }
  ]
}`
            }
          />
          
          <ApiEndpoint
            method="GET"
            path="/api/music/liked"
            description="Получение лайкнутых треков пользователя."
            authRequired={true}
            request={
`GET /api/music/liked?page=1&per_page=20`
            }
            response={
`{
  "success": true,
  "tracks": [
    {
      "id": 123,
      "title": "Лайкнутый трек",
      "artist": "Исполнитель",
      "album": "Альбом",
      "duration": 180,
      "file_path": "/static/music/456/123/track.mp3",
      "cover_path": "/static/music/456/123/cover.jpg",
      "user_id": 456,
      "user_name": "Загрузивший пользователь",
      "user_username": "username",
      "genre": "Жанр",
      "description": "Описание трека",
      "plays_count": 42,
      "likes_count": 15,
      "verified": false,
      "artist_id": null,
      "created_at": "2023-06-15T14:30:45",
      "is_liked": true
    }
  ],
  "total": 5,
  "pages": 1,
  "current_page": 1
}`
            }
          />
          
          <ApiEndpoint
            method="GET"
            path="/api/music/random"
            description="Получение случайного трека."
            authRequired={false}
            request={
`GET /api/music/random?exclude_id=123`
            }
            response={
`{
  "success": true,
  "track": {
    "id": 124,
    "title": "Случайный трек",
    "artist": "Исполнитель",
    "album": "Альбом",
    "duration": 180,
    "file_path": "/static/music/456/124/track.mp3",
    "cover_path": "/static/music/456/124/cover.jpg",
    "user_id": 456,
    "user_name": "Загрузивший пользователь",
    "user_username": "username",
    "genre": "Жанр",
    "description": "Описание трека",
    "plays_count": 42,
    "likes_count": 15,
    "verified": false,
    "artist_id": null,
    "created_at": "2023-06-15T14:30:45",
    "is_liked": false
  }
}`
            }
          />
          
          <ApiEndpoint
            method="GET"
            path="/api/music/next"
            description="Получение следующего трека в контексте воспроизведения."
            authRequired={false}
            request={
`GET /api/music/next?current_id=123&context=liked`
            }
            response={
`{
  "success": true,
  "track": {
    "id": 124,
    "title": "Следующий трек",
    "artist": "Исполнитель",
    "album": "Альбом",
    "duration": 180,
    "file_path": "/static/music/456/124/track.mp3",
    "cover_path": "/static/music/456/124/cover.jpg",
    "user_id": 456,
    "user_name": "Загрузивший пользователь",
    "user_username": "username",
    "genre": "Жанр",
    "description": "Описание трека",
    "plays_count": 42,
    "likes_count": 15,
    "verified": false,
    "artist_id": null,
    "created_at": "2023-06-15T14:30:45",
    "is_liked": true
  }
}`
            }
          />
          
          <ApiEndpoint
            method="GET"
            path="/api/music/previous"
            description="Получение предыдущего трека в контексте воспроизведения."
            authRequired={false}
            request={
`GET /api/music/previous?current_id=123&context=liked`
            }
            response={
`{
  "success": true,
  "track": {
    "id": 122,
    "title": "Предыдущий трек",
    "artist": "Исполнитель",
    "album": "Альбом",
    "duration": 180,
    "file_path": "/static/music/456/122/track.mp3",
    "cover_path": "/static/music/456/122/cover.jpg",
    "user_id": 456,
    "user_name": "Загрузивший пользователь",
    "user_username": "username",
    "genre": "Жанр",
    "description": "Описание трека",
    "plays_count": 42,
    "likes_count": 15,
    "verified": false,
    "artist_id": null,
    "created_at": "2023-06-15T14:30:45",
    "is_liked": true
  }
}`
            }
          />
          
          <ApiEndpoint
            method="GET"
            path="/api/music/search"
            description="Поиск музыкальных треков с поддержкой русского языка."
            authRequired={true}
            request={
`GET /api/music/search?query=запрос`
            }
            response={
`[
  {
    "id": 123,
    "title": "Найденный трек",
    "artist": "Исполнитель",
    "album": "Альбом",
    "duration": 180,
    "file_path": "/static/music/456/123/track.mp3",
    "cover_path": "/static/music/456/123/cover.jpg",
    "user_id": 456,
    "user_name": "Загрузивший пользователь",
    "user_username": "username",
    "genre": "Жанр",
    "description": "Описание трека",
    "plays_count": 42,
    "likes_count": 15,
    "verified": false,
    "artist_id": null,
    "created_at": "2023-06-15T14:30:45",
    "is_liked": false
  }
]`
            }
          />
          
          <ApiEndpoint
            method="POST"
            path="/api/music/:track_id/play"
            description="Увеличение счетчика прослушиваний трека."
            authRequired={false}
            request={
`POST /api/music/123/play`
            }
            response={
`{
  "success": true,
  "message": "Счетчик прослушиваний увеличен",
  "plays_count": 44
}`
            }
          />
          
          <ApiEndpoint
            method="GET"
            path="/api/music/tracks"
            description="Получение треков с пагинацией и различными опциями сортировки."
            authRequired={false}
            request={
`GET /api/music/tracks?type=all&offset=0&limit=10&sort=newest`
            }
            response={
`{
  "success": true,
  "tracks": [
    {
      "id": 123,
      "title": "Название трека",
      "artist": "Исполнитель",
      "album": "Альбом",
      "duration": 180,
      "file_path": "/static/music/456/123/track.mp3",
      "cover_path": "/static/music/456/123/cover.jpg",
      "user_id": 456,
      "user_name": "Загрузивший пользователь",
      "user_username": "username",
      "genre": "Жанр",
      "description": "Описание трека",
      "plays_count": 42,
      "likes_count": 15,
      "verified": false,
      "artist_id": null,
      "created_at": "2023-06-15T14:30:45",
      "is_liked": false
    }
  ],
  "total": 100,
  "offset": 0,
  "limit": 10,
  "has_more": true
}`
            }
          />
          
          <ApiEndpoint
            method="GET"
            path="/api/music/charts"
            description="Получение музыкальных чартов по различным критериям."
            authRequired={false}
            request={
`GET /api/music/charts?type=combined&limit=20`
            }
            response={
`{
  "success": true,
  "charts": {
    "most_played": [
      {
        "id": 123,
        "title": "Самый популярный трек",
        "artist": "Исполнитель",
        "plays_count": 1000,
        "likes_count": 50
      }
    ],
    "most_liked": [
      {
        "id": 124,
        "title": "Самый лайкнутый трек",
        "artist": "Исполнитель",
        "plays_count": 500,
        "likes_count": 100
      }
    ],
    "trending": [
      {
        "id": 125,
        "title": "Трендовый трек",
        "artist": "Исполнитель",
        "plays_count": 800,
        "likes_count": 75,
        "score": 1025
      }
    ],
    "new_releases": [
      {
        "id": 126,
        "title": "Новый трек",
        "artist": "Исполнитель",
        "plays_count": 100,
        "likes_count": 10
      }
    ]
  }
}`
            }
          />
          
          <ApiEndpoint
            method="GET"
            path="/api/music/artist"
            description="Получение информации об исполнителе по ID."
            authRequired={false}
            request={
`GET /api/music/artist?id=1&page=1&per_page=20`
            }
            response={
`{
  "success": true,
  "artist": {
    "id": 1,
    "name": "Исполнитель",
    "avatar_url": "/static/artists/artist1.jpg",
    "bio": "Биография исполнителя",
    "genres": ["Рок", "Поп"],
    "instagram": "https://instagram.com/artist",
    "twitter": "https://twitter.com/artist",
    "facebook": "https://facebook.com/artist",
    "website": "https://artist.com",
    "verified": true,
    "source": "discogs",
    "external_id": "12345",
    "tracks_count": 10,
    "tracks": [
      {
        "id": 123,
        "title": "Трек исполнителя",
        "artist": "Исполнитель",
        "album": "Альбом",
        "duration": 180,
        "file_path": "/static/music/456/123/track.mp3",
        "cover_path": "/static/music/456/123/cover.jpg",
        "user_id": 456,
        "user_name": "Загрузивший пользователь",
        "user_username": "username",
        "genre": "Рок",
        "plays_count": 42,
        "likes_count": 15,
        "verified": false,
        "artist_id": 1,
        "created_at": "2023-06-15T14:30:45",
        "is_liked": false
      }
    ],
    "tracks_pages": 1,
    "current_page": 1
  }
}`
            }
          />
          
          <ApiEndpoint
            method="GET"
            path="/api/music/:track_id/lyrics"
            description="Получение текста песни для трека."
            authRequired={false}
            request={
`GET /api/music/123/lyrics`
            }
            response={
`{
  "track_id": 123,
  "has_lyrics": true,
  "has_synced_lyrics": true,
  "lyrics": "Текст песни...",
  "synced_lyrics": [
    {
      "text": "Первая строка",
      "startTimeMs": 0,
      "lineId": "line-1"
    },
    {
      "text": "Вторая строка",
      "startTimeMs": 3000,
      "lineId": "line-2"
    }
  ],
  "source_url": "https://example.com/lyrics"
}`
            }
          />
          
          <ApiEndpoint
            method="POST"
            path="/api/music/:track_id/lyrics/upload"
            description="Загрузка текста песни для трека."
            authRequired={true}
            request={
`POST /api/music/123/lyrics/upload
Content-Type: multipart/form-data

// Текстовый файл с синхронизированными текстами
file: [lyrics.json или lyrics.lrc]

// Или JSON данные
{
  "synced_lyrics": [
    {
      "text": "Первая строка",
      "startTimeMs": 0
    }
  ]
}`
            }
            response={
`{
  "success": true,
  "message": "Synchronized lyrics uploaded successfully",
  "path": "/static/uploads/lyrics/track_123.json",
  "copyright_notice": "Убедитесь, что вы не нарушаете авторские права при добавлении текстов песен"
}`
            }
          />
          
          <ApiEndpoint
            method="GET"
            path="/api/music/my-vibe"
            description="Получение персонализированного плейлиста 'Мой Вайб'."
            authRequired={true}
            request={
`GET /api/music/my-vibe`
            }
            response={
`{
  "success": true,
  "tracks": [
    {
      "id": 123,
      "title": "Рекомендованный трек",
      "artist": "Исполнитель",
      "album": "Альбом",
      "duration": 180,
      "file_path": "/static/music/456/123/track.mp3",
      "cover_path": "/static/music/456/123/cover.jpg",
      "user_id": 456,
      "user_name": "Загрузивший пользователь",
      "user_username": "username",
      "genre": "Жанр",
      "description": "Описание трека",
      "plays_count": 42,
      "likes_count": 15,
      "verified": false,
      "artist_id": null,
      "created_at": "2023-06-15T14:30:45",
      "is_liked": false
    }
  ],
  "message": "Для вас подобраны популярные и случайные треки. Лайкайте то, что нравится, чтобы улучшить рекомендации!"
}`
            }
          />
          
          <ApiEndpoint
            method="GET"
            path="/api/music/playlists"
            description="Получение плейлистов текущего пользователя."
            authRequired={true}
            request={
`GET /api/music/playlists`
            }
            response={
`{
  "success": true,
  "playlists": [
    {
      "id": 1,
      "name": "Мой плейлист",
      "description": "Описание плейлиста",
      "is_public": true,
      "cover_url": "/static/uploads/playlists/456/1/cover.jpg",
      "track_count": 10,
      "created_at": "2023-06-15T14:30:45",
      "updated_at": "2023-06-15T15:30:45"
    }
  ]
}`
            }
          />
          
          <ApiEndpoint
            method="GET"
            path="/api/music/playlists/:playlist_id"
            description="Получение детальной информации о плейлисте."
            authRequired={false}
            request={
`GET /api/music/playlists/1`
            }
            response={
`{
  "success": true,
  "playlist": {
    "id": 1,
    "name": "Мой плейлист",
    "description": "Описание плейлиста",
    "cover_image": "/static/uploads/playlists/456/1/cover.jpg",
    "cover_url": "/static/uploads/playlists/456/1/cover.jpg",
    "tracks_count": 10,
    "tracks": [
      {
        "id": 123,
        "title": "Трек в плейлисте",
        "artist": "Исполнитель",
        "album": "Альбом",
        "duration": 180,
        "file_path": "/static/music/456/123/track.mp3",
        "cover_path": "/static/music/456/123/cover.jpg",
        "user_id": 456,
        "user_name": "Загрузивший пользователь",
        "user_username": "username",
        "genre": "Жанр",
        "description": "Описание трека",
        "plays_count": 42,
        "likes_count": 15,
        "verified": false,
        "artist_id": null,
        "created_at": "2023-06-15T14:30:45",
        "is_liked": false,
        "position": 1,
        "added_at": "2023-06-15T16:30:45"
      }
    ],
    "owner": {
      "id": 456,
      "name": "Владелец плейлиста",
      "username": "username",
      "avatar_url": "/static/uploads/avatar/456/avatar.png"
    },
    "is_public": true,
    "created_at": "2023-06-15T14:30:45",
    "updated_at": "2023-06-15T15:30:45",
    "is_owner": true
  }
}`
            }
          />
          
          <ApiEndpoint
            method="POST"
            path="/api/music/playlists"
            description="Создание нового плейлиста."
            authRequired={true}
            request={
`POST /api/music/playlists
Content-Type: multipart/form-data

name: "Новый плейлист"
description: "Описание плейлиста"
is_public: "true"
cover: [изображение]
track_ids: "[123, 124, 125]"`
            }
            response={
`{
  "success": true,
  "message": "Плейлист создан",
  "playlist": {
    "id": 2,
    "name": "Новый плейлист",
    "description": "Описание плейлиста",
    "is_public": true,
    "cover_url": "/static/uploads/playlists/456/2/cover.jpg",
    "track_count": 3,
    "tracks": [
      {
        "id": 123,
        "title": "Трек 1",
        "artist": "Исполнитель 1"
      },
      {
        "id": 124,
        "title": "Трек 2",
        "artist": "Исполнитель 2"
      },
      {
        "id": 125,
        "title": "Трек 3",
        "artist": "Исполнитель 3"
      }
    ],
    "created_at": "2023-06-15T16:30:45",
    "updated_at": "2023-06-15T16:30:45"
  }
}`
            }
          />
          
          <ApiEndpoint
            method="PUT"
            path="/api/music/playlists/:playlist_id"
            description="Обновление плейлиста."
            authRequired={true}
            request={
`PUT /api/music/playlists/1
Content-Type: multipart/form-data

name: "Обновленный плейлист"
description: "Новое описание"
is_public: "false"
cover: [новое изображение]`
            }
            response={
`{
  "success": true,
  "message": "Плейлист обновлен",
  "playlist": {
    "id": 1,
    "name": "Обновленный плейлист",
    "description": "Новое описание",
    "is_public": false,
    "cover_url": "/static/uploads/playlists/456/1/new_cover.jpg",
    "created_at": "2023-06-15T14:30:45",
    "updated_at": "2023-06-15T17:30:45"
  }
}`
            }
          />
          
          <ApiEndpoint
            method="DELETE"
            path="/api/music/playlists/:playlist_id"
            description="Удаление плейлиста."
            authRequired={true}
            request={
`DELETE /api/music/playlists/1`
            }
            response={
`{
  "success": true,
  "message": "Плейлист удален"
}`
            }
          />
          
          <ApiEndpoint
            method="POST"
            path="/api/music/playlists/:playlist_id/tracks"
            description="Добавление треков в плейлист."
            authRequired={true}
            request={
`POST /api/music/playlists/1/tracks
Content-Type: application/json

{
  "track_ids": [123, 124, 125]
}`
            }
            response={
`{
  "success": true,
  "message": "Добавлено 3 треков",
  "added_tracks": [
    {
      "id": 123,
      "title": "Трек 1",
      "artist": "Исполнитель 1",
      "position": 1
    },
    {
      "id": 124,
      "title": "Трек 2",
      "artist": "Исполнитель 2",
      "position": 2
    },
    {
      "id": 125,
      "title": "Трек 3",
      "artist": "Исполнитель 3",
      "position": 3
    }
  ],
  "added_count": 3
}`
            }
          />
          
          <ApiEndpoint
            method="DELETE"
            path="/api/music/playlists/:playlist_id/tracks/:track_id"
            description="Удаление трека из плейлиста."
            authRequired={true}
            request={
`DELETE /api/music/playlists/1/tracks/123`
            }
            response={
`{
  "success": true,
  "message": "Трек удален из плейлиста"
}`
            }
          />
          
          <ApiEndpoint
            method="POST"
            path="/api/music/playlists/:playlist_id/tracks/reorder"
            description="Изменение порядка треков в плейлисте."
            authRequired={true}
            request={
`POST /api/music/playlists/1/tracks/reorder
Content-Type: application/json

{
  "track_order": [125, 123, 124]
}`
            }
            response={
`{
  "success": true,
  "message": "Порядок треков изменен"
}`
            }
          />
          
          <ApiEndpoint
            method="GET"
            path="/api/music/playlists/public"
            description="Получение публичных плейлистов."
            authRequired={false}
            request={
`GET /api/music/playlists/public?page=1&per_page=10`
            }
            response={
`{
  "success": true,
  "playlists": [
    {
      "id": 1,
      "name": "Публичный плейлист",
      "description": "Описание плейлиста",
      "cover_image": "/static/uploads/playlists/456/1/cover.jpg",
      "cover_url": "/static/uploads/playlists/456/1/cover.jpg",
      "tracks_count": 10,
      "preview_tracks": [
        {
          "id": 123,
          "title": "Трек 1",
          "artist": "Исполнитель 1",
          "cover_path": "/static/music/456/123/cover.jpg"
        }
      ],
      "is_owner": false,
      "owner": {
        "id": 456,
        "name": "Владелец плейлиста",
        "username": "username",
        "avatar_url": "/static/uploads/avatar/456/avatar.png"
      },
      "created_at": "2023-06-15T14:30:45",
      "updated_at": "2023-06-15T15:30:45"
    }
  ],
  "total": 50,
  "pages": 5,
  "current_page": 1
}`
            }
          />
          
          <ApiEndpoint
            method="GET"
            path="/api/music/playlists/user/:user_id"
            description="Получение публичных плейлистов конкретного пользователя."
            authRequired={false}
            request={
`GET /api/music/playlists/user/456`
            }
            response={
`{
  "success": true,
  "playlists": [
    {
      "id": 1,
      "name": "Плейлист пользователя",
      "description": "Описание плейлиста",
      "cover_image": "/static/uploads/playlists/456/1/cover.jpg",
      "cover_url": "/static/uploads/playlists/456/1/cover.jpg",
      "tracks_count": 10,
      "preview_tracks": [
        {
          "id": 123,
          "title": "Трек 1",
          "artist": "Исполнитель 1",
          "cover_path": "/static/music/456/123/cover.jpg"
        }
      ],
      "is_owner": false,
      "created_at": "2023-06-15T14:30:45",
      "updated_at": "2023-06-15T15:30:45"
    }
  ],
  "user": {
    "id": 456,
    "name": "Пользователь",
    "username": "username",
    "avatar_url": "/static/uploads/avatar/456/avatar.png"
  }
}`
            }
          />
          
          <ApiEndpoint
            method="POST"
            path="/api/music/:track_id/verify"
            description="Связывание трека с артистом (только для администраторов)."
            authRequired={true}
            request={
`POST /api/music/123/verify
Content-Type: application/json

{
  "artist_id": 1
}`
            }
            response={
`{
  "success": true,
  "message": "Трек успешно привязан к артисту",
  "track_id": 123,
  "artist_id": 1,
  "is_verified": true
}`
            }
          />
        </>
      )}
      {activeTab === 8 && (
        <>
          <ApiTitle>
            <StorefrontIcon fontSize="large" />
            Магазин бейджиков
          </ApiTitle>
          <Typography variant="body2" paragraph>
            API для системы магазина бейджиков, включающей создание, покупку, управление роялти и отслеживание трендов. Система поддерживает ограничения по подпискам и защиту от дублирования покупок.
          </Typography>
          
          <SectionTitle variant="h6">
            Просмотр магазина
          </SectionTitle>
          <ApiEndpoint
            method="GET"
            path="/api/badges/shop"
            description="Получение списка всех доступных бейджиков в магазине с информацией о создателях и покупках."
            authRequired={true}
            request={`GET /api/badges/shop`}
            response={`{
  "badges": [
    {
      "id": 123,
      "name": "Название бейджика",
      "description": "Описание бейджика",
      "image_path": "f8a72b3e-5c21-4a9b-b77d-1234567890ab.svg",
      "price": 3000,
      "creator_id": 456,
      "creator": {
        "id": 456,
        "username": "creator",
        "name": "Создатель",
        "avatar_url": "/static/uploads/avatar/456/avatar.png"
      },
      "copies_sold": 5,
      "max_copies": 10,
      "is_sold_out": false,
      "upgrade": "Анимация",
      "color_upgrade": "#FFD700",
      "purchases": [
        {
          "buyer_id": 789,
          "buyer": {
            "id": 789,
            "username": "buyer",
            "name": "Покупатель",
            "avatar_url": "/static/uploads/avatar/789/avatar.png"
          },
          "purchase_date": "2023-06-15T14:30:45"
        }
      ]
    }
  ]
}`}
          />
          
          <ApiEndpoint
            method="GET"
            path="/api/badges/trending"
            description="Получение топ-3 трендовых бейджиков по количеству проданных копий."
            authRequired={false}
            request={`GET /api/badges/trending`}
            response={`{
  "badges": [
    {
      "id": 123,
      "name": "Трендовый бейджик",
      "description": "Описание",
      "image_path": "trending-badge.svg",
      "price": 5000,
      "creator_id": 456,
      "creator": {
        "id": 456,
        "username": "creator",
        "name": "Создатель",
        "avatar_url": "/static/uploads/avatar/456/avatar.png"
      },
      "copies_sold": 25,
      "max_copies": 50,
      "is_sold_out": false,
      "upgrade": "Анимация",
      "color_upgrade": "#FFD700"
    }
  ]
}`}
          />
          
          <SectionTitle variant="h6">
            Управление баллами
          </SectionTitle>
          <ApiEndpoint
            method="GET"
            path="/api/user/points"
            description="Получение текущего баланса баллов пользователя."
            authRequired={true}
            request={`GET /api/user/points`}
            response={`{
  "points": 15000
}`}
          />
          
          <SectionTitle variant="h6">
            Покупка бейджиков
          </SectionTitle>
          <ApiEndpoint
            method="POST"
            path="/api/badges/purchase/:badge_id"
            description="Покупка бейджика из магазина. Включает защиту от дублирования покупок и автоматическое начисление роялти создателю."
            authRequired={true}
            request={`POST /api/badges/purchase/123`}
            response={`{
  "message": "Бейджик успешно куплен",
  "new_balance": 12000
}`}
          />
          
          <ApiEndpoint
            method="GET"
            path="/api/badges/purchases"
            description="Получение истории покупок пользователя с пагинацией."
            authRequired={true}
            request={`GET /api/badges/purchases?page=1&limit=10`}
            response={`{
  "purchases": [
    {
      "id": 1,
      "purchase_date": "2023-06-15T14:30:45",
      "price_paid": 3000,
      "badge": {
        "id": 123,
        "name": "Название бейджика",
        "description": "Описание бейджика",
        "image_path": "f8a72b3e-5c21-4a9b-b77d-1234567890ab.svg",
        "creator_id": 456
      }
    }
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 10,
    "has_more": true
  }
}`}
          />
          
          <SectionTitle variant="h6">
            Создание бейджиков
          </SectionTitle>
          <ApiEndpoint
            method="POST"
            path="/api/badges/create"
            description="Создание нового бейджика в магазине. Стоимость зависит от улучшений: базовый - 3000 баллов, с улучшениями - 9000 баллов. Лимиты по подпискам: базовый - 3, Basic - 5, Premium - 8, Ultimate - без ограничений."
            authRequired={true}
            request={`POST /api/badges/create
Content-Type: multipart/form-data
{
  "name": "Название бейджика",
  "description": "Описание бейджика",
  "price": 3000,
  "royalty_percentage": 15,
  "max_copies": 10,
  "upgrade": "Анимация (опционально)",
  "color_upgrade": "#FFD700 (опционально)",
  "image": [файл SVG/GIF, макс. 100KB]
}`}
            response={`{
  "message": "Бейджик успешно создан за 3000 баллов",
  "badge_id": 123,
  "creation_cost": 3000,
  "has_upgrades": false
}`}
          />
          
          <ApiEndpoint
            method="GET"
            path="/api/badges/created"
            description="Получение списка бейджиков, созданных пользователем, с информацией о продажах и заработанных роялти."
            authRequired={true}
            request={`GET /api/badges/created`}
            response={`{
  "total_badges": 3,
  "badges": [
    {
      "id": 123,
      "name": "Мой бейджик",
      "description": "Описание",
      "image_path": "my-badge.svg",
      "price": 3000,
      "copies_sold": 5,
      "max_copies": 10,
      "is_sold_out": false,
      "upgrade": "Анимация",
      "color_upgrade": "#FFD700",
      "purchases": [
        {
          "buyer_id": 789,
          "buyer": {
            "id": 789,
            "username": "buyer",
            "name": "Покупатель",
            "avatar_url": "/static/uploads/avatar/789/avatar.png"
          },
          "purchase_date": "2023-06-15T14:30:45"
        }
      ],
      "royalties_earned": 2250
    }
  ]
}`}
          />
          
          <SectionTitle variant="h6">
            Роялти и доходы
          </SectionTitle>
          <ApiEndpoint
            method="GET"
            path="/api/badges/royalties"
            description="Получение истории роялти, заработанных от продажи созданных бейджиков, с пагинацией."
            authRequired={true}
            request={`GET /api/badges/royalties?page=1&limit=10`}
            response={`{
  "royalties": [
    {
      "purchase_id": 1,
      "purchase_date": "2023-06-15T14:30:45",
      "buyer_id": 789,
      "buyer": {
        "id": 789,
        "name": "Покупатель",
        "username": "buyer",
        "avatar_url": "/static/uploads/avatar/789/avatar.png"
      },
      "badge_id": 123,
      "badge_name": "Мой бейджик",
      "badge_image_path": "my-badge.svg",
      "original_price": 3000,
      "royalty_percentage": 15,
      "royalty_amount": 450
    }
  ],
  "pagination": {
    "total": 8,
    "page": 1,
    "limit": 10,
    "has_more": false
  }
}`}
          />
        </>
      )}
      {activeTab === 9 && (
        <>
          <ApiTitle>
            <BugReportIcon fontSize="large" />
            Баг-репорты
          </ApiTitle>
          <Typography variant="body2" paragraph>
            API для системы отслеживания багов, позволяющее пользователям сообщать о проблемах.
          </Typography>
          <ApiEndpoint
            method="GET"
            path="/api/bugs"
            description="Получение списка зарегистрированных багов."
            authRequired={false}
            request={`GET /api/bugs`}
            response={`{
  "success": true,
  "bugs": [
    {
      "id": 123,
      "subject": "Проблема с регистрацией",
      "text": "При регистрации через Google выдает ошибку",
      "date": "2023-06-15T14:30:45",
      "site_link": "https://k-connect.ru/register",
      "status": "Открыт",
      "user_id": 456,
      "user_name": "Имя Пользователя",
      "user_avatar": "/static/uploads/avatar/456/photo.jpg",
      "image_name": "abc123.jpg",
      "image_url": "/static/BugUpload/Images/abc123.jpg",
      "likes_count": 5,
      "is_liked_by_user": false
    }
  ]
}`}
          />
          <ApiEndpoint
            method="GET"
            path="/api/bugs/:bug_id"
            description="Получение детальной информации о конкретном баге с комментариями."
            authRequired={false}
            request={`GET /api/bugs/123`}
            response={`{
  "success": true,
  "bug": {
    "id": 123,
    "subject": "Проблема с регистрацией",
    "text": "При регистрации через Google выдает ошибку",
    "date": "2023-06-15T14:30:45",
    "site_link": "https://k-connect.ru/register",
    "status": "Открыт",
    "user_id": 456,
    "user_name": "Имя Пользователя",
    "user_avatar": "/static/uploads/avatar/456/photo.jpg",
    "image_name": "abc123.jpg",
    "image_url": "/static/BugUpload/Images/abc123.jpg",
    "likes_count": 5,
    "is_liked_by_user": false,
    "comments": [
      {
        "id": 789,
        "comment_text": "Это происходит только в Chrome или во всех браузерах?",
        "timestamp": "2023-06-15T15:00:00",
        "user_id": 567,
        "user_name": "Администратор",
        "user_avatar": "/static/uploads/avatar/567/photo.jpg"
      }
    ]
  }
}`}
          />
          <ApiEndpoint
            method="POST"
            path="/api/bugs"
            description="Добавление нового баг-репорта."
            authRequired={false}
            request={`POST /api/bugs
Content-Type: multipart/form-data
{
  "subject": "Проблема с регистрацией",
  "text": "При регистрации через Google выдает ошибку",
  "site_link": "https://k-connect.ru/register",
  "image": [файл изображения]
}`}
            response={`{
  "success": true,
  "message": "Баг успешно добавлен",
  "bug_id": 124,
  "status": "Открыт"
}`}
          />
          <ApiEndpoint
            method="POST"
            path="/api/bugs/:bug_id/comments"
            description="Добавление комментария к баг-репорту."
            authRequired={true}
            request={`POST /api/bugs/123/comments
Content-Type: application/json
{
  "comment_text": "У меня тоже возникла эта проблема"
}`}
            response={`{
  "success": true,
  "comment": {
    "id": 790,
    "comment_text": "У меня тоже возникла эта проблема",
    "timestamp": "2023-06-15T16:00:00",
    "user_id": 789,
    "user_name": "Имя Пользователя",
    "user_avatar": "/static/uploads/avatar/789/photo.jpg"
  }
}`}
          />
          <ApiEndpoint
            method="POST"
            path="/api/bugs/:bug_id/reaction"
            description="Лайк/подтверждение баг-репорта (чтобы показать, что проблема затрагивает нескольких пользователей)."
            authRequired={true}
            request={`POST /api/bugs/123/reaction`}
            response={`{
  "success": true,
  "is_liked": true,
  "likes_count": 6
}`}
          />
          <ApiEndpoint
            method="PUT"
            path="/api/bugs/:bug_id/status"
            description="Обновление статуса баг-репорта (только для администраторов)."
            authRequired={true}
            request={`PUT /api/bugs/123/status
Content-Type: application/json
{
  "status": "В работе"
}`}
            response={`{
  "success": true,
  "message": "Статус успешно обновлен",
  "status": "В работе"
}`}
          />
        </>
      )}

      {activeTab === 10 && (
        <>
          <ApiTitle>
            <InventoryIcon fontSize="large" />
            Инвентарь и предметы
          </ApiTitle>
          <Typography variant="body2" paragraph>
            API для работы с системой инвентаря, паками-сундуками и предметами. Позволяет покупать паки, открывать их, управлять предметами и торговать на маркетплейсе.
          </Typography>
          
          <SectionTitle variant="h6">
            Паки и покупки
          </SectionTitle>
          <ApiEndpoint
            method="GET"
            path="/api/inventory/packs"
            description="Получение списка всех доступных паков для покупки."
            authRequired={false}
            request={`GET /api/inventory/packs`}
            response={`{
  "success": true,
  "packs": [
    {
      "id": 1,
      "name": "pack_1",
      "display_name": "Пак 1",
      "description": "Первый пак с предметами",
      "price": 100,
      "is_limited": false,
      "max_quantity": null,
      "sold_quantity": 50,
      "is_active": true,
      "items_count": 5
    }
  ]
}`}
          />
          <ApiEndpoint
            method="GET"
            path="/api/inventory/packs/:pack_id"
            description="Получение детальной информации о конкретном паке с содержимым."
            authRequired={false}
            request={`GET /api/inventory/packs/1`}
            response={`{
  "success": true,
  "pack": {
    "id": 1,
    "name": "pack_1",
    "display_name": "Пак 1",
    "price": 100,
    "contents": [
      {
        "id": 1,
        "item_name": "black",
        "item_type": "png",
        "drop_chance": 1.0,
        "rarity": "common",
        "upgradeable": true
      }
    ]
  }
}`}
          />
          <ApiEndpoint
            method="POST"
            path="/api/inventory/packs/:pack_id/buy"
            description="Покупка пака за баллы."
            authRequired={true}
            request={`POST /api/inventory/packs/1/buy`}
            response={`{
  "success": true,
  "message": "Пак \"Пак 1\" успешно куплен",
  "purchase_id": 123,
  "remaining_points": 900
}`}
          />
          <ApiEndpoint
            method="POST"
            path="/api/inventory/packs/:purchase_id/open"
            description="Открытие купленного пака и получение случайного предмета."
            authRequired={true}
            request={`POST /api/inventory/packs/123/open`}
            response={`{
  "success": true,
  "message": "Получен предмет: black",
  "item": {
    "id": 456,
    "name": "black",
    "type": "png",
    "rarity": "common",
    "upgradeable": true,
    "upgrade_level": 0,
    "background_id": 42,
    "background_url": "/static/backgrounds/42.jpg",
    "image_url": "/inventory/456"
  }
}`}
          />
          <ApiEndpoint
            method="GET"
            path="/api/inventory/my-purchases"
            description="Получение списка своих покупок паков."
            authRequired={true}
            request={`GET /api/inventory/my-purchases`}
            response={`{
  "success": true,
  "purchases": [
    {
      "id": 123,
      "pack_id": 1,
      "pack_name": "Пак 1",
      "purchased_at": "2023-06-15T14:30:45",
      "opened_at": "2023-06-15T14:35:00",
      "is_opened": true
    }
  ]
}`}
          />
          
          <SectionTitle variant="h6">
            Управление инвентарем
          </SectionTitle>
          <ApiEndpoint
            method="GET"
            path="/api/inventory/my-inventory"
            description="Получение своего инвентаря с пагинацией."
            authRequired={true}
            request={`GET /api/inventory/my-inventory?page=1&per_page=15`}
            response={`{
  "success": true,
  "items": [
    {
      "id": 456,
      "item_name": "black",
      "pack_id": 1,
      "item_type": "png",
      "is_equipped": false,
      "upgrade_level": 0,
      "rarity": "common",
      "upgradeable": true,
      "background_id": 42,
      "background_url": "/static/backgrounds/42.jpg",
      "image_url": "/inventory/456",
      "pack_price": 100,
      "pack_display_name": "Пак 1",
      "total_count": 1,
      "item_number": 1,
      "marketplace": null
    }
  ],
  "total_items": 5,
  "pagination": {
    "page": 1,
    "per_page": 15,
    "total": 5,
    "pages": 1,
    "has_next": false,
    "has_prev": false
  }
}`}
          />
          <ApiEndpoint
            method="GET"
            path="/api/inventory/user/:user_id"
            description="Получение инвентаря другого пользователя."
            authRequired={false}
            request={`GET /api/inventory/user/123?page=1&per_page=15`}
            response={`{
  "success": true,
  "items": [
    {
      "id": 456,
      "item_name": "black",
      "pack_id": 1,
      "item_type": "png",
      "is_equipped": true,
      "upgrade_level": 1,
      "rarity": "common",
      "upgradeable": true,
      "background_id": 42,
      "background_url": "/static/backgrounds/42.jpg",
      "image_url": "/inventory/456",
      "pack_price": 100,
      "pack_display_name": "Пак 1",
      "total_count": 1,
      "item_number": 1,
      "marketplace": null
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 15,
    "total": 3,
    "pages": 1,
    "has_next": false,
    "has_prev": false
  }
}`}
          />
          <ApiEndpoint
            method="GET"
            path="/api/inventory/user/:user_id/equipped"
            description="Получение только надетых предметов пользователя."
            authRequired={false}
            request={`GET /api/inventory/user/123/equipped`}
            response={`{
  "success": true,
  "equipped_items": [
    {
      "id": 456,
      "item_name": "black",
      "pack_id": 1,
      "item_type": "png",
      "is_equipped": true,
      "upgrade_level": 1,
      "rarity": "common",
      "upgradeable": true,
      "background_id": 42,
      "background_url": "/static/backgrounds/42.jpg",
      "image_url": "/inventory/456"
    }
  ]
}`}
          />
          <ApiEndpoint
            method="GET"
            path="/api/inventory/user/:user_id/upgraded"
            description="Получение только улучшенных предметов пользователя."
            authRequired={false}
            request={`GET /api/inventory/user/123/upgraded?page=1&per_page=15`}
            response={`{
  "success": true,
  "items": [
    {
      "id": 456,
      "item_name": "black",
      "pack_id": 1,
      "item_type": "png",
      "is_equipped": true,
      "upgrade_level": 1,
      "rarity": "common",
      "upgradeable": true,
      "background_id": 42,
      "background_url": "/static/backgrounds/42.jpg",
      "image_url": "/inventory/456"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 15,
    "total": 2,
    "pages": 1,
    "has_next": false,
    "has_prev": false
  }
}`}
          />
          
          <SectionTitle variant="h6">
            Управление предметами
          </SectionTitle>
          <ApiEndpoint
            method="POST"
            path="/api/inventory/equip/:item_id"
            description="Надеть предмет. Пользователи без подписки могут надеть только 1 предмет, с подпиской - до 3."
            authRequired={true}
            request={`POST /api/inventory/equip/456`}
            response={`{
  "success": true,
  "message": "Предмет black надет"
}`}
          />
          <ApiEndpoint
            method="POST"
            path="/api/inventory/unequip/:item_id"
            description="Снять предмет."
            authRequired={true}
            request={`POST /api/inventory/unequip/456`}
            response={`{
  "success": true,
  "message": "Предмет black снят"
}`}
          />
          <ApiEndpoint
            method="POST"
            path="/api/inventory/upgrade/:item_id"
            description="Улучшить предмет. Стоимость улучшения = половина стоимости пака."
            authRequired={true}
            request={`POST /api/inventory/upgrade/456`}
            response={`{
  "success": true,
  "message": "Предмет \"black\" успешно улучшен!",
  "upgrade_level": 1,
  "remaining_points": 850,
  "upgrade_cost": 50
}`}
          />
          <ApiEndpoint
            method="POST"
            path="/api/inventory/transfer/:item_id"
            description="Передать предмет другому пользователю. Стоимость передачи: 5000 баллов."
            authRequired={true}
            request={`POST /api/inventory/transfer/456
Content-Type: application/json
{
  "recipient_username": "recipient"
}`}
            response={`{
  "success": true,
  "message": "Предмет \"black\" успешно передан пользователю @recipient",
  "remaining_points": 4950
}`}
          />
          <ApiEndpoint
            method="POST"
            path="/api/inventory/recycle/:item_id"
            description="Утилизировать предмет и получить 5% от стоимости пака в качестве компенсации."
            authRequired={true}
            request={`POST /api/inventory/recycle/456`}
            response={`{
  "success": true,
  "message": "Предмет \"black\" утилизирован",
  "compensation": 5,
  "remaining_points": 105
}`}
          />
          
          <SectionTitle variant="h6">
            Информация о предметах
          </SectionTitle>
          <ApiEndpoint
            method="GET"
            path="/api/inventory/item/:item_id/details"
            description="Получение полной информации о предмете по ID."
            authRequired={false}
            request={`GET /api/inventory/item/456/details`}
            response={`{
  "success": true,
  "item": {
    "id": 456,
    "item_name": "black",
    "pack_id": 1,
    "item_type": "png",
    "is_equipped": false,
    "upgrade_level": 0,
    "rarity": "common",
    "upgradeable": true,
    "background_id": 42,
    "background_url": "/static/backgrounds/42.jpg",
    "image_url": "/inventory/456",
    "pack_name": "Пак 1",
    "pack_price": 100,
    "pack_display_name": "Пак 1",
    "total_count": 1,
    "item_number": 1,
    "marketplace": null,
    "owner": {
      "id": 123,
      "username": "owner",
      "name": "Владелец"
    }
  }
}`}
          />
          <ApiEndpoint
            method="GET"
            path="/inventory/:item_id"
            description="Получение изображения предмета по ID."
            authRequired={false}
            request={`GET /inventory/456`}
            response={`Изображение предмета (PNG/SVG файл)`}
          />
          <ApiEndpoint
            method="GET"
            path="/inventory/pack/:pack_id/:item_name"
            description="Получение изображения предмета из пака по названию."
            authRequired={false}
            request={`GET /inventory/pack/1/black`}
            response={`Изображение предмета (PNG/SVG файл)`}
          />
          <ApiEndpoint
            method="POST"
            path="/api/inventory/images/batch"
            description="Получение информации о нескольких изображениях одним запросом (до 100 предметов)."
            authRequired={false}
            request={`POST /api/inventory/images/batch
Content-Type: application/json
{
  "items": [
    {"item_id": 456},
    {"pack_id": 1, "item_name": "black"}
  ]
}`}
            response={`{
  "success": true,
  "images": [
    {
      "item_id": 456,
      "url": "/inventory/456",
      "exists": true
    },
    {
      "pack_id": 1,
      "item_name": "black",
      "url": "/inventory/pack/1/black",
      "exists": true
    }
  ]
}`}
          />
          
          <SectionTitle variant="h6">
            Маркетплейс
          </SectionTitle>
          <ApiEndpoint
            method="POST"
            path="/api/marketplace/list/:item_id"
            description="Выставить предмет на маркетплейс."
            authRequired={true}
            request={`POST /api/marketplace/list/456
Content-Type: application/json
{
  "price": 150
}`}
            response={`{
  "success": true,
  "message": "Item listed successfully",
  "listing": {
    "id": 789,
    "item_id": 456,
    "seller_id": 123,
    "price": 150,
    "status": "active",
    "listed_at": "2023-06-15T14:30:45"
  }
}`}
          />
          <ApiEndpoint
            method="POST"
            path="/api/marketplace/cancel/:listing_id"
            description="Снять предмет с маркетплейса."
            authRequired={true}
            request={`POST /api/marketplace/cancel/789`}
            response={`{
  "success": true,
  "message": "Листинг успешно отменен"
}`}
          />
          <ApiEndpoint
            method="POST"
            path="/api/marketplace/buy/:listing_id"
            description="Купить предмет с маркетплейса."
            authRequired={true}
            request={`POST /api/marketplace/buy/789`}
            response={`{
  "success": true,
  "message": "Предмет успешно куплен",
  "item": {
    "id": 456,
    "item_name": "black",
    "user_id": 456
  }
}`}
          />
          <ApiEndpoint
            method="GET"
            path="/api/marketplace/listings"
            description="Получение списка активных предметов на маркетплейсе с фильтрацией."
            authRequired={false}
            request={`GET /api/marketplace/listings?pack_id=1&rarity=rare&min_price=100&max_price=500&sort_by=price&sort_order=desc`}
            response={`{
  "success": true,
  "listings": [
    {
      "id": 789,
      "item_id": 456,
      "seller_id": 123,
      "price": 150,
      "status": "active",
      "listed_at": "2023-06-15T14:30:45",
      "item": {
        "id": 456,
        "item_name": "black",
        "pack_id": 1,
        "item_type": "png",
        "rarity": "rare",
        "upgradeable": true,
        "upgrade_level": 0,
        "background_id": 42,
        "background_url": "/static/backgrounds/42.jpg",
        "image_url": "/inventory/456",
        "total_count": 1,
        "item_number": 1
      }
    }
  ]
}`}
          />
          
          <SectionTitle variant="h6">
            Поиск получателей
          </SectionTitle>
          <ApiEndpoint
            method="GET"
            path="/api/search/recipients"
            description="Поиск пользователей для передачи предметов."
            authRequired={true}
            request={`GET /api/search/recipients?query=user`}
            response={`{
  "users": [
    {
      "id": 456,
      "username": "user123",
      "name": "Пользователь",
      "photo": "/static/uploads/avatar/456/photo.jpg"
    }
  ]
}`}
          />
        </>
      )}
    </PageContainer>
  );
};

export default SimpleApiDocsPage; 