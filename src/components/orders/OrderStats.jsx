import React from 'react';
import { LuPackage, LuTruck, LuCheckCircle, LuClock, LuDollarSign } from "react-icons/lu";

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

  if (totalOrders === 0) {
    return null;
  }

  return (
    <div className="mb-6">
        {!isSearching && !orderStatus && !paymentStatus && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Order Status Stats */}
            <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-800 min-h-[72px]">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <LuCheckCircle size={18} className="text-green-600 shrink-0" />
                  <span className="text-normal text-gray-400 uppercase tracking-wide truncate">Completed</span>
                </div>
                <div className="text-2xl font-bold text-green-600 leading-none tabular-nums">
                  {statusCounts.completed || 0}
                </div>
              </div>
            </div>

            <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-800 min-h-[72px]">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <LuTruck size={18} className="text-indigo-600 shrink-0" />
                  <span className="text-normal text-gray-400 uppercase tracking-wide truncate">In-Transit</span>
                </div>
                <div className="text-2xl font-bold text-indigo-600 leading-none tabular-nums">
                  {statusCounts.intransit || 0}
                </div>
              </div>
            </div>

            <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-800 min-h-[72px]">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <LuClock size={18} className="text-blue-600 shrink-0" />
                  <span className="text-normal text-gray-400 uppercase tracking-wide truncate">Added</span>
                </div>
                <div className="text-2xl font-bold text-blue-600 leading-none tabular-nums">
                  {statusCounts.added || 0}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Status Grid (merged in same card) */}
        {!isSearching && !paymentStatus && totalOrders > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-800/80">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-gray-800 bg-gray-800/25 p-4 min-h-[72px]">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-normal text-gray-400 uppercase tracking-wide">Fully Paid</div>
                  <div className="text-2xl font-bold text-green-600 leading-none tabular-nums">{paymentCounts.completed || 0}</div>
                </div>
              </div>
              <div className="rounded-xl border border-gray-800 bg-gray-800/25 p-4 min-h-[72px]">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-normal text-gray-400 uppercase tracking-wide">Partial Paid</div>
                  <div className="text-2xl font-bold text-yellow-600 leading-none tabular-nums">{paymentCounts.partial || 0}</div>
                </div>
              </div>
              <div className="rounded-xl border border-gray-800 bg-gray-800/25 p-4 min-h-[72px]">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-normal text-gray-400 uppercase tracking-wide">Unpaid</div>
                  <div className="text-2xl font-bold text-red-600 leading-none tabular-nums">{paymentCounts.pending || 0}</div>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
