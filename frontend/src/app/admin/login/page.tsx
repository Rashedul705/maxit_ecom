'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, ShieldAlert, ArrowRight, KeyRound } from 'lucide-react';

function AdminLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/admin';

  const [token, setToken] = useState('admin_secret_token_123'); // prefilled with development default
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      setError('Please provide an admin token');
      return;
    }

    setLoading(true);
    try {
      // Save in cookie (accessible by Next.js middleware)
      document.cookie = `admin_token=${encodeURIComponent(token.trim())}; path=/; max-age=86400; SameSite=Lax`;
      // Also store in localStorage for client-side API requests
      localStorage.setItem('maxitshop_admin_token', token.trim());
      router.push(redirectPath);
    } catch {
      setError('Failed to set login session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-2xl border border-slate-800">
        
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-blue-500/20">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            maxit<span className="text-orange-500">shop</span> Staff Portal
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Enter the authorized admin token to access management controls
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-blue-600" />
              <span>Admin Token</span>
            </label>
            <input
              type="text"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter ADMIN_TOKEN"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:border-blue-500 font-mono"
            />
            <p className="text-[11px] text-slate-400 mt-1.5">
              Default dev token: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-bold">admin_secret_token_123</code>
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-blue-500/20 transition-all disabled:opacity-50"
          >
            <span>Sign In to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <a href="/" className="text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors">
            ← Back to Customer Storefront
          </a>
        </div>

      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-xs">Loading...</div>}>
      <AdminLoginContent />
    </Suspense>
  );
}
