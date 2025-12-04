import React, { useState, useEffect } from 'react';
import Popup from '../pages/common/Popup';
import { 
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  StopIcon,
  PlayIcon,
  CreditCardIcon,
  ClockIcon 
} from '@heroicons/react/24/outline';
import { TrashIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import Api from '../api/Api';

export default function TenantActionModal({ isOpen, onClose, tenant, actionType, onActionComplete }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    reason: '',
    newPlan: '',
    newStatus: '',
    notes: '',
    maxUsers: '',
    maxOrders: ''
  });
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [tenantDetails, setTenantDetails] = useState(null);
  
  // Debug effect to monitor subscriptionPlans changes
  useEffect(() => {
    console.log('🔍 subscriptionPlans changed:', subscriptionPlans.length, subscriptionPlans);
  }, [subscriptionPlans]);

  useEffect(() => {
    if (isOpen && (actionType === 'changePlan' || actionType === 'activate')) {
      fetchSubscriptionPlans();
    }
    
    // Reset form when modal opens
    if (isOpen) {
      setFormData({
        reason: '',
        newPlan: tenant?.subscription?.plan || '',
        newStatus: getTargetStatus(),
        notes: '',
        maxUsers: tenant?.settings?.maxUsers ?? '',
        maxOrders: tenant?.settings?.maxOrders ?? ''
      });
    }
    if (isOpen && actionType === 'details' && tenant?.tenantId) {
      fetchTenantDetails();
    }
  }, [isOpen, actionType, tenant]);

  const fetchSubscriptionPlans = async () => {
    console.log('🚀 fetchSubscriptionPlans called');
    try {
      console.log('📋 Making API call to /api/super-admin/subscription-plans');
      const response = await Api.get('/api/super-admin/subscription-plans');
      console.log('📋 Subscription plans response:', response.data);
      
      if (response.data.status) {
        // The API returns: { status: true, data: { plans: [...] } }
        const plans = response.data.data?.plans || [];
        console.log('📋 Setting plans:', plans, 'isArray:', Array.isArray(plans), 'length:', plans.length);
        const validPlans = Array.isArray(plans) ? plans : [];
        console.log('📋 Valid plans to set:', validPlans.length);
        setSubscriptionPlans(validPlans);
      } else {
        console.log('⚠️ API returned status false, using fallback plans');
        // Fallback to default plans
        setSubscriptionPlans([
          { _id: 'starter', slug: 'starter', name: 'Starter', limits: { maxUsers: 5, maxOrders: 500 } },
          { _id: 'professional', slug: 'professional', name: 'Professional', limits: { maxUsers: 15, maxOrders: 2000 } },
          { _id: 'enterprise', slug: 'enterprise', name: 'Enterprise', limits: { maxUsers: 0, maxOrders: 0 } }
        ]);
      }
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      console.log('🔄 Using fallback plans due to error');
      // Fallback to default plans on error
      setSubscriptionPlans([
        { _id: 'starter', slug: 'starter', name: 'Starter', limits: { maxUsers: 5, maxOrders: 500 } },
        { _id: 'professional', slug: 'professional', name: 'Professional', limits: { maxUsers: 15, maxOrders: 2000 } },
        { _id: 'enterprise', slug: 'enterprise', name: 'Enterprise', limits: { maxUsers: 0, maxOrders: 0 } }
      ]);
    }
  };

  const fetchTenantDetails = async () => {
    try {
      const response = await Api.get(`/api/super-admin/tenants/${tenant.tenantId}`);
      if (response.data?.status) {
        setTenantDetails(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching tenant details:', error);
    }
  };

  const getTargetStatus = () => {
    switch (actionType) {
      case 'activate':
        return 'active';
      case 'suspend':
        return 'suspended';
      case 'approve':
        return 'active';
      case 'reject':
        return 'suspended';
      case 'startTrial':
        return 'trial';
      default:
        return tenant?.status || '';
    }
  };

  const getActionConfig = () => {
    switch (actionType) {
      case 'suspend':
        return {
          title: 'Suspend Tenant',
          description: `Are you sure you want to suspend ${tenant?.name}? This will prevent users from accessing their account.`,
          icon: StopIcon,
          iconColor: 'text-red-600',
          buttonText: 'Suspend Tenant',
          buttonColor: 'bg-red-600 hover:bg-red-700',
          requiresReason: true,
          dangerAction: true
        };
      case 'activate':
        return {
          title: 'Activate Tenant',
          description: `Activate ${tenant?.name} to restore full access to their account.`,
          icon: PlayIcon,
          iconColor: 'text-green-600',
          buttonText: 'Activate Tenant',
          buttonColor: 'bg-green-600 hover:bg-green-700',
          requiresReason: false,
          dangerAction: false
        };
      case 'changePlan':
        return {
          title: 'Change Subscription Plan',
          description: `Update the subscription plan for ${tenant?.name}.`,
          icon: CreditCardIcon,
          iconColor: 'text-blue-600',
          buttonText: 'Update Plan',
          buttonColor: 'bg-blue-600 hover:bg-blue-700',
          requiresReason: false,
          dangerAction: false
        };
      case 'approve':
        return {
          title: 'Approve Tenant',
          description: `Approve ${tenant?.name} and activate their account.`,
          icon: CheckCircleIcon,
          iconColor: 'text-green-600',
          buttonText: 'Approve Tenant',
          buttonColor: 'bg-green-600 hover:bg-green-700',
          requiresReason: false,
          dangerAction: false
        };
      case 'reject':
        return {
          title: 'Reject Tenant',
          description: `Reject ${tenant?.name}'s application and suspend their account.`,
          icon: XMarkIcon,
          iconColor: 'text-red-600',
          buttonText: 'Reject Tenant',
          buttonColor: 'bg-red-600 hover:bg-red-700',
          requiresReason: true,
          dangerAction: true
        };
      case 'startTrial':
        return {
          title: 'Start Trial',
          description: `Start a trial period for ${tenant?.name}.`,
          icon: ClockIcon,
          iconColor: 'text-blue-600',
          buttonText: 'Start Trial',
          buttonColor: 'bg-blue-600 hover:bg-blue-700',
          requiresReason: false,
          dangerAction: false
        };
      case 'edit':
        return {
          title: 'Edit Tenant',
          description: `Update tenant information for ${tenant?.name}.`,
          icon: CheckCircleIcon,
          iconColor: 'text-gray-600',
          buttonText: 'Save Changes',
          buttonColor: 'bg-gray-600 hover:bg-gray-700',
          requiresReason: false,
          dangerAction: false
        };
      case 'details':
        return {
          title: 'Tenant Details',
          description: `Overview for ${tenant?.name}.`,
          icon: CheckCircleIcon,
          iconColor: 'text-gray-600',
          buttonText: 'Close',
          buttonColor: 'bg-gray-600 hover:bg-gray-700',
          requiresReason: false,
          dangerAction: false
        };
      case 'hardDelete':
        return {
          title: 'Delete Tenant Permanently',
          description: `This will permanently delete ${tenant?.name} and ALL related data (users, orders, customers, carriers, files, etc.). This action cannot be undone.`,
          icon: TrashIcon,
          iconColor: 'text-red-600',
          buttonText: 'Delete Permanently',
          buttonColor: 'bg-red-600 hover:bg-red-700',
          requiresReason: true,
          dangerAction: true
        };
      default:
        return {
          title: 'Manage Tenant',
          description: 'Manage tenant settings.',
          icon: CheckCircleIcon,
          iconColor: 'text-gray-600',
          buttonText: 'Confirm',
          buttonColor: 'bg-gray-600 hover:bg-gray-700',
          requiresReason: false,
          dangerAction: false
        };
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const config = getActionConfig();
    if (actionType === 'details') {
      onClose();
      return;
    }
    
    // Validate required fields
    if (config.requiresReason && !formData.reason.trim()) {
      toast.error('Please provide a reason for this action');
      return;
    }
    
    if (actionType === 'changePlan' && !formData.newPlan) {
      toast.error('Please select a subscription plan');
      return;
    }

    if (actionType === 'hardDelete') {
      if ((formData.confirmText || '').trim().toLowerCase() !== (tenant?.tenantId || '').toLowerCase()) {
        toast.error('Confirmation text does not match tenant ID');
        return;
      }
    }
    setLoading(true);
    try {
      let response;
      const payload = {
        reason: formData.reason,
        notes: formData.notes,
        ...(actionType === 'changePlan' && { plan: formData.newPlan }),
        ...(formData.newStatus && { status: formData.newStatus })
      };

      switch (actionType) {
        case 'suspend':
        case 'activate':
        case 'approve':
        case 'reject':
          response = await Api.put(`/api/super-admin/tenants/${tenant._id}/status`, {
            status: getTargetStatus(),
            reason: formData.reason,
            notes: formData.notes
          });
          break;
        
        case 'changePlan':
          // Use tenantId and the correct endpoint format
          const tenantIdentifier = tenant.tenantId || tenant._id;
          response = await Api.put(`/api/super-admin/tenants/${tenantIdentifier}/plan`, {
            planSlug: formData.newPlan, // Backend expects planSlug (the slug of the subscription plan)
            reason: formData.reason,
            notes: formData.notes
          });
          break;
        
        case 'startTrial':
          response = await Api.post(`/api/super-admin/tenants/${tenant._id}/start-trial`, {
            reason: formData.reason,
            notes: formData.notes
          });
          break;
        
        case 'edit':
          // basic validation for limits
          if (formData.maxUsers !== '' && Number(formData.maxUsers) < 0) {
            toast.error('Allowed users must be 0 or more');
            break;
          }
          if (formData.maxOrders !== '' && Number(formData.maxOrders) < 0) {
            toast.error('Allowed orders must be 0 or more');
            break;
          }
          response = await Api.put(`/api/super-admin/tenants/${tenant.tenantId}/settings`, {
            maxUsers: formData.maxUsers === '' ? undefined : Number(formData.maxUsers),
            maxOrders: formData.maxOrders === '' ? undefined : Number(formData.maxOrders),
            notes: formData.notes
          });
          break;

        case 'hardDelete':
          response = await Api.delete(`/api/super-admin/tenants/${tenant.tenantId}/hard-delete`, {
            data: { reason: formData.reason }
          });
          break;
        
        default:
          throw new Error(`Unknown action type: ${actionType}`);
      }

      if (response.data.status) {
        toast.success(response.data.message || `${config.title} completed successfully`);
        if (actionType === 'hardDelete') {
          onActionComplete({ _id: tenant._id, deleted: true });
        } else {
          onActionComplete(response.data.data || { ...tenant, ...payload });
        }
      } else {
        toast.error(response.data.message || `Failed to ${actionType} tenant`);
      }
    } catch (error) {
      console.error(`Error ${actionType} tenant:`, error);
      
      if (error.response?.status === 404) {
        toast.error(`${config.title} API not available. Please check if the backend is running.`);
      } else if (error.response?.status === 401) {
        toast.error('Unauthorized. Please login as super admin.');
      } else if (error.response?.status === 403) {
        toast.error('Permission denied. This action requires super admin privileges.');
      } else {
        toast.error(error.response?.data?.message || `Failed to ${actionType} tenant`);
      }
    } finally {
      setLoading(false);
    }
  };

  const config = getActionConfig();

  if (!isOpen || !tenant || !actionType) return null;

  return (
    <Popup open={isOpen} onClose={onClose} showTrigger={false} bg={'bg-white'} size={'md:max-w-md'}>
      <div className="mx-auto w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${config.dangerAction ? 'bg-red-100' : 'bg-green-100'}`}>
              <config.icon className={`h-6 w-6 ${config.iconColor}`} />
            </div>
            <h3 className="ml-3 text-lg font-medium text-gray-900">{config.title}</h3>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Description */}
            <p className="text-sm text-gray-600">
              {config.description}
            </p>

            {/* Current tenant info */}
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="text-xs font-medium text-gray-500 mb-1">Current Status</div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900">{tenant.name}</div>
                  <div className="text-xs text-gray-500">{tenant.subdomain}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium capitalize">{tenant.status}</div>
                  {tenant.subscription?.plan && (
                    <div className="text-xs text-gray-500 capitalize">{tenant.subscription.plan}</div>
                  )}
                </div>
              </div>
            </div>

            {actionType === 'details' && (
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="text-xs font-medium text-gray-500 mb-2">Statistics</div>
                <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
                  <div>Created: <span className="text-gray-900">{tenantDetails ? new Date(tenantDetails.tenant?.createdAt).toLocaleString() : '-'}</span></div>
                  <div>Last Active: <span className="text-gray-900">{tenantDetails ? (tenantDetails.lastActive ? new Date(tenantDetails.lastActive).toLocaleString() : 'Never') : '-'}</span></div>
                  <div>Users: <span className="text-gray-900">{tenantDetails?.usage?.users ?? '-'}</span></div>
                  <div>Orders: <span className="text-gray-900">{tenantDetails?.usage?.orders ?? '-'}</span></div>
                  <div>Customers: <span className="text-gray-900">{tenantDetails?.usage?.customers ?? '-'}</span></div>
                  <div>Carriers: <span className="text-gray-900">{tenantDetails?.usage?.carriers ?? '-'}</span></div>
                  <div>Documents: <span className="text-gray-900">{tenantDetails?.usage?.documents ?? '-'}</span></div>
                  <div>Revenue: <span className="text-gray-900">{tenantDetails?.revenue ?? '-'}</span></div>
                </div>
                <div className="mt-3 text-xs text-gray-600">ID: {tenant?.tenantId} • Domain: {tenant?.domain || '—'}</div>
              </div>
            )}

            {/* Plan Selection */}
            {actionType === 'changePlan' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Subscription Plan *
                </label>
                <select
                  name="newPlan"
                  value={formData.newPlan}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                >
                  <option value="">Select a plan</option>
                  {subscriptionPlans.length === 0 ? (
                    <option value="" disabled>Loading plans...</option>
                  ) : (
                    subscriptionPlans.map((plan) => (
                      <option key={plan._id || plan.slug} value={plan.slug}>
                        {plan.name}{plan.limits ? ` (${plan.limits.maxUsers} users, ${plan.limits.maxOrders} orders)` : ''}
                      </option>
                    ))
                  )}
                </select>
              </div>
            )}

            {/* Reason (required for dangerous actions) */}
            {config.requiresReason && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason *
                </label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Provide a reason for this action..."
                  required
                />
              </div>
            )}

            {/* Optional Notes */}
            {!config.requiresReason && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Add any additional notes..."
                />
              </div>
            )}

            {/* Edit settings */}
            {actionType === 'edit' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Allowed users
                  </label>
                  <input
                    type="number"
                    name="maxUsers"
                    min="0"
                    value={formData.maxUsers}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="e.g., 25"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Allowed orders
                  </label>
                  <input
                    type="number"
                    name="maxOrders"
                    min="0"
                    value={formData.maxOrders}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="e.g., 1000"
                  />
                </div>
              </div>
            )}

            {/* Warning for dangerous actions */}
            {config.dangerAction && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <div className="flex">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <p className="text-sm text-red-800">
                      This action may impact the tenant's ability to access their account. Please ensure you have reviewed this decision carefully.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {actionType === 'hardDelete' && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-800">
                  Type the tenant ID <span className="font-semibold">{tenant?.tenantId}</span> to confirm permanent deletion.
                </p>
                <input
                  type="text"
                  name="confirmText"
                  value={formData.confirmText || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmText: e.target.value }))}
                  className="mt-2 w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder={tenant?.tenantId}
                />
                <p className="text-xs text-red-600 mt-2">
                  All users, orders, customers, carriers, files and settings will be deleted.
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed ${config.buttonColor}`}
              >
                {loading ? 'Processing...' : config.buttonText}
              </button>
            </div>
          </form>
      </div>
    </Popup>
  );
}
