import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { ADMIN_EMAIL } from '../lib/constants';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        if (firebaseUser.email !== ADMIN_EMAIL) {
          setAccessDenied(true);
          await signOut(auth);
          setUser(null);
        } else {
          setAccessDenied(false);
          setUser(firebaseUser);
        }
      } else {
        setUser(null);
        setAccessDenied(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const loginWithGoogle = useCallback(async () => {
    setAccessDenied(false);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user.email !== ADMIN_EMAIL) {
        setAccessDenied(true);
        await signOut(auth);
        throw new Error('Access Denied: You are not authorized to access the admin panel.');
      }
      setUser(result.user);
      return result.user;
    } catch (error) {
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign in cancelled.');
      }
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
    setUser(null);
    setAccessDenied(false);
  }, []);

  const isAdmin = user?.email === ADMIN_EMAIL;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        accessDenied,
        isAdmin,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;
