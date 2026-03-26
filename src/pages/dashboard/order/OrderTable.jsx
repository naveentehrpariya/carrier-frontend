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
    <div className='mt-6 space-y-3'>
      <div className='hidden xl:grid grid-cols-12 gap-4 px-5 py-3 text-[11px] uppercase tracking-wider text-gray-500 bg-dark4/70 backdrop-blur border border-gray-900 rounded-2xl sticky top-0 z-10'>
        <div className='col-span-3'>Order</div>
        <div className='col-span-3'>Customer</div>
        <div className='col-span-2'>Carrier</div>
        <div className='col-span-3'>Amounts</div>
        <div className='col-span-1 text-end'>Actions</div>
      </div>

      {lists.map((order, index) => {
        const orderNumber = getOrderNumber(order, user, company, null)
        const canManagePayments = user?.is_admin === 1 || user?.role === 2
        const canEdit = user?.is_admin === 1 || user?.role === 1 || user?.role === 2

        return (
          <div
            key={order._id || index}
            className='bg-dark4 border border-gray-900 rounded-2xl px-5 py-4 grid grid-cols-1 xl:grid-cols-12 gap-4 hover:ring-1 hover:ring-gray-800 transition'
          >
            <div className='xl:col-span-3 min-w-0'>
              <Link to={`/view/order/${order._id}`} className='text-main uppercase text-[13px] inline-flex items-center gap-2 font-semibold'>
                {order.lock ? <FaLock className='text-red-600' size={14} /> : <FaLockOpen className='text-gray-400' size={14} />} 
                <span className='truncate max-w-[180px]'>{orderNumber}</span> <Badge classes={'p-0'} status={order.order_status} />
              </Link>
              <div className='text-[14px] text-gray-500 mt-1 flex gap-2 flex-wrap'>
                <TimeFormat date={order.createdAt || "--"} />
                <div className='space-x-2'>
                  <span className='text-gray-600'>Docs: {order?.documents_count ?? 0}</span>
                  <span className='text-gray-600'>Trips: {order?.trips_count ?? 0}</span>
                  <span className='text-white'>
                    <DistanceInMiles d={order?.totalDistance} />
                  </span>
                </div>
              </div>
            </div>

            <div className='xl:col-span-3 min-w-0'>
              <Link to={`/customer/detail/${order.customer?._id}`} className='text-sm text-blue-400 hover:text-blue-300 font-medium capitalize'>
                {order.customer?.name || "--"} ({order.customer?.customerCode || "--"})
              </Link>
              <div className='mt-2 flex items-center gap-2 flex-wrap'>
                {canManagePayments ? (
                  <UpdatePaymentStatus
                    order={order}
                    classes={`!p-0 !cursor-pointer ${order?.lock ? 'disabled-order' : ''}`}
                    pstatus={order.customer_payment_status}
                    pmethod={order.payment_method}
                    pnotes={order.customer_payment_notes}
                    text={
                      <Badge
                        classes='!text-[10px] !px-2 !py-[2px]'
                        tooltipcontent={order?.customer_payment_date && !order?.customer_payment_approved_by_admin ? `Customer payment status currently in pending and not approve by admin yet.` : ''}
                        approved={order?.customer_payment_approved_by_admin}
                        date={order?.customer_payment_date || ""}
                        status={order?.customer_payment_status}
                        text={order?.customer_payment_status === 'paid' ? ` (${order?.customer_payment_method})` : ''}
                      />
                    }
                    paymentType={1}
                    id={order.id}
                    type={1}
                    fetchLists={fetchLists}
                  />
                ) : (
                  <Badge
                    classes='!text-[10px] !px-2 !py-[2px]'
                    tooltipcontent={order?.customer_payment_date && !order?.customer_payment_approved_by_admin ? `Customer payment status currently in pending and not approve by admin yet.` : ''}
                    approved={order?.customer_payment_approved_by_admin}
                    date={order?.customer_payment_date || ""}
                    status={order?.customer_payment_status}
                    text={order?.customer_payment_status === 'paid' ? ` (${order?.customer_payment_method})` : ''}
                  />
                )}
              </div>
            </div>

            <div className='xl:col-span-2 min-w-0'>
              <Link to={`/carrier/detail/${order.carrier?._id}`} className='text-sm text-blue-400 hover:text-blue-300 font-medium'>
                {order.carrier?.name || "--"} (MC{order.carrier?.mc_code || "--"})
              </Link>
              <div className='mt-2 flex items-center gap-2 flex-wrap'>
                {canManagePayments ? (
                  <UpdatePaymentStatus
                    order={order}
                    classes={`!p-0 !cursor-pointer ${order?.lock ? 'disabled-order' : ''}`}
                    pstatus={order.carrier_payment_status}
                    pmethod={order.carrier_payment_method}
                    pnotes={order.carrier_payment_notes}
                    text={
                      <Badge
                        classes='!text-[10px] !px-2 !py-[2px]'
                        tooltipcontent={order?.carrier_payment_date && !order?.carrier_payment_approved_by_admin ? `Carrier payment status currently in pending and not approve by admin yet.` : ''}
                        approved={order?.carrier_payment_approved_by_admin}
                        date={order?.carrier_payment_date || ""}
                        status={order?.carrier_payment_status}
                        text={order?.carrier_payment_status === 'paid' ? ` (${order?.carrier_payment_method})` : ''}
                      />
                    }
                    paymentType={2}
                    id={order.id}
                    type={2}
                    fetchLists={fetchLists}
                  />
                ) : (
                  <Badge
                    classes='!text-[10px] !px-2 !py-[2px]'
                    tooltipcontent={order?.carrier_payment_date && !order?.carrier_payment_approved_by_admin ? `Carrier payment status currently in pending and not approve by admin yet.` : ''}
                    approved={order?.carrier_payment_approved_by_admin}
                    date={order?.carrier_payment_date || ""}
                    status={order?.carrier_payment_status}
                    text={order?.carrier_payment_status === 'paid' ? ` (${order?.carrier_payment_method})` : ''}
                  />
                )}
              </div>
            </div>

            <div className='xl:col-span-3'>
              <div className='space-y-2 min-w-0'>
                <div className='flex items-center justify-start gap-3 min-w-0'>
                  <span className='text-[11px] text-gray-500'>Revenue</span>
                  <span className='text-sm font-semibold text-green-600 tabular-nums truncate' title={`${order?.total_amount ?? 0}`}>
                    <Currency amount={order?.total_amount} currency={order?.revenue_currency || 'usd'} />
                  </span>
                </div>
                <div className='flex items-center justify-start gap-3 min-w-0'>
                  <span className='text-[11px] text-gray-500'>Cost</span>
                  <span className='text-sm font-semibold text-orange-600 tabular-nums truncate' title={`${order?.carrier_amount ?? 0}`}>
                    <Currency amount={order?.carrier_amount} currency={order?.revenue_currency || 'usd'} />
                  </span>
                </div>
                <div className='flex items-center justify-start gap-3 min-w-0'>
                  <span className='text-[11px] text-gray-500'>Profit</span>
                  <span className='text-sm font-semibold text-gray-200 tabular-nums truncate' title={`${order?.profit ?? 0}`}>
                    <Currency amount={order?.profit} currency={order?.revenue_currency || 'usd'} />
                  </span>
                </div>
              </div>
            </div>

            

             
            <div className='xl:col-span-1 flex items-center justify-end gap-3'>
              <Dropdown>
                {canManagePayments ? (
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
                    {user?.is_admin === 1 && (
                      <li className='list-none text-sm'>
                        <LockOrder order={order} fetchLists={fetchLists} />
                      </li>
                    )}
                    {user?.is_admin === 1 && (
                      <li className={`list-none text-sm ${order.lock ? 'disabled' : ''}`}>
                        {order.lock ? (
                          <span className='p-3 w-full text-start rounded-xl text-gray-700 block opacity-50 pointer-events-none'>
                            Delete Order
                          </span>
                        ) : (
                          <RemoveOrder order={order} fetchLists={fetchLists} />
                        )}
                      </li>
                    )}
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
                {canEdit && (
                  <>
                    <li className={`list-none text-sm ${order.lock ? "disabled" : ""}`}>
                      <Link
                        className={`p-3 hover:bg-gray-100 w-full text-start rounded-xl text-gray-700 block ${order.lock ? 'opacity-50 pointer-events-none' : ''}`}
                        to={`/edit/order/${order._id}`}
                      >
                        {order.lock ? <FaLock size={12} className='me-1 inline' /> : ""} Edit Order
                      </Link>
                    </li>
                    {order.order_type === 'outsourcing' && (
                      <li className={`list-none text-sm ${order.lock ? "disabled" : ""}`}>
                        <Link
                          className={`p-3 hover:bg-gray-100 w-full text-start rounded-xl text-blue-700 block ${order.lock ? 'opacity-50 pointer-events-none' : ''}`}
                          to={`/order/trip-planning/${order._id}`}
                        >
                          Trip Planning (Split)
                        </Link>
                      </li>
                    )}
                  </>
                )}
                {user?.role !== 1 && (
                  <li className='list-none text-sm'>
                    <Link className='p-3 hover:bg-gray-100 w-full text-start rounded-xl text-gray-700 block' to={`/order/customer/invoice/${order._id}`}>Download Customer Invoice</Link>
                  </li>
                )}
                <li className='list-none text-sm'>
                  <Link className='p-3 hover:bg-gray-100 w-full text-start rounded-xl text-gray-700 block' to={`/order/detail/${order._id}`}>Download Carrier Sheet</Link>
                </li>
              </Dropdown>
              <OrderView text={<><TbLayoutSidebarLeftCollapse size={20} /></>} order={order} fetchLists={fetchLists} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
