export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  icon: string;
  description?: string;
  order: number;
  isActive: boolean;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  price: number;
  oldPrice: number;
  category: string;
  brand: string;
  stock: number;
  images: string[];
  shortDescription?: string;
  description?: string;
  specs: Record<string, string>;
  rating?: number;
  reviewCount?: number;
  isDeal?: boolean;
  isFeatured?: boolean;
  isNewItem?: boolean;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string;
  website?: string;
  description?: string;
}

export interface Banner {
  id: string;
  title: string;
  image: string;
  link: string;
  order: number;
  active: boolean;
}

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
}

export interface OrderCustomer {
  name: string;
  phone: string;
  address: string;
  area: string;
  notes?: string;
}

export interface OrderTimeline {
  status: string;
  note: string;
  timestamp: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: OrderCustomer;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  total: number;
  paymentMethod: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  timeline: OrderTimeline[];
  createdAt: string;
}

export interface Complaint {
  id: string;
  name: string;
  phone: string;
  orderId?: string;
  description: string;
  image?: string;
  status: 'new' | 'investigating' | 'resolved';
  adminNotes?: string;
  createdAt: string;
}

export interface Seller {
  id: string;
  name: string;
  slug: string;
  logo: string;
  phone?: string;
  email?: string;
  address?: string;
  rating: number;
  totalProducts: number;
  status: string;
}

export interface PageContent {
  slug: string;
  title: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
}

export interface NavLinkItem {
  label: string;
  url: string;
  isExternal?: boolean;
}

export interface TrustFeature {
  title: string;
  description: string;
  icon: string;
}

export interface SiteSettings {
  siteName: string;
  tagline: string;
  logo: string;
  footerLogo: string;
  favicon: string;
  phone: string;
  email: string;
  address: string;

  deliveryRates: {
    insideDhaka: number;
    outsideDhaka: number;
    freeDeliveryThreshold?: number;
    insideDhakaTime?: string;
    outsideDhakaTime?: string;
    codAvailable?: boolean;
    codNote?: string;
  };

  header?: {
    showAnnouncement: boolean;
    announcementText: string;
    announcementLink: string;
    hotline: string;
    supportHours: string;
  };

  navLinks?: NavLinkItem[];

  hero?: {
    badge: string;
    headline: string;
    subheadline: string;
    primaryBtnText: string;
    primaryBtnUrl: string;
    secondaryBtnText: string;
    secondaryBtnUrl: string;
    trustFeatures: TrustFeature[];
  };

  footer?: {
    aboutText: string;
    copyrightText: string;
    newsletterTitle: string;
    newsletterSubtitle: string;
    paymentBannerText: string;
  };

  contact?: {
    phone: string;
    whatsapp: string;
    email: string;
    address: string;
    googleMapsUrl: string;
    supportHours: string;
  };

  socialLinks: {
    facebook: string;
    instagram: string;
    youtube: string;
    whatsapp: string;
    messenger: string;
    linkedin?: string;
  };

  policies?: {
    terms?: string;
    privacy?: string;
    returnPolicy?: string;
    warranty?: string;
    shipping?: string;
  };

  metaTags: {
    title: string;
    description: string;
    keywords?: string;
  };
}

export interface Subscriber {
  email: string;
  subscribedAt: string;
}

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  lowStockCount: number;
  pendingOrders: number;
  newComplaints: number;
  recentOrders: Order[];
}

// Runtime exports to support ES modules in Vite dev mode
export const Category = {};
export const Product = {};
export const Brand = {};
export const Banner = {};
export const Order = {};
export const Complaint = {};
export const Seller = {};
export const PageContent = {};
export const SiteSettings = {};
export const Subscriber = {};
export const DashboardStats = {};
