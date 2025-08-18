export type TimePeriod = 'week' | 'month' | 'all_time';

export interface DateRange {
  start: string;
  end: string;
}

export interface Achievement {
  bage: string;
  color_upgrade: string | null;
  image_path: string;
  upgrade: string | null;
}

export interface Decoration {
  background: string;
  item_path: string;
}

export interface Verification {
  status: number;
}

export interface UserStats {
  followers_count: number;
  posts_count: number;
}

export interface LeaderboardUser {
  id: number;
  name: string;
  username: string;
  photo: string | null;
  avatar_url: string | null;
  score: number;
  achievement: Achievement | null;
  decoration: Decoration | null;
  verification: Verification | null;
  stats: UserStats;
}

export interface CurrentUser {
  position: number;
  score: number;
}

export interface LeaderboardResponse {
  success: boolean;
  leaderboard: LeaderboardUser[];
  current_user: CurrentUser;
  date_range?: DateRange;
  time_period: TimePeriod;
}
