import React from 'react';

interface StatusBadgeProps {
  status: string;
  variant?: 'green' | 'blue' | 'amber' | 'red' | 'purple' | 'gray';
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant,
  size = 'md',
}) => {
  // Infer variant if not provided
  let computedVariant = variant;
  if (!computedVariant) {
    const s = status.toUpperCase();
    if (['ELIGIBLE', 'ACCEPTED', 'CONFIRMED', 'DELIVERED', 'GROWING', 'RESOLVED', 'MATCHED', 'A+'].includes(s)) {
      computedVariant = 'green';
    } else if (['POTENTIALLY_ELIGIBLE', 'IN_TRANSIT', 'OPEN', 'PENDING', 'A'].includes(s)) {
      computedVariant = 'blue';
    } else if (['INSUFFICIENT_INFO', 'UNDER_REVIEW', 'UNKNOWN', 'HARVESTED', 'B'].includes(s)) {
      computedVariant = 'amber';
    } else if (['NOT_ELIGIBLE', 'REJECTED', 'CANCELLED', 'DAMAGED', 'CLOSED'].includes(s)) {
      computedVariant = 'red';
    } else {
      computedVariant = 'gray';
    }
  }

  const styles = {
    green: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
    blue: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
    amber: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
    red: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20',
    purple: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
    gray: 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20',
  }[computedVariant];

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold font-mono-tech rounded-full border ${styles} ${sizeClasses}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {status.replace(/_/g, ' ')}
    </span>
  );
};
