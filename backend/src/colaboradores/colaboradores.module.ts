import { Module } from '@nestjs/common';
import { ColaboradoresService } from './colaboradores.service';
import { ColaboradoresController } from './colaboradores.controller';
import { PrismaService } from '../prisma.service';

@Module({
  providers: [ColaboradoresService, PrismaService],
  controllers: [ColaboradoresController]
})
export class ColaboradoresModule {}
