import React from 'react';
import { Link } from 'react-router-dom';
import { LuMail, LuPhone, LuMapPin, LuTruck, LuUser, LuCalendar } from "react-icons/lu";
import TimeFormat from '../../pages/common/TimeFormat';
import AddCarrier from '../../pages/dashboard/carrier/AddCarrier';
import RemoveCarrier from '../../pages/dashboard/carrier/RemoveCarrier';

export default function CarrierCard({ 
  carrier, 
  fetchLists,
  user 
}) {
  // Generate initials for avatar placeholder
  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(word => word[0]?.toUpperCase())
      .join('')
      .slice(0, 2) || 'CA';
  };

  // Format full address
  const getFullAddress = (carrier) => {
    const parts = [
      carrier.location,
      carrier.city,
      carrier.state,
      carrier.country,
      carrier.zipcode
    ].filter(Boolean);
    return parts.join(', ') || '--';
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-[30px] p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:ring-1 hover:ring-gray-700 focus-within:ring-1 focus-within:ring-gray-700">
      {/* Header: Avatar, Name, MC Code */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Avatar placeholder */}
          <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
            <LuTruck size={20} />
          </div>
          
          {/* Name and MC Code */}
          <div className="min-w-0 flex-1">
            <Link 
              to={`/carrier/detail/${carrier._id}`}
              className="text-lg font-semibold text-blue-400 hover:text-blue-300 transition-colors leading-tight block truncate focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none rounded"
              aria-label={`View details for ${carrier.name}`}
            >
              {carrier.name}
            </Link>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs px-2 py-1 rounded-full bg-gray-800 text-gray-300 border border-gray-700">
                MC{carrier.mc_code}
              </span>
            </div>
          </div>
        </div>
        
        {/* Status indicator - you can add carrier status if needed */}
        <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0" title="Active"></div>
      </div>

      {/* Body: Contact and Location Information */}
      <div className="space-y-4">
        {/* Email Group */}
        {(carrier.email || carrier.secondary_email) && (
        <div className="space-y-2">
          <h4 className="text-xs text-gray-400 uppercase tracking-wide font-medium">Email Contacts</h4>
          {carrier.email && (
            <div className="flex items-center gap-2">
              <LuMail size={16} className="text-gray-400 flex-shrink-0" />
              <a 
                href={`mailto:${carrier.email}`}
                className="text-sm text-gray-200 hover:text-blue-400 transition-colors truncate"
              >
                {carrier.email}
              </a>
              <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">Primary</span>
            </div>
          )}
          {carrier.secondary_email && (
            <div className="flex items-center gap-2">
              <LuMail size={16} className="text-gray-400 flex-shrink-0" />
              <a 
                href={`mailto:${carrier.secondary_email}`}
                className="text-sm text-gray-200 hover:text-blue-400 transition-colors truncate"
              >
                {carrier.secondary_email}
              </a>
              <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">Secondary</span>
            </div>
          )}
        </div>
        )}

        {/* Phone Group */}
        {(carrier.phone || carrier.secondary_phone) && (
        <div className="border-t border-gray-800 pt-3 space-y-2">
          <h4 className="text-xs text-gray-400 uppercase tracking-wide font-medium">Phone Contacts</h4>
          {carrier.phone && (
            <div className="flex items-center gap-2">
              <LuPhone size={16} className="text-gray-400 flex-shrink-0" />
              <a 
                href={`tel:${carrier.phone}`}
                className="text-sm text-gray-200 hover:text-blue-400 transition-colors"
              >
                {carrier.phone}
              </a>
              <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">Primary</span>
            </div>
          )}
          {carrier.secondary_phone && (
            <div className="flex items-center gap-2">
              <LuPhone size={16} className="text-gray-400 flex-shrink-0" />
              <a 
                href={`tel:${carrier.secondary_phone}`}
                className="text-sm text-gray-200 hover:text-blue-400 transition-colors"
              >
                {carrier.secondary_phone}
              </a>
              <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">Secondary</span>
            </div>
          )}
        </div>
        )}

        {/* Address Group */}
        <div className="border-t border-gray-800 pt-3">
          <h4 className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2">Location</h4>
          <div className="flex items-start gap-2">
            <LuMapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="has-tooltip flex-1 min-w-0">
              <span className="tooltip rounded shadow-xl p-2 bg-gray-100 text-black -mt-8 max-w-[300px] whitespace-normal">
                {getFullAddress(carrier)}
              </span>
              <span className="text-sm text-gray-200 line-clamp-2">
                {getFullAddress(carrier)}
              </span>
            </div>
          </div>
        </div>

        {/* Created By Group */}
        <div className="border-t border-gray-800 pt-3">
          <h4 className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2">Added By</h4>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LuUser size={16} className="text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-200">{carrier.created_by?.name || '--'}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <LuCalendar size={12} />
              <TimeFormat date={carrier.createdAt || "--"} />
            </div>
          </div>
        </div>
      </div>

      {/* Footer: Actions (only for admins) */}
      {user?.is_admin === 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-800">
          <div className="flex items-center gap-3">
            <AddCarrier 
              classes="text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none rounded px-2 py-1"
              text="Edit" 
              item={carrier} 
              fetchLists={fetchLists} 
            />
            <RemoveCarrier 
              classes="text-red-400 hover:text-red-300 transition-colors text-sm font-medium focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none rounded px-2 py-1" 
              text="Remove" 
              item={carrier} 
              fetchLists={fetchLists} 
            />
          </div>
          
          {/* Optional: Add more actions here */}
          <Link
            to={`/carrier/detail/${carrier._id}`}
            className="text-xs text-gray-400 hover:text-gray-300 transition-colors"
          >
            View Details →
          </Link>
        </div>
      )}
    </div>
  );
}