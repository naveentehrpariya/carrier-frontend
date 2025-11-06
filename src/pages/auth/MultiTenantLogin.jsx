import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import loginbg from "../../img/login-bg.png";
import { useAuth } from '../../context/MultiTenantAuthProvider';
import safeStorage from '../../utils/safeStorage';
import Logotext from "../common/Logotext";

export default function MultiTenantLogin() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [loginLoading, setLoginLoading] = useState(false);

  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  // Load remembered email
  useEffect(() => {
    const rememberedEmail = safeStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setFormData(prev => ({
        ...prev,
        email: rememberedEmail,
        rememberMe: true
      }));
    }
  }, []);

  // Redirect if already authenticated
  if (!loading && isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Please enter email and password');
      return;
    }

    setLoginLoading(true);

    try {
      const result = await login(
        formData.email,
        formData.password,
        null, // No tenantId needed - backend will auto-detect
        false // Not explicitly super admin - backend will auto-detect
      );

      if (result.success) {
        // Handle remember me
        if (formData.rememberMe) {
          safeStorage.setItem('rememberedEmail', formData.email);
        } else {
          safeStorage.removeItem('rememberedEmail');
        }

        // Navigate based on response redirectTo or fallback to /home
        const redirectTo = result.data?.redirectTo || '/home';
        navigate(redirectTo);
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoginLoading(false);
    }
  };


  return (
    <div className="h-[100vh] overflow-hidden lg:flex justify-center items-center">
      {/* <div className="side-image w-full hidden lg:block lg:max-w-[50%]">
        <img src={loginbg} className="img-fluid block m-3 rounded-[30px]" alt="loginimage" />
      </div> */}
      <div className="w-full h-screen flex lg:block items-center lg:items-auto w-full lg:h-auto lg:max-w-[50%]">
        <div className="max-h-[100vh] py-6 overflow-auto w-full">
          <div className="w-full py-8 max-w-[400px] lg:max-w-[600px] m-auto lg:py-0 px-8 lg:px-5 text-slate-500">
            <div className="flex items-center justify-center">
              <Link to="/" className="text-3xl font-mono font-bold text-red-500 drunk lowercase">
                <Logotext />
              </Link>
            </div>
            <h2 className="font-bold mb-1 text-[24px] mt-6 text-center  text-white px-12 lg:px-0">
              Welcome to Cross Miles Carrier
            </h2>
            <p className="text-gray-500 hidden text-center lg:block mb-2">
              Enter your email and password to access your account
            </p>
            <div className='flex justify-center'>
              <div className='bg-[#D278D5] mx-auto lg:m-0 h-[3px] w-[100px] mt-4'></div>
            </div>
            
            <main className="mt-8">
              <form onSubmit={handleSubmit}>
                <div>
                  {/* <label className="mt-4 mb-0 block">Email</label> */}
                  <input 
                    required 
                    name="email" 
                    onChange={handleInputChange} 
                    type="email" 
                    placeholder="Enter your email"
                    value={formData.email || ''}
                    className="input"
                  />
                </div>
                <div>
                  {/* <label className="mt-4 mb-0 block">Password</label> */}
                  <input 
                    required 
                    name="password" 
                    onChange={handleInputChange} 
                    type="password" 
                    placeholder="Enter your password"
                    value={formData.password || ''}
                    className="input"
                  />
                </div>
                
                {/* Remember Me Checkbox */}
                <div className="mt-4">
                  <div className="flex items-center justify-center">
                    <input
                      id="rememberMe"
                      name="rememberMe"
                      type="checkbox"
                      checked={formData.rememberMe}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-300">
                      Remember me
                    </label>
                  </div>
                </div>
                
                <div className="mt-2 flex justify-center">
                  <button 
                    type="submit" 
                    disabled={loginLoading}
                    className="btn md mt-6 px-[50px] w-full main-btn text-black font-bold"
                  >
                    {loginLoading ? "Logging in..." : "Sign In"}
                  </button>
                </div>
              </form>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}