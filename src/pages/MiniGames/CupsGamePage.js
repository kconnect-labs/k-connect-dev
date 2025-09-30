import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from '../../uikit.module.css';

// Иконки из MUI (оставляем только иконки)
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';

// Компонент SEO (оставляем как есть)
import SEO from '../../components/SEO';

const CupImage = ({ lifted, winner }) => {
  return (
    <div
      className={styles.relative}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          width: '80%',
          height: '80%',
          backgroundImage: 'url("/static/icons/cup.png")',
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          transform: lifted ? 'translateY(-25px)' : 'translateY(0)',
          transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
          zIndex: 2,
        }}
      />

      {winner && (
        <div
          style={{
            position: 'absolute',
            bottom: '10%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 30,
            height: 30,
            borderRadius: 'var(--avatar-border-radius)',
            background: 'radial-gradient(circle at 30% 30%, #ff5722, #e91e63)',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
            zIndex: 1,
            opacity: lifted ? 1 : 0,
            transition: 'opacity 0.3s ease 0.4s',
          }}
        />
      )}
    </div>
  );
};

const CupsGamePage = () => {
  const navigate = useNavigate();

  const [balance, setBalance] = useState(0);
  const [betAmount, setBetAmount] = useState('10');
  const [selectedCup, setSelectedCup] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameResult, setGameResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [error, setError] = useState(null);
  const [gameAnimation, setGameAnimation] = useState(false);
  const [revealResult, setRevealResult] = useState(false);

  const fetchBalance = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/user/points');
      if (response?.data?.points !== undefined) {
        setBalance(parseInt(response.data.points));
      }
    } catch (err) {
      console.error('Ошибка при получении баланса:', err);
      setError('Не удалось загрузить баланс. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  const handleBetChange = e => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setBetAmount(value);
  };

  const handleCupSelect = cupIndex => {
    if (!isPlaying) {
      setSelectedCup(cupIndex);
    }
  };

  const formatNumber = num => {
    return parseInt(num).toLocaleString();
  };

  const startGame = async () => {
    const bet = parseInt(betAmount, 10);
    if (isNaN(bet) || bet <= 0) {
      setError('Пожалуйста, введите корректную ставку.');
      return;
    }

    if (bet > balance) {
      setError('Недостаточно средств для ставки.');
      return;
    }

    if (selectedCup === null) {
      setError('Пожалуйста, выберите чашу.');
      return;
    }

    setLoading(true);
    setIsPlaying(true);
    setGameAnimation(true);
    setRevealResult(false);

    try {
      const response = await axios.post('/api/minigames/cups/play', {
        bet: bet,
        selected_cup: selectedCup,
      });

      console.log('Game response:', response.data);

      if (response?.data?.success) {
        setTimeout(() => {
          setGameAnimation(false);

          const processedResult = {
            ...response.data,
            is_win: response.data.won,
            new_balance: response.data.balance,
          };

          setGameResult(processedResult);
          setRevealResult(true);

          if (response.data.balance !== undefined) {
            setBalance(parseInt(response.data.balance));
          } else {
            fetchBalance();
          }
        }, 1500);
      } else {
        setError(response?.data?.error || 'Произошла ошибка при игре.');
        setIsPlaying(false);
        setGameAnimation(false);
      }
    } catch (err) {
      console.error('Ошибка при игре:', err);
      setError(
        'Произошла ошибка при взаимодействии с сервером. Пожалуйста, попробуйте позже.'
      );
      setIsPlaying(false);
      setGameAnimation(false);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  };

  const resetGame = () => {
    setIsPlaying(false);
    setSelectedCup(null);
    setGameResult(null);
    setRevealResult(false);
  };

  const setMaxBet = () => {
    setBetAmount(Math.floor(balance).toString());
  };

  const predefinedBets = [10, 50, 100, 500];

  return (
    <div
      style={{
        margin: '0 auto',
        padding: '4px',
        marginTop: '16px',
        marginBottom: '80px',
      }}
    >
      <SEO
        title='Три чаши | Мини-игры | К-Коннект'
        description='Игра Три чаши - угадайте, под какой чашей находится шарик!'
      />

      {/* Заголовок и баланс */}
      <div
        className={`${styles.flex} ${styles['justify-between']} ${styles['items-center']} ${styles['mb-5']}`}
      >
        <button
          className={`${styles.btn} ${styles['btn-outline']} ${styles.flex} ${styles['items-center']} ${styles['gap-2']}`}
          onClick={() => navigate('/minigames')}
          style={{
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: '500',
            borderRadius: 'var(--small-border-radius)',
            border: '1px solid rgba(0, 0, 0, 0.12)',
            background: 'transparent',
            color: 'white',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <ArrowBackIcon style={{ fontSize: 20 }} />К играм
        </button>

        <div
          className={`${styles.card} ${styles['p-3']}`}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(66, 66, 66, 0.5)',
            backdropFilter: 'blur(8px)',
            minWidth: '150px',
          }}
        >
          <p
            className={styles['text-secondary']}
            style={{ margin: '0 0 4px 0', fontSize: '14px' }}
          >
            Ваш баланс:
          </p>
          <h3
            className={styles['text-lg']}
            style={{
              margin: 0,
              color: '#e91e63',
              fontWeight: 'bold',
            }}
          >
            {formatNumber(balance)} баллов
          </h3>
        </div>
      </div>

      {/* Заголовок игры */}
      <div
        className={`${styles.card} ${styles['mb-6']}`}
        style={{
          background:
            'linear-gradient(135deg, rgba(233, 30, 99, 0.1), rgba(233, 30, 99, 0.05))',
          border: '1px solid rgba(233, 30, 99, 0.2)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: 0.1,
            background:
              'radial-gradient(circle at 30% 50%, rgba(233, 30, 99, 0.3) 0%, transparent 70%)',
            zIndex: 0,
          }}
        />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div
            className={`${styles.flex} ${styles['items-center']} ${styles['gap-2']} ${styles['mb-2']}`}
          >
            <img
              src='/static/icons/cup.png'
              alt='Cup icon'
              style={{
                width: 36,
                height: 36,
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
              }}
            />
            <h1
              className={styles['text-lg']}
              style={{
                fontWeight: 'bold',
                margin: 0,
                fontSize: '2rem',
              }}
            >
              Три чаши
            </h1>
            <button
              className={`${styles.btn} ${styles['bg-transparent']}`}
              onClick={() => setShowRules(true)}
              style={{
                marginLeft: 'auto',
                padding: '8px',
                fontSize: '14px',
                borderRadius: 'var(--small-border-radius)',
                border: '1px solid rgba(0, 0, 0, 0.12)',
                background: 'transparent',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <HelpOutlineIcon style={{ fontSize: 20 }} />
            </button>
          </div>

          <p className={styles['text-secondary']} style={{ margin: 0 }}>
            Угадайте, под какой чашей находится шарик, и выиграйте в два раза
            больше своей ставки!
          </p>
        </div>
      </div>

      {/* Основная игровая область */}
      <div
        className={`${styles.card} ${styles['mb-5']}`}
        style={{
          background:
            'linear-gradient(to bottom, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01))',
          border: '1px solid rgba(0, 0, 0, 0.12)',
        }}
      >
        {/* Секция ставки */}
        <div className={styles['mb-6']}>
          <h3
            className={`${styles['text-base']} ${styles['font-bold']} ${styles['mb-4']}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <div
              style={{
                width: 3,
                height: 20,
                backgroundColor: '#e91e63',
                borderRadius: 4,
              }}
            />
            Ваша ставка
          </h3>

          <div
            className={`${styles.flex} ${styles['gap-4']} ${styles['mb-4']}`}
            style={{ flexWrap: 'wrap' }}
          >
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label
                className={styles.block}
                style={{ marginBottom: '8px', fontSize: '14px' }}
              >
                Сумма ставки
              </label>
              <div className={styles.relative}>
                <input
                  type='text'
                  className={styles.input}
                  value={betAmount}
                  onChange={handleBetChange}
                  disabled={isPlaying}
                  placeholder='Введите сумму'
                />
                <button
                  className={`${styles.btn} ${styles['bg-transparent']}`}
                  onClick={setMaxBet}
                  disabled={isPlaying}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: 'rgba(255, 255, 255, 0.7)',
                    background: 'transparent',
                    border: 'none',
                    padding: '4px 8px',
                    borderRadius: 'var(--small-border-radius)',
                    cursor: isPlaying ? 'not-allowed' : 'pointer',
                    opacity: isPlaying ? 0.5 : 1,
                    transition: 'all 0.2s ease',
                  }}
                >
                  max
                </button>
              </div>
            </div>

            <div
              className={`${styles.flex} ${styles['gap-2']}`}
              style={{ flexWrap: 'wrap' }}
            >
              {predefinedBets.map(bet => (
                <button
                  key={bet}
                  className={`${styles.btn} ${styles['btn-outline']}`}
                  disabled={isPlaying}
                  onClick={() => setBetAmount(bet.toString())}
                  style={{
                    minWidth: '80px',
                    padding: '8px 16px',
                    fontSize: '14px',
                    borderRadius: 'var(--small-border-radius)',
                    border: '1px solid rgba(0, 0, 0, 0.12)',
                    background: 'transparent',
                    color: 'white',
                    cursor: isPlaying ? 'not-allowed' : 'pointer',
                    opacity: isPlaying ? 0.5 : 1,
                    transition: 'all 0.2s ease',
                    flex: '1 1 auto',
                  }}
                >
                  {bet}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.divider} />

        {/* Секция выбора чаши */}
        <div className={styles['mb-6']}>
          <h3
            className={`${styles['text-base']} ${styles['font-bold']} ${styles['mb-4']}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <div
              style={{
                width: 3,
                height: 20,
                backgroundColor: '#e91e63',
                borderRadius: 4,
              }}
            />
            Выберите чашу
          </h3>

          <div
            className={`${styles.card} ${styles['p-4']}`}
            style={{
              background:
                'linear-gradient(to bottom, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0.01))',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '5px',
                background: 'linear-gradient(to right, #e91e63, #9c27b0)',
              }}
            />

            <div
              className={`${styles.flex} ${styles['gap-4']}`}
              style={{ justifyContent: 'center' }}
            >
              {[1, 2, 3].map(cup => (
                <div
                  key={cup}
                  onClick={() => handleCupSelect(cup)}
                  className={`${styles.flex} ${styles['flex-col']} ${styles['items-center']} ${styles['justify-center']}`}
                  style={{
                    height: '180px',
                    cursor: isPlaying ? 'default' : 'pointer',
                    position: 'relative',
                    transition: 'all 0.3s ease-in-out',
                    transform:
                      selectedCup === cup && !gameAnimation
                        ? 'translateY(-5px)'
                        : 'translateY(0)',
                    filter:
                      isPlaying && selectedCup !== cup
                        ? 'grayscale(40%) brightness(0.8)'
                        : 'none',
                    flex: 1,
                    maxWidth: '120px',
                  }}
                >
                  {selectedCup === cup && !isPlaying && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: -5,
                        left: '25%',
                        width: '50%',
                        height: 3,
                        background: '#e91e63',
                        borderRadius: 4,
                        boxShadow: '0 0 8px rgba(233, 30, 99, 0.6)',
                        transition: 'opacity 0.3s ease',
                        zIndex: 1,
                      }}
                    />
                  )}

                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      position: 'relative',
                    }}
                  >
                    <CupImage
                      lifted={revealResult}
                      winner={gameResult && gameResult.winning_cup === cup}
                    />
                  </div>

                  <p
                    className={styles['text-sm']}
                    style={{
                      fontWeight: 600,
                      color:
                        selectedCup === cup
                          ? '#e91e63'
                          : 'rgba(255, 255, 255, 0.7)',
                      marginTop: '8px',
                      transition: 'color 0.3s ease',
                      textAlign: 'center',
                    }}
                  >
                    Чаша {cup}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Кнопка игры */}
        <div
          className={`${styles.flex} ${styles['justify-center']} ${styles['mt-6']}`}
        >
          {!isPlaying ? (
            <button
              className={`${styles.btn} ${styles['btn-primary']}`}
              onClick={startGame}
              disabled={
                selectedCup === null ||
                betAmount === '' ||
                parseInt(betAmount, 10) <= 0 ||
                loading
              }
              style={{
                minWidth: 200,
                padding: '16px 32px',
                fontSize: '16px',
                fontWeight: '600',
                borderRadius: 'var(--main-border-radius)',
                backgroundColor: '#e91e63',
                border: 'none',
                color: 'white',
                cursor:
                  selectedCup === null ||
                  betAmount === '' ||
                  parseInt(betAmount, 10) <= 0 ||
                  loading
                    ? 'not-allowed'
                    : 'pointer',
                opacity:
                  selectedCup === null ||
                  betAmount === '' ||
                  parseInt(betAmount, 10) <= 0 ||
                  loading
                    ? 0.6
                    : 1,
                boxShadow: '0 4px 12px rgba(233, 30, 99, 0.3)',
                transition: 'all 0.2s ease',
              }}
            >
              {loading ? (
                <div
                  className={styles.flex}
                  style={{ alignItems: 'center', gap: '8px' }}
                >
                  <div className={styles.spinner} />
                  Загрузка...
                </div>
              ) : (
                'Играть'
              )}
            </button>
          ) : (
            <button
              className={`${styles.btn} ${styles['btn-outline']}`}
              onClick={resetGame}
              style={{
                minWidth: 200,
                padding: '16px 32px',
                fontSize: '16px',
                fontWeight: '600',
                borderRadius: 'var(--main-border-radius)',
                border: '2px solid #e91e63',
                background: 'transparent',
                color: '#e91e63',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              Играть снова
            </button>
          )}
        </div>
      </div>

      {/* Результат игры */}
      {gameResult && (
        <div
          className={`${styles.card} ${styles['mb-5']}`}
          style={{
            backgroundColor: gameResult.is_win
              ? 'rgba(76, 175, 80, 0.1)'
              : 'rgba(244, 67, 54, 0.1)',
            border: `1px solid ${gameResult.is_win ? 'rgba(76, 175, 80, 0.3)' : 'rgba(244, 67, 54, 0.3)'}`,
            animation: 'fadeIn 0.8s ease-in',
          }}
        >
          <div
            className={`${styles.flex} ${styles['items-center']} ${styles['mb-3']} ${styles['gap-2']}`}
          >
            {gameResult.is_win ? (
              <EmojiEventsIcon style={{ color: '#4caf50', fontSize: 28 }} />
            ) : (
              <SentimentVeryDissatisfiedIcon
                style={{ color: '#f44336', fontSize: 28 }}
              />
            )}
            <h2
              className={styles['text-lg']}
              style={{
                color: gameResult.is_win ? '#4caf50' : '#f44336',
                fontWeight: 'bold',
                margin: 0,
              }}
            >
              {gameResult.is_win ? 'Поздравляем!' : 'Вы не угадали!'}
            </h2>
          </div>

          <p className={styles['mb-3']}>
            {gameResult.is_win
              ? `Вы выиграли ${formatNumber(gameResult.winnings || gameResult.bet * 2)} баллов! Шарик был под чашей ${gameResult.winning_cup}.`
              : `Шарик был под чашей ${gameResult.winning_cup}. Вы потеряли ${formatNumber(gameResult.bet)} баллов.`}
          </p>

          <div
            className={`${styles.flex} ${styles['justify-between']} ${styles['items-center']}`}
          >
            <p className={styles['text-secondary']} style={{ margin: 0 }}>
              Новый баланс:{' '}
              <strong>
                {formatNumber(gameResult.new_balance || gameResult.balance)}
              </strong>{' '}
              баллов
            </p>
          </div>
        </div>
      )}

      {/* Модальное окно с правилами */}
      {showRules && (
        <div className={styles.relative} style={{ zIndex: 1000 }}>
          <div
            className={styles.absolute}
            style={{
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(4px)',
            }}
            onClick={() => setShowRules(false)}
          />

          <div
            className={`${styles.card} ${styles['p-6']}`}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto',
              zIndex: 1001,
            }}
          >
            <h2
              className={`${styles['text-lg']} ${styles['font-bold']} ${styles['mb-4']}`}
            >
              Правила игры "Три чаши"
            </h2>

            <div className={styles['mb-4']}>
              <p className={styles['mb-3']}>
                "Три чаши" - это классическая игра на везение и интуицию.
                Правила просты:
              </p>

              <ol style={{ paddingLeft: '20px' }}>
                <li className={styles['mb-2']}>
                  Сделайте ставку из своего баланса очков.
                </li>
                <li className={styles['mb-2']}>
                  Выберите одну из трех чаш, под которой, как вы думаете,
                  находится шарик.
                </li>
                <li className={styles['mb-2']}>
                  Если вы угадали, ваша ставка утраивается!
                </li>
                <li className={styles['mb-2']}>
                  Если не угадали, вы теряете сумму ставки.
                </li>
              </ol>

              <p className={styles['mb-3']}>
                Шанс выигрыша составляет 1 к 3, что даёт 33.3% вероятность
                победы.
              </p>

              <p>Удачи в игре!</p>
            </div>

            <div className={`${styles.flex} ${styles['justify-end']}`}>
              <button
                className={`${styles.btn} ${styles['btn-primary']}`}
                onClick={() => setShowRules(false)}
                style={{
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: '600',
                  borderRadius: 'var(--small-border-radius)',
                  backgroundColor: '#e91e63',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                Понятно
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Загрузка */}
      {loading && (
        <div
          className={styles.absolute}
          style={{
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 999,
          }}
        >
          <div className={styles.spinner} />
        </div>
      )}

      {/* Уведомления об ошибках */}
      {error && (
        <div
          className={`${styles.card} ${styles['p-3']}`}
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(244, 67, 54, 0.1)',
            border: '1px solid rgba(244, 67, 54, 0.3)',
            color: '#f44336',
            zIndex: 1000,
            maxWidth: '90%',
            width: '400px',
          }}
        >
          <div
            className={`${styles.flex} ${styles['justify-between']} ${styles['items-center']}`}
          >
            <span>{error}</span>
            <button
              className={`${styles.btn} ${styles['bg-transparent']}`}
              onClick={() => setError(null)}
              style={{ color: '#f44336' }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default CupsGamePage;
