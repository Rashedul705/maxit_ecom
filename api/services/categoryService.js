const { categories } = require('../data/mock');

const getCategoriesTree = async () => {
  const parentCategories = categories.filter(c => !c.parent);
  return parentCategories.map(parent => {
    const subcategories = categories.filter(c => c.parent && c.parent.toLowerCase() === parent.slug.toLowerCase());
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
  if (!slug) return null;
  const target = slug.toLowerCase();
  const category = categories.find(c => c.slug.toLowerCase() === target);
  if (!category) return null;
  const subcategories = categories.filter(c => c.parent && c.parent.toLowerCase() === category.slug.toLowerCase());
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
