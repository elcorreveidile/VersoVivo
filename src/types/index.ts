/**
 * Main types and interfaces for VersoVivo
 */

// Poem Types
export interface Poem {
  id: string;
  title: string;
  author: string;
  theme: PoemTheme;
  duration: number; // in seconds
  textContent: string;
  videoUrl: string;
  musicUrl: string;
  thumbnailUrl?: string;
  createdAt: Date;
  updatedAt?: Date;
  tags?: string[];
}

export type PoemTheme =
  | 'amor'
  | 'naturaleza'
  | 'existencia'
  | 'melancolía'
  | 'esperanza'
  | 'tiempo'
  | 'soledad'
  | 'otros';

export type PoemDuration = 'corta' | 'media' | 'larga';

export interface PoemFilter {
  author?: string;
  theme?: PoemTheme;
  duration?: PoemDuration;
  searchQuery?: string;
}

// User Types
export type UserRole = 'user' | 'admin' | 'editor';

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role?: UserRole; // Required by Firestore rules
  favorites: string[]; // Array of poem IDs
  readPoems: string[]; // Array of poem IDs
  listenedPoems: string[]; // Array of poem IDs
  watchedPoems: string[]; // Array of poem IDs
  createdAt: Date;
  lastLoginAt?: Date;
  preferences?: UserPreferences;
  subscription?: UserSubscription;
  purchasedBooks?: string[]; // Array of book IDs
}

export interface UserSubscription {
  status: 'active' | 'inactive' | 'expired';
  expiresAt?: number;
  platform?: 'ios' | 'android';
  productId?: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large';
  autoplay: boolean;
  subtitles: boolean;
  notifications: boolean;
  favoriteThemes?: PoemTheme[];
}

// Authentication Types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials extends LoginCredentials {
  displayName: string;
}

// Media Player Types
export enum PlaybackMode {
  TEXT = 'text',
  VIDEO = 'video',
  MUSIC = 'music',
}

export interface PlaybackState {
  currentPoem: Poem | null;
  mode: PlaybackMode;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

// Suno AI Types
export interface MusicGenerationRequest {
  prompt: string;
  duration: number;
  style?: string;
}

export interface MusicGenerationResponse {
  musicUrl: string;
  status: 'success' | 'processing' | 'error';
  jobId?: string;
  message?: string;
}
