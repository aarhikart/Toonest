import React, { useState } from 'react';
import { Calendar, ChevronDown, CalendarRange } from 'lucide-react';
import { DateFilterOption } from '@/lib/call-history/types';

interface DateFilterProps {
  selectedOption: DateFilterOption;
  onChangeOption: (option: DateFilterOption) => void;
  customRange?: { start?: string; end?: string };
  onChangeCustomRange?: (range: { start?: string; end?: string }) => void;
}

export function DateFilter({
  selectedOption,
  onChangeOption,
  customRange,
  onChangeCustomRange,
}: DateFilterProps) {
  const [showCustomModal, setShowCustomModal] = useState(false);

  const presets: { id: DateFilterOption; label: string }[] = [
    { id: 'all', label: 'All Records' },
    { id: 'today', label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: 'last7', label: 'Last 7 Days' },
    { id: 'last30', label: 'Last 30 Days' },
    { id: 'thisMonth', label: 'This Month' },
    { id: 'lastMonth', label: 'Last Month' },
    { id: 'custom', label: 'Custom Range' },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/60 w-fit">
        {presets.map((p) => {
          const isActive = selectedOption === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                onChangeOption(p.id);
                if (p.id === 'custom') {
                  setShowCustomModal(true);
                }
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-white dark:bg-zinc-700 text-[#5722AF] dark:text-[#B68BFF] shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Custom Date Pickers */}
      {selectedOption === 'custom' && (
        <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs flex flex-wrap items-center gap-3 text-xs animate-in fade-in duration-100">
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 font-medium">From:</span>
            <input
              type="date"
              value={customRange?.start || ''}
              onChange={(e) =>
                onChangeCustomRange?.({ ...customRange, start: e.target.value })
              }
              className="px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#5722AF]"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-zinc-500 font-medium">To:</span>
            <input
              type="date"
              value={customRange?.end || ''}
              onChange={(e) =>
                onChangeCustomRange?.({ ...customRange, end: e.target.value })
              }
              className="px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#5722AF]"
            />
          </div>
        </div>
      )}
    </div>
  );
}
