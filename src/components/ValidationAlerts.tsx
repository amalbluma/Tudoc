import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, ShieldCheck } from 'lucide-react';
import { ValidationItem } from '../types/costing';

interface ValidationAlertsProps {
  validations: ValidationItem[];
  markupPercent: number;
}

export const ValidationAlerts: React.FC<ValidationAlertsProps> = ({
  validations,
  markupPercent
}) => {
  return (
    <div id="validation-alerts-bar" className="space-y-2 mb-6">
      {/* Primary Verification Badge */}
      <div className="bg-emerald-50 border border-emerald-200/80 px-4 py-2.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-emerald-950 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>
            <strong>Audit Status: Active & Formula-Linked</strong> • All accommodations priced via verified STO contracts • Operator Markup: <strong>{markupPercent}%</strong>
          </span>
        </div>
        <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-100/80 px-2.5 py-0.5 rounded-full self-start sm:self-auto">
          100% Auditable
        </span>
      </div>

      {/* Dynamic Validation Warnings */}
      {validations.map((item) => {
        let bg = 'bg-amber-50 border-amber-200 text-amber-900';
        let Icon = AlertTriangle;
        let iconColor = 'text-amber-600';

        if (item.severity === 'error') {
          bg = 'bg-rose-50 border-rose-200 text-rose-900';
          Icon = AlertCircle;
          iconColor = 'text-rose-600';
        } else if (item.severity === 'info') {
          bg = 'bg-sky-50 border-sky-200 text-sky-900';
          Icon = Info;
          iconColor = 'text-sky-600';
        }

        return (
          <div
            key={item.id}
            className={`border px-4 py-2.5 rounded-xl flex items-center justify-between gap-3 text-xs ${bg}`}
          >
            <div className="flex items-center gap-2">
              <Icon className={`w-4 h-4 flex-shrink-0 ${iconColor}`} />
              <span>
                <strong>{item.title}:</strong> {item.message}
              </span>
            </div>
            {item.dayNumber && (
              <span className="text-[10px] font-bold bg-white/70 px-2 py-0.5 rounded border border-current">
                Day {item.dayNumber}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};
