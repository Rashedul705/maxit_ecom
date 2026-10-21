const reviewService = require('../services/reviewService');
const { successResponse } = require('../utils/response');

const getReviews = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const data = await reviewService.getReviewsByProduct(slug);
    return successResponse(res, data, 'Reviews retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const addReview = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { author, rating, title, comment } = req.body;
    const newReview = await reviewService.addReview(slug, {
      author,
      rating,
      title,
      comment
    });
    return successResponse(res, newReview, 'Thank you! Your review has been submitted successfully.', 201);
  } catch (error) {
    next(error);
  }
};

const voteHelpful = async (req, res, next) => {
  try {
    const { id } = req.params;
    const count = await reviewService.voteHelpful(id);
    return successResponse(res, { helpfulCount: count }, 'Helpful vote recorded');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReviews,
  addReview,
  voteHelpful
};
