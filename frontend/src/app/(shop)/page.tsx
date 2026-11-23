import React from 'react';
import { api } from '@/lib/api';
import { HeroSection } from '@/components/shop/HeroSection';
import { TrustFeaturesStrip } from '@/components/shop/TrustFeaturesStrip';
import { CategoriesGrid } from '@/components/shop/CategoriesGrid';
import { HotDealsCategorySection } from '@/components/shop/HotDealsCategorySection';
import { BrandsStrip } from '@/components/shop/BrandsStrip';
import { Category, Banner, Brand, Product, SiteSetting } from '@/lib/types';

export const revalidate = 0; // Fresh dynamic data

export default async function HomePage() {
  let categories: Category[] = [];
  let banners: Banner[] = [];
  let brands: Brand[] = [];
  let settings: SiteSetting | null = null;
  let categoryGroups: { category: Category; products: Product[] }[] = [];

  try {
    const [catsData, bannersData, brandsData, settingsData] = await Promise.all([
      api.getCategories().catch(() => []),
      api.getBanners().catch(() => []),
      api.getBrands().catch(() => []),
      api.getSettings().catch(() => null),
    ]);

    categories = catsData;
    banners = bannersData;
    brands = brandsData;
    settings = settingsData;

    // Fetch products per mother category (latest 8 products across its children)
    if (categories.length > 0) {
      const groupResults = await Promise.all(
        categories.map(async (cat) => {
          const data = await api.getProducts({ category: cat.slug, limit: 8 }).catch(() => ({ items: [] }));
          return { category: cat, products: data.items || [] };
        })
      );
      // Only include categories that actually have products
      categoryGroups = groupResults.filter((g) => g.products.length > 0);
    }
  } catch (err) {
    console.error('Error prefetching home page data:', err);
  }

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* 1. Hero Section: Left Category Menu + Banner Carousel */}
      <HeroSection categories={categories} banners={banners} hero={settings?.hero} />

      {/* 1.1 Dynamic Trust Features Strip (Admin-Editable) */}
      <TrustFeaturesStrip features={settings?.hero?.trustFeatures} />

      {/* 2. "Categories" Grid: Image Card + Category Name */}
      <CategoriesGrid categories={categories} />

      {/* 3. "Hot Deal" Area: Product Sections Grouped by Category with "View More" */}
      <HotDealsCategorySection groups={categoryGroups} />

      {/* 4. "Brands" Strip: Logo Cards Linking to Brand Pages */}
      <BrandsStrip brands={brands} />
    </div>
  );
}
