import { Module } from '@nestjs/common';
import { ClasificacionService } from './clasificacion.service';
import { ClasificacionController } from './clasificacion.controller';

@Module({
  providers: [ClasificacionService],
  controllers: [ClasificacionController]
})
export class ClasificacionModule {}
