import React, { useState } from 'react';
import { Offer, Order, AppView } from '../types';

interface FarmerOffersViewProps {
  offers: Offer[];
  setOffers: React.Dispatch<React.SetStateAction<Offer[]>>;
  setCurrentView: (view: AppView) => void;
  setActiveOrder: (order: Order) => void;
}

export const FarmerOffersView: React.FC<FarmerOffersViewProps> = ({
  offers,
  setOffers,
  setCurrentView,
  setActiveOrder
}) => {
  const [counterPriceMap, setCounterPriceMap] = useState<Record<string, number>>({});
  const [counterActiveMap, setCounterActiveMap] = useState<Record<string, boolean>>({});

  const handleAction = (id: string, newStatus: 'Accepted' | 'Declined' | 'Countered') => {
    setOffers(prev => prev.map(o => {
      if (o.id === id) {
        if (newStatus === 'Countered' && counterPriceMap[id]) {
          return {
            ...o,
            status: 'Countered',
            offeredPrice: counterPriceMap[id],
            totalValue: counterPriceMap[id] * o.quantity
          };
        }
        return { ...o, status: newStatus };
      }
      return o;
    }));

    if (newStatus === 'Accepted') {
      const acceptedOffer = offers.find(o => o.id === id);
      if (acceptedOffer) {
        const newOrder: Order = {
          id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
          cropTitle: acceptedOffer.cropTitle,
          seller: 'Kisan Organics Co-op',
          buyer: acceptedOffer.buyerName,
          quantity: `${acceptedOffer.quantity} Quintals`,
          totalPrice: `₹${acceptedOffer.totalValue.toLocaleString('en-IN')}`,
          status: 'Contract Locked & Escrow Funded',
          currentMilestone: 1,
          milestones: [
            { title: 'Contract Locked & Escrow Funded', date: 'Just now', done: true },
            { title: 'Quality Verification at Gate', date: 'Pending', done: false },
            { title: 'Dispatched & Live GPS Tracking', date: 'Pending', done: false },
            { title: 'Hub Inspection & Delivery', date: 'Pending', done: false },
            { title: 'Escrow Auto-Settlement', date: 'Pending', done: false }
          ],
          driver: 'Assigned Driver: Rajesh Sharma (KA-04-E-8820)',
          tempHumidity: '24°C / 42% RH (Sensors OK)',
          contractHash: `0x${Math.random().toString(16).substring(2, 10)}...escrow`,
          location: 'Farm Origin Gate (Punjab)'
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
          <p className="text-xs text-slate-500">Retailer offers submitted with verified liquid balance</p>
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
                <span className={`text-xs font-bold px-2.5 py-0.5 border ${
                  offer.status === 'Accepted' 
                    ? 'bg-[#064E3B] text-emerald-300 border-emerald-700' 
                    : offer.status === 'Declined'
                    ? 'bg-red-900 text-red-100 border-red-800'
                    : offer.status === 'Countered'
                    ? 'bg-blue-900 text-blue-100 border-blue-800'
                    : 'bg-amber-100 text-amber-950 border-amber-400'
                }`}>
                  STATUS: {offer.status.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3 border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">BUYER RETAILER</span>
                <span className="font-bold text-slate-900">{offer.buyerName}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">OFFERED RATE</span>
                <span className="font-bold text-slate-900">₹{offer.offeredPrice} / Q <span className="text-slate-500 font-normal">(₹{(offer.offeredPrice/100).toFixed(2)}/kg)</span></span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">QUANTITY</span>
                <span className="font-bold text-slate-900">{offer.quantity} Quintals</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">TOTAL ESCROW VALUE</span>
                <span className="font-bold text-[#064E3B]">₹{offer.totalValue.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Counter Offer Input Box Toggle */}
            {counterActiveMap[offer.id] && (
              <div className="p-3 border border-blue-300 bg-blue-50 flex items-center space-x-3 text-xs">
                <span className="font-bold text-blue-900">COUNTER RATE (₹/Q):</span>
                <input 
                  type="number"
                  defaultValue={offer.listedPrice}
                  onChange={(e) => setCounterPriceMap({ ...counterPriceMap, [offer.id]: Number(e.target.value) })}
                  className="border border-slate-300 p-1.5 w-32 font-bold focus:outline-none"
                />
                <button 
                  onClick={() => handleAction(offer.id, 'Countered')}
                  className="bg-blue-900 text-white font-bold px-3 py-1.5 uppercase hover:bg-blue-800"
                >
                  SEND COUNTER OFFER
                </button>
              </div>
            )}

            {(offer.status === 'Pending' || offer.status === 'Countered') && (
              <div className="flex space-x-2 pt-2">
                <button 
                  onClick={() => handleAction(offer.id, 'Declined')}
                  className="flex-1 border border-slate-300 bg-white hover:bg-slate-100 py-2 text-xs font-bold text-red-700 uppercase"
                >
                  DECLINE
                </button>
                <button 
                  onClick={() => setCounterActiveMap({ ...counterActiveMap, [offer.id]: !counterActiveMap[offer.id] })}
                  className="flex-1 border border-slate-300 bg-white hover:bg-slate-100 py-2 text-xs font-bold text-blue-800 uppercase"
                >
                  {counterActiveMap[offer.id] ? 'CANCEL COUNTER' : 'COUNTER OFFER'}
                </button>
                <button 
                  onClick={() => handleAction(offer.id, 'Accepted')}
                  className="flex-1 bg-[#064E3B] hover:bg-emerald-900 text-emerald-300 border border-emerald-700 py-2 text-xs font-bold uppercase transition-all"
                >
                  ACCEPT & LOCK ESCROW
                </button>
              </div>
            )}

            {offer.status === 'Accepted' && (
              <div className="flex justify-between items-center pt-2 text-xs">
                <span className="text-[#064E3B] font-bold">✓ ESCROW SMART CONTRACT INITIATED</span>
                <button 
                  onClick={() => setCurrentView('order-tracking')}
                  className="bg-slate-900 text-white px-4 py-1.5 font-bold uppercase hover:bg-slate-800"
                >
                  VIEW LOGISTICS TELEMETRY →
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
