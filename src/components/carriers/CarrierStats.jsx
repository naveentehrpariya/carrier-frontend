import React from 'react';
import { LuTruck, LuSearch } from "react-icons/lu";

export default function CarrierStats({ totalCarriers, isSearching, searchTerm }) {
  if (isSearching && totalCarriers === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-[20px] p-4 mb-6 flex items-center gap-3">
        <LuSearch size={20} className="text-gray-400" />
        <div>
          <p className="text-gray-200 text-sm">
            No carriers found for "<span className="text-blue-400 font-medium">{searchTerm}</span>"
          </p>
          <p className="text-gray-500 text-xs">Try adjusting your search terms</p>
        </div>
      </div>
    );
  }

  if (totalCarriers > 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-[20px] p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LuTruck size={20} className="text-blue-400" />
          <div>
            <p className="text-gray-200 font-medium">
              {isSearching ? 'Search Results' : 'Total Carriers'}
            </p>
            <p className="text-gray-400 text-sm">
              {totalCarriers} carrier{totalCarriers !== 1 ? 's' : ''} 
              {isSearching ? ` matching "${searchTerm}"` : ' in your network'}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-400">{totalCarriers}</div>
          <div className="text-xs text-gray-500">Active</div>
        </div>
      </div>
    );
  }

  return null;
}