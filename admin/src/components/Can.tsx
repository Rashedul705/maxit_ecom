import React from 'react';
import { usePermission } from '../context/PermissionContext';

interface CanProps {
  permission: string | string[];
  mode?: 'any' | 'all';
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const Can: React.FC<CanProps> = ({
  permission,
  mode = 'all',
  fallback = null,
  children
}) => {
  const { hasPermission, canAny, canAll } = usePermission();

  let allowed = false;

  if (Array.isArray(permission)) {
    allowed = mode === 'any' ? canAny(permission) : canAll(permission);
  } else {
    allowed = hasPermission(permission);
  }

  if (!allowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default Can;

