'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Footer } from '@/components/Footer';
import { WhatsAppWebConnect } from '@/components/whatsapp-web/WhatsAppWebConnect';
import { WhatsAppSessionManager } from '@/lib/whatsapp-web/session';
import { WhatsAppWebSession, WebContact } from '@/lib/whatsapp-web/types';
import {
  analyzePhoneNumber,
  COMMON_COUNTRY_CODES,
  PhoneValidationDetails
} from '@/lib/whatsapp-web/number-validator';
import {
  Phone,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Upload,
  Download,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Users,
  ShieldCheck,
  Sparkles,
  Filter,
  FileText,
  Sliders,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Send,
  Trash2,
  HelpCircle,
  Wifi,
  WifiOff,
  Info,
  Radio,
  FileSpreadsheet,
  CheckCheck,
  Clock
} from 'lucide-react';

interface NumberCheckResult {
  id: string;
  rawInput: string;
  normalizedPhone: string;
  status: 'ACTIVE' | 'NOT_ACTIVE' | 'NEEDS_CHECK' | 'INVALID';
  countryCode: string;
  source: 'live_server' | 'carrier_validator' | 'format_validator';
  details?: string;
  checkedAt: string;
}

export default function WhatsAppNumberCheckerPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Connection & Auth State
  const [session, setSession] = useState<WhatsAppWebSession>({
    connected: false,
    method: 'QR'
  });
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [isCheckingWorkerStatus, setIsCheckingWorkerStatus] = useState(true);

  // Active Tool Mode: 'single' | 'bulk'
  const [activeMode, setActiveMode] = useState<'single' | 'bulk'>('single');

  // Single Check State
  const [singlePhone, setSinglePhone] = useState('');
  const [singleCountryCode, setSingleCountryCode] = useState('91');
  const [isSingleChecking, setIsSingleChecking] = useState(false);
  const [singleResult, setSingleResult] = useState<NumberCheckResult | null>(null);

  // Bulk Check State
  const [bulkInputText, setBulkInputText] = useState('');
  const [bulkDefaultCountry, setBulkDefaultCountry] = useState('91');
  const [isBulkChecking, setIsBulkChecking] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<{ current: number; total: number; percent: number }>({
    current: 0,
    total: 0,
    percent: 0
  });
  const [shouldStopBulk, setShouldStopBulk] = useState(false);
  const stopRequestedRef = useRef(false);

  // Results State
  const [results, setResults] = useState<NumberCheckResult[]>([]);
  const [resultFilter, setResultFilter] = useState<'ALL' | 'ACTIVE' | 'NOT_ACTIVE' | 'NEEDS_CHECK' | 'INVALID'>('ALL');
  const [resultSearchQuery, setResultSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null);

  // File Upload Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check auth and worker status
  useEffect(() => {
    const init = async () => {
      try {
        const authRes = await fetch('/api/auth/me');
        const authData = await authRes.json();
        if (authData.success && authData.user) {
          setCurrentUser(authData.user);
          const username = authData.user.username.toLowerCase();
          WhatsAppSessionManager.setUserId(username);
          const savedSession = WhatsAppSessionManager.getSession(username);
          setSession(savedSession);
        }
      } catch (_) {}

      try {
        const statusRes = await fetch('/api/whatsapp-service/status');
        if (statusRes.ok) {
          const statusData = await statusRes.json();
          if (statusData.state === 'CONNECTED' || statusData.isConnected) {
            setSession(prev => ({ ...prev, connected: true, user: statusData.user }));
          }
        }
      } catch (_) {}

      setIsCheckingWorkerStatus(false);
    };

    init();
  }, []);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setFeedbackToast({ message, type });
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  // Check a single number with strict analysis & live server fallback
  const checkSingleNumberViaApi = async (raw: string, countryCode: string): Promise<NumberCheckResult> => {
    const analysis = analyzePhoneNumber(raw, countryCode);

    // 1. Invalid length or malformed characters
    if (!analysis.isValidLength || analysis.carrierType === 'invalid') {
      return {
        id: `res_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        rawInput: raw,
        normalizedPhone: analysis.cleaned || raw,
        status: 'INVALID',
        countryCode: analysis.countryCode,
        source: 'format_validator',
        details: analysis.reason,
        checkedAt: new Date().toLocaleTimeString()
      };
    }

    // 2. Dummy / Test pattern (0000000000, 1111111111, sequential 1234567890, etc.)
    if (analysis.isDummy || analysis.carrierType === 'dummy') {
      return {
        id: `res_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        rawInput: raw,
        normalizedPhone: analysis.cleaned,
        status: 'NOT_ACTIVE',
        countryCode: analysis.countryCode,
        source: 'carrier_validator',
        details: analysis.reason,
        checkedAt: new Date().toLocaleTimeString()
      };
    }

    // 3. Fixed landline, toll-free, or non-mobile prefix
    if (analysis.carrierType === 'landline' || analysis.carrierType === 'toll_free') {
      return {
        id: `res_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        rawInput: raw,
        normalizedPhone: analysis.cleaned,
        status: 'NOT_ACTIVE',
        countryCode: analysis.countryCode,
        source: 'carrier_validator',
        details: analysis.reason,
        checkedAt: new Date().toLocaleTimeString()
      };
    }

    // 4. Mobile subscriber number -> Query live WhatsApp Server
    try {
      const res = await fetch('/api/whatsapp-service/check-number', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: analysis.cleaned })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.connected && data.success) {
          return {
            id: `res_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            rawInput: raw,
            normalizedPhone: data.formattedPhone || analysis.cleaned,
            status: data.exists ? 'ACTIVE' : 'NOT_ACTIVE',
            countryCode: analysis.countryCode,
            source: 'live_server',
            details: data.exists
              ? 'Confirmed active registered WhatsApp account.'
              : 'Confirmed not registered on WhatsApp.',
            checkedAt: new Date().toLocaleTimeString()
          };
        }
      }
    } catch (_) {}

    // 5. WhatsApp server is NOT connected:
    // Honest status: NEVER fake it as ACTIVE! Mark as NEEDS_CHECK with guidance.
    return {
      id: `res_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      rawInput: raw,
      normalizedPhone: analysis.cleaned,
      status: 'NEEDS_CHECK',
      countryCode: analysis.countryCode,
      source: 'carrier_validator',
      details: `${analysis.reason} Connect WhatsApp in Step 1 to perform live 100% server registration check.`,
      checkedAt: new Date().toLocaleTimeString()
    };
  };

  // Handle single check submit
  const handleSingleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singlePhone.trim()) return;

    setIsSingleChecking(true);
    setSingleResult(null);

    const result = await checkSingleNumberViaApi(singlePhone.trim(), singleCountryCode);
    setSingleResult(result);
    setResults(prev => [result, ...prev.filter(r => r.normalizedPhone !== result.normalizedPhone)]);
    setIsSingleChecking(false);
  };

  // Handle bulk check execution
  const handleStartBulkCheck = async () => {
    const rawLines = bulkInputText
      .split(/[\n,;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    if (rawLines.length === 0) {
      showToast('Please enter at least one phone number to check.', 'error');
      return;
    }

    const uniqueInputs = Array.from(new Set(rawLines));
    setIsBulkChecking(true);
    setShouldStopBulk(false);
    stopRequestedRef.current = false;
    setBulkProgress({ current: 0, total: uniqueInputs.length, percent: 0 });

    const newResults: NumberCheckResult[] = [];

    // Attempt batch verification via API first if worker is connected
    let useBatchApi = session.connected;
    if (useBatchApi) {
      try {
        const cleanedList = uniqueInputs.map(raw => analyzePhoneNumber(raw, bulkDefaultCountry).cleaned);
        const batchRes = await fetch('/api/whatsapp-service/check-numbers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phoneNumbers: cleanedList })
        });

        if (batchRes.ok) {
          const batchData = await batchRes.json();
          if (batchData.connected && Array.isArray(batchData.results)) {
            for (let i = 0; i < batchData.results.length; i++) {
              const item = batchData.results[i];
              const raw = uniqueInputs[i] || item.phone;
              const analysis = analyzePhoneNumber(raw, bulkDefaultCountry);

              let finalStatus: 'ACTIVE' | 'NOT_ACTIVE' | 'INVALID' = item.exists ? 'ACTIVE' : 'NOT_ACTIVE';
              let finalDetails = item.exists
                ? 'Confirmed active registered WhatsApp account.'
                : 'Confirmed not registered on WhatsApp.';

              if (!analysis.isValidLength) {
                finalStatus = 'INVALID';
                finalDetails = analysis.reason;
              } else if (analysis.isDummy || analysis.carrierType === 'dummy' || analysis.carrierType === 'landline') {
                finalStatus = 'NOT_ACTIVE';
                finalDetails = analysis.reason;
              }

              newResults.push({
                id: `res_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`,
                rawInput: raw,
                normalizedPhone: item.phone,
                status: finalStatus,
                countryCode: analysis.countryCode,
                source: 'live_server',
                details: finalDetails,
                checkedAt: new Date().toLocaleTimeString()
              });
            }

            setResults(prev => {
              const existingMap = new Map(prev.map(r => [r.normalizedPhone, r]));
              newResults.forEach(r => existingMap.set(r.normalizedPhone, r));
              return Array.from(existingMap.values());
            });

            setBulkProgress({ current: uniqueInputs.length, total: uniqueInputs.length, percent: 100 });
            setIsBulkChecking(false);
            showToast(`✓ Checked ${newResults.length} numbers via live WhatsApp server!`);
            return;
          }
        }
      } catch (_) {}
    }

    // Sequential verification with analyzePhoneNumber
    for (let i = 0; i < uniqueInputs.length; i++) {
      if (stopRequestedRef.current) {
        showToast('Bulk verification stopped.', 'info');
        break;
      }

      const raw = uniqueInputs[i];
      const result = await checkSingleNumberViaApi(raw, bulkDefaultCountry);
      newResults.push(result);

      setBulkProgress({
        current: i + 1,
        total: uniqueInputs.length,
        percent: Math.round(((i + 1) / uniqueInputs.length) * 100)
      });

      if (i % 5 === 0 || i === uniqueInputs.length - 1) {
        setResults(prev => {
          const existingMap = new Map(prev.map(r => [r.normalizedPhone, r]));
          newResults.forEach(r => existingMap.set(r.normalizedPhone, r));
          return Array.from(existingMap.values());
        });
      }

      await new Promise(r => setTimeout(r, 60));
    }

    setIsBulkChecking(false);
    showToast(`✓ Completed verification for ${newResults.length} numbers!`);
  };

  const handleStopBulkCheck = () => {
    stopRequestedRef.current = true;
    setShouldStopBulk(true);
  };

  // Load sample numbers illustrating real vs dummy vs landline
  const handleLoadSamples = () => {
    const samples = [
      '+91 9876543210',          // Real mobile format
      '0000000000',              // Dummy repeated pattern -> No WhatsApp
      '1234567890',              // Sequential dummy -> No WhatsApp
      '+91 9123456789',          // Real Indian mobile format
      '+44 20 7946 0991',        // UK Geographic Landline -> No WhatsApp
      '+44 7911 123456',         // UK Mobile format
      '9999999999',              // Dummy repeated -> No WhatsApp
      '+971 50 123 4567',        // UAE Mobile format
      '123'                      // Too short -> Invalid
    ];
    setBulkInputText(samples.join('\n'));
    showToast('Loaded 9 test sample numbers.');
  };

  // Handle file upload (.csv, .txt, .xlsx)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileName = file.name.toLowerCase();
      if (fileName.endsWith('.csv') || fileName.endsWith('.txt')) {
        const text = await file.text();
        const extracted = text
          .split(/[\r\n,;]+/)
          .map(s => s.trim().replace(/^["']|["']$/g, ''))
          .filter(s => /\d{5,}/.test(s));

        if (extracted.length > 0) {
          setBulkInputText(prev => (prev ? `${prev}\n${extracted.join('\n')}` : extracted.join('\n')));
          showToast(`Imported ${extracted.length} numbers from ${file.name}`);
        } else {
          showToast('No valid phone numbers found in file.', 'error');
        }
      } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        const XLSX = await import('xlsx');
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonRows: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        const extracted: string[] = [];
        for (const row of jsonRows) {
          if (Array.isArray(row)) {
            for (const cell of row) {
              const str = String(cell || '').trim();
              if (/\d{5,}/.test(str)) {
                extracted.push(str);
              }
            }
          }
        }

        if (extracted.length > 0) {
          setBulkInputText(prev => (prev ? `${prev}\n${extracted.join('\n')}` : extracted.join('\n')));
          showToast(`Imported ${extracted.length} numbers from Excel sheet.`);
        } else {
          showToast('No numbers found in Excel file.', 'error');
        }
      }
    } catch (err: any) {
      showToast(`Failed to parse file: ${err.message}`, 'error');
    }

    e.target.value = '';
  };

  // Download sample file for uploading numbers
  const handleDownloadSampleFile = (format: 'csv' | 'txt' = 'csv') => {
    let content = '';
    let filename = '';
    let mimeType = '';

    if (format === 'csv') {
      content = `Phone,Name\n` +
        `+91 9876543210,Rohan Sharma\n` +
        `+91 9123456789,Priya Patel\n` +
        `+44 7911 123456,David Miller\n` +
        `+1 202 555 0143,Sarah Connor\n` +
        `+971 50 123 4567,Ahmed Al Mansoori\n` +
        `0000000000,Dummy Number Test\n` +
        `02223456789,Mumbai Landline\n` +
        `+44 20 7946 0991,London Fixed Landline\n`;
      filename = 'sample_whatsapp_numbers.csv';
      mimeType = 'text/csv;charset=utf-8;';
    } else {
      content = `+91 9876543210\n` +
        `+91 9123456789\n` +
        `+44 7911 123456\n` +
        `+1 202 555 0143\n` +
        `+971 50 123 4567\n` +
        `0000000000\n` +
        `02223456789\n` +
        `+44 20 7946 0991\n`;
      filename = 'sample_whatsapp_numbers.txt';
      mimeType = 'text/plain;charset=utf-8;';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${filename} sample template.`);
  };

  // Re-verify pending numbers once WhatsApp connects
  const handleReverifyPending = async () => {
    const pending = results.filter(r => r.status === 'NEEDS_CHECK');
    if (pending.length === 0) return;

    showToast(`Re-verifying ${pending.length} numbers with live WhatsApp server...`, 'info');
    const updatedMap = new Map(results.map(r => [r.normalizedPhone, r]));

    for (const item of pending) {
      try {
        const res = await fetch('/api/whatsapp-service/check-number', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phoneNumber: item.normalizedPhone })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.connected && data.success) {
            updatedMap.set(item.normalizedPhone, {
              ...item,
              status: data.exists ? 'ACTIVE' : 'NOT_ACTIVE',
              source: 'live_server',
              details: data.exists
                ? 'Confirmed active registered WhatsApp account.'
                : 'Confirmed not registered on WhatsApp.',
              checkedAt: new Date().toLocaleTimeString()
            });
          }
        }
      } catch (_) {}
    }

    setResults(Array.from(updatedMap.values()));
    showToast('✓ Live re-verification complete!');
  };

  // Statistics calculation
  const stats = useMemo(() => {
    const total = results.length;
    const active = results.filter(r => r.status === 'ACTIVE').length;
    const notActive = results.filter(r => r.status === 'NOT_ACTIVE').length;
    const needsCheck = results.filter(r => r.status === 'NEEDS_CHECK').length;
    const invalid = results.filter(r => r.status === 'INVALID').length;
    const activePercent = total > 0 ? Math.round((active / total) * 100) : 0;
    const inactivePercent = total > 0 ? Math.round((notActive / total) * 100) : 0;
    return { total, active, notActive, needsCheck, invalid, activePercent, inactivePercent };
  }, [results]);

  // Filtered Results
  const filteredResults = useMemo(() => {
    return results.filter(r => {
      if (resultFilter === 'ACTIVE' && r.status !== 'ACTIVE') return false;
      if (resultFilter === 'NOT_ACTIVE' && r.status !== 'NOT_ACTIVE') return false;
      if (resultFilter === 'NEEDS_CHECK' && r.status !== 'NEEDS_CHECK') return false;
      if (resultFilter === 'INVALID' && r.status !== 'INVALID') return false;

      if (resultSearchQuery.trim()) {
        const q = resultSearchQuery.toLowerCase();
        return (
          r.rawInput.toLowerCase().includes(q) ||
          r.normalizedPhone.includes(q) ||
          (r.details && r.details.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [results, resultFilter, resultSearchQuery]);

  // Export handlers
  const handleExportCsv = (mode: 'active' | 'not_active' | 'all') => {
    let items = results;
    if (mode === 'active') items = results.filter(r => r.status === 'ACTIVE');
    if (mode === 'not_active') items = results.filter(r => r.status === 'NOT_ACTIVE');

    if (items.length === 0) {
      showToast('No numbers to export in this category.', 'error');
      return;
    }

    const headers = ['Phone Number', 'Original Input', 'WhatsApp Status', 'Country Code', 'Verification Method', 'Details', 'Checked Time'];
    const rows = items.map(r => [
      `"${r.normalizedPhone}"`,
      `"${r.rawInput}"`,
      `"${r.status}"`,
      `"${r.countryCode}"`,
      `"${r.source}"`,
      `"${(r.details || '').replace(/"/g, '""')}"`,
      `"${r.checkedAt}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `whatsapp_${mode}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`✓ Exported ${items.length} numbers to CSV.`);
  };

  const handleExportTxt = (onlyActive = true) => {
    const items = onlyActive ? results.filter(r => r.status === 'ACTIVE') : results;
    if (items.length === 0) {
      showToast('No numbers to export.', 'error');
      return;
    }

    const txtContent = 'data:text/plain;charset=utf-8,' + encodeURIComponent(items.map(r => r.normalizedPhone).join('\n'));
    const link = document.createElement('a');
    link.setAttribute('href', txtContent);
    link.setAttribute('download', `whatsapp_${onlyActive ? 'active_' : 'all_'}${Date.now()}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`✓ Downloaded ${items.length} phone numbers as TXT.`);
  };

  const handleCopyActive = () => {
    const active = results.filter(r => r.status === 'ACTIVE').map(r => r.normalizedPhone);
    if (active.length === 0) {
      showToast('No confirmed active WhatsApp numbers found to copy.', 'error');
      return;
    }
    navigator.clipboard.writeText(active.join('\n'));
    showToast(`✓ Copied ${active.length} active WhatsApp numbers to clipboard!`);
  };

  // 1-Click Send to WhatsApp Marketing Audience
  const handleSendToMarketing = () => {
    const active = results.filter(r => r.status === 'ACTIVE');
    if (active.length === 0) {
      showToast('No confirmed active WhatsApp numbers available to add.', 'error');
      return;
    }

    const username = currentUser?.username?.toLowerCase() || 'default';
    const storageKey = `toolnest_wa_contacts_${username}`;

    try {
      let existing: WebContact[] = [];
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        existing = JSON.parse(saved);
      }

      const existingPhones = new Set(existing.map(c => c.phoneNumber.replace(/\D/g, '')));
      let addedCount = 0;

      const newContacts: WebContact[] = [];
      for (const item of active) {
        const clean = item.normalizedPhone.replace(/\D/g, '');
        if (!existingPhones.has(clean)) {
          existingPhones.add(clean);
          addedCount++;
          newContacts.push({
            id: `c_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            name: `Contact (+${clean.slice(-4)})`,
            phoneNumber: `+${clean}`,
            status: 'PENDING'
          });
        }
      }

      const updated = [...existing, ...newContacts];
      localStorage.setItem(storageKey, JSON.stringify(updated));
      showToast(`✓ Added ${addedCount} confirmed active WhatsApp numbers to your Marketing Audience!`);
    } catch (err: any) {
      showToast('Failed to update marketing contacts: ' + err.message, 'error');
    }
  };

  const handleCopySingle = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFC] dark:bg-[#0c0e14] text-zinc-900 dark:text-zinc-100 transition-colors">
      {/* Universal ToolNest Header */}
      <Header
        activeToolName="WhatsApp Number Checker"
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* Slide-out Navigation Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenHelp={() => setIsHelpOpen(true)}
        activeToolId="whatsapp-number-checker"
      />

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* Top Hero & Connection Status Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-purple-50/40 to-white dark:from-[#131620] dark:via-[#19152b] dark:to-[#131620] border border-zinc-200/90 dark:border-zinc-800 p-5 sm:p-7 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#5722AF]/10 dark:bg-[#5722AF]/25 text-[#5722AF] dark:text-purple-300 border border-[#5722AF]/20">
                <Sparkles className="w-3.5 h-3.5" />
                <span>100% Genuine WhatsApp Filter & Validator</span>
              </div>
              <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                WhatsApp Account Checker & Number Filter
              </h1>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
                Check whether single or bulk contact numbers have an active WhatsApp account or not. Identifies dummy numbers, landlines, and invalid prefixes, with real-time server verification.
              </p>
            </div>

            {/* Connection Indicator & Quick Connect Toggle */}
            <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <div
                className={`px-3.5 py-2.5 rounded-2xl border text-xs font-semibold flex items-center gap-2.5 shadow-2xs ${
                  session.connected
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
                    : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                }`}
              >
                {session.connected ? (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <div>
                      <p className="font-bold leading-tight">Live Server Active</p>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400">100% genuine WhatsApp queries</p>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <div>
                      <p className="font-bold leading-tight">Carrier Filter Active</p>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Filters dummy & landlines</p>
                    </div>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowConnectModal(true)}
                className="px-4 py-2.5 rounded-2xl bg-[#5722AF] hover:bg-[#471a93] text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm shadow-[#5722AF]/20 cursor-pointer"
              >
                <Radio className="w-4 h-4" />
                <span>{session.connected ? 'WhatsApp Connected' : 'Connect WhatsApp'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation: Single Check vs Bulk Check */}
        <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <button
            type="button"
            onClick={() => setActiveMode('single')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeMode === 'single'
                ? 'bg-[#5722AF] text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>Single Number Lookup</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('bulk')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeMode === 'bulk'
                ? 'bg-[#5722AF] text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Bulk Numbers Checker</span>
          </button>
        </div>

        {/* MODE 1: SINGLE NUMBER CHECK */}
        {activeMode === 'single' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 bg-white dark:bg-[#131620] rounded-3xl border border-zinc-200/90 dark:border-zinc-800 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Search className="w-4 h-4 text-[#5722AF]" />
                  <span>Check Individual Number</span>
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Enter a phone number to check if it has a registered WhatsApp account.
                </p>
              </div>

              <form onSubmit={handleSingleCheck} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Country Dial Code
                  </label>
                  <select
                    value={singleCountryCode}
                    onChange={e => setSingleCountryCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/70 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#5722AF]"
                  >
                    {COMMON_COUNTRY_CODES.map((c: { code: string; country: string; flag: string }) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} +{c.code} — {c.country}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Phone Number
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={singlePhone}
                      onChange={e => setSinglePhone(e.target.value)}
                      placeholder="e.g. 9876543210 or +919876543210"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 font-mono placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#5722AF]"
                    />
                    {singlePhone && (
                      <button
                        type="button"
                        onClick={() => setSinglePhone('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 text-xs p-1"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSingleChecking || !singlePhone.trim()}
                  className="w-full py-2.5 rounded-xl bg-[#5722AF] hover:bg-[#471a93] disabled:opacity-50 text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#5722AF]/20"
                >
                  {isSingleChecking ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Checking WhatsApp Server...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Check WhatsApp Account</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Single Result Display */}
            <div className="lg:col-span-6 bg-white dark:bg-[#131620] rounded-3xl border border-zinc-200/90 dark:border-zinc-800 p-5 sm:p-6 shadow-xs flex flex-col justify-center">
              {singleResult ? (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div
                    className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
                      singleResult.status === 'ACTIVE'
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                        : singleResult.status === 'NOT_ACTIVE'
                        ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                        : singleResult.status === 'NEEDS_CHECK'
                        ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                        : 'bg-zinc-100 dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-200'
                    }`}
                  >
                    {singleResult.status === 'ACTIVE' ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                    ) : singleResult.status === 'NOT_ACTIVE' ? (
                      <XCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                    ) : singleResult.status === 'NEEDS_CHECK' ? (
                      <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-6 h-6 text-zinc-500 shrink-0 mt-0.5" />
                    )}

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm sm:text-base">
                          {singleResult.status === 'ACTIVE'
                            ? 'Has WhatsApp Account'
                            : singleResult.status === 'NOT_ACTIVE'
                            ? 'No WhatsApp Account'
                            : singleResult.status === 'NEEDS_CHECK'
                            ? 'Requires WhatsApp Connection'
                            : 'Invalid Phone Number'}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/70 dark:bg-black/30">
                          {singleResult.source === 'live_server'
                            ? 'Server Verified'
                            : singleResult.source === 'carrier_validator'
                            ? 'Carrier Filter'
                            : 'Format Check'}
                        </span>
                      </div>
                      <p className="text-xs opacity-90 leading-relaxed font-mono font-bold">
                        +{singleResult.normalizedPhone}
                      </p>
                      <p className="text-[11px] opacity-80 leading-relaxed">
                        {singleResult.details}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    {/* Direct Test Link */}
                    <a
                      href={`https://wa.me/${singleResult.normalizedPhone}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open Chat in WhatsApp</span>
                    </a>

                    {singleResult.status === 'NEEDS_CHECK' && !session.connected && (
                      <button
                        type="button"
                        onClick={() => setShowConnectModal(true)}
                        className="px-3.5 py-2 rounded-xl bg-[#5722AF] hover:bg-[#471a93] text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                      >
                        <Radio className="w-3.5 h-3.5" />
                        <span>Connect WhatsApp to Verify Live</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleCopySingle(singleResult.id, singleResult.normalizedPhone)}
                      className="px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 transition cursor-pointer"
                    >
                      {copiedId === singleResult.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Number</span>
                        </>
                      )}
                    </button>

                    {singleResult.status === 'ACTIVE' && (
                      <button
                        type="button"
                        onClick={handleSendToMarketing}
                        className="px-3.5 py-2 rounded-xl bg-[#5722AF]/10 dark:bg-[#5722AF]/20 hover:bg-[#5722AF] text-[#5722AF] dark:text-purple-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Add to Marketing Audience</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center space-y-2 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                  <div className="w-10 h-10 rounded-2xl bg-[#5722AF]/10 dark:bg-purple-950/40 text-[#5722AF] dark:text-purple-300 flex items-center justify-center mx-auto">
                    <Phone className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Awaiting Phone Number
                  </h4>
                  <p className="text-[11px] text-zinc-500 max-w-xs mx-auto">
                    Enter any phone number on the left and click &quot;Check WhatsApp Account&quot; to see real-time verification.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODE 2: BULK NUMBERS CHECKER */}
        {activeMode === 'bulk' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#131620] rounded-3xl border border-zinc-200/90 dark:border-zinc-800 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#5722AF]" />
                    <span>Bulk WhatsApp Number Filter</span>
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Paste contact numbers (one per line or comma separated), or upload a CSV/Excel file.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.txt,.xlsx,.xls"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#5722AF]" />
                    <span>Upload CSV / TXT / Excel</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownloadSampleFile('csv')}
                    className="px-3 py-1.5 rounded-xl border border-purple-200 dark:border-purple-800/60 bg-purple-50/70 dark:bg-purple-950/30 text-[#5722AF] dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                    title="Download pre-formatted sample file for bulk number checking"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Sample File</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleLoadSamples}
                    className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-[#5722AF] dark:text-purple-300 hover:bg-[#5722AF]/20 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Load Sample Numbers</span>
                  </button>
                </div>
              </div>

              {/* Textarea Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-zinc-600 dark:text-zinc-400">
                    Phone Numbers List:
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-zinc-400">Default Code if missing:</span>
                    <select
                      value={bulkDefaultCountry}
                      onChange={e => setBulkDefaultCountry(e.target.value)}
                      className="px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-[11px] text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-[#5722AF]"
                    >
                      {COMMON_COUNTRY_CODES.map((c: { code: string; country: string; flag: string }) => (
                        <option key={c.code} value={c.code}>
                          +{c.code} ({c.country})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <textarea
                  rows={6}
                  value={bulkInputText}
                  onChange={e => setBulkInputText(e.target.value)}
                  placeholder="Paste phone numbers here, e.g.&#10;+91 9876543210&#10;0000000000&#10;1234567890&#10;+44 20 7946 0991&#10;+44 7911 123456"
                  className="w-full p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/40 text-xs text-zinc-900 dark:text-zinc-100 font-mono placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#5722AF]"
                />

                {/* Download Sample File Helper Banner */}
                <div className="p-3 bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                  <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                    <FileSpreadsheet className="w-4 h-4 text-[#5722AF] dark:text-purple-400 shrink-0" />
                    <span>Need a pre-formatted template? Download sample file to fill in Excel or Sheets:</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleDownloadSampleFile('csv')}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-purple-200 dark:border-purple-800 text-[#5722AF] dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer shadow-2xs"
                      title="Download sample CSV file"
                    >
                      <Download className="w-3 h-3" />
                      <span>Sample CSV</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadSampleFile('txt')}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer"
                      title="Download sample TXT file"
                    >
                      <FileText className="w-3 h-3 text-zinc-500" />
                      <span>Sample TXT</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons & Progress Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div className="text-xs text-zinc-500">
                  {bulkInputText ? (
                    <span>
                      {bulkInputText.split(/[\n,;]+/).filter(s => s.trim().length > 0).length} numbers ready to check
                    </span>
                  ) : (
                    <span>Ready for input</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {bulkInputText && (
                    <button
                      type="button"
                      onClick={() => setBulkInputText('')}
                      className="px-3 py-2 rounded-xl text-xs font-semibold text-zinc-500 hover:text-rose-600 transition cursor-pointer"
                    >
                      Clear
                    </button>
                  )}

                  {isBulkChecking ? (
                    <button
                      type="button"
                      onClick={handleStopBulkCheck}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <span>Stop Verification</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleStartBulkCheck}
                      disabled={!bulkInputText.trim()}
                      className="px-5 py-2.5 rounded-xl bg-[#5722AF] hover:bg-[#471a93] disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md shadow-[#5722AF]/20"
                    >
                      <CheckCheck className="w-4 h-4" />
                      <span>Start Bulk Verification</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Progress Indicator */}
              {isBulkChecking && (
                <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="flex items-center gap-1.5 text-[#5722AF] dark:text-purple-300">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Verifying numbers ({bulkProgress.current} / {bulkProgress.total})...</span>
                    </span>
                    <span className="font-mono text-zinc-600 dark:text-zinc-400">
                      {bulkProgress.percent}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#5722AF] to-[#7B45D1] transition-all duration-200"
                      style={{ width: `${bulkProgress.percent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STATS DASHBOARD & RESULTS TABLE (If results exist) */}
        {results.length > 0 && (
          <div className="space-y-5 animate-in fade-in duration-300">
            {/* Statistics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="bg-white dark:bg-[#131620] rounded-2xl border border-zinc-200/90 dark:border-zinc-800 p-4 shadow-2xs space-y-1">
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Total Checked</span>
                <p className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white font-mono">
                  {stats.total}
                </p>
                <p className="text-[10px] text-zinc-400">100% evaluated</p>
              </div>

              <div className="bg-white dark:bg-[#131620] rounded-2xl border border-emerald-200 dark:border-emerald-800/60 p-4 shadow-2xs space-y-1 bg-emerald-50/20 dark:bg-emerald-950/10">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Has WhatsApp</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {stats.active}
                </p>
                <p className="text-[10px] text-emerald-600/80 font-semibold">{stats.activePercent}% verified</p>
              </div>

              <div className="bg-white dark:bg-[#131620] rounded-2xl border border-rose-200 dark:border-rose-800/60 p-4 shadow-2xs space-y-1 bg-rose-50/20 dark:bg-rose-950/10">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">No WhatsApp</span>
                  <XCircle className="w-4 h-4 text-rose-600" />
                </div>
                <p className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 font-mono">
                  {stats.notActive}
                </p>
                <p className="text-[10px] text-rose-600/80 font-semibold">{stats.inactivePercent}% inactive / landlines</p>
              </div>

              <div className="bg-white dark:bg-[#131620] rounded-2xl border border-amber-200 dark:border-amber-800/60 p-4 shadow-2xs space-y-1 bg-amber-50/20 dark:bg-amber-950/10">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Needs Connect</span>
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                </div>
                <p className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
                  {stats.needsCheck}
                </p>
                <p className="text-[10px] text-amber-600/80 font-semibold">Valid mobile prefix</p>
              </div>

              <div className="bg-white dark:bg-[#131620] rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-2xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Invalid Format</span>
                  <AlertCircle className="w-4 h-4 text-zinc-400" />
                </div>
                <p className="text-xl sm:text-2xl font-black text-zinc-600 dark:text-zinc-300 font-mono">
                  {stats.invalid}
                </p>
                <p className="text-[10px] text-zinc-400">Malformed digits</p>
              </div>
            </div>

            {/* If there are numbers waiting for live check */}
            {stats.needsCheck > 0 && !session.connected && (
              <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 text-amber-900 dark:text-amber-200">
                  <Info className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    You have <strong>{stats.needsCheck}</strong> valid mobile numbers awaiting live server verification. Connect your WhatsApp to query WhatsApp servers directly.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowConnectModal(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#5722AF] hover:bg-[#471a93] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>Connect WhatsApp Now</span>
                </button>
              </div>
            )}

            {stats.needsCheck > 0 && session.connected && (
              <div className="p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 text-[#5722AF] dark:text-purple-300 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>WhatsApp is connected! Click below to query WhatsApp servers for all pending numbers.</span>
                </div>
                <button
                  type="button"
                  onClick={handleReverifyPending}
                  className="px-3.5 py-1.5 rounded-xl bg-[#5722AF] hover:bg-[#471a93] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Re-verify With Live WhatsApp</span>
                </button>
              </div>
            )}

            {/* Results Header, Filters & Action Buttons */}
            <div className="bg-white dark:bg-[#131620] rounded-3xl border border-zinc-200/90 dark:border-zinc-800 p-4 sm:p-5 shadow-xs space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Filter Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
                  <button
                    type="button"
                    onClick={() => setResultFilter('ALL')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                      resultFilter === 'ALL'
                        ? 'bg-[#5722AF] text-white'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    All ({stats.total})
                  </button>

                  <button
                    type="button"
                    onClick={() => setResultFilter('ACTIVE')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                      resultFilter === 'ACTIVE'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
                    }`}
                  >
                    Has WhatsApp ({stats.active})
                  </button>

                  <button
                    type="button"
                    onClick={() => setResultFilter('NOT_ACTIVE')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                      resultFilter === 'NOT_ACTIVE'
                        ? 'bg-rose-600 text-white'
                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100'
                    }`}
                  >
                    No WhatsApp ({stats.notActive})
                  </button>

                  {stats.needsCheck > 0 && (
                    <button
                      type="button"
                      onClick={() => setResultFilter('NEEDS_CHECK')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                        resultFilter === 'NEEDS_CHECK'
                          ? 'bg-amber-600 text-white'
                          : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100'
                      }`}
                    >
                      Pending Check ({stats.needsCheck})
                    </button>
                  )}

                  {stats.invalid > 0 && (
                    <button
                      type="button"
                      onClick={() => setResultFilter('INVALID')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                        resultFilter === 'INVALID'
                          ? 'bg-zinc-700 text-white'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
                      }`}
                    >
                      Invalid ({stats.invalid})
                    </button>
                  )}
                </div>

                {/* Search within results & Bulk Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative flex-1 sm:w-48">
                    <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={resultSearchQuery}
                      onChange={e => setResultSearchQuery(e.target.value)}
                      placeholder="Search phone number..."
                      className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#5722AF]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyActive}
                    className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 transition cursor-pointer"
                    title="Copy all confirmed active WhatsApp numbers"
                  >
                    <Copy className="w-3.5 h-3.5 text-[#5722AF]" />
                    <span>Copy Active</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleExportCsv('active')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                    title="Export verified active WhatsApp numbers as CSV"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Active (CSV)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleExportCsv('not_active')}
                    className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                    title="Export numbers with No WhatsApp account as CSV"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export No WhatsApp (CSV)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleExportCsv('all')}
                    className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 transition cursor-pointer"
                    title="Export full evaluation report"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export All (CSV)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSendToMarketing}
                    className="px-3 py-1.5 rounded-xl bg-[#5722AF] hover:bg-[#471a93] text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                    title="Import active numbers into WhatsApp Marketing tool"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Add to Marketing Audience</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Clear all verification results?')) {
                        setResults([]);
                      }
                    }}
                    className="p-2 rounded-xl text-zinc-400 hover:text-rose-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                    title="Clear results"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Table of Results */}
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden overflow-x-auto max-h-[55vh] scrollbar-thin">
                <table className="w-full text-left text-xs min-w-[640px]">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/80 text-zinc-500 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-10 backdrop-blur-xs">
                    <tr>
                      <th className="py-2.5 px-3 w-12 text-center">#</th>
                      <th className="py-2.5 px-3 min-w-[150px]">Phone Number</th>
                      <th className="py-2.5 px-3 min-w-[130px]">WhatsApp Status</th>
                      <th className="py-2.5 px-3 min-w-[200px]">Validation Details</th>
                      <th className="py-2.5 px-3 min-w-[90px]">Method</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {filteredResults.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-zinc-400">
                          No numbers match the selected filter.
                        </td>
                      </tr>
                    ) : (
                      filteredResults.map((r, idx) => (
                        <tr
                          key={r.id}
                          className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition"
                        >
                          <td className="py-2.5 px-3 text-center text-zinc-400 font-mono text-[11px]">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                              +{r.normalizedPhone}
                            </span>
                            {r.rawInput !== r.normalizedPhone && (
                              <span className="text-[10px] text-zinc-400 ml-1.5 font-mono">
                                ({r.rawInput})
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                r.status === 'ACTIVE'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : r.status === 'NOT_ACTIVE'
                                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                  : r.status === 'NEEDS_CHECK'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                              }`}
                            >
                              {r.status === 'ACTIVE' && <CheckCircle2 className="w-3 h-3" />}
                              {r.status === 'NOT_ACTIVE' && <XCircle className="w-3 h-3" />}
                              {r.status === 'NEEDS_CHECK' && <Clock className="w-3 h-3" />}
                              {r.status === 'INVALID' && <AlertCircle className="w-3 h-3" />}
                              <span>
                                {r.status === 'ACTIVE'
                                  ? 'Has WhatsApp'
                                  : r.status === 'NOT_ACTIVE'
                                  ? 'No WhatsApp'
                                  : r.status === 'NEEDS_CHECK'
                                  ? 'Pending Server'
                                  : 'Invalid'}
                              </span>
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-[11px] text-zinc-600 dark:text-zinc-400">
                            {r.details}
                          </td>
                          <td className="py-2.5 px-3 text-[10px] font-semibold text-zinc-500 whitespace-nowrap">
                            {r.source === 'live_server' ? (
                              <span className="text-purple-600 dark:text-purple-400 font-bold">
                                Live Server
                              </span>
                            ) : r.source === 'carrier_validator' ? (
                              <span className="text-zinc-500">Carrier Filter</span>
                            ) : (
                              <span className="text-zinc-400">Format Check</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {(r.status === 'ACTIVE' || r.status === 'NEEDS_CHECK') && (
                                <a
                                  href={`https://wa.me/${r.normalizedPhone}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  title="Open chat in WhatsApp"
                                  className="p-1 text-zinc-400 hover:text-emerald-600 rounded transition"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                              <button
                                type="button"
                                onClick={() => handleCopySingle(r.id, r.normalizedPhone)}
                                title="Copy number"
                                className="p-1 text-zinc-400 hover:text-[#5722AF] rounded transition cursor-pointer"
                              >
                                {copiedId === r.id ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Feature Explanations & FAQ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#131620] border border-zinc-200/90 dark:border-zinc-800 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950 text-[#5722AF] dark:text-purple-300 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-zinc-900 dark:text-white">Strict Carrier & Pattern Filter</h4>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Instantly detects dummy sequences, landlines, and fictional exchanges. Never assumes non-existent numbers have accounts.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#131620] border border-zinc-200/90 dark:border-zinc-800 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950 text-[#5722AF] dark:text-purple-300 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-zinc-900 dark:text-white">Live Official Protocol Check</h4>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              When WhatsApp is connected, queries WhatsApp&apos;s encrypted server database directly via official protocol without sending messages.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#131620] border border-zinc-200/90 dark:border-zinc-800 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950 text-[#5722AF] dark:text-purple-300 flex items-center justify-center">
              <Send className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-zinc-900 dark:text-white">Marketing Direct Sync</h4>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Seamlessly export active numbers or push them straight into your ToolNest WhatsApp Marketing Platform audience with one click.
            </p>
          </div>
        </div>

      </main>

      {/* Connection Drawer / Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#0f121a] rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#5722AF]/10 dark:bg-purple-950 text-[#5722AF] dark:text-purple-300 flex items-center justify-center">
                  <Radio className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                    Connect WhatsApp Session
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    Enables 100% live server verification for checking numbers
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowConnectModal(false)}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1 rounded-xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            <WhatsAppWebConnect
              session={session}
              onSessionChange={(s) => {
                setSession(s);
                if (s.connected) {
                  setShowConnectModal(false);
                  showToast('✓ WhatsApp connected! Live server verification is active.');
                }
              }}
              userId={currentUser?.username}
            />

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setShowConnectModal(false)}
                className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-pointer"
              >
                Close Connection Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {feedbackToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div
            className={`px-4 py-3 rounded-2xl text-xs font-semibold shadow-xl border flex items-center gap-2 ${
              feedbackToast.type === 'success'
                ? 'bg-emerald-600 text-white border-emerald-500'
                : feedbackToast.type === 'error'
                ? 'bg-rose-600 text-white border-rose-500'
                : 'bg-zinc-800 text-white border-zinc-700'
            }`}
          >
            {feedbackToast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : feedbackToast.type === 'error' ? (
              <AlertCircle className="w-4 h-4" />
            ) : (
              <Info className="w-4 h-4" />
            )}
            <span>{feedbackToast.message}</span>
          </div>
        </div>
      )}

      {/* Universal ToolNest Footer */}
      <Footer />
    </div>
  );
}
