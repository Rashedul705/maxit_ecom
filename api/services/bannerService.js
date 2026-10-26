const { banners } = require('../data/mock');

const getBanners = async () => {
  return banners;
};

module.exports = {
  getBanners
};
