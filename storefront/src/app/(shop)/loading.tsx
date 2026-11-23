import React from 'react';

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      {/* Top Banner Skeleton */}
      <div className="w-full h-32 sm:h-48 bg-gray-200/80 rounded-2xl mb-8 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-3 border-[#FF6600] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold text-gray-500">Loading MaxiTShop...</span>
        </div>
      </div>

      {/* Grid Skeleton: 4 per row */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-3.5 space-y-3">
            <div className="w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-gray-200" />
            </div>
            <div className="h-4 bg-gray-100 rounded-md w-3/4" />
            <div className="h-3 bg-gray-100 rounded-md w-1/2" />
            <div className="space-y-1.5 pt-2">
              <div className="h-2.5 bg-gray-50 rounded-full w-full" />
              <div className="h-2.5 bg-gray-50 rounded-full w-4/5" />
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div className="h-5 bg-gray-200 rounded-md w-20" />
              <div className="h-8 bg-gray-100 rounded-lg w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
