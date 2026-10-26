import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import { ProductInteractiveView } from '@/components/shop/ProductInteractiveView';
import { ProductCard } from '@/components/shop/ProductCard';
import { ChevronRight, Home } from 'lucide-react';
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
    <div className="max-w-7xl mx-auto px-4 py-6">
      
      {/* JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <nav className="flex items-center text-xs text-slate-500 mb-5 gap-1.5 overflow-x-auto whitespace-nowrap">
        <Link href="/" className="hover:text-blue-600 flex items-center gap-1">
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <Link href={`/category/${product.category}`} className="hover:text-blue-600 capitalize">
          {product.category.replace(/-/g, ' ')}
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-400" />
        <span className="font-semibold text-slate-900 line-clamp-1">{product.title}</span>
      </nav>

      {/* Main Interactive Product View */}
      <ProductInteractiveView product={product} />

      {/* Related Products Section */}
      {product.relatedProducts && product.relatedProducts.length > 0 && (
        <section className="mt-12 pt-8 border-t border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Related Products
              </h2>
              <p className="text-xs text-slate-500">Other popular items from {product.category.replace(/-/g, ' ')}</p>
            </div>
            <Link
              href={`/category/${product.category}`}
              className="text-xs font-bold text-blue-600 hover:text-blue-800"
            >
              View Full Category →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {product.relatedProducts.map(rel => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
