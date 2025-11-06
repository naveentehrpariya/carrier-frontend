import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/MultiTenantAuthProvider';
import toast from 'react-hot-toast';
import AuthLayout from '../../layout/AuthLayout';
import safeStorage from '../../utils/safeStorage';
import Api from '../../api/Api';

export default function UserProfile() {
    const { user, updateProfile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [emailLoading, setEmailLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [subscriptionData, setSubscriptionData] = useState(null);
    const [subscriptionLoading, setSubscriptionLoading] = useState(true);
    
    // Form states
    const [emailForm, setEmailForm] = useState({
        email: ''
    });
    
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        password: '',
        confirmPassword: ''
    });

    // Fetch subscription data
    const fetchSubscriptionData = async () => {
        if (!user || (!user.isTenantAdmin && user.role !== 3)) {
            console.log('🙅‍♂️ User is not tenant admin, skipping subscription fetch');
            setSubscriptionLoading(false);
            return;
        }

        try {
            console.log('🚀 Fetching subscription data for user:', user.name);
            const response = await Api.get('/api/tenant-admin/subscription');
            console.log('📊 Subscription API response:', response.data);
            
            if (response.data.status) {
                console.log('✅ Setting subscription data:', response.data.data.subscription);
                setSubscriptionData(response.data.data.subscription);
            } else {
                console.error('❌ Failed to fetch subscription data:', response.data.message);
            }
        } catch (error) {
            console.error('⚠️ Error fetching subscription data:', error);
        } finally {
            setSubscriptionLoading(false);
        }
    };

    // Initialize email form with user data and fetch subscription
    useEffect(() => {
        if (user) {
            setEmailForm({
                email: user.email || ''
            });
            fetchSubscriptionData();
        }
    }, [user]);

    const handleEmailChange = (e) => {
        setEmailForm({
            ...emailForm,
            [e.target.name]: e.target.value
        });
    };

    const handlePasswordChange = (e) => {
        setPasswordForm({
            ...passwordForm,
            [e.target.name]: e.target.value
        });
    };

    const handleUpdateEmail = async (e) => {
        e.preventDefault();
        
        if (!emailForm.email) {
            toast.error('Email is required');
            return;
        }

        if (emailForm.email === user.email) {
            toast.error('New email must be different from current email');
            return;
        }

        setEmailLoading(true);
        
        try {
            const response = await Api.post(`/api/auth/edit_user/${user._id}`, {
                email: emailForm.email
            });

            const data = response.data;
            
            if (data.status) {
                toast.success('Email updated successfully!');
                // Update user context if needed
                if (updateProfile) {
                    updateProfile({ ...user, email: emailForm.email });
                }
            } else {
                toast.error(data.message || 'Failed to update email');
            }
        } catch (error) {
            console.error('Email update error:', error);
            toast.error('Network error. Please try again.');
        } finally {
            setEmailLoading(false);
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        
        if (!passwordForm.password || !passwordForm.confirmPassword) {
            toast.error('All password fields are required');
            return;
        }

        if (passwordForm.password.length < 8) {
            toast.error('Password must be at least 8 characters long');
            return;
        }

        if (passwordForm.password !== passwordForm.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setPasswordLoading(true);
        
        try {
            const response = await Api.post('/api/auth/change-password', {
                id: user._id,
                password: passwordForm.password
            });

            const data = response.data;
            
            if (data.status) {
                toast.success('Password updated successfully!');
                setPasswordForm({
                    currentPassword: '',
                    password: '',
                    confirmPassword: ''
                });
            } else {
                toast.error(data.message || 'Failed to update password');
            }
        } catch (error) {
            console.error('Password update error:', error);
            toast.error('Network error. Please try again.');
        } finally {
            setPasswordLoading(false);
        }
    };

    if (!user) {
        return (
            <AuthLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-gray-400">Loading profile...</div>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout>
            <div className="p-6 max-w-4xl mx-auto">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        User Profile
                    </h1>
                    <p className="text-gray-400">
                        Manage your account settings and security
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Profile Information */}
                    <div className="bg-dark border border-gray-700 rounded-[30px] shadow-lg">
                        <div className="p-6">
                            <div className="flex items-center mb-6">
                                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-[15px] md:rounded-[20px] flex items-center justify-center">
                                    <span className="capitalize text-white font-bold text-xl">
                                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                    </span>
                                </div>
                                <div className="ml-4">
                                    <h2 className="text-md font-semibold text-white capitalize">
                                        {user.name || 'User'}
                                    </h2>
                                    <p className="text-gray-400 text-sm my-1">
                                        {user.email}
                                    </p>
                                    <span className="inline-block px-2 py-1 bg-blue-600 text-blue-100 text-[10px] rounded-full mt-1">
                                        {user.is_admin ? 'Tenant Admin' : 'User'}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">User ID:</span>
                                    <span className="text-white font-mono text-xs">{user._id}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Corporate ID:</span>
                                    <span className="text-white">{user.corporateId || user.corporateID || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Role:</span>
                                    <span className="text-white">{user.is_admin ? 'Tenant Administrator' : 'User'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Status:</span>
                                    <span className={user.status === 'active' ? 'text-green-400' : 'text-red-400'}>
                                        {user.status === 'active' ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                {user.company && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Company:</span>
                                        <span className="text-white">{user.company.name}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Update Email */}
                    <div className="bg-dark border border-gray-700 rounded-[30px] shadow-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                </svg>
                                Update Email
                            </h3>
                            
                            <form onSubmit={handleUpdateEmail} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={emailForm.email}
                                        onChange={handleEmailChange}
                                        className="input-sm"
                                        placeholder="Enter new email address"
                                        required
                                    />
                                </div>
                                
                                <button
                                    type="submit"
                                    disabled={emailLoading}
                                    className="btn sm text-black m-auto"
                                >
                                    {emailLoading ? 'Updating...' : 'Update Email'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Subscription Information - Only for Tenant Admins */}
                {(user.isTenantAdmin || user.role === 3) && (
                    <div className="mt-8">
                        <div className="bg-dark border border-gray-700 rounded-[30px] shadow-lg">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Subscription Details
                                </h3>
                                
                                {subscriptionLoading ? (
                                    <div className="flex items-center justify-center h-32">
                                        <div className="text-gray-400">Loading subscription details...</div>
                                    </div>
                                ) : subscriptionData ? (
                                    <div className="space-y-6">
                                        {/* Plan Information */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-300 mb-2">Current Plan</h4>
                                                <div className="flex items-center">
                                                    <span className="text-lg font-semibold text-white">{subscriptionData.planName}</span>
                                                    <span className={`ml-3 px-2 py-1 text-xs rounded-full ${
                                                        subscriptionData.isActive ? 'bg-green-600 text-green-100' : 'bg-red-600 text-red-100'
                                                    }`}>
                                                        {subscriptionData.status}
                                                    </span>
                                                </div>
                                                <p className="text-gray-400 text-sm mt-1">{subscriptionData.planDescription}</p>
                                            </div>
                                            
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-300 mb-2">Billing</h4>
                                                <p className="text-white capitalize">{subscriptionData.billingCycle}</p>
                                                {subscriptionData.daysUntilRenewal && (
                                                    <p className="text-gray-400 text-sm mt-1">
                                                        {subscriptionData.daysUntilRenewal} days until renewal
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Usage Statistics */}
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-300 mb-3">Usage & Limits</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {Object.entries(subscriptionData.usage).map(([key, usage]) => (
                                                    <div key={key} className="bg-gray-800 rounded-lg p-3">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="text-sm text-gray-300 capitalize">{key}</span>
                                                            <span className="text-sm text-white">
                                                                {usage.current} / {usage.limit === 999999 ? '∞' : usage.limit}
                                                            </span>
                                                        </div>
                                                        <div className="w-full bg-gray-700 rounded-full h-2">
                                                            <div 
                                                                className={`h-2 rounded-full ${
                                                                    usage.percentage > 90 ? 'bg-red-500' : 
                                                                    usage.percentage > 75 ? 'bg-yellow-500' : 'bg-green-500'
                                                                }`}
                                                                style={{ width: `${Math.min(usage.percentage, 100)}%` }}
                                                            ></div>
                                                        </div>
                                                        {usage.percentage > 100 && (
                                                            <p className="text-red-400 text-xs mt-1">Over limit by {usage.percentage - 100}%</p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Plan Features */}
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-300 mb-3">Plan Features</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {subscriptionData.planFeatures.map((feature, index) => (
                                                    <span key={index} className="px-3 py-1 bg-blue-600 text-blue-100 text-xs rounded-full">
                                                        {feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-gray-400">No subscription information available</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Update Password */}
                <div className="mt-8">
                    <div className="bg-dark border border-gray-700 rounded-[30px] shadow-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Update Password
                            </h3>
                            
                            <form onSubmit={handleUpdatePassword}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-300 mb-1">
                                            New Password
                                        </label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={passwordForm.password}
                                            onChange={handlePasswordChange}
                                            className="input-sm"
                                            placeholder="Enter new password"
                                            minLength="8"
                                            required
                                        />
                                        <p className="text-xs  text-gray-400 mt-2">
                                            Password must be at least 8 characters long
                                        </p>
                                    </div>
                                    
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-300 mb-1">
                                            Confirm New Password
                                        </label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={passwordForm.confirmPassword}
                                            onChange={handlePasswordChange}
                                            className="input-sm"
                                            placeholder="Confirm new password"
                                            required
                                        />
                                    </div>
                                    
                                    <div className="md:col-span-2">
                                        <button
                                            type="submit"
                                            disabled={passwordLoading}
                                            className="btn text-black"
                                        >
                                            {passwordLoading ? 'Updating...' : 'Update Password'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthLayout>
    );
}