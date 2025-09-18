'use client';
import { useAuth } from '@/contexts/AuthContext';
import React from 'react';

interface ImportGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ImportGuard({ children, fallback = null }: ImportGuardProps) {
  const { canImport } = useAuth();
  
  if (!canImport()) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}
