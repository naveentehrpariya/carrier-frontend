import React, { useState, useEffect } from 'react';
import { 
  BuildingOfficeIcon, 
  EyeIcon,
  PencilSquareIcon,
  StopIcon,
  PlayIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CreditCardIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  ArrowPathIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { TrashIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import Api from '../../api/Api';
import TenantActionModal from '../../components/TenantActionModal';
import TenantCreateModal from '../../components/TenantCreateModal';
import SuperAdminLayout from '../../layout/SuperAdminLayout';
import TimeFormat from '../common/TimeFormat';

export default function AllTenantsManagement() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTenants, setTotalTenants] = useState(0);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    console.log('🚀 AllTenantsManagement: Component mounted, about to fetch tenants');
    console.log('Current filters:', { currentPage, searchTerm, statusFilter, planFilter, sortBy, sortOrder });
    fetchTenants();
  }, [currentPage, searchTerm, statusFilter, planFilter, sortBy, sortOrder]);

  // Universal API response parser
  const parseTenantsResponse = (response) => {
    console.log('🔍 parseTenantsResponse: Starting to parse...');
    console.log('🔍 Full response object:', response);
    console.log('🔍 response.data:', response.data);
    console.log('🔍 typeof response.data:', typeof response.data);
    
    if (response.data) {
      console.log('🔍 response.data keys:', Object.keys(response.data));
    } else {
      console.log('⚠️ response.data is null/undefined');
    }
    
    // Try multiple possible data locations
    let tenantData = null;
    let paginationData = null;
    
    if (response.data) {
      // Backend format: { status: true, data: { tenants: [...], pagination: {...} } }
      if (response.data.data && Array.isArray(response.data.data.tenants)) {
        console.log('✅ Found correct format: data.data.tenants');
        tenantData = response.data.data.tenants;
        paginationData = response.data.data.pagination;
      }
      // Alternative: Direct tenants array in data
      else if (Array.isArray(response.data.tenants)) {
        console.log('✅ Found format: data.tenants');
        tenantData = response.data.tenants;
        paginationData = response.data.pagination;
      }
      // Fallback: data.data is array
      else if (Array.isArray(response.data.data)) {
        console.log('✅ Found format: data.data (array)');
        tenantData = response.data.data;
        paginationData = response.data.pagination;
      }
      // Fallback: response.data is directly an array
      else if (Array.isArray(response.data)) {
        console.log('✅ Found format: direct array');
        tenantData = response.data;
      }
      // Debug: Look for any array in the response
      else {
        console.log('🔍 Searching for tenant data in response...');
        console.log('🔍 Available keys:', Object.keys(response.data));
        
        // Check top level
        for (const [key, value] of Object.entries(response.data)) {
          if (Array.isArray(value)) {
            console.log(`🔍 Found array at data.${key}:`, value.length, 'items');
            tenantData = value;
            break;
          }
          // Check nested objects
          if (typeof value === 'object' && value !== null) {
            console.log(`🔍 Checking nested object data.${key}:`, Object.keys(value));
            for (const [nestedKey, nestedValue] of Object.entries(value)) {
              if (Array.isArray(nestedValue)) {
                console.log(`🔍 Found array at data.${key}.${nestedKey}:`, nestedValue.length, 'items');
                tenantData = nestedValue;
                paginationData = value.pagination;
                break;
              }
            }
            if (tenantData) break;
          }
        }
      }
    }
    
    console.log('🔍 Parsed tenant data:', {
      foundTenants: !!tenantData,
      tenantCount: tenantData?.length || 0,
      sampleTenant: tenantData?.[0],
      pagination: paginationData
    });
    
    return {
      tenants: tenantData || [],
      pagination: paginationData || { total: tenantData?.length || 0, totalPages: 1 }
    };
  };
  
  const fetchTenants = async () => {
    console.log('🚀 AllTenantsManagement: Starting fetchTenants...');
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        sortBy,
        sortOrder,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(planFilter !== 'all' && { plan: planFilter })
      });
      
      const apiUrl = `/api/super-admin/tenants?${params}`;
      console.log('📞 API URL:', apiUrl);
      console.log('📋 API Params:', Object.fromEntries(params));

      console.log('📞 Making API call...');
      const response = await Api.get(apiUrl);
      
      console.log('📊 RAW API Response:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        dataType: typeof response.data,
        dataKeys: response.data ? Object.keys(response.data) : 'no data'
      });
      
      // Since the API call is succeeding (you said the endpoints work), let's parse the response
      if (response.status === 200) {
        console.log('✅ API call successful, parsing response...');
        const { tenants: parsedTenants, pagination } = parseTenantsResponse(response);
        
        if (parsedTenants.length > 0) {
          console.log('✅ SUCCESS: Parsed tenants:', parsedTenants);
          console.log('✅ First tenant sample:', parsedTenants[0]);
          
          setTenants(parsedTenants);
          setTotalPages(pagination.totalPages || 1);
          setTotalTenants(pagination.total || parsedTenants.length);
          console.log('✅ Successfully loaded tenants:', parsedTenants.length);
          // Removed excessive success toast that shows on every data fetch
          
          // Look for your specific tenant (for debugging)
          const crossMiles = parsedTenants.find(t => 
            t.name?.toLowerCase().includes('cross') || 
            t.subdomain?.toLowerCase().includes('cross')
          );
          if (crossMiles) {
            console.log('🎉 FOUND YOUR TENANT:', crossMiles);
            // Removed excessive success toast for debugging purposes
          }
        } else {
          setTenants([]);
          setTotalPages(1);
          setTotalTenants(0);
          console.log('ℹ️ No tenants found in parsed data');
          console.log('ℹ️ Original pagination object:', pagination);
          // Only show info toast if this is the initial load, not on every refresh
        }
      } else {
        console.error('❌ API request failed:', response.status, response.data);
        // Fallback to mock data for development
        const mockTenants = [
          {
            _id: '1',
            name: 'Acme Transport LLC',
            subdomain: 'acme-transport',
            status: 'active',
            subscription: { plan: 'professional', status: 'active' },
            userCount: 25,
            orderCount: 150,
            revenue: 15000,
            createdAt: '2024-01-15T10:30:00Z',
            lastActive: '2024-03-01T15:20:00Z',
            admin: { name: 'John Smith', email: 'john@acmetransport.com' }
          },
          {
            _id: '2',
            name: 'Global Logistics Inc',
            subdomain: 'global-logistics',
            status: 'trial',
            subscription: { plan: 'starter', status: 'trial' },
            userCount: 5,
            orderCount: 25,
            revenue: 2500,
            createdAt: '2024-02-10T14:20:00Z',
            lastActive: '2024-03-02T10:15:00Z',
            admin: { name: 'Sarah Johnson', email: 'sarah@globallogistics.com' }
          },
          {
            _id: '3',
            name: 'Fast Delivery Corp',
            subdomain: 'fast-delivery',
            status: 'suspended',
            subscription: { plan: 'enterprise', status: 'suspended' },
            userCount: 50,
            orderCount: 300,
            revenue: 45000,
            createdAt: '2024-01-01T09:00:00Z',
            lastActive: '2024-02-15T12:30:00Z',
            admin: { name: 'Mike Chen', email: 'mike@fastdelivery.com' }
          },
          {
            _id: '4',
            name: 'Regional Carriers',
            subdomain: 'regional-carriers',
            status: 'pending',
            subscription: { plan: 'professional', status: 'pending' },
            userCount: 0,
            orderCount: 0,
            revenue: 0,
            createdAt: '2024-03-01T16:45:00Z',
            lastActive: null,
            admin: { name: 'Lisa Brown', email: 'lisa@regionalcarriers.com' }
          }
        ];
        setTenants(mockTenants);
        setTotalTenants(4);
        setTotalPages(1);
        toast.error('API returned unexpected format - Using demo data');
      }
    } catch (error) {
      console.error('❌ AllTenantsManagement API Error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: error.config,
        stack: error.stack
      });
      
      if (error.response?.status === 401) {
        toast.error('Authentication failed - Please login as super admin');
      } else if (error.response?.status === 403) {
        toast.error('Access denied - Super admin permissions required');
      } else if (error.response?.status === 404) {
        toast.error('API endpoint not found - Check backend configuration');
      } else if (error.code === 'ERR_NETWORK') {
        toast.error('Network error - Is the backend running?');
      } else {
        toast.error(`API Error: ${error.message}`);
      }
      
      // Add mock data for immediate testing
      console.log('🔧 Adding mock data for testing...');
      const mockTenants = [
        {
          _id: 'mock-1',
          name: 'Test Transport Company',
          subdomain: 'test-transport',
          status: 'active',
          subscription: { plan: 'professional', status: 'active' },
          userCount: 12,
          orderCount: 85,
          revenue: 12500,
          createdAt: new Date().toISOString(),
          lastActive: new Date().toISOString(),
          admin: { name: 'Test Admin', email: 'admin@test-transport.com' }
        },
        {
          _id: 'mock-2',
          name: 'Sample Logistics Inc',
          subdomain: 'sample-logistics',
          status: 'active',
          subscription: { plan: 'starter', status: 'active' },
          userCount: 3,
          orderCount: 15,
          revenue: 1500,
          createdAt: new Date().toISOString(),
          lastActive: new Date().toISOString(),
          admin: { name: 'Sample User', email: 'user@sample-logistics.com' }
        }
      ];
      
      setTenants(mockTenants);
      setTotalTenants(2);
      setTotalPages(1);
      toast.success('Loaded mock data for testing');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'suspended': return 'bg-red-100 text-red-800 border-red-200';
      case 'trial': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircleIcon className="h-4 w-4" />;
      case 'suspended': return <XCircleIcon className="h-4 w-4" />;
      case 'trial': return <ClockIcon className="h-4 w-4" />;
      case 'pending': return <ExclamationTriangleIcon className="h-4 w-4" />;
      case 'cancelled': return <StopIcon className="h-4 w-4" />;
      default: return <CheckCircleIcon className="h-4 w-4" />;
    }
  };

  const getPlanBadgeColor = (plan) => {
    switch (plan?.toLowerCase()) {
      case 'enterprise': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'professional': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'starter': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleTenantAction = (tenant, action) => {
    setSelectedTenant(tenant);
    setActionType(action);
    setIsActionModalOpen(true);
  };

  const handleActionComplete = (updatedTenant) => {
    if (updatedTenant && updatedTenant.deleted) {
      setTenants(prevTenants => prevTenants.filter(t => t._id !== updatedTenant._id));
    } else {
      setTenants(prevTenants => 
        prevTenants.map(t => 
          t._id === updatedTenant._id ? { ...t, ...updatedTenant } : t
        )
      );
    }
    setIsActionModalOpen(false);
    setSelectedTenant(null);
    setActionType(null);
    toast.success('Tenant updated successfully');
  };

  const handleCreateTenant = (newTenant) => {
    setTenants(prev => [newTenant, ...prev]);
    setTotalTenants(prev => prev + 1);
    setIsCreateModalOpen(false);
    toast.success('New tenant created successfully');
  };

  const handleViewTenant = async (tenant) => {
    console.log('=== TENANT VIEW DEBUG START ===');
    console.log('🔍 Full tenant object:', tenant);
    console.log('🔍 Tenant name:', tenant.name);
    console.log('🔍 Tenant subdomain:', tenant.subdomain);
    console.log('🔍 Tenant status:', tenant.status);
    console.log('🔍 Tenant ID fields:', {
      _id: tenant._id,
      tenantId: tenant.tenantId,
      id: tenant.id
    });
    
    try {
      if (tenant.status === 'suspended') {
        toast.error('Cannot access suspended tenant environment');
        console.log('❌ Tenant is suspended, aborting');
        return;
      }
      
      // Show loading toast
      const loadingToast = toast.loading(`Accessing ${tenant.name} environment...`);
      
      // Use the tenant emulation API
      const tenantId = tenant.tenantId;
      console.log('🔍 Selected tenant ID for API call:', tenantId);
      console.log('🔍 Making emulation API call to:', '/api/super-admin/emulate-tenant');
      
      const requestPayload = { tenantId };
      console.log('📞 API Request payload:', requestPayload);
      
      const response = await Api.post('/api/super-admin/emulate-tenant', requestPayload);
      
      console.log('📊 Full API Response:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers
      });
      
      toast.dismiss(loadingToast);
      if (response.data.status) {
        console.log('✅ Tenant emulation successful!');
        console.log('🔑 Response data:', response.data);
        toast.success(`Successfully authenticated for ${tenant.name}`);
        const targetUrl = response.data.redirectUrl || `http://localhost:3000/home?tenant=${tenantId}`;
        
        console.log('🔗 Environment detection:', {
          currentHostname: window.location.hostname,
          isLocalDev: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
          tenantSubdomain: tenant.subdomain,
          tenantDomain: tenant.domain,
          tenantFullDomain: tenant.fullDomain
        });
        console.log('🔗 Backend redirectUrl:', response.data.redirectUrl);
        console.log('🔗 Final target URL:', targetUrl);
        const urlWithToken = `${targetUrl}${targetUrl.includes('?') ? '&' : '?'}token=${encodeURIComponent(response.data.token)}`;
        console.log('🔗 Final URL with token:', urlWithToken);
        window.open(urlWithToken, '_blank');
      } else {
        console.error('❌ Tenant emulation failed - API returned success=false');
        console.error('❌ Response data:', response.data);
        toast.error(response.data.message || 'Tenant emulation failed');
      }
    } catch (error) {
      console.error('❌ Error emulating tenant:', error);
      
      if (error.response?.status === 404) {
        toast.error('Tenant emulation API not available');
      } else if (error.response?.status === 401) {
        toast.error('Authentication required - Please login as super admin');
      } else if (error.response?.status === 403) {
        toast.error('Permission denied - Super admin access required');
      } else {
        toast.error(error.response?.data?.message || 'Failed to access tenant environment');
      }
      
      // Fallback: Just open the tenant URL
      console.log('🔄 Falling back to direct URL access');
      const tenantId = tenant.tenantId;
      const fallbackUrl = `http://localhost:3000/home?tenant=${encodeURIComponent(tenantId)}`;
      window.open(fallbackUrl, '_blank');
    }
  };

  const getAvailableActions = (tenant) => {
    const actions = [
      { type: 'view', label: 'View Environment', icon: EyeIcon, color: 'text-blue-600 hover:text-blue-700' },
      { type: 'details', label: 'Details', icon: MagnifyingGlassIcon, color: 'text-gray-600 hover:text-gray-700' }
    ];
    
    switch (tenant.status) {
      case 'active':
        actions.push(
          { type: 'suspend', label: 'Suspend', icon: StopIcon, color: 'text-red-600 hover:text-red-700' },
          { type: 'changePlan', label: 'Change Plan', icon: CreditCardIcon, color: 'text-purple-600 hover:text-purple-700' }
        );
        break;
      case 'suspended':
        actions.push(
          { type: 'activate', label: 'Reactivate', icon: PlayIcon, color: 'text-green-600 hover:text-green-700' },
          { type: 'changePlan', label: 'Change Plan', icon: CreditCardIcon, color: 'text-purple-600 hover:text-purple-700' }
        );
        break;
      case 'trial':
        actions.push(
          { type: 'activate', label: 'Convert to Paid', icon: CheckCircleIcon, color: 'text-green-600 hover:text-green-700' },
          { type: 'suspend', label: 'Suspend', icon: StopIcon, color: 'text-red-600 hover:text-red-700' },
          { type: 'changePlan', label: 'Change Plan', icon: CreditCardIcon, color: 'text-purple-600 hover:text-purple-700' }
        );
        break;
      case 'pending':
        actions.push(
          { type: 'approve', label: 'Approve', icon: CheckCircleIcon, color: 'text-green-600 hover:text-green-700' },
          { type: 'reject', label: 'Reject', icon: XCircleIcon, color: 'text-red-600 hover:text-red-700' }
        );
        break;
    }

    actions.push({ type: 'edit', label: 'Edit Details', icon: PencilSquareIcon, color: 'text-gray-600 hover:text-gray-700' });
    actions.push({ type: 'hardDelete', label: 'Delete Permanently', icon: TrashIcon, color: 'text-red-600 hover:text-red-700' });
    return actions;
  };

 

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  return (
    <SuperAdminLayout heading="All Tenants Management">
      {/* Header */}
      <div className="md:flex justify-between items-center mb-8">
        <div>
          <h2 className="text-white text-2xl mb-2">All Tenants Management</h2>
          <p className="text-gray-400">
            Manage all tenant accounts, subscriptions, and settings from one place
          </p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <button
            onClick={() => fetchTenants()}
            className="btn text-black font-bold px-4 py-2 rounded-xl inline-flex items-center"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-dark2 text-white rounded-2xl border border-gray-600">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BuildingOfficeIcon className="h-12 w-12 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-normal font-medium text-gray-300 truncate">Total Tenants</dt>
                    <dd className="text-2xl font-semibold text-gray-100">{totalTenants}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-dark2 text-white rounded-2xl border border-gray-600">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-12 w-12 text-green-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-normal font-medium text-gray-300 truncate">Active</dt>
                    <dd className="text-2xl font-semibold text-gray-100">
                      {tenants.filter(t => t.status === 'active').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-dark2 text-white rounded-2xl border border-gray-600">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClockIcon className="h-12 w-12 text-blue-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-normal font-medium text-gray-300 truncate">Trial</dt>
                    <dd className="text-2xl font-semibold text-gray-100">
                      {tenants.filter(t => t.status === 'trial').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-dark2 text-white rounded-2xl border border-gray-600">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <XCircleIcon className="h-12 w-12 text-red-500" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-normal font-medium text-gray-300 truncate">Suspended</dt>
                    <dd className="text-2xl font-semibold text-gray-100">
                      {tenants.filter(t => t.status === 'suspended').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mt-12 rounded-xl mb-6">
          <div className="">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search tenants..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-dark1 pl-10 pr-4 py-3 border border-gray-700 
                    rounded-xl text-normal focus:outline-none focus:ring-2 
                    focus:ring-red-500 focus:border-red-500 w-64"
                  />
                </div>
                
                <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-dark1 text-white px-4 py-3 border border-gray-700 rounded-xl text-normal focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500" >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="pending">Pending</option>
                </select>

                <select
                  value={planFilter}
                  onChange={(e) => setPlanFilter(e.target.value)}
                  className="bg-dark1 text-white px-4 py-3 border border-gray-700 rounded-xl text-normal focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500" >
                    <option value="all">All Plans</option>
                    <option value="starter">Starter</option>
                    <option value="professional">Professional</option>
                    <option value="enterprise">Enterprise</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-200">Sort by:</span>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    setSortBy(field);
                    setSortOrder(order);
                  }}
                  className="bg-dark1 text-white px-4 py-3 border border-gray-700 rounded-xl text-normal focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500" >
                    <option value="createdAt-desc">Newest First</option>
                    <option value="createdAt-asc">Oldest First</option>
                    <option value="name-asc">Name A-Z</option>
                    <option value="name-desc">Name Z-A</option>
                    <option value="revenue-desc">Highest Revenue</option>
                    <option value="revenue-asc">Lowest Revenue</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Tenants Table */}
        <div className="rounded-[24px] overflow-hidden border border-gray-800 bg-dark2">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Loading tenants...</p>
            </div>
          ) : tenants.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Status & Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Last Active
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {tenants.map((tenant) => (
                    <tr key={tenant._id} className="hover:bg-gray-900/60 transition-colors">
                      {/* Company Info */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <BuildingOfficeIcon className="h-12 w-12 text-gray-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-white">
                              {tenant.name}
                            </div>
                            {/* <div className="text-sm text-gray-500">
                              {tenant.subdomain}
                            </div> */}
                            <div className="mt-2 flex items-center gap-2"><span className="text-[10px] px-2 py-1 rounded-full bg-gray-800 text-gray-300 border border-gray-700">ID: {tenant.tenantId}</span></div>
                            {tenant.contactInfo?.adminEmail && (
                              <div className="text-xs text-gray-400">
                                {(tenant.contactInfo?.adminName || 'Admin')} • {tenant.contactInfo.adminEmail}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Status & Plan */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-2">
                          <div>
                            <span className={`inline-flex uppercase items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPlanBadgeColor(tenant.billing?.planSlug || tenant.subscription?.planSlug || tenant.subscription?.legacyPlan || '')}`}>
                              <CreditCardIcon className="h-3 w-3 mr-1" />
                              {tenant.billing?.planSlug || tenant.subscription?.planSlug || tenant.subscription?.legacyPlan || 'No Plan'}
                            </span>
                          </div>
                          {(() => {
                            const s = tenant.billing?.status || 'none';
                            const map = {
                              active: ['Active', 'text-emerald-300 bg-emerald-900/40 border-emerald-700'],
                              expired: ['Expired', 'text-rose-300 bg-rose-900/40 border-rose-700'],
                              none: ['No subscription', 'text-gray-400 bg-gray-800 border-gray-700'],
                              trial: ['Trial', 'text-sky-300 bg-sky-900/40 border-sky-700'],
                              cancelled: ['Cancelled', 'text-amber-300 bg-amber-900/40 border-amber-700'],
                              past_due: ['Past due', 'text-amber-300 bg-amber-900/40 border-amber-700'],
                            };
                            const [label, cls] = map[s] || map.none;
                            return (
                              <div>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${cls}`}>{label}</span>
                                {tenant.billing?.endDate && s !== 'none' && (
                                  <span className="ml-2 text-[11px] text-gray-500">
                                    {s === 'expired' ? 'ended ' : 'until '}{new Date(tenant.billing.endDate).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      </td>

                      {/* Created Date */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {tenant.createdAt ? <TimeFormat date={tenant.createdAt} time={false} /> : 'Never'}
                      </td>

                      {/* Revenue */}
                      {/* <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(tenant.revenue)}
                        </div>
                        <div className="text-xs text-gray-500">Total revenue</div>
                      </td> */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {tenant.lastActive ? <TimeFormat date={tenant.lastActive} time={false} /> : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {getAvailableActions(tenant).map((action) => (
                            <button
                              key={action.type}
                              onClick={() => {
                                if (action.type === 'view') {
                                  handleViewTenant(tenant);
                                } else {
                                  handleTenantAction(tenant, action.type);
                                }
                              }}
                              className={`px-3 py-2 rounded-xl bg-gray-800 text-gray-200 hover:bg-gray-700 transition`}
                              title={action.label}
                            >
                              <action.icon className="h-4 w-4" />
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <BuildingOfficeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg text-gray-500 mb-2">No tenants found</p>
              <p className="text-sm text-gray-400 mb-4">
                {searchTerm || statusFilter !== 'all' || planFilter !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'Create your first tenant to get started'
                }
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Create First Tenant
              </button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, totalTenants)} of {totalTenants} tenants
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modals */}
        <TenantCreateModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleCreateTenant}
        />

        <TenantActionModal
          isOpen={isActionModalOpen}
          onClose={() => setIsActionModalOpen(false)}
          tenant={selectedTenant}
          actionType={actionType}
          onActionComplete={handleActionComplete}
        />
    </SuperAdminLayout>
  );
}
