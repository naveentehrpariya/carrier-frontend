import React, { useContext } from 'react'
import { Link } from 'react-router-dom';
import { MdOutlineSpaceDashboard } from "react-icons/md";
import { TbUserSquareRounded } from "react-icons/tb";
import { FiBox } from "react-icons/fi";
import { TbTruckDelivery } from "react-icons/tb";
import { VscGraphLine } from "react-icons/vsc";
import { FaUsers } from "react-icons/fa";
import { IoSettingsOutline } from "react-icons/io5";
import { BiSupport } from "react-icons/bi";
import { MdOutlineLogout } from "react-icons/md";
import { UserContext } from '../context/AuthProvider';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

export default function Sidebar() {

  const location = useLocation();
  const {user}  = useContext(UserContext);
  
  const logout = () => { 
    localStorage && localStorage.removeItem("token");
    window.location.href = "/login";
  }

  return (
    <div className='sticky top-0 pt-[140px] p-8 bg-dark border-r max-h-[100vh] overflow-auto pb-22 w-full max-w-[300px]  min-w-[300px] border-gray-800'>
      <h2 className='mb-3 text-sm uppercase text-gray-400'>Main Menu</h2>
      <ul>

          <li>
            <Link className={`${location.pathname == '/home' || location.pathname == '/' ? "bg-main !text-black" : 'bg-dark'  } text-gray-200 mb-2 py-[13px] px-[13px] border border-gray-900 rounded-2xl  flex items-center`} to={'/home'} ><MdOutlineSpaceDashboard className='me-2' size={'1.4rem'} /> Dashboard 
          </Link>
          </li> 
        {user?.is_admin == 1 || user?.role == 1 ? 
        <>
          <li>
            <Link className={`${location.pathname == '/orders' ? "bg-main !text-black" : 'bg-dark'  } text-gray-200 mb-2 py-[13px] px-[13px] border border-gray-900 rounded-2xl  flex items-center`} to={'/orders'} ><FiBox className='me-2' size={'1.4rem'} /> Orders 
          </Link>
          </li> 
          <li>
            <Link className={`${location.pathname == '/customers' ? "bg-main !text-black" : 'bg-dark'  } text-gray-200 mb-2 py-[13px] px-[13px] border border-gray-900 rounded-2xl  flex items-center`} to={'/customers'} ><TbUserSquareRounded className='me-2' size={'1.4rem'} /> Customers 
          </Link>
          </li> 
          <li>
            <Link className={`${location.pathname == '/carriers' ? "bg-main !text-black" : 'bg-dark'  } text-gray-200 mb-2 py-[13px] px-[13px] border border-gray-900 rounded-2xl  flex items-center`} to={'/carriers'} ><TbTruckDelivery className='me-2' size={'1.4rem'} /> Carriers 
          </Link>
          </li>
        </>
        : "" } 

        {user?.is_admin == 1  ?
          <li>
            <Link className={`${location.pathname == '/employees' ? "bg-main !text-black" : 'bg-dark'  } text-gray-200 mb-2 py-[13px] px-[13px] border border-gray-900 rounded-2xl  flex items-center`} to={'/employees'} ><FaUsers className='me-2' size={'1.4rem'} /> Employees 
          </Link>
          </li>
          : ''
        }

        {user?.is_admin == 1 || user?.role == 2 ?
          <li>
            <Link className={`${location.pathname == '/accounts/orders' ? "bg-main !text-black" : 'bg-dark'  } text-gray-200 mb-2 py-[13px] px-[13px] border border-gray-900 rounded-2xl  flex items-center`} to={'/accounts/orders'} ><VscGraphLine className='me-2' size={'1.4rem'} /> Accounting 
          </Link>
          </li> 
        : "" }

        {user?.role == 3 ?
          <li>
            <Link className={`${location.pathname == '/company/details' ? "bg-main !text-black" : 'bg-dark'  } text-gray-200 mb-2 py-[13px] px-[13px] border border-gray-900 rounded-2xl  flex items-center`} to={'/company/details'} ><VscGraphLine className='me-2' size={'1.4rem'} /> Company Details 
          </Link>
          </li> 
        : "" }
        
      </ul>
      
      <h2 className='mt-8 mb-3 text-sm uppercase text-gray-400'>Other Menu</h2>
      <ul>
        {/* <li>
            <Link className='disabled text-gray-200 mb-2 py-[13px] px-[13px] border border-gray-900 rounded-2xl bg-dark flex items-center' to={'/dashboard'} ><IoSettingsOutline className='me-2' size={'1.4rem'} /> Settings 
          </Link>
        </li> */}
        {/* <li>
            <Link className='disabled text-gray-200 mb-2 py-[13px] px-[13px] border border-gray-900 rounded-2xl bg-dark flex items-center' to={'/dashboard'} ><BiSupport className='me-2' size={'1.4rem'} /> Help 
          </Link>
        </li> */}
        <li>
          <button className='text-gray-200 mb-2 py-[13px] px-[13px] border border-gray-900 rounded-2xl bg-dark flex items-center' onClick={logout} ><MdOutlineLogout className='me-2' size={'1.4rem'} /> Logout 
          </button>
        </li>
      </ul>
    </div>
  )
}
