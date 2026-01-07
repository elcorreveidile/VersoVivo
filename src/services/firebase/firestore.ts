/**
 * Firebase Firestore Service (Expo Compatible)
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db } from './config';
import type { Poem, PoemFilter, User, UserPreferences } from '@types';

class FirestoreService {
  private poemsCollection = collection(db, 'poems');
  private usersCollection = collection(db, 'users');

  /**
   * Get all poems
   */
  async getAllPoems(): Promise<Poem[]> {
    try {
      const q = query(this.poemsCollection, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Poem));
    } catch (error) {
      console.error('Error fetching poems:', error);
      throw new Error('Error al cargar los poemas');
    }
  }

  /**
   * Get poem by ID
   */
  async getPoemById(id: string): Promise<Poem | null> {
    try {
      const docRef = doc(db, 'poems', id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return null;
      return { id: docSnap.id, ...docSnap.data() } as Poem;
    } catch (error) {
      console.error('Error fetching poem:', error);
      throw new Error('Error al cargar el poema');
    }
  }

  /**
   * Get poems with filters
   */
  async getFilteredPoems(filters: PoemFilter): Promise<Poem[]> {
    try {
      let q = query(this.poemsCollection);

      if (filters.author) {
        q = query(q, where('author', '==', filters.author));
      }

      if (filters.theme) {
        q = query(q, where('theme', '==', filters.theme));
      }

      q = query(q, orderBy('createdAt', 'desc'));

      const snapshot = await getDocs(q);
      let poems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Poem));

      // Filter by duration (client-side)
      if (filters.duration) {
        const durationRanges = {
          corta: [0, 120],
          media: [121, 300],
          larga: [301, Infinity],
        };
        const [min, max] = durationRanges[filters.duration];
        poems = poems.filter(poem => poem.duration >= min && poem.duration <= max);
      }

      // Filter by search query
      if (filters.searchQuery) {
        const searchQuery = filters.searchQuery.toLowerCase();
        poems = poems.filter(
          poem =>
            poem.title.toLowerCase().includes(searchQuery) ||
            poem.author.toLowerCase().includes(searchQuery) ||
            poem.textContent.toLowerCase().includes(searchQuery)
        );
      }

      return poems;
    } catch (error) {
      console.error('Error filtering poems:', error);
      throw new Error('Error al filtrar los poemas');
    }
  }

  /**
   * Add poem to favorites
   */
  async addToFavorites(userId: string, poemId: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        favorites: arrayUnion(poemId),
      });
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw new Error('Error al agregar a favoritos');
    }
  }

  /**
   * Remove poem from favorites
   */
  async removeFromFavorites(userId: string, poemId: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        favorites: arrayRemove(poemId),
      });
    } catch (error) {
      console.error('Error removing from favorites:', error);
      throw new Error('Error al eliminar de favoritos');
    }
  }

  /**
   * Mark poem as read
   */
  async markAsRead(userId: string, poemId: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        readPoems: arrayUnion(poemId),
      });
    } catch (error) {
      console.error('Error marking as read:', error);
      throw new Error('Error al marcar como leído');
    }
  }

  /**
   * Mark poem as watched
   */
  async markAsWatched(userId: string, poemId: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        watchedPoems: arrayUnion(poemId),
      });
    } catch (error) {
      console.error('Error marking as watched:', error);
      throw new Error('Error al marcar como visto');
    }
  }

  /**
   * Mark poem as listened
   */
  async markAsListened(userId: string, poemId: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        listenedPoems: arrayUnion(poemId),
      });
    } catch (error) {
      console.error('Error marking as listened:', error);
      throw new Error('Error al marcar como escuchado');
    }
  }

  /**
   * Update user preferences
   */
  async updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        preferences: preferences,
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw new Error('Error al actualizar preferencias');
    }
  }

  /**
   * Get user favorites
   */
  async getUserFavorites(userId: string): Promise<Poem[]> {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data() as User;

      if (!userData.favorites || userData.favorites.length === 0) {
        return [];
      }

      const poems = await Promise.all(
        userData.favorites.map(poemId => this.getPoemById(poemId))
      );

      return poems.filter(poem => poem !== null) as Poem[];
    } catch (error) {
      console.error('Error fetching favorites:', error);
      throw new Error('Error al cargar favoritos');
    }
  }
}

export default new FirestoreService();
