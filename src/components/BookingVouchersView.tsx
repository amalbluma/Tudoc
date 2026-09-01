import React, { useState } from 'react';
import {
  BedDouble,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Compass,
  Copy,
  Download,
  FileCheck,
  Filter,
  Globe,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Palmtree,
  Phone,
  Plane,
  Printer,
  QrCode,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Ticket,
  Truck,
  Users,
  Utensils
} from 'lucide-react';
import {
  BookingVoucher,
  ClientQuotationInputs,
  ItineraryDay,
  SavedQuote,
  STOAccommodationProperty,
  VoucherStatus,
  VoucherType
} from '../types/costing';
import { TusafiriLogo } from './TusafiriLogo';
import { exportElementToPdf } from '../utils/pdfExport';
import { generateVouchersFromItinerary } from '../utils/voucherGenerator';

interface BookingVouchersViewProps {
  currentVouchers?: BookingVoucher[];
  clientInputs: ClientQuotationInputs;
  itinerary: ItineraryDay[];
  stoProperties?: STOAccommodationProperty[];
  savedQuotes?: SavedQuote[];
  onNavigateToQuote?: () => void;
  onNavigateToTourDoc?: () => void;
}

export const BookingVouchersView: React.FC<BookingVouchersViewProps> = ({
  currentVouchers,
  clientInputs,
  itinerary,
  stoProperties = [],
  savedQuotes = [],
  onNavigateToQuote,
  onNavigateToTourDoc
}) => {
  // Generate or hold vouchers
  const [vouchers, setVouchers] = useState<BookingVoucher[]>(() => {
    if (currentVouchers && currentVouchers.length > 0) return currentVouchers;
    return generateVouchersFromItinerary(clientInputs, itinerary, stoProperties);
  });

  const [activeFilter, setActiveFilter] = useState<VoucherType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isExportingAll, setIsExportingAll] = useState(false);
  const [exportingVoucherId, setExportingVoucherId] = useState<string | null>(null);
  const [copiedVoucherId, setCopiedVoucherId] = useState<string | null>(null);
  const [selectedQuoteRef, setSelectedQuoteRef] = useState<string>(clientInputs.quoteReference || 'current');

  // Handle regenerating vouchers if itinerary changes
  const handleRegenerate = () => {
    const fresh = generateVouchersFromItinerary(clientInputs, itinerary, stoProperties);
    setVouchers(fresh);
  };

  // Handle loading vouchers from a saved quote
  const handleSelectQuote = (quoteRef: string) => {
    setSelectedQuoteRef(quoteRef);
    if (quoteRef === 'current') {
      setVouchers(generateVouchersFromItinerary(clientInputs, itinerary, stoProperties));
    } else {
      const found = savedQuotes.find(q => q.clientInputs.quoteReference === quoteRef);
      if (found) {
        setVouchers(generateVouchersFromItinerary(found.clientInputs, found.itinerary, stoProperties));
      }
    }
  };

  const handleUpdateStatus = (id: string, newStatus: VoucherStatus) => {
    setVouchers(prev => prev.map(v => v.id === id ? { ...v, status: newStatus } : v));
  };

  const handleUpdateConfRef = (id: string, newRef: string) => {
    setVouchers(prev => prev.map(v => v.id === id ? { ...v, supplierConfirmationRef: newRef } : v));
  };

  const handleCopyVoucherText = (vch: BookingVoucher) => {
    const text = `TUSAFIRI SERVICE VOUCHER: ${vch.voucherNumber}
Supplier: ${vch.supplierName}
Service: ${vch.serviceName}
Guest: ${vch.leadGuest} (${vch.paxAdults} Adults, ${vch.paxChildren} Kids)
Dates: ${vch.checkInDate} ${vch.checkOutDate ? `to ${vch.checkOutDate}` : ''}
Room/Plan: ${vch.roomType || 'Standard'} - ${vch.boardBasis || 'Full Board'}
Supplier Ref: ${vch.supplierConfirmationRef || 'Pending'}
Billing: ${vch.billingInstruction}
Emergency Dispatch: ${vch.emergencyContact}`;

    navigator.clipboard.writeText(text);
    setCopiedVoucherId(vch.id);
    setTimeout(() => setCopiedVoucherId(null), 3000);
  };

  const handleDownloadSinglePdf = async (vch: BookingVoucher) => {
    const el = document.getElementById(`voucher-card-${vch.id}`);
    if (!el) return;
    setExportingVoucherId(vch.id);

    const safeNum = vch.voucherNumber.replace(/[^a-zA-Z0-9_-]/g, '_');
    try {
      await exportElementToPdf(el, {
        filename: `Tusafiri_Voucher_${safeNum}.pdf`,
        orientation: 'portrait',
        format: 'a4',
        margin: [8, 8, 8, 8],
      });
    } catch (e) {
      console.error('Error exporting voucher PDF:', e);
    } finally {
      setExportingVoucherId(null);
    }
  };

  const handleDownloadAllPdf = async () => {
    const container = document.getElementById('all-vouchers-printable-vault');
    if (!container) return;
    setIsExportingAll(true);

    const refName = (clientInputs.quoteReference || 'Vouchers').replace(/[^a-zA-Z0-9_-]/g, '_');
    try {
      await exportElementToPdf(container, {
        filename: `Tusafiri_All_Booking_Vouchers_${refName}.pdf`,
        orientation: 'portrait',
        format: 'a4',
        margin: [10, 10, 10, 10],
      });
    } catch (e) {
      console.error('Error exporting all vouchers PDF:', e);
    } finally {
      setIsExportingAll(false);
    }
  };

  // Filtered vouchers list
  const filteredVouchers = vouchers.filter(v => {
    const matchesType = activeFilter === 'all' || v.voucherType === activeFilter;
    const matchesSearch = !searchQuery || 
      v.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.voucherNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.destination.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const hotelCount = vouchers.filter(v => v.voucherType === 'hotel').length;
  const transportCount = vouchers.filter(v => v.voucherType === 'transport').length;
  const parkCount = vouchers.filter(v => v.voucherType === 'park_fee').length;
  const flightCount = vouchers.filter(v => v.voucherType === 'flight').length;
  const activityCount = vouchers.filter(v => v.voucherType === 'activity').length;

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Banner & Action Controls */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                Hotel &amp; Service Provider Booking Vouchers Hub
              </h2>
              <p className="text-xs text-slate-500">
                Generate, edit, and export official supplier booking vouchers for confirmed lodges, safari cruisers, park conservation permits, and air transfers.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {savedQuotes.length > 0 && (
            <select
              value={selectedQuoteRef}
              onChange={(e) => handleSelectQuote(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:ring-1 focus:ring-amber-500"
            >
              <option value="current">Current Working Quote ({clientInputs.quoteReference})</option>
              {savedQuotes.map(q => (
                <option key={q.id} value={q.clientInputs.quoteReference}>
                  {q.clientInputs.quoteReference} - {q.clientInputs.clientName}
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            onClick={handleRegenerate}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
            title="Refresh vouchers against current itinerary days"
          >
            Sync / Regenerate
          </button>

          {onNavigateToTourDoc && (
            <button
              type="button"
              onClick={onNavigateToTourDoc}
              className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200 flex items-center gap-1.5 transition-colors"
            >
              <QrCode className="w-4 h-4 text-indigo-600" />
              Open TourDoc Portal
            </button>
          )}

          <button
            type="button"
            onClick={handleDownloadAllPdf}
            disabled={isExportingAll || vouchers.length === 0}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-bold rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
          >
            {isExportingAll ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                Exporting All PDF...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download All Vouchers (PDF)
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Vouchers ({vouchers.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('hotel')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeFilter === 'hotel'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            <BedDouble className="w-3.5 h-3.5" />
            Lodges &amp; Hotels ({hotelCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('transport')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeFilter === 'transport'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            4x4 Safari Fleet ({transportCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('park_fee')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeFilter === 'park_fee'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Park Conservation ({parkCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('flight')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeFilter === 'flight'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-sky-50 text-sky-800 hover:bg-sky-100'
            }`}
          >
            <Plane className="w-3.5 h-3.5" />
            Air Transfers ({flightCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('activity')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeFilter === 'activity'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Activities ({activityCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search lodge, ref, park..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Vouchers Container */}
      <div id="all-vouchers-printable-vault" className="space-y-6">
        {filteredVouchers.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center shadow-xs">
            <Ticket className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-900">No Vouchers Match Current Filters</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try adjusting your category filter or click "Sync / Regenerate" to rebuild vouchers from the itinerary.
            </p>
          </div>
        ) : (
          filteredVouchers.map((vch, vIdx) => {
            const isHotel = vch.voucherType === 'hotel';
            const isTransport = vch.voucherType === 'transport';
            const isPark = vch.voucherType === 'park_fee';
            const isFlight = vch.voucherType === 'flight';
            const isActivity = vch.voucherType === 'activity';

            return (
              <div
                key={vch.id}
                id={`voucher-card-${vch.id}`}
                className="bg-white rounded-2xl border-2 border-slate-200 shadow-md overflow-hidden voucher-card page-break-avoid transition-all hover:border-amber-400"
              >
                {/* Voucher Top Brand Header */}
                <div className="bg-slate-950 text-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <TusafiriLogo variant="full" theme="dark" size="sm" showSubtitle={false} />
                    <span className="text-slate-600 hidden sm:inline">|</span>
                    <span className="text-amber-400 font-bold text-xs uppercase tracking-wider">
                      Official Service Booking Voucher
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-right">
                    <div className="text-xs">
                      <span className="text-slate-400 block text-[10px]">VOUCHER NO:</span>
                      <strong className="text-white font-mono text-sm tracking-wider">{vch.voucherNumber}</strong>
                    </div>
                    <div className="pl-3 border-l border-slate-800">
                      <span className="text-slate-400 block text-[10px]">SAFARI REF:</span>
                      <strong className="text-amber-400 font-mono text-xs">{vch.quoteReference}</strong>
                    </div>
                  </div>
                </div>

                {/* Voucher Body */}
                <div className="p-5 sm:p-6 space-y-5">
                  
                  {/* Supplier & Service Details */}
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-slate-100">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {isHotel && <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[11px] flex items-center gap-1"><BedDouble className="w-3 h-3" /> ACCOMMODATION</span>}
                        {isTransport && <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold text-[11px] flex items-center gap-1"><Truck className="w-3 h-3" /> SAFARI FLEET</span>}
                        {isPark && <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-900 font-bold text-[11px] flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> CONSERVATION PERMIT</span>}
                        {isFlight && <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-900 font-bold text-[11px] flex items-center gap-1"><Plane className="w-3 h-3" /> BUSH AIR TRANSFER</span>}
                        {isActivity && <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-900 font-bold text-[11px] flex items-center gap-1"><Sparkles className="w-3 h-3" /> EXCURSION</span>}
                        
                        <h3 className="text-base font-extrabold text-slate-900">
                          {vch.serviceName}
                        </h3>
                      </div>

                      <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-4 gap-y-1 pt-1">
                        <span><strong>Supplier:</strong> {vch.supplierName}</span>
                        <span><strong>Location:</strong> {vch.destination}</span>
                        {vch.supplierEmail && <span><strong>Email:</strong> {vch.supplierEmail}</span>}
                        {vch.supplierPhone && <span><strong>Phone:</strong> {vch.supplierPhone}</span>}
                      </div>
                    </div>

                    {/* Status and Editable Confirmation Ref */}
                    <div className="flex flex-col sm:items-end gap-2 shrink-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">Status:</span>
                        <select
                          value={vch.status}
                          onChange={(e) => handleUpdateStatus(vch.id, e.target.value as VoucherStatus)}
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                            vch.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                            vch.status === 'Issued' ? 'bg-sky-50 text-sky-800 border-sky-300' :
                            'bg-amber-50 text-amber-800 border-amber-300'
                          }`}
                        >
                          <option value="Confirmed">Confirmed</option>
                          <option value="Issued">Issued</option>
                          <option value="Awaiting Supplier">Awaiting Supplier</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-[10px] text-slate-400 font-semibold">Supplier Ref:</span>
                        <input
                          type="text"
                          value={vch.supplierConfirmationRef || ''}
                          onChange={(e) => handleUpdateConfRef(vch.id, e.target.value)}
                          placeholder="Enter Conf#"
                          className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-xs font-mono font-bold w-32 focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Booking Specs Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-[#FAF7F2] p-4 rounded-xl border border-[#E8DFC8]">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Lead Guest</span>
                      <strong className="text-slate-900">{vch.leadGuest}</strong>
                      <span className="text-[11px] text-amber-900 block font-medium">
                        {vch.paxAdults} Adults{vch.paxChildren > 0 ? `, ${vch.paxChildren} Kids` : ''}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Check-In / Service Date</span>
                      <strong className="text-slate-900">{vch.checkInDate}</strong>
                      {vch.checkOutDate && vch.checkOutDate !== vch.checkInDate && (
                        <span className="text-[11px] text-slate-600 block">Out: {vch.checkOutDate}</span>
                      )}
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Room &amp; Board Plan</span>
                      <strong className="text-slate-900">{vch.roomType || 'Standard'}</strong>
                      <span className="text-[11px] text-emerald-800 block font-semibold">{vch.boardBasis || 'Full Board'}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Duration</span>
                      <strong className="text-slate-900">
                        {vch.nightsCount && vch.nightsCount > 0 ? `${vch.nightsCount} Night${vch.nightsCount > 1 ? 's' : ''}` : 'Day Service'}
                      </strong>
                      <span className="text-[10px] text-slate-500 block">Issued: {vch.issuedDate}</span>
                    </div>
                  </div>

                  {/* Inclusions & Special Instructions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      <h4 className="font-bold text-slate-900 mb-1.5 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Included Services
                      </h4>
                      <ul className="space-y-1 text-slate-600 text-[11px]">
                        {vch.inclusions.map((inc, iIdx) => (
                          <li key={iIdx} className="flex items-start gap-1.5">
                            <span className="text-emerald-600 font-bold">•</span>
                            <span>{inc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                      <div>
                        <h4 className="font-bold text-slate-900 mb-1 text-[11px] uppercase tracking-wider">
                          Special Requests &amp; Dietary
                        </h4>
                        <p className="text-[11px] text-slate-600 italic">
                          {vch.specialRequests || 'Standard VIP safari setup. Advise camp manager of guest arrival time.'}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-200 text-[10px]">
                        <span className="font-bold text-slate-700">Tusafiri 24/7 Operations Desk:</span>{' '}
                        <span className="text-amber-800 font-semibold">{vch.emergencyContact}</span>
                      </div>
                    </div>
                  </div>

                  {/* Mandatory Billing Authorization Stamp */}
                  <div className="bg-amber-50/80 border-2 border-amber-300 rounded-xl p-3.5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="font-bold text-amber-950 block text-[11px] uppercase tracking-wider">
                        ★ Mandatory Billing Instruction:
                      </span>
                      <p className="text-amber-900 text-xs font-semibold">
                        {vch.billingInstruction}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="px-2.5 py-1 rounded bg-amber-200 text-amber-950 font-bold text-[10px] uppercase tracking-wide border border-amber-300">
                        DIRECT ACCOUNT SETTLEMENT
                      </span>
                    </div>
                  </div>

                  {/* Voucher Footer Action Buttons */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs print:hidden">
                    <div className="text-[11px] text-slate-400">
                      Signed &amp; Approved by: <strong className="text-slate-700">{vch.issuedBy}</strong>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopyVoucherText(vch)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg flex items-center gap-1 text-[11px] transition-colors"
                      >
                        {copiedVoucherId === vch.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            Copy Details
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownloadSinglePdf(vch)}
                        disabled={exportingVoucherId === vch.id}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-extrabold rounded-lg flex items-center gap-1 text-[11px] transition-colors shadow-2xs disabled:opacity-50"
                      >
                        {exportingVoucherId === vch.id ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            Exporting...
                          </>
                        ) : (
                          <>
                            <Download className="w-3 h-3" />
                            Export PDF
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
