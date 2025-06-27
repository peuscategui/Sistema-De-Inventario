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
    // Solo tomar los campos permitidos para crear
    const createData = {
      familia: data.familia || null,
      sub_familia: data.sub_familia || null,
      tipo_equipo: data.tipo_equipo || null,
      vida_util: data.vida_util || null,
      valor_reposicion: data.valor_reposicion ? parseFloat(data.valor_reposicion) : null,
    };
    
    console.log('Datos originales:', data);
    console.log('Datos procesados para crear:', createData);
    
    try {
      const result = await this.prisma.clasificacion.create({ data: createData });
      console.log('Clasificación creada exitosamente:', result);
      return result;
    } catch (error) {
      console.error('Error al crear clasificación:', error);
      throw error;
    }
  }

  async createBatch(data: any[]) {
    return this.prisma.clasificacion.createMany({ data });
  }

  async update(id: number, data: any) {
    // Solo tomar los campos permitidos para actualizar
    const updateData = {
      familia: data.familia || null,
      sub_familia: data.sub_familia || null,
      tipo_equipo: data.tipo_equipo || null,
      vida_util: data.vida_util || null,
      valor_reposicion: data.valor_reposicion ? parseFloat(data.valor_reposicion) : null,
    };
    
    console.log('Actualizando clasificación ID:', id);
    console.log('Datos originales:', data);
    console.log('Datos procesados para actualizar:', updateData);
    
    try {
      const result = await this.prisma.clasificacion.update({ where: { id }, data: updateData });
      console.log('Clasificación actualizada exitosamente:', result);
      return result;
    } catch (error) {
      console.error('Error al actualizar clasificación:', error);
      throw error;
    }
  }

  async delete(id: number) {
    return this.prisma.clasificacion.delete({ where: { id } });
  }
}
