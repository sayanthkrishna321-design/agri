import React, { useState } from 'react';
import { 
  Sprout, Plus, Search, Filter, Calendar, MapPin, Layers, 
  TrendingUp, ArrowUpRight, Sparkles, ShoppingBag, Eye, Edit3, Trash2
} from 'lucide-react';
import { Crop } from '../types';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Modal } from '../components/ui/Modal';
import { createCrop } from '../services/api';

interface CropsPageProps {
  crops: Crop[];
  setCrops: React.Dispatch<React.SetStateAction<Crop[]>>;
  setCurrentRoute: (route: string) => void;
  onOpenAddCropModal?: () => void;
}

export const CropsPage: React.FC<CropsPageProps> = ({
  crops,
  setCrops,
  setCurrentRoute,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [cropName, setCropName] = useState('');
  const [variety, setVariety] = useState('');
  const [location, setLocation] = useState('Ludhiana, Punjab');
  const [season, setSeason] = useState('Rabi 2026');
  const [plantingDate, setPlantingDate] = useState('2025-11-15');
  const [expectedHarvestDate, setExpectedHarvestDate] = useState('2026-04-10');
  const [area, setArea] = useState('5.0');
  const [unit, setUnit] = useState('Acres');
  const [expectedQuantity, setExpectedQuantity] = useState('120');
  const [submitting, setSubmitting] = useState(false);

  const filteredCrops = crops.filter(c => {
    const matchesSearch = c.crop_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (c.variety || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (c.farm_location || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddCropSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cropName.trim()) return;

    setSubmitting(true);
    const newCropData: Partial<Crop> = {
      farm: 1,
      farm_location: location,
      crop_name: cropName,
      variety: variety,
      planting_date: plantingDate,
      expected_harvest_date: expectedHarvestDate,
      expected_quantity: parseFloat(expectedQuantity) || 100,
      unit: unit,
      status: 'GROWING',
      quality_grade: 'A+',
      ai_quality_score: 95,
      description: `${cropName} planted on ${plantingDate} in ${location}.`,
    };

    try {
      const saved = await createCrop(newCropData);
      setCrops(prev => [saved, ...prev]);
    } catch (err) {
      console.warn('Backend sync failed, adding locally:', err);
      const localCrop: Crop = {
        id: Date.now(),
        farm: 1,
        farm_location: location,
        crop_name: cropName,
        variety: variety,
        planting_date: plantingDate,
        expected_harvest_date: expectedHarvestDate,
        expected_quantity: parseFloat(expectedQuantity) || 100,
        unit: unit,
        status: 'GROWING',
        quality_grade: 'A+',
        ai_quality_score: 95,
      };
      setCrops(prev => [localCrop, ...prev]);
    } finally {
      setSubmitting(false);
      setShowAddModal(false);
      setCropName('');
      setVariety('');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Header & Actions */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold mb-2">
            <Sprout className="w-3.5 h-3.5" />
            <span>Farm Records & Growing Seasons</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
            My Crops Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track cultivated crops, planting dates, yield estimates, and insurance readiness.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all duration-200 flex items-center justify-center gap-2 shrink-0 hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Crop Record</span>
        </button>
      </div>

      {/* 2. Crop Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs font-medium text-slate-500 uppercase">Active Crop Records</span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">{crops.length}</p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">100% verified</span>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs font-medium text-slate-500 uppercase">Currently Growing</span>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {crops.filter(c => c.status === 'GROWING').length}
          </p>
          <span className="text-[11px] text-slate-400">Rabi & Kharif cycles</span>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs font-medium text-slate-500 uppercase">Est. Total Harvest</span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
            {crops.reduce((acc, c) => acc + (c.expected_quantity || 0), 0)} Qtl
          </p>
          <span className="text-[11px] text-slate-400">Across all farms</span>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs font-medium text-slate-500 uppercase">Insurance Coverage</span>
          <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">PMFBY Active</p>
          <span className="text-[11px] text-slate-400">Rainfall evidence ready</span>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search crop name, variety, or location..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-semibold focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="GROWING">Growing</option>
            <option value="HARVESTED">Harvested</option>
            <option value="DAMAGED">Damaged</option>
          </select>
        </div>
      </div>

      {/* 4. Crops Table / Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 font-bold uppercase text-slate-500 tracking-wider">
              <tr>
                <th className="p-4">Crop & Variety</th>
                <th className="p-4">Location / Farm</th>
                <th className="p-4">Planting Date</th>
                <th className="p-4">Est. Harvest Date</th>
                <th className="p-4">Quantity / Area</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCrops.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 font-bold text-slate-900 dark:text-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-black">
                        {c.crop_name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-100">{c.crop_name}</p>
                        {c.variety && <p className="text-[11px] text-slate-400 font-normal">{c.variety}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {c.farm_location || 'Ludhiana, Punjab'}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-300 font-mono-tech">
                    {c.planting_date || '2025-11-15'}
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-300 font-mono-tech">
                    {c.expected_harvest_date || '2026-04-10'}
                  </td>
                  <td className="p-4 font-bold text-slate-900 dark:text-slate-100 font-mono-tech">
                    {c.expected_quantity || 100} Qtl
                  </td>
                  <td className="p-4">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => setSelectedCrop(c)}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCurrentRoute('insurance-assistant')}
                      className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors"
                      title="Ask AI Insurance Assistant"
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCurrentRoute('marketplace')}
                      className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-colors"
                      title="Create Marketplace Listing"
                    >
                      <ShoppingBag className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Add Crop Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Crop Record"
        subtitle="Register crop details to enable weather tracking and insurance risk checking."
      >
        <form onSubmit={handleAddCropSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Crop Name *</label>
            <input
              type="text"
              required
              value={cropName}
              onChange={(e) => setCropName(e.target.value)}
              placeholder="e.g. Sharbati Wheat, Yellow Corn, Basmati Rice"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Variety (Optional)</label>
              <input
                type="text"
                value={variety}
                onChange={(e) => setVariety(e.target.value)}
                placeholder="e.g. HD-2967 / Organic Hybrid"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Farm / Location *</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Planting Date</label>
              <input
                type="date"
                value={plantingDate}
                onChange={(e) => setPlantingDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Expected Harvest Date</label>
              <input
                type="date"
                value={expectedHarvestDate}
                onChange={(e) => setExpectedHarvestDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Cultivated Area</label>
              <input
                type="number"
                step="0.1"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Expected Quantity (Quintals)</label>
              <input
                type="number"
                value={expectedQuantity}
                onChange={(e) => setExpectedQuantity(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-600/20"
            >
              {submitting ? 'Saving...' : 'Save Crop Record'}
            </button>
          </div>
        </form>
      </Modal>

      {/* 6. View Crop Detail Modal */}
      {selectedCrop && (
        <Modal
          isOpen={Boolean(selectedCrop)}
          onClose={() => setSelectedCrop(null)}
          title={`${selectedCrop.crop_name} ${selectedCrop.variety ? `(${selectedCrop.variety})` : ''}`}
          subtitle={`Farm Location: ${selectedCrop.farm_location || 'Ludhiana, Punjab'}`}
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
              <div>
                <span className="text-slate-500 font-medium">Status</span>
                <div className="mt-1"><StatusBadge status={selectedCrop.status} /></div>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Expected Yield</span>
                <p className="font-bold text-slate-900 dark:text-slate-100 mt-1 font-mono-tech">
                  {selectedCrop.expected_quantity || 100} Quintals
                </p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Planting Date</span>
                <p className="font-bold text-slate-900 dark:text-slate-100 mt-1 font-mono-tech">
                  {selectedCrop.planting_date || '2025-11-15'}
                </p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Est. Harvest Date</span>
                <p className="font-bold text-slate-900 dark:text-slate-100 mt-1 font-mono-tech">
                  {selectedCrop.expected_harvest_date || '2026-04-10'}
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => {
                  setSelectedCrop(null);
                  setCurrentRoute('insurance-assistant');
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-center shadow-sm"
              >
                Ask AI Assistant About This Crop
              </button>
              <button
                onClick={() => {
                  setSelectedCrop(null);
                  setCurrentRoute('marketplace');
                }}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-center"
              >
                List on AgriLink Marketplace
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
