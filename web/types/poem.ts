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
  createdAt: Date;
}
