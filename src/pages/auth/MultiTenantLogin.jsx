import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { EyeIcon, EyeSlashIcon, UserIcon, LockClosedIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/MultiTenantAuthProvider';
import { useMultiTenant } from '../../context/MultiTenantProvider';

export default function MultiTenantLogin() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    tenantId: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loginMode, setLoginMode] = useState('tenant'); // 'tenant' or 'super_admin'
  const [loginLoading, setLoginLoading] = useState(false);

  const { login, isAuthenticated, loading } = useAuth();
  const { tenant, isSuperAdmin, tenantLoading, tenantError, navigateToSuperAdmin } = useMultiTenant();
  const navigate = useNavigate();

  // Set tenant ID if we're in a tenant context
  useEffect(() => {
    if (tenant && !isSuperAdmin) {
      setFormData(prev => ({
        ...prev,
        tenantId: tenant.id || tenant.subdomain
      }));
    }
  }, [tenant, isSuperAdmin]);

  // Load remembered email
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setFormData(prev => ({
        ...prev,
        email: rememberedEmail,
        rememberMe: true
      }));
    }
  }, []);

  // Redirect if already authenticated
  if (!loading && isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Please enter email and password');
      return;
    }

    if (loginMode === 'tenant' && !formData.tenantId && !tenant) {
      toast.error('Please enter company ID');
      return;
    }

    setLoginLoading(true);

    try {
      const result = await login(
        formData.email,
        formData.password,
        loginMode === 'tenant' ? (formData.tenantId || tenant?.id) : null,
        loginMode === 'super_admin'
      );

      if (result.success) {
        // Handle remember me
        if (formData.rememberMe) {
          localStorage.setItem('rememberedEmail', formData.email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }

        // Navigate to appropriate dashboard
        navigate('/home');
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoginLoading(false);
    }
  };


  const handleSuperAdminSwitch = () => {
    if (!isSuperAdmin) {
      navigateToSuperAdmin();
    } else {
      setLoginMode('super_admin');
    }
  };

  const getTenantDisplayName = () => {
    if (tenantError) return 'Unknown Company';
    if (tenantLoading) return 'Loading...';
    return tenant?.name || 'Your Company';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
            <BuildingOfficeIcon className="h-10 w-10 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {isSuperAdmin ? 'Super Admin Access' : `Sign in to ${getTenantDisplayName()}`}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isSuperAdmin ? 'System Administration Panel' : 'Access your carrier management dashboard'}
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-gray-100">
          
          {/* Login Mode Tabs */}
          {isSuperAdmin && (
            <div className="mb-6">
              <div className="flex rounded-lg bg-gray-100 p-1">
                <button
                  type="button"
                  onClick={() => setLoginMode('tenant')}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                    loginMode === 'tenant'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Tenant User
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMode('super_admin')}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                    loginMode === 'super_admin'
                      ? 'bg-white text-red-600 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Super Admin
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Company ID Field - Only show for tenant mode */}
            {loginMode === 'tenant' && !tenant && (
              <div>
                <label htmlFor="tenantId" className="block text-sm font-medium text-gray-700 mb-2">
                  Company ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="tenantId"
                    name="tenantId"
                    type="text"
                    required
                    value={formData.tenantId}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 text-sm"
                    placeholder="Enter your company ID"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 text-sm"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 text-sm"
                  placeholder="Enter your password"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                  Forgot password?
                </a>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loginLoading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white transition-colors ${
                  loginMode === 'super_admin' 
                    ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:ring-red-500' 
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:ring-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loginLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>

            {/* Super Admin Access Link */}
            {!isSuperAdmin && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleSuperAdminSwitch}
                  className="text-sm text-gray-600 hover:text-red-600 font-medium transition-colors"
                >
                  Super Admin Access →
                </button>
              </div>
            )}
            
            {/* URL Structure Info */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
              <p className="text-xs text-gray-500 font-medium mb-2">URL Structure:</p>
              <div className="space-y-1 text-xs text-gray-600">
                <p><strong>Super Admin:</strong> admin.company.com</p>
                <p><strong>Tenant Admin:</strong> {tenant?.subdomain || 'abc'}.company.com</p>
                <p><strong>Development:</strong> localhost:3000?tenant=admin or ?tenant=abc</p>
              </div>
            </div>

          </form>

          {/* Error Display */}
          {tenantError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{tenantError}</p>
            </div>
          )}

          {/* Demo Credentials */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-2">Demo Credentials:</p>
              <div className="space-y-2 text-xs text-gray-600">
                {loginMode === 'super_admin' ? (
                  <div className="bg-red-50 p-2 rounded border border-red-200">
                    <p className="font-semibold text-red-700 mb-1">Super Admin Access:</p>
                    <p><strong>Email:</strong> superadmin@company.com</p>
                    <p><strong>Password:</strong> superadmin123</p>
                    <p className="text-red-600 text-xs mt-1">⚠ System-wide access</p>
                  </div>
                ) : (
                  <div className="bg-blue-50 p-2 rounded border border-blue-200">
                    <p className="font-semibold text-blue-700 mb-1">{tenant ? 'Tenant Access:' : 'Tenant Login:'}</p>
                    <p><strong>Admin:</strong> admin@{tenant?.subdomain || 'company'}.com | password123</p>
                    <p><strong>User:</strong> user@{tenant?.subdomain || 'company'}.com | password123</p>
                    {!tenant && <p className="text-blue-600 text-xs mt-1"><strong>Company ID:</strong> tenant_example_123</p>}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}