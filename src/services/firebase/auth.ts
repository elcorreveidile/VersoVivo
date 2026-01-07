/**
 * Firebase Authentication Service
 */

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GOOGLE_WEB_CLIENT_ID } from '@env';
import type { User, LoginCredentials, SignupCredentials } from '@types/index';

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: GOOGLE_WEB_CLIENT_ID,
});

class AuthService {
  /**
   * Sign up with email and password
   */
  async signUpWithEmail(credentials: SignupCredentials): Promise<User> {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(
        credentials.email,
        credentials.password
      );

      // Update profile with display name
      await userCredential.user.updateProfile({
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

      await firestore().collection('users').doc(user.uid).set(user);

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
      const userCredential = await auth().signInWithEmailAndPassword(
        credentials.email,
        credentials.password
      );

      // Update last login
      await firestore()
        .collection('users')
        .doc(userCredential.user.uid)
        .update({ lastLoginAt: new Date() });

      return this.getUserData(userCredential.user.uid);
    } catch (error: any) {
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  /**
   * Sign in with Google
   */
  async signInWithGoogle(): Promise<User> {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const { idToken } = await GoogleSignin.signIn();
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const userCredential = await auth().signInWithCredential(googleCredential);

      // Check if user exists in Firestore
      const userDoc = await firestore()
        .collection('users')
        .doc(userCredential.user.uid)
        .get();

      if (!userDoc.exists) {
        // Create new user document
        const user: User = {
          uid: userCredential.user.uid,
          email: userCredential.user.email!,
          displayName: userCredential.user.displayName || undefined,
          photoURL: userCredential.user.photoURL || undefined,
          favorites: [],
          readPoems: [],
          listenedPoems: [],
          watchedPoems: [],
          createdAt: new Date(),
          lastLoginAt: new Date(),
        };

        await firestore().collection('users').doc(user.uid).set(user);
        return user;
      }

      // Update last login
      await firestore()
        .collection('users')
        .doc(userCredential.user.uid)
        .update({ lastLoginAt: new Date() });

      return this.getUserData(userCredential.user.uid);
    } catch (error: any) {
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    try {
      await auth().signOut();
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
    } catch (error: any) {
      throw new Error('Error signing out');
    }
  }

  /**
   * Get current user
   */
  getCurrentUser(): Promise<User | null> {
    const currentUser = auth().currentUser;
    if (!currentUser) return Promise.resolve(null);
    return this.getUserData(currentUser.uid);
  }

  /**
   * Get user data from Firestore
   */
  async getUserData(uid: string): Promise<User> {
    const userDoc = await firestore().collection('users').doc(uid).get();
    if (!userDoc.exists) {
      throw new Error('User not found');
    }
    return userDoc.data() as User;
  }

  /**
   * Reset password
   */
  async resetPassword(email: string): Promise<void> {
    try {
      await auth().sendPasswordResetEmail(email);
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
