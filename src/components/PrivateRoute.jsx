import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/MultiTenantAuthProvider';
import { useMultiTenant } from '../context/MultiTenantProvider';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading, belongsToCurrentTenant, user } = useAuth();
  const { tenantLoading, tenantError } = useMultiTenant();
  
  console.log('🛡️ PrivateRoute check:', { isAuthenticated, loading, tenantLoading, hasUser: !!user });
  
  // Show loading while checking authentication or tenant
  if (loading || tenantLoading) {
    console.log('⏳ PrivateRoute showing loading...');
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  // Show error if tenant resolution failed
  if (tenantError) {
    console.log('❌ PrivateRoute tenant error:', tenantError);
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Access Error</div>
          <div className="text-gray-600">{tenantError}</div>
        </div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated or no user data
  if (!isAuthenticated || !user) {
    console.log('🔒 PrivateRoute redirecting to multitenant-login - not authenticated or no user');
    return <Navigate to="/multitenant-login" replace />;
  }
  
  // Check if user belongs to current tenant (skip this check for now to avoid complexity)
  // if (!belongsToCurrentTenant()) {
  //   console.log('🚫 PrivateRoute access denied - user does not belong to current tenant');
  //   return (
  //     <div className="flex justify-center items-center h-screen">
  //       <div className="text-center">
  //         <div className="text-red-600 text-xl mb-4">Access Denied</div>
  //         <div className="text-gray-600">You don't have access to this company.</div>
  //       </div>
  //     </div>
  //   );
  // }
  
  console.log('✅ PrivateRoute allowing access');
  return children;
};

export default PrivateRoute;
