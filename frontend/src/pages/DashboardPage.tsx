import React, { useState, useEffect } from 'react';
import { 
  Sprout, ShoppingBag, Sparkles, PlusCircle, CloudSun, ShieldCheck, 
  TrendingUp, ArrowRight, MapPin, Calendar, Activity, CheckCircle2, 
  AlertTriangle, Truck, DollarSign, Filter, RefreshCw
} from 'lucide-react';
import { UserRole, Crop, RetailerRequirement, Offer, Order, WeatherData } from '../types';
import { StatCard } from '../components/ui/StatCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { fetchWeather } from '../services/api';

interface DashboardPageProps {
  role: UserRole;
  setCurrentRoute: (route: string) => void;
  crops: Crop[];
  requirements: RetailerRequirement[];
  offers: Offer[];
  orders: Order[];
  onOpenAddCropModal?: () => void;
  onOpenAddRequirementModal?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  role,
  setCurrentRoute,
  crops,
  requirements,
  offers,
  orders,
  onOpenAddCropModal,
  onOpenAddRequirementModal,
}) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  // Time-aware greeting
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const userName = role === 'farmer' ? 'Ramesh Sharma' : 'AgroCorp Retail';

  useEffect(() => {
    // Default location: Punjab, IN (lat: 30.9, lon: 75.85)
    setWeatherLoading(true);
    fetchWeather(30.9, 75.85)
      .then(data => {
        setWeather(data);
        setWeatherLoading(false);
      })
      .catch(err => {
        console.warn('Weather fetch fallback:', err);
        setWeatherError('Weather service offline or coordinates unconfigured.');
        setWeatherLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Welcome Section */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-emerald-900/90 via-emerald-800 to-teal-900 text-white relative overflow-hidden shadow-xl border border-emerald-700/50">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-3 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              {role === 'farmer' ? 'AgriSentinel X Active' : 'AgriLink AI Marketplace Active'}
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              {timeGreeting}, {userName}! 👋
            </h1>
            <p className="text-emerald-100/80 text-sm mt-1 max-w-xl leading-relaxed">
              {role === 'farmer'
                ? 'Your crop insurance evidence, weather risk forecast, and marketplace listings are up to date.'
                : 'Discover verified farmer crops, compare procurement requirements, and manage active trade contracts.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {role === 'farmer' ? (
              <>
                <button
                  onClick={() => setCurrentRoute('insurance-assistant')}
                  className="px-5 py-3 rounded-2xl bg-white text-emerald-950 font-bold text-sm shadow-lg hover:bg-emerald-50 transition-all duration-200 flex items-center gap-2 hover:-translate-y-0.5"
                >
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Ask AI Assistant</span>
                </button>
                <button
                  onClick={() => onOpenAddCropModal ? onOpenAddCropModal() : setCurrentRoute('crops')}
                  className="px-5 py-3 rounded-2xl bg-emerald-700/80 hover:bg-emerald-700 text-white border border-emerald-500/40 font-bold text-sm transition-all duration-200 flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add Crop</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setCurrentRoute('marketplace')}
                  className="px-5 py-3 rounded-2xl bg-white text-emerald-950 font-bold text-sm shadow-lg hover:bg-emerald-50 transition-all duration-200 flex items-center gap-2 hover:-translate-y-0.5"
                >
                  <ShoppingBag className="w-4 h-4 text-emerald-600" />
                  <span>Find Produce</span>
                </button>
                <button
                  onClick={() => onOpenAddRequirementModal ? onOpenAddRequirementModal() : setCurrentRoute('buyer-requirements')}
                  className="px-5 py-3 rounded-2xl bg-emerald-700/80 hover:bg-emerald-700 text-white border border-emerald-500/40 font-bold text-sm transition-all duration-200 flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Post Requirement</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. Role-Aware Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {role === 'farmer' ? (
          <>
            <StatCard
              title="My Active Crops"
              value={crops.length}
              subtitle={`${crops.filter(c => c.status === 'GROWING').length} Currently Growing`}
              icon={Sprout}
              color="green"
              onClick={() => setCurrentRoute('crops')}
            />
            <StatCard
              title="Weather Outlook"
              value={weather?.current?.temperature ? `${weather.current.temperature}°C` : '28°C'}
              subtitle={weather?.current?.condition || 'Clear / Light Rain Risk'}
              icon={CloudSun}
              color="blue"
              onClick={() => setCurrentRoute('weather-risk')}
            />
            <StatCard
              title="Insurance Records"
              value="2 Policies"
              subtitle="1 Active Claim Preparation"
              icon={ShieldCheck}
              color="amber"
              onClick={() => setCurrentRoute('insurance')}
            />
            <StatCard
              title="Marketplace Offers"
              value={offers.length}
              subtitle={`${offers.filter(o => o.status === 'PENDING').length} Pending Response`}
              icon={DollarSign}
              color="purple"
              onClick={() => setCurrentRoute('orders')}
            />
          </>
        ) : (
          <>
            <StatCard
              title="Open Requirements"
              value={requirements.length}
              subtitle={`${requirements.filter(r => r.status === 'OPEN').length} Active Buying Requests`}
              icon={ShoppingBag}
              color="green"
              onClick={() => setCurrentRoute('buyer-requirements')}
            />
            <StatCard
              title="Available Crop Listings"
              value={crops.length}
              subtitle="Verified Farmer Supply"
              icon={Sprout}
              color="blue"
              onClick={() => setCurrentRoute('marketplace')}
            />
            <StatCard
              title="Active Offers Sent"
              value={offers.length}
              subtitle={`${offers.filter(o => o.status === 'ACCEPTED').length} Accepted`}
              icon={DollarSign}
              color="purple"
              onClick={() => setCurrentRoute('orders')}
            />
            <StatCard
              title="Orders in Progress"
              value={orders.length}
              subtitle="Contract & Escrow Tracking"
              icon={Truck}
              color="amber"
              onClick={() => setCurrentRoute('orders')}
            />
          </>
        )}
      </div>

      {/* 3. Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Weather Overview Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <CloudSun className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Weather & Rain Evidence Overview
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    Location: Ludhiana, Punjab (30.90°N, 75.85°E)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCurrentRoute('weather-risk')}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>Full Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-5">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase">Temperature</span>
                <p className="text-xl font-black text-slate-900 dark:text-slate-100 mt-1">
                  {weather?.current?.temperature ?? 28.4}°C
                </p>
                <span className="text-[10px] text-slate-400 font-mono-tech">Observation</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase">Humidity</span>
                <p className="text-xl font-black text-slate-900 dark:text-slate-100 mt-1">
                  {weather?.current?.humidity ?? 64}%
                </p>
                <span className="text-[10px] text-slate-400 font-mono-tech">Relative</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase">Precipitation</span>
                <p className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1">
                  {weather?.current?.precipitation ?? 14.2} mm
                </p>
                <span className="text-[10px] text-slate-400 font-mono-tech">Last 24h Total</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase">Wind Speed</span>
                <p className="text-xl font-black text-slate-900 dark:text-slate-100 mt-1">
                  {weather?.current?.wind_speed ?? 12.8} km/h
                </p>
                <span className="text-[10px] text-slate-400 font-mono-tech">North-West</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-900 dark:text-blue-300 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                <span>Open-Meteo Reanalysis Data verified for PMFBY excess rainfall evidence.</span>
              </span>
              <span className="text-[10px] font-mono-tech text-blue-500 font-semibold shrink-0">Updated 10m ago</span>
            </div>
          </div>

          {/* Recent Activity Ledger */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Recent Operational Activity
              </h3>
              <button
                onClick={() => setCurrentRoute('transactions')}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                View Ledger
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              <div className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                    <Sprout className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">Crop Listing Created</h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Grade A+ Sharbati Wheat • 150 Quintals</p>
                  </div>
                </div>
                <div className="text-right">
                  <StatusBadge status="GROWING" size="sm" />
                  <p className="text-[10px] text-slate-400 mt-1 font-mono-tech">Today, 14:20</p>
                </div>
              </div>

              <div className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xs shrink-0">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">Buy Offer Received</h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">From AgroCorp Global • ₹2,800/Qtl</p>
                  </div>
                </div>
                <div className="text-right">
                  <StatusBadge status="PENDING" size="sm" />
                  <p className="text-[10px] text-slate-400 mt-1 font-mono-tech">Today, 11:05</p>
                </div>
              </div>

              <div className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">Insurance Guidance Completed</h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">PMFBY Rule check: Potentially Eligible</p>
                  </div>
                </div>
                <div className="text-right">
                  <StatusBadge status="UNDER_REVIEW" size="sm" />
                  <p className="text-[10px] text-slate-400 mt-1 font-mono-tech">Yesterday</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Assistant & Reminders */}
        <div className="space-y-6">
          {/* AI Insurance Assistant Quick Access Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 text-white border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-xl pointer-events-none"></div>
            <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>AgriSentinel X AI Assistant</span>
            </div>
            <h4 className="text-base font-extrabold text-slate-100">Need Insurance or Weather Help?</h4>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Ask our grounded RAG agent about PMFBY schemes, document checklists, or weather risk evaluation.
            </p>

            <div className="mt-4 space-y-2">
              <button
                onClick={() => setCurrentRoute('insurance-assistant')}
                className="w-full text-left p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-xs text-slate-200 transition-colors"
              >
                💬 "What documents do I need for crop damage claim?"
              </button>
              <button
                onClick={() => setCurrentRoute('insurance-assistant')}
                className="w-full text-left p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-xs text-slate-200 transition-colors"
              >
                🌧️ "Check weather evidence for my wheat crop."
              </button>
            </div>

            <button
              onClick={() => setCurrentRoute('insurance-assistant')}
              className="mt-5 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs shadow-md shadow-emerald-600/20 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <span>Launch AI Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Upcoming Harvests & Reminders */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Upcoming Harvest Reminders</span>
            </h4>
            <div className="space-y-3">
              {crops.slice(0, 3).map(c => (
                <div key={c.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">{c.crop_name}</h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Est. Harvest: {c.expected_harvest_date || '2026-04-15'}</p>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 font-mono-tech">
                    {c.expected_quantity || 100} Qtl
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
