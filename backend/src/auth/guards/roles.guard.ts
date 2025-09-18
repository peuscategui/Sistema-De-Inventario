import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesService } from '../roles.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private rolesService: RolesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    console.log('🔍 RolesGuard - Required roles:', requiredRoles);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    console.log('🔍 RolesGuard - User:', user);

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Obtener roles del usuario para debug
    const userRoles = await this.rolesService.getUserRoles(user.sub);
    console.log('🔍 RolesGuard - User roles:', userRoles.map(ur => ur.role.nombre));

    // Verificar si el usuario tiene alguno de los roles requeridos
    for (const role of requiredRoles) {
      const hasRole = await this.rolesService.hasRole(user.sub, role);
      console.log(`🔍 RolesGuard - Has role ${role}:`, hasRole);
      if (hasRole) {
        console.log(`✅ RolesGuard - Access granted for role: ${role}`);
        return true;
      }
    }

    console.log('❌ RolesGuard - Access denied, no matching roles found');

    throw new ForbiddenException(`Access denied. Required roles: ${requiredRoles.join(', ')}`);
  }
}
