'use client';

import { useAuth } from '@/contexts/AuthContext';

interface PermissionGuardProps {
  children: React.ReactNode;
  permission: string;
  fallback?: React.ReactNode;
}

export default function PermissionGuard({ 
  children, 
  permission, 
  fallback = null 
}: PermissionGuardProps) {
  const { hasPermission } = useAuth();

  if (hasPermission(permission)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}

// Componente específico para secciones
interface SectionGuardProps {
  children: React.ReactNode;
  section: string;
  fallback?: React.ReactNode;
}

export function SectionGuard({ 
  children, 
  section, 
  fallback = null 
}: SectionGuardProps) {
  const { canViewSection } = useAuth();

  if (canViewSection(section)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}

// Componente para acciones específicas
interface ActionGuardProps {
  children: React.ReactNode;
  action: 'create' | 'edit' | 'delete' | 'import';
  resource: string;
  fallback?: React.ReactNode;
}

export function ActionGuard({ 
  children, 
  action, 
  resource, 
  fallback = null 
}: ActionGuardProps) {
  const { canCreate, canEdit, canDelete, canImport } = useAuth();

  let hasPermission = false;
  
  switch (action) {
    case 'create':
      hasPermission = canCreate(resource);
      break;
    case 'edit':
      hasPermission = canEdit(resource);
      break;
    case 'delete':
      hasPermission = canDelete(resource);
      break;
    case 'import':
      hasPermission = canImport();
      break;
    default:
      hasPermission = false;
  }

  console.log(`🔍 ActionGuard(${resource}:${action}):`, {
    hasPermission,
    action,
    resource
  });

  if (hasPermission) {
    console.log(`✅ ActionGuard permitiendo ${action} en ${resource}`);
    return <>{children}</>;
  }

  console.log(`❌ ActionGuard bloqueando ${action} en ${resource}`);
  return <>{fallback}</>;
}
