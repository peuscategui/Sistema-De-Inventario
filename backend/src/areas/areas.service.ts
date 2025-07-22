import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';

@Injectable()
export class AreasService {
  constructor(private prisma: PrismaService) {}

  async findAll(options?: {
    page?: number;
    pageSize?: number;
    filters?: {
      nombre?: string;
      gerenciaId?: number;
      activo?: boolean;
    };
  }) {
    const { page = 1, pageSize = 10, filters = {} } = options || {};
    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (filters.nombre) {
      where.nombre = {
        contains: filters.nombre,
        mode: 'insensitive',
      };
    }

    if (filters.gerenciaId) {
      where.gerenciaId = filters.gerenciaId;
    }

    if (filters.activo !== undefined) {
      where.activo = filters.activo;
    }

    const [data, total] = await Promise.all([
      this.prisma.area.findMany({
        where,
        include: {
          gerencia: {
            select: {
              id: true,
              nombre: true,
            },
          },
          _count: {
            select: {
              licencias: true,
            },
          },
        },
        skip,
        take: pageSize,
        orderBy: {
          nombre: 'asc',
        },
      }),
      this.prisma.area.count({ where }),
    ]);

    return {
      data,
      pagination: {
        totalCount: total,
        totalPages: Math.ceil(total / pageSize),
        currentPage: page,
        pageSize,
      },
    };
  }

  async findOne(id: number) {
    const area = await this.prisma.area.findUnique({
      where: { id },
      include: {
        gerencia: {
          select: {
            id: true,
            nombre: true,
          },
        },
        licencias: {
          select: {
            id: true,
            codigoLicencia: true,
            nombre: true,
            estado: true,
          },
        },
      },
    });

    if (!area) {
      throw new NotFoundException(`Área con ID ${id} no encontrada`);
    }

    return area;
  }

  async create(createAreaDto: CreateAreaDto) {
    try {
      // Verificar si existe gerencia si se proporciona
      if (createAreaDto.gerenciaId) {
        const gerencia = await this.prisma.gerencia.findUnique({
          where: { id: createAreaDto.gerenciaId },
        });
        
        if (!gerencia) {
          throw new NotFoundException(`Gerencia con ID ${createAreaDto.gerenciaId} no encontrada`);
        }
      }

      const area = await this.prisma.area.create({
        data: createAreaDto,
        include: {
          gerencia: {
            select: {
              id: true,
              nombre: true,
            },
          },
        },
      });

      return area;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Ya existe un área con ese nombre o código');
      }
      throw error;
    }
  }

  async update(id: number, updateAreaDto: UpdateAreaDto) {
    try {
      // Verificar que el área existe
      await this.findOne(id);

      // Verificar si existe gerencia si se proporciona
      if (updateAreaDto.gerenciaId) {
        const gerencia = await this.prisma.gerencia.findUnique({
          where: { id: updateAreaDto.gerenciaId },
        });
        
        if (!gerencia) {
          throw new NotFoundException(`Gerencia con ID ${updateAreaDto.gerenciaId} no encontrada`);
        }
      }

      const area = await this.prisma.area.update({
        where: { id },
        data: updateAreaDto,
        include: {
          gerencia: {
            select: {
              id: true,
              nombre: true,
            },
          },
        },
      });

      return area;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Ya existe un área con ese nombre o código');
      }
      throw error;
    }
  }

  async remove(id: number) {
    // Verificar que el área existe
    await this.findOne(id);

    // Verificar si tiene licencias asociadas
    const licenciasCount = await this.prisma.licencia.count({
      where: { areaId: id },
    });

    if (licenciasCount > 0) {
      throw new ConflictException(
        `No se puede eliminar el área porque tiene ${licenciasCount} licencia(s) asociada(s)`
      );
    }

    await this.prisma.area.delete({
      where: { id },
    });

    return { message: 'Área eliminada correctamente' };
  }

  // Método para obtener todas las áreas activas (para dropdowns)
  async findAllActive() {
    return this.prisma.area.findMany({
      where: { activo: true },
      select: {
        id: true,
        nombre: true,
        codigo: true,
      },
      orderBy: {
        nombre: 'asc',
      },
    });
  }

  // Método para obtener áreas por gerencia
  async findByGerencia(gerenciaId: number) {
    return this.prisma.area.findMany({
      where: { 
        gerenciaId,
        activo: true,
      },
      select: {
        id: true,
        nombre: true,
        codigo: true,
      },
      orderBy: {
        nombre: 'asc',
      },
    });
  }
} 