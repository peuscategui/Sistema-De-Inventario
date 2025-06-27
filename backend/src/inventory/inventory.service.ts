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
  }
}

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async findAll({ page = 1, pageSize = 10, filters = {} }: FindAllOptions) {
    const skip = (page - 1) * pageSize;
    
    const whereClause: Record<string, any> = {};
    if (filters.codigoEFC) {
      whereClause['codigoEFC'] = { contains: filters.codigoEFC };
    }
    if (filters.marca) {
      whereClause['marca'] = { contains: filters.marca };
    }
    if (filters.modelo) {
      whereClause['modelo'] = { contains: filters.modelo };
    }
    if (filters.serie) {
      whereClause['serie'] = { contains: filters.serie };
    }

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

    // Formatear las fechas antes de enviarlas al frontend
    const formattedItems = items.map(item => ({
      ...item,
      fecha_compra: item.fecha_compra ? 
        item.fecha_compra.toISOString().split('T')[0]
        : null,
      precioUnitarioSinIgv: item.precioUnitarioSinIgv ? `$${item.precioUnitarioSinIgv}` : null,
      precioReposicion: item.precioReposicion ? `$${item.precioReposicion}` : null,
      precioReposicion2024: item.precioReposicion2024 ? `$${item.precioReposicion2024}` : null
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
        precioReposicion: item.precioReposicion ? `$${item.precioReposicion}` : null,
        precioReposicion2024: item.precioReposicion2024 ? `$${item.precioReposicion2024}` : null
      };
    }

    return item;
  }

  async create(data: any) {
    try {
      console.log('Datos recibidos en el servicio create:', data);
      
      const { empleadoId, clasificacionId, ...inventoryData } = data;
      
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
      
      console.log('Datos que se van a crear:', dataToCreate);
      
      const result = await this.prisma.inventory.create({
        data: dataToCreate,
        include: {
          clasificacion: true,
          empleado: true,
        }
      });
      
      console.log('Resultado de la creación:', result);
      return result;
    } catch (error) {
      console.error('Error en el servicio create:', error);
      throw error;
    }
  }

  async update(id: number, data: any) {
    try {
      console.log('Datos recibidos en el servicio update:', data);
      console.log('ID a actualizar:', id);
      
      const { empleadoId, clasificacionId, fecha_compra, ...inventoryData } = data;
      
      // La fecha_compra no debe ser editable, se excluye de las actualizaciones
      console.log('fecha_compra excluida de la actualización:', fecha_compra);
      
      // Obtener el artículo actual para verificar cambios en empleado
      const currentItem = await this.prisma.inventory.findUnique({
        where: { id },
        select: { empleadoId: true }
      });
      
      console.log('Artículo actual:', currentItem);
      
      // Determinar el nuevo status basado en la asignación de empleado
      let status = inventoryData.status;
      if (empleadoId !== undefined) {
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
      
      console.log('Datos que se van a actualizar:', dataToUpdate);
      
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
}
