import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { UsersService } from '../users/users.service';
import { Role, ROLE_PERMISSIONS } from './enums/role.enum';
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
  role: Role;
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
      },
      include: {
        rol: true
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
      where: { email },
      include: {
        rol: true
      }
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
          rolId: 2, // USER por defecto
        },
        include: {
          rol: true
        }
      });
    }

    return user;
  }

  async login(user: any) {
    const role = user.rol?.nombre as Role || Role.USER;
    
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
      role: role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        isAdmin: user.isAdmin,
        role: role,
        permissions: ROLE_PERMISSIONS[role],
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

  async validateJwtPayload(payload: JwtPayload): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub }
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return user;
  }
} 