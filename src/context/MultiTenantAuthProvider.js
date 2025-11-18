import { createContext, useState, useEffect, useContext } from "react";
import { toast } from "react-hot-toast";
import Api from '../api/Api';
import { useMultiTenant } from './MultiTenantProvider';
import safeStorage, { safeSessionStorage } from '../utils/safeStorage';

export const AuthContext = createContext(); 

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default function MultiTenantAuthProvider(props) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSuperAdminUser, setIsSuperAdminUser] = useState(false);

  const { tenant, isSuperAdmin, canAccessTenant, clearTenantContext } = useMultiTenant();

  // Check for existing authentication on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    const tenantParam = urlParams.get('tenant');

    if (urlToken) {
      safeStorage.setItem('token', urlToken);
      if (tenantParam) {
        const emulationUser = {
          _id: 'emulation-' + tenantParam,
          name: 'Super Admin (Emulating)',
          email: 'emulating@superadmin.local',
          role: 3,
          tenantId: tenantParam,
          isEmulating: true
        };
        safeStorage.setItem('user', JSON.stringify(emulationUser));
        safeStorage.setItem('tenantContext', JSON.stringify({
          tenant: { tenantId: tenantParam, subdomain: tenantParam },
          isSuperAdmin: false,
          isEmulating: true
        }));
      }
      urlParams.delete('token');
      const qs = urlParams.toString();
      const cleanedUrl = `${window.location.pathname}${qs ? `?${qs}` : ''}${window.location.hash || ''}`;
      try {
        window.history.replaceState({}, '', cleanedUrl);
      } catch {}
    }

    const checkAuth = async () => {
      try {
        console.log('🔍 Checking authentication state...');
        
        // Try to get stored token first (for backward compatibility)
        const token = safeStorage.getItem('token') || safeSessionStorage.getItem('token');
        const userData = safeStorage.getItem('user') || safeSessionStorage.getItem('user');
        const companyData = safeStorage.getItem('company') || safeSessionStorage.getItem('company');
        const superAdminData = safeStorage.getItem('isSuperAdmin') || safeSessionStorage.getItem('isSuperAdmin');
        
        console.log('🔑 Stored auth data:', { hasToken: !!token, hasUser: !!userData });
        
        // Clean up any stale emulation tokens that might interfere
        safeStorage.removeItem('tenant_emulation_token');
        safeStorage.removeItem('tenant_emulation_data');
        
        // Check if we have stored data from synchronous token setup
        const currentToken = safeStorage.getItem('token');
        if (currentToken && userData) {
          try {
            const parsedUser = JSON.parse(userData);
            const parsedCompany = companyData ? JSON.parse(companyData) : null;
            const parsedIsSuperAdmin = superAdminData ? JSON.parse(superAdminData) : false;

            console.log('✅ Found stored authentication, restoring session');
            setIsAuthenticated(true);
            setUser(parsedUser);
            setCompany(parsedCompany);
            setIsSuperAdminUser(parsedIsSuperAdmin);
            return;
          } catch (parseError) {
            console.error('❌ Error parsing stored user data:', parseError);
            // Clear corrupted data
            safeStorage.removeItem('user');
            safeStorage.removeItem('company');
            safeStorage.removeItem('isSuperAdmin');
          }
        }
        
        // No stored authentication found - user needs to login
        console.log('❌ No valid stored authentication found');
        setIsAuthenticated(false);
        setUser(null);
        setCompany(null);
        setIsSuperAdminUser(false);
        
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
        setUser(null);
        setCompany(null);
        setIsSuperAdminUser(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []); // Empty dependency array to prevent re-runs

  // Multi-tenant login
  const login = async (email, password, tenantId = null, isAdmin = false) => {
    try {
      setLoading(true);

      const loginData = {
        email,
        password,
        isSuperAdmin: isAdmin,
        ...(tenantId && !isAdmin && { tenantId })
      };

      const response = await Api.post('/user/multitenant-login', loginData);

      if (response.data.status) {
        const { user: userData, tenant: tenantData, token, isSuperAdmin: userIsSuperAdmin } = response.data;
        
        console.log('🎯 Login response data:', {
          userIsSuperAdmin,
          userData: userData?.email,
          tenantData: tenantData?.name,
          hasToken: !!token
        });
        
        // Store authentication data
        safeStorage.setItem('token', token);
        safeStorage.setItem('user', JSON.stringify(userData));
        safeStorage.setItem('isSuperAdmin', JSON.stringify(userIsSuperAdmin || false));
        
        if (tenantData) {
          safeStorage.setItem('tenant', JSON.stringify(tenantData));
        }

        // Update state
        setIsAuthenticated(true);
        setUser(userData);
        setIsSuperAdminUser(userIsSuperAdmin || false);
        
        console.log('🔄 Auth state updated:', {
          isAuthenticated: true,
          isSuperAdminUser: userIsSuperAdmin || false,
          userEmail: userData?.email
        });
        
        if (userData.company) {
          setCompany(userData.company);
          safeStorage.setItem('company', JSON.stringify(userData.company));
        }

        toast.success(response.data.message || 'Login successful!');
        return { success: true, data: response.data };

      } else {
        toast.error(response.data.message || 'Login failed');
        return { success: false, message: response.data.message };
      }

    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(message);
      return { success: false, message, error };
    } finally {
      setLoading(false);
    }
  };

  // Legacy login for backward compatibility
  const legacyLogin = (userData, companyData = null) => {
    setIsAuthenticated(true);
    setUser(userData);
    if (companyData) setCompany(companyData);
    
    // Persist authentication data
    safeStorage.setItem('user', JSON.stringify(userData));
    if (companyData) safeStorage.setItem('company', JSON.stringify(companyData));
  };

  const logout = async (navigateCallback = null) => {
    console.log('🔒 Starting logout process...');
    
    try {
      const response = await Api.get('/user/logout');
      if (response) {
        // Clear all auth-related storage
        safeStorage.removeItem('token');
        safeStorage.removeItem('user');
        safeStorage.removeItem('company');
        safeStorage.removeItem('isSuperAdmin');
        
        setIsAuthenticated(false);
        setUser(null);
        setCompany(null);
        setIsSuperAdminUser(false);
        
        toast.success(response.data.message || 'Logout successful');
        
        if (navigateCallback) navigateCallback();
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast.error(error.response?.data?.message || 'Logout failed');
    }
  };

  // Check if current user is super admin
  const checkSuperAdminAccess = () => {
    return isSuperAdminUser && isSuperAdmin;
  };

  // Check if current user is tenant admin
  const checkTenantAdminAccess = () => {
    return user && (user.isTenantAdmin || user.role === 3);
  };

  // Get user permissions
  const getUserPermissions = () => {
    if (checkSuperAdminAccess()) {
      return ['super_admin'];
    }
    
    if (checkTenantAdminAccess()) {
      return ['tenant_admin', 'user_management', 'tenant_settings', 'reports'];
    }
    
    // Regular user permissions based on role
    const rolePermissions = {
      0: ['view_orders', 'basic_access'], // Driver
      1: ['create_orders', 'edit_orders', 'view_reports'], // Staff  
      2: ['manage_orders', 'view_analytics', 'manage_customers'], // Manager
      3: ['full_access'] // Admin
    };
    
    return rolePermissions[user?.role] || ['basic_access'];
  };

  // Check specific permission (super admins have all permissions)
  const hasPermission = (permission) => {
    if (checkSuperAdminAccess()) {
      return true; // Super admins have all permissions
    }
    
    const userPermissions = getUserPermissions();
    return userPermissions.includes(permission) || userPermissions.includes('full_access');
  };

  // Error handler
  function handleErrors(error) { 
    console.error(error);
    
    // Handle token expiration
    if (error.response?.status === 401) {
      logout(); // Don't await here as it's in a sync function
      toast.error('Session expired. Please login again.');
      return;
    }

    const errors = error?.response?.data?.errors;
    
    if (errors && Array.isArray(errors)) {
      errors.forEach(errorMsg => {
        toast.error(errorMsg); 
      });
    } else if (error?.response?.data?.message) {
      toast.error(error.response.data.message);
    } else if (error?.data?.message) {
      toast.error(error.data.message);
    } else {
      toast.error('An unexpected error occurred');
    }
  }

  // Get current tenant info
  const getCurrentTenant = () => {
    return tenant;
  };

  // Check if user belongs to current tenant
  const belongsToCurrentTenant = () => {
    if (isSuperAdminUser) return true;
    if (!user || !tenant) return false;
    return user.tenantId === tenant.id;
  };

  const values = {
    // Authentication state
    isAuthenticated,
    user,
    company,
    loading,
    isSuperAdminUser,
    
    // Authentication actions
    login,
    logout,
    legacyLogin,
    
    // Permission checking
    checkSuperAdminAccess,
    checkTenantAdminAccess,
    getUserPermissions,
    hasPermission,
    
    // Tenant-related
    getCurrentTenant,
    belongsToCurrentTenant,
    
    // Utilities
    handleErrors,
    
    // Legacy support
    setUser,
    setCompany,
    setIsAuthenticated,
    Errors: handleErrors // Backward compatibility
  };

  return (
    <AuthContext.Provider value={values}>
      {props.children}
    </AuthContext.Provider>
  );
}