import React from 'react';
import { BarChart2, TrendingUp, ShieldCheck, ShoppingBag } from 'lucide-react';
import { Crop, AppView } from '../types';

interface RetailerDashboardProps {
  setCurrentView: (view: AppView) => void;
  crops: Crop[];
  setSelectedCrop: (crop: Crop) => void;
}

export const RetailerDashboard: React.FC<RetailerDashboardProps> = ({
  setCurrentView,
  crops,
  setSelectedCrop
}) => {
  return (
    <div className="space-y-6 font-mono">
      {/* 3 Top Minimal Square Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border border-slate-300 bg-white p-5 flex flex-col justify-between hover:border-slate-400 transition-all min-h-[140px]">
          <div className="flex justify-between items-start">
            <span className="text-xs text-slate-500 font-bold uppercase">TOTAL MARKET VOLUME</span>
            <BarChart2 className="w-4 h-4 text-[#064E3B]" />
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900">850 QUINTALS</div>
            <div className="text-xs text-[#064E3B] font-bold mt-1">12 VERIFIED FARMS ONLINE</div>
          </div>
          <div className="text-[10px] text-slate-500 border-t border-slate-200 pt-2">
            Average Quality Grade: A+
          </div>
        </div>

        <div className="border border-slate-300 bg-white p-5 flex flex-col justify-between hover:border-slate-400 transition-all min-h-[140px]">
          <div className="flex justify-between items-start">
            <span className="text-xs text-slate-500 font-bold uppercase">AI DEMAND FORECAST</span>
            <TrendingUp className="w-4 h-4 text-blue-700" />
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900">HIGH DEMAND</div>
            <div className="text-xs text-blue-700 font-bold mt-1">WHEAT +4.2% NEXT 14 DAYS</div>
          </div>
          <div className="text-[10px] text-slate-500 border-t border-slate-200 pt-2">
            Based on regional mill processing indices
          </div>
        </div>

        <div className="border border-slate-300 bg-white p-5 flex flex-col justify-between hover:border-slate-400 transition-all min-h-[140px]">
          <div className="flex justify-between items-start">
            <span className="text-xs text-slate-500 font-bold uppercase">ESCROW FUNDS LOCKED</span>
            <ShieldCheck className="w-4 h-4 text-[#064E3B]" />
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900">₹12,40,000</div>
            <div className="text-xs text-[#064E3B] font-bold mt-1">100% SMART CONTRACT PROTECTED</div>
          </div>
          <div className="text-[10px] text-slate-500 border-t border-slate-200 pt-2">
            Disbursed upon gate pass receipt
          </div>
        </div>
      </div>

      {/* Spot Price Watch Table */}
      <div className="border border-slate-300 bg-white p-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-slate-200 pb-4">
          <div>
            <h3 className="font-bold text-sm uppercase text-slate-900">SPOT CROP MARKET & AI PRICE PREDICTIONS</h3>
            <p className="text-xs text-slate-500">Direct farm gate pricing in ₹/kg and ₹/Quintal</p>
          </div>
          <button 
            onClick={() => setCurrentView('marketplace')}
            className="bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold px-4 py-2 border border-slate-900 uppercase self-start sm:self-auto flex items-center space-x-1"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
            <span>BROWSE FULL MARKETPLACE</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-300 bg-slate-100 text-slate-700 uppercase">
                <th className="p-3 border-r border-slate-200">Commodity</th>
                <th className="p-3 border-r border-slate-200">Grade</th>
                <th className="p-3 border-r border-slate-200">Spot Rate (/Quintal)</th>
                <th className="p-3 border-r border-slate-200">Rate (/kg)</th>
                <th className="p-3 border-r border-slate-200">14-Day AI Forecast</th>
                <th className="p-3 border-r border-slate-200">Available Stock</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {crops.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="p-3 border-r border-slate-200 font-bold text-slate-900">{c.title}</td>
                  <td className="p-3 border-r border-slate-200">
                    <span className="bg-slate-900 text-white font-bold px-2 py-0.5 text-[10px]">
                      GRADE {c.grade}
                    </span>
                  </td>
                  <td className="p-3 border-r border-slate-200 font-bold text-slate-900">₹{c.pricePerQuintal}</td>
                  <td className="p-3 border-r border-slate-200 font-bold text-emerald-900">₹{c.pricePerKg}/kg</td>
                  <td className="p-3 border-r border-slate-200 text-emerald-700 font-bold">
                    ↑ ₹{(c.pricePerQuintal * 1.04).toFixed(0)} (+4.0%)
                  </td>
                  <td className="p-3 border-r border-slate-200">{c.quantity} Quintals</td>
                  <td className="p-3">
                    <button 
                      onClick={() => { setSelectedCrop(c); setCurrentView('crop-details'); }}
                      className="bg-[#064E3B] text-emerald-300 hover:bg-emerald-900 px-3 py-1 font-bold border border-emerald-700 uppercase"
                    >
                      INSPECT & BUY
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
