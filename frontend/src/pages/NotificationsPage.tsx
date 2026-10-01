import React, { useState } from 'react';
import { 
  Bell, CheckCircle2, ShoppingBag, Truck, Sprout, ShieldCheck, 
  Trash2, Filter
} from 'lucide-react';
import { NotificationItem } from '../types';

interface NotificationsPageProps {
  notifications: NotificationItem[];
  setNotifications: React.Dispatch<React.SetStateAction<NotificationItem[]>>;
  setCurrentRoute: (route: string) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({
  notifications,
  setNotifications,
  setCurrentRoute,
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'unread' | 'marketplace' | 'orders' | 'crop_reminders' | 'insurance_guidance'>('all');

  const filteredNotifications = notifications.filter(n => {
    if (activeCategory === 'unread') return !n.read;
    if (activeCategory === 'all') return true;
    return n.category === activeCategory;
  });

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markSingleAsRead = (id: number) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-400 text-xs font-bold mb-2">
            <Bell className="w-3.5 h-3.5" />
            <span>Platform Notifications & Alerts</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
            Notification Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time updates for offers received, weather alerts, order logistics, and insurance checklists.
          </p>
        </div>

        <button
          onClick={markAllAsRead}
          className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Mark All as Read</span>
        </button>
      </div>

      {/* 2. Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-bold">
        {[
          { id: 'all', label: 'All' },
          { id: 'unread', label: 'Unread' },
          { id: 'marketplace', label: 'Marketplace' },
          { id: 'orders', label: 'Orders & Shipping' },
          { id: 'crop_reminders', label: 'Crop & Weather' },
          { id: 'insurance_guidance', label: 'Insurance Guidance' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id as any)}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              activeCategory === tab.id
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 text-xs">
            No notifications found in this category.
          </div>
        ) : (
          filteredNotifications.map(n => (
            <div
              key={n.id}
              onClick={() => {
                markSingleAsRead(n.id);
                if (n.target_route) setCurrentRoute(n.target_route);
              }}
              className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 flex items-start justify-between gap-4 ${
                n.read
                  ? 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-slate-900 dark:text-slate-100 shadow-sm'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                  n.read ? 'bg-slate-100 dark:bg-slate-800 text-slate-400' : 'bg-emerald-600 text-white'
                }`}>
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{n.title}</h4>
                    {!n.read && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-rose-500 text-white">NEW</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    {n.message}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] font-mono-tech text-slate-400">{n.timestamp}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
