import React from 'react';
import { LuPackage, LuTruck, LuBuilding2, LuPlus } from "react-icons/lu";
import { Link } from 'react-router-dom';

export default function EmptyOrderState({ isSearching, searchTerm }) {
  if (isSearching) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
          <LuPackage size={32} className="text-gray-500" />
        </div>
        
        <h3 className="text-xl font-semibold text-gray-200 mb-2">
          No orders found
        </h3>
        
        <p className="text-gray-400 text-center mb-6 max-w-md">
          No orders match your search for "<span className="text-blue-400 font-medium">{searchTerm}</span>". 
          Try adjusting your search terms or filters.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {/* Icon Stack */}
      <div className="relative mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
          <LuPackage size={32} className="text-white" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
          <LuTruck size={16} className="text-white" />
        </div>
        <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
          <LuBuilding2 size={16} className="text-white" />
        </div>
      </div>
      
      <h3 className="text-xl font-semibold text-gray-200 mb-2">
        No orders yet
      </h3>
      
      <p className="text-gray-400 text-center mb-8 max-w-md">
        Start your logistics journey by creating your first order. Connect customers with carriers and track the entire workflow from start to finish.
      </p>
      
      {/* Feature highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 text-sm">
        <div className="flex flex-col items-center gap-2 p-4 bg-gray-900 rounded-xl border border-gray-800">
          <LuBuilding2 size={20} className="text-blue-400" />
          <span className="text-gray-400">Customer</span>
          <span className="text-gray-500 text-center">Connect with customers</span>
        </div>
        <div className="flex flex-col items-center gap-2 p-4 bg-gray-900 rounded-xl border border-gray-800">
          <LuTruck size={20} className="text-orange-400" />
          <span className="text-gray-400">Carrier</span>
          <span className="text-gray-500 text-center">Assign to carriers</span>
        </div>
        <div className="flex flex-col items-center gap-2 p-4 bg-gray-900 rounded-xl border border-gray-800">
          <LuPackage size={20} className="text-green-400" />
          <span className="text-gray-400">Track</span>
          <span className="text-gray-500 text-center">Monitor progress</span>
        </div>
      </div>
      
      {/* CTA Button */}
      <Link 
        to="/order/add"
        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
      >
        <LuPlus size={20} />
        Create First Order
      </Link>
    </div>
  );
}