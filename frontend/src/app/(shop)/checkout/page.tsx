'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/lib/cartContext';
import { api } from '@/lib/api';
import { Order } from '@/lib/types';
import { Truck, ShieldCheck, CheckCircle2, ArrowRight, Loader2, AlertCircle, ShoppingBag } from 'lucide-react';

// Bangladesh Geo Locations
const divisionsData: Record<string, Record<string, string[]>> = {
  Dhaka: {
    'Dhaka': ['Mirpur', 'Dhanmondi', 'Gulshan', 'Banani', 'Uttara', 'Mohammadpur', 'Motijheel', 'Badda', 'Khilgaon', 'Old Dhaka', 'Other'],
    'Gazipur': ['Gazipur Sadar', 'Tongi', 'Joydebpur', 'Kaliakair', 'Sreepur', 'Other'],
    'Narayanganj': ['Narayanganj Sadar', 'Fatullah', 'Siddhirganj', 'Rupganj', 'Araihazar', 'Other'],
    'Tangail': ['Tangail Sadar', 'Mirzapur', 'Madhupur', 'Ghatail', 'Other'],
    'Faridpur': ['Faridpur Sadar', 'Boalmari', 'Bhanga', 'Other']
  },
  Chittagong: {
    'Chittagong': ['Agrabad', 'Nasirabad', 'GEC Circle', 'Halishahar', 'Chawkbazar', 'Kotwali', 'Panchlaish', 'Other'],
    'Coxs Bazar': ['Coxs Bazar Sadar', 'Ramu', 'Teknaf', 'Other'],
    'Comilla': ['Comilla Sadar', 'Kandirpar', 'Laksam', 'Other'],
    'Feni': ['Feni Sadar', 'Daganbhuiyan', 'Chhagalnaiya', 'Other']
  },
  Rajshahi: {
    'Rajshahi': ['Boalia', 'Motihar', 'Rajpara', 'Shah Makhdum', 'Other'],
    'Bogra': ['Bogra Sadar', 'Sherpur', 'Shibganj', 'Other'],
    'Pabna': ['Pabna Sadar', 'Ishwardi', 'Santhia', 'Other']
  },
  Khulna: {
    'Khulna': ['Khulna Sadar', 'Sonadanga', 'Khalishpur', 'Daulatpur', 'Other'],
    'Jessore': ['Jessore Sadar', 'Jhikargachha', 'Bagherpara', 'Other'],
    'Kushtia': ['Kushtia Sadar', 'Kumarkhali', 'Other']
  },
  Sylhet: {
    'Sylhet': ['Sylhet Sadar', 'Zindabazar', 'Amberkhana', 'South Surma', 'Beanibazar', 'Other'],
    'Moulvibazar': ['Moulvibazar Sadar', 'Sreemangal', 'Kulaura', 'Other']
  },
  Barisal: {
    'Barisal': ['Barisal Sadar', 'Natullabad', 'Rupatali', 'Bakerganj', 'Other'],
    'Patuakhali': ['Patuakhali Sadar', 'Kuakata', 'Galachipa', 'Other']
  },
  Rangpur: {
    'Rangpur': ['Rangpur Sadar', 'Pirganj', 'Badarganj', 'Other'],
    'Dinajpur': ['Dinajpur Sadar', 'Birganj', 'Phulbari', 'Other']
  },
  Mymensingh: {
    'Mymensingh': ['Mymensingh Sadar', 'Muktagachha', 'Trishal', 'Bhaluka', 'Other'],
    'Jamalpur': ['Jamalpur Sadar', 'Sarishabari', 'Islampur', 'Other']
  }
};

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [division, setDivision] = useState('Dhaka');
  const [district, setDistrict] = useState('Dhaka');
  const [area, setArea] = useState('Mirpur');
  const [customArea, setCustomArea] = useState('');
  const [note, setNote] = useState('');

  // UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Delivery charge calculation
  const isDhaka = division.toLowerCase() === 'dhaka';
  const deliveryCharge = isDhaka ? 80 : 130;
  const grandTotal = subtotal + deliveryCharge;

  // Handle cascading dropdowns
  const availableDistricts = Object.keys(divisionsData[division] || {});
  const availableAreas = (divisionsData[division] && divisionsData[division][district]) || ['Other'];

  const handleDivisionChange = (newDiv: string) => {
    setDivision(newDiv);
    const firstDistrict = Object.keys(divisionsData[newDiv] || {})[0] || '';
    setDistrict(firstDistrict);
    const firstArea = (divisionsData[newDiv] && divisionsData[newDiv][firstDistrict])?.[0] || 'Other';
    setArea(firstArea);
  };

  const handleDistrictChange = (newDist: string) => {
    setDistrict(newDist);
    const firstArea = (divisionsData[division] && divisionsData[division][newDist])?.[0] || 'Other';
    setArea(firstArea);
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerName.trim() || !phone.trim() || !address.trim()) {
      setErrorMessage('Please fill in your Name, Mobile Number, and Detailed Street Address.');
      return;
    }

    const cleanPhone = phone.replace(/[\s-]/g, '');
    if (!/(^(?:\+?88)?01[3-9]\d{8}$)/.test(cleanPhone)) {
      setErrorMessage('Please enter a valid 11-digit Bangladeshi mobile number (e.g. 017XXXXXXXX).');
      return;
    }

    if (items.length === 0) {
      setErrorMessage('Your cart is empty. Add products before checking out.');
      return;
    }

    const resolvedArea = area === 'Other' && customArea.trim() ? customArea.trim() : area;

    try {
      setIsSubmitting(true);
      const orderPayload = {
        customerName: customerName.trim(),
        phone: cleanPhone,
        address: address.trim(),
        division,
        district,
        area: resolvedArea,
        items: items.map(item => ({ id: item.id, quantity: item.quantity })),
        paymentMethod: 'cod',
        note: note.trim()
      };

      const result = await api.createOrder(orderPayload);
      setConfirmedOrder(result);
      clearCart();
    } catch (err: unknown) {
      console.error('Checkout error:', err);
      const message = err instanceof Error ? err.message : 'Failed to place order. Please check inputs and try again.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS CONFIRMATION VIEW
  if (confirmedOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-sm text-center">
          
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
            Order Placed Successfully!
          </span>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3 mb-2">
            Thank you, {confirmedOrder.customerName}!
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-6">
            Your order has been received and is now being processed. Our customer team will call your phone (<span className="font-semibold text-slate-800">{confirmedOrder.phone}</span>) to verify the shipping address.
          </p>

          {/* Order Details Card */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 text-left max-w-lg mx-auto space-y-3 mb-8">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-xs font-semibold text-slate-500">Order Number</span>
              <span className="text-sm font-extrabold text-blue-600 font-mono">{confirmedOrder.orderNumber}</span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-xs font-semibold text-slate-500">Payment Method</span>
              <span className="text-xs font-bold text-slate-800 uppercase">Cash on Delivery (COD)</span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-xs font-semibold text-slate-500">Shipping To</span>
              <span className="text-xs font-medium text-slate-800 text-right max-w-[240px]">
                {confirmedOrder.address}, {confirmedOrder.area}, {confirmedOrder.district}, {confirmedOrder.division}
              </span>
            </div>

            <div className="flex justify-between items-center pt-1 text-sm font-black text-slate-900">
              <span>Total Payable Amount</span>
              <span className="text-blue-600 text-base">৳{confirmedOrder.total.toLocaleString()}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={`/track-order?orderNumber=${confirmedOrder.orderNumber}&phone=${confirmedOrder.phone}`}
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
            >
              Track This Order
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
            >
              Return to Store
            </Link>
          </div>

        </div>
      </div>
    );
  }

  // If no items in cart and no confirmed order
  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">No items to checkout</h2>
        <p className="text-xs text-slate-500 mb-6">Your shopping cart is currently empty.</p>
        <Link href="/" className="px-5 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-xs">
          Explore Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      
      <div className="pb-4 border-b border-slate-200 mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          Fast Express Checkout
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Complete your order with Cash on Delivery across Bangladesh
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-xs font-medium">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleOrderSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Form: Delivery Address & Details (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          
          <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">
              1. Delivery Information
            </h2>
          </div>

          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Tanvir Hossain"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500 focus:bg-white"
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mobile Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 01712345678"
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500 focus:bg-white"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Our team will call this number before shipping the parcel.
              </span>
            </div>

            {/* Cascading Geo: Division, District, Area */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Division <span className="text-red-500">*</span>
                </label>
                <select
                  value={division}
                  onChange={(e) => handleDivisionChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500"
                >
                  {Object.keys(divisionsData).map((div) => (
                    <option key={div} value={div}>
                      {div} {div === 'Dhaka' ? '(৳80 Delivery)' : '(৳130 Delivery)'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  District <span className="text-red-500">*</span>
                </label>
                <select
                  value={district}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500"
                >
                  {availableDistricts.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Area / Thana <span className="text-red-500">*</span>
                </label>
                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500"
                >
                  {availableAreas.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
            </div>

            {area === 'Other' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Specify Area / Thana Name
                </label>
                <input
                  type="text"
                  value={customArea}
                  onChange={(e) => setCustomArea(e.target.value)}
                  placeholder="Enter your local area or police station name"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500"
                />
              </div>
            )}

            {/* Detailed Street Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Detailed Street Address <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House No, Road No, Flat/Apartment, Landmark..."
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500 focus:bg-white"
              />
            </div>

            {/* Special Instructions */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Order Notes / Special Delivery Instructions (Optional)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Call before coming, leave at reception..."
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              2. Payment Method
            </h3>
            
            <div className="p-3.5 rounded-xl border-2 border-blue-600 bg-blue-50/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  id="cod"
                  name="payment"
                  defaultChecked
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <div>
                  <label htmlFor="cod" className="text-xs font-bold text-slate-900 block cursor-pointer">
                    Cash on Delivery (COD)
                  </label>
                  <p className="text-[11px] text-slate-500">Pay in cash to the delivery rider at your doorstep</p>
                </div>
              </div>
              <span className="text-xs font-bold text-blue-600 bg-white px-2 py-0.5 rounded border border-blue-200">
                Nationwide
              </span>
            </div>
          </div>

        </div>

        {/* Right Sidebar: Order Items & Payment Summary (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Order Review ({items.length} items)
            </h2>

            {/* Items mini list */}
            <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-lg bg-slate-50 border border-slate-200 overflow-hidden shrink-0">
                    <Image src={item.image} alt={item.title} fill sizes="48px" className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 line-clamp-1">{item.title}</p>
                    <p className="text-[11px] text-slate-400">Qty: {item.quantity} × ৳{item.price.toLocaleString()}</p>
                  </div>
                  <span className="text-xs font-bold text-slate-800">
                    ৳{(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculation */}
            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">৳{subtotal.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center text-slate-600">
                <div className="flex flex-col">
                  <span>Delivery Charge</span>
                  <span className="text-[10px] text-slate-400">
                    {isDhaka ? 'Inside Dhaka City (৳80)' : 'Outside Dhaka City (৳130)'}
                  </span>
                </div>
                <span className="font-bold text-slate-900">৳{deliveryCharge}</span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between text-base font-black text-slate-900">
                <span>Grand Total</span>
                <span className="text-blue-600 text-lg">৳{grandTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Confirm & Place Order CTA */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-orange-500/25 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Placing Your Order...</span>
                </>
              ) : (
                <>
                  <span>Confirm Order (৳{grandTotal.toLocaleString()})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-2 flex items-center gap-2 text-[11px] text-slate-500 justify-center">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>By placing this order you agree to our Terms and Policies.</span>
            </div>

          </div>
        </div>

      </form>

    </div>
  );
}
