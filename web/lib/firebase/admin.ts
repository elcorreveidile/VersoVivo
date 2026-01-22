import { doc, getDoc, getDocs, collection, setDoc, updateDoc, addDoc, deleteDoc, query, where, orderBy, limit, startAfter, getDocsFromCache, QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from './config';
import { User, Book, ActivityLog, AdminStats, Poem } from '@/types/poem';

const USERS_COLLECTION = 'users';
const POEMS_COLLECTION = 'poems';
const BOOKS_COLLECTION = 'books';

// Helper function to safely convert Firestore Timestamps to Dates
const toDate = (timestamp: any): Date | null => {
  if (!timestamp) return null;

  // If it's already a Date, return it
  if (timestamp instanceof Date) {
    return timestamp;
  }

  // If it has toDate() method (Firestore Timestamp), call it
  if (typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }

  // If it's a string or number, try to create a Date
  if (typeof timestamp === 'string' || typeof timestamp === 'number') {
    const date = new Date(timestamp);
    return isNaN(date.getTime()) ? null : date;
  }

  return null;
};
const ACTIVITY_LOG_COLLECTION = 'activityLog';

// ============================================
// PAGINATION HELPERS
// ============================================

export interface PaginatedResult<T> {
  items: T[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  hasMore: boolean;
}

const calculateTotalPages = (totalItems: number, itemsPerPage: number): number => {
  return Math.ceil(totalItems / itemsPerPage);
};

// ============================================
// ADMIN VERIFICATION
// ============================================

export const isAdmin = async (userId: string): Promise<boolean> => {
  try {
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
    if (!userDoc.exists()) return false;

    const user = userDoc.data() as User;
    return user.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

export const getUserRole = async (userId: string): Promise<'user' | 'admin'> => {
  try {
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
    if (!userDoc.exists()) return 'user';

    const user = userDoc.data() as User;
    return user.role || 'user';
  } catch (error) {
    console.error('Error getting user role:', error);
    return 'user';
  }
};

// ============================================
// STATISTICS
// ============================================

export const getAdminStats = async (): Promise<AdminStats> => {
  try {
    console.log('📊 [getAdminStats] Iniciando cálculo de estadísticas...');

    // Get total users
    const usersSnapshot = await getDocs(collection(db, USERS_COLLECTION));
    const totalUsers = usersSnapshot.size;
    console.log(`📊 [getAdminStats] Total usuarios: ${totalUsers}`);

    // Get total poems
    const poemsSnapshot = await getDocs(collection(db, POEMS_COLLECTION));
    const totalPoems = poemsSnapshot.size;
    console.log(`📊 [getAdminStats] Total poemas: ${totalPoems}`);

    // Get total books
    const booksSnapshot = await getDocs(collection(db, BOOKS_COLLECTION));
    const totalBooks = booksSnapshot.size;
    console.log(`📊 [getAdminStats] Total libros: ${totalBooks}`);

    // Get active users (logged in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const activeUsers = usersSnapshot.docs.filter(doc => {
      const lastLogin = toDate(doc.data().lastLoginAt);
      return lastLogin && lastLogin > sevenDaysAgo;
    }).length;
    console.log(`📊 [getAdminStats] Usuarios activos (7 días): ${activeUsers}`);

    // Get all poems data
    const allPoems = poemsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Array<Poem & { id: string }>;

    // Get all users data for calculating read/favorite counts
    const allUsers = usersSnapshot.docs.map(doc => doc.data() as User);

    // Calculate top read poems from user readPoems arrays
    const poemReadCounts = new Map<string, number>();
    allUsers.forEach(user => {
      if (user.readPoems) {
        user.readPoems.forEach(poemId => {
          const current = poemReadCounts.get(poemId) || 0;
          poemReadCounts.set(poemId, current + 1);
        });
      }
    });

    const topReadPoems = allPoems
      .map(poem => ({
        id: poem.id,
        title: poem.title,
        reads: poemReadCounts.get(poem.id) || 0
      }))
      .sort((a, b) => b.reads - a.reads)
      .slice(0, 10)
      .filter(p => p.reads > 0);
    console.log(`📊 [getAdminStats] Poemas más leídos: ${topReadPoems.length}`);

    // Calculate top favorite poems from user favoritePoems arrays
    const poemFavoriteCounts = new Map<string, number>();
    allUsers.forEach(user => {
      if (user.favoritePoems) {
        user.favoritePoems.forEach(poemId => {
          const current = poemFavoriteCounts.get(poemId) || 0;
          poemFavoriteCounts.set(poemId, current + 1);
        });
      }
    });

    const topFavoritePoems = allPoems
      .map(poem => ({
        id: poem.id,
        title: poem.title,
        favorites: poemFavoriteCounts.get(poem.id) || 0
      }))
      .sort((a, b) => b.favorites - a.favorites)
      .slice(0, 10)
      .filter(p => p.favorites > 0);
    console.log(`📊 [getAdminStats] Poemas más favoritos: ${topFavoritePoems.length}`);

    // Get new users this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const newUsersThisWeek = usersSnapshot.docs.filter(doc => {
      const createdAt = toDate(doc.data().createdAt);
      return createdAt && createdAt > weekAgo;
    }).length;

    // Get new users this month
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    const newUsersThisMonth = usersSnapshot.docs.filter(doc => {
      const createdAt = toDate(doc.data().createdAt);
      return createdAt && createdAt > monthAgo;
    }).length;

    return {
      totalUsers,
      totalPoems,
      totalBooks,
      activeUsers,
      topReadPoems,
      topFavoritePoems,
      newUsersThisWeek,
      newUsersThisMonth
    };
  } catch (error) {
    console.error('❌ [getAdminStats] Error al calcular estadísticas:', error);
    console.error('❌ [getAdminStats] Detalles del error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error
    });
    return {
      totalUsers: 0,
      totalPoems: 0,
      totalBooks: 0,
      activeUsers: 0,
      topReadPoems: [],
      topFavoritePoems: [],
      newUsersThisWeek: 0,
      newUsersThisMonth: 0
    };
  }
};

// ============================================
// BOOKS MANAGEMENT
// ============================================

export const getAllBooks = async (): Promise<Book[]> => {
  try {
    const snapshot = await getDocs(collection(db, BOOKS_COLLECTION));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Book));
  } catch (error) {
    console.error('Error fetching books:', error);
    return [];
  }
};

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
      where('bookId', '==', bookId)
    );
    const poemsSnapshot = await getDocs(poemsQuery);
    const poems = poemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Poem));

    return { book, poems };
  } catch (error) {
    console.error('Error fetching book with poems:', error);
    return { book: null, poems: [] };
  }
};

export const getBooksPaginated = async (
  page: number = 1,
  itemsPerPage: number = 12,
  lastDoc?: QueryDocumentSnapshot
): Promise<PaginatedResult<Book>> => {
  try {
    // Get total count
    const allSnapshot = await getDocs(collection(db, BOOKS_COLLECTION));
    const totalItems = allSnapshot.size;

    // Build query with pagination
    let q = query(
      collection(db, BOOKS_COLLECTION),
      orderBy('createdAt', 'desc'),
      limit(itemsPerPage)
    );

    // If we have a last document, start after it
    if (lastDoc) {
      q = query(
        collection(db, BOOKS_COLLECTION),
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(itemsPerPage)
      );
    }

    const snapshot = await getDocs(q);
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Book));

    const totalPages = calculateTotalPages(totalItems, itemsPerPage);
    const hasMore = page < totalPages;

    return {
      items,
      totalItems,
      currentPage: page,
      totalPages,
      itemsPerPage,
      hasMore,
    };
  } catch (error) {
    console.error('Error fetching books paginated:', error);
    return {
      items: [],
      totalItems: 0,
      currentPage: page,
      totalPages: 0,
      itemsPerPage,
      hasMore: false,
    };
  }
};

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

export const createBook = async (book: Omit<Book, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; bookId?: string; error?: string }> => {
  try {
    const booksRef = collection(db, BOOKS_COLLECTION);
    // Limpiar campos undefined antes de enviar
    const cleanedBook = removeUndefinedFields(book);
    const newBookRef = await addDoc(booksRef, {
      ...cleanedBook,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return { success: true, bookId: newBookRef.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const updateBook = async (bookId: string, book: Partial<Book>): Promise<{ success: boolean; error?: string }> => {
  try {
    const bookRef = doc(db, BOOKS_COLLECTION, bookId);
    // Limpiar campos undefined antes de enviar
    const cleanedBook = removeUndefinedFields(book);
    await updateDoc(bookRef, {
      ...cleanedBook,
      updatedAt: new Date()
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const deleteBook = async (bookId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const bookRef = doc(db, BOOKS_COLLECTION, bookId);
    await deleteDoc(bookRef);

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// ============================================
// ACTIVITY LOG
// ============================================

export const logActivity = async (log: Omit<ActivityLog, 'id' | 'timestamp'>): Promise<void> => {
  try {
    const logsRef = collection(db, ACTIVITY_LOG_COLLECTION);
    await addDoc(logsRef, {
      ...log,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

// ============================================
// POEMS MANAGEMENT
// ============================================

export const getAllPoemsForAdmin = async (): Promise<Poem[]> => {
  try {
    const snapshot = await getDocs(query(collection(db, POEMS_COLLECTION), orderBy('createdAt', 'desc')));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Poem));
  } catch (error) {
    console.error('Error fetching poems:', error);
    return [];
  }
};

export const getPoemsPaginated = async (
  page: number = 1,
  itemsPerPage: number = 12,
  lastDoc?: QueryDocumentSnapshot
): Promise<PaginatedResult<Poem>> => {
  try {
    // Get total count
    const allSnapshot = await getDocs(collection(db, POEMS_COLLECTION));
    const totalItems = allSnapshot.size;

    // Build query with pagination
    let q = query(
      collection(db, POEMS_COLLECTION),
      orderBy('createdAt', 'desc'),
      limit(itemsPerPage)
    );

    // If we have a last document, start after it
    if (lastDoc) {
      q = query(
        collection(db, POEMS_COLLECTION),
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(itemsPerPage)
      );
    }

    const snapshot = await getDocs(q);
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Poem));

    const totalPages = calculateTotalPages(totalItems, itemsPerPage);
    const hasMore = page < totalPages;

    return {
      items,
      totalItems,
      currentPage: page,
      totalPages,
      itemsPerPage,
      hasMore,
    };
  } catch (error) {
    console.error('Error fetching poems paginated:', error);
    return {
      items: [],
      totalItems: 0,
      currentPage: page,
      totalPages: 0,
      itemsPerPage,
      hasMore: false,
    };
  }
};

export const getPoemByIdForAdmin = async (id: string): Promise<Poem | null> => {
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

// Helper function para remover campos undefined de un objeto
const removeUndefinedFields = <T extends Record<string, unknown>>(obj: T): Partial<T> => {
  const cleaned: Record<string, unknown> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      // Solo incluir si el valor NO es undefined
      // Permitir null, strings vacíos, y otros valores falsy
      if (value !== undefined) {
        cleaned[key] = value;
      }
    }
  }
  return cleaned as Partial<T>;
};

export const createPoem = async (poem: Omit<Poem, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; poemId?: string; error?: string }> => {
  try {
    const poemsRef = collection(db, POEMS_COLLECTION);
    // Limpiar campos undefined antes de enviar
    const cleanedPoem = removeUndefinedFields(poem);
    const newPoemRef = await addDoc(poemsRef, {
      ...cleanedPoem,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // NOTA: Ya no sincronizamos el array poems del libro
    // Usar solo Poem.bookId para la relación

    return { success: true, poemId: newPoemRef.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const updatePoem = async (poemId: string, poem: Partial<Poem>): Promise<{ success: boolean; error?: string }> => {
  try {
    const poemRef = doc(db, POEMS_COLLECTION, poemId);

    // DEBUG: Log what we're receiving
    console.log('📝 updatePoem called with:', { poemId, poem });
    console.log('📝 Title in poem object:', poem.title);
    console.log('📝 All keys in poem:', Object.keys(poem));

    // Build update object - only include fields that have actual values
    const updateData: Record<string, any> = {};

    // Required fields - include if present and not empty
    if (poem.title !== undefined && poem.title.trim() !== '') {
      updateData.title = poem.title.trim();
    }
    if (poem.author !== undefined && poem.author.trim() !== '') {
      updateData.author = poem.author.trim();
    }
    if (poem.content !== undefined && poem.content.trim() !== '') {
      updateData.content = poem.content.trim();
    }

    // Optional fields - include if present and not empty
    if (poem.category !== undefined && poem.category.trim() !== '') {
      updateData.category = poem.category.trim();
    }
    if (poem.tags !== undefined) {
      updateData.tags = poem.tags;
    }
    if (poem.videoUrl !== undefined && poem.videoUrl.trim() !== '') {
      updateData.videoUrl = poem.videoUrl.trim();
    }
    if (poem.musicUrl !== undefined && poem.musicUrl.trim() !== '') {
      updateData.musicUrl = poem.musicUrl.trim();
    }
    if (poem.voiceUrl !== undefined && poem.voiceUrl.trim() !== '') {
      updateData.voiceUrl = poem.voiceUrl.trim();
    }
    if (poem.thumbnailUrl !== undefined && poem.thumbnailUrl.trim() !== '') {
      updateData.thumbnailUrl = poem.thumbnailUrl.trim();
    }
    if (poem.bookId !== undefined && poem.bookId.trim() !== '') {
      updateData.bookId = poem.bookId.trim();
    }
    if (poem.contentSpanish !== undefined && poem.contentSpanish.trim() !== '') {
      updateData.contentSpanish = poem.contentSpanish.trim();
    }
    if (poem.originalLanguage !== undefined && poem.originalLanguage.trim() !== '') {
      updateData.originalLanguage = poem.originalLanguage.trim();
    }

    // Always update timestamp
    updateData.updatedAt = new Date();

    // DEBUG: Log what we're sending to Firestore
    console.log('📝 Final updateData:', updateData);
    console.log('📝 Title in updateData:', updateData.title);
    console.log('📝 All keys in updateData:', Object.keys(updateData));

    if (Object.keys(updateData).length <= 1) {
      // Only updatedAt, nothing else to update
      console.warn('⚠️ No fields to update besides timestamp');
      return { success: false, error: 'No hay campos para actualizar' };
    }

    await updateDoc(poemRef, updateData);

    console.log('✅ updateDoc completed successfully');

    return { success: true };
  } catch (error: any) {
    console.error('❌ updatePoem error:', error);
    return { success: false, error: error.message };
  }
};

export const deletePoem = async (poemId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const poemRef = doc(db, POEMS_COLLECTION, poemId);

    // NOTA: Ya no sincronizamos el array poems del libro
    // Solo eliminamos el poema

    await deleteDoc(poemRef);

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getActivityLogs = async (limitCount: number = 100): Promise<ActivityLog[]> => {
  try {
    const q = query(
      collection(db, ACTIVITY_LOG_COLLECTION),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ActivityLog));
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return [];
  }
};

// ============================================
// USER MANAGEMENT
// ============================================

export const getAllUsers = async (): Promise<User[]> => {
  try {
    const snapshot = await getDocs(collection(db, USERS_COLLECTION));
    return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as User));
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

export const updateUserRole = async (userId: string, role: 'user' | 'admin'): Promise<{ success: boolean; error?: string }> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, { role });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const deactivateUser = async (userId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, { active: false });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// ============================================
// IMPORT/EXPORT
// ============================================

export const exportPoemsToJSON = async (): Promise<string> => {
  try {
    const poems = await getAllPoemsForAdmin();
    const exportData = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      count: poems.length,
      data: poems
    };
    return JSON.stringify(exportData, null, 2);
  } catch (error: any) {
    throw new Error(error.message || 'Error al exportar poemas');
  }
};

export const exportBooksToJSON = async (): Promise<string> => {
  try {
    const books = await getAllBooks();
    const exportData = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      count: books.length,
      data: books
    };
    return JSON.stringify(exportData, null, 2);
  } catch (error: any) {
    throw new Error(error.message || 'Error al exportar libros');
  }
};

export const exportAllData = async (): Promise<{ poems: Poem[]; books: Book[] }> => {
  try {
    const [poems, books] = await Promise.all([
      getAllPoemsForAdmin(),
      getAllBooks()
    ]);

    return {
      poems,
      books
    };
  } catch (error: any) {
    throw new Error(error.message || 'Error al exportar datos');
  }
};

export const importPoemsFromJSON = async (
  jsonData: string,
  options: { overwrite?: boolean; updateExisting?: boolean } = {}
): Promise<{ success: boolean; imported: number; updated: number; errors: string[] }> => {
  const errors: string[] = [];
  let imported = 0;
  let updated = 0;

  try {
    const parsedData = JSON.parse(jsonData);

    // Validar estructura
    if (!parsedData.data || !Array.isArray(parsedData.data)) {
      return { success: false, imported: 0, updated: 0, errors: ['Formato JSON inválido'] };
    }

    const poems = parsedData.data;

    for (const poem of poems) {
      try {
        // Validar campos obligatorios
        if (!poem.title || !poem.author || !poem.content) {
          errors.push(`Poema "${poem.title || 'Sin título'}": Campos obligatorios faltantes (título, autor, contenido)`);
          continue;
        }

        // Verificar si ya existe
        const existing = await getDocs(query(
          collection(db, POEMS_COLLECTION),
          where('title', '==', poem.title),
          where('author', '==', poem.author)
        ));

        if (!existing.empty) {
          if (options.overwrite) {
            // Eliminar existente
            const existingDoc = existing.docs[0];
            await deleteDoc(doc(db, POEMS_COLLECTION, existingDoc.id));
          } else if (options.updateExisting) {
            // Actualizar existente
            const existingDoc = existing.docs[0];
            const { id, createdAt, ...updateData } = poem;
            await updateDoc(doc(db, POEMS_COLLECTION, existingDoc.id), {
              ...updateData,
              updatedAt: new Date()
            });
            updated++;
            continue;
          } else {
            errors.push(`Poema "${poem.title}": Ya existe (usar opción de sobrescribir o actualizar)`);
            continue;
          }
        }

        // Crear nuevo poema
        const { id, createdAt, updatedAt, ...poemData } = poem;
        await createPoem(poemData);
        imported++;

      } catch (err: any) {
        errors.push(`Poema "${poem.title || 'Sin título'}": ${err.message}`);
      }
    }

    return {
      success: true,
      imported,
      updated,
      errors
    };

  } catch (error: any) {
    return {
      success: false,
      imported: 0,
      updated: 0,
      errors: [error.message || 'Error al procesar JSON']
    };
  }
};

export const importBooksFromJSON = async (
  jsonData: string,
  options: { overwrite?: boolean; updateExisting?: boolean } = {}
): Promise<{ success: boolean; imported: number; updated: number; errors: string[] }> => {
  const errors: string[] = [];
  let imported = 0;
  let updated = 0;

  try {
    const parsedData = JSON.parse(jsonData);

    // Validar estructura
    if (!parsedData.data || !Array.isArray(parsedData.data)) {
      return { success: false, imported: 0, updated: 0, errors: ['Formato JSON inválido'] };
    }

    const books = parsedData.data;

    for (const book of books) {
      try {
        // Validar campos obligatorios
        if (!book.title || !book.author) {
          errors.push(`Libro "${book.title || 'Sin título'}": Campos obligatorios faltantes (título, autor)`);
          continue;
        }

        // Verificar si ya existe
        const q = query(
          collection(db, BOOKS_COLLECTION),
          where('title', '==', book.title),
          where('author', '==', book.author)
        );
        const existing = await getDocs(q);

        if (!existing.empty) {
          if (options.overwrite) {
            // Eliminar existente
            const existingDoc = existing.docs[0];
            await deleteDoc(doc(db, BOOKS_COLLECTION, existingDoc.id));
          } else if (options.updateExisting) {
            // Actualizar existente
            const existingDoc = existing.docs[0];
            const { id, createdAt, updatedAt, ...updateData } = book;
            await updateDoc(doc(db, BOOKS_COLLECTION, existingDoc.id), {
              ...updateData,
              updatedAt: new Date()
            });
            updated++;
            continue;
          } else {
            errors.push(`Libro "${book.title}": Ya existe (usar opción de sobrescribir o actualizar)`);
            continue;
          }
        }

        // Crear nuevo libro
        const { id, createdAt, updatedAt, ...bookData } = book;
        await createBook(bookData);
        imported++;

      } catch (err: any) {
        errors.push(`Libro "${book.title || 'Sin título'}": ${err.message}`);
      }
    }

    return {
      success: true,
      imported,
      updated,
      errors
    };

  } catch (error: any) {
    return {
      success: false,
      imported: 0,
      updated: 0,
      errors: [error.message || 'Error al procesar JSON']
    };
  }
};

// ============================================
// DATA CONSISTENCY
// ============================================

export const verifyDataConsistency = async (): Promise<{
  issues: Array<{ type: string; description: string; count: number; items?: string[] }>
}> => {
  const issues: Array<{ type: string; description: string; count: number; items?: string[] }> = [];

  try {
    // Verificar poemas sin libro
    const poems = await getAllPoemsForAdmin();
    const books = await getAllBooks();
    const validBookIds = new Set<string>(books.map(b => b.id));

    // Verificar poemas que tienen bookId pero el libro no existe
    const poemsWithInvalidBook = poems.filter(poem =>
      poem.bookId && !validBookIds.has(poem.bookId)
    );
    if (poemsWithInvalidBook.length > 0) {
      issues.push({
        type: 'error',
        description: 'Poemas con libro asociado que no existe',
        count: poemsWithInvalidBook.length,
        items: poemsWithInvalidBook.slice(0, 10).map(p => `${p.title} -> ${p.bookId}`)
      });
    }

    // Verificar poemas sin ningún libro asociado (sin bookId)
    const orphanPoems = poems.filter(poem => !poem.bookId);
    if (orphanPoems.length > 0) {
      issues.push({
        type: 'warning',
        description: 'Poemas sin libro asociado',
        count: orphanPoems.length,
        items: orphanPoems.slice(0, 10).map(p => p.title)
      });
    }

    // Verificar libros con poemas que no existen
    const invalidPoemRefs: string[] = [];
    books.forEach(book => {
      if (book.poems) {
        book.poems.forEach(poemId => {
          if (!poems.find(p => p.id === poemId)) {
            invalidPoemRefs.push(`${book.title} -> ${poemId}`);
          }
        });
      }
    });

    if (invalidPoemRefs.length > 0) {
      issues.push({
        type: 'error',
        description: 'Libros con referencias a poemas inexistentes',
        count: invalidPoemRefs.length,
        items: invalidPoemRefs.slice(0, 10)
      });
    }

  } catch (error: any) {
    console.error('Error verifying data consistency:', error);
  }

  return { issues };
};

