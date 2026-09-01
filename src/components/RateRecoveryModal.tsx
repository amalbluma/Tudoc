import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  RotateCcw,
  Download,
  Upload,
  Database,
  History,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  FileSpreadsheet,
  X,
  Layers,
  ArrowRight,
  HardDrive,
  RefreshCw,
  Search,
  Check,
  FileText
} from 'lucide-react';
import {
  STOAccommodationProperty,
  ParkFeeRecord,
  ActivityOption,
  TransportOption,
  FlightOption,
  ExtraOperationalCost,
  CostingDraft,
  SavedQuote,
  CompanySettings
} from '../types/costing';
import {
  getVaultSnapshots,
  saveVaultSnapshot,
  deepScanBrowserStorage,
  exportMasterDatabaseBackup,
  countTotalRateTiers,
  DatabaseSnapshot,
  RecoveredItemCandidate
} from '../utils/storageVault';
import { mergeAccommodationDatabases } from '../utils/rateDeduplication';
import { SAMPLE_STO_CONTRACTS } from '../data/sampleContracts';

interface RateRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAccommodations: STOAccommodationProperty[];
  currentParks: ParkFeeRecord[];
  currentActivities: ActivityOption[];
  currentTransport: TransportOption[];
  currentFlights: FlightOption[];
  currentExtras: ExtraOperationalCost[];
  currentDrafts: CostingDraft[];
  currentQuotes: SavedQuote[];
  currentSettings: CompanySettings;
  onRestoreAccommodations: (properties: STOAccommodationProperty[], merge?: boolean) => void;
  onRestoreParkFees?: (parks: ParkFeeRecord[]) => void;
  onRestoreFullDatabase?: (payload: {
    accommodations: STOAccommodationProperty[];
    parkFees?: ParkFeeRecord[];
    activities?: ActivityOption[];
    transport?: TransportOption[];
    flights?: FlightOption[];
    extras?: ExtraOperationalCost[];
  }) => void;
}

export const RateRecoveryModal: React.FC<RateRecoveryModalProps> = ({
  isOpen,
  onClose,
  currentAccommodations,
  currentParks,
  currentActivities,
  currentTransport,
  currentFlights,
  currentExtras,
  currentDrafts,
  currentQuotes,
  currentSettings,
  onRestoreAccommodations,
  onRestoreParkFees,
  onRestoreFullDatabase
}) => {
  const [activeTab, setActiveTab] = useState<'scan' | 'snapshots' | 'export_import' | 'presets'>('scan');
  const [scannedCandidates, setScannedCandidates] = useState<RecoveredItemCandidate[]>([]);
  const [snapshots, setSnapshots] = useState<DatabaseSnapshot[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalCurrentRateTiers = countTotalRateTiers(currentAccommodations);

  // Perform deep scan when opening modal
  useEffect(() => {
    if (isOpen) {
      runDeepScan();
      setSnapshots(getVaultSnapshots());
      setActionMessage(null);
    }
  }, [isOpen]);

  const runDeepScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      try {
        const found = deepScanBrowserStorage();
        setScannedCandidates(found);
      } catch (e) {
        console.error('Deep scan error:', e);
      } finally {
        setIsScanning(false);
      }
    }, 250);
  };

  const handleRestoreCandidate = (candidate: RecoveredItemCandidate, merge = true) => {
    if (merge) {
      const result = mergeAccommodationDatabases(currentAccommodations, candidate.properties);
      onRestoreAccommodations(result.merged, false);
      saveVaultSnapshot(
        `Merged from ${candidate.type} (${candidate.key})`,
        'manual_save',
        {
          accommodations: result.merged,
          parkFees: currentParks,
          activities: currentActivities,
          transport: currentTransport,
          flights: currentFlights,
          extras: currentExtras
        }
      );
      setActionMessage({
        type: 'success',
        text: `Successfully recovered & merged ${candidate.properties.length} properties (${candidate.rateTiersCount} rate tiers) into your active database!`
      });
    } else {
      onRestoreAccommodations(candidate.properties, false);
      saveVaultSnapshot(
        `Restored from ${candidate.type} (${candidate.key})`,
        'manual_save',
        {
          accommodations: candidate.properties,
          parkFees: currentParks,
          activities: currentActivities,
          transport: currentTransport,
          flights: currentFlights,
          extras: currentExtras
        }
      );
      setActionMessage({
        type: 'success',
        text: `Active database replaced with ${candidate.properties.length} properties from ${candidate.key}.`
      });
    }
    setSnapshots(getVaultSnapshots());
  };

  const handleRestoreSnapshot = (snapshot: DatabaseSnapshot, merge = true) => {
    const snapProps = snapshot.data.accommodations || [];
    if (merge) {
      const result = mergeAccommodationDatabases(currentAccommodations, snapProps);
      onRestoreAccommodations(result.merged, false);
      setActionMessage({
        type: 'success',
        text: `Merged ${snapProps.length} properties from snapshot "${snapshot.label}"!`
      });
    } else {
      if (onRestoreFullDatabase) {
        onRestoreFullDatabase({
          accommodations: snapProps,
          parkFees: snapshot.data.parkFees || currentParks,
          activities: snapshot.data.activities || currentActivities,
          transport: snapshot.data.transport || currentTransport,
          flights: snapshot.data.flights || currentFlights,
          extras: snapshot.data.extras || currentExtras
        });
      } else {
        onRestoreAccommodations(snapProps, false);
      }
      setActionMessage({
        type: 'success',
        text: `Successfully restored full snapshot "${snapshot.label}" (${snapProps.length} properties, ${snapshot.rateTiersCount} rate tiers).`
      });
    }
    setSnapshots(getVaultSnapshots());
  };

  const handleCreateManualSnapshot = () => {
    const snap = saveVaultSnapshot(
      `Manual Safety Vault Snapshot (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
      'manual_save',
      {
        accommodations: currentAccommodations,
        parkFees: currentParks,
        activities: currentActivities,
        transport: currentTransport,
        flights: currentFlights,
        extras: currentExtras,
        drafts: currentDrafts,
        quotes: currentQuotes,
        settings: currentSettings
      }
    );
    setSnapshots(getVaultSnapshots());
    setActionMessage({
      type: 'success',
      text: `Created manual backup snapshot with ${currentAccommodations.length} properties and ${totalCurrentRateTiers} rate tiers.`
    });
  };

  const handleExportBackup = () => {
    exportMasterDatabaseBackup({
      accommodations: currentAccommodations,
      parkFees: currentParks,
      activities: currentActivities,
      transport: currentTransport,
      flights: currentFlights,
      extras: currentExtras,
      drafts: currentDrafts,
      quotes: currentQuotes,
      settings: currentSettings
    });
    setActionMessage({
      type: 'success',
      text: 'Database backup downloaded successfully. Keep this file safe for instant restoration.'
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        let recoveredProps: STOAccommodationProperty[] = [];

        if (Array.isArray(parsed)) {
          recoveredProps = parsed;
        } else if (parsed.accommodations && Array.isArray(parsed.accommodations)) {
          recoveredProps = parsed.accommodations;
        } else if (parsed.extractedProperties && Array.isArray(parsed.extractedProperties)) {
          recoveredProps = parsed.extractedProperties;
        }

        if (recoveredProps.length === 0) {
          setActionMessage({
            type: 'error',
            text: 'Could not find valid accommodation properties in the uploaded JSON file.'
          });
          return;
        }

        const merged = mergeAccommodationDatabases(currentAccommodations, recoveredProps);
        onRestoreAccommodations(merged.merged, false);

        if (parsed.parkFees && Array.isArray(parsed.parkFees) && onRestoreParkFees) {
          onRestoreParkFees(parsed.parkFees);
        }

        saveVaultSnapshot(
          `Imported Backup File: ${file.name}`,
          'user_export',
          {
            accommodations: merged.merged,
            parkFees: parsed.parkFees || currentParks,
            activities: parsed.activities || currentActivities,
            transport: parsed.transport || currentTransport,
            flights: parsed.flights || currentFlights,
            extras: parsed.extras || currentExtras
          }
        );

        setSnapshots(getVaultSnapshots());
        setActionMessage({
          type: 'success',
          text: `Successfully imported & merged ${recoveredProps.length} properties from ${file.name}!`
        });
      } catch (err: any) {
        setActionMessage({
          type: 'error',
          text: `Failed to parse backup file: ${err.message}`
        });
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Rate Protection & Recovery Vault</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Auto-Shield Active
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Multi-layer recovery, deep storage scanner, automated snapshots & permanent JSON backup
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Active Status Banner */}
        <div className="px-5 py-3 bg-slate-800/40 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-slate-400 text-[11px]">Active Properties:</span>{' '}
              <strong className="text-amber-400 font-mono">{currentAccommodations.length} Lodges/Camps</strong>
            </div>
            <div className="h-3 w-px bg-slate-700" />
            <div>
              <span className="text-slate-400 text-[11px]">Active Rate Tiers:</span>{' '}
              <strong className="text-emerald-400 font-mono">{totalCurrentRateTiers} Seasons</strong>
            </div>
            <div className="h-3 w-px bg-slate-700" />
            <div>
              <span className="text-slate-400 text-[11px]">Vault Snapshots:</span>{' '}
              <strong className="text-blue-400 font-mono">{snapshots.length} Available</strong>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCreateManualSnapshot}
              className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <History className="w-3.5 h-3.5" />
              <span>Take Vault Snapshot</span>
            </button>
            <button
              onClick={handleExportBackup}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Backup File</span>
            </button>
          </div>
        </div>

        {/* Alert/Action feedback message */}
        {actionMessage && (
          <div className={`mx-5 mt-3 p-3 rounded-xl text-xs flex items-center justify-between ${
            actionMessage.type === 'success' ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300' :
            actionMessage.type === 'error' ? 'bg-red-950/60 border border-red-800 text-red-300' :
            'bg-blue-950/60 border border-blue-800 text-blue-300'
          }`}>
            <div className="flex items-center gap-2">
              {actionMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-amber-400" />}
              <span>{actionMessage.text}</span>
            </div>
            <button onClick={() => setActionMessage(null)} className="text-slate-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="px-5 pt-3 border-b border-slate-800 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('scan')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-xl border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'scan'
                ? 'border-amber-400 text-amber-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Deep Storage Scanner ({scannedCandidates.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('snapshots')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-xl border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'snapshots'
                ? 'border-amber-400 text-amber-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Snapshot Time-Machine ({snapshots.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('export_import')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-xl border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'export_import'
                ? 'border-amber-400 text-amber-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export & Import Backup JSON</span>
          </button>

          <button
            onClick={() => setActiveTab('presets')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-xl border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'presets'
                ? 'border-amber-400 text-amber-400 bg-slate-800/60'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Supplier Presets & Quick-Load</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">

          {/* TAB 1: DEEP STORAGE SCANNER */}
          {activeTab === 'scan' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-800/60 border border-slate-700/80 rounded-xl flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Database className="w-4 h-4 text-amber-400" />
                    <span>Deep Browser Storage & Historical Recovery</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Scans all previous versions, historical keys, cached session states, and vaults to find any imported rates that may have been displaced.
                  </p>
                </div>

                <button
                  onClick={runDeepScan}
                  disabled={isScanning}
                  className="px-3.5 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shrink-0 shadow"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-amber-400' : ''}`} />
                  <span>{isScanning ? 'Scanning...' : 'Re-Scan Storage'}</span>
                </button>
              </div>

              {scannedCandidates.length === 0 ? (
                <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-slate-800 text-slate-400">
                  <Database className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                  <p className="text-xs">No orphaned or unlinked rate stores detected.</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Your current database has {currentAccommodations.length} properties and {totalCurrentRateTiers} rates.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span>Found {scannedCandidates.length} Storage Sources with Accommodation Records:</span>
                    <span className="text-[11px] text-slate-400">Click "Restore & Merge" to safely add items back</span>
                  </div>

                  {scannedCandidates.map((candidate, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/60 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-amber-300 text-xs">{candidate.key}</span>
                          <span className="px-2 py-0.5 rounded bg-slate-700 text-slate-300 text-[10px] font-medium">
                            {candidate.type}
                          </span>
                        </div>

                        <div className="text-xs text-slate-300 flex items-center gap-3">
                          <span><strong>{candidate.itemCount}</strong> Lodges/Camps</span>
                          <span>•</span>
                          <span><strong>{candidate.rateTiersCount}</strong> Rate Tiers</span>
                        </div>

                        {candidate.sampleNames.length > 0 && (
                          <div className="text-[11px] text-slate-400 truncate max-w-xl">
                            Includes: {candidate.sampleNames.join(', ')}...
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                        <button
                          onClick={() => handleRestoreCandidate(candidate, true)}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Restore & Merge</span>
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm(`Replace current database with ${candidate.itemCount} properties from ${candidate.key}?`)) {
                              handleRestoreCandidate(candidate, false);
                            }
                          }}
                          className="px-2.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg text-[11px] font-medium transition-colors"
                        >
                          Replace
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SNAPSHOT TIME MACHINE */}
          {activeTab === 'snapshots' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-800/60 border border-slate-700/80 rounded-xl flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <History className="w-4 h-4 text-blue-400" />
                    <span>Automated Vault Snapshots (Time-Machine)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Rolling historical snapshots created automatically whenever contracts are imported, suppliers added, or changes made.
                  </p>
                </div>

                <button
                  onClick={handleCreateManualSnapshot}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shrink-0 shadow"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Create Snapshot Now</span>
                </button>
              </div>

              {snapshots.length === 0 ? (
                <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-slate-800 text-slate-400">
                  <History className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                  <p className="text-xs">No historical snapshots saved yet.</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Click "Create Snapshot Now" to record your current state.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {snapshots.map((snap) => (
                    <div
                      key={snap.id}
                      className="p-3.5 bg-slate-800/40 hover:bg-slate-800/70 border border-slate-700/50 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-white">{snap.label}</span>
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                            {new Date(snap.timestamp).toLocaleString()}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-300 flex items-center gap-3">
                          <span className="text-amber-300 font-mono"><strong>{snap.propertyCount}</strong> Properties</span>
                          <span>•</span>
                          <span className="text-emerald-300 font-mono"><strong>{snap.rateTiersCount}</strong> Rate Tiers</span>
                          <span>•</span>
                          <span className="text-blue-300 font-mono">{snap.parksCount} Parks</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                        <button
                          onClick={() => handleRestoreSnapshot(snap, true)}
                          className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Merge In</span>
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Restore full snapshot "${snap.label}"? This will load all properties and rates from this point in time.`)) {
                              handleRestoreSnapshot(snap, false);
                            }
                          }}
                          className="px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs rounded-lg transition-colors"
                        >
                          Restore Full
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: EXPORT & IMPORT BACKUP JSON */}
          {activeTab === 'export_import' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Export Card */}
                <div className="p-5 bg-slate-800/40 border border-slate-700/80 rounded-xl flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Download className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-white">Download Master Backup (.JSON)</h4>
                    <p className="text-xs text-slate-400">
                      Creates a complete, portable offline file containing all your {currentAccommodations.length} accommodation profiles, {totalCurrentRateTiers} season rates, park fees, activities, flights, transport, and itineraries.
                    </p>
                  </div>

                  <button
                    onClick={handleExportBackup}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.99]"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Database Backup File</span>
                  </button>
                </div>

                {/* Import Card */}
                <div className="p-5 bg-slate-800/40 border border-slate-700/80 rounded-xl flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                      <Upload className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-white">Restore from Backup File (.JSON)</h4>
                    <p className="text-xs text-slate-400">
                      Upload any previous database backup file. All lodges, camps, and seasonal pricing tiers will be safely merged with zero duplicate errors.
                    </p>
                  </div>

                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json,application/json"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="vault-file-upload"
                    />
                    <label
                      htmlFor="vault-file-upload"
                      className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer active:scale-[0.99]"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Select JSON Backup File</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Data Loss Prevention Mechanism Overview */}
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Permanent Data Loss Prevention Architecture</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-400">
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <div className="font-semibold text-slate-200">1. Dual-Key Redundancy</div>
                    <div className="text-[11px] mt-1">Rates are continuously synced across versioned and unversioned safety keys.</div>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <div className="font-semibold text-slate-200">2. Pre-Import Snapshots</div>
                    <div className="text-[11px] mt-1">Before any new contract is imported, a point-in-time snapshot is archived.</div>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <div className="font-semibold text-slate-200">3. Non-Destructive Merging</div>
                    <div className="text-[11px] mt-1">New rates and facilities are appended without overwriting existing data.</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PRESETS & QUICK-LOAD */}
          {activeTab === 'presets' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-800/60 border border-slate-700/80 rounded-xl">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Wholesale STO Contract Presets (2026 Season)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Instantly restore verified wholesale partner contracts for East Africa's leading safari collections.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {SAMPLE_STO_CONTRACTS.map((contract) => (
                  <div
                    key={contract.id}
                    className="p-4 bg-slate-800/40 hover:bg-slate-800/70 border border-slate-700/60 rounded-xl flex flex-col justify-between space-y-3 transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-xs text-white">{contract.name}</span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono">
                          {contract.lodgesCount} Lodges
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">{contract.provider} • {contract.validity}</div>
                      <p className="text-xs text-slate-300 mt-2 line-clamp-2">{contract.description}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-700/40 flex items-center justify-between text-xs">
                      <span className="text-slate-400 text-[11px]">Ready to load</span>
                      <button
                        onClick={() => {
                          onClose();
                          // Trigger AI Importer or load contract text
                          const event = new CustomEvent('load_sample_contract', { detail: contract });
                          window.dispatchEvent(event);
                        }}
                        className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1"
                      >
                        <span>Import Portfolio</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <HardDrive className="w-4 h-4 text-emerald-400" />
            <span>Vault Status: Protected & Persistent</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Close Vault
          </button>
        </div>

      </div>
    </div>
  );
};
