import React from 'react';
import { Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react';

export const metadata = {
  title: 'Contact Us | MaxiTShop Bangladesh',
  description: 'Reach MaxiTShop customer helpline, WhatsApp support, and office location in Panthapath, Dhaka.',
};

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
        <h1 className="text-3xl font-black text-slate-900 mb-2">Contact Customer Support</h1>
        <p className="text-sm text-slate-500 mb-8">
          Have an inquiry regarding a product, order delivery, or solar panel installation? We are here to help.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200/80">
              <Phone className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Direct Hotline</h3>
                <p className="text-xs text-slate-600 mt-0.5">+880 1700-000000</p>
                <p className="text-[11px] text-slate-400">9:00 AM - 10:00 PM (Everyday)</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200/80">
              <MessageCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">WhatsApp Helpdesk</h3>
                <p className="text-xs text-slate-600 mt-0.5">+880 1700-000000</p>
                <p className="text-[11px] text-slate-400">Instant chat & order tracking</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200/80">
              <Mail className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Email Inquiries</h3>
                <p className="text-xs text-slate-600 mt-0.5">support@maxitshop.com</p>
                <p className="text-[11px] text-slate-400">Response within 24 hours</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200/80">
              <MapPin className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">Head Office</h3>
                <p className="text-xs text-slate-600 mt-0.5">Level 6, Block B, Panthapath, Dhaka-1205, Bangladesh</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200/80">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Send a Message</h3>
            <form className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name</label>
                <input type="text" placeholder="Full name" className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number</label>
                <input type="tel" placeholder="01XXXXXXXXX" className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Message</label>
                <textarea rows={3} placeholder="How can we assist you?" className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"></textarea>
              </div>
              <button type="button" className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700">
                Submit Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
