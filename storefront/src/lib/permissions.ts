/**
 * Central Permission Registry for MaxiTShop (TypeScript / Client)
 */

export interface PermissionGroup {
  id: string;
  name: string;
  description: string;
}

export interface PermissionItem {
  key: string;
  label: string;
  group: string;
  description: string;
  dependsOn?: string;
  superAdminOnly?: boolean;
}

export interface PermissionPreset {
  id: string;
  label: string;
  description: string;
  permissions: string[];
}

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    id: 'products',
    name: 'Products',
    description: 'Manage product catalog, specs, pricing, and stock'
  },
  {
    id: 'categories',
    name: 'Categories',
    description: 'Manage product categories and subcategories'
  },
  {
    id: 'orders',
    name: 'Orders',
    description: 'View customer orders, update statuses, edit invoices, and dispatch shipments'
  },
  {
    id: 'customers',
    name: 'Customers',
    description: 'Customer directory, sellers, and newsletter subscribers'
  },
  {
    id: 'reviews',
    name: 'Reviews & Complaints',
    description: 'Customer ratings, product reviews, and dispute resolution'
  },
  {
    id: 'coupons',
    name: 'Coupons & Deals',
    description: 'Discount coupons, promotional vouchers, and sale events'
  },
  {
    id: 'banners',
    name: 'Hero Banners',
    description: 'Storefront promotional sliders and featured banners'
  },
  {
    id: 'reports',
    name: 'Reports & Analytics',
    description: 'Sales summaries, revenue metrics, and performance dashboard'
  },
  {
    id: 'settings',
    name: 'Site Settings',
    description: 'Core platform settings (Super Admin Only)'
  },
  {
    id: 'users',
    name: 'User Management',
    description: 'Staff & moderator access control (Super Admin Only)'
  }
];

export const PERMISSIONS: PermissionItem[] = [
  // Products
  {
    key: 'products.view',
    label: 'View Products',
    group: 'products',
    description: 'View product catalog, inventory levels, and brands'
  },
  {
    key: 'products.create',
    label: 'Create Products',
    group: 'products',
    description: 'Add new items and upload product specifications',
    dependsOn: 'products.view'
  },
  {
    key: 'products.edit',
    label: 'Edit Products',
    group: 'products',
    description: 'Modify product details, prices, stocks, and variations',
    dependsOn: 'products.view'
  },
  {
    key: 'products.delete',
    label: 'Delete Products',
    group: 'products',
    description: 'Remove products from the store permanently',
    dependsOn: 'products.view'
  },

  // Categories
  {
    key: 'categories.view',
    label: 'View Categories',
    group: 'categories',
    description: 'Browse category hierarchy and subcategories'
  },
  {
    key: 'categories.manage',
    label: 'Manage Categories',
    group: 'categories',
    description: 'Create, edit, organize, and delete categories and subcategories',
    dependsOn: 'categories.view'
  },

  // Orders
  {
    key: 'orders.view',
    label: 'View Orders',
    group: 'orders',
    description: 'Access customer orders, logistics tracking, and print invoices'
  },
  {
    key: 'orders.update_status',
    label: 'Update Order Status',
    group: 'orders',
    description: 'Update fulfillment status, edit invoice amounts, and dispatch to couriers',
    dependsOn: 'orders.view'
  },
  {
    key: 'orders.cancel',
    label: 'Cancel Orders',
    group: 'orders',
    description: 'Mark orders as cancelled and notify customers',
    dependsOn: 'orders.view'
  },
  {
    key: 'orders.refund',
    label: 'Refund Orders',
    group: 'orders',
    description: 'Authorize and process customer refunds',
    dependsOn: 'orders.view'
  },

  // Customers
  {
    key: 'customers.view',
    label: 'View Customers',
    group: 'customers',
    description: 'Browse customer list, verified addresses, and subscribers'
  },
  {
    key: 'customers.edit',
    label: 'Edit Customers',
    group: 'customers',
    description: 'Update customer contact information or seller accounts',
    dependsOn: 'customers.view'
  },

  // Reviews & Complaints
  {
    key: 'reviews.view',
    label: 'View Reviews',
    group: 'reviews',
    description: 'Read customer reviews, ratings, and filed complaints'
  },
  {
    key: 'reviews.approve',
    label: 'Approve & Resolve',
    group: 'reviews',
    description: 'Approve or reject customer reviews and resolve complaints',
    dependsOn: 'reviews.view'
  },
  {
    key: 'reviews.delete',
    label: 'Delete Reviews',
    group: 'reviews',
    description: 'Delete inappropriate reviews or spam entries',
    dependsOn: 'reviews.view'
  },

  // Coupons
  {
    key: 'coupons.view',
    label: 'View Coupons',
    group: 'coupons',
    description: 'View active discount codes and promotional campaigns'
  },
  {
    key: 'coupons.manage',
    label: 'Manage Coupons',
    group: 'coupons',
    description: 'Create, modify, and delete promotional discount coupons',
    dependsOn: 'coupons.view'
  },

  // Banners
  {
    key: 'banners.view',
    label: 'View Banners',
    group: 'banners',
    description: 'Preview hero sliders and marketing banners'
  },
  {
    key: 'banners.manage',
    label: 'Manage Banners',
    group: 'banners',
    description: 'Upload, reorder, and activate promotional banners',
    dependsOn: 'banners.view'
  },

  // Reports
  {
    key: 'reports.view',
    label: 'View Reports',
    group: 'reports',
    description: 'Access admin dashboard analytics, revenue charts, and summaries'
  },

  // Settings (Super Admin Only)
  {
    key: 'settings.view',
    label: 'Site Settings',
    group: 'settings',
    description: 'Platform branding, contact, delivery rates, and payment credentials',
    superAdminOnly: true
  },

  // Users (Super Admin Only)
  {
    key: 'users.manage',
    label: 'Manage Moderators & Staff',
    group: 'users',
    description: 'Create moderators, configure role permissions, and view audit logs',
    superAdminOnly: true
  }
];

export const PRESETS: PermissionPreset[] = [
  {
    id: 'order_handler',
    label: 'Order Handler',
    description: 'Manage order fulfillment, shipments, and customer contacts',
    permissions: [
      'orders.view',
      'orders.update_status',
      'orders.cancel',
      'customers.view'
    ]
  },
  {
    id: 'content_editor',
    label: 'Content Editor',
    description: 'Manage products, categories, hero banners, and promotional coupons',
    permissions: [
      'products.view',
      'products.create',
      'products.edit',
      'categories.view',
      'categories.manage',
      'banners.view',
      'banners.manage',
      'coupons.view'
    ]
  },
  {
    id: 'review_moderator',
    label: 'Review Moderator',
    description: 'Moderate customer ratings, product reviews, and customer complaints',
    permissions: [
      'reviews.view',
      'reviews.approve',
      'reviews.delete'
    ]
  }
];

export const ALL_PERMISSION_KEYS = PERMISSIONS.map(p => p.key);
export const ASSIGNABLE_PERMISSIONS = PERMISSIONS.filter(p => !p.superAdminOnly);
export const ASSIGNABLE_KEYS = ASSIGNABLE_PERMISSIONS.map(p => p.key);

export function isValidPermissionKey(key: string): boolean {
  return ALL_PERMISSION_KEYS.includes(key);
}

export function isAssignablePermissionKey(key: string): boolean {
  return ASSIGNABLE_KEYS.includes(key);
}
