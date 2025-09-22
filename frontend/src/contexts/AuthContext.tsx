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
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  canViewSection: (section: string) => boolean;
  canCreate: (resource: string) => boolean;
  canEdit: (resource: string) => boolean;
  canDelete: (resource: string) => boolean;
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
            
            // Debug: Mostrar información del usuario
            console.log('🔍 Usuario verificado:', {
              email: data.user.email,
              username: data.user.username,
              fullName: data.user.fullName,
              isAdmin: data.user.isAdmin
            });
            
            // Usar roles tal como vienen del backend
            console.log('🔍 Roles desde backend:', data.user.roles);
            
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
        
        // Debug: Mostrar información del usuario
        console.log('🔍 Usuario logueado:', {
          email: data.user.email,
          username: data.user.username,
          fullName: data.user.fullName,
          isAdmin: data.user.isAdmin
        });
        
        // Usar roles tal como vienen del backend
        console.log('🔍 Roles desde backend:', data.user.roles);
        
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

  // Función para verificar si el usuario tiene un rol específico
  const hasRole = (role: string): boolean => {
    return user?.roles?.includes(role) || false;
  };

  // Función para verificar permisos basada en roles
  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    
    // SUPER_ADMIN tiene todos los permisos
    if (hasRole('SUPER_ADMIN')) return true;
    
    // Verificar permisos específicos
    return permissions.some(p => 
      p.resource === permission.split(':')[0] && 
      p.action === permission.split(':')[1]
    );
  };

  // Función para verificar si puede ver una sección
  const canViewSection = (section: string): boolean => {
    if (!user) return false;
    
    // SUPER_ADMIN puede ver todo
    if (hasRole('SUPER_ADMIN')) return true;
    
    // ADMIN puede ver todo excepto administración de usuarios
    if (hasRole('ADMIN')) {
      return section !== 'admin';
    }
    
    // USER puede ver todo excepto admin y análisis financiero
    if (hasRole('USER')) {
      return !['admin', 'analisis-financiero'].includes(section);
    }
    
    // VIEWER solo puede ver secciones específicas
    if (hasRole('VIEWER')) {
      return ['dashboard', 'inventario', 'bajas', 'donaciones', 'articulos', 'colaboradores', 'clasificacion'].includes(section);
    }
    
    return false;
  };

  // Función para verificar si puede crear
  const canCreate = (resource: string): boolean => {
    if (!user) return false;
    
    const canCreateResult = hasRole('SUPER_ADMIN') || 
      (hasRole('ADMIN') && resource !== 'users') || 
      (hasRole('USER') && ['inventario', 'articulos', 'colaboradores', 'clasificacion'].includes(resource));
    
    console.log(`🔍 canCreate(${resource}):`, {
      user: user.email,
      roles: user.roles,
      hasRoleSUPER_ADMIN: hasRole('SUPER_ADMIN'),
      hasRoleADMIN: hasRole('ADMIN'),
      hasRoleUSER: hasRole('USER'),
      result: canCreateResult
    });
    
    return canCreateResult;
  };

  // Función para verificar si puede editar
  const canEdit = (resource: string): boolean => {
    if (!user) return false;
    
    const canEditResult = hasRole('SUPER_ADMIN') || 
      (hasRole('ADMIN') && resource !== 'users') || 
      (hasRole('USER') && ['inventario', 'articulos', 'colaboradores', 'clasificacion'].includes(resource));
    
    console.log(`🔍 canEdit(${resource}):`, {
      user: user.email,
      roles: user.roles,
      hasRoleSUPER_ADMIN: hasRole('SUPER_ADMIN'),
      hasRoleADMIN: hasRole('ADMIN'),
      hasRoleUSER: hasRole('USER'),
      result: canEditResult
    });
    
    return canEditResult;
  };

  // Función para verificar si puede eliminar
  const canDelete = (resource: string): boolean => {
    if (!user) return false;
    
    // Solo SUPER_ADMIN puede eliminar usuarios, ADMIN puede eliminar otros recursos
    return hasRole('SUPER_ADMIN') || (hasRole('ADMIN') && resource !== 'users');
  };

  // Función para verificar si puede importar
  const canImport = (): boolean => {
    if (!user) return false;
    
    // Solo SUPER_ADMIN y ADMIN pueden importar
    return hasRole('SUPER_ADMIN') || hasRole('ADMIN');
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
      canViewSection,
      canCreate,
      canEdit,
      canDelete,
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