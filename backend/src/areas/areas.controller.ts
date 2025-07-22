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
  ParseBoolPipe,
} from '@nestjs/common';
import { AreasService } from './areas.service';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';

@Controller('areas')
export class AreasController {
  constructor(private readonly areasService: AreasService) {}

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
    @Query('nombre') nombre?: string,
    @Query('gerenciaId', new DefaultValuePipe(0), ParseIntPipe) gerenciaId?: number,
    @Query('activo') activo?: string,
  ) {
    const filters: any = {};
    
    if (nombre) filters.nombre = nombre;
    if (gerenciaId && gerenciaId > 0) filters.gerenciaId = gerenciaId;
    if (activo !== undefined) {
      filters.activo = activo === 'true';
    }

    return this.areasService.findAll({
      page,
      pageSize,
      filters,
    });
  }

  @Get('active')
  findAllActive() {
    return this.areasService.findAllActive();
  }

  @Get('by-gerencia/:gerenciaId')
  findByGerencia(@Param('gerenciaId', ParseIntPipe) gerenciaId: number) {
    return this.areasService.findByGerencia(gerenciaId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.areasService.findOne(id);
  }

  @Post()
  create(@Body() createAreaDto: CreateAreaDto) {
    return this.areasService.create(createAreaDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAreaDto: UpdateAreaDto,
  ) {
    return this.areasService.update(id, updateAreaDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.areasService.remove(id);
  }
} 