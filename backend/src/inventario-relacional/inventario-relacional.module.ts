import { Module } from '@nestjs/common';
import { InventarioRelacionalService } from './inventario-relacional.service';
import { PrismaService } from '../prisma.service';
import { InventarioRelacionalController } from './inventario-relacional.controller';

@Module({
  controllers: [InventarioRelacionalController],
  providers: [InventarioRelacionalService, PrismaService],
  exports: [InventarioRelacionalService]
})
export class InventarioRelacionalModule {}
