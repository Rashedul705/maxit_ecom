const { categories } = require('../data/mock');

const getCategoriesTree = async () => {
  const parentCategories = categories.filter(c => !c.parent);
  return parentCategories.map(parent => {
    const subcategories = categories.filter(c => c.parent === parent.slug);
    return {
      ...parent,
      subcategories
    };
  });
};

const getAllCategories = async () => {
  return categories;
};

const getCategoryBySlug = async (slug) => {
  const category = categories.find(c => c.slug === slug);
  if (!category) return null;
  const subcategories = categories.filter(c => c.parent === category.slug);
  return {
    ...category,
    subcategories
  };
};

module.exports = {
  getCategoriesTree,
  getAllCategories,
  getCategoryBySlug
};
