import React, { useState, useEffect, useRef } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Bot,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Compass,
  Edit2,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Filter,
  HelpCircle,
  Info,
  Layers,
  ListPlus,
  Loader2,
  MapPin,
  Minimize2,
  Maximize2,
  Plane,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Sparkles,
  Tag,
  Trash2,
  TreePine,
  Truck,
  Upload,
  X,
  Zap
} from 'lucide-react';
import {
  ActivityOption,
  ExtraOperationalCost,
  FlightOption,
  ParkFeeRecord,
  STOAccommodationProperty,
  STOSeasonRate,
  SupplierRatesExtractionResult,
  TransportOption
} from '../types/costing';
import { SAMPLE_STO_CONTRACTS, SampleContractPreset } from '../data/sampleContracts';
import {
  deduplicateAccommodationDatabase,
  deduplicateParkFees,
  deduplicateActivities,
  deduplicateTransport,
  deduplicateFlights,
  deduplicateExtras
} from '../utils/rateDeduplication';
import { saveVaultSnapshot } from '../utils/storageVault';
import { syncMasterDatabaseToServer } from '../utils/apiSync';

export interface QueuedContractFile {
  id: string;
  file?: File;
  name: string;
  size: number;
  mimeType: string;
  base64Data?: string;
  textContent?: string;
  status: 'pending' | 'analyzing' | 'extracted' | 'error';
  statusMessage?: string;
  extractedResult?: SupplierRatesExtractionResult;
}

interface ContractImporterProps {
  onAddProperties?: (newProperties: STOAccommodationProperty[]) => void;
  onAddActivities?: (newActivities: ActivityOption[]) => void;
  onAddParkFees?: (newParkFees: ParkFeeRecord[]) => void;
  onAddTransport?: (newTransport: TransportOption[]) => void;
  onAddFlights?: (newFlights: FlightOption[]) => void;
  onAddExtras?: (newExtras: ExtraOperationalCost[]) => void;
  onClose?: () => void;
}

export const ContractImporter: React.FC<ContractImporterProps> = ({
  onAddProperties,
  onAddActivities,
  onAddParkFees,
  onAddTransport,
  onAddFlights,
  onAddExtras,
  onClose
}) => {
  const [inputMode, setInputMode] = useState<'upload' | 'paste' | 'sample'>('upload');
  
  // Bulk File Queue State
  const [fileQueue, setFileQueue] = useState<QueuedContractFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [contractText, setContractText] = useState('');

  // Bulk Ingestion Status
  const [isBatchAnalyzing, setIsBatchAnalyzing] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0, currentFileName: '' });
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Ensure file binary or text data is read safely even before FileReader onLoad fires
  const ensureItemData = async (
    item: QueuedContractFile
  ): Promise<{ base64Data?: string; textContent?: string; mimeType: string }> => {
    if (item.base64Data || item.textContent) {
      return {
        base64Data: item.base64Data,
        textContent: item.textContent,
        mimeType: item.mimeType || 'application/pdf',
      };
    }
    if (!item.file) {
      return {
        textContent: contractText,
        mimeType: 'text/plain',
      };
    }
    const isText = item.file.type.startsWith('text/') || item.file.name.endsWith('.txt') || item.file.name.endsWith('.csv');
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      if (isText) {
        reader.onload = () => resolve({ textContent: reader.result as string, mimeType: item.file?.type || 'text/plain' });
        reader.onerror = () => reject(new Error(`Failed to read file ${item.name}`));
        reader.readAsText(item.file!);
      } else {
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve({ base64Data: base64, mimeType: item.file?.type || 'application/pdf' });
        };
        reader.onerror = () => reject(new Error(`Failed to read file ${item.name}`));
        reader.readAsDataURL(item.file!);
      }
    });
  };

  // Consolidated Extracted Data Review State
  const [extractedData, setExtractedData] = useState<SupplierRatesExtractionResult | null>(null);
  const [activeReviewTab, setActiveReviewTab] = useState<'accommodations' | 'activities' | 'parkFees' | 'transport' | 'flights' | 'extras'>('accommodations');
  const [selectedSourceFilter, setSelectedSourceFilter] = useState<string>('ALL');

  // Item Selection sets for selective commit
  const [selectedPropIds, setSelectedPropIds] = useState<Set<string>>(new Set());
  const [selectedActIds, setSelectedActIds] = useState<Set<string>>(new Set());
  const [selectedParkIds, setSelectedParkIds] = useState<Set<string>>(new Set());
  const [selectedTransIds, setSelectedTransIds] = useState<Set<string>>(new Set());
  const [selectedFlightIds, setSelectedFlightIds] = useState<Set<string>>(new Set());
  const [selectedExtraIds, setSelectedExtraIds] = useState<Set<string>>(new Set());

  // Edit Modal State
  const [editingItemType, setEditingItemType] = useState<'property' | 'activity' | 'parkFee' | 'transport' | 'flight' | 'extra' | null>(null);
  const [editingProperty, setEditingProperty] = useState<STOAccommodationProperty | null>(null);
  const [editingActivity, setEditingActivity] = useState<ActivityOption | null>(null);
  const [editingParkFee, setEditingParkFee] = useState<ParkFeeRecord | null>(null);
  const [editingTransport, setEditingTransport] = useState<TransportOption | null>(null);
  const [editingFlight, setEditingFlight] = useState<FlightOption | null>(null);
  const [editingExtra, setEditingExtra] = useState<ExtraOperationalCost | null>(null);

  // Deduplication & Commit Stats
  const [dedupStats, setDedupStats] = useState<{
    duplicatesRemoved: number;
    seasonsRemoved: number;
    totalRateTiers: number;
  }>({ duplicatesRemoved: 0, seasonsRemoved: 0, totalRateTiers: 0 });

  const [hasCommitted, setHasCommitted] = useState(false);
  const [commitSummary, setCommitSummary] = useState<string | null>(null);

  // Listen for load_sample_contract events (e.g. from Recovery Modal)
  useEffect(() => {
    const handleLoadSample = (e: Event) => {
      const customEvt = e as CustomEvent<SampleContractPreset>;
      if (customEvt.detail && customEvt.detail.contractText) {
        setContractText(customEvt.detail.contractText);
        setInputMode('paste');
        setAnalysisError(null);
        setExtractedData(null);
        setHasCommitted(false);
      }
    };
    window.addEventListener('load_sample_contract', handleLoadSample);
    return () => window.removeEventListener('load_sample_contract', handleLoadSample);
  }, []);

  // Process newly selected or dropped files into queue
  const handleAddFilesToQueue = (files: FileList | File[]) => {
    setAnalysisError(null);
    const newItems: QueuedContractFile[] = [];

    Array.from(files).forEach((file, idx) => {
      const isText = file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.csv');
      const queueId = `file-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`;

      const queued: QueuedContractFile = {
        id: queueId,
        file,
        name: file.name,
        size: file.size,
        mimeType: file.type || (isText ? 'text/plain' : 'application/pdf'),
        status: 'pending',
      };

      const reader = new FileReader();
      if (isText) {
        reader.onload = () => {
          queued.textContent = reader.result as string;
          setFileQueue(prev => prev.map(item => item.id === queueId ? { ...item, textContent: reader.result as string } : item));
        };
        reader.readAsText(file);
      } else {
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          queued.base64Data = base64;
          setFileQueue(prev => prev.map(item => item.id === queueId ? { ...item, base64Data: base64 } : item));
        };
        reader.readAsDataURL(file);
      }

      newItems.push(queued);
    });

    setFileQueue(prev => [...prev, ...newItems]);
  };

  const handleRemoveFromQueue = (id: string) => {
    setFileQueue(prev => prev.filter(f => f.id !== id));
  };

  const handleClearQueue = () => {
    setFileQueue([]);
    setAnalysisError(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleAddFilesToQueue(e.dataTransfer.files);
    }
  };

  const handleSelectPreset = (preset: SampleContractPreset) => {
    setContractText(preset.contractText);
    const queueId = `sample-${preset.id}`;
    const queued: QueuedContractFile = {
      id: queueId,
      name: `${preset.name}.txt`,
      size: preset.contractText.length,
      mimeType: 'text/plain',
      textContent: preset.contractText,
      status: 'pending',
    };
    setFileQueue([queued]);
  };

  // Helper to parse one file through the backend with abort timeout
  const parseSingleContractPayload = async (
    item: QueuedContractFile,
    signal?: AbortSignal
  ): Promise<SupplierRatesExtractionResult> => {
    const payloadData = await ensureItemData(item);

    // 35-second client-side timeout per file so requests never get permanently stuck
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35000);

    if (signal) {
      signal.addEventListener('abort', () => controller.abort());
    }

    try {
      const response = await fetch('/api/ai/parse-sto-contract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        body: JSON.stringify({
          textContent: payloadData.textContent,
          fileData: payloadData.base64Data,
          mimeType: payloadData.mimeType,
          fileName: item.name,
        }),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server status ${response.status} on ${item.name}`);
      }

      const resJson = await response.json();
      if (!resJson.success || !resJson.data) {
        throw new Error(resJson.error || `Failed to extract rates from ${item.name}`);
      }

      return resJson.data as SupplierRatesExtractionResult;
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error(`Ingestion timed out or was cancelled for ${item.name}`);
      }
      throw err;
    }
  };

  // Cancel any running batch extraction
  const handleCancelBatchExtraction = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsBatchAnalyzing(false);
    setAnalysisError('Batch extraction paused.');
  };

  // Single file manual retry
  const handleRetrySingleFile = async (fileId: string) => {
    const targetItem = fileQueue.find(f => f.id === fileId);
    if (!targetItem) return;

    setFileQueue(prev => prev.map(f => f.id === fileId ? { ...f, status: 'analyzing', statusMessage: 'Retrying extraction...' } : f));

    try {
      const result = await parseSingleContractPayload(targetItem);
      if (result.extractedProperties) {
        result.extractedProperties = result.extractedProperties.map(p => ({
          ...p,
          sourceDocument: p.sourceDocument || targetItem.name,
        }));
      }

      setFileQueue(prev => prev.map(f => f.id === fileId ? {
        ...f,
        status: 'extracted',
        statusMessage: `Extracted ${result.extractedProperties?.length || 0} lodges`,
        extractedResult: result,
      } : f));

      // Append to active review data if already in review mode
      if (extractedData) {
        setExtractedData(prev => {
          if (!prev) return result;
          return {
            ...prev,
            extractedProperties: [...(prev.extractedProperties || []), ...(result.extractedProperties || [])],
            extractedActivities: [...(prev.extractedActivities || []), ...(result.extractedActivities || [])],
            extractedParkFees: [...(prev.extractedParkFees || []), ...(result.extractedParkFees || [])],
            extractedTransport: [...(prev.extractedTransport || []), ...(result.extractedTransport || [])],
            extractedFlights: [...(prev.extractedFlights || []), ...(result.extractedFlights || [])],
            extractedExtras: [...(prev.extractedExtras || []), ...(result.extractedExtras || [])],
          };
        });
        (result.extractedProperties || []).forEach(p => setSelectedPropIds(s => new Set(s).add(p.id)));
      }
    } catch (err: any) {
      setFileQueue(prev => prev.map(f => f.id === fileId ? {
        ...f,
        status: 'error',
        statusMessage: err?.message || 'Extraction retry failed',
      } : f));
    }
  };

  // Run Bulk AI Extraction across all files in the queue (or single text input)
  const handleRunBulkExtraction = async (onlyFailed: boolean = false) => {
    // If user pasted text and queue is empty, create a temporary queue item
    let queueToProcess = [...fileQueue];
    if (queueToProcess.length === 0 && contractText.trim()) {
      const textItem: QueuedContractFile = {
        id: `pasted-${Date.now()}`,
        name: 'Pasted_Safari_Contract.txt',
        size: contractText.length,
        mimeType: 'text/plain',
        textContent: contractText,
        status: 'pending',
      };
      queueToProcess = [textItem];
      setFileQueue([textItem]);
    }

    const itemsToRun = onlyFailed
      ? queueToProcess.filter(f => f.status === 'error' || f.status === 'pending')
      : queueToProcess;

    if (itemsToRun.length === 0) {
      setAnalysisError('Please upload one or more rate files, or paste contract text.');
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsBatchAnalyzing(true);
    setAnalysisError(null);
    setBatchProgress({ current: 0, total: itemsToRun.length, currentFileName: itemsToRun[0].name });

    const accumulatedResults: SupplierRatesExtractionResult[] = [];
    const updatedQueue = [...fileQueue];

    for (let i = 0; i < itemsToRun.length; i++) {
      if (controller.signal.aborted) break;

      const item = itemsToRun[i];
      const targetIndex = updatedQueue.findIndex(f => f.id === item.id);
      
      setBatchProgress({ current: i + 1, total: itemsToRun.length, currentFileName: item.name });

      // Mark analyzing
      if (targetIndex !== -1) {
        updatedQueue[targetIndex] = { ...item, status: 'analyzing', statusMessage: 'Extracting rates & seasons...' };
        setFileQueue([...updatedQueue]);
      }

      try {
        const result = await parseSingleContractPayload(item, controller.signal);
        
        // Tag properties and items with source document name if not present
        if (result.extractedProperties) {
          result.extractedProperties = result.extractedProperties.map(p => ({
            ...p,
            sourceDocument: p.sourceDocument || item.name,
          }));
        }

        if (targetIndex !== -1) {
          updatedQueue[targetIndex] = {
            ...item,
            status: 'extracted',
            statusMessage: `Extracted ${result.extractedProperties?.length || 0} lodges, ${result.extractedActivities?.length || 0} activities`,
            extractedResult: result,
          };
        }
        accumulatedResults.push(result);
      } catch (err: any) {
        console.warn(`Extraction warning for ${item.name}:`, err);
        if (targetIndex !== -1) {
          updatedQueue[targetIndex] = {
            ...item,
            status: 'error',
            statusMessage: err?.message || 'Extraction failed',
          };
        }
      }
      setFileQueue([...updatedQueue]);
    }

    setIsBatchAnalyzing(false);
    abortControllerRef.current = null;

    // Collect previous results from already extracted files if running failed-only
    if (onlyFailed) {
      fileQueue.forEach(f => {
        if (f.status === 'extracted' && f.extractedResult && !itemsToRun.some(it => it.id === f.id)) {
          accumulatedResults.push(f.extractedResult);
        }
      });
    }

    if (accumulatedResults.length === 0) {
      setAnalysisError('No contract rates could be extracted. Please check the files and try again.');
      return;
    }

    // Combine all extracted data into unified collections
    const rawAllProps: STOAccommodationProperty[] = accumulatedResults.flatMap(r => r.extractedProperties || []);
    const rawAllActs: ActivityOption[] = accumulatedResults.flatMap(r => r.extractedActivities || []);
    const rawAllParks: ParkFeeRecord[] = accumulatedResults.flatMap(r => r.extractedParkFees || []);
    const rawAllTrans: TransportOption[] = accumulatedResults.flatMap(r => r.extractedTransport || []);
    const rawAllFlights: FlightOption[] = accumulatedResults.flatMap(r => r.extractedFlights || []);
    const rawAllExtras: ExtraOperationalCost[] = accumulatedResults.flatMap(r => r.extractedExtras || []);

    // Ensure unique IDs across the entire batch
    const seenPropIds = new Set<string>();
    const normalizedProps: STOAccommodationProperty[] = rawAllProps.map((p, idx) => {
      let baseId = p.id || `prop-${(p.name || 'lodge').toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      if (!baseId.startsWith('prop-')) baseId = `prop-${baseId}`;
      let uniqueId = baseId;
      let counter = 1;
      while (seenPropIds.has(uniqueId)) {
        uniqueId = `${baseId}-${idx + 1}-${counter}`;
        counter++;
      }
      seenPropIds.add(uniqueId);

      return {
        id: uniqueId,
        name: p.name || 'Safari Lodge',
        country: p.country === 'Tanzania' ? 'Tanzania' : 'Kenya',
        region: p.region || 'East Africa',
        parkOrConservancyId: p.parkOrConservancyId || (p.country === 'Tanzania' ? 'park-serengeti' : 'park-maasai-mara'),
        boardBasis: p.boardBasis || 'Full Board (FB)',
        roomCategory: p.roomCategory || 'Luxury Safari Tent',
        validityYear: p.validityYear || 2026,
        sourceType: 'STO Rate Contract 2026',
        sourceDocument: p.sourceDocument || 'AI_Extracted_Contract.pdf',
        sourceDate: p.sourceDate || new Date().toISOString().split('T')[0],
        status: 'Active',
        seasons: (p.seasons || []).map((s, sIdx) => ({
          id: s.id ? `${uniqueId}-${s.id}` : `${uniqueId}-season-${sIdx + 1}`,
          seasonName: s.seasonName || `Season ${sIdx + 1}`,
          startDate: s.startDate || '01-01',
          endDate: s.endDate || '12-31',
          description: s.description || `${s.startDate} to ${s.endDate}`,
          ppsUsd: Number(s.ppsUsd) || 500,
          srsUsd: Number(s.srsUsd) || 200,
          childRateFactor: Number(s.childRateFactor) || 0.5,
          minNights: Number(s.minNights) || 1,
          notes: s.notes || undefined,
        })),
      };
    });

    const seenActIds = new Set<string>();
    const normalizedActs: ActivityOption[] = rawAllActs.map((a, idx) => {
      let baseId = a.id || `act-${(a.name || 'activity').toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      let uniqueId = baseId;
      let counter = 1;
      while (seenActIds.has(uniqueId)) {
        uniqueId = `${baseId}-${idx + 1}-${counter}`;
        counter++;
      }
      seenActIds.add(uniqueId);
      return {
        id: uniqueId,
        name: a.name || 'Safari Activity',
        location: a.location || 'East Africa',
        ratePerPaxUsd: Number(a.ratePerPaxUsd) || 50,
        ratePerVehicleUsd: a.ratePerVehicleUsd ? Number(a.ratePerVehicleUsd) : undefined,
        description: a.description || 'Guided safari excursion',
        category: (a.category as any) || 'Wildlife/Nature'
      };
    });

    const seenParkIds = new Set<string>();
    const normalizedParks: ParkFeeRecord[] = rawAllParks.map((pf, idx) => {
      let baseId = pf.id || `park-${(pf.parkName || 'park').toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      let uniqueId = baseId;
      let counter = 1;
      while (seenParkIds.has(uniqueId)) {
        uniqueId = `${baseId}-${idx + 1}-${counter}`;
        counter++;
      }
      seenParkIds.add(uniqueId);
      return {
        id: uniqueId,
        country: pf.country === 'Tanzania' ? 'Tanzania' : 'Kenya',
        parkName: pf.parkName || 'National Park / Reserve',
        areaType: pf.areaType || 'National Park',
        category: pf.category || 'Non-Resident Adult',
        highSeasonFeeUsd: Number(pf.highSeasonFeeUsd) || 80,
        lowSeasonFeeUsd: Number(pf.lowSeasonFeeUsd) || 60,
        isDaily: pf.isDaily !== undefined ? pf.isDaily : true,
        vehicleFeeUsd: pf.vehicleFeeUsd ? Number(pf.vehicleFeeUsd) : 0,
        concessionFeeUsd: pf.concessionFeeUsd ? Number(pf.concessionFeeUsd) : undefined,
        effectivePeriod: pf.effectivePeriod || '2026',
        officialAuthority: pf.officialAuthority || 'Wildlife Authority',
        verificationStatus: pf.verificationStatus || 'Official Verified',
        notes: pf.notes || undefined
      };
    });

    const seenTransIds = new Set<string>();
    const normalizedTrans: TransportOption[] = rawAllTrans.map((t, idx) => {
      let baseId = t.id || `trans-${(t.name || 'vehicle').toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      let uniqueId = baseId;
      let counter = 1;
      while (seenTransIds.has(uniqueId)) {
        uniqueId = `${baseId}-${idx + 1}-${counter}`;
        counter++;
      }
      seenTransIds.add(uniqueId);
      return {
        id: uniqueId,
        name: t.name || 'Safari Vehicle',
        vehicleType: t.vehicleType || '4x4 Safari Land Cruiser',
        maxCapacity: Number(t.maxCapacity) || 7,
        dailyRateHighUsd: Number(t.dailyRateHighUsd) || 280,
        dailyRateLowUsd: Number(t.dailyRateLowUsd) || 240,
        driverAllowanceDailyUsd: Number(t.driverAllowanceDailyUsd) || 40,
        includes: t.includes || 'Unlimited mileage, pop-up roof, experienced safari guide'
      };
    });

    const seenFlightIds = new Set<string>();
    const normalizedFlights: FlightOption[] = rawAllFlights.map((f, idx) => {
      let baseId = f.id || `flt-${(f.route || 'flight').toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      let uniqueId = baseId;
      let counter = 1;
      while (seenFlightIds.has(uniqueId)) {
        uniqueId = `${baseId}-${idx + 1}-${counter}`;
        counter++;
      }
      seenFlightIds.add(uniqueId);
      return {
        id: uniqueId,
        route: f.route || 'Safari Flight Route',
        airline: f.airline || 'Safari Airline',
        oneWayRateUsd: Number(f.oneWayRateUsd) || 250,
        baggageLimitKg: Number(f.baggageLimitKg) || 15,
        departurePoint: f.departurePoint || 'Nairobi Wilson',
        arrivalPoint: f.arrivalPoint || 'Airstrip'
      };
    });

    const seenExtraIds = new Set<string>();
    const normalizedExtras: ExtraOperationalCost[] = rawAllExtras.map((e, idx) => {
      let baseId = e.id || `ext-${(e.name || 'extra').toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      let uniqueId = baseId;
      let counter = 1;
      while (seenExtraIds.has(uniqueId)) {
        uniqueId = `${baseId}-${idx + 1}-${counter}`;
        counter++;
      }
      seenExtraIds.add(uniqueId);
      return {
        id: uniqueId,
        name: e.name || 'Operational Extra',
        unit: e.unit || 'Per Person',
        rateUsd: Number(e.rateUsd) || 25,
        mandatory: Boolean(e.mandatory),
        description: e.description || 'Safari operational service'
      };
    });

    // Execute semantic & rate-tier deduplication
    const { properties: dedupedProps, duplicatePropertiesCount, duplicateRatesCount } = deduplicateAccommodationDatabase(normalizedProps);
    const dedupedActs = deduplicateActivities(normalizedActs);
    const dedupedParks = deduplicateParkFees(normalizedParks);
    const dedupedTrans = deduplicateTransport(normalizedTrans);
    const dedupedFlights = deduplicateFlights(normalizedFlights);
    const dedupedExtras = deduplicateExtras(normalizedExtras);

    const totalSeasons = dedupedProps.reduce((sum, p) => sum + (p.seasons?.length || 0), 0);

    setDedupStats({
      duplicatesRemoved: duplicatePropertiesCount,
      seasonsRemoved: duplicateRatesCount,
      totalRateTiers: totalSeasons
    });

    const summaryText = `Successfully processed ${accumulatedResults.length} file(s). Extracted ${dedupedProps.length} accommodation properties (${totalSeasons} season tiers), ${dedupedActs.length} activities, ${dedupedParks.length} park fees, and transport options.`;

    setExtractedData({
      contractSummary: summaryText,
      supplierName: accumulatedResults.map(r => r.supplierName).filter(Boolean).join(', ') || 'East Africa Safari Suppliers',
      extractedProperties: dedupedProps,
      extractedActivities: dedupedActs,
      extractedParkFees: dedupedParks,
      extractedTransport: dedupedTrans,
      extractedFlights: dedupedFlights,
      extractedExtras: dedupedExtras
    });

    // Default select all extracted items
    setSelectedPropIds(new Set(dedupedProps.map(p => p.id)));
    setSelectedActIds(new Set(dedupedActs.map(a => a.id)));
    setSelectedParkIds(new Set(dedupedParks.map(p => p.id)));
    setSelectedTransIds(new Set(dedupedTrans.map(t => t.id)));
    setSelectedFlightIds(new Set(dedupedFlights.map(f => f.id)));
    setSelectedExtraIds(new Set(dedupedExtras.map(e => e.id)));

    // Choose default active tab
    if (dedupedProps.length > 0) setActiveReviewTab('accommodations');
    else if (dedupedActs.length > 0) setActiveReviewTab('activities');
    else if (dedupedParks.length > 0) setActiveReviewTab('parkFees');
    else if (dedupedTrans.length > 0) setActiveReviewTab('transport');
    else if (dedupedFlights.length > 0) setActiveReviewTab('flights');
    else setActiveReviewTab('extras');

    setHasCommitted(false);
    setCommitSummary(null);
  };

  // --- ITEM EDITING & MANAGEMENT HANDLERS ---
  
  const handleOpenEditProperty = (prop: STOAccommodationProperty) => {
    setEditingProperty(JSON.parse(JSON.stringify(prop)));
    setEditingItemType('property');
  };

  const handleSaveEditedProperty = () => {
    if (!editingProperty || !extractedData) return;
    setExtractedData(prev => {
      if (!prev) return prev;
      const updatedProps = (prev.extractedProperties || []).map(p => p.id === editingProperty.id ? editingProperty : p);
      return { ...prev, extractedProperties: updatedProps };
    });
    setEditingItemType(null);
    setEditingProperty(null);
  };

  const handleDeletePropertyFromReview = (id: string) => {
    setExtractedData(prev => {
      if (!prev) return prev;
      const updatedProps = (prev.extractedProperties || []).filter(p => p.id !== id);
      return { ...prev, extractedProperties: updatedProps };
    });
    setSelectedPropIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleAddNewManualProperty = () => {
    const newProp: STOAccommodationProperty = {
      id: `prop-manual-${Date.now()}`,
      name: 'New Safari Camp / Lodge',
      country: 'Kenya',
      region: 'Maasai Mara',
      parkOrConservancyId: 'park-maasai-mara',
      boardBasis: 'Full Board (FB)',
      roomCategory: 'Luxury Safari Suite',
      seasons: [
        {
          id: `sea-manual-${Date.now()}-high`,
          seasonName: 'High Season',
          startDate: '07-01',
          endDate: '10-31',
          description: 'July to October High Season',
          ppsUsd: 650,
          srsUsd: 180,
          childRateFactor: 0.5,
          minNights: 2,
          notes: 'Full board with 3 gourmet meals daily and laundry.'
        },
        {
          id: `sea-manual-${Date.now()}-low`,
          seasonName: 'Low / Green Season',
          startDate: '04-01',
          endDate: '05-31',
          description: 'April to May Green Season',
          ppsUsd: 420,
          srsUsd: 0,
          childRateFactor: 0.5,
          minNights: 1,
          notes: 'Single room supplement waived in Green Season.'
        }
      ],
      sourceDocument: 'Manual Entry',
      sourceDate: new Date().toISOString().split('T')[0],
      sourceType: 'STO Rate Contract 2026',
      validityYear: 2026,
      status: 'Active'
    };

    setExtractedData(prev => {
      const current = prev || {
        contractSummary: 'Manual Rates Added',
        extractedProperties: [],
        extractedActivities: [],
        extractedParkFees: [],
        extractedTransport: [],
        extractedFlights: [],
        extractedExtras: []
      };
      return {
        ...current,
        extractedProperties: [newProp, ...(current.extractedProperties || [])]
      };
    });

    setSelectedPropIds(prev => new Set([...Array.from(prev), newProp.id]));
    handleOpenEditProperty(newProp);
  };

  // Activity Edit
  const handleOpenEditActivity = (act: ActivityOption) => {
    setEditingActivity({ ...act });
    setEditingItemType('activity');
  };

  const handleSaveEditedActivity = () => {
    if (!editingActivity || !extractedData) return;
    setExtractedData(prev => {
      if (!prev) return prev;
      const updated = (prev.extractedActivities || []).map(a => a.id === editingActivity.id ? editingActivity : a);
      return { ...prev, extractedActivities: updated };
    });
    setEditingItemType(null);
    setEditingActivity(null);
  };

  const handleDeleteActivityFromReview = (id: string) => {
    setExtractedData(prev => {
      if (!prev) return prev;
      return { ...prev, extractedActivities: (prev.extractedActivities || []).filter(a => a.id !== id) };
    });
    setSelectedActIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  // Park Fee Edit
  const handleOpenEditParkFee = (park: ParkFeeRecord) => {
    setEditingParkFee({ ...park });
    setEditingItemType('parkFee');
  };

  const handleSaveEditedParkFee = () => {
    if (!editingParkFee || !extractedData) return;
    setExtractedData(prev => {
      if (!prev) return prev;
      const updated = (prev.extractedParkFees || []).map(p => p.id === editingParkFee.id ? editingParkFee : p);
      return { ...prev, extractedParkFees: updated };
    });
    setEditingItemType(null);
    setEditingParkFee(null);
  };

  const handleDeleteParkFeeFromReview = (id: string) => {
    setExtractedData(prev => {
      if (!prev) return prev;
      return { ...prev, extractedParkFees: (prev.extractedParkFees || []).filter(p => p.id !== id) };
    });
    setSelectedParkIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  // Transport Edit
  const handleOpenEditTransport = (trans: TransportOption) => {
    setEditingTransport({ ...trans });
    setEditingItemType('transport');
  };

  const handleSaveEditedTransport = () => {
    if (!editingTransport || !extractedData) return;
    setExtractedData(prev => {
      if (!prev) return prev;
      const updated = (prev.extractedTransport || []).map(t => t.id === editingTransport.id ? editingTransport : t);
      return { ...prev, extractedTransport: updated };
    });
    setEditingItemType(null);
    setEditingTransport(null);
  };

  const handleDeleteTransportFromReview = (id: string) => {
    setExtractedData(prev => {
      if (!prev) return prev;
      return { ...prev, extractedTransport: (prev.extractedTransport || []).filter(t => t.id !== id) };
    });
    setSelectedTransIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  // Flight Edit
  const handleOpenEditFlight = (flight: FlightOption) => {
    setEditingFlight({ ...flight });
    setEditingItemType('flight');
  };

  const handleSaveEditedFlight = () => {
    if (!editingFlight || !extractedData) return;
    setExtractedData(prev => {
      if (!prev) return prev;
      const updated = (prev.extractedFlights || []).map(f => f.id === editingFlight.id ? editingFlight : f);
      return { ...prev, extractedFlights: updated };
    });
    setEditingItemType(null);
    setEditingFlight(null);
  };

  const handleDeleteFlightFromReview = (id: string) => {
    setExtractedData(prev => {
      if (!prev) return prev;
      return { ...prev, extractedFlights: (prev.extractedFlights || []).filter(f => f.id !== id) };
    });
    setSelectedFlightIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  // Extra Edit
  const handleOpenEditExtra = (extra: ExtraOperationalCost) => {
    setEditingExtra({ ...extra });
    setEditingItemType('extra');
  };

  const handleSaveEditedExtra = () => {
    if (!editingExtra || !extractedData) return;
    setExtractedData(prev => {
      if (!prev) return prev;
      const updated = (prev.extractedExtras || []).map(e => e.id === editingExtra.id ? editingExtra : e);
      return { ...prev, extractedExtras: updated };
    });
    setEditingItemType(null);
    setEditingExtra(null);
  };

  const handleDeleteExtraFromReview = (id: string) => {
    setExtractedData(prev => {
      if (!prev) return prev;
      return { ...prev, extractedExtras: (prev.extractedExtras || []).filter(e => e.id !== id) };
    });
    setSelectedExtraIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  // Commit Extracted to Respective Active DBs
  const handleCommitToDatabase = () => {
    if (!extractedData) return;

    let propsCount = 0;
    let actsCount = 0;
    let parksCount = 0;
    let transCount = 0;
    let flightsCount = 0;
    let extrasCount = 0;

    // 1. Accommodations
    if (onAddProperties && extractedData.extractedProperties) {
      const selected = extractedData.extractedProperties.filter(p => selectedPropIds.has(p.id));
      if (selected.length > 0) {
        onAddProperties(selected);
        propsCount = selected.length;
      }
    }

    // 2. Activities
    if (onAddActivities && extractedData.extractedActivities) {
      const selected = extractedData.extractedActivities.filter(a => selectedActIds.has(a.id));
      if (selected.length > 0) {
        onAddActivities(selected);
        actsCount = selected.length;
      }
    }

    // 3. Park Fees
    if (onAddParkFees && extractedData.extractedParkFees) {
      const selected = extractedData.extractedParkFees.filter(p => selectedParkIds.has(p.id));
      if (selected.length > 0) {
        onAddParkFees(selected);
        parksCount = selected.length;
      }
    }

    // 4. Transport
    if (onAddTransport && extractedData.extractedTransport) {
      const selected = extractedData.extractedTransport.filter(t => selectedTransIds.has(t.id));
      if (selected.length > 0) {
        onAddTransport(selected);
        transCount = selected.length;
      }
    }

    // 5. Flights
    if (onAddFlights && extractedData.extractedFlights) {
      const selected = extractedData.extractedFlights.filter(f => selectedFlightIds.has(f.id));
      if (selected.length > 0) {
        onAddFlights(selected);
        flightsCount = selected.length;
      }
    }

    // 6. Extras
    if (onAddExtras && extractedData.extractedExtras) {
      const selected = extractedData.extractedExtras.filter(e => selectedExtraIds.has(e.id));
      if (selected.length > 0) {
        onAddExtras(selected);
        extrasCount = selected.length;
      }
    }

    // Auto-record snapshot in Rate Protection Safety Vault
    try {
      saveVaultSnapshot(
        `AI Ingestion of ${propsCount} Lodges (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
        'contract_import',
        {
          accommodations: extractedData.extractedProperties?.filter(p => selectedPropIds.has(p.id)),
          parkFees: extractedData.extractedParkFees?.filter(p => selectedParkIds.has(p.id)),
          activities: extractedData.extractedActivities?.filter(a => selectedActIds.has(a.id)),
          transport: extractedData.extractedTransport?.filter(t => selectedTransIds.has(t.id)),
          flights: extractedData.extractedFlights?.filter(f => selectedFlightIds.has(f.id)),
          extras: extractedData.extractedExtras?.filter(e => selectedExtraIds.has(e.id))
        }
      );
    } catch (e) {
      console.warn('Vault snapshot recording info:', e);
    }

    // Direct cloud synchronization to guarantee persistence on server & published deployments
    try {
      syncMasterDatabaseToServer({
        accommodations: extractedData.extractedProperties?.filter(p => selectedPropIds.has(p.id)),
        parkFees: extractedData.extractedParkFees?.filter(p => selectedParkIds.has(p.id)),
        activities: extractedData.extractedActivities?.filter(a => selectedActIds.has(a.id)),
        transport: extractedData.extractedTransport?.filter(t => selectedTransIds.has(t.id)),
        flights: extractedData.extractedFlights?.filter(f => selectedFlightIds.has(f.id)),
        extras: extractedData.extractedExtras?.filter(e => selectedExtraIds.has(e.id)),
      });
    } catch (e) {
      console.warn('Server sync trigger info:', e);
    }

    setHasCommitted(true);
    setCommitSummary(
      `Saved to Master Database & Published: ${propsCount} Accommodations, ${actsCount} Activities, ${parksCount} Park Tariffs, ${transCount} Vehicles, ${flightsCount} Flights, ${extrasCount} Operational Extras.`
    );
  };

  // Filter items by source file if requested
  const uniqueSourceDocuments = Array.from(new Set(
    (extractedData?.extractedProperties || []).map(p => p.sourceDocument).filter(Boolean)
  ));

  const filteredProperties = (extractedData?.extractedProperties || []).filter(p => 
    selectedSourceFilter === 'ALL' || p.sourceDocument === selectedSourceFilter
  );

  const totalExtractedCount =
    (extractedData?.extractedProperties?.length || 0) +
    (extractedData?.extractedActivities?.length || 0) +
    (extractedData?.extractedParkFees?.length || 0) +
    (extractedData?.extractedTransport?.length || 0) +
    (extractedData?.extractedFlights?.length || 0) +
    (extractedData?.extractedExtras?.length || 0);

  const totalSelectedCount =
    selectedPropIds.size +
    selectedActIds.size +
    selectedParkIds.size +
    selectedTransIds.size +
    selectedFlightIds.size +
    selectedExtraIds.size;

  return (
    <div id="contract-importer-container" className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                Bulk AI Safari Contract & Supplier Rates Ingestor
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                Bulk Multi-File Enabled
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload multiple STO contracts simultaneously (PDF, JPG/PNG rate cards, Word, CSV). Edit any extracted entry before saving to the database.
            </p>
          </div>
        </div>

        {/* Input Mode Selector */}
        {!extractedData && (
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setInputMode('upload')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                inputMode === 'upload' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Bulk Files ({fileQueue.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setInputMode('paste')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                inputMode === 'paste' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Paste Text</span>
            </button>
            <button
              type="button"
              onClick={() => setInputMode('sample')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                inputMode === 'sample' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Sample Contracts</span>
            </button>
          </div>
        )}

        {extractedData && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setExtractedData(null);
                setHasCommitted(false);
              }}
              className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload More Files</span>
            </button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* INPUT ZONE (When not yet reviewed or adding more) */}
      {!extractedData && (
        <div className="space-y-4">
          
          {/* 1. Bulk File Upload Dropzone */}
          {inputMode === 'upload' && (
            <div className="space-y-4">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
                  isDragging
                    ? 'border-amber-500 bg-amber-500/10'
                    : 'border-slate-300 hover:border-slate-400 bg-slate-50/60'
                }`}
                onClick={() => {
                  const input = document.getElementById('bulk-contract-file-input');
                  if (input) input.click();
                }}
              >
                <input
                  id="bulk-contract-file-input"
                  type="file"
                  multiple
                  accept=".pdf,.docx,.doc,.txt,.csv,.xlsx,.xls,image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleAddFilesToQueue(e.target.files);
                    }
                  }}
                />

                <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 mx-auto flex items-center justify-center shadow-xs">
                  <Upload className="w-7 h-7" />
                </div>
                <div className="font-bold text-sm text-slate-800 mt-3">
                  Drag & Drop Multiple Safari Rate Contracts or Tariff Sheets Here
                </div>
                <div className="text-xs text-slate-500 max-w-md mt-1">
                  Supports multiple PDFs, scanned JPG/PNG contracts (e.g. Kizingo FB & Rack), Word documents, Excel rate sheets, and text tables.
                </div>
                <div className="pt-3 flex items-center gap-2">
                  <button
                    type="button"
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Select Multiple Files from Computer</span>
                  </button>
                </div>
              </div>

              {/* Uploaded Files Queue List */}
              {fileQueue.length > 0 && (
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Layers className="w-4 h-4 text-amber-600" />
                      <span className="font-bold text-xs text-slate-900">
                        Queued Contract Files ({fileQueue.length})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearQueue}
                      className="text-[11px] font-semibold text-red-600 hover:text-red-800"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
                    {fileQueue.map((item, idx) => (
                      <div
                        key={item.id}
                        className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-3 shadow-2xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 text-slate-600">
                            {item.mimeType.includes('pdf') ? (
                              <FileText className="w-4 h-4 text-red-500" />
                            ) : item.mimeType.includes('image') ? (
                              <FileCheck className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <FileSpreadsheet className="w-4 h-4 text-sky-500" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-xs text-slate-800 truncate" title={item.name}>
                              {item.name}
                            </div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                              <span>{(item.size / 1024).toFixed(1)} KB</span>
                              {item.status === 'analyzing' && (
                                <span className="text-amber-600 font-semibold flex items-center gap-1">
                                  <Loader2 className="w-2.5 h-2.5 animate-spin" /> Ingesting...
                                </span>
                              )}
                              {item.status === 'extracted' && (
                                <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                                  <CheckCircle2 className="w-2.5 h-2.5" /> Extracted
                                </span>
                              )}
                              {item.status === 'error' && (
                                <div className="flex items-center gap-1.5 text-red-600">
                                  <span className="font-semibold">Error</span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRetrySingleFile(item.id);
                                    }}
                                    className="text-[10px] underline font-bold hover:text-red-800 flex items-center gap-0.5"
                                  >
                                    <RotateCcw className="w-2.5 h-2.5" /> Retry
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveFromQueue(item.id)}
                          className="text-slate-400 hover:text-red-600 p-1 rounded-lg transition-colors shrink-0"
                          title="Remove from queue"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. Paste Text Area */}
          {inputMode === 'paste' && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Paste Raw Contract / Rate Sheet Text:
              </label>
              <textarea
                value={contractText}
                onChange={(e) => setContractText(e.target.value)}
                placeholder="Paste lodge STO rates, seasonal schedules, meal plans, activities, or park fee tables here..."
                rows={8}
                className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
              <div className="text-[11px] text-slate-400 flex justify-between">
                <span>{contractText.length} characters</span>
                <span>Supports unstructured multi-season rate sheets</span>
              </div>
            </div>
          )}

          {/* 3. Sample Presets */}
          {inputMode === 'sample' && (
            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-600">
                Choose a pre-configured East Africa safari contract to test AI extraction:
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {SAMPLE_STO_CONTRACTS.map((preset) => (
                  <div
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                      contractText === preset.contractText
                        ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20'
                        : 'border-slate-200 bg-slate-50/70 hover:border-slate-300 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold text-xs text-slate-900">{preset.name}</div>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700 whitespace-nowrap">
                        {preset.lodgesCount} {preset.lodgesCount === 1 ? 'Item' : 'Lodges'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">{preset.description}</div>
                    <div className="mt-2 flex items-center justify-between text-[10px] text-amber-700 font-semibold">
                      <span>Provider: {preset.provider}</span>
                      <span>{preset.validity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Alert */}
          {analysisError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{analysisError}</span>
              </div>
              {fileQueue.some(f => f.status === 'error') && (
                <button
                  type="button"
                  onClick={() => handleRunBulkExtraction(true)}
                  className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 shrink-0"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Retry Failed Files</span>
                </button>
              )}
            </div>
          )}

          {/* Action Trigger */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Smart AI automatically structures Accommodations, Seasons, PPS/SRS, Transport & Park Fees</span>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              {isBatchAnalyzing && (
                <button
                  type="button"
                  onClick={handleCancelBatchExtraction}
                  className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
              )}

              {fileQueue.some(f => f.status === 'error') && !isBatchAnalyzing && (
                <button
                  type="button"
                  onClick={() => handleRunBulkExtraction(true)}
                  className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retry Failed ({fileQueue.filter(f => f.status === 'error').length})</span>
                </button>
              )}

              <button
                type="button"
                disabled={isBatchAnalyzing || (fileQueue.length === 0 && !contractText.trim())}
                onClick={() => handleRunBulkExtraction(false)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all ${
                  isBatchAnalyzing || (fileQueue.length === 0 && !contractText.trim())
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs active:scale-95 cursor-pointer'
                }`}
              >
                {isBatchAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Processing ({batchProgress.current}/{batchProgress.total})...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    <span>
                      {fileQueue.length > 1
                        ? `Batch Ingest All (${fileQueue.length} Files)`
                        : 'Ingest & Parse with AI'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Batch Progress Bar */}
          {isBatchAnalyzing && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-center animate-pulse">
              <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                <span>Ingesting {batchProgress.currentFileName || 'Contract'}</span>
                <span>{batchProgress.current} of {batchProgress.total}</span>
              </div>
              <div className="w-full bg-amber-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-600 h-full transition-all duration-300"
                  style={{ width: `${Math.max(5, (batchProgress.current / Math.max(1, batchProgress.total)) * 100)}%` }}
                />
              </div>
            </div>
          )}

        </div>
      )}

      {/* REVIEW & APPROVAL ZONE */}
      {extractedData && (
        <div className="space-y-5">
          
          {/* Summary Box */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-xs uppercase tracking-wider text-amber-400">
                  AI Multi-Document Rate Extraction Complete
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] bg-slate-800 px-2.5 py-1 rounded-lg text-slate-300 font-mono">
                  {totalExtractedCount} Records Found ({totalSelectedCount} Selected)
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-300">
              {extractedData.contractSummary}
            </p>
            {extractedData.supplierName && (
              <div className="text-[11px] text-amber-300/80 font-semibold pt-1">
                Suppliers: {extractedData.supplierName}
              </div>
            )}
          </div>

          {/* Filter by Source File & Quick Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-500 font-medium">Filter by Source File:</span>
              <select
                value={selectedSourceFilter}
                onChange={(e) => setSelectedSourceFilter(e.target.value)}
                className="bg-white border border-slate-200 text-slate-800 rounded-lg px-2.5 py-1 text-xs font-semibold"
              >
                <option value="ALL">All Sources ({totalExtractedCount} items)</option>
                {uniqueSourceDocuments.map(src => (
                  <option key={src} value={src}>{src}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAddNewManualProperty}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs flex items-center gap-1 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Custom Rate Entry</span>
              </button>
            </div>
          </div>

          {/* Deduplication Guarantee Card */}
          <div className="p-3.5 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <div className="font-bold text-emerald-300 text-xs flex items-center gap-2">
                  <span>Zero-Duplicate Rate Integrity Active</span>
                  {dedupStats.seasonsRemoved > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-semibold">
                      {dedupStats.seasonsRemoved} duplicate rate(s) removed
                    </span>
                  )}
                  {dedupStats.duplicatesRemoved > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold">
                      {dedupStats.duplicatesRemoved} duplicate facility block(s) consolidated
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-emerald-400/80 mt-0.5">
                  Identical rates from the same facility are strictly consolidated into single distinct season records.
                </div>
              </div>
            </div>
            <div className="text-[11px] font-mono text-emerald-400 bg-emerald-900/40 px-2.5 py-1 rounded-lg border border-emerald-700/50 self-start sm:self-auto">
              {dedupStats.totalRateTiers} Unique Season Rate Tier(s)
            </div>
          </div>

          {/* Committed Banner */}
          {hasCommitted && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-emerald-800">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-bold text-xs">Successfully added to Safari Costing Databases & Rate Vault!</div>
                  <div className="text-[11px] text-emerald-700">{commitSummary}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setExtractedData(null);
                  setFileQueue([]);
                  setContractText('');
                  setHasCommitted(false);
                }}
                className="px-3 py-1.5 bg-emerald-700 text-white text-xs font-bold rounded-lg hover:bg-emerald-800 shrink-0"
              >
                Ingest More Contracts
              </button>
            </div>
          )}

          {/* Category Tabs for Review */}
          <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
            <button
              type="button"
              onClick={() => setActiveReviewTab('accommodations')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeReviewTab === 'accommodations'
                  ? 'bg-slate-900 text-amber-400'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Accommodations</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-300">
                {extractedData.extractedProperties?.length || 0}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveReviewTab('activities')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeReviewTab === 'activities'
                  ? 'bg-slate-900 text-amber-400'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Activities & Excursions</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-300">
                {extractedData.extractedActivities?.length || 0}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveReviewTab('parkFees')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeReviewTab === 'parkFees'
                  ? 'bg-slate-900 text-amber-400'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <TreePine className="w-3.5 h-3.5" />
              <span>Park & Conservancy Fees</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-300">
                {extractedData.extractedParkFees?.length || 0}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveReviewTab('transport')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeReviewTab === 'transport'
                  ? 'bg-slate-900 text-amber-400'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Vehicles & Transport</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-300">
                {extractedData.extractedTransport?.length || 0}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveReviewTab('flights')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeReviewTab === 'flights'
                  ? 'bg-slate-900 text-amber-400'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Plane className="w-3.5 h-3.5" />
              <span>Flights & Air Transfers</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-300">
                {extractedData.extractedFlights?.length || 0}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveReviewTab('extras')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeReviewTab === 'extras'
                  ? 'bg-slate-900 text-amber-400'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Operational Extras</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-300">
                {extractedData.extractedExtras?.length || 0}
              </span>
            </button>
          </div>

          {/* TAB CONTENT: Accommodations */}
          {activeReviewTab === 'accommodations' && (
            <div className="space-y-3">
              {filteredProperties.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl text-slate-500 text-xs">
                  No accommodation properties found for the selected filter.
                </div>
              ) : (
                filteredProperties.map((prop, pIdx) => {
                  const isChecked = selectedPropIds.has(prop.id);
                  return (
                    <div
                      key={`${prop.id}-${pIdx}`}
                      className={`p-4 rounded-xl border transition-all ${
                        isChecked ? 'bg-white border-amber-300 shadow-xs' : 'bg-slate-50 border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              const next = new Set(selectedPropIds);
                              if (e.target.checked) next.add(prop.id);
                              else next.delete(prop.id);
                              setSelectedPropIds(next);
                            }}
                            className="mt-0.5 rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                          />
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-xs text-slate-900">{prop.name}</span>
                              {prop.facilityGroup && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                  {prop.facilityGroup}
                                </span>
                              )}
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                                {prop.boardBasis}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                prop.marketSegment === 'East Africa Resident' || prop.marketSegment === 'Citizen'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {prop.marketSegment || 'Non-Resident'} ({prop.currency || 'USD'})
                              </span>
                              <span className="text-[11px] text-slate-500">
                                {prop.roomCategory} • {prop.country} ({prop.region})
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
                              <span>Linked Park Fee ID: <code className="font-mono text-slate-600">{prop.parkOrConservancyId}</code></span>
                              <span>•</span>
                              <span>Source: <span className="font-medium text-slate-700">{prop.sourceDocument}</span></span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 self-end sm:self-auto">
                          <button
                            type="button"
                            onClick={() => handleOpenEditProperty(prop)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                          >
                            <Edit2 className="w-3 h-3 text-amber-600" />
                            <span>Edit Entry</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePropertyFromReview(prop.id)}
                            className="p-1 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                            title="Delete from review"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded ml-1">
                            {prop.seasons.length} Season Tiers
                          </span>
                        </div>
                      </div>

                      {/* Seasons Table */}
                      <div className="mt-3 overflow-x-auto">
                        <table className="w-full text-left text-[11px]">
                          <thead>
                            <tr className="border-b border-slate-200 text-slate-500 font-medium">
                              <th className="py-1">Season Name</th>
                              <th className="py-1">Dates</th>
                              <th className="py-1 text-right">Net PPS</th>
                              <th className="py-1 text-right">Net SRS</th>
                              <th className="py-1 text-right">Child Factor</th>
                              <th className="py-1 pl-3">Notes / Inclusions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-mono">
                            {prop.seasons.map((season, sIdx) => (
                              <tr key={`${season.id || 'season'}-${sIdx}`}>
                                <td className="py-1 font-sans font-semibold text-slate-800">{season.seasonName}</td>
                                <td className="py-1 text-slate-600">{season.startDate} to {season.endDate}</td>
                                <td className="py-1 text-right font-bold text-emerald-700">
                                  ${season.ppsUsd.toFixed(2)}
                                  {season.ppsLocalCurrency ? (
                                    <span className="block text-[9px] text-slate-500 font-normal">
                                      ({season.currency || prop.currency || 'KES'} {season.ppsLocalCurrency.toLocaleString()})
                                    </span>
                                  ) : null}
                                </td>
                                <td className="py-1 text-right text-slate-700">+${season.srsUsd.toFixed(2)}</td>
                                <td className="py-1 text-right text-slate-600">{(season.childRateFactor * 100).toFixed(0)}%</td>
                                <td className="py-1 pl-3 font-sans text-slate-500 text-[10px]">{season.notes || season.description}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB CONTENT: Activities */}
          {activeReviewTab === 'activities' && (
            <div className="space-y-3">
              {(!extractedData.extractedActivities || extractedData.extractedActivities.length === 0) ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl text-slate-500 text-xs">
                  No activities or excursions found in this contract.
                </div>
              ) : (
                extractedData.extractedActivities.map((act, actIdx) => {
                  const isChecked = selectedActIds.has(act.id);
                  return (
                    <div
                      key={`${act.id}-${actIdx}`}
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                        isChecked ? 'bg-white border-amber-300 shadow-2xs' : 'bg-slate-50 border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const next = new Set(selectedActIds);
                            if (e.target.checked) next.add(act.id);
                            else next.delete(act.id);
                            setSelectedActIds(next);
                          }}
                          className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900">{act.name}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800">
                              {act.category}
                            </span>
                            <span className="text-[11px] text-slate-500">📍 {act.location}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{act.description}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <div className="font-bold text-xs text-emerald-700 font-mono">
                            ${act.ratePerPaxUsd.toFixed(2)} / pax
                          </div>
                          {act.ratePerVehicleUsd && (
                            <div className="text-[10px] text-slate-500 font-mono">
                              ${act.ratePerVehicleUsd.toFixed(2)} / charter
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleOpenEditActivity(act)}
                          className="p-1 text-slate-400 hover:text-amber-600 rounded transition-colors"
                          title="Edit activity"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteActivityFromReview(act.id)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB CONTENT: Park Fees */}
          {activeReviewTab === 'parkFees' && (
            <div className="space-y-3">
              {(!extractedData.extractedParkFees || extractedData.extractedParkFees.length === 0) ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl text-slate-500 text-xs">
                  No park or conservancy tariffs extracted from this document.
                </div>
              ) : (
                extractedData.extractedParkFees.map((park, pkIdx) => {
                  const isChecked = selectedParkIds.has(park.id);
                  return (
                    <div
                      key={`${park.id}-${pkIdx}`}
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                        isChecked ? 'bg-white border-amber-300 shadow-2xs' : 'bg-slate-50 border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const next = new Set(selectedParkIds);
                            if (e.target.checked) next.add(park.id);
                            else next.delete(park.id);
                            setSelectedParkIds(next);
                          }}
                          className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900">{park.parkName}</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              {park.areaType}
                            </span>
                            <span className="text-[11px] text-slate-500">{park.country}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Authority: {park.officialAuthority} • {park.effectivePeriod}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right font-mono">
                          <div className="font-bold text-xs text-emerald-700">
                            High: ${park.highSeasonFeeUsd.toFixed(2)} | Low: ${park.lowSeasonFeeUsd.toFixed(2)}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {park.isDaily ? 'Per Day (24h)' : 'Per Night'}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleOpenEditParkFee(park)}
                          className="p-1 text-slate-400 hover:text-amber-600 rounded transition-colors"
                          title="Edit park fee"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteParkFeeFromReview(park.id)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB CONTENT: Transport */}
          {activeReviewTab === 'transport' && (
            <div className="space-y-3">
              {(!extractedData.extractedTransport || extractedData.extractedTransport.length === 0) ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl text-slate-500 text-xs">
                  No safari vehicle rates found in this document.
                </div>
              ) : (
                extractedData.extractedTransport.map((trans, tIdx) => {
                  const isChecked = selectedTransIds.has(trans.id);
                  return (
                    <div
                      key={`${trans.id}-${tIdx}`}
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                        isChecked ? 'bg-white border-amber-300 shadow-2xs' : 'bg-slate-50 border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const next = new Set(selectedTransIds);
                            if (e.target.checked) next.add(trans.id);
                            else next.delete(trans.id);
                            setSelectedTransIds(next);
                          }}
                          className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                        />
                        <div>
                          <div className="font-bold text-xs text-slate-900">{trans.name}</div>
                          <div className="text-[11px] text-slate-500">{trans.includes}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right font-mono">
                          <div className="font-bold text-xs text-emerald-700">
                            ${trans.dailyRateHighUsd.toFixed(2)} / day
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Max {trans.maxCapacity} Seats • Guide: +${trans.driverAllowanceDailyUsd}/day
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleOpenEditTransport(trans)}
                          className="p-1 text-slate-400 hover:text-amber-600 rounded transition-colors"
                          title="Edit vehicle"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTransportFromReview(trans.id)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB CONTENT: Flights */}
          {activeReviewTab === 'flights' && (
            <div className="space-y-3">
              {(!extractedData.extractedFlights || extractedData.extractedFlights.length === 0) ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl text-slate-500 text-xs">
                  No flights or air transfers found in this document.
                </div>
              ) : (
                extractedData.extractedFlights.map((flight, fIdx) => {
                  const isChecked = selectedFlightIds.has(flight.id);
                  return (
                    <div
                      key={`${flight.id}-${fIdx}`}
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                        isChecked ? 'bg-white border-amber-300 shadow-2xs' : 'bg-slate-50 border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const next = new Set(selectedFlightIds);
                            if (e.target.checked) next.add(flight.id);
                            else next.delete(flight.id);
                            setSelectedFlightIds(next);
                          }}
                          className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                        />
                        <div>
                          <div className="font-bold text-xs text-slate-900">{flight.route}</div>
                          <div className="text-[11px] text-slate-500">
                            {flight.airline} • {flight.departurePoint} ➔ {flight.arrivalPoint} • {flight.baggageLimitKg}kg limit
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right font-mono">
                          <div className="font-bold text-xs text-emerald-700">
                            ${flight.oneWayRateUsd.toFixed(2)} / pax
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleOpenEditFlight(flight)}
                          className="p-1 text-slate-400 hover:text-amber-600 rounded transition-colors"
                          title="Edit flight"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteFlightFromReview(flight.id)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB CONTENT: Extras */}
          {activeReviewTab === 'extras' && (
            <div className="space-y-3">
              {(!extractedData.extractedExtras || extractedData.extractedExtras.length === 0) ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl text-slate-500 text-xs">
                  No operational extras or emergency evacuation fees extracted.
                </div>
              ) : (
                extractedData.extractedExtras.map((extra, eIdx) => {
                  const isChecked = selectedExtraIds.has(extra.id);
                  return (
                    <div
                      key={`${extra.id}-${eIdx}`}
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                        isChecked ? 'bg-white border-amber-300 shadow-2xs' : 'bg-slate-50 border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const next = new Set(selectedExtraIds);
                            if (e.target.checked) next.add(extra.id);
                            else next.delete(extra.id);
                            setSelectedExtraIds(next);
                          }}
                          className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900">{extra.name}</span>
                            {extra.mandatory && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">
                                Mandatory
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{extra.description}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right font-mono">
                          <div className="font-bold text-xs text-emerald-700">
                            ${extra.rateUsd.toFixed(2)}
                          </div>
                          <div className="text-[10px] text-slate-500">{extra.unit}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleOpenEditExtra(extra)}
                          className="p-1 text-slate-400 hover:text-amber-600 rounded transition-colors"
                          title="Edit extra"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteExtraFromReview(extra.id)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Bottom Commit Action Bar */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="font-bold text-xs text-amber-400">
                Ready to Commit to Safari Costing System?
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {totalSelectedCount} selected record(s) will be merged into the wholesale STO registry with zero-duplicate protection.
              </div>
            </div>

            <button
              type="button"
              disabled={totalSelectedCount === 0}
              onClick={handleCommitToDatabase}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-xs transition-all ${
                totalSelectedCount === 0
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs active:scale-95 cursor-pointer'
              }`}
            >
              <Save className="w-4 h-4 text-slate-950" />
              <span>Save Selected ({totalSelectedCount}) to Safari Databases</span>
            </button>
          </div>

        </div>
      )}

      {/* MODAL: EDIT ACCOMMODATION PROPERTY */}
      {editingItemType === 'property' && editingProperty && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-sm text-slate-900">Edit Accommodation Property & Seasonal Rates</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingItemType(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Property Name:</label>
                <input
                  type="text"
                  value={editingProperty.name}
                  onChange={(e) => setEditingProperty({ ...editingProperty, name: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Hospitality Group / Chain:</label>
                <input
                  type="text"
                  value={editingProperty.facilityGroup || ''}
                  onChange={(e) => setEditingProperty({ ...editingProperty, facilityGroup: e.target.value })}
                  placeholder="e.g. Sarova, Serena, Elewana, Governors"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Country:</label>
                <select
                  value={editingProperty.country}
                  onChange={(e) => setEditingProperty({ ...editingProperty, country: e.target.value as any })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <option value="Kenya">Kenya</option>
                  <option value="Tanzania">Tanzania</option>
                  <option value="Rwanda">Rwanda</option>
                  <option value="Uganda">Uganda</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Market Segment / Residency:</label>
                <select
                  value={editingProperty.marketSegment || 'Non-Resident'}
                  onChange={(e) => setEditingProperty({ ...editingProperty, marketSegment: e.target.value as any })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                >
                  <option value="Non-Resident">Non-Resident (International)</option>
                  <option value="East Africa Resident">East Africa Resident (EA Permit)</option>
                  <option value="Citizen">East African Citizen</option>
                  <option value="All Markets">All Markets</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Contract Currency:</label>
                <select
                  value={editingProperty.currency || 'USD'}
                  onChange={(e) => setEditingProperty({ ...editingProperty, currency: e.target.value as any })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                >
                  <option value="USD">USD ($)</option>
                  <option value="KES">KES (Kenya Shillings)</option>
                  <option value="TZS">TZS (Tanzania Shillings)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Region / Park Area:</label>
                <input
                  type="text"
                  value={editingProperty.region}
                  onChange={(e) => setEditingProperty({ ...editingProperty, region: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Linked Park / Conservancy ID:</label>
                <input
                  type="text"
                  value={editingProperty.parkOrConservancyId}
                  onChange={(e) => setEditingProperty({ ...editingProperty, parkOrConservancyId: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Board Basis:</label>
                <select
                  value={editingProperty.boardBasis}
                  onChange={(e) => setEditingProperty({ ...editingProperty, boardBasis: e.target.value as any })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <option value="Full Board (FB)">Full Board (FB)</option>
                  <option value="Game Package (GP)">Game Package (GP)</option>
                  <option value="All Inclusive (AI)">All Inclusive (AI)</option>
                  <option value="Bed & Breakfast (BB)">Bed & Breakfast (BB)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Room Category:</label>
                <input
                  type="text"
                  value={editingProperty.roomCategory}
                  onChange={(e) => setEditingProperty({ ...editingProperty, roomCategory: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            {/* Seasonal Rates Editor */}
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900">
                  Season Rate Tiers ({editingProperty.seasons.length})
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const newSeason: STOSeasonRate = {
                      id: `sea-${Date.now()}`,
                      seasonName: 'New Season',
                      startDate: '01-01',
                      endDate: '12-31',
                      description: 'Custom Season',
                      ppsUsd: 500,
                      srsUsd: 150,
                      childRateFactor: 0.5,
                      minNights: 1,
                    };
                    setEditingProperty({
                      ...editingProperty,
                      seasons: [...editingProperty.seasons, newSeason]
                    });
                  }}
                  className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-[11px] font-bold flex items-center gap-1 hover:bg-amber-100"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Season Tier</span>
                </button>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {editingProperty.seasons.map((season, sIdx) => (
                  <div key={season.id || sIdx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={season.seasonName}
                        onChange={(e) => {
                          const seasons = [...editingProperty.seasons];
                          seasons[sIdx].seasonName = e.target.value;
                          setEditingProperty({ ...editingProperty, seasons });
                        }}
                        className="font-bold text-slate-800 bg-white border border-slate-200 rounded px-2 py-1 flex-1"
                        placeholder="Season Name"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const seasons = editingProperty.seasons.filter((_, idx) => idx !== sIdx);
                          setEditingProperty({ ...editingProperty, seasons });
                        }}
                        className="p-1 text-slate-400 hover:text-red-600 rounded"
                        title="Delete Season"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Start Date (MM-DD)</span>
                        <input
                          type="text"
                          value={season.startDate}
                          onChange={(e) => {
                            const seasons = [...editingProperty.seasons];
                            seasons[sIdx].startDate = e.target.value;
                            setEditingProperty({ ...editingProperty, seasons });
                          }}
                          className="w-full bg-white border border-slate-200 rounded px-2 py-1 font-mono text-[11px]"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">End Date (MM-DD)</span>
                        <input
                          type="text"
                          value={season.endDate}
                          onChange={(e) => {
                            const seasons = [...editingProperty.seasons];
                            seasons[sIdx].endDate = e.target.value;
                            setEditingProperty({ ...editingProperty, seasons });
                          }}
                          className="w-full bg-white border border-slate-200 rounded px-2 py-1 font-mono text-[11px]"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Net PPS ($ USD)</span>
                        <input
                          type="number"
                          value={season.ppsUsd}
                          onChange={(e) => {
                            const seasons = [...editingProperty.seasons];
                            seasons[sIdx].ppsUsd = Number(e.target.value);
                            setEditingProperty({ ...editingProperty, seasons });
                          }}
                          className="w-full bg-white border border-slate-200 rounded px-2 py-1 font-mono text-[11px] font-bold text-emerald-700"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Single Supp ($ USD)</span>
                        <input
                          type="number"
                          value={season.srsUsd}
                          onChange={(e) => {
                            const seasons = [...editingProperty.seasons];
                            seasons[sIdx].srsUsd = Number(e.target.value);
                            setEditingProperty({ ...editingProperty, seasons });
                          }}
                          className="w-full bg-white border border-slate-200 rounded px-2 py-1 font-mono text-[11px]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Local Currency Rate (KES/TZS)</span>
                        <input
                          type="number"
                          value={season.ppsLocalCurrency || ''}
                          onChange={(e) => {
                            const seasons = [...editingProperty.seasons];
                            seasons[sIdx].ppsLocalCurrency = e.target.value ? Number(e.target.value) : undefined;
                            setEditingProperty({ ...editingProperty, seasons });
                          }}
                          placeholder="e.g. 35000"
                          className="w-full bg-white border border-slate-200 rounded px-2 py-1 font-mono text-[11px]"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Child Rate Factor (0.5 = 50%)</span>
                        <input
                          type="number"
                          step="0.05"
                          value={season.childRateFactor}
                          onChange={(e) => {
                            const seasons = [...editingProperty.seasons];
                            seasons[sIdx].childRateFactor = Number(e.target.value);
                            setEditingProperty({ ...editingProperty, seasons });
                          }}
                          className="w-full bg-white border border-slate-200 rounded px-2 py-1 font-mono text-[11px]"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Min Nights</span>
                        <input
                          type="number"
                          value={season.minNights || 1}
                          onChange={(e) => {
                            const seasons = [...editingProperty.seasons];
                            seasons[sIdx].minNights = Number(e.target.value);
                            setEditingProperty({ ...editingProperty, seasons });
                          }}
                          className="w-full bg-white border border-slate-200 rounded px-2 py-1 font-mono text-[11px]"
                        />
                      </div>
                    </div>

                    <div>
                      <input
                        type="text"
                        value={season.notes || ''}
                        onChange={(e) => {
                          const seasons = [...editingProperty.seasons];
                          seasons[sIdx].notes = e.target.value;
                          setEditingProperty({ ...editingProperty, seasons });
                        }}
                        placeholder="Inclusions / Notes (e.g. FB cuisine, game drives, SUP boards)"
                        className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-[11px]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setEditingItemType(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEditedProperty}
                className="px-5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl shadow-xs"
              >
                Save Changes to Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT ACTIVITY */}
      {editingItemType === 'activity' && editingActivity && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Compass className="w-4 h-4 text-amber-600" />
                <span>Edit Activity Option</span>
              </h3>
              <button type="button" onClick={() => setEditingItemType(null)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Activity Name:</label>
                <input
                  type="text"
                  value={editingActivity.name}
                  onChange={(e) => setEditingActivity({ ...editingActivity, name: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Category:</label>
                  <select
                    value={editingActivity.category}
                    onChange={(e) => setEditingActivity({ ...editingActivity, category: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="Wildlife/Nature">Wildlife/Nature</option>
                    <option value="Aerial">Aerial</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Water">Water</option>
                    <option value="Dining">Dining</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Location:</label>
                  <input
                    type="text"
                    value={editingActivity.location}
                    onChange={(e) => setEditingActivity({ ...editingActivity, location: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Rate Per Pax ($):</label>
                  <input
                    type="number"
                    value={editingActivity.ratePerPaxUsd}
                    onChange={(e) => setEditingActivity({ ...editingActivity, ratePerPaxUsd: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-emerald-700"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Rate Per Vehicle/Charter ($):</label>
                  <input
                    type="number"
                    value={editingActivity.ratePerVehicleUsd || ''}
                    onChange={(e) => setEditingActivity({ ...editingActivity, ratePerVehicleUsd: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Description:</label>
                <textarea
                  value={editingActivity.description}
                  onChange={(e) => setEditingActivity({ ...editingActivity, description: e.target.value })}
                  rows={2}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setEditingItemType(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEditedActivity}
                className="px-5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT PARK FEE */}
      {editingItemType === 'parkFee' && editingParkFee && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <TreePine className="w-4 h-4 text-emerald-600" />
                <span>Edit Park & Conservancy Tariff</span>
              </h3>
              <button type="button" onClick={() => setEditingItemType(null)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Park Name:</label>
                <input
                  type="text"
                  value={editingParkFee.parkName}
                  onChange={(e) => setEditingParkFee({ ...editingParkFee, parkName: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Country:</label>
                  <select
                    value={editingParkFee.country}
                    onChange={(e) => setEditingParkFee({ ...editingParkFee, country: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="Kenya">Kenya</option>
                    <option value="Tanzania">Tanzania</option>
                    <option value="Rwanda">Rwanda</option>
                    <option value="Uganda">Uganda</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tariff Category:</label>
                  <select
                    value={editingParkFee.category}
                    onChange={(e) => setEditingParkFee({ ...editingParkFee, category: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                  >
                    <option value="Non-Resident Adult">Non-Resident Adult</option>
                    <option value="Non-Resident Child">Non-Resident Child</option>
                    <option value="Resident Adult">Resident Adult (EA)</option>
                    <option value="Resident Child">Resident Child (EA)</option>
                    <option value="Citizen Adult">Citizen Adult</option>
                    <option value="Vehicle">Vehicle Entry</option>
                    <option value="Crater Descent">Crater Descent</option>
                    <option value="Concession Fee">Concession Fee</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Area Type:</label>
                  <input
                    type="text"
                    value={editingParkFee.areaType}
                    onChange={(e) => setEditingParkFee({ ...editingParkFee, areaType: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Currency:</label>
                  <select
                    value={editingParkFee.currency || 'USD'}
                    onChange={(e) => setEditingParkFee({ ...editingParkFee, currency: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="KES">KES (Kenya Shillings)</option>
                    <option value="TZS">TZS (Tanzania Shillings)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">High Season ($):</label>
                  <input
                    type="number"
                    value={editingParkFee.highSeasonFeeUsd}
                    onChange={(e) => setEditingParkFee({ ...editingParkFee, highSeasonFeeUsd: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-emerald-700"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Low Season ($):</label>
                  <input
                    type="number"
                    value={editingParkFee.lowSeasonFeeUsd}
                    onChange={(e) => setEditingParkFee({ ...editingParkFee, lowSeasonFeeUsd: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Local Fee (KES/TZS):</label>
                  <input
                    type="number"
                    value={editingParkFee.feeLocalCurrency || ''}
                    onChange={(e) => setEditingParkFee({ ...editingParkFee, feeLocalCurrency: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="e.g. 1000"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Vehicle Fee ($):</label>
                  <input
                    type="number"
                    value={editingParkFee.vehicleFeeUsd || 0}
                    onChange={(e) => setEditingParkFee({ ...editingParkFee, vehicleFeeUsd: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Concession / Bednight ($):</label>
                  <input
                    type="number"
                    value={editingParkFee.concessionFeeUsd || ''}
                    onChange={(e) => setEditingParkFee({ ...editingParkFee, concessionFeeUsd: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setEditingItemType(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEditedParkFee}
                className="px-5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT TRANSPORT */}
      {editingItemType === 'transport' && editingTransport && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-600" />
                <span>Edit Safari Transport Option</span>
              </h3>
              <button type="button" onClick={() => setEditingItemType(null)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Vehicle/Transport Name:</label>
                <input
                  type="text"
                  value={editingTransport.name}
                  onChange={(e) => setEditingTransport({ ...editingTransport, name: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Transport Type:</label>
                  <select
                    value={editingTransport.vehicleType}
                    onChange={(e) => setEditingTransport({ ...editingTransport, vehicleType: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium"
                  >
                    <option value="4x4 Safari Land Cruiser">4x4 Safari Land Cruiser</option>
                    <option value="Safari Minivan">Safari Minivan</option>
                    <option value="Overland Truck">Overland Truck</option>
                    <option value="Transfers">Transfers</option>
                    <option value="Car rental">Car rental</option>
                    <option value="Air transport">Air transport</option>
                    <option value="Charter flight">Charter flight</option>
                    <option value="Train">Train</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Max Capacity:</label>
                  <input
                    type="number"
                    value={editingTransport.maxCapacity}
                    onChange={(e) => setEditingTransport({ ...editingTransport, maxCapacity: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">High Season Daily ($):</label>
                  <input
                    type="number"
                    value={editingTransport.dailyRateHighUsd}
                    onChange={(e) => setEditingTransport({ ...editingTransport, dailyRateHighUsd: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-emerald-700"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Low Season Daily ($):</label>
                  <input
                    type="number"
                    value={editingTransport.dailyRateLowUsd}
                    onChange={(e) => setEditingTransport({ ...editingTransport, dailyRateLowUsd: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Driver-Guide Allowance Daily ($):</label>
                <input
                  type="number"
                  value={editingTransport.driverAllowanceDailyUsd}
                  onChange={(e) => setEditingTransport({ ...editingTransport, driverAllowanceDailyUsd: Number(e.target.value) })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Includes:</label>
                <textarea
                  value={editingTransport.includes}
                  onChange={(e) => setEditingTransport({ ...editingTransport, includes: e.target.value })}
                  rows={2}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setEditingItemType(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEditedTransport}
                className="px-5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT FLIGHT */}
      {editingItemType === 'flight' && editingFlight && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Plane className="w-4 h-4 text-sky-600" />
                <span>Edit Flight Option</span>
              </h3>
              <button type="button" onClick={() => setEditingItemType(null)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Route:</label>
                <input
                  type="text"
                  value={editingFlight.route}
                  onChange={(e) => setEditingFlight({ ...editingFlight, route: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Airline:</label>
                  <input
                    type="text"
                    value={editingFlight.airline}
                    onChange={(e) => setEditingFlight({ ...editingFlight, airline: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">One-Way Rate ($):</label>
                  <input
                    type="number"
                    value={editingFlight.oneWayRateUsd}
                    onChange={(e) => setEditingFlight({ ...editingFlight, oneWayRateUsd: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-emerald-700"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setEditingItemType(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEditedFlight}
                className="px-5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT EXTRA */}
      {editingItemType === 'extra' && editingExtra && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-amber-600" />
                <span>Edit Operational Extra</span>
              </h3>
              <button type="button" onClick={() => setEditingItemType(null)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Name:</label>
                <input
                  type="text"
                  value={editingExtra.name}
                  onChange={(e) => setEditingExtra({ ...editingExtra, name: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Rate ($):</label>
                  <input
                    type="number"
                    value={editingExtra.rateUsd}
                    onChange={(e) => setEditingExtra({ ...editingExtra, rateUsd: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-emerald-700"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Unit:</label>
                  <select
                    value={editingExtra.unit}
                    onChange={(e) => setEditingExtra({ ...editingExtra, unit: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="Per Person">Per Person</option>
                    <option value="Per Person Per Day">Per Person Per Day</option>
                    <option value="Per Vehicle">Per Vehicle</option>
                    <option value="Per Group">Per Group</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setEditingItemType(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEditedExtra}
                className="px-5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
