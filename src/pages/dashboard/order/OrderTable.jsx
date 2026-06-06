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
      <div className='hidden xl:grid grid-cols-12 gap-4 px-5 py-[11px] text-[11px] uppercase tracking-[0.08em] text-gray-400 bg-dark4/90 backdrop-blur border border-gray-800 rounded-xl sticky top-0 z-10 shadow-[0_6px_16px_rgba(0,0,0,0.18)]'>
        <div className='col-span-3'>Order</div>
        <div className='col-span-3'>Customer</div>
        <div className='col-span-2'>Carrier / Fleet</div>
        <div className='col-span-3'>Amounts</div>
        <div className='col-span-1 text-end'>Actions</div>
      </div>

      {lists.map((order, index) => {
        const orderNumber = getOrderNumber(order, user, company, null)
        const canManagePayments = user?.is_admin === 1 || user?.permissions?.includes('accounting')
        const canEdit = user?.is_admin === 1 || user?.permissions?.includes('regular') || user?.permissions?.includes('outsourcing') || user?.permissions?.includes('subadmin') || user?.permissions?.includes('accounting')
        const isOutsourcingOrder = order?.order_type === 'outsourcing'
        const isOwnerOperatedOrder = !isOutsourcingOrder && order?.isOwnerOperatedTruck
        const orderTypeLabel = isOutsourcingOrder ? 'Outsourcing' : (isOwnerOperatedOrder ? 'Owner Operated' : 'Regular')
        const orderTypeBadgeClasses = isOutsourcingOrder
          ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
          : (isOwnerOperatedOrder
              ? 'bg-orange-500/15 text-orange-300 border-orange-500/30'
              : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30')

        return (
          <div
            key={order._id || index}
            className='relative bg-dark4 border border-gray-800 rounded-xl px-4 md:px-5 py-4 grid grid-cols-1 xl:grid-cols-12 gap-4 hover:border-gray-700 hover:ring-1 hover:ring-gray-700/60 transition shadow-[0_8px_20px_rgba(0,0,0,0.2)] !mt-8 '
          >
            <span className={`absolute top-[-13px] left-[10px] inline-flex items-center px-2 py-[2px] rounded-full border text-[10px] font-semibold uppercase tracking-wide ${orderTypeBadgeClasses}`}>
                  {orderTypeLabel}
            </span>

             
            <div className='xl:col-span-3 min-w-0'>
              <div className='xl:hidden text-[10px] uppercase tracking-[0.14em] text-gray-500 mb-2'>Order</div>
              <Link to={`/view/order/${order._id}`} className='text-main uppercase text-[13px] inline-flex items-center gap-2 font-semibold min-w-0'>
                {order.lock ? <FaLock className='text-red-600' size={14} /> : <FaLockOpen className='text-gray-400' size={14} />} 
                <span className='truncate max-w-[180px]'>{orderNumber}</span>
                <Badge classes={'p-0'} status={order.order_status} />
                
              </Link>
              <div className='text-[13px] text-gray-500 mt-2 flex gap-2 flex-wrap leading-5'>
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

            <div className='  xl:col-span-3 min-w-0 '>
              <div className='xl:hidden text-[10px] uppercase tracking-[0.14em] text-gray-500 mb-2'>Customer</div>
              <Link to={`/customer/detail/${order.customer?._id}`} className='text-sm text-blue-400 hover:text-blue-300 font-medium capitalize'>
                {order.customer?.name || "--"} ({order.customer?.customerCode || "--"})
              </Link>
              {order?.customer_order_no && order.order_type === 'regular' ? (
                <div className='mt-1 text-sm text-gray-400'>
                  Cust Order: <span className='text-gray-300'>{order.customer_order_no}</span>
                </div>
              ) : null}
              <div className='mt-2 flex items-center gap-2 flex-wrap'>
                {canManagePayments ? (
                  <div className='whitespace-nowrap flex'>
                  <span className='text-white text-sm'>Payment : </span>
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
                  </div>
                ) : (
                  <div className='whitespace-nowrap flex'>
                  <span className='text-white text-sm'>Payment : </span>
                  <Badge
                    classes='!text-[10px] !px-2 !py-[2px]'
                    tooltipcontent={order?.customer_payment_date && !order?.customer_payment_approved_by_admin ? `Customer payment status currently in pending and not approve by admin yet.` : ''}
                    approved={order?.customer_payment_approved_by_admin}
                    date={order?.customer_payment_date || ""}
                    status={order?.customer_payment_status}
                    text={order?.customer_payment_status === 'paid' ? ` (${order?.customer_payment_method})` : ''}
                  />
                  </div>
                )}
              </div>
            </div>

            <div className='xl:col-span-2  min-w-0 '>
              <div className=' xl:hidden text-[10px] uppercase tracking-[0.14em] text-gray-500 mb-2'>Carrier / Fleet</div>
              {order?.order_type === 'regular' ? (
                <div className="text-sm text-gray-200 space-y-1">
                  <div className="capitalize whitespace-nowrap line-clamp-1">
                    Driver:{' '}
                    {order?.drivers && order.drivers.length > 0 ? (
                      order.drivers.map((d, i) => (
                        <span key={d._id}>
                          <Link className="capitalize text-main" to={`/employee/detail/${d._id}`}>{d.name || 'Unassigned'}</Link>
                          {i < order.drivers.length - 1 ? ', ' : ''}
                        </span>
                      ))
                    ) : order?.driver?._id ? (
                      <Link className="capitalize text-main" to={`/employee/detail/${order.driver._id}`}>{order?.driver?.name || 'Unassigned'}</Link>
                    ) : (
                      <span>{order?.driver?.name || 'Unassigned'}</span>
                    )}
                  </div>
                  <div className=" line-clamp-1 capitalize whitespace-nowrap">
                    Truck:{' '}
                    {order?.truck?._id ? (
                      <Link className="capitalize text-main" to={`/truck/detail/${order.truck._id}`}>
                        {[order?.truck?.make, order?.truck?.model].filter(Boolean).join(' ') || order?.truck?.unitNumber || '—'} {order?.truck?.plateNumber ? `(${order.truck.plateNumber})` : ''}
                      </Link>
                    ) : (
                      <span>{[order?.truck?.make, order?.truck?.model].filter(Boolean).join(' ') || order?.truck?.unitNumber || '—'} {order?.truck?.plateNumber ? `(${order.truck.plateNumber})` : ''}</span>
                    )}
                  </div>
                  <div className='whitespace-nowrap line-clamp-1'>
                    Trailer:{' '}
                    {order?.trailer?._id ? (
                      <Link className="text-main " to={`/trailer/detail/${order.trailer._id}`}>
                        {[order?.trailer?.make, order?.trailer?.model].filter(Boolean).join(' ') || order?.trailer?.type || '—'} {order?.trailer?.unitNumber ? `(${order.trailer.unitNumber})` : ''}
                      </Link>
                    ) : (
                      <span>{[order?.trailer?.make, order?.trailer?.model].filter(Boolean).join(' ') || order?.trailer?.type || '—'} {order?.trailer?.unitNumber ? `(${order.trailer.unitNumber})` : ''}</span>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <Link to={`/carrier/detail/${order.carrier?._id}`} className='text-sm text-blue-400 hover:text-blue-300 font-medium'>
                    {order.carrier?.name || "--"} (MC{order.carrier?.mc_code || "--"})
                  </Link>
                  <div className='mt-2 flex items-center whitespace-nowrap items-center capitalize flex'>
                    <span className='text-white text-sm'>Payment : </span> {canManagePayments ? (
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
                </>
              )}
            </div>

            <div className='xl:col-span-3 '>
              <div className='xl:hidden text-[10px] uppercase tracking-[0.14em] text-gray-500 mb-2'>Amounts</div>
              <div className='space-y-2  '>
                <div className='flex items-center justify-between gap-3 min-w-0'>
                  <span className='text-[11px] text-gray-500 uppercase tracking-wide'>Revenue</span>
                  <span className='text-sm font-semibold text-green-500 tabular-nums truncate' title={`${order?.total_amount ?? 0}`}>
                    <Currency amount={order?.total_amount} currency={order?.revenue_currency || 'usd'} />
                  </span>
                </div>
                <div className='flex items-center justify-between gap-3 min-w-0'>
                  <span className='text-[11px] text-gray-500 uppercase tracking-wide'>Cost</span>
                  <span className='text-sm font-semibold text-orange-500 tabular-nums truncate' title={`${order?.carrier_amount ?? 0}`}>
                    <Currency amount={order?.carrier_amount} currency={order?.revenue_currency || 'usd'} />
                  </span>
                </div>
                <div className='flex items-center justify-between gap-3 min-w-0'>
                  <span className='text-[11px] text-gray-500 uppercase tracking-wide'>Profit</span>
                  <span className='text-sm font-semibold text-gray-200 tabular-nums truncate' title={`${order?.profit ?? 0}`}>
                    <Currency amount={order?.profit} currency={order?.revenue_currency || 'usd'} />
                  </span>
                </div>
              </div>
            </div>

            

             
            <div className='xl:col-span-1 flex items-start xl:items-center justify-end gap-3  pt-1'>
              <div className='xl:hidden text-[10px] uppercase tracking-[0.14em] text-gray-500 me-auto'>Actions</div>
              <Dropdown>
                {canManagePayments ? (
                  <>
                    {order?.order_type === 'outsourcing' && (
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
                    )}
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
                    {order.order_type === 'regular' && (
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
                {!user?.permissions?.includes('orders') && (
                  <li className='list-none text-sm'>
                    <Link className='p-3 hover:bg-gray-100 w-full text-start rounded-xl text-gray-700 block' to={`/order/customer/invoice/${order._id}`}>Download Customer Invoice</Link>
                  </li>
                )}
                {order.order_type === 'outsourcing' && (
                  <li className='list-none text-sm'>
                    <Link className='p-3 hover:bg-gray-100 w-full text-start rounded-xl text-gray-700 block' to={`/order/detail/${order._id}`}>Download Carrier Sheet</Link>
                  </li>
                )}
              </Dropdown>
              <OrderView text={<><TbLayoutSidebarLeftCollapse size={20} /></>} order={order} fetchLists={fetchLists} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
