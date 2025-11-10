import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { 
  LuPackage, 
  LuTruck, 
  LuUser, 
  LuDollarSign,
  LuMapPin
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

export default function OrderTimelineCard({ order, user, fetchLists, activeQuickViewId, setActiveQuickViewId }) {
  const { company } = useContext(UserContext);
  
  // Get tenant-specific order number
  const orderNumber = getOrderNumber(order, user, company, null);

  return (
    <div className={`order-card-container bg-gray-900 border border-gray-800 rounded-[30px] p-4 md:p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:ring-1 hover:ring-gray-700 focus-within:ring-1 focus-within:ring-gray-700 ${activeQuickViewId ? 'sidebar-active' : ''}`}>
      {/* Header Section */}
      <div className="mb-4">
        {/* Order Number and Lock Status */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-800 text-gray-300 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
              <LuPackage size={20} />
            </div>
            <div>
              <Link 
                to={`/view/order/${order._id}`}
                className="text-lg font-semibold text-gray-100 hover:text-blue-400 transition-colors flex items-center gap-2"
              >
                {order.lock ? <FaLock className="text-red-600" size={14} /> : <FaLockOpen className="text-gray-400" size={14} />}
                {orderNumber}
              </Link>
              <p className="text-sm text-gray-400">
                <TimeFormat date={order.createdAt || "--"} />
              </p>
            </div>
          </div>
          
          {/* Status and Creator */}
          <div className="text-right">
            <Badge title={true} status={order.order_status} />
            {order.created_by?.name && (
              <p className="text-xs text-gray-500 mt-1">
                Created by: <Link to={`/employee/detail/${order.created_by._id}`} className="text-blue-400 hover:text-blue-300">{order.created_by.name}</Link>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - Customer & Carrier Info */}
      <div className="space-y-4 mb-4">
        {/* Order Summary Row */}
        <div className="grid md:grid-cols-3 gap-4">
          {/* Distance */}
          <div className="bg-gray-800/30 rounded-xl p-3 border border-gray-800">
            <div className="flex items-center gap-2 mb-1">
              <LuMapPin size={14} className="text-gray-400" />
              <span className="text-xs text-gray-400 uppercase tracking-wide">Distance</span>
            </div>
            <div className="text-sm font-bold text-gray-200">
              <DistanceInMiles d={order?.totalDistance} />
            </div>
          </div>

          {/* Customer Amount */}
          <div className="bg-gray-800/30 rounded-xl p-3 border border-gray-800">
            <div className="flex items-center gap-2 mb-1">
              <LuDollarSign size={14} className="text-green-600" />
              <span className="text-xs text-gray-400 uppercase tracking-wide">Revenue</span>
            </div>
            <div className="text-sm font-bold text-green-600">
              <Currency amount={order?.total_amount} currency={order?.revenue_currency || 'cad'} />
            </div>
          </div>

          {/* Carrier Cost */}
          <div className="bg-gray-800/30 rounded-xl p-3 border border-gray-800">
            <div className="flex items-center gap-2 mb-1">
              <LuTruck size={14} className="text-orange-600" />
              <span className="text-xs text-gray-400 uppercase tracking-wide">Cost</span>
            </div>
            <div className="text-sm font-bold text-orange-600">
              <Currency amount={order?.carrier_amount} currency={order?.revenue_currency || 'cad'} />
            </div>
          </div>
        </div>

        {/* Customer & Carrier Info */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Customer */}
          <div className="bg-gray-800/30 rounded-xl p-3 border border-gray-800">
            <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2 mb-2">
              <LuUser size={16} />
              Customer
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Name</span>
                <Link 
                  to={`/customer/detail/${order.customer?._id}`}
                  className="text-sm text-blue-400 hover:text-blue-300 font-medium"
                >
                  {order.customer?.name || "--"} ({order.customer?.customerCode || "--"})
                </Link>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Payment</span>
                <div>
                  {(user?.is_admin || user?.role === 2) ? (
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
                  ) : (
                    <Badge 
                      tooltipcontent={order?.customer_payment_date && !order?.customer_payment_approved_by_admin ? `Customer payment status currently in pending and not approve by admin yet.` :''}
                      approved={order?.customer_payment_approved_by_admin}
                      date={order?.customer_payment_date || ""} 
                      title={true} 
                      status={order?.customer_payment_status} 
                      text={order?.customer_payment_status === 'paid' ? ` (${order?.customer_payment_method})` :''}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Carrier */}
          <div className="bg-gray-800/30 rounded-xl p-3 border border-gray-800">
            <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2 mb-2">
              <LuTruck size={16} />
              Carrier
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Name</span>
                <Link 
                  to={`/carrier/detail/${order.carrier?._id}`}
                  className="text-sm text-blue-400 hover:text-blue-300 font-medium"
                >
                  {order.carrier?.name || "--"} (MC{order.carrier?.mc_code || "--"})
                </Link>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Payment</span>
                <div>
                  {(user?.is_admin || user?.role === 2) ? (
                    <UpdatePaymentStatus 
                      order={order}
                      classes={`!p-0 !cursor-pointer ${order?.lock ? 'disabled-order' : ''}`}
                      pstatus={order.carrier_payment_status}
                      pmethod={order.carrier_payment_method}
                      pnotes={order.carrier_payment_notes}
                      text={<Badge 
                        classes='cursor-pointer'
                        tooltipcontent={order?.carrier_payment_date && !order?.carrier_payment_approved_by_admin ? `Carrier payment status currently in pending and not approve by admin yet.` :''}
                        approved={order?.carrier_payment_approved_by_admin} date={order?.carrier_payment_date || ""} 
                        title={true}  status={order?.carrier_payment_status} 
                        text={order?.carrier_payment_status === 'paid' ? ` (${order?.carrier_payment_method})` :''}
                      />}
                      paymentType={2} 
                      id={order.id} 
                      type={2}
                      fetchLists={fetchLists}
                    />
                  ) : (
                    <Badge 
                     classes='cursor-pointer'
                      tooltipcontent={order?.carrier_payment_date && !order?.carrier_payment_approved_by_admin ? `Carrier payment status currently in pending and not approve by admin yet.` :''}
                      approved={order?.carrier_payment_approved_by_admin}
                      date={order?.carrier_payment_date || ""} 
                      title={true} 
                      status={order?.carrier_payment_status} 
                      text={order?.carrier_payment_status === 'paid' ? ` (${order?.carrier_payment_method})` :''}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-800">
        {/* Quick View */}
        <OrderView 
          text={
            <div className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors">
              <TbLayoutSidebarLeftCollapse size={16} />
              Quick View
            </div>
          }
          order={order}
          fetchLists={fetchLists}
          isOpen={activeQuickViewId === order._id}
          onToggle={() => setActiveQuickViewId(activeQuickViewId === order._id ? null : order._id)}
        />

        {/* Actions Menu */}
        <div className="flex items-center gap-2">
          <Dropdown>
            {(user?.is_admin === 1 || user?.role === 2) && (
              <>
                <li className={`list-none text-sm ${order.lock ? "disabled" : ""}`}>
                  <UpdatePaymentStatus 
                    pstatus={order.carrier_payment_status}
                    pmethod={order.carrier_payment_method}
                    pnotes={order.carrier_payment_notes}
                    text={<>{order.lock ? <FaLock size={12} className='me-1' /> : ""} Update Carrier Payment</>}
                    paymentType={2}
                    id={order.id}
                    type={2}
                    fetchLists={fetchLists}
                  />
                </li>
                {user?.is_admin === 1 && (
                  <>
                    <li className='list-none text-sm'>
                      <LockOrder order={order} fetchLists={fetchLists} />
                    </li>
                    {order.lock ? (
                      <li className={`list-none text-sm ${order.lock ? "disabled" : ""}`}>
                        <Link 
                          className={`p-3 hover:bg-gray-100 w-full text-start rounded-xl text-gray-700 block ${order.lock ? 'opacity-50 pointer-events-none' : ''}`}
                          to={`/edit/order/${order._id}`}
                        >
                          {order.lock ? <FaLock size={12} className='me-1 inline' /> : ""} Delete Order
                        </Link>
                      </li>
                    ) : (
                      <li className='list-none text-sm'>
                        <RemoveOrder order={order} fetchLists={fetchLists} />
                      </li>
                    )}
                  </>
                )}
                <li className={`list-none text-sm ${order.lock ? "disabled" : ""}`}>
                  <UpdatePaymentStatus 
                    pstatus={order.customer_payment_status}
                    pmethod={order.payment_method}
                    pnotes={order.customer_payment_notes}
                    text={<>{order.lock ? <FaLock size={12} className='me-1' /> : ""} Update Customer Payment</>}
                    paymentType={1}
                    id={order.id}
                    type={1}
                    fetchLists={fetchLists}
                  />
                </li>
                <li className={`list-none text-sm ${order.lock ? "disabled" : ""}`}>
                  <UpdateOrderStatus 
                    text={<>{order.lock ? <FaLock size={12} className='me-1' /> : ""} Update Order Status </>}
                    id={order.id}
                    fetchLists={fetchLists}
                  />
                </li>
                <li className={`list-none text-sm ${order.lock ? "disabled" : ""}`}>
                  <Link 
                    className={`p-3 hover:bg-gray-100 w-full text-start rounded-xl text-gray-700 block ${order.lock ? 'opacity-50 pointer-events-none' : ''}`}
                    to={`/edit/order/${order._id}`}
                  >
                    {order.lock ? <FaLock size={12} className='me-1 inline' /> : ""} Edit Order
                  </Link>
                </li>
              </>
            )}
            <li className='list-none text-sm'>
              <Link 
                className='p-3 hover:bg-gray-100 w-full text-start rounded-xl text-gray-700 block'
                to={`/order/customer/invoice/${order._id}`}
              >
                Download Customer Invoice
              </Link>
            </li>
            <li className='list-none text-sm'>
              <Link 
                className='p-3 hover:bg-gray-100 w-full text-start rounded-xl text-gray-700 block'
                to={`/order/detail/${order._id}`}
              >
                Download Carrier Sheet
              </Link>
            </li>
          </Dropdown>
        </div>
      </div>
    </div>
  );
}