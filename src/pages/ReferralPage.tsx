import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  UserPlus, 
  Copy, 
  Check, 
  Users, 
  Award, 
  TrendingUp,
  ArrowLeft,
  Star,
  Gift,
  Calendar
} from 'lucide-react';

interface ReferralStats {
  total_invited: number;
  level: number;
  total_earned_points: number;
  total_earned_days: number;
  code?: string;
  invited_users?: ReferredUser[];
  level_stats?: any;
  current_rewards?: any;
  next_level_rewards?: any;
  can_upgrade?: boolean;
}

interface ReferredUser {
  id: number;
  username: string;
  name: string;
  photo?: string;
  created_at?: string;
}

interface ReferralPageProps {
  onBack?: () => void;
}

const ReferralPage: React.FC<ReferralPageProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [referredUsers, setReferredUsers] = useState<ReferredUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingCode, setCreatingCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Сначала проверяем, есть ли у пользователя реферальный код
      const statsResponse = await axios.get('/api/referral/my-code');
      
      if (statsResponse.data.success) {
        // У пользователя есть код, загружаем полную статистику
        const usersResponse = await axios.get('/api/referral/statistics');
        
        if (usersResponse.data.success) {
          setStats(usersResponse.data);
          setReferredUsers(usersResponse.data.invited_users || []);
        } else {
          setError('Ошибка загрузки статистики');
        }
      } else {
        // У пользователя нет кода - это нормальная ситуация
        setStats(null);
        setReferredUsers([]);
        // Не устанавливаем ошибку, так как это ожидаемое поведение
      }
    } catch (err: any) {
      // Проверяем, является ли ошибка ожидаемой (нет кода)
      if (err.response?.status === 404 && err.response?.data?.message === 'У вас нет реферального кода') {
        setStats(null);
        setReferredUsers([]);
        // Не устанавливаем ошибку для этого случая
      } else {
        setError('Ошибка загрузки данных');
        console.error('Error loading referral data:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const createReferralCode = async () => {
    try {
      setCreatingCode(true);
      const response = await axios.post('/api/referral/create-code');
      
      if (response.data.success) {
        // Обновляем данные после создания кода
        loadReferralData();
      }
    } catch (err) {
      setError('Ошибка создания кода');
      console.error('Error creating referral code:', err);
    } finally {
      setCreatingCode(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getLevelInfo = (level: number) => {
    const levels = {
      1: { 
        name: 'Бронза', 
        inviterReward: '10,000 баллов',
        friendReward: '5,000 баллов + 3 дня Basic'
      },
      2: { 
        name: 'Серебро', 
        inviterReward: '25,000 баллов',
        friendReward: '10,000 баллов + 3 дня Premium'
      },
      3: { 
        name: 'Золото', 
        inviterReward: '25,000 баллов + 3 дня подписки + галочка',
        friendReward: '25,000 баллов + 14 дней Premium'
      }
    };
    return levels[level as keyof typeof levels] || levels[1];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #131313 0%, #1a1a1a 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(255, 255, 255, 0.1)',
          borderTop: '3px solid #D0BCFF',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      padding: '10px',
      marginBottom: '20px',
      marginTop: '10px',
      fontFamily: '"SF Pro Display", "Roboto", "Arial", sans-serif'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '16px',
        gap: '12px'
      }}>
        <button
          onClick={onBack || (() => navigate(-1))}
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '8px',
            padding: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
          }}
        >
          <ArrowLeft size={20} color="#FFFFFF" />
        </button>
        
        <h1 style={{
          margin: 0,
          fontSize: '28px',
          fontWeight: '600',
          color: '#FFFFFF',
          letterSpacing: '-0.5px'
        }}>
          Реферальная программа
        </h1>
      </div>

      {error && (
        <div style={{
          background: 'rgba(244, 67, 54, 0.1)',
          border: '1px solid rgba(244, 67, 54, 0.3)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
          color: '#f44336'
        }}>
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '8px',
        marginBottom: '24px'
      }}>
        {/* Total Invited */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '8px',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Users size={20} color="rgba(255, 255, 255, 0.8)" />
          </div>
          <div>
            <div style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#FFFFFF',
              marginBottom: '2px'
            }}>
              {stats?.total_invited || 0}
            </div>
            <div style={{
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.6)',
              fontWeight: '500'
            }}>
              Приглашено друзей
            </div>
          </div>
        </div>

        {/* Current Level */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '8px',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Award size={20} color="rgba(255, 255, 255, 0.8)" />
          </div>
          <div>
            <div style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#FFFFFF',
              marginBottom: '2px'
            }}>
              {stats?.level || 1}
            </div>
            <div style={{
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.6)',
              fontWeight: '500'
            }}>
              Уровень
            </div>
          </div>
        </div>

        {/* Total Earned Points */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '8px',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <TrendingUp size={20} color="rgba(255, 255, 255, 0.8)" />
          </div>
          <div>
            <div style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#FFFFFF',
              marginBottom: '2px'
            }}>
              {stats?.total_earned_points?.toLocaleString() || 0}
            </div>
            <div style={{
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.6)',
              fontWeight: '500'
            }}>
              Заработано баллов
            </div>
          </div>
        </div>

        {/* Total Earned Days */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '8px',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Calendar size={20} color="rgba(255, 255, 255, 0.8)" />
          </div>
          <div>
            <div style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#FFFFFF',
              marginBottom: '2px'
            }}>
              {stats?.total_earned_days || 0}
            </div>
            <div style={{
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.6)',
              fontWeight: '500'
            }}>
              Дней подписки
            </div>
          </div>
        </div>
      </div>

      {/* Referral Code Section */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '24px'
      }}>
        <h2 style={{
          margin: '0 0 16px 0',
          fontSize: '18px',
          fontWeight: '600',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <UserPlus size={18} color="rgba(255, 255, 255, 0.8)" />
          Ваш реферальный код
        </h2>

        {stats?.code ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '6px',
            padding: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{
              fontSize: '16px',
              fontWeight: '600',
              color: 'rgba(255, 255, 255, 0.9)',
              fontFamily: 'monospace',
              letterSpacing: '0.5px'
            }}>
              {stats.code}
            </div>
            <button
              onClick={() => copyToClipboard(stats.code!)}
              style={{
                background: copied ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '6px',
                padding: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
            >
              {copied ? (
                <Check size={14} color="#4caf50" />
              ) : (
                <Copy size={14} color="rgba(255, 255, 255, 0.8)" />
              )}
            </button>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.6)',
              flex: 1
            }}>
              Вы еще не участвуете в реферальной программе. Создайте код, чтобы начать приглашать друзей и получать награды!
            </div>
            <button
              onClick={createReferralCode}
              disabled={creatingCode}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '6px',
                padding: '8px 16px',
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '13px',
                fontWeight: '500',
                cursor: creatingCode ? 'not-allowed' : 'pointer',
                opacity: creatingCode ? 0.6 : 1,
                transition: 'all 0.2s ease'
              }}
            >
              {creatingCode ? 'Создание...' : 'Создать код'}
            </button>
          </div>
        )}
      </div>

      {/* Level Rewards */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '24px'
      }}>
        <h2 style={{
          margin: '0 0 16px 0',
          fontSize: '18px',
          fontWeight: '600',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Gift size={18} color="rgba(255, 255, 255, 0.8)" />
          Награды по уровням
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '8px'
        }}>
          {[1, 2, 3].map(level => {
            const levelInfo = getLevelInfo(level);
            const isCurrentLevel = stats?.level === level;
            
            return (
              <div
                key={level}
                style={{
                  background: isCurrentLevel 
                    ? 'rgba(255, 255, 255, 0.08)' 
                    : 'rgba(255, 255, 255, 0.05)',
                  border: isCurrentLevel 
                    ? '2px solid #D0BCFF' 
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '16px',
                  position: 'relative'
                }}
              >
                {isCurrentLevel && (
                  <div style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '12px',
                    background: '#D0BCFF',
                    color: '#000000',
                    fontSize: '12px',
                    fontWeight: '600',
                    padding: '4px 8px',
                    borderRadius: '12px'
                  }}>
                    ТЕКУЩИЙ
                  </div>
                )}
                
                                 <div style={{
                   display: 'flex',
                   alignItems: 'center',
                   gap: '8px',
                   marginBottom: '8px'
                 }}>
                   <div style={{
                     background: 'rgba(255, 255, 255, 0.1)',
                     borderRadius: '6px',
                     padding: '6px',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center'
                   }}>
                     <Star size={14} color="rgba(255, 255, 255, 0.8)" />
                   </div>
                                     <div>
                     <div style={{
                       fontSize: '14px',
                       fontWeight: '600',
                       color: '#FFFFFF'
                     }}>
                       {levelInfo.name}
                     </div>
                     <div style={{
                       fontSize: '11px',
                       color: 'rgba(255, 255, 255, 0.5)'
                     }}>
                       Уровень {level}
                     </div>
                   </div>
                 </div>
                 
                 <div style={{
                   fontSize: '11px',
                   color: 'rgba(255, 255, 255, 0.7)',
                   lineHeight: '1.3'
                 }}>
                   <div style={{ marginBottom: '4px' }}>
                     <strong>Вы получите:</strong> {levelInfo.inviterReward}
                   </div>
                   <div>
                     <strong>Друг получит:</strong> {levelInfo.friendReward}
                   </div>
                 </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Referred Users */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderRadius: '8px',
        padding: '16px'
      }}>
        <h2 style={{
          margin: '0 0 16px 0',
          fontSize: '18px',
          fontWeight: '600',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Users size={18} color="rgba(255, 255, 255, 0.8)" />
          Приглашенные друзья ({referredUsers.length})
        </h2>

        {referredUsers.length > 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            {referredUsers.map(user => (
              <div
                key={user.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'rgba(255, 255, 255, 0.9)'
                }}>
                  {user.photo ? (
                    <img
                      src={user.photo}
                      alt={user.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#FFFFFF',
                    marginBottom: '4px'
                  }}>
                    {user.name}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: 'rgba(255, 255, 255, 0.6)'
                  }}>
                    @{user.username}
                  </div>
                </div>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontWeight: '500'
                  }}>
                    Приглашен
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.5)'
                  }}>
                    {user.created_at ? formatDate(user.created_at) : 'Недавно'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: 'rgba(255, 255, 255, 0.6)'
          }}>
            <Users size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <div style={{ fontSize: '16px', marginBottom: '8px' }}>
              Пока нет приглашенных друзей
            </div>
            <div style={{ fontSize: '14px' }}>
              Поделитесь своим реферальным кодом с друзьями
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReferralPage; 