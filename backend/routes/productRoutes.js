const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const reviewController = require('../controllers/reviewController');

router.get('/', productController.getProducts);
router.get('/deals', productController.getDeals);
router.get('/new', productController.getNew);
router.get('/featured', productController.getFeatured);
router.get('/search/suggest', productController.getSearchSuggestions);

// Review routes
router.get('/:slug/reviews', reviewController.getReviews);
router.post('/:slug/reviews', reviewController.addReview);
router.post('/reviews/:id/helpful', reviewController.voteHelpful);

router.get('/:slug', productController.getProductBySlug);

module.exports = router;
