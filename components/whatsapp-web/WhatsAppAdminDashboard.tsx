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
  Copy,
  Gift,
  CreditCard,
  Sparkles,
  Smartphone,
  Sliders,
  Clock
} from 'lucide-react';
import { WhatsAppWebConnect } from './WhatsAppWebConnect';
import { WhatsAppSessionManager } from '@/lib/whatsapp-web/session';
import { WhatsAppWebSession } from '@/lib/whatsapp-web/types';
import { PlanLimitsConfig, DEFAULT_PLAN_LIMITS } from '@/lib/whatsapp-web/limit-manager';

interface ManagedUser {
  id: string;
  businessName: string;
  username: string;
  phoneNumber: string;
  status: 'active' | 'inactive';
  subscriptionType?: 'trial' | 'paid' | 'none';
  planType?: '1_month' | '3_months' | '6_months' | null;
  trialEndDate?: string | null;
  planEndDate?: string | null;
  daysRemaining?: number | null;
  isExpired?: boolean;
  createdAt: string;
  campaignsCount: number;
  successfulMessages: number;
  failedMessages: number;
}

interface TrialRequestItem {
  id: string;
  businessName: string;
  phoneNumber: string;
  status: 'pending' | 'approved' | 'rejected';
  assignedUsername?: string;
  createdAt: string;
  approvedAt?: string;
}

interface RenewalRequestItem {
  id: string;
  userId?: string | null;
  username: string;
  businessName: string;
  phoneNumber: string;
  planType: '1_month' | '3_months' | '6_months';
  amount: number;
  transactionId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  approvedAt?: string;
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
  adminUser?: {
    id?: string;
    username: string;
    businessName?: string;
    phoneNumber?: string;
    role?: string;
    [key: string]: any;
  } | null;
}

export const WhatsAppAdminDashboard: React.FC<WhatsAppAdminDashboardProps> = ({
  onLogout,
  onOpenSenderStudio,
  adminUser
}) => {
  const adminUid = (adminUser?.username || 'hitesh1720').toLowerCase();
  const [activeTab, setActiveTab] = useState<'users' | 'campaigns' | 'trials' | 'renewals' | 'limits'>('users');
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [campaignSummary, setCampaignSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUserFilter, setSelectedUserFilter] = useState<string>('all');

  // Plan Limits & Reset Window State
  const [planLimits, setPlanLimits] = useState<PlanLimitsConfig>(DEFAULT_PLAN_LIMITS);
  const [isLimitsSaving, setIsLimitsSaving] = useState(false);
  const [limitsSuccessMsg, setLimitsSuccessMsg] = useState('');

  // Admin WhatsApp Session & Connect Modal State
  const [adminSession, setAdminSession] = useState<WhatsAppWebSession>(() =>
    WhatsAppSessionManager.getSession(adminUid)
  );
  const [isWaConnectModalOpen, setIsWaConnectModalOpen] = useState(false);
  const [pendingTrialForApproval, setPendingTrialForApproval] = useState<TrialRequestItem | null>(null);
  const [isCheckingWa, setIsCheckingWa] = useState(false);

  // Trial Requests State
  const [trialRequests, setTrialRequests] = useState<TrialRequestItem[]>([]);
  const [approvingTrialId, setApprovingTrialId] = useState<string | null>(null);

  // Plan Renewals State
  const [renewalRequests, setRenewalRequests] = useState<RenewalRequestItem[]>([]);
  const [approvingRenewalId, setApprovingRenewalId] = useState<string | null>(null);

  // Plan Activation Modal State
  const [planActivationUser, setPlanActivationUser] = useState<ManagedUser | null>(null);
  const [selectedPlanToActivate, setSelectedPlanToActivate] = useState<'1_month' | '3_months' | '6_months'>('1_month');
  const [isActivatingPlan, setIsActivatingPlan] = useState(false);
  const [planActivationMsg, setPlanActivationMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
      // Step 1: Request tunnel generation via Admin API route (with autoSave: true)
      let generatedUrl = '';
      try {
        const res = await fetch('/api/admin/gateway/tunnel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ force: false, autoSave: true })
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
            // Synchronize with database
            try {
              await fetch('/api/admin/gateway', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ gatewayUrl: generatedUrl })
              });
            } catch {}
          }
        } catch {}
      }

      if (generatedUrl) {
        setGatewayInput(generatedUrl);
        setGatewayUrl(generatedUrl);
        setIsGatewayOnline(true);
        await fetchGatewayInfo();
        setGatewayStatusMessage({
          type: 'success',
          text: `⚡ Live Cloudflare Tunnel Generated & Activated: ${generatedUrl}! All users are now connected.`
        });
      } else {
        setGatewayStatusMessage({
          type: 'error',
          text: 'Unable to reach local worker. Please double-click START_WHATSAPP_SYSTEM.bat on your laptop to start the worker daemon and tunnel.'
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

  const fetchTrialRequests = async () => {
    try {
      const res = await fetch('/api/admin/trial');
      const data = await res.json();
      if (data.success) {
        setTrialRequests(data.requests || []);
      }
    } catch (err) {
      console.error('Failed to fetch trial requests:', err);
    }
  };

  const fetchRenewalRequests = async () => {
    try {
      const res = await fetch('/api/admin/subscriptions/renewals');
      const data = await res.json();
      if (data.success) {
        setRenewalRequests(data.renewals || []);
      }
    } catch (err) {
      console.error('Failed to fetch renewal requests:', err);
    }
  };

  const fetchPlanLimits = async () => {
    try {
      const res = await fetch('/api/whatsapp/plan-limits');
      const data = await res.json();
      if (data.success && data.limits) {
        setPlanLimits(data.limits);
      }
    } catch (err) {
      console.error('Failed to fetch plan limits:', err);
    }
  };

  const handleSavePlanLimits = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLimitsSaving(true);
    setLimitsSuccessMsg('');
    try {
      const res = await fetch('/api/whatsapp/plan-limits', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(planLimits)
      });
      const data = await res.json();
      if (data.success) {
        setPlanLimits(data.limits);
        setLimitsSuccessMsg('✓ Plan daily limits and reset window saved successfully!');
        setTimeout(() => setLimitsSuccessMsg(''), 5000);
      } else {
        alert(data.error || 'Failed to save plan limits.');
      }
    } catch {
      alert('Network error saving plan limits.');
    } finally {
      setIsLimitsSaving(false);
    }
  };

  const triggerReminderCheck = async () => {
    try {
      await fetch('/api/admin/subscriptions/check-reminders');
    } catch (err) {
      console.error('Failed to trigger reminder check:', err);
    }
  };

  const loadAllData = async () => {
    setIsLoading(true);
    await Promise.all([
      fetchUsers(),
      fetchCampaigns(selectedUserFilter),
      fetchGatewayInfo(),
      fetchTrialRequests(),
      fetchRenewalRequests(),
      fetchPlanLimits(),
      triggerReminderCheck()
    ]);
    setIsLoading(false);
  };

  const checkAdminWhatsAppConnected = async (uid: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/whatsapp-service/status', {
        headers: { 'x-user-id': uid.toLowerCase() },
        cache: 'no-store'
      });
      if (!res.ok) return false;
      const data = await res.json();
      return Boolean(data.isConnected && data.state === 'CONNECTED');
    } catch {
      return false;
    }
  };

  const executeTrialApproval = async (reqItem: TrialRequestItem) => {
    setApprovingTrialId(reqItem.id);
    try {
      const res = await fetch('/api/admin/trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: reqItem.id,
          action: 'approve'
        })
      });
      const data = await res.json();
      if (data.success) {
        const waMsg = data.whatsappSent
          ? '✅ Login credentials automatically sent to user on WhatsApp!'
          : '⚠️ Account created, but WhatsApp message could not be delivered.';
        alert(`🎉 Trial Approved for "${reqItem.businessName}"!\n\n• Username: @${data.credentials?.username}\n• Password: ${data.credentials?.password}\n\n${waMsg}`);
        await Promise.all([fetchTrialRequests(), fetchUsers()]);
      } else {
        alert(data.error || 'Failed to approve trial request.');
      }
    } catch (err: any) {
      alert(err.message || 'Error approving trial request.');
    } finally {
      setApprovingTrialId(null);
    }
  };

  const handleApproveTrial = async (reqItem: TrialRequestItem) => {
    setIsCheckingWa(true);
    setApprovingTrialId(reqItem.id);
    try {
      // Step 1: Check whether admin has WhatsApp Web connected
      const isConnected = await checkAdminWhatsAppConnected(adminUid);
      setIsCheckingWa(false);

      if (!isConnected) {
        // If WhatsApp Web is not connected, ask admin to connect WhatsApp using the existing connection process
        setPendingTrialForApproval(reqItem);
        setIsWaConnectModalOpen(true);
        setApprovingTrialId(null);
        return;
      }

      // Step 2: WhatsApp is connected -> execute approval and send WhatsApp message
      await executeTrialApproval(reqItem);
    } catch (err: any) {
      setIsCheckingWa(false);
      setApprovingTrialId(null);
      alert(err.message || 'Error verifying WhatsApp connection status.');
    }
  };

  const handleAdminSessionChange = (newSession: WhatsAppWebSession) => {
    setAdminSession(newSession);
    if (newSession.connected && pendingTrialForApproval) {
      const item = pendingTrialForApproval;
      setPendingTrialForApproval(null);
      setIsWaConnectModalOpen(false);
      executeTrialApproval(item);
    }
  };

  // Live polling while connect modal is open
  useEffect(() => {
    if (!isWaConnectModalOpen || !pendingTrialForApproval) return;
    const interval = setInterval(async () => {
      const isConn = await checkAdminWhatsAppConnected(adminUid);
      if (isConn) {
        clearInterval(interval);
        const item = pendingTrialForApproval;
        setIsWaConnectModalOpen(false);
        setPendingTrialForApproval(null);
        executeTrialApproval(item);
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [isWaConnectModalOpen, pendingTrialForApproval, adminUid]);

  const handleRejectTrial = async (reqItem: TrialRequestItem) => {
    if (!window.confirm(`Reject free trial request from "${reqItem.businessName}"?`)) return;
    try {
      const res = await fetch('/api/admin/trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: reqItem.id,
          action: 'reject'
        })
      });
      const data = await res.json();
      if (data.success) {
        await fetchTrialRequests();
      }
    } catch (err: any) {
      alert(err.message || 'Error rejecting trial.');
    }
  };

  const handleDeleteTrialRequest = async (reqItem: TrialRequestItem) => {
    if (!window.confirm(`Delete trial request record for "${reqItem.businessName}"? This will allow this phone number to submit a trial request again.`)) return;
    try {
      const res = await fetch(`/api/admin/trial?id=${reqItem.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        await fetchTrialRequests();
      } else {
        alert(data.error || 'Failed to delete trial request.');
      }
    } catch (err: any) {
      alert(err.message || 'Error deleting trial request.');
    }
  };

  const handleApproveRenewal = async (item: RenewalRequestItem) => {
    setApprovingRenewalId(item.id);
    try {
      const res = await fetch('/api/admin/subscriptions/renewals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: item.id,
          action: 'approve'
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        await Promise.all([fetchRenewalRequests(), fetchUsers()]);
      } else {
        alert(data.error || 'Failed to approve renewal.');
      }
    } catch (err: any) {
      alert(err.message || 'Error approving renewal.');
    } finally {
      setApprovingRenewalId(null);
    }
  };

  const handleRejectRenewal = async (item: RenewalRequestItem) => {
    if (!window.confirm(`Reject renewal request for "@${item.username}"?`)) return;
    try {
      const res = await fetch('/api/admin/subscriptions/renewals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: item.id,
          action: 'reject'
        })
      });
      const data = await res.json();
      if (data.success) {
        await fetchRenewalRequests();
      }
    } catch (err: any) {
      alert(err.message || 'Error rejecting renewal.');
    }
  };

  const handleActivatePlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planActivationUser) return;

    setIsActivatingPlan(true);
    setPlanActivationMsg(null);
    try {
      const res = await fetch('/api/admin/subscriptions/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: planActivationUser.id,
          planType: selectedPlanToActivate
        })
      });
      const data = await res.json();
      if (data.success) {
        setPlanActivationMsg({ type: 'success', text: data.message });
        await fetchUsers();
        setTimeout(() => {
          setPlanActivationUser(null);
          setPlanActivationMsg(null);
        }, 1500);
      } else {
        setPlanActivationMsg({ type: 'error', text: data.error || 'Failed to activate plan' });
      }
    } catch (err: any) {
      setPlanActivationMsg({ type: 'error', text: err.message || 'Error activating plan' });
    } finally {
      setIsActivatingPlan(false);
    }
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
        fetchTrialRequests();
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
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">Sent across all users</p>
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
          <div className="flex flex-wrap items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-white dark:bg-zinc-900 text-[#5722AF] dark:text-purple-300 shadow-2xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Users ({users.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('campaigns')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'campaigns'
                  ? 'bg-white dark:bg-zinc-900 text-[#5722AF] dark:text-purple-300 shadow-2xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Campaigns ({campaigns.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('trials')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'trials'
                  ? 'bg-white dark:bg-zinc-900 text-[#5722AF] dark:text-purple-300 shadow-2xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Gift className="w-4 h-4" />
              <span>Trial Requests</span>
              {trialRequests.filter(r => r.status === 'pending').length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#5722AF] text-white">
                  {trialRequests.filter(r => r.status === 'pending').length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('renewals')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'renewals'
                  ? 'bg-white dark:bg-zinc-900 text-[#5722AF] dark:text-purple-300 shadow-2xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Plan Renewals</span>
              {renewalRequests.filter(r => r.status === 'pending').length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
                  {renewalRequests.filter(r => r.status === 'pending').length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('limits')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'limits'
                  ? 'bg-white dark:bg-zinc-900 text-[#5722AF] dark:text-purple-300 shadow-2xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Plan Limits &amp; Time Window</span>
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
                  Create your first user account so your clients or team members can log in and send messages.
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
                    <th className="px-4 py-3 text-center">Subscription</th>
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
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        {u.subscriptionType === 'paid' ? (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            u.isExpired
                              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                              : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          }`}>
                            <span>⭐</span>
                            <span>{u.planType === '1_month' ? '1 Mo' : u.planType === '3_months' ? '3 Mo' : u.planType === '6_months' ? '6 Mo' : 'Paid'}:</span>
                            <span>{u.isExpired ? 'Expired' : `${u.daysRemaining ?? 0}d left`}</span>
                          </span>
                        ) : u.subscriptionType === 'trial' ? (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            u.isExpired
                              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                              : 'bg-purple-50 text-[#5722AF] dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                          }`}>
                            <span>🕒</span>
                            <span>Trial: {u.isExpired ? 'Ended' : `${u.daysRemaining ?? 10}d left`}</span>
                          </span>
                        ) : (
                          <span className="text-zinc-400 text-xs font-medium">None</span>
                        )}
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
                            setPlanActivationUser(u);
                            setSelectedPlanToActivate('1_month');
                            setPlanActivationMsg(null);
                          }}
                          title="Activate Paid Plan (1, 3, 6 Months)"
                          className="p-1.5 text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition cursor-pointer"
                        >
                          <Zap className="w-4 h-4 text-emerald-500" />
                        </button>
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
                    <th className="px-4 py-3">Date Sent</th>
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

        {/* Tab View 3: Trial Requests */}
        {activeTab === 'trials' && (
          <div className="overflow-x-auto">
            {trialRequests.length === 0 ? (
              <div className="text-center py-16 px-4">
                <Gift className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">No Trial Requests Yet</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mt-1">
                  When new visitors on the marketing page request a 10-day free trial, their requests will appear here for approval.
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-zinc-50/70 dark:bg-zinc-800/40 text-zinc-500 dark:text-zinc-400 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-4 py-3">Business Name</th>
                    <th className="px-4 py-3">WhatsApp Number</th>
                    <th className="px-4 py-3">Date Requested</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-center">Assigned User</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-800 dark:text-zinc-200">
                  {trialRequests.map(r => (
                    <tr key={r.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-zinc-900 dark:text-white flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{r.businessName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-300">
                          <Phone className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{r.phoneNumber}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                        {new Date(r.createdAt).toLocaleString(undefined, {
                          dateStyle: 'short',
                          timeStyle: 'short'
                        })}
                      </td>
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            r.status === 'approved'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : r.status === 'rejected'
                              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                              : 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              r.status === 'approved'
                                ? 'bg-emerald-500'
                                : r.status === 'rejected'
                                ? 'bg-rose-500'
                                : 'bg-amber-500'
                            }`}
                          />
                          <span className="capitalize">{r.status}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center text-xs font-mono text-zinc-500 dark:text-zinc-400">
                        {r.assignedUsername ? `@${r.assignedUsername}` : '—'}
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap space-x-1.5">
                        {r.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => handleApproveTrial(r)}
                              disabled={approvingTrialId === r.id}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1 transition cursor-pointer shadow-2xs disabled:opacity-60"
                            >
                              {approvingTrialId === r.id ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  <span>Approving...</span>
                                </>
                              ) : (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Approve Trial</span>
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => handleRejectTrial(r)}
                              disabled={approvingTrialId === r.id}
                              className="px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-rose-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold inline-flex items-center gap-1 transition cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </>
                        ) : (
                          <div className="inline-flex items-center gap-2">
                            <span className="text-[11px] text-zinc-400">
                              {r.approvedAt ? new Date(r.approvedAt).toLocaleDateString() : 'Processed'}
                            </span>
                            <button
                              onClick={() => handleDeleteTrialRequest(r)}
                              title="Delete trial request record (allows number to request trial again)"
                              className="p-1.5 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab View 4: Plan Renewals */}
        {activeTab === 'renewals' && (
          <div className="overflow-x-auto">
            {renewalRequests.length === 0 ? (
              <div className="text-center py-16 px-4">
                <CreditCard className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">No Renewal Requests Yet</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mt-1">
                  When logged-in users submit plan renewal payments via UPI with their Transaction ID, they will appear here.
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-zinc-50/70 dark:bg-zinc-800/40 text-zinc-500 dark:text-zinc-400 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-4 py-3">User &amp; Business</th>
                    <th className="px-4 py-3">Phone Number</th>
                    <th className="px-4 py-3">Plan Selected</th>
                    <th className="px-4 py-3 text-center">Amount</th>
                    <th className="px-4 py-3">UPI Transaction ID / UTR</th>
                    <th className="px-4 py-3">Date Submitted</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-800 dark:text-zinc-200">
                  {renewalRequests.map(item => {
                    const planLabels: Record<string, string> = {
                      '1_month': '1 Month (30d)',
                      '3_months': '3 Months (90d)',
                      '6_months': '6 Months (180d)'
                    };
                    return (
                      <tr key={item.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-zinc-900 dark:text-white flex items-center gap-1.5">
                            <Building className="w-3.5 h-3.5 text-zinc-400" />
                            <span>{item.businessName || item.username}</span>
                          </div>
                          <div className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">@{item.username}</div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-300">
                            <Phone className="w-3.5 h-3.5 text-zinc-400" />
                            <span>{item.phoneNumber || '—'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 font-medium text-zinc-900 dark:text-white">
                          <span className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/50 text-[#5722AF] dark:text-purple-300 font-semibold text-xs">
                            {planLabels[item.planType] || item.planType}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center font-bold text-zinc-900 dark:text-white">
                          ₹{item.amount}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5 font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md w-fit">
                            <span>{item.transactionId}</span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(item.transactionId);
                                alert('Transaction ID copied!');
                              }}
                              className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
                              title="Copy UTR"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                          {new Date(item.createdAt).toLocaleString(undefined, {
                            dateStyle: 'short',
                            timeStyle: 'short'
                          })}
                        </td>
                        <td className="px-4 py-3.5 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              item.status === 'approved'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                : item.status === 'rejected'
                                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                                : 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                item.status === 'approved'
                                  ? 'bg-emerald-500'
                                  : item.status === 'rejected'
                                  ? 'bg-rose-500'
                                  : 'bg-amber-500'
                              }`}
                            />
                            <span className="capitalize">{item.status}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right whitespace-nowrap space-x-1.5">
                          {item.status === 'pending' ? (
                            <>
                              <button
                                onClick={() => handleApproveRenewal(item)}
                                disabled={approvingRenewalId === item.id}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1 transition cursor-pointer shadow-2xs disabled:opacity-60"
                              >
                                {approvingRenewalId === item.id ? (
                                  <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Activating...</span>
                                  </>
                                ) : (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Approve &amp; Activate</span>
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => handleRejectRenewal(item)}
                                disabled={approvingRenewalId === item.id}
                                className="px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-rose-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold inline-flex items-center gap-1 transition cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Reject</span>
                              </button>
                            </>
                          ) : (
                            <span className="text-[11px] text-zinc-400">
                              {item.approvedAt ? new Date(item.approvedAt).toLocaleDateString() : 'Processed'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab View 5: Plan Limits & Reset Window Management */}
        {activeTab === 'limits' && (
          <div className="p-5 sm:p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-[#5722AF] dark:text-purple-300 flex items-center justify-center">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                    Manage Plan Daily Message Limits &amp; Reset Window
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Configure maximum messages users can send per plan, and set the time duration (in hours) after which their limit resets.
                  </p>
                </div>
              </div>

              {limitsSuccessMsg && (
                <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1.5 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{limitsSuccessMsg}</span>
                </div>
              )}
            </div>

            <form onSubmit={handleSavePlanLimits} className="space-y-6">
              {/* Section 1: Message Limits for 4 Plans */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                  <Zap className="w-4 h-4 text-[#5722AF] dark:text-purple-400" />
                  <span>Daily Message Limits (per configured reset window)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Plan 1: 10-Day Free Trial */}
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 space-y-2 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">10-Day Free Trial</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">Free</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="1"
                          max="50000"
                          value={planLimits.trial}
                          onChange={e => setPlanLimits(prev => ({ ...prev, trial: Number(e.target.value) || 1 }))}
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white text-base font-bold focus:outline-none focus:ring-2 focus:ring-[#5722AF]"
                          required
                        />
                        <span className="text-xs text-zinc-500 font-medium whitespace-nowrap">msgs</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1">Default: 100 messages / period</p>
                    </div>
                  </div>

                  {/* Plan 2: 1 Month Plan */}
                  <div className="p-4 rounded-2xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/60 space-y-2 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-900 dark:text-blue-300">1 Month Plan</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">₹317</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="1"
                          max="50000"
                          value={planLimits['1_month']}
                          onChange={e => setPlanLimits(prev => ({ ...prev, '1_month': Number(e.target.value) || 1 }))}
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-blue-200 dark:border-blue-800 text-zinc-900 dark:text-white text-base font-bold focus:outline-none focus:ring-2 focus:ring-blue-600"
                          required
                        />
                        <span className="text-xs text-zinc-500 font-medium whitespace-nowrap">msgs</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1">e.g. 450 or 650 messages / period</p>
                    </div>
                  </div>

                  {/* Plan 3: 3 Months Plan */}
                  <div className="p-4 rounded-2xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-900/60 space-y-2 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-900 dark:text-purple-300">3 Months Plan</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#5722AF]/15 text-[#5722AF] dark:text-purple-300">₹817</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="1"
                          max="50000"
                          value={planLimits['3_months']}
                          onChange={e => setPlanLimits(prev => ({ ...prev, '3_months': Number(e.target.value) || 1 }))}
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-purple-200 dark:border-purple-800 text-zinc-900 dark:text-white text-base font-bold focus:outline-none focus:ring-2 focus:ring-[#5722AF]"
                          required
                        />
                        <span className="text-xs text-zinc-500 font-medium whitespace-nowrap">msgs</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1">e.g. 650 messages / period</p>
                    </div>
                  </div>

                  {/* Plan 4: 6 Months Plan */}
                  <div className="p-4 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/60 space-y-2 relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300">6 Months Plan</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">₹1,217</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="1"
                          max="50000"
                          value={planLimits['6_months']}
                          onChange={e => setPlanLimits(prev => ({ ...prev, '6_months': Number(e.target.value) || 1 }))}
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-800 text-zinc-900 dark:text-white text-base font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                          required
                        />
                        <span className="text-xs text-zinc-500 font-medium whitespace-nowrap">msgs</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1">e.g. 850 msgs / period (2 accounts)</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Time Window / Reset Duration */}
              <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#5722AF] dark:text-purple-400" />
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                        Time Limit / Reset Window (in Hours)
                      </h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Defines how often the user’s sending quota resets.
                      </p>
                    </div>
                  </div>

                  {/* Quick Select Buttons */}
                  <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700">
                    {[
                      { hours: 12, label: '12 Hours' },
                      { hours: 18, label: '18 Hours' },
                      { hours: 24, label: '24 Hours (1 Day)' },
                      { hours: 48, label: '48 Hours (2 Days)' }
                    ].map(btn => (
                      <button
                        key={btn.hours}
                        type="button"
                        onClick={() => setPlanLimits(prev => ({ ...prev, resetHours: btn.hours }))}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                          planLimits.resetHours === btn.hours
                            ? 'bg-[#5722AF] text-white shadow-2xs'
                            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-32">
                    <input
                      type="number"
                      min="1"
                      max="168"
                      value={planLimits.resetHours}
                      onChange={e => setPlanLimits(prev => ({ ...prev, resetHours: Number(e.target.value) || 1 }))}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#5722AF]"
                      required
                    />
                  </div>
                  <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">Hours per window</span>
                </div>

                <div className="p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-800/50 text-xs text-purple-900 dark:text-purple-300 leading-relaxed">
                  💡 <strong>How it works for users:</strong> If set to <strong>{planLimits.resetHours} hours</strong>, a user on the 10-Day Free Trial can send up to <strong>{planLimits.trial} messages</strong>. Once they reach {planLimits.trial}, sending pauses and they can send again after {planLimits.resetHours} hours. Delivered customer numbers are saved so duplicate messages are never delivered to the same contact!
                </div>
              </div>

              {/* Section 3: Live Preview Table */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                  Live Preview across Website &amp; Modals:
                </span>
                <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-700">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-50 dark:bg-zinc-800/80 font-semibold text-zinc-600 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-700">
                      <tr>
                        <th className="px-4 py-2.5">Plan Name</th>
                        <th className="px-4 py-2.5">Price</th>
                        <th className="px-4 py-2.5">Configured Limit</th>
                        <th className="px-4 py-2.5">Reset Duration</th>
                        <th className="px-4 py-2.5">Display on Pricing Page</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-zinc-800 dark:text-zinc-200">
                      <tr>
                        <td className="px-4 py-2.5 font-bold">10-Day Free Trial</td>
                        <td className="px-4 py-2.5">Free</td>
                        <td className="px-4 py-2.5 font-semibold text-[#5722AF] dark:text-purple-300">{planLimits.trial} messages</td>
                        <td className="px-4 py-2.5">{planLimits.resetHours} Hours</td>
                        <td className="px-4 py-2.5 font-mono text-zinc-500">{planLimits.trial} / day</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2.5 font-bold">1 Month Plan</td>
                        <td className="px-4 py-2.5">₹317 / 30d</td>
                        <td className="px-4 py-2.5 font-semibold text-blue-600 dark:text-blue-400">{planLimits['1_month']} messages</td>
                        <td className="px-4 py-2.5">{planLimits.resetHours} Hours</td>
                        <td className="px-4 py-2.5 font-mono text-zinc-500">{planLimits['1_month']} / day</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2.5 font-bold">3 Months Plan</td>
                        <td className="px-4 py-2.5">₹817 / 90d</td>
                        <td className="px-4 py-2.5 font-semibold text-[#5722AF] dark:text-purple-300">{planLimits['3_months']} messages</td>
                        <td className="px-4 py-2.5">{planLimits.resetHours} Hours</td>
                        <td className="px-4 py-2.5 font-mono text-zinc-500">{planLimits['3_months']} / day</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2.5 font-bold">6 Months Plan</td>
                        <td className="px-4 py-2.5">₹1,217 / 180d</td>
                        <td className="px-4 py-2.5 font-semibold text-emerald-600 dark:text-emerald-400">{planLimits['6_months']} messages</td>
                        <td className="px-4 py-2.5">{planLimits.resetHours} Hours</td>
                        <td className="px-4 py-2.5 font-mono text-zinc-500">{planLimits['6_months']} / day (2 Accounts)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isLimitsSaving}
                  className="px-6 py-2.5 rounded-xl bg-[#5722AF] hover:bg-[#451890] text-white text-xs sm:text-sm font-semibold flex items-center gap-2 transition cursor-pointer shadow-md disabled:opacity-60"
                >
                  {isLimitsSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Plan Limits...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Save Plan Limits &amp; Time Window</span>
                    </>
                  )}
                </button>
              </div>
            </form>
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

      {/* Modal: Activate Paid Plan for User */}
      {planActivationUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950 text-[#5722AF] dark:text-purple-300 flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white">Activate Paid Plan</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    User: @{planActivationUser.username} ({planActivationUser.businessName})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPlanActivationUser(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {planActivationMsg && (
              <div
                className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                  planActivationMsg.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-700 dark:text-emerald-300'
                    : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-700 dark:text-rose-300'
                }`}
              >
                {planActivationMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{planActivationMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleActivatePlanSubmit} className="space-y-4 pt-1">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Select Plan Duration to Activate:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: '1_month' as const, label: '1 Month', days: '30 Days', price: '₹317', limit: `${planLimits['1_month']}/day` },
                    { key: '3_months' as const, label: '3 Months', days: '90 Days', price: '₹817', limit: `${planLimits['3_months']}/day` },
                    { key: '6_months' as const, label: '6 Months', days: '180 Days', price: '₹1,217', limit: `${planLimits['6_months']}/day (2 Accounts)` }
                  ].map(p => {
                    const isSelected = selectedPlanToActivate === p.key;
                    return (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => setSelectedPlanToActivate(p.key)}
                        className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                          isSelected
                            ? 'border-[#5722AF] bg-purple-50 dark:bg-purple-950/40 text-[#5722AF] dark:text-purple-300 ring-1 ring-[#5722AF]'
                            : 'border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        <div className="font-bold text-xs">{p.label}</div>
                        <div className="text-[11px] font-extrabold mt-0.5">{p.price}</div>
                        <div className="text-[10px] text-zinc-400 mt-0.5">{p.days}</div>
                        <div className="text-[9px] font-semibold text-[#5722AF] dark:text-purple-300 mt-0.5">{p.limit}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Activating this plan starts the countdown on the user’s account and automatically sends a confirmation message to their WhatsApp number.
              </p>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPlanActivationUser(null)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isActivatingPlan}
                  className="px-4 py-2 rounded-xl bg-[#5722AF] hover:bg-[#471b92] text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs disabled:opacity-60"
                >
                  {isActivatingPlan ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Activating...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5" />
                      <span>Activate Plan Now</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Connect WhatsApp to Approve Trial */}
      {isWaConnectModalOpen && pendingTrialForApproval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl relative space-y-4 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 pb-2 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
                    Connect WhatsApp to Approve Trial
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    To send login details to <strong className="text-zinc-800 dark:text-zinc-200">{pendingTrialForApproval.businessName}</strong> ({pendingTrialForApproval.phoneNumber}), please connect your WhatsApp below.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsWaConnectModalOpen(false);
                  setPendingTrialForApproval(null);
                }}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Info Banner */}
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <span>
                Your WhatsApp Web session is currently disconnected. Once connected, ToolNest will automatically approve the trial request and send their username &amp; password generated for <strong>{pendingTrialForApproval.businessName}</strong> directly on WhatsApp.
              </span>
            </div>

            {/* Same WhatsApp Connection Process */}
            <div className="flex-1 overflow-y-auto pr-1">
              <WhatsAppWebConnect
                session={adminSession}
                onSessionChange={handleAdminSessionChange}
                userId={adminUid}
              />
            </div>

            {/* Modal Footer Actions */}
            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsWaConnectModalOpen(false);
                  setPendingTrialForApproval(null);
                }}
                className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={async () => {
                  const isConn = await checkAdminWhatsAppConnected(adminUid);
                  if (isConn) {
                    const item = pendingTrialForApproval;
                    setIsWaConnectModalOpen(false);
                    setPendingTrialForApproval(null);
                    executeTrialApproval(item);
                  } else {
                    alert('WhatsApp is not connected yet. Please scan the QR code or link your phone above.');
                  }
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <Check className="w-4 h-4" />
                <span>I Have Connected WhatsApp — Approve Now</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
