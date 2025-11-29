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
    @Query('condicion') condicion?: string,
    @Query('tipoEquipo') tipoEquipo?: string,
    @Query('empleado') empleado?: string,
    @Query('familia') familia?: string, // CORREGIDO: Agregar parámetro familia
    @Query('excludeEstados') excludeEstados?: string,
  ) {
    console.log('🔍 DEBUG: findAll controlador - excludeEstados:', excludeEstados);
    console.log('🔍 DEBUG: findAll controlador - todos los query params:', { page, pageSize, codigoEFC, marca, modelo, serie, status, estado, condicion, tipoEquipo, empleado, familia, excludeEstados });
    console.log('🔍 DEBUG: tipoEquipo recibida:', tipoEquipo);
    console.log('🔍 DEBUG: familia recibida:', familia);
    console.log('🔍 DEBUG: filters object que se pasa al servicio:', { codigoEFC, marca, modelo, serie, status, estado, condicion, tipoEquipo, empleado, familia });
    
    return this.inventoryService.findAll({ 
      page, 
      pageSize,
      filters: { codigoEFC, marca, modelo, serie, status, estado, condicion, tipoEquipo, empleado, familia },
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
    @Query('condicion') condicion?: string,
    @Query('tipoEquipo') tipoEquipo?: string,
    @Query('empleado') empleado?: string,
    @Query('familia') familia?: string, // CORREGIDO: Agregar parámetro familia
  ) {
    try {
      console.log('Exportando datos con filtros:', { codigoEFC, marca, modelo, serie, status, estado, condicion, tipoEquipo, empleado, familia });
      
      // CORREGIDO: Excluir automáticamente las bajas cuando se exporta desde inventario
      // Solo excluir si no se está filtrando específicamente por estado
      const excludeEstados = estado ? undefined : 'BAJA';
      
      // Usar el servicio existente para obtener todos los datos (excluyendo bajas)
      const result = await this.inventoryService.findAll({ 
        page: 1, 
        pageSize: 100000, // Obtener todos los registros (aumentado de 10000)
        filters: { codigoEFC, marca, modelo, serie, status, estado, condicion, tipoEquipo, empleado, familia },
        excludeEstados // Excluir bajas automáticamente
      });
      
      // Formatear datos para exportación: incluir nombres en lugar de solo IDs
      console.log('🔍 DEBUG: Total items recibidos:', result.data.length);
      if (result.data.length > 0) {
        console.log('🔍 DEBUG: Primer item antes de formatear:', JSON.stringify(result.data[0], null, 2));
      }
      
      // CORREGIDO: Filtrar registros vacíos o inválidos antes de procesar
      const validData = result.data.filter((item: any) => {
        // Excluir registros que estén marcados como BAJA (doble verificación)
        if (item.estado === 'BAJA' || item.status === 'baja') {
          return false;
        }
        
        // Excluir registros completamente vacíos (sin ID válido)
        if (!item.id || isNaN(item.id)) {
          return false;
        }
        
        // Incluir todos los demás registros (aunque tengan algunos campos vacíos)
        return true;
      });
      
      console.log(`🔍 DEBUG: Total registros recibidos: ${result.data.length}, Válidos (sin bajas): ${validData.length}`);
      
      const exportData = validData.map((item: any) => {
        const exportItem: any = { ...item };
        
        // Reemplazar empleadoId con nombre del empleado
        if (item.empleado) {
          exportItem.empleadoNombre = item.empleado.nombre || '';
          exportItem.empleadoCargo = item.empleado.cargo || '';
          exportItem.empleadoGerencia = item.empleado.gerencia || '';
          exportItem.empleadoSede = item.empleado.sede || '';
        } else {
          exportItem.empleadoNombre = '';
          exportItem.empleadoCargo = '';
          exportItem.empleadoGerencia = '';
          exportItem.empleadoSede = '';
        }
        
        // Reemplazar clasificacionId con datos de clasificación
        if (item.clasificacion) {
          exportItem.clasificacionFamilia = item.clasificacion.familia || '';
          exportItem.clasificacionSubFamilia = item.clasificacion.sub_familia || '';
          exportItem.clasificacionTipoEquipo = item.clasificacion.tipo_equipo || '';
          exportItem.clasificacionVidaUtil = item.clasificacion.vida_util || '';
          exportItem.clasificacionValorReposicion = item.clasificacion.valor_reposicion ? `$${item.clasificacion.valor_reposicion}` : '';
        } else {
          exportItem.clasificacionFamilia = '';
          exportItem.clasificacionSubFamilia = '';
          exportItem.clasificacionTipoEquipo = '';
          exportItem.clasificacionVidaUtil = '';
          exportItem.clasificacionValorReposicion = '';
        }
        
        // Remover objetos anidados y campos internos que no son útiles para exportación
        delete exportItem.clasificacion;
        delete exportItem.empleado;
        delete exportItem.createdAt;
        delete exportItem.updatedAt;
        
        // Remover los IDs ya que ahora tenemos los nombres descriptivos
        delete exportItem.empleadoId;
        delete exportItem.clasificacionId;
        
        // CORREGIDO: Remover campos de baja ya que no deberían estar en el inventario activo
        delete exportItem.fechaBaja;
        delete exportItem.motivoBaja;
        delete exportItem.fecha_baja;
        delete exportItem.motivo_baja;
        
        return exportItem;
      });
      
      if (exportData.length > 0) {
        console.log('🔍 DEBUG: Primer item después de formatear:', JSON.stringify(exportData[0], null, 2));
        console.log('🔍 DEBUG: Campos del primer item:', Object.keys(exportData[0]));
      }
      
      return {
        success: true,
        data: exportData,
        count: result.pagination.total
      };
    } catch (error) {
      console.error('Error en export:', error);
      throw error;
    }
  }

  @Get('donaciones')
  async getDonaciones(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
    @Query('codigoEFC') codigoEFC?: string,
    @Query('marca') marca?: string,
    @Query('modelo') modelo?: string,
    @Query('serie') serie?: string,
    @Query('sede') sede?: string,
    @Query('gerencia') gerencia?: string,
    @Query('familia') familia?: string,
    @Query('empleado') empleado?: string,
  ) {
    try {
      console.log('🔍 DEBUG: Obteniendo donaciones con filtros:', { codigoEFC, marca, modelo, serie, sede, gerencia, familia, empleado });
      
      // CORREGIDO: Filtrar por estado 'DONACION' con paginación y filtros
      const result = await this.inventoryService.findAll({ 
        page, 
        pageSize,
        filters: { 
          estado: 'DONACION',
          codigoEFC,
          marca,
          modelo,
          serie,
          tipoEquipo: undefined, // No filtrar por tipoEquipo aquí
          empleado,
          familia
        }
      });
      
      console.log('🔍 DEBUG: Donaciones encontradas:', result.data.length);
      
      return {
        success: true,
        data: result.data,
        pagination: result.pagination,
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
