import React from 'react';
import { LuBuilding2, LuUsers } from "react-icons/lu";
import AddCustomer from '../../pages/dashboard/customer/AddCustomer';

export default function EmptyCustomerState({ fetchLists, user }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
        <LuBuilding2 size={32} className="text-white" />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-200 mb-2">
        No customers found
      </h3>
      
      <p className="text-gray-400 text-center mb-6 max-w-md">
        Start building your customer base by adding your first customer. You can assign them to staff members and track their orders and interactions.
      </p>
      
      {/* Feature highlights */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-8 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <LuUsers size={16} />
          <span>Assign to staff</span>
        </div>
        <div className="flex items-center gap-2">
          <LuBuilding2 size={16} />
          <span>Track interactions</span>
        </div>
      </div>
      
      {user?.role === 3 && (
        <AddCustomer 
          classes="btn md text-black font-bold bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl" 
          fetchLists={fetchLists} 
        />
      )}
    </div>
  );
}