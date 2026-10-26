import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "maxitshop | Online Shopping in Bangladesh - Solar, Inverters, Gadgets & Spares",
  description: "maxitshop is Bangladesh's premier e-commerce platform for Solar Energy, LiFePO4 Batteries, Inverters, Smart Gadgets, and Electronics with Cash on Delivery across all 64 districts.",
  keywords: "maxitshop, solar panels bd, inverter price bangladesh, lifepo4 battery bd, bms module, electronics parts dhaka, cash on delivery",
  authors: [{ name: "maxitshop" }],
  metadataBase: new URL("http://localhost:3001"),
  openGraph: {
    title: "maxitshop | Online Shopping in Bangladesh",
    description: "Authentic solar equipment, inverters, batteries, and electronics with nationwide delivery.",
    url: "http://localhost:3001",
    siteName: "maxitshop",
    locale: "en_BD",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "maxitshop | Bangladesh Trusted Tech & Solar Store",
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
