import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  Res,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Post('login')
  async login(@Body() loginDto: { username: string; password: string }) {
    const user = await this.authService.validateLocalUser(
      loginDto.username,
      loginDto.password,
    );

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return this.authService.login(user);
  }

  @Get('microsoft')
  @UseGuards(AuthGuard('microsoft'))
  async microsoftAuth(@Request() req: any) {
    // La redirección a Microsoft se maneja automáticamente por Passport
    // Este método nunca se ejecuta directamente
  }

  @Get('microsoft/callback')
  @UseGuards(AuthGuard('microsoft'))
  async microsoftCallback(
    @Request() req: any,
    @Res() res: Response,
  ) {
    try {
      this.logger.log('Callback de Microsoft recibido');
      
      const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
      this.logger.log(`Frontend URL: ${frontendUrl}`);
      
      if (!req.user) {
        this.logger.error('No user found in Microsoft callback');
        return res.redirect(`${frontendUrl}/login?error=authentication_failed`);
      }

      this.logger.log(`Usuario recibido de Microsoft: ${JSON.stringify(req.user)}`);

      // Generar JWT token
      const authResult = await this.authService.login(req.user);
      
      this.logger.log(`Usuario autenticado: ${req.user.email}`);
      this.logger.log(`Token generado: ${authResult.access_token.substring(0, 20)}...`);
      
      // Redirigir al frontend con el token
      const redirectUrl = `${frontendUrl}/auth/callback?token=${authResult.access_token}&user=${encodeURIComponent(JSON.stringify(authResult.user))}`;
      this.logger.log(`Redirigiendo a: ${redirectUrl.substring(0, 100)}...`);
      
      res.redirect(redirectUrl);
      
    } catch (error) {
      this.logger.error('Error en callback de Microsoft:', error);
      const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/login?error=authentication_failed`);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req: any) {
    const permissions = await this.authService.getUserPermissions(req.user.id);
    return {
      user: req.user,
      permissions,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout() {
    return { message: 'Logged out successfully' };
  }
} 