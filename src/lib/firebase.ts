import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC-Mo7xg75-cIcWMwh_PK4cooyxn30rHHg",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "alphazero-41772.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "alphazero-41772",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "alphazero-41772.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "289892140635",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:289892140635:web:15aac8f6961c05aac6617e",
};

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Auth and Firestore services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
