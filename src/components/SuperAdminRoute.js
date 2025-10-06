import React from 'react';
import { Navigate } from 'react-router-dom';
import { useMultiTenant } from '../context/MultiTenantProvider';
import { useAuth } from '../context/MultiTenantAuthProvider';

const SuperAdminRoute = ({ children }) => {
  const { isSuperAdmin } = useMultiTenant();
  const { user, loading, isSuperAdminUser } = useAuth();

  console.log('SuperAdminRoute checks:', {
    isSuperAdmin,
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
    console.log('No user found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Check both URL-based and auth-based super admin status
  const hasSuperAdminAccess = isSuperAdmin || isSuperAdminUser;
  
  if (!hasSuperAdminAccess) {
    console.log('No super admin access, redirecting to unauthorized');
    return <Navigate to="/unauthorized" replace />;
  }

  console.log('Super admin access granted');
  return children;
};

export default SuperAdminRoute;