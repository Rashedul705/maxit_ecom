import React, { createContext, useContext, useMemo } from 'react';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'super_admin' | 'admin' | 'moderator' | string;
  permissions?: string[];
  isActive?: boolean;
}

export interface PermissionContextType {
  user: UserProfile | null;
  isSuperAdmin: boolean;
  permissions: string[];
  hasPermission: (key: string) => boolean;
  canAny: (keys: string[]) => boolean;
  canAll: (keys: string[]) => boolean;
}

const PermissionContext = createContext<PermissionContextType>({
  user: null,
  isSuperAdmin: false,
  permissions: [],
  hasPermission: () => false,
  canAny: () => false,
  canAll: () => false
});

export const PermissionProvider: React.FC<{ user: UserProfile | null; children: React.ReactNode }> = ({ user, children }) => {
  const isSuperAdmin = useMemo(() => {
    if (!user) return false;
    return user.role === 'super_admin' || user.role === 'admin';
  }, [user]);

  const permissions = useMemo(() => {
    if (!user) return [];
    if (isSuperAdmin) return ['*'];
    return Array.isArray(user.permissions) ? user.permissions : [];
  }, [user, isSuperAdmin]);

  const hasPermission = (key: string): boolean => {
    if (!user) return false;
    if (user.isActive === false) return false;
    if (isSuperAdmin) return true;
    if (!key) return true;
    return permissions.includes(key);
  };

  const canAny = (keys: string[]): boolean => {
    if (!user) return false;
    if (user.isActive === false) return false;
    if (isSuperAdmin) return true;
    return keys.some(k => permissions.includes(k));
  };

  const canAll = (keys: string[]): boolean => {
    if (!user) return false;
    if (user.isActive === false) return false;
    if (isSuperAdmin) return true;
    return keys.every(k => permissions.includes(k));
  };

  return (
    <PermissionContext.Provider value={{ user, isSuperAdmin, permissions, hasPermission, canAny, canAll }}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermission = () => useContext(PermissionContext);
export default PermissionContext;

