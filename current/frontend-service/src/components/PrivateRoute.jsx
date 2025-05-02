import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';

/**
 * Protects routes that require authentication.
 */
const PrivateRoute = ({ children }) => {
  const { token } = useContext(AuthContext);
  const location = useLocation();
  return token ? children : (
    <Navigate to="/login" replace state={{ from: location }} />
  );
};

export default PrivateRoute; 