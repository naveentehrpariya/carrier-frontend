import React from 'react';
import { LuUsers } from "react-icons/lu";
import AddEmployee from '../../pages/dashboard/employees/AddEmployee';

export default function EmptyEmployeeState({ fetchLists }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
        <LuUsers size={32} className="text-gray-500" />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-200 mb-2">
        No employees found
      </h3>
      
      <p className="text-gray-400 text-center mb-6 max-w-md">
        Get started by adding your first employee to the system. You can manage their information, documents, and access permissions.
      </p>
      
      <AddEmployee fetchLists={fetchLists} />
    </div>
  );
}