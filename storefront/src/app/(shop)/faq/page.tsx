import React from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Home, ChevronRight, HelpCircle } from 'lucide-react';

export const revalidate = 0;

export const metadata = {
  title: 'FAQ | Frequently Asked Questions | MaxiTShop',
  description: 'Find answers about ordering, cash on delivery, warranties, and shipping at MaxiTShop Bangladesh.',
};

export default async function FAQPage() {
  let insideDhaka = 70;
  let outsideDhaka = 130;
  let insideTime = '24 to 48 hours';
  let outsideTime = '2 to 3 days';
  let freeThreshold = 0;

  try {
    const settings = await api.getSettings();
    if (settings?.deliveryRates) {
      insideDhaka = Number(settings.deliveryRates.insideDhaka ?? insideDhaka);
      outsideDhaka = Number(settings.deliveryRates.outsideDhaka ?? outsideDhaka);
      insideTime = settings.deliveryRates.insideDhakaTime || insideTime;
      outsideTime = settings.deliveryRates.outsideDhakaTime || outsideTime;
      freeThreshold = Number(settings.deliveryRates.freeDeliveryThreshold ?? 0);
    }
  } catch (e) {
    // Keep defaults
  }

  const deliveryAnswer = freeThreshold > 0
    ? `Inside Dhaka city, delivery takes ${insideTime} and the delivery fee is ৳${insideDhaka}. Outside Dhaka city, delivery takes ${outsideTime} and the delivery fee is ৳${outsideDhaka}. Free nationwide delivery is available on orders over ৳${freeThreshold.toLocaleString()}!`
    : `Inside Dhaka city, delivery takes ${insideTime} and the delivery fee is ৳${insideDhaka}. Outside Dhaka city, delivery takes ${outsideTime} and the delivery fee is ৳${outsideDhaka}.`;

  const faqs = [
    {
      q: 'Do you offer Cash on Delivery (COD)?',
      a: 'Yes, we provide Cash on Delivery across all 64 districts in Bangladesh. You pay in cash directly to the delivery personnel upon receiving your package.'
    },
    {
      q: 'What are the delivery charges and delivery times?',
      a: deliveryAnswer
    },
    {
      q: 'Are the products 100% genuine and authentic?',
      a: 'Yes, all products sold on MaxiTShop are 100% genuine with official brand and distributor warranty. We do not sell counterfeit or copy products.'
    },
    {
      q: 'How does the 7-day replacement warranty work?',
      a: 'If you receive a defective or broken item or an item with missing accessories, notify us within 7 days of delivery. We will arrange a free exchange or replacement.'
    },
    {
      q: 'How can I track my order?',
      a: 'You can track your order anytime from our Track Order page by entering your order number or phone number.'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center text-xs text-gray-500 gap-1.5 overflow-x-auto whitespace-nowrap">
        <Link href="/" className="hover:text-[#FF6600] flex items-center gap-1">
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
        <ChevronRight className="w-3 h-3 text-gray-400" />
        <span className="font-semibold text-gray-900">FAQ</span>
      </nav>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-xs">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#FF6600] flex items-center justify-center shrink-0">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Frequently Asked Questions</h1>
            <p className="text-xs text-slate-500 mt-1">
              Answers to common questions regarding orders, payments, and product delivery in Bangladesh.
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {faqs.map((faq, i) => (
            <div key={i} className="py-4">
              <h3 className="text-sm font-bold text-slate-900 mb-1.5">{faq.q}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
