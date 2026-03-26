import React, { useContext } from 'react'
import { Link } from 'react-router-dom';
import { MdOutlineSpaceDashboard } from "react-icons/md";
import { TbUserSquareRounded } from "react-icons/tb";
import { FiBox } from "react-icons/fi";
import { TbTruckDelivery } from "react-icons/tb";
import { VscGraphLine } from "react-icons/vsc";
import { FaUsers } from "react-icons/fa";
import { MdOutlineLogout } from "react-icons/md";
import { UserContext } from '../context/AuthProvider';
import { useAuth } from '../context/MultiTenantAuthProvider';
import { useMultiTenant } from '../context/MultiTenantProvider';
import { useLocation } from 'react-router-dom';
import { TbListDetails } from "react-icons/tb";
import { MdOutlineDocumentScanner } from "react-icons/md";
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
    const raw = Array.isArray(currentUser?.allowedModules) ? currentUser.allowedModules : [];
    // If empty or invalid, fallback to outsourcing & regular
    if (raw.length === 0) return ['outsourcing', 'regular'];
    return raw;
  }, [currentUser?.allowedModules]);
  
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
    if(currentUser?.role === 1){
      return currentUser?.position ||'Employee'
    }
    else if(currentUser?.role === 2){
      return currentUser?.position ||'Accountant'
    }
    else if(currentUser?.role === 3){
      return currentUser?.position ||'Administrator'
    }
  }

  // Sidebar counts come from SidebarCountsContext; no local fetching

  return (
    <>
      {/* <button  className='text-white text-4xl absolute top-3 z-[99999] bg-black px-4 py-3 rounded-xl right-3'>&times;</button> */}
      <div id='sidebar' className='mobilesidebar sticky 
      top-0 pt-[140px] p-8 bg-dark border-r 
      max-h-[100vh]
       overflow-auto pb-22 w-full max-w-[300px]  min-w-[300px] border-gray-800'>
        {/* <h2 className='mb-3 text-sm uppercase text-gray-400'>Main Menu</h2> */}
        <div className=" flex md:hidden items-center mb-8">
          <div><HiOutlineUserCircle color="white"  size='2.5rem'/></div>
          <div className="text-start me-4 ps-2">
            <h2 className="capitalize font-bold text-white">{currentUser?.name}</h2>
            <p className="capitalize text-sm mt-[-3px] text-gray-400">{roleChecker()}</p>
          </div>
        </div>
        
        {(allowedModules.length > 1 || currentUser?.role === 3) && !isSuperAdmin && (
          <div className="mb-6">
            <div className="w-full bg-[#1B1E27] p-2 rounded-3xl border border-white/5 shadow-inner">
              <div className="grid grid-cols-1 gap-2">
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
              </div>
            </div>
          </div>
        )}

        <ul className="space-y-3">
          
          {/* Universal Admin/Employee items */}
          {!isSuperAdmin && (
            <>
              <li>
                <Link className={`group transition-all duration-300 ${location.pathname === '/home' || location.pathname === '/' ? "bg-gradient-to-br from-[#B39CF6] to-[#8B5CF6] !text-white shadow-[0_8px_20px_rgba(139,92,246,0.4)]" : 'bg-[#11131A] hover:bg-[#181C24] text-[#EDEFF6]'  } mb-2 py-[14px] px-[18px] border border-white/5 rounded-2xl flex items-center`} to={'/home'} >
                  <MdOutlineSpaceDashboard className={`${location.pathname === '/home' || location.pathname === '/' ? 'text-white' : 'text-[#EDEFF6]'} me-3`} size={'1.4rem'} /> 
                  <span className="font-bold">Dashboard</span>
                </Link>
              </li>
              <li>
                <Link className={`group transition-all duration-300 ${location.pathname === '/order/add' ? "bg-gradient-to-br from-[#B39CF6] to-[#8B5CF6] !text-white shadow-[0_8px_20px_rgba(139,92,246,0.4)]" : 'bg-[#11131A] hover:bg-[#181C24] text-[#EDEFF6]'  } mb-2 py-[14px] px-[18px] border border-white/5 rounded-2xl flex items-center`} to={'/order/add'} >
                  <IoMdAddCircle className={`${location.pathname === '/order/add' ? 'text-white' : 'text-[#EDEFF6]'} me-3`} size={'1.4rem'} /> 
                  <span className="font-medium">Add New Order</span>
                </Link>
              </li>
              <li>
                <Link className={`group transition-all duration-300 ${location.pathname === '/orders' ? "bg-gradient-to-br from-[#B39CF6] to-[#8B5CF6] !text-white shadow-[0_8px_20px_rgba(139,92,246,0.4)]" : 'bg-[#11131A] hover:bg-[#181C24] text-[#EDEFF6]'  } mb-2 py-[14px] px-[18px] border border-white/5 rounded-2xl flex items-center`} to={'/orders'} >
                  <FiBox className={`${location.pathname === '/orders' ? 'text-white' : 'text-[#EDEFF6]'} me-3`} size={'1.4rem'} /> 
                  <span className="font-medium">Orders</span>
                  <span className={`ml-auto text-[11px] font-bold ${location.pathname === '/orders' ? 'bg-white/20 text-white' : 'bg-[#2B3240] text-[#8A8FA3]'} rounded-full px-2.5 py-[2px] transition-colors`}>{loadingCounts ? '...' : counts.orders}</span>
                </Link>
              </li> 
              <li>
                <Link className={`group transition-all duration-300 ${location.pathname === '/customers' ? "bg-gradient-to-br from-[#B39CF6] to-[#8B5CF6] !text-white shadow-[0_8px_20px_rgba(139,92,246,0.4)]" : 'bg-[#11131A] hover:bg-[#181C24] text-[#EDEFF6]'  } mb-2 py-[14px] px-[18px] border border-white/5 rounded-2xl flex items-center`} to={'/customers'} >
                  <TbUserSquareRounded className={`${location.pathname === '/customers' ? 'text-white' : 'text-[#EDEFF6]'} me-3`} size={'1.4rem'} /> 
                  <span className="font-medium">Customers</span>
                  <span className={`ml-auto text-[11px] font-bold ${location.pathname === '/customers' ? 'bg-white/20 text-white' : 'bg-[#2B3240] text-[#8A8FA3]'} rounded-full px-2.5 py-[2px] transition-colors`}>{loadingCounts ? '...' : counts.customers}</span>
                </Link>
              </li>
            </>
          )}

          {/* Common Admin items */}
          {isSuperAdmin && (
            <>
              <li>
                <Link className={`hover:!bg-main hover:opacity-[0.8] hover:scale-[1.05] transition-all  ${location.pathname === '/super-admin' ? "bg-main !text-black" : 'bg-dark'  } text-gray-200 mb-2 py-[13px] px-[13px] border border-gray-900 rounded-2xl  flex items-center`} to={'/super-admin'} ><FaCrown className='me-2' size={'1.4rem'} /> Super Admin Dashboard</Link>
              </li>
              <li>
                <Link className={`hover:!bg-main hover:opacity-[0.8] hover:scale-[1.05] transition-all  ${location.pathname === '/super-admin/profile' ? "bg-main !text-black" : 'bg-dark'  } text-gray-200 mb-2 py-[13px] px-[13px] border border-gray-900 rounded-2xl  flex items-center`} to={'/super-admin/profile'} ><MdAdminPanelSettings className='me-2' size={'1.4rem'} /> Super Admin Profile</Link>
              </li>
            </>
          )}

          {/* Module-Specific Items (Regular) */}
          {(isSuperAdmin || activeModule === 'regular') && (
            <>
              <li>
                <Link className={`group transition-all duration-300 ${location.pathname === '/drivers' ? "bg-gradient-to-br from-[#B39CF6] to-[#8B5CF6] !text-white shadow-[0_8px_20px_rgba(139,92,246,0.4)]" : 'bg-[#11131A] hover:bg-[#181C24] text-[#EDEFF6]'  } mb-2 py-[14px] px-[18px] border border-white/5 rounded-2xl flex items-center`} to={'/drivers'} >
                  <HiOutlineUserCircle className={`${location.pathname === '/drivers' ? 'text-white' : 'text-[#EDEFF6]'} me-3`} size={'1.4rem'} /> 
                  <span className="font-medium">Drivers</span>
                </Link>
              </li>
              <li>
                <Link className={`group transition-all duration-300 ${location.pathname === '/trucks' ? "bg-gradient-to-br from-[#B39CF6] to-[#8B5CF6] !text-white shadow-[0_8px_20px_rgba(139,92,246,0.4)]" : 'bg-[#11131A] hover:bg-[#181C24] text-[#EDEFF6]'  } mb-2 py-[14px] px-[18px] border border-white/5 rounded-2xl flex items-center`} to={'/trucks'} >
                  <TbTruckDelivery className={`${location.pathname === '/trucks' ? 'text-white' : 'text-[#EDEFF6]'} me-3`} size={'1.4rem'} /> 
                  <span className="font-medium">Trucks</span>
                </Link>
              </li>
              <li>
                <Link className={`group transition-all duration-300 ${location.pathname === '/trailers' ? "bg-gradient-to-br from-[#B39CF6] to-[#8B5CF6] !text-white shadow-[0_8px_20px_rgba(139,92,246,0.4)]" : 'bg-[#11131A] hover:bg-[#181C24] text-[#EDEFF6]'  } mb-2 py-[14px] px-[18px] border border-white/5 rounded-2xl flex items-center`} to={'/trailers'} >
                  <FiBox className={`${location.pathname === '/trailers' ? 'text-white' : 'text-[#EDEFF6]'} me-3`} size={'1.4rem'} /> 
                  <span className="font-medium">Trailers</span>
                </Link>
              </li>
            </>
          )}

          {/* Module-Specific Items (Outsourcing) */}
          {(isSuperAdmin || activeModule === 'outsourcing') && (
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
          {(currentUser?.is_admin === 1 || currentUser?.role === 3) && !isSuperAdmin && (
            <>
              <li>
                <Link className={`group transition-all duration-300 ${location.pathname === '/employees' ? "bg-gradient-to-br from-[#B39CF6] to-[#8B5CF6] !text-white shadow-[0_8px_20px_rgba(139,92,246,0.4)]" : 'bg-[#11131A] hover:bg-[#181C24] text-[#EDEFF6]'  } mb-2 py-[14px] px-[18px] border border-white/5 rounded-2xl flex items-center`} to={'/employees'} >
                  <FaUsers className={`${location.pathname === '/employees' ? 'text-white' : 'text-[#EDEFF6]'} me-3`} size={'1.4rem'} /> 
                  <span className="font-medium">Employees</span>
                  <span className={`ml-auto text-[11px] font-bold ${location.pathname === '/employees' ? 'bg-white/20 text-white' : 'bg-[#2B3240] text-[#8A8FA3]'} rounded-full px-2.5 py-[2px] transition-colors`}>{loadingCounts ? '...' : counts.employees}</span>
                </Link>
              </li>
              <li>
                <Link className={`group transition-all duration-300 ${location.pathname === '/commodity-and-equipments' ? "bg-gradient-to-br from-[#B39CF6] to-[#8B5CF6] !text-white shadow-[0_8px_20px_rgba(139,92,246,0.4)]" : 'bg-[#11131A] hover:bg-[#181C24] text-[#EDEFF6]'  } mb-2 py-[14px] px-[18px] border border-white/5 rounded-2xl flex items-center`} to={'/commodity-and-equipments'} >
                  <VscGraphLine className={`${location.pathname === '/commodity-and-equipments' ? 'text-white' : 'text-[#EDEFF6]'} me-3`} size={'1.4rem'} /> 
                  <span className="font-medium">Equip & Revenue Items</span>
                </Link>
              </li>
            </>
          )}

          {/* Universal Items */}
          {(currentUser?.is_admin === 1 || currentUser?.role === 2 || currentUser?.role === 3) && (
            <li>
              <Link className={`group transition-all duration-300 ${location.pathname === '/accounts/orders' ? "bg-gradient-to-br from-[#B39CF6] to-[#8B5CF6] !text-white shadow-[0_8px_20px_rgba(139,92,246,0.4)]" : 'bg-[#11131A] hover:bg-[#181C24] text-[#EDEFF6]'  } mb-2 py-[14px] px-[18px] border border-white/5 rounded-2xl flex items-center`} to={'/accounts/orders'} >
                <MdOutlineDocumentScanner className={`${location.pathname === '/accounts/orders' ? 'text-white' : 'text-[#EDEFF6]'} me-3`} size={'1.4rem'} /> 
                <span className="font-medium">Accounting</span>
              </Link>
            </li> 
          )}

          {currentUser?.role === 3 && (
            <li>
              <Link className={`group transition-all duration-300 ${location.pathname === '/company/details' ? "bg-gradient-to-br from-[#B39CF6] to-[#8B5CF6] !text-white shadow-[0_8px_20px_rgba(139,92,246,0.4)]" : 'bg-[#11131A] hover:bg-[#181C24] text-[#EDEFF6]'  } mb-2 py-[14px] px-[18px] border border-white/5 rounded-2xl flex items-center`} to={'/company/details'} >
                <TbListDetails className={`${location.pathname === '/company/details' ? 'text-white' : 'text-[#EDEFF6]'} me-3`} size={'1.4rem'} /> 
                <span className="font-medium">Company Details</span>
              </Link>
            </li> 
          )}
          
          {currentUser && !isSuperAdmin && (
            <li>
              <Link className={`group transition-all duration-300 ${location.pathname === '/profile' ? "bg-gradient-to-br from-[#B39CF6] to-[#8B5CF6] !text-white shadow-[0_8px_20px_rgba(139,92,246,0.4)]" : 'bg-[#11131A] hover:bg-[#181C24] text-[#EDEFF6]'  } mb-2 py-[14px] px-[18px] border border-white/5 rounded-2xl flex items-center`} to={'/profile'} >
                <BsPersonGear className={`${location.pathname === '/profile' ? 'text-white' : 'text-[#EDEFF6]'} me-3`} size={'1.4rem'} /> 
                <span className="font-medium">Profile</span>
              </Link>
            </li>
          )}
        
          <li>
            <button className='hover:!bg-main hover:opacity-[0.8] hover:scale-[1.05] transition-all  text-gray-200 w-full mb-2 py-[13px] px-[13px] border border-gray-900 rounded-2xl bg-dark flex items-center' onClick={handleLogout} ><MdOutlineLogout className='me-2' size={'1.4rem'} /> Logout
            </button>
          </li>
        </ul>
      </div>
    </>
  )
}
