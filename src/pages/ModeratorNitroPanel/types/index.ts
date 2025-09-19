// Типы для ModeratorNitroPanel
import React from 'react';

export interface User {
  id: number;
  name: string;
  username: string;
  email?: string;
  photo?: string;
  avatar_url?: string;
  about?: string;
  is_banned: boolean;
  verification_level?: number;
  followers_count: number;
  following_count: number;
}

export interface Verification {
  user_id: number;
  status: number;
  verification_date: string;
}

export interface Achievement {
  id: number;
  bage: string;
  display_name: string;
  image_path: string;
  is_active: boolean;
  date_awarded?: string;
  description?: string;
  upgrade?: string;
  color_upgrade?: string;
}

export interface BadgeType {
  id: number;
  name: string;
  display_name: string;
  image_path: string;
  description: string;
  users_count: number;
}

export interface Subscription {
  id: number;
  subscription_type: string;
  subscription_date: string;
  expiration_date?: string;
  is_active: boolean;
  formatted_date?: string;
}

export interface SubscriptionType {
  id: string;
  name: string;
  description: string;
  duration_days: number;
  features: string[];
  users_count?: number;
}

export interface RedemptionKey {
  id: number;
  key: string;
  key_type: 'points' | 'mcoin' | 'subscription';
  points_value?: number;
  mcoin_amount?: number;
  subscription_type?: string;
  max_uses: number;
  current_uses: number;
  is_active: boolean;
  is_valid: boolean;
  created_at: string;
  expires_at?: string;
  description?: string;
}

export interface BugReport {
  id: number;
  user_id: number;
  subject: string;
  text: string;
  date: string;
  site_link?: string;
  status: 'open' | 'in_progress' | 'resolved';
  solver_type: 'moderator' | 'developer';
  status_changed_date?: string;
  image_name?: string;
  tags?: string;
  user?: {
    id: number;
    name: string;
    username: string;
    photo?: string;
    avatar_url?: string;
  };
}

export interface Post {
  id: number;
  user_id: number;
  content?: string;
  timestamp: string;
  image?: string;
  video?: string;
  music?: string;
  views_count: number;
  type: string;
  recipient_id?: number;
  original_post_id?: number;
  is_nsfw: boolean;
  fact_id?: number;
  user?: {
    id: number;
    name: string;
    username: string;
    photo?: string;
    avatar_url?: string;
  };
  recipient?: {
    id: number;
    name: string;
    username: string;
    photo?: string;
    avatar_url?: string;
  };
  original_post?: Post;
  likes_count?: number;
  comments_count?: number;
  reposts_count?: number;
}

export interface Comment {
  id: number;
  content?: string;
  timestamp: string;
  post_id: number;
  user_id: number;
  image?: string;
  is_deleted: boolean;
  user?: {
    id: number;
    name: string;
    username: string;
    photo?: string;
    avatar_url?: string;
  };
  replies?: Reply[];
  likes_count?: number;
  replies_count?: number;
}

export interface Reply {
  id: number;
  content?: string;
  timestamp: string;
  comment_id: number;
  user_id: number;
  parent_reply_id?: number;
  is_deleted: boolean;
  image?: string;
  user?: {
    id: number;
    name: string;
    username: string;
    photo?: string;
    avatar_url?: string;
  };
  parent_reply?: Reply;
  likes_count?: number;
}

export interface ShopBadge {
  id: number;
  creator_id: number;
  name: string;
  description?: string;
  image_path: string;
  image_hash: string;
  price: number;
  royalty_percentage: number;
  max_copies?: number;
  copies_sold: number;
  created_at: string;
  is_active: boolean;
  upgrade?: string;
  color_upgrade?: string;
  creator?: {
    id: number;
    name: string;
    username: string;
    photo?: string;
    avatar_url?: string;
  };
}

export interface ModeratorPermission {
  user_id: number;
  delete_posts: boolean;
  delete_music: boolean;
  delete_comments: boolean;
  delete_avatar: boolean;
  change_user_name: boolean;
  change_username: boolean;
  manage_bug_reports: boolean;
  delete_bug_reports: boolean;
  edit_badges: boolean;
  delete_badges: boolean;
  manage_artists: boolean;
  delete_artists: boolean;
  can_generate_keys: boolean;
  verify_users: boolean;
  assign_moderators: boolean;
}

export interface ApiResponse<T> {
  success?: boolean;
  error?: string;
  message?: string;
  data?: T;
}

export interface PaginationResponse<T> {
  [key: string]: T[] | number | boolean;
  total: number;
  pages: number;
  page: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface Track {
  id: number;
  title: string;
  artist: string;
  album?: string;
  duration?: number;
  genre?: string;
  description?: string;
  plays_count: number;
  likes_count: number;
  verified: boolean;
  created_at: string;
  file_path?: string;
  cover_path?: string;
  user?: {
    id: number;
    name: string;
    username?: string;
    photo?: string;
    avatar_url?: string;
  };
  lyrics?: string;
  lyrics_length: number;
  description_length: number;
  is_suspicious: boolean;
  suspicious_reasons?: string[];
  has_synced_lyrics: boolean;
}

export interface Artist {
  id: number;
  name: string;
  bio?: string;
  avatar_url?: string;
  verified: boolean;
  user_id?: number | null;
  created_at: string;
  tracks_count?: number;
  api_source?: string | null;
  bound_user?: {
    id: number;
    name: string;
    username: string;
    avatar_url?: string;
  } | null;
}

export interface User {
  id: number;
  username: string;
  name: string;
  email?: string;
  status?: number;
  verification_level?: number;
  verified?: boolean;
  created_at: string;
  last_seen?: string;
  avatar_url?: string;
  photo?: string;
  about?: string;
  bio?: string;
  followers_count: number;
  following_count: number;
  posts_count?: number;
  warnings_count?: number;
  is_banned: boolean;
  ban_reason?: string;
  ban_expires_at?: string;
}

export interface Warning {
  id: number;
  reason: string;
  details?: string;
  admin_name: string;
  admin_username: string;
  created_at: string;
  is_active: boolean;
}

export interface Ban {
  id: number;
  reason: string;
  details?: string;
  admin_name: string;
  admin_username: string;
  start_date: string;
  end_date: string;
  formatted_end_date: string;
  is_active: boolean;
  is_auto_ban: boolean;
  is_expired: boolean;
  remaining_days: number;
}

export type TabValue = 'profile' | 'verification' | 'achievements' | 'subscriptions' | 'moderators' | 'keys' | 'bugreports' | 'posts' | 'comments' | 'badges' | 'tracks' | 'artists' | 'users' | 'statistics' | 'logs';

export interface TabConfig {
  value: TabValue;
  label: string;
  icon: React.ReactElement;
  adminOnly?: boolean;
}
