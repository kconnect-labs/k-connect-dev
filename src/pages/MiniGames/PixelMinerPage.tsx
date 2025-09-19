import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  Grid,
  TextField,
  CircularProgress,
  useTheme,
  alpha,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Card,
  CardContent,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import GridOnIcon from '@mui/icons-material/GridOn';
import DiamondIcon from '@mui/icons-material/Diamond';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SEO from '../../components/SEO';

const PageHeader = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: theme.spacing(3),
  padding: theme.spacing(4, 2),
  background: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(20px)',
  borderRadius: '18px',
  border: '1px solid rgba(0, 0, 0, 0.12)',
  position: 'relative',
  overflow: 'hidden',
}));

const GameContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(3),
  padding: theme.spacing(2),
}));

const GameGrid = styled(Grid)<{ gridSize: number }>(({ theme, gridSize }) => ({
  maxWidth: '100%',
  margin: '0 auto',
  display: 'flex',
  justifyContent: 'center',
}));

const Cell = styled(Paper)<{
  revealed: boolean;
  cellType: string;
  isMobile: boolean;
  gridSize: number;
}>(({ theme, revealed, cellType, isMobile, gridSize }) => ({
  width: isMobile ? 50 : 60,
  height: isMobile ? 50 : 60,
  minWidth: isMobile ? 50 : 60,
  minHeight: isMobile ? 50 : 60,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: revealed ? 'default' : 'pointer',
  transition: 'all 0.3s ease',
  background: revealed
    ? cellType === 'gold'
      ? 'linear-gradient(135deg, #FFD700, #FFA500)'
      : cellType === 'bomb'
        ? 'linear-gradient(135deg, #FF4444, #CC0000)'
        : 'rgba(255, 255, 255, 0.05)'
    : 'rgba(255, 255, 255, 0.08)',
  backdropFilter: 'blur(10px)',
  borderRadius: '18px',
  border: revealed
    ? cellType === 'gold'
      ? '2px solid #FFD700'
      : cellType === 'bomb'
        ? '2px solid #FF4444'
        : '1px solid rgb(24 24 24)'
    : '1px solid rgb(24 24 24)',
  boxShadow: revealed
    ? cellType === 'gold'
      ? '0 0 20px rgba(255, 215, 0, 0.5)'
      : cellType === 'bomb'
        ? '0 0 20px rgba(255, 68, 68, 0.5)'
        : 'none'
    : '0 4px 12px rgba(0, 0, 0, 0.1)',
  '&:hover': {
    transform: revealed ? 'none' : 'scale(1.05)',
    boxShadow: revealed ? undefined : '0 8px 24px rgba(0, 0, 0, 0.2)',
  },
  '&:active': {
    transform: revealed ? 'none' : 'scale(0.95)',
  },
}));

const StatsCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(1),
  background: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(20px)',
  borderRadius: '18px',
  border: '1px solid rgba(0, 0, 0, 0.12)',
  boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.1)}`,
  minWidth: 120,
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  padding: theme.spacing(1.5, 3),
  fontWeight: 'bold',
  transition: 'all 0.2s ease',
  textTransform: 'none',
  fontSize: '1rem',
}));

const BetInput = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(20px)',
    borderRadius: '18px',
    border: '1px solid rgba(0, 0, 0, 0.12)',
    '& fieldset': {
      border: 'none',
    },
    '&:hover fieldset': {
      border: 'none',
    },
    '&.Mui-focused fieldset': {
      border: 'none',
    },
  },
  '& .MuiInputBase-input': {
    color: theme.palette.text.primary,
    textAlign: 'center',
    fontSize: '1.1rem',
    fontWeight: 'bold',
  },
}));

const GameSetupCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(20px)',
  borderRadius: '18px',
  border: '1px solid rgba(0, 0, 0, 0.12)',
  boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.1)}`,
  marginBottom: theme.spacing(3),
}));

interface GameState {
  field: string[][];
  current_score: number;
  game_over: boolean;
  bet_amount: number;
  grid_size: number;
}

const PixelMinerPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [betAmount, setBetAmount] = useState(10);
  const [gridSize, setGridSize] = useState(3);
  const [loading, setLoading] = useState(false);
  const [clickLoading, setClickLoading] = useState(false);
  const [userBalance, setUserBalance] = useState<number | null>(null);
  const [showGameOverDialog, setShowGameOverDialog] = useState(false);
  const [gameOverMessage, setGameOverMessage] = useState('');
  const [showCashoutDialog, setShowCashoutDialog] = useState(false);
  const [cashoutInfo, setCashoutInfo] = useState({
    bet: 0,
    winnings: 0,
    total: 0,
  });

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const response = await axios.get('/api/user/points');
      if (response?.data?.points !== undefined) {
        setUserBalance(parseInt(response.data.points));
      }
    } catch (error) {
      console.error('Ошибка при получении баланса:', error);
      toast.error('Не удалось загрузить баланс');
    }
  };

  const startGame = async () => {
    if (betAmount < 1 || betAmount > 10000000000) {
      toast.error('Ставка должна быть от 1 до 10000');
      return;
    }

    if (userBalance !== null && betAmount > userBalance) {
      toast.error('Недостаточно средств');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('/api/minigames/pixel-miner/start', {
        bet_amount: betAmount,
        grid_size: gridSize,
      });

      if (response.data.success) {
        setGameState(response.data);
        setUserBalance(response.data.new_balance);
        toast.success(`Игра началась! Поле ${gridSize}x${gridSize}`);
      } else {
        toast.error(response.data.error || 'Ошибка при запуске игры');
      }
    } catch (error: any) {
      console.error('Ошибка при запуске игры:', error);
      toast.error(error.response?.data?.error || 'Ошибка при запуске игры');
    } finally {
      setLoading(false);
    }
  };

  const clickCell = async (row: number, col: number) => {
    if (!gameState || gameState.game_over || clickLoading) return;

    try {
      setClickLoading(true);
      const response = await axios.post('/api/minigames/pixel-miner/click', {
        row,
        col,
      });

      if (response.data.success) {
        setGameState(response.data);

        if (response.data.game_over) {
          setGameOverMessage(response.data.message || 'Игра окончена!');
          setShowGameOverDialog(true);
        } else if (response.data.field[row][col] === 'gold') {
          const goldReward = Math.floor(gameState.bet_amount * 0.1);
          toast.success(`+${goldReward} очков!`);
        }
      } else {
        toast.error(response.data.error || 'Ошибка при клике');
        // Если игра не найдена, сбрасываем состояние
        if (response.data.error?.includes('не найдена')) {
          setGameState(null);
        }
      }
    } catch (error: any) {
      console.error('Ошибка при клике:', error);
      const errorMessage = error.response?.data?.error || 'Ошибка при клике';
      toast.error(errorMessage);

      // Если игра не найдена, сбрасываем состояние
      if (errorMessage.includes('не найдена')) {
        setGameState(null);
      }
    } finally {
      setClickLoading(false);
    }
  };

  const cashOut = async () => {
    if (
      !gameState ||
      gameState.current_score === 0 ||
      gameState.game_over ||
      loading
    )
      return;

    // Показываем диалог с информацией о выигрыше
    setCashoutInfo({
      bet: gameState.bet_amount,
      winnings: gameState.current_score,
      total: gameState.bet_amount + gameState.current_score,
    });
    setShowCashoutDialog(true);
  };

  const confirmCashout = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/api/minigames/pixel-miner/cashout');
      if (response.data.success) {
        setUserBalance(response.data.new_balance);
        toast.success(
          `Выигрыш зачислен! +${formatNumber(response.data.winnings)} баллов`
        );
        setGameState(null);
        setShowCashoutDialog(false);
      } else {
        toast.error(response.data.error || 'Ошибка при заборе выигрыша');
        if (response.data.error?.includes('не найдена')) {
          setGameState(null);
        }
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || 'Ошибка при заборе выигрыша';
      toast.error(errorMessage);
      if (errorMessage.includes('не найдена')) {
        setGameState(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ru-RU').format(num);
  };

  const getCellIcon = (cellType: string, isMobile: boolean) => {
    const iconSize = isMobile ? 24 : 28;
    switch (cellType) {
      case 'gold':
        return <DiamondIcon sx={{ fontSize: iconSize, color: '#FFD700' }} />;
      case 'bomb':
        return (
          <LocalFireDepartmentIcon
            sx={{ fontSize: iconSize, color: '#FF4444' }}
          />
        );
      default:
        return (
          <VisibilityOffIcon
            sx={{ fontSize: iconSize - 4, color: 'rgba(255, 255, 255, 0.5)' }}
          />
        );
    }
  };

  const handleGameOverClose = () => {
    setShowGameOverDialog(false);
    setGameState(null);
  };

  return (
    <Container maxWidth='md' sx={{ py: 3 }}>
      <SEO
        title='Pixel Miner - Мини-игра'
        description='Откройте блоки с золотом, избегая бомб! Забирайте выигрыш в любой момент.'
        image=''
        url=''
        type=''
        meta={{}}
      />

      <PageHeader>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
          }}
        >
          <GridOnIcon
            sx={{ fontSize: 32, mr: 1, color: theme.palette.primary.main }}
          />
          <Typography variant='h4' component='h1' fontWeight='bold'>
            Pixel Miner
          </Typography>
        </Box>
        <Typography variant='body1' color='text.secondary'>
          Откройте блоки с золотом, избегая бомб! Забирайте выигрыш в любой
          момент.
        </Typography>
      </PageHeader>

      <GameContainer>
        {!gameState ? (
          // Начальный экран
          <Box sx={{ textAlign: 'center', width: '100%', maxWidth: 500 }}>
            <StatsCard sx={{ mb: 3 }}>
              <Typography variant='h6' color='primary'>
                Баланс
              </Typography>
              <Typography variant='h4' fontWeight='bold'>
                {userBalance !== null ? formatNumber(userBalance) : '...'}
              </Typography>
            </StatsCard>

            <GameSetupCard>
              <CardContent>
                <Typography variant='h6' sx={{ mb: 3, textAlign: 'center' }}>
                  Настройки игры
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant='body1'
                    sx={{ mb: 2, textAlign: 'center' }}
                  >
                    Размер поля: {gridSize}x{gridSize}
                  </Typography>
                  <Slider
                    value={gridSize}
                    onChange={(_, value) => setGridSize(value as number)}
                    min={3}
                    max={12}
                    step={1}
                    marks
                    valueLabelDisplay='auto'
                    sx={{ mb: 2 }}
                  />
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 3,
                    }}
                  >
                    <Chip
                      label='3x3'
                      size='small'
                      color={gridSize === 3 ? 'primary' : 'default'}
                    />
                    <Chip
                      label='6x6'
                      size='small'
                      color={gridSize === 6 ? 'primary' : 'default'}
                    />
                    <Chip
                      label='9x9'
                      size='small'
                      color={gridSize === 9 ? 'primary' : 'default'}
                    />
                    <Chip
                      label='12x12'
                      size='small'
                      color={gridSize === 12 ? 'primary' : 'default'}
                    />
                  </Box>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant='body1'
                    sx={{ mb: 2, textAlign: 'center' }}
                  >
                    Ставка: {formatNumber(betAmount)} баллов
                  </Typography>
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{ mb: 2, textAlign: 'center' }}
                  >
                    Награда за золото:{' '}
                    {formatNumber(Math.floor(betAmount * 0.1))} баллов (10% от
                    ставки)
                  </Typography>
                  <BetInput
                    type='number'
                    value={betAmount}
                    onChange={e => setBetAmount(Number(e.target.value))}
                    inputProps={{ min: 1, max: 10000 }}
                    fullWidth
                    sx={{ mb: 2 }}
                  />
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    {[10, 50, 100, 500, 1000].map(amount => (
                      <Button
                        key={amount}
                        variant='outlined'
                        size='small'
                        onClick={() => setBetAmount(amount)}
                        sx={{ flex: 1 }}
                      >
                        {formatNumber(amount)}
                      </Button>
                    ))}
                  </Box>
                </Box>

                <ActionButton
                  variant='contained'
                  onClick={startGame}
                  disabled={loading}
                  fullWidth
                  size='large'
                  startIcon={
                    loading ? <CircularProgress size={20} /> : <GridOnIcon />
                  }
                >
                  {loading
                    ? 'Запуск...'
                    : `Начать игру ${gridSize}x${gridSize}`}
                </ActionButton>
              </CardContent>
            </GameSetupCard>
          </Box>
        ) : (
          // Игровой экран
          <>
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              <StatsCard>
                <Typography variant='body2' color='text.secondary'>
                  Ставка
                </Typography>
                <Typography variant='h6' fontWeight='bold'>
                  {formatNumber(gameState.bet_amount)}
                </Typography>
              </StatsCard>

              <StatsCard>
                <Typography variant='body2' color='text.secondary'>
                  Очки
                </Typography>
                <Typography variant='h6' fontWeight='bold' color='primary'>
                  {formatNumber(gameState.current_score)}
                </Typography>
              </StatsCard>

              <StatsCard>
                <Typography variant='body2' color='text.secondary'>
                  Награда за золото
                </Typography>
                <Typography variant='h6' fontWeight='bold' color='warning.main'>
                  {formatNumber(Math.floor(gameState.bet_amount * 0.1))}
                </Typography>
              </StatsCard>

              <StatsCard>
                <Typography variant='body2' color='text.secondary'>
                  Баланс
                </Typography>
                <Typography variant='h6' fontWeight='bold'>
                  {formatNumber(userBalance || 0)}
                </Typography>
              </StatsCard>
            </Box>

            <GameGrid container spacing={1} gridSize={gameState.grid_size}>
              {gameState.field.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <Grid item key={`${rowIndex}-${colIndex}`}>
                    <Cell
                      revealed={cell !== 'hidden'}
                      cellType={cell}
                      isMobile={isMobile}
                      gridSize={gameState.grid_size}
                      onClick={() => clickCell(rowIndex, colIndex)}
                    >
                      {getCellIcon(cell, isMobile)}
                    </Cell>
                  </Grid>
                ))
              )}
            </GameGrid>

            <Box
              sx={{
                display: 'flex',
                gap: 2,
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              <ActionButton
                variant='outlined'
                onClick={() => setGameState(null)}
                startIcon={<ArrowBackIcon />}
              >
                Новая игра
              </ActionButton>

              <ActionButton
                variant='contained'
                onClick={cashOut}
                disabled={
                  gameState.current_score === 0 ||
                  gameState.game_over ||
                  loading
                }
                startIcon={<AccountBalanceWalletIcon />}
                sx={{
                  background: '#cfbcfb',
                  '&:hover': {
                    background: '#9974f0',
                  },
                }}
              >
                Забрать выигрыш
              </ActionButton>
            </Box>

            {clickLoading && (
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <CircularProgress size={24} />
                <Typography variant='body2' sx={{ mt: 1 }}>
                  Обработка клика...
                </Typography>
              </Box>
            )}
          </>
        )}
      </GameContainer>

      {/* Диалог окончания игры */}
      <Dialog
        open={showGameOverDialog}
        onClose={handleGameOverClose}
        maxWidth='sm'
        fullWidth
        PaperProps={{
          sx: {
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(20px)',
            borderRadius: isMobile ? 0 : 'var(--main-border-radius) !important',
            border: '1px solid rgba(0, 0, 0, 0.12)',
          },
        }}
      >
        <DialogTitle sx={{ textAlign: 'center' }}>Игра окончена</DialogTitle>
        <DialogContent>
          <Typography variant='body1' textAlign='center'>
            {gameOverMessage}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <ActionButton variant='contained' onClick={handleGameOverClose}>
            Новая игра
          </ActionButton>
        </DialogActions>
      </Dialog>

      {/* Диалог подтверждения выигрыша */}
      <Dialog
        open={showCashoutDialog}
        onClose={() => setShowCashoutDialog(false)}
        maxWidth='sm'
        fullWidth
        PaperProps={{
          sx: {
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(20px)',
            borderRadius: isMobile ? 0 : 'var(--main-border-radius) !important',
            border: '1px solid rgba(0, 0, 0, 0.12)',
          },
        }}
      >
        <DialogTitle sx={{ textAlign: 'center' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 1,
            }}
          >
            <AccountBalanceWalletIcon
              sx={{ fontSize: 32, mr: 1, color: '#4CAF50' }}
            />
            <Typography variant='h6'>Забрать выигрыш</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography variant='h5' color='primary' sx={{ mb: 3 }}>
              Поздравляем! 🎉
            </Typography>

            <Box
              sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 2,
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 1,
                }}
              >
                <Typography variant='body1'>Ваша ставка:</Typography>
                <Typography variant='body1' fontWeight='bold'>
                  {formatNumber(cashoutInfo.bet)} баллов
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 2,
                  bgcolor: 'rgba(76, 175, 80, 0.1)',
                  borderRadius: 'var(--main-border-radius)',
                  border: '1px solid rgba(76, 175, 80, 0.3)',
                }}
              >
                <Typography variant='body1' color='#4CAF50'>
                  Выигрыш:
                </Typography>
                <Typography variant='body1' fontWeight='bold' color='#4CAF50'>
                  +{formatNumber(cashoutInfo.winnings)} баллов
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 2,
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 'var(--main-border-radius)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                <Typography variant='h6'>Итого получите:</Typography>
                <Typography variant='h6' fontWeight='bold' color='primary'>
                  {formatNumber(cashoutInfo.total)} баллов
                </Typography>
              </Box>
            </Box>

            <Typography variant='body2' color='text.secondary'>
              Вы уверены, что хотите забрать выигрыш и завершить игру?
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2, gap: 2 }}>
          <ActionButton
            variant='outlined'
            onClick={() => setShowCashoutDialog(false)}
            disabled={loading}
          >
            Отмена
          </ActionButton>
          <ActionButton
            variant='contained'
            onClick={confirmCashout}
            disabled={loading}
            startIcon={
              loading ? (
                <CircularProgress size={20} />
              ) : (
                <AccountBalanceWalletIcon />
              )
            }
            sx={{
              background: 'linear-gradient(135deg, #4CAF50, #45a049)',
              '&:hover': {
                background: 'linear-gradient(135deg, #45a049, #3d8b40)',
              },
            }}
          >
            {loading ? 'Зачисление...' : 'Забрать выигрыш'}
          </ActionButton>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PixelMinerPage;
