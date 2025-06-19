import { Module } from '@nestjs/common';
import { ColaboradoresService } from './colaboradores.service';
import { ColaboradoresController } from './colaboradores.controller';

@Module({
  providers: [ColaboradoresService],
  controllers: [ColaboradoresController]
})
export class ColaboradoresModule {}
