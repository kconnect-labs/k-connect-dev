export interface Comment {
  id: number;
  content: string;
  created_at: string;
  updated_at: string;
  moderator: {
    id: number;
    name: string;
    username: string;
    avatar: string;
    is_moderator: boolean;
  };
}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  closed_at?: string;
  target_type?: string;
  target_id?: number;
  public_comments_count: number;
  is_active: boolean;
  is_resolved: boolean;
  is_closed: boolean;
  comments?: Comment[];
}

export interface Pagination {
  page: number;
  per_page: number;
  total: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface Filters {
  status?: string;
  page?: number;
  per_page?: number;
}
