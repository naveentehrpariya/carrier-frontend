import React, { useEffect, useState } from 'react'
import AuthLayout from '../../layout/AuthLayout';
import revanue from '../../img/revenue-graph.png'
import loads from '../../img/loads-stats.png';
import { FaRegCreditCard } from "react-icons/fa6";
import { TbUserSquareRounded } from "react-icons/tb";
import { TbTruckDelivery } from "react-icons/tb";
import { HiOutlineUserCircle } from "react-icons/hi2";
import { FiBox } from "react-icons/fi";
import RecentOrdersLists from './order/RecentOrderLists';
import Api from '../../api/Api';
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { UserContext } from '../../context/AuthProvider';
import { useAuth } from '../../context/MultiTenantAuthProvider';
import { useMultiTenant } from '../../context/MultiTenantProvider';
import safeStorage from '../../utils/safeStorage';

export default function Overview() {
  const { user: authUser, activeModule, setActiveModule } = useAuth(); // Multi-tenant auth user
  const { user } = useContext(UserContext); // Legacy user context
  const { tenant } = useMultiTenant();
  
  // Use multi-tenant auth user if available, fallback to legacy
  const currentUser = authUser || user;
  const isAdmin = currentUser?.role === 3 || currentUser?.isTenantAdmin;
  const allowedModules = Array.isArray(currentUser?.allowedModules) ? currentUser.allowedModules : ['outsourcing', 'regular'];
  
  const [lists, setLists] = useState([]);
  const [adminData, setAdminData] = useState(null);
  const [carriersData, setCarriersData] = useState([]);
  const [customersData, setCustomersData] = useState([]);
  const [topListLoading,setTopListLoading] = useState(true);

  // Fleet stats (for Trailer module)
  const [fleetStats, setFleetStats] = useState({ drivers: 0, trucks: 0, trailers: 0 });

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

    // Fetch fleet stats if Regular module active
    if (allowedModules.includes('regular')) {
      Promise.all([
        Api.get('/drivers/listings').catch(() => ({ data: { lists: [] } })),
        Api.get('/trucks/listings').catch(() => ({ data: { lists: [] } })),
        Api.get('/trailers/listings').catch(() => ({ data: { lists: [] } }))
      ]).then(([drivers, trucks, trailers]) => {
        setFleetStats({
          drivers: drivers.data.lists?.length || 0,
          trucks: trucks.data.lists?.length || 0,
          trailers: trailers.data.lists?.length || 0
        });
      });
    }
    
    // Fetch admin data if user is admin
    if (isAdmin) {
      Promise.all([
        Api.get('/api/tenant-admin/info').catch(() => ({ data: { data: null } })),
        Api.get('/api/tenant-admin/analytics?period=30d').catch(() => ({ data: { data: null } })),
        Api.get('/api/tenant-admin/usage').catch(() => ({ data: { data: null } })),
        Api.get('/carriers/listings').catch(() => ({ data: { carriers: [] } })),
        Api.get('/customer/listings').catch(() => ({ data: { customers: [] } }))
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
  }, [isAdmin, allowedModules]);

  return (
      <AuthLayout> 
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
           <div>
             <h2 className='text-[#EDEFF6] font-bold text-3xl md:text-4xl mb-2 flex items-center gap-3'>
               Welcome to {adminData?.tenantInfo?.tenant?.name || currentUser?.company?.name || tenant?.name}
               {isAdmin && <span className='text-[14px] bg-[#4EA1FF]/10 text-[#4EA1FF] px-3 py-1 rounded-full border border-[#4EA1FF]/20'>(Admin)</span>}
             </h2>
             <p className='text-[#8A8FA3] text-lg'>
               You have administrative access to manage your company and employees.
             </p>
           </div>

           {/* Module Switcher Tabs (Modern UI) */}
           {allowedModules.length > 1 && (
             <div className="flex bg-[#1B1E27] p-1.5 rounded-2xl border border-white/5 shadow-inner">
               <button
                 onClick={() => setActiveModule('outsourcing')}
                 className={`text-[11px] uppercase font-black tracking-wider py-2.5 px-6 rounded-xl transition-all duration-300 ${
                   activeModule === 'outsourcing' ? 'bg-gradient-to-r from-[#B39CF6] to-[#C3A9FF] text-white shadow-lg' : 'text-[#8A8FA3] hover:text-[#EDEFF6]'
                 }`}
               >
                 OUTSOURCING
               </button>
               <button
                 onClick={() => setActiveModule('regular')}
                 className={`text-[11px] uppercase font-black tracking-wider py-2.5 px-6 rounded-xl transition-all duration-300 ${
                   activeModule === 'regular' ? 'bg-gradient-to-r from-[#B39CF6] to-[#C3A9FF] text-white shadow-lg' : 'text-[#8A8FA3] hover:text-[#EDEFF6]'
                 }`}
               >
                 REGULAR
               </button>
             </div>
           )}
         </div>

         <div className='flex justify-between items-center mb-6'>
            <h2 className='text-[#EDEFF6] text-2xl font-bold tracking-tight'>{activeModule === 'outsourcing' ? 'Outsourcing Overview' : 'Regular Overview'}</h2>
         </div>

         {activeModule === 'outsourcing' ? (
           <div className='total-leads mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
               {topListLoading ? 
                <>
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className='bg-[#11131A] border border-white/5 rounded-[32px] p-8 min-h-[180px] animate-pulse shadow-xl'>
                   <div className='bg-white/5 w-[50%] h-4 rounded-full mb-6'></div>
                   <div className='bg-white/5 w-[80%] h-12 rounded-2xl'></div>
                  </div>
                ))}
                </>
               :
               <>
                {lists && lists.map((item, index) => (
                  <Link key={index} to={item.link} className="group relative bg-[#11131A] hover:bg-[#181C24] border border-white/5 hover:border-[#B39CF6]/30 rounded-[32px] p-8 transition-all duration-500 hover:-translate-y-2 shadow-xl hover:shadow-[#B39CF6]/10">
                      <h2 className='text-[#8A8FA3] mb-4 text-sm uppercase font-black tracking-widest'>{item.title}</h2>
                      <div className='flex items-center justify-between'> 
                        <h2 className='font-bold text-[#EDEFF6] text-5xl tracking-tighter'>{item.data}</h2>
                        <div className="p-4 bg-[#B39CF6]/10 rounded-2xl group-hover:bg-[#B39CF6]/20 transition-colors">
                          {item.icon === 'van' ?
                              <TbTruckDelivery className='text-3xl text-[#B39CF6]' />
                              :
                              <FaRegCreditCard className='text-3xl text-[#B39CF6]' />
                          }
                        </div>
                      </div>
                      <div className='absolute bottom-0 left-8 right-8 h-[4px] bg-[#B39CF6] rounded-t-full opacity-40 group-hover:opacity-100 transition-opacity duration-500'></div>
                  </Link>
                ))}
               </>
               } 
           </div>
         ) : (
           <div className='fleet-stats mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
              <Link to='/drivers' className='group relative bg-[#11131A] hover:bg-[#181C24] border border-white/5 hover:border-[#4EA1FF]/30 rounded-[32px] p-8 transition-all duration-500 hover:-translate-y-2 shadow-xl hover:shadow-[#4EA1FF]/10'>
                  <h2 className='text-[#8A8FA3] mb-4 text-sm uppercase font-black tracking-widest'>Total Drivers</h2>
                  <div className='flex items-center justify-between'> 
                    <h2 className='font-bold text-[#EDEFF6] text-5xl tracking-tighter'>{fleetStats.drivers}</h2>
                    <div className="p-4 bg-[#4EA1FF]/10 rounded-2xl group-hover:bg-[#4EA1FF]/20 transition-colors">
                      <HiOutlineUserCircle className='text-3xl text-[#4EA1FF]' />
                    </div>
                  </div>
                  <div className='absolute bottom-0 left-8 right-8 h-[4px] bg-[#4EA1FF] rounded-t-full opacity-40 group-hover:opacity-100 transition-opacity duration-500'></div>
              </Link>
              <Link to='/trucks' className='group relative bg-[#11131A] hover:bg-[#181C24] border border-white/5 hover:border-[#4EA1FF]/30 rounded-[32px] p-8 transition-all duration-500 hover:-translate-y-2 shadow-xl hover:shadow-[#4EA1FF]/10'>
                  <h2 className='text-[#8A8FA3] mb-4 text-sm uppercase font-black tracking-widest'>Total Trucks</h2>
                  <div className='flex items-center justify-between'> 
                    <h2 className='font-bold text-[#EDEFF6] text-5xl tracking-tighter'>{fleetStats.trucks}</h2>
                    <div className="p-4 bg-[#4EA1FF]/10 rounded-2xl group-hover:bg-[#4EA1FF]/20 transition-colors">
                      <TbTruckDelivery className='text-3xl text-[#4EA1FF]' />
                    </div>
                  </div>
                  <div className='absolute bottom-0 left-8 right-8 h-[4px] bg-[#4EA1FF] rounded-t-full opacity-40 group-hover:opacity-100 transition-opacity duration-500'></div>
              </Link>
              <Link to='/trailers' className='group relative bg-[#11131A] hover:bg-[#181C24] border border-white/5 hover:border-[#4EA1FF]/30 rounded-[32px] p-8 transition-all duration-500 hover:-translate-y-2 shadow-xl hover:shadow-[#4EA1FF]/10'>
                  <h2 className='text-[#8A8FA3] mb-4 text-sm uppercase font-black tracking-widest'>Total Trailers</h2>
                  <div className='flex items-center justify-between'> 
                    <h2 className='font-bold text-[#EDEFF6] text-5xl tracking-tighter'>{fleetStats.trailers}</h2>
                    <div className="p-4 bg-[#4EA1FF]/10 rounded-2xl group-hover:bg-[#4EA1FF]/20 transition-colors">
                      <FiBox className='text-3xl text-[#4EA1FF]' />
                    </div>
                  </div>
                  <div className='absolute bottom-0 left-8 right-8 h-[4px] bg-[#4EA1FF] rounded-t-full opacity-40 group-hover:opacity-100 transition-opacity duration-500'></div>
              </Link>
              <Link to='/customers' className='group relative bg-[#11131A] hover:bg-[#181C24] border border-white/5 hover:border-[#4EA1FF]/30 rounded-[32px] p-8 transition-all duration-500 hover:-translate-y-2 shadow-xl hover:shadow-[#4EA1FF]/10'>
                  <h2 className='text-[#8A8FA3] mb-4 text-sm uppercase font-black tracking-widest'>Total Customers</h2>
                  <div className='flex items-center justify-between'> 
                    <h2 className='font-bold text-[#EDEFF6] text-5xl tracking-tighter'>{customersData.length}</h2>
                    <div className="p-4 bg-[#4EA1FF]/10 rounded-2xl group-hover:bg-[#4EA1FF]/20 transition-colors">
                      <TbUserSquareRounded className='text-3xl text-[#4EA1FF]' />
                    </div>
                  </div>
                  <div className='absolute bottom-0 left-8 right-8 h-[4px] bg-[#4EA1FF] rounded-t-full opacity-40 group-hover:opacity-100 transition-opacity duration-500'></div>
              </Link>
           </div>
         )}

         {/* Admin Features Section */}
         {isAdmin && (
           <div className='admin-section mt-12'>
             <div className='flex justify-between items-center mb-6'>
               <h2 className='text-white text-2xl font-bold tracking-tight'>Admin Overview</h2>
               <span className='text-[#4EA1FF] text-[10px] uppercase font-black tracking-widest bg-[#4EA1FF]/10 px-4 py-1.5 rounded-full border border-[#4EA1FF]/20'>Admin Access</span>
             </div>
             
             <div className='admin-cards grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10'>
               {/* Company Info Card */}
               <div className='group relative bg-[#11131A] hover:bg-[#181C24] border border-white/5 hover:border-[#4EA1FF]/30 rounded-[32px] p-8 transition-all duration-500 hover:-translate-y-2 shadow-xl hover:shadow-[#4EA1FF]/10 overflow-hidden'>
                 <h2 className='text-[#8A8FA3] mb-4 text-sm uppercase font-black tracking-widest'>Company Info</h2>
                 <div className='flex flex-col'>
                   <p className='text-white font-bold text-xl tracking-tight leading-tight'>{adminData?.tenantInfo?.tenant?.name || currentUser?.company?.name || tenant?.name}</p>
                   <p className='text-[#8A8FA3] text-xs mt-2 uppercase font-bold tracking-wider'>Tenant Admin</p>
                 </div>
                 <div className='absolute bottom-0 left-8 right-8 h-[4px] bg-[#4EA1FF] rounded-t-full opacity-40 group-hover:opacity-100 transition-opacity duration-500'></div>
               </div>

               {/* Total Revenue Card */}
               {adminData?.analytics?.summary && (
                 <div className='group relative bg-[#11131A] hover:bg-[#181C24] border border-white/5 hover:border-[#10B981]/30 rounded-[32px] p-8 transition-all duration-500 hover:-translate-y-2 shadow-xl hover:shadow-[#10B981]/10 overflow-hidden'>
                   <h2 className='text-[#8A8FA3] mb-4 text-sm uppercase font-black tracking-widest'>Total Revenue</h2>
                   <div className='flex items-center justify-between'> 
                     <h2 className='font-bold text-[#EDEFF6] text-4xl tracking-tighter'>
                       ${(adminData.analytics.summary.totalRevenue || 0).toLocaleString()}
                     </h2>
                     <div className="p-4 bg-[#10B981]/10 rounded-2xl group-hover:bg-[#10B981]/20 transition-colors">
                       <FaRegCreditCard className='text-3xl text-[#10B981]' />
                     </div>
                   </div>
                   <div className='absolute bottom-0 left-8 right-8 h-[4px] bg-[#10B981] rounded-t-full opacity-40 group-hover:opacity-100 transition-opacity duration-500'></div>
                 </div>
               )}

               {/* New Customers Card */}
               {adminData?.analytics?.summary && (
                 <div className='group relative bg-[#11131A] hover:bg-[#181C24] border border-white/5 hover:border-[#8B5CF6]/30 rounded-[32px] p-8 transition-all duration-500 hover:-translate-y-2 shadow-xl hover:shadow-[#8B5CF6]/10 overflow-hidden'>
                   <h2 className='text-[#8A8FA3] mb-4 text-sm uppercase font-black tracking-widest'>New Customers</h2>
                   <div className='flex items-center justify-between'> 
                     <h2 className='font-bold text-[#EDEFF6] text-5xl tracking-tighter'>{adminData.analytics.summary.newCustomers || 0}</h2>
                     <div className="p-4 bg-[#8B5CF6]/10 rounded-2xl group-hover:bg-[#8B5CF6]/20 transition-colors">
                       <TbTruckDelivery className='text-3xl text-[#8B5CF6]' />
                     </div>
                   </div>
                   <div className='absolute bottom-0 left-8 right-8 h-[4px] bg-[#8B5CF6] rounded-t-full opacity-40 group-hover:opacity-100 transition-opacity duration-500'></div>
                 </div>
               )}

               {/* User Usage Card */}
               {adminData?.usage && (
                 <div className='group relative bg-[#11131A] hover:bg-[#181C24] border border-white/5 hover:border-[#3B82F6]/30 rounded-[32px] p-8 transition-all duration-500 hover:-translate-y-2 shadow-xl hover:shadow-[#3B82F6]/10 overflow-hidden'>
                   <h2 className='text-[#8A8FA3] mb-4 text-sm uppercase font-black tracking-widest'>Team Size</h2>
                   <div className='flex items-center justify-between'> 
                     <div className='flex flex-col'>
                       <h2 className='font-bold text-[#EDEFF6] text-5xl tracking-tighter'>{adminData.usage.usage?.users || 0}</h2>
                       <p className='text-[#8A8FA3] text-[10px] uppercase font-bold tracking-widest mt-1'>
                         of {adminData.usage.limits?.maxUsers || '∞'} max
                       </p>
                     </div>
                     <div className="p-4 bg-[#3B82F6]/10 rounded-2xl group-hover:bg-[#3B82F6]/20 transition-colors">
                       <TbTruckDelivery className='text-3xl text-[#3B82F6]' />
                     </div>
                   </div>
                   <div className='absolute bottom-0 left-8 right-8 h-[4px] bg-[#3B82F6] rounded-t-full opacity-40 group-hover:opacity-100 transition-opacity duration-500'></div>
                 </div>
               )}

               {/* Carriers Count Card */}
               <div className='group relative bg-[#11131A] hover:bg-[#181C24] border border-white/5 hover:border-[#3B82F6]/30 rounded-[32px] p-8 transition-all duration-500 hover:-translate-y-2 shadow-xl hover:shadow-[#3B82F6]/10 overflow-hidden'>
                 <h2 className='text-[#8A8FA3] mb-4 text-sm uppercase font-black tracking-widest'>Total Carriers</h2>
                 <div className='flex items-center justify-between'> 
                   <div className='flex flex-col'>
                     <h2 className='font-bold text-[#EDEFF6] text-5xl tracking-tighter'>{carriersData.length}</h2>
                     <p className='text-[#8A8FA3] text-[10px] uppercase font-bold tracking-widest mt-1'>Active carriers</p>
                   </div>
                   <div className="p-4 bg-[#3B82F6]/10 rounded-2xl group-hover:bg-[#3B82F6]/20 transition-colors">
                     <TbTruckDelivery className='text-3xl text-[#3B82F6]' />
                   </div>
                 </div>
                 <div className='absolute bottom-0 left-8 right-8 h-[4px] bg-[#3B82F6] rounded-t-full opacity-40 group-hover:opacity-100 transition-opacity duration-500'></div>
               </div>

               {/* Customers Count Card */}
               <div className='group relative bg-[#11131A] hover:bg-[#181C24] border border-white/5 hover:border-[#10B981]/30 rounded-[32px] p-8 transition-all duration-500 hover:-translate-y-2 shadow-xl hover:shadow-[#10B981]/10 overflow-hidden'>
                 <h2 className='text-[#8A8FA3] mb-4 text-sm uppercase font-black tracking-widest'>Total Customers</h2>
                 <div className='flex items-center justify-between'> 
                   <div className='flex flex-col'>
                     <h2 className='font-bold text-[#EDEFF6] text-5xl tracking-tighter'>{customersData.length}</h2>
                     <p className='text-[#8A8FA3] text-[10px] uppercase font-bold tracking-widest mt-1'>Active customers</p>
                   </div>
                   <div className="p-4 bg-[#10B981]/10 rounded-2xl group-hover:bg-[#10B981]/20 transition-colors">
                     <FaRegCreditCard className='text-3xl text-[#10B981]' />
                   </div>
                 </div>
                 <div className='absolute bottom-0 left-8 right-8 h-[4px] bg-[#10B981] rounded-t-full opacity-40 group-hover:opacity-100 transition-opacity duration-500'></div>
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
