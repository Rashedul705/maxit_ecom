const fs = require('fs');
const path = require('path');
const { products } = require('../data/mock');

const reviewsFilePath = path.join(__dirname, '../data/reviews.json');

// In-memory reviews store
let reviews = [];
try {
  if (fs.existsSync(reviewsFilePath)) {
    reviews = JSON.parse(fs.readFileSync(reviewsFilePath, 'utf8'));
  }
} catch (err) {
  console.error('Error loading reviews.json:', err);
  reviews = [];
}

const persistReviews = () => {
  try {
    fs.writeFileSync(reviewsFilePath, JSON.stringify(reviews, null, 2));
  } catch (err) {
    console.error('Error writing reviews.json:', err);
  }
};

// Deterministic seed generation for products without explicit reviews yet
const defaultReviewers = [
  { name: 'Tanvir Hossain', city: 'Dhaka' },
  { name: 'Sadia Rahman', city: 'Chittagong' },
  { name: 'Engr. Mahfuzul Alam', city: 'Sylhet' },
  { name: 'Nasir Uddin', city: 'Rajshahi' },
  { name: 'Farhana Kabir', city: 'Khulna' },
  { name: 'Arif Chowdhury', city: 'Gazipur' }
];

function generateDefaultReviews(product) {
  if (!product) return [];
  // Use product id or slug to deterministically pick reviewers & ratings
  const hash = (product.slug || product.id).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const rev1 = defaultReviewers[hash % defaultReviewers.length];
  const rev2 = defaultReviewers[(hash + 3) % defaultReviewers.length];

  return [
    {
      id: `seed-1-${product.id}`,
      productSlug: product.slug,
      productId: product.id,
      author: rev1.name,
      rating: 5,
      title: '100% Genuine and fast delivery',
      comment: `Received the original ${product.title} in Dhaka within 2 days with Cash on Delivery. Build quality is top-notch and working exactly as described.`,
      verifiedPurchase: true,
      helpfulCount: (hash % 12) + 2,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: `seed-2-${product.id}`,
      productSlug: product.slug,
      productId: product.id,
      author: rev2.name,
      rating: 4,
      title: 'Satisfied with the purchase',
      comment: `Good performance and clean packaging. MaxiTShop customer support confirmed the warranty details before dispatch. Very happy with the service.`,
      verifiedPurchase: true,
      helpfulCount: (hash % 6) + 1,
      createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
}

const calculateSummary = (allReviews) => {
  if (!allReviews || allReviews.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    };
  }

  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let totalScore = 0;

  for (const r of allReviews) {
    const star = Math.min(5, Math.max(1, Math.round(r.rating)));
    distribution[star] = (distribution[star] || 0) + 1;
    totalScore += r.rating;
  }

  const averageRating = Number((totalScore / allReviews.length).toFixed(1));

  return {
    averageRating,
    totalReviews: allReviews.length,
    distribution
  };
};

const getReviewsByProduct = async (slugOrId) => {
  const product = products.find(p => p.slug === slugOrId || p.id === slugOrId);

  // Custom user-submitted or seeded reviews
  const customReviews = reviews.filter(
    r => r.productSlug === slugOrId || r.productId === slugOrId || (product && (r.productSlug === product.slug || r.productId === product.id))
  );

  let finalReviews = [...customReviews];
  if (finalReviews.length === 0 && product) {
    finalReviews = generateDefaultReviews(product);
  }

  // Sort newest first
  finalReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const summary = calculateSummary(finalReviews);

  return {
    reviews: finalReviews,
    summary
  };
};

const addReview = async (slugOrId, reviewData) => {
  const { author, rating, title, comment } = reviewData;

  if (!author || author.trim().length < 2) {
    throw new Error('Author name must be at least 2 characters long');
  }

  const numericRating = Number(rating);
  if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
    throw new Error('Rating must be a number between 1 and 5');
  }

  if (!comment || comment.trim().length < 5) {
    throw new Error('Review comment must be at least 5 characters long');
  }

  const product = products.find(p => p.slug === slugOrId || p.id === slugOrId);

  const newReview = {
    id: `rev-${Date.now()}`,
    productSlug: product ? product.slug : slugOrId,
    productId: product ? product.id : slugOrId,
    author: author.trim(),
    rating: numericRating,
    title: (title || 'Great product').trim(),
    comment: comment.trim(),
    verifiedPurchase: true,
    helpfulCount: 0,
    createdAt: new Date().toISOString()
  };

  reviews.unshift(newReview);
  persistReviews();

  return newReview;
};

const voteHelpful = async (reviewId) => {
  const review = reviews.find(r => r.id === reviewId);
  if (review) {
    review.helpfulCount = (review.helpfulCount || 0) + 1;
    persistReviews();
    return review.helpfulCount;
  }
  return 1;
};

module.exports = {
  getReviewsByProduct,
  addReview,
  voteHelpful
};
