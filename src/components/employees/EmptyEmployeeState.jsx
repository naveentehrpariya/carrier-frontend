import React from 'react';
import { LuUsers } from "react-icons/lu";
import AddEmployee from '../../pages/dashboard/employees/AddEmployee';
import AddDriver from '../../pages/dashboard/drivers/AddDriver';

export default function EmptyEmployeeState({ fetchLists, mode = 'employee', title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
        <LuUsers size={32} className="text-gray-500" />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-200 mb-2">
        {title || (mode === 'driver' ? 'No drivers found' : 'No employees found')}
      </h3>
      
      <p className="text-gray-400 text-center mb-6 max-w-md">
        {description || (mode === 'driver' 
          ? 'Add your first driver to manage contacts, rate per mile, and driver-specific documents like licenses.'
          : 'Get started by adding your first employee to the system. You can manage their information, documents, and access permissions.'
        )}
      </p>
      
      {mode === 'driver' ? (
        <AddDriver text="Add Driver" classes="btn md text-black font-bold" fetchLists={fetchLists} />
      ) : (
        <AddEmployee fetchLists={fetchLists} />
      )}
    </div>
  );
}
