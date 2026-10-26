import React from 'react';
import { api } from '@/lib/api';
import { HeroSection } from '@/components/shop/HeroSection';
import { CategoriesGrid } from '@/components/shop/CategoriesGrid';
import { HotDealsCategorySection } from '@/components/shop/HotDealsCategorySection';
import { BrandsStrip } from '@/components/shop/BrandsStrip';
import { Category, Banner, Brand, Product } from '@/lib/types';

export const revalidate = 0; // Fresh dynamic data

export default async function HomePage() {
  let categories: Category[] = [];
  let banners: Banner[] = [];
  let brands: Brand[] = [];
  let categoryGroups: { category: Category; products: Product[] }[] = [];

  try {
    const [catsData, bannersData, brandsData, prodsData] = await Promise.all([
      api.getCategories().catch(() => []),
      api.getBanners().catch(() => []),
      api.getBrands().catch(() => []),
      api.getProducts({ limit: 150 }).catch(() => ({ items: [] }))
    ]);

    categories = catsData;
    banners = bannersData;
    brands = brandsData;
    const allProducts = prodsData.items || [];

    // Group products by top categories for "Hot Deal" sections
    if (categories.length > 0 && allProducts.length > 0) {
      // Pick top 6 categories
      const targetCategories = categories.slice(0, 6);
      categoryGroups = targetCategories.map((cat) => {
        const catProducts = allProducts.filter(
          (p) => p.category === cat.slug || p.category === cat.name || (p as any).categoryName === cat.name
        );
        // Fallback: if category has few products, take slice of all products so cards are displayed
        return {
          category: cat,
          products: catProducts.length > 0 ? catProducts : allProducts.slice(0, 6)
        };
      });
    }
  } catch (err) {
    console.error('Error prefetching home page data:', err);
  }

  return (
    <div className="space-y-6 sm:space-y-10 pb-12">
      {/* 1. Hero Section: Left Category Menu + Banner Carousel */}
      <HeroSection categories={categories} banners={banners} />

      {/* 2. "Categories" Grid: Image Card + Category Name */}
      <CategoriesGrid categories={categories} />

      {/* 3. "Hot Deal" Area: Product Sections Grouped by Category with "View More" */}
      <HotDealsCategorySection groups={categoryGroups} />

      {/* 4. "Brands" Strip: Logo Cards Linking to Brand Pages */}
      <BrandsStrip brands={brands} />
    </div>
  );
}
