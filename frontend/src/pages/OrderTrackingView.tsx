import React from 'react';
import { Check, Clock, Truck, ShieldCheck, MapPin, Activity } from 'lucide-react';
import { Order } from '../types';

interface OrderTrackingViewProps {
  order: Order | null;
}

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({ order }) => {
  if (!order) {
    return (
      <div className="p-8 text-center font-mono text-xs text-slate-500 border border-slate-300 bg-white">
        NO ACTIVE CONTRACT SELECTED. ACCEPT AN OFFER TO TRACK LOGISTICS TELEMETRY.
      </div>
    );
  }

  return (
    <div className="space-y-6 font-mono max-w-4xl mx-auto">
      {/* Contract Header */}
      <div className="border border-slate-300 bg-white p-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200 pb-4">
          <div>
            <span className="text-[10px] bg-slate-900 text-emerald-400 font-bold px-2 py-0.5 uppercase">
              CONTRACT: {order.id}
            </span>
            <h1 className="text-base font-bold text-slate-900 uppercase mt-2">{order.cropTitle}</h1>
            <p className="text-xs text-slate-500">Seller: {order.seller} • Buyer: {order.buyer}</p>
          </div>
          <div className="text-right">
            <span className="text-xl font-bold text-slate-900">{order.totalPrice}</span>
            <span className="text-[10px] text-[#064E3B] font-bold block uppercase">TOTAL VALUE IN ESCROW</span>
          </div>
        </div>

        {/* Milestone Steps Timeline - 5 Step Flow */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase text-slate-900">SUPPLY CHAIN SMART CONTRACT MILESTONES</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2">
            {order.milestones.map((ms, idx) => (
              <div 
                key={idx}
                className={`p-3 border text-xs flex flex-col justify-between h-28 transition-all ${
                  ms.done 
                    ? 'bg-slate-900 text-white border-slate-900' 
                    : 'bg-slate-50 text-slate-400 border-slate-200'
                }`}
              >
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-bold">STEP 0{idx + 1}</span>
                  {ms.done ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Clock className="w-3.5 h-3.5" />}
                </div>
                <div className="font-bold uppercase text-[11px] leading-tight">{ms.title}</div>
                <div className="text-[9px] text-slate-400">{ms.date}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid: Live Radar Telemetry & Smart Contract Receipt */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Simulated Radar Map Block */}
        <div className="border border-slate-300 bg-white p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-200 pb-3">
            <h3 className="text-xs font-bold uppercase text-slate-900 flex items-center space-x-1.5">
              <Truck className="w-4 h-4 text-emerald-800" />
              <span>LIVE GPS & CONTAINER SENSOR TELEMETRY</span>
            </h3>
            <span className="text-[10px] font-bold text-emerald-700 flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>LIVE PING</span>
            </span>
          </div>

          <div className="bg-slate-900 h-52 border border-slate-700 relative p-4 flex flex-col justify-between text-white overflow-hidden">
            {/* Animated Scanning Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:20px_20px] opacity-40"></div>
            
            <div className="z-10 text-[10px] text-emerald-400 font-mono space-y-0.5">
              <div>GPS COORDINATES: 21.1458° N, 79.0882° E</div>
              <div>TRANSIT HUB: {order.location}</div>
            </div>

            <div className="z-10 bg-slate-800/90 border border-slate-600 p-2.5 text-[10px] space-y-1">
              <div className="font-bold text-slate-200">CARRIER: {order.driver}</div>
              <div className="text-emerald-400 font-bold">CONTAINER TELEMETRY: {order.tempHumidity}</div>
            </div>
          </div>
        </div>

        {/* Digital Contract Receipt Block */}
        <div className="border border-slate-300 bg-white p-6 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase text-slate-900 border-b border-slate-200 pb-3 flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-[#064E3B]" />
              <span>DIGITAL SMART CONTRACT RECEIPT</span>
            </h3>
            
            <div className="space-y-2 mt-4 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">CONTRACT HASH:</span>
                <span className="font-bold font-mono text-slate-900">{order.contractHash}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">ESCROW LOCK STATE:</span>
                <span className="font-bold text-[#064E3B]">LOCKED (100% DISBURSEMENT READY)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">GATE INSPECTION:</span>
                <span className="font-bold text-slate-900">VERIFIED SPECTRAL SCAN</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">CARGO QUANTITY:</span>
                <span className="font-bold text-slate-900">{order.quantity}</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-100 border border-slate-300 text-[10px] text-slate-600 leading-normal">
            Escrow automatically releases to farmer bank account upon buyer digital receipt signature or hub gate scanner signal.
          </div>
        </div>
      </div>
    </div>
  );
};
