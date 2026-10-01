import React from 'react';

export const LoadingSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="p-4 rounded-xl bg-slate-200 dark:bg-slate-800/60 border border-slate-300/40 dark:border-slate-700/40">
          <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-1/3 mb-3"></div>
          <div className="h-3 bg-slate-300 dark:bg-slate-700/60 rounded w-2/3 mb-2"></div>
          <div className="h-3 bg-slate-300 dark:bg-slate-700/40 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );
};
