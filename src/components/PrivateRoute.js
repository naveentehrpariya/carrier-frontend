import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../context/AuthProvider';

const PrivateRoute = ({ children, requiredPermission = null, requiredRole = null }) => {
  const { isAuthenticated, user, loading } = useContext(UserContext);

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

  // Check permission-based access if requiredPermission is specified
  if (requiredPermission) {
    // Assuming permissions are stored as an array in user object
    // You may need to adjust this based on your user object structure
    const userPermissions = user.permissions || [];
    
    if (!userPermissions.includes(requiredPermission)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // User is authenticated and has required permissions, render the component
  return children;
};

export default PrivateRoute;
