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
  
  useEffect(() => { 
    // Fetch regular overview data
    Api.get('/overview').then((res) => {
      if (res.data.status === true) {
        setLists(res.data.lists);
      }
    }).catch((err) => {
      console.log(err);
    });
    
    // Fetch admin data if user is admin
    if (isAdmin) {
      Promise.all([
        Api.get('/api/tenant-admin/info').catch(() => ({ data: { data: null } })),
        Api.get('/api/tenant-admin/analytics?period=30d').catch(() => ({ data: { data: null } })),
        Api.get('/api/tenant-admin/usage').catch(() => ({ data: { data: null } })),
        Api.get('/carriers').catch(() => ({ data: { carriers: [] } })),
        Api.get('/customers').catch(() => ({ data: { customers: [] } }))
      ]).then(([tenantInfo, analytics, usage, carriers, customers]) => {
        setAdminData({
          tenantInfo: tenantInfo.data.data,
          analytics: analytics.data.data,
          usage: usage.data.data
        });
        setCarriersData(carriers.data.carriers || carriers.data.lists || []);
        setCustomersData(customers.data.customers || customers.data.lists || []);
      }).catch((err) => {
        console.log('Admin data fetch error:', err);
      });
    }
  }, [isAdmin]);

  return (
      <AuthLayout> 
         <h2 className='text-gray-200 font-bold text-2xl md:text-3xl lg:text-4xl mb-8'>
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

             {/* Admin Charts Row */}
             <div className='admin-charts mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
               
               {/* Orders by Status */}
               <div className='admin-chart bg-gray-900 border border-gray-700 rounded-[20px] p-6'>
                 <h3 className='text-white text-lg font-medium mb-4 border-b border-gray-700 pb-3'>
                   Orders by Status
                 </h3>
                 {adminData?.analytics?.charts?.ordersByStatus?.length > 0 ? (
                   <div className='space-y-4'>
                     {adminData.analytics.charts.ordersByStatus.map((item, index) => (
                       <div key={index} className='flex items-center justify-between'>
                         <div className='flex items-center'>
                           <div className={`w-3 h-3 rounded-full mr-3 ${
                             index % 4 === 0 ? 'bg-blue-500' :
                             index % 4 === 1 ? 'bg-green-500' :
                             index % 4 === 2 ? 'bg-yellow-500' : 'bg-red-500'
                           }`}></div>
                           <span className='text-sm font-medium text-white capitalize'>
                             {item.status}
                           </span>
                         </div>
                         <span className='text-sm text-gray-400'>
                           {item.count}
                         </span>
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div className='text-center text-gray-400 py-8'>
                     No order data available
                   </div>
                 )}
               </div>

               {/* Recent Orders */}
               <div className='admin-chart bg-gray-900 border border-gray-700 rounded-[20px] p-6'>
                 <h3 className='text-white text-lg font-medium mb-4 border-b border-gray-700 pb-3'>
                   Recent Orders
                 </h3>
                 {adminData?.analytics?.recentOrders?.length > 0 ? (
                   <div className='space-y-4'>
                     {adminData.analytics.recentOrders.slice(0, 5).map((order, index) => (
                       <div key={index} className='flex items-center justify-between'>
                         <div>
                           <div className='text-sm font-medium text-white'>
                             Order #{order.order_number || order._id?.slice(-6)}
                           </div>
                           <div className='text-sm text-gray-400'>
                             {order.customer?.name}
                           </div>
                         </div>
                         <div className='text-right'>
                           <div className='text-sm font-medium text-white'>
                             ${order.total_amount?.toLocaleString() || '0'}
                           </div>
                           <div className={`text-xs px-2 py-1 rounded-full ${
                             order.order_status === 'delivered' ? 'bg-green-900 text-green-300 border border-green-700' :
                             order.order_status === 'in_transit' ? 'bg-blue-900 text-blue-300 border border-blue-700' :
                             order.order_status === 'pending' ? 'bg-yellow-900 text-yellow-300 border border-yellow-700' :
                             'bg-gray-800 text-gray-300 border border-gray-600'
                           }`}>
                             {order.order_status}
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div className='text-center text-gray-400 py-8'>
                     No recent orders
                   </div>
                 )}
               </div>

             </div>

             {/* Carriers and Customers Row */}
             <div className='admin-data mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
               
               {/* Carriers Section */}
               <div className='carriers-section bg-gray-900 border border-gray-700 rounded-[20px] p-6'>
                 <div className='flex justify-between items-center mb-4 border-b border-gray-700 pb-3'>
                   <h3 className='text-white text-lg font-medium'>Carriers</h3>
                   <Link to='/carriers' className='text-blue-400 hover:text-blue-300 text-sm'>
                     View All ({carriersData.length})
                   </Link>
                 </div>
                 {carriersData.length > 0 ? (
                   <div className='space-y-4'>
                     {carriersData.slice(0, 5).map((carrier, index) => (
                       <div key={index} className='flex items-center justify-between hover:bg-gray-800 p-2 rounded-lg transition-colors'>
                         <div className='flex items-center'>
                           <div className='w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-3'>
                             <TbTruckDelivery className='h-4 w-4 text-white' />
                           </div>
                           <div>
                             <div className='text-sm font-medium text-white'>
                               {carrier.name || carrier.company_name}
                             </div>
                             <div className='text-xs text-gray-400'>
                               {carrier.mc_code || carrier.email}
                             </div>
                           </div>
                         </div>
                         <div className='text-right'>
                           <div className={`text-xs px-2 py-1 rounded-full ${
                             carrier.status === 'active' ? 'bg-green-900 text-green-300 border border-green-700' :
                             carrier.status === 'inactive' ? 'bg-red-900 text-red-300 border border-red-700' :
                             'bg-gray-800 text-gray-300 border border-gray-600'
                           }`}>
                             {carrier.status || 'active'}
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div className='text-center text-gray-400 py-8'>
                     <TbTruckDelivery className='h-12 w-12 mx-auto mb-2 text-gray-500' />
                     <p>No carriers found</p>
                   </div>
                 )}
               </div>

               {/* Customers Section */}
               <div className='customers-section bg-gray-900 border border-gray-700 rounded-[20px] p-6'>
                 <div className='flex justify-between items-center mb-4 border-b border-gray-700 pb-3'>
                   <h3 className='text-white text-lg font-medium'>Customers</h3>
                   <Link to='/customers' className='text-green-400 hover:text-green-300 text-sm'>
                     View All ({customersData.length})
                   </Link>
                 </div>
                 {customersData.length > 0 ? (
                   <div className='space-y-4'>
                     {customersData.slice(0, 5).map((customer, index) => (
                       <div key={index} className='flex items-center justify-between hover:bg-gray-800 p-2 rounded-lg transition-colors'>
                         <div className='flex items-center'>
                           <div className='w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mr-3'>
                             <FaRegCreditCard className='h-3 w-3 text-white' />
                           </div>
                           <div>
                             <div className='text-sm font-medium text-white'>
                               {customer.name || customer.company_name}
                             </div>
                             <div className='text-xs text-gray-400'>
                               {customer.email || customer.phone}
                             </div>
                           </div>
                         </div>
                         <div className='text-right'>
                           <div className='text-xs text-gray-400'>
                             {customer.city && customer.state ? `${customer.city}, ${customer.state}` : 'Location N/A'}
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div className='text-center text-gray-400 py-8'>
                     <FaRegCreditCard className='h-12 w-12 mx-auto mb-2 text-gray-500' />
                     <p>No customers found</p>
                   </div>
                 )}
               </div>

             </div>

             {/* Usage Warnings */}
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
             <div className='admin-actions'>
               <h3 className='text-white text-xl mb-4'>Quick Actions</h3>
               <div className='flex flex-wrap gap-3'>
                 <Link to='/carriers' className='admin-action-btn bg-blue-800 hover:bg-blue-700 text-white px-4 py-2 rounded-lg border border-blue-600 transition-colors flex items-center'>
                   <TbTruckDelivery className='h-4 w-4 mr-2' />
                   Manage Carriers
                 </Link>
                 <Link to='/customers' className='admin-action-btn bg-green-800 hover:bg-green-700 text-white px-4 py-2 rounded-lg border border-green-600 transition-colors flex items-center'>
                   <FaRegCreditCard className='h-3 w-3 mr-2' />
                   Manage Customers
                 </Link>
                 <Link to='/employees' className='admin-action-btn bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 transition-colors'>
                   Manage Employees
                 </Link>
                 <Link to='/orders' className='admin-action-btn bg-purple-800 hover:bg-purple-700 text-white px-4 py-2 rounded-lg border border-purple-600 transition-colors'>
                   View All Orders
                 </Link>
                 <Link to='/commodity-and-equipments' className='admin-action-btn bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 transition-colors'>
                   Equipment & Commodities
                 </Link>
                 <Link to='/accounts/orders' className='admin-action-btn bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 transition-colors'>
                   Account Reports
                 </Link>
                 <Link to='/company/details' className='admin-action-btn bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 transition-colors'>
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
