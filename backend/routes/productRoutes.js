const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/', productController.getProducts);
router.get('/deals', productController.getDeals);
router.get('/new', productController.getNew);
router.get('/featured', productController.getFeatured);
router.get('/:slug', productController.getProductBySlug);

module.exports = router;
