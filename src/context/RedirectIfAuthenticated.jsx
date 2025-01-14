import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const RedirectIfAuthenticated = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (user) return <Navigate to="/dashboard" />; // Redirect logged-in users to dashboard

  return children; // Render the public page for unauthenticated users
};

export default RedirectIfAuthenticated;
