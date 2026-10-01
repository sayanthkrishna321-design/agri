import React, { useState } from 'react';
import { 
  History, Search, Filter, Calendar, FileText, Download, 
  ArrowUpRight, CheckCircle2, Lock, ShieldCheck, Eye
} from 'lucide-react';
import { TransactionRecord } from '../types';
import { DEMO_TRANSACTIONS } from '../services/api';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Modal } from '../components/ui/Modal';

export const TransactionsPage: React.FC = () => {
  const [transactions] = useState<TransactionRecord[]>(DEMO_TRANSACTIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [selectedTx, setSelectedTx] = useState<TransactionRecord | null>(null);

  const filteredTx = transactions.filter(t => {
    const matchesSearch = t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.related_item.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.counterpart.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'ALL' || t.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold mb-2">
            <History className="w-3.5 h-3.5" />
            <span>AgriSentinel X & AgriLink Commercial Ledger</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
            Transaction History & Audit Ledger
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Complete activity log for produce trade contracts, smart escrow locks, and insurance claim dossiers.
          </p>
        </div>
      </div>

      {/* 2. Controls & Search */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search TX-ID, produce, or buyer name..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto text-xs">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-semibold focus:outline-none"
          >
            <option value="ALL">All Transaction Types</option>
            <option value="Produce Sale">Produce Sale</option>
            <option value="Escrow Lock">Escrow Lock</option>
            <option value="Claim Preparation">Claim Preparation</option>
            <option value="Procurement Order">Procurement Order</option>
          </select>
        </div>
      </div>

      {/* 3. Transaction Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 font-bold uppercase text-slate-500 tracking-wider">
              <tr>
                <th className="p-4">Reference ID</th>
                <th className="p-4">Date</th>
                <th className="p-4">Type</th>
                <th className="p-4">Related Produce / Dossier</th>
                <th className="p-4">Counterpart</th>
                <th className="p-4">Quantity</th>
                <th className="p-4">Value / Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTx.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 font-mono-tech font-bold text-emerald-600 dark:text-emerald-400">
                    {tx.id}
                  </td>
                  <td className="p-4 font-mono-tech text-slate-600 dark:text-slate-300">
                    {tx.date}
                  </td>
                  <td className="p-4 font-semibold text-slate-900 dark:text-slate-100">
                    {tx.type}
                  </td>
                  <td className="p-4 text-slate-700 dark:text-slate-300 font-medium">
                    {tx.related_item}
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-300">
                    {tx.counterpart}
                  </td>
                  <td className="p-4 font-mono-tech font-bold text-slate-900 dark:text-slate-100">
                    {tx.quantity}
                  </td>
                  <td className="p-4 font-mono-tech font-bold text-emerald-600 dark:text-emerald-400">
                    {tx.amount}
                  </td>
                  <td className="p-4">
                    <StatusBadge status={tx.status} />
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setSelectedTx(tx)}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 hover:text-emerald-600 transition-colors"
                      title="View Transaction Record"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Details Modal */}
      {selectedTx && (
        <Modal
          isOpen={Boolean(selectedTx)}
          onClose={() => setSelectedTx(null)}
          title={`Transaction Ledger Record #${selectedTx.id}`}
          subtitle={`Type: ${selectedTx.type} • Date: ${selectedTx.date}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Related Item</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{selectedTx.related_item}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Counterpart</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{selectedTx.counterpart}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Contract Value</span>
                <span className="font-bold text-emerald-600 font-mono-tech">{selectedTx.amount}</span>
              </div>
            </div>

            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {selectedTx.details}
            </p>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedTx(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
