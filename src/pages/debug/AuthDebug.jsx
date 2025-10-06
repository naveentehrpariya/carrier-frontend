import React from 'react';
import { useAuth } from '../../context/MultiTenantAuthProvider';
import { useMultiTenant } from '../../context/MultiTenantProvider';
import { UserContext } from '../../context/AuthProvider';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export default function AuthDebug() {
  const navigate = useNavigate();
  
  // Multi-tenant auth
  const { 
    isAuthenticated, 
    loading, 
    user, 
    company, 
    isSuperAdminUser 
  } = useAuth();
  
  // Legacy auth
  const {
    isAuthenticated: legacyIsAuthenticated,
    user: legacyUser,
    company: legacyCompany,
    loading: legacyLoading
  } = useContext(UserContext);
  
  // Tenant context
  const { tenant, isSuperAdmin, tenantLoading } = useMultiTenant();
  
  const clearAllAuth = () => {
    const keys = ['token', 'user', 'company', 'admin', 'tenant', 'isSuperAdmin', 'tenantContext'];
    keys.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    toast.success('All authentication data cleared!');
    window.location.reload();
  };
  
  const getStoredData = () => {
    const keys = ['token', 'user', 'company', 'admin', 'tenant', 'isSuperAdmin', 'tenantContext'];
    const stored = {};
    keys.forEach(key => {
      const value = localStorage.getItem(key) || sessionStorage.getItem(key);
      stored[key] = value ? JSON.parse(value) : null;
    });
    return stored;
  };
  
  const storedData = getStoredData();
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Authentication Debug</h1>
          
          <div className="space-y-6">
            {/* Actions */}
            <div className="flex space-x-4">
              <button 
                onClick={clearAllAuth}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Clear All Auth Data
              </button>
              <button 
                onClick={() => navigate('/login')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Go to Login
              </button>
            </div>
            
            {/* Multi-tenant Auth State */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-blue-900 mb-3">Multi-tenant Auth State</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Is Authenticated:</strong> {isAuthenticated ? '✅ Yes' : '❌ No'}</div>
                <div><strong>Loading:</strong> {loading ? '⏳ Yes' : '✅ No'}</div>
                <div><strong>User:</strong> {user?.email || 'None'}</div>
                <div><strong>Company:</strong> {company?.name || 'None'}</div>
                <div><strong>Is Super Admin User:</strong> {isSuperAdminUser ? '✅ Yes' : '❌ No'}</div>
              </div>
            </div>
            
            {/* Legacy Auth State */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-green-900 mb-3">Legacy Auth State</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Is Authenticated:</strong> {legacyIsAuthenticated ? '✅ Yes' : '❌ No'}</div>
                <div><strong>Loading:</strong> {legacyLoading ? '⏳ Yes' : '✅ No'}</div>
                <div><strong>User:</strong> {legacyUser?.email || 'None'}</div>
                <div><strong>Company:</strong> {legacyCompany?.name || 'None'}</div>
              </div>
            </div>
            
            {/* Tenant Context */}
            <div className="bg-purple-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-purple-900 mb-3">Tenant Context</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Is Super Admin:</strong> {isSuperAdmin ? '✅ Yes' : '❌ No'}</div>
                <div><strong>Tenant Loading:</strong> {tenantLoading ? '⏳ Yes' : '✅ No'}</div>
                <div><strong>Tenant:</strong> {tenant?.name || tenant?.subdomain || 'None'}</div>
              </div>
            </div>
            
            {/* Stored Data */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Stored Data</h2>
              <pre className="text-xs bg-white p-3 rounded border overflow-x-auto">
                {JSON.stringify(storedData, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}