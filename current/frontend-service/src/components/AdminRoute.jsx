import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';

/**
 * Protects routes that require administrative privileges.
 */
const AdminRoute = ({ children }) => {
  const { token, user } = useContext(AuthContext);
  const location = useLocation();

  if (!token) {
    // Not authenticated
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (!user?.is_admin) {
    // Authenticated but not an admin
    return <Navigate to="/" replace />;
  }
  return children;
};

export default AdminRoute; 