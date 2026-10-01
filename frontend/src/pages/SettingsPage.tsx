import React, { useState } from 'react';
import { 
  Settings, User, Sprout, ShoppingBag, Lock, Shield, 
  Info, CheckCircle2, Globe, Bell
} from 'lucide-react';
import { UserRole } from '../types';

interface SettingsPageProps {
  role: UserRole;
  setRole: (role: UserRole) => void;
  onOpenAuthModal: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  role,
  setRole,
  onOpenAuthModal,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'farm' | 'business' | 'preferences' | 'security' | 'about'>('profile');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form Fields
  const [displayName, setDisplayName] = useState(role === 'farmer' ? 'Ramesh Sharma' : 'AgroCorp Retail');
  const [email, setEmail] = useState(role === 'farmer' ? 'ramesh.farmer@agrisentinel.in' : 'procurement@agrocorp.com');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [location, setLocation] = useState('Ludhiana, Punjab, IN');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-500/10 text-slate-700 dark:text-slate-400 text-xs font-bold mb-2">
            <Settings className="w-3.5 h-3.5" />
            <span>Platform Configuration</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
            Account & Application Settings
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure profile credentials, farm locations, procurement preferences, and security settings.
          </p>
        </div>
      </div>

      {/* 2. Settings Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-bold">
        {[
          { id: 'profile', label: 'User Profile', icon: User },
          { id: 'farm', label: 'Farm Details', icon: Sprout, roleAllowed: 'farmer' },
          { id: 'business', label: 'Business Details', icon: ShoppingBag, roleAllowed: 'retailer' },
          { id: 'preferences', label: 'Preferences', icon: Globe },
          { id: 'security', label: 'Security & Auth', icon: Lock },
          { id: 'about', label: 'About & Transparency', icon: Info },
        ].filter(t => !t.roleAllowed || t.roleAllowed === role).map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Tab Contents */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="space-y-4 max-w-xl text-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-slate-800">
              Personal Information
            </h3>

            {saveSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Profile details saved successfully!</span>
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-semibold focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-mono-tech focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Location / State</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>

            <div className="pt-3">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-600/20"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}

        {activeTab === 'farm' && (
          <div className="space-y-4 max-w-xl text-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-slate-800">
              Farm Location & Land Records
            </h3>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Farm Reference</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">Ludhiana Farm Sector 4</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Cultivated Area</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 font-mono-tech">5.0 Acres (2.02 Ha)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Coordinates</span>
                <span className="font-mono-tech text-slate-900 dark:text-slate-100">30.90°N, 75.85°E</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'business' && (
          <div className="space-y-4 max-w-xl text-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-slate-800">
              Retailer & Procurement Profile
            </h3>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Business Name</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">AgroCorp Global Processing</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Business Type</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">Grain Processor & Wholesaler</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-4 max-w-xl text-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-slate-800">
              Security Credentials & Authentication
            </h3>
            <button
              onClick={onOpenAuthModal}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold"
            >
              Sign Out & Switch Account
            </button>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="space-y-4 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-slate-800">
              About AgriSentinel X + AgriLink AI Platform
            </h3>
            <p>
              AgriSentinel X is an AI-assisted agricultural intelligence platform connecting Open-Meteo weather reanalysis data, Pradhan Mantri Fasal Bima Yojana (PMFBY) insurance rules, and AgriLink AI produce procurement marketplace.
            </p>
            <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 font-mono-tech text-[11px] space-y-1">
              <p>Platform Version: v2.4 (Ag-Grid Hackathon Edition)</p>
              <p>Backend Architecture: Django REST Framework + Open-Meteo + RAG Engine</p>
              <p>Database: MySQL / SQLite Core Schema</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
