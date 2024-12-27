import React, { createContext, useState, useContext, useEffect } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { getSession, updateSession } from '../api';
import { useAuth } from './AuthContext';
import { useLocation } from 'react-router-dom';

const ThemeContext = createContext();

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#e20074' },
    background: { default: '#f5f5f5', paper: '#ffffff' },
    text: { primary: '#000000' },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#e20074' },
    background: { default: '#121212', paper: '#1e1e1e' },
    text: { primary: '#ffffff' },
  },
});

export const ThemeProvider = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Determine if the current page is public
  const isPublicPage = ['/forgot-password', '/', '/notfound'].includes(location.pathname);

  useEffect(() => {
    if (user && !isPublicPage) {
      const fetchSession = async () => {
        try {
          const session = await getSession();
          setIsDarkMode(session.darkMode);
        } catch (error) {
          console.error('Failed to fetch session:', error);
          setIsDarkMode(false);
        }
      };
      fetchSession();
    } else {
      setIsDarkMode(false); // Default to light mode on public pages
    }
  }, [user, isPublicPage]);

  const toggleTheme = async () => {
    if (user) {
      const newMode = !isDarkMode;
      setIsDarkMode(newMode);
      await updateSession(newMode); // Save to the backend
    }
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <MuiThemeProvider theme={isDarkMode && !isPublicPage ? darkTheme : lightTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
