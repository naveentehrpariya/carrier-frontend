import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import TimeFormat from '../../common/TimeFormat'
import Badge from '../../common/Badge'
import Currency from '../../common/Currency'
import Dropdown from '../../common/Dropdown'
import { UserContext } from '../../../context/AuthProvider'
import UpdateOrderStatus from '../accounts/UpdateOrderStatus'
import OrderView from './OrderView'
import UpdatePaymentStatus from '../accounts/UpdatePaymentStatus'
import { FaLock } from "react-icons/fa";
import { FaLockOpen } from "react-icons/fa6";
import LockOrder from './LockOrder'
import { TbLayoutSidebarLeftCollapse } from "react-icons/tb";
import DistanceInMiles from '../../common/DistanceInMiles'
import RemoveOrder from './RemoveOrder'

export default function OrderItem({lists, fetchLists}) {
   const {Errors, user} = useContext(UserContext);
   return (
      <>
         <div className='recent-orders overflow-x-auto mt-6 border border-gray-900 rounded-[30px]'>
            <table className='w-full p-2' cellPadding={'20'}>
               <tr>
                  <th className='text-sm text-start text-gray-400 min-w-[190px] xl:min-w-[auto] uppercase whitespace-nowrap border-b border-gray-900'>Sr. No</th>
                  <th className='text-sm text-start text-gray-400  min-w-[190px] xl:min-w-[auto] uppercase border-b border-gray-900'>Order</th>
                  <th className='text-sm text-start text-gray-400 uppercase min-w-[270px] xl:min-w-[auto] border-b border-gray-900'>Customer Details </th>
                  <th className='text-sm text-start text-gray-400 uppercase min-w-[270px] xl:min-w-[auto] border-b border-gray-900'>Carrier Details</th>
                  <th className='text-sm text-start text-gray-400 uppercase border-b border-gray-900'>Docs</th>
               </tr>
               {lists && lists.map((c, index) => {
                  return <tr key={`carriew-${index}`}>
                     <td className='text-sm text-start text-gray-300 uppercase border-b border-gray-900'>
                        <Link to={`/view/order/${c._id}`} className=' text-main  flex uppercase text-[14px] m-auto d-table  rounded-[20px]'  > {c.lock ? <FaLock className='me-1' color='red' /> : <FaLockOpen className='me-1' />} CMC{c.serial_no || "--"}</Link>
                        <p className='text-gray-500'>Created by : {c.created_by?.name || "--"}</p>
                        <p className='text-gray-500 text-[12px]'><TimeFormat date={c.createdAt || "--"} /></p>
                     </td>
                     <td className='text-sm text-start text-gray-400 uppercase border-b border-gray-900'>
                        <p className='my-1 whitespace-nowrap flex items-center'>Status : <Badge title={true} status={c?.order_status} /></p>
                        <p className='my-1 whitespace-nowrap'>Total Distance : <DistanceInMiles d={c?.totalDistance} /></p>
                     </td>
                  
                     <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                        <p>Customer : 
                            <Link className='text-main' to={`/customer/detail/${c?.customer?._id}`}>{c?.customer?.name || "--"}({c?.customer?.customerCode || "--"})</Link>
                            </p>
                        <p className='mt-1 whitespace-nowrap  flex items-center' >Customer Payment  :
                        {user && user?.is_admin || user?.role === 2 ?
                           <UpdatePaymentStatus order={c} classes={`!p-0 mt-1 ${c?.lock ? 'disabled-order' : ''}`}
                              pstatus={c.customer_payment_status} 
                              pmethod={c.payment_method} 
                              pnotes={c.customer_payment_notes} 
                              text={<><Badge 
                                 tooltipcontent={c?.customer_payment_date && !c?.customer_payment_approved_by_admin ? `Customer payment status currently in pending and not approve by admin yet.` :''}
                                  approved={c?.customer_payment_approved_by_admin} 
                              date={c?.customer_payment_date || ""} title={true} status={c?.customer_payment_status} text={`${c?.customer_payment_status === 'paid' ? `  (${c?.customer_payment_method})` :''} `} /></>} 
                              paymentType={1} id={c.id} type={1} 
                              fetchLists={fetchLists} /> 
                           :
                              <Badge tooltipcontent={c?.customer_payment_date && !c?.customer_payment_approved_by_admin ? `Customer payment status currently in pending and not approve by admin yet.` :''} approved={c?.customer_payment_approved_by_admin}
                              date={c?.customer_payment_date || ""} title={true} status={c?.customer_payment_status} 
                              text={`${c?.customer_payment_status === 'paid' ? `(${c?.customer_payment_method})` :''} `} />
                           }
                           </p>
                        <p className='mt-1 whitespace-nowrap'>Order Amount : <Currency amount={c?.total_amount} currency={c?.revenue_currency || 'cad'} /></p>
                     </td>
                  
                     <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                        <p className='mt-1'>Carrier :  
                        <Link className='text-main' to={`/carrier/detail/${c?.carrier?._id}`}>{c.carrier?.name || "--"}(MC{c?.carrier?.mc_code || "--"})</Link>
                           </p>
                        <p className='mt-1 whitespace-nowrap  flex items-center' >Carrier Payment  : 
                           {user && user?.is_admin || user?.role === 2 ?
                           <UpdatePaymentStatus order={c}  classes={`!p-0 mt-1 ${c?.lock ? 'disabled-order' : ''}`}
                           pstatus={c.carrier_payment_status} 
                           pmethod={c.carrier_payment_method} 
                           pnotes={c.carrier_payment_notes} 
                           text={<>
                              <Badge 
                              tooltipcontent={c?.carrier_payment_date && !c?.carrier_payment_approved_by_admin ? `Carrrier payment status currently in pending and not approve by admin yet.` :''}
                              approved={c?.carrier_payment_approved_by_admin} 
                              date={c?.carrier_payment_date || ""} 
                              title={true} status={c?.carrier_payment_status} 
                              text={`${c?.carrier_payment_status === 'paid' ? `(${c?.carrier_payment_method})` :''} `} />
                           </> } 
                           paymentType={2}  id={c.id} type={2} 
                           fetchLists={fetchLists} 
                           />
                           :
                           <Badge 
                              tooltipcontent={c?.carrier_payment_date &&  !c?.carrier_payment_approved_by_admin ? `Carrrier payment status currently in pending and not approve by admin yet.` :''}
                              approved={c?.carrier_payment_approved_by_admin} date={c?.carrier_payment_date || ""} title={true} status={c?.carrier_payment_status} text={`${c?.carrier_payment_status === 'paid' ? ` (${c?.carrier_payment_method})` :''} `} />
                           }
                        </p>
                        <p className='mt-1 whitespace-nowrap'>Sell Amount : <Currency amount={c?.carrier_amount} currency={c?.revenue_currency || 'cad'} /></p>
                     </td>
                     
                     {/* <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                        <OrderView order={c} fetchLists={fetchLists} />
                     </td> */}

                     <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                     <div className='flex items-center'>
                        <Dropdown>
                           {(user && user.is_admin === 1) || (user && user.role === 2) ?
                              <>
                                 <li className={`list-none text-sm  ${c.lock ? "disabled" : ""}`}>
                                    <UpdatePaymentStatus pstatus={c.carrier_payment_status} pmethod={c.carrier_payment_method} pnotes={c.carrier_payment_notes} text={<>{c.lock ? <FaLock size={12} className='me-1' /> : ""} Update Carrier Payment</>} paymentType={2} id={c.id} type={2} fetchLists={fetchLists} />
                                 </li>
                                 {user && user.is_admin === 1 ?
                                    <>
                                       <li className='list-none text-sm'>
                                          <LockOrder order={c} fetchLists={fetchLists} />
                                       </li>
                                       <li className='list-none text-sm'>
                                          <RemoveOrder order={c} fetchLists={fetchLists} />
                                       </li>
                                    </>
                                 : ''}
                                 <li className={`list-none text-sm  ${c.lock ? "disabled" : ""}`}>
                                    <UpdatePaymentStatus pstatus={c.customer_payment_status} pmethod={c.payment_method} pnotes={c.customer_payment_notes} text={<>{c.lock ? <FaLock size={12} className='me-1' /> : ""} Update Customer Payment</>} paymentType={1} id={c.id} type={1} fetchLists={fetchLists} />
                                 </li>
                                 <li className={`list-none text-sm  ${c.lock ? "disabled" : ""}`}>
                                    <UpdateOrderStatus text={<>{c.lock ? <FaLock size={12} className='me-1' /> : ""} Update Order Status </>} id={c.id} fetchLists={fetchLists} />
                                 </li>
                              </> 
                           : '' }
                           <li className='list-none text-sm'>
                              <Link className='p-3 hover:bg-gray-100 w-full text-start rounded-xl text-gray-700 block' to={`/order/customer/invoice/${c._id}`}>Download Customer Invoice</Link>
                           </li>
                           <li className='list-none text-sm'>
                              <Link className='p-3 hover:bg-gray-100 w-full text-start rounded-xl text-gray-700 block' to={`/order/detail/${c._id}`}>Download Carrier Sheet</Link>
                           </li>
                        </Dropdown>
                        <div className='ms-3'>
                           <OrderView text={<><TbLayoutSidebarLeftCollapse size={20} /></>}  order={c} fetchLists={fetchLists} />
                        </div>
                     </div>
                     </td>

                  </tr>
               })}
            </table>

         </div>
      </>
   )
}
