import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { ColaboradoresService } from './colaboradores.service';

@Controller('colaboradores')
export class ColaboradoresController {
  constructor(private readonly colaboradoresService: ColaboradoresService) {}

  @Get()
  findAll() {
    return this.colaboradoresService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.colaboradoresService.findOne(Number(id));
  }

  @Post()
  create(@Body() data: any) {
    return this.colaboradoresService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.colaboradoresService.update(Number(id), data);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.colaboradoresService.delete(Number(id));
  }
}
