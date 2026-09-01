import React, { useState } from 'react';
import {
  BedDouble,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  Download,
  FileCheck2,
  FileSpreadsheet,
  Globe2,
  HeartHandshake,
  Loader2,
  Mail,
  MapPin,
  Palmtree,
  Phone,
  Printer,
  QrCode,
  ShieldCheck,
  Sparkles,
  Ticket,
  Users,
  Utensils,
  XCircle
} from 'lucide-react';
import {
  ClientQuotationInputs,
  CostingTotals,
  DayCostBreakdown,
  ItineraryDay,
  STOAccommodationProperty,
  CompanySettings
} from '../types/costing';
import { STO_ACCOMMODATION_DATABASE } from '../data/stoAccommodationData';
import { PARK_FEES_DATABASE } from '../data/parkFeesData';
import { ACTIVITY_OPTIONS } from '../data/transportAndExtrasData';
import { formatCurrency } from '../utils/costingEngine';
import { EastAfricaRouteVisualSummary } from './EastAfricaRouteVisualSummary';
import { TusafiriLogo } from './TusafiriLogo';
import { exportElementToPdf } from '../utils/pdfExport';

interface ItineraryQuotePreviewProps {
  clientInputs: ClientQuotationInputs;
  itinerary: ItineraryDay[];
  breakdowns: DayCostBreakdown[];
  totals: CostingTotals;
  stoProperties?: STOAccommodationProperty[];
  settings?: CompanySettings;
  onPrint: () => void;
  onOpenVouchers?: () => void;
  onOpenTourDoc?: () => void;
}

export const ItineraryQuotePreview: React.FC<ItineraryQuotePreviewProps> = ({
  clientInputs,
  itinerary,
  breakdowns,
  totals,
  stoProperties = STO_ACCOMMODATION_DATABASE,
  settings,
  onPrint,
  onOpenVouchers,
  onOpenTourDoc
}) => {
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfSuccessMessage, setPdfSuccessMessage] = useState<string | null>(null);

  const totalPax = (clientInputs?.paxAdults || 1) + (clientInputs?.paxChildren || 0);

  const handleDownloadPdf = async () => {
    const quoteElement = document.getElementById('printable-quote-content');
    if (!quoteElement) return;

    setIsExportingPdf(true);
    setPdfSuccessMessage(null);

    const safeClient = (clientInputs.clientName || 'Safari-Guest').replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeRef = (clientInputs.quoteReference || 'Quote').replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `Tusafiri_Safari_Quotation_${safeRef}_${safeClient}.pdf`;

    try {
      await exportElementToPdf(quoteElement, {
        filename,
        orientation: 'portrait',
        format: 'a4',
        margin: [10, 10, 10, 10],
      });
      setPdfSuccessMessage('PDF downloaded successfully!');
      setTimeout(() => setPdfSuccessMessage(null), 4000);
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div id="itinerary-quote-document" className="space-y-6">
      
      {/* Action Bar (Hidden on print) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Client Safari Itinerary & Official Proposal
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
              Ref: {clientInputs.quoteReference || 'TUS-2026'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Dynamically linked to the Master Costing Engine. Export as high-resolution PDF, generate hotel booking vouchers, or launch Live TourDoc.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* TourDoc Live Portal Trigger */}
          {onOpenTourDoc && (
            <button
              type="button"
              onClick={onOpenTourDoc}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200 transition-colors shadow-2xs"
              title="Launch Live TourDoc Safari Portal for guests & running tours"
            >
              <QrCode className="w-4 h-4 text-indigo-600" />
              Live TourDoc Portal
            </button>
          )}

          {/* Supplier Booking Vouchers Trigger */}
          {onOpenVouchers && (
            <button
              type="button"
              onClick={onOpenVouchers}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 transition-colors shadow-2xs"
              title="Generate Hotel and Service Provider Booking Vouchers"
            >
              <Ticket className="w-4 h-4 text-emerald-600" />
              Booking Vouchers
            </button>
          )}

          {/* Download PDF via html2pdf */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isExportingPdf}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 text-xs font-extrabold rounded-xl shadow-sm transition-colors disabled:opacity-50"
          >
            {isExportingPdf ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download as PDF
              </>
            )}
          </button>

          {/* Standard Print / Browser Dialog */}
          <button
            type="button"
            onClick={onPrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            Print
          </button>
        </div>
      </div>

      {pdfSuccessMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 animate-fadeIn print:hidden">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{pdfSuccessMessage}</span>
        </div>
      )}

      {/* Main Quote Document Container */}
      <div
        id="printable-quote-content"
        className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden p-6 sm:p-10 max-w-5xl mx-auto text-slate-800 print:shadow-none print:border-none print:p-0"
      >
        
        {/* Brand Header */}
        <div className="border-b-2 border-amber-500/80 pb-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <TusafiriLogo variant="full" theme="light" size="xl" showSubtitle />
          </div>

          {/* Quote Meta */}
          <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E8DFC8] text-xs space-y-1 md:text-right shadow-2xs">
            <div><span className="text-slate-500">Quotation Ref:</span> <strong className="text-slate-900 font-mono">{clientInputs.quoteReference}</strong></div>
            <div><span className="text-slate-500">Issued For:</span> <strong className="text-slate-900">{clientInputs.clientName}</strong></div>
            <div><span className="text-slate-500">Travel Dates:</span> <strong className="text-slate-900">{clientInputs.travelStartDate} to {clientInputs.travelEndDate}</strong></div>
            <div><span className="text-slate-500">Guests:</span> <strong className="text-amber-800">{totalPax} Guests ({clientInputs.paxAdults} Adults{clientInputs.paxChildren > 0 ? `, ${clientInputs.paxChildren} Kids` : ''})</strong></div>
          </div>
        </div>

        {/* Executive Itinerary Summary */}
        <div className="mb-8 bg-amber-50/60 rounded-xl p-5 border border-amber-200/80 page-break-avoid">
          <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            Safari Expedition Highlights
          </h3>
          <p className="text-xs leading-relaxed text-slate-700">
            Welcome to your handcrafted East African safari curated exclusively by Tusafiri Africa Safaris. Over the course of {itinerary.length} days, you will experience the greatest wildlife theaters on earth in private 4x4 Land Cruisers with certified safari naturalist guides, staying at handpicked luxury wilderness lodges on full board and all-inclusive arrangements.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-amber-200 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">Duration:</span>
              <strong className="text-slate-900">{itinerary.length} Days / {Math.max(1, itinerary.length - 1)} Nights</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Vehicle:</span>
              <strong className="text-slate-900">Custom 4x4 Safari Land Cruiser</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Evacuation:</span>
              <strong className="text-emerald-700">AMREF Flying Doctors Included</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Status:</span>
              <strong className="text-amber-700">Official STO Guaranteed</strong>
            </div>
          </div>
        </div>

        {/* Interactive Safari Route & Geographic Overview */}
        <div className="mb-10 space-y-4 page-break-avoid">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-500" />
            <span>East Africa Safari Route Overview</span>
          </h3>

          <EastAfricaRouteVisualSummary
            itinerary={itinerary}
            stoDatabase={stoProperties}
            clientInputs={clientInputs}
            activeDayIndex={0}
            onSelectDayIndex={() => {}}
          />
        </div>

        {/* Day-by-Day Itinerary Schedule */}
        <div className="mb-10 space-y-6">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-2">
            Detailed Day-by-Day Itinerary
          </h3>

          <div className="space-y-4">
            {itinerary.map((day, idx) => {
              const prop = stoProperties.find(p => p.id === day.propertyId);
              const park = PARK_FEES_DATABASE.find(p => p.id === day.parkFeeId);
              const acts = ACTIVITY_OPTIONS.filter(a => (day.activityIds || []).includes(a.id));

              return (
                <div
                  key={`quote-day-${day.dayNumber}-${idx}`}
                  className="bg-white rounded-xl border border-slate-200 p-4 space-y-2 hover:border-amber-400 transition-colors page-break-avoid"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded bg-slate-900 text-amber-400 font-bold text-xs">
                        Day {day.dayNumber}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900">
                        {day.title}
                      </h4>
                    </div>
                    <span className="text-xs text-slate-500 font-medium">
                      Destination: {day.destination}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {day.highlightSummary || day.notes || 'Full day game viewing and safari activities in the wild.'}
                  </p>
                  
                  {settings?.showPhotosInItinerary && day.dayImage && (
                    <div className="mt-3 mb-2 rounded-xl overflow-hidden shadow-sm border border-slate-200">
                      <img 
                        src={day.dayImage} 
                        alt={day.destination} 
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  )}

                  {/* Highlights Bar */}
                  <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <BedDouble className="w-3.5 h-3.5 text-amber-600" />
                      <span>Lodge: <strong>{prop?.name || 'Transit'}</strong> ({prop?.boardBasis || 'Full Board'})</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Park: <strong>{park?.parkName || 'National Park'}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <Utensils className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Meals: <strong>Breakfast, Lunch & Gourmet Dinner</strong></span>
                    </div>
                  </div>

                  {/* Included Activities Pills */}
                  {acts.length > 0 && (
                    <div className="flex items-center flex-wrap gap-1.5 pt-1">
                      <span className="text-[11px] text-amber-800 font-semibold">Included Experiences:</span>
                      {acts.map((act, actIdx) => (
                        <span
                          key={`${act.id}-${actIdx}`}
                          className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-semibold"
                        >
                          ★ {act.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Accommodation Summary Table */}
        <div className="mb-10 page-break-avoid">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
            Accommodation & Board Arrangements
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-900 text-white uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-2.5">Days</th>
                  <th className="p-2.5">Lodge / Camp</th>
                  <th className="p-2.5">Location</th>
                  <th className="p-2.5">Room Category</th>
                  <th className="p-2.5">Meal Plan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {itinerary.map((day, dIdx) => {
                  const prop = stoProperties.find(p => p.id === day.propertyId);
                  return (
                    <tr key={`acc-row-${day.dayNumber}-${dIdx}`} className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-slate-900">Day {day.dayNumber}</td>
                      <td className="p-2.5 font-semibold text-amber-900">{prop?.name || 'Nairobi Transit'}</td>
                      <td className="p-2.5 text-slate-600">{day.destination}</td>
                      <td className="p-2.5 text-slate-600">{prop?.roomCategory || 'Standard'}</td>
                      <td className="p-2.5">
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
                          {prop?.boardBasis || 'Full Board (FB)'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Inclusions & Exclusions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 text-xs page-break-avoid">
          <div className="bg-emerald-50/70 p-5 rounded-xl border border-emerald-200/80">
            <h4 className="font-bold text-emerald-950 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Comprehensive Safari Inclusions
            </h4>
            <ul className="space-y-1.5 text-emerald-900">
              <li>✓ All luxury lodge accommodation as specified on Full Board basis</li>
              <li>✓ All official Kenya & Tanzania national park and conservancy conservation fees</li>
              <li>✓ Exclusive use of custom 4x4 Safari Land Cruiser with pop-up roof hatch</li>
              <li>✓ Services of professional English-speaking safari naturalist driver-guide</li>
              <li>✓ Unlimited game drives during park operating hours with fuel and driver allowance</li>
              <li>✓ AMREF Flying Doctors 24/7 airborne emergency medical evacuation cover</li>
              <li>✓ Unlimited cold bottled mineral water and safari snacks in vehicle</li>
              <li>✓ Airport meet & greet service in Nairobi / Kilimanjaro</li>
              <li>✓ All government taxes, levies, and operator service fees</li>
            </ul>
          </div>

          <div className="bg-rose-50/70 p-5 rounded-xl border border-rose-200/80">
            <h4 className="font-bold text-rose-950 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <XCircle className="w-4 h-4 text-rose-600" />
              Safari Exclusions
            </h4>
            <ul className="space-y-1.5 text-rose-900">
              <li>✗ International flights to/from East Africa</li>
              <li>✗ Entry tourist visas for Kenya (ETA) and Tanzania</li>
              <li>✗ Comprehensive personal travel and baggage insurance</li>
              <li>✗ Premium alcoholic spirits and vintage champagne (unless All-Inclusive)</li>
              <li>✗ Discretionary tips & gratuities for driver-guides and camp staff</li>
              <li>✗ Personal expenditures (souvenirs, laundry, spa services)</li>
            </ul>
          </div>
        </div>

        {/* FINAL COMMERCIAL QUOTATION PRICING CARD */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800 mb-8 page-break-avoid">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
            <div>
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest block mb-1">
                Official Safari Investment
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                Total Selling Quotation: ${(totals?.grandSellingPriceUsd ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Fully inclusive safari package for {totalPax} guests ({itinerary?.length || 0} Days). Guaranteed STO rates.
              </p>
            </div>

            <div className="bg-amber-500 text-slate-950 px-6 py-4 rounded-xl text-center shadow-md">
              <span className="text-xs font-bold uppercase tracking-wider block text-slate-900">
                Per Person Rate
              </span>
              <span className="text-2xl font-black block">
                ${(totals?.pricePerPersonUsd ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] font-semibold block text-slate-900">
                Based on {totalPax} Guests
              </span>
            </div>
          </div>

          {totals.selectedCurrency !== 'USD' && (
            <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-amber-200">
              <span>Equivalent in {totals.selectedCurrency}:</span>
              <strong className="text-base font-bold">
                {formatCurrency(totals.grandSellingPriceConverted, totals.selectedCurrency)} ({formatCurrency(totals.pricePerPersonConverted, totals.selectedCurrency)} / person)
              </strong>
            </div>
          )}

          {/* Payment Terms */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
            <div className="bg-slate-800/80 p-3 rounded-lg">
              <strong className="text-white block mb-0.5">1. Booking Deposit</strong>
              <span>30% upon confirmation to secure lodge beds & permits</span>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-lg">
              <strong className="text-white block mb-0.5">2. Balance Due</strong>
              <span>70% due 45 days prior to safari commencement</span>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-lg">
              <strong className="text-white block mb-0.5">3. Cancellation Cover</strong>
              <span>Flexible rebooking in accordance with Tusafiri Terms</span>
            </div>
          </div>
        </div>

        {/* Footer Signature */}
        <div className="border-t border-slate-200 pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-500 page-break-avoid">
          <div>
            <p className="font-semibold text-slate-700">{settings?.companyName || 'Tusafiri Africa Safaris'} Ltd.</p>
            <p>Certified East Africa Tour Operator • Member of KATO & TATO</p>
          </div>
          <div className="text-right">
            <p>Signed on behalf of {settings?.companyName || 'Tusafiri'} Expeditions</p>
            <p className="font-mono text-slate-400">Date: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

      </div>

    </div>
  );
};

