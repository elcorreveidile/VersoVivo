import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
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
    console.log('📚 [getPublishedBooks] Buscando libros publicados...');
    const q = query(
      collection(db, BOOKS_COLLECTION),
      where('status', '==', 'published')
    );
    const snapshot = await getDocs(q);
    console.log(`📚 [getPublishedBooks] Encontrados ${snapshot.size} libros publicados`);

    const books = snapshot.docs.map(doc => {
      const book = { id: doc.id, ...doc.data() } as Book;
      console.log(`📚 Libro: "${book.title}" - status: ${book.status}`);
      return book;
    });

    return books;
  } catch (error) {
    console.error('❌ [getPublishedBooks] Error:', error);
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
    console.log('📚 [getBookWithPoems] Buscando libro:', bookId);

    // Get book
    const bookDoc = await getDoc(doc(db, BOOKS_COLLECTION, bookId));
    if (!bookDoc.exists()) {
      console.error('❌ [getBookWithPoems] Libro no encontrado:', bookId);
      return { book: null, poems: [] };
    }
    const book = { id: bookDoc.id, ...bookDoc.data() } as Book;
    console.log(`✅ [getBookWithPoems] Libro encontrado: "${book.title}"`);

    // Get poems for this book - sin orderBy para evitar error de índice
    const poemsQuery = query(
      collection(db, POEMS_COLLECTION),
      where('bookId', '==', bookId)
    );
    const poemsSnapshot = await getDocs(poemsQuery);
    let poems = poemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Poem));

    // Ordenar por createdAt en cliente
    poems.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateA - dateB;
    });

    console.log(`📚 [getBookWithPoems] ${poems.length} poemas encontrados`);

    return { book, poems };
  } catch (error) {
    console.error('❌ [getBookWithPoems] Error:', error);
    return { book: null, poems: [] };
  }
};
