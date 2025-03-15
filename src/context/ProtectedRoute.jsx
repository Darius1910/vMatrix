import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>; // Loading state
  if (!user) return <Navigate to="/" replace />; // Redirect to login if not authenticated
  if (adminOnly && user.role !== 'admin') return <Navigate to="/main/dash" replace />;

  return children; // Render the protected route
};

export default ProtectedRoute;
