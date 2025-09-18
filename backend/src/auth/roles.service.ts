import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

export interface Role {
  id: number;
  nombre: string;
  descripcion: string;
  permisos: string[];
}

export interface UserRole {
  id: number;
  user_id: number;
  role_id: number;
  assigned_at: Date;
  assigned_by: number;
  role: Role;
}

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async getUserRoles(userId: number): Promise<UserRole[]> {
    const result = await this.prisma.$queryRaw<any[]>`
      SELECT 
        ur.id,
        ur.user_id,
        ur.role_id,
        ur.assigned_at,
        ur.assigned_by,
        r.id as role_id,
        r.nombre as role_nombre,
        r.descripcion as role_descripcion,
        r.permisos as role_permisos
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = ${userId}
    `;

    return result.map(row => ({
      id: row.id,
      user_id: row.user_id,
      role_id: row.role_id,
      assigned_at: row.assigned_at,
      assigned_by: row.assigned_by,
      role: {
        id: row.role_id,
        nombre: row.role_nombre,
        descripcion: row.role_descripcion,
        permisos: row.role_permisos
      }
    }));
  }

  async getUserPermissions(userId: number): Promise<string[]> {
    const userRoles = await this.getUserRoles(userId);
    const permissions = new Set<string>();

    userRoles.forEach(userRole => {
      if (userRole.role && userRole.role.permisos) {
        const rolePermissions = userRole.role.permisos;
        if (Array.isArray(rolePermissions)) {
          if (rolePermissions.includes('*')) {
            // Si tiene permiso de administrador, agregar todos los permisos
            permissions.add('*');
          } else {
            rolePermissions.forEach(permission => {
              permissions.add(permission);
            });
          }
        }
      }
    });

    return Array.from(permissions);
  }

  async hasPermission(userId: number, permission: string): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    return permissions.includes('*') || permissions.includes(permission);
  }

  async hasRole(userId: number, roleName: string): Promise<boolean> {
    const userRoles = await this.getUserRoles(userId);
    return userRoles.some(userRole => userRole.role.nombre === roleName);
  }

  async isAdmin(userId: number): Promise<boolean> {
    return this.hasRole(userId, 'ADMIN');
  }

  async assignRole(userId: number, roleName: string, assignedBy: number): Promise<void> {
    const role = await this.prisma.$queryRaw<{id: number}[]>`
      SELECT id FROM roles WHERE nombre = ${roleName}
    `;

    if (!role || role.length === 0) {
      throw new Error(`Role ${roleName} not found`);
    }

    await this.prisma.$executeRaw`
      INSERT INTO user_roles (user_id, role_id, assigned_at, assigned_by)
      VALUES (${userId}, ${role[0].id}, CURRENT_TIMESTAMP, ${assignedBy})
      ON CONFLICT (user_id, role_id) DO NOTHING;
    `;
  }

  async removeRole(userId: number, roleName: string): Promise<void> {
    const role = await this.prisma.$queryRaw<{id: number}[]>`
      SELECT id FROM roles WHERE nombre = ${roleName}
    `;

    if (!role || role.length === 0) {
      throw new Error(`Role ${roleName} not found`);
    }

    await this.prisma.$executeRaw`
      DELETE FROM user_roles 
      WHERE user_id = ${userId} AND role_id = ${role[0].id};
    `;
  }

  async getAllRoles(): Promise<Role[]> {
    return this.prisma.$queryRaw`
      SELECT id, nombre, descripcion, permisos
      FROM roles
      WHERE nombre != 'MANAGER'
      ORDER BY nombre;
    `;
  }

  async createRole(nombre: string, descripcion: string, permisos: string[]): Promise<Role> {
    const result = await this.prisma.$queryRaw<Role[]>`
      INSERT INTO roles (nombre, descripcion, permisos, created_at, updated_at)
      VALUES (${nombre}, ${descripcion}, ${JSON.stringify(permisos)}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id, nombre, descripcion, permisos;
    `;

    return result[0];
  }
}
