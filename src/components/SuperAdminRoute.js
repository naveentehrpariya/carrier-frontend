import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/MultiTenantAuthProvider';

const SuperAdminRoute = ({ children }) => {
  const { user, loading, isSuperAdminUser } = useAuth();

  console.log('SuperAdminRoute checks:', {
    isSuperAdminUser,
    user: !!user,
    loading
  });

  // Show loading if auth is still loading
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    console.log('No user found, redirecting to multitenant-login');
    return <Navigate to="/multitenant-login" replace />;
  }

  // Trust auth-derived super admin flag; tenant context can be stale after account switches.
  const hasSuperAdminAccess = Boolean(isSuperAdminUser);
  
  if (!hasSuperAdminAccess) {
    console.log('No super admin access, redirecting to unauthorized');
    return <Navigate to="/unauthorized" replace />;
  }

  console.log('Super admin access granted');
  return children;
};

export default SuperAdminRoute;
