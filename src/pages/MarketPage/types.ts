// Типы для маркетплейса

export interface MarketplaceListing {
  id: number;
  seller_id: number;
  seller_name: string;
  price: number;
  listed_at: string;
  status: 'active' | 'sold' | 'cancelled';
  sold_at?: string;
  buyer_id?: number;
  buyer_name?: string;
  item: MarketplaceItem;
}

export interface MarketplaceItem {
  id: number;
  item_name: string;
  pack_name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  upgrade_level: number;
  image_url: string;
  background_url?: string;
  background_id?: number;
  upgradeable: boolean | string;
  item_number?: number;
  total_count?: number;
}

export interface MarketplaceSeller {
  id: number;
  username: string;
  name: string;
  photo?: string;
}

export interface MarketplaceFilters {
  pack_id?: number;
  item_name?: string;
}

export interface MarketplaceState {
  listings: MarketplaceListing[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
  filters: MarketplaceFilters;
}

export interface MarketplacePagination {
  page: number;
  per_page: number;
  total: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
  next_num?: number;
  prev_num?: number;
}

export interface MarketplaceResponse {
  success: boolean;
  listings: MarketplaceListing[];
  pagination: MarketplacePagination;
  message?: string;
}
