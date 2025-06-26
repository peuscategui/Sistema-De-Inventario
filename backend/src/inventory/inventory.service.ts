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
    const { empleadoId, clasificacionId, ...inventoryData } = data;
    
    return this.prisma.inventory.create({
      data: {
        ...inventoryData,
        empleado: empleadoId ? {
          connect: { id: empleadoId }
        } : undefined,
        clasificacion: clasificacionId ? {
          connect: { id: clasificacionId }
        } : undefined
      },
      include: {
        clasificacion: true,
        empleado: true,
      }
    });
  }

  async update(id: number, data: any) {
    const { empleadoId, clasificacionId, ...inventoryData } = data;
    
    return this.prisma.inventory.update({
      where: { id },
      data: {
        ...inventoryData,
        empleado: empleadoId ? {
          connect: { id: empleadoId }
        } : {
          disconnect: true
        },
        clasificacion: clasificacionId ? {
          connect: { id: clasificacionId }
        } : {
          disconnect: true
        }
      },
      include: {
        clasificacion: true,
        empleado: true,
      }
    });
  }

  async delete(id: number) {
    return this.prisma.inventory.delete({ where: { id } });
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
        fecha_compra: item.fecha_compra,
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
