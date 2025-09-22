import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

export interface MicrosoftProfile {
  id: string;
  displayName: string;
  emails: Array<{ value: string }>;
  username?: string;
}

export interface JwtPayload {
  sub: number;
  username: string;
  email: string;
  isAdmin: boolean;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async validateLocalUser(username: string, password: string): Promise<any> {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email: username }
        ]
      }
    });

    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async validateMicrosoftUser(profile: MicrosoftProfile): Promise<any> {
    const email = profile.emails[0]?.value;
    if (!email) {
      throw new UnauthorizedException('No email found in Microsoft profile');
    }

    // Buscar usuario existente
    let user = await this.prisma.user.findUnique({
      where: { email }
    });

    // Si no existe, crear uno nuevo
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          username: email.split('@')[0], // Usar parte antes del @ como username
          email,
          password: await bcrypt.hash(Math.random().toString(36), 10), // Password aleatorio
          fullName: profile.displayName,
          isActive: true,
          isAdmin: false, // Por defecto no es admin
        }
      });
    }

    return user;
  }

  async login(user: any) {
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        isAdmin: user.isAdmin,
      }
    };
  }

  async getUserPermissions(userId: number) {
    const permissions = await this.prisma.userPermission.findMany({
      where: { 
        userId,
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

    return permissions.map(up => ({
      resource: up.permission.resource.name,
      action: up.permission.action,
      displayName: up.permission.resource.displayName
    }));
  }

  async getUserRoles(userId: number) {
    const result = await this.prisma.$queryRaw`
      SELECT r.nombre
      FROM public.user_roles ur
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = ${userId}
    `;

    return (result as any[]).map((row: any) => row.nombre);
  }

  async validateJwtPayload(payload: JwtPayload): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub }
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return user;
  }

  async changeUserRole(userId: number, newRole: string): Promise<any> {
    try {
      console.log(`🔄 Cambiando rol del usuario ${userId} a ${newRole}`);
      
      // Obtener el ID del rol
      const rol = await this.prisma.$queryRaw`
        SELECT id FROM public.roles WHERE nombre = ${newRole}
      `;
      
      if (!rol || (rol as any[]).length === 0) {
        throw new Error(`Rol ${newRole} no encontrado`);
      }
      
      const roleId = (rol as any[])[0].id;
      console.log(`📋 ID del rol ${newRole}: ${roleId}`);
      
      // Política: un solo rol por usuario. Eliminar roles existentes y asignar el nuevo
      await this.prisma.$executeRawUnsafe(
        'DELETE FROM public.user_roles WHERE user_id = $1',
        userId,
      );

      await this.prisma.$queryRaw`
        INSERT INTO public.user_roles (user_id, role_id)
        VALUES (${userId}, ${roleId})
      `;
      console.log(`✅ Rol asignado para usuario ${userId}`);
      
      // Verificar el cambio
      const usuarioConRol = await this.prisma.$queryRaw`
        SELECT u.id, u.username, u.email, r.nombre as rol
        FROM public.user u
        LEFT JOIN public.user_roles ur ON u.id = ur.user_id
        LEFT JOIN public.roles r ON ur.role_id = r.id
        WHERE u.id = ${userId}
      `;
      
      console.log(`📊 Usuario actualizado:`, (usuarioConRol as any[])[0]);
      
      return {
        success: true,
        message: `Rol cambiado exitosamente a ${newRole}`,
        user: (usuarioConRol as any[])[0]
      };
      
    } catch (error) {
      console.error('❌ Error al cambiar rol:', error);
      throw new Error(`Error al cambiar rol: ${error.message}`);
    }
  }
} 