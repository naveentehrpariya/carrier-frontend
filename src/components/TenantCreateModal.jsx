import React, { useState, useEffect } from 'react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import Api from '../api/Api';

export default function TenantCreateModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [existingData, setExistingData] = useState({ names: [], slugs: [], subdomains: [] });
  const [formData, setFormData] = useState({
    name: '',
    subdomain: '',
    adminName: '',
    adminEmail: '',
    adminPhone: '',
    subscriptionPlan: 'starter',
    status: 'trial',
    companyInfo: {
      name: '',
      mc_code: '',
      dot_number: '',
      address: '',
      city: '',
      state: '',
      zip: ''
    }
  });
  const [errors, setErrors] = useState({});

  // Fetch existing tenant data for validation
  useEffect(() => {
    const fetchExistingData = async () => {
      try {
        const response = await Api.get('/api/super-admin/tenants?fields=name,subdomain&limit=1000');
        if (response.data.status && response.data.data) {
          const tenants = response.data.data;
          setExistingData({
            names: tenants.map(t => t.name?.toLowerCase()).filter(Boolean),
            slugs: tenants.map(t => t.subdomain?.toLowerCase()).filter(Boolean),
            subdomains: tenants.map(t => t.subdomain?.toLowerCase()).filter(Boolean)
          });
        }
      } catch (error) {
        console.error('Error fetching existing tenant data:', error);
      }
    };

    if (isOpen) {
      fetchExistingData();
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = 'Company name is required';
    } else if (existingData.names.includes(formData.name.toLowerCase().trim())) {
      newErrors.name = 'Company name already exists';
    }

    if (!formData.subdomain.trim()) {
      newErrors.subdomain = 'Subdomain is required';
    } else if (!/^[a-z0-9-]+$/.test(formData.subdomain)) {
      newErrors.subdomain = 'Subdomain can only contain lowercase letters, numbers, and hyphens';
    } else if (existingData.subdomains.includes(formData.subdomain.toLowerCase().trim())) {
      newErrors.subdomain = 'Subdomain already exists';
    }

    if (!formData.adminName.trim()) {
      newErrors.adminName = 'Admin name is required';
    }

    if (!formData.adminEmail.trim()) {
      newErrors.adminEmail = 'Admin email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.adminEmail)) {
      newErrors.adminEmail = 'Invalid email format';
    }

    // Company info
    if (!formData.companyInfo.name.trim()) {
      newErrors['companyInfo.name'] = 'Company name is required';
    }

    if (!formData.companyInfo.mc_code.trim()) {
      newErrors['companyInfo.mc_code'] = 'MC Code is required';
    }

    if (!formData.companyInfo.dot_number.trim()) {
      newErrors['companyInfo.dot_number'] = 'DOT Number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('companyInfo.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        companyInfo: {
          ...prev.companyInfo,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Auto-generate subdomain from company name
    if (name === 'name') {
      const slug = value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      
      setFormData(prev => ({
        ...prev,
        subdomain: slug,
        companyInfo: {
          ...prev.companyInfo,
          name: value
        }
      }));
    }

    // Clear errors for the field being edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await Api.post('/api/super-admin/tenants', formData);
      
      if (response.data.status) {
        toast.success('Tenant created successfully!');
        onSuccess(response.data.data);
        handleClose();
      } else {
        toast.error(response.data.message || 'Failed to create tenant');
      }
    } catch (error) {
      console.error('Error creating tenant:', error);
      
      if (error.response?.status === 409) {
        toast.error('Company name or subdomain already exists');
      } else {
        toast.error(error.response?.data?.message || 'Failed to create tenant');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      subdomain: '',
      adminName: '',
      adminEmail: '',
      adminPhone: '',
      subscriptionPlan: 'starter',
      status: 'trial',
      companyInfo: {
        name: '',
        mc_code: '',
        dot_number: '',
        address: '',
        city: '',
        state: '',
        zip: ''
      }
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="mx-auto max-w-2xl w-full bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <DialogTitle className="text-lg font-medium text-gray-900">
              Create New Tenant
            </DialogTitle>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                      errors.name ? 'border-red-500' : ''
                    }`}
                    placeholder="ACME Transport Inc"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subdomain *
                  </label>
                  <input
                    type="text"
                    name="subdomain"
                    value={formData.subdomain}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                      errors.subdomain ? 'border-red-500' : ''
                    }`}
                    placeholder="acme-transport"
                  />
                  {errors.subdomain && <p className="text-red-500 text-xs mt-1">{errors.subdomain}</p>}
                  <p className="text-gray-500 text-xs mt-1">Will be accessible at: {formData.subdomain || 'your-subdomain'}.yourdomain.com</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subscription Plan
                  </label>
                  <select
                    name="subscriptionPlan"
                    value={formData.subscriptionPlan}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="starter">Starter</option>
                    <option value="professional">Professional</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="trial">Trial</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Admin Information */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-4">Admin Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Admin Name *
                  </label>
                  <input
                    type="text"
                    name="adminName"
                    value={formData.adminName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                      errors.adminName ? 'border-red-500' : ''
                    }`}
                    placeholder="John Doe"
                  />
                  {errors.adminName && <p className="text-red-500 text-xs mt-1">{errors.adminName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Admin Email *
                  </label>
                  <input
                    type="email"
                    name="adminEmail"
                    value={formData.adminEmail}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                      errors.adminEmail ? 'border-red-500' : ''
                    }`}
                    placeholder="admin@acmetransport.com"
                  />
                  {errors.adminEmail && <p className="text-red-500 text-xs mt-1">{errors.adminEmail}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Admin Phone
                  </label>
                  <input
                    type="tel"
                    name="adminPhone"
                    value={formData.adminPhone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="+1234567890"
                  />
                </div>
              </div>
            </div>

            {/* Company Information */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-4">Company Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    MC Code *
                  </label>
                  <input
                    type="text"
                    name="companyInfo.mc_code"
                    value={formData.companyInfo.mc_code}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                      errors['companyInfo.mc_code'] ? 'border-red-500' : ''
                    }`}
                    placeholder="MC123456"
                  />
                  {errors['companyInfo.mc_code'] && <p className="text-red-500 text-xs mt-1">{errors['companyInfo.mc_code']}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    DOT Number *
                  </label>
                  <input
                    type="text"
                    name="companyInfo.dot_number"
                    value={formData.companyInfo.dot_number}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                      errors['companyInfo.dot_number'] ? 'border-red-500' : ''
                    }`}
                    placeholder="DOT789012"
                  />
                  {errors['companyInfo.dot_number'] && <p className="text-red-500 text-xs mt-1">{errors['companyInfo.dot_number']}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    name="companyInfo.address"
                    value={formData.companyInfo.address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="123 Main St"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="companyInfo.city"
                    value={formData.companyInfo.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="New York"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    name="companyInfo.state"
                    value={formData.companyInfo.state}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="NY"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    name="companyInfo.zip"
                    value={formData.companyInfo.zip}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="10001"
                  />
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Tenant'}
              </button>
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  );
}