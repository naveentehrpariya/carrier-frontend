import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  BuildingOfficeIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  KeyIcon,
  CreditCardIcon,
  CheckCircleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import SuperAdminLayout from '../../layout/SuperAdminLayout';
import Api from '../../api/Api';

export default function AddNewTenant() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [plansLoading, setPlansLoading] = useState(false);
  const [plans, setPlans] = useState([]);
  const [formData, setFormData] = useState({
    companyName: '',
    companySlug: '',
    adminName: '',
    adminEmail: '',
    adminPhone: '',
    adminPassword: '',
    confirmPassword: '',
    subscriptionPlan: ''
  });

  const [errors, setErrors] = useState({});
  const [slugAvailable, setSlugAvailable] = useState(null);
  const [checkingSlug, setCheckingSlug] = useState(false);

  // Auto-generate slug from company name
  useEffect(() => {
    if (formData.companyName) {
      const slug = formData.companyName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      
      setFormData(prev => ({ ...prev, companySlug: slug }));
    }
  }, [formData.companyName]);

  // Fetch active subscription plans
  useEffect(() => {
    const fetchPlans = async () => {
      setPlansLoading(true);
      try {
        const res = await Api.get('/api/super-admin/subscription-plans');
        let fetchedPlans = [];
        // Support both response shapes
        if (Array.isArray(res.data)) {
          fetchedPlans = res.data;
        } else if (Array.isArray(res.data?.plans)) {
          fetchedPlans = res.data.plans;
        } else if (Array.isArray(res.data?.data?.plans)) {
          fetchedPlans = res.data.data.plans;
        } else if (Array.isArray(res.data?.data)) {
          fetchedPlans = res.data.data;
        }
        setPlans(fetchedPlans);
        // Preselect first plan
        if (fetchedPlans.length > 0) {
          setFormData(prev => ({ ...prev, subscriptionPlan: fetchedPlans[0].slug }));
        }
      } catch (error) {
        console.error('Failed to load plans', error);
        toast.error('Failed to load pricing plans');
      } finally {
        setPlansLoading(false);
      }
    };
    fetchPlans();
  }, []);

  // Check slug availability
  useEffect(() => {
    const checkSlugAvailability = async () => {
      if (formData.companySlug && formData.companySlug.length > 2) {
        setCheckingSlug(true);
        try {
          const response = await Api.get(`/api/super-admin/check-slug?slug=${formData.companySlug}`);
          setSlugAvailable(response.data.available);
        } catch (error) {
          console.error('Error checking slug availability:', error);
          setSlugAvailable(null);
        } finally {
          setCheckingSlug(false);
        }
      }
    };

    const debounceTimer = setTimeout(checkSlugAvailability, 500);
    return () => clearTimeout(debounceTimer);
  }, [formData.companySlug]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
    if (!formData.companySlug.trim()) newErrors.companySlug = 'Company slug is required';
    if (!formData.adminName.trim()) newErrors.adminName = 'Admin name is required';
    if (!formData.adminEmail.trim()) newErrors.adminEmail = 'Admin email is required';
    if (!/\S+@\S+\.\S+/.test(formData.adminEmail)) newErrors.adminEmail = 'Please enter a valid email';
    if (!formData.subscriptionPlan) newErrors.subscriptionPlan = 'Please select a pricing plan';
    if (slugAvailable === false) newErrors.companySlug = 'This slug is already taken';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.companyName.trim(),
        subdomain: formData.companySlug.trim(),
        adminName: formData.adminName.trim(),
        adminEmail: formData.adminEmail.trim(),
        adminPhone: formData.adminPhone.trim(),
        subscriptionPlan: formData.subscriptionPlan, // send slug
        companyInfo: {
          name: formData.companyName.trim(),
          address: '',
          phone: formData.adminPhone.trim(),
          email: formData.adminEmail.trim()
        }
      };

      const response = await Api.post('/api/super-admin/tenants', payload);

      if (response.data.status) {
        toast.success('Tenant created successfully!');
        navigate('/super-admin/tenants');
      } else {
        toast.error(response.data.message || 'Failed to create tenant');
      }
    } catch (error) {
      console.error('Error creating tenant:', error);
      const status = error.response?.status;
      const data = error.response?.data || {};
      const apiMessage = data.message;
      const apiErrors = data.errors;

      if (status === 409) {
        toast.error('A tenant with this name or slug already exists');
        setErrors(prev => ({
          ...prev,
          companySlug: prev.companySlug || 'This slug is already taken'
        }));
      } else if (Array.isArray(apiErrors) && apiErrors.length) {
        apiErrors.slice(0, 3).forEach((err) => {
          const msg = typeof err === 'string' ? err : err?.message || err?.msg || apiMessage;
          if (msg) toast.error(String(msg));
          if (typeof msg === 'string') {
            if (/subdomain|slug/i.test(msg)) {
              setErrors(prev => ({ ...prev, companySlug: msg }));
            } else if (/company name|name/i.test(msg)) {
              setErrors(prev => ({ ...prev, companyName: msg }));
            }
          }
        });
      } else {
        // broader fallbacks to ensure we surface actual server issue
        let candidateMsg =
           (typeof data === 'string' && data) ||
           apiMessage ||
           (typeof data?.error === 'string' && data.error) ||
           (typeof data?.title === 'string' && `${data.title}: ${error.message || ''}`) ||
           error.message ||
           (status === 0 && 'Network error - cannot reach backend');
 
         // If the server returned an HTML error page, extract the meaningful text
         if (typeof candidateMsg === 'string' && /<!DOCTYPE|<html|<pre/i.test(candidateMsg)) {
           const preMatch = candidateMsg.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i);
           const content = preMatch ? preMatch[1] : candidateMsg;
           const text = content
             .replace(/<br\s*\/?>(?=\s*|$)/gi, '\n')
             .replace(/<[^>]*>/g, ' ')
             .replace(/&nbsp;/gi, ' ')
             .replace(/\s+/g, ' ')
             .trim();
           const errMatch = text.match(/Error:\s*([^\n]+)/i);
           candidateMsg = errMatch ? `Error: ${errMatch[1].trim()}` : text.slice(0, 200);
         }
 
         const fallbackMsg = candidateMsg || 'Failed to create tenant';
 
         toast.error(fallbackMsg);
 
         if (typeof fallbackMsg === 'string') {
           if (/subdomain|slug/i.test(fallbackMsg)) {
             setErrors(prev => ({ ...prev, companySlug: fallbackMsg }));
           } else if (/company name|name/i.test(fallbackMsg)) {
             setErrors(prev => ({ ...prev, companyName: fallbackMsg }));
           }
         }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SuperAdminLayout heading="Add New Tenant">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <button
              onClick={() => navigate('/super-admin')}
              className="inline-flex items-center text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Dashboard
            </button>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Add New Tenant</h1>
          <p className="text-gray-400">Create a new tenant account with admin user and subscription plan</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Company Information */}
          <div className="bg-dark border border-gray-800 rounded-[20px] p-8">
            <div className="flex items-center mb-6">
              <BuildingOfficeIcon className="h-6 w-6 text-main mr-3" />
              <h2 className="text-xl font-semibold text-white">Company Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className="w-full text-white bg-dark1 border border-gray-600 rounded-xl px-4 py-3 focus:shadow-0 focus:outline-0 focus:border-main"
                  placeholder="Enter company name"
                />
                {errors.companyName && <p className="mt-1 text-sm text-red-400">{errors.companyName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Company Slug (URL) *
                </label>
                <div className="relative">
                  <input
                    type="text" disabled
                    name="companySlug"
                    value={formData.companySlug}
                    onChange={handleInputChange}
                    className="w-full text-white bg-dark1 border border-gray-600 rounded-xl px-4 py-3 focus:shadow-0 focus:outline-0 focus:border-main"
                    placeholder="company-slug"
                  />
                  {checkingSlug && (
                    <div className="absolute right-3 top-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-main"></div>
                    </div>
                  )}
                  {slugAvailable === true && (
                    <CheckCircleIcon className="absolute right-3 top-3 h-5 w-5 text-green-500" />
                  )}
                  {slugAvailable === false && (
                    <div className="absolute right-3 top-3 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✕</span>
                    </div>
                  )}
                </div>
                {slugAvailable === true && (
                  <p className="mt-1 text-sm text-green-400">✓ Slug is available</p>
                )}
                {errors.companySlug && <p className="mt-1 text-sm text-red-400">{errors.companySlug}</p>}
                <p className="mt-1 text-xs text-gray-500">This will be used in the tenant's URL</p>
              </div>
            </div>
          </div>

          {/* Admin User */}
          <div className="bg-dark border border-gray-800 rounded-[20px] p-8">
            <div className="flex items-center mb-6">
              <UserIcon className="h-6 w-6 text-main mr-3" />
              <h2 className="text-xl font-semibold text-white">Admin User</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Admin Name *
                </label>
                <input
                  type="text"
                  name="adminName"
                  value={formData.adminName}
                  onChange={handleInputChange}
                  className="w-full text-white bg-dark1 border border-gray-600 rounded-xl px-4 py-3 focus:shadow-0 focus:outline-0 focus:border-main"
                  placeholder="Admin full name"
                />
                {errors.adminName && <p className="mt-1 text-sm text-red-400">{errors.adminName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Admin Email *
                </label>
                <input
                  type="email"
                  name="adminEmail"
                  value={formData.adminEmail}
                  onChange={handleInputChange}
                  className="w-full text-white bg-dark1 border border-gray-600 rounded-xl px-4 py-3 focus:shadow-0 focus:outline-0 focus:border-main"
                  placeholder="admin@company.com"
                />
                {errors.adminEmail && <p className="mt-1 text-sm text-red-400">{errors.adminEmail}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Admin Phone
                </label>
                <input
                  type="tel"
                  name="adminPhone"
                  value={formData.adminPhone}
                  onChange={handleInputChange}
                  className="w-full text-white bg-dark1 border border-gray-600 rounded-xl px-4 py-3 focus:shadow-0 focus:outline-0 focus:border-main"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              {/* Password fields can be optionally used later; backend generates temp password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Admin Password (optional)
                </label>
                <input
                  type="password"
                  name="adminPassword"
                  value={formData.adminPassword}
                  onChange={handleInputChange}
                  className="w-full text-white bg-dark1 border border-gray-600 rounded-xl px-4 py-3 focus:shadow-0 focus:outline-0 focus:border-main"
                  placeholder="Enter password"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password (optional)
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full text-white bg-dark1 border border-gray-600 rounded-xl px-4 py-3 focus:shadow-0 focus:outline-0 focus:border-main"
                  placeholder="Confirm password"
                />
              </div>
            </div>
          </div>

          {/* Subscription & Settings */}
          <div className="bg-dark border border-gray-800 rounded-[20px] p-8">
            <div className="flex items-center mb-6">
              <CreditCardIcon className="h-6 w-6 text-main mr-3" />
              <h2 className="text-xl font-semibold text-white">Subscription & Settings</h2>
            </div>
            
            {/* Pricing Plans */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {plansLoading && (
                <div className="col-span-3 text-gray-400">Loading plans...</div>
              )}
              {!plansLoading && plans.length === 0 && (
                <div className="col-span-3 text-gray-400">No active plans found</div>
              )}
              {!plansLoading && plans.map((plan) => (
                <div
                  key={plan._id || plan.slug}
                  className={`p-4 border rounded-[15px] cursor-pointer transition-colors ${
                    formData.subscriptionPlan === plan.slug
                      ? 'border-main bg-main/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, subscriptionPlan: plan.slug }))}
                >
                  <div className="flex items-center mb-2">
                    <input
                      type="radio"
                      name="subscriptionPlan"
                      value={plan.slug}
                      checked={formData.subscriptionPlan === plan.slug}
                      onChange={() => {}}
                      className="mr-2"
                    />
                    <h3 className="text-white font-semibold">{plan.name}</h3>
                  </div>
                  <p className="text-main font-medium text-sm">Max Users: {plan?.limits?.maxUsers ?? '-'}</p>
                  <p className="text-gray-400 text-xs mt-1">{plan.description}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Initial Status
                </label>
                <input
                  type="text"
                  value="Active"
                  disabled
                  className="w-full text-white bg-dark1 border border-gray-600 rounded-xl px-4 py-3"
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={() => navigate('/super-admin')}
              className="px-6 py-3 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || slugAvailable === false}
              className="px-6 py-3 btn text-black font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Tenant...' : 'Create Tenant'}
            </button>
          </div>
        </form>
      </div>
    </SuperAdminLayout>
  );
}