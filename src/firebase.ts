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

// TODO: Configure your Firebase credentials here or using environment variables
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCgw1o9dpcFnQAZwpcvPvPZPKCrpl89BwM",
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "ecosphere-app-5a4cb.firebaseapp.com",
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID || "ecosphere-app-5a4cb",
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "ecosphere-app-5a4cb.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "742236367967",
  appId:             import.meta.env.VITE_FIREBASE_APP_ID || "1:742236367967:web:ef4e49428370d1ac11ffea",
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-PK1TLQKKX7"
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
