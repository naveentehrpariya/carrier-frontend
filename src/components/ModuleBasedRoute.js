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

  const VALID = ['regular', 'outsourcing'];
  const perms = Array.isArray(user.permissions) ? user.permissions : [];

  // Tenant plan modules (sent at login as user.allowedModules; admin gets the plan's modules).
  // Backward-compat: if unset, treat both modules as enabled so legacy tenants aren't blocked.
  const planRaw = (Array.isArray(user.allowedModules) ? user.allowedModules : [])
    .map(m => String(m).toLowerCase()).filter(m => VALID.includes(m));
  const planModules = planRaw.length ? planRaw : [...VALID];

  // Gate 1 (plan-level): a module-scoped route requires the plan to include that module.
  // Applies to everyone — admin included — so a plan without a module fully disables its pages.
  if (allowedModules.length > 0 && !allowedModules.some(m => planModules.includes(m))) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Gate 2 (per-user): admins & sub-admins have full access within plan-enabled modules.
  const isAdmin = user?.is_admin === 1 || Number(user?.role) === 3 || perms.includes('subadmin');
  if (isAdmin) return children;

  // Regular user: module access limited to perms ∩ plan; feature perms also grant access.
  const userModules = perms.filter(p => VALID.includes(p)).filter(m => planModules.includes(m));
  const hasModuleAccess = allowedModules.some(m => userModules.includes(m));
  const hasPermissionAccess = allowedPermissions.some(p => perms.includes(p));

  if (!hasModuleAccess && !hasPermissionAccess) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ModuleBasedRoute;
