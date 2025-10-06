import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  UsersIcon, 
  TruckIcon, 
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  ChartPieIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/MultiTenantAuthProvider';
import { useMultiTenant } from '../../context/MultiTenantProvider';
import Api from '../../api/Api';
import AuthLayout from '../../layout/AuthLayout';

export default function TenantDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  const { user } = useAuth();
  const { tenant } = useMultiTenant();

  useEffect(() => {
    fetchDashboardData();
  }, [selectedPeriod]); // fetchDashboardData is stable

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [tenantInfo, analytics, usage] = await Promise.all([
        Api.get('/api/tenant-admin/info'),
        Api.get(`/api/tenant-admin/analytics?period=${selectedPeriod}`),
        Api.get('/api/tenant-admin/usage')
      ]);

      setDashboardData({
        tenantInfo: tenantInfo.data.data,
        analytics: analytics.data.data,
        usage: usage.data.data
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AuthLayout heading="Tenant Admin Dashboard">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
        </div>
      </AuthLayout>
    );
  }

  const { tenantInfo, analytics, usage } = dashboardData || {};

  return (
    <AuthLayout heading="Tenant Admin Dashboard">
      {/* Remove min-h-screen and bg-gray-50 as AuthLayout provides layout */}
      {/* Dashboard Header - Adapted for AuthLayout */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex-1 min-w-0 mb-4 md:mb-0">
            <div className="flex items-center">
              <BuildingOfficeIcon className="flex-shrink-0 h-8 w-8 text-main" />
              <div className="ml-4">
                <h1 className="text-xl font-bold text-white md:text-2xl">
                  {tenantInfo?.tenant?.name || tenant?.name || 'Tenant Dashboard'}
                </h1>
                <p className="text-sm text-gray-400">
                  Welcome back, {user?.name}
                </p>
              </div>
            </div>
          </div>
          <div className="flex space-x-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="text-white bg-dark1 border border-gray-600 rounded-xl px-4 py-2 focus:shadow-0 focus:outline-0 focus:border-main"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        
        {/* Total Orders */}
        <div className="bg-dark border border-gray-800 shadow rounded-[20px] overflow-hidden">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TruckIcon className="h-6 w-6 text-main" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-400 truncate">
                      Total Orders
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-white">
                        {analytics?.summary?.totalOrders || 0}
                      </div>
                      {analytics?.summary?.ordersGrowth && (
                        <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                          analytics.summary.ordersGrowth > 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {analytics.summary.ordersGrowth > 0 ? (
                            <ArrowUpIcon className="self-center flex-shrink-0 h-4 w-4" />
                          ) : (
                            <ArrowDownIcon className="self-center flex-shrink-0 h-4 w-4" />
                          )}
                          <span className="sr-only">
                            {analytics.summary.ordersGrowth > 0 ? 'Increased' : 'Decreased'} by
                          </span>
                          {Math.abs(analytics.summary.ordersGrowth)}%
                        </div>
                      )}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue */}
          <div className="bg-dark border border-gray-800 shadow rounded-[20px] overflow-hidden">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CurrencyDollarIcon className="h-6 w-6 text-main" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-400 truncate">
                      Revenue
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-white">
                        ${(analytics?.summary?.totalRevenue || 0).toLocaleString()}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* New Customers */}
          <div className="bg-dark border border-gray-800 shadow rounded-[20px] overflow-hidden">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UsersIcon className="h-6 w-6 text-main" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-400 truncate">
                      New Customers
                    </dt>
                    <dd className="text-2xl font-semibold text-white">
                      {analytics?.summary?.newCustomers || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Usage */}
          <div className="bg-dark border border-gray-800 shadow rounded-[20px] overflow-hidden">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartPieIcon className="h-6 w-6 text-main" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-400 truncate">
                      Users
                    </dt>
                    <dd className="text-2xl font-semibold text-white">
                      {usage?.usage?.users || 0} / {usage?.limits?.maxUsers || '∞'}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          
          {/* Orders by Status */}
          <div className="bg-dark border border-gray-800 shadow rounded-[20px]">
            <div className="px-6 py-4 border-b border-gray-800">
              <h3 className="text-lg leading-6 font-medium text-white">
                Orders by Status
              </h3>
            </div>
            <div className="p-6">
              {analytics?.charts?.ordersByStatus?.length > 0 ? (
                <div className="space-y-4">
                  {analytics.charts.ordersByStatus.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 ${
                          index % 4 === 0 ? 'bg-blue-500' :
                          index % 4 === 1 ? 'bg-green-500' :
                          index % 4 === 2 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                        <span className="text-sm font-medium text-white capitalize">
                          {item.status}
                        </span>
                      </div>
                      <span className="text-sm text-gray-400">
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  No order data available
                </div>
              )}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-dark border border-gray-800 shadow rounded-[20px]">
            <div className="px-6 py-4 border-b border-gray-800">
              <h3 className="text-lg leading-6 font-medium text-white">
                Recent Orders
              </h3>
            </div>
            <div className="p-6">
              {analytics?.recentOrders?.length > 0 ? (
                <div className="space-y-4">
                  {analytics.recentOrders.slice(0, 5).map((order, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-white">
                          Order #{order.order_number || order._id?.slice(-6)}
                        </div>
                        <div className="text-sm text-gray-400">
                          {order.customer?.name}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-white">
                          ${order.total_amount?.toLocaleString() || '0'}
                        </div>
                        <div className={`text-xs px-2 py-1 rounded-full ${
                          order.order_status === 'delivered' ? 'bg-green-900/30 text-green-400' :
                          order.order_status === 'in_transit' ? 'bg-blue-900/30 text-blue-400' :
                          order.order_status === 'pending' ? 'bg-yellow-900/30 text-yellow-400' :
                          'bg-gray-800 text-gray-400'
                        }`}>
                          {order.order_status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  No recent orders
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Usage Warnings */}
        {usage?.warnings && (usage.warnings.nearUserLimit || usage.warnings.nearOrderLimit) && (
          <div className="mt-8">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Usage Warning
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <ul className="list-disc pl-5 space-y-1">
                      {usage.warnings.nearUserLimit && (
                        <li>You're approaching your user limit ({usage.usage.users}/{usage.limits.maxUsers})</li>
                      )}
                      {usage.warnings.nearOrderLimit && (
                        <li>You're approaching your order limit ({usage.usage.orders}/{usage.limits.maxOrders})</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
    </AuthLayout>
  );
}
