import { useCallback } from 'react';
import axios from 'axios';

interface Auction {
  id: number;
  username: string;
  min_price: number;
  current_price?: number;
  highest_bid?: number;
  status: string;
  seller_id?: number;
  seller?: { username: string };
  end_time: string;
  created_at: string;
  completed_at?: string;
  bids_count?: number;
  bids?: Array<{
    bidder: { id: number; username: string; avatar_url?: string; photo?: string };
    amount: number;
    time: string;
  }>;
  remaining_time_formatted?: string;
  winner_id?: number;
  winner?: { username: string };
  final_price?: number;
}

interface UseAuctionActionsProps {
  user: any;
  setLoadingButtons: (buttons: any) => void;
  setSnackbar: (snackbar: any) => void;
  fetchAuctions: () => Promise<void>;
  fetchUserAuctions: () => Promise<void>;
  broadcastUpdate: (type: string, data: any) => void;
}

export const useAuctionActions = ({
  user,
  setLoadingButtons,
  setSnackbar,
  fetchAuctions,
  fetchUserAuctions,
  broadcastUpdate,
}: UseAuctionActionsProps) => {
  const handleCreateAuction = useCallback(async (auctionData: {
    username: string;
    min_price: string;
    duration_hours: number;
  }) => {
    const errors: any = {};
    if (!auctionData.username) errors.username = 'Выберите юзернейм';
    if (!auctionData.min_price) {
      errors.min_price = 'Введите минимальную цену';
    } else if (
      isNaN(Number(auctionData.min_price)) ||
      parseInt(auctionData.min_price) <= 0
    ) {
      errors.min_price = 'Цена должна быть положительным числом';
    } else if (parseInt(auctionData.min_price) > 15000000) {
      errors.min_price = 'Максимальная начальная цена: 15 000 000 баллов';
    }

    if (Object.keys(errors).length > 0) {
      return { success: false, errors };
    }

    setLoadingButtons(prev => ({ ...prev, create: true }));

    try {
      const response = await axios.post('/api/username/create-auction', {
        username: auctionData.username,
        min_price: parseInt(auctionData.min_price),
        duration_hours: parseFloat(auctionData.duration_hours.toString()),
      });

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: 'Аукцион успешно создан!',
          severity: 'success',
        });

        fetchAuctions();
        fetchUserAuctions();

        return { success: true };
      }
    } catch (error: any) {
      console.error('Error creating auction:', error);
      setSnackbar({
        open: true,
        message:
          error.response?.data?.message || 'Ошибка при создании аукциона',
        severity: 'error',
      });
    } finally {
      setLoadingButtons(prev => ({ ...prev, create: false }));
    }

    return { success: false };
  }, [setLoadingButtons, setSnackbar, fetchAuctions, fetchUserAuctions]);

  const handlePlaceBid = useCallback(async (auction: Auction, bidAmount: string) => {
    if (!bidAmount || isNaN(Number(bidAmount)) || parseInt(bidAmount) <= 0) {
      return { success: false, error: 'Введите корректную сумму ставки' };
    }

    setLoadingButtons(prev => ({ ...prev, bid: true }));

    if (!auction) {
      setSnackbar({
        open: true,
        message: 'Не выбран аукцион, обновите страницу',
        severity: 'warning',
      });
      setLoadingButtons(prev => ({ ...prev, bid: false }));
      return { success: false };
    }

    if (auction.status === 'completed') {
      setSnackbar({
        open: true,
        message: 'Аукцион уже завершен, ставки больше не принимаются',
        severity: 'warning',
      });
      setLoadingButtons(prev => ({ ...prev, bid: false }));
      return { success: false };
    }

    const transactionId = `bid-${auction.id}-${Date.now()}`;

    if (localStorage.getItem(transactionId)) {
      setLoadingButtons(prev => ({ ...prev, bid: false }));
      return { success: false };
    }

    localStorage.setItem(transactionId, 'pending');

    try {
      const response = await axios.post(
        `/api/username/auctions/${auction.id}/bid`,
        {
          amount: parseInt(bidAmount),
          transaction_id: transactionId,
        }
      );

      if (response.data.success) {
        localStorage.removeItem(transactionId);

        broadcastUpdate('transaction_complete', {
          type: 'place_bid',
          auctionId: auction.id,
          result: response.data,
        });

        setSnackbar({
          open: true,
          message: 'Ставка успешно размещена!',
          severity: 'success',
        });

        fetchAuctions();
        fetchUserAuctions();

        return { success: true };
      }
    } catch (error: any) {
      console.error('Error placing bid:', error);

      localStorage.removeItem(transactionId);

      setSnackbar({
        open: true,
        message:
          error.response?.data?.message || 'Ошибка при размещении ставки',
        severity: 'error',
      });
    } finally {
      setLoadingButtons(prev => ({ ...prev, bid: false }));
    }

    return { success: false };
  }, [setLoadingButtons, setSnackbar, fetchAuctions, fetchUserAuctions, broadcastUpdate]);

  const handleCancelAuction = useCallback(async (auctionId: number) => {
    setLoadingButtons(prev => ({ ...prev, cancel: auctionId }));

    try {
      const response = await axios.post(
        `/api/username/auctions/${auctionId}/cancel`
      );

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: 'Аукцион успешно отменен',
          severity: 'success',
        });

        fetchAuctions();
        fetchUserAuctions();
        return { success: true };
      }
    } catch (error: any) {
      console.error('Error cancelling auction:', error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Ошибка при отмене аукциона',
        severity: 'error',
      });
    } finally {
      setLoadingButtons(prev => ({ ...prev, cancel: null }));
    }

    return { success: false };
  }, [setLoadingButtons, setSnackbar, fetchAuctions, fetchUserAuctions]);

  const handleBuyNow = useCallback(async (auctionId: number) => {
    setLoadingButtons(prev => ({ ...prev, buy: auctionId }));

    if (!auctionId) {
      setSnackbar({
        open: true,
        message: 'Не выбран аукцион, обновите страницу',
        severity: 'warning',
      });
      setLoadingButtons(prev => ({ ...prev, buy: null }));
      return { success: false };
    }

    const transactionId = `buy-${auctionId}-${Date.now()}`;

    if (localStorage.getItem(transactionId)) {
      setLoadingButtons(prev => ({ ...prev, buy: null }));
      return { success: false };
    }

    localStorage.setItem(transactionId, 'pending');

    try {
      const response = await axios.post(
        `/api/username/auctions/${auctionId}/buy-now`,
        {
          transaction_id: transactionId,
        }
      );

      if (response.data.success) {
        localStorage.removeItem(transactionId);

        broadcastUpdate('transaction_complete', {
          type: 'buy_now',
          auctionId,
          result: response.data,
        });

        setSnackbar({
          open: true,
          message: response.data.message || 'Юзернейм успешно куплен!',
          severity: 'success',
        });

        fetchAuctions();
        fetchUserAuctions();
        return { success: true };
      }
    } catch (error: any) {
      console.error('Error buying username:', error);

      localStorage.removeItem(transactionId);

      setSnackbar({
        open: true,
        message:
          error.response?.data?.message || 'Ошибка при покупке юзернейма',
        severity: 'error',
      });
    } finally {
      setLoadingButtons(prev => ({ ...prev, buy: null }));
    }

    return { success: false };
  }, [setLoadingButtons, setSnackbar, fetchAuctions, fetchUserAuctions, broadcastUpdate]);

  const handleAcceptBid = useCallback(async (auction: Auction) => {
    if (!auction || !auction.id) return { success: false };

    setLoadingButtons(prev => ({ ...prev, accept: auction.id }));

    if (!auction.id) {
      setSnackbar({
        open: true,
        message: 'Не выбран аукцион, обновите страницу',
        severity: 'warning',
      });
      setLoadingButtons(prev => ({ ...prev, accept: null }));
      return { success: false };
    }

    const transactionId = `accept-bid-${auction.id}-${Date.now()}`;

    if (localStorage.getItem(transactionId)) {
      setLoadingButtons(prev => ({ ...prev, accept: null }));
      return { success: false };
    }

    localStorage.setItem(transactionId, 'pending');

    try {
      const response = await axios.post(
        `/api/username/auctions/${auction.id}/accept-bid`,
        {
          transaction_id: transactionId,
        }
      );

      if (response.data.success) {
        localStorage.removeItem(transactionId);

        broadcastUpdate('transaction_complete', {
          type: 'accept_bid',
          auctionId: auction.id,
          result: response.data,
        });

        setSnackbar({
          open: true,
          message: response.data.message || 'Ставка успешно принята!',
          severity: 'success',
        });

        fetchAuctions();
        fetchUserAuctions();
        return { success: true };
      }
    } catch (error: any) {
      console.error('Error accepting bid:', error);

      localStorage.removeItem(transactionId);

      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Ошибка при принятии ставки',
        severity: 'error',
      });
    } finally {
      setLoadingButtons(prev => ({ ...prev, accept: null }));
    }

    return { success: false };
  }, [setLoadingButtons, setSnackbar, fetchAuctions, fetchUserAuctions, broadcastUpdate]);

  return {
    handleCreateAuction,
    handlePlaceBid,
    handleCancelAuction,
    handleBuyNow,
    handleAcceptBid,
  };
}; 