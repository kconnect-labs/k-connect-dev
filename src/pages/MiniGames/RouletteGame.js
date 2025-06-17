import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  Slider,
  Paper,
  useTheme,
  alpha,
  CircularProgress,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import CasinoIcon from '@mui/icons-material/Casino';
import Confetti from 'react-confetti';
import RoulettePro from 'react-roulette-pro';
import 'react-roulette-pro/dist/index.css';

const ICONS = {
  balls: '/static/icons/balls.png',
  noballs: '/static/icons/noballs.png',
};

const bounce = keyframes`
  0% { transform: scale(1); }
  20% { transform: scale(1.18, 0.92); }
  40% { transform: scale(0.95, 1.08); }
  60% { transform: scale(1.08, 0.97); }
  80% { transform: scale(0.98, 1.03); }
  100% { transform: scale(1); }
`;

const GameContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  maxWidth: 900,
  margin: '0 auto',
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.7)}, ${alpha(theme.palette.primary.main, 0.3)})`,
  backdropFilter: 'blur(12px)',
  borderRadius: 20,
  boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
}));

const ReelWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: 170,
  overflow: 'hidden',
  margin: '0 auto',
  background: alpha(theme.palette.background.paper, 0.7),
  borderRadius: 16,
  border: `2.5px solid ${alpha(theme.palette.primary.main, 0.18)}`,
  boxShadow: `0 4px 24px ${alpha(theme.palette.primary.main, 0.10)}`,
}));

const Reel = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  height: '100%',
  willChange: 'transform',
}));

const Item = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'iscenter' && prop !== 'bounce',
})(({ theme, iscenter, bounce }) => ({
  width: 120,
  minWidth: 120,
  height: 140,
  margin: '0 12px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 14,
  background: iscenter ? alpha(theme.palette.primary.main, 0.13) : 'transparent',
  boxShadow: iscenter
    ? `0 0 0 3px ${theme.palette.primary.main}, 0 0 16px 2px ${alpha(theme.palette.primary.main, 0.18)}, 0 0 32px 8px ${alpha(theme.palette.primary.main, 0.13)}`
    : 'none',
  transition: 'box-shadow 0.2s, background 0.2s',
  position: 'relative',
  zIndex: iscenter ? 2 : 1,
  animation: bounce ? `${bounce} 0.7s cubic-bezier(.36,1.56,.64,1) 1` : 'none',
  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
  '&::after': {
    content: '""',
    position: 'absolute',
    right: -12,
    top: '10%',
    height: '80%',
    width: 1,
    background: alpha(theme.palette.divider, 0.2),
  }
}));

const CenterLine = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: '50%',
  transform: `translateX(-50%)`,
  width: ITEM_WIDTH,
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  pointerEvents: 'none',
  zIndex: 10,
  '&::after': {
    content: '""',
    display: 'block',
    width: 6,
    height: '100%',
    margin: '0 auto',
    background: `linear-gradient(180deg, ${theme.palette.primary.main} 60%, transparent 100%)`,
    borderRadius: 3,
    boxShadow: `0 0 18px 4px ${alpha(theme.palette.primary.main, 0.35)}`,
  },
}));

const BetAmount = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginTop: theme.spacing(3),
}));

const PrizeDisplay = styled(Box)(({ theme, win }) => ({
  textAlign: 'center',
  marginTop: theme.spacing(3),
  padding: theme.spacing(2),
  borderRadius: 10,
  background: win ? alpha(theme.palette.success.main, 0.13) : alpha(theme.palette.error.main, 0.09),
  color: win ? theme.palette.success.main : theme.palette.text.primary,
  fontWeight: 700,
  fontSize: '1.2rem',
  boxShadow: win ? `0 0 16px 2px ${alpha(theme.palette.success.main, 0.18)}` : 'none',
}));

const ITEM_WIDTH = 144;
const REEL_LENGTH = 35;
const VISIBLE_ITEMS = 7; // Сколько реально видно ячеек на экране
const CENTER_INDEX = Math.floor(VISIBLE_ITEMS / 2); // Центр всегда по центру ячейки
const LOOP_COUNT = 8;
const FIXED_START_ITEMS = 8;
const WIN_OFFSET_FROM_START = FIXED_START_ITEMS + CENTER_INDEX;

function getLongReelData(betAmount) {
  // 16 balls, 32 noballs, перемешать
  const arr = [
    ...Array(16).fill({ type: 'balls', text: `+${betAmount * 2}₽` }),
    ...Array(32).fill({ type: 'noballs', text: 'Без выигрыша' }),
  ];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.map(item => ({
    image: ICONS[item.type],
    text: item.text,
    type: item.type,
  }));
}

const renderPrize = (prize, idx, { isActive }) => (
  <Box
    key={idx}
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: 90,
      minWidth: 90,
      height: 110,
      background: 'transparent',
      borderRadius: 2,
      border: isActive ? '2.5px solid #a78bfa' : 'none',
      boxShadow: isActive ? '0 0 16px 2px #a78bfa55' : 'none',
      p: 0,
      m: '0 6px',
      transition: 'box-shadow 0.2s, border 0.2s',
    }}
  >
    <Box
      component="img"
      src={prize.image}
      alt={prize.type}
      sx={{ width: 54, height: 54, mb: 0.5, filter: prize.type === 'noballs' ? 'grayscale(0.7)' : 'none' }}
    />
    <Typography
      sx={{
        fontSize: '0.95rem',
        fontWeight: 700,
        color: prize.type === 'balls' ? '#4ade80' : '#a1a1aa',
        textShadow: prize.type === 'balls' ? '0 0 8px #4ade8033' : 'none',
        mt: 0.5,
      }}
      align="center"
    >
      {prize.text}
    </Typography>
  </Box>
);

const RouletteGame = () => {
  const theme = useTheme();
  const [betAmount, setBetAmount] = useState(100);
  const [isSpinning, setIsSpinning] = useState(false);
  const [prize, setPrize] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [prizeIndex, setPrizeIndex] = useState(0);
  const [reelData, setReelData] = useState(() => getLongReelData(100));

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setPrize(null);
    setShowConfetti(false);
    const newData = getLongReelData(betAmount);
    setReelData(newData);
    // Выбираем случайный индекс balls или noballs с шансом 40%/60%
    const ballsIndexes = newData.map((item, idx) => item.type === 'balls' ? idx : null).filter(idx => idx !== null);
    const noballsIndexes = newData.map((item, idx) => item.type === 'noballs' ? idx : null).filter(idx => idx !== null);
    const winType = Math.random() < 0.4 ? 'balls' : 'noballs';
    let idx;
    if (winType === 'balls') {
      idx = ballsIndexes[Math.floor(Math.random() * ballsIndexes.length)];
    } else {
      idx = noballsIndexes[Math.floor(Math.random() * noballsIndexes.length)];
    }
    setPrizeIndex(idx);
  };

  return (
    <GameContainer>
      <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 800, letterSpacing: 1 }}>
        Кейс-рулетка
      </Typography>
      <Box sx={{ position: 'relative', width: '100%', maxWidth: 900, mx: 'auto', my: 4 }}>
        <RoulettePro
          prizes={reelData}
          prizeIndex={prizeIndex}
          renderPrize={renderPrize}
          onPrizeDefined={() => {
            const win = reelData[prizeIndex].type === 'balls';
            setPrize({
              type: win ? 'balls' : 'noballs',
              amount: win ? betAmount * 2 : 0,
            });
            if (win) setShowConfetti(true);
            setIsSpinning(false);
          }}
          spinning={isSpinning}
          start={isSpinning}
          options={{
            stopOnPrize: true,
            prizeSlot: 3, // центр
            duration: 2600,
            easing: 'cubic-bezier(0.22, 1, 0.36, 1)', // быстрое начало, плавное замедление
          }}
          style={{ height: 130 }}
        />
      </Box>
      <BetAmount>
        <Typography>Ставка:</Typography>
        <Slider
          value={betAmount}
          onChange={(e, v) => setBetAmount(v)}
          min={100}
          max={10000}
          step={100}
          valueLabelDisplay="auto"
          valueLabelFormat={v => `${v} ₽`}
          sx={{ flex: 1, mx: 2 }}
          disabled={isSpinning}
        />
        <Typography sx={{ fontWeight: 700 }}>{betAmount} ₽</Typography>
      </BetAmount>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleSpin}
          disabled={isSpinning}
          startIcon={isSpinning ? <CircularProgress size={22} /> : <CasinoIcon />}
          sx={{
            minWidth: 220,
            height: 56,
            fontSize: '1.15rem',
            borderRadius: 28,
            fontWeight: 700,
            background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.dark} 90%)`,
            boxShadow: '0 3px 12px 2px rgba(0,0,0,0.18)',
            letterSpacing: 1,
            '&:hover': {
              transform: 'scale(1.05)',
            },
          }}
        >
          {isSpinning ? 'Крутится...' : 'Крутить'}
        </Button>
      </Box>
      {prize && (
        <PrizeDisplay win={prize.type === 'balls'}>
          {prize.type === 'balls' ? (
            <>
              Поздравляем! Вы выиграли <b>{prize.amount} ₽</b>
            </>
          ) : (
            <>Без выигрыша</>
          )}
        </PrizeDisplay>
      )}
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={180}
          gravity={0.3}
        />
      )}
    </GameContainer>
  );
};

export default RouletteGame; 