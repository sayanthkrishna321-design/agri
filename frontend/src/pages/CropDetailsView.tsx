import React from 'react';
import { ArrowLeft, ShieldCheck, MapPin, CheckCircle2 } from 'lucide-react';
import { Crop, AppView } from '../types';

interface CropDetailsViewProps {
  crop: Crop | null;
  setCurrentView: (view: AppView) => void;
}

export const CropDetailsView: React.FC<CropDetailsViewProps> = ({ crop, setCurrentView }) => {
  if (!crop) {
    return (
      <div className="p-8 text-center font-mono text-xs text-slate-500 border border-slate-300 bg-white">
        NO CROP SELECTED. PLEASE RETURN TO MARKETPLACE.
      </div>
    );
  }

  return (
    <div className="space-y-6 font-mono max-w-5xl mx-auto">
      <button 
        onClick={() => setCurrentView('marketplace')}
        className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center space-x-1 uppercase"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>BACK TO MARKETPLACE</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Image & Verification Badge */}
        <div className="space-y-4">
          <div className="border border-slate-300 bg-white p-2">
            <img src={crop.image} alt={crop.title} className="w-full h-80 object-cover" />
          </div>

          <div className="border border-slate-300 bg-white p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-bold uppercase">PRODUCER CREDENTIALS</span>
              <span className="bg-[#064E3B] text-emerald-300 text-[10px] font-bold px-2 py-0.5 border border-emerald-700">
                VERIFIED FARMER CO-OP
              </span>
            </div>
            <div className="text-sm font-bold text-slate-900">{crop.seller}</div>
            <p className="text-xs text-slate-500 flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>Location: {crop.location}</span>
            </p>
            <div className="p-3 border border-slate-200 bg-slate-50 text-xs text-slate-700 space-y-1">
              <div className="flex items-center space-x-1.5 text-emerald-800 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Smart Contract Escrow Lock Active</span>
              </div>
              <div className="flex items-center space-x-1.5 text-emerald-800 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Spectral Quality Scanning Verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Specifications Matrix */}
        <div className="border border-slate-300 bg-white p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="bg-slate-900 text-white text-[10px] font-bold px-2 py-1 uppercase">
                  GRADE {crop.grade}
                </span>
                <h1 className="text-xl font-bold text-slate-900 uppercase mt-2">{crop.title}</h1>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-slate-900">₹{crop.pricePerQuintal}</span>
                <span className="text-xs text-slate-500 block">/ QUINTAL (₹{crop.pricePerKg}/kg)</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed border-t border-b border-slate-200 py-3">
              {crop.description}
            </p>

            {/* Quality Breakdown Table */}
            <div>
              <h3 className="text-xs font-bold uppercase text-slate-900 mb-3">AI QUALITY SCAN MATRIX</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 border border-slate-200 bg-slate-50">
                  <span className="text-[10px] text-slate-500 block uppercase">SPECTRAL QUALITY SCORE</span>
                  <span className="text-base font-bold text-emerald-700">{crop.aiQualityScore} / 100</span>
                </div>
                <div className="p-3 border border-slate-200 bg-slate-50">
                  <span className="text-[10px] text-slate-500 block uppercase">GRAIN MOISTURE LEVEL</span>
                  <span className="text-base font-bold text-slate-900">{crop.moisture}</span>
                </div>
                <div className="p-3 border border-slate-200 bg-slate-50">
                  <span className="text-[10px] text-slate-500 block uppercase">AVERAGE GRAIN SIZE</span>
                  <span className="text-base font-bold text-slate-900">{crop.grainSize}</span>
                </div>
                <div className="p-3 border border-slate-200 bg-slate-50">
                  <span className="text-[10px] text-slate-500 block uppercase">HARVEST DATE</span>
                  <span className="text-base font-bold text-slate-900">{crop.harvestDate}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-300 space-y-2">
            <button 
              onClick={() => setCurrentView('retailer-offer')}
              className="w-full bg-[#064E3B] hover:bg-emerald-900 text-emerald-300 border border-emerald-700 p-3 font-bold text-xs uppercase transition-all"
            >
              INITIATE PURCHASE OFFER (ESCROW PROTECTED)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
