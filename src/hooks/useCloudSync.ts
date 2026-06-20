import { useEffect, useRef } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { AppState } from '../types';
import type { AuthUser } from './useAuth';

interface UseCloudSyncProps {
  user: AuthUser | null;
  state: AppState;
  setState: (s: AppState | ((prev: AppState) => AppState)) => void;
  isFirebaseConfigured: boolean;
}

export function useCloudSync({ user, state, setState, isFirebaseConfigured }: UseCloudSyncProps) {
  const hasSyncedInitial = useRef(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // On sign-in: pull the user's cloud data and merge it into local state
  useEffect(() => {
    if (!user || !isFirebaseConfigured || hasSyncedInitial.current) return;

    const loadFromCloud = async () => {
      try {
        const userDoc = doc(db, 'users', user.uid);
        const snap = await getDoc(userDoc);

        if (snap.exists()) {
          const cloudData = snap.data() as AppState;
          // Merge cloud data over local default state
          setState(prev => ({
            ...prev,
            ...cloudData,
            inputs: { ...prev.inputs, ...cloudData.inputs },
            // Always use the display name from Auth profile if available
            userName: user.displayName || cloudData.userName || prev.userName
          }));
        } else {
          // First login — no cloud data yet, save local state to cloud
          const userDocRef = doc(db, 'users', user.uid);
          await setDoc(userDocRef, {
            ...state,
            userName: user.displayName || state.userName
          });
        }
        hasSyncedInitial.current = true;
      } catch {
        // Network error — silently fall back to local state
        hasSyncedInitial.current = true;
      }
    };

    loadFromCloud();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isFirebaseConfigured]);

  // Reset the sync flag when user signs out so next login re-syncs
  useEffect(() => {
    if (!user) {
      hasSyncedInitial.current = false;
    }
  }, [user]);

  // Debounced cloud save — writes to Firestore 2 seconds after the last state change
  useEffect(() => {
    if (!user || !isFirebaseConfigured || !hasSyncedInitial.current) return;

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(async () => {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, state, { merge: true });
      } catch {
        // Network error — silently ignore, localStorage still holds data
      }
    }, 2000);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [user, state, isFirebaseConfigured]);
}
