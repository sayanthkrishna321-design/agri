import React from 'react';
import { Zap, PlusCircle, Eye, ArrowRight, ChevronRight, AlertTriangle } from 'lucide-react';
import { Crop, Offer, AppView } from '../types';

interface FarmerDashboardProps {
  setCurrentView: (view: AppView) => void;
  setSelectedCrop: (crop: Crop) => void;
  crops: Crop[];
  offers: Offer[];
}

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({
  setCurrentView,
  setSelectedCrop,
  crops,
  offers
}) => {
  const pendingOffersCount = offers.filter(o => o.status === 'Pending').length;
  const totalOffersValue = offers.reduce((acc, curr) => acc + curr.totalValue, 0);

  return (
    <div className="space-y-6 font-mono">
      {/* Weather & AI Advisory Alert Card - Subtle Amber / Emerald Accent */}
      <div className="border border-amber-400 bg-amber-50 text-amber-950 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-amber-200 border border-amber-400 text-amber-900 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-bold text-amber-900 uppercase tracking-wider">LIVE WEATHER ALERT & AI ADVISORY</span>
              <span className="text-[10px] font-mono bg-amber-900 text-amber-100 px-1.5 py-0.5 font-bold">PREDICTIVE SENSOR #402</span>
            </div>
            <p className="text-xs font-mono mt-1 text-amber-900 leading-relaxed">
              Unseasonal rain & high wind speed forecast in Punjab/Haryana region in 48h. Recommended early harvest window for Sharbati Wheat & reduce field irrigation by 25%.
            </p>
          </div>
        </div>
        <button 
          onClick={() => setCurrentView('chat')}
          className="shrink-0 bg-slate-900 hover:bg-slate-800 text-white border border-slate-900 font-mono text-xs font-bold px-4 py-2 uppercase tracking-tight transition-all"
        >
          Consult AI Copilot
        </button>
      </div>

      {/* 4 Square Core Metrics Cards (1:1 aspect ratio modules) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Crop Health */}
        <div className="border border-slate-300 bg-white p-5 aspect-square flex flex-col justify-between hover:border-slate-400 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">CROP HEALTH</span>
            <span className="w-2.5 h-2.5 bg-emerald-600"></span>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900 tracking-tight">OPTIMAL</div>
            <div className="text-xs text-emerald-700 font-bold mt-1">94/100 NDVI SCORE</div>
          </div>
          <div className="text-[10px] text-slate-500 border-t border-slate-200 pt-2">
            Updated 14 mins ago via Sentinel-2
          </div>
        </div>

        {/* Metric 2: Soil Moisture */}
        <div className="border border-slate-300 bg-white p-5 aspect-square flex flex-col justify-between hover:border-slate-400 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">SOIL MOISTURE</span>
            <span className="w-2.5 h-2.5 bg-blue-600"></span>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900 tracking-tight">34%</div>
            <div className="text-xs text-slate-600 font-bold mt-1">TARGET: 30-38% RANGE</div>
          </div>
          <div className="text-[10px] text-slate-500 border-t border-slate-200 pt-2">
            Sensor Node #402 — Root Depth
          </div>
        </div>

        {/* Metric 3: Yield Forecast */}
        <div className="border border-slate-300 bg-white p-5 aspect-square flex flex-col justify-between hover:border-slate-400 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">YIELD FORECAST</span>
            <span className="w-2.5 h-2.5 bg-emerald-600"></span>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900 tracking-tight">+15%</div>
            <div className="text-xs text-emerald-700 font-bold mt-1">420 QUINTALS EST.</div>
          </div>
          <div className="text-[10px] text-slate-500 border-t border-slate-200 pt-2">
            Confidence Interval: 96.2%
          </div>
        </div>

        {/* Metric 4: Inbound Offers */}
        <div className="border border-slate-300 bg-white p-5 aspect-square flex flex-col justify-between hover:border-slate-400 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">INBOUND OFFERS</span>
            <span className="w-2.5 h-2.5 bg-amber-500"></span>
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900 tracking-tight">{pendingOffersCount} PENDING</div>
            <div className="text-xs text-amber-800 font-bold mt-1">₹{(totalOffersValue / 100000).toFixed(2)} LAKH VALUE</div>
          </div>
          <button 
            onClick={() => setCurrentView('farmer-offers')}
            className="text-[10px] font-bold text-slate-900 border-t border-slate-200 pt-2 uppercase flex items-center justify-between hover:text-[#064E3B]"
          >
            <span>REVIEW OFFERS</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active Field Inventory (2 cols) */}
        <div className="lg:col-span-2 border border-slate-300 bg-white p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-200 pb-4">
            <div>
              <h3 className="font-bold text-sm uppercase text-slate-900">MY CROP LISTINGS & HARVESTS</h3>
              <p className="text-xs text-slate-500">Verified commodities active on spot market</p>
            </div>
            <button 
              onClick={() => setCurrentView('add-listing')}
              className="bg-[#064E3B] hover:bg-emerald-900 text-emerald-300 font-bold text-xs px-3 py-2 border border-emerald-700 uppercase flex items-center space-x-1"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-300" />
              <span>LIST NEW HARVEST</span>
            </button>
          </div>

          <div className="space-y-3">
            {crops.map((crop) => (
              <div key={crop.id} className="border border-slate-200 p-4 hover:border-slate-400 transition-all bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center space-x-3">
                  <img src={crop.image} alt={crop.title} className="w-14 h-14 object-cover border border-slate-300 shrink-0" />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs text-slate-900">{crop.title}</span>
                      <span className="text-[10px] bg-slate-900 text-white px-1.5 py-0.5 font-bold">
                        GRADE {crop.grade}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {crop.quantity} {crop.unit} • Moisture: {crop.moisture} • Quality AI: {crop.aiQualityScore}%
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-900">₹{crop.pricePerQuintal}/Q <span className="text-slate-500 text-[10px]">(₹{crop.pricePerKg}/kg)</span></div>
                    <div className="text-[10px] text-slate-500 uppercase">LISTED PRICE</div>
                  </div>
                  <button 
                    onClick={() => { setSelectedCrop(crop); setCurrentView('crop-details'); }}
                    className="p-2 border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs"
                    title="Inspect Crop Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Environmental Grid & Shortcuts */}
        <div className="space-y-6">
          {/* Microclimate Sensors */}
          <div className="border border-slate-300 bg-white p-6 space-y-4">
            <h3 className="font-bold text-sm uppercase text-slate-900 border-b border-slate-200 pb-3">
              FIELD SENSOR TELEMETRY
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 border border-slate-200 bg-slate-50">
                <div className="text-[10px] text-slate-500 uppercase">AIR TEMP</div>
                <div className="text-lg font-bold text-slate-900">28.4°C</div>
              </div>
              <div className="p-3 border border-slate-200 bg-slate-50">
                <div className="text-[10px] text-slate-500 uppercase">HUMIDITY</div>
                <div className="text-lg font-bold text-slate-900">58% RH</div>
              </div>
              <div className="p-3 border border-slate-200 bg-slate-50">
                <div className="text-[10px] text-slate-500 uppercase">SOLAR RAD</div>
                <div className="text-lg font-bold text-slate-900">840 W/m²</div>
              </div>
              <div className="p-3 border border-slate-200 bg-slate-50">
                <div className="text-[10px] text-slate-500 uppercase">SOIL PH</div>
                <div className="text-lg font-bold text-slate-900">6.8 pH</div>
              </div>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="border border-slate-300 bg-white p-6 space-y-3">
            <h3 className="font-bold text-sm uppercase text-slate-900 border-b border-slate-200 pb-3">
              FARMER SHORTCUTS
            </h3>
            <button 
              onClick={() => setCurrentView('add-listing')}
              className="w-full text-left p-3 border border-slate-200 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs font-bold text-slate-800"
            >
              <span>+ LIST CROP TO MARKETPLACE</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setCurrentView('farmer-offers')}
              className="w-full text-left p-3 border border-slate-200 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs font-bold text-slate-800"
            >
              <span>VIEW {offers.length} INBOUND OFFERS</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setCurrentView('chat')}
              className="w-full text-left p-3 border border-slate-200 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs font-bold text-slate-800"
            >
              <span>ASSESS PEST/WEATHER INSURANCE RISK</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
