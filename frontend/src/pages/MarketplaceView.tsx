import React, { useState } from 'react';
import { Search, MapPin, Eye } from 'lucide-react';
import { Crop, AppView } from '../types';

interface MarketplaceViewProps {
  crops: Crop[];
  setSelectedCrop: (crop: Crop) => void;
  setCurrentView: (view: AppView) => void;
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({
  crops,
  setSelectedCrop,
  setCurrentView
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<'ALL' | 'A+' | 'A' | 'B'>('ALL');
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'quality'>('quality');

  const filtered = crops
    .filter(c => {
      const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            c.seller.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            c.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGrade = selectedGrade === 'ALL' || c.grade === selectedGrade;
      return matchesSearch && matchesGrade;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.pricePerQuintal - b.pricePerQuintal;
      if (sortBy === 'price-desc') return b.pricePerQuintal - a.pricePerQuintal;
      return b.aiQualityScore - a.aiQualityScore;
    });

  return (
    <div className="space-y-6 font-mono">
      {/* Search & Filter Bar */}
      <div className="border border-slate-300 bg-white p-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="SEARCH WHEAT, BASMATI, CHANA, MAIZE..."
            className="w-full border border-slate-300 pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-slate-900 uppercase"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-500 uppercase">GRADE:</span>
            {(['ALL', 'A+', 'A', 'B'] as const).map((grade) => (
              <button
                key={grade}
                onClick={() => setSelectedGrade(grade)}
                className={`px-3 py-1 text-xs font-bold border transition-all ${
                  selectedGrade === grade
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                {grade}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-500 uppercase">SORT:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border border-slate-300 bg-white px-2 py-1 text-xs font-bold focus:outline-none"
            >
              <option value="quality">AI QUALITY SCORE</option>
              <option value="price-asc">PRICE: LOW TO HIGH</option>
              <option value="price-desc">PRICE: HIGH TO LOW</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Square Crop Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((crop) => (
          <div key={crop.id} className="border border-slate-300 bg-white flex flex-col justify-between hover:border-slate-500 transition-all">
            <div>
              <div className="relative border-b border-slate-300">
                <img src={crop.image} alt={crop.title} className="w-full h-48 object-cover rounded-none" />
                <div className="absolute top-3 left-3 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 border border-slate-700 uppercase">
                  GRADE {crop.grade}
                </div>
                <div className="absolute bottom-3 right-3 bg-emerald-950 text-emerald-300 text-[10px] font-bold px-2 py-1 border border-emerald-800">
                  AI QUALITY: {crop.aiQualityScore}%
                </div>
              </div>

              <div className="p-5 space-y-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 uppercase">{crop.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 flex items-center space-x-1">
                    <MapPin className="w-3 h-3" />
                    <span>{crop.seller} • {crop.location}</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 border-t border-b border-slate-200 py-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">AVAILABLE STOCK</span>
                    <span className="font-bold text-slate-900">{crop.quantity} {crop.unit}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">GRAIN MOISTURE</span>
                    <span className="font-bold text-slate-900">{crop.moisture}</span>
                  </div>
                </div>

                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">SPOT RATE</span>
                    <span className="text-lg font-bold text-slate-900">₹{crop.pricePerQuintal}</span>
                    <span className="text-xs text-slate-500"> / Quintal</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-900">₹{crop.pricePerKg} / kg</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-300 bg-slate-50 flex gap-2">
              <button 
                onClick={() => { setSelectedCrop(crop); setCurrentView('crop-details'); }}
                className="flex-1 bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 py-2 font-bold text-xs uppercase"
              >
                SPECS & ANALYTICS
              </button>
              <button 
                onClick={() => { setSelectedCrop(crop); setCurrentView('retailer-offer'); }}
                className="flex-1 bg-[#064E3B] hover:bg-emerald-900 text-emerald-300 border border-emerald-700 py-2 font-bold text-xs uppercase"
              >
                MAKE OFFER
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
