'use client';

import React, { useState } from 'react';
import { ProductCard } from './ProductCard';
import { Product } from '@/lib/types';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface SpeciallyForYouProps {
  initialProducts: Product[];
  totalAvailable: number;
}

export const SpeciallyForYou: React.FC<SpeciallyForYouProps> = ({ initialProducts, totalAvailable }) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialProducts.length < totalAvailable);

  const loadMore = async () => {
    if (loading || !hasMore) return;
    try {
      setLoading(true);
      const nextPage = page + 1;
      const res = await api.getProducts({ page: nextPage, limit: 8 });
      if (res.items.length === 0) {
        setHasMore(false);
      } else {
        setProducts(prev => [...prev, ...res.items]);
        setPage(nextPage);
        if (products.length + res.items.length >= res.pagination.total) {
          setHasMore(false);
        }
      }
    } catch (err) {
      console.error('Failed to load more products:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {hasMore && (
        <div className="mt-8 text-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-8 py-3 bg-white hover:bg-slate-50 text-blue-600 font-bold text-sm rounded-xl border border-blue-200 hover:border-blue-400 shadow-sm transition-all inline-flex items-center gap-2 hover:shadow-md"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span>Loading more recommendations...</span>
              </>
            ) : (
              <span>Load More Products ({products.length} of {totalAvailable})</span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
