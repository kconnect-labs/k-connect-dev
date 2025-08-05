import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Avatar,
  InputAdornment,
  Snackbar,
  Tabs,
  Tab,
  Badge,
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Diamond as DiamondIcon,
  Star as StarIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UnequippedIcon,
  Send as SendIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  Upgrade as UpgradeIcon,
  ShoppingCart as ShoppingCartIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  CompareArrows as CompareArrowsIcon,
} from '@mui/icons-material';
import { useAuth } from '../../../../context/AuthContext';

// Тип для пользователя из AuthContext
interface AuthUser {
  id: number;
  username: string;
  name: string;
  photo?: string;
  account_type?: string;
  [key: string]: any;
}
import axios from 'axios';
import InfoBlock from '../../../../UIKIT/InfoBlock';
import StyledTabs from '../../../../UIKIT/StyledTabs';
import ItemInfoModal from './ItemInfoModal';
import {
  GlowEffect,
  AnimatedSparkle,
  AnimatedStar,
  EFFECTS_CONFIG,
  extractDominantColor,
  getFallbackColor,
  useUpgradeEffects,
} from './upgradeEffectsConfig';
import inventoryImageService from '../../../../services/InventoryImageService';
import InventoryItemCard from '../../../../UIKIT/InventoryItemCard';
import { InventoryItem, EquippedItem, ItemAction } from './types';
import { InventorySearch } from './InventorySearch';
import { useInventorySearch } from './useInventorySearch';

interface InventoryTabProps {
  userId?: number;
  itemIdToOpen?: string;
  equippedItems?: EquippedItem[];
  onEquippedItemsUpdate?: () => void;
  currentUserId?: number;
}

const StyledContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(2),
  },
}));

const StyledCard = styled(Card)(({ theme }) => ({
  background: 'var(--theme-background, rgba(255, 255, 255, 0.03))',
  backdropFilter: 'var(--theme-backdrop-filter, blur(20px))',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: 16,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
}));








const InventoryTab = forwardRef<HTMLDivElement, InventoryTabProps>(
  ({ userId, itemIdToOpen, equippedItems = [] }, ref) => {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [profileEquippedItems, setProfileEquippedItems] = useState<
      EquippedItem[]
    >([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(
      null
    );
    const [showItemInfo, setShowItemInfo] = useState(false);
    const [externalItem, setExternalItem] = useState<InventoryItem | null>(
      null
    );
    const [externalLoading, setExternalLoading] = useState(false);
    const [externalError, setExternalError] = useState('');
    const [transferDialogOpen, setTransferDialogOpen] = useState(false);
    const [recipientUsername, setRecipientUsername] = useState('');
    const [transferring, setTransferring] = useState(false);
    const [upgrading, setUpgrading] = useState(false);
    const [userPoints, setUserPoints] = useState(0);
    const [activeTab, setActiveTab] = useState(0);
    const [showEquipped, setShowEquipped] = useState(true);
    const [upgradedItems, setUpgradedItems] = useState<InventoryItem[]>([]);
    const [loadingUpgraded, setLoadingUpgraded] = useState(false);
    const { user } = useAuth() as { user: AuthUser | null };
    const [notification, setNotification] = useState<{
      open: boolean;
      message: string;
      severity: 'success' | 'error' | 'warning' | 'info';
    }>({
      open: false,
      message: '',
      severity: 'success',
    });

    // Пагинация
    const [pagination, setPagination] = useState({
      page: 1,
      per_page: 15,
      total: 0,
      pages: 0,
      has_next: false,
      has_prev: false,
    });
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    // Хук для поиска и фильтрации
    const {
      query,
      filters,
      filteredItems: searchFilteredItems,
      isLoading: searchLoading,
      error: searchError,
      updateQuery,
      updateFilters,
      resetSearch,
    } = useInventorySearch(activeTab === 0 ? items : activeTab === 1 ? upgradedItems : items);

    useEffect(() => {
      if (user) {
        fetchInventory();
        fetchUserPoints();
        fetchProfileEquippedItems();
        fetchUpgradedItems();
      }
    }, [user]);

    // Сброс поиска при смене вкладки
    useEffect(() => {
      resetSearch();
    }, [activeTab, resetSearch]);

    // Обработчик глобального события получения предмета
    useEffect(() => {
      const handleGlobalItemObtained = (event: Event) => {
        const customEvent = event as CustomEvent<InventoryItem>;
        const newItem = customEvent.detail;
        if (newItem) {
          // Добавляем предмет в начало списка
          setItems(prevItems => [newItem, ...prevItems]);

          // Если предмет улучшенный, добавляем в улучшенные
          if (newItem.upgrade_level > 0) {
            setUpgradedItems(prevItems => [newItem, ...prevItems]);
          }
        }
      };

      window.addEventListener('item_obtained', handleGlobalItemObtained);

      return () => {
        window.removeEventListener('item_obtained', handleGlobalItemObtained);
      };
    }, []);

    const fetchProfileEquippedItems = async () => {
      try {
        if (!user || !user.username) return;
        const response = await axios.get(`/api/profile/${user.username}`);
        if (
          response.data.success &&
          response.data.user &&
          response.data.equipped_items
        ) {
          setProfileEquippedItems(response.data.equipped_items);
        }
      } catch (error) {
        console.error('Error fetching profile equipped items:', error);
      }
    };

    const fetchUpgradedItems = async () => {
      try {
        if (!user || !user.id) return;
        setLoadingUpgraded(true);
        const response = await axios.get(
          `/api/inventory/user/${user.id}/upgraded`
        );
        if (response.data.success) {
          setUpgradedItems(response.data.items);
        }
      } catch (error) {
        console.error('Error fetching upgraded items:', error);
      } finally {
        setLoadingUpgraded(false);
      }
    };

    useEffect(() => {
      if (itemIdToOpen) {
        // Сначала ищем в инвентаре
        const found = items.find(i => String(i.id) === String(itemIdToOpen));
        if (found) {
          setSelectedItem(found);
          setShowItemInfo(true);
          setExternalItem(null);
          setExternalError('');
        } else {
          // Если нет — грузим отдельно
          setExternalLoading(true);
          setExternalError('');
          setShowItemInfo(true);
          setSelectedItem(null);
          fetch(`/api/inventory/item/${itemIdToOpen}`)
            .then(r => r.json())
            .then(data => {
              if (data.success && data.item) {
                setExternalItem(data.item);
              } else {
                setExternalError('Не удалось получить предмет');
              }
            })
            .catch(() => setExternalError('Ошибка при получении предмета'))
            .finally(() => setExternalLoading(false));
        }
      }
    }, [itemIdToOpen, items]);

    const fetchInventory = async (page = 1, append = false) => {
      try {
        if (page === 1) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }

        const response = await axios.get(
          `/api/inventory/my-inventory?page=${page}&per_page=15`
        );
        if (response.data.success) {
          const newItems = response.data.items;

          if (append) {
            // Дедупликация по ID для предотвращения дублирования
            setItems(prevItems => {
              const existingIds = new Set(prevItems.map(item => item.id));
              const uniqueNewItems = newItems.filter(
                (item: InventoryItem) => !existingIds.has(item.id)
              );
              return [...prevItems, ...uniqueNewItems];
            });
          } else {
            setItems(newItems);
          }

          // Обновляем пагинацию
          setPagination(response.data.pagination);
          setHasMore(response.data.pagination.has_next);

          // Предзагружаем изображения для новых предметов
          if (newItems && newItems.length > 0) {
            await inventoryImageService.preloadInventoryImages(newItems);
          }
        }
      } catch (error) {
        console.error('Error fetching inventory:', error);
        if (!append) {
          setError('Ошибка при загрузке инвентаря');
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };

    const loadMoreItems = () => {
      if (!loadingMore && hasMore && pagination.page > 0) {
        // Дополнительная проверка - убеждаемся, что мы не загружаем ту же страницу
        const nextPage = pagination.page + 1;
        console.log(`Loading page ${nextPage}, current items: ${items.length}`);
        fetchInventory(nextPage, true);
      }
    };

    // Обработчик прокрутки для бесконечной загрузки
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

      // Загружаем следующую страницу когда пользователь доскроллил до 80%
      if (scrollPercentage >= 0.8 && !loadingMore && hasMore && !loading) {
        loadMoreItems();
      }
    };

    const fetchUserPoints = async () => {
      try {
        const response = await axios.get('/api/user/points');
        setUserPoints(response.data.points);
      } catch (error) {
        console.error('Error fetching user points:', error);
      }
    };

    const handleEquipItem = async (itemId: number) => {
      try {
        const response = await fetch(`/api/inventory/equip/${itemId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (data.success) {
          showNotification(data.message);

          // Мгновенно обновляем состояние предмета
          setItems(prevItems =>
            prevItems.map(item =>
              item.id === itemId ? { ...item, is_equipped: true } : item
            )
          );

          // Обновляем надетые предметы
          setProfileEquippedItems(prev => {
            const item = items.find(i => i.id === itemId);
            if (item && !prev.find(e => e.item_id === itemId)) {
              return [
                ...prev,
                {
                  item_id: itemId,
                  item_name: item.item_name,
                  rarity: item.rarity,
                  upgrade_level: item.upgrade_level,
                  image_url: item.image_url,
                  background_url: item.image_url,
                },
              ];
            }
            return prev;
          });
        } else {
          showNotification(data.message, 'error');
        }
      } catch (error) {
        showNotification('Ошибка при надевании предмета', 'error');
      }
    };

    const handleUnequipItem = async (itemId: number) => {
      try {
        const response = await fetch(`/api/inventory/unequip/${itemId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (data.success) {
          showNotification(data.message);

          // Мгновенно обновляем состояние предмета
          setItems(prevItems =>
            prevItems.map(item =>
              item.id === itemId ? { ...item, is_equipped: false } : item
            )
          );

          // Удаляем из надетых предметов
          setProfileEquippedItems(prev =>
            prev.filter(e => e.item_id !== itemId)
          );
        } else {
          showNotification(data.message, 'error');
        }
      } catch (error) {
        showNotification('Ошибка при снятии предмета', 'error');
      }
    };

    const handleItemClick = (item: InventoryItem) => {
      setSelectedItem(item);
      setShowItemInfo(true);
    };

    const handleCloseItemInfoModal = () => {
      setShowItemInfo(false);
      setSelectedItem(null);
    };

    // Функция для удаления дубликатов по ID
    const removeDuplicates = (items: InventoryItem[]) => {
      const seen = new Set();
      return items.filter((item: InventoryItem) => {
        if (seen.has(item.id)) {
          return false;
        }
        seen.add(item.id);
        return true;
      });
    };

    const handleItemUpdate = (
      updatedItem: InventoryItem | null = null,
      action: ItemAction | null = null
    ) => {
      if (updatedItem && action) {
        // Мгновенное обновление конкретного предмета
        switch (action) {
          case 'equip':
            setItems(prevItems =>
              prevItems.map(item =>
                item.id === updatedItem.id
                  ? { ...item, is_equipped: true }
                  : item
              )
            );
            break;
          case 'unequip':
            setItems(prevItems =>
              prevItems.map(item =>
                item.id === updatedItem.id
                  ? { ...item, is_equipped: false }
                  : item
              )
            );
            break;
          case 'upgrade':
            setItems(prevItems =>
              prevItems.map(item =>
                item.id === updatedItem.id
                  ? { ...item, upgrade_level: updatedItem.upgrade_level }
                  : item
              )
            );
            // Обновляем в улучшенных предметах
            setUpgradedItems(prevItems => {
              const existingItem = prevItems.find(i => i.id === updatedItem.id);
              if (existingItem) {
                return prevItems.map(i =>
                  i.id === updatedItem.id
                    ? { ...i, upgrade_level: updatedItem.upgrade_level }
                    : i
                );
              } else {
                return [...prevItems, updatedItem];
              }
            });
            break;
          case 'marketplace_list':
          case 'marketplace_remove':
            setItems(prevItems =>
              prevItems.map(item =>
                item.id === updatedItem.id
                  ? { ...item, marketplace: updatedItem.marketplace }
                  : item
              )
            );
            break;
          default:
            break;
        }
      } else {
        // Полная перезагрузка (для обратной совместимости)
        setItems(prevItems => removeDuplicates(prevItems));
        fetchInventory(1, false);
        fetchUserPoints();
        fetchProfileEquippedItems();
        fetchUpgradedItems();
      }
    };

    const handleTransferSuccess = (itemId: number | null) => {
      if (itemId) {
        // Мгновенно удаляем конкретный предмет
        setItems(prevItems => prevItems.filter(i => i.id !== itemId));
        setUpgradedItems(prevItems => prevItems.filter(i => i.id !== itemId));
      } else {
        // Полная перезагрузка (для обратной совместимости)
        fetchInventory(1, false);
        fetchUserPoints();
      }
    };

    const getRarityIcon = (rarity: string) => {
      switch (rarity) {
        case 'legendary':
          return <DiamondIcon sx={{ fontSize: 16 }} />;
        case 'epic':
          return <StarIcon sx={{ fontSize: 16 }} />;
        default:
          return null;
      }
    };

    const getRarityColor = (rarity: string) => {
      switch (rarity) {
        case 'legendary':
          return '#f39c12';
        case 'epic':
          return '#9b59b6';
        case 'rare':
          return '#3498db';
        default:
          return '#95a5a6';
      }
    };

    const getRarityLabel = (rarity: string) => {
      switch (rarity) {
        case 'legendary':
          return 'Легендарный';
        case 'epic':
          return 'Эпический';
        case 'rare':
          return 'Редкий';
        case 'common':
          return 'Обычный';
        default:
          return rarity;
      }
    };

    // Создаем список надетых предметов из профиля
    const equippedItemsFromProfile = (
      equippedItems.length > 0 ? equippedItems : profileEquippedItems
    ).map(equipped => ({
      ...equipped,
      is_equipped: true,
      // Добавляем недостающие поля для совместимости
      id: equipped.item_id,
      item_name: equipped.item_name || 'Предмет',
      rarity: equipped.rarity || 'common',
      upgrade_level: equipped.upgrade_level || 0,
      upgradeable: equipped.upgradeable || false,
      image_url: equipped.background_url || equipped.image_url,
    }));

    // Определяем базовый список предметов в зависимости от активной вкладки
    const baseItems = activeTab === 0 ? items : activeTab === 1 ? upgradedItems : items;
    
    // Применяем поиск и фильтры к базовому списку
    const filteredItems = query || Object.keys(filters).length > 0 ? searchFilteredItems : baseItems;

    const isSearchActive = Boolean(query.trim()) || Object.keys(filters).length > 0;

    const tabs = [
      {
        value: 0,
        label: `Все (${items.length})`,
      },
      {
        value: 1,
        label: `Улучшенные (${upgradedItems.length})`,
      },
    ];

    const showNotification = (
      message: string,
      severity: 'success' | 'error' | 'warning' | 'info' = 'success'
    ) => {
      setNotification({
        open: true,
        message,
        severity,
      });
    };

    const handleCloseNotification = () => {
      setNotification(prev => ({ ...prev, open: false }));
    };

    const handleUpgradeItem = async (item: InventoryItem) => {
      if (!item.upgradeable || item.upgrade_level >= 1) {
        return;
      }

      try {
        setUpgrading(true);
        const response = await axios.post(`/api/inventory/upgrade/${item.id}`);

        if (response.data.success) {
          setUserPoints(response.data.remaining_points);

          // Мгновенно обновляем предмет в списке
          setItems(prevItems =>
            prevItems.map(i =>
              i.id === item.id
                ? { ...i, upgrade_level: response.data.upgrade_level }
                : i
            )
          );

          // Обновляем в улучшенных предметах
          setUpgradedItems(prevItems => {
            const existingItem = prevItems.find(i => i.id === item.id);
            if (existingItem) {
              return prevItems.map(i =>
                i.id === item.id
                  ? { ...i, upgrade_level: response.data.upgrade_level }
                  : i
              );
            } else {
              return [
                ...prevItems,
                { ...item, upgrade_level: response.data.upgrade_level },
              ];
            }
          });

          showNotification(`Предмет "${item.item_name}" успешно улучшен!`);
        } else {
          showNotification(
            response.data.message || 'Ошибка улучшения предмета',
            'error'
          );
        }
      } catch (error) {
        console.error('Error upgrading item:', error);
        showNotification('Ошибка при улучшении предмета', 'error');
      } finally {
        setUpgrading(false);
      }
    };

    const handleTransferItem = async () => {
      if (!selectedItem || !recipientUsername.trim()) {
        return;
      }

      try {
        setTransferring(true);
        const response = await axios.post(
          `/api/inventory/transfer/${selectedItem.id}`,
          {
            recipient_username: recipientUsername.trim(),
          }
        );

        if (response.data.success) {
          setUserPoints(response.data.remaining_points);

          // Мгновенно удаляем предмет из списка
          setItems(prevItems =>
            prevItems.filter(i => i.id !== selectedItem.id)
          );

          // Удаляем из улучшенных предметов если там есть
          setUpgradedItems(prevItems =>
            prevItems.filter(i => i.id !== selectedItem.id)
          );

          setTransferDialogOpen(false);
          setRecipientUsername('');
          setSelectedItem(null);
          showNotification(
            `Предмет "${selectedItem.item_name}" успешно передан!`
          );
        } else {
          showNotification(
            response.data.message || 'Ошибка передачи предмета',
            'error'
          );
        }
      } catch (error) {
        console.error('Error transferring item:', error);
        showNotification('Ошибка при передаче предмета', 'error');
      } finally {
        setTransferring(false);
      }
    };

    useImperativeHandle(
      ref,
      () =>
        ({
          openItemModalById: (id: string | number) => {
            const item = items.find(i => String(i.id) === String(id));
            if (item) {
              setSelectedItem(item);
              setShowItemInfo(true);
            }
          },
        }) as any
    );

    if (!user) {
      return (
        <StyledContainer>
          <Box
            display='flex'
            justifyContent='center'
            alignItems='center'
            minHeight='50vh'
          >
            <Typography variant='h5'>
              Необходимо авторизоваться для просмотра инвентаря
            </Typography>
          </Box>
        </StyledContainer>
      );
    }

    if (loading) {
      return (
        <StyledContainer>
          <Box
            display='flex'
            justifyContent='center'
            alignItems='center'
            minHeight='50vh'
          >
            <CircularProgress size={60} />
          </Box>
        </StyledContainer>
      );
    }

    if (error) {
      return (
        <StyledContainer>
          <StyledCard>
            <CardContent>
              <Typography color='error' textAlign='center'>
                {error}
              </Typography>
              <Button
                onClick={() => fetchInventory()}
                variant='contained'
                sx={{ mt: 2, display: 'block', mx: 'auto' }}
              >
                Попробовать снова
              </Button>
            </CardContent>
          </StyledCard>
        </StyledContainer>
      );
    }

    return (
      <StyledContainer
        onScroll={handleScroll}
        sx={{ height: '100vh', overflowY: 'auto', paddingTop: 2 }}
      >
        <InfoBlock
          title='Мой Инвентарь'
          description='Лимитированные вещи в коннекте - коллекционные предметы, которые можно получить из паков и сундуков'
          styleVariant='dark'
          style={{
            textAlign: 'center',
            marginBottom: '8px',
          }}
          children={null}
          titleStyle={{}}
          descriptionStyle={{}}
          customStyle={false}
          className=''
        />

        <Box sx={{ mb: 0.5 }}>
          <StyledTabs
            value={activeTab}
            onChange={(e: any, newValue: any) => setActiveTab(newValue)}
            tabs={tabs}
            variant='standard'
            centered
            fullWidth
            customStyle={false}
            className=''
            style={{}}
          />
        </Box>

        {/* Компонент поиска */}
        <Box>
          <InventorySearch
            onFiltersChange={updateFilters}
            onQueryChange={updateQuery}
            showFilters={true}
            placeholder="Найти предметы в инвентаре..."
            isLoading={searchLoading}
            error={searchError}
          />
        </Box>

        {filteredItems.length === 0 && !loadingUpgraded ? (
          <Box textAlign='center' py={8}>


          </Box>
        ) : (
          <>
            <Grid
              container
              spacing={0.5}
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                px: 0.3, // 2.5px с каждой стороны
                '& .MuiGrid-item': {
                  flex: '0 0 calc(25% - 5px)',
                  maxWidth: 'calc(25% - 5px)',
                  minWidth: 'calc(25% - 5px)',
                  margin: '2.5px !important', // 5px между карточками
                  '@media (max-width: 768px)': {
                    flex: '0 0 calc(50% - 5px)',
                    maxWidth: 'calc(50% - 5px)',
                    minWidth: 'calc(50% - 5px)',
                  },
                },
              }}
            >
              {filteredItems.map(item => (
                <Grid item key={item.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Box onClick={() => handleItemClick(item)}>
                      <UpgradeEffects item={item}>
                        <InventoryItemCard item={item} {...({} as any)} />
                      </UpgradeEffects>
                    </Box>
                  </motion.div>
                </Grid>
              ))}
            </Grid>

            {/* Индикатор загрузки для пагинации */}
            {!isSearchActive && loadingMore && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress size={40} />
              </Box>
            )}

            {/* Индикатор загрузки для улучшенных предметов */}
            {activeTab === 1 && loadingUpgraded && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                <CircularProgress size={40} />
              </Box>
            )}

            {/* Информация о загрузке */}
            {!isSearchActive && !loadingMore && hasMore && (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant='body2' color='text.secondary'>
                  Прокрутите вниз для загрузки еще предметов
                </Typography>
              </Box>
            )}

            {/* Информация о конце списка */}
            {!isSearchActive && !hasMore && items.length > 0 && (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant='body2' color='text.secondary'>
                  Загружено {items.length} из {pagination.total} предметов
                </Typography>
              </Box>
            )}
          </>
        )}

        {/* Модальное окно информации о предмете */}
        <ItemInfoModal
          open={showItemInfo}
          onClose={() => setShowItemInfo(false)}
          item={selectedItem || externalItem}
          loading={externalLoading}
          error={externalError}
          readOnly={!!externalItem}
          userPoints={userPoints}
          onItemUpdate={handleItemUpdate}
          onTransferSuccess={handleTransferSuccess}
        />

        {/* Уведомления */}
        <Snackbar
          open={notification.open}
          autoHideDuration={4000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          sx={{
            '& .MuiSnackbarContent-root': {
              background:
                notification.severity === 'error'
                  ? 'rgba(244, 67, 54, 0.9)'
                  : notification.severity === 'warning'
                    ? 'rgba(255, 152, 0, 0.9)'
                    : notification.severity === 'info'
                      ? 'rgba(33, 150, 243, 0.9)'
                      : 'rgba(76, 175, 80, 0.9)',
              backdropFilter: 'blur(10px)',
              borderRadius: 2,
              fontWeight: 500,
            },
          }}
        >
          <Alert
            onClose={handleCloseNotification}
            severity={notification.severity}
            sx={{
              width: '100%',
              background: 'transparent',
              color: 'white',
              '& .MuiAlert-icon': {
                color: 'white',
              },
            }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </StyledContainer>
    );
  }
);

const UpgradeEffects = ({
  item,
  children,
}: {
  item: InventoryItem;
  children: React.ReactNode;
}) => {
  const { dominantColor, isUpgraded } = useUpgradeEffects(item);

  if (!isUpgraded) {
    return children;
  }

  return (
    <Box sx={{ position: 'relative' }}>
      {children}
      <GlowEffect color={dominantColor} />
      {EFFECTS_CONFIG.sparkles.map((sparkle, idx) => (
        <AnimatedSparkle key={idx} sx={sparkle.position} />
      ))}
      {EFFECTS_CONFIG.stars.map((star, idx) => (
        <AnimatedStar key={idx} sx={star.position} />
      ))}
    </Box>
  );
};

export default InventoryTab;
