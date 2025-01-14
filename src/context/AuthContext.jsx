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
        const session = await checkAuth(); // This should fetch user session (including username)
        setUser(session);  // Store username and other session data
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();  // Fetch user data after the component mounts
  }, []);

  const loginHandler = async (username, password) => {
    await apiLogin(username, password); // Call the backend login function
    const session = await checkAuth();  // Fetch user session data (including username)
    setUser(session);  // Set the session data (username) in context
  };

  const logoutHandler = async () => {
    await apiLogout(); // Call backend logout function
    setUser(null); // Reset user state after logging out
  };

  if (loading) {
    return <Loader />;  // Display loader while loading user data
  }

  return (
    <AuthContext.Provider value={{ user, login: loginHandler, logout: logoutHandler }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
