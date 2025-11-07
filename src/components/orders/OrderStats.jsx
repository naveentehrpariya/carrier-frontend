import React from 'react';
import { LuPackage, LuTruck, LuCheckCircle, LuClock, LuDollarSign, LuTrendingUp } from "react-icons/lu";
import Currency from '../../pages/common/Currency';

export default function OrderStats({ orders, isSearching, searchTerm, orderStatus, paymentStatus }) {
  // Calculate statistics
  const totalOrders = orders.length;
  
  const statusCounts = orders.reduce((acc, order) => {
    acc[order.order_status] = (acc[order.order_status] || 0) + 1;
    return acc;
  }, {});

  const paymentCounts = orders.reduce((acc, order) => {
    const customerPaid = order.customer_payment_status === 'paid';
    const carrierPaid = order.carrier_payment_status === 'paid';
    
    if (customerPaid && carrierPaid) {
      acc.completed = (acc.completed || 0) + 1;
    } else if (!customerPaid && !carrierPaid) {
      acc.pending = (acc.pending || 0) + 1;
    } else {
      acc.partial = (acc.partial || 0) + 1;
    }
    return acc;
  }, {});

  const totalRevenue = orders.reduce((sum, order) => {
    return sum + (parseFloat(order.total_amount) || 0);
  }, 0);

  const totalCarrierCosts = orders.reduce((sum, order) => {
    return sum + (parseFloat(order.carrier_amount) || 0);
  }, 0);

  const profit = totalRevenue - totalCarrierCosts;

  if (totalOrders === 0) {
    return null;
  }

  return (
    <div className="mb-6 space-y-4">
      {/* Main Stats Row */}
      <div className="bg-gray-900 border border-gray-800 rounded-[30px] p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-800 text-gray-300 rounded-full flex items-center justify-center">
              <LuPackage size={20} />
            </div>
            <div>
              <p className="text-gray-200 font-medium">
                {isSearching ? 'Search Results' : 'Order Overview'}
              </p>
              <p className="text-gray-400 text-sm">
                {totalOrders} order{totalOrders !== 1 ? 's' : ''} 
                {isSearching ? ` matching "${searchTerm}"` : ' in total'}
                {orderStatus && ` • Status: ${orderStatus}`}
                {paymentStatus && ` • Payment: ${paymentStatus}`}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-200">{totalOrders}</div>
            <div className="text-xs text-gray-500">
              {isSearching || orderStatus || paymentStatus ? 'Filtered' : 'Total'}
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        {!isSearching && !orderStatus && !paymentStatus && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Order Status Stats */}
            <div className="bg-gray-800/30 rounded-xl p-3 border border-gray-800">
              <div className="flex items-center gap-2 mb-2">
                <LuCheckCircle size={16} className="text-green-600" />
                <span className="text-xs text-gray-400 uppercase tracking-wide">Completed</span>
              </div>
              <div className="text-lg font-bold text-green-600">
                {statusCounts.completed || 0}
              </div>
            </div>

            <div className="bg-gray-800/30 rounded-xl p-3 border border-gray-800">
              <div className="flex items-center gap-2 mb-2">
                <LuTruck size={16} className="text-indigo-600" />
                <span className="text-xs text-gray-400 uppercase tracking-wide">In-Transit</span>
              </div>
              <div className="text-lg font-bold text-indigo-600">
                {statusCounts.intransit || 0}
              </div>
            </div>

            <div className="bg-gray-800/30 rounded-xl p-3 border border-gray-800">
              <div className="flex items-center gap-2 mb-2">
                <LuClock size={16} className="text-blue-600" />
                <span className="text-xs text-gray-400 uppercase tracking-wide">Added</span>
              </div>
              <div className="text-lg font-bold text-blue-600">
                {statusCounts.added || 0}
              </div>
            </div>

            <div className="bg-gray-800/30 rounded-xl p-3 border border-gray-800">
              <div className="flex items-center gap-2 mb-2">
                <LuDollarSign size={16} className="text-green-600" />
                <span className="text-xs text-gray-400 uppercase tracking-wide">Revenue</span>
              </div>
              <div className="text-lg font-bold text-green-600">
                <Currency amount={totalRevenue} currency="cad" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Financial Summary (only show when not filtering) */}
      {!isSearching && !orderStatus && !paymentStatus && totalOrders > 0 && (
        <div className="grid md:grid-cols-3 gap-4">
          {/* Revenue */}
          <div className="bg-gray-900 border border-gray-800 rounded-[30px] p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                <LuDollarSign size={16} className="text-green-600" />
              </div>
              <div>
                <p className="text-green-600 font-medium">Total Revenue</p>
                <p className="text-xs text-gray-400">Customer payments</p>
              </div>
            </div>
            <div className="text-xl font-bold text-green-600">
              <Currency amount={totalRevenue} currency="cad" />
            </div>
          </div>

          {/* Carrier Costs */}
          <div className="bg-gray-900 border border-gray-800 rounded-[30px] p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                <LuTruck size={16} className="text-orange-600" />
              </div>
              <div>
                <p className="text-orange-600 font-medium">Carrier Costs</p>
                <p className="text-xs text-gray-400">Carrier payments</p>
              </div>
            </div>
            <div className="text-xl font-bold text-orange-600">
              <Currency amount={totalCarrierCosts} currency="cad" />
            </div>
          </div>

          {/* Profit */}
          <div className="bg-gray-900 border border-gray-800 rounded-[30px] p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                <LuTrendingUp size={16} className={profit >= 0 ? 'text-blue-600' : 'text-red-600'} />
              </div>
              <div>
                <p className={`${profit >= 0 ? 'text-blue-600' : 'text-red-600'} font-medium`}>Net Profit</p>
                <p className="text-xs text-gray-400">Revenue - Costs</p>
              </div>
            </div>
            <div className={`text-xl font-bold ${profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              <Currency amount={profit} currency="cad" />
            </div>
          </div>
        </div>
      )}

      {/* Payment Status Breakdown (only when not filtering by payment) */}
      {!isSearching && !paymentStatus && totalOrders > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-[30px] p-4">
          <h4 className="text-gray-300 font-medium mb-3 flex items-center gap-2">
            <LuDollarSign size={16} />
            Payment Status Overview
          </h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{paymentCounts.completed || 0}</div>
              <div className="text-xs text-gray-400">Fully Paid</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-yellow-600">{paymentCounts.partial || 0}</div>
              <div className="text-xs text-gray-400">Partial Paid</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-600">{paymentCounts.pending || 0}</div>
              <div className="text-xs text-gray-400">Unpaid</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}