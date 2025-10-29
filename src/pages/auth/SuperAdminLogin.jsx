import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import loginbg from "../../img/login-bg.png";
import { useAuth } from '../../context/MultiTenantAuthProvider';
import toast from "react-hot-toast";
import Logotext from "../common/Logotext";

export default function SuperAdminLogin() {
    const { login: multiTenantLogin, isAuthenticated, loading: authLoading, isSuperAdminUser } = useAuth();
    const hasNavigated = useRef(false);
    const navigate = useNavigate();

    const [data, setData] = useState({
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);

    const handleInput = (e) => {
        setData({ ...data, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (data.email === "" || data.password === "") {
            toast.error("Email and password are required.");
            return false;
        }

        setLoading(true);
        
        try {
            // Force super admin login without corporateID
            const result = await multiTenantLogin(
                data.email,
                data.password,
                null, // No corporateID for super admin
                true  // Force super admin login
            );
            
            if (result.success) {
                console.log('Super Admin login result:', result.data);
                
                // Check the actual response to determine redirect
                const { isSuperAdmin: responseIsSuperAdmin } = result.data;
                
                if (responseIsSuperAdmin) {
                    console.log('Redirecting to super admin dashboard');
                    navigate('/super-admin');
                } else {
                    toast.error('Access denied. Super admin credentials required.');
                }
            }
        } catch (error) {
            console.error('Super Admin login error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Navigation check for already authenticated super admin users
    useEffect(() => {
        // Prevent navigation during loading or if already navigated
        if (authLoading || hasNavigated.current) {
            console.log('🚫 Skipping navigation - loading or already navigated:', { authLoading, hasNavigated: hasNavigated.current });
            return;
        }
        
        console.log('🔍 Super Admin navigation check:', {
            isAuthenticated,
            isSuperAdminUser,
            authLoading
        });
        
        // If already authenticated as super admin, redirect to dashboard
        if (isAuthenticated && isSuperAdminUser) {
            hasNavigated.current = true;
            console.log('✅ Super admin already authenticated, redirecting to dashboard');
            navigate('/super-admin');
        }
    }, [authLoading, isAuthenticated, isSuperAdminUser, navigate]);
    
    // Reset navigation flag when authentication state changes
    useEffect(() => {
        if (!isAuthenticated) {
            hasNavigated.current = false;
        }
    }, [isAuthenticated]);

    return (
        <div className="h-[100vh] overflow-hidden lg:flex justify-center items-center">
            <div className="side-image w-full hidden lg:block lg:max-w-[50%]">
                <img src={loginbg} className="img-fluid block m-3 rounded-[30px]" alt="loginimage" />
            </div>
            <div className="w-full h-screen flex lg:block items-center lg:items-auto w-full lg:h-auto lg:max-w-[50%]">
                <div className="max-h-[100vh] py-6 overflow-auto w-full">
                    <div className="w-full py-8 max-w-[400px] lg:max-w-[600px] m-auto lg:py-0 px-8 lg:px-5 text-slate-500">
                        <div className="flex items-center justify-center lg:justify-start">
                            <Link to="/" className="text-3xl font-mono font-bold text-red-500 drunk lowercase">
                                <Logotext />
                            </Link>
                        </div>
                        <h2 className="font-bold mb-1 text-[24px] mt-6 text-center lg:text-start text-white px-12 lg:px-0">
                            Super Admin Access
                        </h2>
                        <p className="text-gray-500 hidden lg:block lg:text-start mb-2">
                            Enter your super admin credentials to access the system
                        </p>
                        <div className='bg-[#D278D5] m-auto lg:m-0 h-[3px] w-[100px] mt-4'></div>
                        
                        <main className="mt-8">
                            <form onSubmit={handleLogin}>
                                <div>
                                    <label className="mt-4 mb-0 block">Email</label>
                                    <input 
                                        required 
                                        name="email" 
                                        onChange={handleInput} 
                                        type="email" 
                                        placeholder="Enter your email"
                                        value={data.email || ''}
                                        className="input"
                                    />
                                </div>
                                <div>
                                    <label className="mt-4 mb-0 block">Password</label>
                                    <input 
                                        required 
                                        name="password" 
                                        onChange={handleInput} 
                                        type="password" 
                                        placeholder="Enter your password"
                                        value={data.password || ''}
                                        className="input"
                                    />
                                </div>
                                
                                <div className="mt-2 flex justify-center lg:justify-start">
                                    <button 
                                        type="submit" 
                                        disabled={loading}
                                        className="btn md mt-6 px-[50px] w-full lg:w-auto main-btn text-black font-bold"
                                    >
                                        {loading ? "Logging in..." : "Access Super Admin"}
                                    </button>
                                </div>
                            </form>
                            
                            {/* Super Admin Help Section */}
                            <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
                                <div className="text-sm text-gray-300">
                                    <p className="font-semibold text-white mb-2">
                                        🔥 Super Admin Portal
                                    </p>
                                    <div className="space-y-1">
                                        <p><strong>Access Level:</strong> System-wide administration</p>
                                        <p><strong>Demo:</strong> admin@gmail.com / 12345678</p>
                                        <p className="text-red-400 text-xs">⚠️ Restricted access - Super admin credentials required</p>
                                    </div>
                                </div>
                            </div>

                            {/* Link back to regular login */}
                            <div className="mt-4 text-center">
                                <Link 
                                    to="/login" 
                                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                    ← Back to regular login
                                </Link>
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        </div>
    );
}