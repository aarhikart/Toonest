'use client';

import React, { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { PrivacyNotice } from '@/components/call-history/PrivacyNotice';
import { StatisticsCards } from '@/components/call-history/StatisticsCards';
import { ImportPanel } from '@/components/call-history/ImportPanel';
import { ColumnMapperModal } from '@/components/call-history/ColumnMapperModal';
import { SearchNumberModal } from '@/components/call-history/SearchNumberModal';
import { CallTable } from '@/components/call-history/CallTable';
import { CallDetailsModal } from '@/components/call-history/CallDetailsModal';
import { CallCharts } from '@/components/call-history/CallCharts';
import { MostContactedList } from '@/components/call-history/MostContactedList';
import { ExportPanel } from '@/components/call-history/ExportPanel';
import { DuplicatesBanner } from '@/components/call-history/DuplicatesBanner';
import { ClearDataModal } from '@/components/call-history/ClearDataModal';
import { DateFilter } from '@/components/call-history/DateFilter';
import {
  CallRecord,
  CallStatistics,
  ContactSummary,
  DateFilterOption,
  ColumnMapping,
  ParsedFileResult,
} from '@/lib/call-history/types';
import {
  calculateCallStatistics,
  groupCallsByNumber,
  detectDuplicates,
  removeDuplicates,
} from '@/lib/call-history/statistics';
import { filterCallsByDate } from '@/lib/call-history/filters';
import { applyColumnMapping } from '@/lib/call-history/parser';
import { generateSampleCallHistory } from '@/lib/call-history/sampleData';
import {
  Phone,
  Search,
  Trash2,
  Sparkles,
  BarChart3,
  Users,
  Clock,
  Calendar,
  Layers,
  FileCheck,
  ShieldCheck,
  Download,
  Sliders,
  ChevronRight,
  RefreshCw,
  PlusCircle,
} from 'lucide-react';

export default function CallHistoryPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [records, setRecords] = useState<CallRecord[]>([]);
  const [sourceName, setSourceName] = useState<string | null>(null);

  // Active view tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'contacts' | 'analytics' | 'import'>('dashboard');

  // Date filtering state
  const [dateFilter, setDateFilter] = useState<DateFilterOption>('all');
  const [customRange, setCustomRange] = useState<{ start?: string; end?: string }>({});

  // Modals state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isClearOpen, setIsClearOpen] = useState(false);
  const [columnMapperData, setColumnMapperData] = useState<ParsedFileResult | null>(null);
  const [selectedContact, setSelectedContact] = useState<ContactSummary | null>(null);

  // Filtered records by date preset/range
  const dateFilteredRecords = useMemo(() => {
    return filterCallsByDate(records, dateFilter, customRange);
  }, [records, dateFilter, customRange]);

  // Calculated statistics
  const statistics = useMemo(() => {
    return calculateCallStatistics(dateFilteredRecords);
  }, [dateFilteredRecords]);

  // Overall statistics for all loaded records
  const overallStatistics = useMemo(() => {
    return calculateCallStatistics(records);
  }, [records]);

  // Grouped contacts/numbers
  const contactSummaries = useMemo(() => {
    return groupCallsByNumber(dateFilteredRecords);
  }, [dateFilteredRecords]);

  const allContactSummaries = useMemo(() => {
    return groupCallsByNumber(records);
  }, [records]);

  // Duplicates detection
  const duplicateInfo = useMemo(() => {
    return detectDuplicates(records);
  }, [records]);

  // Handle records imported from file or paste
  const handleRecordsLoaded = (newRecords: CallRecord[], source: string) => {
    setRecords(newRecords);
    setSourceName(source);
    setActiveTab('dashboard');
    setDateFilter('all');
  };

  // Handle manual column mapping completion
  const handleApplyColumnMapping = (mapping: ColumnMapping) => {
    if (!columnMapperData) return;
    try {
      const standardRecords = applyColumnMapping(columnMapperData.rows, mapping);
      if (standardRecords.length === 0) {
        alert('Could not convert rows with the selected column mapping.');
        return;
      }
      handleRecordsLoaded(standardRecords, columnMapperData.fileName);
      setColumnMapperData(null);
    } catch (e: any) {
      alert(`Error applying column mapping: ${e?.message || 'Unknown error'}`);
    }
  };

  // Handle removing duplicates
  const handleRemoveDuplicates = () => {
    const cleaned = removeDuplicates(records);
    setRecords(cleaned);
  };

  // Handle clearing all loaded data
  const handleConfirmClear = () => {
    setRecords([]);
    setSourceName(null);
    setActiveTab('dashboard');
    setDateFilter('all');
  };

  // Handle row click from table to show contact modal
  const handleSelectCallRecord = (call: CallRecord) => {
    const foundContact = allContactSummaries.find(
      (c) => c.normalizedNumber === call.normalizedNumber
    );
    if (foundContact) {
      setSelectedContact(foundContact);
    } else {
      // Fallback synthetic contact summary for this single call
      setSelectedContact({
        phoneNumber: call.phoneNumber,
        normalizedNumber: call.normalizedNumber,
        contactName: call.contactName,
        totalCalls: 1,
        incoming: call.type === 'Incoming' ? 1 : 0,
        outgoing: call.type === 'Outgoing' ? 1 : 0,
        missed: call.type === 'Missed' ? 1 : 0,
        rejected: call.type === 'Rejected' || call.type === 'Declined' ? 1 : 0,
        totalDurationSeconds: call.durationSeconds,
        totalDurationFormatted: call.durationFormatted,
        averageDurationSeconds: call.durationSeconds,
        averageDurationFormatted: call.durationFormatted,
        firstCallTimestamp: call.timestamp,
        firstCallFormatted: call.date,
        lastCallTimestamp: call.timestamp,
        lastCallFormatted: call.date,
        calls: [call],
      });
    }
  };

  const getFilterLabel = () => {
    switch (dateFilter) {
      case 'today': return 'Today';
      case 'yesterday': return 'Yesterday';
      case 'last7': return 'Last 7 Days';
      case 'last30': return 'Last 30 Days';
      case 'thisMonth': return 'This Month';
      case 'lastMonth': return 'Last Month';
      case 'custom': return `Custom Range (${customRange.start || 'Start'} to ${customRange.end || 'End'})`;
      default: return 'All Loaded Records';
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0a0d14] text-zinc-900 dark:text-zinc-100 flex flex-col transition-colors">
      <Header
        activeToolName="Call History Analyzer"
        onOpenHelp={() => {}}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
      />

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenHelp={() => {}}
        activeToolId="call-history"
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-7">
        {/* Page Hero Title & Subtitle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#5722AF]" />
              <span className="text-xs font-bold text-[#5722AF] dark:text-[#B68BFF] uppercase tracking-wider">
                Authorized Telecom Utility
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
              Call History Analyzer
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
              View, search, filter and analyze your authorized call records.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            {records.length > 0 && (
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="px-4 py-2.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-[#5722AF] text-zinc-700 dark:text-zinc-300 text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <Search className="w-4 h-4 text-[#5722AF]" />
                <span>Search Number</span>
              </button>
            )}

            {records.length > 0 && (
              <button
                type="button"
                onClick={() => setIsClearOpen(true)}
                className="px-3 py-2.5 rounded-2xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/40 transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Clear current in-memory records"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear Data</span>
              </button>
            )}
          </div>
        </div>

        {/* Privacy Notice Banner */}
        <PrivacyNotice />

        {/* Workspace State: When NO records are loaded */}
        {records.length === 0 ? (
          <div className="space-y-6">
            <ImportPanel
              onRecordsLoaded={handleRecordsLoaded}
              onRequestColumnMapping={(data) => setColumnMapperData(data)}
            />
          </div>
        ) : (
          /* Workspace State: When records ARE loaded */
          <div className="space-y-6">
            {/* Telemetry Bar */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#5722AF]/10 text-[#5722AF] dark:text-[#B68BFF] flex items-center justify-center shrink-0">
                  <FileCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-xs sm:max-w-md">
                      {sourceName || 'Call Records'}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 dark:bg-purple-950/60 text-[#5722AF] dark:text-purple-300 border border-[#5722AF]/20">
                      {records.length.toLocaleString()} Calls Loaded
                    </span>
                  </div>
                  <div className="text-xs text-zinc-500 flex items-center gap-3 mt-1">
                    <span>{overallStatistics.uniqueNumbersCount} Numbers</span>
                    <span>&bull;</span>
                    <span>{overallStatistics.totalDurationFormatted} Talk Time</span>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex flex-wrap items-center gap-1 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/60 self-stretch md:self-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'dashboard'
                      ? 'bg-white dark:bg-zinc-700 text-[#5722AF] dark:text-[#B68BFF] shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('history')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'history'
                      ? 'bg-white dark:bg-zinc-700 text-[#5722AF] dark:text-[#B68BFF] shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  Call Records ({dateFilteredRecords.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('contacts')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'contacts'
                      ? 'bg-white dark:bg-zinc-700 text-[#5722AF] dark:text-[#B68BFF] shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  Contacts ({contactSummaries.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('analytics')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'analytics'
                      ? 'bg-white dark:bg-zinc-700 text-[#5722AF] dark:text-[#B68BFF] shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  Analytics & Charts
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('import')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'import'
                      ? 'bg-white dark:bg-zinc-700 text-[#5722AF] dark:text-[#B68BFF] shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  + Add / Re-import
                </button>
              </div>
            </div>

            {/* Duplicates Notice */}
            <DuplicatesBanner
              duplicateCount={duplicateInfo.duplicateCount}
              duplicates={duplicateInfo.duplicates}
              onRemoveDuplicates={handleRemoveDuplicates}
            />

            {/* Date Filtering Bar */}
            {activeTab !== 'import' && (
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <DateFilter
                  selectedOption={dateFilter}
                  onChangeOption={(opt) => setDateFilter(opt)}
                  customRange={customRange}
                  onChangeCustomRange={(range) => setCustomRange(range)}
                />

                <span className="text-[11px] font-semibold text-zinc-400 self-end sm:self-auto">
                  Scope: {getFilterLabel()} ({dateFilteredRecords.length} calls)
                </span>
              </div>
            )}

            {/* TAB 1: DASHBOARD */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Metric Summary Cards */}
                <StatisticsCards stats={statistics} />

                {/* Charts Grid */}
                <CallCharts records={dateFilteredRecords} />

                {/* Split section: Most Contacted + Recent Records */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  <div className="lg:col-span-1">
                    <MostContactedList
                      contacts={contactSummaries}
                      onSelectContact={(c) => setSelectedContact(c)}
                      maxDisplay={6}
                    />
                  </div>

                  <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                      <div>
                        <h3 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                          Recent Call Logs
                        </h3>
                        <p className="text-[11px] text-zinc-500">
                          Latest calls in chronological order
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab('history')}
                        className="text-xs font-bold text-[#5722AF] dark:text-[#B68BFF] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>View All Records</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <CallTable
                      records={dateFilteredRecords.slice(0, 10)}
                      onSelectCall={handleSelectCallRecord}
                    />
                  </div>
                </div>

                {/* Export & Report Panel */}
                <ExportPanel
                  filteredRecords={dateFilteredRecords}
                  allRecords={records}
                  stats={statistics}
                  topContacts={contactSummaries}
                  filterLabel={getFilterLabel()}
                />
              </div>
            )}

            {/* TAB 2: CALL RECORDS TABLE */}
            {activeTab === 'history' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                    <div>
                      <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                        Complete Call Records ({dateFilteredRecords.length})
                      </h3>
                      <p className="text-xs text-zinc-500">
                        Search, filter, sort and inspect individual call records
                      </p>
                    </div>
                  </div>

                  <CallTable
                    records={dateFilteredRecords}
                    onSelectCall={handleSelectCallRecord}
                  />
                </div>
              </div>
            )}

            {/* TAB 3: CONTACTS & NUMBERS */}
            {activeTab === 'contacts' && (
              <div className="space-y-6">
                <MostContactedList
                  contacts={contactSummaries}
                  onSelectContact={(c) => setSelectedContact(c)}
                  maxDisplay={50}
                />
              </div>
            )}

            {/* TAB 4: ANALYTICS & CHARTS */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <CallCharts records={dateFilteredRecords} />
                <StatisticsCards stats={statistics} />
                <ExportPanel
                  filteredRecords={dateFilteredRecords}
                  allRecords={records}
                  stats={statistics}
                  topContacts={contactSummaries}
                  filterLabel={getFilterLabel()}
                />
              </div>
            )}

            {/* TAB 5: IMPORT / ADD DATA */}
            {activeTab === 'import' && (
              <div className="space-y-6">
                <ImportPanel
                  onRecordsLoaded={handleRecordsLoaded}
                  onRequestColumnMapping={(data) => setColumnMapperData(data)}
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Interactive Modals */}

      {/* 1. Phone Number Search Modal */}
      <SearchNumberModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        records={records}
        onSelectContact={(c) => {
          setSelectedContact(c);
          setIsSearchOpen(false);
        }}
      />

      {/* 2. Call Details & Timeline Modal */}
      <CallDetailsModal
        contact={selectedContact}
        onClose={() => setSelectedContact(null)}
      />

      {/* 3. Column Mapper Modal (if auto-detection fails or manual map requested) */}
      {columnMapperData && (
        <ColumnMapperModal
          isOpen={Boolean(columnMapperData)}
          onClose={() => setColumnMapperData(null)}
          headers={columnMapperData.headers}
          initialMapping={columnMapperData.autoMapping}
          sampleRows={columnMapperData.rows}
          onApplyMapping={handleApplyColumnMapping}
        />
      )}

      {/* 4. Clear Data Confirmation Modal */}
      <ClearDataModal
        isOpen={isClearOpen}
        onClose={() => setIsClearOpen(false)}
        onConfirmClear={handleConfirmClear}
        recordCount={records.length}
      />

      <Footer />
    </div>
  );
}
