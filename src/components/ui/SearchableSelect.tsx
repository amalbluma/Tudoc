import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

interface Option {
  value: string;
  label: string;
  subLabel?: string;
}

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = '-- Select --',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    opt.subLabel?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative w-full text-sm" ref={wrapperRef}>
      <div
        className={`flex items-center justify-between bg-white border border-slate-300 rounded-xl p-2.5 cursor-pointer hover:border-slate-400 focus-within:ring-2 focus-within:ring-amber-500 focus-within:border-amber-500 transition-colors ${className}`}
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setSearchQuery('');
        }}
      >
        <div className="truncate pr-2 font-medium text-slate-700">
          {selectedOption ? selectedOption.label : <span className="text-slate-400">{placeholder}</span>}
        </div>
        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 flex flex-col overflow-hidden animate-fadeIn">
          <div className="p-2 border-b border-slate-100 sticky top-0 bg-white">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                className="w-full pl-8 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 text-xs"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
              {searchQuery && (
                <button 
                  onClick={(e) => { e.stopPropagation(); setSearchQuery(''); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          
          <div className="overflow-y-auto overflow-x-hidden flex-1 p-1">
            <div
              className={`px-3 py-2 text-sm cursor-pointer rounded-lg hover:bg-slate-50 text-slate-500 italic ${
                value === '' ? 'bg-amber-50 text-amber-900 font-bold' : ''
              }`}
              onClick={() => {
                onChange('');
                setIsOpen(false);
              }}
            >
              {placeholder}
            </div>
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-500">No results found</div>
            ) : (
              filteredOptions.map((opt) => (
                <div
                  key={opt.value}
                  className={`px-3 py-2 cursor-pointer rounded-lg hover:bg-slate-50 transition-colors ${
                    value === opt.value ? 'bg-amber-50 text-amber-900 font-bold' : 'text-slate-700 font-medium'
                  }`}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                >
                  <div className="truncate">{opt.label}</div>
                  {opt.subLabel && <div className="text-[10px] text-slate-500 truncate font-normal mt-0.5">{opt.subLabel}</div>}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
