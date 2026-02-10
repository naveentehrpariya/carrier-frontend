import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import TimeFormat from '../../common/TimeFormat'
import Badge from '../../common/Badge'
import Currency from '../../common/Currency'
import Dropdown from '../../common/Dropdown'
import UpdateOrderStatus from '../accounts/UpdateOrderStatus'
import OrderView from './OrderView'
import UpdatePaymentStatus from '../accounts/UpdatePaymentStatus'
import LockOrder from './LockOrder'
import RemoveOrder from './RemoveOrder'
import { FaLockOpen } from "react-icons/fa6"
import { FaLock } from "react-icons/fa"
import { TbLayoutSidebarLeftCollapse } from "react-icons/tb"
import { UserContext } from '../../../context/AuthProvider'
import { getOrderNumber } from '../../../utils/orderPrefix'
import DistanceInMiles from '../../common/DistanceInMiles'

export default function OrderTable({ lists, fetchLists }) {
  const { user, company } = useContext(UserContext)

  return (
    <div className='overflow-x-auto mt-12  rounded-[24px] bg-dark4'>
      <table className='min-w-full text-sm'>
        <tbody>
          {lists.map((order, index) => (
            <>
            <tr key={`order-row-${order._id || index}-summary`} className='hidden'></tr>
            <tr key={`order-row-${order._id || index}-details`}>
              <td className='px-4 pb-4 pt-0' colSpan={5}>
                <div className='mt-2 rounded-2xl  shadow-sm'>
                  <div className='flex items-center justify-between mb-3'>
                    <div>
                      <Link to={`/view/order/${order._id}`} className='text-main uppercase text-[14px] inline-flex items-center gap-2'>
                        {order.lock ? <FaLock color='red' /> : <FaLockOpen />}
                        {getOrderNumber(order, user, company, null)}
                      </Link>
                      <div className='text-[12px] text-gray-500 mt-1'>
                        <TimeFormat date={order.createdAt || "--"} />
                        <span className='ms-2 text-gray-400'>Docs: {order?.documents_count ?? 0}</span>
                      </div>
                    </div>
                    <div className='flex items-center gap-3'>
                      <Badge classes={'p-0'} status={order.order_status} />
                      <Dropdown>
                        {(user && user.is_admin === 1) || (user && user.role === 2) ? (
                          <>
                            <li className={`list-none text-sm ${order.lock ? 'disabled' : ''}`}>
                               <UpdatePaymentStatus
                                order={order}
                                pstatus={order.carrier_payment_status}
                                pmethod={order.carrier_payment_method}
                                pnotes={order.carrier_payment_notes}
                                text={<>{order.lock ? <FaLock size={12} className='me-1' /> : ''} Update Carrier Payment</>}
                                paymentType={2}
                                id={order.id}
                                type={2}
                                fetchLists={fetchLists}
                              />
                            </li>
                            {user && user.is_admin === 1 ? (
                              <li className='list-none text-sm'>
                                <LockOrder order={order} fetchLists={fetchLists} />
                              </li>
                            ) : ''}
                            <li className={`list-none text-sm ${order.lock ? 'disabled' : ''}`}>
                              <UpdatePaymentStatus
                                order={order}
                                pstatus={order.customer_payment_status}
                                pmethod={order.payment_method}
                                pnotes={order.customer_payment_notes}
                                text={<>{order.lock ? <FaLock size={12} className='me-1' /> : ''} Update Customer Payment</>}
                                paymentType={1}
                                id={order.id}
                                type={1}
                                fetchLists={fetchLists}
                              />
                            </li>
                            <li className={`list-none text-sm ${order.lock ? 'disabled' : ''}`}>
                              <UpdateOrderStatus text={<>{order.lock ? <FaLock size={12} className='me-1' /> : ''} Update Order Status </>} id={order.id} fetchLists={fetchLists} />
                            </li>
                          </>
                        ) : ''}
                        {user?.role !== 1 && (
                          <li className='list-none text-sm'>
                            <Link className='p-3 hover:bg-gray-100 w-full text-start rounded-xl text-gray-700 block' to={`/order/customer/invoice/${order._id}`}>Download Customer Invoice</Link>
                          </li>
                        )}
                        <li className='list-none text-sm'>
                          <Link className='p-3 hover:bg-gray-100 w-full text-start rounded-xl text-gray-700 block' to={`/order/detail/${order._id}`}>Download Carrier Sheet</Link>
                        </li>
                      </Dropdown>
                      <div className=''>
                        <OrderView text={<><TbLayoutSidebarLeftCollapse size={20} /></>} order={order} fetchLists={fetchLists} />
                      </div>
                    </div>
                  </div>
                  <div className='grid md:grid-cols-3 gap-4'>
                    <div className='flex gap-2 items-center bg-gray-800/20 rounded-xl p-3'>
                      <span className='text-sm text-gray-400 uppercase tracking-wide'>Distance</span>
                      <span className='text-sm font-bold text-gray-200'>
                        <DistanceInMiles d={order?.totalDistance} />
                      </span>
                    </div>
                    <div className='flex gap-2 items-center bg-gray-800/20 rounded-xl p-3'>
                      <span className='text-sm text-gray-400 uppercase tracking-wide'>Revenue</span>
                      <span className='text-sm font-bold text-green-600'>
                        <Currency amount={order?.total_amount} currency={order?.revenue_currency || 'usd'} />
                      </span>
                    </div>
                    <div className='flex gap-2 items-center bg-gray-800/20 rounded-xl p-3'>
                      <span className='text-sm text-gray-400 uppercase tracking-wide'>Cost</span>
                      <span className='text-sm font-bold text-orange-600'>
                        <Currency amount={order?.carrier_amount} currency={order?.revenue_currency || 'usd'} />
                      </span>
                    </div>
                  </div>

                  <div className='grid md:grid-cols-2 gap-4 mt-3'>
                    <div className='bg-gray-800/20 rounded-xl p-3'>
                      <h4 className='text-sm font-medium text-gray-300 mb-2'>Customer</h4>
                      <div className='flex items-center justify-between'>
                        <Link 
                          to={`/customer/detail/${order.customer?._id}`}
                          className='text-sm text-blue-400 hover:text-blue-300 font-medium'
                        >
                          {order.customer?.name || "--"} ({order.customer?.customerCode || "--"})
                        </Link>
                        <div>
                          {(user?.is_admin || user?.role === 2) ? (
                            <p>
                              <span className='text-white'>Customer Payment </span> 
                              <UpdatePaymentStatus 
                                order={order}
                                classes={`!p-0 !cursor-pointer ${order?.lock ? 'disabled-order' : ''}`}
                                pstatus={order.customer_payment_status}
                                pmethod={order.payment_method}
                                pnotes={order.customer_payment_notes}
                                text={<Badge 
                                  tooltipcontent={order?.customer_payment_date && !order?.customer_payment_approved_by_admin ? `Customer payment status currently in pending and not approve by admin yet.` :''}
                                  approved={order?.customer_payment_approved_by_admin}
                                  date={order?.customer_payment_date || ""} 
                                  title={true} 
                                  status={order?.customer_payment_status} 
                                  text={order?.customer_payment_status === 'paid' ? ` (${order?.customer_payment_method})` :''} 
                                />}
                                paymentType={1} 
                                id={order.id} 
                                type={1}
                                fetchLists={fetchLists}
                              />
                            </p>
                          ) : (
                            <p>
                              <span className='text-white'>Customer Payment </span> 
                            <Badge 
                              tooltipcontent={order?.customer_payment_date && !order?.customer_payment_approved_by_admin ? `Customer payment status currently in pending and not approve by admin yet.` :''}
                              approved={order?.customer_payment_approved_by_admin}
                              date={order?.customer_payment_date || ""} 
                              title={true} 
                              status={order?.customer_payment_status} 
                              text={order?.customer_payment_status === 'paid' ? ` (${order?.customer_payment_method})` :''}
                            />
                            </p>
                          )}
                        </div>
                      </div>
                      <div className='mt-3 text-sm text-gray-300'>
                        <div>Amount: <Currency amount={order.total_amount} currency={order.revenue_currency || 'usd'} /></div>
                        <div className='mt-1'>Sell: <Currency amount={order.carrier_amount} currency={order.revenue_currency || 'usd'} /></div>
                        <div className='mt-1'>Profit: <Currency amount={order.profit} currency={order.revenue_currency || 'usd'} /></div>
                      </div>
                    </div>

                    <div className='bg-gray-800/20 rounded-xl p-3'>
                      <h4 className='text-sm font-medium text-gray-300 mb-2'>Carrier</h4>
                      <div className='flex items-center justify-between'>
                        <Link 
                          to={`/carrier/detail/${order.carrier?._id}`}
                          className='text-sm text-blue-400 hover:text-blue-300 font-medium'
                        >
                          {order.carrier?.name || "--"} (MC{order.carrier?.mc_code || "--"})
                        </Link>
                        <div>
                          {(user?.is_admin || user?.role === 2) ? (
                            <p>
                              <span className='text-white'>Carrier Payment </span> 
                              <UpdatePaymentStatus 
                              order={order}
                              classes={`!p-0 !cursor-pointer ${order?.lock ? 'disabled-order' : ''}`}
                              pstatus={order.carrier_payment_status}
                              pmethod={order.carrier_payment_method}
                              pnotes={order.carrier_payment_notes}
                              text={<Badge 
                                tooltipcontent={order?.carrier_payment_date && !order?.carrier_payment_approved_by_admin ? `Carrier payment status currently in pending and not approve by admin yet.` :''}
                                approved={order?.carrier_payment_approved_by_admin}
                                date={order?.carrier_payment_date || ""} 
                                title={true} 
                                status={order?.carrier_payment_status} 
                                text={order?.carrier_payment_status === 'paid' ? ` (${order?.carrier_payment_method})` :''}
                              />}
                              paymentType={2} 
                              id={order.id} 
                              type={2}
                              fetchLists={fetchLists}
                            />
                            </p>
                          ) : (
                            <p>
                              <span className='text-white'>Carrier Payment </span> 
                            <Badge 
                              tooltipcontent={order?.carrier_payment_date && !order?.carrier_payment_approved_by_admin ? `Carrier payment status currently in pending and not approve by admin yet.` :''}
                              approved={order?.carrier_payment_approved_by_admin}
                              date={order?.carrier_payment_date || ""} 
                              title={true} 
                              status={order?.carrier_payment_status} 
                              text={order?.carrier_payment_status === 'paid' ? ` (${order?.carrier_payment_method})` :''}
                            />
                            </p>
                          )}
                        </div>
                      </div>
                      <div className='mt-3 text-sm text-gray-300'>
                        <div>Staff: {order.created_by?.name || '--'}</div>
                        {order?.commission ? <div className='mt-1'>Commission: <Currency amount={order.commission} currency={order.revenue_currency || 'usd'} /></div> : ''}
                      </div>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
            <tr key={`order-row-${order._id || index}-spacer`}>
              <td colSpan={5}>
                <div className='py-8'></div>
              </td>
            </tr>
            <tr key={`!border-t`}>
              <td colSpan={5}>
                <div className='py-2 !border-t !border-gray-700'></div>
              </td>
            </tr>
            </>
          ))}
        </tbody>
      </table>
    </div>
  )
}
