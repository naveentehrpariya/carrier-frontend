import React from 'react';

export default function CarrierCardSkeleton() {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-[30px] p-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          {/* Avatar skeleton */}
          <div className="w-12 h-12 bg-gray-800 rounded-full flex-shrink-0"></div>
          
          {/* Name and code skeleton */}
          <div className="flex-1 min-w-0">
            <div className="h-5 bg-gray-800 rounded-lg w-32 mb-2"></div>
            <div className="h-4 bg-gray-800 rounded-full w-16"></div>
          </div>
        </div>
        
        {/* Status skeleton */}
        <div className="w-3 h-3 bg-gray-800 rounded-full flex-shrink-0"></div>
      </div>

      {/* Body skeleton */}
      <div className="space-y-4">
        {/* Email group skeleton */}
        <div className="space-y-2">
          <div className="h-3 bg-gray-800 rounded w-20"></div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-800 rounded flex-shrink-0"></div>
            <div className="h-4 bg-gray-800 rounded w-40 flex-1"></div>
            <div className="h-4 bg-gray-800 rounded w-12"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-800 rounded flex-shrink-0"></div>
            <div className="h-4 bg-gray-800 rounded w-36 flex-1"></div>
            <div className="h-4 bg-gray-800 rounded w-16"></div>
          </div>
        </div>

        {/* Phone group skeleton */}
        <div className="border-t border-gray-800 pt-3 space-y-2">
          <div className="h-3 bg-gray-800 rounded w-24"></div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-800 rounded flex-shrink-0"></div>
            <div className="h-4 bg-gray-800 rounded w-28"></div>
            <div className="h-4 bg-gray-800 rounded w-12"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-800 rounded flex-shrink-0"></div>
            <div className="h-4 bg-gray-800 rounded w-32"></div>
            <div className="h-4 bg-gray-800 rounded w-16"></div>
          </div>
        </div>

        {/* Address skeleton */}
        <div className="border-t border-gray-800 pt-3">
          <div className="h-3 bg-gray-800 rounded w-16 mb-2"></div>
          <div className="flex items-start gap-2">
            <div className="w-4 h-4 bg-gray-800 rounded mt-0.5 flex-shrink-0"></div>
            <div className="h-4 bg-gray-800 rounded w-full max-w-[200px]"></div>
          </div>
        </div>

        {/* Created by skeleton */}
        <div className="border-t border-gray-800 pt-3">
          <div className="h-3 bg-gray-800 rounded w-16 mb-2"></div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-800 rounded flex-shrink-0"></div>
              <div className="h-4 bg-gray-800 rounded w-24"></div>
            </div>
            <div className="h-3 bg-gray-800 rounded w-20"></div>
          </div>
        </div>
      </div>

      {/* Footer skeleton */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-800">
        <div className="flex items-center gap-3">
          <div className="h-4 bg-gray-800 rounded w-8"></div>
          <div className="h-4 bg-gray-800 rounded w-12"></div>
        </div>
        <div className="h-3 bg-gray-800 rounded w-16"></div>
      </div>
    </div>
  );
}

export function CarrierGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <CarrierCardSkeleton key={index} />
      ))}
    </div>
  );
}