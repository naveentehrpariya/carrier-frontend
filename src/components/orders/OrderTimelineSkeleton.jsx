import React from 'react';

export default function OrderTimelineCardSkeleton() {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden animate-pulse">
      {/* Header Timeline Skeleton */}
      <div className="p-4 bg-gray-900/80 border-b border-gray-800">
        <div className="flex items-center justify-between mb-3">
          {/* Order ID & Lock Status */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-800 rounded-xl flex-shrink-0"></div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="h-5 bg-gray-800 rounded w-24"></div>
                <div className="w-4 h-4 bg-gray-800 rounded"></div>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-gray-800 rounded flex-shrink-0"></div>
                <div className="h-3 bg-gray-800 rounded w-20"></div>
              </div>
            </div>
          </div>

          {/* Status & Distance */}
          <div className="text-right">
            <div className="h-5 bg-gray-800 rounded w-16 mb-1"></div>
            <div className="flex items-center justify-end gap-1">
              <div className="w-3 h-3 bg-gray-800 rounded"></div>
              <div className="h-3 bg-gray-800 rounded w-12"></div>
            </div>
          </div>
        </div>

        {/* Quick Info Row Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-800 rounded flex-shrink-0"></div>
              <div className="min-w-0 flex-1">
                <div className="h-3 bg-gray-800 rounded w-12 mb-1"></div>
                <div className="h-4 bg-gray-800 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Status Row Skeleton */}
      <div className="p-4 bg-gray-900/60 border-b border-gray-800">
        <div className="grid md:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="p-3 bg-gray-800/50 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-800 rounded-lg"></div>
                  <div>
                    <div className="h-3 bg-gray-800 rounded w-20 mb-2"></div>
                    <div className="h-5 bg-gray-800 rounded w-16"></div>
                  </div>
                </div>
                {index === 1 && (
                  <div className="text-right">
                    <div className="h-3 bg-gray-800 rounded w-16 mb-1"></div>
                    <div className="h-4 bg-gray-800 rounded w-20"></div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions Row Skeleton */}
      <div className="p-3 bg-gray-900/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 bg-gray-800 rounded-lg w-16"></div>
          <div className="h-8 bg-gray-800 rounded w-8"></div>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-4 bg-gray-800 rounded w-8"></div>
          <div className="w-4 h-4 bg-gray-800 rounded"></div>
        </div>
      </div>
    </div>
  );
}

export function OrderTimelineListSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <OrderTimelineCardSkeleton key={index} />
      ))}
    </div>
  );
}