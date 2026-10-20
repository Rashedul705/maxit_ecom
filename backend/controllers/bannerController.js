const bannerService = require('../services/bannerService');
const { successResponse } = require('../utils/response');

const getBanners = async (req, res, next) => {
  try {
    const banners = await bannerService.getBanners();
    return successResponse(res, banners, 'Banners retrieved successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBanners
};
