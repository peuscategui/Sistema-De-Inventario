'use client';

import { useAuth } from '@/contexts/AuthContext';

interface RoleGuardProps {
  children: React.ReactNode;
  roles?: string[];
  permissions?: string[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
}

export function RoleGuard({ 
  children, 
  roles = [], 
  permissions = [], 
  requireAll = false,
  fallback = null 
}: RoleGuardProps) {
  const { user, hasPermission, hasRole } = useAuth();

  // Si no hay usuario, no mostrar nada
  if (!user) {
    return <>{fallback}</>;
  }

  // Si es admin, siempre mostrar
  if (user.isAdmin) {
    return <>{children}</>;
  }

  // Verificar roles
  let hasRequiredRole = true;
  if (roles.length > 0) {
    if (requireAll) {
      hasRequiredRole = roles.every(role => hasRole(role));
    } else {
      hasRequiredRole = roles.some(role => hasRole(role));
    }
  }

  // Verificar permisos
  let hasRequiredPermission = true;
  if (permissions.length > 0) {
    if (requireAll) {
      hasRequiredPermission = permissions.every(permission => {
        const [resource, action] = permission.split(':');
        return hasPermission(resource, action);
      });
    } else {
      hasRequiredPermission = permissions.some(permission => {
        const [resource, action] = permission.split(':');
        return hasPermission(resource, action);
      });
    }
  }

  // Si cumple con los requisitos, mostrar el contenido
  if (hasRequiredRole && hasRequiredPermission) {
    return <>{children}</>;
  }

  // Si no cumple, mostrar fallback o nada
  return <>{fallback}</>;
}

// Componentes específicos para acciones comunes
export function CreateGuard({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const { canCreate } = useAuth();
  return canCreate() ? <>{children}</> : <>{fallback}</>;
}

export function EditGuard({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const { canEdit } = useAuth();
  return canEdit() ? <>{children}</> : <>{fallback}</>;
}

export function DeleteGuard({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const { canDelete } = useAuth();
  return canDelete() ? <>{children}</> : <>{fallback}</>;
}

export function AdminGuard({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const { user } = useAuth();
  return user?.isAdmin ? <>{children}</> : <>{fallback}</>;
}
