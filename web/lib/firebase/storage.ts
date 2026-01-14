import { ref, deleteObject, getStorage } from 'firebase/storage';
import { db } from './config';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { StorageFile, StorageUsage } from '@/types/storage';

const storage = getStorage();

/**
 * Extrae el path del archivo de una URL de Firebase Storage
 */
const extractPathFromUrl = (url: string): string | null => {
  try {
    // URL format: https://firebasestorage.googleapis.com/v0/b/versovivo-ded94.appspot.com/o/...
    const match = url.match(/\/o\/([^?]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
};

/**
 * Obtiene todos los archivos multimedia usados en poemas y libros
 */
export const getUsedStorageFiles = async (): Promise<Set<string>> => {
  const usedPaths = new Set<string>();

  try {
    // Obtener todos los poemas
    const poemsSnapshot = await getDocs(collection(db, 'poems'));
    poemsSnapshot.forEach(doc => {
      const poem = doc.data();
      if (poem.videoUrl) {
        const path = extractPathFromUrl(poem.videoUrl);
        if (path) usedPaths.add(path);
      }
      if (poem.musicUrl) {
        const path = extractPathFromUrl(poem.musicUrl);
        if (path) usedPaths.add(path);
      }
      if (poem.thumbnailUrl) {
        const path = extractPathFromUrl(poem.thumbnailUrl);
        if (path) usedPaths.add(path);
      }
    });

    // Obtener todos los libros
    const booksSnapshot = await getDocs(collection(db, 'books'));
    booksSnapshot.forEach(doc => {
      const book = doc.data();
      if (book.coverUrl) {
        const path = extractPathFromUrl(book.coverUrl);
        if (path) usedPaths.add(path);
      }
    });
  } catch (error) {
    console.error('Error getting used storage files:', error);
  }

  return usedPaths;
};

/**
 * Analiza el uso de Storage basado en los datos de Firestore
 */
export const getStorageUsage = async (): Promise<StorageUsage> => {
  const filesByType: Record<string, number> = {};
  const sizeByType: Record<string, number> = {};
  let totalFiles = 0;
  let totalSize = 0;

  try {
    // Obtener poemas
    const poemsSnapshot = await getDocs(collection(db, 'poems'));
    poemsSnapshot.forEach(doc => {
      const poem = doc.data();
      if (poem.videoUrl) {
        filesByType['video'] = (filesByType['video'] || 0) + 1;
        totalFiles++;
      }
      if (poem.musicUrl) {
        filesByType['music'] = (filesByType['music'] || 0) + 1;
        totalFiles++;
      }
      if (poem.thumbnailUrl) {
        filesByType['thumbnail'] = (filesByType['thumbnail'] || 0) + 1;
        totalFiles++;
      }
    });

    // Obtener libros
    const booksSnapshot = await getDocs(collection(db, 'books'));
    booksSnapshot.forEach(doc => {
      const book = doc.data();
      if (book.coverUrl) {
        filesByType['cover'] = (filesByType['cover'] || 0) + 1;
        totalFiles++;
      }
    });
  } catch (error) {
    console.error('Error analyzing storage usage:', error);
  }

  const totalSizeFormatted = formatBytes(totalSize);

  return {
    totalFiles,
    totalSize,
    totalSizeFormatted,
    filesByType,
    sizeByType,
    unusedFiles: 0, // No podemos calcular sin acceso a Storage completo
    unusedSize: 0,
  };
};

/**
 * Elimina un archivo de Storage
 */
export const deleteStorageFile = async (fileUrl: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const path = extractPathFromUrl(fileUrl);
    if (!path) {
      return { success: false, error: 'URL inválida' };
    }

    const fileRef = ref(storage, path);
    await deleteObject(fileRef);

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting storage file:', error);
    return { success: false, error: error.message || 'Error al eliminar archivo' };
  }
};

/**
 * Busca archivos no usados comparando URLs en poemas/libros
 * NOTA: Esta es una aproximación basada en los datos de Firestore
 */
export const findUnusedFiles = async (): Promise<{
  unused: string[];
  total: number;
}> => {
  // Esta función es limitada porque no podemos listar todos los archivos de Storage desde el cliente
  // Devolvemos una lista vacía pero con la estructura para futura implementación
  return {
    unused: [],
    total: 0,
  };
};

/**
 * Formatea bytes a formato legible
 */
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};
