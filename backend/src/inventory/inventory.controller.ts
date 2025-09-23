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
    @Query('status') status?: string,
    @Query('estado') estado?: string,
    @Query('empleado') empleado?: string,
    @Query('excludeEstados') excludeEstados?: string,
  ) {
    console.log('🔍 DEBUG: findAll controlador - excludeEstados:', excludeEstados);
    console.log('🔍 DEBUG: findAll controlador - todos los query params:', { page, pageSize, codigoEFC, marca, modelo, serie, status, estado, empleado, excludeEstados });
    
    return this.inventoryService.findAll({ 
      page, 
      pageSize,
      filters: { codigoEFC, marca, modelo, serie, status, estado, empleado },
      excludeEstados
    });
  }

  // CORREGIDO: Mover rutas específicas ANTES de la ruta genérica :id
  @Get('export')
  async exportData(
    @Query('codigoEFC') codigoEFC?: string,
    @Query('marca') marca?: string,
    @Query('modelo') modelo?: string,
    @Query('serie') serie?: string,
    @Query('status') status?: string,
    @Query('estado') estado?: string,
    @Query('empleado') empleado?: string,
  ) {
    try {
      console.log('Exportando datos con filtros:', { codigoEFC, marca, modelo, serie, status, estado, empleado });
      
      // Usar el servicio existente para obtener todos los datos
      const result = await this.inventoryService.findAll({ 
        page: 1, 
        pageSize: 10000, // Obtener muchos registros
        filters: { codigoEFC, marca, modelo, serie, status, estado, empleado }
      });
      
      return {
        success: true,
        data: result.data,
        count: result.pagination.total
      };
    } catch (error) {
      console.error('Error en export:', error);
      throw error;
    }
  }

  @Get('donaciones')
  async getDonaciones() {
    try {
      // CORREGIDO: Filtrar por estado 'DONACION' en lugar de status 'donacion'
      const result = await this.inventoryService.findAll({ 
        page: 1, 
        pageSize: 10000,
        filters: { estado: 'DONACION' }
      });
      
      return {
        success: true,
        data: result.data,
        count: result.pagination.total
      };
    } catch (error) {
      console.error('Error en donaciones:', error);
      throw error;
    }
  }

  @Get('donaciones/search')
  async searchDonaciones(@Query() query: any) {
    try {
      // CORREGIDO: Buscar en donaciones con filtros adicionales
      const result = await this.inventoryService.findAll({ 
        page: query.page || 1, 
        pageSize: query.pageSize || 10,
        filters: { ...query, estado: 'DONACION' }
      });
      
      return {
        success: true,
        data: result.data,
        pagination: result.pagination
      };
    } catch (error) {
      console.error('Error en search donaciones:', error);
      throw error;
    }
  }

  @Get('bajas')
  async getBajas(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
    @Query('codigoEFC') codigoEFC?: string,
    @Query('marca') marca?: string,
    @Query('modelo') modelo?: string,
    @Query('serie') serie?: string,
  ) {
    try {
      console.log('🔍 DEBUG: Obteniendo bajas con filtros:', { codigoEFC, marca, modelo, serie });
      
      // CORREGIDO: Filtrar por estado 'BAJA' en lugar de status 'baja'
      // Los items en baja deben tener estado = 'BAJA'
      const result = await this.inventoryService.findAll({ 
        page, 
        pageSize,
        filters: { 
          estado: 'BAJA', // CORREGIDO: usar estado en lugar de status
          codigoEFC,
          marca,
          modelo,
          serie
        }
      });
      
      console.log('🔍 DEBUG: Bajas encontradas:', result.data.length);
      
      return {
        success: true,
        data: result.data,
        pagination: result.pagination,
        count: result.pagination.total
      };
    } catch (error) {
      console.error('Error en bajas:', error);
      throw error;
    }
  }

  @Get('bajas/search')
  async searchBajas(@Query() query: any) {
    try {
      // CORREGIDO: Buscar en bajas con filtros adicionales
      const result = await this.inventoryService.findAll({ 
        page: query.page || 1, 
        pageSize: query.pageSize || 10,
        filters: { ...query, estado: 'BAJA' }
      });
      
      return {
        success: true,
        data: result.data,
        pagination: result.pagination
      };
    } catch (error) {
      console.error('Error en search bajas:', error);
      throw error;
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    console.log('🔍 DEBUG: findOne controlador - ID recibido:', id);
    console.log('🔍 DEBUG: findOne controlador - Tipo de ID:', typeof id);
    
    const numericId = Number(id);
    console.log('🔍 DEBUG: findOne controlador - ID convertido:', numericId);
    
    if (isNaN(numericId)) {
      console.error('❌ ERROR: ID inválido en controlador:', id);
      throw new Error(`ID inválido: ${id}`);
    }
    
    return this.inventoryService.findOne(numericId);
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
      console.log('🔍 DEBUG: ===== ACTUALIZACIÓN DE INVENTARIO =====');
      console.log('🔍 DEBUG: ID del inventario:', id);
      console.log('🔍 DEBUG: Datos recibidos en el controlador update:', JSON.stringify(data, null, 2));
      console.log('🔍 DEBUG: empleadoId específico:', data.empleadoId);
      console.log('🔍 DEBUG: Tipo de empleadoId:', typeof data.empleadoId);
      
      const result = await this.inventoryService.update(Number(id), data);
      console.log('🔍 DEBUG: Resultado del servicio update:', JSON.stringify(result, null, 2));
      return result;
    } catch (error) {
      console.error('❌ ERROR: Error en el controlador update:', error);
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

  @Delete('clear')
  async clearInventory() {
    try {
      console.log('🧹 Limpiando tabla inventory...');
      const result = await this.inventoryService.clearInventory();
      console.log(`✅ Eliminados ${result.count} registros de inventory`);
      return { message: `Eliminados ${result.count} registros de inventory`, count: result.count };
    } catch (error) {
      console.error('Error clearing inventory:', error);
      throw error;
    }
  }


}
