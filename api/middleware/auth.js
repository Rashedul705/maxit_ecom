const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { errorResponse } = require('../utils/response');
const { isValidPermissionKey } = require('../lib/permissions');

// Helper to check if Mongo is connected
function isMongoConnected() {
  return mongoose.connection && mongoose.connection.readyState === 1;
}

/**
 * Check if a given user object has the requested permission
 * - Super Admins ('super_admin' or legacy 'admin') ALWAYS have full access and cannot be restricted.
 * - Deactivated moderators (isActive === false) have NO access.
 * - Moderators have only explicitly assigned permissions.
 */
function hasPermission(user, permissionKey) {
  if (!user) return false;

  const role = user.role;
  // Super Admin always has full access and cannot be restricted
  if (role === 'super_admin' || role === 'admin') {
    return true;
  }

  // Disabled users have no access
  if (user.isActive === false) {
    return false;
  }

  // Moderator permission check
  if (role === 'moderator') {
    if (!permissionKey) return true;
    const perms = Array.isArray(user.permissions) ? user.permissions : [];
    return perms.includes(permissionKey);
  }

  return false;
}

/**
 * Require Admin/Moderator Authentication Middleware
 * Reads user FRESH from MongoDB on EVERY request so permission changes take effect immediately
 */
const requireAdminAuth = async (req, res, next) => {
  const jwtSecret = process.env.JWT_SECRET || 'supersecretjwtkey_maxitshop_2026';

  const authHeader = req.headers['authorization'];
  const customHeader = req.headers['x-admin-token'];

  let token = null;
  if (customHeader) {
    token = customHeader;
  } else if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return errorResponse(res, 'Unauthorized: Missing admin authentication token', 401);
  }

  let decoded;
  try {
    decoded = jwt.verify(token, jwtSecret);
  } catch (err) {
    return errorResponse(res, 'Unauthorized: Invalid or expired admin session token', 401);
  }

  if (!decoded) {
    return errorResponse(res, 'Unauthorized: Invalid session', 401);
  }

  try {
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@maxitshop.com').trim().toLowerCase();
    const tokenEmail = (decoded.email || '').trim().toLowerCase();

    let freshUser = null;

    // Read FRESH user from MongoDB Atlas
    if (isMongoConnected()) {
      const User = mongoose.models.User || require('../models/User');
      if (decoded.id && decoded.id !== 'user-admin' && decoded.id !== 'usr-admin') {
        freshUser = await User.findOne({
          $or: [{ id: decoded.id }, { email: tokenEmail }]
        }).lean();
      } else {
        freshUser = await User.findOne({ email: tokenEmail }).lean();
      }
    }

    // Default Super Admin from .env
    const isEnvSuperAdmin = tokenEmail === adminEmail;

    const role = isEnvSuperAdmin
      ? 'super_admin'
      : (freshUser?.role || decoded.role);

    // Only super_admin, admin, and moderator can access admin endpoints
    if (role !== 'super_admin' && role !== 'admin' && role !== 'moderator') {
      return errorResponse(res, 'Forbidden: Insufficient privileges', 403);
    }

    // Check if moderator is active
    if (freshUser && freshUser.isActive === false) {
      return errorResponse(res, 'Forbidden: Your moderator account has been deactivated. Please contact Super Admin.', 403);
    }

    // Attach fresh user details to request
    req.admin = {
      id: freshUser?.id || decoded.id || 'usr-admin',
      name: freshUser?.name || decoded.name || 'MaxiTShop Administrator',
      email: freshUser?.email || tokenEmail,
      phone: freshUser?.phone || '',
      role: (role === 'admin' || role === 'super_admin') ? 'super_admin' : 'moderator',
      permissions: (role === 'admin' || role === 'super_admin') ? [] : (freshUser?.permissions || []),
      isActive: freshUser?.isActive !== false
    };

    return next();
  } catch (err) {
    console.error('requireAdminAuth error:', err);
    return errorResponse(res, 'Internal server error verifying admin session', 500);
  }
};

/**
 * Middleware: Require a specific permission
 * Allows Super Admin through automatically, enforces permission on moderators
 */
const requirePermission = (permissionKey) => {
  return (req, res, next) => {
    if (!req.admin) {
      return errorResponse(res, 'Unauthorized: Admin session required', 401);
    }

    if (hasPermission(req.admin, permissionKey)) {
      return next();
    }

    return errorResponse(
      res,
      `Forbidden: You do not have the required permission (${permissionKey}) to perform this action.`,
      403
    );
  };
};

/**
 * Middleware: Require Super Admin role strictly (e.g. for managing moderators or platform settings)
 */
const requireSuperAdmin = (req, res, next) => {
  if (!req.admin) {
    return errorResponse(res, 'Unauthorized: Admin session required', 401);
  }

  if (req.admin.role === 'super_admin' || req.admin.role === 'admin') {
    return next();
  }

  return errorResponse(res, 'Forbidden: This action requires Super Admin privileges.', 403);
};

const requireCustomerAuth = (req, res, next) => {
  const jwtSecret = process.env.JWT_SECRET || 'supersecretjwtkey_maxitshop_2026';
  const authHeader = req.headers['authorization'];
  let token = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return errorResponse(res, 'Unauthorized: Please log in to continue', 401);
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    return next();
  } catch (err) {
    return errorResponse(res, 'Unauthorized: Invalid or expired session token', 401);
  }
};

const optionalCustomerAuth = (req, res, next) => {
  const jwtSecret = process.env.JWT_SECRET || 'supersecretjwtkey_maxitshop_2026';
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      req.user = jwt.verify(token, jwtSecret);
    } catch (e) {}
  }
  return next();
};

module.exports = {
  hasPermission,
  requireAdminAuth,
  requirePermission,
  requireSuperAdmin,
  requireCustomerAuth,
  optionalCustomerAuth
};
