import React, { useEffect, useState } from 'react';
import { CompanySettings } from '../types/costing';

interface TusafiriLogoProps {
  variant?: 'full' | 'horizontal' | 'icon' | 'badge' | 'stacked';
  theme?: 'dark' | 'light' | 'auto';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showSubtitle?: boolean;
}

/**
 * Authentic Tusafiri Africa Safaris Logo Component
 * Incorporates the artistic African Continent outline contour,
 * bold 'Tusafiri' typography, warm savannah sunrise gold 'Africa',
 * and dynamic charcoal calligraphy brush script 'Safaris'.
 */
export const TusafiriLogo: React.FC<TusafiriLogoProps> = ({
  variant = 'full',
  theme = 'auto',
  className = '',
  size = 'md',
  showSubtitle = false,
}) => {
  const [settings, setSettings] = useState<CompanySettings | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('tusafiri_settings_v2');
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch (e) {}
  }, []);

  // Check if we have a custom logo URL
  if (settings?.companyLogoUrl && variant !== 'icon') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <img 
          src={settings.companyLogoUrl} 
          alt={settings.companyName || "Company Logo"} 
          className="max-h-16 object-contain"
        />
      </div>
    );
  }

  // Fallback to text if there's a custom company name and no logo
  const isCustomName = settings?.companyName && settings.companyName !== 'Tusafiri Africa Safaris';

  // Size mappings
  const sizeConfig = {
    sm: { height: 32, iconSize: 28, textTusafiri: 'text-sm', textSafaris: 'text-xs', tracking: 'tracking-tight' },
    md: { height: 42, iconSize: 38, textTusafiri: 'text-base', textSafaris: 'text-sm', tracking: 'tracking-tight' },
    lg: { height: 56, iconSize: 52, textTusafiri: 'text-xl', textSafaris: 'text-base', tracking: 'tracking-tight' },
    xl: { height: 72, iconSize: 68, textTusafiri: 'text-2xl', textSafaris: 'text-xl', tracking: 'tracking-tight' },
    '2xl': { height: 96, iconSize: 90, textTusafiri: 'text-4xl', textSafaris: 'text-2xl', tracking: 'tracking-tight' },
  }[size];

  // Palette colors
  const strokeColor = theme === 'dark' ? '#E5D6C5' : '#331B10';
  const tusafiriTextColor = theme === 'dark' ? 'text-white' : 'text-[#331B10]';
  const africaTextColor = 'text-[#F5A623]';
  const safarisTextColor = theme === 'dark' ? 'text-[#D1D5DB]' : 'text-[#4A4A4A]';

  // African Continent Calligraphic Outline SVG Path
  const AfricaContourPath = (
    <svg
      viewBox="0 0 200 210"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform duration-300 group-hover:scale-105"
      style={{ width: sizeConfig.iconSize, height: sizeConfig.iconSize }}
    >
      {/* Dynamic Hand-Drawn African Continent Contour */}
      <path
        d="M 68,42 
           C 62,40 55,44 50,48
           C 44,53 39,60 36,68
           C 33,78 35,88 41,96
           C 47,104 53,109 57,118
           C 60,125 59,134 60,143
           C 61,154 65,166 73,174
           C 78,179 84,183 90,179
           C 95,175 97,167 101,161
           C 105,155 113,149 116,143"
        stroke={strokeColor}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 70,42
           C 80,41 90,38 98,42
           C 106,46 114,54 125,52
           C 133,50 141,47 151,52
           C 142,62 136,73 133,85
           C 131,94 135,103 144,108
           C 153,113 162,114 172,112
           C 160,119 146,119 135,115
           C 126,112 119,103 115,94"
        stroke={strokeColor}
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* East African Rift & Horn accent curve */}
      <path
        d="M 88,178
           C 84,182 78,181 74,175
           C 67,167 63,156 61,146
           C 59,136 60,126 56,117
           C 51,107 43,102 38,92
           C 34,83 34,71 39,63
           C 44,54 52,48 61,44
           C 73,38 87,45 99,44
           C 112,43 125,53 138,51
           C 145,50 152,48 156,53"
        stroke={strokeColor}
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.9"
      />
      {/* Warm Golden Savannah Dawn Dot (marking East Africa / Kenya & Tanzania Safari Cradle) */}
      <circle cx="132" cy="98" r="4.5" fill="#F5A623" />
      <circle cx="132" cy="98" r="8" stroke="#F5A623" strokeWidth="1.2" opacity="0.4" className="animate-pulse" />
    </svg>
  );

  // Icon only
  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        {AfricaContourPath}
      </div>
    );
  }

  // Full brand representation matching the uploaded official logo
  if (variant === 'full' || variant === 'horizontal') {
    return (
      <div className={`inline-flex items-center gap-3 select-none group ${className}`}>
        {/* Africa Continent Silhouette */}
        <div className="relative flex items-center justify-center shrink-0">
          {AfricaContourPath}
        </div>

        {/* Wordmark Lockup */}
        <div className="flex flex-col justify-center">
          <div className="flex items-baseline gap-1.5 leading-none">
            {isCustomName ? (
              <span
                className={`font-extrabold tracking-tight ${sizeConfig.textTusafiri} ${tusafiriTextColor} transition-colors whitespace-nowrap`}
                style={{ fontFamily: "'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif" }}
              >
                {settings.companyName}
              </span>
            ) : (
              <>
                <span
                  className={`font-extrabold tracking-tight ${sizeConfig.textTusafiri} ${tusafiriTextColor} transition-colors`}
                  style={{ fontFamily: "'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif" }}
                >
                  Tusafiri
                </span>
                <span
                  className={`font-bold tracking-tight ${sizeConfig.textTusafiri} ${africaTextColor}`}
                  style={{ fontFamily: "'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif" }}
                >
                  Africa
                </span>
              </>
            )}
          </div>

          {!isCustomName && (
            <div className="relative -mt-0.5 sm:-mt-1 flex items-center">
              <span
                className={`font-normal italic ${sizeConfig.textSafaris} ${safarisTextColor} tracking-wide`}
                style={{
                  fontFamily: "'Caveat', 'Nanum Pen Script', 'Brush Script MT', cursive",
                  fontSize: size === 'sm' ? '14px' : size === 'md' ? '18px' : size === 'lg' ? '24px' : '32px',
                  lineHeight: '1',
                }}
              >
                Safaris
              </span>
              {showSubtitle && (
                <span className="ml-2 text-[9px] uppercase tracking-widest text-amber-600/90 font-bold border-l border-amber-300/40 pl-2">
                  East Africa
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Stacked Layout (e.g. for Quote Document Cover, Invoices, Proposal Front Page)
  if (variant === 'stacked') {
    return (
      <div className={`flex flex-col items-center text-center select-none ${className}`}>
        <div className="relative mb-2">
          {AfricaContourPath}
        </div>
        <div className="flex items-baseline gap-1.5 leading-none">
          {isCustomName ? (
            <span
              className={`font-black tracking-tight ${sizeConfig.textTusafiri} ${tusafiriTextColor}`}
              style={{ fontFamily: "'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif" }}
            >
              {settings.companyName}
            </span>
          ) : (
            <>
              <span
                className={`font-black tracking-tight ${sizeConfig.textTusafiri} ${tusafiriTextColor}`}
                style={{ fontFamily: "'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif" }}
              >
                Tusafiri
              </span>
              <span
                className={`font-bold tracking-tight ${sizeConfig.textTusafiri} ${africaTextColor}`}
                style={{ fontFamily: "'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif" }}
              >
                Africa
              </span>
            </>
          )}
        </div>
        {!isCustomName && (
          <div className="-mt-1">
            <span
              className={`italic ${safarisTextColor}`}
              style={{
                fontFamily: "'Caveat', 'Nanum Pen Script', 'Brush Script MT', cursive",
                fontSize: size === 'sm' ? '16px' : size === 'md' ? '22px' : size === 'lg' ? '30px' : '40px',
              }}
            >
              Safaris
            </span>
          </div>
        )}
        {showSubtitle && (
          <p className="text-[10px] tracking-widest uppercase font-semibold text-amber-700 mt-1">
            Bespoke East African Expeditions
          </p>
        )}
      </div>
    );
  }

  // Badge layout (pill container)
  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
        theme === 'dark'
          ? 'bg-slate-900/90 border-slate-800 text-slate-200'
          : 'bg-[#FAF7F2] border-[#E8DFC8] text-[#331B10]'
      } shadow-xs ${className}`}
    >
      <div className="w-5 h-5 flex items-center justify-center">
        {AfricaContourPath}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="font-bold text-xs">Tusafiri</span>
        <span className="font-bold text-xs text-[#F5A623]">Africa</span>
        <span
          className="italic text-xs text-slate-500 font-serif"
          style={{ fontFamily: "'Caveat', cursive" }}
        >
          Safaris
        </span>
      </div>
    </div>
  );
};
