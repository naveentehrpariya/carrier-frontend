import React, { useContext } from 'react'
import { Link } from 'react-router-dom';
import { MdOutlineSpaceDashboard } from "react-icons/md";
import { TbUserSquareRounded } from "react-icons/tb";
import { FiBox, FiChevronDown } from "react-icons/fi";
import { TbTruckDelivery } from "react-icons/tb";
import { VscGraphLine } from "react-icons/vsc";
import { FaUsers } from "react-icons/fa";
import { MdOutlineLogout } from "react-icons/md";
import { MdOutlineManageHistory } from "react-icons/md";
import { UserContext } from '../context/AuthProvider';
import { useAuth } from '../context/MultiTenantAuthProvider';
import { useMultiTenant } from '../context/MultiTenantProvider';
import { useLocation } from 'react-router-dom';
import { TbListDetails } from "react-icons/tb";
import { MdOutlineDocumentScanner, MdOutlineBarChart } from "react-icons/md";
import { IoMdAddCircle } from "react-icons/io";
import { HiOutlineUserCircle } from "react-icons/hi2";
import { FaCrown } from "react-icons/fa";
import { MdAdminPanelSettings } from "react-icons/md";
import { BsPersonGear } from "react-icons/bs";
import Api from '../api/Api';
import { useSidebarCounts } from '../context/SidebarCountsContext';
import safeStorage from '../utils/safeStorage';

export default function Sidebar({toggle}) {

  const location = useLocation();
  const {user}  = useContext(UserContext);
  const { user: multiTenantUser, logout: multiTenantLogout, activeModule, setActiveModule } = useAuth();
  const { isSuperAdmin, tenant, getTenantApi } = useMultiTenant();
  // Replace local counts state with context values
  const { counts, loadingCounts } = useSidebarCounts();
  
  // Use multi-tenant user if available, fallback to legacy user
  const currentUser = multiTenantUser || user;
  
  // Normalize allowedModules - ensure it's a non-empty array of valid modules
  const allowedModules = React.useMemo(() => {
    const raw = Array.isArray(currentUser?.permissions) ? currentUser.permissions : [];
    const valid = ['outsourcing', 'regular'];
    const cleaned = raw
      .map((m) => String(m).toLowerCase().trim())
      .filter((m) => valid.includes(m));
    if (cleaned.length === 0) return ['outsourcing'];
    return cleaned;
  }, [currentUser?.permissions]);
  
  // Local state no longer needed, use context instead
  // const [activeModule, setActiveModule] = React.useState('outsourcing');

  const handleLogout = async () => {
    console.log('💲 Logout button clicked');
    console.log('🔍 Available logout function:', !!multiTenantLogout);
    
    if (multiTenantLogout) {
      console.log('🎤 Using multiTenantLogout');
      await multiTenantLogout();
    } else {
      console.log('🔄 Using fallback legacy logout');
      // Fallback to legacy logout
      try {
        const res = await Api.get('/user/logout');
        if(res.data.status){
          safeStorage.removeItem("token");
          safeStorage.removeItem("activeModule");
          window.location.href = "/login";
        } else {
          console.error("Logout failed:", res.data.message);
        }
      } catch (err) {
        console.error("Logout error:", err);
        // Force redirect even if API fails
        safeStorage.clear();
        window.location.href = "/login";
      }
    }
  }

  const roleChecker = () =>{
    if (isSuperAdmin) {
      return 'Super Administrator';
    }
    if(currentUser?.permissions?.includes('subadmin')){
      return currentUser?.position ||'Subadmin'
    }
    if(currentUser?.permissions?.includes('regular') || currentUser?.permissions?.includes('outsourcing')){
      return currentUser?.position ||'Employee'
    }
    else if(currentUser?.permissions?.includes('accounting')){
      return currentUser?.position ||'Accountant'
    }
    else if(currentUser?.is_admin === 1){
      return currentUser?.position ||'Administrator'
    }
  }

  // Sidebar counts come from SidebarCountsContext; no local fetching

  const isAccountPath = location.pathname.startsWith('/accounts');
  const [accountOpen, setAccountOpen] = React.useState(isAccountPath);
  React.useEffect(() => {
    if (isAccountPath) setAccountOpen(true);
  }, [isAccountPath]);

  const isFleetPath =
    location.pathname === '/drivers' || location.pathname === '/trucks' || location.pathname === '/trailers' || location.pathname === '/owner-operators';
  const [fleetOpen, setFleetOpen] = React.useState(isFleetPath);
  React.useEffect(() => {
    if (isFleetPath) setFleetOpen(true);
  }, [isFleetPath]);

  const isOrdersPath =
    location.pathname === '/orders' ||
    location.pathname === '/order/add' ||
    location.pathname.startsWith('/view/order/') ||
    location.pathname.startsWith('/edit/order/') ||
    location.pathname.startsWith('/order/');
  const [ordersOpen, setOrdersOpen] = React.useState(isOrdersPath);
  React.useEffect(() => {
    if (isOrdersPath) setOrdersOpen(true);
  }, [isOrdersPath]);

  const sidebarScrollRef = React.useRef(null);
  const savedScrollTopRef = React.useRef(0);

  const saveSidebarScroll = React.useCallback(() => {
    const el = sidebarScrollRef.current;
    if (!el) return;
    const top = el.scrollTop || 0;
    savedScrollTopRef.current = top;
    try {
      window.sessionStorage.setItem('sidebarScrollTop', String(top));
    } catch {}
  }, []);

  React.useLayoutEffect(() => {
    const el = sidebarScrollRef.current;
    if (!el) return;

    let top = savedScrollTopRef.current || 0;
    if (top <= 0) {
      try {
        top = Number(window.sessionStorage.getItem('sidebarScrollTop') || 0);
      } catch {}
    }

    if (top > 0) el.scrollTop = top;
  }, [location.pathname]);

  return (
    <>
      {/* <button  className='text-white text-4xl absolute top-3 z-[99999] bg-black px-4 py-3 rounded-xl right-3'>&times;</button> */}
      <div id='sidebar' className='mobilesidebar sticky 
      top-0 pt-[140px] p-8 bg-dark border-r 
      max-h-[100vh]
       overflow-auto pb-22 w-full max-w-[300px]  min-w-[300px] border-gray-800'
        ref={sidebarScrollRef}
        onScroll={saveSidebarScroll}
      >
        {/* <h2 className='mb-3 text-sm uppercase text-gray-400'>Main Menu</h2> */}
        <div className=" flex md:hidden items-center mb-8">
          <div><HiOutlineUserCircle color="white"  size='2.5rem'/></div>
          <div className="text-start me-4 ps-2">
            <h2 className="capitalize font-bold text-white">{currentUser?.name}</h2>
            <p className="capitalize text-sm mt-[-3px] text-gray-400">{roleChecker()}</p>
          </div>
        </div>
        
        {/* Module Switcher - Show if multiple modules allowed OR if Super Admin */}
        {(allowedModules.length > 1 || isSuperAdmin) && (
          <div className="mb-6">
            <div className="w-full bg-[#1B1E27] p-2 rounded-3xl border border-white/5 shadow-inner">
              <div className="grid grid-cols-1 gap-2">
                {allowedModules.includes('outsourcing') && (
                  <button
                    onClick={() => setActiveModule('outsourcing')}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                      activeModule === 'outsourcing'
                        ? 'bg-gradient-to-r from-[#B39CF6] to-[#8B5CF6] text-white shadow-[0_10px_25px_rgba(139,92,246,0.35)] border border-white/10'
                        : 'bg-[#11131A] text-[#8A8FA3] hover:text-[#EDEFF6] hover:bg-[#181C24] border border-white/5'
                    }`}
                  >
                    <div className="min-w-0 text-left">
                      <div className="text-[10px] font-black uppercase tracking-widest truncate">Outsourcing</div>
                      <div className={`text-[10px] ${activeModule === 'outsourcing' ? 'text-white/90' : 'text-[#5C6175]'}`}>Carriers</div>
                    </div>
                    <div className={`h-2.5 w-2.5 rounded-full ${activeModule === 'outsourcing' ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.4)]' : 'bg-[#2B3240]'}`} />
                  </button>
                )}

                {allowedModules.includes('regular') && (
                  <button
                    onClick={() => setActiveModule('regular')}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                      activeModule === 'regular'
                        ? 'bg-gradient-to-r from-[#B39CF6] to-[#8B5CF6] text-white shadow-[0_10px_25px_rgba(139,92,246,0.35)] border border-white/10'
                        : 'bg-[#11131A] text-[#8A8FA3] hover:text-[#EDEFF6] hover:bg-[#181C24] border border-white/5'
                    }`}
                  >
                    <div className="min-w-0 text-left">
                      <div className="text-[10px] font-black uppercase tracking-widest truncate">Regular</div>
                      <div className={`text-[10px] ${activeModule === 'regular' ? 'text-white/90' : 'text-[#5C6175]'}`}>Trucking & Drivers</div>
                    </div>
                    <div className={`h-2.5 w-2.5 rounded-full ${activeModule === 'regular' ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.4)]' : 'bg-[#2B3240]'}`} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <ul className="space-y-3" onClickCapture={saveSidebarScroll}>
          
          {/* Universal Admin/Employee items */}
          <li>
            <Link className={`group transition-all duration-300 ${location.pathname === '/home' || location.pathname === '/' ? "bg-gradient-to-br from-[#B39CF6] to-[#8B5CF6] !text-white shadow-[0_8px_20px_rgba(139,92,246,0.4)]" : 'bg-[#11131A] hover:bg-[#181C24] text-[#EDEFF6]'  } mb-2 py-[14px] px-[18px] border border-white/5 rounded-2xl flex items-center`} to={'/home'} >
              <MdOutlineSpaceDashboard className={`${location.pathname === '/home' || location.pathname === '/' ? 'text-white' : 'text-[#EDEFF6]'} me-3`} size={'1.4rem'} /> 
              <span className="font-bold">Dashboard</span>
            </Link>
          </li>
              <li>
                <button
                  type="button"
                  className={`group transition-all duration-300 w-full ${
                    isOrdersPath
                      ? "bg-gradient-to-br from-[#B39CF6] to-[#8B5CF6] !text-white shadow-[0_8px_20px_rgba(139,92,246,0.4)]"
                      : 'bg-[#11131A] hover:bg-[#181C24] text-[#EDEFF6]'
                  } mb-2 py-[14px] px-[18px] border border-white/5 rounded-2xl flex items-center`}
                  onClick={() => setOrdersOpen((v) => !v)}
                >
                  <FiBox className={`${isOrdersPath ? 'text-white' : 'text-[#EDEFF6]'} me-3`} size={'1.4rem'} />
                  <span className="font-medium">Orders</span>
                  <span className={`ml-auto text-[11px] font-bold ${isOrdersPath ? 'bg-white/20 text-white' : 'bg-[#2B3240] text-[#8A8FA3]'} rounded-full px-2.5 py-[2px] transition-colors`}>{loadingCounts ? '...' : counts.orders}</span>
                  <FiChevronDown className={`ml-2 transition-transform duration-300 ${ordersOpen ? 'rotate-180' : ''}`} />
                </button>
                <div
                  className={`-mt-1 ${ordersOpen ? 'mb-3' : 'mb-0'} pl-2 border-l border-[var(--main)] overflow-hidden transition-all duration-300 ${
                    ordersOpen ? 'max-h-[240px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
                  }`}
                >
                  <div className="space-y-2">
                    <Link
                      className={`group transition-all duration-300 ${
                        location.pathname === '/order/add'
                          ? "bg-gradient-to-br from-[#B39CF6] to-[#8B5CF6] !text-white shadow-[0_6px_16px_rgba(139,92,246,0.35)]"
                          : 'bg-[#11131A] hover:bg-[#181C24] text-[#EDEFF6]'
                      } py-[10px] px-[14px] border border-white/5 rounded-2xl flex items-center`}
                      to={'/order/add'}
                    >
                      <IoMdAddCircle className={`${location.pathname === '/order/add' ? 'text-white' : 'text-[#EDEFF6]'} me-3`} size={'1.1rem'} />
                      <span className="font-medium">Add New Order</span>
                    </Link>
                    <Link
                      className={`group transition-all duration-300 ${
                        location.pathname === '/orders'
                          ? "bg-gradient-to-br from-[#B39CF6] to-[#8B5CF6] !text-white shadow-[0_6px_16px_rgba(139,92,246,0.35)]"
                          : 'bg-[#11131A] hover:bg-[#181C24] text-[#EDEFF6]'
                      } py-[10px] px-[14px] border border-white/5 rounded-2xl flex items-center`}
                      to={'/orders'}
                    >
                      <FiBox className={`${location.pathname === '/orders' ? 'text-white' : 'text-[#EDEFF6]'} me-3`} size={'1.1rem'} />
                      <span className="font-medium">All Orders</span>
                      <span className={`ml-auto text-[11px] font-bold ${location.pathname === '/orders' ? 'bg-white/20 text-white' : 'bg-[#2B3240] text-[#8A8FA3]'} rounded-full px-2.5 py-[2px] transition-colors`}>{loadingCounts ? '...' : counts.orders}</span>
                    </Link>
                  </div>
                </div>
              </li> 
              <li>
                <Link className={`group transition-all duration-300 ${location.pathname === '/customers' ? "bg-gradient-to-br from-[#B39CF6] to-[#8B5CF6] !text-white shadow-[0_8px_20px_rgba(139,92,246,0.4)]" : 'bg-[#11131A] hover:bg-[#181C24] text-[#EDEFF6]'  } mb-2 py-[14px] px-[18px] border border-white/5 rounded-2xl flex items-center`} to={'/customers'} >
                  <TbUserSquareRounded className={`${location.pathname === '/customers' ? 'text-white' : 'text-[#EDEFF6]'} me-3`} size={'1.4rem'} /> 
                  <span className="font-medium">Customers</span>
                  <span className={`ml-auto text-[11px] font-bold ${location.pathname === '/customers' ? 'bg-white/20 text-white' : 'bg-[#2B3240] text-[#8A8FA3]'} rounded-full px-2.5 py-[2px] transition-colors`}>{loadingCounts ? '...' : counts.customers}</span>
                </Link>
              </li>
          {/* Common Admin items */}
          {isSuperAdmin && (
            <>
              <li>
                <Link className={`hover:!bg-main hover:opacity-[0.8] hover:scale-[1.05] transition-all  ${location.pathname === '/super-admin' ? "bg-main !text-black" : 'bg-dark'  } text-gray-200 mb-2 py-[13px] px-[13px] border border-gray-900 rounded-2xl  flex items-center`} to={'/super-admin'} ><FaCrown className='me-2' size={'1.4rem'} /> Super Admin Dashboard</Link>
              </li>
            </>
          )}

          {/* Module-Specific Items (Regular) */}
          {(isSuperAdmin || (activeModule === 'regular' && allowedModules.includes('regular'))) && (
            <>
              <li>
                <button
                  type="button"
                  className={`group transition-all duration-300 w-full ${
                    isFleetPath
                      ? "bg-gradient-to-br from-[#B39CF6] to-[#8B5CF6] !text-white shadow-[0_8px_20px_rgba(139,92,246,0.4)]"
                      : 'bg-[#11131A] hover:bg-[#181C24] text-[#EDEFF6]'
                  } mb-2 py-[14px] px-[18px] border border-white/5 rounded-2xl flex items-center`}
                  onClick={() => setFleetOpen((v) => !v)}
                >
                  <TbTruckDelivery className={`${isFleetPath ? 'text-white' : 'text-[#EDEFF6]'} me-3`} size={'1.4rem'} />
                  <span className="font-medium">Fleet</span>
                  <FiChevronDown className={`ml-auto transition-transform duration-300 ${fleetOpen ? 'rotate-180' : ''}`} />
                </button>
                <div
                  className={`-mt-1 ${fleetOpen ? 'mb-3' : 'mb-0'} pl-2 border-l border-[var(--main)] overflow-hidden transition-all duration-300 ${
                    fleetOpen ? 'max-h-[360px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
                  }`}
                >
                  <div className="space-y-2">
                    <Link
                      className={`group transition-all duration-300 ${
                        location.pathname === '/drivers'
                          ? "bg-gradient-to-br from-[#B39CF6] to-[#8B5CF6] !text-white shadow-[0_6px_16px_rgba(139,92,246,0.35)]"
                          : 'bg-[#11131A] hover:bg-[#181C24] text-[#EDEFF6]'
                      } py-[10px] px-[14px] border border-white/5 rounded-2xl flex items-center`}
                      to={'/drivers'}
                    >
                      <HiOutlineUserCircle
                        className={`${location.pathname === '/drivers' ? 'text-white' : 'text-[#EDEFF6]'} me-3`}
                        size={'1.1rem'}
                      />
                      <span className="font-medium">Drivers</span>
                    </Link>
                    <Link
                      className={`group transition-all duration-300 ${
                        location.pathname === '/trucks'
                          ? "bg-gradient-to-br from-[#B39CF6] to-[#8B5CF6] !text-white shadow-[0_6px_16px_rgba(139,92,246,0.35)]"
                          : 'bg-[#11131A] hover:bg-[#181C24] text-[#EDEFF6]'
                      } py-[10px] px-[14px] border border-white/5 rounded-2xl flex items-center`}
                      to={'/trucks'}
                    >
                      <TbTruckDelivery
                        className={`${location.pathname === '/trucks' ? 'text-white' : 'text-[#EDEFF6]'} me-3`}
                        size={'1.1rem'}
                      />
                      <span className="font-medium">Trucks</span>
                    </Link>
                    <Link
                      className={`group transition-all duration-300 ${
                        location.pathname === '/owner-operators'
                          ? "bg-gradient-to-br from-[#B39CF6] to-[#8B5CF6] !text-white shadow-[0_6px_16px_rgba(139,92,246,0.35)]"
                          : 'bg-[#11131A] hover:bg-[#181C24] text-[#EDEFF6]'
                      } py-[10px] px-[14px] border border-white/5 rounded-2xl flex items-center`}
                      to={'/owner-operators'}
                    >
                      <FaUsers
                        className={`${location.pathname === '/owner-operators' ? 'text-white' : 'text-[#EDEFF6]'} me-3`}
                        size={'1.1rem'}
                      />
                      <span className="font-medium">Owner Operators</span>
                    </Link>
                    <Link
                      className={`group transition-all duration-300 ${
                        location.pathname === '/trailers'
                          ? "bg-gradient-to-br from-[#B39CF6] to-[#8B5CF6] !text-white shadow-[0_6px_16px_rgba(139,92,246,0.35)]"
                          : 'bg-[#11131A] hover:bg-[#181C24] text-[#EDEFF6]'
                      } py-[10px] px-[14px] border border-white/5 rounded-2xl flex items-center`}
                      to={'/trailers'}
                    >
                      <FiBox
                        className={`${location.pathname === '/trailers' ? 'text-white' : 'text-[#EDEFF6]'} me-3`}
                        size={'1.1rem'}
                      />
                      <span className="font-medium">Trailers</span>
                    </Link>
                  </div>
                </div>
              </li>
            </>
          )}

          {/* Module-Specific Items (Outsourcing) */}
          {(isSuperAdmin || (activeModule === 'outsourcing' && allowedModules.includes('outsourcing'))) && (
            <>
              <li>
                <Link className={`group transition-all duration-300 ${location.pathname === '/carriers' ? "bg-gradient-to-br from-[#B39CF6] to-[#8B5CF6] !text-white shadow-[0_8px_20px_rgba(139,92,246,0.4)]" : 'bg-[#11131A] hover:bg-[#181C24] text-[#EDEFF6]'  } mb-2 py-[14px] px-[18px] border border-white/5 rounded-2xl flex items-center`} to={'/carriers'} >
                  <TbTruckDelivery className={`${location.pathname === '/carriers' ? 'text-white' : 'text-[#EDEFF6]'} me-3`} size={'1.4rem'} /> 
                  <span className="font-medium">Carriers</span>
                  <span className={`ml-auto text-[11px] font-bold ${location.pathname === '/carriers' ? 'bg-white/20 text-white' : 'bg-[#2B3240] text-[#8A8FA3]'} rounded-full px-2.5 py-[2px] transition-colors`}>{loadingCounts ? '...' : counts.carriers}</span>
                </Link>
              </li>
            </>
          )}

          {/* Admin Tools - available if either module active for admins */}
          {(currentUser?.is_admin === 1 || isSuperAdmin || currentUser?.permissions?.includes('employees') || currentUser?.permissions?.includes('subadmin')) && (
            <>
              <li>
                <Link className={`group transition-all duration-300 ${location.pathname === '/employees' ? "bg-gradient-to-br from-[#B39CF6] to-[#8B5CF6] !text-white shadow-[0_8px_20px_rgba(139,92,246,0.4)]" : 'bg-[#11131A] hover:bg-[#181C24] text-[#EDEFF6]'  } mb-2 py-[14px] px-[18px] border border-white/5 rounded-2xl flex items-center`} to={'/employees'} >
                  <FaUsers className={`${location.pathname === '/employees' ? 'text-white' : 'text-[#EDEFF6]'} me-3`} size={'1.4rem'} /> 
                  <span className="font-medium">Employees</span>
                  <span className={`ml-auto text-[11px] font-bold ${location.pathname === '/employees' ? 'bg-white/20 text-white' : 'bg-[#2B3240] text-[#8A8FA3]'} rounded-full px-2.5 py-[2px] transition-colors`}>{loadingCounts ? '...' : counts.employees}</span>
                </Link>
              </li>
              {(currentUser?.is_admin === 1 || isSuperAdmin || currentUser?.permissions?.includes('subadmin')) && (
              <li>
                <Link className={`group transition-all duration-300 ${location.pathname === '/commodity-and-equipments' ? "bg-gradient-to-br from-[#B39CF6] to-[#8B5CF6] !text-white shadow-[0_8px_20px_rgba(139,92,246,0.4)]" : 'bg-[#11131A] hover:bg-[#181C24] text-[#EDEFF6]'  } mb-2 py-[14px] px-[18px] border border-white/5 rounded-2xl flex items-center`} to={'/commodity-and-equipments'} >
                  <VscGraphLine className={`${location.pathname === '/commodity-and-equipments' ? 'text-white' : 'text-[#EDEFF6]'} me-3`} size={'1.4rem'} /> 
                  <span className="font-medium">Equip & Revenue Items</span>
                </Link>
              </li>
              )}
            </>
          )}

          {/* Universal Items */}
          {(currentUser?.is_admin === 1 || currentUser?.permissions?.includes('accounting') || isSuperAdmin) && (
            <li>
              <button
                type="button"
                className={`group transition-all duration-300 w-full ${
                  isAccountPath
                    ? "bg-gradient-to-br from-[#B39CF6] to-[#8B5CF6] !text-white shadow-[0_8px_20px_rgba(139,92,246,0.4)]"
                    : 'bg-[#11131A] hover:bg-[#181C24] text-[#EDEFF6]'
                } mb-2 py-[14px] px-[18px] border border-white/5 rounded-2xl flex items-center`}
                onClick={() => setAccountOpen((v) => !v)}
              >
                <MdOutlineDocumentScanner className={`${isAccountPath ? 'text-white' : 'text-[#EDEFF6]'} me-3`} size={'1.4rem'} />
                <span className="font-medium">Accounting</span>
                <FiChevronDown className={`ml-auto transition-transform duration-300 ${accountOpen ? 'rotate-180' : ''}`} />
              </button>
              <div
                className={`-mt-1 ${accountOpen ? 'mb-3' : 'mb-0'} pl-2 border-l border-[var(--main)] overflow-hidden transition-all duration-300 ${
                  accountOpen ? 'max-h-[420px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
                }`}
              >
                <div className="space-y-2">
                  <Link
                    className={`group transition-all duration-300 ${
                      location.pathname === '/accounts/orders'
                        ? "bg-gradient-to-br from-[#B39CF6] to-[#8B5CF6] !text-white shadow-[0_6px_16px_rgba(139,92,246,0.35)]"
                        : 'bg-[#11131A] hover:bg-[#181C24] text-[#EDEFF6]'
                    } py-[10px] px-[14px] border border-white/5 rounded-2xl flex items-center`}
                    to={'/accounts/orders'}
                  >
                    <MdOutlineDocumentScanner className={`${location.pathname === '/accounts/orders' ? 'text-white' : 'text-[#EDEFF6]'} me-3`} size={'1.1rem'} />
                    <span className="font-medium">Orders Accounting</span>
                  </Link>
                  <Link
                    className={`group transition-all duration-300 ${
                      location.pathname === '/accounts/drivers-salary'
                        ? "bg-gradient-to-br from-[#B39CF6] to-[#8B5CF6] !text-white shadow-[0_6px_16px_rgba(139,92,246,0.35)]"
                        : 'bg-[#11131A] hover:bg-[#181C24] text-[#EDEFF6]'
                    } py-[10px] px-[14px] border border-white/5 rounded-2xl flex items-center`}
                    to={'/accounts/drivers-salary'}
                  >
                    <HiOutlineUserCircle className={`${location.pathname === '/accounts/drivers-salary' ? 'text-white' : 'text-[#EDEFF6]'} me-3`} size={'1.1rem'} />
                    <span className="font-medium">Drivers Salary</span>
                  </Link>
                  <Link
                    className={`group transition-all duration-300 ${
                      location.pathname === '/accounts/trucks-gross'
                        ? "bg-gradient-to-br from-[#B39CF6] to-[#8B5CF6] !text-white shadow-[0_6px_16px_rgba(139,92,246,0.35)]"
                        : 'bg-[#11131A] hover:bg-[#181C24] text-[#EDEFF6]'
                    } py-[10px] px-[14px] border border-white/5 rounded-2xl flex items-center`}
                    to={'/accounts/trucks-gross'}
                  >
                    <TbTruckDelivery className={`${location.pathname === '/accounts/trucks-gross' ? 'text-white' : 'text-[#EDEFF6]'} me-3`} size={'1.1rem'} />
                    <span className="font-medium">Trucks Gross Earning</span>
                  </Link>
                  <Link
                    className={`group transition-all duration-300 ${
                      location.pathname === '/accounts/owner-operator-salary'
                        ? "bg-gradient-to-br from-[#B39CF6] to-[#8B5CF6] !text-white shadow-[0_6px_16px_rgba(139,92,246,0.35)]"
                        : 'bg-[#11131A] hover:bg-[#181C24] text-[#EDEFF6]'
                    } py-[10px] px-[14px] border border-white/5 rounded-2xl flex items-center`}
                    to={'/accounts/owner-operator-salary'}
                  >
                    <FaUsers className={`${location.pathname === '/accounts/owner-operator-salary' ? 'text-white' : 'text-[#EDEFF6]'} me-3`} size={'1.1rem'} />
                    <span className="font-medium">Owner Operator Salary</span>
                  </Link>
                  <Link
                    className={`group transition-all duration-300 ${
                      location.pathname === '/finance'
                        ? "bg-gradient-to-br from-[#B39CF6] to-[#8B5CF6] !text-white shadow-[0_6px_16px_rgba(139,92,246,0.35)]"
                        : 'bg-[#11131A] hover:bg-[#181C24] text-[#EDEFF6]'
                    } py-[10px] px-[14px] border border-white/5 rounded-2xl flex items-center`}
                    to={'/finance'}
                  >
                    <MdOutlineBarChart className={`${location.pathname === '/finance' ? 'text-white' : 'text-[#EDEFF6]'} me-3`} size={'1.1rem'} />
                    <span className="font-medium">Finance Report</span>
                  </Link>
                </div>
              </div>
            </li>
          )}

          <div className='border-t border-gray-700 !mt-4'></div>
          {currentUser?.is_admin === 1 && (
            <Link
              className={`group transition-all duration-300 ${
                location.pathname === '/company/details'
                  ? "bg-gradient-to-br from-[#B39CF6] to-[#8B5CF6] !text-white shadow-[0_6px_16px_rgba(139,92,246,0.35)]"
                  : 'bg-[#11131A] hover:bg-[#181C24] text-[#EDEFF6]'
              } py-[10px] px-[14px] border border-white/5 rounded-2xl flex items-center`}
              to={'/company/details'}
            >
              <TbListDetails className={`${location.pathname === '/company/details' ? 'text-white' : 'text-[#EDEFF6]'} me-3`} size={'1.1rem'} />
              <span className="font-medium">Company Details</span>
            </Link>
          )}
          {currentUser?.is_admin === 1 && (
            <Link
              className={`group transition-all duration-300 ${
                location.pathname === '/activity-logs'
                  ? "bg-gradient-to-br from-[#B39CF6] to-[#8B5CF6] !text-white shadow-[0_6px_16px_rgba(139,92,246,0.35)]"
                  : 'bg-[#11131A] hover:bg-[#181C24] text-[#EDEFF6]'
              } py-[10px] px-[14px] border border-white/5 rounded-2xl flex items-center`}
              to={'/activity-logs'}
            >
              <MdOutlineManageHistory className={`${location.pathname === '/activity-logs' ? 'text-white' : 'text-[#EDEFF6]'} me-3`} size={'1.1rem'} />
              <span className="font-medium">Activity Logs</span>
            </Link>
          )}
          {currentUser && (
            <Link
              className={`group transition-all duration-300 ${
                location.pathname === '/profile'
                  ? "bg-gradient-to-br from-[#B39CF6] to-[#8B5CF6] !text-white shadow-[0_6px_16px_rgba(139,92,246,0.35)]"
                  : 'bg-[#11131A] hover:bg-[#181C24] text-[#EDEFF6]'
              } py-[10px] px-[14px] border border-white/5 rounded-2xl flex items-center`}
              to={isSuperAdmin ? '/super-admin/profile' : '/profile'}
            >
              <BsPersonGear className={`${location.pathname === '/profile' || location.pathname === '/super-admin/profile' ? 'text-white' : 'text-[#EDEFF6]'} me-3`} size={'1.1rem'} />
              <span className="font-medium">Profile</span>
            </Link>
          )}
          <button
            type="button"
            className="group transition-all duration-300 w-full bg-[#11131A] hover:bg-[#181C24] text-[#EDEFF6] py-[10px] px-[14px] border border-white/5 rounded-2xl flex items-center"
            onClick={handleLogout}
          >
            <MdOutlineLogout className="me-3" size={'1.1rem'} />
            <span className="font-medium">Logout</span>
          </button>
        </ul>
      </div>
    </>
  )
}
