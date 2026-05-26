import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState(false);
  const [showProfileNotification, setShowProfileNotification] = useState(false);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setFirebaseUser(fbUser);

        try {
          // Get the Firebase ID token
          const token = await fbUser.getIdToken();

          // Set the token on the api instance for all future requests
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          // Sync user with our backend (creates MongoDB user if needed)
          const syncResponse = await api.post('/auth/sync');

          if (syncResponse.data.success) {
            const mongoUser = syncResponse.data.user;
            setUser(mongoUser);

            // Check profile completeness
            const isComplete = mongoUser.fullname?.firstname &&
                              mongoUser.fullname?.lastname;
            setProfileComplete(isComplete);

            if (!isComplete) {
              setShowProfileNotification(true);
            }
          }
        } catch (error) {
          console.error('Error syncing user with backend:', error);
          // If backend sync fails, still set basic user info from Firebase
          setUser({
            email: fbUser.email,
            fullname: { firstname: fbUser.displayName?.split(' ')[0] || 'User' },
            emailVerified: fbUser.emailVerified
          });
        }
      } else {
        // User signed out
        setFirebaseUser(null);
        setUser(null);
        setProfileComplete(false);
        setShowProfileNotification(false);
        delete api.defaults.headers.common['Authorization'];
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Login helper — called after Firebase sign-in completes (email/password, OAuth, etc.)
  // The onAuthStateChanged listener above will handle the rest automatically.
  // This function is kept for backward compatibility with components that call login().
  const login = (userData, token) => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    if (userData) {
      setUser(prev => ({ ...prev, ...userData }));
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
    // onAuthStateChanged will clear the user state
  };

  const value = {
    user,
    firebaseUser,
    loading,
    profileComplete,
    showProfileNotification,
    setShowProfileNotification,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
