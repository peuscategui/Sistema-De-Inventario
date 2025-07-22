import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  async initializePermissions() {
    // Recursos disponibles
    const resources = [
      { name: 'inventario', displayName: 'Inventario', description: 'Gestión de inventario de equipos' },
      { name: 'colaboradores', displayName: 'Colaboradores', description: 'Gestión de colaboradores' },
      { name: 'clasificaciones', displayName: 'Clasificaciones', description: 'Gestión de clasificaciones' },
      { name: 'articulos', displayName: 'Artículos', description: 'Gestión de artículos' },
      { name: 'dashboard', displayName: 'Dashboard', description: 'Panel de control' },
      { name: 'admin', displayName: 'Administración', description: 'Panel de administración' },
    ];

    // Acciones disponibles
    const actions = ['read', 'create', 'update', 'delete'];

    // Crear recursos si no existen
    for (const resourceData of resources) {
      const existingResource = await this.prisma.resource.findUnique({
        where: { name: resourceData.name }
      });

      if (!existingResource) {
        const resource = await this.prisma.resource.create({
          data: resourceData
        });

        // Crear permisos para cada acción
        for (const action of actions) {
          await this.prisma.permission.create({
            data: {
              action,
              resourceId: resource.id
            }
          });
        }
      }
    }

    return { message: 'Permisos inicializados correctamente' };
  }

  async getAllPermissions() {
    return this.prisma.permission.findMany({
      include: {
        resource: true
      }
    });
  }

  async getUserPermissions(userId: number) {
    return this.prisma.userPermission.findMany({
      where: { userId },
      include: {
        permission: {
          include: {
            resource: true
          }
        }
      }
    });
  }

  async assignPermissionToUser(userId: number, permissionId: number) {
    // Verificar si el usuario existe
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Verificar si el permiso existe
    const permission = await this.prisma.permission.findUnique({ where: { id: permissionId } });
    if (!permission) {
      throw new NotFoundException('Permiso no encontrado');
    }

    // Verificar si ya existe la asignación
    const existing = await this.prisma.userPermission.findUnique({
      where: {
        userId_permissionId: {
          userId,
          permissionId
        }
      }
    });

    if (existing) {
      return existing;
    }

    return this.prisma.userPermission.create({
      data: {
        userId,
        permissionId,
        granted: true
      },
      include: {
        permission: {
          include: {
            resource: true
          }
        }
      }
    });
  }

  async removePermissionFromUser(userId: number, permissionId: number) {
    const userPermission = await this.prisma.userPermission.findUnique({
      where: {
        userId_permissionId: {
          userId,
          permissionId
        }
      }
    });

    if (!userPermission) {
      throw new NotFoundException('Permiso no asignado a este usuario');
    }

    return this.prisma.userPermission.delete({
      where: {
        userId_permissionId: {
          userId,
          permissionId
        }
      }
    });
  }

  async updateUserPermissions(userId: number, permissionIds: number[]) {
    // Primero eliminar todos los permisos del usuario
    await this.prisma.userPermission.deleteMany({
      where: { userId }
    });

    // Luego crear los nuevos permisos
    const userPermissions = await Promise.all(
      permissionIds.map(permissionId =>
        this.prisma.userPermission.create({
          data: {
            userId,
            permissionId,
            granted: true
          },
          include: {
            permission: {
              include: {
                resource: true
              }
            }
          }
        })
      )
    );

    return userPermissions;
  }

  async checkUserPermission(userId: number, resource: string, action: string): Promise<boolean> {
    const userPermission = await this.prisma.userPermission.findFirst({
      where: {
        userId,
        granted: true,
        permission: {
          action,
          resource: {
            name: resource
          }
        }
      }
    });

    return !!userPermission;
  }
} 