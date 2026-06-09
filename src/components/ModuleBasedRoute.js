import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/MultiTenantAuthProvider';

// allowedModules  → grants access if the user has the matching order module (regular/outsourcing)
// allowedPermissions → ALSO grants access if the user has any of these feature permissions
//                      (e.g. an accountant with 'carriers' can open the carriers page)
const ModuleBasedRoute = ({ children, allowedModules = [], allowedPermissions = [] }) => {
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

  // Admins & sub-admins bypass module restrictions
  const isAdmin = user?.is_admin === 1 || Number(user?.role) === 3 || user?.permissions?.includes('subadmin');
  if (isAdmin) return children;

  const perms = Array.isArray(user.permissions) ? user.permissions : [];
  const userModules = perms.filter(p => ['regular', 'outsourcing'].includes(p));

  // Access if the user has a matching order module OR a matching feature permission
  const hasModuleAccess = allowedModules.some(m => userModules.includes(m));
  const hasPermissionAccess = allowedPermissions.some(p => perms.includes(p));

  if (!hasModuleAccess && !hasPermissionAccess) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ModuleBasedRoute;
