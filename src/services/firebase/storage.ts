/**
 * Firebase Storage Service
 */

import storage from '@react-native-firebase/storage';

class StorageService {
  /**
   * Upload video file
   */
  async uploadVideo(uri: string, poemId: string, onProgress?: (progress: number) => void): Promise<string> {
    try {
      const filename = `videos/${poemId}_${Date.now()}.mp4`;
      const reference = storage().ref(filename);
      const task = reference.putFile(uri);

      // Monitor upload progress
      if (onProgress) {
        task.on('state_changed', snapshot => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress(progress);
        });
      }

      await task;
      const downloadUrl = await reference.getDownloadURL();
      return downloadUrl;
    } catch (error) {
      console.error('Error uploading video:', error);
      throw new Error('Error al subir el video');
    }
  }

  /**
   * Upload audio file
   */
  async uploadAudio(uri: string, poemId: string, onProgress?: (progress: number) => void): Promise<string> {
    try {
      const filename = `music/${poemId}_${Date.now()}.mp3`;
      const reference = storage().ref(filename);
      const task = reference.putFile(uri);

      // Monitor upload progress
      if (onProgress) {
        task.on('state_changed', snapshot => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress(progress);
        });
      }

      await task;
      const downloadUrl = await reference.getDownloadURL();
      return downloadUrl;
    } catch (error) {
      console.error('Error uploading audio:', error);
      throw new Error('Error al subir el audio');
    }
  }

  /**
   * Upload thumbnail image
   */
  async uploadThumbnail(uri: string, poemId: string): Promise<string> {
    try {
      const filename = `thumbnails/${poemId}_${Date.now()}.jpg`;
      const reference = storage().ref(filename);
      await reference.putFile(uri);
      const downloadUrl = await reference.getDownloadURL();
      return downloadUrl;
    } catch (error) {
      console.error('Error uploading thumbnail:', error);
      throw new Error('Error al subir la miniatura');
    }
  }

  /**
   * Delete file from storage
   */
  async deleteFile(url: string): Promise<void> {
    try {
      const reference = storage().refFromURL(url);
      await reference.delete();
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error('Error al eliminar el archivo');
    }
  }

  /**
   * Get download URL for a file
   */
  async getDownloadUrl(path: string): Promise<string> {
    try {
      const reference = storage().ref(path);
      return await reference.getDownloadURL();
    } catch (error) {
      console.error('Error getting download URL:', error);
      throw new Error('Error al obtener la URL de descarga');
    }
  }
}

export default new StorageService();
