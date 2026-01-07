/**
 * Firebase Firestore Service
 */

import firestore from '@react-native-firebase/firestore';
import type { Poem, PoemFilter, User, UserPreferences } from '@types/index';

class FirestoreService {
  private poemsCollection = firestore().collection('poems');
  private usersCollection = firestore().collection('users');

  /**
   * Get all poems
   */
  async getAllPoems(): Promise<Poem[]> {
    try {
      const snapshot = await this.poemsCollection.orderBy('createdAt', 'desc').get();
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
      const doc = await this.poemsCollection.doc(id).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() } as Poem;
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
      let query: any = this.poemsCollection;

      if (filters.author) {
        query = query.where('author', '==', filters.author);
      }

      if (filters.theme) {
        query = query.where('theme', '==', filters.theme);
      }

      const snapshot = await query.orderBy('createdAt', 'desc').get();
      let poems = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as Poem));

      // Filter by duration (client-side)
      if (filters.duration) {
        const durationRanges = {
          corta: [0, 120], // 0-2 minutes
          media: [121, 300], // 2-5 minutes
          larga: [301, Infinity], // 5+ minutes
        };
        const [min, max] = durationRanges[filters.duration];
        poems = poems.filter(poem => poem.duration >= min && poem.duration <= max);
      }

      // Filter by search query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        poems = poems.filter(
          poem =>
            poem.title.toLowerCase().includes(query) ||
            poem.author.toLowerCase().includes(query) ||
            poem.textContent.toLowerCase().includes(query)
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
      await this.usersCollection.doc(userId).update({
        favorites: firestore.FieldValue.arrayUnion(poemId),
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
      await this.usersCollection.doc(userId).update({
        favorites: firestore.FieldValue.arrayRemove(poemId),
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
      await this.usersCollection.doc(userId).update({
        readPoems: firestore.FieldValue.arrayUnion(poemId),
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
      await this.usersCollection.doc(userId).update({
        watchedPoems: firestore.FieldValue.arrayUnion(poemId),
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
      await this.usersCollection.doc(userId).update({
        listenedPoems: firestore.FieldValue.arrayUnion(poemId),
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
      await this.usersCollection.doc(userId).update({
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
      const userDoc = await this.usersCollection.doc(userId).get();
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
