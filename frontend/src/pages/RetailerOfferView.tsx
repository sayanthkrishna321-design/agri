import React, { useState } from 'react';
import { Crop, Offer, AppView } from '../types';

interface RetailerOfferViewProps {
  crop: Crop | null;
  setOffers: React.Dispatch<React.SetStateAction<Offer[]>>;
  setCurrentView: (view: AppView) => void;
}

export const RetailerOfferView: React.FC<RetailerOfferViewProps> = ({
  crop,
  setOffers,
  setCurrentView
}) => {
  const [offeredPrice, setOfferedPrice] = useState<number>(crop ? crop.pricePerQuintal : 2850);
  const [quantity, setQuantity] = useState<number>(crop ? crop.quantity : 100);
  const [deliveryDate, setDeliveryDate] = useState('2026-04-15');

  if (!crop) {
    return (
      <div className="p-8 text-center font-mono text-xs text-slate-500 border border-slate-300 bg-white">
        NO CROP SELECTED FOR OFFER. PLEASE SELECT A CROP FROM THE MARKETPLACE.
      </div>
    );
  }

  const totalAmount = offeredPrice * quantity;
  const offeredPricePerKg = (offeredPrice / 100).toFixed(2);

  const handleOfferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newOffer: Offer = {
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
      escrowStatus: 'Verified Liquid Balance',
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
        <p className="text-xs text-slate-500">Seller: {crop.seller} • Location: {crop.location}</p>
      </div>

      <form onSubmit={handleOfferSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Offered Price (₹/Quintal)</label>
            <input 
              type="number" 
              value={offeredPrice}
              onChange={e => setOfferedPrice(Number(e.target.value))}
              className="w-full border border-slate-300 p-2.5 focus:outline-none focus:border-slate-900 font-bold"
            />
            <span className="text-[10px] text-[#064E3B] font-bold mt-1 block">Equivalent: ₹{offeredPricePerKg}/kg (Listed: ₹{crop.pricePerQuintal}/Q)</span>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Quantity (Quintals)</label>
            <input 
              type="number" 
              value={quantity}
              onChange={e => setQuantity(Number(e.target.value))}
              className="w-full border border-slate-300 p-2.5 focus:outline-none focus:border-slate-900 font-bold"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">Max Available: {crop.quantity} Quintals</span>
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 uppercase mb-1">Target Delivery Date</label>
          <input 
            type="date" 
            value={deliveryDate}
            onChange={e => setDeliveryDate(e.target.value)}
            className="w-full border border-slate-300 p-2.5 focus:outline-none focus:border-slate-900 font-bold"
          />
        </div>

        {/* Escrow Commitment Card */}
        <div className="p-4 border border-slate-300 bg-slate-50 space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-slate-900">
            <span>TOTAL ESCROW COMMITMENT:</span>
            <span className="text-xl font-bold text-[#064E3B]">₹{totalAmount.toLocaleString('en-IN')}</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-normal">
            Funds will be locked in smart escrow contract until quality gate pass inspection at transit hub.
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
            className="flex-1 bg-[#064E3B] hover:bg-emerald-900 text-emerald-300 border border-emerald-700 p-3 font-bold uppercase transition-all"
          >
            LOCK ESCROW & SUBMIT OFFER
          </button>
        </div>
      </form>
    </div>
  );
};
