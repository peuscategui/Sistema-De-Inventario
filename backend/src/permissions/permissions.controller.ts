import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post('initialize')
  initializePermissions() {
    return this.permissionsService.initializePermissions();
  }

  @Get()
  getAllPermissions() {
    return this.permissionsService.getAllPermissions();
  }

  @Get('user/:userId')
  getUserPermissions(@Param('userId', ParseIntPipe) userId: number) {
    return this.permissionsService.getUserPermissions(userId);
  }

  @Post('assign')
  assignPermissionToUser(
    @Body() body: { userId: number; permissionId: number }
  ) {
    return this.permissionsService.assignPermissionToUser(
      body.userId,
      body.permissionId
    );
  }

  @Delete('remove')
  removePermissionFromUser(
    @Body() body: { userId: number; permissionId: number }
  ) {
    return this.permissionsService.removePermissionFromUser(
      body.userId,
      body.permissionId
    );
  }

  @Post('user/:userId/update')
  updateUserPermissions(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() body: { permissionIds: number[] }
  ) {
    return this.permissionsService.updateUserPermissions(userId, body.permissionIds);
  }

  @Get('check/:userId/:resource/:action')
  checkUserPermission(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('resource') resource: string,
    @Param('action') action: string
  ) {
    return this.permissionsService.checkUserPermission(userId, resource, action);
  }
} 