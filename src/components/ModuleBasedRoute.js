import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/MultiTenantAuthProvider';

const ModuleBasedRoute = ({ children, allowedModules }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const userModules = Array.isArray(user.permissions) ? user.permissions.filter(p => ['regular', 'outsourcing'].includes(p)) : [];
  
  // If user has NO modules allowed, they shouldn't access module-specific pages
  if (userModules.length === 0) {
    return <Navigate to="/unauthorized" replace />;
  }

  // If user has AT LEAST ONE of the allowedModules, they can access the page
  const hasAccess = allowedModules.some(m => userModules.includes(m));

  if (!hasAccess) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ModuleBasedRoute;
