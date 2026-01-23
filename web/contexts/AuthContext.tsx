'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { onAuthStateChange } from '@/lib/firebase/auth';
import { getUserProfile } from '@/lib/firebase/user';
import { User } from '@/types/poem';

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: User | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  refreshToken: () => Promise<void>; // Nueva función para refresh del token
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Fetch user profile from Firestore
        await loadUserProfile(firebaseUser.uid);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadUserProfile = async (uid: string) => {
    try {
      const profile = await getUserProfile(uid);
      if (!profile) {
        console.warn('⚠️ User profile not found in Firestore for UID:', uid);
        // Create a default profile if it doesn't exist
        setUserProfile({
          uid,
          email: '',
          displayName: 'Usuario',
          photoURL: '',
          favoritePoems: [],
          readPoems: [],
          role: 'user',
          createdAt: new Date().toISOString(),
        });
      } else {
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('❌ Error loading user profile:', error);
      // Set a default profile on error to prevent infinite loading
      setUserProfile({
        uid,
        email: '',
        displayName: 'Usuario',
        photoURL: '',
        favoritePoems: [],
        readPoems: [],
        role: 'user',
        createdAt: new Date().toISOString(),
      });
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user.uid);
    }
  };

  const refreshToken = async () => {
    if (user) {
      try {
        // Forzar el refresh del token ID para obtener nuevos custom claims
        await user.getIdToken(true);
        console.log('✅ Token ID refreshiado');
      } catch (error) {
        console.error('❌ Error al refrescar token:', error);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, refreshProfile, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
