'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  Receipt,
  X,
  Send,
  CheckCircle2,
  AlertCircle,
  Phone,
  User,
  History,
  Clock,
  Loader2,
  Upload,
  Camera,
  Trash2,
  Edit2,
  Search,
  Check,
  Save,
  WifiOff,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Sliders,
  DollarSign
} from 'lucide-react';
import { WebContact, WhatsAppWebSession } from '@/lib/whatsapp-web/types';
import { WhatsAppLimitManager, PlanLimitsConfig } from '@/lib/whatsapp-web/limit-manager';
import { WhatsAppSessionManager } from '@/lib/whatsapp-web/session';

interface WhatsAppInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: {
    id?: string;
    username: string;
    businessName: string;
    role?: 'admin' | 'user';
    subscriptionType?: 'trial' | 'paid' | 'none';
    planType?: '1_month' | '3_months' | '6_months' | null;
  } | null;
  session: WhatsAppWebSession;
  contacts: WebContact[];
  onContactsChange: (contacts: WebContact[]) => void;
  planLimits?: PlanLimitsConfig;
  onOpenConnect?: () => void;
}

export const WhatsAppInvoiceModal: React.FC<WhatsAppInvoiceModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  session,
  contacts,
  onContactsChange,
  planLimits,
  onOpenConnect
}) => {
  const storeName = currentUser?.businessName?.trim() || 'HP Store';
  const defaultInvoiceMessage = `Thank you for shopping with ${storeName}.`;

  const [activeTab, setActiveTab] = useState<'create' | 'history' | 'contacts'>('create');
  const [contactSearchFilter, setContactSearchFilter] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState(defaultInvoiceMessage);
  const [isSendMessage, setIsSendMessage] = useState(true);

  // Customer List Inline Edit State
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');

  // Attached Image & Camera State
  const [attachedImage, setAttachedImage] = useState<{
    name: string;
    type: string;
    size: number;
    dataUrl: string;
  } | null>(null);

  const [isDesktopCameraActive, setIsDesktopCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mobileCameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Live Phone Search Suggestions (Starting at 2 digits)
  const [searchResults, setSearchResults] = useState<WebContact[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Popup Modal when WhatsApp is not connected
  const [isConnectPopupOpen, setIsConnectPopupOpen] = useState(false);

  // Sending & History State
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const [pastInvoices, setPastInvoices] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const effectiveUserId = (
    currentUser?.username && currentUser.username.trim() !== 'default'
      ? currentUser.username.trim()
      : WhatsAppSessionManager.getUserId()
  ).toLowerCase();

  // Auto-restore draft on open, and fetch past invoices
  useEffect(() => {
    if (isOpen) {
      try {
        const savedDraft = localStorage.getItem(`toolnest_invoice_draft_${effectiveUserId}`);
        if (savedDraft) {
          const parsed = JSON.parse(savedDraft);
          if (parsed.customerPhone) setCustomerPhone(parsed.customerPhone);
          if (parsed.customerName) setCustomerName(parsed.customerName);
          if (parsed.amount) setAmount(parsed.amount);
          if (parsed.message) setMessage(parsed.message);
          if (parsed.attachedImage) setAttachedImage(parsed.attachedImage);
          if (parsed.isSendMessage !== undefined) setIsSendMessage(parsed.isSendMessage);
        } else {
          setMessage(`Thank you for shopping with ${currentUser?.businessName?.trim() || 'HP Store'}.`);
        }
      } catch (_) {
        setMessage(`Thank you for shopping with ${currentUser?.businessName?.trim() || 'HP Store'}.`);
      }

      setStatusMessage(null);
      setIsSending(false);
      setIsConnectPopupOpen(false);
      setSearchResults([]);
      setShowSearchResults(false);
      stopDesktopCamera();
      fetchPastInvoices();
    } else {
      stopDesktopCamera();
      setIsConnectPopupOpen(false);
    }
  }, [isOpen, effectiveUserId]);

  // Persist draft to localStorage whenever fields change
  useEffect(() => {
    if (customerPhone || customerName || amount || attachedImage || message !== defaultInvoiceMessage) {
      try {
        localStorage.setItem(
          `toolnest_invoice_draft_${effectiveUserId}`,
          JSON.stringify({
            customerPhone,
            customerName,
            amount,
            message,
            attachedImage,
            isSendMessage
          })
        );
      } catch (_) {}
    }
  }, [customerPhone, customerName, amount, message, attachedImage, isSendMessage, effectiveUserId, defaultInvoiceMessage]);

  const clearFormAndDraft = () => {
    setCustomerPhone('');
    setCustomerName('');
    setAmount('');
    setAttachedImage(null);
    setMessage(defaultInvoiceMessage);
    setEditingContactId(null);
    setEditName('');
    setEditPhone('');
    try {
      localStorage.removeItem(`toolnest_invoice_draft_${effectiveUserId}`);
    } catch (_) {}
  };

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (isConnectPopupOpen) {
          setIsConnectPopupOpen(false);
          return;
        }
        stopDesktopCamera();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isConnectPopupOpen, onClose]);

  // Handle outside click to close phone search suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      stopDesktopCamera();
    };
  }, []);

  const fetchPastInvoices = async () => {
    if (!currentUser?.username) return;
    setIsLoadingHistory(true);
    try {
      const res = await fetch(`/api/whatsapp/invoices?username=${encodeURIComponent(currentUser.username)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.invoices)) {
        setPastInvoices(data.invoices);
      }
    } catch (err) {
      console.error('Failed to load past invoices:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Requirement 2: Live Phone Input with suggestions starting at 2 digits
  const handlePhoneInputChange = (rawVal: string) => {
    const digitsOnly = rawVal.replace(/\D/g, '');
    setCustomerPhone(digitsOnly);

    if (digitsOnly.length >= 2) {
      // Find matching contacts in customer list
      const matched = contacts.filter(c => {
        const cDigits = c.phoneNumber.replace(/\D/g, '');
        const last10 = cDigits.slice(-10);
        return (
          cDigits.includes(digitsOnly) ||
          cDigits.startsWith(digitsOnly) ||
          last10.startsWith(digitsOnly) ||
          (c.name && c.name.toLowerCase().includes(rawVal.toLowerCase()))
        );
      });

      // Deduplicate by clean phone number
      const seen = new Set<string>();
      const uniqueMatched: WebContact[] = [];
      for (const m of matched) {
        const key = m.phoneNumber.replace(/\D/g, '');
        if (!seen.has(key)) {
          seen.add(key);
          uniqueMatched.push(m);
        }
      }

      setSearchResults(uniqueMatched.slice(0, 6));
      setShowSearchResults(uniqueMatched.length > 0);

      // Auto-fill customer name if exact match exists (10 digits)
      if (digitsOnly.length >= 10) {
        const exactMatch = contacts.find(c => {
          const cDigits = c.phoneNumber.replace(/\D/g, '');
          return cDigits === digitsOnly || cDigits.slice(-10) === digitsOnly.slice(-10);
        });
        if (exactMatch && exactMatch.name) {
          setCustomerName(exactMatch.name);
        }
      }
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  const handleSelectContact = (contact: WebContact) => {
    const cleanDigits = contact.phoneNumber.replace(/\D/g, '');
    // If standard 10 digit or 12 digit with 91
    const displayDigits = cleanDigits.length === 12 && cleanDigits.startsWith('91')
      ? cleanDigits.slice(2)
      : cleanDigits;

    setCustomerPhone(displayDigits);
    setCustomerName(contact.name);
    setSearchResults([]);
    setShowSearchResults(false);
  };

  const handleStartEdit = (contact: WebContact) => {
    setEditingContactId(contact.id);
    setEditName(contact.name || '');
    setEditPhone(contact.phoneNumber || '');
  };

  const handleCancelEdit = () => {
    setEditingContactId(null);
    setEditName('');
    setEditPhone('');
  };

  const handleSaveEdit = (contactId: string) => {
    const trimmedPhone = editPhone.trim();
    if (!trimmedPhone) {
      setStatusMessage({
        type: 'error',
        text: 'Phone number cannot be empty.'
      });
      return;
    }
    const cleanDigits = trimmedPhone.replace(/\D/g, '');
    if (cleanDigits.length < 5) {
      setStatusMessage({
        type: 'error',
        text: 'Please enter a valid phone number.'
      });
      return;
    }

    const formattedPhone = trimmedPhone.startsWith('+')
      ? trimmedPhone
      : cleanDigits.length === 10
      ? `+91${cleanDigits}`
      : `+${cleanDigits}`;

    const finalName = editName.trim() || `Customer (${cleanDigits.slice(-4)})`;

    const updated = contacts.map(c => {
      if (c.id === contactId) {
        return {
          ...c,
          name: finalName,
          phoneNumber: formattedPhone
        };
      }
      return c;
    });

    onContactsChange(updated);
    setEditingContactId(null);
    setEditName('');
    setEditPhone('');
    setStatusMessage({
      type: 'success',
      text: `✓ Updated "${finalName}" successfully.`
    });
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleDeleteContact = (contact: WebContact) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove "${contact.name}" (${contact.phoneNumber}) from your customer list?`
    );
    if (!confirmed) return;

    const updated = contacts.filter(c => c.id !== contact.id);
    onContactsChange(updated);
    if (editingContactId === contact.id) {
      setEditingContactId(null);
      setEditName('');
      setEditPhone('');
    }
    setStatusMessage({
      type: 'success',
      text: `✓ Removed "${contact.name}" from customer list.`
    });
    setTimeout(() => setStatusMessage(null), 3500);
  };

  // Requirement 1: Take Image with backside camera on phones
  const handleTakeImageClick = () => {
    // Detect mobile browser / phone screen
    const isMobileDevice =
      typeof window !== 'undefined' &&
      (/android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent) ||
        ('ontouchstart' in window && window.innerWidth < 1024));

    if (isMobileDevice && mobileCameraInputRef.current) {
      // Trigger native phone camera with capture="environment" (backside camera)
      mobileCameraInputRef.current.click();
    } else {
      // On desktop / PC, start camera stream with ideal environment facing mode
      startDesktopCamera();
    }
  };

  // Image Upload Handler with Canvas Compression
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      setStatusMessage({ type: 'error', text: 'Image file must be under 25MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = evt => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 1600;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          const approxBytes = Math.round((compressedDataUrl.length - 22) * 0.75);
          setAttachedImage({
            name: file.name || `invoice_snap_${Date.now()}.jpg`,
            type: 'image/jpeg',
            size: approxBytes,
            dataUrl: compressedDataUrl
          });
        }
      };
      img.src = evt.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Desktop Webcam Stream fallback
  const startDesktopCamera = async () => {
    setCameraLoading(true);
    setStatusMessage(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        mobileCameraInputRef.current?.click();
        setCameraLoading(false);
        return;
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false
      });
      streamRef.current = stream;
      setIsDesktopCameraActive(true);

      setTimeout(() => {
        if (videoRef.current && streamRef.current) {
          videoRef.current.srcObject = streamRef.current;
          videoRef.current.play().catch(() => {});
        }
      }, 100);
    } catch (err: any) {
      console.warn('getUserMedia error, using capture input:', err);
      mobileCameraInputRef.current?.click();
    } finally {
      setCameraLoading(false);
    }
  };

  const stopDesktopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setIsDesktopCameraActive(false);
  };

  const captureDesktopPhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      const approxBytes = Math.round((dataUrl.length - 22) * 0.75);
      setAttachedImage({
        name: `invoice_camera_${Date.now()}.jpg`,
        type: 'image/jpeg',
        size: approxBytes,
        dataUrl
      });
    }
    stopDesktopCamera();
  };

  // Automatically save customer details into contacts without duplicate
  const autoSaveCustomer = (digits: string, name: string) => {
    const cleanDigits = digits.replace(/\D/g, '');
    if (!cleanDigits) return;

    // Check duplicate
    const alreadyExists = contacts.some(c => {
      const cDigits = c.phoneNumber.replace(/\D/g, '');
      return cDigits === cleanDigits || (cleanDigits.length >= 10 && cDigits.endsWith(cleanDigits.slice(-10)));
    });

    if (!alreadyExists) {
      const formattedPhone = cleanDigits.length === 10 ? `+91${cleanDigits}` : `+${cleanDigits}`;
      const newContact: WebContact = {
        id: `c_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: name.trim() || `Customer (${cleanDigits})`,
        phoneNumber: formattedPhone,
        status: 'PENDING'
      };
      const updated = [...contacts, newContact];
      onContactsChange(updated);
      if (currentUser?.username) {
        try {
          localStorage.setItem(`toolnest_wa_contacts_${currentUser.username.toLowerCase()}`, JSON.stringify(updated));
        } catch (_) {}
      }
    }
  };

  // Save invoice record to MongoDB database
  const saveInvoiceToDb = async (status: 'SENT' | 'SAVED') => {
    const cleanDigits = customerPhone.replace(/\D/g, '');
    const normalizedPhone = cleanDigits.length === 10 ? `91${cleanDigits}` : cleanDigits;

    try {
      const dbRes = await fetch('/api/whatsapp/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: currentUser?.username,
          customerName: customerName.trim() || 'Valued Customer',
          customerPhone: normalizedPhone,
          amount: amount ? Number(amount) : undefined,
          message: message.trim(),
          status
        })
      });

      const dbData = await dbRes.json().catch(() => ({}));
      if (dbData.success && dbData.invoice) {
        setPastInvoices(prev => [dbData.invoice, ...prev]);
      }
    } catch (err) {
      console.error('Failed to store invoice record in database:', err);
    }
  };

  // Main Submit Handler (Send or Save)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanDigits = customerPhone.replace(/\D/g, '');
    if (!cleanDigits || cleanDigits.length < 8) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid customer phone number (at least 8 digits).' });
      return;
    }

    const finalCustomerName = customerName.trim() || 'Valued Customer';
    let finalMessage = message.trim();
    if (finalCustomerName) {
      finalMessage = finalMessage.replace(/\{name\}|\{\{name\}\}/gi, finalCustomerName);
    }
    if (amount.trim() && !finalMessage.includes(amount.trim())) {
      finalMessage += `\nTotal Amount: ₹${amount.trim()}`;
    }

    // Requirement 3: If Send Message is checked but WhatsApp is not connected,
    // DO NOT show ugly banner on top! Just show clean popup dialog.
    if (isSendMessage && !session.connected) {
      setIsConnectPopupOpen(true);
      return;
    }

    setIsSending(true);
    setStatusMessage(null);

    // Case 1: Send Message is checked -> send via WhatsApp system & save invoice
    if (isSendMessage) {
      if (!finalMessage) {
        setIsSending(false);
        setStatusMessage({ type: 'error', text: 'Invoice message cannot be empty.' });
        return;
      }

      const normalizedPhone = cleanDigits.length === 10 ? `91${cleanDigits}` : cleanDigits;
      const payload: any = {
        to: normalizedPhone,
        text: finalMessage,
        isInvoice: true
      };

      if (attachedImage) {
        payload.mediaBase64 = attachedImage.dataUrl.split(',')[1];
        payload.mediaMimeType = attachedImage.type;
        payload.fileName = attachedImage.name;
        payload.isImage = true;
      }

      let sendSuccess = false;
      let failureReason = '';

      try {
        const savedWorkerUrl = typeof window !== 'undefined' ? localStorage.getItem('toolnest_wa_worker_url') || '' : '';
        const requestHeaders: Record<string, string> = {
          'Content-Type': 'application/json',
          'x-user-id': effectiveUserId,
          'x-is-invoice': 'true'
        };
        if (savedWorkerUrl) requestHeaders['x-worker-url'] = savedWorkerUrl;

        const res = await fetch('/api/whatsapp-service/send', {
          method: 'POST',
          headers: requestHeaders,
          body: JSON.stringify(payload)
        });

        const data = await res.json().catch(() => ({}));
        if (res.ok && data.success) {
          sendSuccess = true;
        } else {
          failureReason = data.error || 'Failed to dispatch message via WhatsApp system.';
        }
      } catch (err: any) {
        failureReason = err.message || 'Network error communicating with WhatsApp service.';
      }

      if (!sendSuccess) {
        setIsSending(false);
        // If worker says not connected, show connect popup directly
        if (failureReason.toLowerCase().includes('not connected') || failureReason.toLowerCase().includes('offline')) {
          setIsConnectPopupOpen(true);
        } else {
          setStatusMessage({
            type: 'error',
            text: failureReason || 'Failed to send WhatsApp message. Please check your connection.'
          });
        }
        return;
      }

      // Save invoice to database (status SENT)
      await saveInvoiceToDb('SENT');

      // Automatically add customer without duplicates
      autoSaveCustomer(cleanDigits, finalCustomerName);

      setStatusMessage({
        type: 'success',
        text: `✓ Invoice sent to ${finalCustomerName} (+${normalizedPhone}) & saved successfully!`
      });

      clearFormAndDraft();
      setIsSending(false);
    } else {
      // Case 2: Send Message is UNCHECKED -> only save invoice & customer details
      await saveInvoiceToDb('SAVED');
      autoSaveCustomer(cleanDigits, finalCustomerName);

      setStatusMessage({
        type: 'success',
        text: `✓ Invoice and customer details for ${finalCustomerName} saved successfully!`
      });

      clearFormAndDraft();
      setIsSending(false);
    }
  };

  const handleTriggerConnect = () => {
    // Explicitly guarantee user inputs are saved before closing to connect WhatsApp
    try {
      localStorage.setItem(
        `toolnest_invoice_draft_${effectiveUserId}`,
        JSON.stringify({
          customerPhone,
          customerName,
          amount,
          message,
          attachedImage,
          isSendMessage
        })
      );
    } catch (_) {}

    setIsConnectPopupOpen(false);
    stopDesktopCamera();
    onClose();
    if (onOpenConnect) {
      onOpenConnect();
    } else {
      const el = document.getElementById('step-1-connect');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const filteredContacts = contacts.filter(c => {
    if (!contactSearchFilter.trim()) return true;
    const term = contactSearchFilter.toLowerCase();
    const phoneDigits = c.phoneNumber.replace(/\D/g, '');
    const termDigits = term.replace(/\D/g, '');
    return (
      c.name.toLowerCase().includes(term) ||
      (termDigits && phoneDigits.includes(termDigits))
    );
  });

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Send Customer Invoice Modal"
    >
      {/* Hidden File & Camera Input Pickers */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageFileChange}
        className="hidden"
      />
      {/* Requirement 1: Backside camera capture input on phone devices */}
      <input
        ref={mobileCameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleImageFileChange}
        className="hidden"
      />

      {/* Main Modal Dialog: Full-screen on mobile for 100% thumb-friendly ergonomics, rounded popup on desktop */}
      <div className="relative w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-lg bg-white dark:bg-[#0f121a] sm:rounded-3xl border-0 sm:border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Top Header (Styled with exact #5722AF theme) */}
        <div className="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-3 shrink-0 bg-zinc-50/70 dark:bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#5722AF] to-[#7B45D1] flex items-center justify-center text-white shadow-md shadow-[#5722AF]/25 shrink-0">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-zinc-900 dark:text-white leading-tight">
                  Send Invoice
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#5722AF]/10 text-[#5722AF] dark:bg-[#5722AF]/25 dark:text-purple-300">
                  {storeName}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Direct WhatsApp billing & customer management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {(customerPhone || customerName || amount || attachedImage) && (
              <button
                type="button"
                onClick={clearFormAndDraft}
                className="text-[11px] font-semibold text-zinc-400 hover:text-rose-600 transition px-2 py-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                title="Clear current draft and start fresh"
              >
                Clear Form
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                stopDesktopCamera();
                onClose();
              }}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
              aria-label="Close invoice popup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher: Compose Invoice vs Customer List vs Past Invoices */}
        <div className="flex items-center border-b border-zinc-100 dark:border-zinc-800 px-3 sm:px-6 bg-zinc-50/30 dark:bg-zinc-900/30 shrink-0 overflow-x-auto scrollbar-none gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => {
              stopDesktopCamera();
              setEditingContactId(null);
              setActiveTab('create');
            }}
            className={`py-3 px-2.5 sm:px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'create'
                ? 'border-[#5722AF] text-[#5722AF] dark:text-purple-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Compose</span>
          </button>

          <button
            type="button"
            onClick={() => {
              stopDesktopCamera();
              setActiveTab('contacts');
            }}
            className={`py-3 px-2.5 sm:px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'contacts'
                ? 'border-[#5722AF] text-[#5722AF] dark:text-purple-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Customer List ({contacts.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              stopDesktopCamera();
              setEditingContactId(null);
              setActiveTab('history');
              fetchPastInvoices();
            }}
            className={`py-3 px-2.5 sm:px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'history'
                ? 'border-[#5722AF] text-[#5722AF] dark:text-purple-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Past Invoices ({pastInvoices.length})</span>
          </button>
        </div>

        {/* Scrollable Form Body Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          
          {/* Status Alert Notification */}
          {statusMessage && (
            <div
              className={`p-3.5 rounded-2xl flex items-start gap-2.5 text-xs font-medium animate-in fade-in duration-200 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 border border-rose-200 dark:border-rose-800'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="leading-relaxed flex-1">{statusMessage.text}</div>
            </div>
          )}

          {activeTab === 'contacts' ? (
            /* Customer List Tab */
            <div className="space-y-3">
              {/* Search Filter & Count Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={contactSearchFilter}
                    onChange={e => setContactSearchFilter(e.target.value)}
                    placeholder="Search by customer name or phone..."
                    className="w-full pl-9 pr-8 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#5722AF]"
                  />
                  {contactSearchFilter && (
                    <button
                      type="button"
                      onClick={() => setContactSearchFilter('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-0.5 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 shrink-0 px-1">
                  {filteredContacts.length} of {contacts.length} Customers
                </span>
              </div>

              {/* Customer List Display */}
              {contacts.length === 0 ? (
                <div className="py-12 text-center space-y-2 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                  <Users className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mx-auto" />
                  <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300">No Customers in List</h4>
                  <p className="text-[11px] text-zinc-500 max-w-xs mx-auto">
                    Customers you message or add from Step 2 will appear here automatically.
                  </p>
                </div>
              ) : filteredContacts.length === 0 ? (
                <div className="py-8 text-center space-y-1 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
                  <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">No matching customers found</p>
                  <p className="text-[11px] text-zinc-400">Try searching with a different name or number</p>
                </div>
              ) : (
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900/60 shadow-xs max-h-[58vh] overflow-y-auto">
                  {filteredContacts.map(c => {
                    const isEditing = editingContactId === c.id;

                    if (isEditing) {
                      return (
                        <div
                          key={c.id}
                          className="p-3.5 bg-[#5722AF]/5 dark:bg-purple-950/20 border-l-4 border-l-[#5722AF] space-y-3 transition"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#5722AF] dark:text-purple-300 flex items-center gap-1.5">
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Edit Customer</span>
                            </span>
                            <button
                              type="button"
                              onClick={handleCancelEdit}
                              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 p-1 rounded-lg cursor-pointer transition"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                                <User className="w-3 h-3 text-[#5722AF]" />
                                <span>Customer Name</span>
                              </label>
                              <input
                                type="text"
                                value={editName}
                                onChange={e => setEditName(e.target.value)}
                                placeholder="Customer name"
                                className="w-full px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#5722AF]"
                                autoFocus
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                                <Phone className="w-3 h-3 text-[#5722AF]" />
                                <span>Phone Number</span>
                              </label>
                              <input
                                type="tel"
                                value={editPhone}
                                onChange={e => setEditPhone(e.target.value)}
                                placeholder="Phone number (e.g. +91 9876543210)"
                                className="w-full px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 font-mono placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#5722AF]"
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={handleCancelEdit}
                              className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-400 transition cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(c.id)}
                              className="px-3.5 py-1.5 rounded-xl bg-[#5722AF] hover:bg-[#481c93] text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Save Changes</span>
                            </button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={c.id}
                        className="p-3 sm:p-3.5 flex items-center justify-between gap-2.5 sm:gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition"
                      >
                        <div className="min-w-0 flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-[#5722AF]/10 dark:bg-purple-950/40 text-[#5722AF] dark:text-purple-300 flex items-center justify-center text-xs font-bold shrink-0">
                            {(c.name || 'C').charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-xs text-zinc-900 dark:text-white truncate">
                              {c.name}
                            </p>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                              {c.phoneNumber}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              handleSelectContact(c);
                              setActiveTab('create');
                            }}
                            className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-[#5722AF]/10 dark:bg-purple-950/40 hover:bg-[#5722AF] text-[#5722AF] dark:text-purple-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                            title="Select this customer for invoice"
                          >
                            <span>Use</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStartEdit(c)}
                            className="p-1.5 sm:p-2 rounded-xl text-zinc-400 hover:text-[#5722AF] dark:hover:text-purple-300 hover:bg-[#5722AF]/10 dark:hover:bg-purple-950/50 transition cursor-pointer"
                            title="Edit customer name and number"
                            aria-label={`Edit ${c.name}`}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteContact(c)}
                            className="p-1.5 sm:p-2 rounded-xl text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                            title="Delete customer from list"
                            aria-label={`Delete ${c.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : activeTab === 'create' ? (
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Requirement 3: Phone Number field FIRST with 2-digit live search */}
              <div className="space-y-1.5 relative" ref={searchContainerRef}>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#5722AF] dark:text-purple-400" />
                    <span>Customer Phone Number *</span>
                  </label>
                  {customerPhone.length >= 2 && searchResults.length > 0 && (
                    <span className="text-[10px] text-[#5722AF] dark:text-purple-300 font-semibold animate-pulse">
                      {searchResults.length} suggestion{searchResults.length > 1 ? 's' : ''} available
                    </span>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={e => handlePhoneInputChange(e.target.value)}
                    onFocus={() => {
                      if (customerPhone.length >= 2 && searchResults.length > 0) {
                        setShowSearchResults(true);
                      }
                    }}
                    placeholder="Enter phone number (e.g. 9876543210)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#5722AF] font-mono shadow-2xs"
                  />
                  {customerPhone.length >= 2 && (
                    <button
                      type="button"
                      onClick={() => {
                        setCustomerPhone('');
                        setSearchResults([]);
                        setShowSearchResults(false);
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 rounded-md"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Requirement 2: Live search dropdown starting at 2 digits */}
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-[#141824] border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-2xl z-30 max-h-52 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800 animate-in fade-in duration-150">
                    <div className="px-3.5 py-1.5 bg-zinc-50 dark:bg-zinc-900/90 text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                      <span>Matching Customers</span>
                      <span>Click to select</span>
                    </div>
                    {searchResults.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleSelectContact(c)}
                        className="w-full px-3.5 py-2.5 text-left hover:bg-purple-50/70 dark:hover:bg-purple-950/40 flex items-center justify-between gap-2 text-xs transition cursor-pointer group"
                      >
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-[#5722AF] dark:group-hover:text-purple-300 truncate">
                          {c.name}
                        </span>
                        <span className="font-mono text-zinc-500 dark:text-zinc-400 text-[11px] shrink-0">
                          {c.phoneNumber}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Customer Name Field (Second) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#5722AF] dark:text-purple-400" />
                  <span>Customer Name</span>
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar (Auto-filled if number exists)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#5722AF] shadow-2xs"
                />
              </div>

              {/* Optional Amount Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Total Amount (₹ / Optional)</span>
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="e.g. 1499"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#5722AF] font-mono shadow-2xs"
                />
              </div>

              {/* Requirement 1: Upload Image & Take Image (Backside Camera on Phones) */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/80">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <Receipt className="w-3.5 h-3.5 text-[#5722AF] dark:text-purple-400" />
                    <span>Bill / Invoice Photo (Optional)</span>
                  </span>
                  {attachedImage && (
                    <button
                      type="button"
                      onClick={() => setAttachedImage(null)}
                      className="text-[11px] font-semibold text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                {/* Desktop Webcam Live Viewfinder (if active on PC) */}
                {isDesktopCameraActive && (
                  <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-zinc-700 shadow-lg">
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      autoPlay
                      playsInline
                      muted
                    />
                    <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-2.5 z-10">
                      <button
                        type="button"
                        onClick={captureDesktopPhoto}
                        className="px-4 py-2 bg-[#5722AF] hover:bg-[#481c93] text-white rounded-xl text-xs font-bold shadow-lg flex items-center gap-1.5 cursor-pointer"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Snap Photo</span>
                      </button>
                      <button
                        type="button"
                        onClick={stopDesktopCamera}
                        className="px-3.5 py-2 bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-semibold shadow-lg cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Attached Image Preview Card */}
                {attachedImage ? (
                  <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-2xs">
                    <img
                      src={attachedImage.dataUrl}
                      alt="Invoice Attachment"
                      className="w-14 h-14 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                        {attachedImage.name}
                      </p>
                      <p className="text-[11px] text-zinc-400">
                        {Math.round(attachedImage.size / 1024)} KB &bull; Attached to invoice
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAttachedImage(null)}
                      className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg transition cursor-pointer"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : !isDesktopCameraActive ? (
                  /* Action Buttons: Take Image (Back Camera) & Upload Image */
                  <div className="grid grid-cols-2 gap-2.5 pt-0.5">
                    <button
                      type="button"
                      disabled={cameraLoading}
                      onClick={handleTakeImageClick}
                      className="py-2.5 px-3 rounded-xl border border-dashed border-emerald-300 dark:border-emerald-800/80 hover:border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      {cameraLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                      ) : (
                        <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      )}
                      <span>Take Photo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="py-2.5 px-3 rounded-xl border border-dashed border-purple-300 dark:border-purple-800/80 hover:border-[#5722AF] bg-purple-50/50 dark:bg-purple-950/20 text-xs font-semibold text-[#5722AF] dark:text-purple-300 flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      <Upload className="w-4 h-4 text-[#5722AF] dark:text-purple-400" />
                      <span>Upload Photo</span>
                    </button>
                  </div>
                ) : null}
              </div>

              {/* Editable Invoice Message */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <span>Invoice Message *</span>
                    <span className="text-[10px] font-normal text-zinc-400">(Editable)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setMessage(`Thank you for shopping with ${storeName}.`)}
                    className="text-[11px] font-semibold text-[#5722AF] dark:text-purple-400 hover:underline cursor-pointer"
                  >
                    Reset Message
                  </button>
                </div>
                <textarea
                  rows={3}
                  required={isSendMessage}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#5722AF] leading-relaxed font-sans shadow-2xs"
                  placeholder="Enter message for customer..."
                />
              </div>

              {/* Requirement 6: “Send Message” Checkbox */}
              <div className="p-3.5 rounded-2xl bg-zinc-50/80 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/80">
                <label className="flex items-center gap-2.5 text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isSendMessage}
                    onChange={e => setIsSendMessage(e.target.checked)}
                    className="w-4 h-4 rounded text-[#5722AF] focus:ring-[#5722AF] cursor-pointer"
                  />
                  <span>Send WhatsApp Message to Customer</span>
                </label>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 pl-6">
                  {isSendMessage
                    ? 'Dispatches directly via WhatsApp & auto-saves customer to your list.'
                    : 'Only saves invoice & customer details. No WhatsApp message will be sent.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    stopDesktopCamera();
                    onClose();
                  }}
                  className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-400 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSending}
                  className="px-5 py-2.5 rounded-xl bg-[#5722AF] hover:bg-[#481c93] disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-[#5722AF]/20 transition cursor-pointer"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isSendMessage ? 'Sending...' : 'Saving...'}</span>
                    </>
                  ) : isSendMessage ? (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Invoice</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Invoice</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Requirement 2: Past Invoices shows ONLY Customer Name and Phone Number */
            <div className="space-y-3">
              {isLoadingHistory ? (
                <div className="py-12 text-center space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin text-[#5722AF] mx-auto" />
                  <p className="text-xs text-zinc-500">Loading stored customer invoices...</p>
                </div>
              ) : pastInvoices.length === 0 ? (
                <div className="py-12 text-center space-y-2 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                  <Receipt className="w-8 h-8 text-zinc-400 mx-auto" />
                  <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300">No Invoices Saved Yet</h4>
                  <p className="text-[11px] text-zinc-500">
                    Invoices created for customers will appear here.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900/60 shadow-xs">
                  {pastInvoices.map((inv, idx) => {
                    const phoneDisplay = inv.customerPhone
                      ? inv.customerPhone.startsWith('+')
                        ? inv.customerPhone
                        : `+${inv.customerPhone}`
                      : '';
                    return (
                      <div
                        key={inv._id || idx}
                        className="p-3.5 flex items-center justify-between gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition"
                      >
                        <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 truncate">
                          {inv.customerName}
                        </span>
                        <span className="text-xs text-zinc-600 dark:text-zinc-400 font-mono shrink-0">
                          {phoneDisplay}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Requirement 3: Clean Popup Modal when WhatsApp is not connected */}
      {isConnectPopupOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-[#0f121a] rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-[#5722AF]/10 dark:bg-purple-950/50 text-[#5722AF] dark:text-purple-300 flex items-center justify-center mx-auto">
              <WifiOff className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h4 className="text-base font-extrabold text-zinc-900 dark:text-white">
                WhatsApp Not Connected
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                To send messages directly to your customers, please connect your WhatsApp account in Step 1.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleTriggerConnect}
                className="w-full py-2.5 bg-[#5722AF] hover:bg-[#481c93] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#5722AF]/25"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Connect WhatsApp Now</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  setIsConnectPopupOpen(false);
                  await saveInvoiceToDb('SAVED');
                  autoSaveCustomer(customerPhone, customerName);
                  setStatusMessage({
                    type: 'success',
                    text: `✓ Invoice for ${customerName || customerPhone} saved without sending message.`
                  });
                  setCustomerPhone('');
                  setCustomerName('');
                  setAmount('');
                  setAttachedImage(null);
                }}
                className="w-full py-2 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Save Invoice Only (Without Sending)
              </button>

              <button
                type="button"
                onClick={() => setIsConnectPopupOpen(false)}
                className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition py-1 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
