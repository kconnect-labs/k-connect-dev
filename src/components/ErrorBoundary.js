import React, { Component } from 'react';
import DynamicIslandNotification from './DynamicIslandNotification';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      notifications: [],
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error in component:', error, errorInfo);
    this.setState({ errorInfo });
  }

  componentDidMount() {
    window.addEventListener('auth-error', this.handleAuthError);
    window.addEventListener('network-error', this.handleNetworkError);
    window.addEventListener('rate-limit-error', this.handleRateLimitError);
    window.addEventListener('show-error', this.handleShowError);
    window.addEventListener('api-retry', this.handleApiRetry);
  }

  componentWillUnmount() {
    window.removeEventListener('auth-error', this.handleAuthError);
    window.removeEventListener('network-error', this.handleNetworkError);
    window.removeEventListener('rate-limit-error', this.handleRateLimitError);
    window.removeEventListener('show-error', this.handleShowError);
    window.removeEventListener('api-retry', this.handleApiRetry);
  }

  // Notification event handlers (same, RU-ified for style)
  handleAuthError = event => {
    const {
      message,
      shortMessage = 'Сессия истекла',
      notificationType = 'auth',
      animationType = 'pill',
    } = event.detail;

    this.addNotification({
      id: Date.now(),
      type: 'error',
      message: message || 'Сессия истекла, пожалуйста, войдите снова.',
      shortMessage,
      notificationType,
      animationType,
      action: 'redirect',
      actionLabel: 'Войти',
      actionUrl: '/login',
    });
  };

  handleNetworkError = event => {
    const {
      message,
      shortMessage = 'Нет соединения',
      notificationType = 'error',
      animationType = 'drop',
    } = event.detail;

    this.addNotification({
      id: Date.now(),
      type: 'warning',
      message: message || 'Проблема с подключением к серверу',
      shortMessage,
      notificationType,
      animationType,
      action: 'retry',
      actionLabel: 'Повторить',
    });
  };

  handleRateLimitError = event => {
    const {
      message,
      shortMessage = 'Слишком много запросов',
      notificationType = 'warning',
      animationType = 'bounce',
    } = event.detail;

    this.addNotification({
      id: Date.now(),
      type: 'info',
      message: message || 'Слишком много запросов, попробуйте позже',
      shortMessage,
      notificationType,
      animationType,
      autoHide: true,
      hideAfter: 5000,
    });
  };

  handleShowError = event => {
    const {
      message,
      shortMessage = 'Ошибка',
      notificationType = 'error',
      animationType = 'pill',
    } = event.detail;

    this.addNotification({
      id: Date.now(),
      type: 'error',
      message: message || 'Произошла ошибка',
      shortMessage,
      notificationType,
      animationType,
      autoHide: true,
      hideAfter: 5000,
    });
  };

  handleApiRetry = event => {
    const {
      attempt,
      message,
      shortMessage = `Попытка ${attempt || 1}`,
      notificationType = 'info',
      animationType = 'pulse',
    } = event.detail;

    this.addNotification({
      id: Date.now(),
      type: 'info',
      message: message || `Повторная попытка ${attempt || 1}`,
      shortMessage,
      notificationType,
      animationType,
      autoHide: true,
      hideAfter: 3000,
    });
  };

  addNotification = notification => {
    this.setState(prevState => ({
      notifications: [...prevState.notifications, notification],
    }));

    if (notification.autoHide) {
      setTimeout(() => {
        this.removeNotification(notification.id);
      }, notification.hideAfter || 5000);
    }
  };

  removeNotification = id => {
    this.setState(prevState => ({
      notifications: prevState.notifications.filter(n => n.id !== id),
    }));
  };

  handleNotificationAction = notification => {
    if (notification.action === 'redirect' && notification.actionUrl) {
      window.location.href = notification.actionUrl;
    } else if (notification.action === 'retry') {
      window.location.reload();
    } else if (notification.onAction) {
      notification.onAction();
    }
    this.removeNotification(notification.id);
  };

  render() {
    const { hasError, error, errorInfo, notifications } = this.state;
    const { children, fallback } = this.props;

    if (hasError && fallback) {
      return fallback(error, errorInfo);
    }

    if (hasError) {
      // SVG — стильный крестик (cross) для error, современный, выразительный
      return (
        <div className='error-boundary-modern-wide'>
          <div className='error-art'>
            <svg width="104" height="104" viewBox="0 0 104 104" fill="none" aria-hidden="true">
              <defs>
                <radialGradient id="errg" cx="0.5" cy="0.5" r="0.9">
                  <stop offset="15%" stopColor="#ff4343" />
                  <stop offset="100%" stopColor="#972020" />
                </radialGradient>
                <linearGradient id="strokegrad" x1="18" y1="18" x2="86" y2="86" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#fff" stopOpacity="1"/>
                  <stop offset="1" stopColor="#fedada" stopOpacity="0.9"/>
                </linearGradient>
              </defs>
              <circle
                cx="52"
                cy="52"
                r="50"
                fill="url(#errg)"
                stroke="#ffb3b3"
                strokeWidth="2.5"
                opacity="0.92"
              />
              {/* Современный крест в центре */}
              <g>
                <rect
                  x="44"
                  y="26"
                  width="16"
                  height="52"
                  rx="6"
                  fill="url(#strokegrad)"
                  transform="rotate(45 52 52)"
                  opacity="0.95"
                  stroke="#fff"
                  strokeWidth="1.5"
                />
                <rect
                  x="44"
                  y="26"
                  width="16"
                  height="52"
                  rx="6"
                  fill="url(#strokegrad)"
                  transform="rotate(-45 52 52)"
                  opacity="0.95"
                  stroke="#fff"
                  strokeWidth="1.5"
                />
              </g>
              {/* Более современный эффект: легкая тень */}
              <ellipse
                cx="52"
                cy="96"
                rx="33"
                ry="6"
                fill="#180f0e"
                opacity="0.08"
              />
            </svg>
          </div>
          <div className="error-maintext">
            <h2 className='error-title'>Что-то пошло не так</h2>
            <p className='error-desc'>
              Произошла ошибка при отображении этого раздела.<br />
              Пожалуйста, попробуйте <b>перезагрузить</b> страницу или повторить действие чуть позже.
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className='error-action-btn-modern'
          >
            Перезагрузить
          </button>
          {process.env.NODE_ENV === 'development' && (
            <details className='error-details-modern'>
              <summary>Детали ошибки</summary>
              <pre>{error && error.toString()}</pre>
              <pre>{errorInfo && errorInfo.componentStack}</pre>
            </details>
          )}
          <style>{`
            .error-boundary-modern-wide {
              position: relative;
              background: #231f1f;
              color: #fff;
              border-radius: 24px;
              box-shadow: 0 8px 32px 0 rgba(50, 31, 31, 0.19), 0 2.5px 16px rgba(80,80,80,0.13);
              padding: 50px 0 40px 0;
              margin: 48px auto 40px auto;
              max-width: 900px;
              min-width: 0;
              width: 95%;
              min-height: 280px;
              display: flex;
              font-family: 'Inter','Roboto','Arial',sans-serif;
              transition: box-shadow .19s cubic-bezier(.16,1,.32,1);
              animation: errShow 0.5s cubic-bezier(.16,1,.32,1);
              justify-content: center;
            }
            @keyframes errShow {
              0% { opacity: 0; transform: scale(.97) translateY(30px);}
              100% { opacity: 1; transform: none;}
            }
            .error-art {
              margin-left: 28px;
              margin-right: 25px;
              min-width: 104px;
              min-height: 104px;
              display: flex;
              align-items: center;
              justify-content: center;
              filter: drop-shadow(0px 4px 24px #c7494921);
              flex-shrink: 0;
            }
            .error-maintext {
              flex: 1 0 0;
              min-width: 0;
              display: flex;
              flex-direction: column;
              align-items: flex-start;
              min-width: 220px;
              max-width: 700px;
            }
            .error-title {
              font-size: 2.14rem;
              font-weight: 800;
              margin: 0 0 16px 0;
              letter-spacing: -0.01em;
              color: #fff;
              background: none;
              background-clip: unset;
              -webkit-background-clip: unset;
              -webkit-text-fill-color: unset;
              text-fill-color: unset;
              line-height: 1.15;
            }
            .error-desc {
              font-size: 1.13rem;
              line-height: 1.7;
              margin: 0 0 30px 0;
              text-align: left;
              color: #f9bcbc;
              font-weight: 400;
              letter-spacing: 0.01em;
              max-width: 600px;
            }
            .error-action-btn-modern {
              background: #ef5350;
              border: none;
              border-radius: 99px;
              color: #fff;
              padding: 14px 44px;
              font-size: 1rem;
              font-weight: 600;
              margin: 0 0 0 0;
              margin-top: 8px;
              box-shadow: 0 2px 12px rgba(183, 28, 28, 0.10);
              cursor: pointer;
              outline: none;
              letter-spacing: 0.045em;
              transition: .16s background, .23s box-shadow, .11s transform;
              will-change: box-shadow,transform;
            }
            .error-action-btn-modern:hover, .error-action-btn-modern:focus {
              background: #c62828;
              box-shadow: 0 7px 40px 0 rgba(225, 78, 78, 0.22), 0 2px 18px #33020222;
              transform: translateY(-2px) scale(1.03);
            }
            .error-details-modern {
              background: rgba(20,18,25,0.82);
              margin: 38px 0 0 0;
              padding: 18px 14px 10px 14px;
              border-radius: 14px;
              font-size: 0.98rem;
              box-shadow: 0 2.5px 18px #710a0a12;
              width: 90%;
              max-width: 100%;
              min-width: 0;
              text-align: left;
              color: #ffd6db;
              overflow-x: auto;
              border: 1px solid #862c2c;
            }
            .error-details-modern pre {
              white-space: pre-wrap;
              word-break: break-all;
              margin: 10px 0;
              padding: 5px 2px;
              color: #ffeaea;
              font-size: 0.91rem;
            }
            .error-boundary-modern-wide {
                flex-direction: column;
                padding: 30px 0 22px 0;
                align-items: center;
            }
            @media (max-width: 900px) {
              .error-boundary-modern-wide {
                flex-direction: column;
                padding: 30px 0 22px 0;
                align-items: center;
              }
              .error-art {
                margin: 10px 0 16px 0;
              }
              .error-maintext {
                align-items: center;
                max-width: 95vw;
              }
              .error-title, .error-desc {
                text-align: center;
              }
            }
            @media (max-width: 600px) {
              .error-boundary-modern-wide {
                border-radius: 13px;
                padding: 13vw 0 6vw 0;
                margin: 8vw 0 28px 0;
              }
              .error-art {
                min-width: 74px;
                min-height: 74px;
                width: 64px;
                height: 64px;
              }
              .error-title { font-size: 1.2rem }
              .error-desc { font-size: .96rem }
              .error-maintext { max-width: 96vw; padding: 0 4vw; }
            }
          `}</style>
        </div>
      );
    }

    // Modern notifications on top, as before
    return (
      <>
        <div style={{
          position: 'fixed',
          top: 18,
          left: 0,
          right: 0,
          zIndex: 12000,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pointerEvents: 'none'
        }}>
          {notifications.length > 0 && notifications.map((notification) => (
            <div
              key={notification.id}
              style={{
                marginBottom: 12,
                transition: 'transform .25s cubic-bezier(.38,.58,.32,1), opacity .19s cubic-bezier(.23,1,.32,1)',
                pointerEvents: 'all'
              }}
            >
              <DynamicIslandNotification
                open={true}
                message={notification.message}
                shortMessage={notification.shortMessage}
                notificationType={notification.notificationType}
                animationType={notification.animationType}
                autoHideDuration={notification.hideAfter || 5000}
                onClose={() => {
                  if (notification.action) {
                    this.handleNotificationAction(notification);
                  } else {
                    this.removeNotification(notification.id);
                  }
                }}
                notificationData={null}
              />
            </div>
          ))}
        </div>
        {children}
      </>
    );
  }
}

export default ErrorBoundary;
