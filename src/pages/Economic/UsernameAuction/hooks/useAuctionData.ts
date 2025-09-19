import { useState, useEffect, useRef, useCallback } from 'react';
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
    bidder: {
      id: number;
      username: string;
      avatar_url?: string;
      photo?: string;
    };
    amount: number;
    time: string;
  }>;
  remaining_time_formatted?: string;
  winner_id?: number;
  winner?: { username: string };
  final_price?: number;
}

interface UserBid {
  id: number;
  username: string;
  my_bid: number;
  highest_bid: number;
  status: string;
  end_time: string;
  remaining_time_formatted?: string;
  am_winning: boolean;
}

interface Username {
  id: number;
  username: string;
  is_active: boolean;
}

interface UseAuctionDataReturn {
  // Data
  auctions: Auction[];
  filteredAuctions: Auction[];
  completedAuctions: Auction[];
  userAuctions: Auction[];
  userBids: UserBid[];
  usernames: Username[];

  // Loading states
  loading: boolean;
  detailLoading: boolean;
  loadingButtons: {
    bid: boolean;
    buy: number | null;
    accept: number | null;
    cancel: number | null;
    create: boolean;
  };

  // UI states
  searchQuery: string;
  sessionActive: boolean;
  sessionExpired: boolean;

  // Actions
  fetchAuctions: (silent?: boolean) => Promise<void>;
  fetchUserAuctions: (silent?: boolean) => Promise<void>;
  fetchUsernames: (silent?: boolean) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setLoadingButtons: (buttons: any) => void;
  setDetailLoading: (loading: boolean) => void;
  broadcastUpdate: (type: string, data: any) => void;
}

export const useAuctionData = (): UseAuctionDataReturn => {
  const [loading, setLoading] = useState(true);
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [filteredAuctions, setFilteredAuctions] = useState<Auction[]>([]);
  const [completedAuctions, setCompletedAuctions] = useState<Auction[]>([]);
  const [userAuctions, setUserAuctions] = useState<Auction[]>([]);
  const [userBids, setUserBids] = useState<UserBid[]>([]);
  const [usernames, setUsernames] = useState<Username[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sessionActive, setSessionActive] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [loadingButtons, setLoadingButtons] = useState({
    bid: false,
    buy: null,
    accept: null,
    cancel: null,
    create: false,
  });

  const sessionStartTime = useRef(Date.now());
  const broadcastChannel = useRef<BroadcastChannel | null>(null);
  const lastFetchTime = useRef<number | null>(null);
  const updateInterval = useRef<NodeJS.Timeout | null>(null);
  const SESSION_TIMEOUT = 60 * 60 * 1000;
  const MIN_UPDATE_INTERVAL = 15000;

  // Broadcast channel setup
  useEffect(() => {
    if (typeof BroadcastChannel !== 'undefined') {
      broadcastChannel.current = new BroadcastChannel(
        'username_auction_channel'
      );

      broadcastChannel.current.onmessage = event => {
        const { type, data, timestamp } = event.data;

        if (!lastFetchTime.current || timestamp > lastFetchTime.current) {
          lastFetchTime.current = timestamp;

          if (type === 'auctions') {
            const activeAuctions = (data.auctions || []).filter(
              (auction: Auction) => auction.status !== 'completed'
            );
            const completed = (data.auctions || []).filter(
              (auction: Auction) => auction.status === 'completed'
            );

            setAuctions(activeAuctions);
            setFilteredAuctions(activeAuctions);
            setCompletedAuctions(completed);
          } else if (type === 'user_auctions') {
            setUserAuctions(data.active_auctions || []);
          }
        }
      };
    }

    return () => {
      if (broadcastChannel.current) {
        broadcastChannel.current.close();
      }
    };
  }, []);

  // Session management
  useEffect(() => {
    const checkSessionExpiration = () => {
      const currentTime = Date.now();
      const sessionDuration = currentTime - sessionStartTime.current;

      if (sessionDuration >= SESSION_TIMEOUT && !sessionExpired) {
        setSessionExpired(true);
        setSessionActive(false);

        if (updateInterval.current) {
          clearInterval(updateInterval.current);
          updateInterval.current = null;
        }
      }
    };

    const expirationInterval = setInterval(checkSessionExpiration, 60000);
    return () => clearInterval(expirationInterval);
  }, [sessionExpired]);

  // Search filtering
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredAuctions(auctions);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = auctions.filter(
        auction =>
          auction.username.toLowerCase().includes(query) ||
          (auction.seller &&
            auction.seller.username.toLowerCase().includes(query))
      );
      setFilteredAuctions(filtered);
    }
  }, [searchQuery, auctions]);

  const broadcastUpdate = useCallback((type: string, data: any) => {
    if (broadcastChannel.current) {
      try {
        const message = {
          type,
          data: { ...data, source: 'current_tab' },
          timestamp: Date.now(),
        };

        broadcastChannel.current.postMessage(message);
      } catch (error) {
        console.error('Ошибка при отправке обновления:', error);
      }
    }
  }, []);

  const fetchAuctions = useCallback(
    async (silent = false) => {
      if (!sessionActive) return;

      try {
        if (!silent) setLoading(true);
        const response = await axios.get('/api/username/auctions');

        lastFetchTime.current = Date.now();

        const auctionsData = response.data.auctions || [];

        const activeAuctions = auctionsData.filter(
          (auction: Auction) => auction.status !== 'completed'
        );
        const completedAuctionsData = auctionsData.filter(
          (auction: Auction) => auction.status === 'completed'
        );

        setAuctions(activeAuctions);
        setFilteredAuctions(activeAuctions);
        setCompletedAuctions(completedAuctionsData);

        broadcastUpdate('auctions', response.data);
      } catch (error) {
        console.error('Error fetching auctions:', error);
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [sessionActive, broadcastUpdate]
  );

  const fetchUserAuctions = useCallback(
    async (silent = false) => {
      if (!sessionActive) return;

      try {
        const response = await axios.get('/api/username/my-auctions');

        lastFetchTime.current = Date.now();

        setUserAuctions(response.data.active_auctions || []);
        setUserBids(response.data.my_bids || []);

        const completedAuctionsData = [
          ...(response.data.completed_auctions || []),
          ...(response.data.completed_bids || []),
        ];

        setCompletedAuctions(prev => {
          const existingMap = new Map(
            prev.map(auction => [auction.id, auction])
          );

          completedAuctionsData.forEach((auction: Auction) => {
            if (!existingMap.has(auction.id)) {
              existingMap.set(auction.id, auction);
            }
          });

          return Array.from(existingMap.values());
        });

        broadcastUpdate('user_auctions', response.data);
      } catch (error) {
        console.error('Error fetching user auctions:', error);
      }
    },
    [sessionActive, broadcastUpdate]
  );

  const fetchUsernames = useCallback(
    async (silent = false) => {
      if (!sessionActive) return;

      try {
        const response = await axios.get('/api/username/purchased');

        lastFetchTime.current = Date.now();

        setUsernames(response.data.usernames || []);

        broadcastUpdate('usernames', response.data);
      } catch (error) {
        console.error('Error fetching usernames:', error);
      }
    },
    [sessionActive, broadcastUpdate]
  );

  return {
    // Data
    auctions,
    filteredAuctions,
    completedAuctions,
    userAuctions,
    userBids,
    usernames,

    // Loading states
    loading,
    detailLoading,
    loadingButtons,

    // UI states
    searchQuery,
    sessionActive,
    sessionExpired,

    // Actions
    fetchAuctions,
    fetchUserAuctions,
    fetchUsernames,
    setSearchQuery,
    setLoadingButtons,
    setDetailLoading,
    broadcastUpdate,
  };
};
