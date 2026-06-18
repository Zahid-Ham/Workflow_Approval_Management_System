import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullPage={true} />;
  }

  // Redirect to login if unauthenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to unauthorized or default if role not in allowedRoles list
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If reviewer goes to requester, or requester to reviewer, send back
    const redirectPath = user.role === 'Reviewer' ? '/reviewer' : '/requester';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
