import React, { useContext, useEffect, useRef, useState } from 'react'
import Api from '../../../api/Api';
import AuthLayout from '../../../layout/AuthLayout';
import TimeFormat from '../../common/TimeFormat';
import Badge from '../../common/Badge';
import Currency from '../../common/Currency';
import UpdatePaymentStatus from './UpdatePaymentStatus';
import UpdateOrderStatus from './UpdateOrderStatus';
import Loading from '../../common/Loading';
import Dropdown from '../../common/Dropdown';
import { Link } from 'react-router-dom';
import OrderView from '../order/OrderView';
import { FaLockOpen } from "react-icons/fa6";
import { FaLock } from "react-icons/fa";
import { UserContext } from '../../../context/AuthProvider';
import LockOrder from '../order/LockOrder';
import Nocontent from '../../common/NoContent';
import { TbLayoutSidebarLeftCollapse } from "react-icons/tb";
import { getOrderNumber } from '../../../utils/orderPrefix';

export default function AccountOrders() {

   const [loading, setLoading] = useState(true);
   const [lists, setLists] = useState([]);
   const {Errors, user, company} = useContext(UserContext);

   const fetchLists = (search) => {
      setLoading(true);
      const resp = Api.get(`/account/order/listings?${search ?`search=${search}` : ''}`);
      resp.then((res) => {
         setLoading(false);
         if (res.data.status === true) {
            setLists(res.data.orders);
         } else {
            setLists([]);
         }
         setLoading(false);
      }).catch((err) => {
         setLoading(false);
      });
   }

   useEffect(() => {
      fetchLists();
   }, []);

   const debounceRef = useRef(null);
   const handleInputChange = (e) => {
      const value = e.target.value;
      const wordCount = value && value.length;
      if (wordCount > 1) {
         fetchLists(value);
      }
      if (e.target.value === '') {
         fetchLists();
      }
   };


  return (
      <AuthLayout> 
         <div className='md:flex justify-between items-center'>
            <h2 className='text-white text-2xl'>Account Orders Lists</h2>
            <div className='flex items-center w-full md:w-auto mt-3 lg:mt-0'>
               <input ref={debounceRef} onChange={(e)=>{handleInputChange(e)}} type='search' placeholder='Search by order no' className='text-white min-w-[250px] bg-dark1 border w-full md:w-auto border-gray-600 rounded-xl px-4 py-[10px]  focus:shadow-0 focus:outline-0' />
            </div>
         </div>
         {loading ? <Loading />
         :
         <>
            {lists && lists.length > 0 ? (
               <div className='overflow-x-auto mt-6 border border-gray-900 rounded-[24px] bg-dark4'>
                  <table className='min-w-full text-sm'>
                     <thead className='bg-gray-900/40'>
                        <tr>
                          <th className='px-4 py-3 text-start text-gray-400 uppercase tracking-wide'>Order</th> 
                          <th className='px-4 py-3 text-start text-gray-400 uppercase tracking-wide'>Customer</th>
                          <th className='px-4 py-3 text-start text-gray-400 uppercase tracking-wide'>Carrier Payment</th>
                          <th className='px-4 py-3 text-start text-gray-400 uppercase tracking-wide'>Employee</th>
                          <th className='px-4 py-3 text-start text-gray-400 uppercase tracking-wide'>Amounts</th>
                          <th className='px-4 py-3 text-start text-gray-400 uppercase tracking-wide'>Status</th>
                          <th className='px-4 py-3 text-start text-gray-400 uppercase tracking-wide'>Actions</th>
                        </tr>
                     </thead>
                     <tbody>
                       {lists.map((c, index) => (
                         <tr key={`account-order-${index}`} className='border-t border-gray-900 hover:bg-gray-800/40'>
                           {/* Order */}
                           <td className='px-4 py-3 align-top'>
                             <Link to={`/view/order/${c._id}`} className='text-main uppercase text-[14px] inline-flex items-center gap-2'>
                               {c.lock ? <FaLock color='red' /> : <FaLockOpen />}
                               {getOrderNumber(c, user, company, null)}
                             </Link>
                             <div className='text-[12px] text-gray-500 mt-1'>
                               <TimeFormat date={c.createdAt || "--"} />
                             </div>
                           </td>
                           
                           {/* Customer */}
                           <td className='px-4 py-3 align-top text-gray-200'>
                             <Link className='text-main capitalize' to={`/customer/detail/${c?.customer?._id}`}>
                               {c?.customer?.name || '--'} ({c?.customer?.customerCode || '--'})
                             </Link>
                             <div className='mt-2'>
                               <UpdatePaymentStatus
                                 order={c}
                                 classes={`!p-0 ${c?.lock ? 'disabled-order' : ''}`}
                                 pstatus={c.customer_payment_status}
                                 pmethod={c.payment_method}
                                 pnotes={c.customer_payment_notes}
                                 text={<Badge
                                   tooltipcontent={c?.customer_payment_date && !c?.customer_payment_approved_by_admin ? `Customer payment status currently in pending and not approve by admin yet.` : ''}
                                   approved={c?.customer_payment_approved_by_admin}
                                   date={c?.customer_payment_date || ''}
                                   title={false}
                                   status={c?.customer_payment_status}
                                   text={`${c?.customer_payment_status === 'paid' ? `(${c?.customer_payment_method})` : ''}`}
                                 />}
                                 paymentType={1}
                                 id={c.id}
                                 type={1}
                                 fetchLists={fetchLists}
                               />
                             </div>
                           </td>
                           {/* Carrier Payment */}
                           <td className='px-4 py-3 align-top text-gray-200'>
                             <Link className='text-main' to={`/carrier/detail/${c?.carrier?._id}`}>
                               {c.carrier?.name || '--'} (MC{c?.carrier?.mc_code || '--'})
                             </Link>
                             <div className='mt-2'>
                               <UpdatePaymentStatus
                                 order={c}
                                 classes={`!p-0 ${c?.lock ? 'disabled-order' : ''}`}
                                 pstatus={c.carrier_payment_status}
                                 pmethod={c.carrier_payment_method}
                                 pnotes={c.carrier_payment_notes}
                                 text={<Badge
                                   approved={c?.carrier_payment_approved_by_admin}
                                   tooltipcontent={c?.carrier_payment_date && !c?.carrier_payment_approved_by_admin ? `Carrrier payment status currently in pending and not approve by admin yet.` : ''}
                                   date={c?.carrier_payment_date || ''}
                                   title={false}
                                   status={c?.carrier_payment_status}
                                   text={`${c?.carrier_payment_status === 'paid' ? `(${c?.carrier_payment_method})` : ''}`}
                                 />}
                                 paymentType={2}
                                 id={c.id}
                                 type={2}
                                 fetchLists={fetchLists}
                               />
                             </div>
                           </td>
                           {/* Employee */}
                           <td className='px-4 py-3 align-top text-gray-200'>
                             <div>Staff: {c.created_by?.name}</div>
                             <div className='mt-1'>Commission: <Currency amount={c.commission} currency={c.revenue_currency || 'usd'} /> ({c.created_by?.staff_commision || 0}%)</div>
                           </td>
                           {/* Amounts */}
                           <td className='px-4 py-3 align-top text-gray-200'>
                             <div>Amount: <Currency amount={c.total_amount} currency={c.revenue_currency || 'usd'} /></div>
                             <div className='mt-1'>Sell: <Currency amount={c.carrier_amount} currency={c.revenue_currency || 'usd'} /></div>
                             <div className='mt-1'>Profit: <Currency amount={c.profit} currency={c.revenue_currency || 'usd'} /></div>
                           </td>
                           {/* Status */}
                           <td className='px-4 py-3 align-top text-gray-200'>
                             <Badge classes={'p-0'} status={c.order_status} />
                             <span className='inline-flex items-center mt-2 text-gray-300'>
                               Docs: {c?.documents_count ?? 0}
                             </span>
                           </td>
                           {/* Actions */}
                           <td className='px-4 py-3 align-top text-gray-200'>
                             <div className='flex items-center gap-2'>
                               <Dropdown>
                                 {(user && user.is_admin === 1) || (user && user.role === 2) ? (
                                   <>
                                     <li className={`list-none text-sm ${c.lock ? 'disabled' : ''}`}>
                                       <UpdatePaymentStatus
                                         order={c}
                                         pstatus={c.carrier_payment_status}
                                         pmethod={c.carrier_payment_method}
                                         pnotes={c.carrier_payment_notes}
                                         text={<>{c.lock ? <FaLock size={12} className='me-1' /> : ''} Update Carrier Payment</>}
                                         paymentType={2}
                                         id={c.id}
                                         type={2}
                                         fetchLists={fetchLists}
                                       />
                                     </li>
                                     {user && user.is_admin === 1 ? (
                                       <li className='list-none text-sm'>
                                         <LockOrder order={c} fetchLists={fetchLists} />
                                       </li>
                                     ) : ''}
                                     <li className={`list-none text-sm ${c.lock ? 'disabled' : ''}`}>
                                       <UpdatePaymentStatus
                                         order={c}
                                         pstatus={c.customer_payment_status}
                                         pmethod={c.payment_method}
                                         pnotes={c.customer_payment_notes}
                                         text={<>{c.lock ? <FaLock size={12} className='me-1' /> : ''} Update Customer Payment</>}
                                         paymentType={1}
                                         id={c.id}
                                         type={1}
                                         fetchLists={fetchLists}
                                       />
                                     </li>
                                     <li className={`list-none text-sm ${c.lock ? 'disabled' : ''}`}>
                                       <UpdateOrderStatus text={<>{c.lock ? <FaLock size={12} className='me-1' /> : ''} Update Order Status </>} id={c.id} fetchLists={fetchLists} />
                                     </li>
                                   </>
                                 ) : ''}
                                 <li className='list-none text-sm'>
                                   <Link className='p-3 hover:bg-gray-100 w-full text-start rounded-xl text-gray-700 block' to={`/order/customer/invoice/${c._id}`}>Download Customer Invoice</Link>
                                 </li>
                                 <li className='list-none text-sm'>
                                   <Link className='p-3 hover:bg-gray-100 w-full text-start rounded-xl text-gray-700 block' to={`/order/detail/${c._id}`}>Download Carrier Sheet</Link>
                                 </li>
                               </Dropdown>
                               <div className='ms-3'>
                                 <OrderView text={<><TbLayoutSidebarLeftCollapse size={20} /></>} order={c} fetchLists={fetchLists} />
                               </div>
                             </div>
                           </td>
                         </tr>
                       ))}
                     </tbody>
                  </table>
               </div>
            ) : (
               <Nocontent/>
            )}
         </>
         }
      </AuthLayout>
  )
}
