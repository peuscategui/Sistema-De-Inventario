import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

interface FindAllOptions {
  page: number;
  pageSize: number;
  filters: {
    familia?: string;
    sub_familia?: string;
    tipo_equipo?: string;
  };
}

@Injectable()
export class ClasificacionService {
  constructor(private prisma: PrismaService) {}

  async findAll(options?: FindAllOptions) {
    if (!options) {
      return this.prisma.clasificacion.findMany();
    }

    const { page, pageSize, filters } = options;
    const skip = (page - 1) * pageSize;

    // Construir el objeto where para los filtros
    const where: any = {};
    
    if (filters.familia) {
      where.familia = {
        contains: filters.familia,
        mode: 'insensitive' as any,
      };
    }
    
    if (filters.sub_familia) {
      where.sub_familia = {
        contains: filters.sub_familia,
        mode: 'insensitive' as any,
      };
    }
    
    if (filters.tipo_equipo) {
      where.tipo_equipo = {
        contains: filters.tipo_equipo,
        mode: 'insensitive' as any,
      };
    }

    // Obtener el total de registros para la paginación
    const totalCount = await this.prisma.clasificacion.count({ where });
    const totalPages = Math.ceil(totalCount / pageSize);

    // Obtener los datos paginados
    const data = await this.prisma.clasificacion.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { id: 'asc' },
    });

    return {
      data,
      pagination: {
        totalCount,
        totalPages,
        currentPage: page,
        pageSize,
      },
    };
  }

  async findOne(id: number) {
    return this.prisma.clasificacion.findUnique({ where: { id } });
  }

  async create(data: any) {
    return this.prisma.clasificacion.create({ data });
  }

  async createBatch(data: any[]) {
    return this.prisma.clasificacion.createMany({ data });
  }

  async update(id: number, data: any) {
    return this.prisma.clasificacion.update({ where: { id }, data });
  }

  async delete(id: number) {
    return this.prisma.clasificacion.delete({ where: { id } });
  }
}
