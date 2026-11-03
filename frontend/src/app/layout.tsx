import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "MaxiTShop | Online Shopping in Bangladesh - Solar, Inverters, Gadgets & Spares",
  description: "MaxiTShop is Bangladesh's premier e-commerce platform for Solar Energy, LiFePO4 Batteries, Inverters, Smart Gadgets, and Electronics with Cash on Delivery across all 64 districts.",
  keywords: "maxitshop, solar panels bd, inverter price bangladesh, lifepo4 battery bd, bms module, electronics parts dhaka, cash on delivery",
  authors: [{ name: "MaxiTShop" }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://maxitecom.maxapi.esp32.site"),
  openGraph: {
    title: "MaxiTShop | Online Shopping in Bangladesh",
    description: "Authentic solar equipment, inverters, batteries, and electronics with nationwide delivery.",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://maxitecom.maxapi.esp32.site",
    siteName: "MaxiTShop",
    locale: "en_BD",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MaxiTShop | Bangladesh Trusted Tech & Solar Store",
    description: "Shop solar systems, batteries, and electronic modules with cash on delivery across BD.",
  },
};

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
