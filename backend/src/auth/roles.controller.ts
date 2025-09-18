import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { RolesService } from './roles.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';

@Controller('roles')
@UseGuards(JwtAuthGuard)
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @Get()
  async getAllRoles() {
    return this.rolesService.getAllRoles();
  }

  @Get('user/:userId')
  async getUserRoles(@Param('userId') userId: number) {
    return this.rolesService.getUserRoles(userId);
  }

  @Get('user/:userId/permissions')
  @Roles('ADMIN', 'MANAGER')
  async getUserPermissions(@Param('userId') userId: number) {
    return this.rolesService.getUserPermissions(userId);
  }

  @Post('assign')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async assignRole(
    @Body() body: { userId: number; roleName: string },
    @Request() req: any
  ) {
    await this.rolesService.assignRole(body.userId, body.roleName, req.user.sub);
    return { message: 'Role assigned successfully' };
  }

  @Delete('remove')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async removeRole(@Body() body: { userId: number; roleName: string }) {
    await this.rolesService.removeRole(body.userId, body.roleName);
    return { message: 'Role removed successfully' };
  }

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN')
  async createRole(
    @Body() body: { nombre: string; descripcion: string; permisos: string[] }
  ) {
    return this.rolesService.createRole(body.nombre, body.descripcion, body.permisos);
  }

  @Get('check/:userId/:permission')
  @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER')
  async checkPermission(
    @Param('userId') userId: number,
    @Param('permission') permission: string
  ) {
    const hasPermission = await this.rolesService.hasPermission(userId, permission);
    return { hasPermission };
  }
}
