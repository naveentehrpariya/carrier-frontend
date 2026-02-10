import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LuMail, LuPhone, LuMapPin, LuUser, LuCalendar, LuChevronDown, LuChevronUp, LuBuilding2 } from "react-icons/lu";
import TimeFormat from '../../pages/common/TimeFormat';
import AddCustomer from '../../pages/dashboard/customer/AddCustomer';
import RemoveCustomer from '../../pages/dashboard/customer/RemoveCustomer';

export default function CustomerListItem({ 
  customer, 
  fetchLists,
  user 
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Generate initials for customer avatar
  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(word => word[0]?.toUpperCase())
      .join('')
      .slice(0, 2) || 'CU';
  };

  // Format full address
  const getFullAddress = (customer) => {
    const parts = [
      customer.address,
      customer.city,
      customer.state,
      customer.country,
      customer.zipcode
    ].filter(Boolean);
    return parts.join(', ') || '--';
  };

  // Generate gradient colors based on customer name
  const getGradientColor = (name) => {
    if (!name) return 'from-gray-600 to-gray-700';
    const colors = [
      'from-purple-500 to-purple-600',
      'from-blue-500 to-blue-600', 
      'from-green-500 to-green-600',
      'from-yellow-500 to-yellow-600',
      'from-pink-500 to-pink-600',
      'from-indigo-500 to-indigo-600',
      'from-red-500 to-red-600',
      'from-teal-500 to-teal-600'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-gray-700">
      {/* Main Header Row */}
      <div className="p-4 flex items-center justify-between">
        {/* Left: Avatar + Basic Info */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Customer Avatar */}
          <div className={`w-14 h-14 bg-gradient-to-br ${getGradientColor(customer.name)} rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-md`}>
            {getInitials(customer.name)}
          </div>
          
          {/* Customer Name & Reference */}
          <div className="min-w-0 flex-1">
            <Link 
              to={`/customer/detail/${customer.id}`}
              className="text-lg font-semibold text-white hover:text-purple-400 transition-colors leading-tight block truncate focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none rounded"
              aria-label={`View details for customer ${customer.name}`}
            >
              {customer.name}
            </Link>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs px-2 py-1 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                #{customer.customerCode || 'N/A'}
              </span>
              {customer.assigned_to && (
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <LuUser size={12} />
                  {customer.assigned_to.name}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center: Quick Contact Info */}
        <div className="hidden md:flex items-center gap-6 mx-6">
          {customer.email && (
            <a 
              href={`mailto:${customer.email}`}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-purple-400 transition-colors"
              title="Primary Email"
            >
              <LuMail size={16} />
              <span className="max-w-[120px] truncate">{customer.email}</span>
            </a>
          )}
          {customer.phone && (
            <a 
              href={`tel:${customer.phone}`}
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-purple-400 transition-colors"
              title="Primary Phone"
            >
              <LuPhone size={16} />
              <span>{customer.phone}</span>
            </a>
          )}
        </div>

        {/* Right: Actions & Expand Toggle */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Admin Actions */}
          {user?.is_admin === 1 && (
            <div className="hidden sm:flex items-center gap-2">
              <AddCustomer 
                classes="text-purple-400 hover:text-purple-300 transition-colors text-sm font-medium focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none rounded px-2 py-1"
                text="Edit" 
                item={customer} 
                fetchLists={fetchLists} 
              />
              <RemoveCustomer 
                classes="text-red-400 hover:text-red-300 transition-colors text-sm font-medium focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none rounded px-2 py-1" 
                text="Remove" 
                item={customer} 
                fetchLists={fetchLists} 
              />
            </div>
          )}

          {/* Expand/Collapse Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200 focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:outline-none"
            aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
          >
            {isExpanded ? <LuChevronUp size={20} /> : <LuChevronDown size={20} />}
          </button>
        </div>
      </div>

      {/* Expandable Details Section */}
      {isExpanded && (
        <div className="border-t border-gray-800 bg-gray-900/50">
          <div className="p-4 grid md:grid-cols-2 gap-6">
            {/* Left Column: Contact Details */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <LuMail size={16} />
                Contact Information
              </h4>
              
              {/* Email Addresses */}
              <div className="space-y-2 pl-6">
                {customer.email && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">Primary</span>
                    <a 
                      href={`mailto:${customer.email}`}
                      className="text-sm text-gray-300 hover:text-purple-400 transition-colors"
                    >
                      {customer.email}
                    </a>
                  </div>
                )}
                {customer.secondary_email && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-gray-600/50 text-gray-400 px-2 py-0.5 rounded">Secondary</span>
                    <a 
                      href={`mailto:${customer.secondary_email}`}
                      className="text-sm text-gray-300 hover:text-purple-400 transition-colors"
                    >
                      {customer.secondary_email}
                    </a>
                  </div>
                )}
              </div>

              {/* Phone Numbers */}
              <div className="space-y-2 pl-6">
                {customer.phone && (
                  <div className="flex items-center gap-2">
                    <LuPhone size={14} className="text-gray-500" />
                    <a 
                      href={`tel:${customer.phone}`}
                      className="text-sm text-gray-300 hover:text-purple-400 transition-colors"
                    >
                      {customer.phone}
                    </a>
                    <span className="text-xs text-gray-500">(Primary)</span>
                  </div>
                )}
                {customer.secondary_phone && (
                  <div className="flex items-center gap-2">
                    <LuPhone size={14} className="text-gray-500" />
                    <a 
                      href={`tel:${customer.secondary_phone}`}
                      className="text-sm text-gray-300 hover:text-purple-400 transition-colors"
                    >
                      {customer.secondary_phone}
                    </a>
                    <span className="text-xs text-gray-500">(Secondary)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Address & Assignment Info */}
            <div className="space-y-4">
              {/* Address */}
              <div>
                <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2 mb-3">
                  <LuMapPin size={16} />
                  Address
                </h4>
                <div className="pl-6">
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {getFullAddress(customer)}
                  </p>
                </div>
              </div>

              {/* Assignment Info */}
              <div>
                <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2 mb-3">
                  <LuBuilding2 size={16} />
                  Assignment
                </h4>
                <div className="pl-6 space-y-2">
                  {customer.assigned_to && (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <LuUser size={14} className="text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-300">{customer.assigned_to.name}</p>
                        <p className="text-xs text-gray-500">
                          {customer.assigned_to.position || customer.assigned_to.phone || 'Staff Member'}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <LuCalendar size={12} />
                    Added on <TimeFormat date={customer.createdAt || "--"} time={false} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Actions Row */}
          {user?.is_admin === 1 && (
            <div className="sm:hidden border-t border-gray-800 p-3 flex items-center justify-center gap-4">
              <AddCustomer 
                classes="text-purple-400 hover:text-purple-300 transition-colors text-sm font-medium" 
                text="Edit Customer" 
                item={customer} 
                fetchLists={fetchLists} 
              />
              <RemoveCustomer 
                classes="text-red-400 hover:text-red-300 transition-colors text-sm font-medium" 
                text="Remove Customer" 
                item={customer} 
                fetchLists={fetchLists} 
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
