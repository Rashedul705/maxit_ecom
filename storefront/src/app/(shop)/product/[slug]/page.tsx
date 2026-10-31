import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import { ProductInteractiveView } from '@/components/shop/ProductInteractiveView';
import type { Metadata } from 'next';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await api.getProduct(slug);
    return {
      title: `${product.title} Price in Bangladesh | MaxiTShop`,
      description: `${product.shortDescription} Buy original ${product.title} at best price in BD with Cash on Delivery at MaxiTShop.`,
      openGraph: {
        title: product.title,
        description: product.shortDescription,
        images: product.images,
      }
    };
  } catch {
    return {
      title: 'Product Not Found | MaxiTShop',
    };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  let product = null;
  try {
    product = await api.getProduct(slug);
  } catch {
    notFound();
  }

  const settings = await api.getSettings().catch(() => null);

  // Fetch similar products in same category if not already populated on product
  let relatedProducts = product.relatedProducts || [];
  if ((!relatedProducts || relatedProducts.length === 0) && product.category) {
    try {
      const catProducts = await api.getProducts({ category: product.category, limit: 6 });
      relatedProducts = catProducts.items.filter(p => p.id !== product.id && p.slug !== product.slug);
    } catch {
      // ignore fallback error
    }
  }

  // Schema.org Product structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: product.images,
    description: product.shortDescription,
    brand: {
      '@type': 'Brand',
      name: product.brand
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'BDT',
      price: product.price,
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'maxitshop'
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
      
      {/* JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb: Home / [Category] / [Product Name] */}
      <nav className="flex items-center text-xs text-slate-500 mb-6 gap-2 overflow-x-auto whitespace-nowrap">
        <Link href="/" className="hover:text-[#0468D3] transition-colors font-medium">
          Home
        </Link>
        <span className="text-slate-300">/</span>
        <Link href={`/category/${product.category}`} className="hover:text-[#0468D3] capitalize transition-colors font-medium">
          {product.categoryName || product.category.replace(/-/g, ' ')}
        </Link>
        <span className="text-slate-300">/</span>
        <span className="font-semibold text-slate-800 line-clamp-1">{product.title}</span>
      </nav>

      {/* Main Interactive Product View */}
      <ProductInteractiveView
        product={product}
        settings={settings}
        relatedProducts={relatedProducts}
      />

    </div>
  );
}
