import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Removed localStorage/cookie helper functions as Firebase manages sessions

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get the ID token
          const token = await firebaseUser.getIdToken();
          
          // Store token in cookies for the backend
          document.cookie = `token=${token}; expires=${new Date(Date.now() + 24*60*60*1000).toUTCString()}; path=/`;

          // Sync with our backend to ensure user exists in MongoDB and get profile data
          const response = await api.post('/users/sync', {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          setUser({ ...response.data.user, token });
        } catch (error) {
          console.error('Failed to sync user with backend:', error);
          setUser(null);
          document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        } finally {
          setLoading(false);
        }
      } else {
        setUser(null);
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Login is now handled directly via Firebase Auth in the Login/Register components
  // We just provide logout here
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
