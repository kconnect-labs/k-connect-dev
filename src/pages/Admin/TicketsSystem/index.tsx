import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Paper, Tabs, Tab } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';

// Импорты из UIKIT
import UniversalModal from '../../../UIKIT/UniversalModal';

// Импорты компонентов
import TicketList from './components/TicketList';
import TicketDetails from './components/TicketDetails';
import TicketStats from './components/TicketStats';
import TicketSearch from './components/TicketSearch';
import ComplaintHistory from './components/ComplaintHistory';
import TicketModerationHistory from './components/TicketModerationHistory';
import TicketActionsModal from './components/TicketActionsModal';
import Post from '../../../components/Post/Post';

// Импорты хуков
import { useTickets } from './hooks/useTickets';
import { useTicketActions } from './hooks/useTicketActions';
import { useTicketComments } from './hooks/useTicketComments';

// Стилизованные компоненты с темизацией
const StyledContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(2),
  minHeight: '100vh',
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  background: 'rgba(207, 188, 251, 0.03)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(207, 188, 251, 0.12)',
  borderRadius: theme.spacing(2),
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));



const TicketsSystem: React.FC = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isComplaintHistoryOpen, setIsComplaintHistoryOpen] = useState(false);
  const [complaintHistoryUser, setComplaintHistoryUser] = useState<{id: number, name: string} | null>(null);
  const [isModerationHistoryOpen, setIsModerationHistoryOpen] = useState(false);
  const [moderationHistoryTicketId, setModerationHistoryTicketId] = useState<number | null>(null);
  const [isActionsModalOpen, setIsActionsModalOpen] = useState(false);
  const [actionsModalTicket, setActionsModalTicket] = useState<any>(null);

  // Хуки для работы с тикетами
  const {
    tickets,
    loading,
    error,
    pagination,
    filters,
    fetchTickets,
    updateFilters,
    refreshTickets,
  } = useTickets();

  const {
    updateTicket,
    assignTicket,
    resolveTicket,
    closeTicket,
    loading: actionLoading,
  } = useTicketActions();

  const {
    comments,
    addComment,
    updateComment,
    deleteComment,
    fetchComments,
    loading: commentsLoading,
  } = useTicketComments();

  // Обработчики событий
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleTicketSelect = (ticket: any) => {
    setSelectedTicket(ticket);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedTicket(null);
  };

  const handleShowPost = async (postId: number) => {
    try {
      console.log('Загружаем пост с ID:', postId);
      
      // Загружаем данные поста с правильными заголовками
      const response = await fetch(`/api/posts/${postId}`, {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'liquide-gg-v2'
        },
        credentials: 'include'
      });
      
      
      if (response.ok) {
        const postData = await response.json();
        
        // Проверяем структуру данных
        if (postData.success && postData.post) {
          setSelectedPost(postData.post);
        } else if (postData.id) {
          setSelectedPost(postData);
        } else {
          setSelectedPost(postData);
        }
        
        setIsPostModalOpen(true);
      } else {
        const errorText = await response.text();
      }
    } catch (error) {
    }
  };

  const handleClosePostModal = () => {
    setIsPostModalOpen(false);
    setSelectedPost(null);
  };

  const handleOpenComplaintHistory = (userId: number, userName: string) => {
    setComplaintHistoryUser({ id: userId, name: userName });
    setIsComplaintHistoryOpen(true);
  };

  const handleCloseComplaintHistory = () => {
    setIsComplaintHistoryOpen(false);
    setComplaintHistoryUser(null);
  };

  const handleOpenTicketFromHistory = (ticketId: number) => {
    // Закрываем модалку истории жалоб
    handleCloseComplaintHistory();
    
    // Находим тикет по ID и открываем его
    const ticket = tickets.find(t => t.id === ticketId);
    if (ticket) {
      setSelectedTicket(ticket);
      setIsDetailsModalOpen(true);
    }
  };

  const handleOpenModerationHistory = (ticketId: number) => {
    setModerationHistoryTicketId(ticketId);
    setIsModerationHistoryOpen(true);
  };

  const handleCloseModerationHistory = () => {
    setIsModerationHistoryOpen(false);
    setModerationHistoryTicketId(null);
  };

  const handleOpenActionsModal = (ticket: any) => {
    setActionsModalTicket(ticket);
    setIsActionsModalOpen(true);
  };

  const handleCloseActionsModal = () => {
    setIsActionsModalOpen(false);
    setActionsModalTicket(null);
  };

  const handleIssueWarning = async (userId: number, reason: string, duration: string, ticketId?: number, targetType?: string, targetId?: number) => {
    try {
      const body: any = {
        reason: reason,
        duration: duration,
      };
      
      if (ticketId) {
        body.ticket_id = ticketId;
      }
      
      if (targetType && targetId) {
        body.target_type = targetType;
        body.target_id = targetId;
      } else if (userId) {
        body.user_id = userId;
      }
      
      const response = await fetch('/api/moderator/warnings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',

        },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Обновляем тикеты после действия
          refreshTickets();
        }
      }
    } catch (error) {
      console.error('Ошибка при выдаче предупреждения:', error);
    }
  };

  const handleBanUser = async (userId: number, reason: string, duration: string, ticketId?: number, targetType?: string, targetId?: number) => {
    try {
      const body: any = {
        reason: reason,
        duration: duration,
      };
      
      if (ticketId) {
        body.ticket_id = ticketId;
      }
      
      if (targetType && targetId) {
        body.target_type = targetType;
        body.target_id = targetId;
      } else if (userId) {
        body.user_id = userId;
      }
      
      const response = await fetch('/api/moderator/bans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',

        },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Обновляем тикеты после действия
          refreshTickets();
        }
      }
    } catch (error) {
      console.error('Ошибка при бане пользователя:', error);
    }
  };

  const handleDeletePost = async (postId: number, ticketId?: number) => {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (ticketId) {
        headers['X-Ticket-ID'] = ticketId.toString();
      }
      
      const response = await fetch(`/api/moderator/posts/${postId}`, {
        method: 'DELETE',
        headers,
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Обновляем тикеты после действия
          refreshTickets();
        }
      }
    } catch (error) {
      console.error('Ошибка при удалении поста:', error);
    }
  };

  const handleUpdatePriority = async (ticketId: number, priority: string) => {
    try {
      const response = await fetch(`/api/moderator/tickets/${ticketId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          priority: priority,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Обновляем тикеты после действия
          refreshTickets();
        }
      }
    } catch (error) {
      console.error('Ошибка при изменении приоритета:', error);
    }
  };

  const handleReopenTicket = async (ticketId: number) => {
    try {
      const response = await fetch(`/api/moderator/tickets/${ticketId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',

        },
        credentials: 'include',
        body: JSON.stringify({
          status: 'new',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Обновляем тикеты после действия
          refreshTickets();
        }
      }
    } catch (error) {
      console.error('Ошибка при повторном открытии тикета:', error);
    }
  };

  const handleTicketAction = async (ticketId: number, action: string, data?: any) => {
    try {
      switch (action) {
        case 'assign':
          await assignTicket(ticketId);
          break;
        case 'resolve':
          await resolveTicket(ticketId);
          break;
        case 'close':
          await closeTicket(ticketId);
          break;
        case 'update':
          await updateTicket(ticketId, data);
          break;
      }
      refreshTickets();
      if (selectedTicket?.id === ticketId) {
        // Обновляем выбранный тикет
        const updatedTicket = tickets.find(t => t.id === ticketId);
        if (updatedTicket) {
          setSelectedTicket(updatedTicket);
        }
      }
    } catch (error) {
      console.error('Ошибка при выполнении действия:', error);
    }
  };

  const handleCommentAction = async (ticketId: number, commentId: number, action: string, data?: any) => {
    try {
      switch (action) {
        case 'add':
          await addComment(ticketId, data);
          break;
        case 'update':
          await updateComment(ticketId, commentId, data);
          break;
        case 'delete':
          await deleteComment(ticketId, commentId);
          break;
      }
      // Обновляем комментарии после действия
      if (selectedTicket) {
        await fetchComments(selectedTicket.id);
      }
    } catch (error) {
      console.error('Ошибка при работе с комментариями:', error);
    }
  };

  // Загрузка данных при монтировании
  useEffect(() => {
    fetchTickets();
  }, [filters]);

  // Загрузка комментариев при выборе тикета
  useEffect(() => {
    if (selectedTicket) {
      fetchComments(selectedTicket.id);
    }
  }, [selectedTicket, fetchComments]);

  const tabs = [
    { label: 'Все тикеты', value: 0 },
    { label: 'Новые', value: 1 },
    { label: 'В работе', value: 2 },
    { label: 'Завершенные', value: 3 },
    { label: 'Статистика', value: 4 },
  ];

  const filteredTickets = React.useMemo(() => {
    if (activeTab === 0) return tickets;
    if (activeTab === 1) return tickets.filter(t => t.status === 'new');
    if (activeTab === 2) return tickets.filter(t => t.status === 'in_progress');
    if (activeTab === 3) return tickets.filter(t => t.status === 'resolved' || t.status === 'closed');
    return tickets;
  }, [tickets, activeTab]);

  if (error) {
    return (
      <StyledContainer>
        <StyledPaper>
          <Typography variant="h6" color="error" align="center">
            Ошибка загрузки тикетов: {error}
          </Typography>
        </StyledPaper>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer maxWidth="xl" sx={{ paddingLeft: '0px!important', paddingRight: '0px !important' }}>


      <StyledPaper>
        <TicketSearch
          filters={filters}
          onFiltersChange={updateFilters}
          onSearch={fetchTickets}
        />
      </StyledPaper>

      <StyledPaper>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: 'rgba(255, 255, 255, 0.12)',
            mb: 2,
            '& .MuiTab-root': {
              borderRadius: '12px 12px 0 0',
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderBottom: 'none',
              marginRight: 1,
              color: 'rgba(255, 255, 255, 0.7)',
              '&:hover': {
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'rgba(255, 255, 255, 0.87)',
              },
              '&.Mui-selected': {
                background: 'rgba(255, 255, 255, 0.08)',
                color: 'rgba(255, 255, 255, 0.87)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              },
            },
          }}
        >
          {tabs.map((tab) => (
            <Tab key={tab.value} label={tab.label} />
          ))}
        </Tabs>

        <Box mt={3}>
          {activeTab === 4 ? (
            <TicketStats tickets={tickets} />
          ) : (
            <TicketList
              tickets={filteredTickets}
              loading={loading}
              pagination={pagination}
              onTicketSelect={handleTicketSelect}
              onTicketAction={handleTicketAction}
              actionLoading={actionLoading}
            />
          )}
        </Box>
      </StyledPaper>

      {/* Модальное окно с деталями тикета */}
      <UniversalModal
        open={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        title={`Тикет #${selectedTicket?.id}`}
        maxWidth="md"
        fullWidth
        maxWidthCustom={'850px'}
      >
        {selectedTicket && (
                        <TicketDetails
                ticket={selectedTicket}
                comments={comments}
                commentsLoading={commentsLoading}
                onTicketAction={handleTicketAction}
                onCommentAction={handleCommentAction}
                actionLoading={actionLoading}
                onShowPost={handleShowPost}
                onOpenComplaintHistory={handleOpenComplaintHistory}
                onOpenModerationHistory={handleOpenModerationHistory}
                onOpenActionsModal={handleOpenActionsModal}
                onUpdatePriority={handleUpdatePriority}
                onReopenTicket={handleReopenTicket}
              />
        )}

        {/* Модалка для отображения поста */}
        {isPostModalOpen && (
          <UniversalModal
            open={isPostModalOpen}
            onClose={handleClosePostModal}
            title="Просмотр поста"
            maxWidthCustom={'800px'}
          >
            <Box sx={{ p: 2 }}>
              {selectedPost ? (
                <Post
                    post={selectedPost}
                    onDelete={() => {
                      handleClosePostModal();
                      refreshTickets();
                    }}
                    onOpenLightbox={() => {}}
                    isPinned={false}
                    statusColor={null}
                  />
              ) : (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <Typography>Загрузка поста...</Typography>
                </Box>
              )}
            </Box>
          </UniversalModal>
        )}
      </UniversalModal>

      {/* Модалка истории жалоб */}
      {isComplaintHistoryOpen && complaintHistoryUser && (
        <UniversalModal
          open={isComplaintHistoryOpen}
          onClose={handleCloseComplaintHistory}
          title="История жалоб"
          maxWidth="md"
          fullWidth
          maxWidthCustom={'800px'}
        >
          <ComplaintHistory
            userId={complaintHistoryUser!.id}
            userName={complaintHistoryUser!.name}
            onClose={handleCloseComplaintHistory}
            onOpenTicket={handleOpenTicketFromHistory}
          />
        </UniversalModal>
      )}

      {/* Модалка истории модерации */}
      {isModerationHistoryOpen && moderationHistoryTicketId && (
        <UniversalModal
          open={isModerationHistoryOpen}
          onClose={handleCloseModerationHistory}
          title="История модерации"
          maxWidth="md"
          fullWidth
          maxWidthCustom={'800px'}
        >
          <TicketModerationHistory
            ticketId={moderationHistoryTicketId}
            onClose={handleCloseModerationHistory}
          />
        </UniversalModal>
      )}

      {/* Модалка действий */}
      {isActionsModalOpen && actionsModalTicket && (
        <TicketActionsModal
          open={isActionsModalOpen}
          onClose={handleCloseActionsModal}
          ticket={actionsModalTicket}
                  onIssueWarning={(userId, reason, duration, ticketId, targetType, targetId) => handleIssueWarning(userId, reason, duration, ticketId, targetType, targetId)}
        onBanUser={(userId, reason, duration, ticketId, targetType, targetId) => handleBanUser(userId, reason, duration, ticketId, targetType, targetId)}
        onDeletePost={(postId, ticketId) => handleDeletePost(postId, ticketId)}
        />
      )}
    </StyledContainer>
  );
};

export default TicketsSystem; 