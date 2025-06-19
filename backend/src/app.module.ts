import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InventoryModule } from './inventory/inventory.module';
import { ClasificacionModule } from './clasificacion/clasificacion.module';
import { ColaboradoresModule } from './colaboradores/colaboradores.module';
import { InventarioRelacionalModule } from './inventario-relacional/inventario-relacional.module';

@Module({
  imports: [
    InventoryModule,
    ClasificacionModule,
    ColaboradoresModule,
    InventarioRelacionalModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
