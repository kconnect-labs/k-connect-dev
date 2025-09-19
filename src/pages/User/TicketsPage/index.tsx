import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import TicketList from './components/TicketList';
import TicketDetails from './components/TicketDetails';
import CreateTicketModal from './components/CreateTicketModal';
import { useTickets } from './hooks/useTickets';
import { useTicketActions } from './hooks/useTicketActions';
import StyledTabs from '../../../UIKIT/StyledTabs';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tickets-tabpanel-${index}`}
      aria-labelledby={`tickets-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const TicketsPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });

  // Хуки для работы с тикетами
  const { tickets, loading, error, pagination, fetchTickets, refreshTickets } = useTickets();
  const { loading: actionLoading, addComment } = useTicketActions();

  // Фильтры для разных вкладок
  const getFilteredTickets = useCallback(() => {
    if (tabValue === 0) {
      // Активные тикеты (new, in_progress, resolved)
      return tickets.filter(ticket => !ticket.is_closed);
    } else {
      // Закрытые тикеты
      return tickets.filter(ticket => ticket.is_closed);
    }
  }, [tickets, tabValue]);

  // Загружаем тикеты при изменении вкладки
  useEffect(() => {
    const status = tabValue === 0 ? undefined : 'closed';
    fetchTickets({ status });
  }, [tabValue, fetchTickets]);

  const handleTabChange = (event: React.SyntheticEvent | null, newValue: string | number) => {
    setTabValue(newValue as number);
  };

  const handleTicketSelect = async (ticket: any) => {
    try {
      // Загружаем детали тикета с комментариями
      const response = await fetch(`/api/user/tickets/${ticket.id}`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSelectedTicket(result.ticket);
          setIsDetailsOpen(true);
        } else {
          console.error('Ошибка при загрузке тикета:', result.error);
        }
      } else {
        console.error('Ошибка при загрузке тикета');
      }
    } catch (error) {
      console.error('Ошибка при загрузке тикета:', error);
    }
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setSelectedTicket(null);
  };

  const handleCreateTicket = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleTicketCreated = (ticket: any) => {
    setSnackbar({
      open: true,
      message: 'Тикет создан успешно!',
      severity: 'success',
    });
    refreshTickets();
    setIsCreateModalOpen(false);
  };

  const handleCommentAdded = async (ticketId: number, content: string) => {
    try {
      await addComment(ticketId, content);
      setSnackbar({
        open: true,
        message: 'Комментарий добавлен',
        severity: 'success',
      });
      
      // Обновляем только тикет в модалке, не весь список
      if (selectedTicket && selectedTicket.id === ticketId) {
        const response = await fetch(`/api/user/tickets/${ticketId}`, {
          credentials: 'include',
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setSelectedTicket(result.ticket);
          }
        }
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Ошибка при добавлении комментария',
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const filteredTickets = getFilteredTickets();

  // Подготавливаем табы для StyledTabs
  const tabs = [
    { value: 0, label: `Активные` },
    { value: 1, label: `Закрытые` }
  ];

  return (
    <Box sx={{ pt: 2, maxWidth: 1200, mx: 'auto', pb: 5 }}>
      {/* Заголовок */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ color: 'rgba(255, 255, 255, 0.87)', fontWeight: 600 }}>
          Мои тикеты
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateTicket}
          sx={{
            background: 'linear-gradient(45deg, #cfbcfb 30%, #827095 90%)',
            color: 'white',
            '&:hover': {
              background: 'linear-gradient(45deg, #b8a8e8 30%, #6b5b7a 90%)',
            },
          }}
        >
          Создать тикет
        </Button>
      </Box>

      {/* Вкладки */}
      <Box >
        <StyledTabs
          value={tabValue}
          onChange={handleTabChange}
          tabs={tabs}
          customStyle={true}
        />
      </Box>

      {/* Содержимое вкладок */}
      <TabPanel value={tabValue} index={0}>
        {loading ? (
          <Box>
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress sx={{ color: '#d0bcff' }} />
            </Box>
            <TicketList
              tickets={[]}
              onTicketSelect={() => {}}
              loading={true}
            />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : filteredTickets.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 2 }}>
              У вас нет активных тикетов
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.4)' }}>
              Создайте новый тикет, если у вас есть вопросы или проблемы
            </Typography>
          </Box>
        ) : (
          <TicketList
            tickets={filteredTickets}
            onTicketSelect={handleTicketSelect}
            loading={loading}
          />
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {loading ? (
          <Box>
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress sx={{ color: '#d0bcff' }} />
            </Box>
            <TicketList
              tickets={[]}
              onTicketSelect={() => {}}
              loading={true}
            />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : filteredTickets.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 2 }}>
              У вас нет закрытых тикетов
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.4)' }}>
              Закрытые тикеты появятся здесь после их решения
            </Typography>
          </Box>
        ) : (
          <TicketList
            tickets={filteredTickets}
            onTicketSelect={handleTicketSelect}
            loading={loading}
          />
        )}
      </TabPanel>

      {/* Модалка с деталями тикета */}
      {selectedTicket && (
        <TicketDetails
          ticket={selectedTicket}
          open={isDetailsOpen}
          onClose={handleCloseDetails}
          onAddComment={handleCommentAdded}
          loading={actionLoading}
        />
      )}

      {/* Модалка создания тикета */}
      <CreateTicketModal
        open={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onTicketCreated={handleTicketCreated}
      />

      {/* Уведомления */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TicketsPage; 