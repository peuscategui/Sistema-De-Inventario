import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateGerenciaDto } from './dto/create-gerencia.dto';
import { UpdateGerenciaDto } from './dto/update-gerencia.dto';

@Injectable()
export class GerenciasService {
  constructor(private prisma: PrismaService) {}

  async findAll(options?: {
    page?: number;
    pageSize?: number;
    filters?: {
      nombre?: string;
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

    if (filters.activo !== undefined) {
      where.activo = filters.activo;
    }

    const [data, total] = await Promise.all([
      this.prisma.gerencia.findMany({
        where,
        include: {
          _count: {
            select: {
              areas: true,
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
      this.prisma.gerencia.count({ where }),
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
    const gerencia = await this.prisma.gerencia.findUnique({
      where: { id },
      include: {
        areas: {
          select: {
            id: true,
            nombre: true,
            activo: true,
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

    if (!gerencia) {
      throw new NotFoundException(`Gerencia con ID ${id} no encontrada`);
    }

    return gerencia;
  }

  async create(createGerenciaDto: CreateGerenciaDto) {
    try {
      const gerencia = await this.prisma.gerencia.create({
        data: createGerenciaDto,
      });

      return gerencia;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Ya existe una gerencia con ese nombre o código');
      }
      throw error;
    }
  }

  async update(id: number, updateGerenciaDto: UpdateGerenciaDto) {
    try {
      // Verificar que la gerencia existe
      await this.findOne(id);

      const gerencia = await this.prisma.gerencia.update({
        where: { id },
        data: updateGerenciaDto,
      });

      return gerencia;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Ya existe una gerencia con ese nombre o código');
      }
      throw error;
    }
  }

  async remove(id: number) {
    // Verificar que la gerencia existe
    await this.findOne(id);

    // Verificar si tiene áreas o licencias asociadas
    const [areasCount, licenciasCount] = await Promise.all([
      this.prisma.area.count({ where: { gerenciaId: id } }),
      this.prisma.licencia.count({ where: { gerenciaId: id } }),
    ]);

    if (areasCount > 0 || licenciasCount > 0) {
      throw new ConflictException(
        `No se puede eliminar la gerencia porque tiene ${areasCount} área(s) y ${licenciasCount} licencia(s) asociada(s)`
      );
    }

    await this.prisma.gerencia.delete({
      where: { id },
    });

    return { message: 'Gerencia eliminada correctamente' };
  }

  // Método para obtener todas las gerencias activas (para dropdowns)
  async findAllActive() {
    return this.prisma.gerencia.findMany({
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
} 