import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class InventarioRelacionalService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const [items, total] = await Promise.all([
      this.prisma.inventory.findMany({
        skip,
        take: limit,
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
      }),
      this.prisma.inventory.count()
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
      }
    });
  }

  async search(query: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const [items, total] = await Promise.all([
      this.prisma.inventory.findMany({
        where: {
          OR: [
            { modelo: { contains: query, mode: 'insensitive' } },
            { descripcion: { contains: query, mode: 'insensitive' } },
            { marca: { contains: query, mode: 'insensitive' } },
            { usuarios: { contains: query, mode: 'insensitive' } }
          ]
        },
        skip,
        take: limit,
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
      }),
      this.prisma.inventory.count({
        where: {
          OR: [
            { modelo: { contains: query, mode: 'insensitive' } },
            { descripcion: { contains: query, mode: 'insensitive' } },
            { marca: { contains: query, mode: 'insensitive' } },
            { usuarios: { contains: query, mode: 'insensitive' } }
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
}
