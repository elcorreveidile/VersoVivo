import { doc, getDoc, getDocs, collection, setDoc, updateDoc, addDoc, deleteDoc, query, where, orderBy, limit, getDocsFromCache } from 'firebase/firestore';
import { db } from './config';
import { User, Book, ActivityLog, AdminStats } from '@/types/poem';

const USERS_COLLECTION = 'users';
const POEMS_COLLECTION = 'poems';
const BOOKS_COLLECTION = 'books';
const ACTIVITY_LOG_COLLECTION = 'activityLog';

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
    // Get total users
    const usersSnapshot = await getDocs(collection(db, USERS_COLLECTION));
    const totalUsers = usersSnapshot.size;

    // Get total poems
    const poemsSnapshot = await getDocs(collection(db, POEMS_COLLECTION));
    const totalPoems = poemsSnapshot.size;

    // Get total books
    const booksSnapshot = await getDocs(collection(db, BOOKS_COLLECTION));
    const totalBooks = booksSnapshot.size;

    // Get active users (logged in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const activeUsers = usersSnapshot.docs.filter(doc => {
      const lastLogin = doc.data().lastLoginAt?.toDate();
      return lastLogin && lastLogin > sevenDaysAgo;
    }).length;

    // Get all poems data
    const allPoems = poemsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

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

    // Get new users this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const newUsersThisWeek = usersSnapshot.docs.filter(doc => {
      const createdAt = doc.data().createdAt?.toDate();
      return createdAt && createdAt > weekAgo;
    }).length;

    // Get new users this month
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    const newUsersThisMonth = usersSnapshot.docs.filter(doc => {
      const createdAt = doc.data().createdAt?.toDate();
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
    console.error('Error getting admin stats:', error);
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
    const newBookRef = await addDoc(booksRef, {
      ...book,
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
    await updateDoc(bookRef, {
      ...book,
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
