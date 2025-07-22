import { Module } from '@nestjs/common';
import { GerenciasService } from './gerencias.service';
import { GerenciasController } from './gerencias.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [GerenciasController],
  providers: [GerenciasService, PrismaService],
  exports: [GerenciasService],
})
export class GerenciasModule {} 