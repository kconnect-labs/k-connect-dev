export interface InventoryItem {
  id: number;
  item_name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  upgrade_level: number;
  is_equipped: boolean;
  image_url: string;
  background_url?: string;
  pack_name: string;
  pack_price: number;
  upgradeable: boolean;
  item_number?: number;
  total_count?: number;
  marketplace?: {
    id: number;
    status: 'active' | 'sold' | 'cancelled';
    price: number;
  } | null;
}

export interface Pack {
  id: number;
  display_name: string;
  description: string;
  price: number;
  image_path?: string;
  is_limited: boolean;
  max_quantity?: number;
  sold_quantity?: number;
  remaining_quantity?: number;
  contents?: PackContent[];
}

export interface PackContent {
  item_name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  background_url?: string;
}

export interface EquippedItem {
  item_id: number;
  item_name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  upgrade_level: number;
  image_url: string;
  background_url?: string;
  upgradeable?: boolean;
}

export interface User {
  id: number;
  username: string;
  name: string;
  photo?: string;
}

export interface PackDetails {
  pack: Pack;
  contents: PackContent[];
}

export type ItemAction =
  | 'equip'
  | 'unequip'
  | 'upgrade'
  | 'marketplace_list'
  | 'marketplace_remove';

export interface ItemUpdateEvent {
  item: InventoryItem;
  action: ItemAction;
}

export interface ItemObtainedEvent {
  detail: InventoryItem;
}
