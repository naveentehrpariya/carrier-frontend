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
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import Api from '../api/Api';
import TenantActionModal from './TenantActionModal';
import TimeFormat from '../pages/common/TimeFormat';

export default function TenantManagement({ onViewTenant }) {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  useEffect(() => {
    fetchTenants();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter })
      });

      const response = await Api.get(`/api/super-admin/tenants?${params}`);
      
      if (response.status === 200) {
        // Use same universal parser as AllTenantsManagement
        let tenantData = null;
        
        if (response.data) {
          // Try multiple possible data locations
          if (Array.isArray(response.data.data)) {
            tenantData = response.data.data;
          } else if (Array.isArray(response.data.tenants)) {
            tenantData = response.data.tenants;
          } else if (Array.isArray(response.data)) {
            tenantData = response.data;
          } else {
            // Look for any array in the response
            for (const [key, value] of Object.entries(response.data)) {
              if (Array.isArray(value)) {
                tenantData = value;
                break;
              }
            }
          }
        }
        
        if (tenantData && tenantData.length > 0) {
          setTenants(tenantData);
        } else {
          setTenants([]);
        }
        
        setTotalPages(response.data.pagination?.totalPages || 1);
      } else {
        setTenants([]);
      }
    } catch (error) {
      console.error('Error fetching tenants:', error);
      
      // Only show toast for critical errors, not for expected API responses
      if (error.response?.status === 401) {
        toast.error('Authentication required - Please login as super admin');
      } else if (error.response?.status === 403) {
        toast.error('Access denied - Super admin permissions required');
      } else if (error.response?.status === 404) {
        // Don't spam with 404 errors - log them but don't show toast every time
        console.warn('API endpoint not found - Check backend configuration');
      } else if (error.code === 'ERR_NETWORK') {
        toast.error('Network error - Check your connection');
      } else {
        // Only show toast for unexpected errors, not for every API hiccup
        console.warn('Failed to load tenants:', error.message);
      }
      
      setTenants([]);
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
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      case 'professional': return 'bg-blue-100 text-blue-800';
      case 'starter': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleTenantAction = (tenant, action) => {
    setSelectedTenant(tenant);
    setActionType(action);
    setIsActionModalOpen(true);
  };

  const handleActionComplete = (updatedTenant) => {
    // Update the tenant in the list
    setTenants(prevTenants => 
      prevTenants.map(t => 
        t._id === updatedTenant._id ? updatedTenant : t
      )
    );
    setIsActionModalOpen(false);
    setSelectedTenant(null);
    setActionType(null);
  };

  const getAvailableActions = (tenant) => {
    const actions = [];
    
    switch (tenant.status) {
      case 'active':
        actions.push(
          { type: 'suspend', label: 'Suspend', icon: StopIcon, color: 'text-red-600 hover:text-red-700' },
          { type: 'changePlan', label: 'Change Plan', icon: CreditCardIcon, color: 'text-blue-600 hover:text-blue-700' }
        );
        break;
      case 'suspended':
        actions.push(
          { type: 'activate', label: 'Activate', icon: PlayIcon, color: 'text-green-600 hover:text-green-700' },
          { type: 'changePlan', label: 'Change Plan', icon: CreditCardIcon, color: 'text-blue-600 hover:text-blue-700' }
        );
        break;
      case 'trial':
        actions.push(
          { type: 'activate', label: 'Activate', icon: CheckCircleIcon, color: 'text-green-600 hover:text-green-700' },
          { type: 'suspend', label: 'Suspend', icon: StopIcon, color: 'text-red-600 hover:text-red-700' },
          { type: 'changePlan', label: 'Change Plan', icon: CreditCardIcon, color: 'text-blue-600 hover:text-blue-700' }
        );
        break;
      case 'pending':
        actions.push(
          { type: 'approve', label: 'Approve', icon: CheckCircleIcon, color: 'text-green-600 hover:text-green-700' },
          { type: 'reject', label: 'Reject', icon: XCircleIcon, color: 'text-red-600 hover:text-red-700' }
        );
        break;
      default:
        actions.push(
          { type: 'activate', label: 'Activate', icon: PlayIcon, color: 'text-green-600 hover:text-green-700' }
        );
    }

    // Always add view and edit actions
    actions.unshift({ type: 'view', label: 'View', icon: EyeIcon, color: 'text-gray-600 hover:text-gray-700' });
    actions.push({ type: 'edit', label: 'Edit', icon: PencilSquareIcon, color: 'text-gray-600 hover:text-gray-700' });

    return actions;
  };

 

  const filteredTenants = (Array.isArray(tenants) ? tenants : []).filter(tenant => {
    const matchesSearch = !searchTerm || 
      tenant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.subdomain?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || tenant.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="bg-dark border border-gray-800 shadow rounded-[20px]">
        <div className="px-6 py-4 border-b border-gray-800">
          <h3 className="text-lg leading-6 font-medium text-white">
            Tenant Management
          </h3>
        </div>
        <div className="p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-main mx-auto"></div>
          <p className="mt-2 text-sm text-gray-400">Loading tenants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark border border-gray-800 shadow rounded-[20px]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <h3 className="text-lg leading-6 font-medium text-white">
            Tenant Management
          </h3>
          <div className="flex items-center space-x-4">
            {/* Search */}
            <input
              type="text"
              placeholder="Search tenants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-white bg-dark1 border border-gray-600 rounded-xl px-4 py-2 focus:shadow-0 focus:outline-0 focus:border-main"
            />
            
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-white bg-dark1 border border-gray-600 rounded-xl px-4 py-2 focus:shadow-0 focus:outline-0 focus:border-main"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="trial">Trial</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tenant List */}
      <div className="overflow-x-auto">
        {filteredTenants.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Users
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-dark divide-y divide-gray-800">
              {filteredTenants.map((tenant) => (
                <tr key={tenant._id} className="hover:bg-gray-800">
                  {/* Company Info */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-800 rounded-lg flex items-center justify-center">
                        <BuildingOfficeIcon className="h-5 w-5 text-main" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">
                          {tenant.name}
                        </div>
                        <div className="text-sm text-gray-400">
                          {tenant.subdomain}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(tenant.status)}`}>
                      {getStatusIcon(tenant.status)}
                      <span className="ml-1 capitalize">{tenant.status}</span>
                    </span>
                  </td>

                  {/* Plan */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPlanBadgeColor(tenant.subscription?.plan)}`}>
                      <CreditCardIcon className="h-3 w-3 mr-1" />
                      {tenant.subscription?.plan || 'No Plan'}
                    </span>
                  </td>

                  {/* Users */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <div className="flex items-center">
                      <UserGroupIcon className="h-4 w-4 mr-1" />
                      {tenant.userCount || 0}
                    </div>
                  </td>

                  {/* Created Date */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {tenant.createdAt ? <TimeFormat date={tenant.createdAt} time={false} /> : 'N/A'}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      {getAvailableActions(tenant).map((action, index) => (
                        <button
                          key={action.type}
                          onClick={() => {
                            if (action.type === 'view') {
                              onViewTenant(tenant);
                            } else {
                              handleTenantAction(tenant, action.type);
                            }
                          }}
                          className={`p-1 rounded-md ${action.color} transition-colors`}
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
        ) : (
          <div className="text-center py-12">
            <BuildingOfficeIcon className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-sm text-gray-400">No tenants found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-800 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Action Modal */}
      <TenantActionModal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        tenant={selectedTenant}
        actionType={actionType}
        onActionComplete={handleActionComplete}
      />
    </div>
  );
}
