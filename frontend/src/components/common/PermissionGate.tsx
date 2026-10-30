import React from 'react';
import { useAuthStore } from '../../store/useAuthStore';

interface PermissionGateProps {
  permission?: string;
  role?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * <PermissionGate> Component
 * Conditionally renders UI elements based on user's granted permissions or roles (RBAC).
 * Superadmins automatically bypass permission checks.
 */
export const PermissionGate: React.FC<PermissionGateProps> = ({
  permission,
  role,
  children,
  fallback = null,
}) => {
  const { hasPermission, hasRole } = useAuthStore();

  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>;
  }

  if (role && !hasRole(role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
