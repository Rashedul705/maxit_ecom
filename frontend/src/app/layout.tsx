import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "maxitshop | Online Shopping in Bangladesh - Solar, Laptops, Gadgets",
  description: "maxitshop is Bangladesh's trusted e-commerce platform for Solar Panels, Inverters, Laptops, Smartphones, Smart Watches, and Home Appliances with Cash on Delivery nationwide.",
  keywords: "maxitshop, bdshop, online shopping bangladesh, solar panels bd, laptops bd, smartphones dhaka, cash on delivery",
  authors: [{ name: "maxitshop" }],
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
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-blue-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
