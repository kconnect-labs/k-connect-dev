import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  Button,
  Chip,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  Fade,
  Container,
} from '@mui/material';
import {
  ArrowBack,
  PlayArrow,
  Share,
  VerifiedUser,
  Instagram,
  Twitter,
  Facebook,
  Language,
  Shuffle,
  MoreHoriz,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { ArtistHeaderProps } from '../types';
import InfoBlock from '../../../UIKIT/InfoBlock';


const HeaderWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
}));


const ArtistWatermark = styled(Box)<{ artistName: string }>(({ theme, artistName }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  pointerEvents: 'none',
  zIndex: 1,
  overflow: 'hidden',
  '&::before': {
    content: `"${artistName.repeat(100)} ${artistName.repeat(100)} ${artistName.repeat(100)} ${artistName.repeat(100)} ${artistName.repeat(100)} ${artistName.repeat(100)} ${artistName.repeat(100)} ${artistName.repeat(100)} ${artistName.repeat(100)} ${artistName.repeat(100)}"`,
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) rotate(-40deg)',
    fontSize: '1.8rem',
    fontWeight: 900,
    color: 'rgba(255, 255, 255, 0.04)',
    whiteSpace: 'pre-wrap',
    letterSpacing: '0.1rem',
    textTransform: 'uppercase',
    lineHeight: 1.2,
    width: '300%',
    textAlign: 'center',
    fontFamily: '"Inter", "Roboto", sans-serif',
    wordBreak: 'break-all',
    [theme.breakpoints.down('lg')]: {
      fontSize: '1.5rem',
      letterSpacing: '0.08rem',
    },
    [theme.breakpoints.down('md')]: {
      fontSize: '1.3rem',
      letterSpacing: '0.06rem',
    },
    [theme.breakpoints.down('sm')]: {
      fontSize: '1.2rem',
      letterSpacing: '0.05rem',
    },
  },
}));


const InfoBlockContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(4),
  position: 'relative',
  zIndex: 2,
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    textAlign: 'center',
    gap: theme.spacing(3),
  },
}));

const ArtistAvatar = styled(Avatar)(({ theme }) => ({
  width: 180,
  height: 180,
  borderRadius: '16px',
  boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)',
  flexShrink: 0,
  transition: 'all 0.3s ease',
  border: '3px solid rgba(255, 255, 255, 0.4)',
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: '0 16px 32px rgba(0, 0, 0, 0.2)',
  },
  [theme.breakpoints.down('md')]: {
    width: 140,
    height: 140,
  },
  [theme.breakpoints.down('sm')]: {
    width: 120,
    height: 120,
  },
}));

const InfoSection = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2.5),
  minWidth: 0,
  [theme.breakpoints.down('md')]: {
    gap: theme.spacing(2),
  },
}));

const ArtistTypeLabel = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  fontWeight: 700,
  color: 'rgba(255, 255, 255, 0.6)',
  textTransform: 'uppercase',
  letterSpacing: '2px',
  marginBottom: theme.spacing(0.5),
}));

const NameSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  flexWrap: 'wrap',
  marginBottom: theme.spacing(1),
  [theme.breakpoints.down('md')]: {
    justifyContent: 'center',
  },
}));

const ArtistName = styled(Typography)(({ theme }) => ({
  fontWeight: 900,
  fontSize: '3.5rem',
  lineHeight: 0.9,
  color: '#ffffff',
  letterSpacing: '-0.03em',
  [theme.breakpoints.down('lg')]: {
    fontSize: '3rem',
  },
  [theme.breakpoints.down('md')]: {
    fontSize: '2.5rem',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '2rem',
  },
}));

const VerifiedBadge = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  backgroundColor: 'rgba(0, 0, 0, 0.15)',
  color: '#ffffff',
  padding: theme.spacing(0.5, 1.5),
  borderRadius: '24px',
  fontSize: '0.8rem',
  fontWeight: 700,
  border: '2px solid rgba(0, 0, 0, 0.1)',
}));

const StatsSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(3),
  alignItems: 'center',
  flexWrap: 'wrap',
  [theme.breakpoints.down('md')]: {
    justifyContent: 'center',
    gap: theme.spacing(2),
  },
}));

const StatItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  [theme.breakpoints.down('md')]: {
    alignItems: 'center',
  },
}));

const StatNumber = styled(Typography)(({ theme }) => ({
  fontWeight: 900,
  color: '#ffffff',
  fontSize: '1.75rem',
  lineHeight: 1,
}));

const StatLabel = styled(Typography)(({ theme }) => ({
  color: 'rgba(255, 255, 255, 0.6)',
  fontSize: '0.8rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '1px',
}));

const ActionSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  alignItems: 'center',
  marginTop: theme.spacing(2),
  [theme.breakpoints.down('md')]: {
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
}));

const PlayButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  padding: theme.spacing(1.5, 4),
  fontWeight: 800,
  fontSize: '1rem',
  textTransform: 'none',
  minWidth: 140,
  height: 48,
  background: '#B69DF8',
  color: '#000000',
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.4)',
    background: '#B69DF8',
  },
}));

const SecondaryButton = styled(Button)(({ theme }) => ({
  borderRadius: '32px',
  padding: theme.spacing(1.5, 3),
  fontWeight: 700,
  fontSize: '1rem',
  textTransform: 'none',
  minWidth: 120,
  height: 48,
  backgroundColor: 'transparent',
  color: '#ffffff',
  border: '2px solid rgba(0, 0, 0, 0.2)',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderColor: 'rgba(0, 0, 0, 0.3)',
    transform: 'translateY(-1px)',
  },
}));

const IconButtonStyled = styled(Button)(({ theme }) => ({
  minWidth: 48,
  width: 48,
  height: 48,
  borderRadius: '50%',
  backgroundColor: 'rgba(0, 0, 0, 0.1)',
  color: 'rgba(255, 255, 255, 0.7)',
  border: '2px solid rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderColor: 'rgba(0, 0, 0, 0.2)',
    color: '#ffffff',
    transform: 'scale(1.05)',
  },
}));

const BackButton = styled(Button)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  left: theme.spacing(1),
  zIndex: 10,
  minWidth: 40,
  width: 40,
  height: 40,
  borderRadius: '50%',
  backgroundColor: 'rgba(31, 31, 31, 0.9)',
  color: '#ffffff',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: 'rgba(46, 46, 46, 0.9)',
    transform: 'scale(1.01)',
    boxShadow: '0 4px 12px rgba(54, 54, 54, 0.06)',
  },
}));

const ArtistHeader: React.FC<ArtistHeaderProps> = ({
  artist,
  tracks,
  onBackClick,
  onShareClick,
  onPlayClick,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <HeaderWrapper>
      <BackButton onClick={onBackClick}>
        <ArrowBack sx={{ fontSize: 20 }} />
      </BackButton>

      <InfoBlock
        title=""
        description=""
        children={
          <>
            <ArtistWatermark artistName={artist.name} />
            <InfoBlockContent>
              <ArtistAvatar
                src={artist.avatar_url || '/static/uploads/system/album_placeholder.jpg'}
                alt={artist.name}
              />

              <InfoSection>
                <Box>
                  <ArtistTypeLabel>Исполнитель</ArtistTypeLabel>
                  <NameSection>
                    <ArtistName>
                      {artist.name}
                    </ArtistName>
                    {artist.verified && (
                      <Fade in={true}>
                        <VerifiedBadge>
                          <VerifiedUser sx={{ fontSize: 16 }} />
                          Проверено
                        </VerifiedBadge>
                      </Fade>
                    )}
                  </NameSection>
                </Box>

                {(artist.followers_count || artist.monthly_listeners) && (
                  <StatsSection>
                    {artist.followers_count && (
                      <StatItem>
                        <StatNumber>{formatNumber(artist.followers_count)}</StatNumber>
                        <StatLabel>подписчиков</StatLabel>
                      </StatItem>
                    )}
                    {artist.monthly_listeners && (
                      <StatItem>
                        <StatNumber>{formatNumber(artist.monthly_listeners)}</StatNumber>
                        <StatLabel>слушателей в месяц</StatLabel>
                      </StatItem>
                    )}
                  </StatsSection>
                )}

                <ActionSection>
                  {tracks && tracks.length > 0 && (
                    <PlayButton onClick={onPlayClick}>
                      <PlayArrow sx={{ fontSize: 20, marginRight: 1 }} />
                      Слушать
                    </PlayButton>
                  )}
                  
                  <SecondaryButton onClick={onPlayClick}>
                    <Shuffle sx={{ fontSize: 18, marginRight: 1 }} />
                    Перемешать
                  </SecondaryButton>

                  <IconButtonStyled onClick={onShareClick}>
                    <Share sx={{ fontSize: 18 }} />
                  </IconButtonStyled>


                </ActionSection>
              </InfoSection>
            </InfoBlockContent>
          </>
        }
        useTheme={true}
        style={{ 
          background: 'linear-gradient(135deg, #B69DF8 0%, #D0BCFF 50%, #E1C4FD 100%)',
          backdropFilter: 'none',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '20px',
          padding: '32px',
          marginBottom: '5px',
          position: 'relative',
          overflow: 'hidden',
        }}
        styleVariant="default"
        titleStyle={{}}
        descriptionStyle={{}}
        customStyle={true}
        className=""
      />
    </HeaderWrapper>
  );
};

export default ArtistHeader;
