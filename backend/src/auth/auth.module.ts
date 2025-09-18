import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { MicrosoftStrategy } from './strategies/microsoft.strategy';
import { UsersModule } from '../users/users.module';
import { PrismaService } from '../prisma.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
    UsersModule,
  ],
  controllers: [AuthController, RolesController],
  providers: [
    AuthService,
    RolesService,
    JwtStrategy,
    MicrosoftStrategy,
    PrismaService,
  ],
  exports: [AuthService, RolesService],
})
export class AuthModule {} 