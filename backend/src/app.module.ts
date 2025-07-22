import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InventoryModule } from './inventory/inventory.module';
import { ClasificacionModule } from './clasificacion/clasificacion.module';
import { ColaboradoresModule } from './colaboradores/colaboradores.module';
// import { InventarioRelacionalModule } from './inventario-relacional/inventario-relacional.module'; // TEMPORALMENTE DESHABILITADO
import { PrismaService } from './prisma.service';
import { DashboardModule } from './dashboard/dashboard.module'; // Habilitado para dashboard
// import { DashboardModule } from './dashboard/dashboard.module'; // TEMPORALMENTE DESHABILITADO
import { UsersModule } from './users/users.module';
import { PermissionsModule } from './permissions/permissions.module';
import { AuthModule } from './auth/auth.module';
import { AreasModule } from './areas/areas.module';
import { GerenciasModule } from './gerencias/gerencias.module';
import { LicenciasModule } from './licencias/licencias.module';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(__dirname, '..', '.env'),
      // Debug: Mostrar la ruta del archivo .env
      load: [() => {
        console.log('🔧 CONFIG - Ruta del archivo .env:', join(__dirname, '..', '.env'));
        console.log('🔧 CONFIG - Variables Microsoft cargadas:');
        console.log('- MICROSOFT_CLIENT_ID:', process.env.MICROSOFT_CLIENT_ID || '[NO ENCONTRADO]');
        console.log('- MICROSOFT_TENANT_ID:', process.env.MICROSOFT_TENANT_ID || '[NO ENCONTRADO]');
        return {};
      }],
    }),
    AuthModule,
    InventoryModule,
    ClasificacionModule,
    ColaboradoresModule,
    // InventarioRelacionalModule, // TEMPORALMENTE DESHABILITADO
    DashboardModule, // Habilitado para dashboard
    // DashboardModule, // TEMPORALMENTE DESHABILITADO
    UsersModule,
    PermissionsModule,
    AreasModule,
    GerenciasModule,
    LicenciasModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
