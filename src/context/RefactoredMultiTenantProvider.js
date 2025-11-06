import { createContext, useState, useEffect, useContext } from 'react';
import { toast } from 'react-hot-toast';
import Api from '../api/Api';

export const MultiTenantContext = createContext();

export const useMultiTenant = () => {
  const context = useContext(MultiTenantContext);
  if (!context) {
    throw new Error('useMultiTenant must be used within a MultiTenantProvider');
  }
  return context;
};

export default function MultiTenantProvider({ children }) {
  const [tenant, setTenant] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isEmulating, setIsEmulating] = useState(false);
  const [tenantLoading, setTenantLoading] = useState(true);

  // Helper functions for localStorage management
  const loadTenantContext = () => {
    try {
      const raw = localStorage.getItem('tenantContext');
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.warn('Failed to parse tenantContext:', error);
      return null;
    }
  };

  const saveTenantContext = (context) => {
    localStorage.setItem('tenantContext', JSON.stringify(context));
  };

  const saveEmulationBackup = () => {
    const backup = {
      token: localStorage.getItem('token'),
      user: localStorage.getItem('user'),
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('emulationBackup', JSON.stringify(backup));
  };

  const restoreEmulationBackup = () => {
    try {
      const backup = JSON.parse(localStorage.getItem('emulationBackup') || '{}');
      if (backup.token) {
        localStorage.setItem('token', backup.token);
      }
      if (backup.user) {
        localStorage.setItem('user', backup.user);
      }
      return backup;
    } catch (error) {
      console.warn('Failed to restore emulation backup:', error);
      return null;
    }
  };

  const clearEmulationBackup = () => {
    localStorage.removeItem('emulationBackup');
  };

  // Initialize tenant context on mount
  useEffect(() => {
    initializeTenantContext();
  }, []);

  const initializeTenantContext = () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const tenantParam = urlParams.get('tenant');
      const hostname = window.location.hostname;
      
      // Priority 1: Check for existing tenant context
      let context = loadTenantContext();
      
      // Priority 2: URL parameter (development)
      if (!context && tenantParam) {
        if (tenantParam === 'admin') {
          context = {
            tenant: {
              tenantId: 'admin',
              id: 'admin',
              name: 'Super Admin'
            },
            isSuperAdmin: true,
            isEmulating: false
          };
        } else {
          context = {
            tenant: {
              tenantId: tenantParam,
              id: tenantParam,
              name: tenantParam.replace(/-/g, ' ').replace(/\\b\\w/g, l => l.toUpperCase())
            },
            isSuperAdmin: false,
            isEmulating: false
          };
        }
      }
      
      // Priority 3: Subdomain (production)
      if (!context && hostname !== 'localhost') {
        const parts = hostname.split('.');
        if (parts.length >= 3) {
          const subdomain = parts[0];
          if (subdomain === 'admin') {
            context = {
              tenant: {
                tenantId: 'admin',
                id: 'admin', 
                name: 'Super Admin'
              },
              isSuperAdmin: true,
              isEmulating: false
            };
          } else {
            context = {
              tenant: {
                tenantId: subdomain,
                id: subdomain,
                name: subdomain.replace(/-/g, ' ').replace(/\\b\\w/g, l => l.toUpperCase())
              },
              isSuperAdmin: false,
              isEmulating: false
            };
          }
        }
      }
      
      // Apply context if found
      if (context) {
        setTenant(context.tenant);
        setIsSuperAdmin(context.isSuperAdmin);
        setIsEmulating(context.isEmulating || false);
        saveTenantContext(context);
      }
      
    } catch (error) {
      console.error('Error initializing tenant context:', error);
    } finally {
      setTenantLoading(false);
    }
  };

  // Emulate tenant (for super admin with authentication)
  const emulateTenant = async (tenantId) => {
    if (!isSuperAdmin) {
      toast.error('Only super admins can emulate tenants');
      return false;
    }

    if (isEmulating) {
      toast.error('Already emulating a tenant. Stop emulation first.');
      return false;
    }

    try {
      setTenantLoading(true);
      
      // Save backup before emulation
      saveEmulationBackup();
      
      // Call the emulate tenant API
      const response = await Api.post('/api/super-admin/emulate-tenant', {
        tenantId: tenantId
      });
      
      if (response.data.status) {
        const { tenant: tenantData, token, redirectUrl } = response.data;
        
        // Update token in localStorage
        localStorage.setItem('token', token);
        
        // Create minimal emulation user
        const emulationUser = {
          _id: 'emulation-user-' + tenantData.tenantId,
          name: 'Super Admin (Emulating)',
          email: 'superadmin@emulating.local',
          role: 3, // Admin role for the tenant
          tenantId: tenantData.tenantId,
          isTenantAdmin: true,
          isEmulating: true,
          originalSuperAdmin: true
        };
        
        localStorage.setItem('user', JSON.stringify(emulationUser));
        
        // Update tenant context
        const newContext = {
          tenant: {
            tenantId: tenantData.tenantId,
            id: tenantData.tenantId,
            name: tenantData.name,
            status: tenantData.status
          },
          isSuperAdmin: false, // We're now in tenant mode
          isEmulating: true
        };
        
        setTenant(newContext.tenant);
        setIsSuperAdmin(false);
        setIsEmulating(true);
        saveTenantContext(newContext);
        
        toast.success(`Now emulating ${tenantData.name}`);
        
        // Navigate to the tenant URL
        window.location.href = redirectUrl;
        return true;
      }
    } catch (error) {
      console.error('Error emulating tenant:', error);
      
      // Restore backup on error
      restoreEmulationBackup();
      clearEmulationBackup();
      
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please log in again.');
      } else if (error.response?.status === 404) {
        toast.error('Tenant not found.');
      } else {
        toast.error('Failed to emulate tenant: ' + (error.response?.data?.message || error.message));
      }
      return false;
    } finally {
      setTenantLoading(false);
    }
  };

  // Stop tenant emulation
  const stopEmulation = async () => {
    if (!isEmulating) {
      toast.error('Not currently emulating');
      return false;
    }

    try {
      setTenantLoading(true);
      
      // Call the stop emulation API
      const response = await Api.post('/api/super-admin/stop-emulation');
      
      if (response.data.status) {
        const { token, redirectUrl } = response.data;
        
        // Restore from backup or use returned token
        const backup = restoreEmulationBackup();
        if (!backup) {
          // Fallback to API response
          localStorage.setItem('token', token);
          
          const superAdminUser = {
            _id: 'super-admin-user',
            name: 'Super Admin',
            email: 'admin@yourcompany.com', // TODO: Get from API
            role: 'super_admin',
            isSuperAdmin: true
          };
          localStorage.setItem('user', JSON.stringify(superAdminUser));
        }
        
        // Clear emulation context
        clearEmulationBackup();
        
        // Reset to super admin context
        const superAdminContext = {
          tenant: {
            tenantId: 'admin',
            id: 'admin',
            name: 'Super Admin'
          },
          isSuperAdmin: true,
          isEmulating: false
        };
        
        setTenant(superAdminContext.tenant);
        setIsSuperAdmin(true);
        setIsEmulating(false);
        saveTenantContext(superAdminContext);
        
        toast.success('Stopped emulation');
        
        // Navigate to super admin URL
        window.location.href = redirectUrl;
        return true;
      }
    } catch (error) {
      console.error('Error stopping emulation:', error);
      toast.error('Failed to stop emulation: ' + (error.response?.data?.message || error.message));
      return false;
    } finally {
      setTenantLoading(false);
    }
  };

  // Debug authentication (sanitized)
  const debugAuth = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    const tenantContext = loadTenantContext();
    const emulationBackup = localStorage.getItem('emulationBackup');
    
    const debugInfo = {
      hasToken: !!token,
      tokenLength: token?.length,
      hasUser: !!user,
      tenantContext: tenantContext,
      isSuperAdmin,
      isEmulating,
      hasEmulationBackup: !!emulationBackup
    };
    
    console.log('=== MULTITENANT AUTH DEBUG ===');
    console.table(debugInfo);
    console.log('===============================');
    
    return debugInfo;
  };

  const value = {
    // State
    tenant,
    isSuperAdmin,
    isEmulating,
    tenantLoading,
    
    // Actions
    emulateTenant,
    stopEmulation,
    debugAuth,
    
    // Utilities
    loadTenantContext,
    saveTenantContext
  };

  return (
    <MultiTenantContext.Provider value={value}>
      {/* Emulation banner */}
      {isEmulating && tenant && (
        <div className="bg-yellow-600 absolute bottom-0 left-0 right-0 text-white px-4 py-2 text-center text-sm font-medium">
          <span>🎭 Emulating: {tenant.name}</span>
          <button 
            onClick={stopEmulation}
            className="ml-4 px-2 py-1 bg-yellow-700 rounded text-xs hover:bg-yellow-800"
            disabled={tenantLoading}
          >
            Stop Emulation
          </button>
        </div>
      )}
      {children}
    </MultiTenantContext.Provider>
  );
}