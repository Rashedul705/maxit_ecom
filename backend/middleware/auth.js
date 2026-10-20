const { errorResponse } = require('../utils/response');

const requireAdminAuth = (req, res, next) => {
  const adminToken = process.env.ADMIN_TOKEN || 'admin_secret_token_123';
  const authHeader = req.headers['authorization'];
  const customHeader = req.headers['x-admin-token'];

  let token = null;
  if (customHeader) {
    token = customHeader;
  } else if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token || token !== adminToken) {
    return errorResponse(res, 'Unauthorized: Invalid or missing admin token', 401);
  }

  next();
};

module.exports = {
  requireAdminAuth
};
