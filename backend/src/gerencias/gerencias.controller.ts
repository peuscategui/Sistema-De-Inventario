import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { GerenciasService } from './gerencias.service';
import { CreateGerenciaDto } from './dto/create-gerencia.dto';
import { UpdateGerenciaDto } from './dto/update-gerencia.dto';

@Controller('gerencias')
export class GerenciasController {
  constructor(private readonly gerenciasService: GerenciasService) {}

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
    @Query('nombre') nombre?: string,
    @Query('activo') activo?: string,
  ) {
    const filters: any = {};
    
    if (nombre) filters.nombre = nombre;
    if (activo !== undefined) {
      filters.activo = activo === 'true';
    }

    return this.gerenciasService.findAll({
      page,
      pageSize,
      filters,
    });
  }

  @Get('active')
  findAllActive() {
    return this.gerenciasService.findAllActive();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.gerenciasService.findOne(id);
  }

  @Post()
  create(@Body() createGerenciaDto: CreateGerenciaDto) {
    return this.gerenciasService.create(createGerenciaDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGerenciaDto: UpdateGerenciaDto,
  ) {
    return this.gerenciasService.update(id, updateGerenciaDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.gerenciasService.remove(id);
  }
} 