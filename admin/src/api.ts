import {
  Category,
  Product,
  Brand,
  Banner,
  Order,
  Complaint,
  Seller,
  PageContent,
  SiteSettings,
  Subscriber,
  Coupon,
  DashboardStats,
  ModeratorUser,
  ActivityLogEntry
} from './types';

const getApiBase = () => {
  if (typeof window !== 'undefined') {
    if (window.location.hostname.includes('esp32.site')) {
      return 'https://maxitecomapi.maxapi.esp32.site/api/v1';
    }
    return '/api/v1';
  }
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002/api/v1';
};

const API_BASE = getApiBase();

function getToken(): string {
  return localStorage.getItem('maxit_admin_token') || '';
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'x-admin-token': token,
    'Authorization': `Bearer ${token}`,
    ...(options.headers || {})
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    if (res.status === 401 && !endpoint.includes('/login')) {
      localStorage.removeItem('maxit_admin_token');
      localStorage.removeItem('maxit_admin_user');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('admin-logout'));
      }
    }
    throw new Error(json.message || `Request failed with status ${res.status}`);
  }
  return json.data as T;
}

export const adminApi = {
  // Auth
  login: async (creds: { email: string; password: string }) => {
    return request<{ token: string; user: { name: string; email: string; role: string } }>('/admin/login', {
      method: 'POST',
      body: JSON.stringify(creds)
    });
  },
  verify: () => request<{ valid: boolean; user: any }>('/admin/verify'),

  // Dashboard Stats
  getStats: () => request<DashboardStats>('/admin/dashboard'),

  // Categories
  getCategories: () => request<Category[]>('/categories'),
  createCategory: (data: Partial<Category>) => request<Category>('/categories', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id: string, data: Partial<Category>) => request<Category>(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCategory: (id: string) => request<{ deleted: boolean }>(`/categories/${id}`, { method: 'DELETE' }),
  bulkDeleteCategories: (ids: string[]) => request<{ deletedCount: number }>('/categories/bulk-delete', { method: 'POST', body: JSON.stringify({ ids }) }),

  // Subcategories
  getSubcategories: (categoryId: string) => request<{ id: string; name: string; slug: string }[]>(`/categories/${categoryId}/subcategories`),
  createSubcategory: (categoryId: string, data: { name: string; slug?: string }) => request<{ id: string; name: string; slug: string }>(`/categories/${categoryId}/subcategories`, { method: 'POST', body: JSON.stringify(data) }),
  updateSubcategory: (categoryId: string, subId: string, data: { name: string; slug?: string }) => request<{ id: string; name: string; slug: string }>(`/categories/${categoryId}/subcategories/${subId}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSubcategory: (categoryId: string, subId: string) => request<{ deleted: boolean }>(`/categories/${categoryId}/subcategories/${subId}`, { method: 'DELETE' }),
  bulkDeleteSubcategories: (categoryId: string, subIds: string[]) => request<{ deletedCount: number }>(`/categories/${categoryId}/subcategories/bulk-delete`, { method: 'POST', body: JSON.stringify({ subIds }) }),

  // Products
  getProducts: (params: { category?: string; subcategory?: string; brand?: string; search?: string; page?: number; limit?: number } = {}) => {
    const q = new URLSearchParams();
    if (params.category) q.set('category', params.category);
    if (params.subcategory) q.set('sub', params.subcategory);
    if (params.brand) q.set('brand', params.brand);
    if (params.search) q.set('search', params.search);
    if (params.page) q.set('page', String(params.page));
    if (params.limit) q.set('limit', String(params.limit));
    return request<{ items: Product[]; total: number; page: number; limit: number; totalPages: number }>(`/products?${q.toString()}`);
  },
  createProduct: (data: Partial<Product>) => request<Product>('/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id: string, data: Partial<Product>) => request<Product>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  quickUpdateProduct: (id: string, data: { price?: number; oldPrice?: number; stock?: number }) =>
    request<Product>(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteProduct: (id: string) => request<{ deleted: boolean }>(`/products/${id}`, { method: 'DELETE' }),
  bulkDeleteProducts: (ids: string[]) => request<{ deletedCount: number }>('/products/bulk-delete', { method: 'POST', body: JSON.stringify({ ids }) }),

  // Brands
  getBrands: () => request<Brand[]>('/brands'),
  createBrand: (data: Partial<Brand>) => request<Brand>('/brands', { method: 'POST', body: JSON.stringify(data) }),
  updateBrand: (id: string, data: Partial<Brand>) => request<Brand>(`/brands/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBrand: (id: string) => request<{ deleted: boolean }>(`/brands/${id}`, { method: 'DELETE' }),

  // Banners
  getBanners: () => request<Banner[]>('/banners'),
  createBanner: (data: Partial<Banner>) => request<Banner>('/banners', { method: 'POST', body: JSON.stringify(data) }),
  updateBanner: (id: string, data: Partial<Banner>) => request<Banner>(`/banners/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBanner: (id: string) => request<{ deleted: boolean }>(`/banners/${id}`, { method: 'DELETE' }),

  // Orders
  getOrders: (params: { status?: string; search?: string; page?: number; limit?: number } = {}) => {
    const q = new URLSearchParams();
    if (params.status) q.set('status', params.status);
    if (params.search) q.set('search', params.search);
    if (params.page) q.set('page', String(params.page));
    if (params.limit) q.set('limit', String(params.limit));
    return request<{ items: Order[]; total: number; page: number; limit: number; totalPages: number }>(`/orders?${q.toString()}`);
  },
  getOrderById: (id: string) => request<Order>(`/orders/${id}`),
  updateOrderStatus: (id: string, status: string, note?: string) =>
    request<Order>(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, note }) }),
  updateOrderAmount: (id: string, data: { total?: number; subtotal?: number; deliveryCharge?: number; discount?: number; note?: string }) =>
    request<Order>(`/orders/${id}/amount`, { method: 'PATCH', body: JSON.stringify(data) }),
  bulkUpdateOrderStatus: (ids: string[], status: string, note?: string) =>
    request<{ updatedCount: number; status: string }>('/orders/bulk-status', {
      method: 'POST',
      body: JSON.stringify({ ids, status, note })
    }),
  dispatchToCourier: (orderId: string, courier = 'Steadfast') =>
    request<{ orderId: string; courier: any; status: string; consignmentPayload: any }>(`/orders/${orderId}/courier-dispatch`, {
      method: 'POST',
      body: JSON.stringify({ courier })
    }),
  exportOrders: (params: { status?: string; search?: string } = {}) => {
    const q = new URLSearchParams();
    if (params.status) q.set('status', params.status);
    if (params.search) q.set('search', params.search);
    return request<Order[]>(`/orders/export?${q.toString()}`);
  },

  // Complaints
  getComplaints: () => request<Complaint[]>('/complaints'),
  updateComplaintStatus: (id: string, status: string, adminNotes?: string) =>
    request<Complaint>(`/complaints/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, adminNotes }) }),

  // Sellers
  getSellers: () => request<Seller[]>('/sellers'),
  createSeller: (data: Partial<Seller>) => request<Seller>('/sellers', { method: 'POST', body: JSON.stringify(data) }),

  // Static Policy Pages
  getPages: () => request<Array<{ slug: string; title: string }>>('/pages'),
  getPage: (slug: string) => request<PageContent>(`/pages/${slug}`),
  updatePage: (slug: string, data: Partial<PageContent>) => request<PageContent>(`/pages/${slug}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Site Settings
  getSettings: () => request<SiteSettings>('/settings'),
  updateSettings: (data: Partial<SiteSettings>) => request<SiteSettings>('/settings', { method: 'PUT', body: JSON.stringify(data) }),

  // Newsletter Subscribers
  getSubscribers: () => request<Subscriber[]>('/newsletter/subscribers'),

  // Coupons & Vouchers
  getCoupons: () => request<Coupon[]>('/coupons'),
  createCoupon: (data: Partial<Coupon>) => request<Coupon>('/coupons', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateCoupon: (id: string, data: Partial<Coupon>) => request<Coupon>(`/coupons/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteCoupon: (id: string) => request<{ deleted: boolean }>(`/coupons/${id}`, {
    method: 'DELETE'
  }),

  // Moderator & Permissions Management (Super Admin Only)
  getModerators: () => request<ModeratorUser[]>('/admin/moderators'),
  getModeratorById: (id: string) => request<ModeratorUser>(`/admin/moderators/${id}`),
  createModerator: (data: { name: string; email: string; phone?: string; password: string; permissions: string[]; isActive?: boolean }) =>
    request<ModeratorUser>('/admin/moderators', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateModerator: (id: string, data: { name?: string; email?: string; phone?: string; password?: string; permissions?: string[]; isActive?: boolean }) =>
    request<ModeratorUser>(`/admin/moderators/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deleteModerator: (id: string) =>
    request<{ deleted: boolean }>(`/admin/moderators/${id}`, {
      method: 'DELETE'
    }),
  getModeratorLogs: (params: { limit?: number; moderatorId?: string } = {}) => {
    const q = new URLSearchParams();
    if (params.limit) q.set('limit', String(params.limit));
    if (params.moderatorId) q.set('moderatorId', params.moderatorId);
    return request<ActivityLogEntry[]>(`/admin/moderators/logs?${q.toString()}`);
  },

  // Image Upload
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    const token = getToken();

    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: {
        'x-admin-token': token,
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Image upload failed');
    }
    return json.data.url;
  }
};
