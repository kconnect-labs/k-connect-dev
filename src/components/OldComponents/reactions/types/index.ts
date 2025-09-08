// Типы для системы реакций (архивные)
export type ReactionEmoji = '🔥' | '❤️' | '😂' | '😮' | '��';

export interface ReactionUser {
  id: number;
  name: string;
  username: string;
  photo: string;
  timestamp: string;
}

export interface ReactionDetail {
  emoji: ReactionEmoji;
  count: number;
  users: ReactionUser[];
}

export type ReactionsSummary = Partial<Record<ReactionEmoji, number>>;

export interface PostReactions {
  reactions_summary: ReactionsSummary;
  reactions_detail: ReactionDetail[];
  user_reaction: ReactionEmoji | null;
}
