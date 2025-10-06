import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/MultiTenantAuthProvider';
import { useMultiTenant } from '../context/MultiTenantProvider';

const RoleBasedRoute = ({ children, allowedRoles = [], fallbackPath = "/home" }) => {
    const { user, loading, isAuthenticated, hasPermission, checkSuperAdminAccess } = useAuth();
    const { tenantLoading } = useMultiTenant();
    
    if (loading || tenantLoading) {
      return (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      );
    }
    
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
  
    const userRole = user?.role;
    
    // Super admins bypass all role restrictions
    if (checkSuperAdminAccess()) {
      return children;
    }
    
    // If no specific roles required, allow access
    if (allowedRoles.length === 0) {
      return children;
    }
    
    // Check if user has any of the required roles
    const hasRequiredRole = allowedRoles.some(role => {
      if (typeof role === 'number') {
        return userRole === role;
      }
      if (typeof role === 'string') {
        // Handle permission-based access
        return hasPermission(role);
      }
      return false;
    });

    if (!hasRequiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

export default RoleBasedRoute;
