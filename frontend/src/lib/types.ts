export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  parent: string;
  image?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent: string | null;
  image?: string;
  icon?: string;
  subcategories?: Subcategory[];
}

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
  brand: string;
  stock: number;
  isNew: boolean;
  isFeatured: boolean;
  isDeal: boolean;
  images: string[];
  rating?: number;
  reviewCount?: number;
  shortDescription: string;
  description: string;
  specs: Record<string, string>;
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
  brand: string;
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
  id: string;
  title: string;
  slug: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  address: string;
  division: string;
  district: string;
  area: string;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
  paymentMethod: string;
  note?: string;
  status: 'Placed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
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
