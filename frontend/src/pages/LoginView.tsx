import React from 'react';
import { ArrowRight } from 'lucide-react';
import { UserRole, AppView } from '../types';

interface LoginViewProps {
  setRole: (role: UserRole) => void;
  setCurrentView: (view: AppView) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ setRole, setCurrentView }) => {
  return (
    <div className="max-w-xl mx-auto my-8 bg-white border border-slate-300 p-8 shadow-sm font-mono">
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-slate-900 text-emerald-400 font-mono text-2xl font-bold border border-slate-700 flex items-center justify-center mx-auto mb-3">
          AX
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 uppercase">AGRISENTINEL X</h1>
        <p className="text-xs text-slate-500 mt-1 uppercase">Select operational persona to enter dashboard console</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div 
          onClick={() => { setRole('farmer'); setCurrentView('farmer-dash'); }}
          className="border-2 border-slate-300 hover:border-[#064E3B] p-6 bg-slate-50 hover:bg-emerald-50/20 cursor-pointer transition-all group flex flex-col justify-between h-52"
        >
          <div>
            <div className="w-8 h-8 bg-[#064E3B] text-emerald-300 border border-emerald-700 flex items-center justify-center font-mono font-bold text-xs mb-3">
              F1
            </div>
            <h3 className="font-mono font-bold text-slate-900 uppercase text-sm group-hover:text-emerald-900">Farmer Console</h3>
            <p className="text-xs text-slate-500 mt-2 font-mono leading-relaxed">
              Monitor field health, list AI-graded crops (Wheat, Basmati, Chana, Maize), track smart yield forecasts, manage incoming buyer offers.
            </p>
          </div>
          <div className="text-xs font-mono font-bold text-[#064E3B] flex items-center space-x-1 pt-2">
            <span>ENTER AS FARMER</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <div 
          onClick={() => { setRole('retailer'); setCurrentView('retailer-dash'); }}
          className="border-2 border-slate-300 hover:border-slate-900 p-6 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-all group flex flex-col justify-between h-52"
        >
          <div>
            <div className="w-8 h-8 bg-slate-900 text-white border border-slate-700 flex items-center justify-center font-mono font-bold text-xs mb-3">
              R1
            </div>
            <h3 className="font-mono font-bold text-slate-900 uppercase text-sm group-hover:text-slate-900">Retailer Terminal</h3>
            <p className="text-xs text-slate-500 mt-2 font-mono leading-relaxed">
              Inspect grain quality matrices, place verified escrow offers in ₹/kg & ₹/Q, analyze market trends & AI demand forecasts.
            </p>
          </div>
          <div className="text-xs font-mono font-bold text-slate-900 flex items-center space-x-1 pt-2">
            <span>ENTER AS RETAILER</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      <div className="p-4 border border-slate-300 bg-slate-100 text-center font-mono text-xs text-slate-600">
        AUTHENTICATION STATUS: DEVELOPMENT AUTO-LOGIN ACTIVE
      </div>
    </div>
  );
};
