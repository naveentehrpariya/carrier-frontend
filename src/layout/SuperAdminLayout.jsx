import * as React from "react";
import { Helmet } from "react-helmet";
import { useAuth } from "../context/MultiTenantAuthProvider";
import { useMultiTenant } from "../context/MultiTenantProvider";
import Logo from "../pages/common/Logo";
import SuperAdminSidebar from "./SuperAdminSidebar";
import { TbLogout } from "react-icons/tb";
import { HiOutlineUserCircle } from "react-icons/hi2";

export default function SuperAdminLayout({ children, heading }) {
  const { user: multiTenantUser, logout: multiTenantLogout } = useAuth();
  const { isSuperAdmin } = useMultiTenant();

  const [toggle, setToggle] = React.useState(false);

  function showSidebar() {
    const Sidebar = document.getElementById("super-admin-sidebar");
    Sidebar.classList.toggle("open");
    setToggle(!toggle);
  }

  const handleLogout = async () => {
    console.log('🎯 SuperAdminLayout logout clicked');
    if (multiTenantLogout) {
      console.log('🎤 Using multiTenantLogout in SuperAdminLayout');
      await multiTenantLogout();
    } else {
      console.log('🔄 Using legacy logout in SuperAdminLayout');
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  };

  // Check if user has super admin permissions
  const isSuperAdminUser = React.useMemo(() => {
    // Check stored super admin status
    const storedSuperAdminStatus = localStorage.getItem('isSuperAdmin');
    
    try {
      const parsedStatus = storedSuperAdminStatus ? JSON.parse(storedSuperAdminStatus) : false;
      return parsedStatus;
    } catch (error) {
      console.error('Error parsing super admin status:', error);
      return false;
    }
  }, [multiTenantUser, isSuperAdmin]);

  // Redirect if not super admin
  if (!isSuperAdminUser) {
    window.location.href = "/home";
    return null;
  }

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>{heading ? `${heading} | ` : ''}Super Admin | Cross Miles Carrier</title>
        <link rel="canonical" href={window.location.href || ""} />
      </Helmet>
      
      {toggle ? <div onClick={showSidebar} className="fixed top-0 left-0 w-full h-full bg-[#0009] blur z-[9999]"></div> : ''}
      
      <div className="auth-wrap flex justify-between max-lg:flex-wrap">
        <main className="main-wrap">
          <header className="fixed top-0 lg:top-0 z-[9998] bg-dark border-b border-gray-800 px-6 md:px-7 py-2 xl:py-4 flex items-center w-full justify-between">
            <Logo />
            <div className="flex gap-2 items-center">
              
              <div className="hidden md:flex items-center">
                <div><HiOutlineUserCircle color="white" size='2.5rem' /></div>
                <div className="text-start me-4 ps-2">
                  <h2 className="capitalize font-bold text-white">{multiTenantUser?.name}</h2>
                  <p className="capitalize text-sm mt-[-3px] text-gray-400">Super Administrator</p>
                </div>
              </div>
              <button className="hidden md:flex" onClick={handleLogout}>
                <TbLogout color="#fff" className='me-2' size={'2rem'} />
              </button>
              
              <button onClick={showSidebar} className="sidebar-toggle text-base leading-6 whitespace-nowrap text-neutral-400">
                <span className=""></span>
                <span className="my-2"></span>
                <span className=""></span>
              </button>

            </div>
          </header>
          
          <div className="flex w-full overflow-hidden">
            <SuperAdminSidebar logout={handleLogout} toggle={toggle} />
            <div className="content md:max-h-[100vh] overflow-y-auto lg:w-[calc(100%-300px)] p-6 md:p-8 !pt-[120px] lg:!pt-[150px] w-full">
              {children}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}