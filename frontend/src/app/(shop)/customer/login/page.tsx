'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogIn, UserPlus, Phone, Lock, Home, ChevronRight, CheckCircle2, Mail, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';

export default function CustomerLoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      if (isRegister) {
        if (!name.trim()) throw new Error('Please enter your full name');
        if (!email.trim()) throw new Error('Please enter your email address');
        if (!password || password.length < 6) throw new Error('Password must be at least 6 characters');

        const res = await api.customerRegister({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          password
        });
        localStorage.setItem('maxitshop_customer', JSON.stringify({ token: res.token, ...res.user }));
        setSuccessMsg('Account created successfully! Redirecting...');
        setTimeout(() => router.push('/customer/account'), 800);
      } else {
        if (!email.trim() || !password) throw new Error('Please enter both email and password');

        const res = await api.customerLogin({
          email: email.trim().toLowerCase(),
          password
        });
        localStorage.setItem('maxitshop_customer', JSON.stringify({ token: res.token, ...res.user }));
        setSuccessMsg('Signed in successfully! Redirecting...');
        setTimeout(() => router.push('/customer/account'), 800);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Authentication failed. Please check your credentials.';
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center text-xs text-gray-500 mb-6 gap-1.5 overflow-x-auto whitespace-nowrap">
        <Link href="/" className="hover:text-[#FF6600] flex items-center gap-1">
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
        <ChevronRight className="w-3 h-3 text-gray-400" />
        <span className="font-semibold text-gray-900">
          {isRegister ? 'Customer Registration' : 'Customer Login'}
        </span>
      </nav>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
        {/* Header Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            type="button"
            onClick={() => { setIsRegister(false); setSuccessMsg(''); }}
            className={`flex-1 pb-3 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer ${
              !isRegister
                ? 'border-[#FF6600] text-[#FF6600]'
                : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setSuccessMsg(''); }}
            className={`flex-1 pb-3 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer ${
              isRegister
                ? 'border-[#FF6600] text-[#FF6600]'
                : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
          >
            Create Account
          </button>
        </div>

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Arif Hossain"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-xs sm:text-sm text-gray-900 focus:bg-white focus:outline-hidden focus:border-[#FF6600]"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Email Address *</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. arif@example.com"
                className="w-full pl-9 pr-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-xs sm:text-sm text-gray-900 focus:bg-white focus:outline-hidden focus:border-[#FF6600]"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Mobile Phone Number {isRegister ? '(Optional)' : ''}
            </label>
            <div className="relative">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="017XXXXXXXX"
                className="w-full pl-9 pr-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-xs sm:text-sm text-gray-900 focus:bg-white focus:outline-hidden focus:border-[#FF6600]"
              />
              <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-xs sm:text-sm text-gray-900 focus:bg-white focus:outline-hidden focus:border-[#FF6600]"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-[#FF6600] hover:bg-[#e55c00] text-white rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50 mt-2"
          >
            {isRegister ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            <span>{isLoading ? 'Processing...' : isRegister ? 'Register Account' : 'Sign In'}</span>
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-100 text-center">
          <Link
            href="/customer/order-track"
            className="text-xs font-semibold text-[#FF6600] hover:underline"
          >
            Want to track an order without logging in? Click here
          </Link>
        </div>
      </div>
    </div>
  );
}
