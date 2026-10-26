'use client';

import React from 'react';
import { Order } from '@/lib/types';
import { Printer, X } from 'lucide-react';

interface InvoiceModalProps {
  order: Order | null;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Top Control Bar (Hidden during print) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Order Invoice:</span>
            <span className="text-xs font-mono font-bold text-blue-400">{order.orderNumber}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Body */}
        <div className="p-8 overflow-y-auto print:p-0 space-y-6 text-slate-800 text-xs font-sans">
          
          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-6">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-extrabold flex items-center justify-center text-sm">
                  M
                </div>
                <span className="text-xl font-black text-slate-900">
                  MaxiT<span className="text-orange-500">Shop</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Official E-Commerce Store</p>
              <p className="text-[11px] text-slate-500">2nd Floor, Afroza Tower, Uposhohor New Market, Rajshahi-6000</p>
              <p className="text-[11px] text-slate-500">Hotline: +880 1733-272445</p>
            </div>

            <div className="text-right">
              <span className="text-xl font-black text-slate-900 block">TAX INVOICE</span>
              <p className="text-xs font-mono font-bold text-blue-600 mt-1">{order.orderNumber}</p>
              <p className="text-[11px] text-slate-400">
                Date: {new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
              <p className="text-[11px] text-slate-500">Status: <strong className="text-slate-800">{order.status}</strong></p>
            </div>
          </div>

          {/* Customer / Billing Info */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <div>
              <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider block mb-1">
                Billed & Shipped To:
              </span>
              <p className="font-bold text-slate-900 text-sm">{order.customerName}</p>
              <p className="text-slate-600 mt-0.5">Phone: {order.phone}</p>
              <p className="text-slate-600 mt-0.5">
                {order.address}, {order.area}, {order.district}, {order.division}
              </p>
            </div>

            <div className="text-right">
              <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider block mb-1">
                Payment Method:
              </span>
              <p className="font-bold text-slate-900 uppercase">Cash on Delivery (COD)</p>
              {order.note && (
                <p className="text-[11px] text-slate-500 italic mt-1">
                  Note: &quot;{order.note}&quot;
                </p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Item Description</th>
                  <th className="py-2.5 px-4 text-center">Qty</th>
                  <th className="py-2.5 px-4 text-right">Unit Price</th>
                  <th className="py-2.5 px-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-3 px-4 font-semibold text-slate-800">{item.title}</td>
                    <td className="py-3 px-4 text-center font-bold text-slate-700">{item.quantity}</td>
                    <td className="py-3 px-4 text-right text-slate-600">৳{item.price.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      ৳{(item.price * item.quantity).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-bold text-slate-800">৳{order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery Charge:</span>
                <span className="font-bold text-slate-800">৳{order.deliveryCharge}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-black text-slate-900">
                <span>Total Due (COD):</span>
                <span className="text-blue-600">৳{order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Footer Notice */}
          <div className="pt-6 border-t border-slate-200 text-center text-[10px] text-slate-400">
            <p>Thank you for shopping with maxitshop Bangladesh! For any issues, contact support@maxitshop.com.</p>
          </div>

        </div>

      </div>
    </div>
  );
};
