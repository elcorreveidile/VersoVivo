import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from './config';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './config';

export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);

    // Check if user document exists, if not create it
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));

    if (!userDoc.exists()) {
      // Create new user document
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName || '',
        photoURL: userCredential.user.photoURL || '',
        favoritePoems: [],
        readPoems: [],
        createdAt: new Date().toISOString(),
      });
    } else {
      // Update last login
      await updateDoc(doc(db, 'users', userCredential.user.uid), {
        lastLoginAt: new Date().toISOString(),
      });
    }

    return { user: userCredential.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

export const signInWithApple = async () => {
  try {
    const provider = new OAuthProvider('apple.com');
    provider.addScope('email');
    provider.addScope('name');

    const userCredential = await signInWithPopup(auth, provider);
    console.log('✅ Apple Sign In successful, UID:', userCredential.user.uid);

    // Check if user document exists, if not create it
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    console.log('📄 User doc exists:', userDoc.exists());

    if (!userDoc.exists()) {
      // Get additional user info from Apple
      const displayName = userCredential.user.displayName || '';
      const firstName = (userCredential as any).additionalUserInfo?.profile?.given_name || '';
      const lastName = (userCredential as any).additionalUserInfo?.profile?.family_name || '';
      const finalDisplayName = displayName || `${firstName} ${lastName}`.trim() || 'Usuario';

      console.log('👤 Creating user profile:', { finalDisplayName, email: userCredential.user.email });

      // Create new user document
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: finalDisplayName,
        photoURL: userCredential.user.photoURL || '',
        favoritePoems: [],
        readPoems: [],
        createdAt: new Date().toISOString(),
      });

      console.log('✅ User profile created in Firestore');
    } else {
      // Update last login
      await updateDoc(doc(db, 'users', userCredential.user.uid), {
        lastLoginAt: new Date().toISOString(),
      });
      console.log('✅ User login time updated');
    }

    return { user: userCredential.user, error: null };
  } catch (error: any) {
    console.error('❌ Apple Sign In error:', error);
    return { user: null, error: error.message };
  }
};

export const signUp = async (email: string, password: string, displayName?: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // Update profile if display name provided
    if (displayName) {
      await updateProfile(userCredential.user, { displayName });
    }

    // Create user document in Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      displayName: displayName || '',
      photoURL: userCredential.user.photoURL || '',
      favoritePoems: [],
      readPoems: [],
      createdAt: new Date().toISOString(),
    });

    return { user: userCredential.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
