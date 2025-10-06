import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/MultiTenantAuthProvider';

const PrivateRoute = ({ children, requiredPermission = null, requiredRole = null }) => {
  const { isAuthenticated, user, loading, hasPermission } = useAuth();

  // Show loading while checking authentication status
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access if requiredRole is specified
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // User is authenticated and has required permissions, render the component
  return children;
};

export default PrivateRoute;
