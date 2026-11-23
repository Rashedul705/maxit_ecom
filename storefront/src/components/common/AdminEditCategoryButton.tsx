'use client';

import React from 'react';
import { Edit3 } from 'lucide-react';
import { useAdminAuth } from '@/lib/useAdminAuth';

interface AdminEditCategoryButtonProps {
  categoryId?: string;
  categorySlug: string;
}

export const AdminEditCategoryButton: React.FC<AdminEditCategoryButtonProps> = ({ categoryId, categorySlug }) => {
  const isAdmin = useAdminAuth();

  if (!isAdmin) return null;

  return (
    <a
      href={`/admin?tab=categories&edit=${categoryId || categorySlug}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
      title="Edit Category in Admin Panel"
    >
      <Edit3 className="w-3.5 h-3.5" />
      <span>Edit Category</span>
    </a>
  );
};
