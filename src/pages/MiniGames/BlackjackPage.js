import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from '../../uikit.module.css';
import PlayingCard from './components/PlayingCard';
import SEO from '../../components/SEO';

const BlackjackPage = () => {
  const navigate = useNavigate();

  const [balance, setBalance] = useState(0);
  const [betAmount, setBetAmount] = useState(10);
  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [error, setError] = useState(null);

  const [showAnimation, setShowAnimation] = useState(false);
  const [animationType, setAnimationType] = useState('');

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

  const startNewGame = async () => {
    if (betAmount < 10 || betAmount > 1000000) {
      setError('Ставка должна быть от 10 до 1000000');
      return;
    }

    if (betAmount > balance) {
      setError('Недостаточно средств для такой ставки');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/api/minigames/blackjack/new-game', {
        bet: betAmount,
      });

      if (response.data.success) {
        setGameState(response.data);
        setGameStarted(true);
        setBalance(response.data.balance);

        if (response.data.game_over) {
          showResult(response.data.result, response.data.message);
        }
      } else {
        setError(response.data.error || 'Ошибка при запуске игры');
      }
    } catch (error) {
      console.error('Ошибка при запуске игры:', error);
      setError('Не удалось запустить игру');
    } finally {
      setLoading(false);
    }
  };

  const hitCard = async () => {
    if (!gameState || gameState.game_over) return;

    setLoading(true);

    try {
      const response = await axios.post('/api/minigames/blackjack/hit', {
        game_id: gameState.game_id,
        player_hand: gameState.player_hand,
        dealer_hand: gameState.dealer_hand,
        deck: gameState.deck,
        bet: gameState.bet,
      });

      if (response.data.success) {
        setGameState(response.data);
        setBalance(response.data.balance);

        if (response.data.game_over) {
          showResult(response.data.result, response.data.message);
        }
      } else {
        setError(response.data.error || 'Ошибка при взятии карты');
      }
    } catch (error) {
      console.error('Ошибка при взятии карты:', error);
      setError('Не удалось взять карту');
    } finally {
      setLoading(false);
    }
  };

  const stand = async () => {
    if (!gameState || gameState.game_over) return;

    setLoading(true);

    try {
      const response = await axios.post('/api/minigames/blackjack/stand', {
        game_id: gameState.game_id,
        player_hand: gameState.player_hand,
        dealer_hand: gameState.dealer_hand,
        deck: gameState.deck,
        bet: gameState.bet,
      });

      if (response.data.success) {
        setGameState(response.data);
        setBalance(response.data.balance);

        showResult(response.data.result, response.data.message);
      } else {
        setError(response.data.error || 'Ошибка при остановке');
      }
    } catch (error) {
      console.error('Ошибка при остановке:', error);
      setError('Не удалось завершить игру');
    } finally {
      setLoading(false);
    }
  };

  const showResult = (result, message) => {
    if (result === 'win') {
      setAnimationType('win');
    } else if (result === 'lose') {
      setAnimationType('lose');
    } else {
      setAnimationType('tie');
    }

    setShowAnimation(true);
    setTimeout(() => {
      setShowAnimation(false);
    }, 2000);

    setError(message);
  };

  const playAgain = () => {
    setGameState(null);
    setGameStarted(false);
  };

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  const renderCard = (card, hidden = false) => {
    if (!card) return <PlayingCard hidden={true} />;

    if (hidden) {
      return <PlayingCard hidden={true} />;
    }

    const [rank, suit] = card;
    return <PlayingCard rank={rank} suit={suit} />;
  };

  const renderRules = () =>
    showRules && (
      <div className={styles.relative} style={{ zIndex: 1000 }}>
        <div
          className={styles.absolute}
          style={{
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
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
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
            zIndex: 1001,
          }}
        >
          <h2
            className={`${styles['text-lg']} ${styles['font-bold']} ${styles['mb-4']}`}
          >
            Правила игры "21"
          </h2>

          <div className={styles['mb-4']}>
            <h3
              className={`${styles['text-base']} ${styles['font-bold']} ${styles['mb-2']}`}
            >
              Цель игры
            </h3>
            <p className={styles['mb-3']}>
              Набрать 21 очко или больше очков, чем у дилера, но не перебрать
              21.
            </p>

            <h3
              className={`${styles['text-base']} ${styles['font-bold']} ${styles['mb-2']}`}
            >
              Стоимость карт
            </h3>
            <p className={styles['mb-3']}>
              - Карты от 2 до 10 стоят по своему номиналу
              <br />
              - Валеты (J), Дамы (Q) и Короли (K) стоят по 10 очков
              <br />- Тузы (A) могут стоить либо 1, либо 11 очков в зависимости
              от того, что выгоднее игроку
            </p>

            <h3
              className={`${styles['text-base']} ${styles['font-bold']} ${styles['mb-2']}`}
            >
              Ход игры
            </h3>
            <p className={styles['mb-3']}>
              1. Игрок делает ставку
              <br />
              2. Игрок и дилер получают по две карты. Одна карта дилера скрыта.
              <br />
              3. Игрок решает взять дополнительные карты (Hit) или остановиться
              (Stand)
              <br />
              4. Если игрок набирает больше 21 очка, он автоматически
              проигрывает
              <br />
              5. Когда игрок останавливается, дилер открывает свою скрытую карту
              и берет карты, пока не наберет минимум 17 очков
              <br />
              6. Сравниваются очки игрока и дилера
            </p>

            <h3
              className={`${styles['text-base']} ${styles['font-bold']} ${styles['mb-2']}`}
            >
              Выигрыши
            </h3>
            <p className={styles['mb-3']}>
              - Блэкджек (21 очко с первых двух карт): выплата 3 к 2<br />
              - Обычная победа: выплата 2 к 1<br />- Ничья: возврат ставки
            </p>
          </div>

          <div className={`${styles.flex} ${styles['justify-end']}`}>
            <button
              className={`${styles.btn} ${styles['btn-primary']}`}
              onClick={() => setShowRules(false)}
              style={{
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '600',
                borderRadius: '8px',
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
    );

  const renderAnimation = () => {
    if (!showAnimation) return null;

    let text = '';
    let color = '';

    if (animationType === 'win') {
      text = 'ПОБЕДА!';
      color = '#4caf50';
    } else if (animationType === 'lose') {
      text = 'ПРОИГРЫШ';
      color = '#f44336';
    } else {
      text = 'НИЧЬЯ';
      color = '#ff9800';
    }

    return (
      <div
        className={styles.absolute}
        style={{
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 1000,
          animation: 'fadeIn 0.5s',
        }}
      >
        <h1
          style={{
            color,
            fontWeight: 'bold',
            fontSize: '3rem',
            textShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
            animation: 'pulse 0.5s infinite alternate',
            margin: 0,
          }}
        >
          {text}
        </h1>
      </div>
    );
  };

  return (
    <div
      style={{
        padding: '16px',
        position: 'relative',
        minHeight: 'calc(100vh - 64px)',
        color: 'var(--theme-text-primary)',
        marginBottom: '100px',
      }}
    >
      <SEO
        title='21 | Мини-игры | К-Коннект'
        description='Игра 21 (блэкджек) - наберите 21 очко или больше чем у дилера, не перебрав!'
      />

      {renderAnimation()}
      {renderRules()}

      {/* Заголовок */}
      <div
        className={`${styles.flex} ${styles['justify-between']} ${styles['items-center']} ${styles['mb-4']}`}
      >
        <button
          className={`${styles.btn} ${styles['btn-outline']}`}
          onClick={() => navigate('/minigames')}
          style={{
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: '500',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            background: 'transparent',
            color: 'white',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          Назад
        </button>

        <h1
          className={styles['text-lg']}
          style={{
            color: '#e91e63',
            fontWeight: 'bold',
            margin: 0,
            fontSize: '2rem',
          }}
        >
          21
        </h1>

        <button
          className={`${styles.btn} ${styles['btn-outline']}`}
          onClick={() => setShowRules(true)}
          style={{
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: '500',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            background: 'transparent',
            color: 'white',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          Правила
        </button>
      </div>

      {/* Баланс */}
      <div
        className={`${styles.card} ${styles['mb-4']}`}
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '12px',
          padding: '16px',
        }}
      >
        <div
          className={`${styles.flex} ${styles['justify-between']} ${styles['items-center']}`}
        >
          <h3
            className={styles['text-base']}
            style={{ margin: 0, fontWeight: '600' }}
          >
            Баланс: {balance} баллов
          </h3>
          {gameState && gameState.result === 'win' && (
            <h3
              className={styles['text-base']}
              style={{
                margin: 0,
                fontWeight: '600',
                color: '#4caf50',
              }}
            >
              Выигрыш: {gameState.winnings} баллов
            </h3>
          )}
        </div>
      </div>

      {!gameStarted ? (
        /* Начальная форма */
        <div
          className={`${styles.card} ${styles['p-6']}`}
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <h2
            className={`${styles['text-base']} ${styles['font-bold']} ${styles['mb-4']}`}
          >
            Сделайте ставку и начните игру
          </h2>

          <div
            className={`${styles.flex} ${styles['items-center']} ${styles['mb-4']}`}
            style={{ gap: '16px' }}
          >
            <div>
              <label
                className={styles.block}
                style={{ marginBottom: '8px', fontSize: '14px' }}
              >
                Ставка
              </label>
              <input
                type='number'
                className={styles.input}
                value={betAmount}
                onChange={e => setBetAmount(parseInt(e.target.value) || 0)}
                min={10}
                max={1000000}
                style={{
                  width: '150px',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  color: 'var(--theme-text-primary)',
                  border: '1px solid #333333',
                }}
              />
            </div>

            <button
              className={`${styles.btn} ${styles['btn-primary']}`}
              onClick={startNewGame}
              disabled={loading || balance < betAmount}
              style={{
                padding: '16px 32px',
                fontSize: '16px',
                fontWeight: '600',
                borderRadius: '12px',
                backgroundColor: '#e91e63',
                border: 'none',
                color: 'white',
                cursor:
                  loading || balance < betAmount ? 'not-allowed' : 'pointer',
                opacity: loading || balance < betAmount ? 0.6 : 1,
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
                'Начать игру'
              )}
            </button>
          </div>

          <p
            className={styles['text-secondary']}
            style={{ fontSize: '12px', margin: 0 }}
          >
            Минимальная ставка: 10 | Максимальная ставка: 1000000
          </p>
        </div>
      ) : (
        /* Игровая область */
        <div className={styles['mt-4']}>
          {gameState && (
            <>
              {/* Карты дилера */}
              <div
                className={`${styles.card} ${styles['mb-4']}`}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '12px',
                  padding: '16px',
                }}
              >
                <h3
                  className={`${styles['text-base']} ${styles['font-bold']} ${styles['mb-3']}`}
                >
                  Дилер: {gameState.game_over ? gameState.dealer_score : '?'}
                </h3>
                <div
                  className={styles.flex}
                  style={{ flexWrap: 'wrap', gap: '8px' }}
                >
                  {gameState.dealer_hand.map((card, index) => (
                    <div
                      key={`dealer-${index}`}
                      style={{ transform: 'scale(0.9)' }}
                    >
                      {renderCard(card, index === 1 && !gameState.game_over)}
                    </div>
                  ))}
                </div>
              </div>

              {/* Карты игрока */}
              <div
                className={`${styles.card} ${styles['mb-4']}`}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '12px',
                  padding: '16px',
                }}
              >
                <h3
                  className={`${styles['text-base']} ${styles['font-bold']} ${styles['mb-3']}`}
                >
                  Игрок: {gameState.player_score}
                </h3>
                <div
                  className={styles.flex}
                  style={{ flexWrap: 'wrap', gap: '8px' }}
                >
                  {gameState.player_hand.map((card, index) => (
                    <div
                      key={`player-${index}`}
                      style={{ transform: 'scale(0.9)' }}
                    >
                      {renderCard(card)}
                    </div>
                  ))}
                </div>
              </div>

              {/* Кнопки управления */}
              <div
                className={`${styles.flex} ${styles['justify-center']} ${styles['mt-6']}`}
                style={{ gap: '16px' }}
              >
                {gameState.game_over ? (
                  <button
                    className={`${styles.btn} ${styles['btn-primary']}`}
                    onClick={playAgain}
                    style={{
                      padding: '16px 32px',
                      fontSize: '16px',
                      fontWeight: '600',
                      borderRadius: '12px',
                      backgroundColor: '#e91e63',
                      border: 'none',
                      color: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    Играть еще
                  </button>
                ) : (
                  <>
                    <button
                      className={`${styles.btn} ${styles['btn-primary']}`}
                      onClick={hitCard}
                      disabled={loading}
                      style={{
                        padding: '16px 32px',
                        fontSize: '16px',
                        fontWeight: '600',
                        borderRadius: '12px',
                        backgroundColor: '#e91e63',
                        border: 'none',
                        color: 'white',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.6 : 1,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      Взять карту
                    </button>

                    <button
                      className={`${styles.btn} ${styles['btn-outline']}`}
                      onClick={stand}
                      disabled={loading}
                      style={{
                        padding: '16px 32px',
                        fontSize: '16px',
                        fontWeight: '600',
                        borderRadius: '12px',
                        border: '2px solid #9c27b0',
                        background: 'transparent',
                        color: '#9c27b0',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.6 : 1,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      Хватит
                    </button>
                  </>
                )}
              </div>

              {/* Сообщения */}
              {gameState.message && !gameState.game_over && (
                <div
                  className={`${styles.card} ${styles['mt-4']} ${styles['p-3']}`}
                  style={{
                    background: 'rgba(33, 150, 243, 0.1)',
                    border: '1px solid rgba(33, 150, 243, 0.3)',
                    borderRadius: '8px',
                    textAlign: 'center',
                  }}
                >
                  <p style={{ margin: 0, color: '#2196f3' }}>
                    {gameState.message}
                  </p>
                </div>
              )}
            </>
          )}
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
          }
          to {
            opacity: 1;
          }
        }

        @keyframes pulse {
          from {
            transform: scale(1);
          }
          to {
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  );
};

export default BlackjackPage;
