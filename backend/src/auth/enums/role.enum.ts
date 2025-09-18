export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export interface UserPermissions {
  inventario: string[];
  empleados: string[];
  dashboard: string[];
  reportes: string[];
  configuracion: string[];
}

export const ROLE_PERMISSIONS: Record<Role, UserPermissions> = {
  [Role.ADMIN]: {
    inventario: ['create', 'read', 'update', 'delete'],
    empleados: ['create', 'read', 'update', 'delete'],
    dashboard: ['read'],
    reportes: ['read', 'export'],
    configuracion: ['read', 'update'],
  },
  [Role.USER]: {
    inventario: ['read'],
    empleados: ['read'],
    dashboard: ['read'],
    reportes: ['read'],
    configuracion: [],
  },
};
