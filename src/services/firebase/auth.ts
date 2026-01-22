/**
 * Firebase Authentication Service (Expo Compatible)
 */

import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  sendPasswordResetEmail,
  User as FirebaseUser,
  OAuthProvider,
  signInWithCredential,
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
   * Sign in with Apple
   */
  async signInWithApple(): Promise<User> {
    try {
      if (Platform.OS !== 'ios') {
        throw new Error('Apple Sign-In solo está disponible en iOS');
      }

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      // Create Firebase credential from Apple credential
      const { identityToken } = credential;
      if (!identityToken) {
        throw new Error('No se pudo obtener el token de identidad de Apple');
      }

      const provider = new OAuthProvider('apple.com');
      const firebaseCredential = provider.credential({
        idToken: identityToken,
      });

      const userCredential = await signInWithCredential(auth, firebaseCredential);

      // Check if user exists, if not create document
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));

      if (!userDoc.exists()) {
        const user: User = {
          uid: userCredential.user.uid,
          email: credential.email || userCredential.user.email || '',
          displayName: credential.fullName?.givenName || userCredential.user.displayName || 'Usuario',
          role: 'user', // Default role for new users
          favorites: [],
          readPoems: [],
          listenedPoems: [],
          watchedPoems: [],
          createdAt: new Date(),
          lastLoginAt: new Date(),
        };

        await setDoc(doc(db, 'users', user.uid), user);
      } else {
        // Update last login
        await updateDoc(doc(db, 'users', userCredential.user.uid), {
          lastLoginAt: new Date()
        });
      }

      return this.getUserData(userCredential.user.uid);
    } catch (error: any) {
      if (error.code === 'ERR_CANCELED') {
        throw new Error('Sign in with Apple fue cancelado');
      }
      throw new Error(error.message || 'Error al iniciar sesión con Apple');
    }
  }

  /**
   * Sign in with Google (requires custom Expo build)
   */
  async signInWithGoogle(): Promise<User> {
    throw new Error('Google Sign-In requiere configuración adicional. Por ahora usa Sign in with Apple o email/contraseña.');
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
