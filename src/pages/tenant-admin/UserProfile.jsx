import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/MultiTenantAuthProvider';
import toast from 'react-hot-toast';
import AuthLayout from '../../layout/AuthLayout';

export default function UserProfile() {
    const { user, updateProfile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [emailLoading, setEmailLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    
    // Form states
    const [emailForm, setEmailForm] = useState({
        email: ''
    });
    
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        password: '',
        confirmPassword: ''
    });

    // Initialize email form with user data
    useEffect(() => {
        if (user) {
            setEmailForm({
                email: user.email || ''
            });
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
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/auth/edit_user/${user._id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                credentials: 'include',
                body: JSON.stringify({
                    email: emailForm.email
                })
            });

            const data = await response.json();
            
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
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/auth/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                credentials: 'include',
                body: JSON.stringify({
                    id: user._id,
                    password: passwordForm.password
                })
            });

            const data = await response.json();
            
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