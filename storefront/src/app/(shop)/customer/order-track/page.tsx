'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

function RedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const q = searchParams.toString();
    router.replace(`/track-order${q ? `?${q}` : ''}`);
  }, [router, searchParams]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center text-xs text-gray-400">
      <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#FF6600] mb-2" />
      <span>Redirecting to order tracking portal...</span>
    </div>
  );
}

export default function CustomerOrderTrackPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto px-4 py-16 text-center text-xs text-gray-400">
          Loading...
        </div>
      }
    >
      <RedirectContent />
    </Suspense>
  );
}
