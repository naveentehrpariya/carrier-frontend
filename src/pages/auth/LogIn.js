import React, { useContext, useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import loginbg from "../../img/login-bg.png";
import { UserContext } from "../../context/AuthProvider";
import { useAuth } from '../../context/MultiTenantAuthProvider';
import { useMultiTenant } from '../../context/MultiTenantProvider';
import toast from "react-hot-toast";
import Logotext from "../common/Logotext";
import Api from "../../api/Api";
import CheckLogin from "./CheckLogin";

export default function Login() {
    const {Errors, login: legacyLogin, user, setIsAuthenticated, setUser} = useContext(UserContext);
    const { login: multiTenantLogin, isAuthenticated, loading: authLoading, isSuperAdminUser } = useAuth();
    const { tenant, isSuperAdmin, tenantLoading } = useMultiTenant();
    function LoginForm(){
      const hasNavigated = useRef(false);
      const navigate = useNavigate();
      
      // Get tenant from URL params immediately
      const getInitialCorporateID = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const tenantParam = urlParams.get('tenant');
        
        if (tenant?.subdomain && !isSuperAdmin) {
          return tenant.subdomain;
        } else if (isSuperAdmin) {
          return "admin";
        } else if (tenantParam) {
          return tenantParam;
        }
        return "";
      };

      const [data, setData] = useState({
        corporateID: getInitialCorporateID(),
        email: "",
        password: "",
      });

      // Check if we have tenant context from URL or system
      const hasTenantContext = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const tenantParam = urlParams.get('tenant');
        return tenant?.subdomain || isSuperAdmin || tenantParam;
      };

      const inputFields = [
        { 
          type: "text", 
          name: "corporateID", 
          label: "Corporate ID",
          readonly: hasTenantContext(), // Make readonly if tenant detected
          placeholder: data.corporateID || "Enter Corporate ID"
        },
        { type:"email", name :"email", label: "Email" },
        { type:"text", name :"password", label: "Password" },
      ];

      // Update corporateID when tenant context changes or from URL params
      useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const tenantParam = urlParams.get('tenant');
        setData(prev => {
          let newCorporateID = prev.corporateID;
          if (tenant?.subdomain && !isSuperAdmin && prev.corporateID !== tenant.subdomain) {
            newCorporateID = tenant.subdomain;
          } else if (isSuperAdmin && prev.corporateID !== "admin") {
            newCorporateID = "admin";
          } else if (tenantParam && prev.corporateID !== tenantParam && !tenant?.subdomain && !isSuperAdmin) {
            newCorporateID = tenantParam;
          }
          if (newCorporateID !== prev.corporateID) {
            return { ...prev, corporateID: newCorporateID };
          }
          return prev;
        });
      }, [tenant?.subdomain, isSuperAdmin]);

      const handleinput = (e) => {
        setData({ ...data, [e.target.name]: e.target.value});
      }

      const [loading, setLoading] = useState(false);
      const handleLogin = async (e) => {
        e.preventDefault();
        if (data.email === "" || data.password === "") {
          toast.error("Email and password are required.");
          return false;
        }
        setLoading(true);
        try {
          const isAttemptingSuperAdmin = isSuperAdmin || data.corporateID === 'admin';
          const result = await multiTenantLogin(
            data.email,
            data.password,
            isAttemptingSuperAdmin ? null : data.corporateID,
            isAttemptingSuperAdmin
          );
          if (result.success) {
            console.log('Login result:', result.data);
            const { isSuperAdmin: responseIsSuperAdmin } = result.data;
            if (responseIsSuperAdmin) {
              toast.success('Redirecting to super admin dashboard');
              console.log('Redirecting to super admin dashboard');
              navigate('/super-admin');
            } else {
              toast.success('Redirecting to company dashboard');
              console.log('Redirecting to company dashboard');
              navigate('/home');
            }
          }
        } catch (error) {
          console.error('Login error:', error);
        } finally {
          setLoading(false);
        }
      }
  
      // Unified authentication navigation check
      useEffect(() => {
        // Prevent navigation during loading or if already navigated
        if (authLoading || hasNavigated.current) {
          console.log('🚫 Skipping navigation - loading or already navigated:', { authLoading, hasNavigated: hasNavigated.current });
          return;
        }
        
        console.log('🔍 Navigation check:', {
          isAuthenticated,
          user: user?.email,
          isSuperAdmin,
          isSuperAdminUser,
          authLoading
        });
        if (isAuthenticated && user) {
          hasNavigated.current = true;
          
          console.log('✅ User authenticated, determining redirect...');
          
          // Check both isSuperAdmin (from URL/context) and isSuperAdminUser (from auth response)
          if (isSuperAdmin || isSuperAdminUser) {
            toast.success('🔥 Navigating to super admin dashboard');
            console.log('🔥 Navigating to super admin dashboard');
            navigate('/super-admin');
          } else {
            toast.success('🏢 Navigating to company dashboard');
            console.log('🏢 Navigating to company dashboard');
            navigate('/home');
          }
        }
        // Legacy fallback - only if multi-tenant auth shows no user but legacy auth does
        else if (user && user._id && !isAuthenticated && !authLoading) {
          hasNavigated.current = true;
          console.log('📜 Legacy navigation to /home');
          navigate('/home');
        }
      }, [authLoading, isAuthenticated, user, isSuperAdmin, isSuperAdminUser, navigate]);
      
      // Reset navigation flag when authentication state changes
      useEffect(() => {
        if (!isAuthenticated && !user) {
          hasNavigated.current = false;
        }
      }, [isAuthenticated, user]);

    return (
      <>
      {/* <CheckLogin redirect={true} /> */}
      <form onSubmit={handleLogin} >
          {inputFields.map((field, index) => (
            <div key={index}>
              <label className="mt-4 mb-0 block">
                {field.label}
                {field.readonly && (
                  <span className="ml-2 text-xs text-green-400">(Auto-detected)</span>
                )}
              </label>
              <input 
                required 
                name={field.name} 
                onChange={handleinput} 
                type={field.type} 
                placeholder={field.placeholder || field.label}
                value={data[field.name] || ''}
                readOnly={field.readonly}
                className={`input ${field.readonly ? 'bg-gray-700 cursor-not-allowed' : ''}`}
              />
            </div>
          ))}
          <div className="mt-2 flex justify-center lg:justify-start">
            <button type="submit" onClick={handleLogin} className="btn md mt-6 px-[50px] w-full lg:w-auto main-btn text-black font-bold">{loading ? "Logging in..." : "Submit"}</button>
          </div>
        </form>
        
        {/* Login Help Section */}
        {/* <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <div className="text-sm text-gray-300">
            <p className="font-semibold text-white mb-2">
              {isSuperAdmin ? '🔥 Super Admin Access' : 
               tenant ? `🏢 ${tenant.name || tenant.subdomain} Portal` : 
               '🏢 Multi-Tenant Login'}
            </p>
            
            {isSuperAdmin ? (
              <div className="space-y-1">
                <p><strong>Corporate ID:</strong> admin</p>
                <p><strong>Demo:</strong> admin@gmail.com / 12345678</p>
                <p className="text-red-400 text-xs">⚠️ System-wide access</p>
              </div>
            ) : (
              <div className="space-y-1">
                <p><strong>Corporate ID:</strong> {tenant?.subdomain || 'your-company-id'}</p>
                <p><strong>Admin:</strong> admin@{tenant?.subdomain || 'company'}.com / password123</p>
                <p><strong>User:</strong> user@{tenant?.subdomain || 'company'}.com / password123</p>
                {!tenant && (
                  <p className="text-blue-400 text-xs">
                    💡 Access via: abc.company.com or localhost:3000?tenant=abc
                  </p>
                )}
              </div>
            )}
          </div>
        </div> */}
      </>
    );
    }

    return (
      <>
        <div className="h-[100vh] overflow-hidden lg:flex justify-center items-center" >
          <div className="side-image w-full hidden lg:block lg:max-w-[50%] ">
            <img src={loginbg} className="img-fluid block m-3 rounded-[30px]" alt="loginimage" />
          </div>
          <div className="w-full h-screen  flex lg:block items-center lg:items-auto lg:h-auto lg:max-w-[50%]">
            <div className="max-h-[100vh] py-6 overflow-auto">
              <div className="w-full py-8 max-w-[390px] lg:max-w-[600px] m-auto  lg:py-0 px-8 lg:px-5   text-slate-500">
                <div className="flex items-center justify-center lg:justify-start">
                  <Link to="/" className="text-3xl font-mono font-bold  text-red-500 drunk lowercase">
                    <Logotext />
                  </Link>
                </div>
                <h2 className="font-bold mb-1 text-[24px] mt-6 text-center lg:text-start text-white px-12 lg:px-0">Welcome to Cross Miles Carrier </h2>
                <p className="text-gray-500 hidden lg:block lg:text-start mb-2 ">Enter your credentials to login to your account </p>
                <div className='bg-[#D278D5] m-auto lg:m-0 h-[3px] w-[100px] mt-4'></div>
                <main className="mt-8 " >
                    <LoginForm />
                </main> 
              </div>
            </div>
          </div>
        </div>
      </>
    );
}
