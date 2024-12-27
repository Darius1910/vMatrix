import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, logout as apiLogout, checkAuth } from '../api';
import Loader from '../components/Loader'; // Import the Loader component

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const session = await checkAuth();
        setUser(session);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const loginHandler = async (username, password) => {
    await apiLogin(username, password);
    const session = await checkAuth();
    setUser(session);
  };

  const logoutHandler = async () => {
    await apiLogout();
    setUser(null);
  };

  if (loading) {
    return <Loader />; // Show the loader while loading
  }

  return (
    <AuthContext.Provider value={{ user, login: loginHandler, logout: logoutHandler }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
