import React, { useState, useEffect, useRef } from 'react';
import { 
  Sprout, ShoppingBag, ShieldCheck, MessageSquare, PlusCircle, 
  TrendingUp, Layers, CheckCircle2, AlertTriangle, ArrowUpRight, 
  Search, Filter, Send, ChevronRight, UserCheck, MapPin, FileText, 
  DollarSign, RefreshCw, BarChart2, Shield, Truck, Package, Clock, 
  Sliders, ArrowRight, CornerDownRight, Zap, Eye, Check, X,
  Maximize2, Activity, Database, Lock, Calendar, CornerRightUp, Menu
} from 'lucide-react';

// Mock Data for Marketplace
const INITIAL_CROPS = [
  {
    id: 'crop-101',
    title: 'Grade A+ Sharbati Wheat',
    seller: 'Kisan Organics Co-op',
    sellerType: 'Verified Farmer',
    location: 'Punjab, IN',
    pricePerQuintal: 2850,
    quantity: 150,
    unit: 'Quintals',
    moisture: '11.2%',
    grainSize: '3.4mm',
    aiQualityScore: 98,
    grade: 'A+',
    harvestDate: '2026-03-12',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=600',
    description: 'Ultra-premium Sharbati wheat grown with zero chemical pesticides. Exceptionally high protein content and low moisture ideal for bulk milling.'
  },
  {
    id: 'crop-102',
    title: 'Organic Hybrid Yellow Corn',
    seller: 'GreenValley Bio-Farms',
    sellerType: 'Certified Organic',
    location: 'Karnataka, IN',
    pricePerQuintal: 1980,
    quantity: 400,
    unit: 'Quintals',
    moisture: '12.8%',
    grainSize: '8.1mm',
    aiQualityScore: 92,
    grade: 'A',
    harvestDate: '2026-03-01',
    image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80&w=600',
    description: 'High-starch yellow corn suitable for industrial feed or ethanol production. Lab tested for aflatoxin compliance.'
  },
  {
    id: 'crop-103',
    title: 'Aromatic Basmati Rice 1121',
    seller: 'Satnam Agri Estates',
    sellerType: 'Verified Farmer',
    location: 'Haryana, IN',
    pricePerQuintal: 4400,
    quantity: 80,
    unit: 'Quintals',
    moisture: '10.5%',
    grainSize: '8.35mm',
    aiQualityScore: 96,
    grade: 'A+',
    harvestDate: '2026-02-28',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=600',
    description: 'Aged extra-long grain basmati with rich aroma and minimal head rice breakage during milling.'
  },
  {
    id: 'crop-104',
    title: 'High-Oleic Soybeans',
    seller: 'Malwa Agro Producers',
    sellerType: 'Verified Farmer',
    location: 'Madhya Pradesh, IN',
    pricePerQuintal: 3600,
    quantity: 220,
    unit: 'Quintals',
    moisture: '9.8%',
    grainSize: '6.0mm',
    aiQualityScore: 89,
    grade: 'A',
    harvestDate: '2026-03-10',
    image: 'https://images.unsplash.com/photo-1599599810694-b5b37304c03d?auto=format&fit=crop&q=80&w=600',
    description: 'Non-GMO soybeans optimized for oil extraction. High protein content verified via spectral scanning.'
  }
];

const INITIAL_OFFERS = [
  {
    id: 'OFF-901',
    cropTitle: 'Grade A+ Sharbati Wheat',
    cropId: 'crop-101',
    buyerName: 'AgroCorp Global Processing',
    buyerRating: '4.9 ★',
    offeredPrice: 2800,
    listedPrice: 2850,
    quantity: 100,
    totalValue: 280000,
    deliveryDate: '2026-04-15',
    escrowStatus: 'Funds Locked in Escrow',
    status: 'Pending',
    date: '10 mins ago'
  },
  {
    id: 'OFF-902',
    cropTitle: 'Organic Hybrid Yellow Corn',
    cropId: 'crop-102',
    buyerName: 'Sunshine Feed Mills',
    buyerRating: '4.7 ★',
    offeredPrice: 1950,
    listedPrice: 1980,
    quantity: 250,
    totalValue: 487500,
    deliveryDate: '2026-04-10',
    escrowStatus: 'Verified Liquid Balance',
    status: 'Accepted',
    date: '2 hours ago'
  }
];

const INITIAL_ORDERS = [
  {
    id: 'ORD-8821',
    cropTitle: 'Organic Hybrid Yellow Corn',
    seller: 'GreenValley Bio-Farms',
    buyer: 'Sunshine Feed Mills',
    quantity: '250 Quintals',
    totalPrice: '₹4,87,500',
    status: 'In Transit',
    currentMilestone: 2,
    milestones: [
      { title: 'Contract Locked & Escrow Funded', date: 'Mar 28, 2026', done: true },
      { title: 'Quality Verification at Gate', date: 'Mar 29, 2026', done: true },
      { title: 'Dispatched & Live GPS Tracking', date: 'Mar 30, 2026', done: true },
      { title: 'Hub Inspection & Delivery', date: 'Expected Apr 02', done: false },
      { title: 'Escrow Auto-Settlement', date: 'Pending Unloading', done: false }
    ],
    driver: 'Rajesh Sharma (Truck KA-04-E-8820)',
    tempHumidity: '24°C / 42% RH (Sensor OK)',
    contractHash: '0x8f3c...b291a4e1',
    location: 'Nagpur Transit Hub'
  }
];

export default function App() {
  const [role, setRole] = useState('farmer'); // 'farmer' | 'retailer'
  const [currentView, setCurrentView] = useState('farmer-dash'); // 10 views switcher
  const [crops, setCrops] = useState(INITIAL_CROPS);
  const [offers, setOffers] = useState(INITIAL_OFFERS);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  
  // Selection states for details & transactions
  const [selectedCrop, setSelectedCrop] = useState(INITIAL_CROPS[0]);
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState(INITIAL_ORDERS[0]);

  // Handle role switching defaults
  const handleRoleSwitch = (newRole) => {
    setRole(newRole);
    if (newRole === 'farmer') {
      setCurrentView('farmer-dash');
    } else {
      setCurrentView('retailer-dash');
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F5F6] text-[#0F172A] font-sans antialiased selection:bg-[#064E3B] selection:text-white flex flex-col md:flex-row">
      
      {/* Sidebar Navigation - Sharp Minimal Geometric */}
      <Sidebar 
        role={role} 
        setRole={handleRoleSwitch} 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto min-h-screen">
        {/* Top Minimal Utility Bar */}
        <TopNav role={role} setRole={handleRoleSwitch} currentView={currentView} setCurrentView={setCurrentView} />

        {/* Dynamic View Router */}
        <main className="p-4 md:p-8 max-w-7xl w-full mx-auto flex-1">
          {currentView === 'login' && <LoginView setRole={handleRoleSwitch} setCurrentView={setCurrentView} />}
          {currentView === 'farmer-dash' && <FarmerDashboard setCurrentView={setCurrentView} setSelectedCrop={setSelectedCrop} crops={crops} offers={offers} />}
          {currentView === 'retailer-dash' && <RetailerDashboard setCurrentView={setCurrentView} crops={crops} setSelectedCrop={setSelectedCrop} />}
          {currentView === 'chat' && <InsuranceAIChatView />}
          {currentView === 'marketplace' && <MarketplaceView crops={crops} setSelectedCrop={setSelectedCrop} setCurrentView={setCurrentView} />}
          {currentView === 'crop-details' && <CropDetailsView crop={selectedCrop} setCurrentView={setCurrentView} setOfferModalOpen={setOfferModalOpen} />}
          {currentView === 'add-listing' && <AddCropListingView setCrops={setCrops} setCurrentView={setCurrentView} />}
          {currentView === 'retailer-offer' && <RetailerOfferView crop={selectedCrop} setOffers={setOffers} setCurrentView={setCurrentView} />}
          {currentView === 'farmer-offers' && <FarmerOffersView offers={offers} setOffers={setOffers} setCurrentView={setCurrentView} setActiveOrder={setActiveOrder} />}
          {currentView === 'order-tracking' && <OrderTrackingView order={activeOrder} />}
        </main>

        {/* Ultra minimal sharp footer */}
        <footer className="border-t border-slate-300 bg-white p-4 text-xs font-mono text-slate-500 flex flex-col md:flex-row justify-between items-center gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-emerald-600 inline-block"></span>
            <span className="font-bold text-slate-900 tracking-wider">AGRISENTINEL X</span>
            <span>— GEOMETRIC QUANTIFIED AGRICULTURE PROTOCOL v2.4</span>
          </div>
          <div>SYSTEM STATUS: ALL SENSORS & ESCROW CONTRACTS OPERATIONAL</div>
        </footer>
      </div>
    </div>
  );
}

function Sidebar({ role, setRole, currentView, setCurrentView }) {
  const navItems = [
    {
      roleRequired: 'farmer',
      id: 'farmer-dash',
      label: 'FARM OVERVIEW',
      icon: LayoutGridIcon,
      code: 'F01'
    },
    {
      roleRequired: 'retailer',
      id: 'retailer-dash',
      label: 'MARKET OVERVIEW',
      icon: BarChart2,
      code: 'R01'
    },
    {
      id: 'marketplace',
      label: 'CROP MARKETPLACE',
      icon: ShoppingBag,
      code: 'M01'
    },
    {
      id: 'chat',
      label: 'INSURANCE AI CHAT',
      icon: MessageSquare,
      code: 'AI0'
    },
    {
      roleRequired: 'farmer',
      id: 'add-listing',
      label: 'ADD NEW LISTING',
      icon: PlusCircle,
      code: 'F02'
    },
    {
      roleRequired: 'farmer',
      id: 'farmer-offers',
      label: 'RECEIVED OFFERS',
      icon: DollarSign,
      code: 'F03'
    },
    {
      id: 'order-tracking',
      label: 'ORDER & ESCROW LOGS',
      icon: Truck,
      code: 'T01'
    }
  ];

  const filteredItems = navItems.filter(item => !item.roleRequired || item.roleRequired === role);

  return (
    <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-300 flex flex-col justify-between shrink-0">
      <div>
        {/* Brand Header - Sharp Square Theme */}
        <div className="p-5 border-b border-slate-300 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-emerald-500 border border-emerald-300 flex items-center justify-center font-bold text-slate-950 font-mono text-sm">
              AX
            </div>
            <div>
              <h1 className="font-bold tracking-tight text-sm uppercase">AgriSentinel X</h1>
              <p className="text-[10px] text-emerald-400 font-mono tracking-widest uppercase">Autonomous Ag-Grid</p>
            </div>
          </div>
        </div>

        {/* Role Toggle Switcher Square Block */}
        <div className="p-4 border-b border-slate-300 bg-slate-50">
          <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-2">OPERATIONAL ROLE</div>
          <div className="grid grid-cols-2 gap-1 bg-slate-200 p-1 border border-slate-300">
            <button
              onClick={() => setRole('farmer')}
              className={`py-1.5 px-2 text-xs font-mono font-bold uppercase transition-all ${
                role === 'farmer' 
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-700 shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-300'
              }`}
            >
              FARMER
            </button>
            <button
              onClick={() => setRole('retailer')}
              className={`py-1.5 px-2 text-xs font-mono font-bold uppercase transition-all ${
                role === 'retailer' 
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-700 shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-300'
              }`}
            >
              RETAILER
            </button>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center justify-between p-3 border text-left transition-all font-mono text-xs ${
                  isActive
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm font-bold'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <span className="uppercase tracking-tight">{item.label}</span>
                </div>
                <span className={`text-[10px] ${isActive ? 'text-emerald-400' : 'text-slate-400'}`}>
                  [{item.code}]
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Info Square Box */}
      <div className="p-4 border-t border-slate-300 bg-slate-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-slate-800 text-slate-100 flex items-center justify-center font-mono text-xs font-bold border border-slate-600">
              {role === 'farmer' ? 'FM' : 'RT'}
            </div>
            <div>
              <p className="text-xs font-bold font-mono text-slate-900">
                {role === 'farmer' ? 'Kisan Co-op #04' : 'Apex Sourcing Ltd.'}
              </p>
              <p className="text-[10px] font-mono text-emerald-700 font-semibold">
                ● VERIFIED ESCROW
              </p>
            </div>
          </div>
          <button 
            onClick={() => setCurrentView('login')} 
            className="p-1.5 border border-slate-300 bg-white hover:bg-slate-100 text-slate-600"
            title="Switch User/Login"
          >
            <UserCheck className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}

// Simple Layout Icon helper
function LayoutGridIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
    </svg>
  );
}

function TopNav({ role, setRole, currentView, setCurrentView }) {
  const getViewTitle = () => {
    switch (currentView) {
      case 'farmer-dash': return 'FARM OVERVIEW & MONITORS';
      case 'retailer-dash': return 'RETAILER MARKET TERMINAL';
      case 'chat': return 'AI RISK & INSURANCE COPILOT';
      case 'marketplace': return 'SPOT CROP MARKETPLACE';
      case 'crop-details': return 'CROP ANALYSIS & SPECIFICATIONS';
      case 'add-listing': return 'CREATE CROP LISTING (AI VALIDATED)';
      case 'retailer-offer': return 'SUBMIT ESCROW PURCHASE OFFER';
      case 'farmer-offers': return 'INBOUND ESCROW OFFERS';
      case 'order-tracking': return 'TRACKING & SMART CONTRACT ESCROW';
      default: return 'AGRISENTINEL X';
    }
  };

  return (
    <header className="bg-white border-b border-slate-300 p-4 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-20">
      <div className="flex items-center space-x-3">
        <div className="w-2.5 h-2.5 bg-emerald-600"></div>
        <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-900">
          {getViewTitle()}
        </h2>
      </div>

      <div className="flex items-center space-x-3 text-xs font-mono">
        <div className="hidden lg:flex items-center space-x-2 border border-slate-300 bg-slate-50 px-3 py-1">
          <span className="text-slate-500">MKT INDEX:</span>
          <span className="font-bold text-slate-900">₹2,840/Q</span>
          <span className="text-emerald-700 font-bold">+1.8%</span>
        </div>

        <div className="border border-slate-300 bg-slate-50 px-3 py-1 flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-bold uppercase text-slate-800">NODE: ACTIVE</span>
        </div>

        <button 
          onClick={() => setCurrentView('chat')}
          className="bg-emerald-950 text-emerald-400 border border-emerald-700 px-3 py-1 font-bold uppercase hover:bg-emerald-900 flex items-center space-x-1"
        >
          <Zap className="w-3 h-3 text-emerald-400" />
          <span>AI ASSIST</span>
        </button>
      </div>
    </header>
  );
}

function LoginView({ setRole, setCurrentView }) {
  return (
    <div className="max-w-xl mx-auto my-12 bg-white border border-slate-300 p-8 shadow-sm">
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-slate-900 text-emerald-400 font-mono text-xl font-bold border border-slate-700 flex items-center justify-center mx-auto mb-3">
          AX
        </div>
        <h1 className="text-2xl font-bold font-mono tracking-tight text-slate-900 uppercase">AGRISENTINEL X</h1>
        <p className="text-xs font-mono text-slate-500 mt-1 uppercase">Select operational persona to enter dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div 
          onClick={() => { setRole('farmer'); setCurrentView('farmer-dash'); }}
          className="border-2 border-slate-300 hover:border-emerald-700 p-6 bg-slate-50 hover:bg-emerald-50/20 cursor-pointer transition-all group flex flex-col justify-between h-48"
        >
          <div>
            <div className="w-8 h-8 bg-emerald-900 text-emerald-300 border border-emerald-700 flex items-center justify-center font-mono font-bold text-xs mb-3">
              F1
            </div>
            <h3 className="font-mono font-bold text-slate-900 uppercase text-sm group-hover:text-emerald-800">Farmer Console</h3>
            <p className="text-xs text-slate-500 mt-2 font-mono">
              Monitor field health, list AI-graded crops, track smart yield forecasts, manage incoming buyer offers.
            </p>
          </div>
          <div className="text-xs font-mono font-bold text-emerald-800 flex items-center space-x-1">
            <span>ENTER AS FARMER</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <div 
          onClick={() => { setRole('retailer'); setCurrentView('retailer-dash'); }}
          className="border-2 border-slate-300 hover:border-slate-900 p-6 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-all group flex flex-col justify-between h-48"
        >
          <div>
            <div className="w-8 h-8 bg-slate-900 text-white border border-slate-700 flex items-center justify-center font-mono font-bold text-xs mb-3">
              R1
            </div>
            <h3 className="font-mono font-bold text-slate-900 uppercase text-sm group-hover:text-slate-900">Retailer Terminal</h3>
            <p className="text-xs text-slate-500 mt-2 font-mono">
              Inspect grain quality matrices, place verified escrow offers, analyze market trends & AI demand.
            </p>
          </div>
          <div className="text-xs font-mono font-bold text-slate-900 flex items-center space-x-1">
            <span>ENTER AS RETAILER</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      <div className="p-4 border border-slate-200 bg-slate-100 text-center font-mono text-xs text-slate-600">
        AUTHENTICATION STATUS: DEV AUTOLOGIN GRANTED
      </div>
    </div>
  );
}

function FarmerDashboard({ setCurrentView, setSelectedCrop, crops, offers }) {
  return (
    <div className="space-y-6">
      {/* Top Banner Alert - Square Geometric Minimalist */}
      <div className="border border-emerald-800 bg-emerald-950 text-emerald-100 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-emerald-900 border border-emerald-700 text-emerald-400 shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-bold text-emerald-400 uppercase">AI ADVISORY ALERT</span>
              <span className="text-[10px] font-mono bg-emerald-800 text-white px-1.5 py-0.5">HIGH PRECISION</span>
            </div>
            <p className="text-xs font-mono mt-1 text-slate-200">
              Optimal moisture window detected for Field Segment #3. Rain expected in 48h. Recommended irrigation reduction by 20%.
            </p>
          </div>
        </div>
        <button 
          onClick={() => setCurrentView('chat')}
          className="shrink-0 bg-emerald-500 hover:bg-emerald-400 text-slate-950 border border-emerald-300 font-mono text-xs font-bold px-4 py-2 uppercase tracking-tight"
        >
          Consult AI Copilot
        </button>
      </div>

      {/* 4 Square Core Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1 */}
        <div className="border border-slate-300 bg-white p-5 aspect-square flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-mono text-slate-500 font-bold uppercase tracking-wider">CROP HEALTH</span>
            <span className="w-2 h-2 bg-emerald-500"></span>
          </div>
          <div>
            <div className="text-3xl font-mono font-bold text-slate-900 tracking-tight">OPTIMAL</div>
            <div className="text-xs font-mono text-emerald-700 font-bold mt-1">94/100 NDVI SCORE</div>
          </div>
          <div className="text-[10px] font-mono text-slate-500 border-t border-slate-200 pt-2">
            Updated 14 mins ago via Sentinel-2
          </div>
        </div>

        {/* Metric 2 */}
        <div className="border border-slate-300 bg-white p-5 aspect-square flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-mono text-slate-500 font-bold uppercase tracking-wider">SOIL MOISTURE</span>
            <span className="w-2 h-2 bg-blue-500"></span>
          </div>
          <div>
            <div className="text-3xl font-mono font-bold text-slate-900 tracking-tight">34%</div>
            <div className="text-xs font-mono text-slate-600 font-bold mt-1">TARGET: 30-38% RANGE</div>
          </div>
          <div className="text-[10px] font-mono text-slate-500 border-t border-slate-200 pt-2">
            Sensor Node #402 — Normal Depth
          </div>
        </div>

        {/* Metric 3 */}
        <div className="border border-slate-300 bg-white p-5 aspect-square flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-mono text-slate-500 font-bold uppercase tracking-wider">YIELD FORECAST</span>
            <span className="w-2 h-2 bg-emerald-500"></span>
          </div>
          <div>
            <div className="text-3xl font-mono font-bold text-slate-900 tracking-tight">+15%</div>
            <div className="text-xs font-mono text-emerald-700 font-bold mt-1">420 QUINTALS EST.</div>
          </div>
          <div className="text-[10px] font-mono text-slate-500 border-t border-slate-200 pt-2">
            Confidence Interval: 96.2%
          </div>
        </div>

        {/* Metric 4 */}
        <div className="border border-slate-300 bg-white p-5 aspect-square flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs font-mono text-slate-500 font-bold uppercase tracking-wider">ACTIVE OFFERS</span>
            <span className="w-2 h-2 bg-amber-500"></span>
          </div>
          <div>
            <div className="text-3xl font-mono font-bold text-slate-900 tracking-tight">{offers.length} INBOUND</div>
            <div className="text-xs font-mono text-amber-800 font-bold mt-1">₹7.67 LAKH VALUE</div>
          </div>
          <button 
            onClick={() => setCurrentView('farmer-offers')}
            className="text-[10px] font-mono font-bold text-slate-900 border-t border-slate-200 pt-2 uppercase flex items-center justify-between hover:text-emerald-700"
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
              <h3 className="font-mono font-bold text-sm uppercase text-slate-900">ACTIVE LISTINGS & CROPS</h3>
              <p className="text-xs font-mono text-slate-500">Verified inventory available for market contract</p>
            </div>
            <button 
              onClick={() => setCurrentView('add-listing')}
              className="bg-slate-900 hover:bg-slate-800 text-white font-mono text-xs font-bold px-3 py-2 border border-slate-900 uppercase flex items-center space-x-1"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>LIST NEW HARVEST</span>
            </button>
          </div>

          <div className="space-y-3">
            {crops.map((crop) => (
              <div key={crop.id} className="border border-slate-200 p-4 hover:border-slate-400 transition-all bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center space-x-3">
                  <img src={crop.image} alt={crop.title} className="w-12 h-12 object-cover border border-slate-300 rounded-none shrink-0" />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-xs text-slate-900">{crop.title}</span>
                      <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 px-1.5 py-0.5 border border-emerald-800 font-bold">
                        GRADE {crop.grade}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-slate-500 mt-0.5">
                      {crop.quantity} {crop.unit} • Moisture: {crop.moisture} • Quality AI: {crop.aiQualityScore}%
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                  <div className="text-right font-mono">
                    <div className="text-xs font-bold text-slate-900">₹{crop.pricePerQuintal}/Q</div>
                    <div className="text-[10px] text-slate-500">LISTED PRICE</div>
                  </div>
                  <button 
                    onClick={() => { setSelectedCrop(crop); setCurrentView('crop-details'); }}
                    className="p-2 border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 font-mono text-xs font-bold"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Quick Action Shortcuts & Environmental Grid */}
        <div className="space-y-6">
          {/* Environmental Conditions Square Box */}
          <div className="border border-slate-300 bg-white p-6 space-y-4">
            <h3 className="font-mono font-bold text-sm uppercase text-slate-900 border-b border-slate-200 pb-3">
              MICROCLIMATE SENSORS
            </h3>
            <div className="grid grid-cols-2 gap-3 font-mono">
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
                <div className="text-[10px] text-slate-500 uppercase">PH LEVEL</div>
                <div className="text-lg font-bold text-slate-900">6.8 PH</div>
              </div>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="border border-slate-300 bg-white p-6 space-y-3 font-mono">
            <h3 className="font-bold text-sm uppercase text-slate-900 border-b border-slate-200 pb-3">
              FARM SHORTCUTS
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
              <span>VIEW {offers.length} PENDING BUYER OFFERS</span>
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
}

function RetailerDashboard({ setCurrentView, crops, setSelectedCrop }) {
  return (
    <div className="space-y-6">
      {/* 3 Top Minimal Square Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
        <div className="border border-slate-300 bg-white p-5 aspect-auto md:aspect-square flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs text-slate-500 font-bold uppercase">TOTAL MARKET VOLUME</span>
            <BarChart2 className="w-4 h-4 text-emerald-700" />
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900">850 QUINTALS</div>
            <div className="text-xs text-emerald-700 font-bold mt-1">12 VERIFIED SELLERS ONLINE</div>
          </div>
          <div className="text-[10px] text-slate-500 border-t border-slate-200 pt-2">
            Average Quality Grade: A+
          </div>
        </div>

        <div className="border border-slate-300 bg-white p-5 aspect-auto md:aspect-square flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs text-slate-500 font-bold uppercase">AI DEMAND FORECAST</span>
            <TrendingUp className="w-4 h-4 text-blue-700" />
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900">HIGH DEMAND</div>
            <div className="text-xs text-blue-700 font-bold mt-1">WHEAT +4.2% NEXT 14 DAYS</div>
          </div>
          <div className="text-[10px] text-slate-500 border-t border-slate-200 pt-2">
            Based on regional processing indices
          </div>
        </div>

        <div className="border border-slate-300 bg-white p-5 aspect-auto md:aspect-square flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs text-slate-500 font-bold uppercase">ESCROW FUNDS LOCKED</span>
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
          </div>
          <div>
            <div className="text-3xl font-bold text-slate-900">₹12,40,000</div>
            <div className="text-xs text-emerald-700 font-bold mt-1">100% SMART CONTRACT PROTECTED</div>
          </div>
          <div className="text-[10px] text-slate-500 border-t border-slate-200 pt-2">
            Auto-disbursed upon gate pass receipt
          </div>
        </div>
      </div>

      {/* Spot Price Watch Table */}
      <div className="border border-slate-300 bg-white p-6 space-y-4 font-mono">
        <div className="flex justify-between items-center border-b border-slate-200 pb-4">
          <div>
            <h3 className="font-bold text-sm uppercase text-slate-900">SPOT CROP MARKET & AI PRICE PREDICTIONS</h3>
            <p className="text-xs text-slate-500">Direct farm gate pricing updated live</p>
          </div>
          <button 
            onClick={() => setCurrentView('marketplace')}
            className="bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold px-4 py-2 border border-slate-900 uppercase"
          >
            BROWSE FULL MARKETPLACE
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-300 bg-slate-100 text-slate-700 uppercase">
                <th className="p-3 border-r border-slate-200">Crop Commodity</th>
                <th className="p-3 border-r border-slate-200">Quality Grade</th>
                <th className="p-3 border-r border-slate-200">Spot Price (/Q)</th>
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
                    <span className="bg-emerald-950 text-emerald-400 font-bold px-2 py-0.5 border border-emerald-800">
                      GRADE {c.grade}
                    </span>
                  </td>
                  <td className="p-3 border-r border-slate-200 font-bold text-slate-900">₹{c.pricePerQuintal}</td>
                  <td className="p-3 border-r border-slate-200 text-emerald-700 font-bold">
                    ↑ ₹{(c.pricePerQuintal * 1.04).toFixed(0)} (+4.0%)
                  </td>
                  <td className="p-3 border-r border-slate-200">{c.quantity} Quintals</td>
                  <td className="p-3">
                    <button 
                      onClick={() => { setSelectedCrop(c); setCurrentView('crop-details'); }}
                      className="bg-emerald-950 text-emerald-400 hover:bg-emerald-900 px-3 py-1 font-bold border border-emerald-700 uppercase"
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
}

function InsuranceAIChatView() {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Greetings. I am AgriSentinel Insurance & Yield Copilot. Query satellite risk records, soil metrics, pest infestation indexes, or crop insurance parameters.',
      citations: ['Sentinel-2 Satellite Radar - Grid #402', 'PM Fasal Bima Risk Index 2026'],
      time: '10:00 AM'
    }
  ]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);

  const quickPrompts = [
    "Assess drought risk for my wheat crop this season",
    "What is the pest outbreak risk in Punjab grid #4?",
    "Calculate my insurance claim coverage ratio for moisture damage"
  ];

  const handleSend = (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg = {
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');

    // Simulated AI response
    setTimeout(() => {
      let responseText = "Based on multi-spectral satellite telemetry and local weather sensors, your overall risk rating is current LOW (12/100).";
      let citations = ["AgriSentinel Microclimate Sensor Node #12", "National Crop Risk Matrix"];

      if (query.toLowerCase().includes('drought') || query.toLowerCase().includes('moisture')) {
        responseText = "Drought risk for your current wheat harvest stands at 8.4% (VERY LOW). Soil moisture levels at 30cm depth are holding steady at 34%. Next precipitation predicted in 48 hours.";
        citations = ["Soil Telemetry Sensor #301", "Global Weather Model GFS 0.25°"];
      } else if (query.toLowerCase().includes('pest') || query.toLowerCase().includes('infestation')) {
        responseText = "Pest risk index is MODERATE for stem borer due to humidity spikes (58%). Recommended preventative biological spray within 3 days to preserve Grade A+ certification.";
        citations = ["Regional Entomology Survey v4", "NDVI Thermal Variance Chart"];
      } else if (query.toLowerCase().includes('insurance') || query.toLowerCase().includes('claim')) {
        responseText = "Your active Smart Policy #POL-8820 covers up to ₹4,50,000 for weather yield loss exceeding 15%. Automated escrow release triggers if NDVI drops below 0.65.";
        citations = ["Smart Insurance Contract #0x92a...b1", "Parametric Weather API"];
      }

      setMessages(prev => [...prev, {
        sender: 'ai',
        text: responseText,
        citations,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 600);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="border border-slate-300 bg-white flex flex-col h-[700px] max-w-4xl mx-auto font-mono">
      {/* Header */}
      <div className="p-4 bg-slate-900 text-white border-b border-slate-300 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-emerald-500"></div>
          <span className="font-bold text-sm uppercase">AGRISENTINEL AI INSURANCE COPILOT</span>
        </div>
        <span className="text-xs text-emerald-400 font-bold">[CITATION VERIFIED MODEL]</span>
      </div>

      {/* Messages */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-2xl border p-4 ${
              m.sender === 'user' 
                ? 'bg-slate-900 text-white border-slate-900' 
                : 'bg-white text-slate-900 border-slate-300'
            }`}>
              <div className="flex items-center justify-between border-b border-slate-200/20 pb-2 mb-2 text-[10px] text-slate-400">
                <span className="font-bold uppercase">{m.sender === 'user' ? 'OPERATOR' : 'AGRISENTINEL AI'}</span>
                <span>{m.time}</span>
              </div>
              <p className="text-xs leading-relaxed">{m.text}</p>

              {m.citations && m.citations.length > 0 && (
                <div className="mt-3 pt-2 border-t border-slate-200 text-[10px] text-slate-500">
                  <span className="font-bold uppercase text-slate-700 block mb-1">CITATIONS & DATA SOURCES:</span>
                  <div className="flex flex-wrap gap-1">
                    {m.citations.map((c, i) => (
                      <span key={i} className="bg-slate-100 border border-slate-300 px-2 py-0.5 text-slate-800">
                        📄 {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Quick Prompt Chips */}
      <div className="p-3 bg-white border-t border-slate-200 flex flex-wrap gap-2">
        {quickPrompts.map((qp, i) => (
          <button
            key={i}
            onClick={() => handleSend(qp)}
            className="text-[11px] bg-slate-100 hover:bg-slate-200 border border-slate-300 px-3 py-1 text-slate-800 text-left font-semibold"
          >
            ↳ {qp}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-4 bg-white border-t border-slate-300 flex space-x-2">
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask AI Copilot regarding crop insurance, soil metrics or weather risk..."
          className="flex-1 border border-slate-300 p-3 text-xs font-mono focus:outline-none focus:border-slate-900"
        />
        <button 
          onClick={() => handleSend()}
          className="bg-emerald-950 text-emerald-400 hover:bg-emerald-900 border border-emerald-800 px-6 font-bold text-xs uppercase flex items-center space-x-2"
        >
          <span>SEND</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function MarketplaceView({ crops, setSelectedCrop, setCurrentView }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const filtered = crops.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.seller.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || c.grade === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 font-mono">
      {/* Search & Filter Bar */}
      <div className="border border-slate-300 bg-white p-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="SEARCH CROP, GRADE OR FARMER..."
            className="w-full border border-slate-300 pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-slate-900 uppercase"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto">
          <span className="text-xs font-bold text-slate-500 uppercase">GRADE FILTER:</span>
          {['ALL', 'A+', 'A', 'B'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-bold border transition-all ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
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
                <div className="absolute bottom-3 right-3 bg-emerald-950 text-emerald-400 text-[10px] font-bold px-2 py-1 border border-emerald-800">
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
                    <span className="text-[10px] text-slate-500 block uppercase">SPOT PRICE</span>
                    <span className="text-lg font-bold text-slate-900">₹{crop.pricePerQuintal}</span>
                    <span className="text-[10px] text-slate-500"> / Quintal</span>
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
                className="flex-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-800 py-2 font-bold text-xs uppercase"
              >
                MAKE ESCROW OFFER
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CropDetailsView({ crop, setCurrentView }) {
  if (!crop) return null;

  return (
    <div className="space-y-6 font-mono max-w-5xl mx-auto">
      <button 
        onClick={() => setCurrentView('marketplace')}
        className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center space-x-1 uppercase"
      >
        <span>← BACK TO MARKETPLACE</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Image & Badge */}
        <div className="space-y-4">
          <div className="border border-slate-300 bg-white p-2">
            <img src={crop.image} alt={crop.title} className="w-full h-80 object-cover" />
          </div>

          <div className="border border-slate-300 bg-white p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-bold uppercase">SELLER VERIFICATION</span>
              <span className="bg-emerald-950 text-emerald-400 text-[10px] font-bold px-2 py-0.5 border border-emerald-800">
                VERIFIED FARMER
              </span>
            </div>
            <div className="text-sm font-bold text-slate-900">{crop.seller}</div>
            <p className="text-xs text-slate-500">Location: {crop.location}</p>
            <div className="p-3 border border-slate-200 bg-slate-50 text-xs text-slate-700">
              ✓ Smart Contract Escrow Lock Enabled <br/>
              ✓ Spectral Quality Scanning Passed
            </div>
          </div>
        </div>

        {/* Right Details Matrix */}
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
                <span className="text-xs text-slate-500 block">/ QUINTAL</span>
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
              className="w-full bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-800 p-3 font-bold text-xs uppercase"
            >
              INITIATE PURCHASE OFFER (ESCROW PROTECTED)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddCropListingView({ setCrops, setCurrentView }) {
  const [formData, setFormData] = useState({
    title: '',
    pricePerQuintal: '2600',
    quantity: '100',
    moisture: '11.5%',
    grainSize: '3.2mm',
    grade: 'A+',
    description: ''
  });

  const [aiScore, setAiScore] = useState(94);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newCrop = {
      id: `crop-${Date.now()}`,
      title: formData.title || 'Grade A Wheat Harvest',
      seller: 'Kisan Organics Co-op',
      sellerType: 'Verified Farmer',
      location: 'Punjab, IN',
      pricePerQuintal: Number(formData.pricePerQuintal),
      quantity: Number(formData.quantity),
      unit: 'Quintals',
      moisture: formData.moisture,
      grainSize: formData.grainSize,
      aiQualityScore: aiScore,
      grade: formData.grade,
      harvestDate: new Date().toISOString().split('T')[0],
      image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=600',
      description: formData.description || 'Verified organic crop harvest ready for direct pickup.'
    };

    setCrops(prev => [newCrop, ...prev]);
    setCurrentView('farmer-dash');
  };

  return (
    <div className="max-w-2xl mx-auto border border-slate-300 bg-white p-8 font-mono space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-base font-bold uppercase text-slate-900">ADD HARVEST LISTING (AI SPEC SIMULATOR)</h1>
        <p className="text-xs text-slate-500">Inputs are verified against microclimate sensors</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-bold text-slate-700 uppercase mb-1">Crop Title & Commodity</label>
          <input 
            type="text" 
            required
            value={formData.title}
            onChange={e => setFormData({...formData, title: e.target.value})}
            placeholder="e.g. Premium Sharbati Organic Wheat"
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
              className="w-full border border-slate-300 p-2.5 focus:outline-none focus:border-slate-900"
            />
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
              onChange={e => setFormData({...formData, grade: e.target.value})}
              className="w-full border border-slate-300 p-2.5 focus:outline-none focus:border-slate-900 bg-white"
            >
              <option value="A+">Grade A+</option>
              <option value="A">Grade A</option>
              <option value="B">Grade B</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 uppercase mb-1">Description & Harvest Details</label>
          <textarea 
            rows={3}
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            placeholder="Describe field conditions, pesticide history, moisture tests..."
            className="w-full border border-slate-300 p-2.5 focus:outline-none focus:border-slate-900"
          ></textarea>
        </div>

        {/* AI Simulator Output */}
        <div className="p-4 border border-emerald-800 bg-emerald-950 text-emerald-100 space-y-1">
          <div className="flex justify-between items-center text-xs font-bold text-emerald-400">
            <span>AI QUALITY SCORE PREDICTION</span>
            <span>{aiScore} / 100</span>
          </div>
          <p className="text-[11px] text-slate-300">
            Simulated market rate: ₹2,750 - ₹2,900 / Quintal. Based on 11.5% moisture and Grade {formData.grade} classification.
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
            PUBLISH TO MARKET
          </button>
        </div>
      </form>
    </div>
  );
}

function RetailerOfferView({ crop, setOffers, setCurrentView }) {
  const [offeredPrice, setOfferedPrice] = useState(crop ? crop.pricePerQuintal : 2800);
  const [quantity, setQuantity] = useState(crop ? crop.quantity : 100);
  const [deliveryDate, setDeliveryDate] = useState('2026-04-15');

  if (!crop) return null;

  const totalAmount = offeredPrice * quantity;

  const handleOfferSubmit = (e) => {
    e.preventDefault();
    const newOffer = {
      id: `OFF-${Math.floor(100 + Math.random() * 900)}`,
      cropTitle: crop.title,
      cropId: crop.id,
      buyerName: 'Apex Sourcing Ltd.',
      buyerRating: '4.9 ★',
      offeredPrice: Number(offeredPrice),
      listedPrice: crop.pricePerQuintal,
      quantity: Number(quantity),
      totalValue: totalAmount,
      deliveryDate: deliveryDate,
      escrowStatus: 'Funds Locked in Escrow',
      status: 'Pending',
      date: 'Just now'
    };

    setOffers(prev => [newOffer, ...prev]);
    setCurrentView('retailer-dash');
  };

  return (
    <div className="max-w-xl mx-auto border border-slate-300 bg-white p-8 font-mono space-y-6">
      <div className="border-b border-slate-200 pb-3">
        <span className="text-[10px] bg-slate-900 text-white px-2 py-0.5 font-bold uppercase">ESCROW PURCHASE AGREEMENT</span>
        <h1 className="text-base font-bold text-slate-900 uppercase mt-2">SUBMIT OFFER: {crop.title}</h1>
        <p className="text-xs text-slate-500">Farmer: {crop.seller}</p>
      </div>

      <form onSubmit={handleOfferSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Offered Price (₹/Quintal)</label>
            <input 
              type="number" 
              value={offeredPrice}
              onChange={e => setOfferedPrice(e.target.value)}
              className="w-full border border-slate-300 p-2.5 focus:outline-none focus:border-slate-900 font-bold"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">Listed: ₹{crop.pricePerQuintal}</span>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Quantity (Quintals)</label>
            <input 
              type="number" 
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              className="w-full border border-slate-300 p-2.5 focus:outline-none focus:border-slate-900 font-bold"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">Max Available: {crop.quantity}</span>
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 uppercase mb-1">Target Delivery Date</label>
          <input 
            type="date" 
            value={deliveryDate}
            onChange={e => setDeliveryDate(e.target.value)}
            className="w-full border border-slate-300 p-2.5 focus:outline-none focus:border-slate-900"
          />
        </div>

        {/* Escrow Lock Details */}
        <div className="p-4 border border-slate-300 bg-slate-50 space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-slate-900">
            <span>TOTAL ESCROW COMMITMENT:</span>
            <span className="text-lg">₹{totalAmount.toLocaleString('en-IN')}</span>
          </div>
          <p className="text-[10px] text-slate-500">
            Funds will be held in locked escrow until digital gate pass verification at transit hub.
          </p>
        </div>

        <div className="flex space-x-3 pt-2">
          <button 
            type="button" 
            onClick={() => setCurrentView('crop-details')}
            className="flex-1 border border-slate-300 bg-white hover:bg-slate-100 p-3 font-bold uppercase text-slate-700"
          >
            CANCEL
          </button>
          <button 
            type="submit" 
            className="flex-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-800 p-3 font-bold uppercase"
          >
            LOCK ESCROW & SEND OFFER
          </button>
        </div>
      </form>
    </div>
  );
}

function FarmerOffersView({ offers, setOffers, setCurrentView, setActiveOrder }) {
  const handleAction = (id, newStatus) => {
    setOffers(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));

    if (newStatus === 'Accepted') {
      const acceptedOffer = offers.find(o => o.id === id);
      if (acceptedOffer) {
        const newOrder = {
          id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
          cropTitle: acceptedOffer.cropTitle,
          seller: 'Kisan Organics Co-op',
          buyer: acceptedOffer.buyerName,
          quantity: `${acceptedOffer.quantity} Quintals`,
          totalPrice: `₹${acceptedOffer.totalValue.toLocaleString('en-IN')}`,
          status: 'Contract Created',
          currentMilestone: 0,
          milestones: [
            { title: 'Contract Locked & Escrow Funded', date: 'Just now', done: true },
            { title: 'Quality Verification at Gate', date: 'Pending', done: false },
            { title: 'Dispatched & Live GPS Tracking', date: 'Pending', done: false },
            { title: 'Hub Inspection & Delivery', date: 'Pending', done: false },
            { title: 'Escrow Auto-Settlement', date: 'Pending', done: false }
          ],
          driver: 'Assigned Driver Pending',
          tempHumidity: 'Sensor Monitoring Active',
          contractHash: `0x${Math.random().toString(16).substring(2, 10)}...escrow`,
          location: 'Farm Origin Gate'
        };
        setActiveOrder(newOrder);
      }
    }
  };

  return (
    <div className="space-y-6 font-mono max-w-4xl mx-auto">
      <div className="border-b border-slate-300 pb-3 flex justify-between items-center">
        <div>
          <h1 className="text-base font-bold uppercase text-slate-900">INBOUND ESCROW OFFERS</h1>
          <p className="text-xs text-slate-500">Offers submitted directly with verified liquid balance</p>
        </div>
        <span className="bg-slate-900 text-white text-xs font-bold px-3 py-1 uppercase">
          {offers.length} OFFERS TOTAL
        </span>
      </div>

      <div className="space-y-4">
        {offers.map((offer) => (
          <div key={offer.id} className="border border-slate-300 bg-white p-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block">{offer.id} • {offer.date}</span>
                <h3 className="font-bold text-sm text-slate-900 uppercase">{offer.cropTitle}</h3>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-xs font-bold px-2 py-0.5 border ${
                  offer.status === 'Accepted' 
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-800' 
                    : offer.status === 'Declined'
                    ? 'bg-red-950 text-red-400 border-red-800'
                    : 'bg-amber-100 text-amber-900 border-amber-300'
                }`}>
                  STATUS: {offer.status.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3 border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">BUYER</span>
                <span className="font-bold text-slate-900">{offer.buyerName}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">OFFERED RATE</span>
                <span className="font-bold text-slate-900">₹{offer.offeredPrice} / Q</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">QUANTITY</span>
                <span className="font-bold text-slate-900">{offer.quantity} Quintals</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">TOTAL ESCROW</span>
                <span className="font-bold text-emerald-700">₹{offer.totalValue.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {offer.status === 'Pending' && (
              <div className="flex space-x-3 pt-2">
                <button 
                  onClick={() => handleAction(offer.id, 'Declined')}
                  className="flex-1 border border-slate-300 bg-white hover:bg-slate-100 py-2 text-xs font-bold text-red-700 uppercase"
                >
                  DECLINE
                </button>
                <button 
                  onClick={() => handleAction(offer.id, 'Accepted')}
                  className="flex-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-800 py-2 text-xs font-bold uppercase"
                >
                  ACCEPT OFFER & LOCK ESCROW
                </button>
              </div>
            )}

            {offer.status === 'Accepted' && (
              <div className="flex justify-between items-center pt-2 text-xs">
                <span className="text-emerald-700 font-bold">✓ ESCROW CONTRACT INITIATED</span>
                <button 
                  onClick={() => setCurrentView('order-tracking')}
                  className="bg-slate-900 text-white px-4 py-1.5 font-bold uppercase hover:bg-slate-800"
                >
                  VIEW LOGISTICS & TRACKING →
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function OrderTrackingView({ order }) {
  if (!order) {
    return (
      <div className="p-8 text-center font-mono text-xs text-slate-500 border border-slate-300 bg-white">
        NO ACTIVE CONTRACT SELECTED. ACCEPT AN OFFER TO TRACK SHIPMENT.
      </div>
    );
  }

  return (
    <div className="space-y-6 font-mono max-w-4xl mx-auto">
      {/* Contract Header */}
      <div className="border border-slate-300 bg-white p-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200 pb-4">
          <div>
            <span className="text-[10px] bg-slate-900 text-emerald-400 font-bold px-2 py-0.5">
              CONTRACT: {order.id}
            </span>
            <h1 className="text-base font-bold text-slate-900 uppercase mt-2">{order.cropTitle}</h1>
            <p className="text-xs text-slate-500">Seller: {order.seller} • Buyer: {order.buyer}</p>
          </div>
          <div className="text-right">
            <span className="text-xl font-bold text-slate-900">{order.totalPrice}</span>
            <span className="text-[10px] text-slate-500 block">TOTAL VALUE IN ESCROW</span>
          </div>
        </div>

        {/* Milestone Steps - Sharp Geometric Minimal */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase text-slate-900">SMART CONTRACT MILESTONES</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
            {order.milestones.map((ms, idx) => (
              <div 
                key={idx}
                className={`p-3 border text-xs flex flex-col justify-between h-24 ${
                  ms.done 
                    ? 'bg-slate-900 text-white border-slate-900' 
                    : 'bg-slate-50 text-slate-400 border-slate-200'
                }`}
              >
                <div className="flex justify-between items-center text-[10px]">
                  <span>STEP 0{idx + 1}</span>
                  {ms.done ? <Check className="w-3 h-3 text-emerald-400" /> : <Clock className="w-3 h-3" />}
                </div>
                <div className="font-bold uppercase text-[11px] leading-tight">{ms.title}</div>
                <div className="text-[9px] text-slate-400">{ms.date}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: Live Simulated Map & Contract Hash */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Simulated Map Block */}
        <div className="border border-slate-300 bg-white p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-200 pb-3">
            <h3 className="text-xs font-bold uppercase text-slate-900">LIVE TELEMETRY & GPS</h3>
            <span className="text-[10px] font-bold text-emerald-700">● LIVE PING</span>
          </div>

          <div className="bg-slate-900 h-48 border border-slate-700 relative p-4 flex flex-col justify-between text-white overflow-hidden">
            <div className="text-[10px] text-emerald-400 font-mono">
              GPS COORDINATES: 21.1458° N, 79.0882° E <br/>
              CURRENT LOCATION: {order.location}
            </div>

            {/* Radar Lines Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:16px_16px] opacity-30"></div>

            <div className="z-10 bg-slate-800/90 border border-slate-600 p-2 text-[10px] space-y-1">
              <div>DRIVER: {order.driver}</div>
              <div className="text-emerald-400">CARGO SENSORS: {order.tempHumidity}</div>
            </div>
          </div>
        </div>

        {/* Digital Contract Receipt Block */}
        <div className="border border-slate-300 bg-white p-6 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase text-slate-900 border-b border-slate-200 pb-3">
              DIGITAL SMART CONTRACT RECEIPT
            </h3>
            
            <div className="space-y-2 mt-4 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">CONTRACT HASH:</span>
                <span className="font-bold font-mono text-slate-900">{order.contractHash}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">ESCROW LOCK STATE:</span>
                <span className="font-bold text-emerald-700">LOCKED (100%)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">QUALITY VERIFICATION:</span>
                <span className="font-bold text-slate-900">GATE INSPECTION PASSED</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-100 border border-slate-300 text-[10px] text-slate-600">
            Escrow automatically releases to farmer bank account upon buyer digital receipt signature or hub gate scan.
          </div>
        </div>
      </div>
    </div>
  );
}