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
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { TbListDetails } from "react-icons/tb";
import { MdOutlineDocumentScanner } from "react-icons/md";
import { IoMdAddCircle } from "react-icons/io";
 import { HiOutlineUserCircle } from "react-icons/hi2";
import Api from '../api/Api';

export default function Sidebar({toggle}) {

  const location = useLocation();
  const {user}  = useContext(UserContext);

  const logout = () => {
    Api.get('/user/logout')
      .then((res) => {
        if(res.data.status){
          localStorage.removeItem("token");
          window.location.href = "/login";
        } else {
          console.error("Logout failed:", res.data.message);
        }
      })
      .catch((err) => {
        console.error("Logout error:", err);
      });
  }

  const roleChecker = () =>{
    if(user?.role === 1){
      return user?.position ||'Employee'
    }
    else if(user?.role === 2){
      return user?.position ||'Accountant'
    }
    else if(user?.role === 3){
      return user?.position ||'Adminstrator'
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
            <h2 className="capitalize font-bold text-white">{user?.name}</h2>
            <p className="capitalize text-sm mt-[-3px] text-gray-400">{roleChecker()}</p>
          </div>
        </div>
        <ul>
          
          <li>
            <Link className={`hover:!bg-[#131313] hover:text-white focus:!text-white ${location.pathname === '/home' || location.pathname === '/' ? "bg-main !text-black hover:!text-white" : 'bg-dark'  } text-gray-200 mb-2 py-[13px] px-[13px] border border-gray-900 rounded-2xl  flex items-center`} to={'/home'} ><MdOutlineSpaceDashboard className='me-2' size={'1.4rem'} /> Dashboard 
            </Link>
          </li> 

          {user?.is_admin === 1 || user?.role === 1 ? 
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

          {user?.is_admin === 1  ?
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

          {user?.is_admin === 1 || user?.role === 2 ?
            <li>
              <Link className={`hover:!bg-[#131313] hover:text-white focus:!text-white ${location.pathname === '/accounts/orders' ? "bg-main !text-black hover:!text-white" : 'bg-dark'  } text-gray-200 mb-2 py-[13px] px-[13px] border border-gray-900 rounded-2xl  flex items-center`} to={'/accounts/orders'} ><VscGraphLine className='me-2' size={'1.4rem'} /> Accounting 
            </Link>
            </li> 
          : "" }

          {user?.role === 3 ?
            <li>
              <Link className={`hover:!bg-[#131313] hover:text-white focus:!text-white ${location.pathname === '/company/details' ? "bg-main !text-black hover:!text-white" : 'bg-dark'  } text-gray-200 mb-2 py-[13px] px-[13px] border border-gray-900 rounded-2xl  flex items-center`} to={'/company/details'} ><TbListDetails className='me-2' size={'1.4rem'} /> Company Details 
            </Link>
            </li> 
          : "" }
        
          <li>
            <button className='hover:!bg-[#131313] hover:text-white focus:!text-white text-gray-200 w-full mb-2 py-[13px] px-[13px] border border-gray-900 rounded-2xl bg-dark flex items-center' onClick={logout} ><MdOutlineLogout className='me-2' size={'1.4rem'} /> Logout 
            </button>
          </li>
        </ul>
      </div>
    </>
  )
}
