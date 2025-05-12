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
import AddNotes from '../accounts/AddNotes';
import { FaLock } from "react-icons/fa";
import { FaLockOpen } from "react-icons/fa6";
import LockOrder from './LockOrder'

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
                        <p className='my-1 whitespace-nowrap'>Status : <Badge title={true} status={c?.order_status} /></p>
                        <p className='my-1 whitespace-nowrap'>Total Distance :  {c?.totalDistance || "00"} Miles</p>
                     </td>
                  
                     <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                        <p>Customer : {c?.customer?.name || "--"}({c?.customer?.customerCode || "--"})</p>
                        <p className='mt-1 whitespace-nowrap'>Customer Payment  : <Badge title={true} status={c?.customer_payment_status} text={`${c?.payment_status === 'paid' ? `via ${c?.payment_method}` :''}`} /></p>
                        <p className='mt-1 whitespace-nowrap'>Order Amount : <Currency amount={c?.total_amount} currency={c?.revenue_currency || 'cad'} /></p>
                        {c?.payment_status_date ? <p className='text-[13px] text-gray-400 mt-1'>Payment at <TimeFormat date={c?.payment_status_date || ""} /></p> : ''}
                     </td>
                  
                     <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                        <p className='mt-1'>Carrier :  {c.carrier?.name || "--"}(MC{c?.carrier?.mc_code || "--"})</p>
                        <p className='mt-1 whitespace-nowrap'>Carrier Payment : <Badge title={true} status={c?.carrier_payment_status} text={`${c?.carrier_payment_status === 'paid' ? `via ${c?.carrier_payment_method}` :''}`} /></p>
                        <p className='mt-1 whitespace-nowrap'>Sell Amount : <Currency amount={c?.carrier_amount} currency={c?.revenue_currency || 'cad'} /></p>
                        {c?.carrier_payment_date ? <p className='text-[13px] text-gray-400 mt-1'>Updated at <TimeFormat date={c?.carrier_payment_date || ""} /></p> : ''}
                     </td>
                     
                     {/* <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
                        <OrderView order={c} fetchLists={fetchLists} />
                     </td> */}

                     <td className='text-sm text-start text-gray-200 capitalize border-b border-gray-900'>
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
                                       </>
                                    : ''}
                                    <li className={`list-none text-sm  ${c.lock ? "disabled" : ""}`}>
                                       <UpdatePaymentStatus pstatus={c.customer_payment_status} pmethod={c.payment_method} pnotes={c.customer_payment_notes} text={<>{c.lock ? <FaLock size={12} className='me-1' /> : ""} Update Customer Payment</>} paymentType={1} id={c.id} type={1} fetchLists={fetchLists} />
                                    </li>
                                    <li className={`list-none text-sm  ${c.lock ? "disabled" : ""}`}>
                                       <UpdateOrderStatus text={<>{c.lock ? <FaLock size={12} className='me-1' /> : ""} Update Order Status </>} id={c.id} fetchLists={fetchLists} />
                                    </li>
                                    <li className='list-none text-sm'>
                                       <Link className='p-3 hover:bg-gray-100 w-full text-start rounded-xl text-gray-700 block' to={`/order/customer/invoice/${c._id}`}>Download Customer Invoice</Link>
                                    </li>
                                    <li className='list-none text-sm' >
                                       <OrderView btnclasses={`p-3 hover:bg-gray-100 w-full text-start rounded-xl text-gray-700 block`} order={c} fetchLists={fetchLists} />
                                    </li>
                                 </> 
                              : '' }
                              <li className={`list-none text-sm  ${c.lock ? "disabled" : ""}`}>
                                 <AddNotes  text={<>{c.lock ? <FaLock size={12} className='me-1' /> : ''} Add Note </>} note={c.notes} id={c.id} type={2} fetchLists={fetchLists} />
                              </li>
                              <li className='list-none text-sm'>
                                 <Link className='p-3 hover:bg-gray-100 w-full text-start rounded-xl text-gray-700 block' to={`/order/detail/${c._id}`}>Download Carrier Sheet</Link>
                              </li>
                           </Dropdown>
                     </td>

                  </tr>
               })}
            </table>

         </div>
      </>
   )
}
