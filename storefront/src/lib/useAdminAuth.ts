'use client';

import { useState, useEffect } from 'react';

export function useAdminAuth() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('maxit_admin_token') : null;
      if (token) {
        setIsAdmin(true);
        fetch('/api/v1/admin/verify', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-admin-token': token
          }
        })
          .then(res => res.json())
          .then(data => {
            if (!data?.success || !data?.data?.valid) {
              setIsAdmin(false);
            }
          })
          .catch(() => {});
      } else {
        setIsAdmin(false);
      }
    } catch {
      setIsAdmin(false);
    }
  }, []);

  return isAdmin;
}
