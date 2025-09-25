import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyARyhAzMvO1_W3lcoscTZX0lX21Ol4Yago",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "ai-chatbot-app-d4743.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "ai-chatbot-app-d4743",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "ai-chatbot-app-d4743.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "818122214579",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:818122214579:web:38424897dd89323e5e34c6",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-KMBPMBG47T"
};

// Debug: Log config values (remove in production)
console.log('Firebase Config:', {
  apiKey: firebaseConfig.apiKey ? 'Set' : 'Missing',
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;