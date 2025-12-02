import { Injectable, Logger } from '@nestjs/common';
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
    familia?: string; // CORREGIDO: Agregar filtro por familia
  };
  excludeEstados?: string;
}

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(private prisma: PrismaService) {}

  async findAll({ page = 1, pageSize = 10, filters = {}, excludeEstados }: FindAllOptions) {
    try {
      this.logger.debug('findAll iniciado', { excludeEstados, filters, page, pageSize });
      
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
      this.logger.debug('Aplicando filtro condicion', { condicion: filters.condicion });
      whereClause['condicion'] = { 
        equals: filters.condicion,
        mode: 'insensitive'
      };
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
      const estadosExcluir = excludeEstados.split(',').map(estado => estado.trim()).filter(e => e.length > 0);
      if (estadosExcluir.length > 0) {
        whereClause['estado'] = {
          notIn: estadosExcluir
        };
        this.logger.debug('Estados a excluir', { estadosExcluir });
      }
    }
    
    // CORREGIDO: Construir el filtro de clasificación combinando familia y tipoEquipo
    // IMPORTANTE: En Prisma, los filtros de relaciones anidadas deben construirse correctamente
    const clasificacionFilter: any = {};
    
    // Filtrar por familia (debe ser exacto, case-insensitive)
    if (filters.familia) {
      this.logger.debug('Aplicando filtro familia', { familia: filters.familia });
      // CORREGIDO: Usar equals con mode insensitive para comparación exacta pero case-insensitive
      clasificacionFilter.familia = {
        equals: filters.familia,
        mode: 'insensitive'
      };
    }
    
    // Filtrar por tipo de equipo
    if (filters.tipoEquipo) {
      this.logger.debug('Aplicando filtro tipoEquipo', { tipoEquipo: filters.tipoEquipo });
      clasificacionFilter.tipo_equipo = {
        contains: filters.tipoEquipo,
        mode: 'insensitive'
      };
    }
    
    // CORREGIDO: Agregar el filtro de clasificación - Prisma combina automáticamente los filtros con AND
    if (Object.keys(clasificacionFilter).length > 0) {
      whereClause['clasificacion'] = clasificacionFilter;
      this.logger.debug('Filtro de clasificación construido', { clasificacionFilter });
    }
    
    this.logger.debug('Ejecutando consulta Prisma', { whereClause, skip, take: pageSize });
    
    const [items, total] = await Promise.all([
      this.prisma.inventory.findMany({
        where: whereClause,
        skip,
        take: pageSize,
        select: {
          id: true,
          codigoEFC: true,
          marca: true,
          modelo: true,
          descripcion: true,
          serie: true,
          procesador: true,
          anio: true,
          ram: true,
          discoDuro: true,
          sistemaOperativo: true,
          status: true,
          estado: true,
          ubicacionEquipo: true,
          qUsuarios: true,
          condicion: true,
          repotenciadas: true,
          clasificacionObsolescencia: true,
          clasificacionRepotenciadas: true,
          motivoCompra: true,
          proveedor: true,
          factura: true,
          anioCompra: true,
          observaciones: true,
          fecha_compra: true,
          precioUnitarioSinIgv: true,
          fecha_baja: true,
          motivo_baja: true,
          fecha_donacion: true as any,
          motivo_donacion: true,
          clasificacionId: true,
          empleadoId: true,
          clasificacion: {
            select: {
              id: true,
              familia: true,
              sub_familia: true,
              tipo_equipo: true,
              vida_util: true,
              valor_reposicion: true,
            }
          },
          empleado: {
            select: {
              id: true,
              nombre: true,
              cargo: true,
              gerencia: true,
              sede: true,
            }
          }
        },
      }),
      this.prisma.inventory.count({ where: whereClause }),
    ]);
    
    this.logger.debug('Items encontrados', { count: items.length, total });

    // Formatear las fechas antes de enviarlas al frontend
    const formattedItems = items.map(item => ({
      ...item,
      fecha_compra: item.fecha_compra ? 
        (() => {
          try {
            const date = new Date(item.fecha_compra);
            if (isNaN(date.getTime())) {
              this.logger.warn('Fecha inválida para item', { itemId: item.id, fecha: item.fecha_compra });
              return null;
            }
            return date.toISOString().split('T')[0];
          } catch (error) {
            this.logger.warn('Error al formatear fecha para item', { itemId: item.id, error: error.message });
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
      // Campos de donación
      fechaDonacion: (item as any).fecha_donacion ? 
        (() => {
          try {
            const fecha = (item as any).fecha_donacion;
            if (fecha instanceof Date) {
              return new Date(fecha.getTime() - (fecha.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
            }
            return null;
          } catch (error) {
            this.logger.warn('Error al formatear fecha_donacion', { itemId: item.id, error: error.message });
            return null;
          }
        })()
        : null,
      motivoDonacion: (item as any).motivo_donacion || null,
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
    } catch (error) {
      this.logger.error('Error en findAll', { error: error.message, stack: error.stack });
      throw error;
    }
  }

  async findOne(id: number) {
    this.logger.debug('findOne llamado', { id, type: typeof id });
    
    if (!id || isNaN(id)) {
      this.logger.error('ID inválido en findOne', { id });
      throw new Error('ID inválido para buscar inventario');
    }
    
    const item = await this.prisma.inventory.findUnique({
      where: { id },
      select: {
        id: true,
        codigoEFC: true,
        marca: true,
        modelo: true,
        descripcion: true,
        serie: true,
        procesador: true,
        anio: true,
        ram: true,
        discoDuro: true,
        sistemaOperativo: true,
        status: true,
        estado: true,
        ubicacionEquipo: true,
        qUsuarios: true,
        condicion: true,
        repotenciadas: true,
        clasificacionObsolescencia: true,
        clasificacionRepotenciadas: true,
        motivoCompra: true,
        proveedor: true,
        factura: true,
        anioCompra: true,
        observaciones: true,
        fecha_compra: true,
        precioUnitarioSinIgv: true,
        fecha_baja: true,
        motivo_baja: true,
        fecha_donacion: true as any,
        motivo_donacion: true,
        clasificacionId: true,
        empleadoId: true,
        clasificacion: {
          select: {
            id: true,
            familia: true,
            sub_familia: true,
            tipo_equipo: true,
            vida_util: true,
            valor_reposicion: true,
          }
        },
        empleado: {
          select: {
            id: true,
            nombre: true,
            cargo: true,
            gerencia: true,
            sede: true,
          }
        }
      },
    });

    if (!item) return null;

    // Formatear la fecha en formato YYYY-MM-DD
    if (item.fecha_compra) {
      const itemWithRelations = item as typeof item & {
        clasificacion: { valor_reposicion: number | null } | null;
      };
      return {
        ...item,
        fecha_compra: item.fecha_compra.toISOString().split('T')[0],
        precioUnitarioSinIgv: item.precioUnitarioSinIgv ? `$${item.precioUnitarioSinIgv}` : null,
        // Usar valor_reposicion de la clasificación relacionada
        valorReposicion: itemWithRelations.clasificacion?.valor_reposicion ? `$${itemWithRelations.clasificacion.valor_reposicion}` : null
      };
    }

    return item;
  }

  async create(data: any) {
    try {
      this.logger.debug('Datos recibidos en create', { hasArticuloId: !!data.articuloId });
      
      // CORREGIDO: Remover el id de los datos para evitar errores de unique constraint
      const { id, articuloId, empleadoId, clasificacionId, ...inventoryData } = data;
      
      // Si se proporciona articuloId, actualizar el registro existente en lugar de crear uno nuevo
      if (articuloId && articuloId > 0) {
        this.logger.debug('Actualizando artículo existente', { articuloId });
        return await this.update(articuloId, data);
      }
      
      // Convertir fecha_compra de string a Date si existe
      if (inventoryData.fecha_compra && typeof inventoryData.fecha_compra === 'string') {
        try {
          // Convertir string "YYYY-MM-DD" a objeto Date
          inventoryData.fecha_compra = new Date(inventoryData.fecha_compra + 'T00:00:00.000Z');
          this.logger.debug('fecha_compra convertida a Date', { fecha: inventoryData.fecha_compra });
        } catch (dateError) {
          this.logger.error('Error al convertir fecha_compra', { error: dateError.message });
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
      
      const result = await this.prisma.inventory.create({
        data: dataToCreate,
        select: {
          id: true,
          codigoEFC: true,
          marca: true,
          modelo: true,
          descripcion: true,
          serie: true,
          procesador: true,
          anio: true,
          ram: true,
          discoDuro: true,
          sistemaOperativo: true,
          status: true,
          estado: true,
          ubicacionEquipo: true,
          qUsuarios: true,
          condicion: true,
          repotenciadas: true,
          clasificacionObsolescencia: true,
          clasificacionRepotenciadas: true,
          motivoCompra: true,
          proveedor: true,
          factura: true,
          anioCompra: true,
          observaciones: true,
          fecha_compra: true,
          precioUnitarioSinIgv: true,
          fecha_baja: true,
          motivo_baja: true,
          fecha_donacion: true as any,
          motivo_donacion: true,
          clasificacionId: true,
          empleadoId: true,
          clasificacion: {
            select: {
              id: true,
              familia: true,
              sub_familia: true,
              tipo_equipo: true,
              vida_util: true,
              valor_reposicion: true,
            }
          },
          empleado: {
            select: {
              id: true,
              nombre: true,
              cargo: true,
              gerencia: true,
              sede: true,
            }
          }
        }
      });
      
      this.logger.log('Item de inventario creado exitosamente', { id: result.id });
      return result;
    } catch (error) {
      this.logger.error('Error en el servicio create', { error: error.message, stack: error.stack });
      throw error;
    }
  }

  async update(id: number, data: any) {
    try {
      this.logger.debug('Iniciando update', { id, hasEmpleadoId: !!data.empleadoId });
      
      const { articuloId, empleadoId, clasificacionId, fecha_compra, ...inventoryData } = data;
      
      // Procesar fecha_baja si está presente
      if (inventoryData.fecha_baja && typeof inventoryData.fecha_baja === 'string') {
        try {
          // CORREGIDO: Usar UTC para evitar problemas de zona horaria
          const [year, month, day] = inventoryData.fecha_baja.split('-');
          inventoryData.fecha_baja = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));
          this.logger.debug('fecha_baja convertida a Date (UTC)', { fecha: inventoryData.fecha_baja });
        } catch (dateError) {
          this.logger.error('Error al convertir fecha_baja', { error: dateError.message });
          delete inventoryData.fecha_baja;
        }
      }

      // Procesar fecha_donacion si está presente
      if (inventoryData.fecha_donacion && typeof inventoryData.fecha_donacion === 'string') {
        try {
          // CORREGIDO: Usar UTC para evitar problemas de zona horaria
          const [year, month, day] = inventoryData.fecha_donacion.split('-');
          inventoryData.fecha_donacion = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day)));
          this.logger.debug('fecha_donacion convertida a Date (UTC)', { fecha: inventoryData.fecha_donacion });
        } catch (dateError) {
          this.logger.error('Error al convertir fecha_donacion', { error: dateError.message });
          delete inventoryData.fecha_donacion;
        }
      }
      
      // Obtener el artículo actual para verificar cambios en empleado
      const currentItem = await this.prisma.inventory.findUnique({
        where: { id },
        select: { empleadoId: true }
      });
      
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
      
      const result = await this.prisma.inventory.update({
        where: { id },
        data: dataToUpdate,
        select: {
          id: true,
          codigoEFC: true,
          marca: true,
          modelo: true,
          descripcion: true,
          serie: true,
          procesador: true,
          anio: true,
          ram: true,
          discoDuro: true,
          sistemaOperativo: true,
          status: true,
          estado: true,
          ubicacionEquipo: true,
          qUsuarios: true,
          condicion: true,
          repotenciadas: true,
          clasificacionObsolescencia: true,
          clasificacionRepotenciadas: true,
          motivoCompra: true,
          proveedor: true,
          factura: true,
          anioCompra: true,
          observaciones: true,
          fecha_compra: true,
          precioUnitarioSinIgv: true,
          fecha_baja: true,
          motivo_baja: true,
          fecha_donacion: true as any,
          motivo_donacion: true,
          clasificacionId: true,
          empleadoId: true,
          clasificacion: {
            select: {
              id: true,
              familia: true,
              sub_familia: true,
              tipo_equipo: true,
              vida_util: true,
              valor_reposicion: true,
            }
          },
          empleado: {
            select: {
              id: true,
              nombre: true,
              cargo: true,
              gerencia: true,
              sede: true,
            }
          }
        }
      });
      
      this.logger.log('Item de inventario actualizado exitosamente', { id: result.id });
      return result;
    } catch (error) {
      this.logger.error('Error en el servicio update', { id, error: error.message, stack: error.stack });
      throw error;
    }
  }

  async delete(id: number) {
    try {
      this.logger.debug('Eliminando artículo', { id });
      
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
      this.logger.log('Artículo eliminado exitosamente', { id: result.id });
      return { message: 'Artículo eliminado exitosamente', id: result.id };
    } catch (error) {
      this.logger.error('Error en delete', { id, error: error.message, stack: error.stack });
      throw error;
    }
  }

  async batchDelete(ids: number[]) {
    try {
      this.logger.debug('Eliminando artículos en lote', { count: ids.length });
      const result = await this.prisma.inventory.deleteMany({
        where: {
          id: {
            in: ids
          }
        }
      });
      this.logger.log('Artículos eliminados en lote', { count: result.count });
      return { message: `${result.count} artículos eliminados exitosamente`, count: result.count };
    } catch (error) {
      this.logger.error('Error en batchDelete', { error: error.message, stack: error.stack });
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
      this.logger.log('Items creados en lote', { count: result.count });
      return result;
    } catch (e) {
      this.logger.error('Error en batchCreate', { error: e.message, stack: e.stack });
      throw new Error('Error al insertar los datos en la base de datos.');
    }
  }

  async clearInventory() {
    try {
      this.logger.log('Iniciando limpieza de tabla inventory');
      
      // Contar registros antes de eliminar
      const countBefore = await this.prisma.inventory.count();
      this.logger.debug('Registros antes de limpiar', { count: countBefore });
      
      // Eliminar todos los registros
      const deleteResult = await this.prisma.inventory.deleteMany({});
      this.logger.log('Registros eliminados', { count: deleteResult.count });
      
      // Resetear la secuencia del ID
      await this.prisma.$executeRaw`ALTER SEQUENCE inventory_id_seq RESTART WITH 1`;
      this.logger.log('Secuencia del ID reseteada');
      
      return { count: deleteResult.count };
    } catch (error) {
      this.logger.error('Error limpiando inventory', { error: error.message, stack: error.stack });
      throw error;
    }
  }
}

