'use client';

import React, { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';

export const PLACEHOLDER_PRODUCT_IMAGE = '/images/product-placeholder.svg';

export interface SafeImageProps extends Omit<ImageProps, 'src'> {
  src?: string | null;
  fallbackSrc?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  fallbackSrc = PLACEHOLDER_PRODUCT_IMAGE,
  className = '',
  fill,
  width,
  height,
  sizes,
  priority,
  loading,
  ...rest
}) => {
  const getInitialSrc = (inputSrc?: string | null) => {
    if (!inputSrc || typeof inputSrc !== 'string' || inputSrc.trim() === '') {
      return fallbackSrc;
    }
    const trimmed = inputSrc.trim();
    // Normalize localhost URLs that point to backend port 5002 to relative /uploads/
    const normalized = trimmed.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:5002)?\/uploads\//i, '/uploads/');
    return normalized;
  };

  const [currentSrc, setCurrentSrc] = useState<string>(() => getInitialSrc(src));
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    setCurrentSrc(getInitialSrc(src));
    setHasError(false);
  }, [src, fallbackSrc]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setCurrentSrc(fallbackSrc);
    }
  };

  const isSvgOrPlaceholder =
    currentSrc.includes('.svg') ||
    currentSrc === fallbackSrc ||
    currentSrc === PLACEHOLDER_PRODUCT_IMAGE;

  return (
    <Image
      src={currentSrc}
      alt={alt || 'Product image'}
      fill={fill}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      sizes={sizes}
      priority={priority}
      loading={priority ? undefined : loading || 'lazy'}
      className={className}
      onError={handleError}
      unoptimized={hasError || isSvgOrPlaceholder}
      {...rest}
    />
  );
};

export default SafeImage;
