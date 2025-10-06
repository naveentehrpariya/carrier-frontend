import React, { useState, useEffect } from 'react';
import {
  BuildingOfficeIcon,
  UsersIcon,
  ChartBarIcon,
  CogIcon,
  PlusIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/MultiTenantAuthProvider';
import { useMultiTenant } from '../../context/MultiTenantProvider';
import Api from '../../api/Api';
import TenantManagement from '../../components/TenantManagement';
import SuperAdminLayout from '../../layout/SuperAdminLayout';

export default function SuperAdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  const { user, logout } = useAuth();
  const { emulateTenant, debugAuth, navigateToTenant } = useMultiTenant();

  useEffect(() => {
    fetchDashboardData();
  }, [selectedPeriod]); // fetchDashboardData is stable and doesn't need to be in deps

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      console.log('📊 SuperAdmin Dashboard: Fetching dashboard data...');
      const [overview, analytics, tenants] = await Promise.all([
        Api.get('/api/super-admin/overview'),
        Api.get(`/api/super-admin/analytics?period=${selectedPeriod}`),
        Api.get('/api/super-admin/tenants?limit=10')
      ]);

      console.log('📊 Dashboard Overview Response:', overview.data);
      console.log('📊 Dashboard Analytics Response:', analytics.data);
      console.log('📊 Dashboard Tenants Response:', tenants.data);
      console.log('📊 Tenants data type:', typeof tenants.data.data);
      console.log('📊 Tenants data array check:', Array.isArray(tenants.data.data));
      console.log('📊 Tenants data content:', tenants.data.data);

      // Parse API responses more flexibly
      const parsedData = {
        overview: overview.data?.data || overview.data,
        analytics: analytics.data?.data || analytics.data,
        tenants: tenants.data?.data || tenants.data?.tenants || tenants.data || []
      };
      
      console.log('🔧 Parsed dashboard data:', parsedData);
      setDashboardData(parsedData);

    } catch (error) {
      console.error('❌ Error fetching super admin dashboard:', error);
      // Only show toast for critical errors that prevent dashboard from functioning
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error('Authentication required - Please login as super admin');
      } else if (error.code === 'ERR_NETWORK') {
        toast.error('Network error - Cannot connect to backend');
      } else {
        console.warn('Dashboard data load failed:', error.message);
        // Don't spam with toast on every data fetch failure
      }
    } finally {
      setLoading(false);
    }
  };


  const handleLogout = async () => {
    try {
      console.log('🔒 Super admin logging out...');
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error during logout');
    }
  };

  const handleTenantStatusChange = async (tenantId, newStatus, reason = '') => {
    try {
      await Api.put(`/api/super-admin/tenants/${tenantId}/status`, {
        status: newStatus,
        reason
      });
      
      toast.success(`Tenant status updated to ${newStatus}`);
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error updating tenant status:', error);
      
      if (error.response?.status === 404) {
        toast.error('Tenant status update API not available');
      } else if (error.response?.status === 401) {
        toast.error('Unauthorized to update tenant status');
      } else {
        toast.error(error.response?.data?.message || 'Failed to update tenant status');
      }
    }
  };

  const handleViewTenant = async (tenant) => {
    let loadingToast = null;
    
    try {
      // Handle different tenant ID field names
      const tenantId = tenant.tenantId || tenant._id || tenant.id;
      
      if (!tenant) {
        console.error('Tenant data:', tenant);
        toast.error('Invalid tenant data');
        return;
      }
      
      // If no tenantId, try to use subdomain to find the tenant
      if (!tenantId && tenant.subdomain) {
        console.log('No tenantId found, trying to use subdomain:', tenant.subdomain);
        // For now, just navigate directly using subdomain
        navigateToTenant(tenant.subdomain);
        return;
      }
      
      if (!tenantId) {
        console.error('Tenant data:', tenant);
        toast.error('Invalid tenant data - missing tenant ID');
        return;
      }
      
      if (tenant.status === 'suspended') {
        toast.error('Cannot access suspended tenant');
        return;
      }
      
      // Debug current authentication state
      console.log('=== DEBUG: Before emulation ===');
      console.log('Tenant to emulate:', tenant);
      debugAuth();
      
      // Show loading toast only when actually accessing tenant
      loadingToast = toast.loading(`Accessing ${tenant.name} environment...`, { duration: 3000 });
      
      // Use emulation API to properly authenticate and navigate
      const success = await emulateTenant(tenantId);
      
      // Dismiss the loading toast
      if (loadingToast) {
        toast.dismiss(loadingToast);
      }
      
      if (!success) {
        toast.error('Failed to access tenant environment');
      }
    } catch (error) {
      console.error('Error emulating tenant:', error);
      // Dismiss the loading toast if it exists
      if (loadingToast) {
        toast.dismiss(loadingToast);
      }
      toast.error('Failed to access tenant environment');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const { overview, analytics, tenants } = dashboardData || {};

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'trial': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircleIcon className="h-4 w-4" />;
      case 'suspended': return <XCircleIcon className="h-4 w-4" />;
      case 'trial': return <ExclamationTriangleIcon className="h-4 w-4" />;
      default: return <CheckCircleIcon className="h-4 w-4" />;
    }
  };

  return (
    <SuperAdminLayout heading="Super Admin Dashboard">
      {/* Dashboard Header */}
      <div className="md:flex justify-between items-center mb-6">
        <div>
          <h2 className="text-white text-2xl mb-2">Super Admin Dashboard</h2>
          <p className="text-gray-400">Welcome back, {user?.name}</p>
        </div>
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="text-white bg-dark1 border border-gray-600 rounded-xl px-4 py-[10px] focus:shadow-0 focus:outline-0"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          
          <button 
            onClick={() => window.location.href = '/super-admin/tenants'}
            className="btn text-black font-bold px-4 py-2 rounded-xl"
          >
            <BuildingOfficeIcon className="h-4 w-4 mr-2" />
            All Tenants
          </button>
        </div>
      </div>
        
      {/* System Overview Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        
        <div className="bg-dark border border-gray-800 shadow rounded-[20px] overflow-hidden">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BuildingOfficeIcon className="h-6 w-6 text-main" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-400 truncate">
                    Total Tenants
                  </dt>
                  <dd className="text-2xl font-semibold text-white">
                    {overview?.overview?.totalTenants || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-dark border border-gray-800 shadow rounded-[20px] overflow-hidden">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-6 w-6 text-green-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-400 truncate">
                    Active Tenants
                  </dt>
                  <dd className="text-2xl font-semibold text-white">
                    {overview?.overview?.activeTenants || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-dark border border-gray-800 shadow rounded-[20px] overflow-hidden">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-6 w-6 text-main" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-400 truncate">
                    Total Users
                  </dt>
                  <dd className="text-2xl font-semibold text-white">
                    {overview?.overview?.totalUsers || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-dark border border-gray-800 shadow rounded-[20px] overflow-hidden">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-6 w-6 text-main" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-400 truncate">
                    System Revenue
                  </dt>
                  <dd className="text-2xl font-semibold text-white">
                    ${(overview?.overview?.totalRevenue || 0).toLocaleString()}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Comprehensive Tenant Management */}
      <div className="mt-8">
        <TenantManagement onViewTenant={handleViewTenant} />
      </div>

      {/* Plan Distribution */}
      <div className="mt-8">
        <div className="bg-dark border border-gray-800 shadow rounded-[20px]">
          <div className="px-6 py-4 border-b border-gray-800">
            <h3 className="text-lg leading-6 font-medium text-white">
              Subscription Plans Distribution
            </h3>
          </div>
          <div className="p-6">
            {overview?.planDistribution?.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {overview.planDistribution.map((plan, index) => (
                  <div key={index} className="text-center">
                    <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                      index % 4 === 0 ? 'bg-blue-900/30' :
                      index % 4 === 1 ? 'bg-green-900/30' :
                      index % 4 === 2 ? 'bg-yellow-900/30' : 'bg-purple-900/30'
                    }`}>
                      <div className={`w-3 h-3 rounded-full ${
                        index % 4 === 0 ? 'bg-blue-500' :
                        index % 4 === 1 ? 'bg-green-500' :
                        index % 4 === 2 ? 'bg-yellow-500' : 'bg-purple-500'
                      }`}></div>
                    </div>
                    <div className="text-2xl font-semibold text-white">
                      {plan.count}
                    </div>
                    <div className="text-sm font-medium text-gray-400 capitalize">
                      {plan._id || 'Unknown'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">
                No plan data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* System Analytics */}
      {analytics?.summary && (
        <div className="mt-8">
          <div className="bg-dark border border-gray-800 shadow rounded-[20px]">
            <div className="px-6 py-4 border-b border-gray-800">
              <h3 className="text-lg leading-6 font-medium text-white">
                System Growth ({selectedPeriod})
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="text-center">
                  <div className="text-2xl font-semibold text-blue-400">
                    {analytics.summary.newTenants || 0}
                  </div>
                  <div className="text-sm text-gray-400">New Tenants</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold text-green-400">
                    {analytics.summary.newUsers || 0}
                  </div>
                  <div className="text-sm text-gray-400">New Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold text-purple-400">
                    {analytics.summary.totalOrders || 0}
                  </div>
                  <div className="text-sm text-gray-400">Total Orders</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold text-yellow-400">
                    ${(analytics.summary.totalRevenue || 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400">Total Revenue</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </SuperAdminLayout>
  );
}
