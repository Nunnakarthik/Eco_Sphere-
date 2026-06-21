// ============================================================
// Firebase Configuration — EcoSphere
// ============================================================
// SETUP INSTRUCTIONS:
// 1. Go to https://console.firebase.google.com
// 2. Create a project (or use existing)
// 3. Enable Authentication → Sign-in methods:
//    - Google
//    - Email/Password
// 4. Create Firestore Database (start in test mode)
// 5. Go to Project Settings → Your apps → Add Web App
// 6. Copy the firebaseConfig object values below
// ============================================================

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// TODO: Configure your Firebase credentials using environment variables
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
  appId:             import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID",
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "YOUR_MEASUREMENT_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics
export const analytics = getAnalytics(app);

// Auth instance
export const auth = getAuth(app);

// Google provider (pre-configured)
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Firestore database instance
export const db = getFirestore(app);

export default app;
