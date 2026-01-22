/**
 * Hook for real-time user data synchronization
 */

import { useEffect, useCallback } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@services/firebase/config';
import { useAppDispatch } from './useAppDispatch';
import { setUser } from '@store/slices/authSlice';
import type { User } from '@types';

export const useRealtimeUser = (userId: string | null) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!userId) return;

    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(
      doc(db, 'users', userId),
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data() as User;
          dispatch(setUser(userData));
        }
      },
      (error) => {
        console.error('Error listening to user updates:', error);
      }
    );

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, [userId, dispatch]);
};

/**
 * Hook for real-time poem data synchronization
 */
export const useRealtimePoem = (poemId: string | null, onUpdate?: (poem: any) => void) => {
  useEffect(() => {
    if (!poemId) return;

    const unsubscribe = onSnapshot(
      doc(db, 'poems', poemId),
      (docSnapshot) => {
        if (docSnapshot.exists() && onUpdate) {
          onUpdate({ id: docSnapshot.id, ...docSnapshot.data() });
        }
      },
      (error) => {
        console.error('Error listening to poem updates:', error);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [poemId, onUpdate]);
};
