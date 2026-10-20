import {
  Category,
  Banner,
  Product,
  ProductsResponse,
  SearchSuggestion,
  Order,
  DashboardStats
} from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';

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
