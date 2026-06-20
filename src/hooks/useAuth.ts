import { useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type User
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

export type AuthUser = User;

export interface UseAuthReturn {
  user: AuthUser | null;
  authLoading: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  isFirebaseConfigured: boolean;
}

// Check if Firebase is configured with real keys (not placeholders)
function checkFirebaseConfigured(): boolean {
  try {
    // If the apiKey is the placeholder string, Firebase is not configured yet
    return !auth.app.options.apiKey?.startsWith('YOUR_');
  } catch {
    return false;
  }
}

// Compute once at module level — avoids re-running on every render
const IS_FIREBASE_CONFIGURED = checkFirebaseConfigured();

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  // If Firebase is not configured, we are not loading — skip auth entirely
  const [authLoading, setAuthLoading] = useState(!IS_FIREBASE_CONFIGURED ? false : true);
  const [authError, setAuthError] = useState<string | null>(null);
  const isFirebaseConfigured = IS_FIREBASE_CONFIGURED;

  useEffect(() => {
    if (!isFirebaseConfigured) return; // Already loading=false from initial state

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [isFirebaseConfigured]);

  const formatError = (code: string): string => {
    switch (code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Incorrect email or password. Please try again.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists. Try signing in.';
      case 'auth/weak-password':
        return 'Password must be at least 6 characters long.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/popup-closed-by-user':
        return 'Sign-in popup was closed. Please try again.';
      case 'auth/network-request-failed':
        return 'Network error. Check your internet connection and try again.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please wait a moment before trying again.';
      default:
        return 'Something went wrong. Please try again.';
    }
  };

  const signInWithGoogle = async () => {
    if (!isFirebaseConfigured) return;
    try {
      setAuthError(null);
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? '';
      setAuthError(formatError(code));
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    if (!isFirebaseConfigured) return;
    try {
      setAuthError(null);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? '';
      setAuthError(formatError(code));
    }
  };

  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    if (!isFirebaseConfigured) return;
    try {
      setAuthError(null);
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName.trim()) {
        await updateProfile(credential.user, { displayName: displayName.trim() });
      }
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? '';
      setAuthError(formatError(code));
    }
  };

  const signOut = async () => {
    if (!isFirebaseConfigured) return;
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch {
      // Ignore sign-out errors
    }
  };

  const clearError = () => setAuthError(null);

  return {
    user,
    authLoading,
    authError,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    clearError,
    isFirebaseConfigured
  };
}
