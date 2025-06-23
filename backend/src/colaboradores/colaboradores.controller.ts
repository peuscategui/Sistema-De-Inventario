import { Controller, Get, Post, Put, Delete, Param, Body, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { ColaboradoresService } from './colaboradores.service';
import { CreateColaboradorDto } from './dto/create-colaborador.dto';
import { UpdateColaboradorDto } from './dto/update-colaborador.dto';

@Controller('colaboradores')
export class ColaboradoresController {
  constructor(private readonly colaboradoresService: ColaboradoresService) {}

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
    @Query('nombre') nombre?: string,
    @Query('cargo') cargo?: string,
    @Query('gerencia') gerencia?: string,
  ) {
    return this.colaboradoresService.findAll({ 
      page, 
      pageSize,
      filters: {
        nombre,
        cargo,
        gerencia
      }
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.colaboradoresService.findOne(id);
  }

  @Post()
  create(@Body() createColaboradorDto: CreateColaboradorDto) {
    return this.colaboradoresService.create(createColaboradorDto);
  }

  @Post('batch')
  createBatch(@Body() createColaboradorDtos: CreateColaboradorDto[]) {
    return this.colaboradoresService.createBatch(createColaboradorDtos);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateColaboradorDto: UpdateColaboradorDto) {
    return this.colaboradoresService.update(id, updateColaboradorDto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.colaboradoresService.delete(id);
  }
}
