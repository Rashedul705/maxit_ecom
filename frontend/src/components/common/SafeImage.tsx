'use client';

import React, { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';

export const PLACEHOLDER_PRODUCT_IMAGE = '/images/product-placeholder.svg';

export interface SafeImageProps extends Omit<ImageProps, 'src'> {
  src?: string | null;
  fallbackSrc?: string;
}

type LoadStage = 'direct' | 'proxy' | 'fallback';

function normalizeInitialSrc(inputSrc?: string | null): string {
  if (!inputSrc || typeof inputSrc !== 'string' || inputSrc.trim() === '') {
    return '';
  }
  const trimmed = inputSrc.trim();
  // Normalize localhost URLs that point to backend port 5002 to relative /uploads/
  return trimmed.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:5002)?\/uploads\//i, '/uploads/');
}

function isRemoteHttpUrl(url: string): boolean {
  return /^https?:\/\//i.test(url) && !/^https?:\/\/(localhost|127\.0\.0\.1)/i.test(url);
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
  const normalized = normalizeInitialSrc(src);
  const initialIsEmpty = !normalized || normalized === fallbackSrc || normalized === PLACEHOLDER_PRODUCT_IMAGE;

  const [stage, setStage] = useState<LoadStage>(initialIsEmpty ? 'fallback' : 'direct');

  useEffect(() => {
    const nextNormalized = normalizeInitialSrc(src);
    const nextEmpty = !nextNormalized || nextNormalized === fallbackSrc || nextNormalized === PLACEHOLDER_PRODUCT_IMAGE;
    setStage(nextEmpty ? 'fallback' : 'direct');
  }, [src, fallbackSrc]);

  const currentSrc =
    stage === 'direct' && normalized
      ? normalized
      : stage === 'proxy' && normalized && isRemoteHttpUrl(normalized)
        ? `/api/v1/upload/proxy-image?url=${encodeURIComponent(normalized)}`
        : fallbackSrc;

  const handleError = () => {
    if (stage === 'direct' && normalized && isRemoteHttpUrl(normalized)) {
      setStage('proxy');
    } else if (stage !== 'fallback') {
      setStage('fallback');
    }
  };

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
      unoptimized={true}
      {...rest}
    />
  );
};

export default SafeImage;
