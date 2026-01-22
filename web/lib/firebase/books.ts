import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from './config';
import { Book, Poem } from '@/types/poem';

const BOOKS_COLLECTION = 'books';
const POEMS_COLLECTION = 'poems';

/**
 * Get all published books
 */
export const getPublishedBooks = async (): Promise<Book[]> => {
  try {
    const q = query(
      collection(db, BOOKS_COLLECTION),
      where('status', '==', 'published')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Book));
  } catch (error) {
    console.error('Error fetching published books:', error);
    return [];
  }
};

/**
 * Get a single book by ID
 */
export const getBookById = async (id: string): Promise<Book | null> => {
  try {
    const docRef = doc(db, BOOKS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Book;
    }
    return null;
  } catch (error) {
    console.error('Error fetching book:', error);
    return null;
  }
};

/**
 * Get book with its associated poems
 */
export const getBookWithPoems = async (bookId: string): Promise<{ book: Book | null, poems: Poem[] }> => {
  try {
    // Get book
    const bookDoc = await getDoc(doc(db, BOOKS_COLLECTION, bookId));
    if (!bookDoc.exists()) {
      return { book: null, poems: [] };
    }
    const book = { id: bookDoc.id, ...bookDoc.data() } as Book;

    // Get poems for this book
    const poemsQuery = query(
      collection(db, POEMS_COLLECTION),
      where('bookId', '==', bookId),
      orderBy('createdAt', 'asc')
    );
    const poemsSnapshot = await getDocs(poemsQuery);
    const poems = poemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Poem));

    return { book, poems };
  } catch (error) {
    console.error('Error fetching book with poems:', error);
    return { book: null, poems: [] };
  }
};
