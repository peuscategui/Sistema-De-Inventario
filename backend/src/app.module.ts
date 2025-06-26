import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InventoryModule } from './inventory/inventory.module';
import { ClasificacionModule } from './clasificacion/clasificacion.module';
import { ColaboradoresModule } from './colaboradores/colaboradores.module';
import { InventarioRelacionalModule } from './inventario-relacional/inventario-relacional.module';
import { PrismaService } from './prisma.service';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    InventoryModule,
    ClasificacionModule,
    ColaboradoresModule,
    InventarioRelacionalModule,
    DashboardModule
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
