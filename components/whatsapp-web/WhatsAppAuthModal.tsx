'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  User,
  Lock,
  ArrowRight,
  Loader2,
  AlertCircle,
  Building,
  KeyRound,
  CheckCircle2,
  Eye,
  EyeOff
} from 'lucide-react';

interface WhatsAppAuthModalProps {
  onLoginSuccess: (user: any) => void;
}

export const WhatsAppAuthModal: React.FC<WhatsAppAuthModalProps> = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'user' | 'admin'>('user');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleTabChange = (tab: 'user' | 'admin') => {
    setActiveTab(tab);
    setErrorMsg('');
    setSuccessMsg('');
    setUsername('');
    setPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!username.trim() || !password.trim()) {
      setErrorMsg('Please enter both username and password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim()
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Authentication failed. Please check your credentials.');
      }

      setSuccessMsg(data.message || 'Login successful!');
      setTimeout(() => {
        onLoginSuccess(data.user);
      }, 400);
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto my-8 p-6 sm:p-8 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl relative overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-[#5722AF]/10 dark:bg-[#5722AF]/20 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="text-center space-y-2 mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#5722AF]/10 dark:bg-[#5722AF]/20 text-[#5722AF] dark:text-purple-400 mb-1">
          {activeTab === 'admin' ? <ShieldCheck className="w-6 h-6" /> : <KeyRound className="w-6 h-6" />}
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
          WhatsApp Marketing Access
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
          Sign in to access your WhatsApp Bulk Messaging Dashboard
        </p>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl mb-6">
        <button
          type="button"
          onClick={() => handleTabChange('user')}
          className={`py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'user'
              ? 'bg-white dark:bg-zinc-900 text-[#5722AF] dark:text-purple-300 shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <User className="w-4 h-4" />
          User Login
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('admin')}
          className={`py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'admin'
              ? 'bg-white dark:bg-zinc-900 text-[#5722AF] dark:text-purple-300 shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Admin Login
        </button>
      </div>

      {/* Info notice based on tab */}
      {activeTab === 'user' ? (
        <div className="mb-4 p-3 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/50 text-xs text-purple-800 dark:text-purple-300">
          User accounts are created and provisioned by the Administrator. Use your assigned username and password.
        </div>
      ) : (
        <div className="mb-4 p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 text-xs text-amber-800 dark:text-amber-300">
          Master Administrator portal. Allows creating users, viewing user campaign metrics, and managing system accounts.
        </div>
      )}

      {/* Error / Success Messages */}
      {errorMsg && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-700 dark:text-emerald-300 flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            {activeTab === 'admin' ? 'Admin Username' : 'Username'}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              required
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder={activeTab === 'admin' ? 'hitesh1720' : 'Enter your assigned username'}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-[#5722AF]/30 focus:border-[#5722AF] transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-[#5722AF]/30 focus:border-[#5722AF] transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 py-3 px-4 rounded-xl bg-[#5722AF] hover:bg-[#471b92] active:bg-[#3a1678] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <span>{activeTab === 'admin' ? 'Access Admin Console' : 'Log In to WhatsApp Sender'}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
