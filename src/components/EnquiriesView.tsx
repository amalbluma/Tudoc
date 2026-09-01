import React, { useState } from 'react';
import {
  MessageSquare,
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  User,
  MapPin,
  Calendar,
  DollarSign,
  Compass,
  Sparkles,
  ArrowRight,
  Tag,
  Layers
} from 'lucide-react';
import { EnquiryItem } from '../types/costing';
import { INITIAL_ENQUIRIES } from '../data/operationsData';

interface EnquiriesViewProps {
  onConvertToQuote: (enquiry: EnquiryItem) => void;
  onCurateItinerary?: (enquiry: EnquiryItem) => void;
  onOpenNewEnquiry: () => void;
}

export const EnquiriesView: React.FC<EnquiriesViewProps> = ({
  onConvertToQuote,
  onCurateItinerary,
  onOpenNewEnquiry,
}) => {
  const [enquiries, setEnquiries] = useState<EnquiryItem[]>(INITIAL_ENQUIRIES);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const filtered = enquiries.filter(enq => {
    const matchesSearch = enq.clientName.toLowerCase().includes(search.toLowerCase()) ||
      enq.destination.toLowerCase().includes(search.toLowerCase()) ||
      enq.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || enq.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-amber-500" />
              <span>Enquiries & CRM Pipeline</span>
            </h2>
            <span className="text-xs bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full font-bold border border-amber-200">
              {filtered.length} Active Leads
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Intake client inquiries and seamlessly convert them to live Itinerary & Quote Curation
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenNewEnquiry}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Client Enquiry</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search enquiries by client, destination, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs text-slate-800 placeholder-slate-400 bg-transparent focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Status:</span>
          <select
            aria-label="Filter enquiries by status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1"
          >
            <option value="All">All Statuses</option>
            <option value="New">New</option>
            <option value="In Contact">In Contact</option>
            <option value="Quoted">Quoted</option>
            <option value="Won">Won</option>
            <option value="Lost">Lost</option>
          </select>
        </div>
      </div>

      {/* Enquiries Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((enq) => (
          <div
            key={enq.id}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-500/50 transition-all space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {enq.source} • Ref: {enq.id}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">{enq.clientName}</h3>
                  <p className="text-[11px] text-slate-500">{enq.email} · {enq.phone}</p>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      enq.status === 'Won'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : enq.status === 'Quoted'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : enq.status === 'In Contact'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {enq.status}
                  </span>
                  {enq.travelStyleTier && (
                    <span className="text-[9px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {enq.travelStyleTier.split('/')[0].trim()}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="font-medium truncate">{enq.destination}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>{enq.durationDays ? `${enq.durationDays}D in ` : ''}{enq.travelMonth}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span>{enq.paxAdults} Adults, {enq.paxChildren} Kids</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="font-bold text-slate-900">${(enq.estimatedBudgetUsd ?? 0).toLocaleString()} Budget</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 italic">"{enq.notes}"</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap text-xs">
              <div className="text-slate-400 text-[11px]">
                Assigned to: <strong className="text-slate-700">{enq.assignedTo}</strong>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onConvertToQuote(enq)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
                >
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Costing</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (onCurateItinerary) {
                      onCurateItinerary(enq);
                    } else {
                      onConvertToQuote(enq);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition-all shadow-xs active:scale-95 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Curate Itinerary & Quote</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
