import React from 'react'
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

export default function Sidebar() {


  const logout = () => { 
    localStorage && localStorage.removeItem("token");
    window.location.href = "/login";
  }


  return (
    <div className='sticky top-0 pt-[110px] p-8 bg-dark border-r max-h-[100vh] overflow-auto pb-22 w-full max-w-[300px] border-gray-900'>
      <h2 className='mb-3 text-sm uppercase text-gray-400'>Main Menu</h2>
      <ul>
        <li>
          <Link className='text-gray-200 mb-2 py-[13px] px-[13px] border border-gray-900 rounded-2xl bg-dark flex items-center' to={'/home'} ><MdOutlineSpaceDashboard className='me-2' size={'1.4rem'} /> Dashboard 
         </Link>
        </li>
        <li>
          <Link className='text-gray-200 mb-2 py-[13px] px-[13px] border border-gray-900 rounded-2xl bg-dark flex items-center' to={'/orders'} ><FiBox className='me-2' size={'1.4rem'} /> Orders 
         </Link>
        </li>
        <li>
          <Link className='text-gray-200 mb-2 py-[13px] px-[13px] border border-gray-900 rounded-2xl bg-dark flex items-center' to={'/customers'} ><TbUserSquareRounded className='me-2' size={'1.4rem'} /> Customers 
         </Link>
        </li> 
        <li>
          <Link className='text-gray-200 mb-2 py-[13px] px-[13px] border border-gray-900 rounded-2xl bg-dark flex items-center' to={'/carriers'} ><TbTruckDelivery className='me-2' size={'1.4rem'} /> Carriers 
         </Link>
        </li>
        <li>
          <Link className='disabled text-gray-200 mb-2 py-[13px] px-[13px] border border-gray-900 rounded-2xl bg-dark flex items-center' to={'/dashboard'} ><VscGraphLine className='me-2' size={'1.4rem'} /> Accounting 
         </Link>
        </li>
        <li>
          <Link className='disabled text-gray-200 mb-2 py-[13px] px-[13px] border border-gray-900 rounded-2xl bg-dark flex items-center' to={'/dashboard'} ><FaUsers className='me-2' size={'1.4rem'} /> Staff 
         </Link>
        </li>
        <li>
          <Link className='disabled text-gray-200 mb-2 py-[13px] px-[13px] border border-gray-900 rounded-2xl bg-dark flex items-center' to={'/dashboard'} ><VscGraphLine className='me-2' size={'1.4rem'} /> Accounting 
         </Link>
        </li>
        <li>
          <Link className='disabled text-gray-200 mb-2 py-[13px] px-[13px] border border-gray-900 rounded-2xl bg-dark flex items-center' to={'/dashboard'} ><FaUsers className='me-2' size={'1.4rem'} /> Staff 
         </Link>
        </li>
        <li>
          <Link className='disabled text-gray-200 mb-2 py-[13px] px-[13px] border border-gray-900 rounded-2xl bg-dark flex items-center' to={'/dashboard'} ><VscGraphLine className='me-2' size={'1.4rem'} /> Accounting 
         </Link>
        </li>
        <li>
          <Link className='disabled text-gray-200 mb-2 py-[13px] px-[13px] border border-gray-900 rounded-2xl bg-dark flex items-center' to={'/dashboard'} ><FaUsers className='me-2' size={'1.4rem'} /> Staff 
         </Link>
        </li>
      </ul>
      
      <h2 className='mt-8 mb-3 text-sm uppercase text-gray-400'>Other Menu</h2>
      <ul>
        <li>
            <Link className='disabled text-gray-200 mb-2 py-[13px] px-[13px] border border-gray-900 rounded-2xl bg-dark flex items-center' to={'/dashboard'} ><IoSettingsOutline className='me-2' size={'1.4rem'} /> Settings 
          </Link>
        </li>
        <li>
            <Link className='disabled text-gray-200 mb-2 py-[13px] px-[13px] border border-gray-900 rounded-2xl bg-dark flex items-center' to={'/dashboard'} ><BiSupport className='me-2' size={'1.4rem'} /> Help 
          </Link>
        </li>
        <li>
          <button className='text-gray-200 mb-2 py-[13px] px-[13px] border border-gray-900 rounded-2xl bg-dark flex items-center' onClick={logout} ><MdOutlineLogout className='me-2' size={'1.4rem'} /> Logout 
          </button>
        </li>
      </ul>
    </div>
  )
}
