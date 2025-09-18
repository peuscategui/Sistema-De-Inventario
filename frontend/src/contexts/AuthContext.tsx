'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { API_ENDPOINTS } from '@/config/api';

interface User {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  isAdmin: boolean;
  roles?: string[];
  permissions?: string[];
}

interface Permission {
  resource: string;
  action: string;
  displayName: string;
}

interface AuthContextType {
  user: User | null;
  permissions: Permission[];
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  hasPermission: (resource: string, action: string) => boolean;
  hasRole: (role: string) => boolean;
  canCreate: () => boolean;
  canEdit: () => boolean;
  canDelete: () => boolean;
  isSuperAdmin: () => boolean;
  canManageUsers: () => boolean;
  canManagePermissions: () => boolean;
  canViewSection: (section: string) => boolean;
  canImport: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const publicRoutes = ['/login', '/auth/callback'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const isAuthenticated = !!user;

  useEffect(() => {
    const initAuth = async () => {
      if (isInitialized) return;

      const token = localStorage.getItem('access_token');
      const savedUser = localStorage.getItem('user');
      const savedPermissions = localStorage.getItem('permissions');

      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          if (savedPermissions) {
            setPermissions(JSON.parse(savedPermissions));
          }
          
          // Verificar que el token siga siendo válido
          const response = await fetch(`${API_ENDPOINTS.auth}/profile`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
            setPermissions(data.permissions || []);
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('permissions', JSON.stringify(data.permissions || []));
          } else {
            // Token inválido, limpiar datos
            logout();
          }
        } catch (error) {
          console.error('Error verifying token:', error);
          logout();
        }
      } else if (!publicRoutes.includes(pathname)) {
        // No hay token y no está en ruta pública, redirigir a login
        router.push('/login');
      }
      
      setIsInitialized(true);
      setIsLoading(false);
    };

    initAuth();
  }, [pathname, router, isInitialized]);

  const login = async (token: string) => {
    try {
      localStorage.setItem('access_token', token);
      
      const response = await fetch(`${API_ENDPOINTS.auth}/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setPermissions(data.permissions || []);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('permissions', JSON.stringify(data.permissions || []));
      } else {
        throw new Error('Failed to get user profile');
      }
    } catch (error) {
      console.error('Login error:', error);
      logout();
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setPermissions([]);
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('permissions');
    router.push('/login');
  };

  const hasPermission = (resource: string, action: string): boolean => {
    if (user?.isAdmin) return true; // Los admins tienen todos los permisos
    
    // Verificar permisos del nuevo sistema de roles
    if (user?.permissions) {
      return user.permissions.includes('*') || user.permissions.includes(`${resource}:${action}`);
    }
    
    // Fallback al sistema anterior
    return permissions.some(p => p.resource === resource && p.action === action);
  };

  const hasRole = (role: string): boolean => {
    if (!user?.roles) return false;
    return user.roles.includes(role);
  };

  const canCreate = (): boolean => {
    if (!user) return false;
    
    // SUPER_ADMIN, ADMIN y MANAGER pueden crear
    if (hasRole('SUPER_ADMIN') || hasRole('ADMIN') || hasRole('MANAGER')) {
      return true;
    }
    
    // USER y VIEWER no pueden crear
    if (hasRole('USER') || hasRole('VIEWER')) {
      return false;
    }
    
    // Fallback al sistema anterior
    if (user.isAdmin) return true;
    if (user.permissions) {
      return user.permissions.includes('*') || 
             user.permissions.some(p => p.includes('write') || p.includes('create'));
    }
    return hasPermission('inventory', 'write');
  };

  const canEdit = (): boolean => {
    if (!user) return false;
    
    // SUPER_ADMIN, ADMIN y MANAGER pueden editar
    if (hasRole('SUPER_ADMIN') || hasRole('ADMIN') || hasRole('MANAGER')) {
      return true;
    }
    
    // USER y VIEWER no pueden editar
    if (hasRole('USER') || hasRole('VIEWER')) {
      return false;
    }
    
    // Fallback al sistema anterior
    if (user.isAdmin) return true;
    if (user.permissions) {
      return user.permissions.includes('*') || 
             user.permissions.some(p => p.includes('write') || p.includes('edit'));
    }
    return hasPermission('inventory', 'write');
  };

  const canDelete = (): boolean => {
    if (!user) return false;
    
    // SUPER_ADMIN, ADMIN y MANAGER pueden eliminar
    if (hasRole('SUPER_ADMIN') || hasRole('ADMIN') || hasRole('MANAGER')) {
      return true;
    }
    
    // USER y VIEWER no pueden eliminar
    if (hasRole('USER') || hasRole('VIEWER')) {
      return false;
    }
    
    // Fallback al sistema anterior
    if (user.isAdmin) return true;
    if (user.permissions) {
      return user.permissions.includes('*') || 
             user.permissions.some(p => p.includes('delete'));
    }
    return hasPermission('inventory', 'delete');
  };

  const isSuperAdmin = (): boolean => {
    return hasRole('SUPER_ADMIN');
  };

  const canManageUsers = (): boolean => {
    // Solo SUPER_ADMIN puede gestionar usuarios
    return isSuperAdmin();
  };

  const canManagePermissions = (): boolean => {
    // Solo SUPER_ADMIN puede gestionar permisos
    return isSuperAdmin();
  };

  const canViewSection = (section: string): boolean => {
    if (!user) return false;
    
    // Si es SUPER_ADMIN o ADMIN, puede ver todo
    if (hasRole('SUPER_ADMIN') || hasRole('ADMIN')) {
      return true;
    }
    
    // Si es MANAGER, puede ver todo excepto administración
    if (hasRole('MANAGER')) {
      return section !== 'admin';
    }
    
    // Si es USER, puede ver todo excepto administración
    if (hasRole('USER')) {
      return section !== 'admin';
    }
    
    // Si es VIEWER, solo puede ver secciones específicas
    if (hasRole('VIEWER')) {
      const allowedSections = ['dashboard', 'inventario', 'bajas', 'clasificacion', 'colaboradores'];
      return allowedSections.includes(section);
    }
    
    // Fallback: si no tiene roles, usar sistema anterior
    return user.isAdmin;
  };

  const canImport = (): boolean => {
    if (!user) return false;
    
    // VIEWER y USER no pueden importar
    if (hasRole('VIEWER') || hasRole('USER')) {
      return false;
    }
    
    // Solo ADMIN, MANAGER y SUPER_ADMIN pueden importar
    return true;
  };

  // No renderizar nada mientras está cargando
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Si no está autenticado y no está en ruta pública, no renderizar
  if (!isAuthenticated && !publicRoutes.includes(pathname)) {
    return null;
  }

  return (
    <AuthContext.Provider value={{
      user,
      permissions,
      isLoading,
      isAuthenticated,
      login,
      logout,
      hasPermission,
      hasRole,
      canCreate,
      canEdit,
      canDelete,
      isSuperAdmin,
      canManageUsers,
      canManagePermissions,
      canViewSection,
      canImport,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 