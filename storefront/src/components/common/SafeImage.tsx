'use client';

import React, { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';

export const PLACEHOLDER_PRODUCT_IMAGE = '/images/product-placeholder.svg';

export interface SafeImageProps extends Omit<ImageProps, 'src'> {
  src?: string | null;
  fallbackSrc?: string;
}

type LoadStage = 'proxy' | 'direct' | 'fallback';

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

function isImgBbUrl(url: string): boolean {
  return /^https?:\/\/([^/]+\.)?ibb\.co(\.com)?\//i.test(url);
}

function getInitialStage(normalized: string, fallbackSrc: string): LoadStage {
  if (!normalized || normalized === fallbackSrc || normalized === PLACEHOLDER_PRODUCT_IMAGE) {
    return 'fallback';
  }
  // Route ImgBB URLs through our cached, placeholder-checked server proxy first
  // so regional ISP throttling or ImgBB's blue "service unavailable" CDN edges never appear.
  if (isImgBbUrl(normalized)) {
    return 'proxy';
  }
  return 'direct';
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
  onError: propsOnError,
  ...rest
}) => {
  const normalized = normalizeInitialSrc(src);
  const [stage, setStage] = useState<LoadStage>(() => getInitialStage(normalized, fallbackSrc));

  useEffect(() => {
    const nextNormalized = normalizeInitialSrc(src);
    setStage(getInitialStage(nextNormalized, fallbackSrc));
  }, [src, fallbackSrc]);

  const currentSrc =
    stage === 'proxy' && normalized && isRemoteHttpUrl(normalized)
      ? `/api/v1/upload/proxy-image?url=${encodeURIComponent(normalized)}`
      : stage === 'direct' && normalized
        ? normalized
        : fallbackSrc;

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (isImgBbUrl(normalized)) {
      if (stage === 'proxy') {
        setStage('direct');
        return;
      }
      if (stage !== 'fallback') {
        setStage('fallback');
        propsOnError?.(e);
      }
      return;
    }

    if (stage === 'direct' && normalized && isRemoteHttpUrl(normalized)) {
      setStage('proxy');
      return;
    }

    if (stage !== 'fallback') {
      setStage('fallback');
      propsOnError?.(e);
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
      referrerPolicy="no-referrer"
      unoptimized={true}
      {...rest}
      onError={handleError}
    />
  );
};

export default SafeImage;
