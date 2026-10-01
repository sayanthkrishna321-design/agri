import React from 'react';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';

interface AlertBannerProps {
  type?: 'info' | 'warning' | 'error' | 'success';
  title?: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  type = 'info',
  title,
  message,
  actionText,
  onAction,
}) => {
  const styles = {
    info: {
      bg: 'bg-blue-500/10 border-blue-500/20 text-blue-900 dark:text-blue-300',
      icon: Info,
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    warning: {
      bg: 'bg-amber-500/10 border-amber-500/20 text-amber-900 dark:text-amber-300',
      icon: AlertTriangle,
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
    error: {
      bg: 'bg-rose-500/10 border-rose-500/20 text-rose-900 dark:text-rose-300',
      icon: XCircle,
      iconColor: 'text-rose-600 dark:text-rose-400',
    },
    success: {
      bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-900 dark:text-emerald-300',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
  }[type];

  const Icon = styles.icon;

  return (
    <div className={`p-4 rounded-xl border ${styles.bg} flex items-start justify-between gap-3`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${styles.iconColor}`} />
        <div>
          {title && <h5 className="text-sm font-bold">{title}</h5>}
          <p className="text-xs leading-relaxed mt-0.5">{message}</p>
        </div>
      </div>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="shrink-0 text-xs font-semibold underline hover:no-underline px-2 py-1 rounded transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
