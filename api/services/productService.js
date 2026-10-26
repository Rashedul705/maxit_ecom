const { products, categories } = require('../data/mock');

const getProducts = async ({
  category,
  search,
  brand,
  minPrice,
  maxPrice,
  sort = 'newest',
  page = 1,
  limit = 12
}) => {
  let result = [...products];

  // Category filter (match parent or direct slug or subcategory)
  if (category) {
    const catSlug = category.toLowerCase().trim();
    const relatedSlugs = new Set([catSlug]);

    if (catSlug === 'solar-wind-energy' || catSlug === 'solar-green-energy') {
      relatedSlugs.add('solar-wind-energy');
      relatedSlugs.add('solar-green-energy');
    }

    // Add all subcategories under this parent
    categories
      .filter(c => c.parent && c.parent.toLowerCase() === catSlug)
      .forEach(c => relatedSlugs.add(c.slug.toLowerCase()));

    // If catSlug is itself a subcategory, also include parent's products if relevant
    const found = categories.find(c => c.slug.toLowerCase() === catSlug);
    if (found && found.parent) {
      relatedSlugs.add(found.parent.toLowerCase());
    }

    result = result.filter(p => relatedSlugs.has(p.category.toLowerCase()));
  }

  // Search filter
  if (search) {
    const q = search.toLowerCase().trim();
    result = result.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.shortDescription.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }

  // Brand filter
  if (brand) {
    const brands = brand.split(',').map(b => b.trim().toLowerCase());
    result = result.filter(p => brands.includes(p.brand.toLowerCase()));
  }

  // Price range
  if (minPrice !== undefined && minPrice !== '') {
    const min = parseFloat(minPrice);
    if (!isNaN(min)) {
      result = result.filter(p => p.price >= min);
    }
  }
  if (maxPrice !== undefined && maxPrice !== '') {
    const max = parseFloat(maxPrice);
    if (!isNaN(max)) {
      result = result.filter(p => p.price <= max);
    }
  }

  // Sorting
  if (sort === 'price-asc') {
    result.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-desc') {
    result.sort((a, b) => b.price - a.price);
  } else if (sort === 'newest') {
    // Sort by isNew flag first, then by id descending
    result.sort((a, b) => (b.isNew === true ? 1 : 0) - (a.isNew === true ? 1 : 0) || b.id.localeCompare(a.id));
  }

  const total = result.length;
  const currentPage = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = Math.max(1, parseInt(limit, 10) || 12);
  const totalPages = Math.ceil(total / pageSize);
  function attachRating(p) {
    if (!p) return p;
    const hash = (p.slug || p.id).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const rating = Number((4.5 + (hash % 5) * 0.1).toFixed(1));
    const reviewCount = 6 + (hash % 33);
    return {
      ...p,
      rating: p.rating || rating,
      reviewCount: p.reviewCount || reviewCount
    };
  }

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedItems = result.slice(startIndex, startIndex + pageSize).map(attachRating);

  // Extract available brands for filter sidebar
  const availableBrands = [...new Set(products.map(p => p.brand))];

  return {
    items: paginatedItems,
    pagination: {
      total,
      page: currentPage,
      limit: pageSize,
      totalPages,
      hasNext: currentPage < totalPages,
      hasPrev: currentPage > 1
    },
    filterMeta: {
      availableBrands
    }
  };
};

const getDeals = async (limit = 10) => {
  return products.filter(p => p.isDeal).slice(0, limit).map(p => {
    const hash = (p.slug || p.id).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return { ...p, rating: p.rating || Number((4.5 + (hash % 5) * 0.1).toFixed(1)), reviewCount: p.reviewCount || (6 + (hash % 33)) };
  });
};

const getNewArrivals = async (limit = 10) => {
  return products.filter(p => p.isNew).slice(0, limit).map(p => {
    const hash = (p.slug || p.id).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return { ...p, rating: p.rating || Number((4.5 + (hash % 5) * 0.1).toFixed(1)), reviewCount: p.reviewCount || (6 + (hash % 33)) };
  });
};

const getFeatured = async (limit = 10) => {
  return products.filter(p => p.isFeatured).slice(0, limit).map(p => {
    const hash = (p.slug || p.id).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return { ...p, rating: p.rating || Number((4.5 + (hash % 5) * 0.1).toFixed(1)), reviewCount: p.reviewCount || (6 + (hash % 33)) };
  });
};

const getProductBySlug = async (slug) => {
  const product = products.find(p => p.slug === slug || p.id === slug);
  if (!product) return null;

  const hash = (product.slug || product.id).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const rating = product.rating || Number((4.5 + (hash % 5) * 0.1).toFixed(1));
  const reviewCount = product.reviewCount || (6 + (hash % 33));

  // Find related products in same category
  const related = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 5)
    .map(p => {
      const h = (p.slug || p.id).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
      return { ...p, rating: p.rating || Number((4.5 + (h % 5) * 0.1).toFixed(1)), reviewCount: p.reviewCount || (6 + (h % 33)) };
    });

  return {
    ...product,
    rating,
    reviewCount,
    relatedProducts: related
  };
};

const getSearchSuggestions = async (q) => {
  if (!q || q.trim().length === 0) {
    return [];
  }
  const term = q.toLowerCase().trim();
  const matched = products
    .filter(p =>
      p.title.toLowerCase().includes(term) ||
      p.brand.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term)
    )
    .slice(0, 6);

  return matched.map(p => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    price: p.price,
    oldPrice: p.oldPrice,
    image: p.images[0],
    category: p.category,
    brand: p.brand
  }));
};

module.exports = {
  getProducts,
  getDeals,
  getNewArrivals,
  getFeatured,
  getProductBySlug,
  getSearchSuggestions
};
