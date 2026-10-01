import React from 'react';
import { Zap } from 'lucide-react';
import { UserRole, AppView } from '../../types';

interface TopNavProps {
  role: UserRole;
  setRole: (role: UserRole) => void;
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
}

export const TopNav: React.FC<TopNavProps> = ({ currentView, setCurrentView }) => {
  const getViewTitle = () => {
    switch (currentView) {
      case 'farmer-dash': return 'FARM OVERVIEW & TELEMETRY';
      case 'retailer-dash': return 'RETAILER MARKET TERMINAL';
      case 'chat': return 'AI RISK & INSURANCE COPILOT';
      case 'marketplace': return 'SPOT CROP MARKETPLACE';
      case 'crop-details': return 'CROP ANALYSIS & SPECIFICATIONS';
      case 'add-listing': return 'CREATE CROP LISTING (AI VALIDATED)';
      case 'retailer-offer': return 'SUBMIT ESCROW PURCHASE OFFER';
      case 'farmer-offers': return 'INBOUND ESCROW OFFERS';
      case 'order-tracking': return 'TRACKING & SMART CONTRACT ESCROW';
      case 'login': return 'PORTAL ACCESS & ROLE SELECTOR';
      default: return 'AGRISENTINEL X';
    }
  };

  return (
    <header className="bg-white border-b border-slate-300 p-4 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-20 font-mono">
      <div className="flex items-center space-x-3">
        <div className="w-2.5 h-2.5 bg-[#064E3B]"></div>
        <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-900">
          {getViewTitle()}
        </h2>
      </div>

      <div className="flex items-center space-x-3 text-xs font-mono">
        <div className="hidden lg:flex items-center space-x-2 border border-slate-300 bg-slate-50 px-3 py-1">
          <span className="text-slate-500">COMMODITY INDEX:</span>
          <span className="font-bold text-slate-900">₹28.50/kg</span>
          <span className="text-emerald-700 font-bold">+1.8%</span>
        </div>

        <div className="border border-slate-300 bg-slate-50 px-3 py-1 flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-bold uppercase text-slate-800">TELEMETRY: ACTIVE</span>
        </div>

        <button 
          onClick={() => setCurrentView('chat')}
          className="bg-[#064E3B] text-emerald-300 border border-emerald-700 px-3 py-1 font-bold uppercase hover:bg-emerald-900 flex items-center space-x-1 transition-all"
        >
          <Zap className="w-3 h-3 text-emerald-300" />
          <span>AI COPILOT</span>
        </button>
      </div>
    </header>
  );
};
