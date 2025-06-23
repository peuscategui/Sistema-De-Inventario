import { Controller, Get, Param, Query, Delete, Body } from '@nestjs/common';
import { InventarioRelacionalService } from './inventario-relacional.service';

@Controller('inventario-relacional')
export class InventarioRelacionalController {
  constructor(private readonly inventarioRelacionalService: InventarioRelacionalService) {}

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('codigoEFC') codigoEFC?: string,
    @Query('marca') marca?: string,
    @Query('modelo') modelo?: string,
    @Query('estado') estado?: string,
    @Query('sede') sede?: string,
    @Query('gerencia') gerencia?: string,
    @Query('familia') familia?: string,
    @Query('empleado') empleado?: string,
  ) {
    const filters = {
      codigoEFC,
      marca,
      modelo,
      estado,
      sede,
      gerencia,
      familia,
      empleado
    };

    return this.inventarioRelacionalService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      filters
    );
  }

  @Get('search')
  search(
    @Query('q') query: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.inventarioRelacionalService.search(
      query,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10
    );
  }

  @Get('export')
  exportToCSV(
    @Query('codigoEFC') codigoEFC?: string,
    @Query('marca') marca?: string,
    @Query('modelo') modelo?: string,
    @Query('estado') estado?: string,
    @Query('sede') sede?: string,
    @Query('gerencia') gerencia?: string,
    @Query('familia') familia?: string,
    @Query('empleado') empleado?: string,
  ) {
    const filters = {
      codigoEFC,
      marca,
      modelo,
      estado,
      sede,
      gerencia,
      familia,
      empleado
    };

    return this.inventarioRelacionalService.exportToCSV(filters);
  }

  @Delete('batch')
  deleteMany(@Body() body: { ids: number[] }) {
    return this.inventarioRelacionalService.deleteMany(body.ids);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inventarioRelacionalService.findOne(parseInt(id));
  }
} 