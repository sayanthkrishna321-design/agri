import React, { useState } from 'react';
import { Crop, AppView } from '../types';

interface AddCropListingViewProps {
  setCrops: React.Dispatch<React.SetStateAction<Crop[]>>;
  setCurrentView: (view: AppView) => void;
}

export const AddCropListingView: React.FC<AddCropListingViewProps> = ({ setCrops, setCurrentView }) => {
  const [formData, setFormData] = useState({
    title: '',
    pricePerQuintal: '2850',
    quantity: '150',
    moisture: '11.2%',
    grainSize: '3.4mm',
    grade: 'A+' as 'A+' | 'A' | 'B',
    description: ''
  });

  const priceQuintalNum = Number(formData.pricePerQuintal) || 0;
  const priceKgCalculated = (priceQuintalNum / 100).toFixed(2);

  // Dynamic AI quality score computation
  const moistureVal = parseFloat(formData.moisture) || 12;
  const calculatedAiScore = Math.max(70, Math.min(99, Math.round(100 - (moistureVal - 10) * 4)));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCrop: Crop = {
      id: `crop-${Date.now()}`,
      title: formData.title || 'Grade A Sharbati Wheat',
      seller: 'Kisan Organics Co-op',
      sellerType: 'Verified Farmer',
      location: 'Punjab, IN',
      pricePerQuintal: priceQuintalNum,
      pricePerKg: Number(priceKgCalculated),
      quantity: Number(formData.quantity) || 100,
      unit: 'Quintals',
      moisture: formData.moisture,
      grainSize: formData.grainSize,
      aiQualityScore: calculatedAiScore,
      grade: formData.grade,
      harvestDate: new Date().toISOString().split('T')[0],
      image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=600',
      description: formData.description || 'Verified crop harvest ready for direct spot market escrow procurement.'
    };

    setCrops(prev => [newCrop, ...prev]);
    setCurrentView('farmer-dash');
  };

  return (
    <div className="max-w-2xl mx-auto border border-slate-300 bg-white p-8 font-mono space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-base font-bold uppercase text-slate-900">ADD HARVEST LISTING (AI QUALITY SIMULATOR)</h1>
        <p className="text-xs text-slate-500">Inputs are evaluated against regional satellite & sensor telemetry</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-bold text-slate-700 uppercase mb-1">Crop Title & Commodity</label>
          <input 
            type="text" 
            required
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
            placeholder="e.g. Grade A+ Sharbati Wheat / Aromatic Basmati 1121"
            className="w-full border border-slate-300 p-2.5 focus:outline-none focus:border-slate-900"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Target Price (₹/Quintal)</label>
            <input 
              type="number" 
              required
              value={formData.pricePerQuintal}
              onChange={e => setFormData({...formData, pricePerQuintal: e.target.value})}
              className="w-full border border-slate-300 p-2.5 focus:outline-none focus:border-slate-900 font-bold"
            />
            <span className="text-[10px] text-[#064E3B] font-bold mt-1 block">Equivalent: ₹{priceKgCalculated} / kg</span>
          </div>
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Quantity (Quintals)</label>
            <input 
              type="number" 
              required
              value={formData.quantity}
              onChange={e => setFormData({...formData, quantity: e.target.value})}
              className="w-full border border-slate-300 p-2.5 focus:outline-none focus:border-slate-900"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Moisture (%)</label>
            <input 
              type="text" 
              value={formData.moisture}
              onChange={e => setFormData({...formData, moisture: e.target.value})}
              className="w-full border border-slate-300 p-2.5 focus:outline-none focus:border-slate-900"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Grain Size</label>
            <input 
              type="text" 
              value={formData.grainSize}
              onChange={e => setFormData({...formData, grainSize: e.target.value})}
              className="w-full border border-slate-300 p-2.5 focus:outline-none focus:border-slate-900"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Assigned Grade</label>
            <select 
              value={formData.grade}
              onChange={e => setFormData({...formData, grade: e.target.value as any})}
              className="w-full border border-slate-300 p-2.5 focus:outline-none focus:border-slate-900 bg-white font-bold"
            >
              <option value="A+">Grade A+</option>
              <option value="A">Grade A</option>
              <option value="B">Grade B</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 uppercase mb-1">Description & Harvest Notes</label>
          <textarea 
            rows={3}
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            placeholder="Describe soil origin, pesticide history, moisture tests..."
            className="w-full border border-slate-300 p-2.5 focus:outline-none focus:border-slate-900"
          ></textarea>
        </div>

        {/* AI Simulator Output Box */}
        <div className="p-4 border border-emerald-800 bg-[#064E3B] text-emerald-100 space-y-1">
          <div className="flex justify-between items-center text-xs font-bold text-emerald-300">
            <span>REAL-TIME AI QUALITY SCORE PREDICTION</span>
            <span className="text-base">{calculatedAiScore} / 100</span>
          </div>
          <p className="text-[11px] text-emerald-100">
            Simulated market rate: ₹{(priceQuintalNum * 0.98).toFixed(0)} - ₹{(priceQuintalNum * 1.03).toFixed(0)} / Quintal (₹{((priceQuintalNum * 0.98)/100).toFixed(2)} - ₹{((priceQuintalNum * 1.03)/100).toFixed(2)} / kg). High confidence score.
          </p>
        </div>

        <div className="pt-2 flex justify-end space-x-3">
          <button 
            type="button" 
            onClick={() => setCurrentView('farmer-dash')}
            className="border border-slate-300 bg-white hover:bg-slate-100 px-5 py-2 font-bold uppercase text-slate-700"
          >
            CANCEL
          </button>
          <button 
            type="submit" 
            className="bg-slate-900 text-white hover:bg-slate-800 border border-slate-900 px-6 py-2 font-bold uppercase"
          >
            PUBLISH TO MARKETPLACE
          </button>
        </div>
      </form>
    </div>
  );
};
