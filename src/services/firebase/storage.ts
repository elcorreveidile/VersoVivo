/**
 * Firebase Storage Service (Expo Compatible)
 */

import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { storage } from './config';

class StorageService {
  async uploadVideo(
    uri: string,
    poemId: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    try {
      const filename = 'videos/' + poemId + '_' + new Date().getTime() + '.mp4';
      const storageRef = ref(storage, filename);
      const response = await fetch(uri);
      const blob = await response.blob();
      await uploadBytes(storageRef, blob);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Error uploading video:', error);
      throw new Error('Error al subir el video');
    }
  }

  async uploadAudio(
    uri: string,
    poemId: string,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    try {
      const filename = 'music/' + poemId + '_' + new Date().getTime() + '.mp3';
      const storageRef = ref(storage, filename);
      const response = await fetch(uri);
      const blob = await response.blob();
      await uploadBytes(storageRef, blob);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Error uploading audio:', error);
      throw new Error('Error al subir el audio');
    }
  }

  async uploadThumbnail(uri: string, poemId: string): Promise<string> {
    try {
      const filename = 'thumbnails/' + poemId + '_' + new Date().getTime() + '.jpg';
      const storageRef = ref(storage, filename);
      const response = await fetch(uri);
      const blob = await response.blob();
      await uploadBytes(storageRef, blob);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Error uploading thumbnail:', error);
      throw new Error('Error al subir la miniatura');
    }
  }

  async deleteFile(url: string): Promise<void> {
    try {
      const storageRef = ref(storage, url);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error('Error al eliminar el archivo');
    }
  }

  async getDownloadUrl(path: string): Promise<string> {
    try {
      const storageRef = ref(storage, path);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error('Error getting download URL:', error);
      throw new Error('Error al obtener la URL de descarga');
    }
  }
}

export default new StorageService();
