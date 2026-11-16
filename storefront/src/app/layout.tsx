import type { Metadata, Viewport } from "next";
import "./globals.css";
import { api } from "@/lib/api";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export async function generateMetadata(): Promise<Metadata> {
  let title = "MaxiTShop | Online Shopping in Bangladesh - Solar, Inverters, Gadgets & Spares";
  let description = "MaxiTShop is Bangladesh's premier e-commerce platform for Solar Energy, LiFePO4 Batteries, Inverters, Smart Gadgets, and Electronics with Cash on Delivery across all 64 districts.";
  let keywords = "maxitshop, solar panels bd, inverter price bangladesh, lifepo4 battery bd, bms module, electronics parts dhaka, cash on delivery";

  try {
    const settings = await api.getSettings();
    if (settings) {
      if (settings.metaTags?.title || settings.siteName) {
        title = settings.metaTags?.title || `${settings.siteName} | ${settings.tagline || ''}`;
      }
      if (settings.metaTags?.description || settings.tagline) {
        description = settings.metaTags?.description || settings.tagline;
      }
      if (settings.metaTags?.keywords) {
        keywords = settings.metaTags.keywords;
      }
    }
  } catch (e) {
    // Keep fallback defaults
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://maxitecom.maxapi.esp32.site";

  return {
    title,
    description,
    keywords,
    authors: [{ name: "MaxiTShop" }],
    metadataBase: new URL(siteUrl),
    openGraph: {
      title,
      description,
      url: siteUrl,
      siteName: "MaxiTShop",
      locale: "en_BD",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-full flex flex-col bg-[#F8F9FA] text-gray-900 antialiased selection:bg-[#FF6600] selection:text-white">
        {children}
      </body>
    </html>
  );
}
