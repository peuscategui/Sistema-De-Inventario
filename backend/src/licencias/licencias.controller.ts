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
import { LicenciasService } from './licencias.service';
import { CreateLicenciaDto } from './dto/create-licencia.dto';
import { UpdateLicenciaDto } from './dto/update-licencia.dto';

@Controller('licencias')
export class LicenciasController {
  constructor(private readonly licenciasService: LicenciasService) {}

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
    @Query('nombre') nombre?: string,
    @Query('codigoLicencia') codigoLicencia?: string,
    @Query('tipoLicencia') tipoLicencia?: string,
    @Query('estado') estado?: string,
    @Query('proveedor') proveedor?: string,
    @Query('areaId', new DefaultValuePipe(0), ParseIntPipe) areaId?: number,
    @Query('gerenciaId', new DefaultValuePipe(0), ParseIntPipe) gerenciaId?: number,
  ) {
    const filters: any = {};
    
    if (nombre) filters.nombre = nombre;
    if (codigoLicencia) filters.codigoLicencia = codigoLicencia;
    if (tipoLicencia) filters.tipoLicencia = tipoLicencia;
    if (estado) filters.estado = estado;
    if (proveedor) filters.proveedor = proveedor;
    if (areaId && areaId > 0) filters.areaId = areaId;
    if (gerenciaId && gerenciaId > 0) filters.gerenciaId = gerenciaId;

    return this.licenciasService.findAll({
      page,
      pageSize,
      filters,
    });
  }

  @Get('dashboard')
  getDashboard() {
    return this.licenciasService.getDashboardStats();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.licenciasService.findOne(id);
  }

  @Post()
  create(@Body() createLicenciaDto: CreateLicenciaDto) {
    return this.licenciasService.create(createLicenciaDto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLicenciaDto: UpdateLicenciaDto,
  ) {
    return this.licenciasService.update(id, updateLicenciaDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.licenciasService.remove(id);
  }
} 