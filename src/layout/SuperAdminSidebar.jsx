import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MdOutlineLogout } from "react-icons/md";
import { useAuth } from '../context/MultiTenantAuthProvider';
import { HiOutlineUserCircle } from "react-icons/hi2";
import { FaCrown } from "react-icons/fa";
import { BuildingOfficeIcon, PlusIcon } from '@heroicons/react/24/outline';

export default function SuperAdminSidebar({ toggle, logout }) {
  const location = useLocation();
  const { user: multiTenantUser } = useAuth();

  return (
    <>
      <div 
        id='super-admin-sidebar' 
        className='mobilesidebar sticky top-0 pt-[140px] p-8 bg-dark border-r max-h-[100vh] overflow-auto pb-22 w-full max-w-[300px] min-w-[300px] border-gray-800'
      >
        <div className="flex md:hidden items-center mb-8">
          <div><HiOutlineUserCircle color="white" size='2.5rem'/></div>
          <div className="text-start me-4 ps-2">
            <h2 className="capitalize font-bold text-white">{multiTenantUser?.name}</h2>
            <p className="capitalize text-sm mt-[-3px] text-gray-400">Super Administrator</p>
          </div>
        </div>

        <ul>
          <li>
            <Link 
              className={`hover:!bg-[#131313] hover:text-white focus:!text-white ${
                location.pathname === '/super-admin' ? "bg-main !text-black hover:!text-white" : 'bg-dark'
              } text-gray-200 mb-2 py-[13px] px-[13px] border border-gray-900 rounded-2xl flex items-center`} 
              to={'/super-admin'}
            >
              <FaCrown className='me-2' size={'1.4rem'} /> Super Admin Dashboard
            </Link>
          </li>

          <li>
            <Link 
              className={`hover:!bg-[#131313] hover:text-white focus:!text-white ${
                location.pathname === '/super-admin/plans' ? "bg-main !text-black hover:!text-white" : 'bg-dark'
              } text-gray-200 mb-2 py-[13px] px-[13px] border border-gray-900 rounded-2xl flex items-center`} 
              to={'/super-admin/plans'}
            >
              <BuildingOfficeIcon className='me-2 h-5 w-5' /> Manage Pricing Plans
            </Link>
          </li>

          <li>
            <Link 
              className={`hover:!bg-[#131313] hover:text-white focus:!text-white ${
                location.pathname === '/super-admin/tenants' ? "bg-main !text-black hover:!text-white" : 'bg-dark'
              } text-gray-200 mb-2 py-[13px] px-[13px] border border-gray-900 rounded-2xl flex items-center`} 
              to={'/super-admin/tenants'}
            >
              <BuildingOfficeIcon className='me-2' width="1.4rem" height="1.4rem" /> Tenant Management
            </Link>
          </li>

          <li>
            <Link 
              className={`hover:!bg-[#131313] hover:text-white focus:!text-white ${
                location.pathname === '/super-admin/add-tenant' ? "bg-main !text-black hover:!text-white" : 'bg-dark'
              } text-gray-200 mb-2 py-[13px] px-[13px] border border-gray-900 rounded-2xl flex items-center`} 
              to={'/super-admin/add-tenant'}
            >
              <PlusIcon className='me-2' width="1.4rem" height="1.4rem" /> Add New Tenant
            </Link>
          </li>

          <li>
            <button 
              className='hover:!bg-[#131313] hover:text-white focus:!text-white text-gray-200 w-full mb-2 py-[13px] px-[13px] border border-gray-900 rounded-2xl bg-dark flex items-center' 
              onClick={logout}
            >
              <MdOutlineLogout className='me-2' size={'1.4rem'} /> Logout
            </button>
          </li>
        </ul>
      </div>
    </>
  );
}