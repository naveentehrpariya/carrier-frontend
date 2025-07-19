import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../context/AuthProvider';

const RoleBasedRoute = ({ children, requiredRoles = [], fallbackPath = "/home" }) => {
  const { isAuthenticated, user, loading } = useContext(UserContext);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If no specific roles required, just check authentication
  if (requiredRoles.length === 0) {
    return children;
  }

  // Check if user has any of the required roles
  const userRole = user?.role || user?.user_type;
  const hasRequiredRole = requiredRoles.some(role => 
    userRole === role || (typeof userRole === 'string' && userRole.toLowerCase() === role.toLowerCase())
  );

  // If user doesn't have required role, redirect to fallback path
  if (!hasRequiredRole) {
    return <Navigate to={fallbackPath} replace />;
  }

  // If user has required role, render the protected component
  return children;
};

export default RoleBasedRoute;
