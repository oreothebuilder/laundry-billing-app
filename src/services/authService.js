import { 
  signInWithEmailAndPassword, 
  onAuthStateChanged,
  signOut,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { auth } from '../firebase';

export const authService = {
  /**
   * Initialize local browser persistence so sessions are never lost on reload
   */
  initPersistence: async () => {
    if (auth) {
      try {
        await setPersistence(auth, browserLocalPersistence);
      } catch (e) {
        console.warn('[Auth] Persistence warning:', e?.message);
      }
    }
  },

  /**
   * Sign in with email and password added in Firebase Console
   */
  signIn: async (email, password) => {
    if (!auth) throw new Error('Firebase Auth is not initialized');
    await authService.initPersistence();
    const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
    return cred.user;
  },

  /**
   * Sign out current user
   */
  signOutUser: async () => {
    if (auth) {
      await signOut(auth);
    }
  },

  /**
   * Get currently authenticated user
   */
  getCurrentUser: () => {
    return auth?.currentUser || null;
  },

  /**
   * Subscribe to real-time auth state changes
   */
  subscribeToAuth: (callback) => {
    if (!auth) {
      callback(null);
      return () => {};
    }
    return onAuthStateChanged(auth, callback);
  }
};
