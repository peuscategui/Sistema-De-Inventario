'use client';
import { useAuth } from '@/contexts/AuthContext';
import React from 'react';

interface SectionGuardProps {
  section: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function SectionGuard({ section, children, fallback = null }: SectionGuardProps) {
  const { canViewSection } = useAuth();
  
  if (!canViewSection(section)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

// Componentes específicos para cada sección
export function DashboardGuard({ children, fallback }: SectionGuardProps) {
  return <SectionGuard section="dashboard" children={children} fallback={fallback} />;
}

export function InventarioGuard({ children, fallback }: SectionGuardProps) {
  return <SectionGuard section="inventario" children={children} fallback={fallback} />;
}

export function BajasGuard({ children, fallback }: SectionGuardProps) {
  return <SectionGuard section="bajas" children={children} fallback={fallback} />;
}

export function ClasificacionGuard({ children, fallback }: SectionGuardProps) {
  return <SectionGuard section="clasificacion" children={children} fallback={fallback} />;
}

export function ColaboradoresGuard({ children, fallback }: SectionGuardProps) {
  return <SectionGuard section="colaboradores" children={children} fallback={fallback} />;
}

export function ArticulosGuard({ children, fallback }: SectionGuardProps) {
  return <SectionGuard section="articulos" children={children} fallback={fallback} />;
}

export function LicenciasGuard({ children, fallback }: SectionGuardProps) {
  return <SectionGuard section="licencias" children={children} fallback={fallback} />;
}

export function AdminGuard({ children, fallback }: SectionGuardProps) {
  return <SectionGuard section="admin" children={children} fallback={fallback} />;
}
