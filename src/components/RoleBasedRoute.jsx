import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../context/AuthProvider';

const RoleBasedRoute = ({ children, allowedRoles = [], fallbackPath = "/home" }) => {
    const { user, loading } = useContext(UserContext);
    const localUser = JSON.parse(localStorage.getItem('user'));
    
    if (loading) {
      return (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      );
    }
  
    const userRole = user?.role || localUser?.role;
    const hasRequiredRole = allowedRoles.some(role => 
      userRole === role || (typeof userRole === 'string' && userRole.toLowerCase() === role.toLowerCase())
    );
    
    if (allowedRoles.length === 0) {
      return children;
    }

    if (!hasRequiredRole) {
      return <Navigate to={fallbackPath} replace />;
    }

    // If no specific roles required, just check authentication

  return children;
};

export default RoleBasedRoute;
