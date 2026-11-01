'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from './types';
import { api } from './api';

interface WishlistContextType {
  wishlist: Product[];
  wishlistIds: string[];
  wishlistCount: number;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: Product) => Promise<boolean>;
  removeFromWishlist: (productId: string) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<Product[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('maxitshop_wishlist');
      if (stored) {
        setWishlist(JSON.parse(stored));
      }

      // If customer logged in, fetch from backend
      const custRaw = localStorage.getItem('maxitshop_customer');
      if (custRaw) {
        const cust = JSON.parse(custRaw);
        if (cust?.token) {
          api.getWishlist(cust.token).then(backendItems => {
            if (backendItems && backendItems.length) {
              setWishlist(backendItems);
              localStorage.setItem('maxitshop_wishlist', JSON.stringify(backendItems));
            }
          }).catch(() => {});
        }
      }
    } catch (e) {
      console.error('Wishlist init error:', e);
    }
  }, []);

  const saveWishlist = (items: Product[]) => {
    setWishlist(items);
    try {
      localStorage.setItem('maxitshop_wishlist', JSON.stringify(items));
    } catch (e) {}
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some(p => p.id === productId || p.slug === productId);
  };

  const toggleWishlist = async (product: Product): Promise<boolean> => {
    const exists = isInWishlist(product.id);
    let updated: Product[];

    if (exists) {
      updated = wishlist.filter(p => p.id !== product.id && p.slug !== product.slug);
    } else {
      updated = [product, ...wishlist];
    }
    saveWishlist(updated);

    // Sync with backend if logged in
    try {
      const custRaw = localStorage.getItem('maxitshop_customer');
      if (custRaw) {
        const cust = JSON.parse(custRaw);
        if (cust?.token) {
          if (exists) {
            await api.removeFromWishlist(product.id, cust.token);
          } else {
            await api.addToWishlist(product.id, cust.token);
          }
        }
      }
    } catch (err) {}

    return !exists; // true if added, false if removed
  };

  const removeFromWishlist = async (productId: string) => {
    const updated = wishlist.filter(p => p.id !== productId && p.slug !== productId);
    saveWishlist(updated);

    try {
      const custRaw = localStorage.getItem('maxitshop_customer');
      if (custRaw) {
        const cust = JSON.parse(custRaw);
        if (cust?.token) {
          await api.removeFromWishlist(productId, cust.token);
        }
      }
    } catch (err) {}
  };

  const wishlistIds = wishlist.map(p => p.id);

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistIds,
        wishlistCount: wishlist.length,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

