import React from 'react';

export default function CustomerListItemSkeleton() {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden animate-pulse">
      {/* Main Header Row Skeleton */}
      <div className="p-4 flex items-center justify-between">
        {/* Left: Avatar + Basic Info */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Avatar skeleton */}
          <div className="w-14 h-14 bg-gray-800 rounded-xl flex-shrink-0"></div>
          
          {/* Name and reference skeleton */}
          <div className="min-w-0 flex-1">
            <div className="h-5 bg-gray-800 rounded-lg w-32 mb-2"></div>
            <div className="flex items-center gap-2">
              <div className="h-4 bg-gray-800 rounded-md w-16"></div>
              <div className="h-4 bg-gray-800 rounded w-20"></div>
            </div>
          </div>
        </div>

        {/* Center: Quick Contact Info */}
        <div className="hidden md:flex items-center gap-6 mx-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-800 rounded flex-shrink-0"></div>
            <div className="h-4 bg-gray-800 rounded w-24"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-800 rounded flex-shrink-0"></div>
            <div className="h-4 bg-gray-800 rounded w-20"></div>
          </div>
        </div>

        {/* Right: Actions & Expand Toggle */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="hidden sm:flex items-center gap-2">
            <div className="h-6 bg-gray-800 rounded w-8"></div>
            <div className="h-6 bg-gray-800 rounded w-12"></div>
          </div>
          <div className="w-10 h-10 bg-gray-800 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
}

export function CustomerListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <CustomerListItemSkeleton key={index} />
      ))}
    </div>
  );
}