import React from 'react';
import { LuBuilding2, LuSearch, LuUsers, LuUserCheck } from "react-icons/lu";

export default function CustomerStats({ totalCustomers, isSearching, searchTerm, customers }) {
  // Calculate statistics
  const assignedCustomers = customers?.filter(c => c.assigned_to).length || 0;
  const unassignedCustomers = totalCustomers - assignedCustomers;

  if (isSearching && totalCustomers === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-6 flex items-center gap-3">
        <LuSearch size={20} className="text-purple-400" />
        <div>
          <p className="text-gray-200 text-sm">
            No customers found for "<span className="text-purple-400 font-medium">{searchTerm}</span>"
          </p>
          <p className="text-gray-500 text-xs">Try adjusting your search terms</p>
        </div>
      </div>
    );
  }

  if (totalCustomers > 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <LuBuilding2 size={20} className="text-white" />
            </div>
            <div>
              <p className="text-gray-200 font-medium">
                {isSearching ? 'Search Results' : 'Customer Overview'}
              </p>
              <p className="text-gray-400 text-sm">
                {totalCustomers} customer{totalCustomers !== 1 ? 's' : ''} 
                {isSearching ? ` matching "${searchTerm}"` : ' in your database'}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-purple-400">{totalCustomers}</div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
        </div>

        {/* Stats Grid */}
        {!isSearching && (
          <div className="grid grid-cols-2 gap-4">
            {/* Assigned Customers */}
            <div className="bg-gray-800/50 rounded-xl p-3 flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                <LuUserCheck size={16} className="text-green-400" />
              </div>
              <div>
                <div className="text-lg font-semibold text-green-400">{assignedCustomers}</div>
                <div className="text-xs text-gray-400">Assigned</div>
              </div>
            </div>

            {/* Unassigned Customers */}
            <div className="bg-gray-800/50 rounded-xl p-3 flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <LuUsers size={16} className="text-orange-400" />
              </div>
              <div>
                <div className="text-lg font-semibold text-orange-400">{unassignedCustomers}</div>
                <div className="text-xs text-gray-400">Unassigned</div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}