const { orders, products } = require('../data/mock');

const getAdminOrders = async () => {
  return orders;
};

const updateOrderStatus = async (id, status) => {
  const validStatuses = ['Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  if (!validStatuses.includes(status)) {
    const error = new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  const order = orders.find(o => o.id === id || o.orderNumber === id);
  if (!order) {
    const error = new Error(`Order not found with identifier: ${id}`);
    error.statusCode = 404;
    throw error;
  }

  order.status = status;
  order.updatedAt = new Date().toISOString();

  return order;
};

const createProduct = async (productData) => {
  const { title, price, category, brand, stock = 10, images = [], shortDescription = '', description = '', specs = {} } = productData;

  if (!title || !price || !category || !brand) {
    const error = new Error('Title, price, category, and brand are required');
    error.statusCode = 400;
    throw error;
  }

  const slug = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const newProduct = {
    id: `prod-${Date.now()}`,
    title,
    slug: `${slug}-${Math.floor(100 + Math.random() * 900)}`,
    price: parseFloat(price),
    oldPrice: productData.oldPrice ? parseFloat(productData.oldPrice) : undefined,
    category,
    brand,
    stock: parseInt(stock, 10) || 0,
    isNew: productData.isNew !== undefined ? Boolean(productData.isNew) : true,
    isFeatured: Boolean(productData.isFeatured),
    isDeal: Boolean(productData.isDeal),
    images: Array.isArray(images) && images.length > 0 ? images : ['https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&q=80'],
    shortDescription,
    description,
    specs
  };

  products.unshift(newProduct);
  return newProduct;
};

const updateProduct = async (id, productData) => {
  const index = products.findIndex(p => p.id === id || p.slug === id);
  if (index === -1) {
    const error = new Error(`Product not found: ${id}`);
    error.statusCode = 404;
    throw error;
  }

  const existing = products[index];
  const updated = {
    ...existing,
    ...productData,
    id: existing.id // keep id immutable
  };

  if (productData.price) updated.price = parseFloat(productData.price);
  if (productData.oldPrice !== undefined) updated.oldPrice = parseFloat(productData.oldPrice);
  if (productData.stock !== undefined) updated.stock = parseInt(productData.stock, 10);

  products[index] = updated;
  return updated;
};

const deleteProduct = async (id) => {
  const index = products.findIndex(p => p.id === id || p.slug === id);
  if (index === -1) {
    const error = new Error(`Product not found: ${id}`);
    error.statusCode = 404;
    throw error;
  }

  const deleted = products.splice(index, 1)[0];
  return deleted;
};

const getDashboardStats = async () => {
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'Cancelled' ? o.total : 0), 0);
  const lowStockProducts = products.filter(p => p.stock < 10);

  return {
    totalOrders,
    totalRevenue,
    totalProducts: products.length,
    lowStockCount: lowStockProducts.length,
    lowStockProducts: lowStockProducts.map(p => ({
      id: p.id,
      title: p.title,
      stock: p.stock,
      category: p.category,
      price: p.price
    }))
  };
};

const adminLogin = async ({ email, password }) => {
  const jwt = require('jsonwebtoken');
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const jwtSecret = process.env.JWT_SECRET;

  if (!adminEmail || !adminPassword || !jwtSecret) {
    const error = new Error('Server configuration error: ADMIN_EMAIL, ADMIN_PASSWORD or JWT_SECRET is not configured');
    error.statusCode = 500;
    throw error;
  }

  if (!email || !password) {
    const error = new Error('Email and password are required');
    error.statusCode = 400;
    throw error;
  }

  const cleanInput = email.trim().toLowerCase();
  const validEmail = adminEmail.trim().toLowerCase();

  if (cleanInput !== validEmail || password !== adminPassword) {
    const error = new Error('Invalid email or password credentials');
    error.statusCode = 401;
    throw error;
  }

  const jwtToken = jwt.sign({ role: 'admin', email: adminEmail }, jwtSecret, { expiresIn: '7d' });

  return {
    token: jwtToken,
    user: {
      name: 'MaxiTShop Administrator',
      email: adminEmail,
      role: 'admin'
    }
  };
};

const verifyAdminSession = async (token) => {
  const jwt = require('jsonwebtoken');
  const jwtSecret = process.env.JWT_SECRET;

  if (!token || !jwtSecret) {
    const error = new Error('Invalid or expired admin session token');
    error.statusCode = 401;
    throw error;
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    return {
      valid: true,
      user: {
        name: 'MaxiTShop Administrator',
        email: decoded.email,
        role: decoded.role
      }
    };
  } catch (err) {
    const error = new Error('Invalid or expired admin session token');
    error.statusCode = 401;
    throw error;
  }
};

module.exports = {
  adminLogin,
  verifyAdminSession,
  getAdminOrders,
  updateOrderStatus,
  createProduct,
  updateProduct,
  deleteProduct,
  getDashboardStats
};
