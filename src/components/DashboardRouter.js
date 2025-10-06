import React from 'react';
import { Navigate } from 'react-router-dom';
import { useMultiTenant } from '../context/MultiTenantProvider';
import { useAuth } from '../context/MultiTenantAuthProvider';
import Overview from '../pages/dashboard/Overview';

const DashboardRouter = () => {
  const { isSuperAdmin, tenant } = useMultiTenant();
  const { user, loading } = useAuth();

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
    return <Navigate to="/login" replace />;
  }

  // Route super admins to super admin dashboard
  if (isSuperAdmin) {
    return <Navigate to="/super-admin" replace />;
  }

  // For all tenant users (including admins), show the unified overview dashboard
  // Admin features will be conditionally displayed within the Overview component
  return <Overview />;
};

export default DashboardRouter;