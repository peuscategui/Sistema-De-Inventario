import { Controller, Get, Post, Put, Delete, Param, Body, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto, UpdateInventoryDto } from './inventory.dto';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
    @Query('codigoEFC') codigoEFC?: string,
    @Query('marca') marca?: string,
    @Query('modelo') modelo?: string,
    @Query('serie') serie?: string,
  ) {
    return this.inventoryService.findAll({ 
      page, 
      pageSize,
      filters: { codigoEFC, marca, modelo, serie }
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inventoryService.findOne(Number(id));
  }

  @Post()
  async create(@Body() data: CreateInventoryDto) {
    try {
      console.log('Datos recibidos en el controlador:', data);
      const result = await this.inventoryService.create(data);
      console.log('Resultado del servicio:', result);
      return result;
    } catch (error) {
      console.error('Error en el controlador create:', error);
      throw error;
    }
  }

  @Post('batch')
  batchCreate(@Body() data: CreateInventoryDto[]) {
    return this.inventoryService.batchCreate(data);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: UpdateInventoryDto) {
    try {
      console.log('Datos recibidos en el controlador update:', data);
      console.log('ID:', id);
      const result = await this.inventoryService.update(Number(id), data);
      console.log('Resultado del servicio update:', result);
      return result;
    } catch (error) {
      console.error('Error en el controlador update:', error);
      throw error;
    }
  }

  @Delete('batch')
  async batchDelete(@Body() data: { ids: number[] }) {
    try {
      console.log('IDs a eliminar:', data.ids);
      const result = await this.inventoryService.batchDelete(data.ids);
      console.log('Resultado de eliminación en lote:', result);
      return result;
    } catch (error) {
      console.error('Error en eliminación en lote:', error);
      throw error;
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    try {
      console.log('ID a eliminar (individual):', id);
      const result = await this.inventoryService.delete(Number(id));
      console.log('Resultado eliminación individual:', result);
      return result;
    } catch (error) {
      console.error('Error en eliminación individual:', error);
      throw error;
    }
  }
}
