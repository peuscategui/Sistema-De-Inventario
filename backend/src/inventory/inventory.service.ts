import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateInventoryDto } from './inventory.dto';

interface FindAllOptions {
  page?: number;
  pageSize?: number;
  filters?: {
    codigoEFC?: string;
    marca?: string;
    modelo?: string;
    serie?: string;
    status?: string;
    estado?: string; // CORREGIDO: agregar campo estado para filtros
    condicion?: string; // Agregar filtro por condición
    tipoEquipo?: string; // Agregar filtro por tipo de equipo
    empleado?: string; // Agregar filtro por empleado/usuario
  };
  excludeEstados?: string;
}

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async findAll({ page = 1, pageSize = 10, filters = {}, excludeEstados }: FindAllOptions) {
    console.log('🔍 DEBUG: findAll - excludeEstados recibido:', excludeEstados);
    console.log('🔍 DEBUG: findAll - filters recibidos:', filters);
    console.log('🔍 DEBUG: findAll - tipoEquipo en filters:', filters.tipoEquipo);
    
    const skip = (page - 1) * pageSize;
    
    const whereClause: Record<string, any> = {};
    if (filters.codigoEFC) {
      whereClause['codigoEFC'] = { 
        contains: filters.codigoEFC,
        mode: 'insensitive'
      };
    }
    if (filters.marca) {
      whereClause['marca'] = { 
        contains: filters.marca,
        mode: 'insensitive'
      };
    }
    if (filters.modelo) {
      whereClause['modelo'] = { 
        contains: filters.modelo,
        mode: 'insensitive'
      };
    }
    if (filters.serie) {
      whereClause['serie'] = { 
        contains: filters.serie,
        mode: 'insensitive'
      };
    }
    if (filters.status) {
      whereClause['status'] = { 
        equals: filters.status,
        mode: 'insensitive'
      };
    }
    if (filters.estado) {
      whereClause['estado'] = { 
        equals: filters.estado,
        mode: 'insensitive'
      };
    }
    if (filters.condicion) {
      console.log('🔍 DEBUG: Aplicando filtro condicion:', filters.condicion);
      whereClause['condicion'] = { 
        equals: filters.condicion,
        mode: 'insensitive'
      };
      console.log('🔍 DEBUG: whereClause después de condicion:', whereClause);
    }
    if (filters.empleado) {
      whereClause['empleado'] = {
        nombre: { 
          contains: filters.empleado,
          mode: 'insensitive'
        }
      };
    }
    
    // Filtrar por estados a excluir (solo si no hay filtro de estado específico)
    if (excludeEstados && !filters.estado) {
      const estadosExcluir = excludeEstados.split(',').map(estado => estado.trim());
      whereClause['estado'] = {
        notIn: estadosExcluir
      };
      console.log('🔍 DEBUG: findAll - estados a excluir:', estadosExcluir);
    }
    
    // Filtrar por tipo de equipo (después de excludeEstados para evitar conflictos)
    // Usar contains en lugar de equals para búsqueda más flexible
    if (filters.tipoEquipo) {
      console.log('🔍 DEBUG: Aplicando filtro tipoEquipo:', filters.tipoEquipo);
      whereClause['clasificacion'] = {
        tipo_equipo: {
          contains: filters.tipoEquipo,
          mode: 'insensitive'
        }
      };
      console.log('🔍 DEBUG: whereClause después de tipoEquipo:', JSON.stringify(whereClause, null, 2));
    }

    console.log('🔍 DEBUG: findAll - whereClause final:', JSON.stringify(whereClause, null, 2));
    
    const [items, total] = await Promise.all([
      this.prisma.inventory.findMany({
        where: whereClause,
        skip,
        take: pageSize,
        include: {
          clasificacion: true,
          empleado: true,
        },
      }),
      this.prisma.inventory.count({ where: whereClause }),
    ]);
    
    console.log('🔍 DEBUG: findAll - items encontrados:', items.length);
    console.log('🔍 DEBUG: findAll - estados de los items:', items.map(item => ({ id: item.id, estado: item.estado, status: item.status })));

    // Formatear las fechas antes de enviarlas al frontend
    const formattedItems = items.map(item => ({
      ...item,
      fecha_compra: item.fecha_compra ? 
        (() => {
          try {
            const date = new Date(item.fecha_compra);
            if (isNaN(date.getTime())) {
              console.warn(`⚠️ Fecha inválida para item ${item.id}: ${item.fecha_compra}`);
              return null;
            }
            return date.toISOString().split('T')[0];
          } catch (error) {
            console.warn(`⚠️ Error al formatear fecha para item ${item.id}: ${error.message}`);
            return null;
          }
        })()
        : null,
      precioUnitarioSinIgv: item.precioUnitarioSinIgv ? `$${item.precioUnitarioSinIgv}` : null,
      // Usar valor_reposicion de la clasificación relacionada
      valorReposicion: item.clasificacion?.valor_reposicion ? `$${item.clasificacion.valor_reposicion}` : null,
      // CORREGIDO: Agregar campos adicionales para la sección de bajas
      sede: item.empleado?.sede || null,
      gerencia: item.empleado?.gerencia || null,
      cargo: item.empleado?.cargo || null,
      nombreEmpleado: item.empleado?.nombre || null,
      tipoEquipo: item.clasificacion?.tipo_equipo || null,
      familia: item.clasificacion?.familia || null,
      subFamilia: item.clasificacion?.sub_familia || null,
      vidaUtil: item.clasificacion?.vida_util || null,
      // CORREGIDO: Campos de baja ahora existen en el esquema
      fechaBaja: item.fecha_baja ? 
        new Date(item.fecha_baja.getTime() - (item.fecha_baja.getTimezoneOffset() * 60000)).toISOString().split('T')[0]
        : null,
      motivoBaja: item.motivo_baja || null,
    }));

    return {
      data: formattedItems,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      }
    };
  }

  async findOne(id: number) {
    console.log('🔍 DEBUG: findOne llamado con id:', id);
    console.log('🔍 DEBUG: Tipo de id:', typeof id);
    console.log('🔍 DEBUG: id es NaN?', isNaN(id));
    
    if (!id || isNaN(id)) {
      console.error('❌ ERROR: ID inválido en findOne:', id);
      throw new Error('ID inválido para buscar inventario');
    }
    
    const item = await this.prisma.inventory.findUnique({
      where: { id },
      include: {
        clasificacion: true,
        empleado: true,
      },
    });

    if (!item) return null;

    // Formatear la fecha en formato YYYY-MM-DD
    if (item.fecha_compra) {
      return {
        ...item,
        fecha_compra: item.fecha_compra.toISOString().split('T')[0],
        precioUnitarioSinIgv: item.precioUnitarioSinIgv ? `$${item.precioUnitarioSinIgv}` : null,
        // Usar valor_reposicion de la clasificación relacionada
        valorReposicion: item.clasificacion?.valor_reposicion ? `$${item.clasificacion.valor_reposicion}` : null
      };
    }

    return item;
  }

  async create(data: any) {
    try {
      console.log('🔍 DEBUG: Datos recibidos en el servicio create:', JSON.stringify(data, null, 2));
      
      // CORREGIDO: Remover el id de los datos para evitar errores de unique constraint
      const { id, articuloId, empleadoId, clasificacionId, ...inventoryData } = data;
      
      console.log('🔍 DEBUG: ID removido de los datos:', id);
      console.log('🔍 DEBUG: articuloId recibido:', articuloId);
      console.log('🔍 DEBUG: Datos después de remover ID:', JSON.stringify(inventoryData, null, 2));
      
      // Si se proporciona articuloId, actualizar el registro existente en lugar de crear uno nuevo
      if (articuloId && articuloId > 0) {
        console.log('🔍 DEBUG: Actualizando artículo existente con ID:', articuloId);
        return await this.update(articuloId, data);
      }
      
      // Para crear, fecha_compra SÍ se puede incluir
      console.log('fecha_compra incluida en la creación:', inventoryData.fecha_compra);
      
      // Convertir fecha_compra de string a Date si existe
      if (inventoryData.fecha_compra && typeof inventoryData.fecha_compra === 'string') {
        try {
          // Convertir string "YYYY-MM-DD" a objeto Date
          inventoryData.fecha_compra = new Date(inventoryData.fecha_compra + 'T00:00:00.000Z');
          console.log('fecha_compra convertida a Date:', inventoryData.fecha_compra);
        } catch (dateError) {
          console.error('Error al convertir fecha_compra:', dateError);
          // Si hay error en la conversión, eliminar el campo para evitar errores
          delete inventoryData.fecha_compra;
        }
      }
      
      // Establecer status basado en si tiene empleado asignado
      const status = empleadoId ? 'asignado' : (inventoryData.status || 'libre');
      
      const dataToCreate = {
        ...inventoryData,
        status,
        empleado: empleadoId ? {
          connect: { id: empleadoId }
        } : undefined,
        clasificacion: clasificacionId ? {
          connect: { id: clasificacionId }
        } : undefined
      };
      
      console.log('🔍 DEBUG: Datos que se van a crear:', JSON.stringify(dataToCreate, null, 2));
      
      const result = await this.prisma.inventory.create({
        data: dataToCreate,
        include: {
          clasificacion: true,
          empleado: true,
        }
      });
      
      console.log('✅ Resultado de la creación:', result);
      return result;
    } catch (error) {
      console.error('❌ Error en el servicio create:', error);
      console.error('❌ Stack trace:', error.stack);
      throw error;
    }
  }

  async update(id: number, data: any) {
    try {
      console.log('🔍 DEBUG: ===== SERVICIO UPDATE INVENTARIO =====');
      console.log('🔍 DEBUG: ID a actualizar:', id);
      console.log('🔍 DEBUG: Datos recibidos en el servicio update:', JSON.stringify(data, null, 2));
      console.log('🔍 DEBUG: empleadoId específico en servicio:', data.empleadoId);
      console.log('🔍 DEBUG: Tipo de empleadoId en servicio:', typeof data.empleadoId);
      
      const { articuloId, empleadoId, clasificacionId, fecha_compra, ...inventoryData } = data;
      
      console.log('🔍 DEBUG: empleadoId extraído:', empleadoId);
      console.log('🔍 DEBUG: Tipo de empleadoId extraído:', typeof empleadoId);
      
      // La fecha_compra no debe ser editable, se excluye de las actualizaciones
      console.log('articuloId excluido de la actualización:', articuloId);
      console.log('fecha_compra excluida de la actualización:', fecha_compra);
      
      // Procesar fecha_baja si está presente
      if (inventoryData.fecha_baja && typeof inventoryData.fecha_baja === 'string') {
        try {
          // CORREGIDO: Usar UTC para evitar problemas de zona horaria
          const [year, month, day] = inventoryData.fecha_baja.split('-');
          inventoryData.fecha_baja = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));
          console.log('fecha_baja convertida a Date (UTC):', inventoryData.fecha_baja);
        } catch (dateError) {
          console.error('Error al convertir fecha_baja:', dateError);
          delete inventoryData.fecha_baja;
        }
      }
      
      // Obtener el artículo actual para verificar cambios en empleado
      const currentItem = await this.prisma.inventory.findUnique({
        where: { id },
        select: { empleadoId: true }
      });
      
      console.log('Artículo actual:', currentItem);
      
      // Determinar el nuevo status basado en el estado y la asignación de empleado
      let status = inventoryData.status;
      
      // Si el estado es BAJA, establecer status como 'baja'
      if (inventoryData.estado === 'BAJA') {
        status = 'baja';
      }
      // Si el estado es DONACION, establecer status como 'donacion'
      else if (inventoryData.estado === 'DONACION') {
        status = 'donacion';
      }
      // Si no es BAJA ni DONACION, determinar status basado en empleado
      else if (empleadoId !== undefined) {
        // Si se está asignando un empleado, cambiar a 'asignado'
        if (empleadoId) {
          status = 'asignado';
        } 
        // Si se está desasignando un empleado (empleadoId es null/undefined), cambiar a 'libre'
        else if (currentItem?.empleadoId) {
          status = 'libre';
        }
      }
      
      console.log('🔍 DEBUG: Construyendo dataToUpdate...');
      console.log('🔍 DEBUG: empleadoId para connect/disconnect:', empleadoId);
      console.log('🔍 DEBUG: ¿empleadoId es truthy?', !!empleadoId);
      console.log('🔍 DEBUG: ¿empleadoId es null?', empleadoId === null);
      
      const dataToUpdate = {
        ...inventoryData,
        status,
        empleado: empleadoId ? {
          connect: { id: empleadoId }
        } : empleadoId === null ? {
          disconnect: true
        } : undefined,
        clasificacion: clasificacionId ? {
          connect: { id: clasificacionId }
        } : clasificacionId === null ? {
          disconnect: true
        } : undefined
      };
      
      console.log('🔍 DEBUG: dataToUpdate construido:', JSON.stringify(dataToUpdate, null, 2));
      console.log('🔍 DEBUG: empleado en dataToUpdate:', dataToUpdate.empleado);
      
      const result = await this.prisma.inventory.update({
        where: { id },
        data: dataToUpdate,
        include: {
          clasificacion: true,
          empleado: true,
        }
      });
      
      console.log('Resultado de la actualización:', result);
      return result;
    } catch (error) {
      console.error('Error en el servicio update:', error);
      throw error;
    }
  }

  async delete(id: number) {
    try {
      console.log('Eliminando artículo con ID:', id);
      
      if (!id || isNaN(id)) {
        throw new Error('ID inválido para eliminación');
      }
      
      // Verificar si existe antes de eliminar
      const exists = await this.prisma.inventory.findUnique({
        where: { id },
        select: { id: true }
      });
      
      if (!exists) {
        throw new Error(`Artículo con ID ${id} no encontrado`);
      }
      
      const result = await this.prisma.inventory.delete({ where: { id } });
      console.log('Artículo eliminado exitosamente:', result.id);
      return { message: 'Artículo eliminado exitosamente', id: result.id };
    } catch (error) {
      console.error('Error en delete:', error);
      throw error;
    }
  }

  async batchDelete(ids: number[]) {
    try {
      console.log('Eliminando artículos con IDs:', ids);
      const result = await this.prisma.inventory.deleteMany({
        where: {
          id: {
            in: ids
          }
        }
      });
      console.log('Artículos eliminados:', result.count);
      return { message: `${result.count} artículos eliminados exitosamente`, count: result.count };
    } catch (error) {
      console.error('Error en batchDelete:', error);
      throw new Error('Error al eliminar los artículos seleccionados');
    }
  }

  async batchCreate(data: any[]) {
    try {
      // Mapear los campos del Excel a los campos del modelo
      const mappedData = data.map(item => ({
        codigoEFC: item.codigoEFC || 'Por asignar',
        tipoEquipo: item.tipoEquipo,
        familia: item.familia,
        subFamilia: item.subFamilia,
        marca: item.marca,
        modelo: item.modelo,
        descripcion: item.descripcion,
        serie: item.serie ? String(item.serie) : null,
        procesador: item.procesador,
        anio: item.anio,
        ram: item.ram,
        discoDuro: item.dicoDuro || item.discoDuro,
        sistemaOperativo: item.sistemaOperativo,
        status: item.empleadoId ? 'asignado' : 'libre', // Establecer status basado en empleado
        sede: item.sede,
        estado: item.estado,
        usuarios: item.usuarios,
        cargo: item.cargo,
        gerencia: item.gerencia,
        ubicacionEquipo: item.ubicacionEquipo,
        qUsuarios: item.qUsuario || item.qUsuarios,
        condicion: item.condicion,
        motivoCompra: item.motivoCompra,
        precioReposicion: item.precioReposicion,
        proveedor: item.proveedor,
        factura: item.factura,
        anioCompra: item.anioCompra,
        vidaUtil: item.vidaUtil,
        fecha_compra: item.fecha_compra ? (
          typeof item.fecha_compra === 'string' 
            ? new Date(item.fecha_compra + 'T00:00:00.000Z')
            : item.fecha_compra
        ) : null,
        precioUnitarioSinIgv: item.precioUnitarioSinIgv,
        observaciones: item.observaciones ? String(item.observaciones) : null,
        precioReposicion2024: item.precioReposicion2024,
        empleadoId: item.empleadoId,
        clasificacionId: item.clasificacionId
      }));

      const result = await this.prisma.inventory.createMany({
        data: mappedData,
        skipDuplicates: true,
      });
      return result;
    } catch (e) {
      console.error('Error en batchCreate:', e);
      throw new Error('Error al insertar los datos en la base de datos.');
    }
  }

  async clearInventory() {
    try {
      console.log('🧹 Iniciando limpieza de tabla inventory...');
      
      // Contar registros antes de eliminar
      const countBefore = await this.prisma.inventory.count();
      console.log(`📊 Registros antes de limpiar: ${countBefore}`);
      
      // Eliminar todos los registros
      const deleteResult = await this.prisma.inventory.deleteMany({});
      console.log(`🗑️ Eliminados ${deleteResult.count} registros`);
      
      // Resetear la secuencia del ID
      await this.prisma.$executeRaw`ALTER SEQUENCE inventory_id_seq RESTART WITH 1`;
      console.log('🔄 Secuencia del ID reseteada');
      
      return { count: deleteResult.count };
    } catch (error) {
      console.error('❌ Error limpiando inventory:', error);
      throw error;
    }
  }
}

