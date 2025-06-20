import { Controller, Get, Param, Query } from '@nestjs/common';
import { InventarioRelacionalService } from './inventario-relacional.service';

@Controller('inventario-relacional')
export class InventarioRelacionalController {
  constructor(
    private readonly inventarioRelacionalService: InventarioRelacionalService,
  ) {}

  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.inventarioRelacionalService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
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
      limit ? parseInt(limit) : 10,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inventarioRelacionalService.findOne(parseInt(id));
  }
}
