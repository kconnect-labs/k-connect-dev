import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useMemo,
  useCallback,
} from 'react';
import {
  Box,
  CircularProgress,
  Grid,
  Typography,
  Chip,
  Button,
  MenuItem,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { UpgradeEffects } from './index';
import { StyledSelect } from './StyledComponents';
import inventoryImageService from '../../../../services/InventoryImageService';
import OptimizedImage from '../../../../components/OptimizedImage';
import InventoryItemCardPure from '../../../../UIKIT/InventoryItemCard';
// import { useBackgroundGradients } from '../../../Economic/components/inventoryPack/useBackgroundGradients';
// import { getBackgroundGradient, createTwoCirclePattern } from '../../../Economic/components/inventoryPack/utils';

const InventoryTab = forwardRef(
  (
    { userId, itemIdToOpen, onEquippedItemsUpdate, currentUserId, user },
    ref
  ) => {
    // const { getGradient, getItemId, getGradientData } = useBackgroundGradients();
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [readOnlyItem, setReadOnlyItem] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [modalError, setModalError] = useState('');
    const navigate = useNavigate();
    const [sortBy, setSortBy] = useState('date');
    const [filterPack, setFilterPack] = useState('all');
    const [filterRarity, setFilterRarity] = useState('all');
    const [showUpgradedOnly, setShowUpgradedOnly] = useState(false);
    const [showItemInfo, setShowItemInfo] = useState(false);
    const [externalItem, setExternalItem] = useState(null);
    const [copyStatus, setCopyStatus] = useState('');

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

    // Получаем corner_color для модалки
    const cornerColor = '#666666'; // fallback цвет

    // Получаем corner_color для второй модалки
    const secondModalCornerColor = '#666666'; // fallback цвет

    useImperativeHandle(ref, () => ({
      openItemModalById: id => {
        const item = inventory.find(i => String(i.id) === String(id));
        if (item) {
          setSelectedItem(item);
          setModalOpen(true);
        }
      },
    }));

    useEffect(() => {
      const fetchInventory = async () => {
        try {
          setLoading(true);
          const response = await axios.get(
            `/api/inventory/user/${userId}?page=1&per_page=15`
          );
          if (response.data.success && Array.isArray(response.data.items)) {
            setInventory(response.data.items);
            setPagination(response.data.pagination);
            setHasMore(response.data.pagination.has_next);
            if (response.data.items && response.data.items.length > 0) {
              await inventoryImageService.preloadInventoryImages(
                response.data.items
              );
            }
          } else {
            setInventory([]);
          }
        } catch (error) {
          console.error('Error fetching inventory:', error);
          setInventory([]);

          // Проверяем, является ли ошибка связанной с приватностью
          if (error.response && error.response.status === 403) {
            // Устанавливаем специальное состояние для приватного профиля
            setInventory([]);
            setLoading(false);
            return; // Не показываем общую ошибку загрузки
          }
        } finally {
          setLoading(false);
        }
      };
      if (userId) {
        fetchInventory();
      }
    }, [userId]);

    useEffect(() => {
      if (itemIdToOpen) {
        setModalOpen(true);
        setModalLoading(true);
        setModalError('');
        setReadOnlyItem(false);

        const foundInCurrentInventory = inventory.find(
          i => String(i.id) === String(itemIdToOpen)
        );
        if (foundInCurrentInventory) {
          setSelectedItem(foundInCurrentInventory);
          setReadOnlyItem(false);
          setModalLoading(false);
        } else {
          axios
            .get(`/api/inventory/item/${itemIdToOpen}/details`)
            .then(r => {
              if (r.data.success && r.data.item) {
                setSelectedItem(r.data.item);
                setReadOnlyItem(true);
              } else {
                setModalError('Не удалось получить предмет');
              }
            })
            .catch(() => setModalError('Ошибка при получении предмета'))
            .finally(() => setModalLoading(false));
        }
      }
    }, [itemIdToOpen, userId, inventory]);

    const getRarityColor = rarity => {
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

    const getRarityLabel = rarity => {
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

    const handleItemClick = item => {
      setSelectedItem(item);
      setReadOnlyItem(false);
      setModalOpen(true);
    };

    const handleCloseModal = () => {
      setModalOpen(false);
      setSelectedItem(null);
      setReadOnlyItem(false);
      setModalLoading(false);
      setModalError('');
    };

    // Функции для надевания и снятия предметов
    const handleEquipItem = async itemId => {
      try {
        const response = await fetch(`/api/inventory/equip/${itemId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (data.success) {
          // Обновляем инвентарь
          const updatedInventory = inventory.map(item =>
            item.id === itemId ? { ...item, is_equipped: true } : item
          );
          setInventory(updatedInventory);

          // Обновляем надетые предметы в профиле
          if (onEquippedItemsUpdate) {
            onEquippedItemsUpdate();
          }
        }
      } catch (error) {
        console.error('Error equipping item:', error);
      }
    };

    const handleUnequipItem = async itemId => {
      try {
        const response = await fetch(`/api/inventory/unequip/${itemId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (data.success) {
          // Обновляем инвентарь
          const updatedInventory = inventory.map(item =>
            item.id === itemId ? { ...item, is_equipped: false } : item
          );
          setInventory(updatedInventory);

          // Обновляем надетые предметы в профиле
          if (onEquippedItemsUpdate) {
            onEquippedItemsUpdate();
          }
        }
      } catch (error) {
        console.error('Error unequipping item:', error);
      }
    };

    // Функции сортировки и фильтрации
    const filteredAndSortedInventory = useMemo(() => {
      let filtered = [...inventory];

      // Фильтрация по паку
      if (filterPack !== 'all') {
        filtered = filtered.filter(item => item.pack_name === filterPack);
      }

      // Фильтрация по редкости
      if (filterRarity !== 'all') {
        filtered = filtered.filter(item => item.rarity === filterRarity);
      }

      // Фильтрация по улучшению
      if (showUpgradedOnly) {
        filtered = filtered.filter(item => item.upgrade_level === 1);
      }

      // Сортировка
      filtered.sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return a.item_name.localeCompare(b.item_name);
          case 'rarity':
            const rarityOrder = { legendary: 4, epic: 3, rare: 2, common: 1 };
            return (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0);
          case 'pack':
            return a.pack_name.localeCompare(b.pack_name);
          case 'upgrade':
            return (b.upgrade_level || 0) - (a.upgrade_level || 0);
          case 'date':
            return new Date(b.obtained_at) - new Date(a.obtained_at);
          default:
            return 0;
        }
      });

      return filtered;
    }, [inventory, filterPack, filterRarity, showUpgradedOnly, sortBy]);

    const getUniquePacks = useMemo(() => {
      const packs = [...new Set(inventory.map(item => item.pack_name))];
      return packs.sort();
    }, [inventory]);

    const handleCopyLink = () => {
      if (!selectedItem) return;
      const url = `${window.location.origin}/item/${selectedItem.id}`;
      navigator.clipboard.writeText(url).then(() => {
        setCopyStatus('Скопировано!');
        setTimeout(() => setCopyStatus(''), 1500);
      });
    };

    const loadMoreItems = useCallback(async () => {
      if (!loadingMore && hasMore) {
        try {
          setLoadingMore(true);
          const response = await axios.get(
            `/api/inventory/user/${userId}?page=${pagination.page + 1}&per_page=15`
          );
          if (response.data.success && Array.isArray(response.data.items)) {
            setInventory(prev => [...prev, ...response.data.items]);
            setPagination(response.data.pagination);
            setHasMore(response.data.pagination.has_next);
            if (response.data.items && response.data.items.length > 0) {
              await inventoryImageService.preloadInventoryImages(
                response.data.items
              );
            }
          }
        } catch (error) {
          console.error('Error loading more items:', error);
        } finally {
          setLoadingMore(false);
        }
      }
    }, [loadingMore, hasMore, userId, pagination.page]);

    // Обработчик прокрутки для бесконечной загрузки
    const handleScroll = useCallback(
      e => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        if (
          scrollHeight - scrollTop <= clientHeight * 1.5 &&
          !loadingMore &&
          hasMore
        ) {
          loadMoreItems();
        }
      },
      [loadingMore, hasMore, loadMoreItems]
    );

    // Проверяем, является ли профиль приватным и нет ли доступа
    const isPrivateProfile = user?.is_private && !user?.is_friend;

    if (loading) {
      return (
        <Box
          display='flex'
          justifyContent='center'
          alignItems='center'
          minHeight='200px'
        >
          <CircularProgress />
        </Box>
      );
    }

    // Показываем сообщение о приватном профиле
    if (isPrivateProfile) {
      return (
        <Box
          display='flex'
          flexDirection='column'
          justifyContent='center'
          alignItems='center'
          minHeight='200px'
          bgcolor='var(--theme-background, rgba(255, 255, 255, 0.03))'
          borderRadius={1}
          border='1px solid rgba(66, 66, 66, 0.5)'
          sx={{ p: 3 }}
        >
          <Typography
            variant='h6'
            sx={{
              color: theme => theme.palette.text.secondary,
              fontWeight: 600,
              mb: 2,
              textAlign: 'center',
            }}
          >
            Приватный профиль
          </Typography>
          <Typography
            variant='body2'
            sx={{
              color: theme => theme.palette.text.secondary,
              textAlign: 'center',
              maxWidth: '400px',
            }}
          >
            Инвентарь этого пользователя скрыт. Подпишитесь друг на друга для
            получения доступа к инвентарю.
          </Typography>
        </Box>
      );
    }

    return (
      <>
        <Box
          sx={{ p: 2, height: '100vh', overflowY: 'auto' }}
          onScroll={handleScroll}
        >
          {/* Панель сортировки и фильтрации */}
          <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {/* Сортировка */}
            <StyledSelect
              select
              size='small'
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              sx={{
                minWidth: 120,
                '& .MuiOutlinedInput-root': {
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(66, 66, 66, 0.5)',
                  '&:hover': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                },
                '& .MuiSelect-select': {
                  padding: '2px 8px',
                  fontSize: '0.75rem',
                },
              }}
            >
              <MenuItem value='date'>По дате получения</MenuItem>
              <MenuItem value='name'>По названию</MenuItem>
              <MenuItem value='rarity'>По редкости</MenuItem>
              <MenuItem value='pack'>По паку</MenuItem>
              <MenuItem value='upgrade'>По улучшению</MenuItem>
            </StyledSelect>

            {/* Фильтр по паку */}
            <StyledSelect
              select
              size='small'
              value={filterPack}
              onChange={e => setFilterPack(e.target.value)}
              sx={{
                minWidth: 120,
                '& .MuiOutlinedInput-root': {
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(66, 66, 66, 0.5)',
                  '&:hover': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                },
                '& .MuiSelect-select': {
                  padding: '2px 8px',
                  fontSize: '0.75rem',
                },
              }}
            >
              <MenuItem value='all'>Все Пачки</MenuItem>
              {getUniquePacks.map(pack => (
                <MenuItem key={pack} value={pack}>
                  {pack}
                </MenuItem>
              ))}
            </StyledSelect>

            {/* Фильтр по редкости */}
            <StyledSelect
              select
              size='small'
              value={filterRarity}
              onChange={e => setFilterRarity(e.target.value)}
              sx={{
                minWidth: 120,
                '& .MuiOutlinedInput-root': {
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(66, 66, 66, 0.5)',
                  '&:hover': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                },
                '& .MuiSelect-select': {
                  padding: '2px 8px',
                  fontSize: '0.75rem',
                },
              }}
            >
              <MenuItem value='all'>Вся редкость</MenuItem>
              <MenuItem value='common'>Обычные</MenuItem>
              <MenuItem value='rare'>Редкие</MenuItem>
              <MenuItem value='epic'>Эпические</MenuItem>
              <MenuItem value='legendary'>Легендарные</MenuItem>
            </StyledSelect>

            {/* Переключатель улучшенных */}
            <Button
              variant={showUpgradedOnly ? 'contained' : 'outlined'}
              size='small'
              onClick={() => setShowUpgradedOnly(!showUpgradedOnly)}
              sx={{
                borderColor: 'rgba(255, 255, 255, 0.2)',
                color: showUpgradedOnly ? 'white' : 'text.primary',
                background: showUpgradedOnly
                  ? 'rgba(76, 175, 80, 0.3)'
                  : 'transparent',
                '&:hover': {
                  borderColor: 'rgba(255, 255, 255, 0.4)',
                  background: showUpgradedOnly
                    ? 'rgba(76, 175, 80, 0.4)'
                    : 'rgba(255, 255, 255, 0.05)',
                },
              }}
            >
              Только улучшенные
            </Button>
          </Box>

          {loading ? (
            <Box textAlign='center' py={4}>
              <CircularProgress size={24} />
            </Box>
          ) : filteredAndSortedInventory.length === 0 ? (
            <Box textAlign='center' py={4}>
              <Typography variant='body1' color='text.secondary'>
                {inventory.length === 0
                  ? 'Инвентарь пуст'
                  : 'Предметы не найдены'}
              </Typography>
            </Box>
          ) : (
            <>
              <Grid container spacing={1}>
                {filteredAndSortedInventory.map((item, index) => (
                  <Grid
                    item
                    xs={4}
                    key={`${item.id}-${item.obtained_at}-${index}`}
                  >
                    <UpgradeEffects item={item}>
                      <InventoryItemCardPure
                        item={item}
                        onClick={() => handleItemClick(item)}
                        className='small'
                      />
                    </UpgradeEffects>
                  </Grid>
                ))}
              </Grid>

              {/* Индикатор загрузки для пагинации */}
              {loadingMore && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                  <CircularProgress size={24} />
                </Box>
              )}

              {/* Информация о загрузке */}
              {!loadingMore && hasMore && (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant='body2' color='text.secondary'>
                    Прокрутите вниз для загрузки еще предметов
                  </Typography>
                </Box>
              )}

              {/* Информация о конце списка */}
              {!hasMore && inventory.length > 0 && (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant='body2' color='text.secondary'>
                    Загружено {inventory.length} из {pagination.total} предметов
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Box>

        {/* Модалка с подробностями предмета */}
        {modalOpen && selectedItem && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
            }}
            onClick={handleCloseModal}
          >
            <UpgradeEffects item={selectedItem}>
              <Box
                onClick={e => e.stopPropagation()}
                sx={{
                  background: `${cornerColor}`,
                  border: `1px solid ${cornerColor}4D`,
                  borderRadius: 'var(--main-border-radius)',
                  p: 3,
                  width: 400,
                  height: 'auto',
                  overflow: 'auto',
                  position: 'relative',
                }}
              >
                {modalLoading ? (
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: '100%',
                    }}
                  >
                    <CircularProgress />
                  </Box>
                ) : modalError ? (
                  <Typography color='error' textAlign='center'>
                    {modalError}
                  </Typography>
                ) : (
                  <>
                    <Box sx={{ textAlign: 'center', mb: 2 }}>
                      <Box
                        sx={{
                          width: 250, // Увеличили с 200px на 25% (200 * 1.25 = 250)
                          height: 250, // Увеличили с 200px на 25% (200 * 1.25 = 250)
                          margin: '0 auto',
                          borderRadius: 'var(--main-border-radius)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2,
                          overflow: 'hidden',
                          position: 'relative', // Добавили для позиционирования фона
                          backgroundImage: selectedItem.background_url
                            ? `url(${selectedItem.background_url})`
                            : 'none',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat',
                        }}
                      >
                        <OptimizedImage
                          src={selectedItem.image_url}
                          alt={selectedItem.item_name}
                          width='75%' // Уменьшили с 100% на 25% (100% * 0.75 = 75%)
                          height='75%' // Уменьшили с 100% на 25% (100% * 0.75 = 75%)
                          fallbackText='Предмет недоступен'
                          showSkeleton={true}
                          style={{
                            position: 'relative',
                            zIndex: 10,
                            objectFit: 'contain',
                            maxWidth: '100%',
                            maxHeight: '100%',
                          }}
                        />
                      </Box>
                      <Typography variant='h6' sx={{ fontWeight: 600, mb: 1 }}>
                        {selectedItem.item_name}
                      </Typography>
                      <Chip
                        label={getRarityLabel(selectedItem.rarity || 'common')}
                        size='small'
                        sx={{
                          backgroundColor: `${getRarityColor(selectedItem.rarity || 'common')}20`,
                          color: getRarityColor(
                            selectedItem.rarity || 'common'
                          ),
                          fontWeight: 'bold',
                          mb: 2,
                        }}
                      />
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant='body2'
                        color='text.secondary'
                        sx={{ mb: 1 }}
                      >
                        <strong>ID предмета:</strong> {selectedItem.id}
                      </Typography>
                      <Typography
                        variant='body2'
                        color='text.secondary'
                        sx={{ mb: 1 }}
                      >
                        <strong>Пак:</strong>{' '}
                        {selectedItem.pack_name || 'Неизвестно'}
                      </Typography>
                      <Typography
                        variant='body2'
                        color='text.secondary'
                        sx={{ mb: 1 }}
                      >
                        <strong>Получен:</strong>{' '}
                        {selectedItem.obtained_at
                          ? new Date(
                              selectedItem.obtained_at
                            ).toLocaleDateString('ru-RU')
                          : '-'}
                      </Typography>
                      {selectedItem.gifter_username && (
                        <Typography
                          variant='body2'
                          color='text.secondary'
                          sx={{ mb: 1 }}
                        >
                          <strong>Подарен:</strong> @
                          {selectedItem.gifter_username}
                        </Typography>
                      )}
                      {typeof selectedItem.item_number !== 'undefined' &&
                        selectedItem.total_count && (
                          <Typography
                            variant='body2'
                            color='text.secondary'
                            sx={{ mb: 1 }}
                          >
                            <strong>Экземпляр:</strong>{' '}
                            {selectedItem.item_number} из{' '}
                            {selectedItem.total_count}
                          </Typography>
                        )}
                      {selectedItem.is_equipped && (
                        <Typography
                          variant='body2'
                          color='primary.main'
                          sx={{ fontWeight: 600 }}
                        >
                          ✓ Надет
                        </Typography>
                      )}

                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          mt: 1,
                        }}
                      >
                        <Button
                          size='small'
                          variant='text'
                          startIcon={<ContentCopyIcon fontSize='small' />}
                          onClick={handleCopyLink}
                          sx={{ minWidth: 0, px: 1, fontSize: '0.85rem' }}
                        >
                          {copyStatus || 'Скопировать'}
                        </Button>
                      </Box>
                      {selectedItem.marketplace && (
                        <Box sx={{ mt: 2 }}>
                          <Typography
                            variant='body2'
                            color='warning.main'
                            sx={{ fontWeight: 600, mb: 1 }}
                          >
                            Выставлен на продажу за{' '}
                            {selectedItem.marketplace.price} KBalls
                          </Typography>
                          <Button
                            variant='contained'
                            fullWidth
                            onClick={() => {
                              handleCloseModal();
                              navigate('/marketplace', {
                                state: {
                                  openItemId: selectedItem.marketplace.id,
                                },
                              });
                            }}
                            sx={{
                              mt: 1,
                              background: 'rgba(255, 255, 255, 0.1)',
                              '&:hover': {
                                background: 'rgba(255, 255, 255, 0.2)',
                              },
                            }}
                          >
                            Перейти в маркет
                          </Button>
                        </Box>
                      )}
                    </Box>
                    {readOnlyItem && (
                      <Typography
                        variant='caption'
                        color='text.secondary'
                        sx={{ display: 'block', textAlign: 'center', mt: 2 }}
                      >
                        Только просмотр (не ваш предмет)
                      </Typography>
                    )}
                  </>
                )}
              </Box>
            </UpgradeEffects>
          </Box>
        )}

        {showItemInfo && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
            }}
            onClick={handleCloseModal}
          >
            <UpgradeEffects item={selectedItem || externalItem}>
              <Box
                onClick={e => e.stopPropagation()}
                sx={{
                  background: `${secondModalCornerColor}`,
                  border: `1px solid ${secondModalCornerColor}4D`,
                  borderRadius: 'var(--main-border-radius)',
                  p: 3,
                  width: 400,
                  height: 550,
                  overflow: 'auto',
                  position: 'relative',
                }}
              >
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      width: 250, // Увеличили с 200px на 25% (200 * 1.25 = 250)
                      height: 250, // Увеличили с 200px на 25% (200 * 1.25 = 250)
                      margin: '0 auto',
                      borderRadius: 'var(--main-border-radius)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                      overflow: 'hidden',
                      position: 'relative', // Добавили для позиционирования фона
                      backgroundImage: selectedItem.background_url
                        ? `url(${selectedItem.background_url})`
                        : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                    }}
                  >
                    <OptimizedImage
                      src={selectedItem.image_url}
                      alt={selectedItem.item_name}
                      width='75%' // Уменьшили с 100% на 25% (100% * 0.75 = 75%)
                      height='75%' // Уменьшили с 100% на 25% (100% * 0.75 = 75%)
                      fallbackText='Предмет недоступен'
                      showSkeleton={true}
                      style={{
                        position: 'relative',
                        zIndex: 10,
                        objectFit: 'contain',
                        maxWidth: '100%',
                        maxHeight: '100%',
                      }}
                    />
                  </Box>

                  <Typography variant='h6' sx={{ fontWeight: 600, mb: 1 }}>
                    {selectedItem.item_name}
                  </Typography>

                  <Chip
                    label={getRarityLabel(selectedItem.rarity || 'common')}
                    size='small'
                    sx={{
                      backgroundColor: `${getRarityColor(selectedItem.rarity || 'common')}20`,
                      color: getRarityColor(selectedItem.rarity || 'common'),
                      fontWeight: 'bold',
                      mb: 2,
                    }}
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{ mb: 1 }}
                  >
                    <strong>ID предмета:</strong> {selectedItem.id}
                  </Typography>
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{ mb: 1 }}
                  >
                    <strong>Пак:</strong>{' '}
                    {selectedItem.pack_name || 'Неизвестно'}
                  </Typography>
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{ mb: 1 }}
                  >
                    <strong>Получен:</strong>{' '}
                    {selectedItem.obtained_at
                      ? new Date(selectedItem.obtained_at).toLocaleDateString(
                          'ru-RU'
                        )
                      : '-'}
                  </Typography>
                  {selectedItem.gifter_username && (
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      sx={{ mb: 1 }}
                    >
                      <strong>Подарен:</strong> @{selectedItem.gifter_username}
                    </Typography>
                  )}
                  {typeof selectedItem.item_number !== 'undefined' &&
                    selectedItem.total_count && (
                      <Typography
                        variant='body2'
                        color='text.secondary'
                        sx={{ mb: 1 }}
                      >
                        <strong>Экземпляр:</strong> {selectedItem.item_number}{' '}
                        из {selectedItem.total_count}
                      </Typography>
                    )}
                  {selectedItem.is_equipped && (
                    <Typography
                      variant='body2'
                      color='primary.main'
                      sx={{ fontWeight: 600 }}
                    >
                      ✓ Надет
                    </Typography>
                  )}
                  {selectedItem.marketplace && (
                    <Box sx={{ mt: 2 }}>
                      <Typography
                        variant='body2'
                        color='warning.main'
                        sx={{ fontWeight: 600, mb: 1 }}
                      >
                        Выставлен на продажу за {selectedItem.marketplace.price}{' '}
                        KBalls
                      </Typography>
                      <Button
                        variant='contained'
                        fullWidth
                        onClick={() => {
                          handleCloseModal();
                          navigate('/marketplace', {
                            state: { openItemId: selectedItem.marketplace.id },
                          });
                        }}
                        sx={{
                          mt: 1,
                          background: 'rgba(255, 255, 255, 0.1)',
                          '&:hover': {
                            background: 'rgba(255, 255, 255, 0.2)',
                          },
                        }}
                      >
                        Перейти в маркет
                      </Button>
                    </Box>
                  )}
                </Box>
              </Box>
            </UpgradeEffects>
          </Box>
        )}
      </>
    );
  }
);

export default InventoryTab;
