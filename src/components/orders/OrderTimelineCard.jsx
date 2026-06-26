import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import {
  LuMapPin,
  LuPackageCheck,
} from "react-icons/lu";
import { TbLayoutSidebarLeftCollapse } from "react-icons/tb";
import { FaLock, FaLockOpen } from "react-icons/fa";
import TimeFormat from '../../pages/common/TimeFormat';
import Badge from '../../pages/common/Badge';
import Currency from '../../pages/common/Currency';
import Dropdown from '../../pages/common/Dropdown';
import UpdateOrderStatus from '../../pages/dashboard/accounts/UpdateOrderStatus';
import OrderView from '../../pages/dashboard/order/OrderView';
import UpdatePaymentStatus from '../../pages/dashboard/accounts/UpdatePaymentStatus';
import LockOrder from '../../pages/dashboard/order/LockOrder';
import RemoveOrder from '../../pages/dashboard/order/RemoveOrder';
import DistanceInMiles from '../../pages/common/DistanceInMiles';
import { UserContext } from '../../context/AuthProvider';
import { getOrderNumber } from '../../utils/orderPrefix';

const ORDER_TYPE_META = {
  outsourcing: { label: 'Outsourcing', badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30', accent: '#818cf8' },
  owner:       { label: 'Owner Operated', badge: 'bg-orange-500/15 text-orange-300 border-orange-500/30', accent: '#fb923c' },
  regular:     { label: 'Regular', badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', accent: '#34d399' },
};

const getOrderTypeMeta = (order) => {
  if (order?.order_type === 'outsourcing') return ORDER_TYPE_META.outsourcing;
  if (order?.isOwnerOperatedTruck) return ORDER_TYPE_META.owner;
  return ORDER_TYPE_META.regular;
};

const getRoutePoints = (order) => {
  const shipments = order?.shipping_details || [];
  let firstPickup = null;
  let lastDelivery = null;
  for (const s of shipments) {
    for (const loc of (s.locations || [])) {
      if (!firstPickup && loc.type === 'pickup') firstPickup = loc.location;
      if (loc.type === 'delivery') lastDelivery = loc.location;
    }
  }
  return { firstPickup, lastDelivery };
};

export default function OrderTimelineCard({ order, user: userProp, fetchLists }) {
  const { user: ctxUser, company } = useContext(UserContext);
  const user = userProp || ctxUser;
  const orderNumber = getOrderNumber(order, user, company, null);

  const typeMeta = getOrderTypeMeta(order);
  const isRegular = order?.order_type === 'regular';
  const { firstPickup, lastDelivery } = getRoutePoints(order);
  const hasRoute = firstPickup || lastDelivery;
  const hasDistance = order?.totalDistance > 0;
  const canManagePayments = user?.is_admin === 1 || user?.permissions?.includes('accounting');
  const canEdit = user?.is_admin === 1 || user?.permissions?.includes('regular') || user?.permissions?.includes('outsourcing') || user?.permissions?.includes('subadmin') || user?.permissions?.includes('accounting');

  return (
    <div
      className='relative bg-dark4 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 hover:ring-1 hover:ring-gray-700/50 transition shadow-[0_8px_24px_rgba(0,0,0,0.22)]'
      style={{ borderLeft: `3px solid ${typeMeta.accent}` }}
    >
      {/* Row 1 — header strip */}
      <div className='flex items-start justify-between gap-3 px-4 md:px-5 py-3 border-b border-gray-800/70 bg-gray-900/25'>
        <div className='flex flex-wrap items-center gap-x-3 gap-y-2 min-w-0'>
          <Link to={`/view/order/${order._id}`} className='text-main uppercase text-[15px] inline-flex items-center gap-2 font-semibold min-w-0'>
            {order.lock ? <FaLock className='text-red-600 shrink-0' size={14} /> : <FaLockOpen className='text-gray-400 shrink-0' size={14} />}
            <span className='truncate'>{orderNumber}</span>
          </Link>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-[3px] rounded-full border text-[10px] font-semibold uppercase tracking-wide ${typeMeta.badge}`}>
            <span className='w-1.5 h-1.5 rounded-full' style={{ background: typeMeta.accent }} />
            {typeMeta.label}
          </span>
          <Badge classes={'p-0'} status={order.order_status} />
          <span className='inline-flex items-center px-2 py-[3px] rounded-full border border-white/10 bg-white/[0.04] text-[10px] font-semibold uppercase tracking-wide text-gray-300' title='Order currency'>
            {String(order?.input_currency || order?.revenue_currency || 'usd').toUpperCase()}
          </span>
          <div className='text-[12px] text-gray-500 flex items-center gap-x-3 gap-y-1 flex-wrap w-full sm:w-auto'>
            <TimeFormat date={order.createdAt || '--'} />
            <span className='text-gray-600'>Docs: {order?.documents_count ?? 0}</span>
            <span className='text-gray-600'>Trips: <span className='text-gray-300 font-medium'>{order?.trips_count ?? 0}</span></span>
            {hasDistance && (
              <span className='text-gray-400 font-medium'><DistanceInMiles d={order?.totalDistance} /></span>
            )}
            {order?.customer_order_no && (
              <span className='text-gray-400'>Cust#: <span className='text-blue-400 font-medium'>{order.customer_order_no}</span></span>
            )}
          </div>
          {hasRoute && (
            <div className='flex items-center gap-1.5 text-[12px] w-full mt-0.5 flex-wrap'>
              {firstPickup && (
                <span className='inline-flex items-center gap-1 text-emerald-400'>
                  <LuMapPin size={11} className='shrink-0' />
                  <span className='truncate max-w-[160px]'>{firstPickup}</span>
                </span>
              )}
              {firstPickup && lastDelivery && <span className='text-gray-600'>→</span>}
              {lastDelivery && (
                <span className='inline-flex items-center gap-1 text-rose-400'>
                  <LuPackageCheck size={11} className='shrink-0' />
                  <span className='truncate max-w-[160px]'>{lastDelivery}</span>
                </span>
              )}
            </div>
          )}
        </div>

        <div className='flex items-center gap-2 shrink-0'>
          <OrderView
            text={
              <span className='inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] hover:bg-purple-500/15 hover:border-purple-500/30 transition-all text-gray-300 hover:text-purple-300 text-[11px] font-medium'>
                <TbLayoutSidebarLeftCollapse size={14} />
                Quick View
              </span>
            }
            order={order}
            fetchLists={fetchLists}
          />
          <Dropdown>
            {canManagePayments && (
              <>
                {order?.order_type === 'outsourcing' && (
                  <li className={`list-none text-sm ${order.lock ? 'disabled' : ''}`}>
                    <UpdatePaymentStatus
                      order={order}
                      pstatus={order.carrier_payment_status}
                      pmethod={order.carrier_payment_method}
                      pnotes={order.carrier_payment_notes}
                      text={<>{order.lock ? <FaLock size={12} className='me-1' /> : ''} Update Carrier Payment</>}
                      paymentType={2} id={order.id} type={2} fetchLists={fetchLists}
                    />
                  </li>
                )}
                {(user?.is_admin === 1 || Number(user?.role) === 3 || user?.permissions?.includes('subadmin')) && (
                  <li className='list-none text-sm'>
                    <LockOrder order={order} fetchLists={fetchLists} />
                  </li>
                )}
                {(user?.is_admin === 1 || Number(user?.role) === 3 || user?.permissions?.includes('subadmin')) && (
                  <li className={`list-none text-sm ${order.lock ? 'disabled' : ''}`}>
                    {order.lock ? (
                      <span className='p-3 w-full text-start rounded-xl text-gray-700 block opacity-50 pointer-events-none'>Delete Order</span>
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
                    paymentType={1} id={order.id} type={1} fetchLists={fetchLists}
                  />
                </li>
                <li className={`list-none text-sm ${order.lock ? 'disabled' : ''}`}>
                  <UpdateOrderStatus
                    text={<>{order.lock ? <FaLock size={12} className='me-1' /> : ''} Update Order Status</>}
                    id={order.id} fetchLists={fetchLists}
                  />
                </li>
              </>
            )}
            {canEdit && (
              <>
                <li className={`list-none text-sm ${order.lock ? 'disabled' : ''}`}>
                  <Link
                    className={`p-3 hover:bg-gray-100 w-full text-start rounded-xl text-gray-700 block ${order.lock ? 'opacity-50 pointer-events-none' : ''}`}
                    to={`/edit/order/${order._id}`}
                  >
                    {order.lock ? <FaLock size={12} className='me-1 inline' /> : ''} Edit Order
                  </Link>
                </li>
                {order.order_type === 'regular' && (
                  <li className={`list-none text-sm ${order.lock ? 'disabled' : ''}`}>
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
            {(user?.is_admin === 1 || Number(user?.role) === 3 || user?.permissions?.includes('invoices') || user?.permissions?.includes('subadmin') || user?.permissions?.includes('accounting')) && (
              <li className='list-none text-sm'>
                <Link className='p-3 hover:bg-gray-100 w-full text-start rounded-xl text-gray-700 block' to={`/order/customer/invoice/${order._id}`}>
                  Download Customer Invoice
                </Link>
              </li>
            )}
            {order?.order_type === 'outsourcing' && (
              <li className='list-none text-sm'>
                <Link className='p-3 hover:bg-gray-100 w-full text-start rounded-xl text-gray-700 block' to={`/order/detail/${order._id}`}>
                  Download Carrier Sheet
                </Link>
              </li>
            )}
          </Dropdown>
        </div>
      </div>

      {/* Row 2 — content columns */}
      <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-x-6 gap-y-5 px-4 md:px-5 py-4'>
        {/* Customer */}
        <div className='min-w-0'>
          <div className='text-[10px] uppercase tracking-[0.14em] text-gray-500 mb-2'>Customer</div>
          <Link to={`/customer/detail/${order.customer?._id}`} className='text-sm text-blue-400 hover:text-blue-300 font-medium capitalize'>
            {order.customer?.name || '--'} ({order.customer?.customerCode || '--'})
          </Link>
          <div className='mt-2 flex items-center gap-1 whitespace-nowrap text-sm'>
            <span className='text-gray-400'>Payment:</span>
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
                    tooltipcontent={order?.customer_payment_date && !order?.customer_payment_approved_by_admin ? 'Customer payment pending admin approval.' : ''}
                    approved={order?.customer_payment_approved_by_admin}
                    date={order?.customer_payment_date || ''}
                    status={order?.customer_payment_status}
                    text={order?.customer_payment_status === 'paid' ? ` (${order?.customer_payment_method})` : ''}
                  />
                }
                paymentType={1} id={order.id} type={1} fetchLists={fetchLists}
              />
            ) : (
              <Badge
                classes='!text-[10px] !px-2 !py-[2px]'
                tooltipcontent={order?.customer_payment_date && !order?.customer_payment_approved_by_admin ? 'Customer payment pending admin approval.' : ''}
                approved={order?.customer_payment_approved_by_admin}
                date={order?.customer_payment_date || ''}
                status={order?.customer_payment_status}
                text={order?.customer_payment_status === 'paid' ? ` (${order?.customer_payment_method})` : ''}
              />
            )}
          </div>
        </div>

        {/* Carrier / Fleet */}
        <div className='min-w-0 text-sm text-gray-200'>
          <div className='text-[10px] uppercase tracking-[0.14em] text-gray-500 mb-2'>Carrier / Fleet</div>
          {isRegular ? (
            <div className='space-y-1'>
              <div className='capitalize line-clamp-1'>
                <span className='text-gray-400'>Driver:</span>{' '}
                {order?.drivers && order.drivers.length > 0 ? (
                  order.drivers.map((d, i) => (
                    <span key={d._id}>
                      <Link className='capitalize text-main' to={`/employee/detail/${d._id}`}>{d.name || 'Unassigned'}</Link>
                      {i < order.drivers.length - 1 ? ', ' : ''}
                    </span>
                  ))
                ) : order?.driver?._id ? (
                  <Link className='capitalize text-main' to={`/employee/detail/${order.driver._id}`}>{order?.driver?.name || 'Unassigned'}</Link>
                ) : (
                  <span>{order?.driver?.name || 'Unassigned'}</span>
                )}
              </div>
              <div className='line-clamp-1 capitalize'>
                <span className='text-gray-400'>Truck:</span>{' '}
                {order?.truck?._id ? (
                  <Link className='capitalize text-main' to={`/truck/detail/${order.truck._id}`}>
                    {[order?.truck?.make, order?.truck?.model].filter(Boolean).join(' ') || order?.truck?.unitNumber || '—'}{order?.truck?.plateNumber ? ` (${order.truck.plateNumber})` : ''}
                  </Link>
                ) : (
                  <span>{[order?.truck?.make, order?.truck?.model].filter(Boolean).join(' ') || order?.truck?.unitNumber || '—'}{order?.truck?.plateNumber ? ` (${order.truck.plateNumber})` : ''}</span>
                )}
              </div>
              <div className='line-clamp-1'>
                <span className='text-gray-400'>Trailer:</span>{' '}
                {order?.trailer?._id ? (
                  <Link className='text-main' to={`/trailer/detail/${order.trailer._id}`}>
                    {[order?.trailer?.make, order?.trailer?.model].filter(Boolean).join(' ') || order?.trailer?.type || '—'}{order?.trailer?.unitNumber ? ` (${order.trailer.unitNumber})` : ''}
                  </Link>
                ) : (
                  <span>{[order?.trailer?.make, order?.trailer?.model].filter(Boolean).join(' ') || order?.trailer?.type || '—'}{order?.trailer?.unitNumber ? ` (${order.trailer.unitNumber})` : ''}</span>
                )}
              </div>
            </div>
          ) : (
            <>
              <Link to={`/carrier/detail/${order.carrier?._id}`} className='text-sm text-blue-400 hover:text-blue-300 font-medium'>
                {order.carrier?.name || '--'} (MC{order.carrier?.mc_code || '--'})
              </Link>
              <div className='mt-2 flex items-center gap-1 whitespace-nowrap'>
                <span className='text-gray-400'>Payment:</span>
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
                        tooltipcontent={order?.carrier_payment_date && !order?.carrier_payment_approved_by_admin ? 'Carrier payment pending admin approval.' : ''}
                        approved={order?.carrier_payment_approved_by_admin}
                        date={order?.carrier_payment_date || ''}
                        status={order?.carrier_payment_status}
                        text={order?.carrier_payment_status === 'paid' ? ` (${order?.carrier_payment_method})` : ''}
                      />
                    }
                    paymentType={2} id={order.id} type={2} fetchLists={fetchLists}
                  />
                ) : (
                  <Badge
                    classes='!text-[10px] !px-2 !py-[2px]'
                    tooltipcontent={order?.carrier_payment_date && !order?.carrier_payment_approved_by_admin ? 'Carrier payment pending admin approval.' : ''}
                    approved={order?.carrier_payment_approved_by_admin}
                    date={order?.carrier_payment_date || ''}
                    status={order?.carrier_payment_status}
                    text={order?.carrier_payment_status === 'paid' ? ` (${order?.carrier_payment_method})` : ''}
                  />
                )}
              </div>
            </>
          )}
        </div>

        {/* Employee */}
        <div className='min-w-0 text-sm text-gray-200'>
          <div className='text-[10px] uppercase tracking-[0.14em] text-gray-500 mb-2'>Employee</div>
          <div className='capitalize'>
            <span className='text-gray-400'>Added By:</span>{' '}
            {order.created_by?._id ? (
              <Link className='text-main' to={`/employee/detail/${order.created_by._id}`}>{order.created_by?.name || '--'}</Link>
            ) : (
              <span>{order.created_by?.name || '--'}</span>
            )}
          </div>
          {order?.order_type === 'outsourcing' && (
            <div className='mt-1'>
              <span className='text-gray-400'>Commission:</span>{' '}
              <Currency amount={order.commission} currency={order.revenue_currency || 'usd'} />
              {' '}<span className='text-gray-500'>({order.created_by?.staff_commision || 0}%)</span>
            </div>
          )}
        </div>

        {/* Amounts */}
        <div className='min-w-0 text-sm xl:max-w-[260px] xl:ms-auto w-full'>
          <div className='text-[10px] uppercase tracking-[0.14em] text-gray-500 mb-2'>Amounts</div>
          <div className='flex items-center justify-between gap-3'>
            <span className='text-gray-400'>Revenue</span>
            <span className='font-semibold text-green-500 tabular-nums truncate'>
              <Currency amount={order?.input_total_amount > 0 ? order.input_total_amount : order?.total_amount} currency={order?.input_total_amount > 0 ? (order?.input_currency || order?.revenue_currency || 'usd') : (order?.revenue_currency || 'usd')} />
            </span>
          </div>
          <div className='flex items-center justify-between gap-3 mt-1.5'>
            <span className='text-gray-400'>Cost</span>
            <span className='font-semibold text-orange-500 tabular-nums truncate'>
              <Currency amount={order?.input_carrier_amount > 0 ? order.input_carrier_amount : order?.carrier_amount} currency={order?.input_carrier_amount > 0 ? (order?.input_currency || order?.revenue_currency || 'usd') : (order?.revenue_currency || 'usd')} />
            </span>
          </div>
          <div className='flex items-center justify-between gap-3 mt-1.5 pt-1.5 border-t border-gray-800/60'>
            <span className='text-gray-400'>Profit</span>
            <span className={`font-semibold tabular-nums truncate ${Number(order?.profit) < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              <Currency amount={order?.profit} currency={order?.revenue_currency || 'usd'} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
