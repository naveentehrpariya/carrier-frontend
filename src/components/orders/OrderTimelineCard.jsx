import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import {
  LuPackage,
  LuTruck,
  LuUser,
  LuDollarSign,
  LuMapPin,
  LuFileText,
  LuCalendar,
} from "react-icons/lu";
import { TbLayoutSidebarLeftCollapse } from "react-icons/tb";
import { FaLock, FaLockOpen } from "react-icons/fa";
import { HiOutlineArrowTrendingUp } from "react-icons/hi2";
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

export default function OrderTimelineCard({ order, user, fetchLists, activeQuickViewId, setActiveQuickViewId }) {
  const { company } = useContext(UserContext);
  const orderNumber = getOrderNumber(order, user, company, null);

  return (
    <div className={`group relative bg-[#0E1017] border border-white/[0.06] rounded-2xl overflow-hidden transition-all duration-200 hover:border-white/[0.12] hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] ${activeQuickViewId ? 'ring-1 ring-purple-500/30' : ''}`}>

      {/* Top accent bar — color based on lock status */}
      <div className={`h-[3px] w-full ${order.lock ? 'bg-red-500/70' : 'bg-gradient-to-r from-purple-500/60 via-blue-500/40 to-transparent'}`} />

      <div className="p-5">
        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-3 mb-5">
          {/* Left: icon + order info */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center flex-shrink-0">
              <LuPackage size={18} className="text-purple-400" />
            </div>
            <div className="min-w-0">
              <Link
                to={`/view/order/${order._id}`}
                className="flex items-center gap-2 text-base font-bold text-white hover:text-purple-300 transition-colors leading-tight"
              >
                {order.lock
                  ? <FaLock className="text-red-400 flex-shrink-0" size={12} />
                  : <FaLockOpen className="text-gray-600 flex-shrink-0" size={12} />}
                <span className="truncate">{orderNumber}</span>
                <Badge status={order.order_status} />
              </Link>
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1 text-[11px] text-gray-500">
                  <LuCalendar size={11} />
                  <TimeFormat date={order.createdAt || '--'} />
                </span>
                <span className="flex items-center gap-1 text-[11px] text-gray-600">
                  <LuFileText size={11} />
                  {order?.documents_count ?? 0} docs
                </span>
              </div>
            </div>
          </div>

          {/* Right: created by */}
          {order.created_by?.name && (
            <div className="flex-shrink-0 text-right">
              <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-0.5">Created by</p>
              <Link
                to={`/employee/detail/${order.created_by._id}`}
                className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors"
              >
                {order.created_by.name}
              </Link>
            </div>
          )}
        </div>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          {/* Distance */}
          <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <LuMapPin size={12} className="text-gray-500" />
              <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Distance</span>
            </div>
            <p className="text-sm font-bold text-gray-200">
              <DistanceInMiles d={order?.totalDistance} />
            </p>
          </div>

          {/* Revenue */}
          <div className="bg-emerald-500/[0.06] border border-emerald-500/[0.12] rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <LuDollarSign size={12} className="text-emerald-500" />
              <span className="text-[10px] text-emerald-500/80 uppercase tracking-wider font-medium">Revenue</span>
            </div>
            <p className="text-sm font-bold text-emerald-400">
              <Currency amount={order?.input_total_amount > 0 ? order.input_total_amount : order?.total_amount} currency={order?.input_total_amount > 0 ? (order?.input_currency || order?.revenue_currency || 'usd') : (order?.revenue_currency || 'usd')} />
            </p>
          </div>

          {/* Cost */}
          <div className="bg-orange-500/[0.06] border border-orange-500/[0.12] rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <LuTruck size={12} className="text-orange-500" />
              <span className="text-[10px] text-orange-500/80 uppercase tracking-wider font-medium">Cost</span>
            </div>
            <p className="text-sm font-bold text-orange-400">
              <Currency amount={order?.input_carrier_amount > 0 ? order.input_carrier_amount : order?.carrier_amount} currency={order?.input_carrier_amount > 0 ? (order?.input_currency || order?.revenue_currency || 'usd') : (order?.revenue_currency || 'usd')} />
            </p>
          </div>

          {/* Profit */}
          <div className="bg-blue-500/[0.06] border border-blue-500/[0.12] rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <HiOutlineArrowTrendingUp size={13} className="text-blue-400" />
              <span className="text-[10px] text-blue-400/80 uppercase tracking-wider font-medium">Profit</span>
            </div>
            <p className="text-sm font-bold text-blue-300">
              <Currency amount={order?.profit} currency={order?.revenue_currency || 'usd'} />
            </p>
          </div>
        </div>

        {/* ── Customer & Carrier ── */}
        <div className="grid md:grid-cols-2 gap-3 mb-4">
          {/* Customer */}
          <div className="bg-white/[0.025] border border-white/[0.06] rounded-xl p-3.5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <LuUser size={12} className="text-blue-400" />
              </div>
              <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Customer</span>
            </div>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-gray-500 flex-shrink-0">Name</span>
                <Link
                  to={`/customer/detail/${order.customer?._id}`}
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors text-right truncate"
                >
                  {order.customer?.name || '--'}{order.customer?.customerCode ? ` (${order.customer.customerCode})` : ''}
                </Link>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-gray-500 flex-shrink-0">Payment</span>
                <div>
                  {(user?.is_admin || user?.permissions?.includes('accounting')) ? (
                    <UpdatePaymentStatus
                      order={order}
                      classes={`!p-0 !cursor-pointer ${order?.lock ? 'disabled-order' : ''}`}
                      pstatus={order.customer_payment_status}
                      pmethod={order.payment_method}
                      pnotes={order.customer_payment_notes}
                      text={<Badge
                        tooltipcontent={order?.customer_payment_date && !order?.customer_payment_approved_by_admin ? 'Customer payment pending admin approval.' : ''}
                        approved={order?.customer_payment_approved_by_admin}
                        date={order?.customer_payment_date || ''}
                        title={true}
                        status={order?.customer_payment_status}
                        text={order?.customer_payment_status === 'paid' ? ` (${order?.customer_payment_method})` : ''}
                      />}
                      paymentType={1}
                      id={order.id}
                      type={1}
                      fetchLists={fetchLists}
                    />
                  ) : (
                    <Badge
                      tooltipcontent={order?.customer_payment_date && !order?.customer_payment_approved_by_admin ? 'Customer payment pending admin approval.' : ''}
                      approved={order?.customer_payment_approved_by_admin}
                      date={order?.customer_payment_date || ''}
                      title={true}
                      status={order?.customer_payment_status}
                      text={order?.customer_payment_status === 'paid' ? ` (${order?.customer_payment_method})` : ''}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Carrier / Fleet */}
          <div className="bg-white/[0.025] border border-white/[0.06] rounded-xl p-3.5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                <LuTruck size={12} className="text-orange-400" />
              </div>
              <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                {order?.order_type === 'regular' ? 'Fleet' : 'Carrier'}
              </span>
            </div>
            <div className="space-y-2.5">
              {order?.order_type === 'regular' ? (
                <>
                  {order?.isOwnerOperatedTruck && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-gray-500 flex-shrink-0">Type</span>
                      <span className="text-[10px] px-2 py-1 rounded-lg bg-orange-500/15 text-orange-300 border border-orange-500/30">Owner Operated</span>
                    </div>
                  )}
                  {order?.isOwnerOperatedTruck && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-gray-500 flex-shrink-0">Owner</span>
                      <span className="text-xs text-orange-300 truncate">{order?.ownerOperator?.fullName || '—'}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-gray-500 flex-shrink-0">Driver</span>
                    {order?.driver?._id ? (
                      <Link to={`/employee/detail/${order.driver._id}`} className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors text-right capitalize truncate">
                        {order?.driver?.name || 'Unassigned'}
                      </Link>
                    ) : (
                      <span className="text-xs text-gray-400 capitalize">{order?.driver?.name || 'Unassigned'}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-gray-500 flex-shrink-0">Truck</span>
                    {order?.truck?._id ? (
                      <Link to={`/truck/detail/${order.truck._id}`} className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors text-right truncate">
                        {[order?.truck?.make, order?.truck?.model].filter(Boolean).join(' ') || order?.truck?.unitNumber || '—'} {order?.truck?.plateNumber ? `(${order.truck.plateNumber})` : ''}
                      </Link>
                    ) : (
                      <span className="text-xs text-gray-400">{[order?.truck?.make, order?.truck?.model].filter(Boolean).join(' ') || order?.truck?.unitNumber || '—'} {order?.truck?.plateNumber ? `(${order.truck.plateNumber})` : ''}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-gray-500 flex-shrink-0">Trailer</span>
                    {order?.trailer?._id ? (
                      <Link to={`/trailer/detail/${order.trailer._id}`} className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors text-right truncate">
                        {[order?.trailer?.make, order?.trailer?.model].filter(Boolean).join(' ') || order?.trailer?.type || '—'} {order?.trailer?.unitNumber ? `(${order.trailer.unitNumber})` : ''}
                      </Link>
                    ) : (
                      <span className="text-xs text-gray-400">{[order?.trailer?.make, order?.trailer?.model].filter(Boolean).join(' ') || order?.trailer?.type || '—'} {order?.trailer?.unitNumber ? `(${order.trailer.unitNumber})` : ''}</span>
                    )}
                  </div>
                  {order?.isOwnerOperatedTruck && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-gray-500 flex-shrink-0">Assign Mode</span>
                      <span className="text-xs text-gray-300">
                        {order?.driver_assignment_mode === 'owner_driver' ? 'Owner Driver' : 'Company Driver'}
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-gray-500 flex-shrink-0">Name</span>
                    <Link
                      to={`/carrier/detail/${order.carrier?._id}`}
                      className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors text-right truncate"
                    >
                      {order.carrier?.name || '--'}{order.carrier?.mc_code ? ` (MC${order.carrier.mc_code})` : ''}
                    </Link>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-gray-500 flex-shrink-0">Payment</span>
                    <div>
                      {(user?.is_admin || user?.permissions?.includes('accounting')) ? (
                        <UpdatePaymentStatus
                          order={order}
                          classes={`!p-0 !cursor-pointer ${order?.lock ? 'disabled-order' : ''}`}
                          pstatus={order.carrier_payment_status}
                          pmethod={order.carrier_payment_method}
                          pnotes={order.carrier_payment_notes}
                          text={<Badge
                            classes="cursor-pointer"
                            tooltipcontent={order?.carrier_payment_date && !order?.carrier_payment_approved_by_admin ? 'Carrier payment pending admin approval.' : ''}
                            approved={order?.carrier_payment_approved_by_admin}
                            date={order?.carrier_payment_date || ''}
                            title={true}
                            status={order?.carrier_payment_status}
                            text={order?.carrier_payment_status === 'paid' ? ` (${order?.carrier_payment_method})` : ''}
                          />}
                          paymentType={2}
                          id={order.id}
                          type={2}
                          fetchLists={fetchLists}
                        />
                      ) : (
                        <Badge
                          classes="cursor-pointer"
                          tooltipcontent={order?.carrier_payment_date && !order?.carrier_payment_approved_by_admin ? 'Carrier payment pending admin approval.' : ''}
                          approved={order?.carrier_payment_approved_by_admin}
                          date={order?.carrier_payment_date || ''}
                          title={true}
                          status={order?.carrier_payment_status}
                          text={order?.carrier_payment_status === 'paid' ? ` (${order?.carrier_payment_method})` : ''}
                        />
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between pt-3.5 border-t border-white/[0.05]">
          <OrderView
            text={
              <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-purple-300 transition-colors group/qv">
                <TbLayoutSidebarLeftCollapse size={15} className="group-hover/qv:text-purple-400 transition-colors" />
                Quick View
              </div>
            }
            order={order}
            fetchLists={fetchLists}
            isOpen={activeQuickViewId === order._id}
            onToggle={() => setActiveQuickViewId(activeQuickViewId === order._id ? null : order._id)}
          />

          <div className="flex items-center gap-2">
            <Link
              to={`/view/order/${order._id}`}
              className="text-[11px] font-medium text-gray-500 hover:text-gray-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/[0.04] border border-transparent hover:border-white/[0.06]"
            >
              View Details →
            </Link>
            <Dropdown>
              {(user?.is_admin === 1 || user?.permissions?.includes('regular') || user?.permissions?.includes('outsourcing') || user?.permissions?.includes('subadmin') || user?.permissions?.includes('accounting')) && (
                <li className={`list-none text-sm ${order.lock ? 'disabled' : ''}`}>
                  <Link
                    className={`p-3 hover:bg-gray-100 w-full text-start rounded-xl text-gray-700 block ${order.lock ? 'opacity-50 pointer-events-none' : ''}`}
                    to={`/edit/order/${order._id}`}
                  >
                    {order.lock ? <FaLock size={12} className="me-1 inline" /> : ''} Edit Order
                  </Link>
                </li>
              )}
              {(user?.is_admin === 1 || user?.permissions?.includes('accounting')) && (
                <>
                  {order?.order_type === 'outsourcing' && (
                    <li className={`list-none text-sm ${order.lock ? 'disabled' : ''}`}>
                      <UpdatePaymentStatus
                        pstatus={order.carrier_payment_status}
                        pmethod={order.carrier_payment_method}
                        pnotes={order.carrier_payment_notes}
                        text={<>{order.lock ? <FaLock size={12} className="me-1" /> : ''} Update Carrier Payment</>}
                        paymentType={2}
                        id={order.id}
                        type={2}
                        fetchLists={fetchLists}
                      />
                    </li>
                  )}
                  {(user?.is_admin === 1 || Number(user?.role) === 3 || user?.permissions?.includes('subadmin')) && (
                    <>
                      <li className="list-none text-sm">
                        <LockOrder order={order} fetchLists={fetchLists} />
                      </li>
                      {order.lock ? (
                        <li className={`list-none text-sm ${order.lock ? 'disabled' : ''}`}>
                          <Link
                            className={`p-3 hover:bg-gray-100 w-full text-start rounded-xl text-gray-700 block ${order.lock ? 'opacity-50 pointer-events-none' : ''}`}
                            to={`/edit/order/${order._id}`}
                          >
                            {order.lock ? <FaLock size={12} className="me-1 inline" /> : ''} Delete Order
                          </Link>
                        </li>
                      ) : (
                        <li className="list-none text-sm">
                          <RemoveOrder order={order} fetchLists={fetchLists} />
                        </li>
                      )}
                    </>
                  )}
                  <li className={`list-none text-sm ${order.lock ? 'disabled' : ''}`}>
                    <UpdatePaymentStatus
                      pstatus={order.customer_payment_status}
                      pmethod={order.payment_method}
                      pnotes={order.customer_payment_notes}
                      text={<>{order.lock ? <FaLock size={12} className="me-1" /> : ''} Update Customer Payment</>}
                      paymentType={1}
                      id={order.id}
                      type={1}
                      fetchLists={fetchLists}
                    />
                  </li>
                  <li className={`list-none text-sm ${order.lock ? 'disabled' : ''}`}>
                    <UpdateOrderStatus
                      text={<>{order.lock ? <FaLock size={12} className="me-1" /> : ''} Update Order Status</>}
                      id={order.id}
                      fetchLists={fetchLists}
                    />
                  </li>
                </>
              )}
              {(user?.is_admin === 1 || !(user?.permissions?.includes('regular') || user?.permissions?.includes('outsourcing') || user?.permissions?.includes('subadmin'))) && (
                <li className="list-none text-sm">
                  <Link
                    className="p-3 hover:bg-gray-100 w-full text-start rounded-xl text-gray-700 block"
                    to={`/order/customer/invoice/${order._id}`}
                  >
                    Download Customer Invoice
                  </Link>
                </li>
              )}
              {order?.order_type === 'outsourcing' && (
                <li className="list-none text-sm">
                  <Link
                    className="p-3 hover:bg-gray-100 w-full text-start rounded-xl text-gray-700 block"
                    to={`/order/detail/${order._id}`}
                  >
                    Download Carrier Sheet
                  </Link>
                </li>
              )}
            </Dropdown>
          </div>
        </div>
      </div>
    </div>
  );
}
