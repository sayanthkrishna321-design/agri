import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl">
      <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 shadow-sm">
        <Icon className="w-7 h-7" />
      </div>
      <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h4>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mt-1.5 leading-relaxed">
        {description}
      </p>
      {(actionText || secondaryActionText) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {actionText && onAction && (
            <button
              onClick={onAction}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-md shadow-emerald-600/20 transition-all duration-200 hover:-translate-y-0.5"
            >
              {actionText}
            </button>
          )}
          {secondaryActionText && onSecondaryAction && (
            <button
              onClick={onSecondaryAction}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-all duration-200"
            >
              {secondaryActionText}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
