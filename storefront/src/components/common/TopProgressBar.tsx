'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export const TopProgressBar: React.FC = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // When pathname or search params change, complete the progress bar
  useEffect(() => {
    if (isLoading) {
      setProgress(100);
      const timer = setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  // Listen to clicks on internal navigation links
  useEffect(() => {
    let progressTimer: NodeJS.Timeout | null = null;
    let safetyTimer: NodeJS.Timeout | null = null;

    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      const targetAttr = target.getAttribute('target');

      // Only trigger for local, internal links that don't open in a new tab or trigger a hash/download/tel/mailto
      if (
        href &&
        href.startsWith('/') &&
        !href.startsWith('//') &&
        !href.startsWith('/#') &&
        !href.startsWith('tel:') &&
        !href.startsWith('mailto:') &&
        targetAttr !== '_blank' &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey &&
        !e.altKey
      ) {
        // If clicking the exact same URL, don't trigger loading
        const currentUrl = window.location.pathname + window.location.search;
        if (href === currentUrl) return;

        setIsLoading(true);
        setProgress(25);

        // Clear existing intervals
        if (progressTimer) clearInterval(progressTimer);
        if (safetyTimer) clearTimeout(safetyTimer);

        // Slowly advance progress
        progressTimer = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 85) {
              if (progressTimer) clearInterval(progressTimer);
              return 85;
            }
            return prev + Math.floor(Math.random() * 12) + 5;
          });
        }, 180);

        // Safety fallback: auto-complete after 6 seconds so it never gets stuck
        safetyTimer = setTimeout(() => {
          setProgress(100);
          setTimeout(() => {
            setIsLoading(false);
            setProgress(0);
          }, 300);
        }, 6000);
      }
    };

    document.addEventListener('click', handleAnchorClick);

    return () => {
      document.removeEventListener('click', handleAnchorClick);
      if (progressTimer) clearInterval(progressTimer);
      if (safetyTimer) clearTimeout(safetyTimer);
    };
  }, []);

  if (!isLoading && progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[99999] pointer-events-none transition-opacity duration-300"
      style={{ opacity: progress === 100 ? 0 : 1 }}
    >
      <div
        className="h-[3px] bg-gradient-to-r from-[#FF6600] via-[#FF8533] to-[#FFA726] shadow-[0_0_12px_rgba(255,102,0,0.85)] transition-all duration-200 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};
