export interface LeaderboardUser {
  id: number;
  name: string;
  username: string;
  score: number;
  avatar_url?: string;
  verification?: {
    status: string;
  };
  achievement?: {
    bage: string;
    image_path: string;
  };
  decoration?: {
    background?: string;
    item_path?: string;
  };
  subscription?: {
    type?: string;
    subscription_type?: string;
  };
  subscription_type?: string;
}

export interface LeaderboardResponse {
  success: boolean;
  leaderboard: LeaderboardUser[];
  current_user: {
    position: number;
    score: number;
  };
  date_range?: {
    start: string;
    end: string;
  };
}

export interface LeaderboardUserCardProps {
  user: LeaderboardUser;
  position: number;
  index: number;
  onCardClick?: (user: LeaderboardUser) => void;
}

export type TimePeriod = 'week' | 'month' | 'all_time';

export interface DateRange {
  start: string;
  end: string;
} 