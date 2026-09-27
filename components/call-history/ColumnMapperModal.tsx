import React, { useState } from 'react';
import { X, Check, Sliders, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { ColumnMapping } from '@/lib/call-history/types';

interface ColumnMapperModalProps {
  isOpen: boolean;
  onClose: () => void;
  headers: string[];
  initialMapping: ColumnMapping;
  sampleRows: any[];
  onApplyMapping: (mapping: ColumnMapping) => void;
}

export function ColumnMapperModal({
  isOpen,
  onClose,
  headers,
  initialMapping,
  sampleRows,
  onApplyMapping,
}: ColumnMapperModalProps) {
  const [mapping, setMapping] = useState<ColumnMapping>({ ...initialMapping });
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!mapping.phoneNumber) {
      setError('Please select a column for "Phone Number". It is required to identify callers.');
      return;
    }
    if (!mapping.date && !mapping.dateTime) {
      setError('Please select a column for "Date" or "Date & Time" to arrange call timelines.');
      return;
    }
    setError(null);
    onApplyMapping(mapping);
    onClose();
  };

  const fields = [
    {
      key: 'phoneNumber' as const,
      label: 'Phone Number',
      required: true,
      description: 'The dialed or receiving phone number',
    },
    {
      key: 'contactName' as const,
      label: 'Contact Name',
      required: false,
      description: 'The name of the contact/person (if available)',
    },
    {
      key: 'date' as const,
      label: 'Date (or Date & Time)',
      required: true,
      description: 'Call date or combined timestamp',
    },
    {
      key: 'time' as const,
      label: 'Time of Call',
      required: false,
      description: 'Time string (optional if Date includes time)',
    },
    {
      key: 'type' as const,
      label: 'Call Type / Direction',
      required: false,
      description: 'Incoming, Outgoing, Missed, Rejected, etc.',
    },
    {
      key: 'duration' as const,
      label: 'Call Duration',
      required: false,
      description: 'Duration in seconds, MM:SS, or text',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#5722AF]/10 text-[#5722AF] dark:text-[#B68BFF] flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                Column Mapping
              </h3>
              <p className="text-[11px] text-zinc-500">
                Map your file headers to standard call attributes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {fields.map((f) => (
              <div
                key={f.key}
                className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/80 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <label className="font-bold text-zinc-800 dark:text-zinc-200 text-xs">
                    {f.label}{' '}
                    {f.required ? (
                      <span className="text-rose-500">*</span>
                    ) : (
                      <span className="text-zinc-400 font-normal">(optional)</span>
                    )}
                  </label>
                </div>
                <select
                  value={mapping[f.key] || ''}
                  onChange={(e) => {
                    setMapping((prev) => ({ ...prev, [f.key]: e.target.value }));
                    setError(null);
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#5722AF]"
                >
                  <option value="">-- None / Skip --</option>
                  {headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                  {f.description}
                </p>
              </div>
            ))}
          </div>

          {/* Sample Row Preview */}
          {sampleRows.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-zinc-700/60 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-zinc-700 dark:text-zinc-300 text-[11px]">
                <FileSpreadsheet className="w-3.5 h-3.5 text-[#5722AF]" />
                <span>Sample Record Preview (First Row)</span>
              </div>
              <div className="font-mono text-[10px] text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-900 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-x-auto">
                <pre>{JSON.stringify(sampleRows[0], null, 2)}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end gap-2 bg-zinc-50/50 dark:bg-zinc-900/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#5722AF] hover:bg-[#682BC9] transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply Mapping</span>
          </button>
        </div>
      </div>
    </div>
  );
}
