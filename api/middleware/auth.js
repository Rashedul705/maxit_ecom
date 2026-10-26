const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/response');

const requireAdminAuth = (req, res, next) => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    return errorResponse(res, 'Server configuration error: JWT_SECRET is not configured', 500);
  }

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

  try {
    const decoded = jwt.verify(token, jwtSecret);
    if (!decoded || decoded.role !== 'admin') {
      return errorResponse(res, 'Forbidden: Insufficient admin privileges', 403);
    }
    req.admin = decoded;
    return next();
  } catch (err) {
    return errorResponse(res, 'Unauthorized: Invalid or expired admin session token', 401);
  }
};

module.exports = {
  requireAdminAuth
};
