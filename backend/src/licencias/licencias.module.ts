import { Module } from '@nestjs/common';
import { LicenciasService } from './licencias.service';
import { LicenciasController } from './licencias.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [LicenciasController],
  providers: [LicenciasService, PrismaService],
  exports: [LicenciasService],
})
export class LicenciasModule {} 