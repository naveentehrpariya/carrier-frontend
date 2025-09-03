import React, { useContext, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom';
import { UserContext } from '../../../context/AuthProvider';
import Api from '../../../api/Api';
import Loading from '../../common/Loading';
import OrderItem from '../order/OrderItem';
import Nocontent from '../../common/NoContent';
import Currency from '../../common/Currency';
import Badge from '../../common/Badge';
import TimeFormat from '../../common/TimeFormat';

export default function EmployeeOrders({ employeeID, employee }) {

   const [loading, setLoading] = useState(true);
   const [lists, setLists] = useState([]);
   const [stats, setStats] = useState({});
   const { Errors, user } = useContext(UserContext);

   const fetchLists = (value) => {
      setLoading(true);
      
      // Fetch all orders first
      const resp = Api.get(`/order/listings?${value ? `search=${value}` : ''}`);
      resp.then((res) => {
         setLoading(false);
         if (res.data.status === true) {
            let ordersList = res.data.orders || [];
            
            // Filter orders by employee ID (creator)
            if (employeeID && ordersList.length > 0) {
               ordersList = ordersList.filter(order => {
                  // Try different possible field names for the creator
                  return order.created_by?._id === employeeID || 
                         order.created_by === employeeID ||
                         order.createdBy?._id === employeeID ||
                         order.createdBy === employeeID ||
                         order.employee_id === employeeID ||
                         order.user_id === employeeID ||
                         order.addedBy === employeeID ||
                         order.addedBy?._id === employeeID;
               });
            }
            
            setLists(ordersList);
            
            // Calculate stats
            const totalOrders = ordersList.length;
            const completedOrders = ordersList.filter(order => order.status === 'completed').length;
            const pendingOrders = ordersList.filter(order => order.status === 'pending' || order.status === 'active').length;
            const inProgressOrders = ordersList.filter(order => order.status === 'in_progress' || order.status === 'processing').length;
            const totalRevenue = ordersList.reduce((sum, order) => {
               return sum + (parseFloat(order.total_amount) || 0);
            }, 0);

            setStats({
               totalOrders,
               completedOrders,
               pendingOrders: pendingOrders + inProgressOrders,
               totalRevenue,
               currency: ordersList[0]?.revenue_currency || 'cad'
            });
         } else {
            setLists([]);
            setStats({});
         }
      }).catch((err) => {
         setLoading(false);
         console.error('Error fetching orders:', err);
         Errors(err);
         setLists([]);
         setStats({});
      });
   }

   useEffect(() => {
      if (employeeID) {
         fetchLists();
      }
   }, [employeeID]);

   const debounceRef = useRef(null);
   const [searching, setSearching] = useState(false);
   const handleInputChange = (e) => {
      const value = e.target.value;
      const wordCount = value && value.length;
      if (wordCount > 1) {
         setSearching(true);
         fetchLists(value);
      }
      if (e.target.value === '') {
         fetchLists();
      }
   };

   return (
      <>
         {/* Stats Cards */}

 <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl text-white">
               <div className="flex items-center justify-between">
                  <div>
                     <p className="text-sm opacity-90">Total Orders</p>
                     <p className="text-2xl font-bold">{stats.totalOrders || 0}</p>
                  </div>
                  <div className="text-3xl opacity-80">📋</div>
               </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl text-white">
               <div className="flex items-center justify-between">
                  <div>
                     <p className="text-sm opacity-90">Completed</p>
                     <p className="text-2xl font-bold">{stats.completedOrders || 0}</p>
                  </div>
                  <div className="text-3xl opacity-80">✅</div>
               </div>
            </div>
            
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-xl text-white">
               <div className="flex items-center justify-between">
                  <div>
                     <p className="text-sm opacity-90">In Progress</p>
                     <p className="text-2xl font-bold">{stats.pendingOrders || 0}</p>
                  </div>
                  <div className="text-3xl opacity-80">🔄</div>
               </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-xl text-white">
               <div className="flex items-center justify-between">
                  <div>
                     <p className="text-sm opacity-90">Total Revenue</p>
                     <p className="text-2xl font-bold">
                        <Currency amount={stats.totalRevenue || 0} currency={stats.currency || 'cad'} />
                     </p>
                  </div>
                  <div className="text-3xl opacity-80">💰</div>
               </div>
            </div>
         </div>

         {/* Recent Activity Summary */}
         {lists && lists.length > 0 && (
            <div className="mt-12 mb-12 bg-dark border border-gray-700 rounded-xl p-6">
               <h3 className="text-white text-xl mb-4 flex items-center">
                  📊 Order Summary
               </h3>
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                        <div className="flex justify-between">
                           <span className="text-gray-400">Success Rate:</span>
                           <span className="text-blue-400">
                              {stats.totalOrders > 0 ? `${Math.round((stats.completedOrders / stats.totalOrders) * 100)}%` : '0%'}
                           </span>
                        </div>
                        <div className="flex justify-between">
                           <span className="text-gray-400">Avg. Order Value:</span>
                           <span className="text-purple-400">
                              <Currency 
                                 amount={stats.totalOrders > 0 ? stats.totalRevenue / stats.totalOrders : 0} 
                                 currency={stats.currency || 'cad'} 
                              />
                           </span>
                        </div>
                  
                        <div className="flex justify-between">
                           <span className="text-gray-400">Commission:</span>
                           <span className="text-yellow-400">{employee?.staff_commision ? `${employee.staff_commision}%` : 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                           <span className="text-gray-400">Role:</span>
                           <span className="text-blue-400 capitalize">
                              {employee?.role === 2 ? 'Accountant' : employee?.role === 3 ? 'Admin' : 'Employee'}
                           </span>
                        </div>
                  </div>
               </div>
            </div>
         )}

        

         {/* Orders Section */}
         <div className='md:flex justify-between items-center'>
            <h2 className='text-white text-2xl mb-4 md:mb-0'>Orders Created by {employee?.name}</h2>
            <div className='sm:flex items-center justify-between md:justify-end'>
               <input 
                  ref={debounceRef} 
                  onChange={(e) => { handleInputChange(e) }} 
                  type='search' 
                  placeholder='Search orders...' 
                  className='text-white min-w-[250px] w-full md:w-auto bg-dark1 border border-gray-600 rounded-xl px-4 py-[10px] focus:shadow-0 focus:outline-0' 
               />
            </div>
         </div>

         {loading ? <Loading />
            :
            <>
               {lists && lists.length > 0 ? 
                  <OrderItem lists={lists} fetchLists={fetchLists} />
                  : 
                  <div className="text-center py-12">
                     <div className="text-gray-400 text-6xl mb-4">📋</div>
                     <Nocontent text={`No orders found${employeeID ? ` for ${employee?.name}` : ''}`} />
                     <p className="text-gray-500 mt-2">
                        {employee?.name} hasn't created any orders yet.
                     </p>
                  </div>
               }
            </>
         }

         
      </>
   )
}
