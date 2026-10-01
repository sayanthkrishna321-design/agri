import React, { useState } from 'react';
import { 
  X, Eye, EyeOff, Sprout, ShoppingBag, ArrowRight, ShieldCheck, CheckCircle2 
} from 'lucide-react';
import { UserRole } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (role: UserRole) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'onboarding'>('login');
  const [selectedRole, setSelectedRole] = useState<UserRole>('farmer');
  const [showPassword, setShowPassword] = useState(false);

  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register State
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [stateName, setStateName] = useState('Punjab');
  const [districtName, setDistrictName] = useState('Ludhiana');

  // Onboarding State
  const [firstCrop, setFirstCrop] = useState('Sharbati Wheat');
  const [firstArea, setFirstArea] = useState('5.0');

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginSuccess(selectedRole);
    onClose();
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMode('onboarding');
  };

  const handleOnboardingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginSuccess(selectedRole);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-in">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
              AX
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {mode === 'login' ? 'Sign In to AgriSentinel X' : mode === 'register' ? 'Create Account' : 'Quick Onboarding Setup'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                AgriSentinel X + AgriLink AI Workspace
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Persona Switcher Selector */}
          {mode !== 'onboarding' && (
            <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded-xl grid grid-cols-2 gap-1 mb-2">
              <button
                type="button"
                onClick={() => setSelectedRole('farmer')}
                className={`py-2 px-3 font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  selectedRole === 'farmer' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500'
                }`}
              >
                <Sprout className="w-3.5 h-3.5" />
                <span>Farmer</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('retailer')}
                className={`py-2 px-3 font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  selectedRole === 'retailer' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Retailer</span>
              </button>
            </div>
          )}

          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Email or Username</label>
                <input
                  type="text"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder={selectedRole === 'farmer' ? 'ramesh.farmer@agrisentinel.in' : 'procurement@agrocorp.com'}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-slate-500 cursor-pointer">
                  <input type="checkbox" className="rounded text-emerald-600" defaultChecked />
                  <span>Remember me</span>
                </label>
                <a href="#" onClick={(e) => e.preventDefault()} className="text-emerald-600 font-semibold hover:underline">
                  Forgot Password?
                </a>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 mt-2"
              >
                Sign In as {selectedRole === 'farmer' ? 'Farmer' : 'Retailer'}
              </button>

              <div className="text-center pt-2">
                <span className="text-slate-500">Don't have an account? </span>
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-emerald-600 font-bold hover:underline"
                >
                  Register Now
                </button>
              </div>
            </form>
          )}

          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {selectedRole === 'farmer' ? 'Full Name *' : 'Business / Retailer Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={selectedRole === 'farmer' ? fullName : businessName}
                  onChange={(e) => selectedRole === 'farmer' ? setFullName(e.target.value) : setBusinessName(e.target.value)}
                  placeholder={selectedRole === 'farmer' ? 'Ramesh Sharma' : 'AgroCorp Global'}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">District *</label>
                  <input
                    type="text"
                    required
                    value={districtName}
                    onChange={(e) => setDistrictName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 mt-2"
              >
                Proceed to Onboarding Setup →
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-slate-500 hover:underline"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}

          {mode === 'onboarding' && (
            <form onSubmit={handleOnboardingSubmit} className="space-y-3">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold">
                ✓ Account Created! Set up your primary farm or procurement details.
              </div>

              {selectedRole === 'farmer' ? (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">First Active Crop</label>
                    <input
                      type="text"
                      value={firstCrop}
                      onChange={(e) => setFirstCrop(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Cultivated Area (Acres)</label>
                    <input
                      type="number"
                      value={firstArea}
                      onChange={(e) => setFirstArea(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Primary Crop Category Needed</label>
                  <input
                    type="text"
                    defaultValue="Wheat & Grains"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 mt-2"
              >
                Complete Onboarding & Enter Workspace
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
