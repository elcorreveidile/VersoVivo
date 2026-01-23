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
  voiceUrl?: string;
  thumbnailUrl?: string;
  contentSpanish?: string;  // Traducción al español
  originalLanguage?: string; // Idioma original: 'gl' (gallego), 'en', 'fr', etc.
  bookId?: string; // Referencia opcional al libro
  createdAt: string | Date;
  updatedAt: string | Date;
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
  favoritePoems?: string[];
  readPoems?: string[];
  listenedPoems?: string[];
  watchedPoems?: string[];
  role: 'user' | 'admin';
  createdAt: string | Date; // Firestore returns string, accept both
  lastLoginAt?: string | Date;
  active?: boolean;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  coverUrl?: string;
  pdfUrl?: string; // URL del libro en PDF
  price?: number;
  purchaseSkuIos?: string;
  purchaseSkuAndroid?: string;
  currency?: 'EUR';
  status?: 'draft' | 'published' | 'archived';
  poems?: string[]; // Array of poem IDs
  inSubscription?: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  publishedAt?: string | Date;
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
  timestamp: string | Date;
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
