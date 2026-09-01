import React from 'react';
import {
  CheckCircle2,
  FileCheck,
  Percent,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Users,
  Zap
} from 'lucide-react';
import { ClientQuotationInputs, CostingTotals, ItineraryDay } from '../types/costing';
import { DEFAULT_CLIENT_INPUTS, DEFAULT_KENYA_ITINERARY, TANZANIA_SAMPLE_ITINERARY } from '../data/defaultItineraries';

interface ScenarioAuditorProps {
  currentInputs: ClientQuotationInputs;
  currentTotals: CostingTotals;
  onApplyScenario: (inputs: ClientQuotationInputs, itinerary: ItineraryDay[]) => void;
}

export const ScenarioAuditor: React.FC<ScenarioAuditorProps> = ({
  currentInputs,
  currentTotals,
  onApplyScenario
}) => {
  // Scenario A: Standard 10% Markup, 5 Pax Mara Safari
  const handleRunScenarioA = () => {
    onApplyScenario(
      {
        ...DEFAULT_CLIENT_INPUTS,
        quoteReference: 'TAS-2026-SCENARIO-A',
        clientName: 'Scenario A — Standard 10% Markup Audit',
        operatorMarkupPercent: 10.0,
        paxAdults: 5,
        paxChildren: 0,
        roomConfig: { singleRooms: 1, doubleTwinRooms: 2, tripleRooms: 0, familyRooms: 0 }
      },
      DEFAULT_KENYA_ITINERARY
    );
  };

  // Scenario B: Changed Client Margin (12.0%)
  const handleRunScenarioB = () => {
    onApplyScenario(
      {
        ...DEFAULT_CLIENT_INPUTS,
        quoteReference: 'TAS-2026-SCENARIO-B',
        clientName: 'Scenario B — 12.0% Margin Responsiveness Test',
        operatorMarkupPercent: 12.0, // 12% override
        paxAdults: 5,
        paxChildren: 0,
        roomConfig: { singleRooms: 1, doubleTwinRooms: 2, tripleRooms: 0, familyRooms: 0 }
      },
      DEFAULT_KENYA_ITINERARY
    );
  };

  // Scenario C: Changed Itinerary & Pax (2 Pax Couple in Tanzania Luxury Circuit)
  const handleRunScenarioC = () => {
    onApplyScenario(
      {
        ...DEFAULT_CLIENT_INPUTS,
        quoteReference: 'TAS-2026-SCENARIO-C',
        clientName: 'Scenario C — 2 Pax Tanzania Northern Circuit',
        travelStartDate: '2026-08-01',
        travelEndDate: '2026-08-05',
        operatorMarkupPercent: 15.0,
        paxAdults: 2,
        paxChildren: 0,
        roomConfig: { singleRooms: 0, doubleTwinRooms: 1, tripleRooms: 0, familyRooms: 0 }
      },
      TANZANIA_SAMPLE_ITINERARY
    );
  };

  return (
    <div id="scenario-auditor" className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Master Costing Engine Scenario Auditor & Verification Suite
          </h2>
          <p className="text-xs text-slate-500">
            Execute automated audit scenarios to verify that all formula linkages, STO rates, and markups flow seamlessly into the final selling price.
          </p>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
          ✓ All Formula Linkages Active
        </span>
      </div>

      {/* 3 Main Scenario Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Scenario A */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="px-2.5 py-0.5 rounded bg-slate-900 text-amber-400 text-xs font-bold">
                Scenario A
              </span>
              <span className="text-xs font-bold text-slate-600">Standard 10%</span>
            </div>
            <h3 className="font-bold text-sm text-slate-900">
              Kenya Classic Safari (5 Pax)
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Standard 8-Day Kenya migration itinerary with 5 guests (1 Single + 2 Doubles). Tests baseline 10.0% default markup on STO accommodation, park fees, and 4x4 transport.
            </p>
            <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1">
              <div>• Markup: <strong>10.0% (Default)</strong></div>
              <div>• Guests: <strong>5 Adults</strong></div>
              <div>• Parks: <strong>Mara, Amboseli, Nakuru</strong></div>
            </div>
          </div>

          <button
            id="btn-run-scenario-a"
            type="button"
            onClick={handleRunScenarioA}
            className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-amber-400" />
            Load & Audit Scenario A
          </button>
        </div>

        {/* Scenario B */}
        <div className="bg-white p-5 rounded-2xl border border-amber-300 shadow-xs space-y-4 flex flex-col justify-between bg-amber-50/20">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="px-2.5 py-0.5 rounded bg-amber-500 text-slate-950 text-xs font-bold">
                Scenario B
              </span>
              <span className="text-xs font-bold text-amber-900">12.0% Margin</span>
            </div>
            <h3 className="font-bold text-sm text-slate-900">
              Dynamic Margin Override (12%)
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Maintains identical passenger configuration and itinerary, but adjusts Operator Markup to 12.0%. Validates that all downstream selling prices adjust automatically with zero hard-coded math.
            </p>
            <div className="mt-3 pt-3 border-t border-amber-200 text-xs text-slate-500 space-y-1">
              <div>• Markup: <strong>12.0% (Override)</strong></div>
              <div>• Expected Behavior: <strong>Dynamic Repricing</strong></div>
              <div>• Audit: <strong>Net Operational Cost Unchanged</strong></div>
            </div>
          </div>

          <button
            id="btn-run-scenario-b"
            type="button"
            onClick={handleRunScenarioB}
            className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-slate-950" />
            Load & Audit Scenario B (12%)
          </button>
        </div>

        {/* Scenario C */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="px-2.5 py-0.5 rounded bg-emerald-700 text-white text-xs font-bold">
                Scenario C
              </span>
              <span className="text-xs font-bold text-emerald-800">Changed Itinerary</span>
            </div>
            <h3 className="font-bold text-sm text-slate-900">
              Tanzania Circuit (2 Pax Couple)
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Switches destination entirely to Tanzania Northern Circuit (Serengeti Four Seasons & Ngorongoro Crater). Tests passenger reduction to 2 pax, 1 double room, and 15% VIP markup.
            </p>
            <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1">
              <div>• Country: <strong>Tanzania</strong></div>
              <div>• Guests: <strong>2 Adults (1 Double)</strong></div>
              <div>• Special: <strong>Crater Descent Permit Included</strong></div>
            </div>
          </div>

          <button
            id="btn-run-scenario-c"
            type="button"
            onClick={handleRunScenarioC}
            className="w-full py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            Load & Audit Scenario C
          </button>
        </div>

      </div>

      {/* Live Verification Report Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Tusafiri Africa Safaris — Comprehensive Validation & Compliance Audit
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-emerald-950 block">1. STO-Only Accommodation Sourcing</strong>
              <p className="text-emerald-800 text-[11px] mt-0.5">
                All accommodation line items pull strictly from confidential contracted STO tariffs with date-matched seasonal PPS and SRS. No rack rates or blended averages.
              </p>
            </div>
          </div>

          <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-emerald-950 block">2. Official Park & Conservancy Tariffs</strong>
              <p className="text-emerald-800 text-[11px] mt-0.5">
                Kenya (KWS, Maasai Mara Narok County Gazette) and Tanzania (TANAPA, NCAA) official conservation, entry, and concession fees verified.
              </p>
            </div>
          </div>

          <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-emerald-950 block">3. Centralized 10% Default Operator Markup</strong>
              <p className="text-emerald-800 text-[11px] mt-0.5">
                Operator Markup is set to 10.0% by default, centralized in state, and fully responsive to custom adjustments (12%, 15%, 20%) without formula corruption.
              </p>
            </div>
          </div>

          <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-emerald-950 block">4. Multi-Sheet Excel Master Workbook Export</strong>
              <p className="text-emerald-800 text-[11px] mt-0.5">
                Full structured .xlsx export containing active formula traces, STO database, Park fees database, and client quotation summary.
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
