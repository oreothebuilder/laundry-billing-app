import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from 'firebase/firestore';
import { 
  getAuth, 
  setPersistence, 
  browserLocalPersistence 
} from 'firebase/auth';

// Production configuration via environment variables
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
};

let app = null;
let db = null;
let auth = null;
let isConfigured = false;

if (firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.apiKey !== 'YOUR_API_KEY') {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    
    // Enable multi-tab offline persistence for production mobile resilience
    try {
      db = initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager()
        })
      });
    } catch (cacheErr) {
      db = getFirestore(app);
    }

    // Initialize Firebase Authentication with persistent storage
    try {
      auth = getAuth(app);
      setPersistence(auth, browserLocalPersistence).catch((authErr) => {
        console.warn('[Firebase Auth] Persistence set warning:', authErr);
      });
    } catch (authInitErr) {
      console.warn('[Firebase Auth] Init error:', authInitErr);
    }
    
    isConfigured = true;
    console.log(`[Firebase] Connected to project: ${firebaseConfig.projectId}`);
  } catch (err) {
    console.error('[Firebase] Initialization error:', err);
  }
}

export { app, db, auth, isConfigured };
