import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Paper,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Pending as PendingIcon,
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
  Image as ImageIcon,
  Schedule as ScheduleIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';

const StyledCard = styled(Card)(({ theme }) => ({
  background: 'var(--theme-background, rgba(255, 255, 255, 0.03))',
  backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
  border: '1px solid rgba(66, 66, 66, 0.5)',
  borderRadius: 16,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  overflow: 'visible',
}));

const StatusChip = styled(Chip)<{ status: string }>(({ status, theme }) => {
  const colors = {
    pending: { bg: '#f39c12', color: '#fff' },
    active: { bg: '#27ae60', color: '#fff' },
    rejected: { bg: '#e74c3c', color: '#fff' },
  };

  const color = colors[status as keyof typeof colors] || colors.pending;

  return {
    background: color.bg,
    color: color.color,
    fontWeight: 600,
    fontSize: '0.8rem',
    '& .MuiChip-label': {
      padding: '4px 8px',
    },
  };
});

const ItemPreview = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  flexWrap: 'wrap',
  marginTop: theme.spacing(1),
}));

const ItemImage = styled(Box)(({ theme }) => ({
  width: 40,
  height: 40,
  borderRadius: 6,
  overflow: 'hidden',
  background: 'var(--theme-background, rgba(255, 255, 255, 0.05))',
  border: '1px solid rgba(66, 66, 66, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
}));

interface ProposalPack {
  id: number;
  display_name: string;
  description: string;
  price: number;
  status: 'pending' | 'active' | 'rejected';
  proposed_at: string;
  reviewed_at?: string;
  rejection_reason?: string;
  items_count: number;
  contents?: Array<{
    item_name: string;
    item_type: string;
    rarity: string;
  }>;
}

const MyProposals: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [proposals, setProposals] = useState<ProposalPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/inventory/my-proposed-packs');
      const data = await response.json();

      if (data.success) {
        setProposals(data.packs);
      } else {
        setError(data.message || 'Ошибка при загрузке заявок');
      }
    } catch (err) {
      setError('Ошибка сети');
    } finally {
      setLoading(false);
    }
  };



  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <PendingIcon sx={{ fontSize: 16 }} />;
      case 'active':
        return <ApprovedIcon sx={{ fontSize: 16 }} />;
      case 'rejected':
        return <RejectedIcon sx={{ fontSize: 16 }} />;
      default:
        return <ScheduleIcon sx={{ fontSize: 16 }} />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'На рассмотрении';
      case 'active':
        return 'Одобрен';
      case 'rejected':
        return 'Отклонен';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  if (proposals.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', p: 4 }}>
        <ImageIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
          У вас пока нет заявок
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Предложите свой первый пак!
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ }}>


      <Grid container spacing={isMobile ? 1 : 2}>
        {proposals.map((proposal) => (
          <Grid item xs={12} key={proposal.id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <StyledCard>
                <CardContent sx={{  }}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'flex-start', 
                    mb: 1,
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: isMobile ? 1 : 0
                  }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, fontSize: isMobile ? '1.1rem' : '1.25rem' }}>
                        {proposal.display_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: isMobile ? '0.9rem' : '1rem' }}>
                        {proposal.description}
                      </Typography>
                    </Box>
                    <StatusChip
                      status={proposal.status}
                      icon={getStatusIcon(proposal.status)}
                      label={getStatusLabel(proposal.status)}
                      sx={{ alignSelf: isMobile ? 'flex-start' : 'auto' }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', gap: isMobile ? 1 : 2, mb: 2, flexWrap: 'wrap' }}>
                    <Chip
                      label={`${proposal.price} баллов`}
                      size="small"
                      sx={{
                        background: 'var(--theme-background, rgba(255, 255, 255, 0.05))',
                        color: 'text.primary',
                        fontSize: isMobile ? '0.75rem' : '0.8rem',
                      }}
                    />
                    <Chip
                      label={`${proposal.items_count} предметов`}
                      size="small"
                      sx={{
                        background: 'var(--theme-background, rgba(255, 255, 255, 0.05))',
                        color: 'text.primary',
                        fontSize: isMobile ? '0.75rem' : '0.8rem',
                      }}
                    />
                  </Box>

                  {proposal.contents && proposal.contents.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Предметы:
                      </Typography>
                      <ItemPreview>
                        {proposal.contents.slice(0, 6).map((item, index) => (
                          <ItemImage key={index}>
                            <img
                              src={`/inventory/pack/${proposal.id}/${item.item_name}`}
                              alt={item.item_name}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          </ItemImage>
                        ))}
                        {proposal.contents.length > 6 && (
                          <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center' }}>
                            +{proposal.contents.length - 6}
                          </Typography>
                        )}
                      </ItemPreview>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Предложен: {formatDate(proposal.proposed_at)}
                      </Typography>
                      {proposal.reviewed_at && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          Рассмотрен: {formatDate(proposal.reviewed_at)}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  {proposal.status === 'rejected' && proposal.rejection_reason && (
                    <Paper sx={{ mt: 2, p: 2, background: 'rgba(255, 0, 0, 0.1)', border: '1px solid rgba(255, 0, 0, 0.2)' }}>
                      <Typography variant="body2" color="error" sx={{ fontWeight: 500, mb: 1 }}>
                        Причина отклонения:
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {proposal.rejection_reason}
                      </Typography>
                    </Paper>
                  )}
                </CardContent>
              </StyledCard>
            </motion.div>
          </Grid>
        ))}
      </Grid>


    </Box>
  );
};

export default MyProposals; 