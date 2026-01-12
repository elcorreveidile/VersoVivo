import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './config';
import { User } from '@/types/poem';
import { Poem } from '@/types/poem';
import { getPoemById } from './poems';

const USERS_COLLECTION = 'users';

export const getUserProfile = async (userId: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
    if (userDoc.exists()) {
      return userDoc.data() as User;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

export const getUserFavorites = async (userId: string): Promise<Poem[]> => {
  try {
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
    if (!userDoc.exists()) {
      return [];
    }

    const favoriteIds = userDoc.data().favoritePoems || [];
    const poems = await Promise.all(
      favoriteIds.map((id: string) => getPoemById(id))
    );

    return poems.filter((poem): poem is Poem => poem !== null);
  } catch (error) {
    console.error('Error fetching user favorites:', error);
    return [];
  }
};

export const getUserReadPoems = async (userId: string): Promise<Poem[]> => {
  try {
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
    if (!userDoc.exists()) {
      return [];
    }

    const readPoemIds = userDoc.data().readPoems || [];
    const poems = await Promise.all(
      readPoemIds.map((id: string) => getPoemById(id))
    );

    return poems.filter((poem): poem is Poem => poem !== null);
  } catch (error) {
    console.error('Error fetching read poems:', error);
    return [];
  }
};

export const updateUserProfile = async (
  userId: string,
  data: { displayName?: string; photoURL?: string }
): Promise<{ error: string | null }> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, data);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};
