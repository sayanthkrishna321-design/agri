import React, { useState } from 'react';
import { UserRole, AppView, Crop, Offer, Order } from './types';
import { Sidebar } from './components/layout/Sidebar';
import { TopNav } from './components/layout/TopNav';

// Pages
import { LoginView } from './pages/LoginView';
import { FarmerDashboard } from './pages/FarmerDashboard';
import { RetailerDashboard } from './pages/RetailerDashboard';
import { InsuranceAIChatView } from './pages/InsuranceAIChatView';
import { MarketplaceView } from './pages/MarketplaceView';
import { CropDetailsView } from './pages/CropDetailsView';
import { AddCropListingView } from './pages/AddCropListingView';
import { RetailerOfferView } from './pages/RetailerOfferView';
import { FarmerOffersView } from './pages/FarmerOffersView';
import { OrderTrackingView } from './pages/OrderTrackingView';

// Initial Realistic Mock Data for Indian Agricultural Commodities
const INITIAL_CROPS: Crop[] = [
  {
    id: 'crop-101',
    title: 'Grade A+ Sharbati Wheat',
    seller: 'Kisan Organics Co-op',
    sellerType: 'Verified Farmer Co-op',
    location: 'Ludhiana, Punjab',
    pricePerQuintal: 2850,
    pricePerKg: 28.50,
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
    location: 'Haveri, Karnataka',
    pricePerQuintal: 1980,
    pricePerKg: 19.80,
    quantity: 400,
    unit: 'Quintals',
    moisture: '12.8%',
    grainSize: '8.1mm',
    aiQualityScore: 92,
    grade: 'A',
    harvestDate: '2026-03-01',
    image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80&w=600',
    description: 'High-starch yellow corn suitable for industrial feed or starch processing. Lab tested for aflatoxin compliance.'
  },
  {
    id: 'crop-103',
    title: 'Aromatic Basmati Rice 1121',
    seller: 'Satnam Agri Estates',
    sellerType: 'Verified Farmer',
    location: 'Karnal, Haryana',
    pricePerQuintal: 4400,
    pricePerKg: 44.00,
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
    title: 'Organic Desi Chana (Chickpeas)',
    seller: 'Malwa Farmers Producer Co',
    sellerType: 'FPO Verified',
    location: 'Indore, Madhya Pradesh',
    pricePerQuintal: 5200,
    pricePerKg: 52.00,
    quantity: 120,
    unit: 'Quintals',
    moisture: '9.5%',
    grainSize: '7.2mm',
    aiQualityScore: 95,
    grade: 'A+',
    harvestDate: '2026-03-05',
    image: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&q=80&w=600',
    description: 'Premium bold Desi Chana with high protein content and uniform grain size. Cleaned and graded via optical sorter.'
  },
  {
    id: 'crop-105',
    title: 'High-Oleic Soybeans',
    seller: 'Narmada Bio-Agro',
    sellerType: 'Verified Farmer',
    location: 'Ujjain, Madhya Pradesh',
    pricePerQuintal: 3600,
    pricePerKg: 36.00,
    quantity: 220,
    unit: 'Quintals',
    moisture: '9.8%',
    grainSize: '6.0mm',
    aiQualityScore: 89,
    grade: 'A',
    harvestDate: '2026-03-10',
    image: 'https://images.unsplash.com/photo-1599599810694-b5b37304c03d?auto=format&fit=crop&q=80&w=600',
    description: 'Non-GMO soybeans optimized for oil extraction. High protein content verified via NIR spectral scanning.'
  }
];

const INITIAL_OFFERS: Offer[] = [
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

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-8821',
    cropTitle: 'Organic Hybrid Yellow Corn',
    seller: 'GreenValley Bio-Farms',
    buyer: 'Sunshine Feed Mills',
    quantity: '250 Quintals',
    totalPrice: '₹4,87,500',
    status: 'In Transit & GPS Tracked',
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
  const [role, setRole] = useState<UserRole>('farmer');
  const [currentView, setCurrentView] = useState<AppView>('farmer-dash');
  const [crops, setCrops] = useState<Crop[]>(INITIAL_CROPS);
  const [offers, setOffers] = useState<Offer[]>(INITIAL_OFFERS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  
  const [selectedCrop, setSelectedCrop] = useState<Crop>(INITIAL_CROPS[0]);
  const [activeOrder, setActiveOrder] = useState<Order>(INITIAL_ORDERS[0]);

  const handleRoleSwitch = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === 'farmer') {
      setCurrentView('farmer-dash');
    } else {
      setCurrentView('retailer-dash');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#0F172A] font-sans antialiased selection:bg-[#064E3B] selection:text-white flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <Sidebar 
        role={role} 
        setRole={handleRoleSwitch} 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
      />

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto min-h-screen">
        {/* Top Utility Bar */}
        <TopNav role={role} setRole={handleRoleSwitch} currentView={currentView} setCurrentView={setCurrentView} />

        {/* View Router */}
        <main className="p-4 md:p-8 max-w-7xl w-full mx-auto flex-1">
          {currentView === 'login' && <LoginView setRole={handleRoleSwitch} setCurrentView={setCurrentView} />}
          {currentView === 'farmer-dash' && <FarmerDashboard setCurrentView={setCurrentView} setSelectedCrop={setSelectedCrop} crops={crops} offers={offers} />}
          {currentView === 'retailer-dash' && <RetailerDashboard setCurrentView={setCurrentView} crops={crops} setSelectedCrop={setSelectedCrop} />}
          {currentView === 'chat' && <InsuranceAIChatView />}
          {currentView === 'marketplace' && <MarketplaceView crops={crops} setSelectedCrop={setSelectedCrop} setCurrentView={setCurrentView} />}
          {currentView === 'crop-details' && <CropDetailsView crop={selectedCrop} setCurrentView={setCurrentView} />}
          {currentView === 'add-listing' && <AddCropListingView setCrops={setCrops} setCurrentView={setCurrentView} />}
          {currentView === 'retailer-offer' && <RetailerOfferView crop={selectedCrop} setOffers={setOffers} setCurrentView={setCurrentView} />}
          {currentView === 'farmer-offers' && <FarmerOffersView offers={offers} setOffers={setOffers} setCurrentView={setCurrentView} setActiveOrder={setActiveOrder} />}
          {currentView === 'order-tracking' && <OrderTrackingView order={activeOrder} />}
        </main>

        {/* Ultra Minimal Geometric Footer */}
        <footer className="border-t border-slate-300 bg-white p-4 text-xs font-mono text-slate-500 flex flex-col md:flex-row justify-between items-center gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-[#064E3B] inline-block"></span>
            <span className="font-bold text-slate-900 tracking-wider">AGRISENTINEL X</span>
            <span>— GEOMETRIC AGRICULTURAL INTELLIGENCE PROTOCOL v2.4</span>
          </div>
          <div>NODE STATUS: SENSORS & SMART ESCROW CONTRACTS OPERATIONAL</div>
        </footer>
      </div>
    </div>
  );
}
