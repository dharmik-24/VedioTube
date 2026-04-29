import React from 'react';

const LoadingSkeleton = ({ count = 1, type = 'video' }) => {
  if (type === 'video') {
    return (
      <div className="space-y-4">
        {Array(count)
          .fill()
          .map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="bg-gray-700 h-48 w-full animate-pulse" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-gray-700 rounded animate-pulse w-3/4" />
                <div className="h-3 bg-gray-700 rounded animate-pulse w-1/2" />
                <div className="h-3 bg-gray-700 rounded animate-pulse w-1/3" />
              </div>
            </div>
          ))}
      </div>
    );
  }

  if (type === 'comment') {
    return (
      <div className="space-y-4">
        {Array(count)
          .fill()
          .map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-10 h-10 bg-gray-700 rounded-full animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-700 rounded animate-pulse w-1/4" />
                <div className="h-3 bg-gray-700 rounded animate-pulse" />
                <div className="h-3 bg-gray-700 rounded animate-pulse w-2/3" />
              </div>
            </div>
          ))}
      </div>
    );
  }

  return null;
};

export default LoadingSkeleton;
