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
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';
import type {
  InvitationAvailability,
  InvitationContactType,
  InvitationReservation,
  Poem,
  PoemFilter,
  User,
  UserPreferences,
} from '@types';

class FirestoreService {
  private poemsCollection = collection(db, 'poems');
  private usersCollection = collection(db, 'users');
  private invitationReservationsCollection = collection(db, 'invitationReservations');
  private invitationMetaDoc = doc(db, 'invitationMeta', 'summary');

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

  /**
   * Get invitation availability summary
   */
  async getInvitationAvailability(): Promise<InvitationAvailability> {
    try {
      const snapshot = await getDoc(this.invitationMetaDoc);
      if (!snapshot.exists()) {
        return { remaining: 10, total: 10 };
      }

      const data = snapshot.data();
      const total = typeof data.total === 'number' ? data.total : 10;
      const remaining =
        typeof data.remaining === 'number' ? data.remaining : total;

      return { remaining, total };
    } catch (error) {
      console.error('Error fetching invitation availability:', error);
      throw new Error('Error al cargar disponibilidad de invitaciones');
    }
  }

  /**
   * Reserve an invitation
   */
  async reserveInvitation(
    contact: string,
    contactType: InvitationContactType
  ): Promise<{ reservationId: string; remaining: number; total: number }> {
    try {
      return await runTransaction(db, async transaction => {
        const metaSnapshot = await transaction.get(this.invitationMetaDoc);

        let total = 10;
        let remaining = 10;

        if (metaSnapshot.exists()) {
          const data = metaSnapshot.data();
          total = typeof data.total === 'number' ? data.total : total;
          remaining =
            typeof data.remaining === 'number' ? data.remaining : total;
        }

        if (remaining <= 0) {
          throw new Error('No quedan invitaciones');
        }

        const reservationRef = doc(this.invitationReservationsCollection);

        transaction.set(reservationRef, {
          contact,
          contactType,
          createdAt: serverTimestamp(),
        });

        transaction.set(
          this.invitationMetaDoc,
          {
            total,
            remaining: remaining - 1,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );

        return {
          reservationId: reservationRef.id,
          remaining: remaining - 1,
          total,
        };
      });
    } catch (error) {
      console.error('Error reserving invitation:', error);
      throw new Error('No quedan invitaciones disponibles');
    }
  }

  /**
   * Get all invitation reservations
   */
  async getInvitationReservations(): Promise<InvitationReservation[]> {
    try {
      const q = query(this.invitationReservationsCollection, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);

      return snapshot.docs.map(docSnapshot => {
        const data = docSnapshot.data();
        const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : null;

        return {
          id: docSnapshot.id,
          contact: data.contact,
          contactType: data.contactType,
          createdAt,
        } as InvitationReservation;
      });
    } catch (error) {
      console.error('Error fetching invitation reservations:', error);
      throw new Error('Error al cargar reservas de invitaciones');
    }
  }
}

export default new FirestoreService();
