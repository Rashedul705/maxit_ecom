import {
  Category,
  Banner,
  Brand,
  Seller,
  PageItem,
  SiteSetting,
  Product,
  ProductsResponse,
  SearchSuggestion,
  Order,
  DashboardStats,
  AdminAuthResponse,
  AdminUser,
  Review,
  ProductReviewsResponse
} from './types';

const getApiBase = () => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== 'undefined' && window.location.hostname.includes('esp32.site')) {
    return 'https://maxitecomapi.maxapi.esp32.site/api/v1';
  }
  return 'http://localhost:5002/api/v1';
};

const API_BASE = getApiBase();

async function fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const res = await fetch(url, {
    ...options,
    headers: defaultHeaders,
    cache: options.cache || 'no-store'
  });

  const json = await res.json();

  if (!res.ok || !json.success) {
    const errorMsg = json.message || `Request failed with status ${res.status}`;
    const err = new Error(errorMsg);
    (err as unknown as { status: number }).status = res.status;
    throw err;
  }

  return json.data as T;
}

export const api = {
  // Categories
  getCategories: () => fetchJson<Category[]>(`${API_BASE}/categories`),
  getCategory: (slug: string) => fetchJson<Category>(`${API_BASE}/categories/${slug}`),

  // Banners
  getBanners: () => fetchJson<Banner[]>(`${API_BASE}/banners`),

  // Brands
  getBrands: () => fetchJson<Brand[]>(`${API_BASE}/brands`),
  getBrand: (slug: string) => fetchJson<Brand>(`${API_BASE}/brands/${slug}`),

  // Sellers
  getSellers: () => fetchJson<Seller[]>(`${API_BASE}/sellers`),
  getSeller: (slug: string) => fetchJson<Seller>(`${API_BASE}/sellers/${slug}`),

  // Pages
  getPage: (slug: string) => fetchJson<PageItem>(`${API_BASE}/pages/${slug}`),

  // Settings
  getSettings: () => fetchJson<SiteSetting>(`${API_BASE}/settings`),

  // Complaints
  submitComplaint: (data: { customerName: string; phone: string; email?: string; orderNumber?: string; category: string; description: string; photo?: string }) =>
    fetchJson<{ id: string; ticketNumber: string }>(`${API_BASE}/complaints`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Newsletter
  subscribeNewsletter: (email: string) =>
    fetchJson<{ email: string }>(`${API_BASE}/subscribers`, {
      method: 'POST',
      body: JSON.stringify({ email })
    }),

  // Products
  getProducts: (params: {
    category?: string;
    search?: string;
    brand?: string;
    minPrice?: number | string;
    maxPrice?: number | string;
    sort?: string;
    page?: number;
    limit?: number;
  } = {}) => {
    const query = new URLSearchParams();
    if (params.category) query.set('category', params.category);
    if (params.search) query.set('search', params.search);
    if (params.brand) query.set('brand', params.brand);
    if (params.minPrice !== undefined && params.minPrice !== '') query.set('minPrice', String(params.minPrice));
    if (params.maxPrice !== undefined && params.maxPrice !== '') query.set('maxPrice', String(params.maxPrice));
    if (params.sort) query.set('sort', params.sort);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));

    return fetchJson<ProductsResponse>(`${API_BASE}/products?${query.toString()}`);
  },

  getDeals: (limit = 10) => fetchJson<Product[]>(`${API_BASE}/products/deals?limit=${limit}`),
  getNewArrivals: (limit = 10) => fetchJson<Product[]>(`${API_BASE}/products/new?limit=${limit}`),
  getFeatured: (limit = 10) => fetchJson<Product[]>(`${API_BASE}/products/featured?limit=${limit}`),
  getProduct: (slug: string) => fetchJson<Product>(`${API_BASE}/products/${slug}`),
  getProductReviews: (slug: string) => fetchJson<ProductReviewsResponse>(`${API_BASE}/products/${slug}/reviews`),
  submitProductReview: (slug: string, review: { author: string; rating: number; title: string; comment: string }) =>
    fetchJson<Review>(`${API_BASE}/products/${slug}/reviews`, {
      method: 'POST',
      body: JSON.stringify(review)
    }),
  voteReviewHelpful: (reviewId: string) =>
    fetchJson<{ helpfulCount: number }>(`${API_BASE}/products/reviews/${reviewId}/helpful`, {
      method: 'POST'
    }),

  // Live Search Suggestions
  getSearchSuggestions: (q: string) => {
    if (!q || !q.trim()) return Promise.resolve([]);
    return fetchJson<SearchSuggestion[]>(`${API_BASE}/search/suggestions?q=${encodeURIComponent(q.trim())}`);
  },

  // Orders
  createOrder: (orderData: {
    customerName: string;
    phone: string;
    address: string;
    division: string;
    district: string;
    area: string;
    items: { id: string; quantity: number }[];
    paymentMethod: string;
    note?: string;
  }) => fetchJson<Order>(`${API_BASE}/orders`, {
    method: 'POST',
    body: JSON.stringify(orderData)
  }),

  trackOrder: (orderNumber?: string, phone?: string) => {
    const query = new URLSearchParams();
    if (orderNumber) query.set('orderNumber', orderNumber);
    if (phone) query.set('phone', phone);
    return fetchJson<Order[]>(`${API_BASE}/orders/track?${query.toString()}`);
  },

  // Admin Auth APIs
  adminLogin: (credentials: { email: string; password: string }) => fetchJson<AdminAuthResponse>(`${API_BASE}/admin/login`, {
    method: 'POST',
    body: JSON.stringify(credentials)
  }),

  verifyAdminSession: (token: string) => fetchJson<{ valid: boolean; user: AdminUser }>(`${API_BASE}/admin/verify`, {
    headers: { 'x-admin-token': token }
  }),

  // Admin APIs (token passed from localStorage or session)
  getAdminDashboard: (token: string) => fetchJson<DashboardStats>(`${API_BASE}/admin/dashboard`, {
    headers: { 'x-admin-token': token }
  }),

  getAdminOrders: (token: string) => fetchJson<Order[]>(`${API_BASE}/admin/orders`, {
    headers: { 'x-admin-token': token }
  }),

  updateOrderStatus: (id: string, status: string, token: string) => fetchJson<Order>(`${API_BASE}/admin/orders/${id}/status`, {
    method: 'PATCH',
    headers: { 'x-admin-token': token },
    body: JSON.stringify({ status })
  }),

  createProduct: (data: Partial<Product>, token: string) => fetchJson<Product>(`${API_BASE}/admin/products`, {
    method: 'POST',
    headers: { 'x-admin-token': token },
    body: JSON.stringify(data)
  }),

  updateProduct: (id: string, data: Partial<Product>, token: string) => fetchJson<Product>(`${API_BASE}/admin/products/${id}`, {
    method: 'PUT',
    headers: { 'x-admin-token': token },
    body: JSON.stringify(data)
  }),

  deleteProduct: (id: string, token: string) => fetchJson<Product>(`${API_BASE}/admin/products/${id}`, {
    method: 'DELETE',
    headers: { 'x-admin-token': token }
  })
};
