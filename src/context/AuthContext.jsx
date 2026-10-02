import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // Subscribe to Firebase Auth state (session stored permanently in browser)
    const unsubscribe = authService.subscribeToAuth((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    setAuthError(null);
    try {
      const user = await authService.signIn(email, password);
      setCurrentUser(user);
      return user;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    setAuthError(null);
    try {
      await authService.signOutUser();
      setCurrentUser(null);
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  const value = {
    currentUser,
    loading,
    authError,
    setAuthError,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
