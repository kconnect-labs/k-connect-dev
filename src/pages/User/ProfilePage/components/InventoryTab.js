import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { 
  Box, 
  CircularProgress, 
  Grid, 
  Typography, 
  Chip, 
  Button, 
  MenuItem
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { UpgradeEffects } from './index';
import { StyledSelect } from './StyledComponents';
import inventoryImageService from '../../../../services/InventoryImageService';
import OptimizedImage from '../../../../components/OptimizedImage';

const InventoryTab = forwardRef(({ userId, itemIdToOpen }, ref) => {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [readOnlyItem, setReadOnlyItem] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [modalError, setModalError] = useState('');
    const navigate = useNavigate();
    const [sortBy, setSortBy] = useState('name');
    const [filterPack, setFilterPack] = useState('all');
    const [filterRarity, setFilterRarity] = useState('all');
    const [showUpgradedOnly, setShowUpgradedOnly] = useState(false);
    const [showItemInfo, setShowItemInfo] = useState(false);
    const [externalItem, setExternalItem] = useState(null);
    const [copyStatus, setCopyStatus] = useState('');
  
    useImperativeHandle(ref, () => ({
      openItemModalById: (id) => {
        const item = inventory.find(i => String(i.id) === String(id));
        if (item) {
          setSelectedItem(item);
          setModalOpen(true);
        }
      }
    }));
  
    useEffect(() => {
      const fetchInventory = async () => {
        try {
          setLoading(true);
          const response = await axios.get(`/api/inventory/user/${userId}`);
          if (response.data.success && Array.isArray(response.data.items)) {
            setInventory(response.data.items);
            if (response.data.items && response.data.items.length > 0) {
              await inventoryImageService.preloadInventoryImages(response.data.items);
            }
          } else {
            setInventory([]);
          }
        } catch (error) {
          setInventory([]);
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
        // Проверяем, есть ли предмет в инвентаре
        axios.get(`/api/inventory/user/${userId}`)
          .then(res => {
            const found = res.data.items?.find(i => String(i.id) === String(itemIdToOpen));
            if (found) {
              setSelectedItem(found);
              setReadOnlyItem(false);
              setModalLoading(false);
            } else {
              // Если нет — грузим отдельно
              axios.get(`/api/inventory/item/${itemIdToOpen}`)
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
          })
          .catch(() => setModalError('Ошибка при получении инвентаря'));
      }
    }, [itemIdToOpen, userId]);
  
    const getRarityColor = (rarity) => {
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
  
    const getRarityLabel = (rarity) => {
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
  
    const handleItemClick = (item) => {
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
  
    // Функции сортировки и фильтрации
    const getFilteredAndSortedInventory = () => {
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
          default:
            return 0;
        }
      });
  
      return filtered;
    };
  
    const getUniquePacks = () => {
      const packs = [...new Set(inventory.map(item => item.pack_name))];
      return packs.sort();
    };
  
    const handleCopyLink = () => {
      if (!selectedItem) return;
      const url = `${window.location.origin}/item/${selectedItem.id}`;
      navigator.clipboard.writeText(url).then(() => {
        setCopyStatus('Скопировано!');
        setTimeout(() => setCopyStatus(''), 1500);
      });
    };
  
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      );
    }
  
    return (
      <>
        <Box sx={{ p: 2 }}>
          {/* Панель сортировки и фильтрации */}
          <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {/* Сортировка */}
            <StyledSelect
              select
              size="small"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              sx={{
                minWidth: 120,
                '& .MuiOutlinedInput-root': {
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
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
              <MenuItem value="name">По названию</MenuItem>
              <MenuItem value="rarity">По редкости</MenuItem>
              <MenuItem value="pack">По паку</MenuItem>
              <MenuItem value="upgrade">По улучшению</MenuItem>
            </StyledSelect>
  
            {/* Фильтр по паку */}
            <StyledSelect
              select
              size="small"
              value={filterPack}
              onChange={(e) => setFilterPack(e.target.value)}
              sx={{
                minWidth: 120,
                '& .MuiOutlinedInput-root': {
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
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
              <MenuItem value="all">Все Пачки</MenuItem>
              {getUniquePacks().map((pack) => (
                <MenuItem key={pack} value={pack}>{pack}</MenuItem>
              ))}
            </StyledSelect>
  
            {/* Фильтр по редкости */}
            <StyledSelect
              select
              size="small"
              value={filterRarity}
              onChange={(e) => setFilterRarity(e.target.value)}
              sx={{
                minWidth: 120,
                '& .MuiOutlinedInput-root': {
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
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
              <MenuItem value="all">Вся редкость</MenuItem>
              <MenuItem value="common">Обычные</MenuItem>
              <MenuItem value="rare">Редкие</MenuItem>
              <MenuItem value="epic">Эпические</MenuItem>
              <MenuItem value="legendary">Легендарные</MenuItem>
            </StyledSelect>
  
            {/* Переключатель улучшенных */}
            <Button
              variant={showUpgradedOnly ? "contained" : "outlined"}
              size="small"
              onClick={() => setShowUpgradedOnly(!showUpgradedOnly)}
              sx={{
                borderColor: 'rgba(255, 255, 255, 0.2)',
                color: showUpgradedOnly ? 'white' : 'text.primary',
                background: showUpgradedOnly ? 'rgba(76, 175, 80, 0.3)' : 'transparent',
                '&:hover': {
                  borderColor: 'rgba(255, 255, 255, 0.4)',
                  background: showUpgradedOnly ? 'rgba(76, 175, 80, 0.4)' : 'rgba(255, 255, 255, 0.05)',
                },
              }}
            >
              Только улучшенные
            </Button>
          </Box>
  
          {loading ? (
            <Box textAlign="center" py={4}>
              <CircularProgress size={24} />
            </Box>
          ) : getFilteredAndSortedInventory().length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography variant="body1" color="text.secondary">
                {inventory.length === 0 ? 'Инвентарь пуст' : 'Предметы не найдены'}
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={1}>
              {getFilteredAndSortedInventory().map((item) => (
                <Grid item xs={4} key={item.id}>
                  <UpgradeEffects item={item}>
                    <Box
                      onClick={() => handleItemClick(item)}
                      sx={{
                        p: 1,
                        background: 'rgba(255, 255, 255, 0.03)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: 1.5,
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          background: 'rgba(255, 255, 255, 0.05)',
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: '100%',
                          aspectRatio: '1',
                          borderRadius: 1,
                          background: 'rgba(208, 188, 255, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 0.5,
                          overflow: 'hidden',
                          position: 'relative',
                          ...(item.background_url && {
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              backgroundImage: `url(${item.background_url})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              backgroundRepeat: 'no-repeat',
                              borderRadius: 'inherit',
                              zIndex: 1,
                            }
                          })
                        }}
                      >
                        <OptimizedImage
                          src={item.image_url}
                          alt={item.item_name}
                          width="75%" // Уменьшили с 100% на 25% (100% * 0.75 = 75%)
                          height="75%" // Уменьшили с 100% на 25% (100% * 0.75 = 75%)
                          fallbackText="Предмет недоступен"
                          showSkeleton={true}
                          style={{
                            position: 'relative',
                            zIndex: 2,
                            objectFit: 'contain'
                          }}
                        />
                        {item.marketplace && (
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 4,
                              right: 4,
                              padding: '2px 6px',
                              borderRadius: '8px',
                              background: 'rgba(0, 0, 0, 0.7)',
                              backdropFilter: 'blur(5px)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '2px',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                            }}
                          >
                            <img
                              src="/static/icons/KBalls.svg"
                              alt="KBalls"
                              style={{
                                width: '12px',
                                height: '12px',
                              }}
                            />
                            <Typography
                              variant="caption"
                              sx={{
                                color: '#fff',
                                fontWeight: 'bold',
                                fontSize: '0.65rem',
                              }}
                            >
                              {item.marketplace.price}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          fontWeight: 500, 
                          display: 'block',
                          textAlign: 'center',
                          mb: 0.5,
                          fontSize: '0.7rem',
                          lineHeight: 1.2,
                        }}
                      >
                        {item.item_name}
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'center',
                          gap: 0.5,
                        }}
                      >
                        <Chip
                          label={getRarityLabel(item.rarity || 'common')}
                          size="small"
                          sx={{
                            backgroundColor: `${getRarityColor(item.rarity || 'common')}20`,
                            color: getRarityColor(item.rarity || 'common'),
                            fontWeight: 'bold',
                            fontSize: '0.6rem',
                            height: 16,
                            '& .MuiChip-label': {
                              padding: '0 4px',
                            },
                          }}
                        />
                      </Box>
                    </Box>
                  </UpgradeEffects>
                </Grid>
              ))}
            </Grid>
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
                onClick={(e) => e.stopPropagation()}
                sx={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 2,
                  p: 3,
                  width: 400,
                  height: 550,
                  overflow: 'auto',
                  position: 'relative',
                }}
              >
                {modalLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress />
                  </Box>
                ) : modalError ? (
                  <Typography color="error" textAlign="center">{modalError}</Typography>
                ) : (
                  <>
                    <Box sx={{ textAlign: 'center', mb: 2 }}>
                      <Box
                        sx={{
                          width: 250, // Увеличили с 200px на 25% (200 * 1.25 = 250)
                          height: 250, // Увеличили с 200px на 25% (200 * 1.25 = 250)
                          margin: '0 auto',
                          borderRadius: 2,
                          background: 'rgba(208, 188, 255, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2,
                          overflow: 'hidden',
                          position: 'relative', // Добавили для позиционирования фона
                          ...(selectedItem.background_url && {
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              backgroundImage: `url(${selectedItem.background_url})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              backgroundRepeat: 'no-repeat',
                              borderRadius: 'inherit',
                              zIndex: 1,
                            }
                          })
                        }}
                      >
                        <OptimizedImage
                          src={selectedItem.image_url}
                          alt={selectedItem.item_name}
                          width="75%" // Уменьшили с 100% на 25% (100% * 0.75 = 75%)
                          height="75%" // Уменьшили с 100% на 25% (100% * 0.75 = 75%)
                          fallbackText="Предмет недоступен"
                          showSkeleton={true}
                          style={{
                            position: 'relative',
                            zIndex: 2,
                            objectFit: 'contain'
                          }}
                        />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        {selectedItem.item_name}
                      </Typography>
                      <Chip
                        label={getRarityLabel(selectedItem.rarity || 'common')}
                        size="small"
                        sx={{
                          backgroundColor: `${getRarityColor(selectedItem.rarity || 'common')}20`,
                          color: getRarityColor(selectedItem.rarity || 'common'),
                          fontWeight: 'bold',
                          mb: 2,
                        }}
                      />
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        <strong>ID предмета:</strong> {selectedItem.id}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        <strong>Пак:</strong> {selectedItem.pack_name || 'Неизвестно'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        <strong>Получен:</strong> {selectedItem.obtained_at ? new Date(selectedItem.obtained_at).toLocaleDateString('ru-RU') : '-'}
                      </Typography>
                      {selectedItem.gifter_username && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          <strong>Подарен:</strong> @{selectedItem.gifter_username}
                        </Typography>
                      )}
                      {typeof selectedItem.item_number !== 'undefined' && selectedItem.total_count && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          <strong>Экземпляр:</strong> {selectedItem.item_number} из {selectedItem.total_count}
                        </Typography>
                      )}
                      {selectedItem.is_equipped && (
                        <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>
                          ✓ Надет
                        </Typography>
                      )}
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 1 }}>
                        <Button
                          size="small"
                          variant="text"
                          startIcon={<ContentCopyIcon fontSize="small" />}
                          onClick={handleCopyLink}
                          sx={{ minWidth: 0, px: 1, fontSize: '0.85rem' }}
                        >
                          {copyStatus || 'Скопировать'}
                        </Button>
                      </Box>
                      {selectedItem.marketplace && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" color="warning.main" sx={{ fontWeight: 600, mb: 1 }}>
                            Выставлен на продажу за {selectedItem.marketplace.price} KBalls
                          </Typography>
                          <Button
                            variant="contained"
                            fullWidth
                            onClick={() => {
                              handleCloseModal();
                              navigate('/marketplace', {
                                state: { openItemId: selectedItem.marketplace.id }
                              });
                            }}
                            sx={{
                              mt: 1,
                              background: 'rgba(255, 255, 255, 0.1)',
                              '&:hover': {
                                background: 'rgba(255, 255, 255, 0.2)',
                              }
                            }}
                          >
                            Перейти в маркет
                          </Button>
                        </Box>
                      )}
                    </Box>
                    {readOnlyItem && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 2 }}>
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
                onClick={(e) => e.stopPropagation()}
                sx={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: 2,
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
                      borderRadius: 2,
                      background: 'rgba(208, 188, 255, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                      overflow: 'hidden',
                      position: 'relative', // Добавили для позиционирования фона
                      ...(selectedItem.background_url && {
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundImage: `url(${selectedItem.background_url})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat',
                          borderRadius: 'inherit',
                          zIndex: 1,
                        }
                      })
                    }}
                  >
                    <OptimizedImage
                      src={selectedItem.image_url}
                      alt={selectedItem.item_name}
                      width="75%" // Уменьшили с 100% на 25% (100% * 0.75 = 75%)
                      height="75%" // Уменьшили с 100% на 25% (100% * 0.75 = 75%)
                      fallbackText="Предмет недоступен"
                      showSkeleton={true}
                      style={{
                        position: 'relative',
                        zIndex: 2,
                        objectFit: 'contain'
                      }}
                    />
                  </Box>
                  
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {selectedItem.item_name}
                  </Typography>
                  
                  <Chip
                    label={getRarityLabel(selectedItem.rarity || 'common')}
                    size="small"
                    sx={{
                      backgroundColor: `${getRarityColor(selectedItem.rarity || 'common')}20`,
                      color: getRarityColor(selectedItem.rarity || 'common'),
                      fontWeight: 'bold',
                      mb: 2,
                    }}
                  />
                </Box>
  
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <strong>ID предмета:</strong> {selectedItem.id}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <strong>Пак:</strong> {selectedItem.pack_name || 'Неизвестно'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <strong>Получен:</strong> {selectedItem.obtained_at ? new Date(selectedItem.obtained_at).toLocaleDateString('ru-RU') : '-'}
                  </Typography>
                  {selectedItem.gifter_username && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <strong>Подарен:</strong> @{selectedItem.gifter_username}
                    </Typography>
                  )}
                  {typeof selectedItem.item_number !== 'undefined' && selectedItem.total_count && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      <strong>Экземпляр:</strong> {selectedItem.item_number} из {selectedItem.total_count}
                    </Typography>
                  )}
                  {selectedItem.is_equipped && (
                    <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>
                      ✓ Надет
                    </Typography>
                  )}
                  {selectedItem.marketplace && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="warning.main" sx={{ fontWeight: 600, mb: 1 }}>
                        Выставлен на продажу за {selectedItem.marketplace.price} KBalls
                      </Typography>
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={() => {
                          handleCloseModal();
                          navigate('/marketplace', {
                            state: { openItemId: selectedItem.marketplace.id }
                          });
                        }}
                        sx={{
                          mt: 1,
                          background: 'rgba(255, 255, 255, 0.1)',
                          '&:hover': {
                            background: 'rgba(255, 255, 255, 0.2)',
                          }
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
  });
  
export default InventoryTab;