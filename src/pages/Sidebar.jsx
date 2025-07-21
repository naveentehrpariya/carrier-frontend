import React, { useContext } from 'react'
import { Link } from 'react-router-dom';
import { MdOutlineSpaceDashboard } from "react-icons/md";
import { MdOutlineLogout } from "react-icons/md";
 import { HiOutlineUserCircle } from "react-icons/hi2";

export default function Sidebar({toggle}) {

  return (
    <>
      <div id='sidebar' className='mobilesidebar sticky top-0 pt-[140px] p-8 bg-dark border-r max-h-[100vh] overflow-auto pb-22 w-full max-w-[300px]  min-w-[300px] border-gray-800'>
        <div className=" flex md:hidden items-center mb-8">
          <div><HiOutlineUserCircle color="white"  size='2.5rem'/></div>
          <div className="text-start me-4 ps-2">
            <h2 className="capitalize font-bold text-white">Admin</h2>
            <p className="capitalize text-sm mt-[-3px] text-gray-400">Co-Founder</p>
          </div>
        </div>
        <ul>
          
          <li>
            <Link className={`hover:!bg-[#131313] hover:text-white focus:!text-white bg-main !text-black hover:!text-white text-gray-200 mb-2 py-[13px] px-[13px] border border-gray-900 rounded-2xl  flex items-center`} to={'/home'} ><MdOutlineSpaceDashboard className='me-2' size={'1.4rem'} /> Dashboard 
            </Link>
          </li> 
          <li>
            <Link className={`hover:!bg-[#131313] hover:text-white focus:!text-white bg-dark text-gray-200 mb-2 py-[13px] px-[13px] border border-gray-900 rounded-2xl  flex items-center`} to={'/login'} ><MdOutlineSpaceDashboard className='me-2' size={'1.4rem'} /> Login 
            </Link>
          </li> 
           
          <li>
            <button className='hover:!bg-[#131313] hover:text-white focus:!text-white text-gray-200 w-full mb-2 py-[13px] px-[13px] border border-gray-900 rounded-2xl bg-dark flex items-center'  ><MdOutlineLogout className='me-2' size={'1.4rem'} /> Logout 
            </button>
          </li>
        </ul>
      </div>
    </>
  )
}
