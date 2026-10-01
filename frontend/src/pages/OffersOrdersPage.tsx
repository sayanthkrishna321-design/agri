import React, { useState, useEffect } from 'react';
import { 
  Truck, DollarSign, CheckCircle2, XCircle, Clock, MapPin, 
  ShieldCheck, AlertTriangle, ChevronRight, User, FileText, ArrowRight
} from 'lucide-react';
import { Offer, Order, UserRole } from '../types';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Modal } from '../components/ui/Modal';
import { getOffers, getOrders, updateOfferStatus, updateOrderStatus } from '../services/api';

interface OffersOrdersPageProps {
  role: UserRole;
  offers: Offer[];
  setOffers: React.Dispatch<React.SetStateAction<Offer[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
}

export const OffersOrdersPage: React.FC<OffersOrdersPageProps> = ({
  role,
  offers,
  setOffers,
  orders,
  setOrders,
}) => {
  const [activeTab, setActiveTab] = useState<'offers' | 'orders' | 'completed'>('offers');
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(orders[0] || null);
  const [actionConfirmModal, setActionConfirmModal] = useState<{
    open: boolean;
    type: 'ACCEPT' | 'REJECT';
    offer: Offer | null;
  }>({ open: false, type: 'ACCEPT', offer: null });

  const [processingAction, setProcessingAction] = useState(false);

  useEffect(() => {
    getOffers().then(data => {
      if (Array.isArray(data) && data.length > 0) setOffers(data);
    }).catch(err => console.warn('Offers sync fallback:', err));

    getOrders().then(data => {
      if (Array.isArray(data) && data.length > 0) setOrders(data);
    }).catch(err => console.warn('Orders sync fallback:', err));
  }, []);

  const handleOfferStatusChange = async (offerId: number, newStatus: 'ACCEPTED' | 'REJECTED') => {
    setProcessingAction(true);
    try {
      await updateOfferStatus(offerId, newStatus);
      setOffers(prev => prev.map(o => o.id === offerId ? { ...o, status: newStatus } : o));

      // If accepted, generate active order
      if (newStatus === 'ACCEPTED') {
        const targetOffer = offers.find(o => o.id === offerId);
        const newOrder: Order = {
          id: Date.now(),
          farmer: 1,
          retailer: 1,
          crop: 1,
          crop_name: targetOffer?.crop_title || 'Sharbati Wheat',
          quantity: targetOffer?.quantity || 100,
          agreed_price: targetOffer?.price || 2800,
          total_price: (targetOffer?.quantity || 100) * (targetOffer?.price || 2800),
          delivery_date: '2026-04-15',
          status: 'IN_TRANSIT',
          current_milestone: 2,
          milestones: [
            { title: 'Contract Locked & Escrow Funded', date: '2026-03-28', done: true },
            { title: 'Quality Verification at Gate', date: '2026-03-29', done: true },
            { title: 'Dispatched & Live GPS Tracking', date: '2026-03-30', done: true },
            { title: 'Hub Inspection & Unloading', date: 'Expected Apr 02', done: false },
            { title: 'Escrow Auto-Settlement', date: 'Pending Unloading', done: false },
          ],
          driver_name: 'Rajesh Sharma (Truck KA-04-E-8820)',
          sensor_telemetry: '24°C / 42% RH (Sensor Normal)',
          contract_hash: '0x8f3c91a4e1b2',
          location: 'Nagpur Transit Hub'
        };
        setOrders(prev => [newOrder, ...prev]);
        setSelectedOrder(newOrder);
        setActiveTab('orders');
      }
    } catch (err) {
      console.warn('Backend offer update fallback:', err);
      setOffers(prev => prev.map(o => o.id === offerId ? { ...o, status: newStatus } : o));
    } finally {
      setProcessingAction(false);
      setActionConfirmModal({ open: false, type: 'ACCEPT', offer: null });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-400 text-xs font-bold mb-2">
            <Truck className="w-3.5 h-3.5" />
            <span>AgriLink Smart Settlement & Logistics</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
            Offers & Orders Workspace
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage incoming procurement offers, active contract milestones, live GPS telemetry, and escrow logs.
          </p>
        </div>

        {/* Workspace Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('offers')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'offers'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Offers ({offers.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'orders'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Active Orders ({orders.length})
          </button>
        </div>
      </div>

      {/* 2. Offers View */}
      {activeTab === 'offers' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Procurement Offers Ledger
            </h3>
            <span className="text-xs font-mono-tech text-slate-400">Total: {offers.length}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 font-bold uppercase text-slate-500 tracking-wider">
                <tr>
                  <th className="p-4">Offer ID & Crop</th>
                  <th className="p-4">Buyer / Counterpart</th>
                  <th className="p-4">Offered Price</th>
                  <th className="p-4">Quantity</th>
                  <th className="p-4">Total Value</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {offers.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-bold text-slate-900 dark:text-slate-100">
                      <div>
                        <p className="font-mono-tech text-purple-600 dark:text-purple-400">OFFER #{o.id}</p>
                        <p className="text-[11px] text-slate-500 font-normal">{o.crop_title || 'Sharbati Wheat'}</p>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">
                      {o.buyer_name || 'AgroCorp Global'}
                    </td>
                    <td className="p-4 font-bold font-mono-tech text-emerald-600 dark:text-emerald-400">
                      ₹{o.price || 2800} / Qtl
                    </td>
                    <td className="p-4 font-bold font-mono-tech text-slate-900 dark:text-slate-100">
                      {o.quantity} Quintals
                    </td>
                    <td className="p-4 font-bold font-mono-tech text-slate-900 dark:text-slate-100">
                      ₹{(o.price || 2800) * o.quantity}
                    </td>
                    <td className="p-4">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {o.status === 'PENDING' && role === 'farmer' ? (
                        <>
                          <button
                            onClick={() => setActionConfirmModal({ open: true, type: 'ACCEPT', offer: o })}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-500 transition-colors"
                          >
                            Accept Offer
                          </button>
                          <button
                            onClick={() => setActionConfirmModal({ open: true, type: 'REJECT', offer: o })}
                            className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 font-bold transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <span className="text-[11px] font-semibold text-slate-400">
                          {o.status === 'ACCEPTED' ? '✓ Contract Locked' : 'No Action Needed'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Orders & Logistics Tracking View */}
      {activeTab === 'orders' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Orders List (5 cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-slate-800">
              Active Trade Contracts ({orders.length})
            </h3>

            {orders.map(ord => (
              <div
                key={ord.id}
                onClick={() => setSelectedOrder(ord)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedOrder?.id === ord.id
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-slate-900 dark:text-slate-100 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono-tech font-bold text-xs text-emerald-600 dark:text-emerald-400">
                    ORDER #{ord.id}
                  </span>
                  <StatusBadge status={ord.status} size="sm" />
                </div>
                <h5 className="font-bold text-xs mt-1">{ord.crop_name || 'Yellow Corn'}</h5>
                <p className="text-[11px] text-slate-500 mt-0.5 font-mono-tech">
                  {ord.quantity} Qtl • ₹{ord.total_price || (ord.quantity * ord.agreed_price)}
                </p>
              </div>
            ))}
          </div>

          {/* Right: Milestone Timeline & IoT Telemetry (7 cols) */}
          {selectedOrder && (
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-mono-tech font-bold text-slate-400 uppercase">Live Logistics Monitor</span>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                    ORDER #{selectedOrder.id} - {selectedOrder.crop_name || 'Yellow Corn'}
                  </h3>
                </div>
                <StatusBadge status={selectedOrder.status} />
              </div>

              {/* Milestone Timeline */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Contract Settlement Milestones
                </h4>

                <div className="relative pl-6 space-y-4 border-l-2 border-emerald-500/30">
                  {(selectedOrder.milestones || [
                    { title: 'Contract Locked & Escrow Funded', date: 'Mar 28, 2026', done: true },
                    { title: 'Quality Verification at Gate', date: 'Mar 29, 2026', done: true },
                    { title: 'Dispatched & Live GPS Tracking', date: 'Mar 30, 2026', done: true },
                    { title: 'Hub Inspection & Unloading', date: 'Expected Apr 02', done: false },
                    { title: 'Escrow Auto-Settlement', date: 'Pending Unloading', done: false },
                  ]).map((m, idx) => (
                    <div key={idx} className="relative">
                      <span
                        className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 bg-white dark:bg-slate-900 ${
                          m.done
                            ? 'border-emerald-500 bg-emerald-500 text-white'
                            : 'border-slate-300 dark:border-slate-700'
                        } flex items-center justify-center text-[9px]`}
                      >
                        {m.done && '✓'}
                      </span>
                      <h5 className={`text-xs font-bold ${m.done ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400'}`}>
                        {m.title}
                      </h5>
                      <p className="text-[10px] font-mono-tech text-slate-400">{m.date}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Telemetry & Driver Card */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500">Transit Driver</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 font-mono-tech">
                    {selectedOrder.driver_name || 'Rajesh Sharma (Truck KA-04-E-8820)'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500">IoT Cargo Sensor Telemetry</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono-tech">
                    {selectedOrder.sensor_telemetry || '24°C / 42% RH (Sensor OK)'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500">Smart Contract Hash</span>
                  <span className="font-mono-tech text-[10px] text-slate-400">
                    {selectedOrder.contract_hash || '0x8f3c91a4e1b2'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Action Confirmation Modal */}
      <Modal
        isOpen={actionConfirmModal.open}
        onClose={() => setActionConfirmModal({ open: false, type: 'ACCEPT', offer: null })}
        title={actionConfirmModal.type === 'ACCEPT' ? 'Confirm Accept Offer' : 'Confirm Reject Offer'}
        subtitle="This action will update the contract status on AgriLink Smart Settlement."
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            Are you sure you want to {actionConfirmModal.type === 'ACCEPT' ? 'ACCEPT' : 'REJECT'} the buy offer for{' '}
            <strong>{actionConfirmModal.offer?.crop_title || 'Produce'}</strong> at{' '}
            <strong>₹{actionConfirmModal.offer?.price}/Qtl</strong>?
          </p>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setActionConfirmModal({ open: false, type: 'ACCEPT', offer: null })}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (actionConfirmModal.offer) {
                  handleOfferStatusChange(actionConfirmModal.offer.id, actionConfirmModal.type === 'ACCEPT' ? 'ACCEPTED' : 'REJECTED');
                }
              }}
              disabled={processingAction}
              className={`px-5 py-2 rounded-xl text-white font-bold ${
                actionConfirmModal.type === 'ACCEPT' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
              }`}
            >
              {processingAction ? 'Processing...' : `Confirm ${actionConfirmModal.type}`}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
