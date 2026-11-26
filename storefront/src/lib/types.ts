export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  parent: string;
  image?: string;
  icon?: string;
  productCount?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent: string | null;
  image?: string;
  icon?: string;
  subcategories?: Subcategory[];
  children?: Category[];
  productCount?: number;
  isMother?: boolean;
  parentCategory?: Category;
  siblings?: Category[];
  description?: string;
  order?: number;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string;
  description?: string;
  isPopular?: boolean;
}

export interface Seller {
  id: string;
  name: string;
  storeName: string;
  slug: string;
  logo?: string;
  banner?: string;
  phone: string;
  email: string;
  address: string;
  rating?: number;
  ratingCount?: number;
  totalProducts?: number;
  verified?: boolean;
}

export interface PageItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  updatedAt?: string;
}

export interface SiteSetting {
  id?: string;
  siteName: string;
  tagline: string;
  logo: string;
  footerLogo?: string;
  favicon?: string;
  phone?: string;
  phone1?: string;
  phone2?: string;
  email: string;
  address: string;
  facebookUrl?: string;
  youtubeUrl?: string;
  instagramUrl?: string;
  whatsappNumber?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    whatsapp?: string;
    messenger?: string;
    linkedin?: string;
  };
  deliveryRates?: {
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
  navLinks?: Array<{ label: string; url: string; isExternal?: boolean }>;
  hero?: {
    badge: string;
    headline: string;
    subheadline: string;
    primaryBtnText: string;
    primaryBtnUrl: string;
    secondaryBtnText: string;
    secondaryBtnUrl: string;
    trustFeatures: Array<{ title: string; description: string; icon: string }>;
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
  policies?: {
    terms?: string;
    privacy?: string;
    returnPolicy?: string;
    warranty?: string;
    shipping?: string;
  };
  metaTags?: {
    title?: string;
    description?: string;
    keywords?: string;
  };
}

export interface StoreConfig {
  pointsEnabled: boolean;
  pointsDivisor: number;
}

export const defaultStoreConfig: StoreConfig = {
  pointsEnabled: false,
  pointsDivisor: 1000,
};

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  link: string;
  badge?: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  price: number;
  oldPrice?: number;
  category: string;
  categoryName?: string;
  subcategory?: string;
  subcategoryName?: string;
  brand: string;
  stock: number;
  isNew: boolean;
  isFeatured: boolean;
  isDeal: boolean;
  image?: string;
  images: string[];
  rating?: number;
  reviewCount?: number;
  shortDescription: string;
  description: string;
  productCode?: string;
  keyFeatures?: string[];
  warranty?: string;
  specs: Record<string, any>;
  relatedProducts?: Product[];
}

export interface Review {
  id: string;
  productSlug: string;
  productId: string;
  author: string;
  rating: number;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: string;
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface ProductReviewsResponse {
  reviews: Review[];
  summary: ReviewSummary;
}

export interface ProductsResponse {
  items: Product[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filterMeta?: {
    availableBrands: string[];
  };
}

export interface SearchSuggestion {
  id: string;
  title: string;
  slug: string;
  price: number;
  oldPrice?: number;
  image: string;
  category: string;
  categoryName?: string;
  subcategory?: string;
  subcategoryName?: string;
  brand: string;
  productCode?: string;
}

export interface CartItem {
  id: string;
  title: string;
  slug: string;
  price: number;
  oldPrice?: number;
  image: string;
  quantity: number;
}

export interface OrderItem {
  id?: string;
  productId?: string;
  title: string;
  slug?: string;
  price: number;
  quantity: number;
  image: string;
  variation?: string;
  variant?: string;
  specs?: Record<string, any>;
}

export interface OrderTimeline {
  status: string;
  note?: string;
  timestamp: string;
  _id?: string;
}

export interface OrderCustomer {
  name?: string;
  phone?: string;
  email?: string;
  division?: string;
  district?: string;
  thana?: string;
  address?: string;
  area?: string;
  notes?: string;
}

export interface OrderCourier {
  provider?: string;
  trackingCode?: string;
  consignmentId?: string;
  status?: string;
}

export interface Order {
  id?: string;
  _id?: string;
  orderNumber: string;
  customerName?: string;
  phone?: string;
  address?: string;
  division?: string;
  district?: string;
  area?: string;
  customer?: OrderCustomer;
  courier?: OrderCourier;
  timeline?: OrderTimeline[];
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  discount?: number;
  total: number;
  paymentMethod: string;
  paymentStatus?: string;
  note?: string;
  status: 'Placed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | string;
  createdAt: string;
  updatedAt?: string;
}

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  lowStockCount: number;
  lowStockProducts: {
    id: string;
    title: string;
    stock: number;
    category: string;
    price: number;
  }[];
}

export interface AdminUser {
  name: string;
  email: string;
  role: string;
}

export interface AdminAuthResponse {
  token: string;
  user: AdminUser;
}

export interface CouponVerifyResult {
  valid: boolean;
  code: string;
  description?: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  discountAmount: number;
  message?: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount: number;
  startDate?: string;
  expiryDate?: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
}
