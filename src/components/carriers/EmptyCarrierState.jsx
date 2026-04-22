import React from 'react';
import { LuTruck } from "react-icons/lu";
import AddCarrier from '../../pages/dashboard/carrier/AddCarrier';

export default function EmptyCarrierState({ fetchLists, user }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
        <LuTruck size={32} className="text-white" />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-200 mb-2">
        No carriers found
      </h3>
      
      <p className="text-gray-400 text-center mb-6 max-w-md">
        Start building your carrier network by adding your first carrier. You can manage their contact information, addresses, and track their performance.
      </p>
      
      {user?.is_admin === 1 || user?.permissions?.includes('carriers') || user?.permissions?.includes('subadmin') ? (
        <AddCarrier 
          classes="btn md text-black font-bold bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl" 
          fetchLists={fetchLists} 
        />
      ) : null}
    </div>
  );
}