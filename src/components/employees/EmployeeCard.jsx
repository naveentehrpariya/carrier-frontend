import React from 'react';
import { Link } from 'react-router-dom';
import { LuEye, LuPhone, LuMail, LuMapPin } from "react-icons/lu";
import Badge from '../../pages/common/Badge';
import Dropdown from '../../pages/common/Dropdown';
import AddEmployee from '../../pages/dashboard/employees/AddEmployee';
import SuspandAccount from '../../pages/dashboard/employees/SuspandAccount';
import ChangePassword from '../../pages/dashboard/employees/ChangePassword';
import TimeFormat from '../../pages/common/TimeFormat';

export default function EmployeeCard({ 
  employee, 
  onOpenDocuments, 
  fetchLists 
}) {
  // Generate initials for avatar placeholder
  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(word => word[0]?.toUpperCase())
      .join('')
      .slice(0, 2) || 'UN';
  };

  // Get role display text and color
  const getRoleInfo = (role) => {
    if (role === '2') {
      return { text: 'Accountant', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' };
    }
    return { text: 'Employee', color: 'text-gray-400 bg-gray-500/10 border-gray-500/20' };
  };

  const roleInfo = getRoleInfo(employee.role);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-[30px] p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:ring-1 hover:ring-gray-700 focus-within:ring-1 focus-within:ring-gray-700">
      {/* Header: Avatar, Name, Status */}
      <div className="mb-4">
          {/* Name and role */}
          <div className="min-w-0">
            <div className='flex items-center mb-2 '>
              <div className="w-12 h-12 bg-gray-800 text-gray-300 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                {getInitials(employee.name)}
              </div>
              <div className='ps-3'>
                <Link 
                  to={`/employee/detail/${employee._id}`}
                  className="text-lg  font-semibold text-gray-100 hover:text-blue-400 transition-colors leading-tight block truncate focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none rounded"
                  aria-label={`View details for ${employee.name}, ${roleInfo.text}, status: ${employee.status}`} >
                  {employee.name}
                </Link>
                  {employee.position && (
                    <p className="text-xs mt-1 text-gray-400" aria-label={`Position: ${employee.position}`}>
                      {employee.position}
                    </p>
                  )}
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 mt-2">
              <span 
                className={`text-xs px-2 py-1 rounded-full border ${roleInfo.color}`}
                aria-label={`Role: ${roleInfo.text}`}
              >
                {roleInfo.text}
              </span>
              <Badge title={true} status={employee.status} />
            </div>
          </div>
      </div>

      {/* Body: Information groups */}
      <div className="space-y-4">
        {/* Branch and Commission Group */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400  tracking-wide">Branch ID : {employee.tenantId} </span>
          </div>
          {employee.staff_commision && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400 uppercase tracking-wide">Commission</span>
              <span className="text-sm text-blue-400 font-medium">{employee.staff_commision}%</span>
            </div>
          )}
        </div>

        {/* Address Group */}
        {(employee.country || employee.address) && (
          <div className="border-t border-gray-800 pt-3">
            <div className="flex items-start gap-2">
              <LuMapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="has-tooltip flex-1 min-w-0">
                <span className="tooltip rounded shadow-xl p-2 bg-gray-100 text-black -mt-8 max-w-[200px]">
                  {employee.country || ""} {employee.address || ''}
                </span>
                <span className="text-sm text-gray-200 truncate block">
                  {employee.country || ""} {employee.address || ''}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Contact Group */}
        {(employee.phone || employee.email) && (
          <div className="border-t border-gray-800 pt-3 space-y-2">
            {employee.phone && (
              <div className="flex items-center gap-2">
                <LuPhone size={16} className="text-gray-400 flex-shrink-0" />
                <a 
                  href={`tel:${employee.phone}`}
                  className="text-sm text-gray-200 hover:text-blue-400 transition-colors"
                >
                  {employee.phone}
                </a>
              </div>
            )}
            {employee.email && (
              <div className="flex items-center gap-2">
                <LuMail size={16} className="text-gray-400 flex-shrink-0" />
                <a 
                  href={`mailto:${employee.email}`}
                  className="text-sm text-gray-200 hover:text-blue-400 transition-colors truncate"
                >
                  {employee.email}
                </a>
              </div>
            )}
          </div>
        )}

        {/* Added date */}
        <div className="text-sm text-gray-500">
          Added on : <TimeFormat date={employee.createdAt || "--"} />
        </div>
      </div>

      {/* Footer: Documents and Actions */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-800">
        {/* Documents button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onOpenDocuments(employee);
          }}
          className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none rounded px-2 py-1"
          aria-label={`View documents for ${employee.name}`}
        >
          <LuEye size={16} aria-hidden="true" />
          Documents
        </button>

        {/* Actions dropdown */}
        <div onClick={(e) => e.stopPropagation()}>
          <Dropdown>
            <li className="list-none text-sm">
              <AddEmployee 
                text="Edit" 
                classes="p-3 hover:bg-gray-100 w-full text-start rounded-xl text-gray-700 block" 
                item={employee} 
                fetchLists={fetchLists} 
              />
            </li>
            <li className="list-none text-sm">
              <SuspandAccount 
                text="Change Account Status" 
                item={employee} 
                fetchLists={fetchLists} 
              />
            </li>
            <li className="list-none text-sm">
              <ChangePassword 
                text="Change Password" 
                item={employee} 
                fetchLists={fetchLists} 
              />
            </li>
          </Dropdown>
        </div>
      </div>
    </div>
  );
}