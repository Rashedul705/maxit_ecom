import React from 'react';

export const metadata = {
  title: 'FAQ | Frequently Asked Questions | maxitshop',
  description: 'Find answers about ordering, cash on delivery, warranties, and shipping at maxitshop Bangladesh.',
};

export default function FAQPage() {
  const faqs = [
    {
      q: 'Do you offer Cash on Delivery (COD)?',
      a: 'Yes, we provide Cash on Delivery across all 64 districts in Bangladesh. You pay in cash directly to the delivery personnel upon receiving your package.'
    },
    {
      q: 'What are the delivery charges and delivery times?',
      a: 'Inside Dhaka city, delivery takes 24 to 48 hours and the delivery fee is ৳80. Outside Dhaka city, delivery takes 2 to 3 days and the delivery fee is ৳130.'
    },
    {
      q: 'Are the products 100% genuine and authentic?',
      a: 'Yes, all products sold on maxitshop are 100% genuine with official brand and distributor warranty. We do not sell counterfeit or copy products.'
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
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
        <h1 className="text-3xl font-black text-slate-900 mb-2">Frequently Asked Questions</h1>
        <p className="text-sm text-slate-500 mb-8">
          Answers to common questions regarding orders, payments, and product delivery in Bangladesh.
        </p>

        <div className="divide-y divide-slate-100">
          {faqs.map((faq, i) => (
            <div key={i} className="py-4">
              <h3 className="text-sm font-bold text-slate-900 mb-1">{faq.q}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
