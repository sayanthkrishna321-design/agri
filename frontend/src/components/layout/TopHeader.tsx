import React, { useState } from 'react';
import { 
  Menu, Search, Bell, HelpCircle, ChevronDown, User, Settings, LogOut, 
  Sprout, ShoppingBag, CheckCircle2, Shield
} from 'lucide-react';
import { UserRole, NotificationItem } from '../../types';

interface TopHeaderProps {
  role: UserRole;
  currentRoute: string;
  setCurrentRoute: (route: string) => void;
  onMobileMenuToggle: () => void;
  notifications: NotificationItem[];
  onMarkNotificationRead: (id: number) => void;
  onOpenAuthModal: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  role,
  currentRoute,
  setCurrentRoute,
  onMobileMenuToggle,
  notifications,
  onMarkNotificationRead,
  onOpenAuthModal,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const unreadCount = notifications.filter(n => !n.read).length;

  const routeNames: Record<string, string> = {
    'dashboard': 'Dashboard Overview',
    'insurance-assistant': 'AI Insurance Assistant',
    'crops': 'My Crops Management',
    'weather-risk': 'Weather & Risk Intelligence',
    'insurance': 'Insurance Policies & Claims',
    'marketplace': 'AgriLink Produce Marketplace',
    'buyer-requirements': 'Retailer Buyer Requirements',
    'orders': 'Offers & Orders Logistics',
    'transactions': 'Transaction History & Ledger',
    'notifications': 'Notification Center',
    'settings': 'Platform & Account Settings',
  };

  return (
    <header className="h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Menu className="w-5 h-5" />
        </button>

        <nav aria-label="Breadcrumb" className="flex items-center text-xs font-medium text-slate-500 dark:text-slate-400">
          <span className="hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer" onClick={() => setCurrentRoute('dashboard')}>
            AgriSentinel X
          </span>
          <span className="mx-2 text-slate-300 dark:text-slate-600">/</span>
          <span className="text-slate-900 dark:text-slate-100 font-bold">
            {routeNames[currentRoute] || 'Overview'}
          </span>
        </nav>
      </div>

      {/* Center: Global Search */}
      <div className="hidden lg:flex items-center relative max-w-md w-full mx-6">
        <Search className="w-4 h-4 absolute left-3 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search crops, schemes, weather, orders..."
          className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Help Shortcut */}
        <button
          onClick={() => setCurrentRoute('insurance-assistant')}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Get AI Insurance Help"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotificationMenu(!showNotificationMenu);
              setShowProfileMenu(false);
            }}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse"></span>
            )}
          </button>

          {showNotificationMenu && (
            <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 z-50 animate-scale-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                  Notifications ({unreadCount} unread)
                </h4>
                <button
                  onClick={() => setCurrentRoute('notifications')}
                  className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                >
                  View All
                </button>
              </div>
              <div className="py-2 max-h-72 overflow-y-auto space-y-2">
                {notifications.slice(0, 4).map(item => (
                  <div
                    key={item.id}
                    onClick={() => {
                      onMarkNotificationRead(item.id);
                      if (item.target_route) setCurrentRoute(item.target_route);
                      setShowNotificationMenu(false);
                    }}
                    className={`p-2.5 rounded-xl cursor-pointer transition-colors ${
                      item.read
                        ? 'bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                        : 'bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/15'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">{item.title}</h5>
                      <span className="text-[10px] text-slate-400 shrink-0">{item.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {item.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotificationMenu(false);
            }}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
              {role === 'farmer' ? 'RS' : 'AG'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-none">
                {role === 'farmer' ? 'Ramesh Sharma' : 'AgroCorp Retail'}
              </p>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold capitalize">
                {role}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-scale-in">
              <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {role === 'farmer' ? 'Ramesh Sharma' : 'AgroCorp Retail'}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {role === 'farmer' ? 'ramesh.farmer@agrisentinel.in' : 'procurement@agrocorp.com'}
                </p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => {
                    setCurrentRoute('settings');
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Profile Settings</span>
                </button>
                <button
                  onClick={() => {
                    setCurrentRoute('settings');
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Preferences</span>
                </button>
              </div>
              <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => {
                    onOpenAuthModal();
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out / Switch Account</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
