'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Send,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  RefreshCw,
  LogOut,
  Building,
  Phone,
  Lock,
  User,
  Calendar,
  Layers,
  ChevronRight,
  ShieldCheck,
  Eye,
  KeyRound,
  FileText,
  X,
  Radio,
  ExternalLink,
  Server,
  Globe,
  Wifi,
  WifiOff,
  Loader2,
  Check,
  Zap,
  Copy
} from 'lucide-react';

interface ManagedUser {
  id: string;
  businessName: string;
  username: string;
  phoneNumber: string;
  status: 'active' | 'inactive';
  createdAt: string;
  campaignsCount: number;
  successfulMessages: number;
  failedMessages: number;
}

interface CampaignItem {
  id: string;
  username: string;
  businessName: string;
  campaignName: string;
  template: string;
  totalContacts: number;
  successfulMessages: number;
  failedMessages: number;
  status: string;
  createdAt: string;
  logsCount: number;
  logs: any[];
}

interface WhatsAppAdminDashboardProps {
  onLogout: () => void;
  onOpenSenderStudio: () => void;
}

export const WhatsAppAdminDashboard: React.FC<WhatsAppAdminDashboardProps> = ({
  onLogout,
  onOpenSenderStudio
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'campaigns'>('users');
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [campaignSummary, setCampaignSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUserFilter, setSelectedUserFilter] = useState<string>('all');

  // Worker Gateway Management State
  const [gatewayUrl, setGatewayUrl] = useState<string>('');
  const [gatewayInput, setGatewayInput] = useState<string>('');
  const [isGatewayOnline, setIsGatewayOnline] = useState<boolean>(false);
  const [gatewayPingMs, setGatewayPingMs] = useState<number | null>(null);
  const [isSavingGateway, setIsSavingGateway] = useState<boolean>(false);
  const [isGeneratingTunnel, setIsGeneratingTunnel] = useState<boolean>(false);
  const [copiedTunnelUrl, setCopiedTunnelUrl] = useState<boolean>(false);
  const [gatewayStatusMessage, setGatewayStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Create User Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newBusinessName, setNewBusinessName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // View Campaign Logs Modal
  const [viewingCampaignLogs, setViewingCampaignLogs] = useState<CampaignItem | null>(null);

  // Password Reset Modal
  const [resetTargetUser, setResetTargetUser] = useState<ManagedUser | null>(null);
  const [resetPasswordValue, setResetPasswordValue] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const fetchGatewayInfo = async () => {
    try {
      const res = await fetch('/api/admin/gateway');
      const data = await res.json();
      if (data.success) {
        setGatewayUrl(data.gatewayUrl || '');
        setGatewayInput(data.gatewayUrl || data.activeUrl || '');
        setIsGatewayOnline(data.isOnline ?? false);
        setGatewayPingMs(data.pingMs ?? null);
      }
    } catch (err) {
      console.error('Failed to fetch gateway info:', err);
    }
  };

  const handleSaveGateway = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!gatewayInput.trim()) return;

    setIsSavingGateway(true);
    setGatewayStatusMessage(null);
    try {
      const res = await fetch('/api/admin/gateway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gatewayUrl: gatewayInput.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setGatewayUrl(data.gatewayUrl);
        setIsGatewayOnline(data.isOnline ?? false);
        setGatewayPingMs(data.pingMs ?? null);
        setGatewayStatusMessage({
          type: data.isOnline ? 'success' : 'error',
          text: data.message
        });
      } else {
        setGatewayStatusMessage({
          type: 'error',
          text: data.error || 'Failed to save gateway URL'
        });
      }
    } catch (err: any) {
      setGatewayStatusMessage({
        type: 'error',
        text: err.message || 'Network error saving gateway'
      });
    } finally {
      setIsSavingGateway(false);
    }
  };

  const handleResetGateway = async () => {
    if (!window.confirm('Reset Worker Gateway URL back to default local address?')) return;
    try {
      await fetch('/api/admin/gateway', { method: 'DELETE' });
      await fetchGatewayInfo();
      setGatewayStatusMessage({
        type: 'success',
        text: 'Worker Gateway URL reset to default.'
      });
    } catch (err) {
      alert('Error resetting gateway.');
    }
  };

  const handleGenerateTunnel = async () => {
    setIsGeneratingTunnel(true);
    setGatewayStatusMessage(null);
    try {
      // Step 1: Request tunnel generation via Admin API route
      let generatedUrl = '';
      try {
        const res = await fetch('/api/admin/gateway/tunnel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ force: false, autoSave: false })
        });
        const data = await res.json();
        if (data.success && data.url) {
          generatedUrl = data.url;
        }
      } catch {}

      // Step 2: If API route didn't succeed (e.g. running on cloud without local network proxy), try direct worker call
      if (!generatedUrl) {
        try {
          const directRes = await fetch('http://localhost:5001/tunnel/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ force: false })
          });
          const directData = await directRes.json();
          if (directData.success && directData.url) {
            generatedUrl = directData.url;
          }
        } catch {}
      }

      if (generatedUrl) {
        setGatewayInput(generatedUrl);
        setGatewayStatusMessage({
          type: 'success',
          text: `⚡ Live Cloudflare Tunnel Generated: ${generatedUrl}. Click "Test & Set Gateway URL" to activate it for all users!`
        });
      } else {
        setGatewayStatusMessage({
          type: 'error',
          text: 'Unable to start Cloudflare tunnel. Please ensure `npm run whatsapp:worker` is running locally on your computer.'
        });
      }
    } catch (err: any) {
      setGatewayStatusMessage({
        type: 'error',
        text: err.message || 'Error communicating with worker tunnel service.'
      });
    } finally {
      setIsGeneratingTunnel(false);
    }
  };

  const handleCopyGatewayUrl = (urlToCopy?: string) => {
    const text = urlToCopy || gatewayInput || gatewayUrl;
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedTunnelUrl(true);
    setTimeout(() => setCopiedTunnelUrl(false), 2500);
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const fetchCampaigns = async (filterUser?: string) => {
    try {
      let url = '/api/admin/campaigns';
      if (filterUser && filterUser !== 'all') {
        url += `?username=${encodeURIComponent(filterUser)}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setCampaigns(data.campaigns || []);
        setCampaignSummary(data.summary || null);
      }
    } catch (err) {
      console.error('Failed to fetch campaigns:', err);
    }
  };

  const loadAllData = async () => {
    setIsLoading(true);
    await Promise.all([fetchUsers(), fetchCampaigns(selectedUserFilter), fetchGatewayInfo()]);
    setIsLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleFilterChange = (username: string) => {
    setSelectedUserFilter(username);
    fetchCampaigns(username);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    setCreateSuccess('');

    if (!newBusinessName.trim() || !newUsername.trim() || !newPassword.trim() || !newPhoneNumber.trim()) {
      setCreateError('All fields (Business Name, Username, Password, Phone Number) are required.');
      return;
    }

    setIsCreating(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: newBusinessName.trim(),
          username: newUsername.trim(),
          password: newPassword.trim(),
          phoneNumber: newPhoneNumber.trim()
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create user.');
      }

      setCreateSuccess(`User "${newUsername}" created successfully!`);
      setNewBusinessName('');
      setNewUsername('');
      setNewPassword('');
      setNewPhoneNumber('');
      await fetchUsers();
      setTimeout(() => {
        setIsCreateModalOpen(false);
        setCreateSuccess('');
      }, 1000);
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create user');
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleStatus = async (user: ManagedUser) => {
    const nextStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          status: nextStatus
        })
      });
      const data = await res.json();
      if (data.success) {
        setUsers(prev => prev.map(u => (u.id === user.id ? { ...u, status: nextStatus } : u)));
      }
    } catch (err) {
      alert('Error updating user status.');
    }
  };

  const handleDeleteUser = async (user: ManagedUser) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete user "${user.username}" (${user.businessName})?\n\nThis will also delete their past campaign records in MongoDB.`
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/users?id=${user.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setUsers(prev => prev.filter(u => u.id !== user.id));
        fetchCampaigns(selectedUserFilter);
      } else {
        alert(data.error || 'Failed to delete user.');
      }
    } catch (err) {
      alert('Network error while deleting user.');
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTargetUser || !resetPasswordValue.trim()) return;

    setIsResetting(true);
    setResetMessage('');
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: resetTargetUser.id,
          password: resetPasswordValue.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setResetMessage('Password updated successfully!');
        setTimeout(() => {
          setResetTargetUser(null);
          setResetPasswordValue('');
          setResetMessage('');
        }, 1200);
      } else {
        setResetMessage(data.error || 'Failed to reset password.');
      }
    } catch (err: any) {
      setResetMessage(err.message || 'Error updating password.');
    } finally {
      setIsResetting(false);
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    if (!window.confirm('Delete this campaign record?')) return;
    try {
      const res = await fetch(`/api/admin/campaigns?id=${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setCampaigns(prev => prev.filter(c => c.id !== id));
        fetchUsers();
      }
    } catch (err) {
      alert('Error deleting campaign record.');
    }
  };

  const handleDeleteAllCampaigns = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete ALL recorded campaigns and results from the database?\n\nThis will reset the campaign count to 0. This action cannot be undone.'
    );
    if (!confirmed) return;

    try {
      const res = await fetch('/api/admin/campaigns?all=true', {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setCampaigns([]);
        setCampaignSummary({
          totalCampaigns: 0,
          totalContacts: 0,
          totalSuccessful: 0,
          totalFailed: 0,
          deliveryRate: '100'
        });
        await fetchUsers();
      } else {
        alert(data.error || 'Failed to delete campaigns.');
      }
    } catch (err) {
      alert('Error clearing campaigns.');
    }
  };

  // Aggregated totals across all users
  const totalUsers = users.length;
  const totalCampaigns = campaigns.length;
  const totalSuccessful = campaigns.reduce((acc, c) => acc + (c.successfulMessages || 0), 0);
  const totalFailed = campaigns.reduce((acc, c) => acc + (c.failedMessages || 0), 0);
  const totalDispatched = totalSuccessful + totalFailed;
  const overallRate = totalDispatched > 0 ? ((totalSuccessful / totalDispatched) * 100).toFixed(1) : '100';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Admin Navigation Header */}
      <div className="p-5 sm:p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#5722AF] text-white flex items-center justify-center shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Admin Control Center</h2>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 rounded-full">
                Master Admin
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Manage user accounts, monitor bulk marketing campaigns, and review delivery metrics
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={loadAllData}
            title="Refresh statistics from MongoDB"
            className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700/60 text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={onOpenSenderStudio}
            className="px-4 py-2.5 rounded-xl bg-[#5722AF] hover:bg-[#471b92] text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Open Bulk Sender Studio</span>
          </button>

          <button
            onClick={onLogout}
            className="px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Global Worker Gateway Configuration Card */}
      <div className="p-5 sm:p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">Global WhatsApp Worker Gateway</h3>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    isGatewayOnline
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isGatewayOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                  {isGatewayOnline ? `Worker Online (${gatewayPingMs ?? 0}ms)` : 'Worker Offline'}
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                All client users will automatically connect through this gateway. Each user retains an isolated WhatsApp session.
              </p>
            </div>
          </div>

          {gatewayUrl && (
            <button
              onClick={handleResetGateway}
              className="self-start md:self-auto text-xs text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
            >
              Reset to Local Default
            </button>
          )}
        </div>

        {gatewayStatusMessage && (
          <div
            className={`p-3 rounded-xl text-xs flex items-start gap-2 animate-in fade-in duration-200 ${
              gatewayStatusMessage.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300'
            }`}
          >
            {gatewayStatusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            )}
            <span>{gatewayStatusMessage.text}</span>
          </div>
        )}

        {/* Quick Actions: Auto-Generate Cloudflare Tunnel & Copy */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleGenerateTunnel}
            disabled={isGeneratingTunnel}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-semibold shadow-2xs transition cursor-pointer disabled:opacity-60"
            title="Auto-generate or refresh a live Cloudflare Tunnel from your local computer"
          >
            {isGeneratingTunnel ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                <span>Generating Cloudflare Tunnel...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>⚡ Auto-Generate Tunnel URL</span>
              </>
            )}
          </button>

          {gatewayInput && (
            <button
              type="button"
              onClick={() => handleCopyGatewayUrl(gatewayInput)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-medium transition cursor-pointer"
              title="Copy URL to clipboard"
            >
              {copiedTunnelUrl ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Copy URL</span>
                </>
              )}
            </button>
          )}

          <span className="text-[11px] text-zinc-400 dark:text-zinc-500 ml-auto hidden sm:inline">
            Requires local worker running on your PC
          </span>
        </div>

        <form onSubmit={handleSaveGateway} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
              <Globe className="w-4 h-4" />
            </div>
            <input
              type="url"
              required
              value={gatewayInput}
              onChange={e => setGatewayInput(e.target.value)}
              placeholder="e.g. https://your-tunnel.trycloudflare.com or https://gateway.yourdomain.com"
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs sm:text-sm font-mono text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-[#5722AF]/30 focus:border-[#5722AF] transition"
            />
          </div>

          <button
            type="submit"
            disabled={isSavingGateway || !gatewayInput.trim()}
            className="px-5 py-2.5 rounded-xl bg-[#5722AF] hover:bg-[#471b92] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {isSavingGateway ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Testing &amp; Saving...</span>
              </>
            ) : (
              <>
                <Wifi className="w-4 h-4" />
                <span>Test &amp; Set Gateway URL</span>
              </>
            )}
          </button>
        </form>

        {gatewayUrl && (
          <div className="flex items-center flex-wrap gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/50 p-2.5 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60">
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">Active Global Gateway:</span>
            <code className="font-mono text-[#5722AF] dark:text-purple-300">{gatewayUrl}</code>
            <button
              type="button"
              onClick={() => handleCopyGatewayUrl(gatewayUrl)}
              className="inline-flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 cursor-pointer ml-1"
              title="Copy Active Gateway URL"
            >
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </button>
            <a
              href={`${gatewayUrl}/status`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto inline-flex items-center gap-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <span>Test Status Endpoint</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>

      {/* KPI Metric Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Metric 1: Total Users */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Registered Users</span>
            <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-white">{totalUsers}</div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">Active client portals</p>
        </div>

        {/* Metric 2: Total Campaigns */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Total Campaigns</span>
            <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-white">{totalCampaigns}</div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">Dispatched across all users</p>
        </div>

        {/* Metric 3: Successful Messages */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Delivered Messages</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{totalSuccessful}</div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">Successfully sent</p>
        </div>

        {/* Metric 4: Failed Messages */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Failed Messages</span>
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">{totalFailed}</div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">Failed delivery</p>
        </div>

        {/* Metric 5: Success Delivery Rate */}
        <div className="col-span-2 lg:col-span-1 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium">Delivery Rate</span>
            <Radio className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-white">{overallRate}%</div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">Overall delivery success</p>
        </div>
      </div>

      {/* Main Tab Navigation & Actions */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Tab Switcher */}
          <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'users'
                  ? 'bg-white dark:bg-zinc-900 text-[#5722AF] dark:text-purple-300 shadow-2xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>User Accounts ({users.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('campaigns')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'campaigns'
                  ? 'bg-white dark:bg-zinc-900 text-[#5722AF] dark:text-purple-300 shadow-2xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Campaigns &amp; Results ({campaigns.length})</span>
            </button>
          </div>

          {/* Right Action: Create User Modal trigger */}
          {activeTab === 'users' && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-2xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New User</span>
            </button>
          )}

          {activeTab === 'campaigns' && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">Filter:</span>
                <select
                  value={selectedUserFilter}
                  onChange={e => handleFilterChange(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-medium text-zinc-900 dark:text-white focus:outline-hidden"
                >
                  <option value="all">All Users ({users.length})</option>
                  {users.map(u => (
                    <option key={u.id} value={u.username}>
                      {u.businessName} (@{u.username})
                    </option>
                  ))}
                </select>
              </div>

              {campaigns.length > 0 && (
                <button
                  onClick={handleDeleteAllCampaigns}
                  title="Delete all recorded campaigns from database"
                  className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete All Campaigns</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Tab 1: User Accounts Table */}
        {activeTab === 'users' && (
          <div className="overflow-x-auto">
            {users.length === 0 ? (
              <div className="text-center py-16 px-4">
                <Users className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">No Users Created Yet</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mt-1 mb-4">
                  Create your first user account so your clients or team members can log in and dispatch campaigns.
                </p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create First User</span>
                </button>
              </div>
            ) : (
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-zinc-50/70 dark:bg-zinc-800/40 text-zinc-500 dark:text-zinc-400 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-4 py-3">Business &amp; Username</th>
                    <th className="px-4 py-3">Phone Number</th>
                    <th className="px-4 py-3">Date Created</th>
                    <th className="px-4 py-3 text-center">Campaigns</th>
                    <th className="px-4 py-3 text-center">Sent / Failed</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-800 dark:text-zinc-200">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-zinc-900 dark:text-white flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{u.businessName}</span>
                        </div>
                        <div className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">@{u.username}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-300">
                          <Phone className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{u.phoneNumber}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                        {new Date(u.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
                          {u.campaignsCount}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{u.successfulMessages}</span>
                        <span className="text-zinc-400 mx-1">/</span>
                        <span className="font-semibold text-rose-600 dark:text-rose-400">{u.failedMessages}</span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition cursor-pointer ${
                            u.status === 'active'
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border border-zinc-300 dark:border-zinc-700'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'active' ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
                          <span className="capitalize">{u.status}</span>
                        </button>
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap space-x-1">
                        <button
                          onClick={() => {
                            setActiveTab('campaigns');
                            handleFilterChange(u.username);
                          }}
                          title="View user campaigns"
                          className="p-1.5 text-zinc-500 hover:text-[#5722AF] dark:hover:text-purple-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setResetTargetUser(u);
                            setResetPasswordValue('');
                            setResetMessage('');
                          }}
                          title="Reset Password"
                          className="p-1.5 text-zinc-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u)}
                          title="Delete user"
                          className="p-1.5 text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 2: Campaigns & Results Table */}
        {activeTab === 'campaigns' && (
          <div className="overflow-x-auto">
            {campaigns.length === 0 ? (
              <div className="text-center py-16 px-4">
                <Layers className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">No Campaigns Recorded Yet</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mt-1">
                  Campaign runs executed by users or administrators will automatically record here in MongoDB Atlas with complete message logs and success/failure statistics.
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-zinc-50/70 dark:bg-zinc-800/40 text-zinc-500 dark:text-zinc-400 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-4 py-3">User &amp; Business</th>
                    <th className="px-4 py-3">Campaign Name</th>
                    <th className="px-4 py-3">Date Dispatched</th>
                    <th className="px-4 py-3 text-center">Contacts</th>
                    <th className="px-4 py-3 text-center">Successful</th>
                    <th className="px-4 py-3 text-center">Failed</th>
                    <th className="px-4 py-3 text-center">Success Rate</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-800 dark:text-zinc-200">
                  {campaigns.map(c => {
                    const rate = c.totalContacts > 0 ? Math.round((c.successfulMessages / c.totalContacts) * 100) : 100;
                    return (
                      <tr key={c.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-zinc-900 dark:text-white">{c.businessName}</div>
                          <div className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">@{c.username}</div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-medium text-zinc-800 dark:text-zinc-200">{c.campaignName}</div>
                          <div className="text-[11px] text-zinc-400 truncate max-w-xs">{c.template}</div>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                          {new Date(c.createdAt).toLocaleString(undefined, {
                            dateStyle: 'short',
                            timeStyle: 'short'
                          })}
                        </td>
                        <td className="px-4 py-3.5 text-center font-bold">{c.totalContacts}</td>
                        <td className="px-4 py-3.5 text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                            <CheckCircle2 className="w-3 h-3" />
                            {c.successfulMessages}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                            c.failedMessages > 0
                              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                          }`}>
                            {c.failedMessages > 0 && <AlertCircle className="w-3 h-3" />}
                            {c.failedMessages}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className="font-bold text-xs">{rate}%</span>
                        </td>
                        <td className="px-4 py-3.5 text-right whitespace-nowrap space-x-1">
                          <button
                            onClick={() => setViewingCampaignLogs(c)}
                            title="View message logs"
                            className="px-2.5 py-1.5 text-xs font-semibold text-[#5722AF] dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded-lg transition inline-flex items-center gap-1 cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Logs ({c.logsCount || (c.logs && c.logs.length) || 0})</span>
                          </button>
                          <button
                            onClick={() => handleDeleteCampaign(c.id)}
                            title="Delete campaign"
                            className="p-1.5 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Modal: Create User */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white">Create New User</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Provision a new client account</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{createError}</span>
              </div>
            )}

            {createSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-700 dark:text-emerald-300 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{createSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Business Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                    <Building className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={newBusinessName}
                    onChange={e => setNewBusinessName(e.target.value)}
                    placeholder="e.g. Apex Marketing Solutions"
                    className="w-full pl-9 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={newUsername}
                    onChange={e => setNewUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                    placeholder="e.g. apex_user"
                    className="w-full pl-9 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs sm:text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-9 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={newPhoneNumber}
                    onChange={e => setNewPhoneNumber(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full pl-9 pr-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {isCreating ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Detailed Campaign Logs */}
      {viewingCampaignLogs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                  Campaign Message Logs
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {viewingCampaignLogs.businessName} (@{viewingCampaignLogs.username}) &bull;{' '}
                  {viewingCampaignLogs.successfulMessages} Sent, {viewingCampaignLogs.failedMessages} Failed
                </p>
              </div>
              <button
                onClick={() => setViewingCampaignLogs(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
              {(!viewingCampaignLogs.logs || viewingCampaignLogs.logs.length === 0) ? (
                <div className="text-center py-10 text-zinc-400">No individual recipient logs recorded for this campaign.</div>
              ) : (
                viewingCampaignLogs.logs.map((log: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 flex items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <div className="font-semibold text-zinc-800 dark:text-zinc-200">
                        {log.contactName || 'Contact'} ({log.phoneNumber})
                      </div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        {log.timestamp} {log.error ? `• Error: ${log.error}` : ''}
                      </div>
                    </div>
                    <div>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          log.status === 'SENT'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {log.status === 'SENT' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        {log.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Reset Password */}
      {resetTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white">Reset Password</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    User: @{resetTargetUser.username}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setResetTargetUser(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {resetMessage && (
              <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 text-xs text-purple-700 dark:text-purple-300">
                {resetMessage}
              </div>
            )}

            <form onSubmit={handleResetPasswordSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  New Password
                </label>
                <input
                  type="text"
                  required
                  value={resetPasswordValue}
                  onChange={e => setResetPasswordValue(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs sm:text-sm focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setResetTargetUser(null)}
                  className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isResetting}
                  className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold"
                >
                  {isResetting ? 'Saving...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
