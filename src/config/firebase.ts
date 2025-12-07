import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
// ניתן גם להגדיר דרך משתני סביבה בקובץ .env
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAdKJI5NuhBLffemEfua4zGzkF3YHXplNc",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "app-launcher-fa9f7.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "app-launcher-fa9f7",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "app-launcher-fa9f7.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "121988913614",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:121988913614:web:85f24b242057fe435c739f",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-T1REY5N2N1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

export default app;

