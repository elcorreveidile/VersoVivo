/**
 * Hook for real-time user data synchronization (Web)
 */

'use client';

import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  favoritePoems?: string[];
  readPoems?: string[];
  listenedPoems?: string[];
  watchedPoems?: string[];
  createdAt?: Date | string;
  lastLoginAt?: Date | string;
}

export const useRealtimeUser = (userId: string | null) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(
      doc(db, 'users', userId),
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          setUser(docSnapshot.data() as User);
        } else {
          setUser(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error listening to user updates:', err);
        setError(err as Error);
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, [userId]);

  return { user, loading, error };
};

/**
 * Hook for real-time poem data synchronization (Web)
 */
export const useRealtimePoem = (poemId: string | null) => {
  const [poem, setPoem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!poemId) {
      setPoem(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      doc(db, 'poems', poemId),
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          setPoem({ id: docSnapshot.id, ...docSnapshot.data() });
        } else {
          setPoem(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error listening to poem updates:', err);
        setError(err as Error);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [poemId]);

  return { poem, loading, error };
};
