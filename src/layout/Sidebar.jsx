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

export default function Sidebar({toggle}) {

  const location = useLocation();
  const {user}  = useContext(UserContext);
  const { user: multiTenantUser, logout: multiTenantLogout } = useAuth();
  const { isSuperAdmin, tenant } = useMultiTenant();
  
  // Use multi-tenant user if available, fallback to legacy user
  const currentUser = multiTenantUser || user;

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
          localStorage.removeItem("token");
          window.location.href = "/login";
        } else {
          console.error("Logout failed:", res.data.message);
        }
      } catch (err) {
        console.error("Logout error:", err);
        // Force redirect even if API fails
        localStorage.clear();
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
      return currentUser?.position ||'Adminstrator'
    }
  }

  return (
    <>
      {/* <button  className='text-white text-4xl absolute top-3 z-[99999] bg-black px-4 py-3 rounded-xl right-3'>&times;</button> */}
      <div id='sidebar' className='mobilesidebar sticky top-0 pt-[140px] p-8 bg-dark border-r max-h-[100vh] overflow-auto pb-22 w-full max-w-[300px]  min-w-[300px] border-gray-800'>
        {/* <h2 className='mb-3 text-sm uppercase text-gray-400'>Main Menu</h2> */}
        <div className=" flex md:hidden items-center mb-8">
          <div><HiOutlineUserCircle color="white"  size='2.5rem'/></div>
          <div className="text-start me-4 ps-2">
            <h2 className="capitalize font-bold text-white">{currentUser?.name}</h2>
            <p className="capitalize text-sm mt-[-3px] text-gray-400">{roleChecker()}</p>
          </div>
        </div>
        <ul>
          
          <li>
            <Link className={`hover:!bg-[#131313] hover:text-white focus:!text-white ${location.pathname === '/home' || location.pathname === '/' ? "bg-main !text-black hover:!text-white" : 'bg-dark'  } text-gray-200 mb-2 py-[13px] px-[13px] border border-gray-900 rounded-2xl  flex items-center`} to={'/home'} ><MdOutlineSpaceDashboard className='me-2' size={'1.4rem'} /> Dashboard 
            </Link>
          </li>

          {/* Super Admin Dashboard Link */}
          {isSuperAdmin && (
            <li>
              <Link className={`hover:!bg-[#131313] hover:text-white focus:!text-white ${location.pathname === '/super-admin' ? "bg-main !text-black hover:!text-white" : 'bg-dark'  } text-gray-200 mb-2 py-[13px] px-[13px] border border-gray-900 rounded-2xl  flex items-center`} to={'/super-admin'} ><FaCrown className='me-2' size={'1.4rem'} /> Super Admin
              </Link>
            </li>
          )}

          {/* Super Admin Profile Link */}
          {isSuperAdmin && (
            <li>
              <Link className={`hover:!bg-[#131313] hover:text-white focus:!text-white ${location.pathname === '/super-admin/profile' ? "bg-main !text-black hover:!text-white" : 'bg-dark'  } text-gray-200 mb-2 py-[13px] px-[13px] border border-gray-900 rounded-2xl  flex items-center`} to={'/super-admin/profile'} ><BsPersonGear className='me-2' size={'1.4rem'} /> Profile Settings
              </Link>
            </li>
          )}

          {/* Tenant Admin Dashboard Link */}
          {currentUser?.role === 3 && tenant && !isSuperAdmin && (
            <li>
              <Link className={`hover:!bg-[#131313] hover:text-white focus:!text-white ${location.pathname === '/tenant-admin' ? "bg-main !text-black hover:!text-white" : 'bg-dark'  } text-gray-200 mb-2 py-[13px] px-[13px] border border-gray-900 rounded-2xl  flex items-center`} to={'/tenant-admin'} ><MdAdminPanelSettings className='me-2' size={'1.4rem'} /> Tenant Admin
              </Link>
            </li>
          )}

          {currentUser?.is_admin === 1 || currentUser?.role === 1 || currentUser?.role === 3 ?
          <>
            <li>
              <Link className={`hover:!bg-[#131313] hover:text-white focus:!text-white ${location.pathname === '/order/add' ? "bg-main !text-black hover:!text-white" : 'bg-dark'  } text-gray-200 mb-2 py-[13px] px-[13px] border border-gray-900 rounded-2xl  flex items-center`} to={'/order/add'} ><IoMdAddCircle className='me-2' size={'1.4rem'} /> Add New Order 
            </Link>
            </li>
            <li>
              <Link className={`hover:!bg-[#131313] hover:text-white focus:!text-white ${location.pathname === '/orders' ? "bg-main !text-black hover:!text-white" : 'bg-dark'  } text-gray-200 mb-2 py-[13px] px-[13px] border border-gray-900 rounded-2xl  flex items-center`} to={'/orders'} ><FiBox className='me-2' size={'1.4rem'} /> Orders 
            </Link>
            </li> 
            <li>
              <Link className={`hover:!bg-[#131313] hover:text-white focus:!text-white ${location.pathname === '/customers' ? "bg-main !text-black hover:!text-white" : 'bg-dark'  } text-gray-200 mb-2 py-[13px] px-[13px] border border-gray-900 rounded-2xl  flex items-center`} to={'/customers'} ><TbUserSquareRounded className='me-2' size={'1.4rem'} /> Customers 
            </Link>
            </li> 
            <li>
              <Link className={`hover:!bg-[#131313] hover:text-white focus:!text-white ${location.pathname === '/carriers' ? "bg-main !text-black hover:!text-white" : 'bg-dark'  } text-gray-200 mb-2 py-[13px] px-[13px] border border-gray-900 rounded-2xl  flex items-center`} to={'/carriers'} ><TbTruckDelivery className='me-2' size={'1.4rem'} /> Carriers 
            </Link>
            </li>
          </>
          : "" }

          {currentUser?.is_admin === 1 || currentUser?.role === 3 ?
          <>
            <li>
              <Link className={`hover:!bg-[#131313] hover:text-white focus:!text-white ${location.pathname === '/employees' ? "bg-main !text-black hover:!text-white" : 'bg-dark'  } text-gray-200 mb-2 py-[13px] px-[13px] border border-gray-900 rounded-2xl  flex items-center`} to={'/employees'} ><FaUsers className='me-2' size={'1.4rem'} />Employees 
              </Link>
            </li>
            <li>
              <Link className={`hover:!bg-[#131313] hover:text-white focus:!text-white ${location.pathname === '/commodity-and-equipments' ? "bg-main !text-black hover:!text-white" : 'bg-dark'  } text-gray-200 mb-2 py-[13px] px-[13px] border border-gray-900 rounded-2xl  flex items-center`} to={'/commodity-and-equipments'} ><MdOutlineDocumentScanner className='me-2' size={'1.4rem'} />Equip & Revenue Items
              </Link>
            </li>
          </>
          : ''
          }

          {currentUser?.is_admin === 1 || currentUser?.role === 2 || currentUser?.role === 3 ?
            <li>
              <Link className={`hover:!bg-[#131313] hover:text-white focus:!text-white ${location.pathname === '/accounts/orders' ? "bg-main !text-black hover:!text-white" : 'bg-dark'  } text-gray-200 mb-2 py-[13px] px-[13px] border border-gray-900 rounded-2xl  flex items-center`} to={'/accounts/orders'} ><VscGraphLine className='me-2' size={'1.4rem'} /> Accounting 
              </Link>
            </li> 
          : "" }

          {currentUser?.role === 3 ?
            <li>
              <Link className={`hover:!bg-[#131313] hover:text-white focus:!text-white ${location.pathname === '/company/details' ? "bg-main !text-black hover:!text-white" : 'bg-dark'  } text-gray-200 mb-2 py-[13px] px-[13px] border border-gray-900 rounded-2xl  flex items-center`} to={'/company/details'} ><TbListDetails className='me-2' size={'1.4rem'} /> Company Details 
            </Link>
            </li> 
          : "" }
          
          {/* User Profile Link - visible to all authenticated users except super admin */}
          {currentUser && !isSuperAdmin && (
            <li>
              <Link className={`hover:!bg-[#131313] hover:text-white focus:!text-white ${location.pathname === '/profile' ? "bg-main !text-black hover:!text-white" : 'bg-dark'  } text-gray-200 mb-2 py-[13px] px-[13px] border border-gray-900 rounded-2xl  flex items-center`} to={'/profile'} ><BsPersonGear className='me-2' size={'1.4rem'} /> Profile Settings
            </Link>
            </li>
          )}
        
          <li>
            <button className='hover:!bg-[#131313] hover:text-white focus:!text-white text-gray-200 w-full mb-2 py-[13px] px-[13px] border border-gray-900 rounded-2xl bg-dark flex items-center' onClick={handleLogout} ><MdOutlineLogout className='me-2' size={'1.4rem'} /> Logout
            </button>
          </li>
        </ul>
      </div>
    </>
  )
}
