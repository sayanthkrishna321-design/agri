import React from 'react';
import { 
  ShoppingBag, MessageSquare, PlusCircle, 
  DollarSign, BarChart2, Truck, UserCheck 
} from 'lucide-react';
import { UserRole, AppView } from '../../types';

interface SidebarProps {
  role: UserRole;
  setRole: (role: UserRole) => void;
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
}

function LayoutGridIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
    </svg>
  );
}

export const Sidebar: React.FC<SidebarProps> = ({ role, setRole, currentView, setCurrentView }) => {
  const navItems: {
    roleRequired?: UserRole;
    id: AppView;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    code: string;
  }[] = [
    {
      roleRequired: 'farmer',
      id: 'farmer-dash',
      label: 'FARM OVERVIEW',
      icon: LayoutGridIcon,
      code: 'F01'
    },
    {
      roleRequired: 'retailer',
      id: 'retailer-dash',
      label: 'MARKET OVERVIEW',
      icon: BarChart2,
      code: 'R01'
    },
    {
      id: 'marketplace',
      label: 'CROP MARKETPLACE',
      icon: ShoppingBag,
      code: 'M01'
    },
    {
      id: 'chat',
      label: 'INSURANCE AI CHAT',
      icon: MessageSquare,
      code: 'AI0'
    },
    {
      roleRequired: 'farmer',
      id: 'add-listing',
      label: 'ADD NEW LISTING',
      icon: PlusCircle,
      code: 'F02'
    },
    {
      roleRequired: 'farmer',
      id: 'farmer-offers',
      label: 'RECEIVED OFFERS',
      icon: DollarSign,
      code: 'F03'
    },
    {
      id: 'order-tracking',
      label: 'ORDER & ESCROW LOGS',
      icon: Truck,
      code: 'T01'
    }
  ];

  const filteredItems = navItems.filter(item => !item.roleRequired || item.roleRequired === role);

  return (
    <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-300 flex flex-col justify-between shrink-0 font-mono">
      <div>
        {/* Brand Header - Sharp Geometric Minimalist */}
        <div className="p-5 border-b border-slate-300 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#064E3B] border border-emerald-400 flex items-center justify-center font-bold text-emerald-300 font-mono text-sm shadow-sm">
              AX
            </div>
            <div>
              <h1 className="font-bold tracking-tight text-sm uppercase">AgriSentinel X</h1>
              <p className="text-[10px] text-emerald-400 font-mono tracking-widest uppercase">Geometric Ag Protocol</p>
            </div>
          </div>
        </div>

        {/* Role Switcher Module */}
        <div className="p-4 border-b border-slate-300 bg-slate-50">
          <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-2">OPERATIONAL PERSONA</div>
          <div className="grid grid-cols-2 gap-1 bg-slate-200 p-1 border border-slate-300">
            <button
              onClick={() => setRole('farmer')}
              className={`py-1.5 px-2 text-xs font-mono font-bold uppercase transition-all ${
                role === 'farmer' 
                  ? 'bg-[#064E3B] text-emerald-300 border border-emerald-700 shadow-sm' 
                  : 'text-slate-700 hover:bg-slate-300'
              }`}
            >
              FARMER
            </button>
            <button
              onClick={() => setRole('retailer')}
              className={`py-1.5 px-2 text-xs font-mono font-bold uppercase transition-all ${
                role === 'retailer' 
                  ? 'bg-slate-900 text-white border border-slate-700 shadow-sm' 
                  : 'text-slate-700 hover:bg-slate-300'
              }`}
            >
              RETAILER
            </button>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center justify-between p-3 border text-left transition-all font-mono text-xs ${
                  isActive
                    ? 'bg-slate-900 text-white border-slate-900 font-bold'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <span className="uppercase tracking-tight">{item.label}</span>
                </div>
                <span className={`text-[10px] ${isActive ? 'text-emerald-400' : 'text-slate-400'}`}>
                  [{item.code}]
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Info Module */}
      <div className="p-4 border-t border-slate-300 bg-slate-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-slate-900 text-emerald-400 flex items-center justify-center font-mono text-xs font-bold border border-slate-700">
              {role === 'farmer' ? 'FM' : 'RT'}
            </div>
            <div>
              <p className="text-xs font-bold font-mono text-slate-900">
                {role === 'farmer' ? 'Kisan Co-op #04' : 'Apex Sourcing Ltd.'}
              </p>
              <p className="text-[10px] font-mono text-[#064E3B] font-bold">
                ● ESCROW VERIFIED
              </p>
            </div>
          </div>
          <button 
            onClick={() => setCurrentView('login')} 
            className="p-1.5 border border-slate-300 bg-white hover:bg-slate-100 text-slate-700"
            title="Switch User / Login"
          >
            <UserCheck className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
