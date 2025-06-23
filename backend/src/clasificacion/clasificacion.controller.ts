import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { ClasificacionService } from './clasificacion.service';

@Controller('clasificacion')
export class ClasificacionController {
  constructor(private readonly clasificacionService: ClasificacionService) {}

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('familia') familia?: string,
    @Query('sub_familia') sub_familia?: string,
    @Query('tipo_equipo') tipo_equipo?: string,
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const pageSizeNum = pageSize ? parseInt(pageSize) : 10;
    
    return this.clasificacionService.findAll({
      page: pageNum,
      pageSize: pageSizeNum,
      filters: {
        familia,
        sub_familia,
        tipo_equipo,
      },
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clasificacionService.findOne(Number(id));
  }

  @Post()
  create(@Body() data: any) {
    return this.clasificacionService.create(data);
  }

  @Post('batch')
  createBatch(@Body() data: any[]) {
    return this.clasificacionService.createBatch(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.clasificacionService.update(Number(id), data);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.clasificacionService.delete(Number(id));
  }
}
