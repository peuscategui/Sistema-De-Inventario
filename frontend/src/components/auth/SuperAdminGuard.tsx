'use client';

import { useAuth } from '@/contexts/AuthContext';

interface SuperAdminGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function SuperAdminGuard({ children, fallback = null }: SuperAdminGuardProps) {
  const { canManageUsers } = useAuth();

  if (!canManageUsers()) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

export function UserManagementGuard({ children, fallback = null }: SuperAdminGuardProps) {
  const { canManageUsers } = useAuth();

  if (!canManageUsers()) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

export function PermissionManagementGuard({ children, fallback = null }: SuperAdminGuardProps) {
  const { canManagePermissions } = useAuth();

  if (!canManagePermissions()) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
