import React from 'react';
import { Archive, Briefcase, Calendar, FolderOpen, Trash2 } from 'lucide-react';
import { SavedQuote } from '../types/costing';

interface BookingsPipelineProps {
  savedQuotes: SavedQuote[];
  onLoadQuote: (quote: SavedQuote) => void;
  onDeleteQuote: (id: string) => void;
}

export const BookingsPipeline: React.FC<BookingsPipelineProps> = ({ savedQuotes, onLoadQuote, onDeleteQuote }) => {
  if (savedQuotes.length === 0) {
    return (
      <div className="max-w-4xl mx-auto mt-10">
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Archive className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Saved Quotations</h3>
          <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">
            You haven't saved any itineraries yet. Create a quote and click "Save Quote" to see it here in your pipeline.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-600" /> Bookings & Quotation Pipeline
          </h2>
          <p className="text-xs text-slate-500 mt-1">Manage, load, or delete your previously saved client quotations.</p>
        </div>
        <div className="px-3 py-1 bg-indigo-50 text-indigo-700 font-bold rounded-lg text-sm">
          {savedQuotes.length} Saved Quotes
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {savedQuotes.map((quote) => (
          <div key={quote.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
            <div className="flex justify-between items-start mb-3">
              <div className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-[10px] font-bold">
                {quote.clientInputs.quoteReference}
              </div>
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(quote.dateSaved).toLocaleDateString()}
              </div>
            </div>
            
            <h3 className="text-base font-bold text-slate-900 mb-1">{quote.clientInputs.clientName || 'Unnamed Client'}</h3>
            <p className="text-xs text-slate-500 mb-4 line-clamp-1">{quote.clientInputs.agencyOrLead || 'Direct Booking'}</p>
            
            <div className="grid grid-cols-2 gap-2 text-xs mb-4 flex-grow">
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                <div className="text-slate-400 text-[10px] font-semibold uppercase mb-0.5">Travel Dates</div>
                <div className="font-medium text-slate-700">
                  {new Date(quote.clientInputs.travelStartDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - 
                  {new Date(quote.clientInputs.travelEndDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </div>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                <div className="text-slate-400 text-[10px] font-semibold uppercase mb-0.5">Total Value</div>
                <div className="font-bold text-emerald-700">
                  {quote.totals?.selectedCurrency || 'USD'} {(quote.totals?.grandSellingPriceConverted ?? quote.grandTotalUsd ?? 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </div>
              </div>
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 col-span-2">
                <div className="text-slate-400 text-[10px] font-semibold uppercase mb-0.5">Pax Details</div>
                <div className="font-medium text-slate-700">
                  {quote.clientInputs.paxAdults} Adults, {quote.clientInputs.paxChildren} Children • {quote.itinerary.length} Days
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-auto pt-4 border-t border-slate-100">
              <button
                onClick={() => onLoadQuote(quote)}
                className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <FolderOpen className="w-3.5 h-3.5" /> Load Quote
              </button>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete this saved quote?')) {
                    onDeleteQuote(quote.id);
                  }
                }}
                className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"
                title="Delete quote"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
