import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  updateDoc,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from './config';
import { Poem } from '@/types/poem';

const POEMS_COLLECTION = 'poems';
const USERS_COLLECTION = 'users';

export const getFeaturedPoems = async (count: number = 6): Promise<Poem[]> => {
  try {
    const q = query(
      collection(db, POEMS_COLLECTION),
      orderBy('createdAt', 'desc'),
      limit(count)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Poem));
  } catch (error) {
    console.error('Error fetching featured poems:', error);
    return [];
  }
};

export const getAllPoems = async (): Promise<Poem[]> => {
  try {
    const snapshot = await getDocs(collection(db, POEMS_COLLECTION));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Poem));
  } catch (error) {
    console.error('Error fetching poems:', error);
    return [];
  }
};

export const getPoemById = async (id: string): Promise<Poem | null> => {
  try {
    const docRef = doc(db, POEMS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Poem;
    }
    return null;
  } catch (error) {
    console.error('Error fetching poem:', error);
    return null;
  }
};

export const searchPoems = async (searchTerm: string): Promise<Poem[]> => {
  try {
    const allPoems = await getAllPoems();
    const lowerTerm = searchTerm.toLowerCase();
    return allPoems.filter(poem =>
      poem.title.toLowerCase().includes(lowerTerm) ||
      poem.author.toLowerCase().includes(lowerTerm) ||
      poem.tags.some(tag => tag.toLowerCase().includes(lowerTerm))
    );
  } catch (error) {
    console.error('Error searching poems:', error);
    return [];
  }
};

export const addToFavorites = async (userId: string, poemId: string) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      favoritePoems: arrayUnion(poemId)
    });
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const removeFromFavorites = async (userId: string, poemId: string) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      favoritePoems: arrayRemove(poemId)
    });
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const markAsRead = async (userId: string, poemId: string) => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      readPoems: arrayUnion(poemId)
    });
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const isPoemFavorite = async (userId: string, poemId: string): Promise<boolean> => {
  try {
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
    if (!userDoc.exists()) {
      return false;
    }
    const favoritePoems = userDoc.data().favoritePoems || [];
    return favoritePoems.includes(poemId);
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return false;
  }
};
