import React, { useEffect, useState } from 'react'
import AuthLayout from '../../layout/AuthLayout';
import revanue from '../../img/revenue-graph.png'
import loads from '../../img/loads-stats.png'
import RecentOrdersLists from './order/RecentOrderLists';
import Api from '../../api/Api';
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { UserContext } from '../../context/AuthProvider';
export default function Overview() {
  const { user} = useContext(UserContext);
   const [lists, setLists] = useState([]);
   useEffect(() => { 
      Api.get('/overview').then((res) => {
         if (res.data.status === true) {
            setLists(res.data.lists);
         }
      }).catch((err) => {
         console.log(err);
      })
   }, []);

  return (
      <AuthLayout> 
         <h2 className='text-gray-400 font-bold text-3xl mb-4'>Welcome to {user?.company?.name}</h2>
         <div className='flex justify-between items-center'>
            <h2 className='text-white text-2xl'>Overview</h2>
            {/* <div className='filter'>
               <button className='text-gray-400 px-[15px] py-[8px] border border-gray-800 rounded-[30px] text-sm ms-2'>Weekly</button>
               <button className='text-gray-400 px-[15px] py-[8px] border border-gray-800 rounded-[30px] text-sm ms-2'>Monthly</button>
               <button className='text-gray-400 px-[15px] py-[8px] border border-gray-800 rounded-[30px] text-sm ms-2'>Yearly</button>
            </div> */}

         </div>
         <div className='total-leads mt-4 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3'>
            {lists && lists.map((item, index) => {
               return <>
               <Link to={item.link} className={`lead border border-gray-700 rounded-[30px] p-[20px] md:p-[25px]`}>
                  <div className='cals flex items-center justify-between'> 
                     <h2 className='font-bold text-white text-4xl mb-2'>{item.data}</h2>
                  </div>
                  <h2 className='text-gray-300 mb-1 text-normal md:text-xl'>{item.title}</h2>
                  <div className='bg-[#D278D5] h-[3px] w-[40px]'></div>
               </Link>
               </>
            })}
         </div>

         {/* <div className='revenue-graph flex justify-between mt-6'>
            <div className='left-graphs w-full max-w-[70%] '>
               <img src={revanue} className='w-full block ' alt='total revanue' />
            </div>
            <div className='right-graphs w-full ps-[30px] max-w-[30%]'>
            <img src={loads} className='w-full block ' alt='total revanue' />
            </div>
         </div> */}
         <RecentOrdersLists />
      </AuthLayout>
  )
}
