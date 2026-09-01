import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Search,
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  DollarSign,
  Calendar,
  Send,
  Printer,
  Trash2,
  Edit2,
  X,
  CreditCard,
  Building2,
  User,
  Eye
} from 'lucide-react';
import { InvoiceItem, SavedQuote } from '../types/costing';
import { INITIAL_INVOICES } from '../data/operationsData';
import { TusafiriLogo } from './TusafiriLogo';

interface InvoicesViewProps {
  savedQuotes?: SavedQuote[];
  onNavigateToCosting?: (quote: SavedQuote) => void;
}

export const InvoicesView: React.FC<InvoicesViewProps> = ({
  savedQuotes = [],
  onNavigateToCosting
}) => {
  const [invoices, setInvoices] = useState<InvoiceItem[]>(() => {
    try {
      const saved = localStorage.getItem('tusafiri_invoices_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return INITIAL_INVOICES;
  });

  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState<InvoiceItem | null>(null);
  const [editingPaymentInvoice, setEditingPaymentInvoice] = useState<InvoiceItem | null>(null);
  const [paymentInput, setPaymentInput] = useState<number>(0);

  // New Invoice Form
  const [newInvoiceData, setNewInvoiceData] = useState<{
    clientName: string;
    quoteRef: string;
    totalAmountUsd: number;
    amountPaidUsd: number;
    dueDate: string;
    notes: string;
  }>({
    clientName: '',
    quoteRef: '',
    totalAmountUsd: 0,
    amountPaidUsd: 0,
    dueDate: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split('T')[0],
    notes: 'East Africa Safari Package Booking Deposit'
  });

  const saveInvoicesState = (newInvoices: InvoiceItem[]) => {
    setInvoices(newInvoices);
    try {
      localStorage.setItem('tusafiri_invoices_v2', JSON.stringify(newInvoices));
    } catch (e) {}
  };

  const filtered = invoices.filter(inv => {
    const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.quoteRef.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalInvoiced = invoices.reduce((sum, i) => sum + (i.totalAmountUsd || 0), 0);
  const totalPaid = invoices.reduce((sum, i) => sum + (i.amountPaidUsd || 0), 0);
  const totalBalance = totalInvoiced - totalPaid;

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvoiceData.clientName || newInvoiceData.totalAmountUsd <= 0) {
      alert('Please provide a client name and a valid total amount.');
      return;
    }

    const nextNumber = `INV-${new Date().getFullYear()}-${String(invoices.length + 101).padStart(3, '0')}`;
    const initialStatus =
      newInvoiceData.amountPaidUsd >= newInvoiceData.totalAmountUsd
        ? 'Paid'
        : newInvoiceData.amountPaidUsd > 0
        ? 'Partially Paid'
        : 'Issued';

    const newInv: InvoiceItem = {
      id: `inv-${Date.now()}`,
      invoiceNumber: nextNumber,
      clientName: newInvoiceData.clientName,
      quoteRef: newInvoiceData.quoteRef || `TAS-${Math.floor(1000 + Math.random() * 9000)}`,
      totalAmountUsd: Number(newInvoiceData.totalAmountUsd),
      amountPaidUsd: Number(newInvoiceData.amountPaidUsd) || 0,
      dueDate: newInvoiceData.dueDate,
      status: initialStatus as any
    };

    saveInvoicesState([newInv, ...invoices]);
    setIsCreateModalOpen(false);
    setNewInvoiceData({
      clientName: '',
      quoteRef: '',
      totalAmountUsd: 0,
      amountPaidUsd: 0,
      dueDate: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split('T')[0],
      notes: ''
    });
  };

  const handleApplyQuote = (quote: SavedQuote) => {
    setNewInvoiceData({
      clientName: quote.clientInputs.clientName || 'Unnamed Client',
      quoteRef: quote.clientInputs.quoteReference || 'TAS-REF',
      totalAmountUsd: quote.totals.grandSellingPriceUsd,
      amountPaidUsd: 0,
      dueDate: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split('T')[0],
      notes: `${quote.itinerary.length}-Day Safari in East Africa for ${quote.clientInputs.paxAdults} adults`
    });
  };

  const handleUpdatePayment = () => {
    if (!editingPaymentInvoice) return;
    const updated = invoices.map(inv => {
      if (inv.id === editingPaymentInvoice.id) {
        const newPaid = Number(paymentInput);
        let newStatus: 'Paid' | 'Partially Paid' | 'Issued' | 'Overdue' = 'Issued';
        if (newPaid >= inv.totalAmountUsd) {
          newStatus = 'Paid';
        } else if (newPaid > 0) {
          newStatus = 'Partially Paid';
        }
        return {
          ...inv,
          amountPaidUsd: newPaid,
          status: newStatus
        };
      }
      return inv;
    });

    saveInvoicesState(updated);
    setEditingPaymentInvoice(null);
  };

  const handleDeleteInvoice = (id: string) => {
    if (confirm('Are you sure you want to delete this invoice record?')) {
      saveInvoicesState(invoices.filter(i => i.id !== id));
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-slate-900">
              Invoices & Accounts Receivable
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
              {invoices.length} Invoices
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Deposit schedules, bank wire reconciliations, STO supplier remittances & client statements
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search invoices or clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <select
            aria-label="Filter invoices by status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-hidden"
          >
            <option value="All">All Invoices ({invoices.length})</option>
            <option value="Paid">Paid</option>
            <option value="Partially Paid">Partially Paid</option>
            <option value="Issued">Issued</option>
            <option value="Overdue">Overdue</option>
          </select>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create Invoice</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Total Invoiced</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            ${(totalInvoiced ?? 0).toLocaleString()}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Total Received (Payments)</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            ${(totalPaid ?? 0).toLocaleString()}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Outstanding Receivables</span>
          <div className="text-2xl font-black text-amber-600 mt-1">
            ${(totalBalance ?? 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Quote Ref</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4 text-right">Total USD</th>
                <th className="py-3 px-4 text-right">Paid USD</th>
                <th className="py-3 px-4 text-right">Balance</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No invoice records found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((inv) => {
                  const balance = (inv.totalAmountUsd || 0) - (inv.amountPaidUsd || 0);
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{inv.invoiceNumber}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{inv.clientName}</td>
                      <td className="py-3 px-4 font-mono text-slate-500">{inv.quoteRef}</td>
                      <td className="py-3 px-4 text-slate-600">{inv.dueDate}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        ${(inv.totalAmountUsd ?? 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-emerald-600 font-medium">
                        ${(inv.amountPaidUsd ?? 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-black text-amber-600">
                        ${(balance ?? 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            inv.status === 'Paid'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : inv.status === 'Partially Paid'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : inv.status === 'Overdue'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPaymentInvoice(inv);
                              setPaymentInput(inv.amountPaidUsd || 0);
                            }}
                            className="p-1 text-slate-400 hover:text-emerald-600 rounded transition-colors"
                            title="Record Payment"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedInvoiceForPrint(inv)}
                            className="p-1 text-slate-400 hover:text-slate-900 rounded transition-colors"
                            title="View / Print Official Invoice"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteInvoice(inv.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                            title="Delete Invoice"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE INVOICE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-amber-600" />
                <span>Create Client Invoice</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Populate from Saved Quotes */}
            {savedQuotes.length > 0 && (
              <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/60 text-xs">
                <span className="text-[10px] font-bold uppercase text-amber-800 block mb-1.5">
                  Populate From Existing Quotations / Bookings:
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {savedQuotes.map((q) => (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => handleApplyQuote(q)}
                      className="px-2 py-1 bg-white hover:bg-amber-100 border border-amber-200 rounded text-[11px] font-medium text-slate-800 transition-colors"
                    >
                      {q.clientInputs.clientName || 'Client'} ({q.clientInputs.quoteReference || 'REF'}) — ${q.totals.grandSellingPriceUsd.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleCreateInvoice} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Client Name / Organization:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe / Horizon Safaris UK"
                  value={newInvoiceData.clientName}
                  onChange={(e) => setNewInvoiceData({ ...newInvoiceData, clientName: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Quote Reference:</label>
                  <input
                    type="text"
                    placeholder="TAS-2026-001"
                    value={newInvoiceData.quoteRef}
                    onChange={(e) => setNewInvoiceData({ ...newInvoiceData, quoteRef: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Payment Due Date:</label>
                  <input
                    type="date"
                    required
                    value={newInvoiceData.dueDate}
                    onChange={(e) => setNewInvoiceData({ ...newInvoiceData, dueDate: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Total Amount (USD):</label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    value={newInvoiceData.totalAmountUsd || ''}
                    onChange={(e) => setNewInvoiceData({ ...newInvoiceData, totalAmountUsd: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Deposit / Paid So Far ($):</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newInvoiceData.amountPaidUsd || ''}
                    onChange={(e) => setNewInvoiceData({ ...newInvoiceData, amountPaidUsd: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-emerald-700 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Invoice Notes / Description:</label>
                <textarea
                  rows={2}
                  value={newInvoiceData.notes}
                  onChange={(e) => setNewInvoiceData({ ...newInvoiceData, notes: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl shadow-xs"
                >
                  Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD PAYMENT MODAL */}
      {editingPaymentInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>Record Client Payment</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingPaymentInvoice(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
              <div className="font-bold text-slate-900">{editingPaymentInvoice.clientName}</div>
              <div className="text-slate-500 font-mono text-[11px]">Invoice #{editingPaymentInvoice.invoiceNumber}</div>
              <div className="font-mono font-bold text-slate-800 pt-1">
                Total Invoiced: ${(editingPaymentInvoice.totalAmountUsd || 0).toLocaleString()} USD
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Cumulative Amount Received ($):</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={paymentInput}
                  onChange={(e) => setPaymentInput(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-base font-bold text-emerald-700"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentInput(editingPaymentInvoice.totalAmountUsd)}
                  className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-bold hover:bg-emerald-100"
                >
                  Mark Full Paid (${editingPaymentInvoice.totalAmountUsd.toLocaleString()})
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentInput(Math.round(editingPaymentInvoice.totalAmountUsd * 0.3))}
                  className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-[11px] font-semibold hover:bg-slate-200"
                >
                  30% Deposit
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingPaymentInvoice(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdatePayment}
                className="px-5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-xs"
              >
                Save Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW & PRINT INVOICE MODAL */}
      {selectedInvoiceForPrint && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-6">
              <div className="space-y-2">
                <TusafiriLogo variant="full" theme="light" size="lg" showSubtitle />
                <p className="text-[11px] text-slate-500">
                  Tusafiri House, Karen Road, P.O. Box 4820-00502, Nairobi, Kenya<br />
                  Email: accounts@tusafiriafrica.com • Tel: +254 712 345 678
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase tracking-widest font-bold text-amber-600 block mb-1">Official Safari Invoice</span>
                <div className="font-mono text-lg font-black text-slate-950">{selectedInvoiceForPrint.invoiceNumber}</div>
                <div className="text-xs text-slate-500 mt-1">Due Date: <strong className="text-slate-800">{selectedInvoiceForPrint.dueDate}</strong></div>
                <div className="text-xs text-slate-500">Quote Ref: <strong className="text-slate-800">{selectedInvoiceForPrint.quoteRef}</strong></div>
              </div>
            </div>

            {/* Bill To */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Billed To</span>
                <div className="font-bold text-sm text-slate-900">{selectedInvoiceForPrint.clientName}</div>
                <div className="text-slate-600 mt-0.5">Safari Traveler / Tour Agency</div>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Payment Status</span>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                    selectedInvoiceForPrint.status === 'Paid'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}
                >
                  {selectedInvoiceForPrint.status}
                </span>
              </div>
            </div>

            {/* Line Items */}
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Description</th>
                    <th className="p-3 text-right">Amount (USD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-3">
                      <div className="font-bold text-slate-900">Custom East Africa Safari Package (Quote {selectedInvoiceForPrint.quoteRef})</div>
                      <div className="text-slate-500 text-[11px]">Includes all STO luxury lodge accommodations, 4x4 Land Cruiser transport, park fees, naturalist driver-guide & statutory taxes</div>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900">
                      ${(selectedInvoiceForPrint.totalAmountUsd || 0).toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Totals Summary */}
            <div className="space-y-1.5 text-xs text-right pt-2">
              <div className="flex justify-end gap-8 text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono font-semibold">${(selectedInvoiceForPrint.totalAmountUsd || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-end gap-8 text-emerald-700 font-semibold">
                <span>Total Received Payments:</span>
                <span className="font-mono">${(selectedInvoiceForPrint.amountPaidUsd || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-end gap-8 text-base font-black text-slate-950 border-t border-slate-200 pt-2">
                <span>Balance Due:</span>
                <span className="font-mono text-amber-700">
                  ${((selectedInvoiceForPrint.totalAmountUsd || 0) - (selectedInvoiceForPrint.amountPaidUsd || 0)).toLocaleString()} USD
                </span>
              </div>
            </div>

            {/* Bank Wire Details */}
            <div className="p-3.5 bg-slate-900 text-white rounded-xl text-[11px] space-y-1">
              <span className="font-bold text-amber-400 block">Bank Wire Instructions (USD Remittance):</span>
              <div>Bank: Standard Chartered Bank Kenya • Swift: SCBLKENX</div>
              <div>Account Name: Tusafiri Africa Limited • Acc No: 01080000000000</div>
              <div>Beneficiary Reference: {selectedInvoiceForPrint.invoiceNumber} / {selectedInvoiceForPrint.quoteRef}</div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setSelectedInvoiceForPrint(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl flex items-center gap-1.5 shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Export PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
