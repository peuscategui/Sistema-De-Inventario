import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';

type InventoryWithRelations = Prisma.inventoryGetPayload<{
  include: {
    clasificacion: {
      select: {
        familia: true;
        sub_familia: true;
        tipo_equipo: true;
        vida_util: true;
        valor_reposicion: true;
      };
    };
    empleado: {
      select: {
        nombre: true;
        cargo: true;
        gerencia: true;
      };
    };
  };
}>;

@Injectable()
export class InventarioRelacionalService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 10, filters?: any) {
    const skip = (page - 1) * limit;
    
    const whereClause = this.buildWhereClause(filters);
    
    const [items, total] = await Promise.all([
      this.prisma.inventory.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
          clasificacion: {
            select: {
              id: true,
              familia: true,
              sub_familia: true,
              tipo_equipo: true,
              vida_util: true,
              valor_reposicion: true
            }
          },
          empleado: {
            select: {
              id: true,
              nombre: true,
              cargo: true,
              gerencia: true
            }
          }
        },
        orderBy: {
          id: 'asc'
        }
      }),
      this.prisma.inventory.count({ where: whereClause })
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findOne(id: number) {
    return this.prisma.inventory.findUnique({
      where: { id },
      include: {
        clasificacion: {
          select: {
            id: true,
            familia: true,
            sub_familia: true,
            tipo_equipo: true,
            vida_util: true,
            valor_reposicion: true
          }
        },
        empleado: {
          select: {
            id: true,
            nombre: true,
            cargo: true,
            gerencia: true
          }
        }
      }
    });
  }

  async search(query: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const [items, total] = await Promise.all([
      this.prisma.inventory.findMany({
        where: {
          OR: [
            { codigoEFC: { contains: query, mode: 'insensitive' } },
            { modelo: { contains: query, mode: 'insensitive' } },
            { descripcion: { contains: query, mode: 'insensitive' } },
            { marca: { contains: query, mode: 'insensitive' } },
            { serie: { contains: query, mode: 'insensitive' } },
            { usuarios: { contains: query, mode: 'insensitive' } },
            { empleado: { nombre: { contains: query, mode: 'insensitive' } } },
            { empleado: { cargo: { contains: query, mode: 'insensitive' } } },
            { empleado: { gerencia: { contains: query, mode: 'insensitive' } } },
            { clasificacion: { familia: { contains: query, mode: 'insensitive' } } },
            { clasificacion: { sub_familia: { contains: query, mode: 'insensitive' } } },
            { clasificacion: { tipo_equipo: { contains: query, mode: 'insensitive' } } }
          ]
        },
        skip,
        take: limit,
        include: {
          clasificacion: {
            select: {
              id: true,
              familia: true,
              sub_familia: true,
              tipo_equipo: true,
              vida_util: true,
              valor_reposicion: true
            }
          },
          empleado: {
            select: {
              id: true,
              nombre: true,
              cargo: true,
              gerencia: true
            }
          }
        },
        orderBy: {
          id: 'asc'
        }
      }),
      this.prisma.inventory.count({
        where: {
          OR: [
            { codigoEFC: { contains: query, mode: 'insensitive' } },
            { modelo: { contains: query, mode: 'insensitive' } },
            { descripcion: { contains: query, mode: 'insensitive' } },
            { marca: { contains: query, mode: 'insensitive' } },
            { serie: { contains: query, mode: 'insensitive' } },
            { usuarios: { contains: query, mode: 'insensitive' } },
            { empleado: { nombre: { contains: query, mode: 'insensitive' } } },
            { empleado: { cargo: { contains: query, mode: 'insensitive' } } },
            { empleado: { gerencia: { contains: query, mode: 'insensitive' } } },
            { clasificacion: { familia: { contains: query, mode: 'insensitive' } } },
            { clasificacion: { sub_familia: { contains: query, mode: 'insensitive' } } },
            { clasificacion: { tipo_equipo: { contains: query, mode: 'insensitive' } } }
          ]
        }
      })
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async exportToCSV(filters?: any) {
    const whereClause = this.buildWhereClause(filters);
    
    const items = await this.prisma.inventory.findMany({
      where: whereClause,
      include: {
        clasificacion: {
          select: {
            familia: true,
            sub_familia: true,
            tipo_equipo: true,
            vida_util: true,
            valor_reposicion: true
          }
        },
        empleado: {
          select: {
            nombre: true,
            cargo: true,
            gerencia: true
          }
        }
      },
      orderBy: {
        id: 'asc'
      }
    });

    return items.map((item: InventoryWithRelations) => ({
      'Código EFC': item.codigoEFC || '',
      'Tipo Equipo': item.tipoEquipo || '',
      'Familia': item.clasificacion?.familia || '',
      'Sub Familia': item.clasificacion?.sub_familia || '',
      'Marca': item.marca || '',
      'Modelo': item.modelo || '',
      'Descripción': item.descripcion || '',
      'Serie': item.serie || '',
      'Procesador': item.procesador || '',
      'Año': item.anio || '',
      'RAM': item.ram || '',
      'Disco Duro': item.discoDuro || '',
      'Sistema Operativo': item.sistemaOperativo || '',
      'Sede': item.sede || '',
      'Estado': item.estado || '',
      'Usuarios': item.usuarios || '',
      'Cargo': item.cargo || '',
      'Gerencia': item.gerencia || '',
      'Ubicación': item.ubicacionEquipo || '',
      'Condición': item.condicion || '',
      'Repotenciadas': item.repotenciadas ? 'Sí' : 'No',
      'Empleado': item.empleado?.nombre || '',
      'Cargo Empleado': item.empleado?.cargo || '',
      'Gerencia Empleado': item.empleado?.gerencia || '',
      'Vida Útil': item.clasificacion?.vida_util || '',
      'Valor Reposición': item.clasificacion?.valor_reposicion || '',
      'Precio Reposición': item.precioReposicion || '',
      'Proveedor': item.proveedor || '',
      'Factura': item.factura || '',
      'Año Compra': item.anioCompra || '',
      'Observaciones': item.observaciones || ''
    }));
  }

  async deleteMany(ids: number[]) {
    return this.prisma.inventory.deleteMany({
      where: {
        id: {
          in: ids
        }
      }
    });
  }

  private buildWhereClause(filters?: any) {
    if (!filters) return {};

    const whereClause: any = {};

    if (filters.codigoEFC) {
      whereClause.codigoEFC = { contains: filters.codigoEFC, mode: 'insensitive' };
    }

    if (filters.marca) {
      whereClause.marca = { contains: filters.marca, mode: 'insensitive' };
    }

    if (filters.modelo) {
      whereClause.modelo = { contains: filters.modelo, mode: 'insensitive' };
    }

    if (filters.estado) {
      whereClause.estado = { contains: filters.estado, mode: 'insensitive' };
    }

    if (filters.sede) {
      whereClause.sede = { contains: filters.sede, mode: 'insensitive' };
    }

    if (filters.gerencia) {
      whereClause.gerencia = { contains: filters.gerencia, mode: 'insensitive' };
    }

    if (filters.familia) {
      whereClause.clasificacion = {
        familia: { contains: filters.familia, mode: 'insensitive' }
      };
    }

    if (filters.empleado) {
      whereClause.empleado = {
        nombre: { contains: filters.empleado, mode: 'insensitive' }
      };
    }

    return whereClause;
  }
}
