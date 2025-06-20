import { Module } from '@nestjs/common';
import { ClasificacionService } from './clasificacion.service';
import { ClasificacionController } from './clasificacion.controller';
import { PrismaService } from '../prisma.service';

@Module({
  providers: [ClasificacionService, PrismaService],
  controllers: [ClasificacionController],
})
export class ClasificacionModule {}
