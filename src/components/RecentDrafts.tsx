import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Bookmark,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Cloud,
  CloudCheck,
  Compass,
  Copy,
  DollarSign,
  Download,
  Eye,
  FileCheck,
  FileSpreadsheet,
  History,
  Layers,
  MapPin,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Tag,
  Trash2,
  Users
} from 'lucide-react';
import { CostingDraft } from '../types/costing';

interface RecentDraftsProps {
  drafts: CostingDraft[];
  onRestoreDraft: (draft: CostingDraft) => void;
  onDeleteDraft: (id: string) => void;
  onClearAllDrafts: () => void;
  onSaveManualSnapshot: () => void;
  autoSaveStatus: 'saved' | 'saving' | 'unsaved' | 'disabled';
  lastAutoSavedAt: Date | null;
  autoSaveEnabled: boolean;
  onToggleAutoSave?: () => void;
  activeQuoteRef?: string;
}

export const RecentDrafts: React.FC<RecentDraftsProps> = ({
  drafts = [],
  onRestoreDraft,
  onDeleteDraft,
  onClearAllDrafts,
  onSaveManualSnapshot,
  autoSaveStatus,
  lastAutoSavedAt,
  autoSaveEnabled,
  onToggleAutoSave,
  activeQuoteRef
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'auto' | 'manual'>('all');
  const [selectedDraftForPreview, setSelectedDraftForPreview] = useState<CostingDraft | null>(null);
  const [confirmRestoreId, setConfirmRestoreId] = useState<string | null>(null);
  const [restoreSuccessNotice, setRestoreSuccessNotice] = useState<string | null>(null);

  // Time formatter helper
  const formatTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSecs < 15) return 'Just now';
      if (diffSecs < 60) return `${diffSecs}s ago`;
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      return `${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return dateString;
    }
  };

  const filteredDrafts = drafts.filter(draft => {
    const matchesFilter =
      filterType === 'all'
        ? true
        : filterType === 'auto'
        ? draft.autoSaved
        : !draft.autoSaved;

    const query = searchQuery.toLowerCase();
    const matchesSearch =
      (draft.name || '').toLowerCase().includes(query) ||
      (draft.clientName || '').toLowerCase().includes(query) ||
      (draft.quoteReference || '').toLowerCase().includes(query) ||
      (draft.agencyOrLead || '').toLowerCase().includes(query) ||
      (draft.destinationsSummary || []).some(d => d.toLowerCase().includes(query));

    return matchesFilter && matchesSearch;
  });

  const handleConfirmRestore = (draft: CostingDraft) => {
    onRestoreDraft(draft);
    setConfirmRestoreId(null);
    setRestoreSuccessNotice(`Successfully restored draft: "${draft.name || draft.quoteReference}" into active Costing Engine.`);
    setTimeout(() => setRestoreSuccessNotice(null), 5000);
  };

  return (
    <div id="recent-drafts-container" className="space-y-6">
      
      {/* Top Banner & Control Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <History className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              Recent Drafts & Package Auto-Saves
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
              <Cloud className="w-3 h-3 text-emerald-600" />
              Auto-Save Active
            </span>
            <span className="text-xs text-slate-400">
              ({drafts.length} available)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Continuous background snapshot engine saves your package itinerary, client inputs, custom markups, and STO line items in real-time to prevent data loss.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          <button
            type="button"
            id="btn-save-manual-snapshot"
            onClick={onSaveManualSnapshot}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all active:scale-95"
            title="Create an explicit point-in-time snapshot of the current costing state"
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-400" />
            <span>Snapshot Current State</span>
          </button>

          {drafts.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Are you sure you want to delete all saved drafts? This cannot be undone.')) {
                  onClearAllDrafts();
                }
              }}
              className="px-3 py-2 text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-200 rounded-xl text-xs font-medium transition-colors"
              title="Purge all cached drafts"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Success Notification */}
      {restoreSuccessNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between text-emerald-800 text-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{restoreSuccessNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setRestoreSuccessNotice(null)}
            className="text-emerald-600 hover:text-emerald-900 font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Auto-Save Engine Live Status Ribbon */}
      <div className="bg-slate-900 text-white rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                autoSaveStatus === 'saving' ? 'bg-amber-400' : 'bg-emerald-400'
              }`} />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                autoSaveStatus === 'saving' ? 'bg-amber-500' : 'bg-emerald-500'
              }`} />
            </span>
            <span className="font-mono text-slate-300 font-medium">
              {autoSaveStatus === 'saving'
                ? 'Syncing draft to local registry...'
                : autoSaveStatus === 'saved'
                ? `Last Auto-Save: ${lastAutoSavedAt ? formatTimeAgo(lastAutoSavedAt.toISOString()) : 'Active'}`
                : 'Auto-save monitoring changes...'}
            </span>
          </div>
          {activeQuoteRef && (
            <span className="hidden md:inline px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono text-[11px] border border-slate-700">
              Active Ref: {activeQuoteRef}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <span className="text-[11px] text-slate-400">
            Protected against browser reload & accidental tab closure
          </span>
          {onToggleAutoSave && (
            <button
              type="button"
              onClick={onToggleAutoSave}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors ${
                autoSaveEnabled
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {autoSaveEnabled ? 'Auto-Save ON' : 'Auto-Save OFF'}
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search drafts by client, ref, destination..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <span className="text-slate-500 font-medium">Type:</span>
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-md transition-all font-semibold ${
                filterType === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              All ({drafts.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('auto')}
              className={`px-2.5 py-1 rounded-md transition-all font-semibold ${
                filterType === 'auto' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Auto-Saves ({drafts.filter(d => d.autoSaved).length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('manual')}
              className={`px-2.5 py-1 rounded-md transition-all font-semibold ${
                filterType === 'manual' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Snapshots ({drafts.filter(d => !d.autoSaved).length})
            </button>
          </div>
        </div>
      </div>

      {/* DRAFTS LIST */}
      {filteredDrafts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-400">
            <History className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">No Drafts Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            {searchQuery || filterType !== 'all'
              ? 'No drafts match your current search or filter criteria.'
              : 'As you work in the Master Costing Engine, changes will be automatically saved here periodically. You can also click "Snapshot Current State" to create a manual backup anytime.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDrafts.map((draft) => {
            const isConfirming = confirmRestoreId === draft.id;
            const isActiveRef = activeQuoteRef && draft.quoteReference === activeQuoteRef;

            return (
              <div
                key={draft.id}
                className={`bg-white rounded-xl border transition-all flex flex-col p-4 shadow-xs relative ${
                  isActiveRef
                    ? 'border-amber-400 ring-2 ring-amber-400/20'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                {/* Header info */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-mono text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {draft.quoteReference || 'REF-DRAFT'}
                    </span>
                    {draft.autoSaved ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <Cloud className="w-3 h-3 text-emerald-600" />
                        Auto-Save
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                        <Bookmark className="w-3 h-3 text-amber-600" />
                        Snapshot
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{formatTimeAgo(draft.lastSaved)}</span>
                  </div>
                </div>

                {/* Title and Client */}
                <div className="mb-3">
                  <h3 className="font-bold text-sm text-slate-900 leading-snug line-clamp-1">
                    {draft.name || draft.clientName || 'Untitled Safari Package'}
                  </h3>
                  <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <span>{draft.agencyOrLead || 'Direct Inquiry'}</span>
                    <span>•</span>
                    <span>{draft.paxCount} Pax</span>
                    <span>•</span>
                    <span>{draft.daysCount} Days</span>
                  </div>
                </div>

                {/* Destinations preview tags */}
                {draft.destinationsSummary && draft.destinationsSummary.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap mb-3">
                    {draft.destinationsSummary.slice(0, 3).map((dest, idx) => (
                      <span
                        key={idx}
                        className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 truncate max-w-[120px]"
                      >
                        📍 {dest}
                      </span>
                    ))}
                    {draft.destinationsSummary.length > 3 && (
                      <span className="text-[10px] text-slate-400 font-semibold">
                        +{draft.destinationsSummary.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Pricing summary tile */}
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 grid grid-cols-2 gap-2 text-xs mb-4 mt-auto font-mono">
                  <div>
                    <div className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Grand Total</div>
                    <div className="font-bold text-emerald-700 text-xs">
                      ${(draft.grandTotalUsd || draft.totals?.grandSellingPriceUsd || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Per Person</div>
                    <div className="font-bold text-slate-800 text-xs">
                      ${(draft.totals?.pricePerPersonUsd || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </div>
                  </div>
                </div>

                {/* Action Row */}
                {isConfirming ? (
                  <div className="p-2 bg-amber-50 border border-amber-300 rounded-lg text-xs space-y-2 animate-fadeIn">
                    <div className="text-amber-900 font-bold flex items-center gap-1 text-[11px]">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      Restore this draft into active Costing Engine?
                    </div>
                    <div className="flex items-center gap-1.5 justify-end">
                      <button
                        type="button"
                        onClick={() => setConfirmRestoreId(null)}
                        className="px-2 py-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-md"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleConfirmRestore(draft)}
                        className="px-2.5 py-1 text-[11px] font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-md shadow-xs"
                      >
                        Yes, Restore
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                    <button
                      type="button"
                      onClick={() => setConfirmRestoreId(draft.id)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold rounded-lg transition-all flex items-center gap-1.5 text-xs shadow-xs active:scale-95"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore Draft</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setSelectedDraftForPreview(draft)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Quick View Draft Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteDraft(draft.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete this draft"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* QUICK PREVIEW MODAL */}
      {selectedDraftForPreview && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                    {selectedDraftForPreview.quoteReference}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    selectedDraftForPreview.autoSaved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {selectedDraftForPreview.autoSaved ? 'Auto-Saved Draft' : 'Manual Snapshot'}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 mt-1">
                  {selectedDraftForPreview.name || selectedDraftForPreview.clientName}
                </h2>
                <div className="text-xs text-slate-500">
                  Saved on {selectedDraftForPreview.lastSaved ? new Date(selectedDraftForPreview.lastSaved).toLocaleString() : 'Recently'}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedDraftForPreview(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Client & Booking Details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Travel Period</span>
                <span className="font-medium text-slate-800">
                  {selectedDraftForPreview.clientInputs?.travelStartDate || 'TBD'} to {selectedDraftForPreview.clientInputs?.travelEndDate || 'TBD'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Party</span>
                <span className="font-medium text-slate-800">
                  {selectedDraftForPreview.clientInputs?.paxAdults || 0} Adults, {selectedDraftForPreview.clientInputs?.paxChildren || 0} Ch
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Markup Rate</span>
                <span className="font-medium text-emerald-700 font-mono">
                  {selectedDraftForPreview.clientInputs?.operatorMarkupPercent || 15}%
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Grand Selling Price</span>
                <span className="font-bold text-emerald-700 font-mono">
                  ${(selectedDraftForPreview.totals?.grandSellingPriceUsd ?? selectedDraftForPreview.grandTotalUsd ?? 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Itinerary Schedule */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 mb-2 uppercase tracking-wider">
                Itinerary Route ({selectedDraftForPreview.itinerary.length} Days)
              </h4>
              <div className="space-y-2">
                {selectedDraftForPreview.itinerary.map((day) => (
                  <div key={day.dayNumber} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 mr-2">Day {day.dayNumber}:</span>
                      <span className="font-medium text-slate-900">{day.destination}</span>
                      <span className="text-slate-400 text-[11px] ml-2">({day.country})</span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {day.roomType} • {day.nights} night(s)
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedDraftForPreview(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl"
              >
                Close Preview
              </button>
              <button
                type="button"
                onClick={() => {
                  handleConfirmRestore(selectedDraftForPreview);
                  setSelectedDraftForPreview(null);
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore This Draft</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
