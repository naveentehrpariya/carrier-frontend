import { createContext, useState, useEffect, useContext } from "react";
import { toast } from "react-hot-toast";
import Api from '../api/Api';
import { useMultiTenant } from './MultiTenantProvider';

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
    const checkAuth = async () => {
      try {
        console.log('🔍 Checking authentication state...');
        
        // Try to get stored token first (for backward compatibility)
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const userData = localStorage.getItem('user') || sessionStorage.getItem('user');
        const companyData = localStorage.getItem('company') || sessionStorage.getItem('company');
        const superAdminData = localStorage.getItem('isSuperAdmin') || sessionStorage.getItem('isSuperAdmin');
        
        console.log('🔑 Stored auth data:', { hasToken: !!token, hasUser: !!userData });
        
        // Check for tenant emulation token first (from super admin view)
        const emulationToken = localStorage.getItem('tenant_emulation_token');
        const emulationData = localStorage.getItem('tenant_emulation_data');
        if (emulationToken && emulationData) {
          try {
            console.log('🔑 Found tenant emulation token, using it for auth');
            const parsedEmulationData = JSON.parse(emulationData);
            
            // Verify the emulation data is still valid (not too old)
            const tokenAge = Date.now() - parsedEmulationData.timestamp;
            const maxAge = 30000; // 30 seconds
            
            if (tokenAge < maxAge) {
              console.log('✅ Emulation token is valid, setting up authentication');
              
              // Set the token for API calls
              localStorage.setItem('token', emulationToken);
              
              // Use the tenant data from emulation
              setIsAuthenticated(true);
              setUser(parsedEmulationData.tenant);
              setIsSuperAdminUser(parsedEmulationData.superAdmin || false);
              
              // Initialize tenant context for API calls
              try {
                const tenantCtx = {
                  tenant: parsedEmulationData.tenant,
                  isSuperAdmin: false,
                  isEmulating: true
                };
                localStorage.setItem('tenantContext', JSON.stringify(tenantCtx));
              } catch (e) {}
              
              // Clean up emulation data after use
              localStorage.removeItem('tenant_emulation_token');
              localStorage.removeItem('tenant_emulation_data');
              
              toast.success('Successfully accessed tenant environment');
              return;
            } else {
              console.log('⚠️ Emulation token expired, cleaning up');
              localStorage.removeItem('tenant_emulation_token');
              localStorage.removeItem('tenant_emulation_data');
            }
          } catch (emulationError) {
            console.error('❌ Error processing emulation data:', emulationError);
            localStorage.removeItem('tenant_emulation_token');
            localStorage.removeItem('tenant_emulation_data');
          }
        }
        
        // Check URL for token parameter (alternative method)
        const urlParams = new URLSearchParams(window.location.search);
        const urlToken = urlParams.get('token');
        if (urlToken) {
          console.log('🔑 Found token in URL, using for authentication');
          localStorage.setItem('token', urlToken);
          
          // If a tenant param is present, force tenant mode and seed context
          const tenantParam = urlParams.get('tenant');
          if (tenantParam) {
            setIsSuperAdminUser(false);
            try {
              localStorage.setItem('tenantContext', JSON.stringify({
                tenant: { subdomain: tenantParam },
                isSuperAdmin: false,
                isEmulating: true
              }));
            } catch (e) {}
          }
          
          // Preserve ?tenant in URL while removing token
          urlParams.delete('token');
          const newUrl = `${window.location.pathname}?${urlParams.toString()}${window.location.hash || ''}`;
          window.history.replaceState({}, '', newUrl);
        }
        
        
        // Check if we have stored data or just got a token from URL
        const currentToken = localStorage.getItem('token');
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
            localStorage.removeItem('user');
            localStorage.removeItem('company');
            localStorage.removeItem('isSuperAdmin');
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
    
    // Only run once on mount
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
        ...(tenantId && !isAdmin && { tenantId }),
        ...(tenantId && isAdmin && { corporateID: tenantId })
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
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('isSuperAdmin', JSON.stringify(userIsSuperAdmin || false));
        
        if (tenantData) {
          localStorage.setItem('tenant', JSON.stringify(tenantData));
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
          localStorage.setItem('company', JSON.stringify(userData.company));
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
    localStorage.setItem('user', JSON.stringify(userData));
    if (companyData) localStorage.setItem('company', JSON.stringify(companyData));
  };

  const logout = async (navigateCallback = null) => {
    console.log('🔒 Starting logout process...');
    
    try {
      const response = await Api.post('/user/logout');
      if (response) {
        // Clear all auth-related storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('company');
        localStorage.removeItem('isSuperAdmin');
        
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
      return ['super_admin', 'all_permissions'];
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

  // Check specific permission
  const hasPermission = (permission) => {
    const userPermissions = getUserPermissions();
    return userPermissions.includes(permission) || userPermissions.includes('all_permissions');
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