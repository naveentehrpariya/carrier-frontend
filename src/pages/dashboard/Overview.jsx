import React, { useEffect, useState } from 'react'
import AuthLayout from '../../layout/AuthLayout';
import revanue from '../../img/revenue-graph.png'
import loads from '../../img/loads-stats.png';
import { FaRegCreditCard } from "react-icons/fa6";

import { TbTruckDelivery } from "react-icons/tb";
import RecentOrdersLists from './order/RecentOrderLists';
import Api from '../../api/Api';
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { UserContext } from '../../context/AuthProvider';
import { useAuth } from '../../context/MultiTenantAuthProvider';
import { useMultiTenant } from '../../context/MultiTenantProvider';

export default function Overview() {
  const { user: authUser } = useAuth(); // Multi-tenant auth user
  const { user } = useContext(UserContext); // Legacy user context
  const { tenant } = useMultiTenant();
  
  // Use multi-tenant auth user if available, fallback to legacy
  const currentUser = authUser || user;
  const isAdmin = currentUser?.role === 3 || currentUser?.isTenantAdmin;
  
  const [lists, setLists] = useState([]);
  const [adminData, setAdminData] = useState(null);
  const [carriersData, setCarriersData] = useState([]);
  const [customersData, setCustomersData] = useState([]);
  const [topListLoading,setTopListLoading] = useState(true);
  useEffect(() => { 
    // Fetch regular overview data
    Api.get('/overview').then((res) => {
      if (res.data.status === true) {
        setLists(res.data.lists);
        setTopListLoading(false)
      }
    }).catch((err) => {
      setTopListLoading(false)
      console.log(err);
    });
    
    // Fetch admin data if user is admin
    if (isAdmin) {
      Promise.all([
        Api.get('/api/tenant-admin/info').catch(() => ({ data: { data: null } })),
        Api.get('/api/tenant-admin/analytics?period=30d').catch(() => ({ data: { data: null } })),
        Api.get('/api/tenant-admin/usage').catch(() => ({ data: { data: null } })),
        // Api.get('/carriers').catch(() => ({ data: { carriers: [] } })),
        // Api.get('/customers').catch(() => ({ data: { customers: [] } }))
      ]).then(([tenantInfo, analytics, usage,
        //  carriers, customers
        ]) => {
        setAdminData({
          tenantInfo: tenantInfo.data.data,
          analytics: analytics.data.data,
          usage: usage.data.data
        });
        // setCarriersData(carriers.data.carriers || carriers.data.lists || []);
        // setCustomersData(customers.data.customers || customers.data.lists || []);
      }).catch((err) => {
        console.log('Admin data fetch error:', err);
      });
    }
  }, [isAdmin]);

  return (
      <AuthLayout> 
         <h2 className='text-gray-200 font-bold text-2xl md:text-3xl lg:text-4xl mb-4'>
           Welcome to {currentUser?.company?.name || tenant?.name}
           {isAdmin && <span className='text-lg text-blue-400 ml-2'>(Admin)</span>}
         </h2>
         {isAdmin && (
           <p className='text-gray-400 mb-8 text-lg'>
             You have administrative access to manage your company and employees.
           </p>
         )}
         <div className='flex justify-between items-center'>
            <h2 className='text-white text-2xl'>Overview</h2>
            {/* <div className='filter'>
               <button className='text-gray-400 px-[15px] py-[8px] border border-gray-800 rounded-[30px] text-sm ms-2'>Weekly</button>
               <button className='text-gray-400 px-[15px] py-[8px] border border-gray-800 rounded-[30px] text-sm ms-2'>Monthly</button>
               <button className='text-gray-400 px-[15px] py-[8px] border border-gray-800 rounded-[30px] text-sm ms-2'>Yearly</button>
            </div> */}

         </div>
         <div className='total-leads mt-4 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3'>
           
             {topListLoading ?
              // Add 8 boxes when loadind
              <>
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className='bg-[#131313] lead border border-gray-300 border-gray-700 rounded-[30px] p-[20px] md:p-[25px] min-h-[100px]  md:min-h-[170px] opacity-[0.7] animate animate-pulse'>
                 <div className='bg-gray-700 w-[60%] p-2 rounded-xl'></div>
                 <div className='bg-gray-700 mt-4 w-[90%] p-2 rounded-xl'></div>
                </div>
              ))}
              </>
             :
             <>
              {lists && lists.map((item, index) => {
                return <>
                <Link to={item.link} className={`hover:!bg-[#131313] hover:border-gray-800 lead border border-gray-700 rounded-[30px] p-[20px] md:p-[25px]`}>
                    <h2 className='text-gray-300 mb-1 text-normal md:text-xl'>{item.title}</h2>
                    <div className='cals flex items-center justify-start mb-3 mt-4'> 
                      {item.icon === 'van' ?
                          <TbTruckDelivery className='text-5xl text-gray-400 me-4' />
                          :
                          <FaRegCreditCard className='text-4xl text-gray-400 me-4' />
                      }
                      <h2 className='font-bold text-white text-4xl  '>{item.data}</h2>
                    </div>
                      <div className='bg-[#D278D5] h-[3px] !mt-4 w-[40px]'></div>
                </Link>
                </>
              })}
             </>
             } 
         </div>

         {/* Admin Features Section */}
         {isAdmin && (
           <div className='admin-section mt-8'>
             <div className='flex justify-between items-center mb-4'>
               <h2 className='text-white text-2xl'>Admin Overview</h2>
               <span className='text-gray-400 text-sm bg-gray-800 px-3 py-1 rounded-full'>Admin Access</span>
             </div>
             
             <div className='admin-cards grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mb-6'>
               {/* Company Info Card */}
               <div className='admin-card border border-gray-700 rounded-[30px] p-[20px] md:p-[25px] bg-gradient-to-br from-gray-900 to-gray-800'>
                 <h3 className='text-gray-300 mb-1 text-normal md:text-lg'>Company Info</h3>
                 <div className='mt-4'>
                   <p className='text-white text-sm'>{currentUser?.company?.name || tenant?.name}</p>
                   <p className='text-gray-400 text-xs mt-1'>Tenant Admin</p>
                 </div>
                 <div className='bg-blue-500 h-[3px] mt-4 w-[40px]'></div>
               </div>

               {/* Total Revenue Card */}
               {adminData?.analytics?.summary && (
                 <div className='admin-card border border-gray-700 rounded-[30px] p-[20px] md:p-[25px] bg-gradient-to-br from-gray-900 to-gray-800'>
                   <h3 className='text-gray-300 mb-1 text-normal md:text-lg'>Total Revenue</h3>
                   <div className='flex items-center mt-4'>
                     <FaRegCreditCard className='text-3xl text-green-400 me-3' />
                     <h2 className='font-bold text-white text-2xl'>
                       ${(adminData.analytics.summary.totalRevenue || 0).toLocaleString()}
                     </h2>
                   </div>
                   <div className='bg-green-500 h-[3px] mt-4 w-[40px]'></div>
                 </div>
               )}

               {/* New Customers Card */}
               {adminData?.analytics?.summary && (
                 <div className='admin-card border border-gray-700 rounded-[30px] p-[20px] md:p-[25px] bg-gradient-to-br from-gray-900 to-gray-800'>
                   <h3 className='text-gray-300 mb-1 text-normal md:text-lg'>New Customers</h3>
                   <div className='flex items-center mt-4'>
                     <TbTruckDelivery className='text-4xl text-purple-400 me-3' />
                     <h2 className='font-bold text-white text-3xl'>{adminData.analytics.summary.newCustomers || 0}</h2>
                   </div>
                   <div className='bg-purple-500 h-[3px] mt-4 w-[40px]'></div>
                 </div>
               )}

               {/* User Usage Card */}
               {adminData?.usage && (
                 <div className='admin-card border border-gray-700 rounded-[30px] p-[20px] md:p-[25px] bg-gradient-to-br from-gray-900 to-gray-800'>
                   <h3 className='text-gray-300 mb-1 text-normal md:text-lg'>Team Size</h3>
                   <div className='flex items-center mt-4'>
                     <TbTruckDelivery className='text-4xl text-blue-400 me-3' />
                     <h2 className='font-bold text-white text-3xl'>
                       {adminData.usage.usage?.users || 0}
                     </h2>
                   </div>
                   <p className='text-gray-400 text-xs mt-2'>
                     of {adminData.usage.limits?.maxUsers || '∞'} max users
                   </p>
                   <div className='bg-blue-500 h-[3px] mt-4 w-[40px]'></div>
                 </div>
               )}

               {/* Carriers Count Card */}
               <div className='admin-card border border-gray-700 rounded-[30px] p-[20px] md:p-[25px] bg-gradient-to-br from-gray-900 to-gray-800'>
                 <h3 className='text-gray-300 mb-1 text-normal md:text-lg'>Total Carriers</h3>
                 <div className='flex items-center mt-4'>
                   <TbTruckDelivery className='text-4xl text-blue-400 me-3' />
                   <h2 className='font-bold text-white text-3xl'>{carriersData.length}</h2>
                 </div>
                 <p className='text-gray-400 text-xs mt-2'>Active carriers</p>
                 <div className='bg-blue-500 h-[3px] mt-4 w-[40px]'></div>
               </div>

               {/* Customers Count Card */}
               <div className='admin-card border border-gray-700 rounded-[30px] p-[20px] md:p-[25px] bg-gradient-to-br from-gray-900 to-gray-800'>
                 <h3 className='text-gray-300 mb-1 text-normal md:text-lg'>Total Customers</h3>
                 <div className='flex items-center mt-4'>
                   <FaRegCreditCard className='text-3xl text-green-400 me-3' />
                   <h2 className='font-bold text-white text-3xl'>{customersData.length}</h2>
                 </div>
                 <p className='text-gray-400 text-xs mt-2'>Active customers</p>
                 <div className='bg-green-500 h-[3px] mt-4 w-[40px]'></div>
               </div>
             </div>

             {adminData?.usage?.warnings && (adminData.usage.warnings.nearUserLimit || adminData.usage.warnings.nearOrderLimit) && (
               <div className='usage-warnings mb-6'>
                 <div className='bg-yellow-900 border border-yellow-700 rounded-[20px] p-4'>
                   <div className='flex'>
                     <div className='flex-shrink-0'>
                       <TbTruckDelivery className='h-5 w-5 text-yellow-400' />
                     </div>
                     <div className='ml-3'>
                       <h3 className='text-sm font-medium text-yellow-300'>
                         Usage Warning
                       </h3>
                       <div className='mt-2 text-sm text-yellow-200'>
                         <ul className='list-disc pl-5 space-y-1'>
                           {adminData.usage.warnings.nearUserLimit && (
                             <li>You're approaching your user limit ({adminData.usage.usage?.users}/{adminData.usage.limits?.maxUsers})</li>
                           )}
                           {adminData.usage.warnings.nearOrderLimit && (
                             <li>You're approaching your order limit ({adminData.usage.usage?.orders}/{adminData.usage.limits?.maxOrders})</li>
                           )}
                         </ul>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>
             )}

             {/* Quick Admin Actions */}
             <div className='admin-actions pt-8'>
               <h3 className='text-white text-xl mb-4'>Quick Actions</h3>
               <div className='flex flex-wrap gap-3'>
                 <Link to='/carriers' className='admin-action-btn !rounded-[10px] bg-blue-800 hover:bg-blue-700 text-white px-4 py-2 rounded-lg border border-blue-600 transition-colors flex items-center'>
                   <TbTruckDelivery className='h-4 w-4 mr-2' />
                   Manage Carriers
                 </Link>
                 <Link to='/customers' className='admin-action-btn !rounded-[10px] bg-green-800 hover:bg-green-700 text-white px-4 py-2 rounded-lg border border-green-600 transition-colors flex items-center'>
                   <FaRegCreditCard className='h-3 w-3 mr-2' />
                   Manage Customers
                 </Link>
                 <Link to='/employees' className='admin-action-btn !rounded-[10px] bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 transition-colors'>
                   Manage Employees
                 </Link>
                 <Link to='/orders' className='admin-action-btn !rounded-[10px] bg-purple-800 hover:bg-purple-700 text-white px-4 py-2 rounded-lg border border-purple-600 transition-colors'>
                   View All Orders
                 </Link>
                 <Link to='/commodity-and-equipments' className='admin-action-btn !rounded-[10px] bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 transition-colors'>
                   Equipment & Commodities
                 </Link>
                 <Link to='/accounts/orders' className='admin-action-btn !rounded-[10px] bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 transition-colors'>
                   Account Reports
                 </Link>
                 <Link to='/company/details' className='admin-action-btn !rounded-[10px] bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 transition-colors'>
                   Company Settings
                 </Link>
               </div>
             </div>
           </div>
         )}

         <RecentOrdersLists />
      </AuthLayout>
  )
}
