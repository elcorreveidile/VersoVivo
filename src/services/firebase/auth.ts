/**
 * Firebase Authentication Service (Expo Compatible)
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  sendPasswordResetEmail,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './config';
import type { User, LoginCredentials, SignupCredentials } from '@types';

class AuthService {
  /**
   * Sign up with email and password
   */
  async signUpWithEmail(credentials: SignupCredentials): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      // Update profile with display name
      await updateProfile(userCredential.user, {
        displayName: credentials.displayName,
      });

      // Create user document in Firestore
      const user: User = {
        uid: userCredential.user.uid,
        email: credentials.email,
        displayName: credentials.displayName,
        favorites: [],
        readPoems: [],
        listenedPoems: [],
        watchedPoems: [],
        createdAt: new Date(),
        lastLoginAt: new Date(),
      };

      await setDoc(doc(db, 'users', user.uid), user);

      return user;
    } catch (error: any) {
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  /**
   * Sign in with email and password
   */
  async signInWithEmail(credentials: LoginCredentials): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      // Update last login
      await updateDoc(doc(db, 'users', userCredential.user.uid), {
        lastLoginAt: new Date()
      });

      return this.getUserData(userCredential.user.uid);
    } catch (error: any) {
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  /**
   * Sign in with Google (not available in Expo Go, requires custom build)
   */
  async signInWithGoogle(): Promise<User> {
    throw new Error('Google Sign-In requiere una compilación personalizada de Expo. Por ahora usa email/contraseña.');
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth);
    } catch (error: any) {
      throw new Error('Error signing out');
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User | null> {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;
    return this.getUserData(currentUser.uid);
  }

  /**
   * Get user data from Firestore
   */
  async getUserData(uid: string): Promise<User> {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    return userDoc.data() as User;
  }

  /**
   * Reset password
   */
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  /**
   * Get readable error messages
   */
  private getAuthErrorMessage(errorCode: string): string {
    const errorMessages: Record<string, string> = {
      'auth/email-already-in-use': 'Este correo ya está registrado',
      'auth/invalid-email': 'Correo electrónico inválido',
      'auth/operation-not-allowed': 'Operación no permitida',
      'auth/weak-password': 'La contraseña es muy débil',
      'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
      'auth/user-not-found': 'Usuario no encontrado',
      'auth/wrong-password': 'Contraseña incorrecta',
      'auth/too-many-requests': 'Demasiados intentos, intenta más tarde',
    };

    return errorMessages[errorCode] || 'Error de autenticación';
  }
}

export default new AuthService();
