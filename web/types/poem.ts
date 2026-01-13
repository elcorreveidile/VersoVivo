export interface Poem {
  id: string;
  title: string;
  author: string;
  content: string;
  category: string;
  tags: string[];
  duration?: number;
  videoUrl?: string;
  musicUrl?: string;
  thumbnailUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PoemMode {
  type: 'text' | 'video' | 'music';
  content?: string;
  url?: string;
}

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  favoritePoems: string[];
  readPoems: string[];
  role: 'user' | 'admin';
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  coverUrl?: string;
  price: number;
  currency: 'EUR';
  status: 'draft' | 'published' | 'archived';
  poems: string[]; // Array of poem IDs
  inSubscription: boolean;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export interface ActivityLog {
  id: string;
  adminId: string;
  adminEmail: string;
  action: 'create' | 'update' | 'delete' | 'publish' | 'unpublish';
  resourceType: 'poem' | 'book' | 'user';
  resourceId: string;
  resourceTitle: string;
  changes?: Record<string, any>;
  timestamp: Date;
}

export interface AdminStats {
  totalUsers: number;
  totalPoems: number;
  totalBooks: number;
  activeUsers: number;
  topReadPoems: Array<{ id: string; title: string; reads: number }>;
  topFavoritePoems: Array<{ id: string; title: string; favorites: number }>;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
}
