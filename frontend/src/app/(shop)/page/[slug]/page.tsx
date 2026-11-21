import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import { Home, ChevronRight, FileText, ShieldCheck, Clock } from 'lucide-react';
import { renderFormattedPageContent } from '@/lib/pageContentFormatter';
import type { Metadata } from 'next';

export const revalidate = 0;

interface DynamicPageProps {
  params: Promise<{ slug: string }>;
}

const FALLBACK_PAGES: Record<string, { title: string; content: string }> = {
  'order-procedure': {
    title: 'Order Procedure',
    content: `### How to Place an Order at MaxiTShop
1. **Browse or Search:** Find your desired solar equipment, power inverter, battery, or electronic module using our search bar or categories menu.
2. **Add to Cart or Click 'অর্ডার করুন':** Click the 'অর্ডার করুন' button on the product card to instantly initiate one-click quick checkout.
3. **Provide Shipping Information:** Enter your complete name, active 11-digit mobile phone number, delivery address, and select inside or outside Dhaka.
4. **Select Payment Method:** Choose between Cash on Delivery (COD), bKash, or Nagad upon delivery.
5. **Confirm Order:** Click 'Confirm Order'. You will receive an immediate confirmation SMS and order tracking number.
6. **Order Verification:** Our customer care representative may call you within 30 minutes to verify shipping details for bulky solar batteries and inverters.`
  },
  'delivery-rules': {
    title: 'Delivery Rules & Shipping Policy',
    content: `### Nationwide Delivery Guidelines
- **Inside Dhaka:** Delivery fee is ৳70. Delivery completed within 24 to 48 hours via express courier.
- **Outside Dhaka (All 64 Districts):** Delivery fee is ৳130. Orders delivered within 2 to 4 business days via SA Paribahan, Sundarban Courier, or Steadfast.
- **Bulky & Heavy Solar Equipment:** For solar panels exceeding 500W or lead-acid/lithium battery banks exceeding 20kg, specialized transport or freight charges may apply upon prior confirmation.
- **Parcel Inspection:** Customers are encouraged to open and inspect the package in the presence of the delivery person before paying cash.`
  },
  'return-policy': {
    title: 'Return & Replacement Policy',
    content: `### 7-Day Hassle-Free Replacement Policy
At MaxiTShop, we are committed to providing only 100% original, verified items.
- **Eligibility for Replacement:** If the product received is physically damaged during transit, defective, or does not match the specifications advertised on our website.
- **Timeframe:** Please notify our customer support team or submit a complaint through our complaints portal within 7 calendar days of receiving your item.
- **Condition:** The returned item must be in original condition, including original packaging, accessories, manuals, and warranty cards.
- **Processing Time:** Once our testing lab verifies the product defect, a replacement unit or full refund is dispatched within 3 business days.`
  },
  'privacy-policy': {
    title: 'Privacy Policy',
    content: `### Privacy & Data Protection
MaxiTShop respects the privacy of our customers and visitors.
- **Personal Information Collected:** We collect names, delivery addresses, phone numbers, and email addresses strictly for order fulfillment, customer support, and tracking notifications.
- **Data Security:** We do not sell, rent, or trade your personal data to any third-party marketing companies.
- **Payment Safety:** We do not store credit card or banking PIN credentials. All mobile financial transactions are processed securely through authorized payment gateway channels.`
  },
  'terms-conditions': {
    title: 'Terms and Conditions',
    content: `### Terms of Service
By using MaxiTShop and placing orders, you agree to our standard terms and conditions:
- **Pricing & Stock:** While we strive to maintain accurate stock and pricing, occasional discrepancies may occur. We reserve the right to cancel or amend orders with full customer notification.
- **Warranty Claims:** Official manufacturer warranty is provided directly by authorized distributor service centers in Bangladesh. MaxiTShop assists with warranty coordination.
- **Governing Law:** These terms are governed and construed in accordance with the laws of Bangladesh.`
  },
  'about-us': {
    title: 'About MaxiTShop',
    content: `### Welcome to MaxiTShop
MaxiTShop is a premier technology and clean energy e-commerce destination in Bangladesh. We connect consumers and industrial businesses with top-tier solar solutions, inverters, LiFePO4 batteries, electronics, and smart hardware tools.

We are dedicated to fast delivery, responsive support, authentic products, and customer-first service.`
  },
  'warranty-policy': {
    title: 'Warranty & Guarantee Policy',
    content: `### Official Warranty & Guarantee Policy
At MaxiTShop, all products are 100% authentic, brand-new, and covered under standard manufacturer or MaxiTShop official service warranty.

### Warranty Coverage
• **Solar Inverters & Hybrid Systems:** 1 to 5 Years Official Manufacturer Warranty (as specified per model).
• **Lithium LiFePO4 Battery Packs & Smart BMS:** 1 to 3 Years Replacement / Service Warranty.
• **Solar Panels:** 10 to 25 Years Performance Output Guarantee.
• **Electronics, ESP Modules, & Accessories:** 7 Days Replacement Warranty against manufacturing defects.

### Warranty Terms & Conditions
1. **Original Invoice & Warranty Card:** Please retain your delivery invoice number or warranty card for all warranty claims.
2. **Physical / Liquid Damage Void:** The warranty does not cover physical breakage, water damage, burn marks from short circuit, or reverse polarity connection.
3. **Claim Process:** Submit a claim through our customer support or complaints portal with your Order ID and photo/video proof.
4. **Resolution Period:** Warranty repairs or replacements are typically resolved within 3 to 7 working days.`
  },
  'shipping-info': {
    title: 'Shipping & Delivery Info',
    content: `### Nationwide Delivery Guidelines
- **Inside Dhaka:** Delivery fee is ৳70. Delivery completed within 24 to 48 hours via express courier.
- **Outside Dhaka (All 64 Districts):** Delivery fee is ৳130. Orders delivered within 2 to 4 business days via SA Paribahan, Sundarban Courier, or Steadfast.
- **Bulky & Heavy Solar Equipment:** For solar panels exceeding 500W or lead-acid/lithium battery banks exceeding 20kg, specialized transport or freight charges may apply upon prior confirmation.
- **Parcel Inspection:** Customers are encouraged to open and inspect the package in the presence of the delivery person before paying cash.`
  }
};

export async function generateMetadata({ params }: DynamicPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const page = await api.getPage(slug);
    return {
      title: `${page.title} | MaxiTShop Bangladesh`,
    };
  } catch {
    const fallback = FALLBACK_PAGES[slug];
    return {
      title: `${fallback?.title || 'Policy Page'} | MaxiTShop Bangladesh`,
    };
  }
}

export default async function StaticPage({ params }: DynamicPageProps) {
  const { slug } = await params;

  let pageData: { title: string; content: string; updatedAt?: string } | null = null;
  try {
    const remotePage = await api.getPage(slug);
    if (remotePage && remotePage.content && remotePage.content.trim()) {
      pageData = remotePage;
    }
  } catch (err) {
    // Continue to settings/fallback
  }

  // Cross-reference settings.policies if page content was not in pages collection
  if (!pageData) {
    try {
      const settings = await api.getSettings();
      if (settings?.policies) {
        if (slug === 'terms-conditions' && settings.policies.terms) {
          pageData = { title: 'Terms and Conditions', content: settings.policies.terms };
        } else if (slug === 'privacy-policy' && settings.policies.privacy) {
          pageData = { title: 'Privacy Policy', content: settings.policies.privacy };
        } else if (slug === 'return-policy' && settings.policies.returnPolicy) {
          pageData = { title: 'Return & Replacement Policy', content: settings.policies.returnPolicy };
        } else if (slug === 'delivery-rules' && settings.policies.shipping) {
          pageData = { title: 'Delivery Rules & Shipping Policy', content: settings.policies.shipping };
        } else if (slug === 'warranty-policy' && settings.policies.warranty) {
          pageData = { title: 'Warranty & Guarantee Policy', content: settings.policies.warranty };
        }
      }
    } catch (err) {
      // Continue to local fallback
    }
  }

  if (!pageData) {
    pageData = FALLBACK_PAGES[slug];
  }

  if (!pageData) {
    notFound();
  }

  const formattedHtml = renderFormattedPageContent(pageData.content);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center text-xs text-gray-500 mb-6 gap-1.5 overflow-x-auto whitespace-nowrap">
        <Link href="/" className="hover:text-[#FF6600] flex items-center gap-1">
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
        <ChevronRight className="w-3 h-3 text-gray-400" />
        <span className="text-gray-500">Policy</span>
        <ChevronRight className="w-3 h-3 text-gray-400" />
        <span className="font-semibold text-gray-900">{pageData.title}</span>
      </nav>

      <article className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-10 shadow-xs">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#FF6600] flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
              {pageData.title}
            </h1>
            <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Official MaxiTShop Policy</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Updated {pageData.updatedAt ? new Date(pageData.updatedAt).toLocaleDateString() : '2026'}
              </span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="prose prose-sm sm:prose max-w-none text-gray-700 leading-relaxed font-normal">
          <div suppressHydrationWarning dangerouslySetInnerHTML={{ __html: formattedHtml }} />
        </div>
      </article>
    </div>
  );
}
